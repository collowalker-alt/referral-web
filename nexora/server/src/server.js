import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

dotenv.config();
const prisma = new PrismaClient();
const app = express();
app.set("trust proxy", 1);

// FIX 1: Helmet was blocking cross-origin fetches — disable resource policy
app.use(helmet({ crossOriginResourcePolicy: false }));

// FIX 2: Allow ALL origins (including your live frontend on Render)
// Previously you only allowed localhost:5173, which caused "Failed to fetch"
app.use(cors({ 
  origin: true,
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","x-paystack-signature"]
}));

app.post("/api/paystack/webhook",express.raw({type:"application/json"}),async(req,res)=>{
  try{
    if(!process.env.PAYSTACK_SECRET_KEY) return res.sendStatus(503);
    const signature=req.headers["x-paystack-signature"];
    const expected=crypto.createHmac("sha512",process.env.PAYSTACK_SECRET_KEY).update(req.body).digest("hex");
    if(!signature || signature.length!==expected.length || !crypto.timingSafeEqual(Buffer.from(signature),Buffer.from(expected))) return res.sendStatus(401);
    const event=JSON.parse(req.body.toString());
    if(event.event==="charge.success" && event.data?.reference) await activatePaidPackage(event.data.reference);
    res.sendStatus(200);
  }catch(e){console.error(e);res.sendStatus(500);}
});

app.use(express.json({ limit: "12mb" }));
app.use("/api/auth", rateLimit({ windowMs: 15*60*1000, max: 80 }));
const registerLimiter = rateLimit({ windowMs: 60*60*1000, max: 12, message: { message: "Too many registration attempts. Please try again later." } });
const forgotLimiter = rateLimit({ windowMs: 60*60*1000, max: 8, message: { message: "Too many password reset requests. Please try again later." } });

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isStrongPassword = (p) => typeof p === "string" && p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || "NEXORA <onboarding@resend.dev>";
const APP_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
const MPESA_PAYBILL_NUMBER = String(process.env.MPESA_PAYBILL_NUMBER || "400200").trim();
const MPESA_PAYBILL_ACCOUNT = String(process.env.MPESA_PAYBILL_ACCOUNT || "").trim();
const MPESA_PAYBILL_NAME = String(process.env.MPESA_PAYBILL_NAME || "NEXORA").trim();
// Co-operative Bank STK Push configuration. Secrets stay server-side on Render.
const COOP_TOKEN_URL = String(process.env.COOP_TOKEN_URL || "https://openapi.co-opbank.co.ke/token").trim();
const COOP_STK_URL = String(process.env.COOP_STK_URL || "https://openapi.co-opbank.co.ke/FT/stk/1.0.0").trim();
const COOP_STK_STATUS_URL = String(process.env.COOP_STK_STATUS_URL || "https://openapi.co-opbank.co.ke/Enquiry/STK/1.0.0/").trim();
const COOP_CLIENT_ID = String(process.env.COOP_CLIENT_ID || "").trim();
const COOP_CLIENT_SECRET = String(process.env.COOP_CLIENT_SECRET || "").trim();
const COOP_BASIC_AUTH = String(process.env.COOP_BASIC_AUTH || "").trim();
const COOP_OPERATOR_CODE = String(process.env.COOP_OPERATOR_CODE || "NEXORA").trim();
const COOP_CALLBACK_URL = String(process.env.COOP_CALLBACK_URL || `${APP_URL}/api/coop/callback`).trim();
let coopTokenCache = { accessToken: "", expiresAt: 0 };

function coopPhone(v) {
  const n = cleanPhone(v);
  if (/^0[17]\d{8}$/.test(n)) return `254${n.slice(1)}`;
  if (/^254[17]\d{8}$/.test(n)) return n;
  return n;
}
function coopConfigured() {
  return Boolean(COOP_TOKEN_URL && COOP_STK_URL && COOP_STK_STATUS_URL && COOP_OPERATOR_CODE &&
    (COOP_BASIC_AUTH || (COOP_CLIENT_ID && COOP_CLIENT_SECRET)));
}
function coopBasicHeader() {
  if (COOP_BASIC_AUTH) return COOP_BASIC_AUTH.toLowerCase().startsWith("basic ") ? COOP_BASIC_AUTH : `Basic ${COOP_BASIC_AUTH}`;
  return `Basic ${Buffer.from(`${COOP_CLIENT_ID}:${COOP_CLIENT_SECRET}`).toString("base64")}`;
}
async function getCoopToken() {
  if (!coopConfigured()) throw new Error("Co-op Bank payment credentials are not configured");
  if (coopTokenCache.accessToken && Date.now() < coopTokenCache.expiresAt - 30000) return coopTokenCache.accessToken;
  const r = await fetch(COOP_TOKEN_URL, {
    method:"POST",
    headers:{"Authorization":coopBasicHeader(),"Content-Type":"application/x-www-form-urlencoded","Accept":"application/json"},
    body:"grant_type=client_credentials"
  });
  const d = await r.json().catch(()=>({}));
  if (!r.ok || !d.access_token) {
    console.error("[COOP TOKEN ERROR]",JSON.stringify({httpStatus:r.status,response:d}));
    throw new Error(d.error_description || d.message || `Co-op token request failed (${r.status})`);
  }
  const expiresIn=Number(d.expires_in||300);
  coopTokenCache={accessToken:d.access_token,expiresAt:Date.now()+Math.max(60,expiresIn)*1000};
  return d.access_token;
}
function coopExtractStatus(data) {
  const candidates=[
    data?.status,data?.Status,data?.transactionStatus,data?.TransactionStatus,
    data?.data?.status,data?.data?.Status,data?.data?.transactionStatus,data?.data?.TransactionStatus,
    data?.response?.status,data?.response?.Status,data?.Response?.Status,
    data?.Result?.Status,data?.result?.status,data?.result?.Status
  ];
  const raw=candidates.find(v=>v!==undefined&&v!==null&&String(v).trim()!=="");
  if(raw===undefined)return "pending";
  const x=String(raw).trim().toLowerCase();
  if(["success","successful","completed","complete","paid","approved","processed"].includes(x))return "success";
  if(["failed","failure","cancelled","canceled","rejected","declined","expired","timeout","timedout"].includes(x))return "failed";
  return "pending";
}
function coopDisplayText(data) {
  return String(data?.message||data?.Message||data?.responseMessage||data?.ResponseMessage||
    data?.data?.message||data?.data?.Message||data?.data?.responseMessage||data?.data?.ResponseMessage||"");
}
async function coopStatusQuery(messageReference) {
  const token=await getCoopToken();
  const r=await fetch(COOP_STK_STATUS_URL,{
    method:"POST",
    headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json","Accept":"application/json"},
    body:JSON.stringify({MessageReference:messageReference,UserId:COOP_OPERATOR_CODE})
  });
  const data=await r.json().catch(()=>({}));
  return {httpStatus:r.status,ok:r.ok,data,status:coopExtractStatus(data),displayText:coopDisplayText(data)};
}
async function queryAndApplyCoopStatus(reference) {
  const tx=await prisma.transaction.findUnique({where:{reference}});
  if(!tx)throw new Error("Payment reference not found");
  if(tx.status==="SUCCESS")return {status:"success",message:tx.type==="DEPOSIT"?"Deposit confirmed and your wallet has been credited.":"Payment confirmed. Your package is active.",data:{}};
  const meta=(tx.metadata&&typeof tx.metadata==="object")?tx.metadata:{};
  const coopMeta=(meta.coop&&typeof meta.coop==="object")?meta.coop:{};
  const messageReference=String(coopMeta.messageReference||reference);
  const result=await coopStatusQuery(messageReference);
  await prisma.transaction.update({where:{reference},data:{metadata:{
    ...meta,coop:{...coopMeta,status:result.status,lastResponse:result.data,lastCheckedAt:new Date().toISOString(),httpStatus:result.httpStatus,display_text:result.displayText}
  }}});
  if(result.status==="success"){
    if(tx.type==="DEPOSIT"){
      await prisma.$transaction(async db=>{
        const fresh=await db.transaction.findUnique({where:{reference}});
        if(!fresh || fresh.status==="SUCCESS") return;
        await db.transaction.update({where:{reference},data:{status:"SUCCESS",metadata:{...(fresh.metadata||{}),verified:true,completedAt:new Date().toISOString()}}});
        await db.wallet.upsert({where:{userId:fresh.userId},create:{userId:fresh.userId,balance:fresh.amount},update:{balance:{increment:fresh.amount}}});
      });
    } else await activatePaidPackage(reference);
  } else if(result.status==="failed")await prisma.transaction.update({where:{reference},data:{status:"FAILED"}});
  return {status:result.status,message:result.displayText||(result.status==="pending"?"Payment is still pending.":result.status==="success"?(tx.type==="DEPOSIT"?"Deposit confirmed and your wallet has been credited.":"Payment confirmed. Your package is active."):""),data:result.data};
}


