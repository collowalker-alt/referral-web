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

dotenv.config();
const prisma = new PrismaClient();
const app = express();

// FIX 1: Helmet was blocking cross-origin fetches — disable resource policy
app.use(helmet({ crossOriginResourcePolicy: false }));

// FIX 2: Allow ALL origins (including your live frontend on Render)
// Previously you only allowed localhost:5173, which caused "Failed to fetch"
app.use(cors({ 
  origin: true,
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
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

app.use(express.json({ limit: "100kb" }));
app.use("/api/auth", rateLimit({ windowMs: 15*60*1000, max: 100 }));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change-me";

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

const PHONE_RE=/^(?:07\d{8}|011\d{7}|2547\d{8}|2541\d{8})$/;
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

app.post("/api/auth/register", async (req,res)=>{
  try {
    const {name,email,phone,password,referralCode}=req.body;
    const normalizedPhone=cleanPhone(phone);
    if(!name||!email||!phone||!password) return res.status(400).json({message:"Name, email, phone and password are required"});
    if(password.length<8) return res.status(400).json({message:"Password must be at least 8 characters"});
    if(!PHONE_RE.test(normalizedPhone)) return res.status(400).json({message:"Invalid Kenyan phone number. Use 07…, 011…, 2547… or 2541…."});
    const exists=await prisma.user.findFirst({where:{OR:[{email:email.toLowerCase()},{phone:normalizedPhone}]}});
    if(exists) return res.status(409).json({message:"Email or phone is already registered"});
    let parent=null;
    if(referralCode) parent=await prisma.user.findUnique({where:{referralCode:referralCode.toUpperCase()}});
    const hash=await bcrypt.hash(password,12);
    const user=await prisma.user.create({data:{
      name,email:email.toLowerCase(),phone:normalizedPhone,passwordHash:hash,referralCode:makeCode(name),
      referredById:parent?.id,wallet:{create:{}}
    }});
    res.status(201).json({token:sign(user),user:{id:user.id,name:user.name,email:user.email,phone:user.phone,referralCode:user.referralCode}});
  } catch(e){ console.error(e); res.status(500).json({message:"Registration failed"}); }
});

app.post("/api/auth/login", async (req,res)=>{
  const {email,password}=req.body;
  const user=await prisma.user.findUnique({where:{email:(email||"").toLowerCase()}});
  if(!user || !(await bcrypt.compare(password||"",user.passwordHash))) return res.status(401).json({message:"Invalid login details"});
  if(user.status!=="ACTIVE") return res.status(403).json({message:"Account is suspended"});
  res.json({token:sign(user),user:{id:user.id,name:user.name,email:user.email,phone:user.phone,referralCode:user.referralCode}});
});

const DEFAULT_PACKAGES=[
  ["Starter",500,200,50],
  ["Growth",1000,400,150],
  ["Pro",1600,700,250],
  ["Elite",2200,900,300],
  ["Premium",4800,2000,500]
];
async function ensurePackages(){
  for(const [name,price,directCommission,level2Commission] of DEFAULT_PACKAGES){
    await prisma.package.upsert({where:{name},update:{price,directCommission,level2Commission,active:true},create:{name,price,directCommission,level2Commission,active:true}});
  }
}
app.get("/api/packages",async(req,res)=>{
  try{ await ensurePackages(); res.json(await prisma.package.findMany({where:{active:true},orderBy:{price:"asc"}})); }
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
    const level2=ids.length?await prisma.user.findMany({where:{referredById:{in:ids}},orderBy:{createdAt:"desc"},select:{id:true,name:true,email:true,createdAt:true,package:true}}):[];
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
  try {
    const {packageId,phone}=req.body;
    const normalizedPhone=cleanPhone(phone||req.user.phone);
    if(!PHONE_RE.test(normalizedPhone)) return res.status(400).json({message:"Invalid Kenyan phone number. Use 07…, 011…, 2547… or 2541…."});
    const pkg=await prisma.package.findUnique({where:{id:packageId}});
    if(!pkg||!pkg.active) return res.status(404).json({message:"Package not found"});
    if(!process.env.PAYSTACK_SECRET_KEY) return res.status(503).json({message:"Paystack is not configured"});

    const reference=`NX-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const formattedPhone=paystackPhone(normalizedPhone);
    const payload={
      email:req.user.email,
      amount:pkg.price*100,
      currency:"KES",
      mobile_money:{phone:formattedPhone,provider:"mpesa"},
      reference,
      metadata:{userId:req.user.id,packageId:pkg.id}
    };

    console.log("[PAYSTACK INIT]",JSON.stringify({
      reference,mode:paystackMode(),packageId:pkg.id,package:pkg.name,amountKES:pkg.price,
      phone:maskPhone(formattedPhone),email:maskEmail(req.user.email),startedAt:new Date().toISOString()
    }));

    const r=await fetch("https://api.paystack.co/charge",{
      method:"POST",
      headers:{"Authorization":`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    const data=await r.json().catch(()=>({status:false,message:"Paystack returned a non-JSON response"}));
    logPaystackCharge("INIT RESPONSE",{reference,httpStatus:r.status,response:data,phone:formattedPhone,email:req.user.email});

    if(!r.ok||!data.status){
      console.error("[PAYSTACK INIT ERROR]",JSON.stringify({reference,httpStatus:r.status,mode:paystackMode(),message:data.message||"Unknown Paystack error",response:data}));
      return res.status(400).json({
        message:data.message||"Unable to start M-Pesa payment",
        reference,
        paystack_http_status:r.status,
        paystack_status:data.data?.status||null,
        display_text:data.data?.display_text||""
      });
    }

    const chargeStatus=data.data?.status||"pending";
    const safePaystack={
      status:data.data?.status||null,
      display_text:data.data?.display_text||"",
      gateway_response:data.data?.gateway_response||null,
      channel:data.data?.channel||null,
      currency:data.data?.currency||"KES",
      amount:data.data?.amount??pkg.price*100,
      reference:data.data?.reference||reference,
      id:data.data?.id||null,
      message:data.message||null,
      http_status:r.status,
      mode:paystackMode()
    };

    await prisma.transaction.create({data:{
      userId:req.user.id,type:"PACKAGE_PURCHASE",amount:pkg.price,reference,status:"PENDING",
      metadata:{packageId:pkg.id,phone:normalizedPhone,paystack:safePaystack,diagnostic:{initializedAt:new Date().toISOString(),responseMs:Date.now()-startedAt}}
    }});

    if(chargeStatus==="success") await activatePaidPackage(reference);
    else if(["failed","timeout"].includes(chargeStatus)) await prisma.transaction.update({where:{reference},data:{status:"FAILED"}});

    res.json({
      reference,
      status:chargeStatus,
      display_text:data.data?.display_text||"",
      message:data.message||"",
      paystack_http_status:r.status,
      paystack_status:chargeStatus,
      gateway_response:data.data?.gateway_response||"",
      paystack_mode:paystackMode()
    });
  } catch(e){
    console.error("[PAYSTACK INIT EXCEPTION]",e);
    res.status(500).json({message:"Payment initialization failed"});
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
    const parent=await db.user.findUnique({where:{id:buyer.referredById},include:{package:true}});
    if(parent?.package){
      const c1=parent.package.directCommission;
      await db.commission.create({data:{receiverId:parent.id,sourceUserId:buyer.id,level:1,amount:c1,reference:`C1-${reference}` }});
      await db.wallet.update({where:{userId:parent.id},data:{balance:{increment:c1},totalEarned:{increment:c1}}});
    }
    if(parent?.referredById){
      const grand=await db.user.findUnique({where:{id:parent.referredById},include:{package:true}});
      if(grand?.package){
        const c2=grand.package.level2Commission;
        await db.commission.create({data:{receiverId:grand.id,sourceUserId:buyer.id,level:2,amount:c2,reference:`C2-${reference}` }});
        await db.wallet.update({where:{userId:grand.id},data:{balance:{increment:c2},totalEarned:{increment:c2}}});
      }
    }
  });
}

app.get("/api/payments/status/:reference",auth,async(req,res)=>{
  try{
    if(!process.env.PAYSTACK_SECRET_KEY) return res.status(503).json({message:"Paystack is not configured"});
    const tx=await prisma.transaction.findUnique({where:{reference:req.params.reference}});
    if(!tx || tx.userId!==req.user.id) return res.status(404).json({message:"Payment reference not found"});
    if(tx.status==="SUCCESS") return res.json({status:"success",display_text:"Payment confirmed. Your package is active."});

    const r=await fetch(`https://api.paystack.co/charge/${encodeURIComponent(req.params.reference)}`,{headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`}});
    const d=await r.json().catch(()=>({status:false,message:"Paystack returned a non-JSON response"}));
    logPaystackCharge("STATUS RESPONSE",{reference:req.params.reference,httpStatus:r.status,response:d,email:req.user.email});

    if(!r.ok || !d.status){
      console.error("[PAYSTACK STATUS ERROR]",JSON.stringify({reference:req.params.reference,httpStatus:r.status,mode:paystackMode(),message:d.message||"Unknown Paystack error",response:d}));
      return res.status(400).json({message:d.message||"Unable to check payment status",reference:req.params.reference,paystack_http_status:r.status});
    }

    const status=d.data?.status||"pending";
    const oldMeta=(tx.metadata&&typeof tx.metadata==="object")?tx.metadata:{};
    const oldPaystack=(oldMeta.paystack&&typeof oldMeta.paystack==="object")?oldMeta.paystack:{};
    await prisma.transaction.update({where:{reference:req.params.reference},data:{
      metadata:{...oldMeta,paystack:{...oldPaystack,status,display_text:d.data?.display_text||"",gateway_response:d.data?.gateway_response||null,channel:d.data?.channel||null,currency:d.data?.currency||"KES",amount:d.data?.amount??null,last_checked_at:new Date().toISOString(),http_status:r.status,mode:paystackMode()}}
    }});

    if(status==="success") await activatePaidPackage(req.params.reference);
    else if(["failed","timeout"].includes(status)) await prisma.transaction.update({where:{reference:req.params.reference},data:{status:"FAILED"}});

    res.json({
      status,
      display_text:d.data?.display_text||"",
      message:d.message||"",
      reference:req.params.reference,
      paystack_http_status:r.status,
      gateway_response:d.data?.gateway_response||"",
      paystack_mode:paystackMode()
    });
  }catch(e){console.error("[PAYMENT STATUS EXCEPTION]",e);res.status(500).json({message:"Payment status check failed"});}
});

// Kept for compatibility with older frontends. The Charge API endpoint above is the
// preferred status check for M-Pesa charges.
app.get("/api/payments/verify/:reference",auth,async(req,res)=>{
  try{
    if(!process.env.PAYSTACK_SECRET_KEY) return res.status(503).json({message:"Paystack is not configured"});
    const tx=await prisma.transaction.findUnique({where:{reference:req.params.reference}});
    if(!tx || tx.userId!==req.user.id) return res.status(404).json({message:"Payment reference not found"});
    const r=await fetch(`https://api.paystack.co/charge/${encodeURIComponent(req.params.reference)}`,{headers:{Authorization:`Bearer ${process.env.PAYSTACK_SECRET_KEY}`}});
    const d=await r.json();
    if(!r.ok || !d.status) return res.status(400).json({message:d.message||"Unable to check payment status"});
    const status=d.data?.status||"pending";
    if(status==="success") await activatePaidPackage(req.params.reference);
    else if(status==="failed") await prisma.transaction.update({where:{reference:req.params.reference},data:{status:"FAILED"}});
    res.json({status,display_text:d.data?.display_text||"",message:d.message||"Charge attempted"});
  }catch(e){res.status(500).json({message:"Verification failed"});}
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
    const [users,activeUsers,packages,transactions,pendingPayments,successfulPayments,withdrawals,pendingWithdrawals,totalEarned]=await Promise.all([
      prisma.user.count(),
      prisma.user.count({where:{status:"ACTIVE"}}),
      prisma.package.count({where:{active:true}}),
      prisma.transaction.count(),
      prisma.transaction.count({where:{status:"PENDING"}}),
      prisma.transaction.aggregate({where:{type:"PACKAGE_PURCHASE",status:"SUCCESS"},_sum:{amount:true}}),
      prisma.withdrawal.count(),
      prisma.withdrawal.count({where:{status:{in:["PENDING","PROCESSING"]}}}),
      prisma.commission.aggregate({_sum:{amount:true}})
    ]);
    res.json({users,activeUsers,packages,transactions,pendingPayments,successfulPayments:successfulPayments._sum.amount||0,withdrawals,pendingWithdrawals,totalCommissions:totalEarned._sum.amount||0,paystackMode:paystackMode()});
  }catch(e){console.error("Admin overview error:",e);res.status(500).json({message:"Unable to load admin overview"});}
});
app.get("/api/admin/users",adminAuth,async(req,res)=>{
  try{
    const q=String(req.query.q||"").trim();
    const rows=await prisma.user.findMany({where:q?{OR:[{name:{contains:q,mode:"insensitive"}},{email:{contains:q,mode:"insensitive"}},{phone:{contains:q}}]}:undefined,include:{package:true,wallet:true,referredBy:{select:{name:true,email:true}}},orderBy:{createdAt:"desc"},take:200});
    res.json(rows.map(u=>({id:u.id,name:u.name,email:u.email,phone:u.phone,status:u.status,package:u.package,wallet:u.wallet,referralCode:u.referralCode,referredBy:u.referredBy,createdAt:u.createdAt})));
  }catch(e){console.error("Admin users error:",e);res.status(500).json({message:"Unable to load users"});}
});
app.patch("/api/admin/users/:id/status",adminAuth,async(req,res)=>{
  try{const status=req.body?.status;if(!["ACTIVE","SUSPENDED"].includes(status))return res.status(400).json({message:"Invalid user status"});const u=await prisma.user.update({where:{id:req.params.id},data:{status}});res.json({message:`User ${status.toLowerCase()}`,user:{id:u.id,status:u.status}});}
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
    res.json({message:"Withdrawal status updated"});
  }catch(e){console.error("Admin withdrawal status error:",e);res.status(500).json({message:"Unable to update withdrawal"});}
});
app.get("/api/admin/packages",adminAuth,async(req,res)=>{try{res.json(await prisma.package.findMany({include:{_count:{select:{users:true}}},orderBy:{price:"asc"}}));}catch(e){res.status(500).json({message:"Unable to load packages"});}});
app.patch("/api/admin/packages/:id",adminAuth,async(req,res)=>{
  try{const price=Number(req.body?.price),directCommission=Number(req.body?.directCommission),level2Commission=Number(req.body?.level2Commission),active=Boolean(req.body?.active);if(!Number.isInteger(price)||price<0||!Number.isInteger(directCommission)||directCommission<0||!Number.isInteger(level2Commission)||level2Commission<0)return res.status(400).json({message:"Package values must be whole non-negative amounts"});const p=await prisma.package.update({where:{id:req.params.id},data:{price,directCommission,level2Commission,active}});res.json(p);}catch(e){console.error(e);res.status(500).json({message:"Unable to update package"});}
});
app.post("/api/admin/packages",adminAuth,async(req,res)=>{
  try{const name=String(req.body?.name||"").trim();const price=Number(req.body?.price),directCommission=Number(req.body?.directCommission),level2Commission=Number(req.body?.level2Commission);if(!name||!Number.isInteger(price)||price<0||!Number.isInteger(directCommission)||directCommission<0||!Number.isInteger(level2Commission)||level2Commission<0)return res.status(400).json({message:"Enter valid package values"});const p=await prisma.package.create({data:{name,price,directCommission,level2Commission,active:true}});res.status(201).json(p);}catch(e){console.error(e);res.status(500).json({message:e.code==="P2002"?"A package with that name already exists":"Unable to create package"});}
});

app.post("/api/withdrawals",auth,async(req,res)=>{
  const amount=Number(req.body.amount), phone=cleanPhone(req.body.phone||req.user.phone);
  if(!PHONE_RE.test(phone)) return res.status(400).json({message:"Invalid Kenyan phone number. Use 07…, 011…, 2547… or 2541…."});
  if(!Number.isInteger(amount)||amount<100) return res.status(400).json({message:"Minimum withdrawal is KSh 100"});
  const wallet=await prisma.wallet.findUnique({where:{userId:req.user.id}});
  if(!wallet || wallet.balance<amount) return res.status(400).json({message:"Insufficient balance"});
  const reference=`WD-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
  await prisma.$transaction([
    prisma.wallet.update({where:{userId:req.user.id},data:{balance:{decrement:amount},pendingBalance:{increment:amount}}}),
    prisma.withdrawal.create({data:{userId:req.user.id,amount,phone,reference}})
  ]);
  res.status(201).json({message:"Withdrawal request submitted",reference});
});


// Direct admin portal: works even when client/dist has not been built yet.
const ADMIN_HTML = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<title>NEXORA Admin</title>\n<style>\n*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,Arial;background:#050a12;color:#eef6ff;min-height:100vh}\n.wrap{max-width:1200px;margin:auto;padding:28px}.brand{font-weight:900;letter-spacing:.12em;color:#69b7ff;font-size:20px;margin-bottom:28px}\n.card{background:#0b1421;border:1px solid #1d344d;border-radius:18px;padding:24px;box-shadow:0 20px 60px #0008}\n.login{max-width:430px;margin:8vh auto}.login h1{margin:0 0 8px}.muted{color:#8ea5bb}.field{margin:16px 0}.field label{display:block;font-size:13px;color:#9fb2c5;margin-bottom:7px}\ninput,select,button{font:inherit}input{width:100%;padding:13px 14px;border-radius:10px;border:1px solid #29425d;background:#07101b;color:white;outline:none}\nbutton{border:0;border-radius:10px;padding:11px 15px;background:#1677ff;color:white;font-weight:800;cursor:pointer}button.secondary{background:#17283b}button.danger{background:#c83b4b}\n.err{color:#ff8e9b;margin-top:12px;min-height:20px}.hidden{display:none!important}\n.top{display:flex;justify-content:space-between;gap:15px;align-items:center;margin-bottom:22px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}\n.stat{padding:18px;border-radius:14px;background:#0b1421;border:1px solid #1d344d}.stat b{display:block;font-size:25px;margin-top:6px}\nnav{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}nav button{background:#112236}.table{overflow:auto}.table table{width:100%;border-collapse:collapse;min-width:700px}th,td{text-align:left;padding:12px;border-bottom:1px solid #1b3045;font-size:13px}th{color:#86a0b7}\n.badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#16314b}.ok{background:#12452f}.warn{background:#57431b}.bad{background:#4d2028}\n.section{margin-top:18px}.section h2{font-size:18px}.actions{display:flex;gap:7px;flex-wrap:wrap}\n@media(max-width:800px){.grid{grid-template-columns:repeat(2,1fr)}.wrap{padding:16px}}\n</style>\n</head>\n<body>\n<div id="login" class="wrap">\n <div class="brand">NEXORA ADMIN</div>\n <div class="card login">\n  <h1>Administrator Login</h1><p class="muted">Secure management portal</p>\n  <form id="loginForm">\n   <div class="field"><label>Email</label><input id="email" type="email" autocomplete="username" required></div>\n   <div class="field"><label>Password</label><input id="password" type="password" autocomplete="current-password" required></div>\n   <button style="width:100%">Sign in</button><div id="loginErr" class="err"></div>\n  </form>\n </div>\n</div>\n<div id="app" class="wrap hidden">\n <div class="top"><div><div class="brand" style="margin:0">NEXORA ADMIN</div><div id="welcome" class="muted"></div></div><button id="logout" class="secondary">Logout</button></div>\n <nav>\n  <button onclick="show(\'overview\')">Overview</button><button onclick="show(\'users\')">Users</button><button onclick="show(\'transactions\')">Transactions</button><button onclick="show(\'withdrawals\')">Withdrawals</button><button onclick="show(\'packages\')">Packages</button>\n </nav>\n <div id="content"></div>\n</div>\n<script>\nconst tokenKey="nexora_admin_token";let token=localStorage.getItem(tokenKey);let cache={};\nconst $=id=>document.getElementById(id);\nasync function api(url,opt={}){opt.headers={...(opt.headers||{}),Authorization:"Bearer "+token,"Content-Type":"application/json"};let r=await fetch(url,opt);let d=await r.json().catch(()=>({}));if(r.status===401){localStorage.removeItem(tokenKey);location.reload()}if(!r.ok)throw Error(d.message||"Request failed");return d}\nfunction esc(v){return String(v??"").replace(/[&<>"\']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",\'"\':"&quot;","\'":"&#39;"}[c]))}\nasync function boot(){if(!token)return;try{let d=await api("/api/admin/me");$("login").classList.add("hidden");$("app").classList.remove("hidden");$("welcome").textContent="Signed in as "+d.admin.name;show("overview")}catch{}}\n$("loginForm").onsubmit=async e=>{e.preventDefault();$("loginErr").textContent="Signing in…";try{let d=await fetch("/api/admin/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:$("email").value,password:$("password").value})});let x=await d.json();if(!d.ok)throw Error(x.message||"Login failed");localStorage.setItem(tokenKey,x.token);token=x.token;boot()}catch(err){$("loginErr").textContent=err.message}};\n$("logout").onclick=()=>{localStorage.removeItem(tokenKey);location.reload()};\nasync function show(page){\n let c=$("content");c.innerHTML=\'<div class="card">Loading…</div>\';\n try{\n  if(page==="overview"){let d=await api("/api/admin/overview");c.innerHTML=`<div class="grid">\n  ${stat("Users",d.users)}${stat("Active users",d.activeUsers)}${stat("Transactions",d.transactions)}${stat("Pending payments",d.pendingPayments)}\n  ${stat("Successful sales","KSh "+d.successfulPayments)}${stat("Withdrawals",d.withdrawals)}${stat("Pending withdrawals",d.pendingWithdrawals)}${stat("Paystack mode",d.paystackMode)}\n  </div><div class="card"><h2>Admin controls</h2><p class="muted">Use the navigation above to manage users, payments, withdrawals and packages.</p></div>`}\n  if(page==="users"){let rows=await api("/api/admin/users");c.innerHTML=`<div class="card"><h2>Users (${rows.length})</h2><div class="table"><table><tr><th>Name</th><th>Email</th><th>Phone</th><th>Package</th><th>Wallet</th><th>Status</th><th>Action</th></tr>${rows.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.phone)}</td><td>${esc(u.package?.name||"—")}</td><td>KSh ${u.wallet?.balance??0}</td><td><span class="badge ${u.status==="ACTIVE"?"ok":"bad"}">${u.status}</span></td><td><button class="${u.status==="ACTIVE"?"danger":"secondary"}" onclick="toggleUser(\'${u.id}\',\'${u.status==="ACTIVE"?"SUSPENDED":"ACTIVE"}\')">${u.status==="ACTIVE"?"Suspend":"Activate"}</button></td></tr>`).join("")}</table></div></div>`}\n  if(page==="transactions"){let rows=await api("/api/admin/transactions");c.innerHTML=`<div class="card"><h2>Transactions (${rows.length})</h2><div class="table"><table><tr><th>Date</th><th>User</th><th>Type</th><th>Amount</th><th>Status</th><th>Reference</th></tr>${rows.map(x=>`<tr><td>${new Date(x.createdAt).toLocaleString()}</td><td>${esc(x.user?.name)}<br><span class="muted">${esc(x.user?.email)}</span></td><td>${esc(x.type)}</td><td>KSh ${x.amount}</td><td>${esc(x.status)}</td><td>${esc(x.reference)}</td></tr>`).join("")}</table></div></div>`}\n  if(page==="withdrawals"){let rows=await api("/api/admin/withdrawals");c.innerHTML=`<div class="card"><h2>Withdrawals (${rows.length})</h2><div class="table"><table><tr><th>Date</th><th>User</th><th>Phone</th><th>Amount</th><th>Status</th><th>Actions</th></tr>${rows.map(x=>`<tr><td>${new Date(x.createdAt).toLocaleString()}</td><td>${esc(x.user?.name)}</td><td>${esc(x.phone)}</td><td>KSh ${x.amount}</td><td>${esc(x.status)}</td><td><div class="actions"><button onclick="wd(\'${x.id}\',\'PROCESSING\')">Processing</button><button onclick="wd(\'${x.id}\',\'PAID\')">Paid</button><button class="danger" onclick="wd(\'${x.id}\',\'FAILED\')">Failed</button></div></td></tr>`).join("")}</table></div></div>`}\n  if(page==="packages"){let rows=await api("/api/admin/packages");c.innerHTML=`<div class="card"><h2>Packages</h2><div class="table"><table><tr><th>Name</th><th>Price</th><th>Direct</th><th>Level 2</th><th>Active</th><th>Save</th></tr>${rows.map(x=>`<tr><td>${esc(x.name)}</td><td><input id="p-${x.id}" value="${x.price}" style="width:100px"></td><td><input id="d-${x.id}" value="${x.directCommission}" style="width:100px"></td><td><input id="l-${x.id}" value="${x.level2Commission}" style="width:100px"></td><td><input id="a-${x.id}" type="checkbox" ${x.active?"checked":""}></td><td><button onclick="savePkg(\'${x.id}\')">Save</button></td></tr>`).join("")}</table></div></div>`}\n }catch(e){c.innerHTML=\'<div class="card"><div class="err">\'+esc(e.message)+\'</div></div>\'}\n}\nfunction stat(a,b){return `<div class="stat"><span class="muted">${a}</span><b>${esc(b)}</b></div>`}\nasync function toggleUser(id,status){await api("/api/admin/users/"+id+"/status",{method:"PATCH",body:JSON.stringify({status})});show("users")}\nasync function wd(id,status){if(!confirm("Set withdrawal to "+status+"?"))return;await api("/api/admin/withdrawals/"+id+"/status",{method:"PATCH",body:JSON.stringify({status})});show("withdrawals")}\nasync function savePkg(id){await api("/api/admin/packages/"+id,{method:"PATCH",body:JSON.stringify({price:Number($("p-"+id).value),directCommission:Number($("d-"+id).value),level2Commission:Number($("l-"+id).value),active:$("a-"+id).checked})});show("packages")}\nboot();\n</script>\n</body></html>';
app.get("/admin", (req,res) => res.type("html").send(ADMIN_HTML));
app.get("/admin/", (req,res) => res.type("html").send(ADMIN_HTML));
app.get("/admin.html", (req,res) => res.type("html").send(ADMIN_HTML));

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


app.listen(PORT,()=>console.log(`NEXORA app/API running on port ${PORT}`));
