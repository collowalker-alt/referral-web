import dotenv from "dotenv"; dotenv.config();
import {PrismaClient} from "@prisma/client";
const p=new PrismaClient();
const packages=[
["Starter",500,200,50],["Growth",1000,400,150],["Pro",1600,700,250],["Elite",2200,900,300],["Premium",4800,2000,500]
];
for(const [name,price,directCommission,level2Commission] of packages)
 await p.package.upsert({where:{name},update:{price,directCommission,level2Commission,active:true},create:{name,price,directCommission,level2Commission}});

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