async function sendPasswordResetEmail({ to, name, rawToken }) {
  if (!resend) {
    console.warn("[EMAIL] RESEND_API_KEY not set — password reset email was not sent");
    return { skipped: true };
  }
  const resetUrl = `${APP_URL}/?reset=${encodeURIComponent(rawToken)}`;
  const displayName = String(name || "there").split(" ")[0];
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: [to],
    subject: "Reset your NEXORA password",
    html: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 12px;color:#0f172a">Reset your password</h2>
        <p>Hi ${displayName},</p>
        <p>We received a request to reset your NEXORA account password. This link expires in <strong>1 hour</strong>.</p>
        <p style="margin:28px 0">
          <a href="${resetUrl}" style="background:#0d9488;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            Choose a new password
          </a>
        </p>
        <p style="color:#555;font-size:14px">Or paste this token in the NEXORA reset form:</p>
        <code style="display:block;background:#f4f4f5;padding:12px;border-radius:8px;word-break:break-all;font-size:13px">${rawToken}</code>
        <p style="color:#888;font-size:13px;margin-top:24px">If you did not request this, you can ignore this email. Your password will stay the same.</p>
        <p style="color:#aaa;font-size:12px;margin-top:32px">NEXORA · Member platform</p>
      </div>
    `,
    text: `Hi ${displayName},\n\nReset your NEXORA password (expires in 1 hour):\n${resetUrl}\n\nOr use this token: ${rawToken}\n\nIf you did not request this, ignore this email.`,
  });
  if (error) {
    console.error("[EMAIL] Resend error:", error);
    throw new Error(error.message || "Failed to send reset email");
  }
  console.log(`[EMAIL] Password reset sent to ${to} id=${data?.id || "?"}`);
  return data;
}


const sign = user => jwt.sign({ id:user.id }, JWT_SECRET, { expiresIn:"7d" });
const auth = async (req,res,next) => {
  try {
    const token=(req.headers.authorization||"").replace("Bearer ","");
    if(!token) return res.status(401).json({message:"Authentication required"});
    const p=jwt.verify(token,JWT_SECRET);
    const u=await prisma.user.findUnique({where:{id:p.id}});
    if(!u || u.status!=="ACTIVE") return res.status(401).json({message:"Account unavailable"});
    req.user=u; next();
  } catch { res.status(401).json({message:"Invalid or expired session"}); }
};
const signAdmin = admin => jwt.sign({ id:admin.id, type:"admin" }, JWT_SECRET, { expiresIn:"12h" });
const adminAuth = async (req,res,next) => {
  try {
    const token=(req.headers.authorization||"").replace("Bearer ","");
    if(!token) return res.status(401).json({message:"Admin authentication required"});
    const p=jwt.verify(token,JWT_SECRET);
    if(p.type!=="admin") return res.status(403).json({message:"Admin access required"});
    const a=await prisma.admin.findUnique({where:{id:p.id}});
    if(!a || a.status!=="ACTIVE") return res.status(401).json({message:"Admin account unavailable"});
    req.admin=a; next();
  } catch { res.status(401).json({message:"Invalid or expired admin session"}); }
};

async function logAdminAction(req, action, targetType=null, targetId=null, targetEmail=null, details={}){
  try{
    await prisma.adminActivityLog.create({data:{adminId:req.admin.id,adminEmail:req.admin.email,action,targetType,targetId,targetEmail,details}});
  }catch(e){ console.error("[ADMIN AUDIT]",e.message); }
}

const PHONE_RE=/^(?:0[17]\d{8}|254[17]\d{8})$/;
const cleanPhone=v=>String(v||"").trim().replace(/[\s().-]/g,"").replace(/^\+/,"");
// Paystack's M-Pesa charge endpoint requires the international +254 format.
const paystackPhone=v=>{
  const n=cleanPhone(v);
  if(/^07\d{8}$/.test(n)) return `+254${n.slice(1)}`;
  if(/^011\d{7}$/.test(n)) return `+254${n.slice(1)}`;
  if(/^254[17]\d{8}$/.test(n)) return `+${n}`;
  return n;
};
const maskPhone=v=>{
  const n=String(v||"");
  return n.length>=7 ? `${n.slice(0,4)}****${n.slice(-3)}` : "***";
};
const maskEmail=v=>{
  const e=String(v||"");
  const [name,domain]=e.split("@");
  if(!domain) return "***";
  return `${(name||"").slice(0,2)}***@${domain}`;
};
const paystackMode=()=>{
  const key=process.env.PAYSTACK_SECRET_KEY||"";
  return key.startsWith("sk_live_")?"live":key.startsWith("sk_test_")?"test":"unknown";
};
const logPaystackCharge=(label,{reference,httpStatus,response,phone,email}={})=>{
  const data=response?.data||{};
  console.log(`[PAYSTACK ${label}]`,JSON.stringify({
    reference,
    mode:paystackMode(),
    httpStatus,
    apiStatus:response?.status??null,
    message:response?.message||null,
    chargeStatus:data.status||null,
    displayText:data.display_text||null,
    gatewayResponse:data.gateway_response||null,
    channel:data.channel||null,
    currency:data.currency||null,
    amount:data.amount??null,
    paystackReference:data.reference||null,
    paystackId:data.id||null,
    phone:maskPhone(phone),
    email:maskEmail(email)
  }));
};
const makeCode = name => (name.replace(/[^a-z0-9]/gi,"").slice(0,5).toUpperCase() || "USER")+"-"+crypto.randomBytes(3).toString("hex").toUpperCase();

// FIX 3: Health checks so / and /api don't return "Cannot GET"
app.get("/", (req,res) => res.json({ ok: true, name: "NEXORA API", version: "1.0" }));
app.get("/api", (req,res) => res.json({ ok: true, name: "NEXORA API", version: "1.0" }));
app.get("/api/health",(req,res)=>res.json({ok:true,name:"NEXORA API"}));

app.get("/api/payments/methods",(req,res)=>{
  res.json({
    wallet:true,
    paybill:Boolean(MPESA_PAYBILL_NUMBER && MPESA_PAYBILL_ACCOUNT),
    paybillNumber:MPESA_PAYBILL_NUMBER||null,
    paybillAccount:MPESA_PAYBILL_ACCOUNT||null,
    paybillName:MPESA_PAYBILL_NAME||"NEXORA",
    stkPush:coopConfigured(),
    provider:coopConfigured()?"coop":"unconfigured"
  });
});


app.post("/api/auth/register", registerLimiter, async (req,res)=>{
  try {
    const {name,email,phone,password,referralCode,website}=req.body;
    // Honeypot — bots often fill hidden fields
    if(website) return res.status(201).json({token:"",user:null,ok:true});
    const normalizedPhone=cleanPhone(phone);
    const normalizedEmail=String(email||"").trim().toLowerCase();
    if(!name||!normalizedEmail||!phone||!password) return res.status(400).json({message:"Name, email, phone and password are required"});
    if(!EMAIL_RE.test(normalizedEmail)) return res.status(400).json({message:"Enter a valid email address"});
    if(!isStrongPassword(password)) return res.status(400).json({message:"Password must be at least 8 characters and include a letter and a number"});
    if(!PHONE_RE.test(normalizedPhone)) return res.status(400).json({message:"Invalid Kenyan phone number. Use 07…, 01…, 2547… or 2541…."});
    const exists=await prisma.user.findFirst({where:{OR:[{email:normalizedEmail},{phone:normalizedPhone}]}});
    if(exists) return res.status(409).json({message:"Email or phone is already registered"});
    let parent=null;
    if(referralCode) parent=await prisma.user.findUnique({where:{referralCode:String(referralCode).trim().toUpperCase()}});
    const hash=await bcrypt.hash(password,12);
    const user=await prisma.user.create({data:{
      name:String(name).trim(),email:normalizedEmail,phone:normalizedPhone,passwordHash:hash,referralCode:makeCode(name),
      referredById:parent?.id,wallet:{create:{}}
    }});
    res.status(201).json({token:sign(user),user:{id:user.id,name:user.name,email:user.email,phone:user.phone,referralCode:user.referralCode}});
  } catch(e){ console.error(e); res.status(500).json({message:"Registration failed"}); }
});

app.post("/api/auth/login", async (req,res)=>{
  try {
    const {email,password}=req.body;
    const user=await prisma.user.findUnique({where:{email:String(email||"").toLowerCase()}});
    if(!user || !(await bcrypt.compare(password||"",user.passwordHash))) return res.status(401).json({message:"Invalid login details"});
    if(user.status!=="ACTIVE") return res.status(403).json({message:"Account is suspended"});
    res.json({token:sign(user),user:{id:user.id,name:user.name,email:user.email,phone:user.phone,referralCode:user.referralCode}});
  } catch(e){ console.error(e); res.status(500).json({message:"Login failed"}); }
});

app.post("/api/auth/forgot-password", forgotLimiter, async (req,res)=>{
  try {
    const email=String(req.body?.email||"").trim().toLowerCase();
    if(!email || !EMAIL_RE.test(email)) return res.status(400).json({message:"Enter a valid email address"});
    const user=await prisma.user.findUnique({where:{email}});
    // Always return the same message to avoid email enumeration
    const generic={message:"If an account exists for that email, a password reset link has been sent. Check your inbox (and spam)."};
    if(!user || user.status!=="ACTIVE") return res.json(generic);
    const rawToken=crypto.randomBytes(32).toString("hex");
    const tokenHash=crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires=new Date(Date.now()+60*60*1000); // 1 hour
    await prisma.user.update({where:{id:user.id},data:{resetToken:tokenHash,resetTokenExpires:expires}});
    try {
      await sendPasswordResetEmail({ to: email, name: user.name, rawToken });
    } catch (mailErr) {
      console.error("[PASSWORD RESET EMAIL]", mailErr.message || mailErr);
      // Do not reveal mail failures to the client
    }
    // Dev/staging only: still log and optionally expose token when email is not required
    console.log(`[PASSWORD RESET] email=${email} expires=${expires.toISOString()}`);
    const payload={...generic, message:"If an account exists for that email, a password reset link has been sent. Check your inbox (and spam)."};
    if(process.env.NODE_ENV!=="production" || process.env.EXPOSE_RESET_TOKEN==="1"){
      payload.resetToken=rawToken;
      payload.hint="Development only — token also returned in API response.";
    }
    res.json(payload);
  } catch(e){ console.error(e); res.status(500).json({message:"Unable to process password reset request"}); }
});

app.post("/api/auth/reset-password", async (req,res)=>{
  try {
    const {token,password}=req.body||{};
    if(!token || !password) return res.status(400).json({message:"Token and new password are required"});
    if(!isStrongPassword(password)) return res.status(400).json({message:"Password must be at least 8 characters and include a letter and a number"});
    const tokenHash=crypto.createHash("sha256").update(String(token)).digest("hex");
    const user=await prisma.user.findFirst({where:{resetToken:tokenHash,resetTokenExpires:{gt:new Date()}}});
    if(!user) return res.status(400).json({message:"Invalid or expired reset token. Request a new password reset."});
    const hash=await bcrypt.hash(password,12);
    await prisma.user.update({where:{id:user.id},data:{passwordHash:hash,resetToken:null,resetTokenExpires:null}});
    res.json({message:"Password updated successfully. You can now log in."});
  } catch(e){ console.error(e); res.status(500).json({message:"Unable to reset password"}); }
});

const DEFAULT_PACKAGES=[
  ["Starter",1,500,200,50],
  ["Growth",2,1000,400,150],
  ["Pro",3,1600,700,250],
  ["Elite",4,2200,900,300],
  ["Premium",5,4800,2000,500]
];
async function ensureAdmin(){
  const email=String(process.env.ADMIN_EMAIL||"").trim().toLowerCase();
  const password=String(process.env.ADMIN_PASSWORD||"");
  const name=String(process.env.ADMIN_NAME||"NEXORA Administrator").trim()||"NEXORA Administrator";
  if(!email || !password){
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD are not set; admin account was not created or updated.");
    return;
  }
  if(password.length < 10){
    console.error("ADMIN_PASSWORD must be at least 10 characters; admin account was not created or updated.");
    return;
  }
  const passwordHash=await bcrypt.hash(password,12);
  await prisma.admin.upsert({
    where:{email},
    update:{name,passwordHash,status:"ACTIVE"},
    create:{name,email,passwordHash,status:"ACTIVE"}
  });
  console.log(`[ADMIN] Admin account ready: ${email}`);
}

async function ensurePackages(){
  for(const [name,tier,price,directCommission,level2Commission] of DEFAULT_PACKAGES){
    const existing=await prisma.package.findUnique({where:{name}});
    if(!existing) await prisma.package.create({data:{name,tier,price,directCommission,level2Commission,active:true}});
  }
}
app.get("/api/ad-products",auth,async(req,res)=>{
  try{const u=await prisma.user.findUnique({where:{id:req.user.id},include:{package:true}});if(!u?.package||u.package.name!=="Premium")return res.status(403).json({message:"Products & Advertising is available only to Premium members."});res.json(await prisma.adProduct.findMany({where:{active:true},orderBy:{createdAt:"desc"}}));}
  catch(e){console.error(e);res.status(500).json({message:"Unable to load advertising products"});}
});
app.post("/api/ad-products/:id/submit",auth,async(req,res)=>{
  try{const u=await prisma.user.findUnique({where:{id:req.user.id},include:{package:true}});if(!u?.package||u.package.name!=="Premium")return res.status(403).json({message:"Only Premium members can submit advertising campaigns."});const product=await prisma.adProduct.findFirst({where:{id:req.params.id,active:true}});if(!product)return res.status(404).json({message:"Advertising product not found"});const postUrl=String(req.body?.postUrl||"").trim(),proofUrl=String(req.body?.proofUrl||"").trim()||null,postMediaData=String(req.body?.postMediaData||"").trim()||null,postMediaName=String(req.body?.postMediaName||"").trim()||null,postMediaType=String(req.body?.postMediaType||"").trim()||null,views=Math.max(0,Math.floor(Number(req.body?.views||0))),engagements=Math.max(0,Math.floor(Number(req.body?.engagements||0)));if(!/^https?:\/\//i.test(postUrl))return res.status(400).json({message:"Enter a valid public post or status URL."});if(!Number.isFinite(views)||!Number.isFinite(engagements))return res.status(400).json({message:"Views and engagements must be valid numbers."});if(postMediaData && postMediaData.length>11000000)return res.status(400).json({message:"Post media is too large. Please use an image/video under 8 MB."});if(postMediaData && !/^data:(image\/|video\/)/i.test(postMediaData))return res.status(400).json({message:"Post media must be an image or video."});const calculatedPay=Math.floor((views/1000)*Number(product.viewRatePer1000||0)+(engagements*Number(product.engagementRate||0)));const sub=await prisma.adSubmission.create({data:{userId:u.id,productId:product.id,postUrl,postMediaData,postMediaName,postMediaType,proofUrl,views,engagements,calculatedPay}});res.json({message:"Advertising performance submitted for review. Approved payouts are processed on Friday.",submission:sub});}
  catch(e){console.error(e);res.status(500).json({message:"Unable to submit advertising performance"});}
});
app.get("/api/ad-submissions",auth,async(req,res)=>{try{res.json(await prisma.adSubmission.findMany({where:{userId:req.user.id},include:{product:true},orderBy:{submittedAt:"desc"},take:50}));}catch(e){res.status(500).json({message:"Unable to load advertising submissions"});}});
app.get("/api/admin/ad-products",adminAuth,async(req,res)=>{try{res.json(await prisma.adProduct.findMany({include:{_count:{select:{submissions:true}}},orderBy:{createdAt:"desc"}}));}catch(e){res.status(500).json({message:"Unable to load advertising products"});}});
app.post("/api/admin/ad-products",adminAuth,async(req,res)=>{
  try{const title=String(req.body?.title||"").trim(),description=String(req.body?.description||"").trim(),platforms=Array.isArray(req.body?.platforms)?req.body.platforms.map(x=>String(x).trim()).filter(Boolean):[],viewRatePer1000=Math.max(0,Math.floor(Number(req.body?.viewRatePer1000||0))),engagementRate=Math.max(0,Math.floor(Number(req.body?.engagementRate||0)));if(!title)return res.status(400).json({message:"Product title is required"});const p=await prisma.adProduct.create({data:{title,description,platforms,viewRatePer1000,engagementRate,active:req.body?.active!==false}});await logAdminAction(req,"AD_PRODUCT_CREATED","AD_PRODUCT",p.id,null,{title,platforms,viewRatePer1000,engagementRate});res.json(p);}
  catch(e){console.error(e);res.status(500).json({message:"Unable to create advertising product"});}
});
app.patch("/api/admin/ad-products/:id",adminAuth,async(req,res)=>{
  try{const data={};if(req.body?.title!==undefined)data.title=String(req.body.title).trim();if(req.body?.description!==undefined)data.description=String(req.body.description).trim();if(Array.isArray(req.body?.platforms))data.platforms=req.body.platforms.map(x=>String(x).trim()).filter(Boolean);if(req.body?.viewRatePer1000!==undefined)data.viewRatePer1000=Math.max(0,Math.floor(Number(req.body.viewRatePer1000)));if(req.body?.engagementRate!==undefined)data.engagementRate=Math.max(0,Math.floor(Number(req.body.engagementRate)));if(req.body?.active!==undefined)data.active=Boolean(req.body.active);const p=await prisma.adProduct.update({where:{id:req.params.id},data});await logAdminAction(req,"AD_PRODUCT_UPDATED","AD_PRODUCT",p.id,null,data);res.json(p);}
  catch(e){res.status(500).json({message:"Unable to update advertising product"});}
});
app.get("/api/admin/ad-submissions",adminAuth,async(req,res)=>{try{res.json(await prisma.adSubmission.findMany({include:{user:{select:{id:true,name:true,email:true,phone:true}},product:true},orderBy:{submittedAt:"desc"},take:200}));}catch(e){res.status(500).json({message:"Unable to load advertising submissions"});}});
app.patch("/api/admin/ad-submissions/:id",adminAuth,async(req,res)=>{
  try{const status=String(req.body?.status||"").toUpperCase();if(!["APPROVED","REJECTED","PAID"].includes(status))return res.status(400).json({message:"Status must be APPROVED, REJECTED or PAID"});const current=await prisma.adSubmission.findUnique({where:{id:req.params.id},include:{product:true,user:true}});if(!current)return res.status(404).json({message:"Advertising submission not found"});const approvedPay=req.body?.approvedPay!==undefined?Math.max(0,Math.floor(Number(req.body.approvedPay))):current.calculatedPay;const now=new Date();const friday=new Date(now);const add=(5-friday.getDay()+7)%7;friday.setDate(friday.getDate()+add);friday.setHours(17,0,0,0);const data={status,approvedPay,reviewedAt:now,reviewNote:String(req.body?.reviewNote||"").trim()||null,payoutFriday:friday};if(status==="PAID")data.paidAt=now;const updated=await prisma.adSubmission.update({where:{id:current.id},data});
    if(status==="PAID"){
      const reference=`ADPAY-${current.id}`;
      const existing=await prisma.transaction.findUnique({where:{reference}});
      if(!existing && approvedPay>0){
        await prisma.$transaction([
          prisma.wallet.upsert({where:{userId:current.userId},create:{userId:current.userId,balance:approvedPay,totalEarned:approvedPay},update:{balance:{increment:approvedPay},totalEarned:{increment:approvedPay}}}),
          prisma.transaction.create({data:{userId:current.userId,type:"COMMISSION",amount:approvedPay,status:"SUCCESS",reference,metadata:{source:"ADVERTISING",submissionId:current.id,productId:current.productId}}})
        ]);
      }
    }
    await logAdminAction(req,"AD_SUBMISSION_STATUS","AD_SUBMISSION",current.id,current.user.email,{status,approvedPay,payoutFriday:friday.toISOString()});res.json(updated);}
  catch(e){console.error(e);res.status(500).json({message:"Unable to update advertising submission"});}
});

const cleanMarketplaceText=(v,max=5000)=>String(v||"").trim().slice(0,max);
const marketplaceImageOk=x=>typeof x==="string" && /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(x) && x.length<2500000;

app.get("/api/marketplace/products",auth,async(req,res)=>{
  try{
    const q=cleanMarketplaceText(req.query?.q,100), category=cleanMarketplaceText(req.query?.category,80), location=cleanMarketplaceText(req.query?.location,120);
    const products=await prisma.product.findMany({where:{status:"ACTIVE",stock:{gt:0},...(category&&category!=="All"?{category}:{}),...(location?{location:{contains:location,mode:"insensitive"}}:{}),...(q?{OR:[{title:{contains:q,mode:"insensitive"}},{description:{contains:q,mode:"insensitive"}},{category:{contains:q,mode:"insensitive"}},{location:{contains:q,mode:"insensitive"}}]}:{})},include:{seller:{select:{id:true,name:true,phone:true,sellerVerified:true,sellerBio:true}},reviews:{include:{author:{select:{name:true}}},orderBy:{createdAt:"desc"},take:5},_count:{select:{orderItems:true}}},orderBy:[{featured:"desc"},{createdAt:"desc"}],take:100});
    res.json(products);
  }catch(e){console.error(e);res.status(500).json({message:"Unable to load marketplace products"});}
});
app.get("/api/marketplace/my-products",auth,async(req,res)=>{try{res.json(await prisma.product.findMany({where:{sellerId:req.user.id},orderBy:{createdAt:"desc"}}));}catch(e){res.status(500).json({message:"Unable to load your products"});}});
app.post("/api/marketplace/products",auth,async(req,res)=>{
  try{
    const title=cleanMarketplaceText(req.body?.title,120),description=cleanMarketplaceText(req.body?.description,5000),category=cleanMarketplaceText(req.body?.category,80)||"Other",location=cleanMarketplaceText(req.body?.location,160),phone=cleanMarketplaceText(req.body?.phone,20)||req.user.phone,price=Math.floor(Number(req.body?.price)),stock=Math.floor(Number(req.body?.stock||1));
    const images=Array.isArray(req.body?.images)?req.body.images.filter(marketplaceImageOk).slice(0,6):[];
    if(!title||!description||!location||!Number.isFinite(price)||price<1||!Number.isFinite(stock)||stock<0)return res.status(400).json({message:"Title, description, price, stock and location are required."});
    const p=await prisma.product.create({data:{sellerId:req.user.id,title,description,category,location,phone,price,stock,images}});res.status(201).json(p);
  }catch(e){console.error(e);res.status(500).json({message:"Unable to publish product"});}
});
app.patch("/api/marketplace/products/:id",auth,async(req,res)=>{try{const p=await prisma.product.findFirst({where:{id:req.params.id,sellerId:req.user.id}});if(!p)return res.status(404).json({message:"Product not found"});const data={};for(const k of ["title","description","category","location","phone"]){if(req.body?.[k]!==undefined)data[k]=cleanMarketplaceText(req.body[k],k==="description"?5000:160)}if(req.body?.price!==undefined)data.price=Math.max(1,Math.floor(Number(req.body.price)));if(req.body?.stock!==undefined)data.stock=Math.max(0,Math.floor(Number(req.body.stock)));if(Array.isArray(req.body?.images))data.images=req.body.images.filter(marketplaceImageOk).slice(0,6);if(req.body?.status!==undefined && ["ACTIVE","SOLD_OUT","HIDDEN"].includes(String(req.body.status)))data.status=String(req.body.status);const updated=await prisma.product.update({where:{id:p.id},data});res.json(updated);}catch(e){res.status(500).json({message:"Unable to update product"});}});
app.get("/api/marketplace/orders",auth,async(req,res)=>{try{const [buying,selling]=await Promise.all([prisma.order.findMany({where:{buyerId:req.user.id},include:{items:{include:{product:true}},seller:{select:{name:true,phone:true,location:true}}},orderBy:{createdAt:"desc"},take:100}),prisma.order.findMany({where:{sellerId:req.user.id},include:{items:{include:{product:true}},buyer:{select:{name:true,phone:true,email:true}}},orderBy:{createdAt:"desc"},take:100})]);res.json({buying,selling});}catch(e){res.status(500).json({message:"Unable to load marketplace orders"});}});
app.post("/api/marketplace/orders",auth,async(req,res)=>{
  try{
    const items=Array.isArray(req.body?.items)?req.body.items:[], deliveryName=cleanMarketplaceText(req.body?.deliveryName,120)||req.user.name,deliveryPhone=cleanMarketplaceText(req.body?.deliveryPhone,20)||req.user.phone,deliveryAddress=cleanMarketplaceText(req.body?.deliveryAddress,300),deliveryNotes=cleanMarketplaceText(req.body?.deliveryNotes,1000)||null,paymentMethod=String(req.body?.paymentMethod||"CASH_ON_DELIVERY").toUpperCase();
    if(!items.length)return res.status(400).json({message:"Your cart is empty."});if(!deliveryAddress)return res.status(400).json({message:"Delivery address/location is required."});if(!["CASH_ON_DELIVERY","WALLET","MPESA_PAYBILL"].includes(paymentMethod))return res.status(400).json({message:"Unsupported payment method."});
    const ids=[...new Set(items.map(x=>String(x.productId)))];const products=await prisma.product.findMany({where:{id:{in:ids},status:"ACTIVE"}});if(products.length!==ids.length)return res.status(400).json({message:"One or more products are no longer available."});const sellerIds=[...new Set(products.map(p=>p.sellerId))];if(sellerIds.length!==1)return res.status(400).json({message:"For now, checkout one seller at a time. Remove products from other sellers and try again."});
    const normalized=items.map(x=>{const p=products.find(z=>z.id===x.productId);const quantity=Math.max(1,Math.floor(Number(x.quantity||1)));if(quantity>p.stock)throw new Error(`${p.title} only has ${p.stock} in stock.`);return {p,quantity};});const total=normalized.reduce((a,x)=>a+x.p.price*x.quantity,0);const sellerId=sellerIds[0];
    if(paymentMethod==="WALLET"){const w=await prisma.wallet.findUnique({where:{userId:req.user.id}});if(!w||w.balance<total)return res.status(400).json({message:`Insufficient wallet balance. You need ${money(total)}.`});}
    const reference=`ORD-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
    const order=await prisma.$transaction(async tx=>{for(const x of normalized){const updated=await tx.product.updateMany({where:{id:x.p.id,stock:{gte:x.quantity},status:"ACTIVE"},data:{stock:{decrement:x.quantity}}});if(updated.count!==1)throw new Error(`${x.p.title} is no longer available in the requested quantity.`);}const o=await tx.order.create({data:{buyerId:req.user.id,sellerId,total,paymentMethod,paymentStatus:paymentMethod==="WALLET"?"SUCCESS":"PENDING",status:paymentMethod==="WALLET"?"CONFIRMED":"PENDING",deliveryName,deliveryPhone,deliveryAddress,deliveryNotes,reference,items:{create:normalized.map(x=>({productId:x.p.id,title:x.p.title,price:x.p.price,quantity:x.quantity}))}}});if(paymentMethod==="WALLET"){await tx.wallet.update({where:{userId:req.user.id},data:{balance:{decrement:total}}});await tx.transaction.create({data:{userId:req.user.id,type:"PACKAGE_PURCHASE",amount:total,status:"SUCCESS",reference:`${reference}-WALLET`,metadata:{source:"MARKETPLACE_ORDER",orderId:o.id}}});}return o;});res.status(201).json({message:paymentMethod==="CASH_ON_DELIVERY"?"Order placed. Pay the seller on delivery as agreed.":"Order confirmed using your wallet balance.",order});
  }catch(e){console.error(e);res.status(400).json({message:e.message||"Unable to place order"});}
});
app.get("/api/marketplace/products/:id/reviews",auth,async(req,res)=>{try{const rows=await prisma.productReview.findMany({where:{productId:req.params.id},include:{author:{select:{name:true}}},orderBy:{createdAt:"desc"}});const avg=rows.length?rows.reduce((a,x)=>a+x.rating,0)/rows.length:0;res.json({reviews:rows,average:Number(avg.toFixed(1)),count:rows.length});}catch(e){res.status(500).json({message:"Unable to load reviews"});}});
app.post("/api/marketplace/products/:id/reviews",auth,async(req,res)=>{try{const rating=Math.max(1,Math.min(5,Math.floor(Number(req.body?.rating))));const p=await prisma.product.findUnique({where:{id:req.params.id}});if(!p)return res.status(404).json({message:"Product not found"});const delivered=await prisma.order.findFirst({where:{buyerId:req.user.id,status:"DELIVERED",items:{some:{productId:p.id}}}});if(!delivered)return res.status(403).json({message:"You can review this product after a completed purchase."});const r=await prisma.productReview.upsert({where:{productId_authorId:{productId:p.id,authorId:req.user.id}},update:{rating,title:req.body?.title?.slice(0,120)||null,body:req.body?.body?.slice(0,1500)||null},create:{productId:p.id,authorId:req.user.id,sellerId:p.sellerId,rating,title:req.body?.title?.slice(0,120)||null,body:req.body?.body?.slice(0,1500)||null}});res.status(201).json(r);}catch(e){res.status(400).json({message:e.message||"Unable to save review"});}});
app.get("/api/marketplace/wishlist",auth,async(req,res)=>{try{res.json(await prisma.wishlist.findMany({where:{userId:req.user.id},include:{product:true},orderBy:{createdAt:"desc"}}));}catch(e){res.status(500).json({message:"Unable to load wishlist"});}});
app.post("/api/marketplace/wishlist/:productId",auth,async(req,res)=>{try{const id=req.params.productId;const existing=await prisma.wishlist.findUnique({where:{userId_productId:{userId:req.user.id,productId:id}}});if(existing){await prisma.wishlist.delete({where:{id:existing.id}});return res.json({saved:false});}await prisma.wishlist.create({data:{userId:req.user.id,productId:id}});res.json({saved:true});}catch(e){res.status(400).json({message:"Unable to update wishlist"});}});
app.post("/api/marketplace/coupons/validate",auth,async(req,res)=>{try{const code=String(req.body?.code||"").trim().toUpperCase();const subtotal=Math.max(0,Math.floor(Number(req.body?.subtotal||0)));const c=await prisma.coupon.findUnique({where:{code}});if(!c||!c.active|| (c.expiresAt&&c.expiresAt<new Date()) || (c.usageLimit!==null&&c.usedCount>=c.usageLimit) || subtotal<c.minOrder)return res.status(400).json({message:"Coupon is invalid, expired or does not meet the minimum order."});const discount=c.percentOff?Math.floor(subtotal*c.percentOff/100):Math.min(c.amountOff,subtotal);res.json({code,discount,total:subtotal-discount});}catch(e){res.status(400).json({message:"Unable to validate coupon"});}});
app.post("/api/marketplace/orders/:id/disputes",auth,async(req,res)=>{try{const o=await prisma.order.findUnique({where:{id:req.params.id}});if(!o)return res.status(404).json({message:"Order not found"});if(o.buyerId!==req.user.id&&o.sellerId!==req.user.id)return res.status(403).json({message:"Not authorized"});const d=await prisma.dispute.create({data:{orderId:o.id,userId:req.user.id,reason:String(req.body?.reason||"Order issue").slice(0,160),details:String(req.body?.details||"").slice(0,3000)}});res.status(201).json(d);}catch(e){res.status(400).json({message:"Unable to open dispute"});}});
app.get("/api/marketplace/seller/:id",auth,async(req,res)=>{try{const u=await prisma.user.findUnique({where:{id:req.params.id},select:{id:true,name:true,phone:true,sellerVerified:true,sellerBio:true,createdAt:true}});if(!u)return res.status(404).json({message:"Seller not found"});const agg=await prisma.productReview.aggregate({where:{sellerId:u.id},_avg:{rating:true},_count:{id:true}});res.json({...u,rating:Number((agg._avg.rating||0).toFixed(1)),reviews:agg._count.id});}catch(e){res.status(500).json({message:"Unable to load seller"});}});
app.post("/api/marketplace/seller/profile",auth,async(req,res)=>{try{const bio=String(req.body?.sellerBio||"").slice(0,1200);const u=await prisma.user.update({where:{id:req.user.id},data:{sellerBio}});res.json({sellerBio:u.sellerBio});}catch(e){res.status(500).json({message:"Unable to update seller profile"});}});
app.patch("/api/marketplace/orders/:id/status",auth,async(req,res)=>{try{const status=String(req.body?.status||"").toUpperCase();if(!["CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"].includes(status))return res.status(400).json({message:"Invalid order status"});const o=await prisma.order.findUnique({where:{id:req.params.id}});if(!o)return res.status(404).json({message:"Order not found"});if(o.sellerId!==req.user.id && o.buyerId!==req.user.id)return res.status(403).json({message:"Not authorized"});const updated=await prisma.order.update({where:{id:o.id},data:{status}});res.json(updated);}catch(e){res.status(500).json({message:"Unable to update order"});}});
app.get("/api/admin/marketplace/products",adminAuth,async(req,res)=>{try{res.json(await prisma.product.findMany({include:{seller:{select:{name:true,email:true,phone:true}},_count:{select:{orderItems:true}}},orderBy:{createdAt:"desc"},take:500}));}catch(e){res.status(500).json({message:"Unable to load marketplace products"});}});
app.patch("/api/admin/marketplace/products/:id",adminAuth,async(req,res)=>{try{const status=String(req.body?.status||"").toUpperCase();if(!["ACTIVE","SOLD_OUT","HIDDEN","REJECTED"].includes(status))return res.status(400).json({message:"Invalid product status"});const p=await prisma.product.update({where:{id:req.params.id},data:{status}});await logAdminAction(req,"MARKETPLACE_PRODUCT_STATUS","PRODUCT",p.id,null,{status});res.json(p);}catch(e){res.status(500).json({message:"Unable to moderate product"});}});
app.get("/api/admin/marketplace/orders",adminAuth,async(req,res)=>{try{res.json(await prisma.order.findMany({include:{items:true,buyer:{select:{name:true,email:true,phone:true}},seller:{select:{name:true,email:true,phone:true}}},orderBy:{createdAt:"desc"},take:500}));}catch(e){res.status(500).json({message:"Unable to load marketplace orders"});}});

