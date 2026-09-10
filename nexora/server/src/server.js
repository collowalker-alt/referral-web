import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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

app.post("/api/payments/initialize",auth,async(req,res)=>{
  try {
    const {packageId,phone}=req.body;
    const normalizedPhone=cleanPhone(phone||req.user.phone);
    if(!PHONE_RE.test(normalizedPhone)) return res.status(400).json({message:"Invalid Kenyan phone number. Use 07…, 011…, 2547… or 2541…."});
    const pkg=await prisma.package.findUnique({where:{id:packageId}});
    if(!pkg||!pkg.active) return res.status(404).json({message:"Package not found"});
    if(!process.env.PAYSTACK_SECRET_KEY) return res.status(503).json({message:"Paystack is not configured"});
    const reference=`NX-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const r=await fetch("https://api.paystack.co/charge",{
      method:"POST",
      headers:{"Authorization":`Bearer ${process.env.PAYSTACK_SECRET_KEY}`,"Content-Type":"application/json"},
      body:JSON.stringify({email:req.user.email,amount:pkg.price*100,currency:"KES",mobile_money:{phone:paystackPhone(normalizedPhone),provider:"mpesa"},reference,metadata:{userId:req.user.id,packageId:pkg.id}})
    });
    const data=await r.json();
    if(!r.ok||!data.status) return res.status(400).json({message:data.message||"Unable to start M-Pesa payment"});
    await prisma.transaction.create({data:{userId:req.user.id,type:"PACKAGE_PURCHASE",amount:pkg.price,reference,status:"PENDING",metadata:{packageId:pkg.id,phone:normalizedPhone,paystack:data.data}}});
    const status=data.data?.status||"pending";
    if(status==="success") await activatePaidPackage(reference);
    else if(status==="failed") await prisma.transaction.update({where:{reference},data:{status:"FAILED"}});
    res.json({reference,status,display_text:data.data?.display_text||"",message:data.message||"Charge attempted"});
  } catch(e){console.error(e);res.status(500).json({message:"Payment initialization failed"});}
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
    const d=await r.json();
    if(!r.ok || !d.status) return res.status(400).json({message:d.message||"Unable to check payment status"});
    const status=d.data?.status||"pending";
    if(status==="success") await activatePaidPackage(req.params.reference);
    else if(status==="failed") await prisma.transaction.update({where:{reference:req.params.reference},data:{status:"FAILED"}});
    res.json({status,display_text:d.data?.display_text||"",message:d.message||"Charge attempted"});
  }catch(e){console.error("PAYMENT STATUS ERROR:",e);res.status(500).json({message:"Payment status check failed"});}
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

app.listen(PORT,()=>console.log(`NEXORA API running on http://localhost:${PORT}`));
