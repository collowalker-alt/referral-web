import dotenv from "dotenv"; dotenv.config();
import {PrismaClient} from "@prisma/client";
const p=new PrismaClient();
const packages=[
  ["Starter",1,500,200,50,"Start building your network with up to two commission-earning referral levels.",["Basic dashboard and personal referral link","Referral commissions on up to 2 levels (Level 1 direct + Level 2 indirect)","Basic referral statistics","Marketplace access to shop and list products","NEXORA Academy learning access","Standard support","Withdraw up to KSh 5,000 per request"],"START",false,5000],
  ["Growth",2,1000,400,150,"Expand your network with up to four commission-earning referral levels and stronger marketing tools.",["Everything in Starter","Referral commissions on up to 4 levels (Level 1 + Levels 2–4)","Advanced referral statistics","Ready-to-use marketing templates","Marketplace selling tools and business-learning resources","Priority support","Withdraw up to KSh 10,000 per request"],"GROWTH",false,10000],
  ["Pro",3,1600,700,250,"Grow a wider network with up to six commission-earning referral levels and advanced performance tools.",["Everything in Growth","Referral commissions on up to 6 levels (Level 1 + Levels 2–6)","Advanced analytics and social-media marketing resources","Pro member badge","Eligibility for selected partner opportunities when available","Withdraw up to KSh 20,000 per request"],"MOST POPULAR",true,20000],
  ["Elite",4,2200,900,300,"Build and manage a deeper network with up to eight commission-earning referral levels.",["Everything in Pro","Referral commissions on up to 8 levels (Level 1 + Levels 2–8)","Team statistics and advanced marketing resources","Elite member badge","Priority withdrawal review","Early access to selected features","Eligibility for selected partner opportunities when available","Withdraw up to KSh 50,000 per request"],"ELITE",false,50000],
  ["Premium",5,4800,2000,500,"The complete NEXORA membership with unlimited referral depth and access to approved advertising campaigns.",["Everything in Elite","Unlimited referral levels: Level 1 at the direct rate; every eligible Level 2+ at the standard Level 2 rate","Access to approved Products & Advertising campaigns, subject to campaign availability and review","Weekly Friday advertising payout processing for approved campaigns","VIP support and VIP marketing resources","Premium badge and maximum available withdrawal limits","Eligibility for selected partner, reseller and lead-generation programmes when active","Withdraw up to KSh 100,000 per request"],"VIP",false,100000]
];
for(const [name,tier,price,directCommission,level2Commission,description,features,badge,popular,withdrawalLimit] of packages)
 await p.package.upsert({where:{name},update:{tier,price,directCommission,level2Commission,description,features,badge,popular,withdrawalLimit},create:{name,tier,price,directCommission,level2Commission,description,features,badge,popular,withdrawalLimit}});

const adminEmail=String(process.env.ADMIN_EMAIL||"").trim().toLowerCase();
const adminPassword=String(process.env.ADMIN_PASSWORD||"");
const adminName=String(process.env.ADMIN_NAME||"NEXORA Administrator").trim()||"NEXORA Administrator";
if(adminEmail && adminPassword){
  if(adminPassword.length<10) throw new Error("ADMIN_PASSWORD must be at least 10 characters");
  const bcrypt=(await import("bcryptjs")).default;
  const passwordHash=await bcrypt.hash(adminPassword,12);
  await p.admin.upsert({
    where:{email:adminEmail},
    update:{name:adminName,passwordHash,status:"ACTIVE"},
    create:{name:adminName,email:adminEmail,passwordHash,status:"ACTIVE"}
  });
  console.log(`Admin account seeded: ${adminEmail}`);
}else{
  console.log("Packages seeded. Admin account not changed because ADMIN_EMAIL/ADMIN_PASSWORD are not set.");
}
await p.$disconnect();