app.get("/api/packages",async(req,res)=>{
  try{ await ensurePackages(); res.json(await prisma.package.findMany({where:{active:true},orderBy:{tier:"asc"}})); }
  catch(e){ console.error("Packages error:",e); res.status(500).json({message:"Unable to load packages. Please check the database setup."}); }
});

app.get("/api/me",auth,async(req,res)=>{
  const u=await prisma.user.findUnique({where:{id:req.user.id},include:{package:true,wallet:true}});
  const direct=await prisma.user.count({where:{referredById:u.id}});
  const level1=await prisma.user.findMany({where:{referredById:u.id},select:{id:true}});
  const level2=level1.length?await prisma.user.count({where:{referredById:{in:level1.map(x=>x.id)}}}):0;
  const tx=await prisma.transaction.findMany({where:{userId:u.id},orderBy:{createdAt:"desc"},take:10});
  res.json({user:{id:u.id,name:u.name,email:u.email,phone:u.phone,referralCode:u.referralCode},package:u.package,wallet:u.wallet,stats:{direct,level2},transactions:tx});
});

app.get("/api/referrals",auth,async(req,res)=>{
  try{
    const direct=await prisma.user.findMany({where:{referredById:req.user.id},orderBy:{createdAt:"desc"},select:{id:true,name:true,email:true,createdAt:true,package:true}});
    const ids=direct.map(x=>x.id);
    const level2=ids.length?await prisma.user.findMany({where:{referredById:{in:ids}},orderBy:{createdAt:"desc"},select:{id:true,name:true,email:true,createdAt:true,referredById:true,package:true}}):[];
    res.json({direct,level2});
  }catch(e){console.error(e);res.status(500).json({message:"Unable to load referrals"});}
});
app.get("/api/earnings",auth,async(req,res)=>{
  try{
    const rows=await prisma.commission.findMany({where:{receiverId:req.user.id},include:{sourceUser:{select:{name:true}}},orderBy:{createdAt:"desc"},take:100});
    res.json(rows);
  }catch(e){console.error(e);res.status(500).json({message:"Unable to load earnings"});}
});
app.get("/api/transactions",auth,async(req,res)=>{
  try{ const rows=await prisma.transaction.findMany({where:{userId:req.user.id},orderBy:{createdAt:"desc"},take:100}); res.json(rows); }
  catch(e){console.error(e);res.status(500).json({message:"Unable to load transactions"});}
});

