import dotenv from "dotenv"; dotenv.config();
import {PrismaClient} from "@prisma/client";
const p=new PrismaClient();
const packages=[
["Starter",500,200,50],["Growth",1000,400,150],["Pro",1600,700,250],["Elite",2200,900,300],["Premium",4800,2000,500]
];
for(const [name,price,directCommission,level2Commission] of packages)
 await p.package.upsert({where:{name},update:{price,directCommission,level2Commission,active:true},create:{name,price,directCommission,level2Commission}});
console.log("Packages seeded"); await p.$disconnect();