app.post("/api/payments/initialize",auth,async(req,res)=>{
  const startedAt=Date.now();
  try{
    const {packageId,phone}=req.body;
    const normalizedPhone=cleanPhone(phone||req.user.phone);
    if(!PHONE_RE.test(normalizedPhone))return res.status(400).json({message:"Invalid Kenyan phone number. Use 07…, 01…, 2547… or 2541…."});
    const pkg=await prisma.package.findUnique({where:{id:packageId}});
    if(!pkg||!pkg.active)return res.status(404).json({message:"Package not found"});
    const existingUser=await prisma.user.findUnique({where:{id:req.user.id},select:{packageId:true}});
    const currentPackage=existingUser?.packageId?await prisma.package.findUnique({where:{id:existingUser.packageId}}):null;
    if(currentPackage&&currentPackage.id===pkg.id)return res.status(400).json({message:"You already have this package"});
    if(currentPackage&&pkg.price<=currentPackage.price)return res.status(400).json({message:"You can only upgrade to a higher package"});
    const chargeAmount=currentPackage?pkg.price-currentPackage.price:pkg.price;
    if(chargeAmount<=0)return res.status(400).json({message:"Invalid charge amount"});
    if(!coopConfigured())return res.status(503).json({message:"Co-op Bank STK Push is not configured on the NEXORA server"});

    const reference=`NX-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const messageReference=`NEXORA-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const token=await getCoopToken();
    const payload={
      MessageReference:messageReference,
      CallBackUrl:COOP_CALLBACK_URL,
      OperatorCode:COOP_OPERATOR_CODE,
      TransactionCurrency:"KES",
      MobileNumber:coopPhone(normalizedPhone),
      Narration:`NEXORA ${pkg.name}`.slice(0,50),
      Amount:chargeAmount,
      MessageDateTime:new Date().toISOString(),
      OtherDetails:[{Name:"Identifier",Value:reference}]
    };
    console.log("[COOP STK INIT]",JSON.stringify({reference,messageReference,packageId:pkg.id,package:pkg.name,amountKES:chargeAmount,phone:maskPhone(normalizedPhone),startedAt:new Date().toISOString()}));

    const r=await fetch(COOP_STK_URL,{method:"POST",headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});
    const data=await r.json().catch(()=>({}));
    console.log("[COOP STK RESPONSE]",JSON.stringify({reference,messageReference,httpStatus:r.status,response:data}));
    if(!r.ok)return res.status(400).json({message:coopDisplayText(data)||`Unable to start M-Pesa payment (${r.status})`,reference,coop_http_status:r.status});

    await prisma.transaction.create({data:{
      userId:req.user.id,type:"PACKAGE_PURCHASE",amount:chargeAmount,reference,status:"PENDING",
      metadata:{packageId:pkg.id,phone:normalizedPhone,chargeAmount,currentPackageId:currentPackage?.id||null,
        coop:{provider:"COOP",messageReference,request:payload,response:data,httpStatus:r.status,initializedAt:new Date().toISOString()},
        diagnostic:{initializedAt:new Date().toISOString(),responseMs:Date.now()-startedAt}}
    }});

    res.json({
      reference,messageReference,status:"pending",
      display_text:coopDisplayText(data),
      message:"STK prompt sent. Enter your M-Pesa PIN, then NEXORA will check the transaction status automatically.",
      coop_http_status:r.status,chargeAmount
    });
  }catch(e){
    console.error("[COOP STK INIT EXCEPTION]",e);
    res.status(500).json({message:e.message||"Payment initialization failed"});
  }
});

// Purchase / upgrade a package using wallet balance (no M-Pesa)
app.post("/api/payments/wallet-purchase",auth,async(req,res)=>{
  try{
    const {packageId}=req.body||{};
    if(!packageId) return res.status(400).json({message:"Package is required"});
    const pkg=await prisma.package.findUnique({where:{id:packageId}});
    if(!pkg||!pkg.active) return res.status(404).json({message:"Package not found"});

    const user=await prisma.user.findUnique({where:{id:req.user.id},include:{wallet:true,package:true}});
    if(!user) return res.status(401).json({message:"Account unavailable"});
    if(user.packageId===pkg.id) return res.status(400).json({message:"You already have this package"});
    if(user.package && pkg.price<=user.package.price) return res.status(400).json({message:"You can only upgrade to a higher package"});

    const chargeAmount=user.package ? pkg.price-user.package.price : pkg.price;
    if(chargeAmount<=0) return res.status(400).json({message:"Invalid charge amount"});

    const balance=Number(user.wallet?.balance||0);
    if(balance<chargeAmount){
      return res.status(400).json({
        message:`Insufficient wallet balance. You need KSh ${chargeAmount.toLocaleString()} but have KSh ${balance.toLocaleString()}.`
      });
    }

    const reference=`NX-WALLET-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    await prisma.$transaction(async db=>{
      const wallet=await db.wallet.findUnique({where:{userId:user.id}});
      if(!wallet || wallet.balance<chargeAmount) throw new Error("INSUFFICIENT");
      await db.wallet.update({where:{userId:user.id},data:{balance:{decrement:chargeAmount}}});
      await db.transaction.create({
        data:{
          userId:user.id,
          type:"PACKAGE_PURCHASE",
          amount:chargeAmount,
          reference,
          status:"PENDING",
          metadata:{packageId:pkg.id,chargeAmount,method:"WALLET",currentPackageId:user.packageId||null}
        }
      });
    });

    await activatePaidPackage(reference);
    const updated=await prisma.user.findUnique({where:{id:user.id},include:{package:true,wallet:true}});
    res.json({
      status:"success",
      reference,
      message:"Package activated using wallet balance.",
      package:updated?.package,
      wallet:updated?.wallet,
      chargeAmount
    });
  }catch(e){
    if(e.message==="INSUFFICIENT") return res.status(400).json({message:"Insufficient wallet balance"});
    console.error("[WALLET PURCHASE]",e);
    res.status(500).json({message:"Unable to complete wallet purchase"});
  }
});


// Start a paybill payment: creates PENDING tx and returns paybill instructions
app.post("/api/payments/paybill/initiate",auth,async(req,res)=>{
  try{
    if(!MPESA_PAYBILL_NUMBER || !MPESA_PAYBILL_ACCOUNT) return res.status(503).json({message:"M-Pesa Paybill payments are not fully configured yet. Set MPESA_PAYBILL_ACCOUNT in Render."});
    const {packageId}=req.body||{};
    if(!packageId) return res.status(400).json({message:"Package is required"});
    const pkg=await prisma.package.findUnique({where:{id:packageId}});
    if(!pkg||!pkg.active) return res.status(404).json({message:"Package not found"});
    const user=await prisma.user.findUnique({where:{id:req.user.id},include:{package:true}});
    if(!user) return res.status(401).json({message:"Account unavailable"});
    if(user.packageId===pkg.id) return res.status(400).json({message:"You already have this package"});
    if(user.package && pkg.price<=user.package.price) return res.status(400).json({message:"You can only upgrade to a higher package"});
    const chargeAmount=user.package ? pkg.price-user.package.price : pkg.price;
    if(chargeAmount<=0) return res.status(400).json({message:"Invalid charge amount"});

    const reference=`NX-PAYBILL-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    await prisma.transaction.create({
      data:{
        userId:user.id,
        type:"PACKAGE_PURCHASE",
        amount:chargeAmount,
        reference,
        status:"PENDING",
        metadata:{
          packageId:pkg.id,
          chargeAmount,
          method:"PAYBILL",
          paybillNumber:MPESA_PAYBILL_NUMBER,
          paybillAccount:MPESA_PAYBILL_ACCOUNT,
          paybillName:MPESA_PAYBILL_NAME,
          currentPackageId:user.packageId||null,
          mpesaCode:null,
          verified:false
        }
      }
    });
    res.status(201).json({
      reference,
      status:"pending",
      chargeAmount,
      package:{id:pkg.id,name:pkg.name,price:pkg.price},
      paybillNumber:MPESA_PAYBILL_NUMBER,
      paybillAccount:MPESA_PAYBILL_ACCOUNT,
      paybillName:MPESA_PAYBILL_NAME,
      accountReference:reference,
      instructions:[
        "Open M-Pesa on your phone",
        "Choose Lipa na M-Pesa → Paybill",
        `Enter Paybill number: ${MPESA_PAYBILL_NUMBER}`,
        `Enter amount: ${chargeAmount}`,
        `Enter Co-op account number: ${MPESA_PAYBILL_ACCOUNT}`,
        "Complete payment with your M-Pesa PIN",
        "Copy the M-Pesa confirmation code (e.g. QH12XXXX) and submit it below"
      ],
      message:"Pay the exact amount to the paybill, then submit your M-Pesa confirmation code."
    });
  }catch(e){
    console.error("[PAYBILL INITIATE]",e);
    res.status(500).json({message:"Unable to start paybill payment"});
  }
});

// Member submits M-Pesa confirmation code after paying to paybill
app.post("/api/payments/paybill/submit-code",auth,async(req,res)=>{
  try{
    const reference=String(req.body?.reference||"").trim();
    const mpesaCode=String(req.body?.mpesaCode||"").trim().toUpperCase().replace(/\s+/g,"");
    if(!reference||!mpesaCode) return res.status(400).json({message:"Payment reference and M-Pesa confirmation code are required"});
    if(mpesaCode.length<8||mpesaCode.length>15) return res.status(400).json({message:"Enter a valid M-Pesa confirmation code"});

    const tx=await prisma.transaction.findUnique({where:{reference}});
    if(!tx||tx.userId!==req.user.id) return res.status(404).json({message:"Payment not found"});
    if(tx.status==="SUCCESS") return res.json({status:"success",message:"This payment is already confirmed and your package is active."});
    if(tx.status==="FAILED") return res.status(400).json({message:"This payment was rejected. Start a new payment."});

    // Prevent reuse of the same M-Pesa code on another transaction
    const recent=await prisma.transaction.findMany({
      where:{type:"PACKAGE_PURCHASE",status:{in:["SUCCESS","PENDING"]},createdAt:{gte:new Date(Date.now()-30*24*60*60*1000)}},
      select:{reference:true,metadata:true},
      take:500
    });
    const duplicate=recent.some(t=>t.reference!==reference && String(t.metadata?.mpesaCode||"").toUpperCase()===mpesaCode);
    if(duplicate) return res.status(409).json({message:"This M-Pesa confirmation code was already used on another payment."});

    const meta={...(tx.metadata||{}),mpesaCode,codeSubmittedAt:new Date().toISOString(),awaitingVerification:true};
    await prisma.transaction.update({where:{id:tx.id},data:{metadata:meta}});

    res.json({
      status:"pending_verification",
      reference,
      message:"M-Pesa code received. NEXORA will verify the amount and confirmation before activating your package. This usually does not take long."
    });
  }catch(e){
    console.error("[PAYBILL SUBMIT CODE]",e);
    res.status(500).json({message:"Unable to submit M-Pesa code"});
  }
});

// Admin: list Paybill payments awaiting verification
app.get("/api/admin/payments/pending-paybill",adminAuth,async(req,res)=>{
  try{
    const rows=await prisma.transaction.findMany({
      where:{type:"PACKAGE_PURCHASE",status:"PENDING"},
      orderBy:{createdAt:"desc"},
      take:200,
      include:{user:{select:{id:true,name:true,email:true,phone:true}}}
    });
    const paybill=rows.filter(t=>(t.metadata?.method==="PAYBILL")||String(t.reference||"").startsWith("NX-PAYBILL-"));
    res.json(paybill.map(t=>({
      id:t.id,
      reference:t.reference,
      amount:t.amount,
      status:t.status,
      createdAt:t.createdAt,
      mpesaCode:t.metadata?.mpesaCode||null,
      packageId:t.metadata?.packageId||null,
      paybillNumber:t.metadata?.paybillNumber||MPESA_PAYBILL_NUMBER,
      paybillAccount:t.metadata?.paybillAccount||MPESA_PAYBILL_ACCOUNT,
      awaitingVerification:Boolean(t.metadata?.awaitingVerification||t.metadata?.mpesaCode),
      user:t.user
    })));
  }catch(e){
    console.error(e);
    res.status(500).json({message:"Unable to load pending Paybill payments"});
  }
});

// Admin verifies paybill payment: checks claimed amount matches, then activates package
app.post("/api/admin/payments/verify-paybill",adminAuth,async(req,res)=>{
  try{
    const reference=String(req.body?.reference||"").trim();
    const action=String(req.body?.action||"approve").toLowerCase();
    const note=String(req.body?.note||"").trim();
    const confirmedAmount=req.body?.confirmedAmount!=null?Number(req.body.confirmedAmount):null;

    const tx=await prisma.transaction.findUnique({where:{reference},include:{user:{select:{id:true,name:true,email:true}}}});
    if(!tx) return res.status(404).json({message:"Transaction not found"});
    if(tx.status==="SUCCESS") return res.json({message:"Already activated",status:"success"});

    if(action==="reject"){
      await prisma.transaction.update({
        where:{id:tx.id},
        data:{status:"FAILED",metadata:{...(tx.metadata||{}),rejectedAt:new Date().toISOString(),rejectNote:note,verifiedBy:req.admin.email}}
      });
      await logAdminAction(req,"PAYBILL_PAYMENT_REJECTED","TRANSACTION",tx.id,tx.user?.email,{reference,note});
      return res.json({status:"failed",message:"Payment rejected. Member can start a new payment."});
    }

    // approve
    const expected=Number(tx.amount);
    if(confirmedAmount!=null && Number.isFinite(confirmedAmount) && confirmedAmount!==expected){
      return res.status(400).json({
        message:`Amount mismatch. Expected KSh ${expected.toLocaleString()} but confirmed KSh ${confirmedAmount.toLocaleString()}. Reject or correct before activating.`
      });
    }
    if(!tx.metadata?.mpesaCode){
      return res.status(400).json({message:"Member has not submitted an M-Pesa confirmation code yet."});
    }

    await prisma.transaction.update({
      where:{id:tx.id},
      data:{metadata:{...(tx.metadata||{}),verified:true,verifiedAt:new Date().toISOString(),verifiedBy:req.admin.email,adminNote:note||null,confirmedAmount:confirmedAmount??expected}}
    });
    await activatePaidPackage(reference);
    await logAdminAction(req,"PAYBILL_PAYMENT_APPROVED","TRANSACTION",tx.id,tx.user?.email,{reference,amount:expected,mpesaCode:tx.metadata?.mpesaCode});
    res.json({status:"success",message:`Payment verified. Package activated for ${tx.user?.email||"member"}.`});
  }catch(e){
    console.error("[PAYBILL VERIFY]",e);
    res.status(500).json({message:"Unable to verify paybill payment"});
  }
});


async function activatePaidPackage(reference){
  const tx=await prisma.transaction.findUnique({where:{reference}});
  if(!tx || tx.status==="SUCCESS") return;
  const meta=tx.metadata||{};
  const packageId=meta.packageId;
  const pkg=await prisma.package.findUnique({where:{id:packageId}});
  if(!pkg) throw new Error("Package missing");
  await prisma.$transaction(async db=>{
    await db.transaction.update({where:{id:tx.id},data:{status:"SUCCESS"}});
    await db.user.update({where:{id:tx.userId},data:{packageId:pkg.id}});
    const buyer=await db.user.findUnique({where:{id:tx.userId}});
    if(!buyer?.referredById) return;
    // Commission is determined by the PACKAGE PURCHASED by the new member.
    // The upline can therefore earn when a referral purchases Starter, Growth, Pro, Elite or Premium.
    const parent=await db.user.findUnique({where:{id:buyer.referredById}});
    if(parent){
      // A member can earn from package purchases up to their own package tier.
      // Starter earns from Starter purchases; Growth earns from Starter + Growth;
      // Pro earns from Starter + Growth + Pro; and so on.
      if(!parent.packageId || (await db.package.findUnique({where:{id:parent.packageId}}))?.tier >= pkg.tier){
        const c1=pkg.directCommission;
        await db.commission.create({data:{receiverId:parent.id,sourceUserId:buyer.id,level:1,amount:c1,reference:`C1-${reference}` }});
        await db.wallet.update({where:{userId:parent.id},data:{balance:{increment:c1},totalEarned:{increment:c1}}});
      }
    }
    if(parent?.referredById){
      const grand=await db.user.findUnique({where:{id:parent.referredById}});
      const grandPkg=grand?.packageId ? await db.package.findUnique({where:{id:grand.packageId}}) : null;
      if(grand && grandPkg && grandPkg.tier >= pkg.tier){
        const c2=pkg.level2Commission;
        await db.commission.create({data:{receiverId:grand.id,sourceUserId:buyer.id,level:2,amount:c2,reference:`C2-${reference}` }});
        await db.wallet.update({where:{userId:grand.id},data:{balance:{increment:c2},totalEarned:{increment:c2}}});
      }
    }
  });
}

app.get("/api/payments/status/:reference",auth,async(req,res)=>{
  try{
    const tx=await prisma.transaction.findUnique({where:{reference:req.params.reference}});
    if(!tx||tx.userId!==req.user.id)return res.status(404).json({message:"Payment reference not found"});
    const result=await queryAndApplyCoopStatus(req.params.reference);
    res.json({status:result.status,display_text:result.message||"",message:result.message||"",reference:req.params.reference});
  }catch(e){
    console.error("[COOP STATUS EXCEPTION]",e);
    res.status(500).json({message:e.message||"Payment status check failed"});
  }
});
app.get("/api/payments/verify/:reference",auth,async(req,res)=>{
  try{
    const tx=await prisma.transaction.findUnique({where:{reference:req.params.reference}});
    if(!tx||tx.userId!==req.user.id)return res.status(404).json({message:"Payment reference not found"});
    const result=await queryAndApplyCoopStatus(req.params.reference);
    res.json({status:result.status,display_text:result.message||"",message:result.message||"Payment status checked"});
  }catch(e){
    console.error("[COOP VERIFY EXCEPTION]",e);
    res.status(500).json({message:e.message||"Verification failed"});
  }
});

// -------------------- NEXORA ADMIN --------------------
app.post("/api/admin/auth/login", rateLimit({windowMs:15*60*1000,max:20}), async(req,res)=>{
  try{
    const email=String(req.body?.email||"").trim().toLowerCase();
    const password=String(req.body?.password||"");
    const admin=await prisma.admin.findUnique({where:{email}});
    if(!admin || admin.status!=="ACTIVE" || !(await bcrypt.compare(password,admin.passwordHash))) return res.status(401).json({message:"Invalid admin login details"});
    res.json({token:signAdmin(admin),admin:{id:admin.id,name:admin.name,email:admin.email}});
  }catch(e){console.error("Admin login error:",e);res.status(500).json({message:"Admin login failed"});}
});
app.get("/api/admin/me",adminAuth,async(req,res)=>res.json({admin:{id:req.admin.id,name:req.admin.name,email:req.admin.email}}));
app.get("/api/admin/overview",adminAuth,async(req,res)=>{
  try{
    const [users,activeUsers,packages,transactions,pendingPayments,failedPayments,successfulPayments,withdrawals,pendingWithdrawals,totalEarned]=await Promise.all([
      prisma.user.count(),
      prisma.user.count({where:{status:"ACTIVE"}}),
      prisma.package.count({where:{active:true}}),
      prisma.transaction.count(),
      prisma.transaction.count({where:{status:"PENDING"}}),
      prisma.transaction.count({where:{status:"FAILED"}}),
      prisma.transaction.aggregate({where:{type:"PACKAGE_PURCHASE",status:"SUCCESS"},_sum:{amount:true}}),
      prisma.withdrawal.count(),
      prisma.withdrawal.count({where:{status:{in:["PENDING","PROCESSING"]}}}),
      prisma.commission.aggregate({_sum:{amount:true}})
    ]);
    res.json({users,activeUsers,packages,transactions,pendingPayments,successfulPayments:successfulPayments._sum.amount||0,withdrawals,pendingWithdrawals,failedPayments,totalCommissions:totalEarned._sum.amount||0,paymentProvider:coopConfigured()?"Co-op Bank":"unconfigured"});
  }catch(e){console.error("Admin overview error:",e);res.status(500).json({message:"Unable to load admin overview"});}
});
app.get("/api/admin/users",adminAuth,async(req,res)=>{
  try{
    const q=String(req.query.q||"").trim();
    const rows=await prisma.user.findMany({where:q?{OR:[{name:{contains:q,mode:"insensitive"}},{email:{contains:q,mode:"insensitive"}},{phone:{contains:q}}]}:undefined,include:{package:true,wallet:true,referredBy:{select:{name:true,email:true}}},orderBy:{createdAt:"desc"},take:200});
    res.json(rows.map(u=>({id:u.id,name:u.name,email:u.email,phone:u.phone,status:u.status,package:u.package,wallet:u.wallet,referralCode:u.referralCode,referredBy:u.referredBy,createdAt:u.createdAt})));
  }catch(e){console.error("Admin users error:",e);res.status(500).json({message:"Unable to load users"});}
});
app.post("/api/admin/users/balance",adminAuth,async(req,res)=>{
  try{
    const email=String(req.body?.email||"").trim().toLowerCase();
    const mode=String(req.body?.mode||"add").toLowerCase();
    const amount=Number(req.body?.amount);
    const reason=String(req.body?.reason||"").trim().slice(0,500);
    const updateTotalEarned=Boolean(req.body?.updateTotalEarned);
    if(!email || !email.includes("@")) return res.status(400).json({message:"Enter a valid member email address"});
    if(!["add","subtract","set"].includes(mode)) return res.status(400).json({message:"Invalid balance update mode"});
    if(!Number.isInteger(amount) || amount<0 || amount>10000000) return res.status(400).json({message:"Amount must be a whole number between KSh 0 and KSh 10,000,000"});
    if(!reason) return res.status(400).json({message:"A reason is required for every balance correction"});
    const user=await prisma.user.findUnique({where:{email},include:{wallet:true}});
    if(!user) return res.status(404).json({message:"No member was found with that email address"});
    const currentBalance=user.wallet?.balance||0;
    const currentTotalEarned=user.wallet?.totalEarned||0;
    const nextBalance=mode==="set"?amount:mode==="add"?currentBalance+amount:currentBalance-amount;
    if(nextBalance<0) return res.status(400).json({message:`Cannot reduce balance below KSh 0. Current balance is KSh ${currentBalance}.`});
    const delta=nextBalance-currentBalance;
    if(updateTotalEarned && currentTotalEarned+delta<0) return res.status(400).json({message:`This correction would make Total Earned negative. Current Total Earned is KSh ${currentTotalEarned}.`});
    const reference=`ADMIN-BAL-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const metadata={adminBalanceAdjustment:true,adminId:req.admin.id,adminEmail:req.admin.email,mode,previousBalance:currentBalance,newBalance:nextBalance,delta,reason,updateTotalEarned};
    const walletData={balance:nextBalance};
    if(updateTotalEarned) walletData.totalEarned={increment:delta};
    const result=await prisma.$transaction(async(tx)=>{
      const wallet=await tx.wallet.upsert({where:{userId:user.id},update:walletData,create:{userId:user.id,balance:nextBalance,totalEarned:updateTotalEarned?Math.max(0,delta):0}});
      if(delta!==0){
        await tx.transaction.create({data:{userId:user.id,type:"REFUND",amount:delta,status:"SUCCESS",reference,metadata}});
      }
      return wallet;
    });
    await logAdminAction(req,"BALANCE_CORRECTION","USER",user.id,user.email,{previousBalance:currentBalance,newBalance:result.balance,delta,mode,reason,reference,updateTotalEarned});
    res.json({message:`Balance updated for ${user.email}`,user:{id:user.id,name:user.name,email:user.email},previousBalance:currentBalance,newBalance:result.balance,delta,reference});
  }catch(e){
    console.error("Admin balance update error:",e);
    res.status(500).json({message:"Unable to update member balance"});
  }
});
app.patch("/api/admin/users/:id/status",adminAuth,async(req,res)=>{
  try{const status=req.body?.status;if(!["ACTIVE","SUSPENDED"].includes(status))return res.status(400).json({message:"Invalid user status"});const u=await prisma.user.update({where:{id:req.params.id},data:{status}});await logAdminAction(req,status==="ACTIVE"?"USER_REACTIVATED":"USER_SUSPENDED","USER",u.id,u.email,{status});res.json({message:`User ${status.toLowerCase()}`,user:{id:u.id,status:u.status}});}
  catch(e){console.error(e);res.status(500).json({message:"Unable to update user"});}
});
app.get("/api/admin/transactions",adminAuth,async(req,res)=>{
  try{const rows=await prisma.transaction.findMany({include:{user:{select:{id:true,name:true,email:true,phone:true}}},orderBy:{createdAt:"desc"},take:300});res.json(rows);}catch(e){console.error(e);res.status(500).json({message:"Unable to load transactions"});}
});
app.get("/api/admin/withdrawals",adminAuth,async(req,res)=>{
  try{const rows=await prisma.withdrawal.findMany({include:{user:{select:{id:true,name:true,email:true,phone:true}}},orderBy:{createdAt:"desc"},take:300});res.json(rows);}catch(e){console.error(e);res.status(500).json({message:"Unable to load withdrawals"});}
});
app.patch("/api/admin/withdrawals/:id/status",adminAuth,async(req,res)=>{
  try{
    const status=req.body?.status;
    if(!["PENDING","PROCESSING","PAID","FAILED"].includes(status))return res.status(400).json({message:"Invalid withdrawal status"});
    const current=await prisma.withdrawal.findUnique({where:{id:req.params.id}});
    if(!current)return res.status(404).json({message:"Withdrawal not found"});
    if(current.status!=="PAID" && status==="PAID"){
      await prisma.$transaction([
        prisma.withdrawal.update({where:{id:current.id},data:{status}}),
        prisma.wallet.update({where:{userId:current.userId},data:{pendingBalance:{decrement:current.amount},totalWithdrawn:{increment:current.amount}}}),
        prisma.transaction.create({data:{userId:current.userId,type:"WITHDRAWAL",amount:current.amount,status:"SUCCESS",reference:`WD-TX-${current.reference}`,metadata:{withdrawalId:current.id,processedBy:req.admin.id}}})
      ]);
    } else if(current.status!=="PAID" && status==="FAILED"){
      await prisma.$transaction([
        prisma.withdrawal.update({where:{id:current.id},data:{status}}),
        prisma.wallet.update({where:{userId:current.userId},data:{pendingBalance:{decrement:current.amount},balance:{increment:current.amount}}}),
        prisma.transaction.create({data:{userId:current.userId,type:"REFUND",amount:current.amount,status:"SUCCESS",reference:`WD-REFUND-${current.reference}`,metadata:{withdrawalId:current.id,processedBy:req.admin.id}}})
      ]);
    } else { await prisma.withdrawal.update({where:{id:current.id},data:{status}}); }
    await logAdminAction(req,"WITHDRAWAL_STATUS","WITHDRAWAL",current.id,null,{from:current.status,to:status,amount:current.amount,userId:current.userId,reference:current.reference});
    res.json({message:"Withdrawal status updated"});
  }catch(e){console.error("Admin withdrawal status error:",e);res.status(500).json({message:"Unable to update withdrawal"});}
});
app.get("/api/admin/packages",adminAuth,async(req,res)=>{try{res.json(await prisma.package.findMany({include:{_count:{select:{users:true}}},orderBy:{tier:"asc"}}));}catch(e){res.status(500).json({message:"Unable to load packages"});}});
app.patch("/api/admin/packages/:id",adminAuth,async(req,res)=>{
  try{const price=Number(req.body?.price),directCommission=Number(req.body?.directCommission),level2Commission=Number(req.body?.level2Commission),active=Boolean(req.body?.active),description=String(req.body?.description||""),badge=String(req.body?.badge||""),popular=Boolean(req.body?.popular),withdrawalLimit=Number(req.body?.withdrawalLimit||0),features=Array.isArray(req.body?.features)?req.body.features.map(x=>String(x).trim()).filter(Boolean):[];if(!Number.isInteger(price)||price<0||!Number.isInteger(directCommission)||directCommission<0||!Number.isInteger(level2Commission)||level2Commission<0||!Number.isInteger(withdrawalLimit)||withdrawalLimit<0)return res.status(400).json({message:"Package values must be whole non-negative amounts"});const p=await prisma.package.update({where:{id:req.params.id},data:{price,directCommission,level2Commission,active,description,badge,popular,withdrawalLimit,features}});await logAdminAction(req,"PACKAGE_UPDATED","PACKAGE",p.id,null,{name:p.name,price,directCommission,level2Commission,active,description,badge,popular,withdrawalLimit,features});res.json(p);}catch(e){console.error(e);res.status(500).json({message:"Unable to update package"});}
});
app.post("/api/admin/packages",adminAuth,async(req,res)=>{
  try{const name=String(req.body?.name||"").trim();const price=Number(req.body?.price),directCommission=Number(req.body?.directCommission),level2Commission=Number(req.body?.level2Commission),description=String(req.body?.description||""),badge=String(req.body?.badge||""),popular=Boolean(req.body?.popular),withdrawalLimit=Number(req.body?.withdrawalLimit||0),features=Array.isArray(req.body?.features)?req.body.features.map(x=>String(x).trim()).filter(Boolean):[];if(!name||!Number.isInteger(price)||price<0||!Number.isInteger(directCommission)||directCommission<0||!Number.isInteger(level2Commission)||level2Commission<0||!Number.isInteger(withdrawalLimit)||withdrawalLimit<0)return res.status(400).json({message:"Enter valid package values"});const maxTier=await prisma.package.aggregate({_max:{tier:true}}); const tier=Number(maxTier._max.tier||0)+1; const p=await prisma.package.create({data:{name,tier,price,directCommission,level2Commission,active:true,description,badge,popular,withdrawalLimit,features}});await logAdminAction(req,"PACKAGE_CREATED","PACKAGE",p.id,null,{name,price,directCommission,level2Commission,description,badge,popular,withdrawalLimit,features});res.status(201).json(p);}catch(e){console.error(e);res.status(500).json({message:e.code==="P2002"?"A package with that name already exists":"Unable to create package"});}
});

// Admin member details
app.get("/api/admin/users/:id/details",adminAuth,async(req,res)=>{
  try{
    const u=await prisma.user.findUnique({where:{id:req.params.id},include:{package:true,wallet:true,referredBy:{select:{id:true,name:true,email:true}},referrals:{select:{id:true,name:true,email:true,status:true,package:{select:{name:true}},createdAt:true},orderBy:{createdAt:"desc"}},transactions:{orderBy:{createdAt:"desc"},take:100},commissionsEarned:{orderBy:{createdAt:"desc"},take:100,include:{sourceUser:{select:{name:true,email:true}}}},withdrawals:{orderBy:{createdAt:"desc"},take:100}}});
    if(!u)return res.status(404).json({message:"Member not found"});
    res.json(u);
  }catch(e){console.error("Admin member details error:",e);res.status(500).json({message:"Unable to load member details"});}
});

// Admin payment repair: verifies a Paystack charge reference before activating the package.
app.post("/api/admin/payments/repair",adminAuth,async(req,res)=>{
  try{
    if(!coopConfigured())return res.status(503).json({message:"Co-op Bank STK Push is not configured"});
    const email=String(req.body?.email||"").trim().toLowerCase();
    const reference=String(req.body?.reference||"").trim();
    if(!email||!email.includes("@"))return res.status(400).json({message:"Enter the member email address"});
    if(!reference)return res.status(400).json({message:"Enter the NEXORA payment reference"});
    const user=await prisma.user.findUnique({where:{email}});
    if(!user)return res.status(404).json({message:"No member was found with that email address"});
    const tx=await prisma.transaction.findUnique({where:{reference}});
    if(!tx)return res.status(404).json({message:"No NEXORA transaction exists for that reference"});
    if(tx.userId!==user.id)return res.status(409).json({message:"That payment reference belongs to a different member"});
    const result=await queryAndApplyCoopStatus(reference);
    if(result.status==="success"){
      await logAdminAction(req,"PAYMENT_REPAIRED","TRANSACTION",tx.id,user.email,{reference,provider:"COOP",status:result.status});
      return res.json({message:"Co-op payment verified and member account repaired successfully",status:"success",reference});
    }
    await logAdminAction(req,"PAYMENT_CHECKED","TRANSACTION",tx.id,user.email,{reference,provider:"COOP",status:result.status});
    res.json({message:`Co-op reports this payment as ${result.status}. No package activation was performed.`,status:result.status,reference});
  }catch(e){console.error("Admin Co-op payment repair error:",e);res.status(500).json({message:e.message||"Unable to repair payment"});}
});


app.get("/api/admin/support/tickets",adminAuth,async(req,res)=>{try{res.json(await prisma.supportTicket.findMany({include:{user:{select:{id:true,name:true,email:true}}},orderBy:{createdAt:"desc"},take:300}));}catch(e){console.error(e);res.status(500).json({message:"Unable to load support tickets"});}});
app.patch("/api/admin/support/tickets/:id",adminAuth,async(req,res)=>{try{const status=String(req.body?.status||"OPEN").toUpperCase();const response=String(req.body?.response||"").trim().slice(0,3000);if(!["OPEN","IN_PROGRESS","CLOSED"].includes(status))return res.status(400).json({message:"Invalid ticket status"});const t=await prisma.supportTicket.update({where:{id:req.params.id},data:{status,response:response||null}});await logAdminAction(req,"SUPPORT_TICKET_UPDATED","SUPPORT_TICKET",t.id,null,{status,hasResponse:Boolean(response)});res.json(t);}catch(e){console.error(e);res.status(500).json({message:"Unable to update support ticket"});}});

app.get("/api/admin/activity",adminAuth,async(req,res)=>{
  try{const rows=await prisma.adminActivityLog.findMany({orderBy:{createdAt:"desc"},take:500});res.json(rows);}catch(e){console.error(e);res.status(500).json({message:"Unable to load admin activity"});}
});

// Simple CSV exports for admin records.
app.get("/api/admin/export/:type",adminAuth,async(req,res)=>{
  try{
    const type=String(req.params.type||"").toLowerCase(); let rows=[], headers=[];
    if(type==="users"){
      rows=await prisma.user.findMany({include:{wallet:true,package:true},orderBy:{createdAt:"desc"}});headers=["Name","Email","Phone","Status","Package","Balance","Total Earned","Total Withdrawn","Created"];
      rows=rows.map(x=>[x.name,x.email,x.phone,x.status,x.package?.name||"",x.wallet?.balance||0,x.wallet?.totalEarned||0,x.wallet?.totalWithdrawn||0,x.createdAt.toISOString()]);
    }else if(type==="transactions"){
      rows=await prisma.transaction.findMany({include:{user:{select:{email:true}}},orderBy:{createdAt:"desc"}});headers=["Reference","Email","Type","Amount","Status","Created"];rows=rows.map(x=>[x.reference,x.user?.email||"",x.type,x.amount,x.status,x.createdAt.toISOString()]);
    }else if(type==="withdrawals"){
      rows=await prisma.withdrawal.findMany({include:{user:{select:{email:true}}},orderBy:{createdAt:"desc"}});headers=["Reference","Email","Phone","Amount","Status","Created"];rows=rows.map(x=>[x.reference,x.user?.email||"",x.phone,x.amount,x.status,x.createdAt.toISOString()]);
    }else return res.status(400).json({message:"Unsupported export type"});
    const esc=v=>`"${String(v??"").replace(/"/g,'""')}"`;const csv=[headers, ...rows].map(r=>r.map(esc).join(",")).join("\n");
    res.setHeader("Content-Type","text/csv; charset=utf-8");res.setHeader("Content-Disposition",`attachment; filename=nexora-${type}-${Date.now()}.csv`);res.send(csv);
    await logAdminAction(req,"DATA_EXPORT",type.toUpperCase(),null,null,{rows:rows.length});
  }catch(e){console.error("Admin export error:",e);res.status(500).json({message:"Unable to export data"});}
});


app.get("/api/announcements",async(req,res)=>{try{res.json(await prisma.announcement.findMany({where:{active:true},orderBy:{createdAt:"desc"},take:30}));}catch(e){console.error(e);res.status(500).json({message:"Unable to load announcements"});}});
app.get("/api/admin/announcements",adminAuth,async(req,res)=>{try{res.json(await prisma.announcement.findMany({orderBy:{createdAt:"desc"},take:100}));}catch(e){res.status(500).json({message:"Unable to load announcements"});}});
app.post("/api/admin/announcements",adminAuth,async(req,res)=>{try{const title=String(req.body?.title||"").trim().slice(0,120),body=String(req.body?.body||"").trim().slice(0,3000),category=String(req.body?.category||"UPDATE").trim().slice(0,30).toUpperCase();if(!title||!body)return res.status(400).json({message:"Title and body are required"});const a=await prisma.announcement.create({data:{title,body,category,active:req.body?.active!==false}});await logAdminAction(req,"ANNOUNCEMENT_CREATED","ANNOUNCEMENT",a.id,null,{title,category});res.status(201).json(a);}catch(e){console.error(e);res.status(500).json({message:"Unable to create announcement"});}});
app.patch("/api/admin/announcements/:id",adminAuth,async(req,res)=>{try{const data={};if(req.body?.title!==undefined)data.title=String(req.body.title).trim().slice(0,120);if(req.body?.body!==undefined)data.body=String(req.body.body).trim().slice(0,3000);if(req.body?.category!==undefined)data.category=String(req.body.category).trim().slice(0,30).toUpperCase();if(req.body?.active!==undefined)data.active=Boolean(req.body.active);const a=await prisma.announcement.update({where:{id:req.params.id},data});await logAdminAction(req,"ANNOUNCEMENT_UPDATED","ANNOUNCEMENT",a.id,null,{active:a.active});res.json(a);}catch(e){console.error(e);res.status(500).json({message:"Unable to update announcement"});}});

app.get("/api/member/analytics",auth,async(req,res)=>{
  try{
    const direct=await prisma.user.findMany({where:{referredById:req.user.id},select:{id:true,packageId:true,createdAt:true}});
    const ids=direct.map(x=>x.id);
    const level2=ids.length?await prisma.user.findMany({where:{referredById:{in:ids}},select:{id:true,packageId:true}}):[];
    const commissions=await prisma.commission.findMany({where:{receiverId:req.user.id},select:{level:true,amount:true,createdAt:true}});
    const now=new Date(); const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
    const monthDirect=direct.filter(x=>new Date(x.createdAt)>=monthStart).length;
    const monthCommissions=commissions.filter(x=>new Date(x.createdAt)>=monthStart).reduce((a,x)=>a+x.amount,0);
    const directCommission=commissions.filter(x=>x.level===1).reduce((a,x)=>a+x.amount,0);
    const level2Commission=commissions.filter(x=>x.level===2).reduce((a,x)=>a+x.amount,0);
    const paidReferrals=direct.filter(x=>x.packageId).length;
    res.json({directCount:direct.length,level2Count:level2.length,paidReferrals,conversion:direct.length?Math.round(paidReferrals/direct.length*100):0,directCommission,level2Commission,totalCommission:directCommission+level2Commission,month:{directReferrals:monthDirect,commissions:monthCommissions}});
  }catch(e){console.error(e);res.status(500).json({message:"Unable to load analytics"});}
});

app.get("/api/member/leaderboard",auth,async(req,res)=>{
  try{
    const rows=await prisma.user.findMany({where:{status:"ACTIVE"},orderBy:{wallet:{totalEarned:"desc"}},take:20,select:{id:true,name:true,createdAt:true,package:{select:{name:true}},wallet:{select:{totalEarned:true}}}});
    res.json(rows.map(x=>({id:x.id,name:String(x.name||"Member").split(" ")[0],createdAt:x.createdAt,package:x.package?.name||null,totalEarned:x.wallet?.totalEarned||0})));
  }catch(e){console.error(e);res.status(500).json({message:"Unable to load leaderboard"});}
});

app.get("/api/support/tickets",auth,async(req,res)=>{try{res.json(await prisma.supportTicket.findMany({where:{userId:req.user.id},orderBy:{createdAt:"desc"},take:50}));}catch(e){console.error(e);res.status(500).json({message:"Unable to load support tickets"});}});
app.post("/api/support/tickets",auth,async(req,res)=>{try{const subject=String(req.body?.subject||"").trim().slice(0,120);const message=String(req.body?.message||"").trim().slice(0,3000);if(!subject||!message)return res.status(400).json({message:"Subject and message are required"});const t=await prisma.supportTicket.create({data:{userId:req.user.id,subject,message}});res.status(201).json({message:"Support request submitted",ticket:t});}catch(e){console.error(e);res.status(500).json({message:"Unable to create support ticket"});}});

app.patch("/api/member/profile",auth,async(req,res)=>{try{const name=String(req.body?.name||"").trim();const phone=cleanPhone(req.body?.phone||"");if(name.length<2)return res.status(400).json({message:"Enter your full name"});if(!PHONE_RE.test(phone))return res.status(400).json({message:"Invalid Kenyan phone number"});const clash=await prisma.user.findFirst({where:{phone,id:{not:req.user.id}}});if(clash)return res.status(409).json({message:"That phone number is already in use"});await prisma.user.update({where:{id:req.user.id},data:{name,phone}});res.json({message:"Profile updated successfully"});}catch(e){console.error(e);res.status(500).json({message:"Unable to update profile"});}});
app.post("/api/member/password",auth,async(req,res)=>{try{const current=String(req.body?.currentPassword||"");const next=String(req.body?.newPassword||"");if(next.length<8)return res.status(400).json({message:"New password must be at least 8 characters"});if(!(await bcrypt.compare(current,req.user.passwordHash)))return res.status(401).json({message:"Current password is incorrect"});await prisma.user.update({where:{id:req.user.id},data:{passwordHash:await bcrypt.hash(next,12)}});res.json({message:"Password updated successfully. Please use the new password next time you sign in."});}catch(e){console.error(e);res.status(500).json({message:"Unable to update password"});}});

app.post("/api/withdrawals",auth,async(req,res)=>{
  const amount=Number(req.body.amount), phone=cleanPhone(req.body.phone||req.user.phone);
  if(!PHONE_RE.test(phone)) return res.status(400).json({message:"Invalid Kenyan phone number. Use 07…, 01…, 2547… or 2541…."});
  if(!Number.isInteger(amount)||amount<100) return res.status(400).json({message:"Minimum withdrawal is KSh 100"});
  const wallet=await prisma.wallet.findUnique({where:{userId:req.user.id}});
  if(!wallet || wallet.balance<amount) return res.status(400).json({message:"Insufficient balance"});
  const member=await prisma.user.findUnique({where:{id:req.user.id},include:{package:true}});
  const limit=Number(member?.package?.withdrawalLimit||0);
  if(limit>0 && amount>limit) return res.status(400).json({message:`Your ${member.package.name} package allows withdrawals up to KSh ${limit.toLocaleString()} per request.`});
  const reference=`WD-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  await prisma.$transaction([
    prisma.wallet.update({where:{userId:req.user.id},data:{balance:{decrement:amount},pendingBalance:{increment:amount}}}),
    prisma.withdrawal.create({data:{userId:req.user.id,amount,phone,reference}})
  ]);
  res.status(201).json({message:"Withdrawal request submitted",reference});
});


// Wallet deposits via Co-op Bank M-Pesa STK Push.
app.post("/api/wallet/deposit/initiate",auth,async(req,res)=>{
  const startedAt=Date.now();
  try{
    const amount=Number(req.body?.amount);
    const normalizedPhone=cleanPhone(req.body?.phone||req.user.phone);
    if(!Number.isInteger(amount)||amount<100)return res.status(400).json({message:"Minimum deposit is KSh 100"});
    if(!PHONE_RE.test(normalizedPhone))return res.status(400).json({message:"Invalid Kenyan phone number. Use 07…, 01…, 2547… or 2541…."});
    if(!coopConfigured())return res.status(503).json({message:"Co-op Bank STK Push is not configured on the NEXORA server"});
    const reference=`NX-DEP-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const messageReference=`NEXORA-DEP-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const token=await getCoopToken();
    const payload={MessageReference:messageReference,CallBackUrl:COOP_CALLBACK_URL,OperatorCode:COOP_OPERATOR_CODE,TransactionCurrency:"KES",MobileNumber:coopPhone(normalizedPhone),Narration:"NEXORA Wallet Deposit".slice(0,50),Amount:amount,MessageDateTime:new Date().toISOString(),OtherDetails:[{Name:"Identifier",Value:reference}]};
    const r=await fetch(COOP_STK_URL,{method:"POST",headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});
    const data=await r.json().catch(()=>({}));
    console.log("[COOP WALLET STK RESPONSE]",JSON.stringify({reference,messageReference,httpStatus:r.status,response:data}));
    if(!r.ok)return res.status(400).json({message:coopDisplayText(data)||`Unable to start M-Pesa payment (${r.status})`,reference,coop_http_status:r.status});
    await prisma.transaction.create({data:{userId:req.user.id,type:"DEPOSIT",amount,reference,status:"PENDING",metadata:{method:"COOP_STK",phone:normalizedPhone,coop:{provider:"COOP",messageReference,request:payload,response:data,httpStatus:r.status,initializedAt:new Date().toISOString()},diagnostic:{initializedAt:new Date().toISOString(),responseMs:Date.now()-startedAt}}}});
    res.status(201).json({reference,messageReference,status:"pending",amount,phone:normalizedPhone,display_text:coopDisplayText(data),message:"STK prompt sent. Enter your M-Pesa PIN, then NEXORA will check the transaction status automatically."});
  }catch(e){console.error("[COOP WALLET STK INIT EXCEPTION]",e);res.status(500).json({message:e.message||"Unable to start wallet deposit"});}
});

app.get("/api/wallet/deposit/status/:reference",auth,async(req,res)=>{
  try{
    const reference=String(req.params.reference||"").trim();
    const tx=await prisma.transaction.findUnique({where:{reference}});
    if(!tx||tx.userId!==req.user.id||tx.type!=="DEPOSIT")return res.status(404).json({message:"Deposit not found"});
    const result=await queryAndApplyCoopStatus(reference);
    res.json(result);
  }catch(e){console.error("[COOP WALLET STATUS]",e);res.status(500).json({message:e.message||"Unable to check deposit status"});}
});

app.get("/api/admin/wallet/deposits",adminAuth,async(req,res)=>{
  try{
    const rows=await prisma.transaction.findMany({where:{type:"DEPOSIT",status:"PENDING"},orderBy:{createdAt:"desc"},take:200,include:{user:{select:{id:true,name:true,email:true,phone:true}}}});
    res.json(rows.map(x=>({id:x.id,reference:x.reference,amount:x.amount,status:x.status,createdAt:x.createdAt,user:x.user,mpesaCode:x.metadata?.mpesaCode||null,paybillNumber:x.metadata?.paybillNumber||MPESA_PAYBILL_NUMBER,paybillAccount:x.metadata?.paybillAccount||MPESA_PAYBILL_ACCOUNT})));
  }catch(e){console.error("[ADMIN DEPOSITS]",e);res.status(500).json({message:"Unable to load pending deposits"});}
});

app.post("/api/admin/wallet/deposits/verify",adminAuth,async(req,res)=>{
  try{
    const reference=String(req.body?.reference||"").trim();
    const action=String(req.body?.action||"approve").toLowerCase();
    const note=String(req.body?.note||"").trim();
    const confirmedAmount=req.body?.confirmedAmount!=null?Number(req.body.confirmedAmount):null;
    const tx=await prisma.transaction.findUnique({where:{reference},include:{user:{select:{id:true,name:true,email:true}}}});
    if(!tx||tx.type!=="DEPOSIT") return res.status(404).json({message:"Deposit not found"});
    if(tx.status==="SUCCESS") return res.json({status:"success",message:"Deposit already credited"});
    if(action==="reject"){
      await prisma.transaction.update({where:{id:tx.id},data:{status:"FAILED",metadata:{...(tx.metadata||{}),rejectedAt:new Date().toISOString(),rejectNote:note,verifiedBy:req.admin.email}}});
      await logAdminAction(req,"WALLET_DEPOSIT_REJECTED","TRANSACTION",tx.id,tx.user?.email,{reference,note});
      return res.json({status:"failed",message:"Deposit rejected."});
    }
    const expected=Number(tx.amount);
    if(confirmedAmount!=null&&Number.isFinite(confirmedAmount)&&confirmedAmount!==expected)return res.status(400).json({message:`Amount mismatch. Expected KSh ${expected.toLocaleString()} but confirmed KSh ${confirmedAmount.toLocaleString()}.`});
    if(!tx.metadata?.mpesaCode)return res.status(400).json({message:"Member has not submitted an M-Pesa confirmation code yet."});
    await prisma.$transaction(async db=>{
      await db.wallet.upsert({where:{userId:tx.userId},create:{userId:tx.userId,balance:expected},update:{balance:{increment:expected}}});
      await db.transaction.update({where:{id:tx.id},data:{status:"SUCCESS",metadata:{...(tx.metadata||{}),verified:true,verifiedAt:new Date().toISOString(),verifiedBy:req.admin.email,adminNote:note||null,confirmedAmount:confirmedAmount??expected}}});
    });
    await logAdminAction(req,"WALLET_DEPOSIT_APPROVED","TRANSACTION",tx.id,tx.user?.email,{reference,amount:expected,mpesaCode:tx.metadata?.mpesaCode});
    res.json({status:"success",message:`Deposit of KSh ${expected.toLocaleString()} credited to ${tx.user?.email||"member"}.`});
  }catch(e){console.error("[ADMIN DEPOSIT VERIFY]",e);res.status(500).json({message:"Unable to verify wallet deposit"});}
});

// -------------------- SERVE NEXORA FRONTEND FROM RENDER --------------------
// The production deployment uses one Render service for both the React UI and API.
// Vite builds client/dist, and Express serves it here. SPA fallback makes /admin work.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist, { index: "index.html" }));
app.get("/{*splat}", (req,res,next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"), err => {
    if (err) next(err);
  });
});


async function ensureAnnouncementTable(){
  try{
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Announcement" ("id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "body" TEXT NOT NULL, "category" TEXT NOT NULL DEFAULT 'UPDATE', "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    const count=await prisma.announcement.count();
    if(!count){
      const seed=[
        ["Welcome to NEXORA","Explore your member workspace, Academy, analytics, referral tools and support center. Keep your account information current and use the platform responsibly.","WELCOME"],
        ["Learn before you share","Use NEXORA Academy to understand the platform and communicate membership details clearly. Avoid misleading or guaranteed-income claims.","EDUCATION"],
        ["Protect your account","Never share your password or M-Pesa PIN. NEXORA support will not ask you to disclose those credentials.","SECURITY"]
      ];
      for(const [title,body,category] of seed) await prisma.announcement.create({data:{id:crypto.randomUUID(),title,body,category,active:true}});
    }
  }catch(e){console.error("[ANNOUNCEMENTS SETUP]",e.message);}
}

async function ensurePackageSettingsColumns(){
  await prisma.$executeRawUnsafe(`ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "description" TEXT NOT NULL DEFAULT ''`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "features" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "badge" TEXT NOT NULL DEFAULT ''`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "popular" BOOLEAN NOT NULL DEFAULT false`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "withdrawalLimit" INTEGER NOT NULL DEFAULT 0`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Package" ADD COLUMN IF NOT EXISTS "tier" INTEGER NOT NULL DEFAULT 0`);
  const tiers=[["Starter",1],["Growth",2],["Pro",3],["Elite",4],["Premium",5]];
  for(const [name,tier] of tiers) await prisma.$executeRawUnsafe(`UPDATE "Package" SET "tier"=$1 WHERE "name"=$2`,tier,name);
  const defaults=[
    ["Starter","Start earning with the essentials.", ["Basic dashboard","Referral link","Basic referral statistics","Standard support"],"START",false,5000],
    ["Growth","Build your network with more tools.",["Everything in Starter","Advanced referral statistics","Marketing templates","Priority support"],"GROWTH",false,10000],
    ["Pro","A strong all-round package for serious users.",["Everything in Growth","Advanced analytics","Social-media marketing resources","Pro member badge","Higher withdrawal limit"],"MOST POPULAR",true,20000],
    ["Elite","Advanced tools for professional promoters.",["Everything in Pro","Team statistics","Premium marketing resources","Elite member badge","Priority withdrawal review","Early access to selected features"],"ELITE",false,50000],
    ["Premium","The complete NEXORA member experience.",["Everything in Elite","VIP support","Maximum available limits","Premium badge","VIP marketing resources","Early access to new features"],"VIP",false,100000]
  ];
  for(const [name,description,features,badge,popular,limit] of defaults){
    await prisma.$executeRawUnsafe(`UPDATE "Package" SET "description"=$1,"features"=$2,"badge"=$3,"popular"=$4,"withdrawalLimit"=$5 WHERE "name"=$6 AND ("description" = '' OR cardinality("features") = 0)`,description,features,badge,popular,limit,name);
  }
}

async function ensureAdminActivityTable(){
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "AdminActivityLog" ("id" TEXT PRIMARY KEY,"adminId" TEXT NOT NULL,"adminEmail" TEXT NOT NULL,"action" TEXT NOT NULL,"targetType" TEXT,"targetId" TEXT,"targetEmail" TEXT,"details" JSONB,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminActivityLog_createdAt_idx" ON "AdminActivityLog"("createdAt")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminActivityLog_targetEmail_idx" ON "AdminActivityLog"("targetEmail")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminActivityLog_action_idx" ON "AdminActivityLog"("action")`);
}


async function ensureSupportTicketTable(){
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "SupportTicket" ("id" TEXT PRIMARY KEY,"userId" TEXT NOT NULL,"subject" TEXT NOT NULL,"message" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'OPEN',"response" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportTicket_userId_createdAt_idx" ON "SupportTicket"("userId","createdAt")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket"("status")`);
}

async function ensureResetTokenColumns(){
  try{
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "User_resetToken_idx" ON "User"("resetToken")`);
  }catch(e){console.error("[RESET TOKEN COLUMNS]",e.message);}
}

async function startServer(){
  try{
    await ensurePackageSettingsColumns();
    await ensureAnnouncementTable();
    await ensureAdminActivityTable();
    await ensureSupportTicketTable();
    await ensureResetTokenColumns();
    await ensureAdmin();
  }catch(e){
    console.error("[ADMIN] Could not initialize admin account:",e);
  }
  app.listen(PORT,()=>console.log(`NEXORA app/API running on port ${PORT}`));
}

startServer();

app.patch("/api/admin/marketplace/sellers/:id",adminAuth,async(req,res)=>{try{const u=await prisma.user.update({where:{id:req.params.id},data:{sellerVerified:Boolean(req.body?.sellerVerified)}});res.json({id:u.id,sellerVerified:u.sellerVerified});}catch(e){res.status(500).json({message:"Unable to update seller verification"});}});
