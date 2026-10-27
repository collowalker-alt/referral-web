import React,{useEffect,useState,useRef} from "react";
function showNexoraWithdrawalConfirm(message){return new Promise(resolve=>{const overlay=document.createElement("div");overlay.className="nx-withdraw-confirm-overlay";const modal=document.createElement("section");modal.className="nx-withdraw-confirm-modal";modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");modal.setAttribute("aria-labelledby","nx-withdraw-confirm-title");const parts=message.split(String.fromCharCode(10));const title=parts.shift()||"Confirm withdrawal";const body=parts.join(String.fromCharCode(10));const esc=s=>String(s).replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));modal.innerHTML='<div class="nx-withdraw-confirm-icon" aria-hidden="true">↗</div><h2 id="nx-withdraw-confirm-title">'+esc(title)+'</h2><div class="nx-withdraw-confirm-details">'+esc(body)+'</div><div class="nx-withdraw-confirm-actions"><button type="button" class="nx-withdraw-cancel">Cancel</button><button type="button" class="nx-withdraw-approve">Confirm withdrawal</button></div>';const finish=value=>{overlay.remove();document.removeEventListener("keydown",onKey);resolve(value)};const onKey=e=>{if(e.key==="Escape")finish(false)};modal.querySelector(".nx-withdraw-cancel").addEventListener("click",()=>finish(false));modal.querySelector(".nx-withdraw-approve").addEventListener("click",()=>finish(true));overlay.addEventListener("click",e=>{if(e.target===overlay)finish(false)});overlay.appendChild(modal);document.body.appendChild(overlay);document.addEventListener("keydown",onKey);modal.querySelector(".nx-withdraw-cancel").focus();})}
import {createRoot} from "react-dom/client";
import {createPortal} from "react-dom";
import {App as CapacitorApp} from "@capacitor/app";
import {Capacitor} from "@capacitor/core";
import {NativeBiometric} from "@capgo/capacitor-native-biometric";
import {SplashScreen} from "@capacitor/splash-screen";
import {LayoutDashboard,Users,WalletCards,Package as PackageIcon,LogOut,Copy,ArrowUpRight,ArrowDownLeft,Menu,X,ShieldCheck,RefreshCw,History,CheckCircle2,MessageCircle,BookOpen,ExternalLink,UsersRound,ReceiptText,HandCoins,Settings2,Search,LockKeyhole,LogIn,Ban,UserCheck,Clock3,Check,ChevronDown,ChevronLeft,ChevronRight,BarChart3, UserRound, Wrench, Activity, Download, Eye, EyeOff, CreditCard, AlertTriangle, Info, FileSpreadsheet, Trophy, Megaphone, Share2, QrCode, Bell, LifeBuoy, GraduationCap, Shield, UserCog, KeyRound, Send, Target, TrendingUp, Medal, Crown, Sparkles, CheckCheck, BarChart2, Users2, CopyCheck, Store, Link2, CalendarCheck2, ShoppingCart, MapPin, Plus, Trash2, PackageCheck, Truck, Heart, Filter, Edit3, Upload, FileImage, Video, ClipboardCopy, Star,Bot,Mic,Volume2,VolumeX,SendHorizontal,ShoppingBag,MapPinned,ArrowRight,LoaderCircle,MessageSquareText,WalletMinimal,PackageSearch,BadgeCheck,Mail,Wifi,Smartphone,PhoneCall,Zap} from "lucide-react";
import "./styles.css";
const BIOMETRIC_SERVER="https://nexora-referral.onrender.com";
const API=(import.meta.env.VITE_API_URL||"https://nexora-api-shxf.onrender.com/api").replace(/\/$/,"");
const CURRENCY_BY_COUNTRY={KE:{code:"KES",symbol:"KSh",name:"Kenyan Shilling",digits:0},GH:{code:"GHS",symbol:"GH₵",name:"Ghanaian Cedi",digits:2},CI:{code:"XOF",symbol:"CFA",name:"West African CFA Franc",digits:0},NG:{code:"NGN",symbol:"₦",name:"Nigerian Naira",digits:0},ZA:{code:"ZAR",symbol:"R",name:"South African Rand",digits:2},EG:{code:"EGP",symbol:"E£",name:"Egyptian Pound",digits:2},RW:{code:"RWF",symbol:"FRw",name:"Rwandan Franc",digits:0},TZ:{code:"TZS",symbol:"TSh",name:"Tanzanian Shilling",digits:0},UG:{code:"UGX",symbol:"USh",name:"Ugandan Shilling",digits:0},ZM:{code:"ZMW",symbol:"ZK",name:"Zambian Kwacha",digits:2},BW:{code:"BWP",symbol:"P",name:"Botswana Pula",digits:2},MZ:{code:"MZN",symbol:"MT",name:"Mozambican Metical",digits:2},ZW:{code:"ZWG",symbol:"ZiG",name:"Zimbabwe Gold",digits:2},SN:{code:"XOF",symbol:"CFA",name:"West African CFA Franc",digits:0},CM:{code:"XAF",symbol:"FCFA",name:"Central African CFA Franc",digits:0},ET:{code:"ETB",symbol:"Br",name:"Ethiopian Birr",digits:2},MA:{code:"MAD",symbol:"MAD",name:"Moroccan Dirham",digits:2},TN:{code:"TND",symbol:"د.ت",name:"Tunisian Dinar",digits:3},MU:{code:"MUR",symbol:"Rs",name:"Mauritian Rupee",digits:2}};
const FALLBACK_KES_RATES={KES:1,GHS:0.085, XOF:7.15, NGN:12.1, ZAR:0.125, EGP:0.39, RWF:9.8, TZS:20.3222, UGX:28.6, ZMW:0.205, BWP:0.105, MZN:0.49, ZWG:0.19, XAF:7.15, ETB:1.12, MAD:0.077, TND:0.023, MUR:0.36};
const currencyState=()=>window.__NEXORA_CURRENCY__||{countryCode:"KE",currency:CURRENCY_BY_COUNTRY.KE,rate:1,rates:FALLBACK_KES_RATES};
const money=n=>{const st=currencyState();const amount=Number(n||0)*Number(st.rate||1);const c=st.currency||CURRENCY_BY_COUNTRY.KE;const digits=Number.isFinite(c.digits)?c.digits:2;return `${c.symbol} ${amount.toLocaleString(undefined,{minimumFractionDigits:digits,maximumFractionDigits:digits})}`};
const formatMemberSince=value=>{if(!value)return "Date unavailable";const date=new Date(value);return Number.isFinite(date.getTime())?date.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}):"Date unavailable"};
const moneyBaseNote=n=>{const st=currencyState();if(st.countryCode==="KE")return "";return `Base KES ${Number(n||0).toLocaleString()}`};
// Withdrawal input means total KSh removed from the wallet. NEXORA's 5% fee
// and Paystack's published M-PESA B2C fee are deducted before calculating net payout.
const WITHDRAWAL_FEE_RATE=0.05;
const withdrawalFee=amount=>Math.max(1,Math.ceil(Math.max(0,Number(amount)||0)*WITHDRAWAL_FEE_RATE-1e-9));
const paystackMpesaTransferFee=payout=>{const n=Math.max(0,Math.round(Number(payout)||0));if(n<=1500)return 20;if(n<=20000)return 40;return 60;};
const withdrawalBreakdown=amount=>{const totalDebit=Math.round(Math.max(0,Number(amount)||0));const fee=withdrawalFee(totalDebit);const candidates=[20,40,60].map(paystackFee=>({requestedAmount:totalDebit,totalDebit,fee,paystackFee,payoutAmount:Math.max(0,totalDebit-fee-paystackFee)}));const exact=candidates.find(c=>c.payoutAmount>=10&&paystackMpesaTransferFee(c.payoutAmount)===c.paystackFee);return exact?{...exact,valid:true}:{requestedAmount:totalDebit,totalDebit,fee,paystackFee:null,payoutAmount:null,valid:false};};
const withdrawalTotalDebit=amount=>Math.round(Math.max(0,Number(amount)||0));
const localToBase=n=>{const st=currencyState();const r=Number(st.rate||1);return r>0?Number(n||0)/r:Number(n||0)};
const waShare=(text)=>{const url=`https://wa.me/?text=${encodeURIComponent(text)}`;window.open(url,"_blank","noopener,noreferrer");};
const checklistKey=id=>`nexora-checklist-${id}`;

// The workspace cache is scoped to the last signed-in member so offline data
// is not accidentally displayed to another account on a shared device.
const cachedWorkspaceUserId=()=>{
  try{
    const cached=JSON.parse(localStorage.getItem("nexora-cached-me")||"null");
    return String(cached?.user?.id||"");
  }catch{return ""}
};
const readCachedMemberData=(key,fallback)=>{
  try{
    const entry=JSON.parse(localStorage.getItem(`nexora-offline-${key}`)||"null");
    const userId=cachedWorkspaceUserId();
    return userId && entry?.userId===userId ? entry.data : fallback;
  }catch{return fallback}
};
const saveCachedMemberData=(key,value,userId)=>{
  try{
    if(userId!==undefined&&userId!==null&&String(userId)){
      localStorage.setItem(`nexora-offline-${key}`,JSON.stringify({userId:String(userId),data:value,updatedAt:Date.now()}));
    }
  }catch{}
};
const clearCachedMemberData=()=>{
  try{
    ["packages","referrals","earnings","transactions","analytics","leaderboard","announcements","tickets","notifications"].forEach(key=>localStorage.removeItem(`nexora-offline-${key}`));
  }catch{}
};

const PHONE_RE=/^(?:0[17]\d{8}|254[17]\d{8})$/;
const AFRICAN_COUNTRIES=[{code:"KE",name:"🇰🇪 Kenya",dial:"254",payment:"COOP_PAYBILL"},{code:"GH",name:"🇬🇭 Ghana",dial:"233",payment:"COMING_SOON"},{code:"CI",name:"🇨🇮 Côte d’Ivoire",dial:"225",payment:"COMING_SOON"},{code:"NG",name:"🇳🇬 Nigeria",dial:"234",payment:"COMING_SOON"},{code:"ZA",name:"🇿🇦 South Africa",dial:"27",payment:"COMING_SOON"},{code:"EG",name:"🇪🇬 Egypt",dial:"20",payment:"COMING_SOON"},{code:"RW",name:"🇷🇼 Rwanda",dial:"250",payment:"COMING_SOON"},{code:"TZ",name:"🇹🇿 Tanzania",dial:"255",payment:"COMING_SOON"},{code:"UG",name:"🇺🇬 Uganda",dial:"256",payment:"COMING_SOON"},{code:"ZM",name:"🇿🇲 Zambia",dial:"260",payment:"COMING_SOON"},{code:"BW",name:"🇧🇼 Botswana",dial:"267",payment:"COMING_SOON"},{code:"MZ",name:"🇲🇿 Mozambique",dial:"258",payment:"COMING_SOON"},{code:"ZW",name:"🇿🇼 Zimbabwe",dial:"263",payment:"COMING_SOON"},{code:"SN",name:"🇸🇳 Senegal",dial:"221",payment:"COMING_SOON"},{code:"CM",name:"🇨🇲 Cameroon",dial:"237",payment:"COMING_SOON"},{code:"ET",name:"🇪🇹 Ethiopia",dial:"251",payment:"COMING_SOON"},{code:"MA",name:"🇲🇦 Morocco",dial:"212",payment:"COMING_SOON"},{code:"TN",name:"🇹🇳 Tunisia",dial:"216",payment:"COMING_SOON"},{code:"MU",name:"🇲🇺 Mauritius",dial:"230",payment:"COMING_SOON"}];
const COUNTRY_BY_CODE=Object.fromEntries(AFRICAN_COUNTRIES.map(c=>[c.code,c]));
const detectCountryFromPhoneClient=v=>{let n=String(v||"").replace(/[^0-9+]/g,"").replace(/^00/,'+').replace(/^\+/,'');if(n.startsWith('0'))return COUNTRY_BY_CODE.KE;return AFRICAN_COUNTRIES.slice().sort((a,b)=>b.dial.length-a.dial.length).find(c=>n.startsWith(c.dial))||null;};
const cleanPhone=v=>String(v||"").trim().replace(/[\s().-]/g,"").replace(/^\+/,"");
const nationalDigits=v=>String(v||"").replace(/\D/g,"").replace(/^0+/,"");
const buildInternationalPhone=(countryCode,national)=>{
  const country=COUNTRY_BY_CODE[countryCode]||COUNTRY_BY_CODE.KE;
  let digits=nationalDigits(national);
  // The UI asks for the national number without a leading zero, but tolerate one
  // pasted by the user so registration remains forgiving.
  if(countryCode==="KE") digits=digits.replace(/^0+/,"");
  else if(digits.startsWith(country.dial)) digits=digits.slice(country.dial.length);
  return `${country.dial}${digits}`;
};
const validPhone=v=>PHONE_RE.test(cleanPhone(v));
async function api(path,opts={}){const token=localStorage.getItem("token");const r=await fetch(API+path,{...opts,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||"Request failed");return d}


const markCopied=(btn,ms=2200)=>{
  if(!btn)return;
  btn.classList.add("is-copied");try{nxHaptic(12)}catch{};
  const prev=btn.innerHTML;
  btn.dataset.prevHtml=prev;
  btn.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="nx-tick"><polyline points="20 6 9 17 4 12"/></svg> Copied';
  clearTimeout(btn._copyT);
  btn._copyT=setTimeout(()=>{btn.classList.remove("is-copied");if(btn.dataset.prevHtml)btn.innerHTML=btn.dataset.prevHtml},ms);
};
const copyTextRobust=async(text)=>{
  const value=String(text||"");
  try{
    if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);return true;}
  }catch{}
  try{
    const ta=document.createElement("textarea");
    ta.value=value;ta.setAttribute("readonly","");ta.style.position="fixed";ta.style.opacity="0";ta.style.pointerEvents="none";
    document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,value.length);
    const ok=document.execCommand("copy");ta.remove();if(ok)return true;
  }catch{}
  return false;
};
const copyWithFeedback=async(text,btn)=>{
  const ok=await copyTextRobust(text);
  if(ok)markCopied(btn);
  else try{window.prompt("Copy:",String(text||""));}catch{}
  return ok;
};

const nxHaptic=(ms=12)=>{try{if(navigator.vibrate)navigator.vibrate(ms)}catch{}};
const compressImageFile=(file,maxW=1200,quality=0.72)=>new Promise((resolve,reject)=>{
  if(!file||!String(file.type||"").startsWith("image/")){resolve(file);return;}
  const img=new Image();
  const url=URL.createObjectURL(file);
  img.onload=()=>{
    try{
      const scale=Math.min(1,maxW/Math.max(img.width,1));
      const w=Math.max(1,Math.round(img.width*scale));
      const h=Math.max(1,Math.round(img.height*scale));
      const canvas=document.createElement("canvas");
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext("2d");
      ctx.drawImage(img,0,0,w,h);
      canvas.toBlob((blob)=>{
        URL.revokeObjectURL(url);
        if(!blob){resolve(file);return;}
        resolve(new File([blob],file.name.replace(/\.\w+$/,".jpg"),{type:"image/jpeg"}));
      },"image/jpeg",quality);
    }catch(e){URL.revokeObjectURL(url);resolve(file);}
  };
  img.onerror=()=>{URL.revokeObjectURL(url);resolve(file)};
  img.src=url;
});
const fileToDataUrl=(file)=>new Promise((resolve,reject)=>{
  const r=new FileReader();r.onload=()=>resolve(String(r.result||""));r.onerror=reject;r.readAsDataURL(file);
});


function usePullToRefresh(onRefresh){
  const ref=React.useRef(null);
  React.useEffect(()=>{
    const el=ref.current;if(!el||typeof onRefresh!=="function")return;
    let startY=0,pulling=false;
    const onStart=e=>{if(window.scrollY<=0)startY=e.touches?.[0]?.clientY||0};
    const onMove=e=>{
      if(startY<=0)return;
      const y=e.touches?.[0]?.clientY||0;
      const dy=y-startY;
      if(dy>40&&window.scrollY<=0){pulling=true;el.classList.add("pulling")}
    };
    const onEnd=async()=>{
      if(!pulling){el.classList.remove("pulling");startY=0;return;}
      pulling=false;el.classList.remove("pulling");el.classList.add("refreshing");
      try{nxHaptic(10);await onRefresh()}catch{}
      el.classList.remove("refreshing");startY=0;
    };
    el.addEventListener("touchstart",onStart,{passive:true});
    el.addEventListener("touchmove",onMove,{passive:true});
    el.addEventListener("touchend",onEnd,{passive:true});
    return()=>{el.removeEventListener("touchstart",onStart);el.removeEventListener("touchmove",onMove);el.removeEventListener("touchend",onEnd)};
  },[onRefresh]);
  return ref;
}
function NexoraSplash({label="Loading your workspace…"}){
 const [showRefresh,setShowRefresh]=useState(false);
 const [refreshing,setRefreshing]=useState(false);
 useEffect(()=>{const timer=setTimeout(()=>setShowRefresh(true),6000);return()=>clearTimeout(timer)},[]);
 const refresh=()=>{if(refreshing)return;setRefreshing(true);setTimeout(()=>window.location.reload(),120);};
 return <div className="nexorasplash" role="status" aria-label="Loading NEXORA">
  <div className="splashorb splashorb1"/><div className="splashorb splashorb2"/><div className="splashring splashring1"/><div className="splashring splashring2"/>
  <div className="splashlogo"><span className="splashlogoLayer layerBack"><img src="/nexora-logo.png" alt=""/></span><span className="splashlogoLayer layerMid"><img src="/nexora-logo.png" alt=""/></span><span className="splashlogoLayer layerMain"><img src="/nexora-logo.png" alt="NEXORA"/></span><i className="splashshine"/></div>
  <div className="splashscan"/><div className="splashdots"><i/><i/><i/><i/><i/><i/></div><div className="splashbrand">NEXORA<span>.</span></div><div className="splashlabel">{label}</div>
  <div className={`splashrefresh ${showRefresh?"visible":""}`} aria-live="polite">
   <span>{showRefresh?"Taking longer than expected?":""}</span>
   {showRefresh&&<button type="button" className="splashrefreshbtn" onClick={refresh} disabled={refreshing} aria-label="Refresh NEXORA">
    <RefreshCw size={15} className={refreshing?"spin":""}/>{refreshing?"Refreshing…":"Refresh NEXORA"}
   </button>}
  </div>
 </div>
}

function PWAInstall({compact=false}){
 const [installed,setInstalled]=useState(false);
 const [showHelp,setShowHelp]=useState(false);
 const [platform,setPlatform]=useState("android");

 useEffect(()=>{
  try{
   const standalone=window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone===true;
   setInstalled(!!standalone);
   const ua=navigator.userAgent||"";
   setPlatform(/iPad|iPhone|iPod/.test(ua)&&!window.MSStream?"ios":"android");
   // Keep the browser from auto-triggering its PWA prompt: Android selection
   // below intentionally downloads the official NEXORA APK instead.
   const onBefore=e=>{e.preventDefault();};
   const onInstalled=()=>{setInstalled(true);setShowHelp(false)};
   window.addEventListener("beforeinstallprompt",onBefore);
   window.addEventListener("appinstalled",onInstalled);
   return()=>{window.removeEventListener("beforeinstallprompt",onBefore);window.removeEventListener("appinstalled",onInstalled)};
  }catch(e){console.warn("PWA setup",e)}
 },[]);
 if(installed) return null;

 const openInstaller=(e)=>{
  e?.preventDefault?.();
  e?.stopPropagation?.();
  setShowHelp(true);
 };
 const androidInstall=(e)=>{
  e?.preventDefault?.();
  e?.stopPropagation?.();
  setPlatform("android");
  try{
   const link=document.createElement("a");
   link.href="/downloads/nexora-android.apk";
   link.download="NEXORA.apk";
   link.style.display="none";
   document.body.appendChild(link);
   link.click();
   link.remove();
  }catch(err){
   window.location.href="/downloads/nexora-android.apk";
  }
  setShowHelp(false);
 };
 const iosHelp=(e)=>{e?.preventDefault?.();setPlatform("ios");setShowHelp(true)};

 const modal=(
  <div className="modalbackdrop installbackdrop" role="dialog" aria-modal="true" aria-label="Install NEXORA" onClick={()=>setShowHelp(false)}>
   <div className="modal pwahelp moderninstall" onClick={e=>e.stopPropagation()}>
    <div className="modalhead installhead">
     <div>
      <span className="pill">NEXORA APP</span>
      <h2>Get NEXORA on your device</h2>
      <p>Choose your device. Android downloads the APK; iPhone and iPad can install NEXORA from Safari using Add to Home Screen.</p>
     </div>
     <button type="button" className="iconbtn" onClick={()=>setShowHelp(false)} aria-label="Close"><X size={20}/></button>
    </div>
    <div className="pwahelpbody installbody">
     <div className={`installcard ${platform==="android"?"selected":""}`}>
      <div className="installicon androidicon">A</div>
      <div className="installcopy"><b>Android</b><span>Download the official NEXORA Android APK and install it on your phone.</span></div>
      <button type="button" className="primary installaction" onClick={androidInstall}><Download size={16}/>Download APK</button>
     </div>
     <div className={`installcard ${platform==="ios"?"selected":""}`}>
      <div className="installicon iosicon">iOS</div>
      <div className="installcopy"><b>iPhone / iPad</b><span>Install NEXORA on your Home Screen from Safari. No App Store download is available yet.</span></div>
      <button type="button" className="secondary installaction" onClick={iosHelp}><Download size={16}/>Install on iPhone</button>
     </div>
     <div className="installnote"><ShieldCheck size={17}/><span>Android downloads the official NEXORA APK from this website. After the download finishes, open NEXORA.apk and confirm installation when Android asks.</span></div>
     <div className="installsteps">
      <b>{platform==="ios"?"iPhone / iPad":"Android"}</b>
      {platform==="ios"
        ? <span>Open this site in <strong>Safari</strong> → tap <strong>Share</strong> → choose <strong>Add to Home Screen</strong> → tap <strong>Add</strong>. NEXORA will appear as an app icon. This is the web-app install route; a native iOS download is not ready yet.</span>
        : <span>Tap <strong>Download APK</strong>, open the downloaded <strong>NEXORA.apk</strong>, then tap <strong>Install</strong>. If prompted, allow your browser to install apps for this download.</span>}
     </div>
    </div>
    <div className="modalfoot"><button type="button" className="secondary" onClick={()=>setShowHelp(false)}>Close</button></div>
   </div>
  </div>
 );

 let portalNode=null;
 if(showHelp){
  try{
   if(typeof createPortal==="function" && typeof document!=="undefined" && document.body){
    portalNode=createPortal(modal, document.body);
   }else{
    portalNode=modal;
   }
  }catch(err){
   console.warn("Install modal portal failed", err);
   portalNode=modal;
  }
 }

 return <>
  <button type="button" className={`pwa-install ${compact?"pwa-install-compact":""}`} onClick={openInstaller} title="Install NEXORA as an app">
   <Download size={16}/><span>{compact?"Install":"Install NEXORA"}</span>
  </button>
  {portalNode}
 </>;
}
function Instructions({onClose,page="dashboard",onNavigate}){
 const [query,setQuery]=useState("");
 const [active,setActive]=useState(page);
 const guides=[
  {id:"dashboard",title:"Dashboard",icon:"🏠",intro:"Your home screen brings together your account overview and shortcuts.",steps:["Review your membership and profile summary at the top of the page.","Check the wallet and activity summaries; open Wallet & Payments for the full balance and payment actions.","Use the dashboard shortcuts to open the feature you need.","If something looks outdated, use the refresh/retry control shown with an error message."]},
  {id:"marketplace",title:"Shop & Marketplace",icon:"🛍️",intro:"Find products, place orders, and manage selling activity.",steps:["Open Shop & Marketplace from the side menu or mobile Shop tab.","Browse categories or search for a product, then open its listing to review the description, price, seller and location.","Use wishlist or cart controls when available; check quantities and delivery details before checkout.","To sell, choose the add/list product action and provide clear photos, an accurate description, price, stock and location.","Open Orders & Transactions to review an order after checkout. Contact Support if an order needs attention."]},
  {id:"connect",title:"NEXORA Connect",icon:"📶",intro:"Review advertised Safaricom bundles and follow the payment instructions shown for each offer.",steps:["Choose the Data, Minutes or SMS bundle category.","Read the bundle size, validity, price and recipient-number details carefully.","Choose the payment route shown on the page and follow its exact instructions.","For direct M-Pesa payments, keep your reference and wait for the provider to verify it; a submitted reference is not proof of payment.","Check the displayed order status and contact Support if you need help."]},
  {id:"wallet",title:"Wallet & Payments",icon:"👛",intro:"See your available balance and use the payment actions that are enabled for your account.",steps:["Open Wallet & Payments from the side menu or mobile Wallet tab.","Review the available balance and any pending amounts shown.","Select Deposit and follow the available payment method's instructions; never share your M-Pesa PIN or one-time codes.","Use Withdraw when available, carefully review the amount, fee and net payout before confirming.","Check Orders & Transactions for payment references and status. A pending payment is not yet confirmed."]},
  {id:"transfer",title:"Send Money",icon:"💸",intro:"Use the on-screen form to review and confirm a transfer.",steps:["Open Send Money from the side menu.","Enter the recipient details and amount requested by the form.","Check the recipient and any displayed charges before submitting.","Keep the transaction reference and check its status in Orders & Transactions.","If the details are wrong or the status is unclear, contact Support before repeating a payment."]},
  {id:"services",title:"NEXORA Services",icon:"🧩",intro:"Request a website, mobile app, game or other digital service.",steps:["Open NEXORA Services and select the type of service you need.","Describe what you want, the required features and any useful deadline or reference files.","Enter a reachable WhatsApp number and email address, then review your details.","Submit the request and look for the confirmation/status shown on screen.","The team may mark it received and processing, ask questions or provide a quotation. Contact Support if feedback is delayed."]},
  {id:"transactions",title:"Orders & Transactions",icon:"🧾",intro:"Use this page to review payment records and orders.",steps:["Open Orders & Transactions from the menu.","Find the record by its date, amount, type or reference where those details are shown.","Open a record to view its receipt and payment details.","If a payment is pending, use the available status-check action rather than paying again immediately.","When contacting Support, include the reference and never include your PIN or password."]},
  {id:"referrals",title:"Membership & Referrals",icon:"🤝",intro:"Review plans, referral activity and recorded commissions.",steps:["Open Membership & Referrals under Earn.","Review plan prices, eligibility and benefits before purchasing or upgrading.","Use your personal referral code or link with the copy/share buttons provided.","Check your direct referrals and any additional network details shown on the page.","Commissions depend on qualifying purchases and plan eligibility; sharing a link alone does not guarantee earnings."]},
  {id:"products",title:"Advertise",icon:"📣",intro:"Advertising tasks are available to eligible Premium members and are subject to review.",steps:["Open Advertise and review the eligibility and campaign instructions first.","Choose an available campaign/product and read its rules, permitted platforms and rates.","Publish the required content on an approved social platform and follow the campaign's sharing instructions.","Submit the public post link and the exact post/creative or evidence requested by the form.","Enter accurate performance figures and submit for review. Approval is not guaranteed; approved payouts follow the campaign schedule shown by NEXORA."]},
  {id:"marketing",title:"Marketing Center",icon:"🔗",intro:"Prepare and share your referral message responsibly.",steps:["Open Marketing Center from the menu.","Copy your personal referral link or code using the relevant copy button.","Choose a share action or copy a prepared message, then paste it into the app you use.","Explain NEXORA honestly; do not promise guaranteed earnings or misrepresent plan benefits.","Return to Membership & Referrals or Analytics to review recorded activity."]},
  {id:"academy",title:"NEXORA Academy",icon:"🎓",intro:"Learn how to use the platform through short lessons.",steps:["Open Academy and choose a lesson that matches what you want to learn.","Read or watch each section in order and try the suggested actions where appropriate.","Select Start Lesson if it is shown to begin tracking your progress.","Select Finish Lesson when you have completed the content; confirm the lesson is marked completed.","Reopen the lesson or choose another topic whenever you need a refresher."]},
  {id:"analytics",title:"Analytics",icon:"📊",intro:"Understand recorded activity without treating estimates as guaranteed income.",steps:["Open Analytics from the side menu.","Choose the available summary, period or metric controls.","Compare recorded referrals, conversions and commissions where displayed.","If a number looks unexpected, check the related referral or transaction record.","Analytics reflect recorded platform activity and do not promise future results."]},
  {id:"community",title:"Community",icon:"👥",intro:"Read official announcements and community updates.",steps:["Open Community from the menu.","Open an announcement or update to read the full message.","Follow any linked instructions and check the date or status of the notice.","Use Help & Support if you need clarification about an official update."]},
  {id:"notifications",title:"Notifications",icon:"🔔",intro:"Use alerts to jump to the feature that needs your attention.",steps:["Open Notifications from the menu or the notification icon in the header.","Read the title and message to understand what changed.","Select a notification when it offers an action or destination; NEXORA may take you to the related page.","After handling the issue, return to Notifications to review other updates.","For payment alerts, confirm the status in Orders & Transactions before taking payment action again."]},
  {id:"leaderboard",title:"Leaderboard",icon:"🏆",intro:"Review the leaderboard and the recorded activity it displays.",steps:["Open Leaderboard from the menu.","Read the selected ranking and the metric used for ordering.","Treat displayed results as recorded platform activity for the period shown.","Use Analytics for your own detailed activity and Membership & Referrals for referral records."]},
  {id:"challenges",title:"Challenges",icon:"🎯",intro:"Track activity goals and milestones.",steps:["Open Challenges from the menu.","Read the goal, eligibility and time period for each challenge.","Complete the listed qualifying actions and check progress on the page.","Review achievements after the platform updates your activity.","Challenges and badges track activity; they do not guarantee money or future earnings."]},
  {id:"support",title:"Help & Support",icon:"🛟",intro:"Create a support ticket and follow its status.",steps:["Open Help & Support from the menu or ask NexBot for guidance.","Choose the ticket/request action and select a relevant subject.","Describe the problem clearly and include the related transaction, order or project reference if available.","Submit the ticket and return to Support to check for replies or status changes.","Never send passwords, M-Pesa PINs or one-time security codes. Use the official WhatsApp Support link if needed."]},
  {id:"security",title:"Profile & Security",icon:"🔐",intro:"Keep your profile details accurate and your account secure.",steps:["Open Profile & Security from the menu or your account shortcut.","Review your name, email and phone details and update them using the form controls provided.","Use the password/security controls to protect your account.","Use a unique password and never share login codes, payment PINs or passwords with anyone.","Log out when using a shared device."]},
  {id:"common",title:"Common buttons & account actions",icon:"🧭",intro:"Quick explanations for controls you will see in different parts of NEXORA.",steps:["Copy / Copy link: copies the shown code, link or reference so you can paste it elsewhere.","Share: opens an available sharing app or creates a share message; check the content before sending.","Search and filters: narrow the list shown on the current page. Clear filters if an item is missing.","Back / Close (×): returns to the previous view or closes the current dialog without confirming an action unless the dialog says otherwise.","Submit / Continue: review every field first. If a payment or purchase is involved, confirm the amount and recipient before continuing.","Retry / Refresh: retries loading data; it does not mean a payment was made or cancelled.","Install NEXORA: adds the app to your device when supported. If prompted, follow your browser or device's install steps.","NexBot: ask a plain-language question such as ‘How do I deposit?’ or ‘How do I list a product?’ and follow the response."]},
 ];
 const current=guides.find(g=>g.id===active)||guides[0];
 const filtered=guides.filter(g=>(g.title+" "+g.intro+" "+g.steps.join(" ")).toLowerCase().includes(query.toLowerCase().trim()));
 return <div className="modalbackdrop" onClick={onClose}><div className="modal instructions" role="dialog" aria-modal="true" aria-label="NEXORA step-by-step tutorials" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">NEXORA HELP CENTRE</span><h2>Step-by-step tutorials</h2><p className="muted small">Find a feature, choose a guide, and follow each step.</p></div><button className="iconbtn" onClick={onClose} aria-label="Close tutorials"><X size={20}/></button></div><div className="tutorial-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search buttons or features (e.g. deposit, copy link, lesson)…" aria-label="Search tutorials"/></div><div className="tutorial-layout"><div className="tutorial-list" aria-label="Tutorial topics">{filtered.map(g=><button type="button" key={g.id} className={active===g.id?"tutorial-topic active":"tutorial-topic"} onClick={()=>setActive(g.id)}><span>{g.icon}</span><span>{g.title}</span><ChevronRight size={15}/></button>)}{filtered.length===0&&<p className="muted small">No exact match. Try “wallet”, “order”, “sell”, “advertise” or “common buttons”.</p>}</div><div className="instructionbody tutorial-content"><span className="pill"> {current.icon} {current.title.toUpperCase()}</span><h3>{current.title}: how to use it</h3><p className="muted">{current.intro}</p><ol>{current.steps.map((step,i)=><li key={current.id+"-"+i}><span className="tutorial-step-number">{i+1}</span><span>{step}</span></li>)}</ol><div className="tutorial-actions">{current.id!=="common"&&current.id!=="dashboard"&&<button type="button" className="primary" onClick={()=>{onNavigate?.(current.id);onClose()}}>Open {current.title}<ArrowRight size={16}/></button>}<button type="button" className="secondary" onClick={()=>setActive("common")}>Common button guide</button></div></div></div><div className="modalfoot"><a className="secondary supportinline" href="https://wa.me/254703265774" target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp Support <ExternalLink size={14}/></a><button type="button" className="secondary" onClick={()=>{setQuery("");setActive(page)}}>Show guide for this page</button></div></div></div>
}

function NexBot({goPage,goPackages,me}){
 const storagePos="nexora-nexbot-pos";
 const [open,setOpen]=useState(false);
 const [input,setInput]=useState("");
 const [loading,setLoading]=useState(false);
 const [listening,setListening]=useState(false);
 const [speakReplies,setSpeakReplies]=useState(()=>{try{return localStorage.getItem("nexora-nexbot-voice")==="true"}catch{return false}});
 const [products,setProducts]=useState([]);
 const [orders,setOrders]=useState([]);
 const [wallet,setWallet]=useState(null);
 const [suggestions,setSuggestions]=useState([]);
 const [msgs,setMsgs]=useState([{role:"bot",text:`Hi ${me?.user?.name?.split(" ")[0]||"there"}! I'm NexBot. Ask me anything about NEXORA — you can type naturally, use voice, or tap a shortcut.`}]);
 const [tip,setTip]=useState(false);
 const [intro,setIntro]=useState(true);
 const [pos,setPos]=useState(()=>{
  try{const p=JSON.parse(localStorage.getItem(storagePos)||"null");if(p&&typeof p.x==="number"&&typeof p.y==="number")return p;}catch{}
  return null;
 });
 const drag=React.useRef(null);
 const fabRef=React.useRef(null);
 const sheetRef=React.useRef(null);
 const recognitionRef=React.useRef(null);
 const [panelPos,setPanelPos]=useState(null);

 useEffect(()=>{
  // Show the mascot entrance once each time the console is loaded.
  setIntro(true);
  try{setTip(localStorage.getItem("nexora-nexbot-hints")!=="false")}catch{setTip(true)}
  const introTimer=setTimeout(()=>setIntro(false),2200);
  const tipTimer=setTimeout(()=>setTip(false),4200);
  return()=>{clearTimeout(introTimer);clearTimeout(tipTimer)};
 },[]);
 useEffect(()=>{
  const syncPreferences=()=>{try{setSpeakReplies(localStorage.getItem("nexora-nexbot-voice")==="true");if(localStorage.getItem("nexora-nexbot-hints")==="false")setTip(false)}catch{}};
  window.addEventListener("nexora-preferences-updated",syncPreferences);
  return()=>window.removeEventListener("nexora-preferences-updated",syncPreferences);
 },[]);
 useEffect(()=>{
  const openFromHeader=()=>{setTip(false);setOpen(true)};
  window.addEventListener("nexora-open-nexbot",openFromHeader);
  return()=>window.removeEventListener("nexora-open-nexbot",openFromHeader);
 },[]);
 useEffect(()=>{
  if(!open) return;
  const onKey=e=>{if(e.key==="Escape") setOpen(false)};
  window.addEventListener("keydown",onKey);
  return()=>window.removeEventListener("keydown",onKey);
 },[open]);
 useEffect(()=>()=>{
  try{recognitionRef.current?.stop()}catch{}
  try{dragCleanup.current?.()}catch{}
  dragCleanup.current=null;
},[]);

 const localAnswer=(q)=>{
  const s=String(q||"").toLowerCase();
  if(/\b(hi|hello|hey|habari|niaje)\b/.test(s)) return "Hi! I'm NexBot. You can ask me about shopping, orders, wallet, payments, membership, referrals, advertising, selling, NEXORA Connect bundles, support, Academy, or how to use NEXORA.";
  if(/\b(balance|wallet|money|funds)\b/.test(s)) return `Your wallet balance is ${money(me?.wallet?.balance)}. I can help you with deposits, withdrawals and transaction history.`;
  if(/\b(plan|plans|membership|starter|growth|pro|elite|premium|upgrade)\b/.test(s)) return `Your current membership is ${me?.package?.name||"not active"}. Open Earn → Membership plans to review the available plans and their rules.`;
  if(/\b(referral|referrals|commission|earn|earning|invite|network)\b/.test(s)) return `Your NEXORA referral tools are under Earn. Referral commissions depend on the qualifying plan rules; Results depend on your qualifying activity and plan rules.`;
  if(/\b(order|orders|delivery|track|tracking)\b/.test(s)) return orders.length?`I found ${orders.length} recent order${orders.length===1?"":"s"}. I can show the latest status below.`:"I don't see any recent orders yet. Start shopping to place your first order.";
  if(/\b(shop|product|products|buy|sell|seller|cart|wishlist|electronics|fashion)\b/.test(s)) return "I can help you find products, compare listings, use your wishlist/cart, or sell a product on NEXORA.";
  if(/\b(connect|safaricom|bundle|bundles|okoa|kigen|airtime|sms offer|minutes offer)\b/.test(s)) return "Open NEXORA Connect for the Safaricom data, minutes and SMS offers advertised by Kigen Internet Services. Confirm current availability and payment instructions with Kigen before paying; NEXORA does not yet automate bundle delivery.";
  if(/\b(advertise|advertising|campaign|views|engagement)\b/.test(s)) return "Advertising is for eligible Premium members. Campaign submissions are reviewed and approved payouts follow the campaign rules.";
  if(/\b(payment|pay|mpesa|m-pesa|stk|deposit)\b/.test(s)) return "For Kenya, wallet deposits and membership plan purchases use Paystack M-Pesa STK Push when enabled. NEXORA only credits the wallet or activates a plan after Paystack confirms the payment. NEXORA Connect bundle orders keep their separate payment instructions. Never share your M-Pesa PIN or security codes.";
  if(/\b(business plan|business idea|start a business|business builder)\b/.test(s)) return "Open Business Builder to create a practical starter brief. Add your idea, target customers, budget and skills, then copy the suggested steps. Validate demand and costs before investing.";
   if(/\b(trust centre|trust center|fees|withdrawal fee|payment status|security|scam|fraud)\b/.test(s)) return "Open the Trust Centre for guidance on earning eligibility, withdrawal fees, payment statuses, marketplace safety and account protection. For a specific payment, check its reference in Orders & Transactions; pending is not confirmation.";
   if(/\b(support|help|ticket|human)\b/.test(s)) return "Open Help & Support to create or review a ticket. For payment questions, include the transaction reference but never send your PIN.";
  return "I can help with NEXORA, including shopping, products, orders, wallet, payments, membership, referrals, advertising, NEXORA Connect bundles, selling, Academy and support. Tell me what you're trying to do and I'll guide you step by step.";
 };

 const send=async(textIn)=>{
  const q=String(textIn??input).trim();
  if(!q||loading) return;
  setTip(false); setInput(""); setLoading(true);
  const nextHistory=[...msgs,{role:"user",text:q}].slice(-10);
  setMsgs(m=>[...m,{role:"user",text:q}]);
  try{
   const data=await api("/nexbot/chat",{method:"POST",body:JSON.stringify({message:q,history:nextHistory})});
   const answer=String(data.answer||localAnswer(q));
   setMsgs(m=>[...m,{role:"bot",text:answer,action:data.action||null}]);
   setProducts(Array.isArray(data.products)?data.products:[]);
   setOrders(Array.isArray(data.orders)?data.orders:[]);
   setWallet(data.wallet||null);
   setSuggestions(Array.isArray(data.suggestions)?data.suggestions:[]);
   if(speakReplies&&"speechSynthesis" in window){window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(answer);u.rate=.98;u.pitch=1;window.speechSynthesis.speak(u);}
  }catch(e){
   const answer=localAnswer(q);
   setMsgs(m=>[...m,{role:"bot",text:answer}]);
  }finally{setLoading(false);}
 };

 const quick=[
  ["🛍 Shop","Find products on NEXORA"],
  ["💳 Wallet","Show me my wallet"],
  ["📦 Orders","Where is my latest order?"],
  ["🎁 Rewards","Explain my referrals and rewards"],
  ["🧠 Business plan","Help me build a business plan"],
  ["🛡 Trust Centre","How do I check payment status and stay safe?"],
  ["🏪 Sell","How do I sell a product?"],
  ["❓ Help","What can NexBot help me with?"]
 ];
 const actionInfo={plans:["Open Membership Plans",()=>goPackages?.()],settings:["Open Settings & Preferences",()=>goPage?.("settings")],marketplace:["Open Marketplace",()=>goPage?.("marketplace")],transactions:["Open Orders & Transactions",()=>goPage?.("transactions")],wallet:["Open Wallet",()=>goPage?.("wallet")],referrals:["Open Earn & Referrals",()=>goPage?.("referrals")],products:["Open Advertise",()=>goPage?.("products")],notifications:["Open Notifications",()=>goPage?.("notifications")],academy:["Open Academy",()=>goPage?.("academy")],trust:["Open Trust Centre",()=>goPage?.("trust")],businessbuilder:["Open Business Builder",()=>goPage?.("businessbuilder")],support:["Open Help & Support",()=>goPage?.("support")],security:["Open Profile & Security",()=>goPage?.("security")],transfer:["Open Send Money",()=>goPage?.("transfer")],services:["Open Digital Studio",()=>goPage?.("services")],connect:["Open NEXORA Connect",()=>goPage?.("connect")]};

 const startVoice=()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){setMsgs(m=>[...m,{role:"bot",text:"Voice input is not supported by this browser. Try Chrome on Android or type your question instead."}]);return;}
  if(listening){try{recognitionRef.current?.stop()}catch{};return;}
  const r=new SR(); recognitionRef.current=r; r.lang="en-KE"; r.interimResults=true; r.continuous=false;
  r.onstart=()=>setListening(true);
  r.onresult=e=>{let final="";for(let i=e.resultIndex;i<e.results.length;i++) final+=e.results[i][0].transcript;if(final)setInput(final);};
  r.onerror=()=>setListening(false); r.onend=()=>setListening(false); r.start();
 };
 const speakLast=()=>{
  if(!("speechSynthesis" in window)) return;
  const last=[...msgs].reverse().find(m=>m.role==="bot"); if(!last)return;
  if(window.speechSynthesis.speaking){window.speechSynthesis.cancel();return;}
  const u=new SpeechSynthesisUtterance(last.text);u.rate=.98;window.speechSynthesis.speak(u);
 };

 const FAB_SIZE=58;
 const clampPos=(x,y)=>({x:Math.max(8,Math.min((window.innerWidth||400)-FAB_SIZE-8,x)),y:Math.max(8,Math.min((window.innerHeight||700)-FAB_SIZE-8,y))});
 const positionPanel=()=>{
  const launcher=fabRef.current&&fabRef.current.getBoundingClientRect().width>0?fabRef.current:document.querySelector(".nx-header-nexbot");
  if(!open||!launcher||!sheetRef.current) return;
  const fab=launcher.getBoundingClientRect(), panel=sheetRef.current.getBoundingClientRect(), gap=10,pad=8;
  let left=fab.left-panel.width-gap;
  if(left<pad) left=fab.right+gap;
  left=Math.max(pad,Math.min(left,window.innerWidth-panel.width-pad));
  let top=fab.top+(fab.height/2)-(panel.height/2);
  top=Math.max(pad,Math.min(top,window.innerHeight-panel.height-pad));
  setPanelPos({left,top});
 };
 useEffect(()=>{
  if(!open){setPanelPos(null);return;}
  const frame=requestAnimationFrame(positionPanel);
  const onResize=()=>requestAnimationFrame(positionPanel);
  window.addEventListener("resize",onResize);window.addEventListener("orientationchange",onResize);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",onResize);window.removeEventListener("orientationchange",onResize)};
 },[open,msgs.length,loading,products.length,orders.length]);

 const dragCleanup=React.useRef(null);
 const suppressClick=React.useRef(false);
 const dragRef=drag;
 const beginDrag=(clientX,clientY,pointerId=null)=>{
  if(open)return false;
  const el=fabRef.current;
  if(!el)return false;
  const r=el.getBoundingClientRect();
  dragRef.current={startX:clientX,startY:clientY,ox:pos?pos.x:r.left,oy:pos?pos.y:r.top,moved:false,pointerId};
  return true;
 };
 const moveDrag=(clientX,clientY,e)=>{
  const d=dragRef.current;if(!d)return;
  const dx=clientX-d.startX,dy=clientY-d.startY;
  if(Math.abs(dx)>4||Math.abs(dy)>4)d.moved=true;
  if(!d.moved)return;
  e?.preventDefault?.();
  const next=clampPos(d.ox+dx,d.oy+dy);
  d.latest=next;
  setPos(next);
 };
 const endDrag=(openAfterTap=true)=>{
  const d=dragRef.current;if(!d)return;
  dragRef.current=null;
  const f=d.latest||clampPos(d.ox,d.oy);
  if(d.moved){
   suppressClick.current=true;
   setPos(f);
   try{localStorage.setItem(storagePos,JSON.stringify(f));}catch{}
   return;
  }
  if(openAfterTap){setTip(false);setOpen(true);}
 };
 const onPointerDown=e=>{
  if(e.button!=null&&e.button!==0)return;
  if(beginDrag(e.clientX,e.clientY,e.pointerId)){
   e.preventDefault();
   try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}
  }
 };
 const onPointerMove=e=>{
  if(!dragRef.current||dragRef.current.pointerId!==e.pointerId)return;
  moveDrag(e.clientX,e.clientY,e);
 };
 const onPointerUp=e=>{
  if(!dragRef.current||dragRef.current.pointerId!==e.pointerId)return;
  try{e.currentTarget.releasePointerCapture?.(e.pointerId)}catch{}
  endDrag(true);
 };
 const onTouchStart=e=>{
  if(!e.touches?.[0])return;
  if(beginDrag(e.touches[0].clientX,e.touches[0].clientY,null))e.preventDefault();
 };
 const onTouchMove=e=>{
  if(!dragRef.current||!e.touches?.[0])return;
  moveDrag(e.touches[0].clientX,e.touches[0].clientY,e);
 };
 const onTouchEnd=e=>{
  if(!dragRef.current)return;
  e.preventDefault();
  endDrag(true);
 };
 const onClick=e=>{
  if(suppressClick.current){suppressClick.current=false;e.preventDefault();e.stopPropagation();return;}
  if(!open){setTip(false);setOpen(true);}
 };
 const Face=({size=28})=><span className="nexbot-face" style={{width:size,height:size}} aria-hidden="true"><span className="nexbot-eye left"/><span className="nexbot-eye right"/><span className="nexbot-mouth"/></span>;
 const fabStyle=pos?{position:"fixed",left:pos.x,top:pos.y,right:"auto",bottom:"auto"}:undefined;
 const lastBot=[...msgs].reverse().find(m=>m.role==="bot");
 const panel=(
  <div className="nexbot-panel" role="dialog" aria-label="NexBot">
   <div className="nexbot-sheet-handle" aria-hidden="true"><span/></div>
   <div className="nexbot-head">
    <div className="nexbot-avatar"><img className="nexbot-mascot-head" src="/nexbot-mascot.png" alt="NexBot waving"/></div>
    <div className="nexbot-head-text"><b>NexBot</b><small>Here to help</small></div>
    <div className="nexbot-head-actions">
     <button type="button" className={`iconbtn ${speakReplies?"is-on":""}`} onClick={()=>setSpeakReplies(v=>{const next=!v;try{localStorage.setItem("nexora-nexbot-voice",String(next))}catch{};return next})} aria-label="Toggle read replies" title="Read replies">{speakReplies?<Volume2 size={16}/>:<VolumeX size={16}/>}</button>
     <button type="button" className="iconbtn" onClick={()=>setOpen(false)} aria-label="Close"><X size={18}/></button>
    </div>
   </div>
   <div className="nexbot-msgs">
    {msgs.map((m,i)=><div key={i} className={`nexbot-msg ${m.role}`}><span>{m.text}</span>{m.action&&actionInfo[m.action]&&<button className="nexbot-action" type="button" onClick={()=>{setOpen(false);actionInfo[m.action][1]()}}>{actionInfo[m.action][0]} <ArrowRight size={13}/></button>}</div>)}
    {loading&&<div className="nexbot-msg bot typing"><LoaderCircle size={15}/><span>Thinking…</span></div>}
    {products.length>0&&<div className="nexbot-results"><div className="nexbot-results-title"><ShoppingBag size={14}/> Products</div>{products.slice(0,4).map(p=><button key={p.id} type="button" className="nexbot-product" onClick={()=>{setOpen(false);goPage?.("marketplace")}}>{p.image?<img src={p.image} alt=""/>:<span className="nexbot-product-placeholder"><PackageSearch size={17}/></span>}<span><b>{p.title}</b><small>{money(p.price)}</small></span><ArrowRight size={14}/></button>)}</div>}
    {orders.length>0&&<div className="nexbot-results"><div className="nexbot-results-title"><Truck size={14}/> Orders</div>{orders.slice(0,3).map(o=><button key={o.id} type="button" className="nexbot-order" onClick={()=>{setOpen(false);goPage?.("marketplace")}}><span><b>{o.reference||o.id}</b><small>{o.items?.map(x=>`${x.title} ×${x.quantity}`).join(", ")||"Order"}</small></span><strong>{String(o.status||"PENDING").replaceAll("_"," ")}</strong></button>)}</div>}
    {wallet&&<div className="nexbot-wallet"><WalletMinimal size={16}/><div><small>Wallet</small><b>{money(wallet.balance)}</b></div><button type="button" onClick={()=>{setOpen(false);goPage?.("wallet")}}>Open</button></div>}
   </div>
   <div className="nexbot-quick">{quick.map(([l,q])=><button type="button" key={l} onClick={()=>send(q)}>{l}</button>)}</div>
   {suggestions.length>0&&<div className="nexbot-suggestions">{suggestions.slice(0,3).map(q=><button key={q} type="button" onClick={()=>send(q)}>{q}</button>)}</div>}
   <form className="nexbot-compose" onSubmit={e=>{e.preventDefault();send()}}>
    <button type="button" className={`nexbot-mic ${listening?"on":""}`} onClick={startVoice} aria-label="Voice">{listening?<Mic size={18}/>:<Mic size={18}/>}</button>
    <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask about NEXORA…" autoComplete="off"/>
    <button type="submit" className="nexbot-send" disabled={loading||!String(input).trim()} aria-label="Send"><SendHorizontal size={18}/></button>
   </form>
   <p className="nexbot-privacy">Never share your PIN or password</p>
  </div>
 );

 return <>
  {open&&createPortal(
   <div className="nexbot-overlay" onClick={()=>setOpen(false)}>
    <div className="nexbot-sheet" ref={sheetRef} onClick={e=>e.stopPropagation()}>
     {panel}
    </div>
   </div>,
   document.body
  )}
  <div className={`nexbot-root ${open?"is-open":""} ${intro&&!open?"nexbot-intro":""}`} style={fabStyle}>
   {tip&&!open&&<div className="nexbot-tip" role="status"><b>Hi — I'm NexBot</b><span>Tap to ask anything</span></div>}
   <button ref={fabRef} type="button" className="nexbot-fab" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onClick={onClick} title="NexBot" aria-label="Open NexBot"><span className="nexbot-fab-glow"/><img className="nexbot-mascot-fab" src="/nexbot-mascot.png" alt="NexBot mascot"/><span className="nexbot-fab-dot"/></button>
  </div>
 </>;
}

function SupportButton(){return <a className="supportfloat" href="https://wa.me/254703265774" target="_blank" rel="noreferrer" aria-label="Contact NEXORA support on WhatsApp"><MessageCircle size={20}/><span>Support</span></a>}
function PublicLanding({onLogin}){
 const [mode,setMode]=useState(null);
 const [initialResetToken,setInitialResetToken]=useState("");
 const go=(m)=>setMode(m);
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  const reset=params.get("reset");
  const join=params.get("join");
  if(reset){
   setInitialResetToken(reset);
   setMode("reset");
   const url=new URL(window.location.href);
   url.searchParams.delete("reset");
   window.history.replaceState({},"",url.pathname+url.search+url.hash);
  } else if(join){
   setMode("register");
   const url=new URL(window.location.href);
   url.searchParams.delete("join");
   window.history.replaceState({},"",url.pathname+url.search+url.hash);
  }
 },[]);
 return <div className="publicsite">
  <header className="publicnav"><div className="publicbrand"><img src="/nexora-logo.png"/><div><b>NEXORA</b><small>MARKETPLACE · MEMBER PLATFORM</small></div></div><nav><a href="#features">Features</a><a href="#how">How it works</a><a href="/packages">Plans</a><a href="#faq">FAQ</a></nav><div className="publicactions"><PWAInstall compact/><button className="secondary" onClick={()=>go("login")}><LogIn size={15}/> Sign in</button><button className="primary" onClick={()=>go("register")}><Store size={15}/> Start shopping</button></div></header>
  <main>
   <section className="publichero"><div className="publicheroCopy"><span className="pill">NEXORA · MARKETPLACE & MEMBER PLATFORM</span><h1>Shop. Sell. Advertise. <span>Grow.</span></h1><p>NEXORA brings a modern marketplace, member wallet, product advertising, referrals, learning, support and digital services together in one platform.</p><div className="heroactions"><button className="primary" onClick={()=>go("register")}><Store size={17}/> Start with NEXORA <ArrowUpRight size={17}/></button><button className="secondary" onClick={()=>document.getElementById("how")?.scrollIntoView({behavior:"smooth"})}>See how it works</button></div><div className="publictrust"><span><ShieldCheck size={16}/> Account-focused workspace</span><span><BarChart3 size={16}/> Transparent activity tracking</span><span><LifeBuoy size={16}/> Member support</span></div></div><div className="publicheroCard"><img src="/nexora-logo.png"/><div className="floatingmetric"><small>NEXORA MARKETPLACE</small><b>Shop, sell and grow in one place</b><span>Marketplace · Wallet · Advertising · Academy · Services</span></div></div></section>
   <section id="features" className="publicsection"><div className="sectionhead"><div><span className="pill">ONE DIGITAL MARKETPLACE</span><h2>More than a referral platform</h2><p className="muted">Shop products, sell your own products, promote approved campaigns and manage your NEXORA account in one place.</p></div></div><div className="featuregrid">{[[Store,"Marketplace","Browse products, save favorites, add to cart and track purchases from NEXORA sellers."],[Plus,"Sell Products","List products with photos, descriptions, prices, stock and location and manage customer orders."],[Megaphone,"Premium Advertising","Premium members can promote approved products and submit verified performance for Friday payout review."],[GraduationCap,"NEXORA Academy","Practical lessons on platform use, ethical marketing and account safety."],[Trophy,"Achievements","Track milestones and activity based on real activity you complete."],[LifeBuoy,"Member Support","Create support tickets and keep replies in one place."],[Wrench,"NEXORA Services","Request websites, mobile apps, web apps, e-commerce, automation, design, integrations and custom software."],[Wifi,"NEXORA Connect","Browse Safaricom data, minutes and SMS offers from Kigen Internet Services in Kenya."],[Shield,"Security Center","Manage your profile and keep your account information current."]].map(([I,t,d])=><div className="featurecard" key={t}><div className="featureicon"><I size={22}/></div><h3>{t}</h3><p>{d}</p></div>)}</div></section>
   <section id="how" className="publicsection darksection"><div className="sectionhead"><div><span className="pill">SIMPLE FLOW</span><h2>How NEXORA works</h2></div></div><div className="steps">{[["01","Create","Create your account and complete your profile."],["02","Explore","Review membership benefits, learning tools and your workspace."],["03","Connect","Use your personal referral tools to share NEXORA with people who genuinely want to learn about it."],["04","Advertise","Premium members can publish approved products, submit their post link and creative, and have verified performance reviewed for Friday payouts."],["05","Services","Request a website, mobile app, web app, e-commerce store, automation or custom digital solution and track the project from review to completion."],["06","Track","Follow activity, transactions, service requests, support updates and achievements from your dashboard."]].map(([n,t,d])=><div className="step" key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></div>)}</div></section>
   <section id="packages" className="publicsection"><div className="sectionhead"><div><span className="pill">MEMBERSHIP</span><h2>Choose the level that fits you</h2><p className="muted">Benefits and prices are shown transparently inside the member workspace.</p></div><button className="secondary" onClick={()=>go("register")}>Explore membership</button></div><div className="publicpackagegrid"><div><b>Starter</b><span>Foundation level</span><small>Access begins with the Starter level and its configured benefits.</small></div><div><b>Growth</b><span>Expand your toolkit</span><small>Unlock the Growth plan and the plan levels available to it.</small></div><div className="featured"><b>Pro</b><span>MOST POPULAR</span><small>A broader member experience with more configured benefits and earning access.</small></div><div><b>Elite</b><span>Advanced level</span><small>Designed for members who want the additional benefits configured for Elite.</small></div><div><b>Premium</b><span>Full platform level</span><small>The highest configured membership level and plan earning access.</small></div></div></section>
   <section className="publicsection publicstats"><div><strong>One workspace</strong><span>Account, wallet, referrals, learning and support</span></div><div><strong>Clear records</strong><span>Transactions and recorded commissions are visible to members</span></div><div><strong>Member-first</strong><span>Tools designed to help members understand their activity</span></div></section>
   <section id="faq" className="publicsection"><div className="sectionhead"><div><span className="pill">FAQ</span><h2>Questions, answered</h2></div></div><div className="faqgrid"><details open><summary>Does NEXORA guarantee earnings?</summary><p>Earnings depend on your qualifying activity and the plan rules. NEXORA records commissions when those rules are met — results follow the work you put in.</p></details><details><summary>What can I do after joining?</summary><p>Explore your dashboard, membership, referral tools, analytics, Academy, achievements, wallet, transactions and support center.</p></details><details><summary>How do plan levels work?</summary><p>Your plan level determines the plan purchases from which you may be eligible to receive referral commissions, subject to the platform's rules.</p></details><details><summary>How does Premium advertising work?</summary><p>Premium unlocks approved advertising products. Premium members publish campaign posts on approved platforms, submit the public post link and the exact creative they posted, then provide current views and engagements for review. Approved advertising earnings are processed weekly on Friday.</p></details><details><summary>How do I get help?</summary><p>Members can create support tickets, use the direct support option inside NEXORA, or contact support from a project when they need help or a response is delayed.</p></details><details><summary>What is NEXORA Services?</summary><p>NEXORA Services lets members request websites, mobile apps, web applications, e-commerce stores, automation, AI solutions, design, integrations, hosting, maintenance and custom software. Requests can progress through review, information requests, quotations, milestones, project chat, completion and payment.</p></details><details><summary>What is NEXORA Connect?</summary><p>NEXORA Connect lists Safaricom data, minutes and SMS offers advertised by Kigen Internet Services. Wallet-paid and direct-to-Kigen requests are tracked in Connect Orders. Kigen delivery is still managed and confirmed manually; live automated bundle delivery is not connected within NEXORA.</p></details></div></section>
   <section className="publiccta"><div><span className="pill">READY WHEN YOU ARE</span><h2>Build your NEXORA workspace.</h2><p>Start with an account, explore the platform and decide what membership level fits your goals.</p></div><button className="primary" onClick={()=>go("register")}>Create account <ArrowUpRight size={17}/></button></section>
  </main>
  <footer className="publicfooter"><div><b>NEXORA.</b><p>Connect. Grow. Learn. Build.</p></div><div className="footerlinks"><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/membership">Membership rules</a><a href="#faq">Support</a></div><small>© {new Date().getFullYear()} NEXORA. Information is provided for platform use and does not constitute a guarantee of income.</small></footer>
  {mode&&<AuthModal mode={mode} initialResetToken={initialResetToken} onClose={()=>{setMode(null);setInitialResetToken("")}} onLogin={onLogin}/>}<SupportButton/>
 </div>
}
function passwordStrength(pw){
  if(!pw) return {score:0,label:"",cls:""};
  let s=0;
  if(pw.length>=8) s++;
  if(pw.length>=12) s++;
  if(/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
  if(/[^A-Za-z0-9]/.test(pw)) s++;
  if(s<=1) return {score:s,label:"Weak",cls:"weak"};
  if(s===2) return {score:s,label:"Fair",cls:"fair"};
  if(s===3) return {score:s,label:"Good",cls:"good"};
  return {score:s,label:"Strong",cls:"strong"};
}
function AuthModal({mode:onMode,initialResetToken="",onClose,onLogin}){
  const [mode,setMode]=useState(onMode);
  const [f,setF]=useState({name:"",email:"",phone:"",password:"",referralCode:"",countryCode:"KE"});
  const [nationalPhone,setNationalPhone]=useState("");
  const [confirmPassword,setConfirmPassword]=useState("");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const [showPassword,setShowPassword]=useState(false);
  const [showConfirmPassword,setShowConfirmPassword]=useState(false);
  const [agreed,setAgreed]=useState(false);
  const [successMsg,setSuccessMsg]=useState("");
  const [resetToken,setResetToken]=useState(initialResetToken||"");
  const [devResetToken,setDevResetToken]=useState("");
  const [biometricBusy,setBiometricBusy]=useState(false);
  const modalRef=React.useRef(null);
  const setupBiometrics=async(email,token)=>{
    if(!Capacitor.isNativePlatform()||!email||!token)return;
    try{
      const availability=await NativeBiometric.isAvailable();
      if(!availability?.isAvailable)return;
      const alreadyEnabled=localStorage.getItem("nexora-biometric-enabled")==="true";
      if(alreadyEnabled){
        await NativeBiometric.setCredentials({username:String(email),password:String(token),server:BIOMETRIC_SERVER});
        return;
      }
      if(!window.confirm("Would you like to enable fingerprint or face unlock for NEXORA on this phone? You can still use your password whenever you need to."))return;
      await NativeBiometric.verifyIdentity({reason:"Enable biometric sign-in for NEXORA",title:"Secure NEXORA login",subtitle:"Confirm it's you",description:"Your device will protect your saved NEXORA session."});
      await NativeBiometric.setCredentials({username:String(email),password:String(token),server:BIOMETRIC_SERVER});
      localStorage.setItem("nexora-biometric-enabled","true");
    }catch(error){
      // Biometric setup is optional; never block a successful password login.
      console.warn("NEXORA biometric setup skipped",error);
    }
  };
  const rawRef=(new URLSearchParams(location.search).get("ref")||"").trim().toUpperCase();
  const ref=["UNDEFINED","NULL","NONE","N/A"].includes(rawRef)?"":rawRef;

  useEffect(()=>{setMode(onMode);setErr("");setSuccessMsg("");setDevResetToken("");if(onMode==="reset"&&initialResetToken)setResetToken(initialResetToken);},[onMode,initialResetToken]);
  useEffect(()=>{
    if(ref && !f.referralCode) setF(prev=>({...prev,referralCode:ref.toUpperCase()}));
  },[ref]);
  useEffect(()=>{
    document.body.classList.add("nx-auth-open");
    const syncViewport=()=>document.documentElement.style.setProperty("--nx-visual-height",`${window.visualViewport?.height||window.innerHeight}px`);
    syncViewport();window.visualViewport?.addEventListener("resize",syncViewport);window.visualViewport?.addEventListener("scroll",syncViewport);
    const onKey=e=>{if(e.key==="Escape") onClose();};
    window.addEventListener("keydown",onKey);
    // basic focus trap: focus first input
    const t=setTimeout(()=>{const el=modalRef.current?.querySelector("input:not([type=hidden]),button.primary");el?.focus?.();},50);
    return ()=>{window.removeEventListener("keydown",onKey);clearTimeout(t);window.visualViewport?.removeEventListener("resize",syncViewport);window.visualViewport?.removeEventListener("scroll",syncViewport);document.body.classList.remove("nx-auth-open");document.documentElement.style.removeProperty("--nx-visual-height");};
  },[mode,onClose]);

  const passwordMatch=mode==="register"&&confirmPassword.length>0&&f.password===confirmPassword;
  const passwordMismatch=mode==="register"&&confirmPassword.length>0&&f.password!==confirmPassword;
  const strength=passwordStrength(f.password);
  const selectedCountry=COUNTRY_BY_CODE[f.countryCode]||COUNTRY_BY_CODE.KE;
  const phoneClean=buildInternationalPhone(f.countryCode,nationalPhone);
  const phoneValid=f.countryCode==="KE" ? PHONE_RE.test(phoneClean) : (/^\d{6,12}$/.test(nationalDigits(nationalPhone)) && phoneClean.length<=15);
  const canSubmit=()=>{
    if(busy) return false;
    if(mode==="login") return f.email && f.password;
    if(mode==="register") return f.name && f.email && nationalPhone && f.password && confirmPassword && passwordMatch && agreed && phoneValid!==false;
    if(mode==="forgot") return f.email;
    if(mode==="reset") return resetToken && f.password && confirmPassword && f.password===confirmPassword;
    return false;
  };

  const switchMode=m=>{
    setMode(m);setErr("");setSuccessMsg("");setShowPassword(false);setShowConfirmPassword(false);
    setConfirmPassword("");setAgreed(false);setDevResetToken("");
    if(m!=="reset") setResetToken("");
  };

  const setField=(k,v)=>setF(prev=>({...prev,[k]:v}));

  const submit=async e=>{
    e.preventDefault();setErr("");setSuccessMsg("");
    if(mode==="register"){
      if(f.password!==confirmPassword) return setErr("Passwords do not match.");
      if(!phoneValid) return setErr(`Enter a valid ${selectedCountry.name.replace(/^\S+\s/,"")} mobile number after the +${selectedCountry.dial} country code.`);
      if(!agreed) return setErr("Please accept the Terms, Privacy Policy and Membership Rules.");
      if(f.password.length<8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) return setErr("Password must be at least 8 characters and include a letter and a number.");
    }
    if(mode==="reset"){
      if(f.password!==confirmPassword) return setErr("Passwords do not match.");
      if(f.password.length<8 || !/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) return setErr("Password must be at least 8 characters and include a letter and a number.");
    }
    setBusy(true);
    try{
      if(mode==="login"||mode==="register"){
        const rawReferral=(f.referralCode||ref||"").trim().toUpperCase();const body={...f,phone:mode==="register"?phoneClean:f.phone,referralCode:["UNDEFINED","NULL","NONE","N/A"].includes(rawReferral)?"":rawReferral,website:""};
        const d=await api(`/auth/${mode==="login"?"login":"register"}`,{method:"POST",body:JSON.stringify(body)});
        if(mode==="register"){
          setSuccessMsg("Account created successfully. Opening your workspace…");
          localStorage.setItem("token",d.token);
          await setupBiometrics(f.email,d.token);
          onLogin();onClose();
        }else{
          localStorage.setItem("token",d.token);
          await setupBiometrics(f.email,d.token);
          onLogin();onClose();
        }
      }else if(mode==="forgot"){
        const d=await api("/auth/forgot-password",{method:"POST",body:JSON.stringify({email:f.email})});
        setSuccessMsg(d.message||"If an account exists, reset instructions were prepared.");
        if(d.resetToken){setDevResetToken(d.resetToken);setResetToken(d.resetToken);}
      }else if(mode==="reset"){
        const d=await api("/auth/reset-password",{method:"POST",body:JSON.stringify({token:resetToken,password:f.password})});
        setSuccessMsg(d.message||"Password updated. You can log in now.");
        setTimeout(()=>switchMode("login"),1200);
      }
    }catch(e){setErr(e.message);}
    finally{setBusy(false);}
  };

  const titles={login:"Welcome back",register:"Start your NEXORA journey",forgot:"Reset your password",reset:"Choose a new password"};
  const subtitles={login:"Sign in to your member workspace.",register:"Create your account to access the full member workspace.",forgot:"Enter the email on your NEXORA account. We will prepare a reset link.",reset:"Enter the reset token and your new password."};

  return <div className="modalbackdrop" onClick={onClose} role="presentation">
    <div className="modal authmodal" ref={modalRef} onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="modalhead">
        <div className="memberbrand"><img src="/nexora-logo.png" alt=""/><div><div className="brand">NEXORA<span>.</span></div><small>MEMBER PLATFORM</small></div></div>
        <button className="iconbtn" onClick={onClose} aria-label="Close"><X size={20}/></button>
      </div>
      {(mode==="login"||mode==="register")&&(
        <div className="authtabs">
          <button type="button" className={mode==="login"?"active":""} onClick={()=>switchMode("login")}>Log in</button>
          <button type="button" className={mode==="register"?"active":""} onClick={()=>switchMode("register")}>Create account</button>
        </div>
      )}
      <h2 id="auth-title">{titles[mode]||titles.login}</h2>
      <p className="muted">{subtitles[mode]||subtitles.login}</p>
      {err&&<div className="error" role="alert">{err}</div>}
      {successMsg&&<div className="successbanner" role="status">{successMsg}</div>}
      <form onSubmit={submit} noValidate>
        <input type="text" name="website" value="" readOnly tabIndex={-1} autoComplete="off" className="honeypot" aria-hidden="true"/>
        {mode==="register"&&<>
          <label className="fieldlabel">Full name
            <input required autoComplete="name" value={f.name} onChange={e=>setField("name",e.target.value)} placeholder="Your full name"/>
          </label>
          <label className="fieldlabel">Country
            <select required value={f.countryCode} onChange={e=>{setField("countryCode",e.target.value);setNationalPhone("")}}>{AFRICAN_COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name} (+{c.dial})</option>)}</select>
            <span className="fieldhint">Your country sets the phone prefix automatically and determines available payment methods.</span>
          </label>
          <label className="fieldlabel">Mobile number
            <div className="phonecountryfield">
              <span className="phoneprefix" aria-label={`Country code +${selectedCountry.dial}`}>+{selectedCountry.dial}</span>
              <input required inputMode="numeric" maxLength={12} autoComplete="tel-national" value={nationalPhone} onChange={e=>setNationalPhone(e.target.value.replace(/\D/g,"").replace(/^0+/,""))} placeholder={f.countryCode==="KE"?"712345678":"Enter your number"}/>
            </div>
            <span className="fieldhint">Enter only the digits after <b>+{selectedCountry.dial}</b>. The country code is added automatically.</span>
            {nationalPhone&&phoneValid&&<span className="fieldhint ok">✓ {selectedCountry.name.replace(/^\S+\s/,'')} number: +{selectedCountry.dial}{nationalDigits(nationalPhone)}</span>}
            {nationalPhone&&!phoneValid&&<span className="fieldhint bad">Check the number of digits for this country's mobile format.</span>}
            {!nationalPhone&&<span className="fieldhint">Kenya uses Co-op Paybill now. Other countries will see payment methods coming soon.</span>}
          </label>
        </>}
        {(mode==="login"||mode==="register"||mode==="forgot")&&(
          <label className="fieldlabel">Email
            <input required type="email" autoComplete="email" value={f.email} onChange={e=>setField("email",e.target.value)} placeholder="you@example.com"/>
          </label>
        )}
        {mode==="reset"&&(
          <label className="fieldlabel">Reset token
            <input required value={resetToken} onChange={e=>setResetToken(e.target.value.trim())} placeholder="Paste the reset token"/>
          </label>
        )}
        {(mode==="login"||mode==="register"||mode==="reset")&&(
          <label className="fieldlabel">Password
            <div className="passwordfield">
              <input required minLength={8} type={showPassword?"text":"password"} autoComplete={mode==="login"?"current-password":"new-password"} value={f.password} onChange={e=>setField("password",e.target.value)} placeholder={mode==="login"?"Your password":"At least 8 characters, letter + number"}/>
              <button type="button" className="passwordtoggle" aria-label={showPassword?"Hide password":"Show password"} onMouseDown={e=>e.preventDefault()} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}<span>{showPassword?"Hide":"Show"}</span></button>
            </div>
            {(mode==="register"||mode==="reset")&&f.password&&(
              <div className={`strengthmeter ${strength.cls}`}><i style={{width:`${Math.min(100,strength.score*25)}%`}}/><span>{strength.label} · use a letter and a number</span></div>
            )}
          </label>
        )}
        {(mode==="register"||mode==="reset")&&(
          <label className="fieldlabel">Confirm password
            <div className="passwordfield">
              <input required minLength={8} type={showConfirmPassword?"text":"password"} autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter password"/>
              <button type="button" className="passwordtoggle" aria-label={showConfirmPassword?"Hide confirm password":"Show confirm password"} onMouseDown={e=>e.preventDefault()} onClick={()=>setShowConfirmPassword(v=>!v)}>{showConfirmPassword?<EyeOff size={18}/>:<Eye size={18}/>}<span>{showConfirmPassword?"Hide":"Show"}</span></button>
            </div>
            {passwordMatch&&<div className="passwordmatch success">✓ Passwords match</div>}
            {passwordMismatch&&<div className="passwordmatch mismatch">✕ Passwords do not match</div>}
          </label>
        )}
        {mode==="register"&&(
          <label className="fieldlabel">Referral code <span className="optional">(optional)</span>
            <input value={f.referralCode} onChange={e=>setField("referralCode",e.target.value.toUpperCase())} placeholder={ref?"Detected from link":"Optional code"} autoComplete="off"/>
            {ref&&f.referralCode===ref.toUpperCase()&&<span className="fieldhint ok">Referral code applied from your invite link</span>}
          </label>
        )}
        {mode==="register"&&(
          <label className="termscheck">
            <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} required/>
            <span>I agree to the <a href="/terms" target="_blank" rel="noreferrer">Terms</a>, <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a href="/membership" target="_blank" rel="noreferrer">Membership Rules</a>.</span>
          </label>
        )}
        <button disabled={!canSubmit()} className="primary" type="submit">
          {busy?"Please wait…":mode==="login"?"Login securely":mode==="register"?"Create my account":mode==="forgot"?"Send reset instructions":"Update password"}
        </button>
      </form>
      {mode==="login"&&<p className="authlinks"><button type="button" className="linkbtn" onClick={()=>switchMode("forgot")}>Forgot password?</button></p>}
      {mode==="forgot"&&<p className="authlinks"><button type="button" className="linkbtn" onClick={()=>switchMode("login")}>← Back to login</button>{devResetToken&&<button type="button" className="linkbtn" onClick={()=>switchMode("reset")}>Continue with reset token</button>}</p>}
      {mode==="reset"&&<p className="authlinks"><button type="button" className="linkbtn" onClick={()=>switchMode("login")}>← Back to login</button></p>}
      {mode==="forgot"&&devResetToken&&<div className="devtokenbox"><small>Development only — email is not configured. Your reset token:</small><code>{devResetToken}</code></div>}
      {(mode==="login"||mode==="register")&&<p className="muted small">By continuing you confirm that Results depend on your qualifying activity and plan rules. Review the membership rules before activating a membership plan.</p>}
    </div>
  </div>;
}


function PublicPackagesPage(){
 const [packages,setPackages]=useState([]);
 const [loading,setLoading]=useState(true);
 const [err,setErr]=useState("");
 useEffect(()=>{
  (async()=>{
   try{
    const rows=await api("/packages");
    setPackages(Array.isArray(rows)?rows:[]);
   }catch(e){setErr(e.message||"Unable to load plans");}
   finally{setLoading(false);}
  })();
 },[]);
 const sorted=[...packages].sort((a,b)=>Number(a.tier||999)-Number(b.tier||999)||Number(a.price)-Number(b.price));
 return <div className="publicsite publicpackagespage">
  <header className="publicnav"><div className="publicbrand"><img src="/nexora-logo.png" alt=""/><div><b>NEXORA</b><small>MEMBER PLATFORM</small></div></div>
   <nav><a href="/">Home</a><a href="/packages">Plans</a><a href="/#faq">FAQ</a></nav>
   <div className="publicactions"><a className="secondary" href="/">Log in</a><a className="primary" href="/?join=1">Join NEXORA</a></div>
  </header>
  <main className="publicpackagesmain">
   <div className="sectionhead"><div><span className="pill">MEMBERSHIP</span><h1>Compare NEXORA plans</h1><p className="muted">Transparent plan pricing and benefits. Commissions are recorded only when qualifying referral purchases complete — never guaranteed income.</p></div></div>
   {loading&&<div className="nx-skel-row" aria-hidden="true"><div className="nx-skeleton nx-skel-line w60"/><div className="nx-skeleton nx-skel-card"/><div className="nx-skeleton nx-skel-card"/><div className="nx-skeleton nx-skel-card"/></div>}
   {err&&<div className="error">{err}</div>}
   {!loading&&!err&&(
    <div className="packages">
     {sorted.map((p,i)=>(
      <div className={`pkg ${p.popular?"featured":""}`} key={p.id}>
       {p.popular&&<div className="popular">{p.badge||"POPULAR"}</div>}
       <span className="pkgname">{p.name}</span>
       {p.badge&&!p.popular&&<span className="packagebadge">{p.badge}</span>}
       <div className="price">{money(p.price)}</div>
       <p className="muted small">{p.description||"Membership plan with referral tools and platform access."}</p>
       <ul className="pkgfeatures">
        {(p.features&&p.features.length?p.features:["Member dashboard","Referral link after purchase","Academy access","Wallet & support"]).map(f=><li key={f}><Check size={14}/> {f}</li>)}
       </ul>
       <div className="pkgmeta"><span>Direct commission record</span><strong>{money(p.directCommission)}</strong></div>
       <div className="pkgmeta"><span>Level 2 commission record</span><strong>{money(p.level2Commission)}</strong></div>
       <a className="primary" href="/?join=1">Join to choose this plan</a>
      </div>
     ))}
     {!sorted.length&&<p className="muted">No plans available right now.</p>}
    </div>
   )}
   <div className="earningsnotice" style={{marginTop:24}}><div><strong>Important</strong><p>Plan levels define which purchases you may be eligible to earn from. Results depend on your qualifying activity and plan rules. Review Terms and Membership Rules before paying.</p></div></div>
  </main>
  <footer className="publicfooter"><div><b>NEXORA.</b><p>Connect. Grow. Learn. Build.</p></div><div className="footerlinks"><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/membership">Membership rules</a><a href="/packages">Plans</a></div></footer>
 </div>;
}

function LegalPage({type}){
  const pages={
    terms:{
      title:"Terms of Service",
      sections:[
        ["Acceptance","By creating a NEXORA account or using the platform you agree to these Terms, the Privacy Policy and the Membership & Referral Rules."],
        ["Account responsibility","You are responsible for keeping your login details private, for the accuracy of your profile information, and for activity that occurs under your account."],
        ["Membership & payments","Use only the payment methods displayed inside your account. Paybill payments may require submission and manual verification of an M-Pesa confirmation code; supported STK Push payments are confirmed server-side. Never share your M-Pesa PIN or approve a prompt you did not initiate. Keep your transaction reference for support."],
        ["No income guarantee","Nothing on NEXORA constitutes a guarantee of income, profit or financial return. Referral commissions are recorded only when qualifying purchases and plan eligibility rules are satisfied."],
        ["Marketplace and advertising","Marketplace buyers and sellers must provide accurate listings and communicate honestly. NEXORA may review listings, orders, advertising submissions and supporting evidence. Advertising rewards are subject to eligibility, verification, displayed rates and current submission limits; submitting figures does not guarantee approval or payment."],
        ["Loans and third-party services","NEXORA may assist users to submit enquiries to third-party providers such as Balloon Ventures. NEXORA is not the lender and does not guarantee eligibility, approval, loan timing, interest rates or final terms. The provider makes the lending decision and may conduct its own checks."],
        ["Acceptable use","You must not misrepresent the platform, make guaranteed-income claims, share accounts, manipulate referrals, submit duplicate or fabricated advertising evidence, exploit payment flows, or use NEXORA for unlawful activity."],
        ["Suspension","NEXORA may suspend or restrict accounts that violate these terms, present security risk, or require review for payment or withdrawal integrity."],
        ["Contact","Questions about these terms can be raised through the in-app Help & Support centre or the published support channel."]
      ]
    },
    privacy:{
      title:"Privacy Policy",
      sections:[
        ["What we collect","Account data such as name, email, phone number, referral relationships, plan status, wallet and transaction records, support messages and basic device/session information needed to operate the service."],
        ["How we use it","To provide membership, payments, referral tracking, analytics, Academy progress, support, security and account recovery functions."],
        ["Payments","Payment methods depend on country and availability. Paybill confirmation codes may be reviewed by authorised staff, while supported STK Push payments are checked server-side. NEXORA does not ask for or store your M-Pesa PIN."],
        ["Sharing","We share information only where needed to operate NEXORA: with payment and hosting providers, authorised support or finance staff, and marketplace counterparties when required to fulfil an order. We may disclose information where required by law. We do not sell personal data."],
        ["Security","Access is limited to operational needs. You should use a strong unique password and never share it with anyone, including people claiming to be support."],
        ["Activity and device data","We may process marketplace listings and orders, advertising post links and uploaded proof, Academy progress, support messages, security events, and optional push-notification subscriptions. Push notifications can be disabled in your device or browser settings."],
        ["Retention","We keep account and transaction records for as long as needed to operate the platform, meet legal obligations, prevent abuse and resolve disputes. Access to records should be limited to authorised operational needs."],
        ["Your choices","You may update profile details in the Security Centre and contact support for account-related requests."]
      ]
    },
    membership:{
      title:"Membership & Referral Rules",
      sections:[
        ["Plan eligibility","Starter can earn from Starter purchases; Growth from Starter + Growth; Pro from Starter + Growth + Pro; Elite from Starter through Elite; Premium from all five plans. Commission amounts come from the plan purchased by the referral."],
        ["Recorded commissions only","Commissions are recorded when a qualifying referral purchase completes and your plan level is eligible. The UI describes eligibility and recorded outcomes — never guaranteed income."],
        ["Upgrades","Upgrading charges only the price difference between your current plan and the new plan."],
        ["Withdrawals","Withdrawal requests depend on available balance, plan withdrawal limits, account checks and payment-provider availability. The wallet amount deducted, fees and expected net payout are shown before submission where applicable. A request is not considered paid until its status confirms completion."],
        ["Advertising submissions","Advertising submissions are limited to two within a rolling seven-day period. Provide the public post URL and required media or proof. Duplicate links, unusual metrics, missing evidence or policy violations may be rejected. Approved payouts follow the schedule and conditions displayed in NEXORA."],
        ["Referrals","Your personal referral code/link attributes new members who register with it. Level 1 and Level 2 structures follow the platform configuration."],
        ["Fair use","Artificial inflation of referrals, misleading promotion, or abuse of payment flows may result in commission adjustments or account restrictions."],
        ["Changes","NEXORA may update plan prices, commission parameters and platform features. Material changes will be reflected in the live product and, where appropriate, announcements."]
      ]
    }
  };
  const page=pages[type]||pages.terms;
  return <div className="legalpage"><div className="legalcard">
    <div className="memberbrand"><img src="/nexora-logo.png" alt=""/><div><div className="brand">NEXORA<span>.</span></div><small>MEMBER PLATFORM</small></div></div>
    <span className="pill">NEXORA POLICY</span>
    <h1>{page.title}</h1>
    {page.sections.map(([h,t])=><div key={h} className="legalsection"><h3>{h}</h3><p>{t}</p></div>)}
    <h3>Questions?</h3>
    <p>Contact NEXORA support through the member Help & Support centre.</p>
    <a className="secondary" href="/">← Back to NEXORA</a>
  </div></div>;
}


const adminApi=async(path,opts={})=>{const token=localStorage.getItem("adminToken");const r=await fetch(API+path,{...opts,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})}});const d=await r.json().catch(()=>({}));if(!r.ok){const error=new Error(d.message||"Admin request failed");error.status=r.status;throw error}return d};

function decodeVapidPublicKey(value){const padded=String(value||"").padEnd(Math.ceil(String(value||"").length/4)*4,"=").replace(/-/g,"+").replace(/_/g,"/");const raw=atob(padded);return Uint8Array.from(raw,c=>c.charCodeAt(0));}
function PushNotificationToggle({audience="member",compact=false}){
 const [status,setStatus]=useState({loading:true,enabled:false,subscribed:false,permission:typeof Notification!=="undefined"?Notification.permission:"unsupported"});
 const [busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const admin=audience==="admin";
 const call=admin?adminApi:api;
 const statusPath=admin?"/admin/push/status":"/push/status";
 const subscribePath=admin?"/admin/push/subscribe":"/push/subscribe";
 const unsubscribePath=admin?"/admin/push/unsubscribe":"/push/unsubscribe";
 const refresh=async()=>{
   const permission=typeof Notification!=="undefined"?Notification.permission:"unsupported";
   let enabled=false,subscribed=false;
   try{const cfg=await fetch(API+"/push/public-key").then(r=>r.json());enabled=Boolean(cfg.enabled);const st=await call(statusPath);subscribed=Boolean(st.subscribed)&&enabled;}catch{}
   setStatus({loading:false,enabled,subscribed,permission});
 };
 useEffect(()=>{let alive=true;(async()=>{const permission=typeof Notification!=="undefined"?Notification.permission:"unsupported";let enabled=false,subscribed=false;try{const cfg=await fetch(API+"/push/public-key").then(r=>r.json());enabled=Boolean(cfg.enabled);const st=await call(statusPath);subscribed=Boolean(st.subscribed)&&enabled;}catch{}if(alive)setStatus({loading:false,enabled,subscribed,permission});})();return()=>{alive=false}},[audience]);
 const toggle=async()=>{
   if(busy)return;setBusy(true);setMessage("");
   try{
     if(!("serviceWorker" in navigator)||!("Notification" in window)||!("PushManager" in window))throw new Error("This browser does not support background push notifications. Try installing NEXORA or use a supported browser.");
     const cfg=await fetch(API+"/push/public-key").then(r=>r.json());if(!cfg.enabled||!cfg.publicKey)throw new Error("Phone push is not configured on the NEXORA server yet. The site administrator must add the VAPID keys to Render.");
     const reg=await navigator.serviceWorker.register("/sw.js");const ready=await navigator.serviceWorker.ready;let sub=await ready.pushManager.getSubscription();
     if(status.subscribed){
       if(!sub)throw new Error("This browser no longer has the saved push subscription. Refresh settings and try again.");
       const result=await call(unsubscribePath,{method:"POST",body:JSON.stringify({endpoint:sub.endpoint})});
       if(result.unsubscribeBrowser)await sub.unsubscribe();
       setStatus(x=>({...x,subscribed:false,permission:Notification.permission}));setMessage("Phone notifications disabled for this account on this device.");
     }else{
       const permission=await Notification.requestPermission();if(permission!=="granted"){setStatus(x=>({...x,permission}));throw new Error(permission==="denied"?"Notifications are blocked by the browser. Allow them in site settings and try again.":"Notification permission was not granted.");}
       if(!sub)sub=await ready.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decodeVapidPublicKey(cfg.publicKey)});
       await call(subscribePath,{method:"POST",body:JSON.stringify(sub.toJSON())});
       setStatus(x=>({...x,enabled:true,subscribed:true,permission}));setMessage("Phone notifications enabled on this device. You can receive important NEXORA updates even when the site is closed.");
     }
   }catch(e){setMessage(e.message||"Unable to update notification settings.");await refresh();}finally{setBusy(false)}
 };
 const disabled=status.loading||busy||!status.enabled;
 if(compact)return <button type="button" className="push-notification-compact secondary" onClick={toggle} disabled={disabled} title={status.enabled?(status.subscribed?"Disable phone notifications":"Enable phone notifications"):(status.loading?"Checking push notification setup":"Server push setup is required")}><Bell size={14}/>{busy?"Saving…":status.subscribed?"Phone alerts on":status.enabled?"Enable phone alerts":"Phone alerts setup needed"}</button>;
 return <div className="panel nx-push-settings"><div className="nx-push-settings-icon"><Bell size={21}/></div><div className="nx-push-settings-copy"><h3>Phone notifications</h3><p className="muted">Receive important NEXORA updates, payment or order status changes, project messages and occasional announcements even when the website is closed. Push alerts only go to devices you enable.</p><small>{status.loading?"Checking notification setup…":!status.enabled?"Background push needs VAPID keys on the NEXORA server.":status.subscribed?"Enabled on this device.":status.permission==="denied"?"Blocked in browser settings.":"Not enabled on this device yet."}</small></div><button type="button" className={status.subscribed?"secondary":"primary"} onClick={toggle} disabled={disabled}>{busy?"Please wait…":status.subscribed?"Disable on this device":"Enable phone alerts"}</button>{message&&<div className="nx-push-settings-message" role="status">{message}</div>}</div>;
}
const downloadAdminCsv=async(type)=>{const token=localStorage.getItem("adminToken");const r=await fetch(API+`/admin/export/${type}`,{headers:{Authorization:`Bearer ${token}`}});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||"Export failed")}const blob=await r.blob();const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`nexora-${type}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href)};
function AdminLogin({onLogin}){const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[code,setCode]=useState(""),[challenge,setChallenge]=useState(""),[showEmail,setShowEmail]=useState(false),[showPassword,setShowPassword]=useState(false),[recoveryMode,setRecoveryMode]=useState(false),[err,setErr]=useState(""),[busy,setBusy]=useState(false);const finish=d=>{localStorage.setItem("adminToken",d.token);onLogin(d.admin)};const submit=async e=>{e.preventDefault();setErr("");setBusy(true);try{if(challenge){const d=await adminApi("/admin/auth/verify-2fa",{method:"POST",body:JSON.stringify({challenge,...(recoveryMode?{recoveryCode:code}:{code})})});finish(d)}else{const d=await adminApi("/admin/auth/login",{method:"POST",body:JSON.stringify({email,password})});if(d.requires2fa){setChallenge(d.challenge);setErr("")}else finish(d)}}catch(e){setErr(e.message)}finally{setBusy(false)}};return <div className="adminauth"><div className="adminloginbox"><div className="adminlogo"><img src="/nexora-logo.png"/><div><div className="brand">NEXORA<span>.</span></div><span>ADMIN CONTROL</span></div></div><div className="adminloginintro"><div className="adminshield"><LockKeyhole size={25}/></div><div><span className="adminsecurepill"><ShieldCheck size={12}/> SECURE CONSOLE</span><h1>{challenge?"Verify administrator":"Administrator login"}</h1><p className="muted">{challenge?"Enter the 6-digit code from your authenticator app.":"Secure access to users, payments, withdrawals and plans."}</p></div></div>{err&&<div className="error">{err}</div>}{!challenge?<form className="adminloginform" onSubmit={submit}><label className="adminfield"><span>Email address</span><div className="admininputwrap"><Mail size={17}/><input required type={showEmail?"text":"email"} autoComplete="username" placeholder="admin@yourdomain.com" value={email} onChange={e=>setEmail(e.target.value)}/></div></label><label className="adminfield"><span>Password</span><div className="admininputwrap has-toggle"><KeyRound size={17}/><input required type={showPassword?"text":"password"} autoComplete="current-password" placeholder="Enter your admin password" value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" className="adminpasswordtoggle" aria-label={showPassword?"Hide password":"Show password"} onMouseDown={e=>e.preventDefault()} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}<span>{showPassword?"Hide":"Show"}</span></button></div></label><button disabled={busy} className="primary adminloginbtn"><LogIn size={17}/>{busy?"Signing in…":"Sign in securely"}<span className="adminbtnshine"/></button></form>:<form className="adminloginform" onSubmit={submit}><label className="adminfield"><span>{recoveryMode?"Recovery code":"Authenticator code"}</span><div className="admininputwrap codeinput"><ShieldCheck size={17}/><input autoFocus inputMode={recoveryMode?"text":"numeric"} pattern={recoveryMode?undefined:"[0-9]{6}"} maxLength={recoveryMode?17:6} required placeholder={recoveryMode?"AB12CD34-EF56GH78":"123456"} value={code} onChange={e=>setCode(recoveryMode?e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g,"").slice(0,17):e.target.value.replace(/\D/g,"").slice(0,6))}/></div></label><button disabled={busy||(!recoveryMode&&code.length!==6)|| (recoveryMode&&code.replace(/[^A-Z0-9]/g,"").length<8)} className="primary adminloginbtn"><ShieldCheck size={17}/>{busy?"Verifying…":recoveryMode?"Use recovery code":"Verify & enter console"}</button><button type="button" className="secondary wide adminsecondarybtn" onClick={()=>{setRecoveryMode(v=>!v);setCode("");setErr("")}}>{recoveryMode?"Use authenticator code":"Use a recovery code"}</button><button type="button" className="secondary wide adminsecondarybtn" onClick={()=>{setChallenge("");setCode("");setRecoveryMode(false);setErr("")}}>Back to login</button></form>}<a className="adminback" href="/">← Back to member login</a></div></div>}

function AdminMissionControl(){
 const [data,setData]=useState(null),[busy,setBusy]=useState(true),[error,setError]=useState("");
 const load=async()=>{setBusy(true);setError("");try{const [overview,reliability,health,reconciliation]=await Promise.all([adminApi("/admin/overview"),adminApi("/admin/reliability"),adminApi("/admin/system-health"),adminApi("/admin/reconciliation")]);setData({overview,reliability,health,reconciliation})}catch(e){setError(e.message||"Unable to load Mission Control.")}finally{setBusy(false)}};
 useEffect(()=>{load();const timer=window.setInterval(()=>load(),60000);return()=>window.clearInterval(timer)},[]);
 const go=id=>{const u=new URL(window.location.href);u.searchParams.set("adminPage",id);window.history.pushState({...window.history.state,nexoraAdminPage:id},"",u);window.dispatchEvent(new PopStateEvent("popstate"))};
 const o=data?.overview||{},r=data?.reliability||{},h=data?.health||{},c=data?.reconciliation||{};
 const issues=Number(r.stalePendingPayments||0)+Number(r.staleWithdrawals||0)+Number(r.brokenReferralLinks||0)+Number(r.duplicateTransactionReferences||0)+Number(r.unresolvedTickets||0);
 return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">NEXORA MISSION CONTROL</span><h1>Operations at a glance</h1><p className="muted">One place for service health, financial exceptions, daily reconciliation and growth signals.</p></div><button className="secondary" disabled={busy} onClick={load}><RefreshCw size={16}/>{busy?"Checking…":"Refresh all checks"}</button></div>{error&&<div className="error" role="alert">{error}<button className="secondary" onClick={load}>Retry</button></div>}
 {data&&<><div className="adminstats"><div className="adminstat"><Activity size={19}/><span>API / database</span><strong>{h.ok&&h.database==="online"?"Healthy":"Investigate"}</strong></div><div className="adminstat"><AlertTriangle size={19}/><span>Open reliability flags</span><strong>{issues}</strong></div><div className="adminstat"><UsersRound size={19}/><span>Members</span><strong>{Number(o.users||0).toLocaleString()}</strong></div><div className="adminstat"><UserCheck size={19}/><span>Active members</span><strong>{Number(o.activeUsers||0).toLocaleString()}</strong></div><div className="adminstat"><Clock3 size={19}/><span>Pending payments</span><strong>{Number(r.pendingTransactions||0).toLocaleString()}</strong></div><div className="adminstat"><LifeBuoy size={19}/><span>Open support cases</span><strong>{Number(r.unresolvedTickets||0).toLocaleString()}</strong></div></div>
 <div className="adminpanel"><div className="adminsectionhead"><div><h3>Needs attention</h3><p className="muted">Read-only indicators. Review the underlying record before making any financial or account change.</p></div><span className={issues?"adminstatus suspended":"adminstatus active"}>{issues?"REVIEW REQUIRED":"NO FLAGS REPORTED"}</span></div><div className="adminquick"><button className="secondary" onClick={()=>go("transactions")}>Stale payments · {r.stalePendingPayments||0}</button><button className="secondary" onClick={()=>go("withdrawals")}>Stale withdrawals · {r.staleWithdrawals||0}</button><button className="secondary" onClick={()=>go("users")}>Broken referrals · {r.brokenReferralLinks||0}</button><button className="secondary" onClick={()=>go("support")}>Open support · {r.unresolvedTickets||0}</button><button className="secondary" onClick={()=>go("health")}>Full system health</button></div></div>
 <div className="adminpanel"><div className="adminsectionhead"><div><h3>Daily reconciliation snapshot</h3><p className="muted">Internal records grouped by status for today, with a seven-day growth view.</p></div><span className="pill">Read only</span></div><div className="adminstats"><div className="adminstat"><ReceiptText size={18}/><span>Successful package purchases · 7d</span><strong>{Number(c.growth?.successfulPackagePurchasesLast7Days||0).toLocaleString()}</strong></div><div className="adminstat"><WalletCards size={18}/><span>Package amount · 7d</span><strong>{money(c.growth?.successfulPackageAmountLast7Days||0)}</strong></div><div className="adminstat"><UsersRound size={18}/><span>New members · 7d</span><strong>{Number(c.growth?.newMembersLast7Days||0).toLocaleString()}</strong></div><div className="adminstat"><HandCoins size={18}/><span>Commissions recorded today</span><strong>{money(c.commissionsToday?.amount||0)}</strong></div></div><div className="table"><div className="row"><b>Transactions today</b><b>Status</b><b>Type</b><b>Count</b><b>Amount</b></div>{(c.transactionsToday||[]).map((x,i)=><div className="row" key={x.status+"-"+x.type+"-"+i}><span>{x.status}</span><span>{x.status}</span><span>{String(x.type).replaceAll("_"," ")}</span><span>{x.count}</span><strong>{money(x.amount)}</strong></div>)}{!(c.transactionsToday||[]).length&&<p className="muted">No transactions recorded today.</p>}</div><p className="muted small">{c.disclaimer||"Internal snapshot only. Confirm provider settlement separately."}</p><button className="secondary" onClick={()=>go("health")}>Open detailed reliability checks <ArrowRight size={15}/></button></div>
 <div className="adminpanel"><h3>Release and performance readiness</h3><div className="adminquick"><span><CheckCircle2 size={15}/> API response checked</span><span>{h.database==="online"?<CheckCircle2 size={15}/>:<AlertTriangle size={15}/>} Database: {h.database||"unknown"} ({h.databaseMs??"—"} ms)</span><span><Activity size={15}/> Runtime memory: {h.memoryMb??"—"} MB</span><span><Clock3 size={15}/> Last check: {h.time?new Date(h.time).toLocaleString():"not available"}</span></div><p className="muted small">A healthy runtime does not replace the automated frontend build, backend syntax, APK build, or on-device smoke tests. A successful build is not proof of live payment settlement.</p></div></>}
 </section>;
}
function AdminSystemHealth(){const [data,setData]=useState(null),[reliability,setReliability]=useState(null),[loading,setLoading]=useState(true),[err,setErr]=useState("");const load=async()=>{setLoading(true);try{const [health,checks]=await Promise.all([adminApi("/admin/system-health"),adminApi("/admin/reliability")]);setData(health);setReliability(checks);setErr("")}catch(e){setErr(e.message)}finally{setLoading(false)}};useEffect(()=>{load()},[]);if(loading&&!data)return <section className="adminsection"><div className="panel"><p>Checking NEXORA services…</p></div></section>;return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">SYSTEM HEALTH</span><h1>System status</h1><p className="muted">API, database, payment configuration and read-only reliability checks.</p></div><button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh checks</button></div>{err&&<div className="error">{err}</div>} {data&&<><div className="adminstats"><div className="adminstat"><CheckCircle2 size={19}/><span>API</span><strong>{data.ok?"Online":"Issue"}</strong></div><div className="adminstat"><ShieldCheck size={19}/><span>Database</span><strong>{data.database}</strong></div><div className="adminstat"><WalletCards size={19}/><span>Co-op Paybill</span><strong>{data.paybill?"Configured":"Missing"}</strong></div><div className="adminstat"><CreditCard size={19}/><span>Paystack</span><strong>{data.paystack?data.paystackMode:"Off"}</strong></div><div className="adminstat"><MessageCircle size={19}/><span>Email</span><strong>{data.resend?"Configured":"Off"}</strong></div><div className="adminstat"><Bot size={19}/><span>NexBot</span><strong>{data.nexbot?"Configured":"Fallback"}</strong></div></div><div className="adminpanel"><h3>Runtime</h3><div className="adminquick"><span>Version {data.version}</span><span>Node {data.node}</span><span>Uptime {Math.floor(Number(data.uptime||0)/3600)}h {Math.floor(Number(data.uptime||0)%3600/60)}m</span><span>Memory {data.memoryMb} MB</span><span>DB {data.databaseMs} ms</span><span>Environment {data.environment}</span></div></div></>}{reliability&&<div className="adminpanel"><div className="adminsectionhead"><div><h3>Reliability watch</h3><p className="muted">Read-only checks. These figures flag items for review; they do not alter money or member records.</p></div><span className="pill">Checked {new Date(reliability.checkedAt).toLocaleTimeString()}</span></div><div className="adminstats"><div className="adminstat"><Clock3 size={18}/><span>Pending transactions</span><strong>{reliability.pendingTransactions}</strong></div><div className="adminstat"><AlertTriangle size={18}/><span>Payments pending 15+ min</span><strong>{reliability.stalePendingPayments}</strong></div><div className="adminstat"><Ban size={18}/><span>Failed payments · 24h</span><strong>{reliability.failedTransactionsLast24h}</strong></div><div className="adminstat"><WalletCards size={18}/><span>Pending withdrawals</span><strong>{reliability.pendingWithdrawals}</strong></div><div className="adminstat"><AlertTriangle size={18}/><span>Withdrawals pending 15+ min</span><strong>{reliability.staleWithdrawals}</strong></div><div className="adminstat"><UsersRound size={18}/><span>Broken referral links</span><strong>{reliability.brokenReferralLinks}</strong></div><div className="adminstat"><ReceiptText size={18}/><span>Duplicate transaction references</span><strong>{reliability.duplicateTransactionReferences}</strong></div><div className="adminstat"><LifeBuoy size={18}/><span>Unresolved support tickets</span><strong>{reliability.unresolvedTickets}</strong></div></div><p className="muted small">Next: investigate stale payments/withdrawals and referral issues in their respective admin sections. Duplicate-reference checks cover the transaction table only.</p></div>}</section>}
function AdminLoginActivity(){const [rows,setRows]=useState([]),[loading,setLoading]=useState(true);const load=async()=>{setLoading(true);try{setRows(await adminApi("/admin/login-events"))}catch(e){alert(e.message)}finally{setLoading(false)}};useEffect(()=>{load()},[]);return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">SECURITY MONITOR</span><h1>Admin login activity</h1><p className="muted">Recent successful and failed administrator authentication attempts.</p></div><button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div><div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Email</span><span>Result</span><span>IP</span><span>Device</span><span>Date</span></div>{loading?<div className="adminempty">Loading login activity…</div>:rows.map(x=><div className="adminrow" key={x.id}><div><b>{x.email}</b></div><em className={`adminstatus ${x.success?"active":"suspended"}`}>{x.success?"SUCCESS":"FAILED"}</em><span>{x.ip||"—"}</span><small>{x.userAgent||"—"}</small><small>{new Date(x.createdAt).toLocaleString()}</small></div>)}{!loading&&!rows.length&&<div className="adminempty">No login events recorded.</div>}</div></div></section>}
function AdminPaymentConfig(){const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[saving,setSaving]=useState("");const load=async()=>{setLoading(true);try{setRows(await adminApi("/admin/payment-config"))}catch(e){alert(e.message)}finally{setLoading(false)}};useEffect(()=>{load()},[]);const save=async row=>{setSaving(row.countryCode);try{await adminApi(`/admin/payment-config/${row.countryCode}`,{method:"PATCH",body:JSON.stringify({provider:row.provider,method:row.method,enabled:row.enabled})});await load()}catch(e){alert(e.message)}finally{setSaving("")}};return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">PAYMENT CONTROL</span><h1>Country payment configuration</h1><p className="muted">Payment readiness is separated from registration. Enable a country only after its provider is actually configured.</p></div><button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div><div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Country</span><span>Provider</span><span>Method</span><span>Status</span><span>Action</span></div>{loading?<div className="adminempty">Loading payment configuration…</div>:rows.map(x=><div className="adminrow" key={x.countryCode}><div><b>{x.countryName}</b><small>+{x.dial}</small></div><input value={x.provider} onChange={e=>setRows(rows.map(r=>r.countryCode===x.countryCode?{...r,provider:e.target.value}:r))}/><input value={x.method} onChange={e=>setRows(rows.map(r=>r.countryCode===x.countryCode?{...r,method:e.target.value}:r))}/><label className="checkline"><input type="checkbox" checked={!!x.enabled} onChange={e=>setRows(rows.map(r=>r.countryCode===x.countryCode?{...r,enabled:e.target.checked}:r))}/>{x.enabled?"Enabled":"Coming soon"}</label><button className="rowaction" disabled={saving===x.countryCode} onClick={()=>save(x)}>{saving===x.countryCode?"Saving…":"Save"}</button></div>)}</div></div><div className="notice"><ShieldCheck size={16}/> This console controls readiness metadata. Actual payment activation still requires the corresponding server integration and credentials.</div></section>}
function AdminSecurity(){const [setup,setSetup]=useState(null),[code,setCode]=useState(""),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false),[twofa,setTwofa]=useState(false),[recoveryCodes,setRecoveryCodes]=useState(null);const load=async()=>{try{const d=await adminApi("/admin/me");setTwofa(Boolean(d.admin?.twoFactorEnabled))}catch{}};useEffect(()=>{load()},[]);const begin=async()=>{setBusy(true);setMsg("");try{setSetup(await adminApi("/admin/security/2fa/setup",{method:"POST"}))}catch(e){setMsg(e.message)}finally{setBusy(false)}};const verify=async()=>{setBusy(true);try{const d=await adminApi("/admin/security/2fa/verify",{method:"POST",body:JSON.stringify({code})});setMsg(d.message);setTwofa(true);setSetup(null);setCode("");setRecoveryCodes(d.recoveryCodes||[])}catch(e){setMsg(e.message)}finally{setBusy(false)}};const regenerate=async()=>{if(!window.confirm("Generate new recovery codes? All previous recovery codes will stop working."))return;setBusy(true);try{const d=await adminApi("/admin/security/2fa/recovery-codes/regenerate",{method:"POST",body:JSON.stringify({code})});setMsg(d.message);setCode("");setRecoveryCodes(d.recoveryCodes||[])}catch(e){setMsg(e.message)}finally{setBusy(false)}};const disable=async()=>{setBusy(true);try{const d=await adminApi("/admin/security/2fa/disable",{method:"POST",body:JSON.stringify({code})});setMsg(d.message);setTwofa(false);setCode("");setRecoveryCodes(null)}catch(e){setMsg(e.message)}finally{setBusy(false)}};const logoutAll=async()=>{setBusy(true);try{const d=await adminApi("/admin/auth/logout-all",{method:"POST"});if(d.token)localStorage.setItem("adminToken",d.token);setMsg(d.message)}catch(e){setMsg(e.message)}finally{setBusy(false)}};const copyCodes=async()=>{if(!recoveryCodes?.length)return;await navigator.clipboard?.writeText(recoveryCodes.join("\n"));setMsg("Recovery codes copied to clipboard. Store them somewhere secure.")};const downloadCodes=()=>{if(!recoveryCodes?.length)return;const blob=new Blob([`NEXORA ADMIN RECOVERY CODES\n\n${recoveryCodes.join("\n")}\n\nEach code can be used once. Keep these codes offline and secure.`],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="nexora-admin-recovery-codes.txt";a.click();URL.revokeObjectURL(a.href)};return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">ADMIN SECURITY</span><h1>Security center</h1><p className="muted">Protect administrator access, recover safely if a phone is lost, and end old sessions when needed.</p></div><ShieldCheck size={22}/></div>{msg&&<div className="notice">{msg}</div>}{recoveryCodes?.length>0&&<div className="panel recoverypanel"><h3>⚠️ Save your recovery codes now</h3><p className="muted">These codes are shown only once. Each code works once and generating a new set invalidates the previous set.</p><div className="recoverycodes">{recoveryCodes.map(c=><code key={c}>{c}</code>)}</div><div className="buttonrow"><button className="secondary" onClick={copyCodes}>Copy codes</button><button className="secondary" onClick={downloadCodes}>Download codes</button><button className="secondary" onClick={()=>setRecoveryCodes(null)}>I've saved them</button></div></div>}<div className="securitygrid"><div className="panel"><ShieldCheck size={24}/><h3>Two-factor authentication</h3><p className="muted">Use an authenticator app for a second login step.</p><div className={`adminstatus ${twofa?"active":"suspended"}`}>{twofa?"ENABLED":"NOT ENABLED"}</div>{!twofa&&!setup&&<button className="primary" disabled={busy} onClick={begin}>{busy?"Preparing…":"Set up 2FA"}</button>}{setup&&<div className="adminedit"><p className="muted">Add this account to Google Authenticator, Microsoft Authenticator or another TOTP app.</p><img className="qrcode" alt="Authenticator setup QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(setup.otpauth)}`}/><label>Secret<input readOnly value={setup.secret}/></label><label>6-digit code<input inputMode="numeric" maxLength="6" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/></label><button className="primary" disabled={busy||code.length!==6} onClick={verify}>Verify and enable</button></div>}{twofa&&<div className="adminedit"><label>Current authenticator code<input inputMode="numeric" maxLength="6" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/></label><button className="rowaction" disabled={busy||code.length!==6} onClick={regenerate}>Generate new recovery codes</button><button className="rowaction dangeraction" disabled={busy||code.length!==6} onClick={disable}>Disable 2FA</button></div>}</div><div className="panel"><LogOut size={24}/><h3>End other admin sessions</h3><p className="muted">If you suspect an old browser or device is still signed in, invalidate all other administrator tokens.</p><button className="secondary" disabled={busy} onClick={logoutAll}>Sign out other sessions</button></div></div></section>}
function AdminManagement({action,busy=false}){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[editing,setEditing]=useState(null),[form,setForm]=useState({name:"",email:"",password:"",role:"ADMIN"}),[creating,setCreating]=useState(false);
 const load=async()=>{setLoading(true);setError("");try{setRows(await adminApi("/admin/admins"))}catch(e){setError(e.message)}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const save=async()=>{if(!form.name.trim()||!form.email.trim()||(!editing&&!form.password)){setError("Name, email and password are required");return} const ok=await action(()=>editing?adminApi(`/admin/admins/${editing.id}`,{method:"PATCH",body:JSON.stringify({name:form.name,role:form.role,...(form.password?{password:form.password}:{})})}):adminApi("/admin/admins",{method:"POST",body:JSON.stringify(form)}),editing?"Administrator updated":"Administrator created");if(ok){setEditing(null);setCreating(false);setForm({name:"",email:"",password:"",role:"ADMIN"});await load()}};
 const toggle=async a=>{const next=a.status==="ACTIVE"?"SUSPENDED":"ACTIVE";await action(()=>adminApi(`/admin/admins/${a.id}`,{method:"PATCH",body:JSON.stringify({status:next})}),next==="ACTIVE"?"Administrator activated":"Administrator suspended");await load()};
 const remove=async a=>{if(!window.confirm(`Remove administrator ${a.email}? This cannot be undone.`))return;await action(()=>adminApi(`/admin/admins/${a.id}`,{method:"DELETE"}),"Administrator removed");await load()};
 const openEdit=a=>{setEditing(a);setCreating(false);setForm({name:a.name,email:a.email,password:"",role:a.role})};
 const roles={SUPER_ADMIN:"Super Admin",ADMIN:"Admin",FINANCE_ADMIN:"Finance Admin",SUPPORT_ADMIN:"Support Admin",CONNECT_ADMIN:"Internet Services Admin · bundles only"};
 return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">ADMINISTRATION</span><h1>Administrator accounts</h1><p className="muted">Create separate admin logins, assign roles and control access without sharing passwords.</p></div><button className="primary" onClick={()=>{setCreating(true);setEditing(null);setForm({name:"",email:"",password:"",role:"ADMIN"})}}><UserCog size={16}/> Add administrator</button></div>
 <div className="adminpanel"><h3>Role permissions</h3><div className="adminquick"><span><ShieldCheck size={14}/> Super Admin · full control</span><span><UsersRound size={14}/> Admin · member and platform management</span><span><WalletCards size={14}/> Finance Admin · payments, wallet and withdrawals</span><span><LifeBuoy size={14}/> Support Admin · support and member assistance</span><span><Wifi size={14}/> Internet Services Admin · bundle orders, payment references and fulfilment only</span></div></div>
 {(creating||editing)&&<div className="adminpanel adminedit"><h3>{editing?"Edit administrator":"Create administrator"}</h3><div className="formgrid"><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Email<input type="email" disabled={!!editing} value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="ADMIN">Admin</option><option value="FINANCE_ADMIN">Finance Admin</option><option value="SUPPORT_ADMIN">Support Admin</option><option value="CONNECT_ADMIN">Internet Services Admin — bundles only</option><option value="SUPER_ADMIN">Super Admin</option></select>{form.role==="CONNECT_ADMIN"&&<small className="muted">This account will see only the Internet Services menu and can manage bundle orders, payment checks and fulfilment.</small>}</label><label>{editing?"New password (optional)":"Password"}<input type="password" minLength="10" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 10 characters"/></label></div><div className="rowactions"><button className="secondary" onClick={()=>{setCreating(false);setEditing(null)}}>Cancel</button><button className="primary" disabled={busy} onClick={save}><KeyRound size={15}/>{editing?"Save changes":"Create administrator"}</button></div></div>}
 <div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Administrator</span><span>Role</span><span>Status</span><span>Created</span><span>Actions</span></div>{loading?<div className="adminempty">Loading administrators…</div>:rows.map(a=><div className="adminrow" key={a.id}><div><b>{a.name}</b><small>{a.email}</small></div><span>{roles[a.role]||a.role}</span><em className={`adminstatus ${String(a.status).toLowerCase()}`}>{a.status}</em><small>{new Date(a.createdAt).toLocaleString()}</small><div className="rowactions"><button className="rowaction" onClick={()=>openEdit(a)}><Settings2 size={13}/> Edit</button><button className={`rowaction ${a.status==="ACTIVE"?"dangeraction":"successaction"}`} onClick={()=>toggle(a)}>{a.status==="ACTIVE"?<><Ban size={13}/> Suspend</>:<><UserCheck size={13}/> Activate</>}</button><button className="rowaction dangeraction" onClick={()=>remove(a)} disabled={rows.length===1}><Trash2 size={13}/> Remove</button></div></div>)}{!loading&&!rows.length&&<div className="adminempty">No administrator accounts.</div>}</div></div></section>}

function AdminNotificationCenter({admin,onNavigate}){
 const [rows,setRows]=useState([]),[unread,setUnread]=useState(0),[open,setOpen]=useState(false),[toast,setToast]=useState(null);
 const initialized=useRef(false),seenIds=useRef(new Set()),toastTimer=useRef(null);
 useEffect(()=>{
   let alive=true;
   const load=async()=>{
     try{
       const result=await adminApi("/admin/notifications");
       if(!alive)return;
       const next=Array.isArray(result.notifications)?result.notifications:[];
       const fresh=initialized.current?next.filter(n=>!seenIds.current.has(n.id)):[];
       if(fresh.length){
         const newestFresh=fresh[0];
         setToast(newestFresh);
         if(toastTimer.current)clearTimeout(toastTimer.current);
         toastTimer.current=setTimeout(()=>{if(alive)setToast(null)},8500);
         try{if("Notification" in window&&window.Notification.permission==="granted")new window.Notification(newestFresh.title,{body:newestFresh.message,icon:"/nexora-logo.png"})}catch{}
       }
       next.forEach(n=>seenIds.current.add(n.id));
       initialized.current=true;
       setRows(next);setUnread(Number(result.unreadCount||0));
     }catch{/* Keep the admin console usable if notifications are temporarily unavailable. */}
   };
   initialized.current=false;seenIds.current=new Set();load();
   const timer=setInterval(load,15000);
   return()=>{alive=false;clearInterval(timer);if(toastTimer.current)clearTimeout(toastTimer.current)};
 },[admin?.id]);
 const destination=n=>{
   const d=n?.details||{};
   if(d.destinationPage)return d.destinationPage;
   if(n?.type==="CONNECT_ORDER")return "connectorders";
   if(n?.type==="PAYMENT_CONFIRMATION")return d.paymentKind==="WALLET_DEPOSIT"?"deposits":"paybillverify";
   if(n?.type==="PLAN_PURCHASE")return "transactions";
   if(n?.type==="PROJECT_REQUEST")return "serviceRequests";
   return "overview";
 };
 const go=async n=>{
   if(!n)return;
   setToast(null);setOpen(false);
   try{await adminApi(`/admin/notifications/${encodeURIComponent(n.id)}/read`,{method:"POST"});setRows(old=>old.map(x=>x.id===n.id?{...x,read:true}:x));setUnread(old=>Math.max(0,old-(n.read?0:1)))}catch{}
   onNavigate(destination(n));
 };
 const readAll=async()=>{try{await adminApi("/admin/notifications/read-all",{method:"POST"});setRows(old=>old.map(x=>({...x,read:true})));setUnread(0)}catch{}};
 return <div className="admin-notice-center">
   <PushNotificationToggle audience="admin" compact/>
   <button type="button" className="header-icon-btn admin-notifications-button" aria-label={`Admin notifications, ${unread} unread`} title="Admin notifications" onClick={()=>setOpen(v=>!v)}><Bell size={18}/>{unread>0&&<span>{Math.min(unread,99)}</span>}</button>
   {open&&<><button className="admin-notice-backdrop" aria-label="Close notifications" onClick={()=>setOpen(false)}/><div className="admin-notice-popover"><div className="admin-notice-head"><div><span className="pill">ADMIN ALERTS</span><h3>Needs your attention</h3><small>{unread} unread notification{unread===1?"":"s"}</small></div><button className="iconbtn" onClick={()=>setOpen(false)} aria-label="Close"> <X size={16}/> </button></div><div className="admin-notice-list">{rows.slice(0,20).map(n=><button type="button" className={`admin-notice-row ${n.read?"":"unread"}`} key={n.id} onClick={()=>go(n)}><span className={`admin-notice-icon ${String(n.type).toLowerCase()}`}>{n.type==="CONNECT_ORDER"?<Wifi size={16}/>:n.type==="PROJECT_REQUEST"?<Wrench size={16}/>:(n.type==="PAYMENT_CONFIRMATION"||n.type==="PLAN_PURCHASE")?<WalletCards size={16}/>:<Bell size={16}/>}</span><span className="admin-notice-copy"><b>{n.title}</b><small>{n.message}</small><time>{n.createdAt?new Date(n.createdAt).toLocaleString():"Just now"}</time></span>{!n.read&&<i className="admin-notice-dot"/>}</button>)}{!rows.length&&<p className="admin-notice-empty">No admin alerts yet. New bundle orders, payment verifications and projects will appear here.</p>}</div><div className="admin-notice-foot"><button className="secondary" onClick={readAll} disabled={!unread}>Mark all as read</button><button className="primary" onClick={()=>{setOpen(false);onNavigate(admin?.role==="CONNECT_ADMIN"?"connectorders":"overview")}}>Open workspace</button></div></div></>}
   {toast&&<div className="admin-notice-toast"><span className="admin-notice-toast-icon"><Bell size={17}/></span><button className="admin-notice-toast-copy" onClick={()=>go(toast)}><b>{toast.title}</b><small>{toast.message}</small><em>Open alert</em></button><button className="admin-notice-toast-close" aria-label="Dismiss alert" onClick={()=>setToast(null)}><X size={15}/></button></div>}
 </div>;
}

function AdminApp(){
 const adminRequestedPage=new URLSearchParams(window.location.search).get("adminPage");
 const adminInitialPage=["overview","mission","users","transactions","deposits","paybillverify","withdrawals","packages","advertising","marketplace","serviceRequests","announcements","support","activity","paymentconfig","health","loginactivity","security","admins","connectorders"].includes(adminRequestedPage)?adminRequestedPage:"overview";
 const [admin,setAdmin]=useState(null),[loading,setLoading]=useState(true),[page,setPage]=useState(adminInitialPage),[data,setData]=useState({overview:null,users:[],usersMeta:{page:1,pageSize:50,total:0,pageCount:1},transactions:[],withdrawals:[],packages:[],announcements:[],deposits:[],adProducts:[],adSubmissions:[],marketProducts:[],marketOrders:[],connectOrders:[]}),[error,setError]=useState(""),[search,setSearch]=useState(""),[mobile,setMobile]=useState(false),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false),[busyMessage,setBusyMessage]=useState(""),[sectionLoading,setSectionLoading]=useState(""),[sectionErrors,setSectionErrors]=useState({}),[usersFetching,setUsersFetching]=useState(false),[userQuery,setUserQuery]=useState({q:"",country:"",status:"",page:1,pageSize:50}),[networkOnline,setNetworkOnline]=useState(()=>typeof navigator==="undefined"||navigator.onLine!==false),[universalQuery,setUniversalQuery]=useState(""),[universalResults,setUniversalResults]=useState([]),[universalOpen,setUniversalOpen]=useState(false),[universalBusy,setUniversalBusy]=useState(false);
 const pageRef=useRef(page);pageRef.current=page;
 const adminRef=useRef(admin);adminRef.current=admin;
 const sectionLoadingRef=useRef(sectionLoading);sectionLoadingRef.current=sectionLoading;
 const usersFetchingRef=useRef(usersFetching);usersFetchingRef.current=usersFetching;
 const usersRequestRef=useRef(0);
 const sectionRequestRef=useRef(0);
 const coreDataPages=["overview","users","transactions","withdrawals","packages","advertising","marketplace","connectorders"];
 const loadSectionData=async(targetPage,role,options={})=>{
  if(!coreDataPages.includes(targetPage))return;
  const requestId=++sectionRequestRef.current;
  if(!options.silent)setSectionLoading(targetPage);
  setSectionErrors(prev=>({...prev,[targetPage]:""}));
  try{
   if(targetPage==="overview"){
    const overview=await adminApi("/admin/overview");
    if(requestId===sectionRequestRef.current)setData(prev=>({...prev,overview}));
   }else if(targetPage==="users"){
    const q=options.userQuery||userQuery;
    const params=new URLSearchParams({paged:"1",page:String(q.page||1),pageSize:String(q.pageSize||50)});
    if(q.q)params.set("q",q.q);if(q.country)params.set("country",q.country);if(q.status)params.set("status",q.status);
    const result=await adminApi(`/admin/users?${params.toString()}`);
    const userRows=Array.isArray(result)?result:(result.rows||[]);
    if(requestId===sectionRequestRef.current)setData(prev=>({...prev,users:userRows,usersMeta:Array.isArray(result)?{page:1,pageSize:userRows.length,total:userRows.length,pageCount:1}:{page:result.page||1,pageSize:result.pageSize||50,total:result.total||0,pageCount:result.pageCount||1}}));
   }else if(targetPage==="transactions"){
    const transactions=await adminApi("/admin/transactions");if(requestId===sectionRequestRef.current)setData(prev=>({...prev,transactions}));
   }else if(targetPage==="withdrawals"){
    const withdrawals=await adminApi("/admin/withdrawals");if(requestId===sectionRequestRef.current)setData(prev=>({...prev,withdrawals}));
   }else if(targetPage==="packages"){
    const packages=await adminApi("/admin/packages");if(requestId===sectionRequestRef.current)setData(prev=>({...prev,packages}));
   }else if(targetPage==="advertising"){
    const [adProducts,adSubmissions]=await Promise.all([adminApi("/admin/ad-products"),adminApi("/admin/ad-submissions")]);if(requestId===sectionRequestRef.current)setData(prev=>({...prev,adProducts,adSubmissions}));
   }else if(targetPage==="marketplace"){
    const [marketProducts,marketOrders]=await Promise.all([adminApi("/admin/marketplace/products"),adminApi("/admin/marketplace/orders")]);if(requestId===sectionRequestRef.current)setData(prev=>({...prev,marketProducts,marketOrders}));
   }else if(targetPage==="connectorders"&&["SUPER_ADMIN","ADMIN","CONNECT_ADMIN"].includes(role)){
    const connectOrders=await adminApi("/admin/connect/orders");if(requestId===sectionRequestRef.current)setData(prev=>({...prev,connectOrders}));
   }
  }catch(e){
   if(requestId===sectionRequestRef.current)setSectionErrors(prev=>({...prev,[targetPage]:e.message||`Unable to load ${targetPage}.`}));
   throw e;
  }finally{if(requestId===sectionRequestRef.current&&!options.silent)setSectionLoading("");}
 };
 const loadUsersPage=async(nextQuery)=>{
  const requestId=++usersRequestRef.current;
  const normalized={...userQuery,...nextQuery,page:Math.max(1,Number(nextQuery?.page||userQuery.page||1)),pageSize:50};
  setUserQuery(normalized);setSearch(normalized.q||"");
  usersFetchingRef.current=true;setUsersFetching(true);
  try{await loadSectionData("users",adminRef.current?.role,{userQuery:normalized,silent:true});}catch{}finally{if(requestId===usersRequestRef.current){usersFetchingRef.current=false;setUsersFetching(false);}}
 };
 const adminHistoryRef=useRef(false),adminHistoryInitializedRef=useRef(false);
 useEffect(()=>{
  const url=new URL(window.location.href);
  url.searchParams.set("adminPage",page);
  if(!adminHistoryInitializedRef.current){
   window.history.replaceState({...window.history.state,nexoraAdminPage:page},"",url);
   adminHistoryInitializedRef.current=true;
   return;
  }
  if(adminHistoryRef.current){adminHistoryRef.current=false;return;}
  window.history.pushState({...window.history.state,nexoraAdminPage:page},"",url);
 },[page]);
 useEffect(()=>{
  const handlePopState=()=>{
   const requested=new URLSearchParams(window.location.search).get("adminPage");
   const valid=["overview","mission","users","transactions","deposits","paybillverify","withdrawals","packages","advertising","marketplace","serviceRequests","announcements","support","activity","paymentconfig","health","loginactivity","security","admins","connectorders"];
   adminHistoryRef.current=true;
   setPage(valid.includes(requested)?requested:"overview");
   setMobile(false);
  };
  window.addEventListener("popstate",handlePopState);
  return()=>window.removeEventListener("popstate",handlePopState);
 },[]);
 const load=async(show=true)=>{
  const currentAdmin=adminRef.current;
  if(currentAdmin?.role){try{await loadSectionData(pageRef.current,currentAdmin.role,{silent:true});}catch{}return;}
  if(show)setLoading(true);
  try{
   const a=await adminApi("/admin/me");
   const signedInAdmin=a.admin;
   if(!signedInAdmin)throw new Error("Administrator session is unavailable.");
   if(signedInAdmin.role==="CONNECT_ADMIN"){pageRef.current="connectorders";setPage("connectorders");}
   setAdmin(signedInAdmin);setError("");
  }catch(e){if(e.status===401||e.status===403){localStorage.removeItem("adminToken");setAdmin(null)}if(!String(e.message).toLowerCase().includes("session"))setError(e.message);}
  finally{setLoading(false);}
 };
 useEffect(()=>{if(localStorage.getItem("adminToken"))load();else setLoading(false)},[]);
 useEffect(()=>{
  if(!admin?.role)return;
  const target=admin.role==="CONNECT_ADMIN"?"connectorders":page;
  if(target!==page){pageRef.current=target;setPage(target);return;}
  loadSectionData(target,admin.role).catch(()=>{});
 },[page,admin?.role]);
 const loadSectionRef=useRef(null);loadSectionRef.current=loadSectionData;
 useEffect(()=>{const q=universalQuery.trim();if(q.length<2){setUniversalResults([]);setUniversalBusy(false);return}let cancelled=false;const timer=setTimeout(async()=>{setUniversalBusy(true);try{const d=await adminApi("/admin/universal-search?q="+encodeURIComponent(q));if(!cancelled)setUniversalResults(d.results||[])}catch{if(!cancelled)setUniversalResults([])}finally{if(!cancelled)setUniversalBusy(false)}},220);return()=>{cancelled=true;clearTimeout(timer)}},[universalQuery,admin?.role]);
 useEffect(()=>{
  const token=localStorage.getItem("adminToken");if(!token||!admin?.role)return;
  let lastSectionRefresh=0;
  const stream=new EventSource(`${API}/admin/realtime?token=${encodeURIComponent(token)}`);
  const onRefresh=()=>{
   const now=Date.now();
   // The stream currently sends periodic refresh signals, not individual change payloads.
   // Throttle to avoid repeating expensive overview queries and never let a silent refresh
   // invalidate an active foreground load or a paginated user search.
   if(now-lastSectionRefresh<15000)return;
   const currentPage=pageRef.current;
   if(!coreDataPages.includes(currentPage)||sectionLoadingRef.current===currentPage|| (currentPage==="users"&&usersFetchingRef.current))return;
   lastSectionRefresh=now;
   loadSectionRef.current?.(currentPage,admin.role,{silent:true}).catch(()=>{});
  };
  stream.addEventListener("refresh",onRefresh);
  return()=>{stream.removeEventListener("refresh",onRefresh);stream.close()};
 },[!!admin]);
 const action=async(fn,msg)=>{if(busy)return false;setBusy(true);setBusyMessage(msg);setError("");setNotice(`Processing… ${msg}`);try{const result=await fn();await load(false);setNotice(`✓ ${result?.message||msg}`);return true}catch(e){setError(e.message);setNotice("");return false}finally{setBusy(false);setBusyMessage("")}};
 if(loading&&!admin)return <NexoraSplash label="Opening admin console…"/>;
 if(!admin)return <AdminLogin onLogin={a=>{setAdmin(a);if(a.role==="CONNECT_ADMIN"){pageRef.current="connectorders";setPage("connectorders");}setLoading(false);}}/>;
 const r=admin.role;
 const nav=r==="CONNECT_ADMIN"?[["connectorders","Internet Services",Wifi]]:[["overview","Overview",BarChart3],["users","Users",UsersRound]];
 if(r!=="CONNECT_ADMIN"){
  if(["SUPER_ADMIN","ADMIN","FINANCE_ADMIN"].includes(r))nav.push(["mission","Mission Control",Activity]);
  if(["SUPER_ADMIN","ADMIN","FINANCE_ADMIN"].includes(r))nav.push(["transactions","Transactions",ReceiptText],["deposits","Wallet deposits",WalletCards],["paybillverify","Paybill verification",BadgeCheck],["withdrawals","Withdrawals",HandCoins]);
  if(["SUPER_ADMIN","ADMIN","FINANCE_ADMIN"].includes(r))nav.push(["repair","Payment repair",Wrench]);
  if(["SUPER_ADMIN","ADMIN"].includes(r))nav.push(["packages","Packages",PackageIcon],["advertising","Advertising",Megaphone],["marketplace","Marketplace",Store],["serviceRequests","NEXORA Services",Wrench]);
  if(["SUPER_ADMIN","ADMIN","SUPPORT_ADMIN"].includes(r))nav.push(["announcements","Announcements",Megaphone],["support","Support tickets",LifeBuoy]);
  if(["SUPER_ADMIN","ADMIN"].includes(r))nav.push(["activity","Activity log",Activity],["paymentconfig","Payment configuration",CreditCard],["health","System health",Activity],["loginactivity","Login activity",History],["security","Security center",Shield]);
  if(["SUPER_ADMIN","ADMIN"].includes(r))nav.push(["connectorders","Internet Services",Wifi]);
  if(r==="SUPER_ADMIN")nav.push(["admins","Admin management",UserCog]);
 }
 const logout=()=>{localStorage.removeItem("adminToken");setAdmin(null);setData({overview:null,users:[],usersMeta:{page:1,pageSize:50,total:0,pageCount:1},transactions:[],withdrawals:[],packages:[],announcements:[],deposits:[],adProducts:[],adSubmissions:[],marketProducts:[],marketOrders:[],connectOrders:[]});};
 const title=nav.find(x=>x[0]===page)?.[1]||"Overview";
 const retrySection=()=>loadSectionData(page,admin.role).catch(()=>{});
 let pageContent;
 if(coreDataPages.includes(page)&&sectionLoading===page)pageContent=<div className="adminloading">Loading {title.toLowerCase()}…</div>;
 else if(coreDataPages.includes(page)&&sectionErrors[page])pageContent=<div className="adminsection"><div className="error" role="alert">{sectionErrors[page]} <button className="secondary" onClick={retrySection}><RefreshCw size={14}/> Retry</button></div></div>;
 else switch(page){
  case "overview":pageContent=<AdminOverview data={data.overview} onRefresh={()=>load(false)}/>;break;
  case "mission":pageContent=["SUPER_ADMIN","ADMIN","FINANCE_ADMIN"].includes(admin.role)?<AdminMissionControl/>:<AdminOverview data={data.overview}/>;break;
  case "users":pageContent=<AdminUsers rows={data.users} search={search} setSearch={setSearch} action={action} pagination={data.usersMeta} userQuery={userQuery} onQueryChange={loadUsersPage} queryLoading={usersFetching} canAssignReferrer={["SUPER_ADMIN","ADMIN"].includes(admin.role)}/>;break;
  case "transactions":pageContent=<AdminTransactions rows={data.transactions}/>;break;
  case "repair":pageContent=<AdminPaymentRepair action={action}/>;break;
  case "paybillverify":pageContent=<AdminPaybillVerify action={action}/>;break;
  case "deposits":pageContent=<AdminDepositVerify action={action}/>;break;
  case "withdrawals":pageContent=<AdminWithdrawals rows={data.withdrawals} action={action}/>;break;
  case "packages":pageContent=<AdminPackages rows={data.packages} action={action}/>;break;
  case "advertising":pageContent=<AdminAdvertising products={data.adProducts||[]} submissions={data.adSubmissions||[]} action={action} reload={()=>load(false)}/>;break;
  case "marketplace":pageContent=<AdminMarketplace products={data.marketProducts||[]} orders={data.marketOrders||[]} action={action}/>;break;
  case "serviceRequests":pageContent=<AdminServiceRequests action={action}/>;break;
  case "announcements":pageContent=<AdminAnnouncements action={action} admin={admin}/>;break;
  case "support":pageContent=<AdminSupportTickets action={action}/>;break;
  case "activity":pageContent=<AdminActivity/>;break;
  case "paymentconfig":pageContent=<AdminPaymentConfig/>;break;
  case "health":pageContent=<AdminSystemHealth/>;break;
  case "loginactivity":pageContent=<AdminLoginActivity/>;break;
  case "security":pageContent=<AdminSecurity/>;break;
  case "admins":pageContent=admin.role==="SUPER_ADMIN"?<AdminManagement action={action} busy={busy}/>:<AdminOverview data={data.overview}/>;break;
  case "connectorders":pageContent=["SUPER_ADMIN","ADMIN","CONNECT_ADMIN"].includes(admin.role)?<AdminConnectOrders rows={data.connectOrders||[]} action={action} reload={()=>load(false)}/>:<AdminOverview data={data.overview}/>;break;
  default:pageContent=<AdminOverview data={data.overview} onRefresh={()=>load(false)}/>;
 }
 return <div className="adminapp" data-busy={busy?"true":"false"}><aside className={mobile?"open":""}><div className="adminnavbrand"><img src="/nexora-logo.png"/><div><b>NEXORA</b><small>ADMIN</small></div></div>{nav.map(([id,t,I])=><button key={id} className={`${page===id?"active":""}${id==="serviceRequests"?" adminserviceitem":""}`} onClick={()=>{pageRef.current=id;setPage(id);setMobile(false)}}><I size={18}/><span className="adminnavlabel">{t}{id==="serviceRequests"&&<small>Requests · Quotes · Projects</small>}</span></button>)}<div className="adminnavspacer"/>{r!=="CONNECT_ADMIN"&&<button onClick={()=>setNotice(`Co-op Paybill is currently ${data.overview?.paymentProvider||"unconfigured"}.`)}><Settings2 size={18}/>Payment mode</button>}<button onClick={logout}><LogOut size={18}/>Logout</button></aside><main className="adminmain"><header className="adminheader"><button className="mobilemenu" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button><div><b>{title}</b><div className="muted small">NEXORA administrator console</div></div>{["SUPER_ADMIN","ADMIN","FINANCE_ADMIN"].includes(admin.role)&&<div style={{position:"relative",width:"min(360px,34vw)",minWidth:150}}><div className="searchbox"><Search size={15}/><input aria-label="Search all NEXORA records" value={universalQuery} onFocus={()=>setUniversalOpen(true)} onChange={e=>{setUniversalQuery(e.target.value);setUniversalOpen(true)}} placeholder="Search members, payments, projects…"/></div>{universalOpen&&universalQuery.trim().length>=2&&<div style={{position:"absolute",top:"calc(100% + 8px)",left:0,right:0,zIndex:80,maxHeight:360,overflowY:"auto",background:"var(--panel,#0d192b)",border:"1px solid #2a3d58",borderRadius:12,boxShadow:"0 16px 36px rgba(0,0,0,.35)",padding:6}}>{universalBusy?<div className="adminempty">Searching…</div>:universalResults.length?universalResults.map((hit,i)=><button type="button" key={hit.kind+"-"+hit.id+"-"+i} onClick={()=>{setPage(hit.page);setUniversalOpen(false);setUniversalQuery("");setUniversalResults([])}} style={{display:"block",width:"100%",textAlign:"left",background:"transparent",border:0,borderRadius:8,padding:"10px 12px",color:"inherit"}}><b style={{display:"block"}}>{hit.title||hit.kind}</b><small className="muted">{hit.kind} · {hit.subtitle}</small></button>):<div className="adminempty">No matching records.</div>}</div>}{universalOpen&&<button aria-label="Close search results" onClick={()=>setUniversalOpen(false)} style={{position:"fixed",inset:0,zIndex:70,opacity:0,pointerEvents:"none"}}/>}</div>}<AdminNotificationCenter admin={admin} onNavigate={setPage}/><div className="adminuser"><PWAInstall compact/><ShieldCheck size={17}/><span>{admin.name} · {admin.role==="CONNECT_ADMIN"?"INTERNET SERVICES ADMIN":String(admin.role||"ADMIN").replaceAll("_"," ")}</span></div></header>{!networkOnline&&<div className="nx-offline-banner" role="status"><Wifi size={16}/><span><b>You’re offline.</b> Your saved NEXORA workspace is open. Live updates, payments and new orders will resume when you reconnect.</span><button type="button" onClick={()=>{const online=typeof navigator==="undefined"||navigator.onLine!==false;setNetworkOnline(online);if(online)load(false)}}>Check again</button></div>}{error&&<div className="error topmsg"><span>{error}</span><button onClick={()=>load(false)}><RefreshCw size={15}/> Retry</button></div>}{notice&&<div className={`notice topmsg ${busy?"processingnotice":""}`}><span>{busy&&<LoaderCircle size={15} className="spin"/>}{notice}</span>{!busy&&<button onClick={()=>setNotice("")}>×</button>}</div>}{pageContent}</main></div>;
}
function AdminServiceRequests({action}){const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[saving,setSaving]=useState(''),[filter,setFilter]=useState('ALL'),[query,setQuery]=useState(''),[quote,setQuote]=useState(null),[message,setMessage]=useState(null),[chat,setChat]=useState([]),[chatText,setChatText]=useState('');const load=async()=>{setLoading(true);try{setRows(await adminApi('/admin/service-requests'))}catch(e){alert(e.message)}finally{setLoading(false)}};useEffect(()=>{load()},[]);const update=async(r,actionName,extra={})=>{setSaving(r.id);try{await action(()=>adminApi(`/admin/service-requests/${r.id}`,{method:'PATCH',body:JSON.stringify({action:actionName,...extra,adminNote:r.adminNote||''})}),actionName==='PAID'?'Project marked paid':`Project updated: ${actionName}`);await load()}catch(e){alert(e.message)}finally{setSaving('')}};const openChat=async(r)=>{setMessage(r);try{setChat(await adminApi(`/admin/service-requests/${r.id}/messages`))}catch{setChat([])}};const sendChat=async()=>{if(!message||!chatText.trim())return;try{const m=await adminApi(`/admin/service-requests/${message.id}/messages`,{method:'POST',body:JSON.stringify({message:chatText})});setChat(x=>[...x,m]);setChatText('')}catch(e){alert(e.message)}};const visible=rows.filter(r=>(filter==='ALL'||r.status===filter)&&(!query||`${r.title} ${r.userName} ${r.userEmail} ${r.serviceType}`.toLowerCase().includes(query.toLowerCase())));return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">NEXORA SERVICES</span><h1>Service Requests & Projects</h1><p className="muted">Receive requests, ask for information, send quotations, manage milestones, communicate with clients and record completion/payment.</p></div><button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div><div className="serviceadminstats"><span>New <b>{rows.filter(x=>x.status==='SUBMITTED').length}</b></span><span>Processing <b>{rows.filter(x=>['RECEIVED','INFO_REQUIRED','QUOTED','IN_PROGRESS'].includes(x.status)).length}</b></span><span>Completed <b>{rows.filter(x=>x.status==='COMPLETED').length}</b></span><span>Paid <b>{rows.filter(x=>x.status==='PAID').length}</b></span></div><div className="adminpanel serviceadminfilters"><div className="searchbox"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search project, member or service…"/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">All statuses</option>{['SUBMITTED','RECEIVED','INFO_REQUIRED','QUOTED','IN_PROGRESS','COMPLETED','PAID'].map(x=><option key={x}>{x}</option>)}</select></div><div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Project</span><span>Member contacts</span><span>Scope / budget</span><span>Status</span><span>Actions</span></div>{loading?<div className="adminempty">Loading project requests…</div>:visible.map(r=><div className="adminrow serviceadminrow" key={r.id}><div><b>{r.title}</b><small>{r.serviceType.replaceAll('_',' ')}</small><small>{r.description}</small>{r.attachments&&r.attachments!=='[]'&&<small>📎 Reference files attached</small>}</div><div><b>{r.userName}</b><small>{r.email}</small><small>WhatsApp: {r.whatsapp}</small></div><div><span>{r.quoteAmount?money(r.quoteAmount):r.budget?money(r.budget):'Budget not specified'}</span><small>{r.quoteStatus==='SENT'?'Quotation sent':r.milestone||'Requirements'}</small><small>Submitted {new Date(r.createdAt).toLocaleString()}</small></div><div><em className={`adminstatus ${String(r.status).toLowerCase()}`}>{r.status.replaceAll('_',' ')}</em>{r.isReceived&&<small>✓ Received</small>}{r.isDone&&<small>✓ Completed</small>}{r.isPaid&&<small>✓ Paid</small>}</div><div className="rowactions"><button className="rowaction" onClick={()=>openChat(r)}><MessageSquareText size={13}/> Chat</button>{!r.isReceived&&<button className="rowaction" disabled={saving===r.id} onClick={()=>update(r,'RECEIVE')}><Check size={13}/> Received</button>}{r.isReceived&&!r.quoteAmount&&<button className="rowaction" disabled={saving===r.id} onClick={()=>setQuote(r)}><ReceiptText size={13}/> Quote</button>}{r.status==='RECEIVED'&&<button className="rowaction" onClick={()=>update(r,'INFO',{adminNote:window.prompt('What information do you need from the client?',r.adminNote||'')||''})}><Info size={13}/> More info</button>}{r.status==='QUOTED'&&<button className="rowaction" onClick={()=>update(r,'START',{milestone:'Development'})}>Start</button>}{['RECEIVED','INFO_REQUIRED','IN_PROGRESS'].includes(r.status)&&<button className="rowaction" onClick={()=>{const m=window.prompt('Milestone / note',r.milestone||'Development');if(m)update(r,'MILESTONE',{milestone:m})}}>Milestone</button>}{r.status!=='PAID'&&r.isDone&&<button className="rowaction successaction" disabled={saving===r.id} onClick={()=>update(r,'PAID')}><CheckCheck size={13}/> Paid</button>}{!r.isDone&&r.status==='IN_PROGRESS'&&<button className="rowaction successaction" disabled={saving===r.id} onClick={()=>update(r,'DONE')}><CheckCheck size={13}/> Complete</button>}</div></div>)}{!loading&&!visible.length&&<div className="adminempty">No matching service requests.</div>}</div></div>{quote&&<div className="modalbackdrop" onClick={()=>setQuote(null)}><div className="modal quoteadminmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">SEND QUOTATION</span><h2>{quote.title}</h2><p className="muted small">Send a clear price and scope summary. The client can accept or request changes from their project page.</p></div><button className="iconbtn" onClick={()=>setQuote(null)}><X size={18}/></button></div><div className="instructionbody"><label className="fieldlabel">Quotation amount (KSh)<input id="adminQuoteAmount" type="number" min="0" step="1" defaultValue={quote.quoteAmount||quote.budget||''}/></label><label className="fieldlabel">Scope / quotation note<textarea id="adminQuoteNote" rows="7" defaultValue={quote.quoteNote||''} placeholder="What is included, delivery expectations, revisions or important conditions…"/></label><div className="notice"><ShieldCheck size={15}/> Use a clear scope and confirm the final payment arrangement with the client before work begins.</div></div><div className="modalfoot"><button className="secondary" onClick={()=>setQuote(null)}>Cancel</button><button className="primary" onClick={()=>{const amount=Number(document.getElementById('adminQuoteAmount')?.value||0);const note=document.getElementById('adminQuoteNote')?.value||'';if(!amount){alert('Enter a quotation amount.');return}setQuote(null);update(quote,'QUOTE',{quoteAmount:amount,quoteNote:note})}}><ReceiptText size={15}/> Send quotation</button></div></div></div>}{message&&<div className="modalbackdrop" onClick={()=>setMessage(null)}><div className="modal servicechatmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">PROJECT CHAT</span><h2>{message.title}</h2></div><button className="iconbtn" onClick={()=>setMessage(null)}><X size={18}/></button></div><div className="chatlog">{chat.length?chat.map(m=><div className={`chatmsg ${m.senderRole==='ADMIN'?'mine':''}`} key={m.id}><small>{m.senderName||m.senderRole} · {new Date(m.createdAt).toLocaleString()}</small><p>{m.message}</p></div>):<p className="muted">No messages yet.</p>}</div><div className="chatcomposer admin-chatcomposer"><textarea value={chatText} onChange={e=>setChatText(e.target.value)} placeholder="Write a message to the client…" rows="3" onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();sendChat()}}}/><button className="primary admin-chat-send" disabled={!chatText.trim()} onClick={sendChat}><SendHorizontal size={17}/><span>Send</span></button></div></div></div>}</section>}

function AdminMarketplace({products,orders,action}){const [tab,setTab]=useState("products");const moderate=async(p,status)=>{await action(()=>adminApi(`/admin/marketplace/products/${p.id}`,{method:"PATCH",body:JSON.stringify({status})}),`Product ${status.toLowerCase()}`)};const verifySeller=async(id,v)=>{await action(()=>adminApi(`/admin/marketplace/sellers/${id}`,{method:"PATCH",body:JSON.stringify({sellerVerified:v})}),v?"Seller verified":"Seller verification removed")};return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">MARKETPLACE CONTROL</span><h1>Marketplace Manager</h1><p className="muted">Moderate listings, verify sellers and monitor marketplace orders.</p></div></div><div className="adminquick adtabs"><button className={tab==="products"?"active":""} onClick={()=>setTab("products")}>Listings ({products.length})</button><button className={tab==="orders"?"active":""} onClick={()=>setTab("orders")}>Orders ({orders.length})</button></div>{tab==="products"&&<div className="table">{products.map(p=><div className="row" key={p.id}><div><b>{p.title}</b><small>{p.seller?.name} · {p.seller?.email}</small></div><strong>{money(p.price)}</strong><span>{p.status}</span><span>{p.seller?.sellerVerified?"Verified seller":"Seller not verified"}</span><div className="rowactions">{!p.seller?.sellerVerified&&<button className="secondary" onClick={()=>verifySeller(p.sellerId,true)}>Verify seller</button>}<button className="secondary" onClick={()=>moderate(p,p.status==="ACTIVE"?"HIDDEN":"ACTIVE")}>{p.status==="ACTIVE"?"Hide":"Publish"}</button><button className="secondary" onClick={()=>moderate(p,"REJECTED")}>Reject</button></div></div>)}{!products.length&&<p className="muted">No marketplace listings.</p>}</div>}{tab==="orders"&&<div className="table">{orders.map(o=><div className="row" key={o.id}><div><b>{o.reference}</b><small>Buyer: {o.buyer?.name} · Seller: {o.seller?.name}</small></div><strong>{money(o.total)}</strong><span>{o.status}</span><span>{o.paymentStatus}</span><small>{new Date(o.createdAt).toLocaleString()}</small></div>)}{!orders.length&&<p className="muted">No marketplace orders.</p>}</div>}</section>}

function AdminConnectOrders({rows,action,reload}){
 const [query,setQuery]=useState(""),[filter,setFilter]=useState("ALL");
 const update=async(order,actionName,extra={},label="Connect order updated")=>{await action(()=>adminApi(`/admin/connect/orders/${order.id}`,{method:"PATCH",body:JSON.stringify({action:actionName,...extra})}),label);await reload()};
 const verifyPayment=order=>{const ref=window.prompt(`Before continuing, confirm this order's payment directly against Kigen/M-Pesa records. Enter the exact M-Pesa transaction code for ${order.reference}:`);if(!ref||ref.trim().length<5)return;const note=window.prompt("Optional verification note (do not include any PIN or sensitive credentials):",`Manually checked by ${"Internet Services Admin"}`)||"Payment reference manually checked with the provider.";if(!window.confirm(`You are recording payment ${ref.trim().toUpperCase()} as verified for ${order.reference}. Have you independently confirmed the amount and recipient?`))return;update(order,"VERIFY_PAYMENT",{paymentReference:ref.trim(),note},"Payment marked verified; fulfilment still required");};
 const failOrder=order=>{const reason=window.prompt(`Why could order ${order.reference} not be fulfilled?`,"Provider could not complete the bundle.");if(reason===null)return;if(!window.confirm(order.paymentMethod==="WALLET"&&order.paymentStatus==="PAID"?`Mark this order failed and automatically return ${money(order.amount)} to the member's NEXORA wallet?`:`Mark this order failed? If the customer paid Kigen directly, any provider refund must be coordinated with Kigen.`))return;update(order,"FAIL",{note:reason.trim()},order.paymentMethod==="WALLET"&&order.paymentStatus==="PAID"?"Order failed and wallet refund processed":"Order marked failed");};
 const visible=rows.filter(o=>(filter==="ALL"|| (filter==="AWAITING_PAYMENT"?o.status==="AWAITING_PAYMENT":filter==="PENDING_FULFILLMENT"?o.paymentStatus==="PAID"&&o.status==="PENDING_FULFILLMENT":filter==="PROCESSING"?o.status==="PROCESSING":filter==="DELIVERED"?o.status==="DELIVERED":filter==="FAILED"?o.status==="FAILED":true))&&(!query||`${o.reference} ${o.user?.name||""} ${o.user?.email||""} ${o.user?.phone||""} ${o.recipientPhone} ${o.bundleName} ${o.paymentReference||""}`.toLowerCase().includes(query.toLowerCase())));
 const stats=[ ["Awaiting payment",rows.filter(x=>x.status==="AWAITING_PAYMENT").length], ["Ready to fulfil",rows.filter(x=>x.status==="PENDING_FULFILLMENT"&&x.paymentStatus==="PAID").length], ["Processing",rows.filter(x=>x.status==="PROCESSING").length], ["Delivered",rows.filter(x=>x.status==="DELIVERED").length], ["Failed",rows.filter(x=>x.status==="FAILED").length] ];
 return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">KIGEN INTERNET SERVICES · KENYA</span><h1>Internet Services Orders</h1><p className="muted">Track every request, record manual external-payment checks, and fulfil paid Safaricom bundle, minutes and SMS orders. Wallet payment is already recorded when the order appears as paid.</p></div><button className="secondary" onClick={reload}><RefreshCw size={15}/> Refresh orders</button></div>
  <div className="connectadminstats">{stats.map(([label,value])=><div className="connectadminstat" key={label}><small>{label}</small><b>{value}</b></div>)}</div>
  <div className="connect-admin-warning"><b>Important:</b> Check Kigen/M-Pesa records yourself before marking an external payment as verified. This button records your manual check; it does not connect to an automatic M-Pesa or Kigen verification API. Mark an order delivered only after fulfilment is confirmed.</div>
  <div className="connectadminfilters"><div className="adminsearch"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search order, member, phone or M-Pesa code…"/></div><label className="connectadmin-filterslabel">Status <select value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">All orders</option><option value="AWAITING_PAYMENT">Awaiting payment</option><option value="PENDING_FULFILLMENT">Ready to fulfil</option><option value="PROCESSING">Processing</option><option value="DELIVERED">Delivered</option><option value="FAILED">Failed</option></select></label></div>
  <div className="connectadmin-table"><div className="admintable"><div className="adminrow adminrowhead"><span>Order / member</span><span>Bundle / recipient</span><span>Amount / method</span><span>Payment</span><span>Fulfilment</span><span>Actions</span></div>
  {visible.map(o=><div className="adminrow connectadmin-row" key={o.id}><div><b>{o.reference}</b><small>{o.user?.name||"Member"}</small><small>{o.user?.email||""}</small><small>{new Date(o.createdAt).toLocaleString()}</small></div><div><b>{o.bundleName}</b><small>{o.bundleCategory.toUpperCase()} · {o.validity}</small><small>To +{o.recipientPhone}{o.recipientType==="SELF"?" · own number":" · recipient"}</small></div><div><b>{money(o.amount)}</b><small>{o.paymentMethod==="WALLET"?"NEXORA wallet":"Paid directly to Kigen"}</small></div><div><em className={`adminstatus ${String(o.paymentStatus).toLowerCase()}`}>{String(o.paymentStatus).replaceAll("_"," ")}</em>{o.paymentReference&&<small>Ref: {o.paymentReference}</small>}{o.paidAt&&<small>{new Date(o.paidAt).toLocaleString()}</small>}</div><div><em className={`adminstatus ${String(o.status).toLowerCase()}`}>{String(o.status).replaceAll("_"," ")}</em>{o.deliveredAt&&<small>{new Date(o.deliveredAt).toLocaleString()}</small>}{o.adminNote&&<small className="connectadmin-note">{o.adminNote}</small>}</div><div className="rowactions">{o.status==="AWAITING_PAYMENT"&&o.paymentStatus==="PENDING"&&<button className="rowaction successaction" onClick={()=>verifyPayment(o)}><BadgeCheck size={13}/> Verify payment</button>}{o.status==="PENDING_FULFILLMENT"&&o.paymentStatus==="PAID"&&<button className="rowaction" onClick={()=>update(o,"START_PROCESSING",{},"Order moved to processing")}><Clock3 size={13}/> Start processing</button>}{["PENDING_FULFILLMENT","PROCESSING"].includes(o.status)&&o.paymentStatus==="PAID"&&<button className="rowaction successaction" onClick={()=>{if(window.confirm(`Confirm ${o.reference} has actually been delivered to +${o.recipientPhone}?`))update(o,"DELIVER",{},"Order marked delivered")}}><CheckCheck size={13}/> Mark delivered</button>}{!["DELIVERED","FAILED","CANCELLED"].includes(o.status)&&<button className="rowaction dangeraction" onClick={()=>failOrder(o)}><AlertTriangle size={13}/> Mark failed</button>}{o.status==="AWAITING_PAYMENT"&&<button className="rowaction" onClick={()=>{const note=window.prompt("Optional cancellation reason:","Order cancelled before payment verification.");if(note!==null&&window.confirm("Cancel this unpaid order?"))update(o,"CANCEL",{note},"Unpaid order cancelled")}}>Cancel</button>}</div></div>)}
  {!visible.length&&<div className="connectadmin-empty">{rows.length?"No orders match these filters.":"No NEXORA Connect orders have been placed yet. New wallet orders and direct-to-Kigen requests will appear here."}</div>}
  </div></div>
 </section>;
}

function AdminOverview({data,onRefresh}){if(!data)return <div className="adminloading">Loading overview…</div>;const cards=[["Total users",data.users,UsersRound],["Active users",data.activeUsers,UserCheck],["Transactions",data.transactions,ReceiptText],["Pending payments",data.pendingPayments,Clock3],["Pending payments >15 min",data.stalePendingPayments||0,Clock3],["Failed payments",data.failedPayments||0,AlertTriangle],["Failed payments (24h)",data.recentFailedPayments||0,AlertTriangle],["Successful plan activations",money(data.successfulPayments),CheckCircle2],["Pending withdrawals",data.pendingWithdrawals,HandCoins],["Withdrawals >15 min",data.stalePendingWithdrawals||0,Clock3],["Open support tickets",data.openTickets||0,LifeBuoy],["Failed admin logins (24h)",data.recentFailedLogins||0,Shield],["Total commissions",money(data.totalCommissions),ArrowUpRight]];return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">CONTROL CENTER</span><h1>Good to see you, Administrator</h1><p className="muted">Monitor NEXORA activity, repair verified payments and manage member operations.</p></div><button className="secondary" onClick={onRefresh}><RefreshCw size={16}/> Refresh</button></div><div className="adminstats">{cards.map(([label,value,I])=><div className="adminstat" key={label}><I size={19}/><span>{label}</span><strong>{value}</strong></div>)}</div>{((data.pendingPayments||0)>0||(data.pendingWithdrawals||0)>0||(data.failedPayments||0)>0||(data.stalePendingPayments||0)>0||(data.stalePendingWithdrawals||0)>0)&&<div className="adminpanel alertpanel"><div><h3><AlertTriangle size={18}/> Attention needed</h3><p className="muted">{data.pendingPayments||0} pending payment(s), {data.pendingWithdrawals||0} pending withdrawal(s), and {data.failedPayments||0} failed payment(s) are recorded. {((data.stalePendingPayments||0)+(data.stalePendingWithdrawals||0))>0?"Some payment or withdrawal records have been unresolved for more than 15 minutes and should be reviewed.":""}</p></div><div className="adminquick"><span>{data.pendingPayments||0} Pending payments</span><span>{data.stalePendingPayments||0} Stale payments</span><span>{data.pendingWithdrawals||0} Pending withdrawals</span><span>{data.stalePendingWithdrawals||0} Stale withdrawals</span><span>{data.failedPayments||0} Failed payments</span></div></div>}<div className="adminpanel"><div><h3>Admin access</h3><p className="muted">Admin sessions expire after 12 hours. Sensitive actions are recorded in the Activity Log.</p></div><div className="adminquick"><span><Check size={14}/> Users</span><span><Check size={14}/> Payments</span><span><Check size={14}/> Withdrawals</span><span><Check size={14}/> Audit log</span></div></div><div className="adminpanel"><div><h3>Data exports</h3><p className="muted">Download current member, transaction or withdrawal records as CSV.</p></div><div className="adminquick"><button className="rowaction" onClick={()=>downloadAdminCsv("users")}><Download size={14}/> Users CSV</button><button className="rowaction" onClick={()=>downloadAdminCsv("transactions")}><Download size={14}/> Transactions CSV</button><button className="rowaction" onClick={()=>downloadAdminCsv("withdrawals")}><Download size={14}/> Withdrawals CSV</button></div></div><div className="adminpanel warningpanel"><div><h3>Payment configuration by country</h3><p className="muted">Country is matched during registration using the selected country and phone country code. Kenya remains on Co-op Paybill; other countries stay disabled until their payment channel is activated.</p></div><div className="adminquick">{(data.paymentModes||[]).slice(0,8).map(x=><span key={x.code}>{x.name} · {x.mode==="COOP_PAYBILL"?"Paybill":x.mode==="PAYSTACK_MOBILE_MONEY"?"Paystack Mobile Money":"Coming soon"}</span>)}</div></div>{(data.flaggedUsers||[]).length>0&&<div className="adminpanel alertpanel"><div><h3><AlertTriangle size={18}/> Country review</h3><p className="muted">{data.flaggedUsers.length} account(s) have a country/phone mismatch or need review.</p></div><div className="adminquick">{data.flaggedUsers.slice(0,5).map(u=><span key={u.id}>{u.name} · {u.countryName||u.countryCode}</span>)}</div></div>}<div className="adminpanel"><h3>Country distribution</h3><div className="adminquick">{(data.countries||[]).map(x=><span key={x.countryCode}>{COUNTRY_BY_CODE[x.countryCode]?.name||x.countryCode} · {x._count?._all||0}</span>)}</div></div></section>}
function AdminPlanModal({user,onClose,action}){
 const [confirm,setConfirm]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 const [packages,setPackages]=useState([]),[packagesLoading,setPackagesLoading]=useState(false),[selectedPackageId,setSelectedPackageId]=useState(user?.package?.id||"");
 useEffect(()=>{
  if(!user)return;
  const previousOverflow=document.body.style.overflow;document.body.style.overflow="hidden";
  let cancelled=false;setPackagesLoading(true);
  adminApi("/admin/packages").then(rows=>{if(!cancelled){const active=(Array.isArray(rows)?rows:[]).filter(p=>p.active);setPackages(active);if(!selectedPackageId&&user.package?.id)setSelectedPackageId(user.package.id);}}).catch(e=>{if(!cancelled)setError(e.message||"Unable to load plans.");}).finally(()=>{if(!cancelled)setPackagesLoading(false)});
  return()=>{cancelled=true;document.body.style.overflow=previousOverflow};
 },[user]);
 if(!user)return null;
 const planName=user.package?.name||"No plan assigned";
 const planPrice=money(user.package?.price||0);
 const status=String(user.planStatus||"NOT ASSIGNED").toUpperCase();
 const canReactivate=status==="SUSPENDED"||status==="DEACTIVATED";
 const assignSelected=async()=>{
  if(!selectedPackageId||busy)return;
  const chosen=packages.find(p=>String(p.id)===String(selectedPackageId));
  if(!chosen){setError("Choose an available plan first.");return;}
  if(!window.confirm(`Assign ${chosen.name} to ${user.name||user.email}? This is a manual admin grant and will not create a payment or referral commission.`))return;
  setBusy(true);setError("");
  try{const ok=await action(()=>adminApi(`/admin/users/${user.id}/plan`,{method:"PATCH",body:JSON.stringify({action:"ASSIGN",packageId:selectedPackageId})}),`${chosen.name} assigned to ${user.email}`);if(ok)onClose();}
  catch(e){setError(e.message||"Unable to assign this plan.");}finally{setBusy(false);}
 };
 const choose=(kind)=>{
  const copy={
   SUSPEND:{title:"Suspend this plan?",message:`${planName} will be temporarily suspended for ${user.email}. The plan assignment and history will remain intact.`,button:"Suspend plan",tone:"warning"},
   DEACTIVATE:{title:"Deactivate this plan?",message:`${planName} will become inactive for ${user.email}. The plan assignment and history will remain available and an administrator can reactivate it later.`,button:"Deactivate plan",tone:"danger"},
   REACTIVATE:{title:"Reactivate this plan?",message:`${planName} will become active again for ${user.email}.`,button:"Reactivate plan",tone:"success"},
   REMOVE:{title:"Remove this plan?",message:`This removes the current plan assignment from ${user.email}. Historical transactions remain available, but the member will no longer have this plan assigned.`,button:"Remove plan",tone:"danger"}
  };setError("");setConfirm({action:kind,...copy[kind]});
 };
 const submit=async()=>{
  if(!confirm||busy)return;setBusy(true);setError("");
  try{const ok=await action(()=>adminApi(`/admin/users/${user.id}/plan`,{method:"PATCH",body:JSON.stringify({action:confirm.action})}),`${planName} ${confirm.action.toLowerCase()}d for ${user.email}`);if(ok)onClose();}
  catch(e){setError(e.message||"Unable to update this plan.");}finally{setBusy(false);}
 };
 return createPortal(<div className="modalbackdrop adminplanmodalbackdrop" onClick={()=>{if(!busy)onClose()}}>
  <div className="modal adminbalance adminplanmodal" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Manage member plan">
   <div className="modalhead"><div><span className="pill">PLAN CONTROL</span><h2>Manage member plan</h2><p className="muted">{user.name} · {user.email}</p></div><button className="iconbtn" disabled={busy} onClick={onClose}><X size={20}/></button></div>
   {error&&<div className="error" role="alert">{error}</div>}
   <div className="adminplanconfirm">
    <div className="adminplansummary"><span>Current plan</span><strong>{planName}</strong><small>{user.package?planPrice+" · ":""}<b className={`adminstatus ${status.toLowerCase().replaceAll(" ","-")}`}>{status}</b></small></div>
    {!confirm?<>
     <div className="adminplanassignbox"><h3><PackageIcon size={17}/> Assign a plan</h3><p className="muted">Grant or change this member's plan directly. This does not charge the member or create a referral commission.</p><label>Choose plan<select value={selectedPackageId} onChange={e=>setSelectedPackageId(e.target.value)} disabled={busy||packagesLoading}><option value="">Select a plan…</option>{packages.map(p=><option key={p.id} value={p.id}>{p.name} — {money(p.price)}{p.badge?" · "+p.badge:""}</option>)}</select></label><button className="primary" disabled={busy||packagesLoading||!selectedPackageId} onClick={assignSelected}>{busy?<><LoaderCircle size={15} className="spin"/> Processing…</>:<><UserCheck size={15}/> Assign selected plan</>}</button>{packagesLoading&&<small className="muted">Loading available plans…</small>}{!packagesLoading&&!packages.length&&<small className="muted">No active plans are available. Activate a plan in Packages first.</small>}</div>
     {user.package&&<><p className="muted">Other plan controls. Historical payment records are preserved.</p><div className="adminplanchoices">{canReactivate?<button className="rowaction successaction" disabled={busy} onClick={()=>choose("REACTIVATE")}><UserCheck size={15}/> Reactivate plan</button>:<><button className="rowaction warningaction" disabled={busy} onClick={()=>choose("SUSPEND")}><Clock3 size={15}/> Suspend plan</button><button className="rowaction dangeraction" disabled={busy} onClick={()=>choose("DEACTIVATE")}><Ban size={15}/> Deactivate plan</button></>}<button className="rowaction dangeraction" disabled={busy} onClick={()=>choose("REMOVE")}><Trash2 size={15}/> Remove plan</button></div></>}
     <div className="rowactions"><button className="secondary" disabled={busy} onClick={onClose}>Close</button></div>
    </>:<div className="adminplanwarning"><div className="adminplanwarningicon"><AlertTriangle size={20}/></div><div><h3>{confirm.title}</h3><p>{confirm.message}</p></div><div className="adminplanoptions"><button className="secondary" disabled={busy} onClick={()=>setConfirm(null)}>Cancel</button><button className={`rowaction ${confirm.tone==='success'?'successaction':confirm.tone==='warning'?'warningaction':'dangeraction'}`} disabled={busy} onClick={submit}>{busy?<><LoaderCircle size={15} className="spin"/> Processing…</>:confirm.button}</button></div></div>}
   </div>
  </div>
 </div>,document.body);
}
function AdminUsers({rows,search,setSearch,action,pagination={page:1,pageSize:50,total:0,pageCount:1},userQuery={q:"",country:"",status:"",page:1,pageSize:50},onQueryChange,queryLoading=false,canAssignReferrer=false}){
 const [balanceOpen,setBalanceOpen]=useState(false),[detail,setDetail]=useState(null),[detailsLoading,setDetailsLoading]=useState(false),[planUserId,setPlanUserId]=useState(null),[countryFilter,setCountryFilter]=useState(userQuery.country||""),[statusFilter,setStatusFilter]=useState(userQuery.status||"");
 const [referrerAssign,setReferrerAssign]=useState(null),[referrerSearch,setReferrerSearch]=useState(""),[referrerCandidates,setReferrerCandidates]=useState([]),[referrerLoading,setReferrerLoading]=useState(false);
 const openReferrerAssign=u=>{setReferrerAssign(u);setReferrerSearch("");setReferrerCandidates([]);};
 useEffect(()=>{if(!referrerAssign)return;let cancelled=false;const timer=setTimeout(async()=>{setReferrerLoading(true);try{const query=new URLSearchParams({q:referrerSearch,paged:"1",page:"1",pageSize:"30"});const result=await adminApi(`/admin/users?${query.toString()}`);if(!cancelled)setReferrerCandidates((result.rows||[]).filter(x=>String(x.id)!==String(referrerAssign.id)));}catch(e){if(!cancelled)setReferrerCandidates([])}finally{if(!cancelled)setReferrerLoading(false)}},220);return()=>{cancelled=true;clearTimeout(timer)}},[referrerAssign,referrerSearch]);
 const [form,setForm]=useState({email:"",mode:"add",amount:"",reason:"",updateTotalEarned:false}),[currentPage,setCurrentPage]=useState(userQuery.page||1);
 const queryReady=useRef(false);
 useEffect(()=>{if(!queryReady.current){queryReady.current=true;return;}const timer=setTimeout(()=>{onQueryChange?.({q:search,country:countryFilter,status:statusFilter,page:currentPage,pageSize:50});},280);return()=>clearTimeout(timer)},[search,countryFilter,statusFilter,currentPage]);
 const filtered=rows;
 const openBalance=(u=null)=>{const preset=u?.email || (search.includes("@") ? search : "");setForm({email:preset,mode:"add",amount:"",reason:"",updateTotalEarned:false});setBalanceOpen(true)};
 const openPlan=u=>{if(!u?.id)return;setPlanUserId(String(u.id));};
 const closePlan=()=>setPlanUserId(null);
 const planUser=planUserId?rows.find(x=>String(x.id)===String(planUserId)):null;
 const openDetails=async u=>{setDetailsLoading(true);try{const [d,timeline]=await Promise.all([adminApi(`/admin/users/${u.id}/details`),adminApi(`/admin/users/${u.id}/timeline`)]);setDetail({...d,timeline})}catch(e){alert(e.message)}finally{setDetailsLoading(false)}};
 const submit=async e=>{e.preventDefault();const ok=await action(()=>adminApi("/admin/users/balance",{method:"POST",body:JSON.stringify({...form,amount:Number(form.amount)})}),"Member balance corrected successfully");if(ok){setBalanceOpen(false);setForm({email:"",mode:"add",amount:"",reason:"",updateTotalEarned:false})}};
 return <section className="adminsection">
  <div className="adminsectionhead"><div><h1>Users</h1><p className="muted">Search members, inspect full account history and manage account status.</p></div><div className="rowactions"><button className="secondary" onClick={()=>downloadAdminCsv("users")}><Download size={16}/> Export CSV</button><button className="secondary" onClick={()=>openBalance()}><WalletCards size={16}/> Correct balance</button></div></div>
  <div className="adminsearch"><Search size={17}/><input placeholder="Search name, email, phone, referral code or referrer" value={search} onChange={e=>{setSearch(e.target.value);setCurrentPage(1)}}/></div><div className="adminfilters"><select value={countryFilter} onChange={e=>{setCountryFilter(e.target.value);setCurrentPage(1)}}><option value="">All countries</option>{AFRICAN_COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select><select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setCurrentPage(1)}}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select><span className="muted small">{queryLoading?"Updating results…":`Showing ${pagination.total===0?0:((pagination.page-1)*pagination.pageSize+1)}–${Math.min(pagination.page*pagination.pageSize,pagination.total||rows.length)} of ${pagination.total??rows.length}`}</span></div>
  <div className="adminpanel balancehelp"><div><h3>Manual balance correction</h3><p className="muted">Use this only after verifying the member's payment or earnings. Every correction requires a reason and is added to the audit trail.</p></div><button className="secondary" onClick={()=>openBalance()}>Open tool</button></div>
  <div className="adminpanel tablepanel adminuserspanel"><div className="admintable"><div className="adminrow adminrowhead"><span>User / Country</span><span>Phone</span><span>Referred by</span><span>Plan</span><span>Balance</span><span>Status</span><span>Action</span></div>{filtered.map(u=><div className="adminrow" key={u.id}><div><b>{u.name}</b><small>{u.email}</small><small>{u.countryName||u.countryCode||"Unknown country"} · Ref: {u.referralCode}</small>{u.riskFlags?.length>0&&<small className="adminnegative">⚠ {u.riskFlags.join(" · ")}</small>}</div><span>{u.phone}<small>{u.phoneCountryCode||"—"}</small></span><span>{u.referredBy?<><b>{u.referredBy.name}</b><small>{u.referredBy.email}</small></>:<span className="muted">Direct / none</span>}</span><span>{u.package?.name||"—"}{u.package&&<small className={`adminstatus ${String(u.planStatus||"ACTIVE").toLowerCase()}`}>{u.planStatus||"ACTIVE"}</small>}</span><span>{money(u.wallet?.balance)}</span><span><em className={`adminstatus ${String(u.status||"").toLowerCase()}`}>{u.status}</em></span><div className="rowactions"><button className="rowaction" onClick={()=>openDetails(u)}><Eye size={14}/> Details</button>{canAssignReferrer&&<button className="rowaction" onClick={()=>openReferrerAssign(u)}><UsersRound size={14}/> Assign referrer</button>}<button className="rowaction" onClick={()=>openBalance(u)}><WalletCards size={14}/> Balance</button><button className="rowaction" onClick={()=>openPlan(u)}><PackageIcon size={14}/> {u.package?"Manage plan":"Assign plan"}</button><button className="rowaction" onClick={()=>action(()=>adminApi(`/admin/users/${u.id}/status`,{method:"PATCH",body:JSON.stringify({status:u.status==="ACTIVE"?"SUSPENDED":"ACTIVE"})}),u.status==="ACTIVE"?"User suspended":"User reactivated")}>{u.status==="ACTIVE"?<><Ban size={14}/> Suspend</>:<><UserCheck size={14}/> Activate</>}</button></div></div>)}{!filtered.length&&<div className="adminempty">No users match your search.</div>}</div></div>
  <div className="adminpagination"><span className="muted small">Page {pagination.page||currentPage} of {pagination.pageCount||1}</span><div className="rowactions"><button className="secondary" disabled={queryLoading||(pagination.page||currentPage)<=1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))}>Previous</button><button className="secondary" disabled={queryLoading||(pagination.page||currentPage)>=(pagination.pageCount||1)} onClick={()=>setCurrentPage(p=>Math.min(pagination.pageCount||1,p+1))}>Next</button></div></div>
  {balanceOpen&&createPortal(<div className="modalbackdrop admin-modal-layer" onClick={()=>setBalanceOpen(false)}><div className="modal adminbalance" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">WALLET CORRECTION</span><h2>Update member balance</h2></div><button className="iconbtn" onClick={()=>setBalanceOpen(false)}><X size={20}/></button></div><form className="adminbalanceform" onSubmit={submit}><p className="muted">Enter the member's email address. For a missing commission, choose <b>Add to balance</b> and enter the verified amount.</p><label>Member email<input required type="email" placeholder="member@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Correction type<select value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})}><option value="add">Add to balance</option><option value="subtract">Subtract from balance</option><option value="set">Set exact balance</option></select></label><label>Amount (KSh)<input required type="number" min="0" step="1" placeholder="e.g. 200" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><label>Reason<input required maxLength="500" placeholder="Verified plan commission missing" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/></label><label className="checkline"><input type="checkbox" checked={form.updateTotalEarned} onChange={e=>setForm({...form,updateTotalEarned:e.target.checked})}/> Also update Total Earned</label><p className="muted small">Only enable Total Earned when the correction represents genuine earnings that were missed. Pending balance is not changed.</p><div className="rowactions"><button type="button" className="secondary" onClick={()=>setBalanceOpen(false)}>Cancel</button><button type="submit" className="primary narrow">Apply correction</button></div></form></div></div>, document.body)}
  {detail&&createPortal(<div className="modalbackdrop admin-modal-layer" onClick={()=>setDetail(null)}><div className="modal adminmemberdetail" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">MEMBER PROFILE</span><h2>{detail.name}</h2><p className="muted">{detail.email} · {detail.phone}</p></div><button className="iconbtn" onClick={()=>setDetail(null)}><X size={20}/></button></div><div className="detailgrid"><div><span>Balance</span><b>{money(detail.wallet?.balance)}</b></div><div><span>Total earned</span><b>{money(detail.wallet?.totalEarned)}</b></div><div><span>Pending</span><b>{money(detail.wallet?.pendingBalance)}</b></div><div><span>Withdrawn</span><b>{money(detail.wallet?.totalWithdrawn)}</b></div><div><span>Plan</span><b>{detail.package?.name||"None"}</b></div><div><span>Status</span><b>{detail.status}</b></div></div><div className="detailcols"><div><h3>Recent transactions</h3>{(detail.transactions||[]).slice(0,10).map(x=><div className="detailrow" key={x.id}><span>{String(x.type||"").replaceAll("_"," ")}<small>{x.reference}</small></span><b>{money(x.amount)} · {x.status}</b></div>)}{!detail.transactions?.length&&<p className="muted">No transactions.</p>}</div><div><h3>Referral network</h3><p className="muted small">Referred by: {detail.referredBy?.name||"Direct / none"}</p>{(detail.referrals||[]).slice(0,10).map(x=><div className="detailrow" key={x.id}><span>↳ {x.name}<small>{x.email}</small></span><b>{x.package?.name||"No plan"}</b></div>)}{!detail.referrals?.length&&<p className="muted">No direct referrals.</p>}</div></div><div className="panel"><h3>Account timeline</h3><div className="timeline">{(detail.timeline||[]).slice(0,20).map((x,i)=><div className="timelineitem" key={i}><span className="timeline-dot"/><div><b>{x.title}</b><small>{x.text}</small><em>{new Date(x.createdAt).toLocaleString()}</em></div></div>)}{!detail.timeline?.length&&<p className="muted">No timeline events recorded.</p>}</div></div><div className="detailactions"><button className="secondary" onClick={()=>{setDetail(null);openBalance(detail)}}><WalletCards size={15}/> Correct balance</button>{detail.package&&<button className="rowaction dangeraction" onClick={()=>{setDetail(null);openPlan(detail)}}><Ban size={15}/> Manage plan</button>}{detail.status==="ACTIVE"?<button className="rowaction dangeraction" onClick={()=>action(()=>adminApi(`/admin/users/${detail.id}/status`,{method:"PATCH",body:JSON.stringify({status:"SUSPENDED"})}),"User suspended")}>Suspend account</button>:<button className="rowaction successaction" onClick={()=>action(()=>adminApi(`/admin/users/${detail.id}/status`,{method:"PATCH",body:JSON.stringify({status:"ACTIVE"})}),"User reactivated")}>Activate account</button>}</div></div></div>, document.body)}
  {referrerAssign&&createPortal(<div className="modalbackdrop admin-modal-layer" onClick={()=>setReferrerAssign(null)}><div className="modal admin-referrer-modal" role="dialog" aria-modal="true" aria-labelledby="admin-referrer-title" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">REFERRAL CORRECTION</span><h2 id="admin-referrer-title">Assign a referrer</h2><p className="muted">{referrerAssign.name} · {referrerAssign.email}</p></div><button className="iconbtn" onClick={()=>setReferrerAssign(null)} aria-label="Close"><X size={20}/></button></div><p className="muted">Search for the member who originally referred this person, then assign them below. This changes the referral tree going forward; it does not automatically recalculate past commissions.</p><label className="admin-referrer-search">Find referrer by name, email, phone or referral code<input autoFocus value={referrerSearch} onChange={e=>setReferrerSearch(e.target.value)} placeholder="Search member or referral code…"/></label><div className="admin-referrer-results">{referrerLoading?<div className="adminempty">Searching members…</div>:referrerCandidates.length?referrerCandidates.map(candidate=><div className="admin-referrer-candidate" key={candidate.id}><div><b>{candidate.name}</b><small>{candidate.email}</small><small>Code: {candidate.referralCode||"No referral code recorded"}</small><small>Current referrer: {candidate.referredBy?.name||"Direct / none"}</small></div><button type="button" className="primary narrow" onClick={async()=>{const ok=await action(()=>adminApi(`/admin/users/${referrerAssign.id}/referrer`,{method:"PATCH",body:JSON.stringify({referredById:candidate.id})}),"Referral assignment saved");if(ok)setReferrerAssign(null)}}>Assign</button></div>):<div className="adminempty">{referrerSearch.trim()?"No matching members found. Try another name, email or code.":"No other members found."}</div>}</div><div className="admin-referrer-footer"><button type="button" className="secondary" disabled={!referrerAssign.referredBy?.id&&!rows.some(x=>String(x.id)===String(referrerAssign.id)&&x.referredBy?.id)} onClick={async()=>{const ok=await action(()=>adminApi(`/admin/users/${referrerAssign.id}/referrer`,{method:"PATCH",body:JSON.stringify({referredById:null})}),"Referrer assignment removed");if(ok)setReferrerAssign(null)}}>Remove referrer</button><button type="button" className="secondary" onClick={()=>setReferrerAssign(null)}>Cancel</button></div></div></div>,document.body)}
  {planUser&&<AdminPlanModal key={String(planUser.id)} user={planUser} action={action} onClose={closePlan}/>} {detailsLoading&&<div className="detailloading">Loading member details…</div>}
 </section>;
}

function AdminTransactions({rows}){const [repair,setRepair]=useState(null);return <section className="adminsection"><div className="adminsectionhead"><div><h1>Transactions</h1><p className="muted">Plan payments, commissions, refunds and withdrawal records.</p></div><div className="rowactions"><button className="secondary" onClick={()=>downloadAdminCsv("transactions")}><Download size={16}/> Export CSV</button><button className="secondary" onClick={()=>setRepair({email:"",reference:""})}><Wrench size={16}/> Repair payment</button></div></div><div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Reference</span><span>Member</span><span>Type</span><span>Amount</span><span>Status</span><span>Date</span></div>{rows.map(x=><div className="adminrow" key={x.id}><div><b>{x.reference}</b><small>{x.metadata?.paystack?.display_text||""}</small></div><div><b>{x.user?.name}</b><small>{x.user?.email}</small></div><span>{x.metadata?.adminBalanceAdjustment?"ADMIN BALANCE ADJUSTMENT":x.type.replaceAll("_"," ")}</span><strong className={x.metadata?.adminBalanceAdjustment?(Number(x.amount)>=0?"green":"adminnegative"):""}>{money(x.amount)}</strong><em className={`adminstatus ${String(x.status).toLowerCase()}`}>{x.status}</em><small>{new Date(x.createdAt).toLocaleString()}</small></div>)}{!rows.length&&<div className="adminempty">No transactions yet.</div>}</div></div>{repair&&<AdminPaymentRepairInline value={repair} onClose={()=>setRepair(null)}/>}</section>}


function AdminDepositVerify({action}){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[err,setErr]=useState(""),[busyId,setBusyId]=useState("");
 const load=async()=>{setLoading(true);setErr("");try{setRows(await adminApi("/admin/wallet/deposits"))}catch(e){setErr(e.message)}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const verify=async(row,act)=>{const note=act==="reject"?(window.prompt("Reason for rejection (optional):","")||""):"";setBusyId(row.reference);try{const d=await adminApi("/admin/wallet/deposits/verify",{method:"POST",body:JSON.stringify({reference:row.reference,action:act,confirmedAmount:row.amount,note})});if(action)await action(async()=>d,d.message||"Deposit updated");await load()}catch(e){setErr(e.message)}finally{setBusyId("")}};
 return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">WALLET DEPOSITS</span><h1>Verify wallet deposits</h1><p className="muted">Confirm the M-Pesa statement/code and exact amount before crediting a member's available balance.</p></div><button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div>{err&&<div className="error">{err}</div>}{loading&&<p className="muted">Loading…</p>}<div className="table admin-paybill-table">{rows.map(r=><div className="row paybillrow" key={r.id}><div><b>{r.user?.name}</b><small>{r.user?.email} · {r.user?.phone}</small></div><div><small>Amount</small><strong>{money(r.amount)}</strong></div><div><small>Reference</small><strong className="refcode">{r.reference}</strong></div><div><small>M-Pesa code</small><strong>{r.mpesaCode||"—"}</strong></div><div><small>Submitted</small><span>{new Date(r.createdAt).toLocaleString()}</span></div><div className="rowactions"><button className="primary" disabled={busyId===r.reference||!r.mpesaCode} onClick={()=>verify(r,"approve")}><Check size={14}/> Credit wallet</button><button className="secondary" disabled={busyId===r.reference} onClick={()=>verify(r,"reject")}><X size={14}/> Reject</button></div></div>)}{!loading&&!rows.length&&<div className="adminempty">No pending wallet deposits.</div>}</div></section>}

function AdminPaybillVerify({action}){
 const [rows,setRows]=useState([]);
 const [loading,setLoading]=useState(true);
 const [err,setErr]=useState("");
 const [busyId,setBusyId]=useState("");
 const load=async()=>{
  setLoading(true);setErr("");
  try{setRows(await adminApi("/admin/payments/pending-paybill"))}
  catch(e){setErr(e.message)}
  finally{setLoading(false)};
 };
 useEffect(()=>{load()},[]);
 const verify=async(row, act)=>{
  const note=act==="reject"?window.prompt("Reason for rejection (optional):","")||"":"";
  setBusyId(row.reference);
  try{
   const d=await adminApi("/admin/payments/verify-paybill",{method:"POST",body:JSON.stringify({reference:row.reference,action:act,confirmedAmount:row.amount,note})});
   if(action) await action(async()=>d, d.message||"Updated");
   await load();
  }catch(e){setErr(e.message)}
  finally{setBusyId("")};
 };
 return <section className="adminsection">
  <div className="adminsectionhead"><div><span className="pill">PAYBILL VERIFICATION</span><h1>Confirm M-Pesa Paybill payments</h1><p className="muted">Only approve after you confirm the M-Pesa SMS/paybill statement shows the same amount and confirmation code.</p></div>
   <button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div>
  {err&&<div className="error">{err}</div>}
  {loading&&<p className="muted">Loading…</p>}
  <div className="table admin-paybill-table">
   {rows.map(r=>(
    <div className="row paybillrow" key={r.id}>
     <div><b>{r.user?.name}</b><small>{r.user?.email} · {r.user?.phone}</small></div>
     <div><small>Amount</small><strong>{money(r.amount)}</strong></div>
     <div><small>Reference</small><strong className="refcode">{r.reference}</strong></div>
     <div><small>M-Pesa code</small><strong>{r.mpesaCode||"—"}</strong></div>
     <div><small>Submitted</small><span>{new Date(r.createdAt).toLocaleString()}</span></div>
     <div className="rowactions">
      <button className="primary" disabled={busyId===r.reference||!r.mpesaCode} onClick={()=>verify(r,"approve")}><Check size={14}/> Approve & activate</button>
      <button className="secondary" disabled={busyId===r.reference} onClick={()=>verify(r,"reject")}><X size={14}/> Reject</button>
     </div>
    </div>
   ))}
   {!loading&&!rows.length&&<p className="muted">No pending Paybill payments.</p>}
  </div>
 </section>;
}
function AdminPaymentRepair({action}){return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">PAYMENT RECOVERY</span><h1>Repair a verified payment</h1><p className="muted">Enter the member email and NEXORA payment reference. NEXORA verifies the Co-op Bank Paybill transaction before activating the plan or restoring the missing record.</p></div></div><AdminPaymentRepairInline action={action}/></section>}
function AdminPaymentRepairInline({value,onClose,action}){const [form,setForm]=useState(value||{email:"",reference:""}),[busy,setBusy]=useState(false),[result,setResult]=useState(""),[ok,setOk]=useState(false);const submit=async e=>{e.preventDefault();setBusy(true);setResult("");setOk(false);try{const d=await adminApi("/admin/payments/repair",{method:"POST",body:JSON.stringify(form)});setResult(d.message||"Payment repair complete");setOk(true);if(action)await action(async()=>d,"Payment repair completed")}catch(e){setResult(e.message);setOk(false)}finally{setBusy(false)}};return <div className="adminpanel repairpanel"><form className="repairform" onSubmit={submit}><div className="repairintro"><CreditCard size={22}/><div><h3>Verify before crediting</h3><p className="muted small">This tool never trusts an email or reference alone. The backend checks the current Co-op Paybill payment record (or a legacy Paystack record) and only repairs a payment that can be independently verified.</p></div></div><label>Member email<input required type="email" placeholder="member@example.com" value={form.email} onChange={e=>{setForm({...form,email:e.target.value});setOk(false);setResult("")}}/></label><label>NEXORA transaction reference<input required placeholder="e.g. NEXORA-..." value={form.reference} onChange={e=>{setForm({...form,reference:e.target.value});setOk(false);setResult("")}}/></label>{result&&<div className={ok?"repairdone":"error"} role="status">{ok&&<CheckCircle2 size={20}/>}<div><b>{ok?"Done — payment repaired":"Repair failed"}</b><p>{result}</p></div></div>}<div className="rowactions">{onClose&&<button type="button" className="secondary" onClick={onClose}>Cancel</button>}<button className="primary" disabled={busy}>{busy?"Verifying…":ok?"Repair another":"Verify & repair payment"}</button></div></form></div>}

function AdminAdvertising({products:initialProducts,submissions:initialSubs,action,reload}){
 const [tab,setTab]=useState("submissions"),[products,setProducts]=useState(initialProducts),[subs,setSubs]=useState(initialSubs),[editing,setEditing]=useState(null),[form,setForm]=useState({title:"",description:"",platforms:"WhatsApp Status\nTikTok\nInstagram\nX",viewRatePer1000:0,engagementRate:0,active:true});
 useEffect(()=>{setProducts(initialProducts);setSubs(initialSubs)},[initialProducts,initialSubs]);
 const refresh=async()=>{setProducts(await adminApi("/admin/ad-products"));setSubs(await adminApi("/admin/ad-submissions"));if(reload)await reload()};
 const save=async()=>{const body={...form,platforms:form.platforms.split("\n").map(x=>x.trim()).filter(Boolean),viewRatePer1000:Number(form.viewRatePer1000),engagementRate:Number(form.engagementRate)};const ok=await action(()=>adminApi(editing?`/admin/ad-products/${editing}`:"/admin/ad-products",{method:editing?"PATCH":"POST",body:JSON.stringify(body)}),editing?"Advertising product updated":"Advertising product created");if(ok){setEditing(null);await refresh()}};
 const review=async(x,status)=>{const approved=status==="APPROVED"?(x.approvedPay??x.calculatedPay):status==="PAID"?(x.approvedPay??x.calculatedPay):0;const ok=await action(()=>adminApi(`/admin/ad-submissions/${x.id}`,{method:"PATCH",body:JSON.stringify({status,approvedPay:approved})}),`Submission marked ${status}`);if(ok)await refresh()};
 return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">ADVERTISING CONTROL CENTER</span><h1>Advertising Manager</h1><p className="muted">Create campaigns, set view/engagement rates, review member evidence and process Friday advertising payouts.</p></div><button className="secondary" onClick={refresh}><RefreshCw size={16}/> Refresh</button></div><div className="adminquick adtabs"><button className={tab==="submissions"?"active": ""} onClick={()=>setTab("submissions")}>Submissions ({subs.length})</button><button className={tab==="products"?"active": ""} onClick={()=>setTab("products")}>Products ({products.length})</button></div>{tab==="products"&&<><div className="adminpanel"><div className="adminedit packagecreate"><label>Campaign title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Description<textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Approved platforms <span className="muted small">one per line</span><textarea rows="4" value={form.platforms} onChange={e=>setForm({...form,platforms:e.target.value})}/></label><label>KSh per 1,000 views<input type="number" min="0" value={form.viewRatePer1000} onChange={e=>setForm({...form,viewRatePer1000:e.target.value})}/></label><label>KSh per engagement<input type="number" min="0" value={form.engagementRate} onChange={e=>setForm({...form,engagementRate:e.target.value})}/></label><label className="checkline"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Campaign active</label><div className="rowactions"><button className="primary" onClick={save}>{editing?"Save campaign":"Create campaign"}</button>{editing&&<button className="secondary" onClick={()=>setEditing(null)}>Cancel</button>}</div></div></div><div className="adminpanel tablepanel"><div className="admintable">{products.map(p=><div className="adminrow" key={p.id}><div><b>{p.title}</b><small>{p.description}</small></div><span>{(p.platforms||[]).join(", ")}</span><span>{money(p.viewRatePer1000)}/1k views</span><span>{money(p.engagementRate)}/engagement</span><span>{p._count?.submissions||0} submissions</span><em className={`adminstatus ${p.active?"active":"suspended"}`}>{p.active?"LIVE":"OFF"}</em><button className="rowaction" onClick={()=>{setEditing(p.id);setForm({title:p.title,description:p.description,platforms:(p.platforms||[]).join("\n"),viewRatePer1000:p.viewRatePer1000,engagementRate:p.engagementRate,active:p.active})}}>Edit</button></div>)}</div></div></>}{tab==="submissions"&&<div className="adminpanel tablepanel"><div className="admintable">{subs.map(x=><div className="adminrow adreviewrow" key={x.id}><div><b>{x.user?.name}</b><small>{x.user?.email}</small><small>{x.product?.title}</small></div><div><a href={x.postUrl} target="_blank" rel="noreferrer">Open post</a>{x.postMediaData&&<details><summary>View submitted creative</summary>{String(x.postMediaType||"").startsWith("video/")?<video controls src={x.postMediaData}/>:<img src={x.postMediaData} alt="Submitted campaign creative"/>}</details>}</div><span>{x.views.toLocaleString()} views<br/>{x.engagements.toLocaleString()} engagements</span><strong>Calc: {money(x.calculatedPay)}<br/>Approved: {money(x.approvedPay??0)}</strong><em className={`adminstatus ${String(x.status).toLowerCase()}`}>{x.status}</em><div className="rowactions">{x.status==="SUBMITTED"&&<><button className="rowaction successaction" onClick={()=>review(x,"APPROVED")}>Approve</button><button className="rowaction dangeraction" onClick={()=>review(x,"REJECTED")}>Reject</button></>}{x.status==="APPROVED"&&<button className="rowaction successaction" onClick={()=>review(x,"PAID")}>Mark Friday paid</button>}</div></div>)}{!subs.length&&<div className="adminempty">No advertising submissions yet.</div>}</div></div>}</section>
}
function AdminWithdrawals({rows,action}){return <section className="adminsection"><div className="adminsectionhead"><div><h1>Withdrawals</h1><p className="muted">Member requests deduct a disclosed total from the wallet. Paystack sends the net payout automatically; this page displays fees and status.</p></div></div><div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Member</span><span>Phone</span><span>Payout / fees / debit</span><span>Reference</span><span>Status</span><span>Status check</span></div>{rows.map(x=>{const fee=x.fee??withdrawalFee(x.requestedAmount??x.amount);const psFee=x.paystackFee??paystackMpesaTransferFee(x.payoutAmount??x.amount);const totalDebit=x.totalDebit??(x.requestedAmount??x.amount);const payout=x.payoutAmount??x.amount;return <div className="adminrow" key={x.id}><div><b>{x.user?.name||"Member"}</b><small>{x.user?.email}</small></div><span>{x.phone}</span><div className="withdrawal-admin-amount"><strong>M-PESA: {money(payout)}</strong><small>NEXORA: {money(fee)}</small><small>Paystack: {money(psFee)}</small><small>Wallet debit: {money(totalDebit)}</small></div><span>{x.reference}{x.reviewRequired&&<small className="adminnegative">⚠ Risk review: {x.reviewReason||"large or unusual amount"}</small>}</span><em className={`adminstatus ${String(x.status).toLowerCase()}`}>{x.reviewRequired&&x.status==="PENDING"?"REVIEW REQUIRED":x.status}</em><div className="rowactions">{x.reviewRequired&&x.status==="PENDING"?<button className="rowaction" onClick={()=>{if(window.confirm(`Approve the safety review for ${x.user?.email||"this member"} and start Paystack payout for ${money(payout)}? Confirm that the amount and account activity have been reviewed.`))action(()=>adminApi(`/admin/withdrawals/${x.id}/approve-review`,{method:"POST"}),"Safety review approved; payout initiation requested")}}><ShieldCheck size={13}/> Approve review & pay</button>:x.status==="PROCESSING"?<button className="rowaction" onClick={()=>action(()=>adminApi(`/admin/withdrawals/${x.id}/check-paystack`,{method:"POST"}),"Paystack payout status checked")}><Clock3 size={13}/> Check status</button>:x.status==="PENDING"?<small className="muted">Pending provider processing.</small>:<small className="muted">Final status recorded</small>}</div></div>})}{!rows.length&&<div className="adminempty">No withdrawal requests yet.</div>}</div></div></section>}
function AdminActivity(){const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[err,setErr]=useState("");const load=async(showLoading=true)=>{if(showLoading)setLoading(true);try{setRows(await adminApi("/admin/activity"));setErr("")}catch(e){setErr(e.message)}finally{if(showLoading)setLoading(false)}};useEffect(()=>{load();const timer=window.setInterval(()=>{if(document.visibilityState==="visible")load(false)},15000);return()=>window.clearInterval(timer)},[]);return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">AUDIT TRAIL</span><h1>Admin activity</h1><p className="muted">A record of sensitive administrator actions.</p></div><button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div>{err&&<div className="error">{err}</div>}<div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Action</span><span>Target</span><span>Admin</span><span>Details</span><span>Date</span><span>Reference</span></div>{loading?<div className="adminempty">Loading activity…</div>:rows.map(x=><div className="adminrow" key={x.id}><div><b>{String(x.action).replaceAll("_"," ")}</b></div><div><b>{x.targetType||"—"}</b><small>{x.targetEmail||x.targetId||""}</small></div><span>{x.adminEmail}</span><span>{x.details?.reason||x.details?.reference||x.details?.status||"—"}</span><small>{new Date(x.createdAt).toLocaleString()}</small><small>{x.details?.reference||"—"}</small></div>)}{!loading&&!rows.length&&<div className="adminempty">No admin activity recorded yet.</div>}</div></div></section>}
function AdminSupportTickets({action}){const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[open,setOpen]=useState(null),[response,setResponse]=useState("");const load=async()=>{setLoading(true);try{setRows(await adminApi("/admin/support/tickets"))}catch(e){alert(e.message)}finally{setLoading(false)}};useEffect(()=>{load()},[]);const save=async()=>{if(!open)return;await action(()=>adminApi(`/admin/support/tickets/${open.id}`,{method:"PATCH",body:JSON.stringify({status:open.status,response})}),"Support ticket updated");setOpen(null);setResponse("");await load()};return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">MEMBER CARE</span><h1>Support tickets</h1><p className="muted">Respond to member questions and keep the support history in one place.</p></div><button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div><div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Member</span><span>Subject</span><span>Status</span><span>Message</span><span>Date</span><span>Action</span></div>{loading?<div className="adminempty">Loading tickets…</div>:rows.map(t=><div className="adminrow" key={t.id}><div><b>{t.user?.name}</b><small>{t.user?.email}</small></div><span>{t.subject}</span><em className={`adminstatus ${t.status.toLowerCase()}`}>{t.status}</em><small>{t.message}</small><small>{new Date(t.createdAt).toLocaleString()}</small><button className="rowaction" onClick={()=>{setOpen(t);setResponse(t.response||"")}}>Open</button></div>)}{!loading&&!rows.length&&<div className="adminempty">No support tickets yet.</div>}</div></div>{open&&<div className="modalbackdrop" onClick={()=>setOpen(null)}><div className="modal adminbalance" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">SUPPORT TICKET</span><h2>{open.subject}</h2><p className="muted">{open.user?.name} · {open.user?.email}</p></div><button className="iconbtn" onClick={()=>setOpen(null)}><X size={20}/></button></div><div className="adminbalanceform"><div className="notice">{open.message}</div><label>Status<select value={open.status} onChange={e=>setOpen({...open,status:e.target.value})}><option>OPEN</option><option>IN_PROGRESS</option><option>CLOSED</option></select></label><label>Support reply<textarea rows="8" value={response} onChange={e=>setResponse(e.target.value)} placeholder="Write a clear response to the member…"/></label><div className="rowactions"><button className="secondary" onClick={()=>setOpen(null)}>Cancel</button><button className="primary" onClick={save}><Send size={15}/> Save response</button></div></div></div></div>}</section>}
function AdminAnnouncements({action,admin}){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[editing,setEditing]=useState(null),[broadcastReport,setBroadcastReport]=useState(""),[form,setForm]=useState({title:"",body:"",category:"UPDATE",priority:"GENERAL",requiresAcknowledgement:false,active:true,notifyMembers:false});
 const canBroadcast=["SUPER_ADMIN","ADMIN"].includes(admin?.role);
 const load=async(showLoading=true)=>{if(showLoading)setLoading(true);try{setRows(await adminApi("/admin/announcements"))}catch(e){if(showLoading)alert(e.message)}finally{if(showLoading)setLoading(false)}};
 useEffect(()=>{load();const timer=window.setInterval(()=>{if(document.visibilityState==="visible")load(false)},30000);return()=>window.clearInterval(timer)},[]);
 const reset=()=>{setEditing(null);setForm({title:"",body:"",category:"UPDATE",priority:"GENERAL",requiresAcknowledgement:false,active:true,notifyMembers:false})};
 const save=async()=>{
  if(!form.title.trim()||!form.body.trim())return alert("Title and body are required");
  const isNew=editing==="";
  if(isNew&&form.notifyMembers&&!window.confirm(`Send “${form.title.trim()}” to all active NEXORA members in their in-app notifications and to devices that enabled phone alerts? This sends once and cannot be recalled.`))return;
  const payload={title:form.title,body:form.body,category:form.category,priority:form.priority||"GENERAL",requiresAcknowledgement:Boolean(form.requiresAcknowledgement),active:form.active,...(isNew&&canBroadcast?{notifyMembers:Boolean(form.notifyMembers)}:{})};
  let responseData=null;
  const ok=await action(async()=>{responseData=await adminApi(isNew?"/admin/announcements":`/admin/announcements/${editing}`,{method:isNew?"POST":"PATCH",body:JSON.stringify(payload)});return responseData;},isNew?(form.notifyMembers?"Announcement published and member notification broadcast attempted":"Announcement published"):"Announcement updated");
  if(ok){
   if(isNew&&form.notifyMembers&&responseData?.broadcast){const b=responseData.broadcast;setBroadcastReport(b.warning||`In-app notification saved for ${Number(b.recipients||0).toLocaleString()} active member(s). Push provider accepted ${Number(b.pushSent||0).toLocaleString()} device notification(s); actual display depends on each device/browser.`);}
   reset();await load()
  }
 };
 return <section className="adminsection">{broadcastReport&&<div className="notice" role="status">{broadcastReport}<button type="button" onClick={()=>setBroadcastReport("")}>×</button></div>}<div className="adminsectionhead"><div><span className="pill">COMMUNICATION CENTER</span><h1>Announcements</h1><p className="muted">Publish platform updates, education reminders, occasional greetings and important member guidance.</p></div><button className="primary" onClick={()=>{setEditing("");setForm({title:"",body:"",category:"UPDATE",active:true,notifyMembers:false})}}>New announcement</button></div>
 {editing!==null&&<div className="adminpanel adminedit"><label>Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Category<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label><label>Priority<select value={form.priority||"GENERAL"} onChange={e=>setForm({...form,priority:e.target.value,requiresAcknowledgement:e.target.value==="CRITICAL"?true:form.requiresAcknowledgement})}><option value="CRITICAL">Critical — red alert</option><option value="IMPORTANT">Important — orange alert</option><option value="GENERAL">General — standard update</option><option value="OPPORTUNITY">Opportunity — green alert</option></select></label><label className="checkline"><input type="checkbox" checked={!!form.requiresAcknowledgement} onChange={e=>setForm({...form,requiresAcknowledgement:e.target.checked})}/> Require member acknowledgement</label><label>Message<textarea rows="7" value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></label><label className="checkline"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Visible to members</label>{editing===""&&canBroadcast&&<><label className="checkline"><input type="checkbox" checked={Boolean(form.notifyMembers)} onChange={e=>setForm({...form,notifyMembers:e.target.checked})}/> Also send this update as an in-app notification and phone push to members who enabled alerts</label><p className="muted">Use this for important updates or an occasional greeting. This sends once; it does not create a recurring schedule. All active members receive an in-app notification, and only subscribed devices receive phone push.</p></>}<div className="rowactions"><button className="secondary" onClick={reset}>Cancel</button><button className="primary" onClick={save}>{editing===""&&form.notifyMembers?"Publish & notify members":"Publish"}</button></div></div>}
 <div className="adminpanel tablepanel"><div className="admintable">{loading?<div className="adminempty">Loading announcements…</div>:rows.map(x=><div className="adminrow" key={x.id}><div><b>{x.title}</b><small>{x.category} · {x.priority||"GENERAL"}</small><small>Opened: {x.readStats?.opened||0}/{x.readStats?.targeted||0} · Unopened: {x.readStats?.unopened||0} · Acknowledged: {x.readStats?.acknowledged||0}</small></div><span>{x.body}</span><em className={`adminstatus ${x.active?"active":"suspended"}`}>{x.active?"LIVE":"HIDDEN"}</em><small>{new Date(x.createdAt).toLocaleString()}</small><div className="rowactions"><button className="rowaction" onClick={()=>{setEditing(x.id);setForm({title:x.title,body:x.body,category:x.category,priority:x.priority||"GENERAL",requiresAcknowledgement:!!x.requiresAcknowledgement,active:x.active,notifyMembers:false})}}><Settings2 size={13}/> Edit</button><button className="rowaction" onClick={()=>action(()=>adminApi(`/admin/announcements/${x.id}`,{method:"PATCH",body:JSON.stringify({active:!x.active})}),x.active?"Announcement hidden":"Announcement published")}>{x.active?"Hide":"Publish"}</button></div></div>)}{!rows.length&&!loading&&<div className="adminempty">No announcements yet.</div>}</div></div></section>
}
function AdminPackages({rows,action}){const [editing,setEditing]=useState(null),[creating,setCreating]=useState(false),[form,setForm]=useState({});const open=p=>{setEditing(p.id);setForm({price:p.price,directCommission:p.directCommission,level2Commission:p.level2Commission,active:p.active,description:p.description||"",features:(p.features||[]).join("\n"),badge:p.badge||"",popular:!!p.popular,withdrawalLimit:p.withdrawalLimit||0})};return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">PLAN CONTROL</span><h1>Plans</h1><p className="muted">Control prices, referral rewards, benefits, badges, limits and which plan is highlighted.</p></div><button className="primary" onClick={()=>{setCreating(true);setEditing(null);setForm({name:"",price:0,directCommission:0,level2Commission:0,description:"",features:"",badge:"",popular:false,active:true,withdrawalLimit:0})}}>Add plan</button></div>{creating&&<div className="adminpanel"><div className="adminedit packagecreate"><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Price<input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Direct commission<input type="number" value={form.directCommission} onChange={e=>setForm({...form,directCommission:e.target.value})}/></label><label>Level 2 commission<input type="number" value={form.level2Commission} onChange={e=>setForm({...form,level2Commission:e.target.value})}/></label><label>Description<input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Features <span className="muted small">one per line</span><textarea rows="5" value={form.features} onChange={e=>setForm({...form,features:e.target.value})}/></label><label>Badge<input value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})}/></label><label>Withdrawal limit<input type="number" value={form.withdrawalLimit} onChange={e=>setForm({...form,withdrawalLimit:e.target.value})}/></label><label className="checkline"><input type="checkbox" checked={form.popular} onChange={e=>setForm({...form,popular:e.target.checked})}/> Mark as popular</label><div className="rowactions"><button className="secondary" onClick={()=>setCreating(false)}>Cancel</button><button className="primary" onClick={()=>action(()=>adminApi("/admin/packages",{method:"POST",body:JSON.stringify({...form,name:form.name.trim(),price:Number(form.price),directCommission:Number(form.directCommission),level2Commission:Number(form.level2Commission),withdrawalLimit:Number(form.withdrawalLimit),features:form.features.split("\n").map(x=>x.trim()).filter(Boolean)})}),"Plan created")}>Create plan</button></div></div></div>}<div className="adminpackagegrid">{rows.map(p=><div className="adminpkg" key={p.id}><div className="adminpkghead"><div><span className="pkgname">{p.name}</span><small>{p._count?.users||0} members</small></div><em className={`adminstatus ${p.active?"active":"suspended"}`}>{p.active?"ACTIVE":"OFF"}</em></div>{editing===p.id?<div className="adminedit"><label>Price<input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Direct commission<input type="number" value={form.directCommission} onChange={e=>setForm({...form,directCommission:e.target.value})}/></label><label>Level 2 commission<input type="number" value={form.level2Commission} onChange={e=>setForm({...form,level2Commission:e.target.value})}/></label><label>Description<input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Features <span className="muted small">one per line</span><textarea rows="6" value={form.features} onChange={e=>setForm({...form,features:e.target.value})}/></label><label>Badge<input value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})}/></label><label>Withdrawal limit (0 = no plan limit)<input type="number" value={form.withdrawalLimit} onChange={e=>setForm({...form,withdrawalLimit:e.target.value})}/></label><label className="checkline"><input type="checkbox" checked={form.popular} onChange={e=>setForm({...form,popular:e.target.checked})}/> Mark as popular</label><label className="checkline"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Active</label><div className="rowactions"><button className="secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="primary" onClick={()=>action(()=>adminApi(`/admin/packages/${p.id}`,{method:"PATCH",body:JSON.stringify({...form,price:Number(form.price),directCommission:Number(form.directCommission),level2Commission:Number(form.level2Commission),withdrawalLimit:Number(form.withdrawalLimit),features:form.features.split("\n").map(x=>x.trim()).filter(Boolean)})}),"Plan updated")}>Save</button></div></div>:<><h2>{money(p.price)}</h2>{p.description&&<p className="pkgdesc">{p.description}</p>}<div className="commission"><div><b>{money(p.directCommission)}</b><small>Direct</small></div><div><b>{money(p.level2Commission)}</b><small>Level 2</small></div></div>{p.features?.length>0&&<ul className="pkgfeatures">{p.features.slice(0,4).map((x,j)=><li key={j}><Check size={14}/>{x}</li>)}</ul>}<button className="secondary" onClick={()=>open(p)}>Edit plan benefits</button></>}</div>)}</div></section>}


function ReferralTree({data,me}){const direct=data?.direct||[];const level2=data?.level2||[];return <div className="panel trepanel"><div className="paneltitle"><h3><Users2 size={18}/> Network map</h3><span>{direct.length} direct · {level2.length} level 2</span></div><div className="tree"><div className="treeperson root"><div className="avatar">{me.user.name?.[0]?.toUpperCase()||"N"}</div><b>{me.user.name?.split(" ")[0]}</b><small>Your account</small></div><div className="treebranch">{direct.slice(0,8).map((x,i)=><div className="treecolumn" key={x.id}><div className="treeperson"><div className="avatar">{x.name?.[0]?.toUpperCase()||"M"}</div><b>{x.name?.split(" ")[0]}</b><small>{x.package?.name||"No plan"}</small></div><div className="treechildren">{level2.filter(y=>y.referredById===x.id).slice(0,4).map(y=><div className="treeperson mini" key={y.id}><div className="avatar">{y.name?.[0]?.toUpperCase()||"M"}</div><b>{y.name?.split(" ")[0]}</b></div>)}</div></div>)}</div>{!direct.length&&<p className="muted">Your network map will appear here as your direct referrals join.</p>}</div></div>}
function ProfileCard({me,strength,goSecurity}){return <div className="panel profilecard"><div className="profileavatar">{me.user.name?.[0]?.toUpperCase()||"N"}</div><div className="profileinfo"><span className="pill">MEMBER PROFILE</span><h2>{me.user.name}</h2><p>{me.user.email}</p><div className="profilemeta"><span>{me.package?.name||"No plan"}</span><span>Code: {me.user.referralCode}</span><span>Member since {formatMemberSince(me.user.createdAt)}</span></div><div className="profilemeter"><b>Profile completeness · {strength}%</b><div className="progress"><i style={{width:`${strength}%`}}/></div></div><button className="secondary" onClick={goSecurity}><UserCog size={15}/> Edit profile</button></div></div>}
function Products({me,packages=[],purchase,goPlans}){
 const premium=me?.package?.name==="Premium";
 const [products,setProducts]=useState([]),[loading,setLoading]=useState(false),[selected,setSelected]=useState(null),[err,setErr]=useState(""),[msg,setMsg]=useState(""),[submissions,setSubmissions]=useState([]);
 const [form,setForm]=useState({postUrl:"",proofUrl:"",views:"",engagements:"",postMediaData:"",postMediaName:"",postMediaType:""});
 const [busy,setBusy]=useState(false);
 const load=async()=>{if(!premium)return;setLoading(true);try{setProducts(await api("/ad-products"));setSubmissions(await api("/ad-submissions"));}catch(e){setErr(e.message||"Unable to load advertising products")}finally{setLoading(false)}};
 useEffect(()=>{load()},[premium]);
 const openSubmit=p=>{setSelected(p);setErr("");setMsg("");setForm({postUrl:"",proofUrl:"",views:"",engagements:"",postMediaData:"",postMediaName:"",postMediaType:""})};
 const readMedia=e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>8*1024*1024){setErr("Please choose an image or video under 8 MB.");e.target.value="";return}const reader=new FileReader();reader.onload=()=>setForm(x=>({...x,postMediaData:String(reader.result),postMediaName:f.name,postMediaType:f.type}));reader.readAsDataURL(f)};
 const submit=async e=>{e.preventDefault();if(!selected)return;if(!form.postMediaData)return setErr("Upload the exact post creative you published so NEXORA can compare it with the campaign.");setBusy(true);setErr("");setMsg("");try{const r=await api(`/ad-products/${selected.id}/submit`,{method:"POST",body:JSON.stringify({...form,views:Number(form.views),engagements:Number(form.engagements)})});setMsg(r.message||"Advertising performance submitted for review.");setSelected(null);await load()}catch(e){setErr(e.message||"Unable to submit advertising performance")}finally{setBusy(false)}};
 const copyPost=async()=>{const text=`🚀 Turn your social reach into an opportunity with NEXORA!\n\nNEXORA is a member platform where you can learn, build referrals and, after activating Premium, access selected advertising products. Premium members can promote approved products on WhatsApp Status, TikTok, Instagram, X and other approved platforms.\n\n📊 Advertising payouts are based on verified views and engagements and are processed weekly on Friday after review.\n🤝 All members can also participate in qualifying referrals.\n\nLearn more: ${location.origin}`;try{await navigator.clipboard.writeText(text);setMsg("Marketing post copied. Personalize it before publishing.")}catch{window.prompt("Copy this post:",text)}};
 if(!premium){
  const premiumPkg=(packages||[]).find(x=>x.name==="Premium");
  const currentPrice=Number(me?.package?.price||0);
  const charge=premiumPkg?Math.max(0,Number(premiumPkg.price)-currentPrice):null;
  const isUpgrade=!!me?.package && charge!=null && charge<Number(premiumPkg?.price||0);
  return <section className="premiumgate"><div className="adtruststrip"><ShieldCheck size={16}/><span>Verified post + Friday review · No fixed income is promised.</span></div>
    <div className="sectionhead"><div><span className="pill">PREMIUM MEMBER AREA</span><h1>Products & Advertising</h1><p className="muted">Advertising campaigns are available only on the Premium plan. Activate Premium below to unlock approved products and Friday payout review.</p></div></div>
    <div className="lockedpanel productlock">
      <Crown size={32}/>
      <div>
        <h3>Premium plan required</h3>
        <p className="muted">Starter, Growth, Pro and Elite plans focus on referral earning. Premium unlocks the advertising marketplace on top of full referral access.</p>
      </div>
    </div>
    {premiumPkg&&(
      <div className="panel premiumoffer">
        <div className="premiumofferhead">
          <div>
            <span className="packagebadge">VIP</span>
            <h2>Premium plan</h2>
            <p className="muted">{premiumPkg.description||"The complete NEXORA member experience with Premium advertising access."}</p>
          </div>
          <div className="premiumprice">
            <strong>{money(premiumPkg.price)}</strong>
            {isUpgrade&&charge!=null&&<small>Upgrade difference: {money(charge)}</small>}
            {!me?.package&&<small>One-time plan activation</small>}
          </div>
        </div>
        <ul className="premiumfeatures">
          {(premiumPkg.features&&premiumPkg.features.length?premiumPkg.features:[
            "Everything in Elite",
            "Products & Advertising access",
            "Weekly Friday advertising payout processing",
            "Referral earning across all plan levels",
            "VIP support and Premium badge"
          ]).map((f,i)=><li key={i}><Check size={14}/>{f}</li>)}
        </ul>
        <div className="premiumterms">
          <b>Premium advertising terms</b>
          <ul>
            <li>Advertising is available only after Premium is active on your account.</li>
            <li>You may promote only approved campaign products published by NEXORA.</li>
            <li>Submit the public post link and the exact creative you published so performance can be verified.</li>
            <li>Approved earnings are processed weekly on Friday and depend on verified views and engagements — not on unverified screenshots alone.</li>
            <li>Submission does not guarantee approval or any fixed payout amount.</li>
            <li>Results depend on your qualifying activity and plan rules. Advertising results vary by campaign, platform and audience.</li>
            <li>Upgrades charge only the price difference from your current plan (if any).</li>
            <li>By purchasing Premium you confirm you have reviewed the <a href="/membership" target="_blank" rel="noreferrer">Membership rules</a>, <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</li>
          </ul>
        </div>
        <div className="premiumactions">
          <button type="button" className="primary" onClick={()=>purchase?purchase(premiumPkg):null} disabled={!purchase||!premiumPkg}>
            <Crown size={16}/> {isUpgrade?`Upgrade to Premium · ${money(charge)}`:`Activate Premium · ${money(premiumPkg.price)}`}
          </button>
          <button type="button" className="secondary" onClick={()=>goPlans?goPlans():null}>Compare all plans</button>
        </div>
      </div>
    )}
    {!premiumPkg&&(
      <div className="panel empty">
        <PackageIcon size={28}/>
        <h3>Premium plan unavailable</h3>
        <p className="muted">We could not load the Premium plan right now. Open Membership plans or try again later.</p>
        <button type="button" className="primary" onClick={()=>goPlans?goPlans():null}>View membership plans</button>
      </div>
    )}
    <div className="notice"><CalendarCheck2 size={16}/> Approved advertising payouts are processed weekly on Friday and depend on verified views and engagements. No fixed income is guaranteed.</div>
  </section>;
}
 return <section><div className="sectionhead"><div><span className="pill">PREMIUM ADVERTISING</span><h1>Products & Advertising</h1><p className="muted">Choose an approved product, publish the supplied creative, share the public post link and upload the exact post you published.</p></div><div className="sectionactions"><span className="packagebadge">Premium</span></div></div>
 <div className="how-row">
  <button type="button" className="how-chip" onClick={e=>{const p=e.currentTarget.nextElementSibling;if(p){p.classList.toggle("open");e.currentTarget.classList.toggle("open")}}}>How advertising works</button>
  <div className="how-panel" style={{width:"100%"}}>1) Pick an approved campaign 2) Publish the creative on an allowed platform 3) Submit the public link + exact post upload + views/engagements 4) Admin reviews 5) Approved payouts process on Friday.</div>
 </div>
 <div className="adtruststrip"><ShieldCheck size={16}/><span>Verified post + Friday review · Performance-based — results vary by campaign.</span></div>
 {products[0]&&<div className="panel campaignweek"><div className="campaignweekhead"><span className="pill">CAMPAIGN OF THE WEEK</span><h3>{products[0].title}</h3><p className="muted">{products[0].description||"Featured advertising product."}</p></div><div className="campaignweekmeta"><span>{money(products[0].viewRatePer1000)} / 1,000 views</span><span>{money(products[0].engagementRate)} / engagement</span></div><button type="button" className="primary" onClick={()=>openSubmit(products[0])}><Link2 size={16}/> Promote this campaign</button></div>}
 <div className="adpolicygrid"><div className="panel"><Store size={22}/><h3>How it works</h3><p className="muted">1. Select a campaign. 2. Publish the campaign creative on an approved platform. 3. Submit the public post link and the exact image/video you posted. 4. Enter the platform's current views and engagements. 5. NEXORA reviews the evidence and schedules approved earnings for Friday processing.</p></div><div className="panel"><CalendarCheck2 size={22}/><h3>Friday payout cycle</h3><p className="muted">Rates are configured per campaign. Final payout uses verified performance, not unverified screenshots or self-reported figures alone.</p></div></div>
 <div className="panel marketingpostkit"><div><Megaphone size={22}/><h3>Ready-to-use NEXORA marketing post</h3><p className="muted">Use this as a starting point. Add your own voice and never promise guaranteed earnings.</p></div><div className="postpreview"><strong>🚀 Discover NEXORA</strong><p>Learn. Connect. Grow. Build.</p><p>NEXORA brings referrals, learning tools, analytics and — for Premium members — approved advertising opportunities together in one workspace.</p><p>Premium members can promote selected products on approved social platforms and submit verified performance for Friday payout review.</p><b>Learn more: {location.origin}</b></div><button className="secondary" onClick={copyPost}><ClipboardCopy size={15}/> Copy marketing post</button></div>
 {msg&&<div className="notice">{msg}</div>}{err&&<div className="error">{err}</div>}
 {loading?<div className="nx-skel-grid" aria-hidden="true"><div className="nx-skeleton nx-skel-product"/><div className="nx-skeleton nx-skel-product"/><div className="nx-skeleton nx-skel-product"/></div>:products.length?<div className="productgrid">{products.map(p=><div className="productcard" key={p.id}><div className="producttop"><span className="pill">AVAILABLE</span><small>{(p.platforms||[]).join(" · ")}</small></div><h3>{p.title}</h3><p className="muted">{p.description}</p><div className="productmeta"><span>Views rate: {money(p.viewRatePer1000)} / 1,000</span><span>Engagement rate: {money(p.engagementRate)} / engagement</span></div><button className="primary" onClick={()=>openSubmit(p)}><Link2 size={16}/> Submit promotion</button></div>)}</div>:<div className="panel empty"><Store size={30}/><h3>No advertising products are available yet</h3><p className="muted">Check back when NEXORA publishes a campaign.</p></div>}
 <div className="panel"><h3>Your advertising submissions</h3>{submissions.length?submissions.map(x=><div className="adsubmissionrow" key={x.id}><div><b>{x.product?.title}</b><small>{new Date(x.submittedAt).toLocaleString()} · {x.views.toLocaleString()} views · {x.engagements.toLocaleString()} engagements</small></div><em className={`adminstatus ${String(x.status).toLowerCase()}`}>{x.status}</em><strong>{money(x.approvedPay??x.calculatedPay)}</strong></div>):<p className="muted">No advertising submissions yet.</p>}</div>
 {selected&&<div className="modalbackdrop" onClick={()=>setSelected(null)}><div className="modal adsubmitmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">CAMPAIGN SUBMISSION</span><h2>{selected.title}</h2></div><button className="iconbtn" onClick={()=>setSelected(null)}><X size={20}/></button></div><form onSubmit={submit}><div className="adsubmitbody"><p className="muted">Paste the public post URL and upload the exact creative you published. This helps NEXORA verify that the campaign was actually posted.</p><label className="fieldlabel">Public post / status link<input required type="url" value={form.postUrl} onChange={e=>setForm({...form,postUrl:e.target.value})} placeholder="https://…"/></label><label className="fieldlabel">Upload the post you published<input required type="file" accept="image/*,video/*" onChange={readMedia}/></label>{form.postMediaData&&<div className="mediapreview">{form.postMediaType.startsWith("video/")?<video controls src={form.postMediaData}/>:<img src={form.postMediaData} alt="Submitted campaign post"/>}<small>{form.postMediaName}</small></div>}<label className="fieldlabel">Proof / analytics screenshot link (optional)<input type="url" value={form.proofUrl} onChange={e=>setForm({...form,proofUrl:e.target.value})} placeholder="https://…"/></label><div className="admetricgrid"><label className="fieldlabel">Current views<input required min="0" type="number" value={form.views} onChange={e=>setForm({...form,views:e.target.value})}/></label><label className="fieldlabel">Current engagements<input required min="0" type="number" value={form.engagements} onChange={e=>setForm({...form,engagements:e.target.value})}/></label></div><div className="notice"><Eye size={16}/> Enter the figures visible on the platform. NEXORA can request additional verification before approval.</div></div><div className="modalfoot"><button type="button" className="secondary" onClick={()=>setSelected(null)} disabled={busy}>Cancel</button><button className="primary" disabled={busy}>{busy?"Submitting…":"Submit for review"}</button></div></form></div></div>}</section>
}

function Marketplace({me}){
 const [tab,setTab]=useState("shop"),[products,setProducts]=useState([]),[mine,setMine]=useState([]),[orders,setOrders]=useState({buying:[],selling:[]}),[wishlist,setWishlist]=useState([]),[cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem("nexora-cart")||"[]")}catch{return[]}}),[recentViews,setRecentViews]=useState(()=>{try{return JSON.parse(localStorage.getItem("nexora-recent-products")||"[]")}catch{return[]}}),[q,setQ]=useState(""),[category,setCategory]=useState("All"),[location,setLocation]=useState(""),[sort,setSort]=useState("newest"),[minPrice,setMinPrice]=useState(""),[maxPrice,setMaxPrice]=useState(""),[selected,setSelected]=useState(null),[notice,setNotice]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[couponCode,setCouponCode]=useState(""),[coupon,setCoupon]=useState(null),[couponBusy,setCouponBusy]=useState(false),[form,setForm]=useState({title:"",description:"",price:"",stock:"1",category:"Other",location:"",phone:me.user.phone||"",images:[]}),[checkout,setCheckout]=useState({deliveryName:me.user.name||"",deliveryPhone:me.user.phone||"",deliveryAddress:"",deliveryNotes:"",paymentMethod:"CASH_ON_DELIVERY"});
 const categories=["All","Fashion","Electronics","Phones & Accessories","Home","Beauty","Food","Services","Vehicles","Property","Jobs","Other"];
 const saveCart=c=>{setCart(c);localStorage.setItem("nexora-cart",JSON.stringify(c));setCoupon(null);setCouponCode("")};
 const loadProducts=async()=>{setBusy(true);try{setProducts(await api(`/marketplace/products?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}`));}catch(e){setError(e.message)}finally{setBusy(false)}};
 const loadMine=async()=>{try{setMine(await api("/marketplace/my-products"))}catch(e){setError(e.message)}};
 const loadWishlist=async()=>{try{setWishlist(await api("/marketplace/wishlist"))}catch(e){setError(e.message)}};
 const loadOrders=async()=>{try{setOrders(await api("/marketplace/orders"))}catch(e){setError(e.message)}};
 useEffect(()=>{loadProducts();loadWishlist()},[category]); useEffect(()=>{if(tab==="sell")loadMine();if(tab==="orders")loadOrders()},[tab]);
 const toggleWishlist=async p=>{try{const r=await api(`/marketplace/wishlist/${p.id}`,{method:"POST"});setWishlist(w=>r.saved?[...w,{product:p}]:w.filter(x=>x.productId!==p.id));setNotice(r.saved?"Saved to wishlist.":"Removed from wishlist.")}catch(e){setError(e.message)}};
 const isSaved=p=>wishlist.some(x=>(x.productId||x.product?.id)===p.id);
 const addToCart=p=>{const existing=cart.find(x=>x.productId===p.id);if(existing){if(existing.quantity>=p.stock)return setError("You have reached the available stock for this product.");saveCart(cart.map(x=>x.productId===p.id?{...x,quantity:x.quantity+1}:x));}else saveCart([...cart,{productId:p.id,title:p.title,price:p.price,quantity:1,stock:p.stock,sellerId:p.sellerId,sellerName:p.seller?.name,images:p.images||[]}]);setNotice("Added to cart.");};
 const remove=p=>saveCart(cart.filter(x=>x.productId!==p.productId));
 const changeQty=(id,n)=>saveCart(cart.map(x=>x.productId===id?{...x,quantity:Math.max(1,Math.min(x.stock,Number(n)||1))}:x));
 const subtotal=cart.reduce((a,x)=>a+x.price*x.quantity,0);const discount=coupon&&coupon.subtotal===subtotal?Math.min(subtotal,Math.max(0,Number(coupon.discount)||0)):0;const total=Math.max(0,subtotal-discount);
 const minBase=localToBase(minPrice);const maxBase=localToBase(maxPrice);const displayedProducts=[...products].filter(p=>(!minPrice||Number(p.price)>=minBase)&&(!maxPrice||Number(p.price)<=maxBase)).sort((a,b)=>sort==="priceLow"?Number(a.price)-Number(b.price):sort==="priceHigh"?Number(b.price)-Number(a.price):sort==="popular"?Number(b._count?.orderItems||0)-Number(a._count?.orderItems||0):new Date(b.createdAt)-new Date(a.createdAt));
 const submitProduct=async e=>{e.preventDefault();setBusy(true);setError("");try{const payload={...form,price:Math.round(localToBase(form.price)*100)/100};const r=await api("/marketplace/products",{method:"POST",body:JSON.stringify(payload)});setNotice("Product published successfully.");setMine([r,...mine]);setForm({title:"",description:"",price:"",stock:"1",category:"Other",location:"",phone:me.user.phone||"",images:[]});}catch(e){setError(e.message)}finally{setBusy(false)}};
 const readImages=async e=>{
  const files=[...e.target.files].slice(0,6);
  try{
    const images=[];
    for(const f of files){
      const compressed=await compressImageFile(f,1200,0.72);
      if(compressed.size>1800000) throw new Error("Each product image must be under 1.8 MB after compression.");
      images.push(await fileToDataUrl(compressed));
    }
    setForm({...form,images});
  }catch(err){setError(err.message||"Could not process images")}
  finally{e.target.value="";}
};
 const applyCoupon=async()=>{const code=couponCode.trim().toUpperCase();if(!code){setError("Enter a coupon code first.");return}setCouponBusy(true);setError("");try{const result=await api("/marketplace/coupons/validate",{method:"POST",body:JSON.stringify({code,subtotal})});setCoupon({...result,subtotal});setCouponCode(result.code);setNotice(`Coupon applied: ${money(result.discount)} discount.`)}catch(e){setCoupon(null);setError(e.message||"Could not validate coupon.")}finally{setCouponBusy(false)}};
  const checkoutNow=async e=>{e.preventDefault();if(!cart.length)return setError("Your cart is empty.");setBusy(true);setError("");try{const r=await api("/marketplace/orders",{method:"POST",body:JSON.stringify({...checkout,...(coupon&&coupon.subtotal===subtotal?{couponCode:coupon.code}:{}),items:cart.map(x=>({productId:x.productId,quantity:x.quantity}))})});setNotice(r.message);saveCart([]);setTab("orders");await loadOrders();}catch(e){setError(e.message)}finally{setBusy(false)}};
 const updateOrder=async(id,status)=>{try{await api(`/marketplace/orders/${id}/status`,{method:"PATCH",body:JSON.stringify({status})});await loadOrders();setNotice("Order status updated.")}catch(e){setError(e.message)}};
 const disputeOrder=async(id)=>{const reason=window.prompt("What is the issue with this order?","Order issue");if(!reason)return;try{await api(`/marketplace/orders/${id}/disputes`,{method:"POST",body:JSON.stringify({reason,details:"Submitted from NEXORA Marketplace"})});setNotice("Order issue submitted to NEXORA support.")}catch(e){setError(e.message)}};
 const sameSeller=cart.length<2||cart.every(x=>x.sellerId===cart[0].sellerId);
 return <section className="nexora-marketplace"><div className="sectionhead market-sectionhead"><div><span className="pill">NEXORA MARKETPLACE</span><h1>Discover. Shop. Earn.</h1><p className="muted">A member marketplace for buying and selling products and services with clear pricing, seller details and delivery information.</p></div><div className="sectionactions"><button className="primary" onClick={()=>setTab("cart")}><ShoppingCart size={16}/> Cart ({cart.reduce((a,x)=>a+x.quantity,0)})</button></div></div>
 <div className="market-tabs"><button className={tab==="shop"?"active":""} onClick={()=>setTab("shop")}><Store size={16}/> Shop</button><button className={tab==="wishlist"?"active":""} onClick={()=>setTab("wishlist")}><Heart size={16}/> Wishlist ({wishlist.length})</button><button className={tab==="cart"?"active":""} onClick={()=>setTab("cart")}><ShoppingCart size={16}/> Cart</button><button className={tab==="sell"?"active":""} onClick={()=>setTab("sell")}><Plus size={16}/> Sell a product</button><button className={tab==="myshop"?"active":""} onClick={()=>{setTab("myshop");loadMine()}}><PackageIcon size={16}/> My listings</button><button className={tab==="orders"?"active":""} onClick={()=>{setTab("orders");loadOrders()}}><Truck size={16}/> Orders</button><button className={tab==="seller"?"active":""} onClick={()=>{setTab("seller");loadMine();loadOrders()}}><BarChart2 size={16}/> Seller dashboard</button></div>
 {notice&&<div className="notice">{notice}</div>}{error&&<div className="error">{error}</div>}
 {tab==="shop"&&<>{recentViews.length>0&&<div className="recentstrip panel"><div className="paneltitle"><h3>Recently viewed</h3><button type="button" className="secondary narrow" onClick={()=>{setRecentViews([]);localStorage.removeItem("nexora-recent-products")}}>Clear</button></div><div className="recentrow">{recentViews.map(p=><button type="button" className="recentchip" key={p.id} onClick={()=>setSelected(p)}><b>{p.title}</b><span>{money(p.price)}</span></button>)}</div></div>}<div className="marketfilters"><div className="searchbox"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadProducts()} placeholder="Search products, services or locations…"/></div><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select><div className="searchbox"><MapPin size={17}/><input value={location} onChange={e=>setLocation(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadProducts()} placeholder="Location e.g. Nairobi"/></div><input className="pricefilter" type="number" min="0" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder={`Min ${currencyState().currency.code}`}/><input className="pricefilter" type="number" min="0" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder={`Max ${currencyState().currency.code}`}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest</option><option value="priceLow">Price: low to high</option><option value="priceHigh">Price: high to low</option><option value="popular">Most ordered</option></select><button className="primary market-search-submit" onClick={loadProducts}><Search size={15}/> Search products</button><button className="secondary market-clear-filters" onClick={()=>{setQ("");setCategory("All");setLocation("");setMinPrice("");setMaxPrice("");setSort("newest");setError("");setBusy(true);api("/marketplace/products?q=&category=All&location=").then(setProducts).catch(e=>setError(e.message)).finally(()=>setBusy(false))}}>Clear filters</button></div><div className="market-results-head"><div><h2>Explore products</h2><p className="muted">Find your next great buy from the NEXORA community</p></div><span className="market-result-count">{displayedProducts.length} found</span></div>{busy?<div className="market-skeleton-grid" role="status" aria-label="Loading products">{Array.from({length:6},(_,i)=><div className="market-skeleton-card" key={i}><div className="market-skeleton-image"/><div className="market-skeleton-line wide"/><div className="market-skeleton-line"/><div className="market-skeleton-line short"/><div className="market-skeleton-actions"><i/><i/></div></div>)}</div>:<div className="marketgrid">{displayedProducts.map(p=><article className="marketcard" key={p.id}><div className="marketimage">{p.images?.[0]?<img src={p.images[0]} alt={p.title}/>:<Store size={38}/>}<span>{p.category}</span></div><div className="marketcardbody"><h3>{p.title}</h3><p className="muted marketdesc">{p.description}</p><strong className="marketprice">{money(p.price)}</strong><div className="marketseller"><span><MapPin size={14}/> {p.location}</span><span>Seller: {p.seller?.name||"Member"}</span>{p.seller?.sellerVerified&&<span className="verifiedseller"><ShieldCheck size={12}/> Verified</span>}</div><div className="marketstock">{p.stock} available</div><div className="marketactions"><button className="iconbtn" title="Wishlist" onClick={()=>toggleWishlist(p)}><Heart size={16} fill={isSaved(p)?"currentColor":"none"}/></button><button className="secondary" onClick={()=>{setSelected(p);const next=[p,...recentViews.filter(x=>x.id!==p.id)].slice(0,8);setRecentViews(next);try{localStorage.setItem("nexora-recent-products",JSON.stringify(next.map(x=>({id:x.id,title:x.title,price:x.price,images:x.images,location:x.location,category:x.category,seller:x.seller}))))}catch{}}}>View details</button><button className="primary" onClick={()=>addToCart(p)}><ShoppingCart size={15}/> Add</button></div></div></article>)}{!displayedProducts.length&&<div className="panel empty market-empty"><Store size={30}/><h3>No products found</h3><p className="muted">Try a different keyword, location or price range, or clear your filters to see all available listings.</p><button type="button" className="secondary" onClick={()=>{setQ("");setCategory("All");setLocation("");setMinPrice("");setMaxPrice("");setSort("newest");setError("");setBusy(true);api("/marketplace/products?q=&category=All&location=").then(setProducts).catch(e=>setError(e.message)).finally(()=>setBusy(false))}}>Clear all filters</button></div>}</div>}</>}
 {tab==="wishlist"&&<div className="marketgrid">{wishlist.map(w=>{const p=w.product;return <article className="marketcard" key={p.id}><div className="marketimage">{p.images?.[0]?<img src={p.images[0]} alt={p.title}/>:<Store size={38}/>}<span>{p.category}</span></div><div className="marketcardbody"><h3>{p.title}</h3><p className="muted marketdesc">{p.description}</p><strong className="marketprice">{money(p.price)}</strong><div className="marketactions"><button className="secondary" onClick={()=>setSelected(p)}>View</button><button className="primary" onClick={()=>addToCart(p)}><ShoppingCart size={15}/> Add</button></div></div></article>})}{!wishlist.length&&<div className="panel empty"><Heart size={30}/><h3>Your wishlist is empty</h3><p className="muted">Save products you want to compare or buy later.</p></div>}</div>}{tab==="cart"&&<div className="marketlayout"><div className="panel cartpanel"><div className="paneltitle"><h3>Your cart</h3>{cart.length>0&&<button className="secondary" onClick={()=>saveCart([])}><Trash2 size={15}/> Clear</button>}</div>{cart.map(x=><div className="cartrow" key={x.productId}><div className="cartthumb">{x.images?.[0]?<img src={x.images[0]} alt=""/>:<Store size={20}/>}</div><div className="cartinfo"><b>{x.title}</b><small>{money(x.price)} · {x.sellerName||"Member seller"}</small></div><input type="number" min="1" max={x.stock} value={x.quantity} onChange={e=>changeQty(x.productId,e.target.value)}/><strong>{money(x.price*x.quantity)}</strong><button className="iconbtn" onClick={()=>remove(x)}><Trash2 size={16}/></button></div>)}{!cart.length&&<p className="muted">Your cart is empty. Browse the marketplace and add something you like.</p>}</div>{cart.length>0&&<form className="panel checkoutpanel" onSubmit={checkoutNow}><h3>Checkout</h3>{!sameSeller&&<div className="error">Checkout is currently one seller at a time. Remove items from other sellers.</div>}<div className="checkouttotal"><span>{discount>0?"Total after discount":"Total"}</span><strong>{money(total)}</strong></div>{discount>0&&<div className="coupon-summary"><span>Subtotal</span><span>{money(subtotal)}</span><span>Coupon discount</span><strong>−{money(discount)}</strong></div>}<div className="couponrow"><input placeholder="Coupon code (optional)" aria-label="Coupon code" value={couponCode} onChange={e=>{setCouponCode(e.target.value);if(coupon){setCoupon(null);setNotice("")}}}/><button type="button" className="secondary" disabled={couponBusy||!couponCode.trim()} onClick={applyCoupon}>{couponBusy?"Checking…":coupon?"Apply again":"Apply"}</button></div>{coupon&&coupon.subtotal===subtotal&&<div className="coupon-applied" role="status"><span>{coupon.code} applied</span><strong>−{money(discount)}</strong><button type="button" className="link" onClick={()=>{setCoupon(null);setCouponCode("");setNotice("Coupon removed.")}}>Remove</button></div>}<input required placeholder="Delivery / pickup name" value={checkout.deliveryName} onChange={e=>setCheckout({...checkout,deliveryName:e.target.value})}/><input required inputMode="tel" placeholder="Phone" value={checkout.deliveryPhone} onChange={e=>setCheckout({...checkout,deliveryPhone:e.target.value})}/><textarea required placeholder="Delivery address / location" value={checkout.deliveryAddress} onChange={e=>setCheckout({...checkout,deliveryAddress:e.target.value})}/><textarea placeholder="Delivery notes (optional)" value={checkout.deliveryNotes} onChange={e=>setCheckout({...checkout,deliveryNotes:e.target.value})}/><label className="fieldlabel">Payment method<select value={checkout.paymentMethod} onChange={e=>setCheckout({...checkout,paymentMethod:e.target.value})}><option value="CASH_ON_DELIVERY">Cash / M-Pesa on delivery</option><option value="WALLET">NEXORA Wallet</option></select></label><button className="primary" disabled={busy||!sameSeller}>{busy?"Placing order…":"Place order"}</button><p className="muted small">Seller contact and delivery details are shared only for fulfilling the order. For wallet orders, the amount is deducted immediately.</p></form>}</div>}
 {tab==="sell"&&<form className="panel sellerform" onSubmit={submitProduct}><div className="paneltitle"><div><h3>List a product or service</h3><p className="muted">Add accurate information so buyers know exactly what they are purchasing.</p></div><Store size={24}/></div><div className="formgrid two"><label className="fieldlabel">Product title<input required maxLength="120" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Samsung Galaxy S24"/></label><label className="fieldlabel">Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.filter(x=>x!=="All").map(c=><option key={c}>{c}</option>)}</select></label></div><label className="fieldlabel">Description<textarea required maxLength="5000" rows="6" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe condition, features, size, color, what is included, warranty/returns, etc."/></label><div className="formgrid three"><label className="fieldlabel">Price ({currencyState().currency.code})<input required type="number" min="1" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/><small className="muted">Stored using NEXORA’s KES accounting base and converted for display.</small></label><label className="fieldlabel">Stock / quantity<input required type="number" min="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></label><label className="fieldlabel">Seller phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label></div><label className="fieldlabel">Location / pickup area<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="e.g. Westlands, Nairobi"/></label>
<div className="deliveryhints"><span className="muted small">Delivery tips for Kenya buyers:</span><div className="deliverychiprow">
<button type="button" className="secondary narrow" onClick={()=>setForm(f=>({...f,location:(f.location?f.location+", ":"")+"Nairobi meetup"}))}>Nairobi meetup</button>
<button type="button" className="secondary narrow" onClick={()=>setForm(f=>({...f,location:(f.location?f.location+", ":"")+"County courier"}))}>County courier</button>
<button type="button" className="secondary narrow" onClick={()=>setForm(f=>({...f,location:(f.location?f.location+", ":"")+"G4S / Well-pack"}))}>G4S / Well-pack</button>
<button type="button" className="secondary narrow" onClick={()=>setForm(f=>({...f,description:(f.description?f.description+"\n":"")+"Delivery: buyer pays courier / meetup preferred."}))}>Add delivery note</button>
</div></div><label className="fieldlabel">Product photos <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={readImages}/><small className="muted">Up to 6 images. Use clear photos; each image must be under 1.8 MB.</small></label>{form.images.length>0&&<div className="imagepickgrid">{form.images.map((x,i)=><img key={i} src={x} alt="Product preview"/>)}</div>}<div className="notice"><ShieldCheck size={16}/> Only list products you are authorized to sell. Do not upload counterfeit, illegal or misleading listings. Buyers should verify products and delivery details before payment.</div><button className="primary" disabled={busy}>{busy?"Publishing…":"Publish listing"}</button></form>}
 {tab==="seller"&&<SellerDashboard me={me} mine={mine} orders={orders} goSell={()=>setTab("sell")}/>}{tab==="myshop"&&<div className="marketgrid">{mine.map(p=><article className="marketcard" key={p.id}><div className="marketimage">{p.images?.[0]?<img src={p.images[0]} alt={p.title}/>:<Store size={38}/>}<span>{p.status}</span></div><div className="marketcardbody"><h3>{p.title}</h3><p className="muted marketdesc">{p.description}</p><strong className="marketprice">{money(p.price)}</strong><div className="marketseller"><span>{p.stock} in stock</span><span><MapPin size={14}/> {p.location}</span></div><div className="marketactions"><button className="secondary" onClick={async()=>{const next=p.status==="ACTIVE"?"HIDDEN":"ACTIVE";try{const u=await api(`/marketplace/products/${p.id}`,{method:"PATCH",body:JSON.stringify({status:next})});setMine(mine.map(x=>x.id===u.id?u:x));}catch(e){setError(e.message)}}}><Edit3 size={15}/> {p.status==="ACTIVE"?"Hide":"Publish"}</button></div></div></article>)}{!mine.length&&<div className="panel empty"><PackageIcon size={30}/><h3>No listings yet</h3><p className="muted">Use Sell a product to publish your first listing.</p></div>}</div>}
 {tab==="orders"&&<div className="ordersgrid" data-market-orders><div className="panel"><h3>My purchases</h3>{orders.buying.map(o=><div className="ordercard" key={o.id}><div><b>{o.items.map(i=>i.title).join(", ")}</b><small>{o.reference} · {new Date(o.createdAt).toLocaleString()}</small></div><strong>{money(o.total)}</strong><span className={`orderstatus ${o.status.toLowerCase()}`}>{o.status}</span><small>Seller: {o.seller?.name} · {o.seller?.phone}</small>{o.status==="SHIPPED"&&<button className="secondary" onClick={()=>updateOrder(o.id,"DELIVERED")}><PackageCheck size={15}/> Confirm received</button>}<button className="secondary" onClick={()=>disputeOrder(o.id)}>Report an issue</button></div>)}{!orders.buying.length&&<p className="muted">No purchases yet.</p>}</div><div className="panel"><h3>Orders for my listings</h3>{orders.selling.map(o=><div className="ordercard" key={o.id}><div><b>{o.items.map(i=>i.title).join(", ")}</b><small>{o.reference} · Buyer: {o.buyer?.name} · {o.buyer?.phone}</small></div><strong>{money(o.total)}</strong><span className={`orderstatus ${o.status.toLowerCase()}`}>{o.status}</span><select value={o.status} onChange={e=>updateOrder(o.id,e.target.value)}><option value={o.status}>{o.status}</option>{(o.status==="PENDING"?["CONFIRMED","CANCELLED"]:o.status==="CONFIRMED"?["PROCESSING","CANCELLED"]:o.status==="PROCESSING"?["SHIPPED"]:[]).map(nextStatus=><option key={nextStatus} value={nextStatus}>{nextStatus}</option>)}</select><button className="secondary" onClick={()=>disputeOrder(o.id)}>Report an issue</button></div>)}{!orders.selling.length&&<p className="muted">No customer orders yet.</p>}</div></div>}
 {selected&&<div className="modalbackdrop" onClick={()=>setSelected(null)}><div className="modal productdetailmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">MARKETPLACE</span><h2>{selected.title}</h2></div><button className="iconbtn" onClick={()=>setSelected(null)}><X size={20}/></button></div><div className="productdetailbody"><div className="detailhero">{selected.images?.length?<div className="detailimages">{selected.images.map((x,i)=><img key={i} src={x} alt={`${selected.title} ${i+1}`}/>)}</div>:<div className="detailplaceholder"><Store size={48}/></div>}</div><div><strong className="marketprice">{money(selected.price)}</strong><p>{selected.description}</p><p><MapPin size={15}/> {selected.location}</p><p>Seller: <b>{selected.seller?.name}</b> {selected.seller?.sellerVerified&&<span className="pill">Verified seller</span>} · {selected.seller?.phone}</p><p className="muted">{selected.seller?.sellerBio||"Member seller on NEXORA Marketplace."}</p>{selected.reviews?.length>0&&<div className="reviewlist"><b>Recent reviews</b>{selected.reviews.map(r=><div key={r.id}><span>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span> · {r.author?.name}<p className="muted small">{r.body||"Verified purchase"}</p></div>)}</div>}<p>{selected.stock} available</p><button className="primary" onClick={()=>{addToCart(selected);setSelected(null)}}><ShoppingCart size={16}/> Add to cart</button></div></div></div></div>}</section>
}

function Community({announcements=[],onAcknowledge=()=>{}}){const [filter,setFilter]=useState("ALL");const [selected,setSelected]=useState(null);const tabs=[["ALL","All announcements"],["NEW","New"],["IMPORTANT","Important"],["OPPORTUNITY","Opportunities"]];const filtered=announcements.filter(a=>filter==="ALL"||(filter==="NEW"&&!a.opened)||(filter==="IMPORTANT"&&["CRITICAL","IMPORTANT"].includes(a.priority))||(filter==="OPPORTUNITY"&&(a.priority==="OPPORTUNITY"||a.category==="OPPORTUNITY")));const priorityLabel={CRITICAL:"CRITICAL",IMPORTANT:"IMPORTANT",GENERAL:"GENERAL",OPPORTUNITY:"OPPORTUNITY"};return <section><div className="sectionhead"><div><span className="pill">NEXORA NEWS CENTER</span><h1>Community & announcements</h1><p className="muted">Official updates, important rules and opportunities from the NEXORA team.</p></div></div><div className="newsfilters">{tabs.map(([id,label])=><button key={id} className={filter===id?"active":""} onClick={()=>setFilter(id)}>{label}{id==="NEW"&&announcements.filter(a=>!a.opened).length>0&&<span className="navbadge">{announcements.filter(a=>!a.opened).length}</span>}</button>)}</div>{filtered.length===0?<div className="panel news-empty"><Megaphone size={25}/><h3>{filter==="NEW"?"You're all caught up!":"No announcements here yet"}</h3><p className="muted">New updates from NEXORA will appear here.</p></div>:<div className="communitygrid">{filtered.map(a=><article className={"communitypost news-post priority-"+String(a.priority||"GENERAL").toLowerCase()} key={a.id||a.title}><div className="news-post-top"><div className="featureicon"><Megaphone size={20}/></div><span className={"news-priority "+String(a.priority||"GENERAL").toLowerCase()}>{priorityLabel[a.priority]||"GENERAL"}</span>{!a.opened&&<span className="news-unread">NEW</span>}</div><small>{a.category||"PLATFORM UPDATE"} · {a.createdAt?new Date(a.createdAt).toLocaleDateString():"NEXORA"}</small><h3>{a.title}</h3><p>{a.body}</p><div className="news-post-actions"><button className="secondary" onClick={()=>setSelected(selected===a.id?null:a.id)}>{selected===a.id?"Close details":"Read announcement"}</button>{a.requiresAcknowledgement&&!a.acknowledged&&<button className="primary" onClick={()=>onAcknowledge(a)}>I have read this</button>}{a.requiresAcknowledgement&&a.acknowledged&&<span className="news-acknowledged"><CheckCircle2 size={14}/> Acknowledged</span>}</div>{selected===a.id&&<div className="news-detail"><b>Official NEXORA announcement</b><p>{a.body}</p>{a.requiresAcknowledgement&&!a.acknowledged&&<button className="primary" onClick={()=>onAcknowledge(a)}>I have read this</button>}</div>}</article>)}</div>}<div className="panel"><h3>Community principles</h3><div className="principles"><span><Check size={15}/> Be transparent</span><span><Check size={15}/> Respect other members</span><span><Check size={15}/> Avoid misleading income claims</span><span><Check size={15}/> Protect private information</span></div></div></section>}
function ActivityCentrePage({me,transactions=[],notifications=[],tickets=[],analytics,goPage}){
 const [academyCount,setAcademyCount]=useState(()=>{try{return Object.keys(JSON.parse(localStorage.getItem("nexora-academy-completed")||"{}")).length}catch{return 0}});
 const pending=transactions.filter(x=>String(x.status||"").toUpperCase()==="PENDING");
 const unread=notifications.filter(x=>!x.read);
 const openTickets=tickets.filter(x=>String(x.status||"").toUpperCase()!=="CLOSED");
 const recentTransactions=[...transactions].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0)).slice(0,5);
 const openNotification=async n=>{if(n?.id){try{await api(`/notifications/${n.id}/read`,{method:"POST"});window.dispatchEvent(new CustomEvent("nexora-notification-read",{detail:{id:String(n.id)}}))}catch{}}openNexoraNotification(n,goPage)};
 useEffect(()=>{const refresh=()=>{try{setAcademyCount(Object.keys(JSON.parse(localStorage.getItem("nexora-academy-completed")||"{}")).length)}catch{setAcademyCount(0)}};window.addEventListener("storage",refresh);window.addEventListener("nexora-academy-progress",refresh);return()=>{window.removeEventListener("storage",refresh);window.removeEventListener("nexora-academy-progress",refresh)}},[]);
 return <section className="activity-page">
  <div className="sectionhead"><div><span className="pill">YOUR NEXORA WORKSPACE</span><h1>Activity Centre</h1><p className="muted">One place to see what needs attention, track progress and jump straight to the right feature.</p></div><button type="button" className="secondary" onClick={()=>window.dispatchEvent(new CustomEvent("nexora-refresh-data"))}><RefreshCw size={15}/> Refresh activity</button></div>
  <div className="activity-page-grid">
   <button type="button" className="activity-page-card" onClick={()=>goPage("transactions")}><span><ReceiptText size={18}/></span><small>Pending transactions</small><strong>{pending.length}</strong><em>Review payment status</em></button>
   <button type="button" className="activity-page-card" onClick={()=>goPage("notifications")}><span><Bell size={18}/></span><small>Unread notifications</small><strong>{unread.length}</strong><em>Read account updates</em></button>
   <button type="button" className="activity-page-card" onClick={()=>goPage("support")}><span><LifeBuoy size={18}/></span><small>Open support requests</small><strong>{openTickets.length}</strong><em>Check your requests</em></button>
   <button type="button" className="activity-page-card" onClick={()=>goPage("academy")}><span><GraduationCap size={18}/></span><small>Lessons completed</small><strong>{academyCount}</strong><em>Continue learning</em></button>
  </div>
  <div className="activity-page-columns">
   <div className="panel activity-stream"><div className="paneltitle"><div><span className="pill">RECENT UPDATES</span><h3>Notifications</h3></div><button type="button" className="secondary narrow" onClick={()=>goPage("notifications")}>View all</button></div>
    {notifications.length?notifications.slice(0,6).map((n,i)=><button type="button" className={`activity-stream-row ${n.read?"":"unread"}`} key={n.id||i} onClick={()=>openNotification(n)}><span className="activity-stream-icon"><Bell size={15}/></span><span className="activity-stream-copy"><b>{n.title||"NEXORA update"}</b><small>{n.message||n.body||"Open to view this update."}</small><em>{n.createdAt?new Date(n.createdAt).toLocaleString():"Account notification"}</em></span><ArrowUpRight size={15}/></button>):<div className="smartempty"><p className="muted">You're all caught up. New account updates will appear here.</p></div>}
   </div>
   <div className="panel activity-stream"><div className="paneltitle"><div><span className="pill">ACCOUNT RECORDS</span><h3>Recent transactions</h3></div><button type="button" className="secondary narrow" onClick={()=>goPage("transactions")}>View all</button></div>
    {recentTransactions.length?recentTransactions.map((x,i)=><button type="button" className="activity-stream-row" key={x.id||x.reference||i} onClick={()=>goPage("transactions")}><span className="activity-stream-icon"><ReceiptText size={15}/></span><span className="activity-stream-copy"><b>{String(x.type||"Transaction").replaceAll("_"," ")}</b><small>{x.reference||"Reference unavailable"} · {String(x.status||"UNKNOWN").replaceAll("_"," ")}</small><em>{x.createdAt?new Date(x.createdAt).toLocaleString():"Date unavailable"}</em></span><strong>{money(x.amount)}</strong></button>):<div className="smartempty"><p className="muted">No transaction records yet.</p><button type="button" className="primary narrow" onClick={()=>goPage("wallet")}>Open wallet</button></div>}
   </div>
  </div>
  <div className="panel activity-stream"><div className="paneltitle"><div><span className="pill">NEXT STEPS</span><h3>Items that may need your attention</h3></div></div>
   {pending.length>0&&<button type="button" className="activity-stream-row attention" onClick={()=>goPage("transactions")}><span className="activity-stream-icon"><Clock3 size={15}/></span><span className="activity-stream-copy"><b>{pending.length} pending payment{pending.length===1?"":"s"}</b><small>Check the existing reference before retrying a payment. Pending does not mean paid.</small></span><ArrowUpRight size={15}/></button>}
   {openTickets.length>0&&<button type="button" className="activity-stream-row attention" onClick={()=>goPage("support")}><span className="activity-stream-icon"><LifeBuoy size={15}/></span><span className="activity-stream-copy"><b>{openTickets.length} support request{openTickets.length===1?"":"s"} still open</b><small>Review the latest status or reply from the support team.</small></span><ArrowUpRight size={15}/></button>}
   {!pending.length&&!openTickets.length&&<p className="muted">No urgent items are currently recorded. You can explore the marketplace, continue learning or review your account analytics.</p>}
   <div className="activity-page-actions"><button type="button" className="secondary" onClick={()=>goPage("marketplace")}><Store size={15}/> Marketplace</button><button type="button" className="secondary" onClick={()=>goPage("referrals")}><TrendingUp size={15}/> Earn &amp; referrals</button><button type="button" className="secondary" onClick={()=>goPage("academy")}><GraduationCap size={15}/> Academy</button><button type="button" className="secondary" onClick={()=>goPage("security")}><Shield size={15}/> Profile &amp; security</button></div>
  </div>
 </section>
}

function NotificationsCenter({me,analytics,tickets}){const notes=[];if(me.package)notes.push({I:CheckCircle2,t:"Membership active",d:`Your ${me.package.name} plan is active.`});else notes.push({I:PackageIcon,t:"Explore membership",d:"Review the membership plans and benefits when you're ready."});if((analytics?.month?.directReferrals||0)<5)notes.push({I:Target,t:"Monthly activity goal",d:`${5-(analytics?.month?.directReferrals||0)} direct referral(s) remaining for the current activity goal.`});if(tickets?.some(x=>x.status!=="CLOSED"))notes.push({I:LifeBuoy,t:"Support ticket open",d:"You have an active support request. Check Help & Support for replies."});if((me.transactions||[]).some(x=>x.status==="PENDING"))notes.push({I:Clock3,t:"Payment awaiting confirmation",d:"A plan payment is still pending. Open Transactions to check it."});return <section><div className="sectionhead"><div><span className="pill">NOTIFICATION CENTER</span><h1>Stay up to date</h1><p className="muted">Useful account reminders and platform activity in one place.</p></div></div><PushNotificationToggle audience="member"/><div className="notificationcenter">{notes.map((n,i)=><div className="notification large" key={i}><n.I size={20}/><div><b>{n.t}</b><p>{n.d}</p><small>Account update</small></div></div>)}</div><div className="panel"><h3>Notification guidance</h3><p className="muted">NEXORA notifications describe recorded account activity and useful reminders. They do not represent guaranteed earnings or future financial outcomes. Phone alerts require your permission and can be switched off per device.</p></div></section>}

function NexoraPageTransition({label="Opening workspace…"}){
 return <div className="nx-page-transition" aria-hidden="true">
  <div className="nx-transition-stars"><i/><i/><i/><i/><i/><i/><i/><i/></div>
  <div className="nx-transition-orbit orbit-a"/><div className="nx-transition-orbit orbit-b"/>
  <div className="nx-transition-core"><span className="core-ring ring-a"/><span className="core-ring ring-b"/><img src="/nexora-logo.png" alt=""/><b>NEXORA</b></div>
  <div className="nx-transition-beam"/>
  <div className="nx-transition-label"><span>FORMING</span>{label}</div>
 </div>
}

function App(){
 useEffect(()=>{try{document.documentElement.classList.toggle("nexora-light",localStorage.getItem("nexora-theme")==="light");document.documentElement.classList.toggle("nx-reduce-motion",localStorage.getItem("nexora-reduce-motion")==="true")}catch{}},[]);
 // Check the published APK manifest on native installs. Installation is offered only after signing is configured.
 useEffect(()=>{
  if(!Capacitor.isNativePlatform())return;
  let cancelled=false;
  const checkForAppUpdate=async()=>{
   try{
    const [info,response]=await Promise.all([
     CapacitorApp.getInfo(),
     fetch(`/app-version.json?check=${Date.now()}`,{cache:"no-store",headers:{"Cache-Control":"no-cache"}})
    ]);
    if(!response.ok)return;
    const latest=await response.json();
    if(cancelled||!latest||latest.updateReady!==true||!Number.isFinite(Number(latest.versionCode)))return;
    const installedBuild=Number(info.build||0);
    const latestBuild=Number(latest.versionCode);
    if(latestBuild<=installedBuild)return;
    const dismissedKey=`nexora-update-dismissed-${latestBuild}`;
    if(sessionStorage.getItem(dismissedKey)==="1")return;
    const accepted=window.confirm(`A new NEXORA update (version ${latest.versionName||latestBuild}) is available.\\n\\nDownload it now? Android may ask you to approve installation.`);
    if(!accepted){sessionStorage.setItem(dismissedKey,"1");return;}
    const apkUrl=new URL(latest.apkUrl||"/downloads/nexora-android.apk",window.location.origin).href;
    const link=document.createElement("a");
    link.href=apkUrl;link.download="NEXORA-update.apk";link.rel="noopener";link.style.display="none";
    document.body.appendChild(link);link.click();link.remove();
    window.setTimeout(()=>window.alert("If the APK downloaded, open it and tap Install to complete the update. Android may ask you to allow installs from your download app."),900);
   }catch(err){console.warn("NEXORA update check unavailable",err);}
  };
  checkForAppUpdate();
  const timer=window.setInterval(checkForAppUpdate,6*60*60*1000);
  const onVisible=()=>{if(document.visibilityState==="visible")checkForAppUpdate();};
  document.addEventListener("visibilitychange",onVisible);
  return()=>{cancelled=true;window.clearInterval(timer);document.removeEventListener("visibilitychange",onVisible);};
 },[]);
 const path=window.location.pathname || "/";
 const requestedMemberPage=new URLSearchParams(window.location.search).get("page");
 const allowedMemberPages=["dashboard","intelligence","trust","businessbuilder","marketplace","connect","wallet","transfer","services","transactions","referrals","products","marketing","academy","analytics","community","notifications","activity","leaderboard","challenges","support","security"];
 const memberInitialPage=allowedMemberPages.includes(requestedMemberPage)?requestedMemberPage:"dashboard";
 const [biometricGateReady,setBiometricGateReady]=useState(()=>!Capacitor.isNativePlatform()),[biometricGateBusy,setBiometricGateBusy]=useState(false),[biometricGateError,setBiometricGateError]=useState("");
 const biometricResumeLock=useRef(false),biometricResumeUnlocking=useRef(false);
 const [me,setMe]=useState(null),[receipt,setReceipt]=useState(null),[payMethods,setPayMethods]=useState({wallet:true,stkPush:false}),[page,setPage]=useState(memberInitialPage),[packages,setPackages]=useState(()=>readCachedMemberData("packages",[])),[referrals,setReferrals]=useState(()=>readCachedMemberData("referrals",{direct:[],level2:[]})),[earnings,setEarnings]=useState(()=>readCachedMemberData("earnings",[])),[transactions,setTransactions]=useState(()=>readCachedMemberData("transactions",[])),[analytics,setAnalytics]=useState(()=>readCachedMemberData("analytics",null)),[leaderboard,setLeaderboard]=useState(()=>readCachedMemberData("leaderboard",[])),[announcements,setAnnouncements]=useState(()=>readCachedMemberData("announcements",[])),[tickets,setTickets]=useState(()=>readCachedMemberData("tickets",[])),[notifications,setNotifications]=useState(()=>readCachedMemberData("notifications",[])),[loginUpdates,setLoginUpdates]=useState([]),[msg,setMsg]=useState(""),[error,setError]=useState(""),[mobile,setMobile]=useState(false),[loading,setLoading]=useState(true),[instructions,setInstructions]=useState(false),[phoneModal,setPhoneModal]=useState(null),[payment,setPayment]=useState(null),[copiedKind,setCopiedKind]=useState(""),[pageTransition,setPageTransition]=useState(false),[currencyRates,setCurrencyRates]=useState(FALLBACK_KES_RATES),[networkOnline,setNetworkOnline]=useState(()=>typeof navigator==="undefined"||navigator.onLine!==false),[offlineNotice,setOfflineNotice]=useState(false),[seenAnnouncementIds,setSeenAnnouncementIds]=useState([]),[showAnnouncementsModal,setShowAnnouncementsModal]=useState(false);
 const unreadAnnouncementCount=(Array.isArray(announcements)?announcements:[]).filter(a=>a?.id&&!a.opened&&!a.acknowledged).length;
 const [headerCompact,setHeaderCompact]=useState(false);
 const [showBackToTop,setShowBackToTop]=useState(false);
 useEffect(()=>{
  let previousY=window.scrollY||document.documentElement.scrollTop||0,frame=0,idleTimer=0;
  const markScrolling=()=>{
   document.body.classList.add("nx-floating-controls-scrolling");
   window.clearTimeout(idleTimer);
   idleTimer=window.setTimeout(()=>document.body.classList.remove("nx-floating-controls-scrolling"),700);
  };
  const readY=(event)=>{
   const target=event?.target;
   if(target&&target!==window&&target!==document&&target!==document.documentElement&&target!==document.body&&target!==document.querySelector(".app main"))return previousY;
   const main=document.querySelector(".app main");
   return Math.max(0,window.scrollY||document.documentElement.scrollTop||document.body.scrollTop||main?.scrollTop||0);
  };
  const onScroll=(event)=>{
   markScrolling();
   if(frame)return;
   frame=window.requestAnimationFrame(()=>{
    const y=readY(event),delta=y-previousY;
    setShowBackToTop(y>560);
    if(y<90)setHeaderCompact(false);
    else if(Math.abs(delta)>4)setHeaderCompact(delta>0);
    previousY=y;frame=0;
   });
  };
  window.addEventListener("scroll",onScroll,{passive:true});
  document.addEventListener("scroll",onScroll,{passive:true,capture:true});
  onScroll();
  return()=>{window.removeEventListener("scroll",onScroll);document.removeEventListener("scroll",onScroll,true);if(frame)window.cancelAnimationFrame(frame);window.clearTimeout(idleTimer);document.body.classList.remove("nx-floating-controls-scrolling")};
 },[]);
  const load=async(show=true)=>{
  if(show)setLoading(true);setError("");
  try{
   const m=await api("/me");
   setNetworkOnline(true);
   setMe(m);
   try{localStorage.setItem("nexora-cached-me",JSON.stringify(m))}catch{}
   setLoading(false);
   const results=await Promise.allSettled([api("/payments/methods"),api("/packages"),api("/referrals"),api("/earnings"),api("/transactions"),api("/member/analytics"),api("/member/leaderboard"),api("/announcements"),api("/support/tickets"),api("/notifications")]);
   if(results[0].status==="fulfilled")setPayMethods(results[0].value);
   if(results[1].status==="fulfilled"){setPackages(results[1].value);saveCachedMemberData("packages",results[1].value,m?.user?.id)}
   if(results[2].status==="fulfilled"){setReferrals(results[2].value);saveCachedMemberData("referrals",results[2].value,m?.user?.id)}
   if(results[3].status==="fulfilled"){setEarnings(results[3].value);saveCachedMemberData("earnings",results[3].value,m?.user?.id)}
   if(results[4].status==="fulfilled"){setTransactions(results[4].value);saveCachedMemberData("transactions",results[4].value,m?.user?.id)}
   if(results[5].status==="fulfilled"){setAnalytics(results[5].value);saveCachedMemberData("analytics",results[5].value,m?.user?.id)}
   if(results[6].status==="fulfilled"){setLeaderboard(results[6].value);saveCachedMemberData("leaderboard",results[6].value,m?.user?.id)}
   if(results[7].status==="fulfilled"){setAnnouncements(results[7].value);saveCachedMemberData("announcements",results[7].value,m?.user?.id)}
   if(results[8].status==="fulfilled"){setTickets(results[8].value);saveCachedMemberData("tickets",results[8].value,m?.user?.id)}
   if(results[9].status==="fulfilled"){
    const rows=results[9].value||[];setNotifications(rows);saveCachedMemberData("notifications",rows,m?.user?.id);
    // Notifications stay in the notification centre; do not interrupt every login with a popup.
    setLoginUpdates([]);
   }
   const failed=results.find(x=>x.status==="rejected");
   if(failed){
    const message=String(failed.reason?.message||"Some account data could not be loaded");
    if(typeof navigator!=="undefined"&&(navigator.onLine===false||/failed to fetch|networkerror|network request failed|load failed|fetch failed/i.test(message))){setNetworkOnline(false);setError("")}
    else setError(message);
   }
  }catch(e){
   if(/session|authentication|expired/i.test(e.message)){localStorage.removeItem("token");localStorage.removeItem("nexora-cached-me");localStorage.removeItem("nexora-biometric-enabled");try{await NativeBiometric.deleteCredentials({server:BIOMETRIC_SERVER})}catch{}clearCachedMemberData();setMe(null)}
   else if(typeof navigator!=="undefined"&&(navigator.onLine===false||/failed to fetch|networkerror|network request failed|load failed|fetch failed/i.test(String(e?.message||e)))){setNetworkOnline(false);setError("")}
   else setError(e.message);
   setLoading(false);
  }
 };
 useEffect(()=>{if(!showAnnouncementsModal||!announcements.length)return;let alive=true;const unseen=announcements.filter(a=>a?.id&&!a.opened);if(!unseen.length)return;Promise.all(unseen.map(a=>api("/announcements/"+encodeURIComponent(a.id)+"/open",{method:"POST"}).catch(()=>null))).then(()=>{if(alive)setAnnouncements(rows=>{const next=rows.map(a=>({...a,opened:true}));if(me?.user?.id)saveCachedMemberData("announcements",next,me.user.id);return next})});return()=>{alive=false}},[showAnnouncementsModal,announcements]);
 useEffect(()=>{if(!me?.user?.id)return;let alive=true;const refresh=async()=>{try{const rows=await api("/announcements");if(alive){setAnnouncements(rows);saveCachedMemberData("announcements",rows,me.user.id)}}catch{}};const timer=window.setInterval(refresh,20000);return()=>{alive=false;window.clearInterval(timer)}},[me?.user?.id]);
 useEffect(()=>{if(page!=="community"||!announcements.length)return;const unseen=announcements.filter(a=>a?.id&&!a.opened);if(!unseen.length)return;let alive=true;Promise.all(unseen.map(a=>api("/announcements/"+encodeURIComponent(a.id)+"/open",{method:"POST"}).catch(()=>null))).then(()=>{if(alive)setAnnouncements(rows=>{const next=rows.map(a=>({...a,opened:true}));if(me?.user?.id)saveCachedMemberData("announcements",next,me.user.id);return next})});return()=>{alive=false}},[page,announcements]);
 useEffect(()=>{
  let active=true;
  const unlockOnLaunch=async()=>{
   if(!Capacitor.isNativePlatform()||localStorage.getItem("nexora-biometric-enabled")!=="true"){
    if(active)setBiometricGateReady(true);
    return;
   }
   setBiometricGateBusy(true);setBiometricGateError("");
   try{
    const availability=await NativeBiometric.isAvailable();
    if(!availability?.isAvailable)throw new Error("Biometrics are not available. Use password login to continue.");
    await NativeBiometric.verifyIdentity({reason:"Unlock your NEXORA workspace",title:"Unlock NEXORA",subtitle:"Verify it's you",description:"Use your enrolled fingerprint or face to continue."});
    const credentials=await NativeBiometric.getCredentials({server:BIOMETRIC_SERVER});
    if(!credentials?.password)throw new Error("No saved NEXORA session was found. Use password login to sign in again.");
    localStorage.setItem("token",credentials.password);
    if(active){setBiometricGateError("");setBiometricGateReady(true);}
   }catch(error){
    if(active)setBiometricGateError("NEXORA is locked. Authenticate with your fingerprint or face, or choose password login.");
   }finally{if(active)setBiometricGateBusy(false);}
  };
  unlockOnLaunch();
  return()=>{active=false};
 },[]);
 // Lock the native app as soon as it leaves the foreground. On return, require
 // a fresh biometric check before restoring the saved session token.
 useEffect(()=>{
  if(!Capacitor.isNativePlatform())return;
  let subscription,disposed=false;
  const handleAppState=async({isActive})=>{
   if(!isActive){
    if(localStorage.getItem("nexora-biometric-enabled")==="true"){
     biometricResumeLock.current=true;
     // Keep the existing session token intact while the biometric gate is shown.
     // A rejected fingerprint/face check must not turn into a logout.
     setBiometricGateError("");
     setBiometricGateReady(false);
    }
    return;
   }
   if(!biometricResumeLock.current||biometricResumeUnlocking.current)return;
   if(localStorage.getItem("nexora-biometric-enabled")!=="true"){
    biometricResumeLock.current=false;
    setBiometricGateReady(true);
    return;
   }
   biometricResumeUnlocking.current=true;
   setBiometricGateBusy(true);
   setBiometricGateError("");
   try{
    const availability=await NativeBiometric.isAvailable();
    if(!availability?.isAvailable)throw new Error("Biometrics are unavailable.");
    await NativeBiometric.verifyIdentity({reason:"Unlock NEXORA after returning to the app",title:"Unlock NEXORA",subtitle:"Verify it's you",description:"Authenticate to continue your session."});
    const credentials=await NativeBiometric.getCredentials({server:BIOMETRIC_SERVER});
    if(!credentials?.password)throw new Error("No saved NEXORA session was found.");
    localStorage.setItem("token",credentials.password);
    biometricResumeLock.current=false;
    if(!disposed){setBiometricGateError("");setBiometricGateReady(true);}
   }catch(error){
    if(!disposed){
     setBiometricGateError("NEXORA remains locked. Authenticate with your fingerprint or face to continue.");
     setBiometricGateReady(false);
    }
   }finally{
    biometricResumeUnlocking.current=false;
    if(!disposed)setBiometricGateBusy(false);
   }
  };
  CapacitorApp.addListener("appStateChange",handleAppState).then(handle=>{subscription=handle;if(disposed)handle.remove()}).catch(error=>console.warn("NEXORA biometric app-state listener",error));
  return()=>{disposed=true;subscription?.remove()};
 },[]);
 useEffect(()=>{
  if(!biometricGateReady)return;
  if(!localStorage.getItem("token")){setLoading(false);return;}
  try{
   const cached=JSON.parse(localStorage.getItem("nexora-cached-me")||"null");
   if(cached?.user){setMe(cached);setLoading(false);}
  }catch{}
  load(false);
 },[biometricGateReady]);
 useEffect(()=>{
  const markOffline=()=>{
   setNetworkOnline(false);
   setError(current=>/failed to fetch|networkerror|network request failed|load failed|fetch failed|cannot connect|could not connect/i.test(String(current||""))?"":current);
  };
  const markOnline=()=>{
   setNetworkOnline(true);
   load(false);
   if("serviceWorker" in navigator)navigator.serviceWorker.getRegistration().then(reg=>reg?.update()).catch(()=>{});
  };
  window.addEventListener("offline",markOffline);
  window.addEventListener("online",markOnline);
  if(typeof navigator!=="undefined")setNetworkOnline(navigator.onLine!==false);
  return()=>{window.removeEventListener("offline",markOffline);window.removeEventListener("online",markOnline)};
 },[]);
 useEffect(()=>{
  if(networkOnline){setOfflineNotice(false);return;}
  setOfflineNotice(true);
  const dismiss=window.setTimeout(()=>setOfflineNotice(false),4500);
  return()=>window.clearTimeout(dismiss);
 },[networkOnline]);
 useEffect(()=>{
  if(networkOnline||typeof navigator==="undefined"||!navigator.onLine)return;
  // A brief backend outage while the device still reports network access gets retried.
  const timer=window.setInterval(()=>{if(navigator.onLine)load(false)},20000);
  return()=>window.clearInterval(timer);
 },[networkOnline]);
 useEffect(()=>{
  const code=me?.user?.countryCode||"KE";
  const currency=CURRENCY_BY_COUNTRY[code]||CURRENCY_BY_COUNTRY.KE;
  const rate=Number(currencyRates[currency.code]||1);
  window.__NEXORA_CURRENCY__={countryCode:code,currency,rate,rates:currencyRates};
  try{localStorage.setItem("nexora-currency",JSON.stringify({countryCode:code,currencyCode:currency.code,rate,rates:currencyRates,updatedAt:Date.now()}))}catch{}
 },[me?.user?.countryCode,currencyRates]);
 useEffect(()=>{
  let alive=true;
  api("/currency/rates?base=KES").then(d=>{if(alive&&d?.rates)setCurrencyRates({...FALLBACK_KES_RATES,...d.rates})}).catch(()=>{});
  return()=>{alive=false};
 },[]);
 useEffect(()=>{
  const markOne=e=>{
   const id=String(e?.detail?.id||"");
   if(!id)return;
   setNotifications(rows=>{
    const next=rows.map(n=>String(n.id)===id?{...n,read:true}:n);
    if(me?.user?.id)saveCachedMemberData("notifications",next,me.user.id);
    return next;
   });
  };
  const markAll=()=>{
   setNotifications(rows=>{
    const next=rows.map(n=>({...n,read:true}));
    if(me?.user?.id)saveCachedMemberData("notifications",next,me.user.id);
    return next;
   });
  };
  window.addEventListener("nexora-notification-read",markOne);
  window.addEventListener("nexora-notifications-read-all",markAll);
  return()=>{window.removeEventListener("nexora-notification-read",markOne);window.removeEventListener("nexora-notifications-read-all",markAll)};
 },[me?.user?.id]);
 useEffect(()=>{
  const userId=String(me?.user?.id||"");
  if(!userId){setSeenAnnouncementIds([]);return;}
  try{
   const stored=JSON.parse(localStorage.getItem(`nexora-seen-announcements-${userId}`)||"[]");
   setSeenAnnouncementIds(Array.isArray(stored)?stored.map(String):[]);
  }catch{setSeenAnnouncementIds([])}
 },[me?.user?.id]);
 useEffect(()=>{
  if(!me?.user?.id||!localStorage.getItem("token"))return;
  let active=true;
  const refreshAnnouncements=()=>api("/announcements").then(rows=>{if(active&&Array.isArray(rows)){setAnnouncements(rows);saveCachedMemberData("announcements",rows,me.user.id)}}).catch(()=>{});
  const timer=window.setInterval(refreshAnnouncements,60000);
  window.addEventListener("focus",refreshAnnouncements);
  return()=>{active=false;window.clearInterval(timer);window.removeEventListener("focus",refreshAnnouncements)};
 },[me?.user?.id]);
 useEffect(()=>{
  if(page!=="community"||!me?.user?.id)return;
  const ids=announcements.filter(a=>a?.active!==false&&a?.id).map(a=>String(a.id));
  if(!ids.length)return;
  setSeenAnnouncementIds(current=>{
   const next=[...new Set([...current,...ids])].slice(-500);
   try{localStorage.setItem(`nexora-seen-announcements-${me.user.id}`,JSON.stringify(next))}catch{}
   return next;
  });
 },[page,me?.user?.id,announcements]);
 useEffect(()=>{
  if(!me)return;
  const token=localStorage.getItem("token");
  if(!token)return;
  const stream=new EventSource(`${API}/realtime?token=${encodeURIComponent(token)}`);
  const onRefresh=()=>{
    // Keep the current screen live without a manual browser refresh.
    load(false);
    window.dispatchEvent(new CustomEvent("nexora-realtime"));
  };
  stream.addEventListener("refresh",onRefresh);
  return()=>{stream.removeEventListener("refresh",onRefresh);stream.close()};
 },[!!me]);
 useEffect(()=>{
  if(!me||!networkOnline)return;
  const refreshVisible=()=>{if(document.visibilityState==="visible"&&typeof navigator!=="undefined"&&navigator.onLine)load(false)};
  const timer=window.setInterval(refreshVisible,60000);
  document.addEventListener("visibilitychange",refreshVisible);
  window.addEventListener("nexora-refresh-data",refreshVisible);
  return()=>{window.clearInterval(timer);document.removeEventListener("visibilitychange",refreshVisible);window.removeEventListener("nexora-refresh-data",refreshVisible)};
 },[!!me,networkOnline]);
 useEffect(()=>{if(!me)return;setPageTransition(true);const timer=setTimeout(()=>setPageTransition(false),620);return()=>clearTimeout(timer)},[page]);
 const memberPageRef=useRef(page),memberHistoryInitializedRef=useRef(false),memberHistoryNavigationRef=useRef(false);
 useEffect(()=>{memberPageRef.current=page},[page]);
 useEffect(()=>{
  const url=new URL(window.location.href);
  url.searchParams.set("page",page);
  if(!memberHistoryInitializedRef.current){
   window.history.replaceState({...window.history.state,nexoraPage:page},"",url);
   memberHistoryInitializedRef.current=true;
   return;
  }
  if(memberHistoryNavigationRef.current){memberHistoryNavigationRef.current=false;return;}
  window.history.pushState({...window.history.state,nexoraPage:page},"",url);
 },[page]);
 useEffect(()=>{
  const handlePopState=()=>{
   const requested=new URLSearchParams(window.location.search).get("page");
   const next=allowedMemberPages.includes(requested)?requested:"dashboard";
   if(next!==memberPageRef.current){
    memberHistoryNavigationRef.current=true;
    memberPageRef.current=next;
    setPage(next);
   }
   setMobile(false);
   setInstructions(false);
   setPayment(null);
   setReceipt(null);
   setPhoneModal(null);
  };
  window.addEventListener("popstate",handlePopState);
  return()=>window.removeEventListener("popstate",handlePopState);
 },[]);
 useEffect(()=>{
  if(!Capacitor.isNativePlatform())return;
  let subscription;
  CapacitorApp.addListener("backButton",({canGoBack})=>{
   if(payment){setPayment(null);return;}
   if(receipt){setReceipt(null);return;}
   if(phoneModal){setPhoneModal(null);return;}
   if(instructions){setInstructions(false);return;}
   if(mobile){setMobile(false);return;}
   if(page!=="dashboard"){window.history.back();return;}
   if(canGoBack)window.history.back();
   else CapacitorApp.exitApp();
  }).then(handle=>{subscription=handle}).catch(error=>{console.warn("NEXORA Android back handler",error)});
  return()=>{subscription?.remove()};
 },[page,payment,receipt,phoneModal,instructions,mobile]);
 useEffect(()=>{const fn=e=>{const page=e.detail?.page;if(page)setPage(page)};window.addEventListener("nexora-go-page",fn);return()=>window.removeEventListener("nexora-go-page",fn)},[]);
 const retryBiometricUnlock=async()=>{
  setBiometricGateBusy(true);setBiometricGateError("");
  try{
   const availability=await NativeBiometric.isAvailable();
   if(!availability?.isAvailable)throw new Error("Biometrics are unavailable on this device.");
   await NativeBiometric.verifyIdentity({reason:"Unlock your NEXORA workspace",title:"Unlock NEXORA",subtitle:"Verify it's you",description:"Use your enrolled fingerprint or face to continue."});
   const credentials=await NativeBiometric.getCredentials({server:BIOMETRIC_SERVER});
   if(!credentials?.password)throw new Error("No saved session. Please use password login.");
   localStorage.setItem("token",credentials.password);
   biometricResumeLock.current=false;
   setBiometricGateReady(true);
  }catch(error){setBiometricGateError("Could not unlock NEXORA. Try again or use password login.");}
  finally{setBiometricGateBusy(false);}
 };
 const usePasswordLogin=async()=>{
  try{await NativeBiometric.deleteCredentials({server:BIOMETRIC_SERVER})}catch{}
  localStorage.removeItem("nexora-biometric-enabled");
  biometricResumeLock.current=false;
  localStorage.removeItem("token");
  localStorage.removeItem("nexora-cached-me");
  setBiometricGateError("");setBiometricGateReady(true);setLoading(false);setMe(null);
 };
 if(Capacitor.isNativePlatform()&&!biometricGateReady)return <div className="nx-biometric-lock" style={{minHeight:"100dvh",display:"grid",placeItems:"center",padding:24,background:"#07110e",color:"#f4fff8",textAlign:"center"}}><div style={{width:"min(100%,380px)",padding:28,border:"1px solid rgba(67,220,144,.28)",borderRadius:24,background:"rgba(11,31,24,.94)",boxShadow:"0 24px 80px rgba(0,0,0,.35)"}}><img src="/nexora-logo.png" alt="NEXORA" style={{width:86,height:86,objectFit:"contain",marginBottom:14}}/><h1 style={{margin:"0 0 8px",fontSize:26}}>Unlock NEXORA</h1><p style={{color:"#b9cec3",lineHeight:1.6}}>Use your phone's fingerprint or face authentication to open your workspace.</p>{biometricGateError&&<p role="alert" style={{color:"#ffb4a9",fontSize:14}}>{biometricGateError}</p>}<button type="button" className="primary" style={{width:"100%",justifyContent:"center",marginTop:12}} onClick={retryBiometricUnlock} disabled={biometricGateBusy}><ShieldCheck size={18}/>{biometricGateBusy?"Verifying…":"Unlock with biometrics"}</button><button type="button" className="secondary" style={{width:"100%",justifyContent:"center",marginTop:10}} onClick={usePasswordLogin}>Use password login instead</button></div></div>;
 // IMPORTANT: all App hooks above must run on every render. Route-specific returns
 // are intentionally kept after the hooks to prevent React error #310 (hook order).
 if(path === "/admin" || path.startsWith("/admin/")) return <AdminApp/>;
 if(path === "/terms" || path === "/privacy" || path === "/membership") return <LegalPage type={path.slice(1)}/>;
 if(path === "/packages" || path === "/packages/") return <PublicPackagesPage/>;
 if(loading&&!me)return <NexoraSplash label="Opening your workspace…"/>;if(!me)return <PublicLanding onLogin={()=>load()}/>;
 const nav=[
  ["dashboard","Home",BarChart3],["intelligence","NEXORA Intelligence",Sparkles],["trust","Trust Centre",ShieldCheck],["businessbuilder","Business Builder",Wrench],["marketplace","🛒 Shop & Marketplace",Store],["connect","NEXORA Connect",Wifi],["wallet","Wallet & Payments",WalletCards],["transfer","Send Money",SendHorizontal],["services","NEXORA Services",Wrench],["balloon","Balloon Ventures · SME Funding",WalletCards],["transactions","Orders & Transactions",History],["activity","Activity Centre",Activity],["referrals","Membership & Referrals",UsersRound],["products","Advertise",Megaphone],["marketing","Marketing Center",Megaphone],["academy","Academy",GraduationCap],["analytics","Analytics",BarChart2],["community","Community",Users2],["notifications","Notifications",Bell],["leaderboard","Leaderboard",Trophy],["challenges","Challenges",Target],["support","Help & Support",LifeBuoy],["security","Profile & Security",Shield],["settings","Settings & Preferences",Settings2]
 ];
 const primaryNavIds=new Set(["dashboard","marketplace","connect","wallet","transactions"]);
 const startPayment=async(phone,pkg)=>{
  if(!pkg?.id){setError("Select a plan first.");return;}
  if(me?.user?.countryCode!=="KE"){setError(`Payment methods are coming soon for ${me?.user?.countryName||"your country"}.`);return;}
  setPhoneModal(null);setMsg("");setError("");
  try{
   const usePaystack=Boolean(payMethods?.stkPush);
   const endpoint=usePaystack?"/payments/initialize":"/payments/paybill/initiate";
   const body=usePaystack?{packageId:pkg.id,phone}:{packageId:pkg.id};
   const d=await api(endpoint,{method:"POST",body:JSON.stringify(body)});
   if(!d?.reference){setError(d?.message||"Could not start payment.");return;}
   if(usePaystack){
    setPayment({method:"paystack_mpesa",paymentType:"PACKAGE_PURCHASE",reference:d.reference,package:pkg,phone,status:d.status||"pending",chargeAmount:Number(d.chargeAmount!=null?d.chargeAmount:pkg.price)||0,display_text:d.display_text||"",message:d.message||""});
   }else{
    setPayment({method:"paybill",paymentType:"PACKAGE_PURCHASE",reference:d.reference,package:pkg,status:d.status||"pending",chargeAmount:Number(d.chargeAmount!=null?d.chargeAmount:pkg.price)||0,paybillNumber:d.paybillNumber||payMethods?.paybillNumber||"400200",paybillAccount:d.paybillAccount||payMethods?.paybillAccount||"",paybillName:d.paybillName||payMethods?.paybillName||"NEXORA",instructions:Array.isArray(d.instructions)?d.instructions:[],message:d.message||""});
   }
  }catch(e){setError(e?.message||"Could not start payment.");}
 };
 const purchase=p=>{
  setMsg("");setError("");
  if(!p?.id){setError("That plan is unavailable.");return;}
  const currentPrice=Number(me?.package?.price||0);
  const price=Number(p.price||0);
  const chargeAmount=Math.max(0, price - currentPrice);
  setPhoneModal({package:p,chargeAmount,phone:me?.user?.phone||"",countryCode:me?.user?.countryCode||"KE",countryName:me?.user?.countryName||"Kenya"});
 };
 const walletPurchase=async(p)=>{
  setMsg("");setError("");
  if(me?.user?.countryCode!=="KE"){setError(`Wallet payments are coming soon for ${me?.user?.countryName||"your country"}.`);return;}
  const d=await api("/payments/wallet-purchase",{method:"POST",body:JSON.stringify({packageId:p.id})});
  setPhoneModal(null);
  await load(false);
  setReceipt({reference:d.reference,package:p,amount:Number(d.chargeAmount||0),method:"Wallet Balance",status:"PAID",previousBalance:Number(me?.wallet?.balance||0),remainingBalance:Number(d.wallet?.balance||0),createdAt:new Date().toISOString()});
  setMsg(d.message||"Plan activated using your wallet balance.");
 };
 const hasPackage=Boolean(me?.package);
 const flashCopied=(kind,msg)=>{
  setError("");
  setCopiedKind(kind);
  setMsg(msg);
  nxHaptic(15);
  clearTimeout(window.__nexoraCopyTimer);
  window.__nexoraCopyTimer=setTimeout(()=>{setCopiedKind("");setMsg("")},2600);
 };
 const copy=async()=>{
  if(!hasPackage){setError("Purchase a plan first to unlock your referral link.");return;}
  const link=`${location.origin}/?ref=${encodeURIComponent(me.user.referralCode)}`;
  const ok=await copyTextRobust(link);
  if(ok)flashCopied("link","Referral link copied successfully.");
  else{setError("Could not copy automatically. Please copy the referral link manually.");try{window.prompt("Copy your referral link:",link)}catch{}}
 };
 const copyCode=async()=>{
  if(!hasPackage){setError("Purchase a plan first to unlock your referral code.");return;}
  const code=String(me.user.referralCode||"");
  const ok=await copyTextRobust(code);
  if(ok)flashCopied("code","Referral code copied successfully.");
  else{setError("Could not copy automatically. Please copy the referral code manually.");try{window.prompt("Copy your referral code:",code)}catch{}}
 };
 const share=async()=>{
  if(!hasPackage){setError("Purchase a plan first to unlock your referral link.");return;}
  const link=`${location.origin}/?ref=${encodeURIComponent(me.user.referralCode)}`;
  const shareData={title:"Join NEXORA",text:"Join me on NEXORA. Review the plans and learn how it works:",url:link};
  if(navigator.share){
   try{await navigator.share(shareData);setMsg("Share sheet opened.");return;}catch(e){if(e?.name==="AbortError")return;}
  }
  const whatsapp=`https://wa.me/?text=${encodeURIComponent(`${shareData.text} ${link}`)}`;
  const opened=window.open(whatsapp,"_blank","noopener,noreferrer");
  if(opened){setMsg("Opening WhatsApp to share your referral link…");return;}
  const ok=await copyTextRobust(link);
  if(ok)flashCopied("link","Referral link copied. Paste it into the app you want to share with.");
  else{setError("Sharing is blocked by your browser. Please copy the referral link manually.");try{window.prompt("Copy your referral link:",link)}catch{}}
 };
 const logout=()=>{localStorage.removeItem("token");localStorage.removeItem("nexora-cached-me");clearCachedMemberData();setMe(null);setPage("dashboard");setMobile(false);setInstructions(false);window.history.replaceState({},"","/");window.location.replace("/")};
 const profileStrength=Math.round(([me.user.name,me.user.email,me.user.phone,me.user.referralCode,me.package].filter(Boolean).length/5)*100);
 return <div className={`app${mobile?" member-menu-open":""}`}>{mobile&&<button className="navoverlay" aria-label="Close menu" onClick={()=>setMobile(false)}/>}<aside className={mobile?"open":""}><div className="membernavbrand"><img src="/nexora-logo.png"/><div><b>NEXORA</b><small>MEMBER PLATFORM</small></div><button className="mobileclose" onClick={()=>setMobile(false)} aria-label="Close menu"><X size={19}/></button></div><div className="membernavscroll">{nav.map(([id,t,I])=><button className={`${page===id?"active":""}${primaryNavIds.has(id)?"":" navsecondary"}${id==="services"?" navserviceitem":""}`} onClick={()=>{setPage(id);setMobile(false);setMsg("");requestAnimationFrame(()=>{window.scrollTo({top:0,behavior:"instant"});document.querySelector(".app main")?.scrollTo({top:0,behavior:"instant"});document.querySelector(".app .membernavscroll")?.scrollTo({top:0,behavior:"instant"});})}} key={id}><I size={18}/><span className="navlabel">{t}{id==="services"&&<small className="navservicesub">Websites · Mobile Apps · Web Apps · E-commerce</small>}</span>{id==="support" && tickets.some(x=>x.status==="OPEN") && <span className="navbadge">!</span>}</button>)}<button onClick={()=>{setInstructions(true);setMobile(false);requestAnimationFrame(()=>{window.scrollTo({top:0,behavior:"instant"});document.querySelector(".app main")?.scrollTo({top:0,behavior:"instant"});})}}><BookOpen size={18}/>Tutorials & Help</button><button onClick={()=>{setPage("security");setMobile(false);requestAnimationFrame(()=>{window.scrollTo({top:0,behavior:"instant"});document.querySelector(".app main")?.scrollTo({top:0,behavior:"instant"});})}}><UserCog size={18}/>Profile & Security</button><button className="logoutbtn" onClick={logout}><LogOut size={18}/>Logout</button></div></aside><main><header className={`member-sticky-header${headerCompact?" compact":""}`}><button className="mobilemenu" onClick={()=>setMobile(!mobile)} aria-label={mobile?"Close menu":"Open menu"} title={mobile?"Close navigation":"Open navigation"}>{mobile?<X size={22}/>:<span className="hamburgerglyph" aria-hidden="true">☰</span>}</button><div className="memberpagetitle"><b>{nav.find(x=>x[0]===page)?.[1]||"Dashboard"}</b><div className="muted small">Shop · Orders · Wallet · Seller tools</div></div><div className="memberheaderbrand"><img src="/nexora-logo.png"/><ActivityCenter me={me} tickets={tickets} notifications={notifications} goPage={setPage}/><button type="button" className={`nx-announcement-alert ${unreadAnnouncementCount?"is-unread":""}`} onClick={()=>{setShowAnnouncementsModal(open=>!open);setMobile(false);}} aria-expanded={showAnnouncementsModal} aria-haspopup="dialog" aria-label={showAnnouncementsModal?"Close announcements":"Open announcements"} title="Official announcements"><Megaphone size={18}/><span className="nx-announcement-label">News</span>{unreadAnnouncementCount>0&&<span className="nx-announcement-count" aria-label={`${unreadAnnouncementCount} unread announcements`}>{Math.min(unreadAnnouncementCount,99)}{unreadAnnouncementCount>99?"+":""}</span>}</button><button type="button" className="nx-header-nexbot" onClick={()=>window.dispatchEvent(new Event("nexora-open-nexbot"))} aria-label="Open NexBot assistant" title="Ask NexBot"><img src="/nexbot-mascot.png" alt=""/><span>NexBot</span></button><PWAInstall compact/><button className="avatar avatarbtn" onClick={()=>setMobile(true)} aria-label="Open account menu">{me.user.name?.[0]?.toUpperCase()||"N"}</button></div></header>{!networkOnline&&offlineNotice&&<div className="notice topmsg nx-offline-toast" role="status"><Wifi size={15}/><span>You’re offline. Saved information may be available; online actions will resume when you reconnect.</span><button onClick={()=>load(false)}><RefreshCw size={15}/> Retry</button></div>}{error&&<div className="error topmsg"><span>{error}</span><button onClick={()=>load(false)}><RefreshCw size={15}/> Retry</button></div>}{msg&&<div className="notice topmsg">{msg}</div>}
 <div className="nx-page-stage" key={page}>
 {page==="intelligence"&&<NexoraIntelligence me={me} referrals={referrals} earnings={earnings} transactions={transactions} goPage={setPage} profileStrength={profileStrength}/>} {page==="trust"&&<NexoraTrustCentre me={me} transactions={transactions} earnings={earnings} goPage={setPage}/>} {page==="businessbuilder"&&<NexoraBusinessBuilder goPage={setPage}/>}
 {page==="dashboard"&&<Dashboard goPage={setPage} me={me} referrals={referrals} copy={copy} copyCode={copyCode} copiedKind={copiedKind} share={share} goPackages={()=>{setPage("referrals"); try{sessionStorage.setItem("nexora-earn-tab","plans")}catch{}}} profileStrength={profileStrength} analytics={analytics} tickets={tickets} goSecurity={()=>setPage("security")} load={load} paymentConfig={payMethods}/>} 
 {page==="packages"&&<section><div className="sectionhead"><div><span className="pill">EARN · PLANS</span><h1>Membership plans</h1><p className="muted">Plans live under Earn — purchase a plan to unlock referral earning tools.</p></div><button className="secondary" onClick={()=>setPage("referrals")}>Back to Earn</button></div><button type="button" className="info-chip" onClick={()=>window.open("/membership","_blank","noopener")}>Plan required · view rules</button><Packages packages={packages} current={me.package} purchase={purchase} reload={()=>load(false)}/></section>} 
 {page==="referrals"&&<><Referrals data={referrals} earnings={earnings} me={me} copy={copy} copyCode={copyCode} copiedKind={copiedKind} share={share} packages={packages} purchase={purchase} reload={()=>load(false)} initialTab={(typeof sessionStorage!=="undefined"&&sessionStorage.getItem("nexora-earn-tab")==="plans"?(sessionStorage.removeItem("nexora-earn-tab"),"plans"):"network")}/><ReferralTree data={referrals} me={me}/></>} 
 {page==="analytics"&&<Analytics data={analytics} earnings={earnings} referrals={referrals}/>} 
 {page==="marketing"&&<Marketing me={me} copy={copy} copyCode={copyCode} copiedKind={copiedKind} share={share}/>} {page==="marketplace"&&<Marketplace me={me}/>} {page==="connect"&&<NexoraConnect me={me}/>} {page==="products"&&<Products me={me} packages={packages} purchase={purchase} goPlans={()=>{setPage("referrals");try{sessionStorage.setItem("nexora-earn-tab","plans")}catch{}}}/>} {page==="community"&&<Community announcements={announcements} onAcknowledge={async a=>{try{await api("/announcements/"+encodeURIComponent(a.id)+"/acknowledge",{method:"POST"});setAnnouncements(rows=>{const next=rows.map(x=>x.id===a.id?{...x,opened:true,acknowledged:true}:x);if(me?.user?.id)saveCachedMemberData("announcements",next,me.user.id);return next});setMsg("Announcement acknowledged.");}catch(e){setError(e.message)}}}/>} {page==="activity"&&<ActivityCentrePage me={me} transactions={transactions} notifications={notifications} tickets={tickets} analytics={analytics} goPage={setPage}/>} {page==="notifications"&&<Notifications me={me} analytics={analytics} tickets={tickets} notifications={notifications}/>} 
 {page==="academy"&&<Academy goPage={setPage} me={me}/>} 
 {page==="leaderboard"&&<Leaderboard rows={leaderboard}/>} 
 {page==="challenges"&&<Challenges referrals={referrals} earnings={earnings}/>} 
 {page==="wallet"&&<Wallet me={me} load={()=>load(false)} paymentConfig={payMethods}/>} {page==="transfer"&&<MoneyTransfer me={me}/>} {page==="services"&&<DigitalServices me={me}/>} {page==="balloon"&&<BalloonVenturesPage/>} 
 {page==="transactions"&&<Transactions rows={transactions} onOpenReceipt={x=>setReceipt({reference:x.reference,type:x.type.replaceAll("_"," "),amount:x.amount,status:x.status,method:x.metadata?.method||x.metadata?.paystack?.provider||"NEXORA",createdAt:x.createdAt})} onOpenPending={x=>{const packageId=x.metadata?.packageId;const pkg=packages.find(p=>p.id===packageId);const isPaystack=String(x.metadata?.method||"").toUpperCase().startsWith("PAYSTACK")||String(x.reference||"").startsWith("NX-PS-");if(isPaystack&&(x.type==="DEPOSIT"||x.type==="PACKAGE_PURCHASE")){setPayment({method:"paystack_mpesa",paymentType:x.type,reference:x.reference,package:pkg,amount:Number(x.amount||0),phone:cleanPhone(x.metadata?.phone||me.user.phone||""),status:"pending",chargeAmount:Number(x.metadata?.chargeAmount||x.amount),display_text:x.metadata?.paystack?.display_text||"",message:"NEXORA is checking the original payment reference with Paystack. No new payment request will be created."});return}if(pkg)setPayment({method:isPaystack?"paystack_mpesa":"paybill",paymentType:x.type,reference:x.reference,package:pkg,phone:cleanPhone(x.metadata?.phone||me.user.phone||""),status:String(x.status||"PENDING").toLowerCase(),chargeAmount:Number(x.metadata?.chargeAmount||x.amount),display_text:x.metadata?.paystack?.display_text||"",message:""})}}/>} 
 {page==="support"&&<SupportCenter tickets={tickets} reload={()=>load(false)}/>} {page==="security"&&<Security me={me} reload={()=>load(false)} strength={profileStrength}/>} {page==="settings"&&<SettingsPreferences goPage={setPage} me={me}/>}
 </div></main>{pageTransition&&<NexoraPageTransition label={nav.find(x=>x[0]===page)?.[1]||"Opening workspace…"}/>}<CommandCenter goPage={setPage} goPackages={()=>setPage("referrals")} share={share} goSecurity={()=>setPage("security")} onDeposit={()=>setPage("wallet")}/>{!mobile && !me?.package && (page==="dashboard"||page==="referrals"||page==="marketplace") && (
  <div className={`nx-sticky-cta ${mobile?"menu-hidden":"show"}`}>
    <button type="button" className="primary" onClick={()=>{setPage("referrals");try{sessionStorage.setItem("nexora-earn-tab","plans")}catch{}}}>Get a plan</button>
  </div>
)}
<nav className="mobile-bottom-nav">{[["dashboard","Home",BarChart3],["marketplace","Shop",Store],["wallet","Wallet",CreditCard],["transactions","Orders",History],["security","Profile",UserCog]].map(([id,label,I])=><button key={id} className={page===id?"active":""} onClick={()=>setPage(id)}><I size={18}/><span>{label}</span></button>)}</nav><NexBot goPage={setPage} goPackages={()=>{setPage("referrals");try{sessionStorage.setItem("nexora-earn-tab","plans")}catch{}}} me={me}/><SupportButton/>{showBackToTop&&<button type="button" className="nx-back-to-top" onClick={()=>{window.scrollTo({top:0,behavior:"smooth"});document.querySelector(".app main")?.scrollTo({top:0,behavior:"smooth"});}} aria-label="Back to top" title="Back to top"><ArrowUpRight size={19}/></button>} {showAnnouncementsModal&&<div className="nx-news-modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setShowAnnouncementsModal(false)}}><section className="nx-news-modal" role="dialog" aria-modal="true" aria-label="NEXORA announcements"><div className="nx-news-modal-head"><div><span className="pill">NEXORA NEWS CENTER</span><h2>Announcements</h2><p className="muted">Official updates from the NEXORA team.</p></div><button type="button" className="nx-news-modal-close" onClick={()=>setShowAnnouncementsModal(false)} aria-label="Close announcements"><X size={21}/></button></div><div className="nx-news-modal-content"><Community announcements={announcements} onAcknowledge={async a=>{try{await api("/announcements/"+encodeURIComponent(a.id)+"/acknowledge",{method:"POST"});setAnnouncements(rows=>{const next=rows.map(x=>x.id===a.id?{...x,opened:true,acknowledged:true}:x);if(me?.user?.id)saveCachedMemberData("announcements",next,me.user.id);return next});setMsg("Announcement acknowledged.");}catch(e){setError(e.message)}}}/></div><div className="nx-news-modal-footer"><button type="button" className="secondary" onClick={()=>setShowAnnouncementsModal(false)}>Close announcements</button></div></section></div>}
{instructions&&<Instructions page={page} onNavigate={setPage} onClose={()=>setInstructions(false)}/>} {loginUpdates.length>0&&<LoginUpdatesModal items={loginUpdates} onClose={()=>{try{const old=JSON.parse(localStorage.getItem("nexora-dismissed-login-updates")||"[]");const ids=loginUpdates.map(n=>String(n.id)).filter(Boolean);localStorage.setItem("nexora-dismissed-login-updates",JSON.stringify([...new Set([...old.map(String),...ids])].slice(-500)))}catch{};setLoginUpdates([])}}/>} {phoneModal&&<PhoneModal data={phoneModal} walletBalance={Number(me?.wallet?.balance||0)} onCancel={()=>{setPhoneModal(null);load(false)}} onContinue={(phone,pkg)=>startPayment(phone,pkg)} onWallet={walletPurchase} paymentConfig={payMethods}/>} {receipt&&<ReceiptModal receipt={receipt} onClose={()=>setReceipt(null)}/>} {payment&&(payment.method==="paystack_mpesa"?<PaystackPaymentModal payment={payment} onReceipt={x=>{setReceipt({reference:x.reference,package:x.package,amount:Number(x.amount||x.chargeAmount||x.package?.price||0),method:"NEXORA M-Pesa STK Push",status:"PAID",createdAt:new Date().toISOString()});setPayment(null)}} onSuccess={()=>{load(false);try{localStorage.setItem("nexora-milestone-paid","1")}catch{}}} onClose={()=>setPayment(null)}/>:<PaymentModal payment={payment} onReceipt={x=>{setReceipt({reference:x.reference,package:x.package,amount:Number(x.amount||x.chargeAmount||x.package?.price||0),method:x.method||"M-Pesa Paybill",status:"PAID",createdAt:new Date().toISOString()});setPayment(null)}} onSuccess={()=>load(false)} onClose={()=>setPayment(null)} onCheck={async()=>{try{const v=await api(`/payments/status/${payment.reference}`);setPayment(x=>x?{...x,status:v.status||"pending",display_text:v.display_text||x.display_text,message:v.message&&v.message!=="Charge attempted"?v.message:x.message}:x);if(v.status==="success"){await load(false);setMsg("Payment confirmed. Your plan is now active.");try{localStorage.setItem("nexora-milestone-paid","1")}catch{}}}catch(e){setError(e.message)}}}/>)}</div>
}


const KIGEN_BUNDLES={
 data:[
  {id:"data-19",price:19,name:"1 GB",validity:"1 hour",group:"daily"},
  {id:"data-20",price:20,name:"250 MB",validity:"24 hours",group:"daily"},
  {id:"data-49",price:49,name:"400 MB",validity:"7 days",group:"daily"},
  {id:"data-50",price:50,name:"1.5 GB",validity:"3 hours",group:"daily",highlight:true},
  {id:"data-51",price:51,name:"750 MB + 50 SMS",validity:"Validity as provided by Kigen",group:"daily"},
  {id:"data-55",price:55,name:"1 GB",validity:"Till midnight",group:"daily"},
  {id:"data-99",price:99,name:"1 GB",validity:"24 hours",group:"daily"},
  {id:"data-300",price:300,name:"2.5 GB",validity:"7 days",group:"daily"},
  {id:"data-700",price:700,name:"6 GB",validity:"7 days",group:"daily"},
  {id:"data-999",price:999,name:"21 GB",validity:"1 month",group:"daily",featured:true},
  {id:"data-23",price:23,name:"1 GB",validity:"1 hour",group:"repeat"},
  {id:"data-53",price:53,name:"1.5 GB",validity:"3 hours",group:"repeat"},
  {id:"data-54",price:54,name:"750 MB + 50 SMS + free WhatsApp",validity:"As listed by Kigen",group:"repeat"},
  {id:"data-110",price:110,name:"2 GB",validity:"24 hours",group:"repeat"},
  {id:"data-270",price:270,name:"5 GB",validity:"3 days",group:"repeat"}
 ],
 minutes:[
  {id:"minutes-22",price:22,name:"45 minutes",validity:"3 hours",group:"repeat"},
  {id:"minutes-52",price:52,name:"60 minutes",validity:"Till midnight",group:"repeat"},
  {id:"minutes-250",price:250,name:"200 minutes",validity:"7 days",group:"repeat"},
  {id:"minutes-1000",price:1000,name:"1,000 minutes",validity:"30 days",group:"repeat"}
 ],
 sms:[
  {id:"sms-5",price:5,name:"20 SMS",validity:"24 hours",group:"repeat"},
  {id:"sms-10",price:10,name:"200 SMS",validity:"24 hours",group:"repeat"},
  {id:"sms-30",price:30,name:"1,000 SMS",validity:"1 week",group:"repeat"},
  {id:"sms-100",price:100,name:"1,500 SMS",validity:"30 days",group:"repeat"},
  {id:"sms-200",price:200,name:"3,500 SMS",validity:"30 days",group:"repeat"}
 ]
};
function NexoraConnect({me}){
 const [category,setCategory]=useState("data"),[selectedId,setSelectedId]=useState(null),[recipientType,setRecipientType]=useState("self"),[recipient,setRecipient]=useState(String(me?.user?.phone||"")),[notice,setNotice]=useState(""),[error,setError]=useState(""),[paymentChoice,setPaymentChoice]=useState("WALLET"),[orderBusy,setOrderBusy]=useState(false),[orders,setOrders]=useState([]),[walletBalance,setWalletBalance]=useState(Number(me?.wallet?.balance||0));
 const requestKeyRef=useRef(null);
 const lastOrdersRefreshRef=useRef(0);
 const bundles=KIGEN_BUNDLES[category]||[];
 const selected=Object.values(KIGEN_BUNDLES).flat().find(x=>x.id===selectedId)||null;
 const kenya=String(me?.user?.countryCode||"KE")==="KE";
 const phoneDigits=value=>String(value||"").replace(/\D/g,"");
 const validKenyanPhone=value=>{const d=phoneDigits(value);return /^0[17]\d{8}$/.test(d)||/^254[17]\d{8}$/.test(d)};
 const normalizedPhone=value=>{let d=phoneDigits(value);if(d.startsWith("0"))d=`254${d.slice(1)}`;return d};
 const loadOrders=async()=>{lastOrdersRefreshRef.current=Date.now();try{setOrders(await api("/connect/orders"))}catch(e){setError(prev=>prev||e.message)}};
 useEffect(()=>{setWalletBalance(Number(me?.wallet?.balance||0))},[me?.wallet?.balance]);
 useEffect(()=>{loadOrders();const refresh=()=>{if(Date.now()-lastOrdersRefreshRef.current>=10000)loadOrders()};window.addEventListener("nexora-realtime",refresh);return()=>window.removeEventListener("nexora-realtime",refresh)},[]);
 const changeRecipientType=type=>{setRecipientType(type);setNotice("");setError("");requestKeyRef.current=null;if(type==="self"&&me?.user?.phone)setRecipient(String(me.user.phone));else if(type==="friend"&&String(recipient)===String(me?.user?.phone||""))setRecipient("")};
 const copyPayment=async()=>{
  setError("");setNotice("");
  const text=recipientType==="self"
   ?`KIGEN INTERNET SERVICES — M-PESA Buy Goods & Services\nTill number: 3032394\nOffer: ${selected?`KES ${selected.price} — ${selected.name} (${selected.validity})`:"Select an offer in NEXORA Connect"}`
   :`KIGEN INTERNET SERVICES — M-PESA Paybill\nPaybill: 4576143\nAccount / recipient phone: ${recipient||"Enter recipient phone first"}\nOffer: ${selected?`KES ${selected.price} — ${selected.name} (${selected.validity})`:"Select an offer in NEXORA Connect"}`;
  const ok=await copyTextRobust(text);setNotice(ok?"Payment instructions copied.":"Copy wasn't available. You can read the payment details below.");
 };
 const submitConnectOrder=async()=>{
  setNotice("");setError("");
  if(!selected){setError("Choose a bundle first.");return}
  if(!validKenyanPhone(recipient)){setError("Enter a valid Safaricom phone number, for example 0712345678 or 254712345678.");return}
  if(paymentChoice==="WALLET"&&walletBalance<selected.price){setError(`Your available balance is ${money(walletBalance)}, but this offer costs ${money(selected.price)}. Add funds or select pay directly to Kigen.`);return}
  // Open the direct-provider window synchronously to avoid popup blockers during the API request.
  const popup=paymentChoice==="KIGEN_DIRECT"?window.open("about:blank","_blank"):null;
  setOrderBusy(true);
  try{
   if(!requestKeyRef.current){requestKeyRef.current=window.crypto?.randomUUID?.()||`connect-${Date.now()}-${Math.random().toString(36).slice(2,12)}`}
   const d=await api("/connect/orders",{method:"POST",body:JSON.stringify({bundleId:selected.id,recipientPhone:normalizedPhone(recipient),recipientType:recipientType==="self"?"SELF":"FRIEND",paymentMethod:paymentChoice,requestKey:requestKeyRef.current})});
   requestKeyRef.current=null;
   const order=d.order;
   if(d.walletBalance!==undefined)setWalletBalance(Number(d.walletBalance));
   await loadOrders();
   window.dispatchEvent(new CustomEvent("nexora-realtime"));
   if(paymentChoice==="WALLET"){
    setNotice(`Order ${order.reference} was saved and ${money(selected.price)} was deducted from your wallet. The bundle is awaiting fulfilment; payment is not delivery confirmation.`);
   }else{
    const payment=recipientType==="self"?"Lipa na M-PESA → Buy Goods & Services → Till 3032394":"Lipa na M-PESA → Paybill 4576143 → account/recipient phone: "+normalizedPhone(recipient);
    const text=["Hello Kigen Internet Services, I created a Safaricom bundle request through NEXORA Connect.","",`NEXORA order reference: ${order.reference}`,`Offer: ${selected.name}`,`Amount: KES ${selected.price}`,`Validity: ${selected.validity}`,`Safaricom number: +${normalizedPhone(recipient)}`,`Purchase type: ${recipientType==="self"?"My own number":"Another person's number"}`,`Payment instructions shown: ${payment}`,"","Please confirm current availability and fulfilment. My NEXORA order is awaiting payment verification; it is not yet marked paid or delivered.","Source: NEXORA Connect"].join("\n");
    const url=`https://wa.me/254700004916?text=${encodeURIComponent(text)}`;
    if(popup)popup.location.href=url;else window.location.href=url;
    setNotice(`Order ${order.reference} was saved. Payment will remain pending until the Internet Services team checks the payment with Kigen.`);
   }
  }catch(e){if(popup)popup.close();setError(e.message||"Could not submit this order. Check your order history before trying again.");}
  finally{setOrderBusy(false)}
 };
 const categoryConfig={data:{label:"Data bundles",icon:Wifi,caption:"Daily picks and repeat-purchase data offers."},minutes:{label:"Minutes",icon:PhoneCall,caption:"Voice-minute bundles from the Kigen offer list."},sms:{label:"SMS bundles",icon:MessageSquareText,caption:"SMS offers for everyday messaging."}};
 const CategoryIcon=categoryConfig[category].icon;
 if(!kenya)return <section className="connect-page"><div className="sectionhead"><div><span className="pill">NEXORA CONNECT</span><h1>NEXORA Connect</h1><p className="muted">Everyday digital services, starting with Safaricom in Kenya.</p></div><Wifi size={28}/></div><div className="panel connect-unavailable"><Wifi size={34}/><h2>Safaricom bundles are currently Kenya-only</h2><p className="muted">This Kigen Internet Services offer list is for Kenyan Safaricom numbers. Other NEXORA Connect services may be added for your country later.</p></div></section>;
 return <section className="connect-page">
  <div className="sectionhead connect-sectionhead"><div><span className="pill">EVERYDAY DIGITAL SERVICES</span><h1>NEXORA Connect</h1><p className="muted">Safaricom data, minutes and SMS offers from Kigen Internet Services — organised in one easy place.</p></div><div className="connect-provider-mark"><Wifi size={24}/><span><b>KIGEN INTERNET SERVICES</b><small>Kenya · Safaricom offers</small></span></div></div>
  <div className="connect-hero"><div className="connect-herocopy"><span className="connect-live"><i/> KENYA SERVICE</span><h2>Stay connected for less.</h2><p>Choose the data, minutes or SMS offer that fits your day. Pay using your available NEXORA wallet balance or record an order to pay Kigen directly.</p><div className="connect-herotags"><span><Smartphone size={14}/> Safaricom numbers</span><span><ShieldCheck size={14}/> Order status tracking</span></div></div><div className="connect-hero-price"><span>FEATURED OFFER</span><strong>KES 999</strong><b>21 GB · 1 month</b><small>Listed on the Kigen offer poster</small><button type="button" onClick={()=>{setCategory("data");setSelectedId("data-999");setError("");setNotice("");document.getElementById("connect-offers")?.scrollIntoView({behavior:"smooth",block:"start"})}}>View offer <ArrowRight size={15}/></button></div></div>
  <div className="connect-okoa"><span className="connect-okoaicon"><Zap size={20}/></span><div><b>Offers advertised even with Okoa Jahazi debt</b><p>Kigen's poster advertises bundle purchases even when Okoa is outstanding. Eligibility and availability can depend on Safaricom's current rules, so confirm with Kigen before paying.</p></div><span className="connect-okoa-badge">ASK KIGEN TO CONFIRM</span></div>
  <div id="connect-offers" className="connect-offers-layout"><div className="connect-catalog"><div className="connect-tabrow" role="tablist" aria-label="Bundle type">{Object.entries(categoryConfig).map(([id,cfg])=>{const I=cfg.icon;return <button type="button" key={id} role="tab" aria-selected={category===id} className={category===id?"active":""} onClick={()=>{setCategory(id);setSelectedId(null);requestKeyRef.current=null;setError("");setNotice("")}}><I size={17}/>{cfg.label}<span>{KIGEN_BUNDLES[id].length}</span></button>})}</div><div className="connect-offer-intro"><div><span className="pill">KIGEN OFFER MENU</span><h2>{categoryConfig[category].label}</h2><p className="muted">{categoryConfig[category].caption}</p></div><span className="connect-price-currency">Prices in KES</span></div>
   {category==="data"? <><div className="connect-group-head"><div><b>Daily data deals</b><small>Poster labels these as buy once per day</small></div><span>{KIGEN_BUNDLES.data.filter(x=>x.group==="daily").length} offers</span></div><div className="connect-bundlegrid">{bundles.filter(x=>x.group==="daily").map(x=><ConnectBundleCard key={x.id} bundle={x} selected={selectedId===x.id} onChoose={()=>{setSelectedId(x.id);requestKeyRef.current=null;setError("");setNotice("")}}/>)}</div><div className="connect-group-head connect-repeat-head"><div><b>Repeat-purchase data offers</b><small>Poster labels these as buy-many-times offers</small></div><span>{bundles.filter(x=>x.group==="repeat").length} offers</span></div><div className="connect-bundlegrid">{bundles.filter(x=>x.group==="repeat").map(x=><ConnectBundleCard key={x.id} bundle={x} selected={selectedId===x.id} onChoose={()=>{setSelectedId(x.id);requestKeyRef.current=null;setError("");setNotice("")}}/>)}</div></>:<><div className="connect-group-head"><div><b>{categoryConfig[category].label}</b><small>Poster labels these offers as unlimited repeat purchases</small></div><span>{bundles.length} offers</span></div><div className="connect-bundlegrid">{bundles.map(x=><ConnectBundleCard key={x.id} bundle={x} selected={selectedId===x.id} onChoose={()=>{setSelectedId(x.id);requestKeyRef.current=null;setError("");setNotice("")}}/>)}</div></>}
  </div><div className="connect-order-panel"><div className="connect-order-title"><span className="connect-order-icon"><CategoryIcon size={20}/></span><div><span className="pill">YOUR SELECTION</span><h3>Order a bundle</h3></div></div>{selected?<div className="connect-selected-offer"><div><small>Selected offer</small><b>{selected.name}</b><span>{selected.validity}</span></div><strong>KES {selected.price.toLocaleString()}</strong></div>:<p className="muted">Choose an offer to get started.</p>}
   <div className="connect-toggle" role="group" aria-label="Who is the bundle for?"><button type="button" className={recipientType==="self"?"active":""} onClick={()=>changeRecipientType("self")}>My number</button><button type="button" className={recipientType==="friend"?"active":""} onClick={()=>changeRecipientType("friend")}>Someone else</button></div>
   <label className="fieldlabel connect-phone-label">Safaricom phone number<input type="tel" autoComplete="tel" inputMode="tel" value={recipient} onChange={e=>{setRecipient(e.target.value);requestKeyRef.current=null;setError("");setNotice("")}} placeholder="0712 345 678"/></label><small className="connect-phone-note">Enter the number that should receive the bundle.</small>
   <div className="connect-payment-choice"><b>Choose how to pay</b><div className="connect-payment-options"><button type="button" className={paymentChoice==="WALLET"?"active":""} onClick={()=>{setPaymentChoice("WALLET");requestKeyRef.current=null;setError("");setNotice("")}}><WalletCards size={17}/><span><strong>NEXORA Wallet</strong><small>Available: {money(walletBalance)}</small></span><i>{paymentChoice==="WALLET"?"Selected":"Choose"}</i></button><button type="button" className={paymentChoice==="KIGEN_DIRECT"?"active":""} onClick={()=>{setPaymentChoice("KIGEN_DIRECT");requestKeyRef.current=null;setError("");setNotice("")}}><Smartphone size={17}/><span><strong>Pay Kigen directly</strong><small>M-Pesa via Kigen's listed Till / Paybill</small></span><i>{paymentChoice==="KIGEN_DIRECT"?"Selected":"Choose"}</i></button></div>{paymentChoice==="WALLET"&&selected&&walletBalance<selected.price&&<p className="connect-wallet-insufficient">Insufficient available balance. Add funds to your wallet or choose Pay Kigen directly.</p>}</div>
   {paymentChoice==="KIGEN_DIRECT"?<div className="connect-payment-instructions"><div className="connect-payment-heading"><b><Smartphone size={15}/> M-PESA payment steps</b></div>{recipientType==="self"?<><p>For your own number, Kigen's poster lists:</p><div className="connect-payment-number"><span>Buy Goods &amp; Services · Till</span><b>3032394</b><button type="button" onClick={()=>copyTextRobust("3032394")} aria-label="Copy Till number"><Copy size={14}/></button></div><ol><li>Open M-PESA</li><li>Select Lipa na M-PESA</li><li>Choose Buy Goods &amp; Services</li><li>Enter Till <b>3032394</b>, then follow the amount confirmed by Kigen</li><li>Confirm the details before paying</li></ol></>:<><p>For another number, Kigen's poster lists:</p><div className="connect-payment-number"><span>Paybill</span><b>4576143</b><button type="button" onClick={()=>copyTextRobust("4576143")} aria-label="Copy Paybill number"><Copy size={14}/></button></div><div className="connect-account-note"><small>Account / recipient number</small><b>{normalizedPhone(recipient)||"Enter recipient phone above"}</b></div><ol><li>Open M-PESA</li><li>Select Lipa na M-PESA → Paybill</li><li>Enter Paybill <b>4576143</b></li><li>Use the recipient's phone as the account reference, as directed on Kigen's poster</li><li>Confirm details before paying</li></ol></>}</div>:<div className="connect-payment-instructions connect-wallet-instructions"><div className="connect-payment-heading"><b><WalletCards size={15}/> Pay securely from your NEXORA wallet</b></div><p>We will check your available balance on the server and deduct the exact catalogue price in the same database transaction as the order. A wallet payment means the order is paid, not that the bundle has already been delivered.</p><div className="connect-payment-number"><span>Available balance</span><b>{money(walletBalance)}</b></div><div className="connect-account-note"><small>After payment</small><b>The Internet Services team fulfils your order and updates its status.</b></div></div>}
   {error&&<div className="error connect-form-msg" role="alert">{error}</div>}{notice&&<div className="notice connect-form-msg" role="status"><CheckCircle2 size={15}/>{notice}</div>}
   <button className="primary full connect-whatsapp-btn" type="button" disabled={!selected||orderBusy||(paymentChoice==="WALLET"&&walletBalance<selected.price)} onClick={submitConnectOrder}>{orderBusy?<LoaderCircle size={17} className="spin"/>:paymentChoice==="WALLET"?<WalletCards size={17}/>:<MessageCircle size={17}/>} {orderBusy?"Saving order…":paymentChoice==="WALLET"?`Pay ${selected?money(selected.price):""} with wallet & place order`:"Create order & continue to Kigen"} <ArrowRight size={16}/></button>{paymentChoice==="KIGEN_DIRECT"&&<button className="secondary full connect-copy-btn" type="button" onClick={copyPayment} disabled={!selected}><Copy size={15}/> Copy selected offer &amp; payment details</button>}
   <p className="connect-disclaimer">Wallet orders are charged immediately and remain pending fulfilment until the bundle is confirmed delivered. Direct Kigen payments are not marked paid until a Connect Admin checks the M-Pesa payment reference. NEXORA does not yet have Kigen's automatic ordering API.</p>
  </div></div>
  <section className="connect-my-orders"><div className="sectionhead"><div><span className="pill">ORDER HISTORY</span><h2>Your NEXORA Connect orders</h2><p className="muted">Track payment and bundle delivery separately. A paid order is not necessarily delivered yet.</p></div><button type="button" className="secondary" onClick={loadOrders}><RefreshCw size={15}/> Refresh</button></div>{orders.length?<div className="connect-order-history">{orders.map(order=><article className="connect-history-card" key={order.id}><div className="connect-history-main"><b>{order.bundleName} · {money(order.amount)}</b><small>{order.reference} · {new Date(order.createdAt).toLocaleString()}</small><small>To +{order.recipientPhone} · {order.paymentMethod==="WALLET"?"NEXORA Wallet":"Pay Kigen directly"}</small></div><div className="connect-history-status"><span className={`connect-status-pill ${String(order.paymentStatus).toLowerCase()}`}>Payment: {String(order.paymentStatus).replaceAll("_"," ")}</span><span className={`connect-status-pill ${String(order.status).toLowerCase()}`}>{String(order.status).replaceAll("_"," ")}</span>{order.status==="FAILED"&&order.paymentMethod==="KIGEN_DIRECT"&&order.paymentStatus==="PAID"&&<small>Contact Kigen about any provider-side refund.</small>}{order.adminNote&&<small>{order.adminNote}</small>}</div></article>)}</div>:<div className="connect-history-empty"><Wifi size={23}/><b>No Connect orders yet</b><p>Your orders and fulfilment updates will appear here.</p></div>}</section>
  <div className="connect-bottomgrid"><div className="panel connect-how"><div className="paneltitle"><div><span className="pill">HOW TO BUY</span><h3>Simple steps</h3></div><CheckCircle2 size={20}/></div><ol><li><b>Select an offer</b><span>Choose data, minutes or SMS and select a package.</span></li><li><b>Enter the receiving number</b><span>Double-check every digit before payment.</span></li><li><b>Choose a payment method</b><span>Pay from your available NEXORA balance or record an order to pay Kigen directly.</span></li><li><b>Track the order</b><span>Monitor payment and fulfilment status in your Connect order history.</span></li><li><b>Keep the M-Pesa confirmation</b><span>For direct payments, keep the receipt and never share your M-Pesa PIN.</span></li></ol></div><div className="panel connect-provider-card"><div className="paneltitle"><div><span className="pill">SERVICE PROVIDER</span><h3>Kigen Internet Services</h3></div><PhoneCall size={20}/></div><p className="muted">For bundle availability, delivery questions, or a payment that needs checking, contact Kigen directly.</p><a className="connect-contact-row" href="tel:+254700004916"><PhoneCall size={17}/><span><small>Helpline 1</small><b>0700 004 916</b></span><ArrowUpRight size={15}/></a><a className="connect-contact-row" href="tel:+254107763940"><PhoneCall size={17}/><span><small>Helpline 2</small><b>0107 763 940</b></span><ArrowUpRight size={15}/></a><a className="connect-contact-row whats" href="https://wa.me/254700004916" target="_blank" rel="noreferrer"><MessageCircle size={17}/><span><small>WhatsApp Kigen</small><b>Start a chat</b></span><ExternalLink size={15}/></a><div className="connect-supplier-details"><span><b>Paybill</b> 4576143</span><span><b>Own number Till</b> 3032394</span><span><b>Business name</b> Kigen Internet Services</span></div></div></div>
  <div className="connect-smallprint"><ShieldCheck size={16}/><p><b>Offer information:</b> Prices, sizes and validity are structured from the Kigen Internet Services poster provided for this project. Offers may change or be withdrawn; confirm the exact bundle and total before paying. Safaricom/Okoa eligibility and delivery timings are provider-dependent. NEXORA does not guarantee operator availability, delivery within a fixed time, or successful payment.</p></div>
 </section>;
}

function ConnectBundleCard({bundle,selected,onChoose}){
 return <button type="button" className={`connect-bundle-card${selected?" selected":""}${bundle.featured?" featured":""}${bundle.highlight?" highlighted":""}`} onClick={onChoose} aria-pressed={selected}><span className="connect-bundle-top"><span className="connect-bundle-dot">{selected?<Check size={13}/>:<Wifi size={13}/>}</span>{bundle.featured?<em>FEATURED VALUE</em>:bundle.highlight?<em>POPULAR</em>:null}</span><strong>KES {bundle.price.toLocaleString()}</strong><b>{bundle.name}</b><small>{bundle.validity}</small><span className="connect-bundle-choose">{selected?"Selected":"Choose offer"} <ArrowRight size={13}/></span></button>
}

function MoneyTransfer({me}){
 const [recipient,setRecipient]=useState(''),[amount,setAmount]=useState(''),[note,setNote]=useState(''),[rows,setRows]=useState([]),[busy,setBusy]=useState(false),[msg,setMsg]=useState(''),[err,setErr]=useState('');
 const load=async()=>{try{setRows(await api('/transfers'))}catch(e){setErr(e.message)}};
 useEffect(()=>{load()},[]);
 const send=async e=>{e.preventDefault();setBusy(true);setMsg('');setErr('');try{const d=await api('/transfers',{method:'POST',body:JSON.stringify({recipient,amount,note})});setMsg(`Money sent successfully to ${d.recipient.name}. Reference: ${d.reference}`);setRecipient('');setAmount('');setNote('');await load();}catch(e){setErr(e.message)}finally{setBusy(false)}};
 const balance=Number(me?.wallet?.balance||0);
 return <section><div className="sectionhead"><div><span className="pill">WALLET · TRANSFER</span><h1>Send money</h1><p className="muted">Send available wallet funds instantly to another active NEXORA member.</p></div></div><div className="cards three"><Card title="Available balance" value={money(balance)}/><Card title="Transfer limit" value={money(500000)}/><Card title="Transfer status" value="Instant"/></div>{msg&&<div className="notice"><CheckCircle2 size={16}/> {msg}</div>}{err&&<div className="error">{err}</div>}<div className="transfergrid"><form className="panel formpanel" onSubmit={send}><div className="paneltitle"><div><h3>New transfer</h3><p className="muted small">Use the recipient's email, phone number or referral code.</p></div><SendHorizontal size={20}/></div><label className="fieldlabel">Recipient<input required value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="Email, phone or referral code" autoComplete="off"/></label><label className="fieldlabel">Amount<input required type="number" min="1" max="500000" step="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder={`Amount (${currencyState().currency.code})`}/></label><label className="fieldlabel">Note <span className="muted small">optional</span><textarea rows="3" maxLength="240" value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Payment for the item…"/></label><div className="notice"><ShieldCheck size={15}/> Confirm the recipient carefully. Transfers are wallet-to-wallet and should only be sent to the intended member.</div><button className="primary full" disabled={busy||!amount||Number(amount)>balance}>{busy?'Sending…':`Send ${amount?money(amount):'money'}`}</button></form><div className="panel"><div className="paneltitle"><div><span className="pill">RECENT</span><h3>Transfer history</h3></div><button className="secondary narrow" onClick={load}>Refresh</button></div>{rows.length?rows.map(x=>{const outgoing=x.senderId===me.user.id;return <div className="activityrow" key={x.id}><span className="activityicon">{outgoing?<ArrowUpRight size={15}/>:<ArrowDownLeft size={15}/>}</span><div><b>{outgoing?`Sent to ${x.recipientName}`:`Received from ${x.senderName}`}</b><small>{x.reference} · {new Date(x.createdAt).toLocaleString()}</small></div><strong className={outgoing?'':'receiptpaid'}>{outgoing?'-':'+'}{money(x.amount)}</strong></div>}):<div className="smartempty"><p className="muted">No transfers yet.</p></div>}</div></div></section>
}

function BalloonVenturesPage(){
 return <section className="panel balloon-ventures-card" style={{margin:"8px 0",padding:"clamp(18px,3vw,30px)",border:"1px solid rgba(20,155,110,.28)",background:"linear-gradient(135deg,rgba(13,111,82,.12),rgba(20,155,110,.04) 55%,rgba(255,255,255,.015))",borderRadius:22}}>
  <span className="pill">NEXORA LOAN ASSISTANCE</span><h1 style={{fontSize:"clamp(25px,3vw,36px)",lineHeight:1.12,margin:"12px 0 8px"}}>Balloon Ventures</h1><p style={{fontSize:16,fontWeight:650,margin:"0 0 10px"}}>Every SME that Can Grow should Grow</p><p className="muted">NEXORA acts as a loan agent, helping eligible small and growing businesses enquire about Balloon Ventures growth financing. Funding may support working capital and business assets; all applications remain subject to Balloon Ventures assessment and approval.</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(135px,1fr))",gap:10,margin:"18px 0"}}><div style={{padding:14,borderRadius:14,background:"rgba(128,128,128,.09)"}}><small className="muted">Published loan range</small><div style={{fontWeight:750,fontSize:18}}>KSh 750K–20M</div><small className="muted">Enquire from KSh 1M+</small></div><div style={{padding:14,borderRadius:14,background:"rgba(128,128,128,.09)"}}><small className="muted">Repayment term</small><div style={{fontWeight:750,fontSize:18}}>12–36 months</div></div><div style={{padding:14,borderRadius:14,background:"rgba(128,128,128,.09)"}}><small className="muted">Published interest</small><div style={{fontWeight:750,fontSize:18}}>12–14% p.a.</div><small className="muted">Confirm current terms</small></div></div>
  <h3>What may be included</h3><ul style={{paddingLeft:20,display:"grid",gap:7}}><li>Working-capital and asset-financing support.</li><li>Up to six months of tailored, face-to-face business support.</li><li>Potential follow-on funding, subject to eligibility and assessment.</li><li>Collateral may include property, equipment or other business assets.</li></ul>
  <p className="muted small">Eligibility may include being registered and operating for at least one year in a secondary town or city. NEXORA can assist with initial enquiries as the loan agent; Balloon Ventures conducts due diligence and makes final decisions on pricing, collateral and approval.</p>
  <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:16}}><a className="primary" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,textDecoration:"none"}} href="https://wa.me/254703265774?text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20Balloon%20Ventures%20SME%20growth%20funding%20through%20NEXORA." target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp to enquire</a><a className="secondary" style={{display:"inline-flex",alignItems:"center",gap:8,textDecoration:"none"}} href="tel:+254703265774"><PhoneCall size={16}/> Call +254 703 265 774</a></div>
  <div className="notice" style={{marginTop:18}}><ShieldCheck size={16}/><span><b>Important:</b> NEXORA acts as a loan agent, not the lender. Submitting an enquiry does not guarantee approval. Final eligibility, terms, collateral requirements and disbursement are determined by Balloon Ventures.</span></div>
 </section>
}

function DigitalServices({me}){
 const types=[['WEBSITE','Business / personal website'],['MOBILE_APP','Mobile app'],['WEB_APP','Web application / SaaS'],['ECOMMERCE','E-commerce store'],['UI_UX','UI/UX & product design'],['AUTOMATION','Automation / business workflow'],['API_INTEGRATION','API / payment integration'],['BRANDING','Branding & digital identity'],['MAINTENANCE','Website/app maintenance'],['HOSTING_DOMAIN','Hosting & domain setup'],['CUSTOM_SOFTWARE','Custom software'],['OTHER','Other digital request']];
 const serviceMap={Website:'WEBSITE','Mobile app':'MOBILE_APP','Web app':'WEB_APP','E-commerce':'ECOMMERCE','Automation':'AUTOMATION','API integration':'API_INTEGRATION'};
 const [form,setForm]=useState(()=>{const base={serviceType:'WEBSITE',title:'',description:'',budget:'',whatsapp:me?.user?.phone||'',email:me?.user?.email||''};try{const saved=localStorage.getItem('nexora-service-draft:'+String(me?.user?.id||'guest'));return saved?{...base,...JSON.parse(saved)}:base}catch{return base}}),[rows,setRows]=useState([]),[busy,setBusy]=useState(false),[msg,setMsg]=useState(''),[err,setErr]=useState(''),[files,setFiles]=useState([]),[selected,setSelected]=useState(null),[messages,setMessages]=useState([]),[chat,setChat]=useState(''),[chatBusy,setChatBusy]=useState(false);const formRef=useRef(null);
 useEffect(()=>{const key='nexora-service-draft:'+String(me?.user?.id||'guest');const timer=setTimeout(()=>{try{const draft={serviceType:form.serviceType,title:form.title,description:form.description,budget:form.budget,whatsapp:form.whatsapp,email:form.email};if(!String(draft.title||'').trim()&&!String(draft.description||'').trim()&&!String(draft.budget||'').trim()){localStorage.removeItem(key);return}localStorage.setItem(key,JSON.stringify(draft))}catch{}},180);return()=>clearTimeout(timer)},[form,me?.user?.id]);
 const load=async()=>{try{const data=await api('/service-requests');setRows(data);let target=null;try{target=sessionStorage.getItem('nexora-open-service-request')}catch{};if(target){const found=data.find(x=>String(x.id)===String(target));if(found){try{sessionStorage.removeItem('nexora-open-service-request')}catch{};openProject(found)}}}catch(e){setErr(e.message)}}; useEffect(()=>{load()},[]); useEffect(()=>{
  const onRealtime=async()=>{
    try{
      const data=await api('/service-requests');
      setRows(data);
      if(selected?.id){
        const fresh=data.find(x=>String(x.id)===String(selected.id));
        if(fresh)setSelected(fresh);
        const chatRows=await api(`/service-requests/${selected.id}/messages`);
        setMessages(chatRows);
      }
    }catch{}
  };
  window.addEventListener("nexora-realtime",onRealtime);
  return()=>window.removeEventListener("nexora-realtime",onRealtime);
 },[selected?.id]);

 const chooseService=(label)=>{const type=serviceMap[label]||'OTHER';setForm(x=>({...x,serviceType:type}));setMsg('');setErr('');requestAnimationFrame(()=>formRef.current?.scrollIntoView({behavior:'smooth',block:'start'}));setTimeout(()=>formRef.current?.querySelector('input[name="project-title"]')?.focus(),450)};
 const readFile=(file)=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve({name:file.name,type:file.type,data:String(r.result||'')});r.onerror=reject;r.readAsDataURL(file)});
 const submit=async e=>{e.preventDefault();setBusy(true);setMsg('');setErr('');try{const attachments=await Promise.all(files.slice(0,6).map(readFile));await api('/service-requests',{method:'POST',body:JSON.stringify({...form,budget:form.budget===''?'':Math.round(localToBase(form.budget)),attachments})});setMsg('Your request has been sent to NEXORA and is now awaiting review. We will contact you through WhatsApp or email. If the response is delayed, please contact NEXORA Support.');setForm(x=>({...x,title:'',description:'',budget:''}));try{localStorage.removeItem('nexora-service-draft:'+String(me?.user?.id||'guest'))}catch{};setFiles([]);await load()}catch(e){setErr(e.message)}finally{setBusy(false)}};
 const openProject=async x=>{setSelected(x);try{setMessages(await api(`/service-requests/${x.id}/messages`))}catch{setMessages([])}};
 const sendMessage=async()=>{if(!selected||!chat.trim())return;setChatBusy(true);try{const m=await api(`/service-requests/${selected.id}/messages`,{method:'POST',body:JSON.stringify({message:chat})});setMessages(x=>[...x,m]);setChat('')}catch(e){setErr(e.message)}finally{setChatBusy(false)}};
 const statusSteps=[['SUBMITTED','Submitted'],['RECEIVED','Received & Processing'],['INFO_REQUIRED','Information / Feedback'],['QUOTED','Quotation'],['IN_PROGRESS','In Progress'],['COMPLETED','Completed'],['PAID','Paid']]; const rank=x=>({SUBMITTED:0,RECEIVED:1,INFO_REQUIRED:2,QUOTED:3,IN_PROGRESS:4,COMPLETED:5,PAID:6})[x]??0;
 return <section><div className="serviceshero"><div><span className="pill">NEXORA SERVICES</span><h1>Build your next digital idea.</h1><p className="muted serviceslead">Websites, mobile apps, e-commerce, custom software, automation, design, integrations and ongoing digital support — tell NEXORA what you need and we’ll guide the next step.</p><p className="muted small">Your request details are saved as a draft on this device while you type. Attachments are not saved as drafts; add them again before submitting.</p><div className="servicechips"><span>Websites</span><span>Mobile apps</span><span>Web apps</span><span>E-commerce</span><span>AI & automation</span><span>Design</span><span>Integrations</span><span>Support</span></div></div><div className="servicesheroart"><div className="orbitlogo"><img src="/nexora-logo.png"/></div><span>IDEA → DESIGN → BUILD → LAUNCH</span></div></div>
 <section className="panel balloon-ventures-card" style={{margin:"22px 0",padding:"clamp(18px,3vw,30px)",border:"1px solid rgba(20,155,110,.28)",background:"linear-gradient(135deg,rgba(13,111,82,.12),rgba(20,155,110,.04) 55%,rgba(255,255,255,.015))",borderRadius:22}}>
  <div style={{display:"flex",flexWrap:"wrap",gap:24,alignItems:"flex-start",justifyContent:"space-between"}}>
   <div style={{flex:"1 1 340px",minWidth:0}}>
    <span className="pill">SME GROWTH FUNDING · KENYA</span>
    <h2 style={{fontSize:"clamp(25px,3vw,36px)",lineHeight:1.12,margin:"12px 0 8px"}}>Balloon Ventures</h2>
    <p style={{fontSize:16,fontWeight:650,margin:"0 0 10px"}}>Every SME that Can Grow should Grow</p>
    <p className="muted" style={{maxWidth:720,margin:"0 0 18px"}}>An impact-focused SME lender combining growth finance with practical business support to help established businesses expand, strengthen operations and create quality jobs across East Africa.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(135px,1fr))",gap:10,marginBottom:18}}>
     <div style={{padding:14,borderRadius:14,background:"rgba(128,128,128,.09)"}}><small className="muted">Indicative loan size</small><div style={{fontWeight:750,fontSize:18}}>KSh 750K–20M</div><small className="muted">Enquire from KSh 1M+</small></div>
     <div style={{padding:14,borderRadius:14,background:"rgba(128,128,128,.09)"}}><small className="muted">Repayment period</small><div style={{fontWeight:750,fontSize:18}}>12–36 months</div><small className="muted">Based on assessment</small></div>
     <div style={{padding:14,borderRadius:14,background:"rgba(128,128,128,.09)"}}><small className="muted">Published rate</small><div style={{fontWeight:750,fontSize:18}}>12–14% p.a.</div><small className="muted">Confirm current offer</small></div>
    </div>
    <h3 style={{margin:"0 0 8px"}}>What the opportunity may include</h3>
    <ul style={{paddingLeft:20,margin:"0 0 18px",display:"grid",gap:7}}>
     <li>Working-capital and asset-financing support for growing businesses.</li>
     <li>Up to six months of tailored, face-to-face business support.</li>
     <li>Repayments structured with the business cash flow in mind.</li>
     <li>Possible follow-on funding after repaying part of an initial loan, subject to eligibility.</li>
     <li>Collateral may include real estate, equipment or other business assets, depending on the application.</li>
    </ul>
    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:14}}>
     <a className="primary" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,textDecoration:"none"}} href="https://wa.me/254703265774?text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20Balloon%20Ventures%20SME%20growth%20funding%20through%20NEXORA." target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp to enquire</a>
     <a className="secondary" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,textDecoration:"none"}} href="tel:+254703265774"><PhoneCall size={17}/> Call +254 703 265 774</a>
     <a className="secondary" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,textDecoration:"none"}} href="https://balloonventures.com/kenya/" target="_blank" rel="noreferrer"><ExternalLink size={16}/> Official Kenya details</a>
    </div>
    <p className="muted small" style={{margin:0}}>Eligibility note: Balloon Ventures’ published Kenya criteria say a business should be registered and operating for at least one year in a secondary town or city. All applications, due diligence, rates, collateral requirements and approval decisions are handled by Balloon Ventures.</p>
   </div>
   <div style={{flex:"0 1 250px",minWidth:220,padding:18,borderRadius:18,background:"rgba(128,128,128,.08)"}}>
    <div style={{fontSize:12,letterSpacing:1.2,fontWeight:750,opacity:.8,marginBottom:8}}>BALLOON VENTURES</div>
    <div style={{fontSize:22,fontWeight:800,lineHeight:1.15,marginBottom:12}}>Grow the business. Strengthen the team. Create good jobs.</div>
    <p className="muted small">Designed for established small and growing businesses with a clear growth plan—not personal consumer borrowing.</p>
    <a href="https://balloonventures.com/" target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,fontWeight:700,textDecoration:"none"}}>Learn more on their website <ArrowRight size={15}/></a>
   </div>
  </div>
  <div className="notice" style={{marginTop:18}}><ShieldCheck size={16}/><span><b>Important:</b> This is an information and enquiry listing, not a loan offer or a guarantee of approval. Balloon Ventures’ Kenya website currently lists KSh 750,000–20 million and 12–14% annual interest; terms can change, so confirm the exact offer directly before committing. NEXORA is not presenting itself as the lender.</span></div>
 </section>
 <div className="serviceintro"><div><span className="pill">WHAT WE CAN BUILD</span><h2>Choose a starting point</h2><p className="muted">You don’t need to know the technical solution. Tell us the outcome you want and NEXORA can help shape the project.</p></div></div>
 <div className="servicefeaturegrid">{[['Website',Store,'Business sites, landing pages & portfolios'],['Mobile app',CreditCard,'Android, iOS & cross-platform apps'],['Web app',Activity,'Dashboards, portals & SaaS systems'],['E-commerce',ShoppingCart,'Online stores, catalogues & checkout'],['Automation',Sparkles,'Business workflows, AI & automation'],['API integration',Link2,'Payments, WhatsApp & third-party systems']].map(([x,I,desc])=><button type="button" className={`servicefeature ${form.serviceType===serviceMap[x]?'selected':''}`} key={x} onClick={()=>chooseService(x)}><I size={20}/><span><b>{x}</b><small>{desc}</small></span><ArrowRight size={15}/></button>)}</div>
 <div className="serviceextra"><div><b>Also available</b><span>UI/UX · Branding · Maintenance · Hosting & domains · Custom software</span></div><button className="secondary" type="button" onClick={()=>chooseService('Other')}>Tell us something else <ArrowRight size={15}/></button></div>
 <div className="servicequicksteps"><div><b>1</b><span>Choose a service</span></div><div><b>2</b><span>Send your idea & references</span></div><div><b>3</b><span>We review, discuss & quote</span></div><div><b>4</b><span>Build, review & launch</span></div></div>
 {msg&&<div className="service-success"><CheckCircle2 size={21}/><div><b>Request submitted successfully</b><p>{msg}</p></div><button className="secondary" type="button" onClick={()=>formRef.current?.scrollIntoView({behavior:'smooth',block:'start'})}>Submit another</button></div>}{err&&<div className="error">{err}</div>}
 <div className="servicegrid"><form ref={formRef} className="panel formpanel serviceform" onSubmit={submit}><div className="paneltitle"><div><span className="pill">START A PROJECT</span><h3>Tell us what you want built</h3><p className="muted small">Your selected service is already chosen. Screenshots, logos, documents and reference files can help us understand your idea faster.</p></div><Wrench size={20}/></div><label className="fieldlabel">Service<select value={form.serviceType} onChange={e=>setForm({...form,serviceType:e.target.value})}>{types.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><label className="fieldlabel">Project title<input name="project-title" required maxLength="180" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. E-commerce website for my clothing business"/></label><label className="fieldlabel">What should it do?<textarea required rows="7" maxLength="6000" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the problem, features, pages, design ideas, target users, payments, integrations and anything else that matters."/></label><label className="fieldlabel">Estimated budget <span className="muted small">optional</span><input type="number" min="0" step="1" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})} placeholder={`Budget (${currencyState().currency.code})`}/></label><label className="fieldlabel">Reference files <span className="muted small">optional · up to 6 small files</span><input type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" onChange={e=>setFiles(Array.from(e.target.files||[]).slice(0,6))}/></label>{files.length>0&&<div className="filelist">{files.map(f=><span key={f.name}><FileImage size={13}/>{f.name}</span>)}</div>}<div className="servicecontactgrid"><label className="fieldlabel">WhatsApp number<input required inputMode="tel" value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} placeholder="WhatsApp number"/></label><label className="fieldlabel">Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label></div><div className="notice"><MessageCircle size={15}/> We’ll use your WhatsApp and email for scope, quotation, project updates and delivery.</div><button className="primary full" disabled={busy}>{busy?'Submitting request…':'Submit project request'}</button></form>
 <div className="panel"><div className="paneltitle"><div><span className="pill">MY PROJECTS</span><h3>Requests & projects</h3></div><button type="button" className="secondary narrow" onClick={load}>Refresh</button></div>{rows.length?rows.map(x=><button type="button" className={`servicerequestrow ${selected?.id===x.id?'selected':''}`} key={x.id} onClick={()=>openProject(x)}><div><b>{x.title}</b><small>{x.serviceType.replaceAll('_',' ')} · {new Date(x.createdAt).toLocaleDateString()}</small><small>{x.milestone||'Requirements'}</small></div><div className="servicestatus"><em className={`adminstatus ${String(x.status).toLowerCase()}`}>{x.status.replaceAll('_',' ')}</em>{x.quoteStatus==='SENT'&&<span className="paidchip">Quotation</span>}{x.isPaid&&<span className="paidchip">✓ Paid</span>}</div></button>):<div className="smartempty"><Wrench size={28}/><p className="muted">No requests yet.</p><button type="button" className="secondary" onClick={()=>formRef.current?.scrollIntoView({behavior:'smooth',block:'start'})}>Start a request</button></div>}<div className="notice"><ShieldCheck size={15}/> NEXORA can confirm scope, quotation, milestones, revisions and payment arrangements before work starts.</div></div></div>
 {selected&&<div className="projectdetail panel"><div className="paneltitle"><div><span className="pill">PROJECT {selected.id.slice(0,8).toUpperCase()}</span><h3>{selected.title}</h3><p className="muted small">{selected.serviceType.replaceAll('_',' ')} · {selected.milestone}</p></div><button className="iconbtn" onClick={()=>setSelected(null)}><X size={18}/></button></div><div className="projecttimeline">{statusSteps.map(([st,label],i)=>{const active=rank(selected.status)>=i;return <div className={active?'done':''} key={st}><span>{active?'✓':i+1}</span><small>{label}</small></div>})}</div>{selected.quoteStatus==='SENT'&&<div className="quoteCard"><div><span className="pill">QUOTATION</span><h4>{money(selected.quoteAmount)}</h4><p>{selected.quoteNote||'Quotation prepared by NEXORA.'}</p></div><div className="rowactions"><button className="primary" onClick={async()=>{const x=await api(`/service-requests/${selected.id}/quote`,{method:'POST',body:JSON.stringify({accept:true})});setSelected(x);await load()}}>Accept quotation</button><button className="secondary" onClick={async()=>{const x=await api(`/service-requests/${selected.id}/quote`,{method:'POST',body:JSON.stringify({accept:false})});setSelected(x);await load()}}>Request changes</button></div></div>}{selected.status==='COMPLETED'&&!selected.clientApproved&&!selected.isPaid&&<div className="quoteCard"><div><span className="pill">READY FOR REVIEW</span><p>Please review the delivered work. Approve completion when everything is acceptable, or request a revision.</p></div><div className="rowactions"><button className="primary" onClick={async()=>{const x=await api(`/service-requests/${selected.id}/approve`,{method:'POST'});setSelected(x);await load()}}>Approve completion</button><button className="secondary" onClick={async()=>{const x=await api(`/service-requests/${selected.id}/revision`,{method:'POST',body:JSON.stringify({message:'Client requested a revision from the project page.'})});setSelected(x);await load()}}>Request revision</button></div></div>}<div className="projectchat"><div className="paneltitle"><div><span className="pill">PROJECT CHAT</span><h4>Conversation with NEXORA</h4></div></div><div className="chatlog">{messages.length?messages.map(m=><div className={`chatmsg ${m.senderRole==='USER'?'mine':''}`} key={m.id}><small>{m.senderName||m.senderRole} · {new Date(m.createdAt).toLocaleString()}</small><p>{m.message}</p></div>):<p className="muted">No messages yet.</p>}</div><div className="chatcomposer user-chatcomposer"><textarea rows="4" value={chat} onChange={e=>setChat(e.target.value)} placeholder="Write your message to the NEXORA team…" onKeyDown={e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();sendMessage()}}}/><div className="chatcomposer-actions"><small className="muted">Ctrl + Enter to send</small><button className="primary user-chat-send" disabled={chatBusy||!chat.trim()} onClick={sendMessage}><SendHorizontal size={16}/>{chatBusy?'Sending…':'Send message'}</button></div></div></div></div>}
 </section>
}

function openNexoraNotification(n,goPage){
 if(!n||!goPage)return;
 const type=String(n.type||"ACCOUNT").toUpperCase();
 const details=n.details||{};
 let page="notifications";
 if(type==="SERVICE"||type==="PROJECT_REQUEST"||type==="PROJECT_CHAT"){page="services";if(details.requestId){try{sessionStorage.setItem("nexora-open-service-request",String(details.requestId))}catch{}}}
 else if(type==="PAYMENT") page="transactions";
 else if(type==="WALLET") page=details.reference?"wallet":"transfer";
 else if(type==="WITHDRAWAL") page="wallet";
 else if(type==="MEMBERSHIP") page="referrals";
 else if(type==="SUPPORT") page="support";
 else if(type==="MARKETPLACE") page="marketplace";
 else if(type==="ACCOUNT") page=details.status?"security":"notifications";
 goPage(page);
}

function Notifications({me,analytics,tickets,notifications=[]}){
 const notes=[];
 const openNexoraNotificationForPage=(n)=>openNexoraNotification(n,(page)=>{window.dispatchEvent(new CustomEvent("nexora-go-page",{detail:{page}}));});
 notifications.forEach(n=>notes.push([Bell,n.title,n.message,n.createdAt,n.read]));
 return <div className="panel notificationpanel"><div className="paneltitle"><h3><Bell size={17}/> Notifications</h3><span>{notifications.filter(x=>!x.read).length} unread</span></div><div className="notificationlist">{notes.slice(0,12).map(([I,t,d,date,read],i)=>{const n=notifications.find(x=>x.title===t&&x.message===d&&x.createdAt===date);return <button type="button" className={`notification notificationbutton ${read===false?"unread":""}`} key={i} onClick={async()=>{if(n?.id){try{await api(`/notifications/${n.id}/read`,{method:"POST"});window.dispatchEvent(new CustomEvent("nexora-notification-read",{detail:{id:String(n.id)}}))}catch{}};openNexoraNotificationForPage(n||({type:t.includes("plan")||t.includes("challenge")?"MEMBERSHIP":t.includes("Support")?"SUPPORT":t.includes("Payment")?"PAYMENT":"ACCOUNT",details:{}}))}}><I size={17}/><div><b>{t}</b><p>{d}</p><small>{date?new Date(date).toLocaleString():"Account update"}</small></div><ArrowUpRight size={14}/></button>})}{!notes.length&&<p className="muted">You're all caught up.</p>}</div><div className="rowactions"><button className="secondary" onClick={()=>api("/notifications/read-all",{method:"POST"}).then(()=>window.dispatchEvent(new CustomEvent("nexora-notifications-read-all"))).catch(()=>{})}>Mark all as read</button></div></div>}


function OnboardingChecklist({me,goPackages,goPage}){
 const uid=me?.user?.id||"guest";
 const storageKey=checklistKey(uid);
 const defaults={profile:Boolean(me?.user?.phone&&me?.user?.name),plan:Boolean(me?.package),marketplace:false,shared:false,ads:false};
 const [done,setDone]=useState(()=>{
  try{return {...defaults,...JSON.parse(localStorage.getItem(storageKey)||"{}")};}catch{return defaults;}
 });
 useEffect(()=>{
  setDone(d=>({...d,profile:Boolean(me?.user?.phone&&me?.user?.name),plan:Boolean(me?.package)}));
 },[me?.package,me?.user?.phone,me?.user?.name]);
 useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(done));}catch{}},[done,storageKey]);
 const mark=(id)=>setDone(x=>({...x,[id]:true}));
 const items=[
  {id:"profile",label:"Complete your profile",hint:"Name, phone & email",ok:done.profile,action:()=>goPage&&goPage("security")},
  {id:"plan",label:"Activate a membership plan",hint:"Unlocks referral tools",ok:done.plan,action:goPackages},
  {id:"marketplace",label:"Open Marketplace",hint:"Browse or list a product",ok:done.marketplace,action:()=>{mark("marketplace");goPage&&goPage("marketplace");}},
  {id:"shared",label:"Share your referral link",hint:"After a plan is active",ok:done.shared,action:()=>{if(!me?.package){goPackages&&goPackages();return;}mark("shared");goPage&&goPage("marketing");}},
  {id:"ads",label:"Explore Advertise",hint:"Premium campaigns",ok:done.ads,action:()=>{mark("ads");goPage&&goPage("products");}}
 ];
 const completed=items.filter(x=>x.ok).length;
 if(completed>=items.length) return null;
 return <div className="panel onboardingpanel">
  <div className="paneltitle"><div><span className="pill">GET STARTED</span><h3><Sparkles size={17}/> Your first 10 minutes</h3><p className="muted small">{completed} of {items.length} complete</p></div><span className="checkcount">{completed}/{items.length}</span></div>
  <div className="progress"><i style={{width:`${(completed/items.length)*100}%`}}/></div>
  <div className="checklist">
   {items.map(x=>(
    <button type="button" key={x.id} className={`checkitem ${x.ok?"done":""}`} onClick={x.action}>
     <span className="checkicon">{x.ok?<CheckCircle2 size={18}/>:<span className="checkempty"/>}</span>
     <span className="checkcopy"><b>{x.label}</b><small>{x.hint}</small></span>
     {!x.ok&&<ArrowUpRight size={15}/>}
    </button>
   ))}
  </div>
 </div>;
}

function PendingPaymentBanner({transactions,goPage}){
  const pending=(transactions||[]).filter(x=>String(x.status||"").toUpperCase()==="PENDING");
  if(!pending.length) return null;
  const first=pending[0];
  return <div className="pendingbanner" role="status">
    <Clock3 size={18}/>
    <div><b>Payment awaiting confirmation</b><span>{pending.length>1?`${pending.length} pending payments`:`Ref ${first.reference||"—"}`} · Check status in Transactions.</span></div>
    <button type="button" className="secondary narrow" onClick={()=>goPage("transactions")}>Check status</button>
  </div>;
}
function SoftPlanReminder({me,goPackages}){
  const [hide,setHide]=useState(()=>sessionStorage.getItem("nexora-plan-nudge")==="1");
  if(me?.package || hide) return null;
  return <div className="plannudge">
    <PackageIcon size={18}/>
    <div><b>Activate a plan to unlock earning tools</b><span>Referral link and Premium advertising start with a membership plan.</span></div>
    <button type="button" className="primary narrow" onClick={goPackages}>View plans</button>
    <button type="button" className="iconbtn" aria-label="Dismiss" onClick={()=>{sessionStorage.setItem("nexora-plan-nudge","1");setHide(true)}}><X size={16}/></button>
  </div>;
}

function RecommendedMarketplace({goPage}){
 const [items,setItems]=useState([]),[loading,setLoading]=useState(true);
 useEffect(()=>{let alive=true;(async()=>{try{const rows=await api('/marketplace/products?category=All&location=');if(alive)setItems((rows||[]).filter(x=>x.status==='ACTIVE').slice(0,6));}catch{}finally{if(alive)setLoading(false)}})();return()=>{alive=false}},[]);
 if(loading)return <div className="panel marketplacepreview"><div className="paneltitle"><h3>Latest on NEXORA Marketplace</h3></div><p className="muted">Loading products…</p></div>;
 return <div className="panel marketplacepreview"><div className="paneltitle"><div><span className="pill">MARKETPLACE</span><h3>Latest products</h3><p className="muted small">Discover what NEXORA members are selling today.</p></div><button className="secondary" onClick={()=>goPage('marketplace')}>View all <ArrowUpRight size={14}/></button></div>{items.length?<div className="dashboardproductgrid">{items.map(p=><button className="dashboardproduct" key={p.id} onClick={()=>goPage('marketplace')}><div className="dashboardproductimage">{p.images?.[0]?<img src={p.images[0]} alt=""/>:<Store size={26}/>}</div><div className="dashboardproductinfo"><b>{p.title}</b><strong>{money(p.price)}</strong><span>{p.location||'Kenya'} · {p.category}</span></div></button>)}</div>:<div className="dashboardempty"><Store size={32}/><div><b>No marketplace products yet</b><p className="muted small">Be among the first members to list a product.</p></div><button type="button" className="primary" onClick={()=>goPage('marketplace')}>Open marketplace</button></div>}</div>
}

function SellerDashboard({me,mine,orders,goSell}){
 const [bio,setBio]=useState(me?.user?.sellerBio||""),[savingBio,setSavingBio]=useState(false),[bioMsg,setBioMsg]=useState("");
 const saveBio=async()=>{setSavingBio(true);setBioMsg("");try{await api('/marketplace/seller/profile',{method:'POST',body:JSON.stringify({sellerBio:bio})});setBioMsg('Seller profile saved.')}catch(e){setBioMsg(e.message)}finally{setSavingBio(false)}};
 const sales=orders.selling||[]; const active=mine.filter(x=>x.status==='ACTIVE').length; const revenue=sales.filter(x=>x.paymentStatus==='SUCCESS'||x.status==='DELIVERED').reduce((a,x)=>a+Number(x.total||0),0); const pending=sales.filter(x=>!['DELIVERED','CANCELLED'].includes(x.status)).length; const low=mine.filter(x=>Number(x.stock||0)<=3).length;
 return <div className="sellerdash"><div className="sellerstatgrid"><div><span>Active listings</span><strong>{active}</strong></div><div><span>Orders to action</span><strong>{pending}</strong></div><div><span>Sales value</span><strong>{money(revenue)}</strong></div><div><span>Low stock</span><strong>{low}</strong></div></div><div className="sellerdashgrid"><div className="panel"><div className="paneltitle"><h3>Seller profile</h3>{me?.user?.sellerVerified&&<span className="verifiedseller"><CheckCircle2 size={13}/> Verified</span>}</div><textarea rows="4" maxLength="1200" value={bio} onChange={e=>setBio(e.target.value)} placeholder="Tell buyers about your business, products, service area, delivery options or experience."/><div className="rowactions"><button className="primary" onClick={saveBio} disabled={savingBio}>{savingBio?"Saving…":"Save profile"}</button>{bioMsg&&<span className="muted small">{bioMsg}</span>}</div></div><div className="panel"><div className="paneltitle"><h3>Seller actions</h3></div><div className="selleractiongrid"><button className="secondary" onClick={goSell}><Plus size={15}/> Add product</button><button className="secondary" onClick={()=>document.querySelector('[data-market-orders]')?.scrollIntoView({behavior:'smooth'})}><Truck size={15}/> Manage orders</button></div></div><div className="panel"><div className="paneltitle"><h3>Listing health</h3></div>{mine.slice(0,5).map(p=><div className="sellerhealth" key={p.id}><div><b>{p.title}</b><small>{p.stock} in stock · {p.status}</small></div><span className={Number(p.stock)<=3?'lowstock':''}>{Number(p.stock)<=3?'Restock':'Healthy'}</span></div>)}{!mine.length&&<p className="muted">Create your first listing to start selling.</p>}</div></div></div>
}

function ThemeToggle(){
 const [dark,setDark]=useState(()=>{try{return localStorage.getItem("nexora-theme")!=="light"}catch{return true}});
 useEffect(()=>{document.documentElement.classList.toggle("nexora-light",!dark);try{localStorage.setItem("nexora-theme",dark?"dark":"light")}catch{}},[dark]);
 return <button className="theme-toggle" onClick={()=>setDark(x=>!x)} title={dark?"Switch to light theme":"Switch to dark theme"} aria-label="Toggle theme"><span>{dark?"☀":"☾"}</span><small>{dark?"Light":"Dark"}</small></button>
}
function LoginUpdatesModal({items,onClose}){
 return <div className="modalbackdrop loginupdatesbackdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Recent account updates">
  <div className="modal loginupdates" onClick={e=>e.stopPropagation()}>
   <div className="modalhead"><div><span className="pill">ACCOUNT UPDATES</span><h2>Recent updates to your account</h2><p className="muted">An administrator made these changes while you were away.</p></div><button className="iconbtn" onClick={onClose} aria-label="Close"><X size={20}/></button></div>
   <div className="loginupdateslist">{items.map((n,i)=><div className="loginupdate" key={n.id||i}><span className="loginupdateicon"><Bell size={17}/></span><div><b>{n.title}</b><p>{n.message}</p><small>{new Date(n.createdAt).toLocaleString()}</small></div></div>)}</div>
   <div className="modalfoot"><button className="secondary" onClick={onClose}>Close</button><button className="primary" onClick={()=>{onClose();window.dispatchEvent(new CustomEvent("nexora-open-notifications"))}}><Bell size={15}/> View notifications</button></div>
  </div>
 </div>
}

function ActivityCenter({me,tickets,goPage,notifications=[]}){
 const [open,setOpen]=useState(false);
 useEffect(()=>{const fn=()=>setOpen(true);window.addEventListener("nexora-open-notifications",fn);return()=>window.removeEventListener("nexora-open-notifications",fn)},[]);
 const items=[];
 notifications.slice(0,3).forEach(n=>items.push({icon:Bell,title:n.title,text:n.message,page:"notifications",notification:true,id:n.id,data:n}));
 if((me.transactions||[]).some(x=>String(x.status).toUpperCase()==="PENDING"))items.push({icon:Clock3,title:"Payment needs attention",text:"You have a pending transaction.",page:"transactions"});
 if((tickets||[]).some(x=>x.status!=="CLOSED"))items.push({icon:LifeBuoy,title:"Support request open",text:"Check your support requests for updates.",page:"support"});
 if(!me.package)items.push({icon:PackageIcon,title:"Choose a membership plan",text:"Review plans when you're ready.",page:"referrals"});
 if(!items.length)items.push({icon:CheckCheck,title:"You're all caught up",text:"No urgent account activity right now."});
 return <div className="activity-center"><button className="header-icon-btn" onClick={()=>setOpen(x=>!x)} aria-label="Open activity center"><Bell size={18}/>{items.length>0&&<span>{Math.min(items.length,9)}</span>}</button>{open&&<><button className="popover-backdrop" onClick={()=>setOpen(false)} aria-label="Close activity center"/><div className="activity-popover"><div className="popover-head"><div><span className="pill">ACTIVITY CENTER</span><h3>What's happening</h3></div><button className="iconbtn" onClick={()=>setOpen(false)}><X size={16}/></button></div>{items.map((x,i)=>{const I=x.icon;return <button className="activity-popover-row" key={i} onClick={async()=>{setOpen(false);if(x.notification){if(x.id){try{await api(`/notifications/${x.id}/read`,{method:"POST"});window.dispatchEvent(new CustomEvent("nexora-notification-read",{detail:{id:String(x.id)}}))}catch{}};openNexoraNotification(x.data,goPage)}else{x.page&&goPage(x.page)}}}><span><I size={16}/></span><div><b>{x.title}</b><small>{x.text}</small></div><ArrowUpRight size={14}/></button>})}<button className="secondary wide" onClick={()=>{setOpen(false);goPage("notifications")}}>Open notifications</button></div></>}</div>
}
function CommandCenter({goPage,goPackages,share,goSecurity,onDeposit}){
 const [open,setOpen]=useState(false);
 const actions=[
  ["Deposit",WalletCards,()=>onDeposit(),"mint"],["Earn",TrendingUp,()=>goPage("referrals"),"gold"],["Marketplace",Store,()=>goPage("marketplace"),"blue"],["Sell",Plus,()=>goPage("marketplace"),"purple"],["Wallet",CreditCard,()=>goPage("wallet"),"teal"],["Send money",SendHorizontal,()=>goPage("transfer"),"mint"],["Get a website/app",Wrench,()=>goPage("services"),"purple"],["NEXORA Connect",Wifi,()=>goPage("connect"),"blue"],["Invite",Share2,()=>share(),"rose"],["Academy",GraduationCap,()=>goPage("academy"),"indigo"],["Profile",UserCog,()=>goSecurity(),"slate"]
 ];
 return <div className={`command-center ${open?"open":""}`}><button className="command-main" onClick={()=>setOpen(x=>!x)} aria-label="Open quick actions"><Plus size={21}/><span>Quick</span></button>{open&&<div className="command-menu">{actions.map(([label,I,action,tone])=><button key={label} className={`command-item ${tone}`} onClick={()=>{setOpen(false);action()}}><span><I size={16}/></span><b>{label}</b></button>)}</div>}</div>
}
function GamificationPanel({me,analytics,goPage,profileStrength}){
 const direct=Number(me.stats?.direct||0), monthly=Number(analytics?.month?.directReferrals||0);
 const milestones=[{label:"Complete profile",value:profileStrength>=100,action:()=>goPage("security")},{label:"Reach 5 monthly referrals",value:monthly>=5,action:()=>goPage("referrals")},{label:"Explore Marketplace",value:localStorage.getItem("nexora-milestone-market")==="1",action:()=>goPage("marketplace")},{label:"Build your network",value:direct>=3,action:()=>goPage("referrals")}];
 const done=milestones.filter(x=>x.value).length; const pct=Math.round(done/milestones.length*100);
 return <div className="panel gamification"><div className="paneltitle"><div><span className="pill">MEMBER MILESTONES</span><h3><Trophy size={17}/> Your progress</h3></div><strong>{done}/{milestones.length}</strong></div><div className="levelrow"><div className="levelbadge"><Crown size={18}/></div><div><b>{done>=4?"NEXORA Champion":done>=2?"NEXORA Builder":"NEXORA Starter"}</b><small>Complete useful actions to unlock milestones.</small></div><span>{pct}%</span></div><div className="progress"><i style={{width:`${pct}%`}}/></div><div className="milestonerow">{milestones.map((m,i)=><button key={i} className={`milestone ${m.value?"done":""}`} onClick={m.action}><span>{m.value?<CheckCircle2 size={15}/>:<Target size={15}/>}</span><b>{m.label}</b><ArrowUpRight size={12}/></button>)}</div></div>
}
function GettingStartedChecklist({me,goPage,profileStrength=0}){
 const [completed,setCompleted]=useState(()=>{try{return JSON.parse(localStorage.getItem("nexora-getting-started")||"{}")}catch{return {}}});
 const [expanded,setExpanded]=useState(()=>{try{return localStorage.getItem("nexora-getting-started-expanded")==="1"}catch{return false}});
 const items=[
  {id:"profile",title:"Complete your profile",detail:"Keep your contact and account details up to date.",page:"security",auto:Number(profileStrength)>=100},
  {id:"marketplace",title:"Explore the marketplace",detail:"Discover products and learn how sellers list items.",page:"marketplace",auto:localStorage.getItem("nexora-milestone-market")==="1"},
  {id:"wallet",title:"Review your wallet",detail:"Understand your available balance and transaction records.",page:"wallet",auto:false},
  {id:"academy",title:"Start a lesson",detail:"Learn the main NEXORA features in the Academy.",page:"academy",auto:false},
  {id:"plan",title:"Review membership and earning rules",detail:"Check the current plan benefits before choosing a plan.",page:"referrals",auto:Boolean(me?.package)}
 ];
 const doneCount=items.filter(x=>x.auto||completed[x.id]).length;
 const toggle=id=>{setCompleted(old=>{const next={...old,[id]:!old[id]};try{localStorage.setItem("nexora-getting-started",JSON.stringify(next))}catch{}return next})};
 const toggleExpanded=()=>setExpanded(old=>{const next=!old;try{localStorage.setItem("nexora-getting-started-expanded",next?"1":"0")}catch{}return next});
 return <section className={`panel nx-onboarding ${expanded?"is-expanded":"is-collapsed"}`} aria-label="Getting started checklist">
  <button type="button" className="nx-onboarding-toggle" onClick={toggleExpanded} aria-expanded={expanded} aria-controls="nx-onboarding-details">
   <span className="nx-onboarding-toggle-icon"><CheckCircle2 size={18}/></span>
   <span className="nx-onboarding-toggle-copy"><b>Getting started</b><small>{doneCount} of {items.length} steps completed</small></span>
   <span className="nx-onboarding-mini-track"><i style={{width:(doneCount/items.length*100)+"%"}}/></span>
   <span className="nx-onboarding-toggle-count">{doneCount}/{items.length}</span>
   <ChevronDown className={expanded?"is-rotated":""} size={18}/>
  </button>
  {expanded&&<div className="nx-onboarding-details" id="nx-onboarding-details">
   <div className="nx-onboarding-head"><div><span className="pill">YOUR FIRST STEPS</span><h3>Make the most of NEXORA</h3><p className="muted small">Choose a step to open the relevant feature. You can collapse this checklist any time.</p></div></div>
   <div className="nx-onboarding-list">{items.map(item=>{const done=item.auto||Boolean(completed[item.id]);return <div className={`nx-onboarding-item ${done?"done":""}`} key={item.id}><span className="nx-onboarding-check">{done?<CheckCircle2 size={17}/>:<span/>}</span><div className="nx-onboarding-copy"><b>{item.title}</b><small>{item.detail}</small></div><button type="button" className="secondary narrow" onClick={()=>goPage(item.page)}>Open</button>{!item.auto&&<button type="button" className={`nx-onboarding-mark ${done?"marked":""}`} onClick={()=>toggle(item.id)} aria-label={done?"Mark task incomplete":"Mark task complete"} title={done?"Mark incomplete":"Mark complete"}>{done?<Check size={15}/>:<span/>}</button>}</div>})}</div>
   <div className="nx-onboarding-foot"><span className="muted small">Your checklist is saved on this device.</span><button type="button" className="secondary narrow" onClick={()=>goPage("activity")}><Activity size={14}/> Activity Centre</button></div>
  </div>}
 </section>
}

function SmartGuide({me,referrals,profileStrength,goPage,goPackages}){
 const [completed,setCompleted]=useState(()=>{try{return JSON.parse(localStorage.getItem("nexora-academy-completed")||"{}")}catch{return {}}});
 useEffect(()=>{const sync=()=>{try{setCompleted(JSON.parse(localStorage.getItem("nexora-academy-completed")||"{}"))}catch{setCompleted({})}};window.addEventListener("nexora-academy-progress",sync);return()=>window.removeEventListener("nexora-academy-progress",sync)},[]);
 const lessonCount=Object.keys(completed).length;
 const profileComplete=Boolean(me?.user?.name&&me?.user?.email&&me?.user?.phone&&me?.user?.referralCode);
 const pending=(me?.transactions||[]).filter(x=>String(x.status||"").toUpperCase()==="PENDING").length;
 const directCount=Array.isArray(referrals?.direct)?referrals.direct.length:0;
 const next=pending?{title:"Check a pending transaction",detail:"Confirm the latest status before retrying a payment.",action:"Open transactions",icon:ReceiptText,run:()=>goPage("transactions")}:!profileComplete?{title:"Finish your account profile",detail:"A complete profile helps keep account details accurate.",action:"Complete profile",icon:UserCog,run:()=>goPage("security")}:lessonCount<3?{title:"Build your NEXORA skills",detail:`Complete ${3-lessonCount} more Academy lesson${3-lessonCount===1?"":"s"} to strengthen your platform knowledge.`,action:"Continue learning",icon:GraduationCap,run:()=>goPage("academy")}:!me?.package?{title:"Review membership options",detail:"Read plan benefits and eligibility before deciding whether to join a plan.",action:"Review plans",icon:WalletCards,run:()=>goPackages?goPackages():goPage("referrals")}:!localStorage.getItem("nexora-milestone-plan-review")?{title:"Review membership and earning rules",detail:"Check plan eligibility, advertising conditions and payout rules before taking your next step.",action:"Review rules",icon:ShieldCheck,run:()=>goPage("referrals")}:directCount===0?{title:"Explore the marketplace",detail:"Discover products and understand how the buying and selling tools work.",action:"Explore marketplace",icon:Store,run:()=>goPage("marketplace")}:{title:"Review your recorded activity",detail:"Use your transactions and analytics to understand what has actually happened.",action:"Open Activity Centre",icon:Activity,run:()=>goPage("activity")};
 const Icon=next.icon;
 return <section className="panel nx-smart-guide" aria-label="NEXORA Smart Guide"><div className="nx-smart-guide-icon"><Sparkles size={19}/></div><div className="nx-smart-guide-main"><div className="nx-smart-guide-kicker">SMART GUIDE · YOUR NEXT STEP</div><h3>{next.title}</h3><p>{next.detail}</p><div className="nx-smart-guide-meta"><span><Icon size={14}/>{pending?`${pending} pending item${pending===1?"":"s"}`:lessonCount+" Academy lesson"+(lessonCount===1?"":"s")+" completed"}</span><span>{directCount} direct referral{directCount===1?"":"s"} recorded</span></div></div><button type="button" className="primary nx-smart-guide-action" onClick={next.run}>{next.action}<ArrowRight size={15}/></button></section>
}


function NexoraIntelligence({me,referrals={},earnings=[],transactions=[],goPage,profileStrength=0}){
 const [insight,setInsight]=useState(null),[busy,setBusy]=useState(true),[error,setError]=useState("");
 const load=async()=>{try{const d=await api("/member/intelligence");setInsight(d);setError("")}catch(e){setError(e.message||"Some live insights are unavailable.")}finally{setBusy(false)}};
 useEffect(()=>{load();const timer=window.setInterval(load,60000);return()=>window.clearInterval(timer)},[me?.user?.id]);
 const stats=insight?.stats||{},checks=insight?.checks||{};
 const direct=Number(referrals?.direct?.length||0),level2=Number(referrals?.level2?.length||0);
 const commissionTotal=(Array.isArray(earnings)?earnings:[]).reduce((sum,row)=>sum+Number(row.amount||0),0);
 const recordedCount=Array.isArray(earnings)?earnings.length:0;
 const activePlan=Boolean(me?.package&&String(me?.user?.planStatus||"ACTIVE").toUpperCase()==="ACTIVE");
 const missions=[
  {title:"Complete your account profile",detail:"Keep your contact and account details current.",done:Boolean(checks.profileComplete),action:()=>goPage("security"),button:"Review profile"},
  {title:"Review earning rules and membership",detail:"Understand plan eligibility and how approved earnings are recorded.",done:Boolean(checks.activePlan),action:()=>goPage("referrals"),button:activePlan?"Open Earn":"Review plans"},
  {title:"Build your referral network",detail:"Share your referral link responsibly; sign-ups do not guarantee earnings.",done:direct>0,action:()=>goPage("referrals"),button:"Open Earn"},
  {title:"Record your first commission",detail:"Only commissions actually recorded in NEXORA count here.",done:recordedCount>0,action:()=>goPage("referrals"),button:"View earnings"},
  {title:"Publish a marketplace listing",detail:"Create a clear, accurate listing with a real price and location.",done:Number(stats.activeListings||0)>0,action:()=>goPage("marketplace"),button:"Sell a product"},
  {title:"Learn one practical skill",detail:"Explore Academy lessons before promoting products or services.",done:false,action:()=>goPage("academy"),button:"Open Academy"}
 ];
 const completed=missions.filter(x=>x.done).length;
 const opportunities=[
  {title:"Marketplace",text:"Buy and sell products; track orders and use the review/report tools for safer transactions.",icon:Store,action:()=>goPage("marketplace")},
  {title:"Digital services",text:"Explore website, mobile app and other digital project requests.",icon:Wrench,action:()=>goPage("services")},
  {title:"Advertising",text:"Eligible Premium members can submit promotional proof for review under the published rules.",icon:Megaphone,action:()=>goPage("products")},
  {title:"Academy",text:"Build product, promotion and business skills before taking your next step.",icon:GraduationCap,action:()=>goPage("academy")},
  {title:"NEXORA Connect",text:"Explore available Safaricom bundle services and check order status.",icon:Wifi,action:()=>goPage("connect")},
  {title:"SME financing",text:"Review Balloon Ventures information and independently check eligibility with the provider.",icon:HandCoins,action:()=>goPage("balloon")}
 ];
 return <section className="nx-intelligence-page">
  <div className="sectionhead"><div><span className="pill"><Sparkles size={13}/> NEXORA INTELLIGENCE</span><h1>Your smart business centre</h1><p className="muted">Personalised next steps, real recorded earnings, account safety and ways to use the NEXORA ecosystem.</p></div><button type="button" className="secondary" onClick={load}><RefreshCw size={15} className={busy?"spin":""}/> Refresh</button></div>
  {error&&<div className="notice" role="status">{error} Showing any available account data.</div>}
  <div className="nx-intel-metrics">
   <article className="panel nx-intel-metric"><span>Recorded commissions</span><strong>{money(commissionTotal)}</strong><small>{recordedCount} commission record{recordedCount===1?"":"s"} · not a projection</small></article>
   <article className="panel nx-intel-metric"><span>Referral network</span><strong>{direct+level2}</strong><small>{direct} direct · {level2} Level 2</small></article>
   <article className="panel nx-intel-metric"><span>Wallet balance</span><strong>{money(me?.wallet?.balance||0)}</strong><small>See the Wallet page for pending items and transaction references.</small><button type="button" className="secondary narrow" onClick={()=>goPage("wallet")}>Open wallet</button></article>
   <article className="panel nx-intel-metric"><span>Growth missions</span><strong>{completed}/{missions.length}</strong><small>Progress reflects account activity we can verify.</small></article>
  </div>
  <section className="panel nx-intel-section"><div className="nx-intel-sectionhead"><div><span className="pill">EARNING FIRST</span><h2>Your earning growth path</h2><p className="muted">Prioritise the steps that help you understand eligibility and build real activity. NEXORA does not guarantee income.</p></div><button className="primary" type="button" onClick={()=>goPage("referrals")}><TrendingUp size={15}/> Open Earn</button></div>
   <div className="nx-intel-progress"><span style={{width:(completed/missions.length*100)+"%"}}/></div>
   <div className="nx-intel-missions">{missions.map((mission,i)=><article className={"nx-intel-mission "+(mission.done?"is-done":"")} key={mission.title}><span className="nx-intel-mission-number">{mission.done?<CheckCircle2 size={17}/>:i+1}</span><div><b>{mission.title}</b><p>{mission.detail}</p><span className="muted small">{mission.done?"Completed":"Next step"}</span></div><button type="button" className="secondary narrow" onClick={mission.action}>{mission.button}</button></article>)}</div>
   <div className="nx-intel-earn-note"><ShieldCheck size={17}/><div><b>Know what counts as earnings</b><p>Referral commissions are shown only when recorded. Advertising rewards depend on Premium eligibility, valid proof, review and approval. Never treat projected or pending amounts as guaranteed money.</p></div></div>
  </section>
  <div className="nx-intel-two-col">
   <section className="panel nx-intel-section"><div className="nx-intel-sectionhead"><div><span className="pill">TRUST &amp; SAFETY</span><h2>Account safety checklist</h2></div><ShieldCheck size={23}/></div>
    <p className="muted">These are operational checks, not a judgement that a member has done anything wrong.</p>
    <div className="nx-intel-checks">
     <div><span>{checks.profileComplete?"✓":"•"}</span><div><b>Profile details</b><small>{checks.profileComplete?"Core account details are present.":"Add or review your contact details."}</small></div></div>
     <div><span>{checks.sellerVerified?"✓":"•"}</span><div><b>Seller verification</b><small>{checks.sellerVerified?"Your seller profile is verified.":"If you sell regularly, review seller verification options."}</small></div></div>
     <div><span>{Number(stats.withdrawalsUnderReview)>0?"!":"✓"}</span><div><b>Withdrawal reviews</b><small>{Number(stats.withdrawalsUnderReview)>0?(String(stats.withdrawalsUnderReview)+" withdrawal(s) await an authorised review. Funds remain subject to the displayed status."):"No withdrawals are currently flagged for manual review."}</small></div></div>
     <div><span>{Number(stats.pendingPayments)>0?"!":"✓"}</span><div><b>Pending payments</b><small>{Number(stats.pendingPayments)>0?(String(stats.pendingPayments)+" payment(s) are pending. Check Transactions for the reference and status."):"No pending payment records were detected in the recent account summary."}</small></div></div>
    </div>
    <button type="button" className="secondary" onClick={()=>goPage("security")}>Review account security</button>
   </section>
   <section className="panel nx-intel-section"><div className="nx-intel-sectionhead"><div><span className="pill">WALLET TRANSPARENCY</span><h2>Money activity at a glance</h2></div><WalletCards size={23}/></div>
    <div className="nx-intel-wallet-row"><span>Available balance</span><b>{money(me?.wallet?.balance||0)}</b></div>
    <div className="nx-intel-wallet-row"><span>Pending transactions</span><b>{Number(stats.pendingPayments||0)}</b></div>
    <div className="nx-intel-wallet-row"><span>Withdrawals under review</span><b>{Number(stats.withdrawalsUnderReview||0)}</b></div>
    <p className="muted small">Use the Wallet and Transactions pages for individual references and statuses. Do not share your PIN, passwords or one-time codes with anyone.</p>
    <div className="heroactions compact"><button className="primary" type="button" onClick={()=>goPage("wallet")}>Open wallet</button><button className="secondary" type="button" onClick={()=>goPage("transactions")}>View transactions</button></div>
   </section>
  </div>
  <section className="panel nx-intel-section"><div className="nx-intel-sectionhead"><div><span className="pill">SAFER MARKETPLACE</span><h2>Buy and sell with confidence</h2><p className="muted">Use the marketplace's existing order tracking, seller details, eligible-purchase reviews and dispute reporting tools.</p></div><button type="button" className="primary" onClick={()=>goPage("marketplace")}><Store size={15}/> Open marketplace</button></div>
   <div className="nx-intel-market-guides"><div><b>Before buying</b><p>Read listing details, confirm the seller and delivery terms, and keep your order reference.</p></div><div><b>After ordering</b><p>Track order status and use the available dispute flow if there is a genuine order problem.</p></div><div><b>Before selling</b><p>Use accurate descriptions, real photos and current stock. Keep buyer communication professional.</p></div></div>
  </section>
  <section className="nx-intel-section nx-intel-opportunities"><div className="nx-intel-sectionhead"><div><span className="pill">BUSINESS OPPORTUNITIES</span><h2>Explore more of NEXORA</h2><p className="muted">Each area serves a different purpose; review terms and costs before committing money.</p></div></div><div className="nx-intel-opportunity-grid">{opportunities.map(({title,text,icon:Icon,action})=><button type="button" className="panel nx-intel-opportunity" onClick={action} key={title}><Icon size={21}/><b>{title}</b><p>{text}</p><span>Explore <ArrowRight size={13}/></span></button>)}</div></section>
 </section>;
}


function NexoraTrustCentre({me,transactions=[],earnings=[],goPage}){
 const pending=(Array.isArray(transactions)?transactions:[]).filter(x=>String(x.status||"").toUpperCase().includes("PENDING"));
 const failed=(Array.isArray(transactions)?transactions:[]).filter(x=>["FAILED","REJECTED"].includes(String(x.status||"").toUpperCase()));
 const [expanded,setExpanded]=useState("earnings");
 const rules=[
  {id:"earnings",title:"Earnings and membership",body:"Referral commissions depend on the member's active plan, eligible activity and the platform's recorded transaction. Advertising tasks require the eligibility stated on each campaign, valid evidence and review. A referral link or social post alone does not guarantee payment."},
  {id:"wallet",title:"Wallet, fees and withdrawals",body:"Review the amount, fee, net payout and destination shown before confirming a financial action. Available balance and pending items are different. Keep transaction references and check the current status before repeating a payment."},
  {id:"marketplace",title:"Marketplace safety",body:"Read the full listing, seller details, price, delivery terms and order status. Keep communications and order references. Use the dispute or support flow for a genuine problem; never send a seller your password, M-Pesa PIN or one-time code."},
  {id:"privacy",title:"Account security and privacy",body:"Use a unique password, keep your phone and email current, log out of shared devices and never share login credentials or payment codes. Contact official support if you suspect unauthorised access."},
  {id:"advertising",title:"Advertising review",body:"Follow the campaign's approved platforms and content rules. Submit accurate post links and evidence. Do not submit fabricated or duplicated engagement figures. Rewards remain pending until the required review is complete."}
 ];
 return <section className="section trust-centre">
  <div className="sectionhead"><div><span className="pill"><ShieldCheck size={14}/> TRUST &amp; TRANSPARENCY</span><h1>NEXORA Trust Centre</h1><p className="muted">Clear guidance for payments, earning eligibility, marketplace safety and account protection.</p></div><button className="secondary" onClick={()=>goPage("support")}><LifeBuoy size={16}/> Get support</button></div>
  <div className="trust-status-grid">
   <article className="panel trust-status-card"><span className="trust-status-icon"><WalletCards size={19}/></span><small>Pending transactions</small><strong>{pending.length}</strong><button className="secondary narrow" onClick={()=>goPage("transactions")}>Review status</button></article>
   <article className="panel trust-status-card"><span className="trust-status-icon"><AlertTriangle size={19}/></span><small>Failed/rejected records</small><strong>{failed.length}</strong><button className="secondary narrow" onClick={()=>goPage("transactions")}>View records</button></article>
   <article className="panel trust-status-card"><span className="trust-status-icon"><ReceiptText size={19}/></span><small>Recorded earning entries</small><strong>{Array.isArray(earnings)?earnings.length:0}</strong><button className="secondary narrow" onClick={()=>goPage("referrals")}>View earnings</button></article>
  </div>
  <div className="panel trust-notice"><ShieldCheck size={21}/><div><b>Understand status before taking action</b><p className="muted">This page summarises the records currently loaded for your account. It is not a live payment-provider health monitor or a promise that a transaction will succeed. Always check the individual reference for the latest status.</p></div></div>
  <div className="panel trust-earning-guide">
   <div className="paneltitle"><div><h3>Advertising eligibility & published rates</h3><p className="muted">A quick reference for the current NEXORA advertising rules.</p></div><Megaphone size={20}/></div>
   <div className="trust-rate-grid">
    <article><small>Like · approved social platforms</small><strong>KSh 10</strong><span>per verified like</span></article>
    <article><small>Comment · approved social platforms</small><strong>KSh 15</strong><span>per verified comment</span></article>
    <article><small>Profile visit · approved social platforms</small><strong>KSh 3</strong><span>per verified profile view</span></article>
    <article><small>WhatsApp Status</small><strong>KSh 7</strong><span>per verified view</span></article>
   </div>
   <div className="trust-earning-foot"><span><CheckCircle2 size={16}/> Advertising tasks require an active Premium plan.</span><span><Clock3 size={16}/> Approved advertising payouts are scheduled for Fridays.</span><span><ShieldCheck size={16}/> Submit no more than twice per week; each submission is subject to review.</span></div>
   <p className="muted trust-caveat">These are reference rates, not guaranteed earnings. Only eligible, valid and reviewed activity can qualify. Campaign instructions and the amount actually approved for your account take precedence.</p>
  </div>
  <div className="trust-rule-list">{rules.map(r=><article className={"panel trust-rule "+(expanded===r.id?"expanded":"")} key={r.id}><button type="button" className="trust-rule-toggle" aria-expanded={expanded===r.id} onClick={()=>setExpanded(expanded===r.id?"":r.id)}><span><b>{r.title}</b><small>Open to read the guidance</small></span><ChevronDown size={18}/></button>{expanded===r.id&&<p>{r.body}</p>}</article>)}</div>
  <div className="trust-quicklinks"><button className="secondary" onClick={()=>goPage("wallet")}><WalletCards size={16}/> Wallet</button><button className="secondary" onClick={()=>goPage("transactions")}><History size={16}/> Transactions</button><button className="secondary" onClick={()=>goPage("products")}><Megaphone size={16}/> Advertising rules</button><button className="secondary" onClick={()=>goPage("security")}><LockKeyhole size={16}/> Account security</button></div>
 </section>;
}

function NexoraBusinessBuilder({goPage}){
 const [form,setForm]=useState(()=>{try{return JSON.parse(localStorage.getItem("nexora-business-builder")||"null")||{idea:"",audience:"",budget:"",skills:"",goal:"customers"}}catch{return {idea:"",audience:"",budget:"",skills:"",goal:"customers"}}});
 const [built,setBuilt]=useState(false),[copied,setCopied]=useState(false);
 const update=(k,v)=>{const next={...form,[k]:v};setForm(next);try{localStorage.setItem("nexora-business-builder",JSON.stringify(next))}catch{};setBuilt(false)};
 const brief=()=>{const name=form.idea.trim()||"My business idea";return [
  "NEXORA BUSINESS STARTER BRIEF",
  "Business idea: "+name,
  "Target customers: "+(form.audience.trim()||"To be researched"),
  "Starting budget: "+(form.budget.trim()||"Not set"),
  "Skills/resources available: "+(form.skills.trim()||"To be identified"),
  "First goal: "+({customers:"Find the first paying customers",sales:"Make the first sales",online:"Build an online presence",skills:"Build the skills needed to deliver"}[form.goal]||"Find the first customers"),
  "",
  "SUGGESTED FIRST STEPS",
  "1. Talk to at least five potential customers and confirm the problem they need solved.",
  "2. Define one simple offer, its real delivery cost, price and what is included.",
  "3. Test the offer on a small scale before committing a large budget.",
  "4. Track enquiries, sales, expenses and customer feedback from day one.",
  "5. Use NEXORA Academy for relevant skills and the Marketplace or NEXORA Services where appropriate.",
  "",
  "Planning aid only: validate costs, demand, legal requirements and financing terms independently. No income or loan approval is guaranteed."
 ].join("\n")};
 const copy=async()=>{const ok=await copyTextRobust(brief());setCopied(ok);if(!ok)try{window.prompt("Copy your business brief",brief())}catch{};if(ok)setTimeout(()=>setCopied(false),2000)};
 return <section className="section nx-business-builder">
  <div className="sectionhead"><div><span className="pill"><Sparkles size={14}/> AI BUSINESS BUILDER</span><h1>Turn an idea into a first plan</h1><p className="muted">A practical starter brief you can refine before spending money or requesting services.</p></div><button className="secondary" onClick={()=>goPage("academy")}><GraduationCap size={16}/> Learn a skill</button></div>
  <div className="business-builder-grid">
   <form className="panel business-builder-form" onSubmit={e=>{e.preventDefault();setBuilt(true)}}><div className="paneltitle"><div><h3>Tell us about your idea</h3><p className="muted">Your draft is saved on this device.</p></div><Sparkles size={20}/></div>
    <label className="fieldlabel">Business idea<input value={form.idea} onChange={e=>update("idea",e.target.value)} placeholder="e.g. custom T-shirts, web design, groceries"/></label>
    <label className="fieldlabel">Who would buy it?<input value={form.audience} onChange={e=>update("audience",e.target.value)} placeholder="e.g. local shops, students, small businesses"/></label>
    <label className="fieldlabel">Starting budget (optional)<input value={form.budget} onChange={e=>update("budget",e.target.value)} placeholder="e.g. KSh 5,000 or not decided"/></label>
    <label className="fieldlabel">Skills, tools or resources you already have<textarea value={form.skills} onChange={e=>update("skills",e.target.value)} rows={3} placeholder="Describe what you can do or already have"/></label>
    <label className="fieldlabel">Your first goal<select value={form.goal} onChange={e=>update("goal",e.target.value)}><option value="customers">Find the first paying customers</option><option value="sales">Make the first sales</option><option value="online">Build an online presence</option><option value="skills">Build the skills needed to deliver</option></select></label>
    <div className="heroactions compact"><button type="submit" className="primary"><Sparkles size={16}/> Build my starter plan</button><button type="button" className="secondary" onClick={()=>{const blank={idea:"",audience:"",budget:"",skills:"",goal:"customers"};setForm(blank);setBuilt(false);try{localStorage.removeItem("nexora-business-builder")}catch{}}}>Clear draft</button></div>
   </form>
   <div className="panel business-builder-result"><span className="pill">YOUR NEXT STEPS</span><h3>{form.idea.trim()?form.idea.trim():"Your business starter plan"}</h3><p className="muted">A small, testable plan is safer than investing heavily before confirming demand.</p>
    <ol><li>Validate the problem with real potential customers.</li><li>Choose one clear offer and calculate its costs.</li><li>Test with a small first batch or simple service.</li><li>Record enquiries, costs, sales and feedback.</li></ol>
    <div className="business-builder-actions"><button className="primary" type="button" onClick={()=>{setBuilt(true);copy()}}><Copy size={16}/>{copied?"Copied brief":"Copy full starter brief"}</button><button className="secondary" type="button" onClick={()=>goPage("services")}><Wrench size={16}/> Request a digital service</button><button className="secondary" type="button" onClick={()=>goPage("marketplace")}><Store size={16}/> Explore marketplace</button></div>
    {built&&<div className="notice" role="status">Your starter plan is ready. Review the assumptions and validate them with real customers before investing.</div>}
    <small className="muted">This is a planning aid, not personalised financial advice, a guarantee of sales, or a loan offer.</small>
   </div>
  </div>
 </section>;
}

function Dashboard({me,referrals,goPage,goPackages,profileStrength,tickets,goSecurity,load,paymentConfig={}}){
 const ptrRef=usePullToRefresh(()=>load&&load(false));
 const [depositOpen,setDepositOpen]=useState(false);
 const [typedGreeting,setTypedGreeting]=useState("");
 const firstName=me?.user?.name?.split(" ")[0]||"there";
 useEffect(()=>{
  const getGreeting=()=>{
   const hour=new Date().getHours();
   if(hour>=5&&hour<12)return "Good morning";
   if(hour>=12&&hour<17)return "Good afternoon";
   if(hour>=17&&hour<21)return "Good evening";
   return "Welcome back";
  };
  let typingTimer=null;
  let currentFull="";
  const animateGreeting=()=>{
   const full=`${getGreeting()}, ${firstName}`;
   if(full===currentFull)return;
   currentFull=full;
   if(typingTimer)clearInterval(typingTimer);
   let i=0;
   setTypedGreeting("");
   typingTimer=setInterval(()=>{
    i+=1;
    setTypedGreeting(full.slice(0,i));
    if(i>=full.length){clearInterval(typingTimer);typingTimer=null;}
   },105);
  };
  animateGreeting();
  const clockTimer=setInterval(animateGreeting,60000);
  return ()=>{clearInterval(clockTimer);if(typingTimer)clearInterval(typingTimer);};
 },[firstName]);
 const [showBalance,setShowBalance]=useState(true);
 const recent=(me.transactions||[]).slice(0,4);
 const balance=Number(me.wallet?.balance||0);
 const openTickets=(tickets||[]).filter(x=>x.status!=="CLOSED").length;
 const pendingPayments=(me.transactions||[]).filter(x=>String(x.status||"").toUpperCase()==="PENDING").length;
 const quickActions=[
  {label:"Shop now",hint:"Browse products",icon:Store,action:()=>goPage("marketplace"),tone:"blue"},
  {label:"My orders",hint:"Track purchases",icon:Truck,action:()=>goPage("marketplace"),tone:"teal"},
  {label:"Sell a product",hint:"Create a listing",icon:Plus,action:()=>goPage("marketplace"),tone:"purple"},
  {label:"Wishlist",hint:"Saved products",icon:Heart,action:()=>goPage("marketplace"),tone:"rose"},
  {label:"Wallet",hint:"Balance & payments",icon:WalletCards,action:()=>goPage("wallet"),tone:"mint"},
  {label:"Transactions",hint:"Payment history",icon:History,action:()=>goPage("transactions"),tone:"slate"},
  {label:"Academy",hint:"Learn marketplace skills",icon:GraduationCap,action:()=>goPage("academy"),tone:"indigo"},
  {label:"Activity Centre",hint:"Updates & next steps",icon:Activity,action:()=>goPage("activity"),tone:"indigo"},
  {label:"NEXORA Intelligence",hint:"Your earning and safety guide",icon:Sparkles,action:()=>goPage("intelligence"),tone:"gold"},
  {label:"Support",hint:openTickets?`${openTickets} open request${openTickets>1?"s":""}`:"Get help",icon:LifeBuoy,action:()=>goPage("support"),tone:"gold"}
 ];
 const nextAction=pendingPayments
  ? {title:"Check your pending payment",text:"A payment is still waiting for confirmation.",button:"View transactions",action:()=>goPage("transactions"),icon:Clock3}
  : profileStrength<100
  ? {title:"Complete your shopper profile",text:"Keep your contact and delivery details up to date for smoother orders.",button:"Update profile",action:goSecurity,icon:UserCog}
  : {title:"Explore the marketplace",text:"Discover products from NEXORA sellers and find something useful for you.",button:"Start shopping",action:()=>goPage("marketplace"),icon:Store};
 const NextIcon=nextAction.icon;
 return <div className="nx-ptr" ref={ptrRef}><div className="nx-ptr-indicator"><LoaderCircle size={14} className="spin"/> Refreshing…</div>
  <section className="hero dashboardhero ecommerce-dashboard-hero home-hero-compact">
   <div className="dashboardhero-copy">
    <div className="dashboard-greeting" aria-live="polite"><span>{typedGreeting}</span></div>
    <span className="pill">NEXORA</span>
    <h1>Shop, sell &amp; earn</h1>
    <p className="home-hero-sub">Marketplace, wallet and membership tools in one place.</p>
    <div className="heroactions home-hero-actions">
     <button type="button" className="primary" onClick={()=>goPage("marketplace")}><ShoppingCart size={15}/> Shop</button>
     <button type="button" className="secondary" onClick={()=>goPage("marketplace")}><Plus size={15}/> Sell</button>
     <button type="button" className="secondary home-earn-btn" onClick={()=>goPackages?goPackages():goPage("referrals")}><TrendingUp size={15}/> Earn</button>
     <button type="button" className="secondary home-loan-btn" onClick={()=>goPage("balloon")}><HandCoins size={15}/> Loan</button>
    </div>
    <div className="ecom-trust-row home-trust-compact" aria-label="Marketplace benefits">
     <span><ShieldCheck size={12}/> Verified tools</span>
     <span><Truck size={12}/> Tracking</span>
     <span><WalletCards size={12}/> Secure pay</span>
    </div>
   </div>
   <div className="dashboardhero-side home-hero-side">
    <div className="dashboardhero-balance ecommerce-balance-card">
     <div className="dashboardhero-balance-head"><span>BALANCE</span><button type="button" className="tiny-icon-btn" onClick={()=>setShowBalance(x=>!x)} title={showBalance?"Hide balance":"Show balance"}>{showBalance?<EyeOff size={12}/>:<Eye size={12}/>}</button></div>
     <strong className="home-balance-value">{showBalance?money(balance):`${currencyState().currency.symbol} •••••`}</strong>
     <div className="heroactions compact home-balance-actions">
      <button type="button" className="hero-balance-btn" onClick={()=>setDepositOpen(true)}><WalletCards size={12}/> Add</button>
      <button type="button" className="secondary" onClick={()=>goPage("wallet")}>Wallet</button>
     </div>
    </div>
    <div className="dashboardhero-plan shop-status-card home-plan-chip">
     <div className="dashboardmini-label">PLAN</div>
     <strong>{me.package?.name||"No plan"}</strong>
     <span>{me.package?"Active":"Choose a plan to earn"}</span>
     {!me.package&&<button type="button" className="secondary narrow home-plan-cta" onClick={()=>goPackages?goPackages():goPage("referrals")}>View plans</button>}
    </div>
   </div>
  </section>

  <GettingStartedChecklist me={me} goPage={goPage} profileStrength={profileStrength}/>
  <SmartGuide me={me} referrals={referrals} profileStrength={profileStrength} goPage={goPage} goPackages={goPackages}/>

  <div className="shopcategorybar panel">
   <div><span className="pill">SHOP BY CATEGORY</span><h3>What are you looking for?</h3></div>
   <div className="shopcategorychips"><button onClick={()=>goPage("marketplace")}><Store size={16}/> All products</button><button onClick={()=>goPage("marketplace")}><PackageIcon size={16}/> Electronics</button><button onClick={()=>goPage("marketplace")}><Heart size={16}/> Fashion</button><button onClick={()=>goPage("marketplace")}><Truck size={16}/> Services</button><button onClick={()=>goPage("marketplace")}><MapPin size={16}/> Nearby</button></div>
  </div>

  <section className="nx-core-areas" aria-label="NEXORA core areas">
   <div className="nx-core-head"><div><span className="pill">NEXORA WORKSPACE</span><h2>One workspace. More ways to connect.</h2><p className="muted">Shop, earn, advertise, learn, build and access useful everyday digital services.</p></div></div>
   <div className="nx-core-grid">
    <button className="nx-core-card marketplace" onClick={()=>goPage("marketplace")}><span className="nx-core-icon"><Store size={21}/></span><span><b>MARKETPLACE</b><small>Buy &amp; sell products</small></span><ArrowUpRight size={17}/></button>
    <button className="nx-core-card earn" onClick={()=>goPackages?goPackages():goPage("referrals")}><span className="nx-core-icon"><TrendingUp size={21}/></span><span><b>EARN</b><small>Referrals &amp; approved rewards</small></span><ArrowUpRight size={17}/></button>
    <button className="nx-core-card" onClick={()=>goPage("balloon")} style={{border:"1px solid rgba(20,155,110,.38)",background:"linear-gradient(135deg,rgba(20,155,110,.13),rgba(20,155,110,.04))"}}><span className="nx-core-icon" style={{color:"#15966d"}}><HandCoins size={21}/></span><span><b>LOAN</b><small>SME funding with Balloon Ventures</small></span><ArrowUpRight size={17}/></button>
    <button className="nx-core-card advertise" onClick={()=>goPage("products")}><span className="nx-core-icon"><Megaphone size={21}/></span><span><b>ADVERTISE</b><small>Premium advertising tools</small></span><ArrowUpRight size={17}/></button>
    <button className="nx-core-card academy" onClick={()=>goPage("academy")}><span className="nx-core-icon"><GraduationCap size={21}/></span><span><b>ACADEMY</b><small>Learn how NEXORA works</small></span><ArrowUpRight size={17}/></button><button className="nx-core-card services" onClick={()=>goPage("services")}><span className="nx-core-icon"><Wrench size={21}/></span><span><b>DIGITAL STUDIO</b><small>Get a website, app or solution</small></span><ArrowUpRight size={17}/></button><button className="nx-core-card connect" onClick={()=>goPage("connect")}><span className="nx-core-icon"><Wifi size={21}/></span><span><b>NEXORA CONNECT</b><small>Safaricom bundles via Kigen</small></span><ArrowUpRight size={17}/></button>
   </div>
  </section>

  <div className="nx-journey panel">
   <div className="nx-journey-head"><div><span className="pill">YOUR JOURNEY</span><h3>Know what comes next</h3></div><span className="muted small">Progress is based on recorded account activity.</span></div>
   <div className="nx-journey-steps">
    {[
     ["ACCOUNT",true,()=>goSecurity()],
     ["PLAN",!!me.package,()=>goPackages?goPackages():goPage("referrals")],
     ["PAYMENT",!!me.package,()=>goPage("transactions")],
     ["EARN",!!me.package,()=>goPage("referrals")],
     ["TRACK",true,()=>goPage("analytics")]
    ].map(([label,done,action],i)=><button key={label} className={`nx-journey-step ${done?"done":""}`} onClick={action}><span className="nx-journey-dot">{done?<Check size={13}/>:i+1}</span><b>{label}</b>{i<4&&<i/>}</button>)}
   </div>
  </div>

  <div className="dashboardquick">
   <div className="dashboardquick-head"><div><span className="pill">SHOPPING TOOLS</span><h2>Everything you need</h2></div><span className="muted small">Quick access to shopping, selling and account tools</span></div>
   <div className="dashboardquick-grid">{quickActions.map(({label,hint,icon:Icon,action,tone})=><button key={label} className={`quickaction ${tone}`} onClick={action}><span className="quickaction-icon"><Icon size={18}/></span><span className="quickaction-copy"><b>{label}</b><small>{hint}</small></span><ArrowUpRight size={15}/></button>)}</div>
  </div>

  <div className="dashboardstats ecommerce-stats">
   <div className="dashboardstat"><span>Available wallet</span><strong>{money(balance)}</strong><small>Ready for eligible purchases</small></div>
   <div className="dashboardstat"><span>Profile completion</span><strong>{profileStrength}%</strong><small>Keep your account details current</small></div>
   <div className="dashboardstat"><span>Account activity</span><strong>{recent.length}</strong><small>Recent transactions shown below</small></div>
  </div>

  <div className="dashboard-main-grid">
   <div className="dashboard-left">
    <div className="panel nextaction ecommerce-nextaction"><div className="nextaction-icon"><NextIcon size={21}/></div><div className="nextaction-copy"><span className="pill">RECOMMENDED</span><h3>{nextAction.title}</h3><p className="muted">{nextAction.text}</p></div><button className="primary narrow" onClick={nextAction.action}>{nextAction.button}<ArrowUpRight size={14}/></button></div>
    <RecommendedMarketplace goPage={goPage}/>
    <div className="panel"><div className="paneltitle"><div><span className="pill">ACCOUNT ACTIVITY</span><h3>Recent transactions</h3></div><button className="secondary narrow" onClick={()=>goPage("transactions")}>View all</button></div>{recent.length?recent.map(x=><div className="activityrow" key={x.id}><span className="activityicon"><ReceiptText size={15}/></span><div><b>{String(x.type||"Transaction").replaceAll("_"," ")}</b><small>{new Date(x.createdAt).toLocaleString()}</small></div><strong>{money(x.amount)}</strong></div>):<div className="smartempty"><p className="muted">No transactions yet.</p><button className="primary narrow" onClick={()=>goPage("marketplace")}><Store size={15}/> Browse marketplace</button></div>}</div>
   </div>
   <div className="dashboard-right">
    <div className="panel shopbenefits-panel"><div className="paneltitle"><div><span className="pill">WHY SHOP HERE</span><h3>A better marketplace experience</h3></div><Store size={18}/></div><div className="shopbenefit"><ShieldCheck size={17}/><div><b>Clear seller information</b><p className="muted small">See seller details, location and verification status on listings.</p></div></div><div className="shopbenefit"><Heart size={17}/><div><b>Save products you like</b><p className="muted small">Keep favorites in your wishlist for later.</p></div></div><div className="shopbenefit"><Truck size={17}/><div><b>Track your orders</b><p className="muted small">Keep purchase and delivery information in one place.</p></div></div><div className="shopbenefit"><WalletCards size={17}/><div><b>Flexible checkout</b><p className="muted small">Use the payment methods available at checkout.</p></div></div><button className="primary full" onClick={()=>goPage("marketplace")}><ShoppingCart size={16}/> Browse products</button></div>
    <ProfileCard me={me} strength={profileStrength} goSecurity={goSecurity}/>
   </div>
  </div>

  <div className="panel seller-cta-panel"><div><span className="pill">SELL ON NEXORA</span><h3>Have something to sell?</h3><p className="muted">Create a product listing with photos, pricing, stock and delivery information, then manage customer orders from your seller dashboard.</p></div><button className="primary" onClick={()=>goPage("marketplace")}><Plus size={16}/> List a product</button></div>
  <Notifications me={me} analytics={null} tickets={tickets}/>
  {depositOpen&&<DepositModal onClose={()=>setDepositOpen(false)} load={load} countryCode={me.user.countryCode||"KE"} countryName={me.user.countryName||"your country"} defaultPhone={me.user.phone||""} paymentConfig={paymentConfig}/>} 
 </div>
}
function Analytics({data,earnings,referrals}){if(!data)return <section><div className="panel"><p>Loading analytics…</p></div></section>;return <section><div className="sectionhead"><div><span className="pill">PERFORMANCE CENTER</span><h1>Referral analytics</h1><p className="muted">Understand your network activity and the history of recorded commissions.</p></div><RefreshCw size={18}/></div><div className="cards three"><Card title="Direct members" value={data.directCount}/><Card title="Level 2 members" value={data.level2Count}/><Card title="Members with plans" value={data.paidReferrals}/></div><div className="analyticsgrid"><div className="panel"><h3>Network conversion</h3><div className="bigmetric">{data.conversion}%</div><p className="muted">Percentage of direct referrals with an active plan.</p><div className="progress"><i style={{width:`${data.conversion}%`}}/></div></div><div className="panel"><h3>Commission mix</h3><div className="analyticbars"><div><span>Direct</span><b>{money(data.directCommission)}</b><i style={{width:`${data.totalCommission?data.directCommission/data.totalCommission*100:0}%`}}/></div><div><span>Level 2</span><b>{money(data.level2Commission)}</b><i style={{width:`${data.totalCommission?data.level2Commission/data.totalCommission*100:0}%`}}/></div></div></div></div><div className="panel"><h3>Network snapshot</h3><div className="networkcards"><div><span>New this month</span><strong>{data.month.directReferrals}</strong></div><div><span>Commissions this month</span><strong>{money(data.month.commissions)}</strong></div><div><span>All-time commissions</span><strong>{money(data.totalCommission)}</strong></div></div></div></section>}
function Marketing({me,copy,copyCode,copiedKind,share}){
 const hasPackage=Boolean(me?.package);
 const link=`${location.origin}/?ref=${me.user.referralCode}`;
 const [localCopied,setLocalCopied]=useState("");
 const scripts=[
  ["Warm opener","I have been using NEXORA to organise my membership, learning and network in one place. If you want to see how it works, I can share my link."],
  ["Curiosity","NEXORA is a member workspace with plans, referrals, Academy lessons and a wallet. Want me to walk you through it before you decide?"],
  ["Value-first","Before anything else, look at the plans and the rules. NEXORA does not promise income — it gives tools. Here is my invite link if you want to explore."],
  ["Follow-up","Did you get a chance to open NEXORA? I can explain the plans and how referrals are recorded so there is no confusion."]
 ];
 const channelKits=[
  {id:"wa",label:"WhatsApp",icon:MessageCircle,text:()=>`Hi! I use NEXORA for membership, marketplace and referrals.\n\nReview the plans first — no guaranteed income.\n\nJoin here: ${link}`},
  {id:"sms",label:"SMS",icon:Send,text:()=>`NEXORA invite — review plans first (no income promise): ${link}`},
  {id:"ig",label:"Instagram / TikTok bio",icon:Share2,text:()=>`NEXORA · marketplace + member plans. Review plans first. ${link}`},
  {id:"x",label:"X / Twitter",icon:Megaphone,text:()=>`Exploring NEXORA — marketplace, learning & referrals. Plans first, no guaranteed income. ${link}`},
 ];
 const copyText=async(t,kind="msg")=>{try{await navigator.clipboard.writeText(t);}catch{window.prompt("Copy message:",t);}setLocalCopied(kind);setTimeout(()=>setLocalCopied(""),2500);};
 return <section>
  <div className="sectionhead"><div><span className="pill">GROWTH TOOLS</span><h1>Referral marketing center</h1><p className="muted">Share clearly, invite honestly, and help people understand NEXORA before they join.</p></div></div>
  {!hasPackage&&<div className="lockedpanel"><LockKeyhole size={28}/><div><h3>Referral tools unlock after plan activation</h3><p className="muted">Activate a membership plan first (Earn → Membership plans). Your personal referral link, QR code and share messages become available once a plan is active.</p></div></div>}
  {hasPackage&&<>
   <div className="marketinggrid">
    <div className="panel"><Megaphone size={24}/><h3>Share link</h3><p className="muted">Your personal referral link.</p><div className="copybox"><span>{link}</span><button className={(copiedKind==="link"||localCopied==="link")?"is-copied":""} onClick={copy}>{(copiedKind==="link"||localCopied==="link")?<><Check size={16} className="nx-tick"/> Copied</>:<><Copy size={16}/> Copy</>}</button></div><div className="heroactions compact" style={{marginTop:12}}><button className="primary" onClick={share}><Share2 size={16}/> Share link</button><button className="secondary" onClick={()=>waShare(`Hi! I use NEXORA for membership + referrals. Review plans first (no guaranteed income): ${link}`)}><MessageCircle size={16}/> WhatsApp</button><button className="secondary" onClick={copyCode}>{(copiedKind==="code"||localCopied==="code")?<><Check size={15}/> Copied</>:<><CopyCheck size={15}/> Copy code</>}</button></div>{(copiedKind==="link"||copiedKind==="code"||localCopied)&&<p className="muted small copyhint">{copiedKind==="code"||localCopied==="code"?"Referral code copied — friends paste it when registering.":copiedKind==="link"||localCopied==="link"?"Referral link copied — paste it in chat or social media.":"Message copied."}</p>}</div>
    <div className="panel qrcodepanel"><QrCode size={24}/><h3>QR referral card</h3><p className="muted">Let people scan your referral link from your screen.</p><img className="qrcode" alt="Referral QR code" src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link)}`}/><small className="muted">Scan to open your NEXORA referral page.</small></div>
    <div className="panel"><Sparkles size={24}/><h3>Ready-to-share messages</h3>
     <div className="template"><b>Short</b><p>Join me on NEXORA — member tools, learning and network in one place: {link}</p><button className="secondary" onClick={()=>copyText(`Join me on NEXORA — member tools, learning and network in one place: ${link}`)}>Copy</button></div>
     <div className="template"><b>Honest invite</b><p>I'm on NEXORA. It is a membership platform with plans, referrals and Academy lessons. Results follow your activity — review the plans first: {link}</p><button className="secondary" onClick={()=>copyText(`I'm on NEXORA. It is a membership platform with plans, referrals and Academy lessons. Results follow your activity — review the plans first: ${link}`)}>Copy</button></div>
     <div className="template"><b>WhatsApp-friendly</b><p>Hi! I use NEXORA for membership + referrals. If you want to see how it works, open this link and we can talk through the plans: {link}</p><button className="secondary" onClick={()=>copyText(`Hi! I use NEXORA for membership + referrals. If you want to see how it works, open this link and we can talk through the plans: ${link}`)}>Copy</button></div>
    </div>
   </div>

   <div className="panel invitetips">
    <div className="paneltitle"><h3><Target size={18}/> How to invite someone to NEXORA</h3><span className="pill">TIPS</span></div>
    <div className="tipsteps">
     <div className="tipstep"><span>1</span><div><b>Lead with clarity, not pressure</b><p>Explain what NEXORA is: a member workspace with plans, learning, wallet and referral tools. Avoid hype and income promises.</p></div></div>
     <div className="tipstep"><span>2</span><div><b>Show the product first</b><p>Let them open your link, view plans and the public pages. People trust what they can see more than a long pitch.</p></div></div>
     <div className="tipstep"><span>3</span><div><b>Answer the real questions</b><p>Plan prices, how upgrades work, how commissions are recorded, and that earnings depend on qualifying purchases — not guarantees.</p></div></div>
     <div className="tipstep"><span>4</span><div><b>Use your own experience</b><p>Share what you use (Dashboard, Academy, Marketing Center). Personal honesty converts better than copied scripts alone.</p></div></div>
     <div className="tipstep"><span>5</span><div><b>Invite, then follow up once</b><p>Send the link, offer to explain plans, and follow up politely. Do not spam or pressure family and friends.</p></div></div>
     <div className="tipstep"><span>6</span><div><b>Protect trust</b><p>Never ask for someone's M-Pesa PIN or password. Direct them to official support if they need help.</p></div></div>
    </div>
   </div>

   <div className="panel channelkits">
    <div className="paneltitle"><h3><Share2 size={18}/> Share kits by channel</h3></div>
    <p className="muted">One-tap copy for WhatsApp, SMS, bio links and X. Personalize before sending.</p>
    <div className="channelkitgrid">{channelKits.map(k=>{const Icon=k.icon;return <button type="button" key={k.id} className="channelkit" onClick={()=>copyText(k.text(),k.id)}><Icon size={16}/><span><b>{k.label}</b></span><em>{localCopied===k.id?"Copied":"Copy"}</em></button>})}</div>
   </div>
   <div className="panel">
    <div className="paneltitle"><h3><MessageCircle size={18}/> Conversation starters</h3></div>
    <div className="scriptlist">
     {scripts.map(([t,body])=><div className="scriptcard" key={t}><div><b>{t}</b><p>{body}</p></div><div className="scriptactionsactions"><button className="secondary" onClick={()=>copyText(`${body} ${link}`)}><Copy size={15}/> Copy</button><button className="secondary" onClick={()=>waShare(`${body} ${link}`)}><MessageCircle size={15}/> WhatsApp</button></div></div>)}
    </div>
   </div>

   <div className="panel">
    <h3>Marketing best practice</h3>
    <div className="tips">
     <span><Check size={15}/> Explain the platform honestly.</span>
     <span><Check size={15}/> Never promise guaranteed earnings.</span>
     <span><Check size={15}/> Share plan details before someone pays.</span>
     <span><Check size={15}/> Encourage people to review Terms and Membership Rules.</span>
     <span><Check size={15}/> Prefer people who are curious, not people you pressure.</span>
     <span><Check size={15}/> Keep screenshots and claims consistent with the live app.</span>
    </div>
   </div>
  </>}
 </section>;
}


function GrowthPath({me,completed,goPage}){
 const [visited,setVisited]=useState(()=>({marketplace:localStorage.getItem("nexora-milestone-marketplace")==="1",rules:localStorage.getItem("nexora-milestone-plan-review")==="1"}));
 const lessonCount=Object.keys(completed||{}).length;
 const profileDone=Boolean(me?.user?.name&&me?.user?.email&&me?.user?.phone&&me?.user?.referralCode);
 const tasks=[{id:"profile",title:"Complete your profile",detail:"Keep your account details current.",done:profileDone,page:"security"},{id:"rules",title:"Review membership and earning rules",detail:"Understand plan benefits, eligibility, advertising limits and payout conditions.",done:visited.rules,page:"referrals"},{id:"learn",title:"Finish 3 Academy lessons",detail:"Build confidence with the platform and its rules.",done:lessonCount>=3,page:"academy"},{id:"marketplace",title:"Explore the marketplace",detail:"Learn how to browse products and seller listings.",done:visited.marketplace,page:"marketplace"}];
 const done=tasks.filter(x=>x.done).length;
 const openTask=task=>{if(task.id==="marketplace"&&!task.done){localStorage.setItem("nexora-milestone-marketplace","1");setVisited(v=>({...v,marketplace:true}))}if(task.id==="rules"&&!task.done){localStorage.setItem("nexora-milestone-plan-review","1");setVisited(v=>({...v,rules:true}))}goPage(task.page)};
 return <section className="panel nx-growth-path"><div className="nx-growth-head"><div><span className="pill">YOUR GROWTH PATH</span><h2>Learn it. Try it. Build confidence.</h2><p className="muted">A practical progress path—not an income promise. Complete these steps at your own pace.</p></div><div className="nx-growth-count"><b>{done}/{tasks.length}</b><small>steps</small></div></div><div className="nx-growth-track"><i style={{width:`${done/tasks.length*100}%`}}/></div><div className="nx-growth-steps">{tasks.map((task,i)=><div className={`nx-growth-step ${task.done?"done":""}`} key={task.id}><span className="nx-growth-step-number">{task.done?<Check size={15}/>:i+1}</span><div><b>{task.title}</b><small>{task.detail}</small></div><button type="button" className={task.done?"secondary":"primary"} onClick={()=>openTask(task)}>{task.done?"Review":"Start"}<ArrowRight size={13}/></button></div>)}</div></section>
}

function Academy({goPage=()=>{},me}){
 const [selected,setSelected]=useState(null),[completed,setCompleted]=useState(()=>{try{return JSON.parse(localStorage.getItem("nexora-academy-completed")||"{}")}catch{return {}}}),[lessonNotice,setLessonNotice]=useState("");
 const finishLesson=(lesson)=>{const next={...completed,[lesson.title]:new Date().toISOString()};setCompleted(next);try{localStorage.setItem("nexora-academy-completed",JSON.stringify(next))}catch{}window.dispatchEvent(new CustomEvent("nexora-academy-progress"));setSelected(null);setLessonNotice(`Lesson finished: ${lesson.title}`);};
 const lessons=[
  {title:'NEXORA & your member workspace',level:'START HERE',time:'5 min',text:'Learn how the main areas of NEXORA fit together and where to find the information you need.',sections:[['What you will learn','How Dashboard, Earn (plans & referrals), Analytics, Marketing Center, Wallet, Transactions, Support and Security work together.'],['Your first steps','Complete your profile, review your plan information, check your wallet and learn where your transaction records appear.'],['Good habit','Read the platform information before taking action. Keep your login details private and contact Support when something is unclear.']],takeaway:'Use NEXORA as a workspace for learning, tracking activity and managing your account—not as a promise of income.'},
  {title:'NEXORA Marketplace: buy & sell',level:'MARKETPLACE',time:'9 min',text:'Learn how to list products, shop safely, manage orders and communicate with buyers or sellers.',sections:[['Create a strong listing','Use clear photos, an accurate title, detailed description, price, stock and pickup/delivery location.'],['Buying','Search by product, category or location, add products to your cart, confirm delivery details and choose an available payment method.'],['Selling responsibly','Only list items you are authorized to sell. Be honest about condition, stock, warranties and delivery. Never upload prohibited or counterfeit goods.'],['Order management','Use Orders to track purchases and customer orders. Update statuses as an order moves from pending to confirmed, processing, shipped and delivered. Buyers can review completed purchases and report an order issue through the dispute process.']],takeaway:'A trustworthy marketplace depends on accurate listings, clear communication, secure payments and reliable fulfillment.'},
  {title:'Understanding membership plans',level:'FOUNDATIONS',time:'7 min',text:'Understand plan levels, upgrades, configured benefits and earning eligibility.',sections:[['Plan levels','NEXORA has Starter, Growth, Pro, Elite and Premium plans. Each plan can have its own configured benefits, price and commission settings.'],['Referral earning access','Starter, Growth, Pro and Elite earn through their qualifying referral levels. Premium can earn from all five plan levels through referrals.'],['Premium advertising access','Only Premium unlocks Advertise (Products & Advertising). Non-Premium members continue with referral earning only.'],['Upgrading','When upgrading, NEXORA charges the difference between your current plan price and the target plan price. Review the displayed amount before confirming.']],takeaway:'Always check the current plan details shown in NEXORA before making a membership decision.'},
  {title:'Premium advertising & weekly payouts',level:'PREMIUM ADVERTISING',time:'8 min',text:'Learn how Premium members can promote NEXORA products and submit performance for Friday payout processing.',sections:[['Who can advertise','Products are available only to members with an active Premium plan. Starter, Growth, Pro and Elite do not receive advertising products.'],['Where to publish','Campaigns may specify WhatsApp Status, TikTok, Instagram, X or another approved social platform. Follow each campaign\'s instructions and use accurate information.'],['How payout is calculated','Payouts use verified views and engagements multiplied by the rates configured for the campaign. NEXORA reviews submissions before approval, and approved advertising earnings are scheduled for Friday processing.']],takeaway:'Premium unlocks advertising access, but advertising earnings depend on verified campaign performance and approval; no fixed income is guaranteed.'},
  {title:'Referral fundamentals',level:'REFERRALS',time:'7 min',text:'Learn the difference between direct referrals and Level 2 activity and how your personal link is used.',sections:[['Direct referrals','A person who joins through your personal referral link is recorded as your direct referral when the platform records the relationship.'],['Level 2','Level 2 refers to qualifying members connected through your direct network. Use My Referrals to understand the network structure.'],['Quality over quantity','Share accurate information with people who genuinely want to understand NEXORA. Do not pressure people or make claims about guaranteed returns.']],takeaway:'A healthy referral network starts with clear communication and people who understand what they are joining.'},
  {title:'Marketing that builds trust',level:'MARKETING',time:'8 min',text:'Use the Marketing Center responsibly to communicate clearly and consistently.',sections:[['Before you share','Know what NEXORA does, what membership costs, what the platform records and where people can get support.'],['Use the tools','Copy your personal referral link, use the QR code or adapt the ready-to-share messages in Marketing Center.'],['Avoid misleading claims','Never promise guaranteed income, guaranteed returns, instant profits or risk-free results. Describe commissions as eligibility-based and dependent on the platform rules.']],takeaway:'Trust grows when your message is accurate, simple and honest about both benefits and responsibilities.'},
  {title:'Reading your analytics',level:'ANALYTICS',time:'6 min',text:'Turn your referral and commission records into useful information without confusing activity with guaranteed results.',sections:[['Key metrics','Review direct members, Level 2 members, paid referrals, conversion information and recorded commissions.'],['Compare activity','Use monthly activity and direct-versus-Level 2 commission records to understand where your recorded activity is coming from.'],['Use analytics wisely','Analytics describes recorded activity. It does not predict future earnings or guarantee that the same results will continue.']],takeaway:'Use analytics to understand what has happened and improve your process—not to promise what will happen next.'},
  {title:'Wallet, transactions & payments',level:'MONEY SAFETY',time:'7 min',text:'Understand where balances and payment records appear and how to handle payment questions safely.',sections:[['Wallet','Check available, pending and withdrawn amounts in Wallet. Give transactions time to update when a payment is still being processed.'],['Transactions','Use your transaction history to review membership payments and other recorded account activity. Keep references when contacting Support.'],['Payment safety','Never share your M-Pesa PIN, password or one-time security codes with another person. If a payment looks wrong, contact NEXORA Support and provide the relevant transaction reference.']],takeaway:'Protect your credentials and use the transaction record as your source of truth when resolving payment questions.'},
  {title:'Account security & privacy',level:'SECURITY',time:'6 min',text:'Build simple habits that reduce the risk of losing access to your NEXORA account.',sections:[['Password protection','Use a strong, unique password and never share it with another person or support agent.'],['Profile information','Keep your name and phone number accurate so account communication and support can work properly.'],['Suspicious activity','If you notice unexpected account activity, change your password and contact Support promptly. Do not send your password or M-Pesa PIN.']],takeaway:'Your account security is your responsibility too: protect credentials, keep profile information current and ask for help when something looks wrong.'},
  {title:'Growing sustainably & ethically',level:'ADVANCED',time:'8 min',text:'Build a long-term approach based on education, useful communication and respect for other members.',sections:[['Set realistic goals','Focus on learning, consistent communication and quality relationships rather than chasing a promised income target.'],['Be transparent','Explain membership costs, plan rules and the fact that commissions depend on qualifying activity.'],['Build relationships','Answer questions honestly, allow people time to decide and direct complex questions to NEXORA Support.']],takeaway:'Sustainable growth comes from informed people, responsible communication and accurate expectations.'}
 ];
 const lesson=selected!==null?lessons[selected]:null;
 return <section><div className="sectionhead"><div><span className="pill">LEARNING HUB</span><h1>NEXORA Academy</h1><p className="muted">Practical, step-by-step lessons to help members understand NEXORA, use its tools and communicate responsibly.</p></div></div><div className="panel academyintro"><BookOpen size={23}/><div><h3>Learn at your own pace</h3><p className="muted">Start with the foundations, then work through referrals, marketing, analytics, payment safety and sustainable growth. These lessons are educational and do not guarantee earnings.</p></div></div>{lessonNotice&&<div className="notice" role="status"><CheckCircle2 size={17}/>{lessonNotice}<button className="iconbtn" onClick={()=>setLessonNotice("")} aria-label="Dismiss message"><X size={15}/></button></div>}<div className="academyprogress muted small">{Object.keys(completed).filter(title=>lessons.some(x=>x.title===title)).length} of {lessons.length} lessons completed</div><GrowthPath me={me} completed={completed} goPage={goPage}/><div className="academygrid">{lessons.map((lesson,i)=><div className={`academycard ${completed[lesson.title]?"lesson-completed":""}`} key={lesson.title}><div className="lessonnum">{i+1}</div><GraduationCap size={23}/><small className="lessonlevel">{lesson.level} · {lesson.time}</small><h3>{lesson.title}</h3><p className="muted">{lesson.text}</p>{completed[lesson.title]&&<div className="notice"><CheckCircle2 size={15}/> Lesson finished</div>}<button className={completed[lesson.title]?"secondary":"primary"} onClick={()=>{setLessonNotice("");setSelected(i)}}><BookOpen size={15}/> {completed[lesson.title]?"Review lesson":"Start lesson"}</button></div>)}</div>{lesson&&createPortal(<div className="modalbackdrop lessonmodalbackdrop" onClick={()=>setSelected(null)} role="dialog" aria-modal="true" aria-label={lesson.title}><div className="modal lessonmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">{lesson.level} · {lesson.time}</span><h2>{lesson.title}</h2></div><button className="iconbtn" onClick={()=>setSelected(null)} aria-label="Close lesson"><X size={20}/></button></div><div className="lessonbody"><p className="lessonlead">{lesson.text}</p>{lesson.sections.map(([heading,body])=><div className="lessonsection" key={heading}><h3>{heading}</h3><p>{body}</p></div>)}<div className="lessontakeaway"><CheckCircle2 size={19}/><div><b>Key takeaway</b><p>{lesson.takeaway}</p></div></div></div><div className="modalfoot"><button className="primary" onClick={()=>finishLesson(lesson)}><Check size={16}/> Mark lesson finished</button></div></div></div>,document.body)}</section>}
function Leaderboard({rows}){return <section><div className="sectionhead"><div><span className="pill">COMMUNITY</span><h1>Leaderboard</h1><p className="muted">A transparent snapshot of recorded referral commissions. Only first names are displayed.</p></div></div><div className="panel leaderboard"><div className="leaderhead"><span>Rank</span><span>Member</span><span>Plan</span><span>Recorded earnings</span></div>{rows.map((x,i)=><div className="leaderrow" key={x.id}><strong className="rank">{i<3?<Crown size={17}/>:i+1}</strong><div><b>{x.name}</b><small>Member since {formatMemberSince(x.createdAt)}</small></div><span>{x.package||"No plan"}</span><strong>{money(x.totalEarned)}</strong></div>)}{!rows.length&&<p className="muted">No leaderboard data yet.</p>}</div><div className="notice"><Trophy size={16}/> Leaderboard figures are informational and reflect recorded commissions, not guaranteed future income.</div></section>}
function Challenges({referrals,earnings}){const now=new Date(),month=now.getMonth(),year=now.getFullYear();const count=referrals.direct.filter(x=>{const d=new Date(x.createdAt);return d.getMonth()===month&&d.getFullYear()===year}).length;const goal=5;const pct=Math.min(100,count/goal*100);const directE=earnings.filter(x=>x.level===1).reduce((a,x)=>a+Number(x.amount||0),0);return <section><div className="sectionhead"><div><span className="pill">MONTHLY CHALLENGE</span><h1>Build your momentum</h1><p className="muted">Track useful activity goals without turning them into promises of earnings.</p></div></div><div className="challengehero"><div><Target size={30}/><span>Current challenge</span><h2>Make 5 quality direct referrals</h2><p>Invite people who genuinely want to understand and use NEXORA.</p></div><div className="challengecount"><strong>{count}</strong><span>/ {goal}</span></div></div><div className="progress challengeprogress"><i style={{width:`${pct}%`}}/></div><div className="cards three"><Card title="Direct referrals this month" value={count}/><Card title="Direct commissions recorded" value={money(directE)}/><Card title="Challenge progress" value={`${Math.round(pct)}%`}/></div><div className="panel"><h3>Achievement ideas</h3><div className="achievementgrid"><Achievement icon={<Users2/>} title="First connection" text="Make your first direct referral." unlocked={referrals.direct.length>=1}/><Achievement icon={<TrendingUp/>} title="Network builder" text="Reach 5 direct referrals." unlocked={referrals.direct.length>=5}/><Achievement icon={<Medal/>} title="Consistent promoter" text="Reach 10 direct referrals." unlocked={referrals.direct.length>=10}/><Achievement icon={<Crown/>} title="Community leader" text="Reach 25 direct referrals." unlocked={referrals.direct.length>=25}/></div></div></section>}
function Achievement({icon,title,text,unlocked}){return <div className={`achievement ${unlocked?"unlocked":""}`}>{icon}<div><b>{title}</b><p>{text}</p></div><span>{unlocked?<CheckCheck size={17}/>:"Locked"}</span></div>}
function SupportCenter({tickets,reload}){const [subject,setSubject]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[err,setErr]=useState("");const submit=async e=>{e.preventDefault();if(!subject.trim()||!message.trim())return setErr("Enter a subject and message.");setBusy(true);setErr("");try{await api("/support/tickets",{method:"POST",body:JSON.stringify({subject,message})});setSubject("");setMessage("");await reload()}catch(e){setErr(e.message)}finally{setBusy(false)}};return <section><div className="sectionhead"><div><span className="pill">MEMBER CARE</span><h1>Help & Support</h1><p className="muted">Get help, track your requests and use the direct WhatsApp support option.</p></div><a className="secondary" href="https://wa.me/254703265774" target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp</a></div><div className="supportgrid"><div className="panel"><LifeBuoy size={24}/><h3>Open a support ticket</h3>{err&&<div className="error">{err}</div>}<form className="supportform" onSubmit={submit}><input required maxLength="120" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)}/><textarea required maxLength="3000" rows="7" placeholder="Describe what you need help with…" value={message} onChange={e=>setMessage(e.target.value)}/><button className="primary" disabled={busy}><Send size={16}/>{busy?"Sending…":"Send support request"}</button></form></div><div className="panel"><h3>Your tickets</h3>{tickets.length?tickets.map(t=><div className="ticket" key={t.id}><div><b>{t.subject}</b><small>{new Date(t.createdAt).toLocaleString()}</small></div><span className={`ticketstatus ${t.status.toLowerCase()}`}>{t.status}</span><p>{t.message}</p>{t.response&&<div className="ticketresponse"><b>Support reply</b><p>{t.response}</p></div>}</div>):<p className="muted">No support tickets yet.</p>}</div></div><div className="notice"><Bell size={16}/> For payment issues, include your transaction reference. Never send your password or PIN to support.</div></section>}
function SettingsPreferences({goPage,me}){
 const [tab,setTab]=useState("preferences");
 const [theme,setTheme]=useState(()=>{try{return localStorage.getItem("nexora-theme")==="light"?"light":"dark"}catch{return "dark"}});
 const [reduceMotion,setReduceMotion]=useState(()=>{try{return localStorage.getItem("nexora-reduce-motion")==="true"}catch{return false}});
 const [nexbotHints,setNexbotHints]=useState(()=>{try{return localStorage.getItem("nexora-nexbot-hints")!=="false"}catch{return true}});
 const [voiceReplies,setVoiceReplies]=useState(()=>{try{return localStorage.getItem("nexora-nexbot-voice")==="true"}catch{return false}});
 const [biometricEnabled,setBiometricEnabled]=useState(()=>{try{return localStorage.getItem("nexora-biometric-enabled")==="true"}catch{return false}});
 const [biometricAvailable,setBiometricAvailable]=useState(false);
 const [biometricChecking,setBiometricChecking]=useState(true);
 const [biometricBusy,setBiometricBusy]=useState(false);
 const [biometricMessage,setBiometricMessage]=useState("");
 useEffect(()=>{
  let cancelled=false;
  (async()=>{
   try{
    if(!Capacitor.isNativePlatform()){if(!cancelled)setBiometricAvailable(false);return;}
    const availability=await NativeBiometric.isAvailable();
    if(!cancelled)setBiometricAvailable(Boolean(availability?.isAvailable));
   }catch{if(!cancelled)setBiometricAvailable(false);}
   finally{if(!cancelled)setBiometricChecking(false);}
  })();
  return()=>{cancelled=true};
 },[]);
 const toggleBiometrics=async enabled=>{
  setBiometricBusy(true);setBiometricMessage("");
  try{
   if(!Capacitor.isNativePlatform())throw new Error("This page is running in a browser, which cannot activate phone biometrics. Open NEXORA from its installed Android app; the native biometric plugin must be included in that app build.");
   const availability=await NativeBiometric.isAvailable();
   if(!availability?.isAvailable)throw new Error("This phone does not report an available fingerprint or face-unlock method.");
   if(enabled){
    const token=localStorage.getItem("token");
    const email=String(me?.user?.email||me?.email||"").trim();
    if(!token||!email)throw new Error("Please sign in again before enabling biometric login.");
    await NativeBiometric.verifyIdentity({reason:"Enable biometric sign-in for NEXORA",title:"Secure NEXORA login",subtitle:"Confirm it's you",description:"Your device will protect your saved NEXORA session."});
    await NativeBiometric.setCredentials({username:email,password:token,server:BIOMETRIC_SERVER});
    localStorage.setItem("nexora-biometric-enabled","true");
    setBiometricEnabled(true);
    setBiometricMessage("Biometric login is enabled on this device.");
   }else{
    try{await NativeBiometric.deleteCredentials({server:BIOMETRIC_SERVER});}catch{}
    localStorage.removeItem("nexora-biometric-enabled");
    setBiometricEnabled(false);
    setBiometricMessage("Biometric login is disabled and its saved sign-in credential has been removed.");
   }
  }catch(error){
   setBiometricMessage(error?.message||"Unable to update biometric settings. You can continue using your password.");
  }finally{setBiometricBusy(false);}
 };
 const testBiometrics=async()=>{
  setBiometricBusy(true);setBiometricMessage("");
  try{
   if(!Capacitor.isNativePlatform())throw new Error("This page is running in a browser, so phone biometrics cannot open here. Use the installed NEXORA Android app with the native biometric plugin.");
   const availability=await NativeBiometric.isAvailable();
   if(!availability?.isAvailable)throw new Error("No supported fingerprint or face-unlock method is available on this phone.");
   await NativeBiometric.verifyIdentity({reason:"Test biometric authentication for NEXORA",title:"Test biometrics",subtitle:"Confirm it's you",description:"This test will not change your login settings."});
   setBiometricMessage("Biometric verification succeeded.");
  }catch(error){setBiometricMessage(error?.message||"Biometric verification was not completed.");}
  finally{setBiometricBusy(false);}
 };
 useEffect(()=>{
  try{
   document.documentElement.classList.toggle("nexora-light",theme==="light");
   document.documentElement.classList.toggle("nx-reduce-motion",reduceMotion);
   localStorage.setItem("nexora-theme",theme);
   localStorage.setItem("nexora-reduce-motion",String(reduceMotion));
   localStorage.setItem("nexora-nexbot-hints",String(nexbotHints));
   localStorage.setItem("nexora-nexbot-voice",String(voiceReplies));
   window.dispatchEvent(new Event("nexora-preferences-updated"));
  }catch{}
 },[theme,reduceMotion,nexbotHints,voiceReplies]);
 const tabs=[["preferences","Preferences",Settings2],["notifications","Notifications",Bell],["biometrics","Biometric login",Shield],["privacy","Privacy & security",ShieldCheck]];
 const switchRow=(title,description,checked,onChange)=> <label className="nx-preference-row"><span><b>{title}</b><small>{description}</small></span><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><i aria-hidden="true"/></label>;
 return <section className="nx-settings-page"><div className="sectionhead"><div><span className="pill">YOUR WORKSPACE</span><h1>Settings & Preferences</h1><p className="muted">Make NEXORA feel right for you. Your appearance and assistant preferences are saved on this device.</p></div><Settings2 size={24}/></div><div className="nx-settings-layout"><nav className="nx-settings-tabs" aria-label="Settings sections">{tabs.map(([id,label,Icon])=><button key={id} type="button" className={tab===id?"active":""} onClick={()=>setTab(id)}><Icon size={17}/><span>{label}</span><ChevronRight size={15}/></button>)}</nav><div className="nx-settings-content">{tab==="preferences"&&<><div className="nx-settings-card"><div className="nx-settings-card-title"><span className="nx-settings-icon"><span aria-hidden="true">◐</span></span><div><h2>Appearance</h2><p>Choose the look you prefer.</p></div></div><div className="nx-theme-options"><button type="button" className={theme==="dark"?"selected":""} aria-pressed={theme==="dark"} onClick={()=>setTheme("dark")}><span className="nx-theme-preview dark-preview">◐</span><b>Dark mode</b><small>Easy on the eyes in low light</small></button><button type="button" className={theme==="light"?"selected":""} aria-pressed={theme==="light"} onClick={()=>setTheme("light")}><span className="nx-theme-preview light-preview">☼</span><b>Light mode</b><small>Bright, high-contrast workspace</small></button></div></div><div className="nx-settings-card"><div className="nx-settings-card-title"><span className="nx-settings-icon"><Sparkles size={19}/></span><div><h2>Experience</h2><p>Personalise motion and NexBot behaviour.</p></div></div>{switchRow("Reduce animations","Use calmer transitions where supported.",reduceMotion,setReduceMotion)}{switchRow("NexBot helper hints","Show a small welcome hint when NexBot is available.",nexbotHints,setNexbotHints)}{switchRow("NexBot spoken replies","Let NexBot read its latest response aloud when enabled in chat.",voiceReplies,setVoiceReplies)}</div><div className="nx-settings-note"><ShieldCheck size={17}/><span>These choices affect this browser or device only. They do not change your account, payments, or membership.</span></div></>}{tab==="notifications"&&<><div className="nx-settings-card"><div className="nx-settings-card-title"><span className="nx-settings-icon"><Bell size={19}/></span><div><h2>Notifications</h2><p>Control background alerts for this device.</p></div></div><PushNotificationToggle/><p className="muted nx-settings-footnote">You can also manage browser notification permission from your device or browser settings. NEXORA will not override a permission you deny.</p></div><div className="nx-settings-card"><h3>In-app updates</h3><p className="muted">Announcements and account activity remain available inside NEXORA even when background push alerts are off.</p><button type="button" className="secondary" onClick={()=>goPage?.("notifications")}>Open Notification Centre <ArrowRight size={15}/></button></div></>}{tab==="biometrics"&&<><div className="nx-settings-card"><div className="nx-settings-card-title"><span className="nx-settings-icon"><Shield size={19}/></span><div><h2>Biometric login</h2><p>Use your phone’s fingerprint or face authentication to unlock NEXORA.</p></div></div><p className="muted">{!Capacitor.isNativePlatform()?"Biometric controls are available in the installed NEXORA mobile app, not in a regular browser.":biometricChecking?"Checking this device…":!biometricAvailable?"This device does not currently report a supported biometric method. Set up fingerprint or face unlock in your phone settings first.":biometricEnabled?"Enabled on this device. You can turn it off here at any time.":"Available on this device. Enable it to unlock NEXORA with biometrics when you reopen the app."}</p>{Capacitor.isNativePlatform()&&biometricAvailable&&<label className="nx-preference-row"><span><b>Enable biometric login</b><small>Store your current sign-in token in the device’s protected credential store, released only after biometric verification.</small></span><input type="checkbox" checked={biometricEnabled} disabled={biometricBusy||biometricChecking} onChange={e=>toggleBiometrics(e.target.checked)}/><i aria-hidden="true"/></label>}<div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:14}}><button type="button" className="primary" onClick={()=>toggleBiometrics(true)} disabled={biometricBusy||biometricChecking||biometricEnabled}>{biometricBusy?"Please wait…":biometricEnabled?"Biometrics active":"Activate biometrics"}</button><button type="button" className="secondary" onClick={()=>toggleBiometrics(false)} disabled={biometricBusy||biometricChecking||!biometricEnabled}>{biometricBusy?"Please wait…":"Deactivate biometrics"}</button><button type="button" className="secondary" onClick={testBiometrics} disabled={biometricBusy||biometricChecking}>{biometricBusy?"Please wait…":"Test biometrics"}</button></div>{biometricMessage&&<p className="nx-settings-footnote" role="status" aria-live="polite">{biometricMessage}</p>}<div className="nx-settings-note"><ShieldCheck size={17}/><span>Biometrics are optional. Your fingerprint or face data stays with your device; NEXORA does not receive it. You can still use your password if biometrics are unavailable.</span></div></div></>}{tab==="privacy"&&<><div className="nx-settings-card"><div className="nx-settings-card-title"><span className="nx-settings-icon"><ShieldCheck size={19}/></span><div><h2>Account & privacy</h2><p>Review account security and keep sensitive information safe.</p></div></div><ul className="nx-settings-list"><li>Never share your password, M-Pesa PIN, or one-time security codes.</li><li>Appearance and NexBot preferences are stored locally on this device.</li><li>Use the Security Centre to update your profile or change your password.</li></ul><button type="button" className="primary" onClick={()=>goPage?.("security")}>Open Profile & Security <ArrowRight size={15}/></button></div></>}</div></div></section>;
}
function Security({me,reload,strength}){const [name,setName]=useState(me.user.name),[phone,setPhone]=useState(me.user.phone),[oldPass,setOld]=useState(""),[newPass,setNew]=useState(""),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false);const saveProfile=async()=>{setBusy(true);setMsg("");try{const d=await api("/member/profile",{method:"PATCH",body:JSON.stringify({name,phone})});setMsg(d.message);await reload()}catch(e){setMsg(e.message)}finally{setBusy(false)}};const changePassword=async()=>{setBusy(true);setMsg("");try{const d=await api("/member/password",{method:"POST",body:JSON.stringify({currentPassword:oldPass,newPassword:newPass})});setMsg(d.message);setOld("");setNew("")}catch(e){setMsg(e.message)}finally{setBusy(false)}};return <section><div className="sectionhead"><div><span className="pill">ACCOUNT SECURITY</span><h1>Security center</h1><p className="muted">Keep your profile accurate and protect your account.</p></div><Shield size={22}/></div>{msg&&<div className="notice">{msg}</div>}<div className="securitygrid"><div className="panel"><UserCog size={23}/><h3>Profile</h3><label>Name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Phone<input inputMode="tel" value={phone} onChange={e=>setPhone(e.target.value)}/></label><button className="primary" disabled={busy} onClick={saveProfile}>Save profile</button></div><div className="panel"><KeyRound size={23}/><h3>Change password</h3><label>Current password<input type="password" value={oldPass} onChange={e=>setOld(e.target.value)}/></label><label>New password<input type="password" minLength="8" value={newPass} onChange={e=>setNew(e.target.value)} placeholder="8+ characters"/></label><button className="primary" disabled={busy} onClick={changePassword}>Update password</button><button className="secondary" disabled={busy} onClick={async()=>{setBusy(true);try{const d=await api("/member/sessions/revoke",{method:"POST"});if(d.token)localStorage.setItem("token",d.token);setMsg(d.message)}catch(e){setMsg(e.message)}finally{setBusy(false)}}}><LogOut size={15}/> Sign out other sessions</button></div></div><div className="panel"><h3>Security checklist</h3><div className="securitychecks"><span><Check size={15}/> Use a unique password</span><span><Check size={15}/> Never share your M-Pesa PIN</span><span><Check size={15}/> Verify payment references before reporting a problem</span><span><Check size={15}/> Keep your phone number current</span></div><div className="profilemeter"><b>Profile completeness: {strength}%</b><div className="progress"><i style={{width:`${strength}%`}}/></div></div></div></section>}
function PhoneModal({data,onCancel,onContinue,onWallet,walletBalance=0,paymentConfig={}}){
 const [err,setErr]=useState("");
 const [method,setMethod]=useState(paymentConfig?.stkPush?"stkpush":paymentConfig?.paybill?"paybill":"stkpush");
 const [phone,setPhone]=useState(cleanPhone(data?.phone||""));
 const [busy,setBusy]=useState(false);
 const [walletConfirm,setWalletConfirm]=useState(false);
 const [copied,setCopied]=useState(false);
 const pkg=data?.package||null;
 const countryCode=data?.countryCode||"KE";
 const countryName=data?.countryName||COUNTRY_BY_CODE[countryCode]?.name||"your country";
 const isKenya=countryCode==="KE";
 const amount=Number(data?.chargeAmount!=null?data.chargeAmount:pkg?.price)||0;
 const bal=Number(walletBalance||0);
 const canWallet=isKenya&&bal>=amount&&amount>0;
 const cfg=paymentConfig&&typeof paymentConfig==="object"?paymentConfig:{};
 const paybillNumber=String(cfg.paybillNumber||"400200");
 const paybillAccount=String(cfg.paybillAccount||"");
 const paybillName=String(cfg.paybillName||"NEXORA");
 const copyAccount=async()=>{
  if(!paybillAccount)return;
  try{await navigator.clipboard.writeText(paybillAccount);setCopied(true);setTimeout(()=>setCopied(false),2200);}
  catch{try{window.prompt("Copy Co-op account number:",paybillAccount);}catch{}}
 };
 const useWallet=()=>{
  if(!canWallet)return setErr("Insufficient wallet balance for this plan.");
  setErr("");setMethod("wallet");setWalletConfirm(true);
 };
 const confirmWallet=async()=>{
  if(!canWallet||!pkg)return setErr("Unable to use wallet for this plan.");
  setErr("");setWalletConfirm(false);setBusy(true);
  try{await onWallet(pkg);}
  catch(ex){setErr(ex?.message||"Wallet purchase failed");setBusy(false);}
 };
 const submit=async e=>{
  e.preventDefault();
  setErr("");
  if(method==="wallet")return useWallet();
  if(!pkg?.id)return setErr("Plan not found. Close and try again.");
  if(method==="stkpush"&&!validPhone(phone))return setErr("Enter a valid Kenyan M-Pesa number: 07…, 01…, 2547… or 2541….");
  if(method==="stkpush"&&!cfg.stkPush)return setErr("Paystack M-Pesa STK Push is not enabled. Configure PAYSTACK_SECRET_KEY on the NEXORA server first.");
  setBusy(true);setErr(method==="stkpush"?"Sending M-Pesa STK Push…":"Opening Paybill payment window…");
  try{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await onContinue(method==="stkpush"?cleanPhone(phone):null,pkg);}
  catch(ex){setErr(ex?.message||(method==="stkpush"?"Could not start M-Pesa STK Push":"Could not start Paybill payment"));setBusy(false);}
 };

 const kenyaBody=!pkg?(
  <div className="modalbackdrop payment-layer" role="dialog" aria-modal="true" onClick={onCancel}>
   <div className="modal phonemodal" onClick={e=>e.stopPropagation()}>
    <div className="modalhead"><h2>Plan unavailable</h2><button type="button" className="iconbtn" onClick={onCancel}><X size={20}/></button></div>
    <div className="paymentbody"><p className="muted">Close and select a plan again.</p></div>
    <div className="modalfoot"><button type="button" className="secondary" onClick={onCancel}>Close</button></div>
   </div>
  </div>
 ):(
  <div className="modalbackdrop payment-layer" role="dialog" aria-modal="true" aria-label="Pay for plan" onClick={onCancel}>
   <div className="modal phonemodal" onClick={e=>e.stopPropagation()}>
    <div className="modalhead">
     <div><span className="pill">{method==="stkpush"?"PAYSTACK · M-PESA":"CO-OP BANK · LIPA NA M-PESA"}</span><h2>{method==="stkpush"?"Pay with M-Pesa STK Push":"Lipa na M-Pesa Paybill"}</h2><p className="muted small">{method==="stkpush"?"A secure payment prompt will be sent to your phone.":`Paybill ${paybillNumber} · then submit your confirmation code`}</p></div>
     <button type="button" className="iconbtn" onClick={onCancel} aria-label="Close"><X size={20}/></button>
    </div>
    <form className="phonemodalform" onSubmit={submit}>
     <div className="paymentbody phonebody">
      <div className="phonepackage">
       <div><span>Plan</span><strong>{pkg.name||"Plan"}</strong></div>
       <div><span>Amount due</span><strong>{money(amount)}</strong></div>
       <div><span>Wallet balance</span><strong>{money(bal)}</strong></div>
      </div>
      <div className="paymethods">
       {cfg.stkPush&&<button type="button" className={`paymethod ${method==="stkpush"?"active":""}`} disabled={busy} onClick={()=>{setMethod("stkpush");setWalletConfirm(false);setErr("");}}>
        <Smartphone size={18}/><div><b>Paystack M-Pesa STK Push</b><span>Send a secure payment prompt to your phone</span></div>
       </button>}
       {cfg.paybill&&<button type="button" className={`paymethod ${method==="paybill"?"active":""}`} disabled={busy} onClick={()=>{setMethod("paybill");setWalletConfirm(false);setErr("");}}>
        <CreditCard size={18}/><div><b>Lipa na M-Pesa Paybill</b><span>Co-op Bank · Paybill {paybillNumber}</span></div>
       </button>}
       <button type="button" className={`paymethod ${method==="wallet"?"active":""} ${!canWallet?"disabled":""}`} onClick={useWallet} disabled={!canWallet||busy}>
        <WalletCards size={18}/><div><b>Use wallet balance</b><span>{canWallet?`Pay ${money(amount)} from wallet`:`Need ${money(amount)} · you have ${money(bal)}`}</span></div>
       </button>
      </div>
      {method==="stkpush"&&<div className="paybillbox"><label className="fieldlabel">M-Pesa phone number<input required autoComplete="tel" inputMode="tel" maxLength="13" placeholder="07…, 01…, or 2547…" value={phone} onChange={e=>setPhone(e.target.value)} /></label><p className="muted small">Confirm that this number can receive an M-Pesa prompt. Enter your M-Pesa PIN only in the prompt from Safaricom—never on NEXORA.</p><div className="notice"><ShieldCheck size={15}/> Paystack confirms the transaction before NEXORA activates your plan.</div></div>}
      {method==="paybill"&&(
       <div className="paybillbox">
        <div className="paybilltitle"><div><b>{paybillName}</b><span>Co-op Bank</span></div><span className="paybillsecure">LIPA NA M-PESA</span></div>
        <div className="paybilldetails">
         <div><span>1. Business number (Paybill)</span><strong>{paybillNumber}</strong></div>
         <div className="paybillrowcopy"><span>2. Account number</span><div className="paybillaccountvalue"><strong>{paybillAccount||"Configured on server"}</strong>{!!paybillAccount&&<button type="button" className={`copyaccountbtn${copied?" is-copied":""}`} onClick={copyAccount}>{copied?<><Check size={14} className="nx-tick"/> Copied</>:<><Copy size={14}/> Copy</>}</button>}</div></div>
         <div><span>3. Amount</span><strong>{money(amount)}</strong></div>
        </div>
        <ol className="paybillsteps">
         <li>On your phone open <b>M-Pesa</b></li>
         <li>Choose <b>Lipa na M-Pesa</b> → <b>Paybill</b></li>
         <li>Enter business number <b>{paybillNumber}</b></li>
         <li>Enter account number <b>{paybillAccount||"(from server)"}</b></li>
         <li>Enter amount <b>{money(amount)}</b> and your M-Pesa PIN</li>
         <li>Tap Continue below, then enter the SMS confirmation code</li>
        </ol>
        <div className="notice"><Info size={15}/> Never share your M-Pesa PIN. Admin verifies the payment before the plan activates.</div>
       </div>
      )}
      {method==="wallet"&&walletConfirm&&!busy&&(
       <div className="walletconfirmbox">
        <div className="walletconfirmicon"><WalletCards size={22}/></div>
        <div><h3>Confirm wallet payment</h3><p className="muted small">Pay <strong>{money(amount)}</strong> for <strong>{pkg.name}</strong> from your wallet?</p></div>
        <div className="walletconfirmactions">
         <button type="button" className="dangeroutline" onClick={()=>{setWalletConfirm(false);setMethod("paybill");}} disabled={busy}>Cancel</button>
         <button type="button" className="primary" onClick={confirmWallet} disabled={busy}>Yes, use wallet</button>
        </div>
       </div>
      )}
      {method==="wallet"&&busy&&<div className="walletconfirmbox"><p className="muted small"><strong>Processing…</strong></p></div>}
      {err&&<div className="error">{err}</div>}
     </div>
     <div className="modalfoot paymentfoot">
      <button type="button" className="secondary" onClick={onCancel} disabled={busy}>Cancel</button>
      {(method==="paybill"||method==="stkpush")&&<button type="submit" className="primary" disabled={busy}>{busy?"Starting…":method==="stkpush"?"Send M-Pesa STK Push":"Continue to Paybill"}</button>}
     </div>
    </form>
   </div>
  </div>
 );

 const body=!isKenya&&pkg?(
  <div className="modalbackdrop payment-layer" role="dialog" aria-modal="true" aria-label="Payment methods coming soon" onClick={onCancel}>
   <div className="modal phonemodal" onClick={e=>e.stopPropagation()}>
    <div className="modalhead"><div><span className="pill">PAYMENT AVAILABILITY</span><h2>Payment methods coming soon</h2><p className="muted small">{countryName} · {pkg?.name||"Membership plan"}</p></div><button type="button" className="iconbtn" onClick={onCancel} aria-label="Close"><X size={20}/></button></div>
    <div className="paymentbody phonebody"><div className="phonepackage"><div><span>Plan</span><strong>{pkg?.name||"Plan"}</strong></div><div><span>Price</span><strong>{money(pkg?.price||0)}</strong></div></div><div className="notice" style={{marginTop:16}}><Clock3 size={20}/><div><strong>Payment methods coming soon for {countryName}</strong><p className="muted small">You can browse NEXORA and create your account now. Payments and plan activation will become available when a supported payment method for your country is activated.</p></div></div><div className="currencyhint"><span>Displayed in your local currency</span><strong>{currencyState().currency.code}</strong></div></div>
    <div className="modalfoot paymentfoot"><button type="button" className="secondary" onClick={onCancel}>Close</button></div>
   </div>
  </div>
 ):kenyaBody;
 if(typeof document!=="undefined" && document.body && typeof createPortal==="function"){
  return createPortal(body, document.body);
 }
 return body;
}
function PaymentModal({payment,onClose,onReceipt,onSuccess}){
 const [code,setCode]=useState("");
 const [busy,setBusy]=useState(false);
 const [msg,setMsg]=useState("");
 const [status,setStatus]=useState(payment?.status||"pending");
 const [copied,setCopied]=useState(false);
 const [showSteps,setShowSteps]=useState(false);
 const copyAccount=async()=>{
  const a=String(payment?.paybillAccount||"");
  if(!a)return;
  try{await navigator.clipboard.writeText(a);setCopied(true);setTimeout(()=>setCopied(false),2200);}
  catch{try{window.prompt("Copy account:",a);}catch{}}
 };
 const submitted=status==="pending_verification";
 const submitCode=async e=>{
  e.preventDefault();
  const c=String(code||"").trim().toUpperCase().replace(/\s+/g,"");
  if(c.length<8||c.length>15)return setMsg("Enter the M-Pesa confirmation code from your SMS.");
  setBusy(true);setMsg("");
  try{
   const d=await api("/payments/paybill/submit-code",{method:"POST",body:JSON.stringify({reference:payment.reference,mpesaCode:c})});
   setStatus(d.status||"pending_verification");
   setMsg(d.message||"Confirmation code received.");try{nxHaptic(20)}catch{};
  }catch(err){setMsg(err.message||"Could not submit code");}
  finally{setBusy(false);}
 };
 useEffect(()=>{
  if(status!=="pending_verification")return;
  let tries=0,timer;
  const check=async()=>{
   if(tries++>=36)return;
   try{
    const v=await api(`/payments/paybill/status/${payment.reference}`);
    if(v.status==="success"){setStatus("success");onSuccess?.();return;}
    if(v.status==="failed"){setStatus("failed");setMsg(v.message||"Payment was rejected.");return;}
   }catch{}
   timer=setTimeout(check,10000);
  };
  timer=setTimeout(check,10000);
  return()=>clearTimeout(timer);
 },[status,payment?.reference]);
 const isSuccess=status==="success", isFailed=status==="failed";
 const amount=Number(payment?.chargeAmount||payment?.package?.price||0);
 const paybill=payment?.paybillNumber||"400200";
 const account=payment?.paybillAccount||"";

 const body=(
  <div className="modalbackdrop payment-layer" role="dialog" aria-modal="true" onClick={onClose}>
   <div className="modal paymentmodal paybill-compact" onClick={e=>e.stopPropagation()}>
    <div className="modalhead paybill-head">
     <div>
      <span className={`pill ${isSuccess?"payment-success":isFailed?"payment-failed":"payment-pending"}`}>
       {isSuccess?"COMPLETED":isFailed?"FAILED":"LIPA NA M-PESA"}
      </span>
      <h2>{isSuccess?"Payment confirmed":isFailed?"Not confirmed":"Pay with Paybill"}</h2>
     </div>
     <button type="button" className="iconbtn" onClick={onClose} aria-label="Close"><X size={20}/></button>
    </div>

    <div className="paymentbody paybill-body">
     {!isSuccess&&!isFailed&&(
      <div className="paybill-progress" aria-label="Payment steps">
        <div className={`step ${!submitted?"active":"done"}`}><span className="dot">1</span><span>Pay</span></div>
        <div className={`bar ${submitted||isSuccess?"done":""}`}/>
        <div className={`step ${!submitted&&!isSuccess?"active":submitted||isSuccess?"done":""}`}><span className="dot">2</span><span>SMS code</span></div>
        <div className={`bar ${submitted||isSuccess?"done":""}`}/>
        <div className={`step ${submitted&&!isSuccess?"active":isSuccess?"done":""}`}><span className="dot">3</span><span>Waiting</span></div>
      </div>
     )}
     {!isSuccess&&!isFailed&&(
      <ul className="pay-timeline" aria-label="Payment status">
        <li className={!submitted?"active":"done"}><span className="tl-dot">1</span><div className="tl-body"><b>Pay via M-Pesa</b><span>Lipa na M-Pesa → Paybill</span></div></li>
        <li className={!submitted&&!isSuccess?"active":(submitted||isSuccess)?"done":""}><span className="tl-dot">2</span><div className="tl-body"><b>Submit SMS code</b><span>Paste the confirmation code from M-Pesa</span></div></li>
        <li className={submitted&&!isSuccess?"active":isSuccess?"done":""}><span className="tl-dot">3</span><div className="tl-body"><b>Verification</b><span>Plan activates after confirmation</span></div></li>
      </ul>
     )}


     {isSuccess?(
      <div className="successbox">
       <CheckCircle2 size={28}/><h3>Payment verified</h3>
       <p className="muted small">Your {payment.package?.name||"plan"} is active.</p>
       <button type="button" className="secondary narrow" onClick={()=>onReceipt?.({...payment,status:"PAID",amount,method:"M-Pesa Paybill"})}><ReceiptText size={15}/> Receipt</button>
      </div>
     ):isFailed?(
      <div className="error"><b>Payment was not confirmed.</b><p>{msg||"Try again or contact support."}</p></div>
     ):(
      <>
       <div className="paybill-summary">
        <div><span>Plan</span><strong>{payment.package?.name||"—"}</strong></div>
        <div><span>Amount</span><strong>{money(amount)}</strong></div>
        <div><span>Paybill</span><strong>{paybill}</strong></div>
        <div className="paybill-account-row">
         <span>Account</span>
         <strong>{account||"—"}</strong>
         {!!account&&<button type="button" className={`copyaccountbtn${copied?" is-copied":""}`} onClick={copyAccount}>{copied?<><Check size={13} className="nx-tick"/> Copied</>:<><Copy size={13}/> Copy</>}</button>}
        </div>
       </div>

       <button type="button" className="info-chip" onClick={()=>setShowSteps(s=>!s)}>
        {showSteps?"Hide":"How to pay"} on M-Pesa
       </button>
       {showSteps&&(
        <ol className="paybillsteps compact-steps">
         <li>M-Pesa → <b>Lipa na M-Pesa</b> → <b>Paybill</b></li>
         <li>Business no. <b>{paybill}</b></li>
         <li>Account <b>{account||"—"}</b></li>
         <li>Amount <b>{money(amount)}</b> → enter PIN</li>
         <li>Paste the SMS code below</li>
        </ol>
       )}

       {!submitted?(
        <form onSubmit={submitCode} className="paybillcodeform compact-code">
         <label className="fieldlabel">M-Pesa confirmation code
          <input
            required
            value={code}
            onChange={e=>setCode(e.target.value)}
            placeholder="e.g. QH12XXXXXX"
            autoComplete="off"
            inputMode="text"
            spellCheck={false}
          />
         </label>
         <p className="paybill-pin-hint"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Never share your M-Pesa PIN. <span className="muted small code-hint">From the M-Pesa SMS after paying exactly {money(amount)}.</span></p>
         {msg&&<div className="notice">{msg}</div>}
         <button type="submit" className="primary paybill-submit" disabled={busy}>{busy?"Submitting…":"Submit confirmation code"}</button>
        </form>
       ):(
        <div className="notice">
         <LoaderCircle size={15} className="spin"/>
         <strong>Awaiting verification</strong>
         <p className="muted small">Code received. Plan activates after admin confirms the payment.</p>
         {msg&&<p className="muted small">{msg}</p>}
        </div>
       )}
      </>
     )}
    </div>

    <div className="modalfoot paymentfoot">
     <button type="button" className="secondary" onClick={onClose}>{isSuccess?"Done":"Close"}</button>
    </div>
   </div>
  </div>
 );

 if(typeof document!=="undefined"&&document.body&&typeof createPortal==="function"){
  return createPortal(body, document.body);
 }
 return body;
}

function Packages({packages,current,purchase,reload}){
 const buy=typeof purchase==="function"?purchase:(()=>{});
 const list=Array.isArray(packages)?packages:[];
 const sorted=[...list].sort((a,b)=>Number(a.tier||999)-Number(b.tier||999)||Number(a.price)-Number(b.price));
 const currentPrice=Number(current?.price||0);
 const upgradeOnly=sorted.filter(p=>Number(p.price)>currentPrice);
 const [info,setInfo]=useState(null);
 return <section className="plans-compact"><div className="sectionhead"><div><h1>Choose your plan</h1><p className="muted">Pick a plan to unlock referral tools. Results come from the work you put in.</p></div><button className="secondary" onClick={reload}><RefreshCw size={16}/> Refresh</button></div>
 <div className="info-chip-row">
  <button type="button" className="info-chip" onClick={()=>setInfo("earnings")}>How earnings work</button>
  <button type="button" className="info-chip" onClick={()=>setInfo("rules")}>Plan rules</button>
 </div>
 {info&&createPortal(
  <div className="modalbackdrop payment-layer" onClick={()=>setInfo(null)}>
   <div className="modal info-mini-modal" onClick={e=>e.stopPropagation()}>
    <div className="modalhead"><div><span className="pill">INFO</span><h2>{info==="earnings"?"How plan earnings work":"Plan rules"}</h2></div><button type="button" className="iconbtn" onClick={()=>setInfo(null)}><X size={18}/></button></div>
    <div className="paymentbody">
     {info==="earnings"?(
      <><p className="muted">Starter, Growth, Pro and Elite earn through qualifying referrals. Premium can earn across all plan levels and unlocks Advertise.</p>
      <p className="muted">Your plan sets which plan purchases you may earn from: Starter → Starter only; Growth → Starter+Growth; and so on. Premium can earn from all five.</p>
      <p className="muted">Commissions are recorded only when a qualifying referral purchase completes. No income is guaranteed.</p></>
     ):(
      <><p className="muted">Activate a plan to unlock your referral link. Upgrades charge only the price difference.</p>
      <p className="muted">Share honestly. Review membership rules before paying.</p></>
     )}
    </div>
    <div className="modalfoot"><button type="button" className="primary" onClick={()=>setInfo(null)}>Got it</button></div>
   </div>
  </div>, document.body
 )}
 {current&&upgradeOnly.length>0&&<div className="upgradebanner"><div><span className="pill">UPGRADE AVAILABLE</span><h3>Unlock more NEXORA benefits</h3><p className="muted">You already have {current.name}. Upgrading charges the difference between your current plan and the higher plan.</p></div><button className="primary" onClick={()=>buy(upgradeOnly[0])}>See upgrade options</button></div>}
 {sorted.length?<><div className="packages">{sorted.map((p,i)=>{const isCurrent=current?.id===p.id;const isUpgrade=current&&Number(p.price)>currentPrice;const difference=isUpgrade?Number(p.price)-currentPrice:Number(p.price);return <div className={`pkg ${p.popular||(!p.popular&&i===2) ?"featured":""}`} key={p.id}>{(p.popular||(!p.popular&&i===2))&&<div className="popular">{p.badge||"POPULAR"}</div>}<span className="pkgname">{p.name}</span>{p.badge&&!(p.popular||(!p.popular&&i===2))&&<span className="packagebadge">{p.badge}</span>}<h2>{money(p.price)}</h2>{p.description&&<p className="pkgdesc">{p.description}</p>}<div className="commission"><div><b>{money(p.directCommission)}</b><small>Direct referral</small></div><div><b>{money(p.level2Commission)}</b><small>Level 2 referral</small></div></div><ul className="pkgfeatures">{(Array.isArray(p.features)?p.features:(typeof p.features==="string"?[p.features]:[])).map((x,j)=><li key={j}><Check size={14}/>{String(x)}</li>)}</ul>{current&&isUpgrade&&<div className="upgradecost">Upgrade cost: <strong>{money(difference)}</strong></div>}<button className="primary" disabled={isCurrent} onClick={()=>buy(p)}>{isCurrent?<><CheckCircle2 size={16}/> Current plan</>:isUpgrade?"Upgrade plan":"Activate plan"}</button></div>})}</div>
 <div className="comparison"><h2>Why upgrade?</h2><p className="muted">See what each plan unlocks compared to where you are now.</p>
 <div className="planmatrixwrap"><table className="planmatrix"><thead><tr><th>Benefit</th>{sorted.map(p=><th key={p.id} className={current?.id===p.id?"iscurrent":""}>{p.name}{current?.id===p.id&&<small> · you</small>}</th>)}</tr></thead><tbody>
 <tr><td>Price</td>{sorted.map(p=><td key={p.id}>{money(p.price)}</td>)}</tr>
 <tr><td>Direct referral</td>{sorted.map(p=><td key={p.id}>{money(p.directCommission)}</td>)}</tr>
 <tr><td>Level 2 referral</td>{sorted.map(p=><td key={p.id}>{money(p.level2Commission)}</td>)}</tr>
 <tr><td>Earn from plans</td>{sorted.map((p,i)=><td key={p.id}>{sorted.slice(0,i+1).map(x=>x.name).join(", ")}</td>)}</tr>
 <tr><td>Advertising</td>{sorted.map(p=><td key={p.id}>{p.name==="Premium"?<b className="yes">Yes</b>:<span className="no">—</span>}</td>)}</tr>
 <tr><td>Your move</td>{sorted.map(p=>{const isCurrent=current?.id===p.id;const isUpgrade=current&&Number(p.price)>Number(current?.price||0);const diff=isUpgrade?Number(p.price)-Number(current.price):Number(p.price);return <td key={p.id}>{isCurrent?<span className="yes">Current</span>:<button type="button" className="secondary narrow" onClick={()=>buy(p)}>{isUpgrade?`Upgrade ${money(diff)}`:`Activate`}</button>}</td>})}</tr>
 </tbody></table></div>
 <div className="earningtiers">{sorted.map((p,i)=><div key={p.id}><strong>{p.name}</strong><span>Can earn from: {sorted.slice(0,i+1).map(x=>x.name).join(" + ")}</span></div>)}</div><h2>Compare plan benefits</h2><div className="comparisongrid">{sorted.map(p=><div key={p.id}><h3>{p.name}</h3>{p.description&&<p>{p.description}</p>}<ul>{(Array.isArray(p.features)?p.features:(typeof p.features==="string"?[p.features]:[])).map((x,j)=><li key={j}><Check size={14}/>{String(x)}</li>)}</ul><strong>{money(p.directCommission)} direct · {money(p.level2Commission)} Level 2</strong></div>)}</div></div></>:<div className="panel empty"><PackageIcon size={32}/><h3>No plans available</h3><p className="muted">We couldn't load the plan list.</p><button className="primary narrow" onClick={reload}>Reload plans</button></div>}</section>}

function Referrals({data,earnings,me,copy,copyCode,copiedKind,share,packages=[],purchase,reload,initialTab="network"}){
 const ptrRef=usePullToRefresh(()=>reload&&reload());
 const hasPackage=Boolean(me?.package);
 const [tab,setTab]=useState(initialTab==="plans"?"plans":"network");
 const [earnInfo,setEarnInfo]=useState(false);
 return (
  <div className="nx-ptr" ref={ptrRef}>
   <div className="nx-ptr-indicator"><LoaderCircle size={14} className="spin"/> Refreshing…</div>
   <section className="earnsection">
    <div className="sectionhead">
     <div>
      <span className="pill">EARN CENTER</span>
      <h1>Earn with NEXORA</h1>
      <p className="muted">Plans unlock your referral tools. Results come from the work you put in.</p>
     </div>
     {hasPackage&&tab==="network"&&(
      <div className="heroactions compact">
       <button className="secondary" onClick={copy}><Copy size={15}/> Copy link</button>
       <button className="secondary" onClick={()=>waShare(`Hi! Join me on NEXORA — review the plans first. Results follow the work you put in: ${location.origin}/?ref=${me.user.referralCode}`)}><MessageCircle size={15}/> WhatsApp</button>
       <button className="primary" onClick={share}><Share2 size={15}/> Share</button>
      </div>
     )}
    </div>

    <div className="earntabs">
     <button type="button" className={tab==="plans"?"active":""} onClick={()=>setTab("plans")}>Membership plans</button>
     <button type="button" className={tab==="network"?"active":""} onClick={()=>setTab("network")}>Network & referrals</button>
    </div>

    {tab==="plans"&&(
     <div className="earnplans">
      <div className="info-chip-row">
       <button type="button" className="info-chip" onClick={()=>setEarnInfo(true)}>Why a plan is required</button>
      </div>
      {earnInfo&&createPortal(
       <div className="modalbackdrop payment-layer" onClick={()=>setEarnInfo(false)}>
        <div className="modal info-mini-modal" onClick={e=>e.stopPropagation()}>
         <div className="modalhead">
          <div><span className="pill">EARN RULES</span><h2>Purchase a plan to start earning</h2></div>
          <button type="button" className="iconbtn" onClick={()=>setEarnInfo(false)}><X size={18}/></button>
         </div>
         <div className="paymentbody">
          <p className="muted">Commissions are only recorded with an active plan and a qualifying referral purchase. Results depend on your qualifying activity and plan rules.</p>
          <ul className="earnterms">
           <li>Activate a plan to unlock your referral link for earning.</li>
           <li>Commissions follow the plan levels your membership can earn from.</li>
           <li>Upgrades charge only the price difference.</li>
           <li>Review Membership rules, Terms and Privacy before paying.</li>
          </ul>
         </div>
         <div className="modalfoot"><button type="button" className="primary" onClick={()=>setEarnInfo(false)}>Got it</button></div>
        </div>
       </div>,
       document.body
      )}
      <Packages packages={packages} current={me.package} purchase={purchase} reload={reload||(()=>{})}/>
     </div>
    )}

    {tab==="network"&&(
     <div className="earn-network">
      {!hasPackage&&(
       <div className="lockedpanel earnlock">
        <LockKeyhole size={28}/>
        <div>
         <h3>Plan required to start earning</h3>
         <p className="muted">Your referral link and commission tracking unlock after you purchase a membership plan. Choose a plan to begin — commissions follow the published plan rules only.</p>
         <ul className="earnterms compact">
          <li>No active plan = referral link stays locked for earning tools.</li>
          <li>Qualifying referrals are recorded only after a successful plan purchase by your invitee (where rules allow).</li>
          <li>By continuing to plans you confirm you understand results depend on your qualifying activity and plan rules.</li>
         </ul>
         <button type="button" className="primary" onClick={()=>setTab("plans")}><PackageIcon size={16}/> View membership plans</button>
        </div>
       </div>
      )}
      <div className="cards three">
       <Card title="Direct referrals" value={data.direct.length}/>
       <Card title="Level 2 referrals" value={data.level2.length}/>
       <Card title="Commission records" value={earnings.length}/>
      </div>
      <div className="cards three earnings-transparency">
       <Card title="Total commissions" value={money(earnings.reduce((sum,x)=>sum+Number(x.amount||0),0))}/>
       <Card title="Direct commissions" value={money(earnings.filter(x=>Number(x.level)===1).reduce((sum,x)=>sum+Number(x.amount||0),0))}/>
       <Card title="Level 2 commissions" value={money(earnings.filter(x=>Number(x.level)===2).reduce((sum,x)=>sum+Number(x.amount||0),0))}/>
      </div>
      <p className="muted small">These totals include commission records actually created by NEXORA. They are not projections or guaranteed future earnings. Review Orders & Transactions and your wallet for the credited balance and any withdrawal status.</p>
      {hasPackage&&(
       <div className="panel">
        <h3>Referral link</h3>
        <div className="copybox">
         <span>{location.origin}/?ref={me.user.referralCode}</span>
         <button className={copiedKind==="link"?"is-copied":""} onClick={copy}>{copiedKind==="link"?<><Check size={16} className="nx-tick"/> Copied</>:<><Copy size={16}/> Copy</>}</button>
        </div>
        <div className="heroactions compact" style={{marginTop:10}}>
         <button className={`secondary${copiedKind==="code"?" is-copied":""}`} onClick={copyCode}>{copiedKind==="code"?<><Check size={15} className="nx-tick"/> Copied</>:<><CopyCheck size={15}/> Copy code</>}</button>
        </div>
        {(copiedKind==="link"||copiedKind==="code")&&(
         <p className="muted small copyhint">{copiedKind==="code"?"Referral code copied — share it when someone registers.":"Referral link copied — paste it in WhatsApp or SMS."}</p>
        )}
       </div>
      )}
      <div className="grid2">
       <div className="panel">
        <h3>Direct referrals</h3>
        {data.direct.length?data.direct.map(x=>(
         <div className="row simple" key={x.id}><div><b>{x.name}</b><small>{x.email}</small></div><span>{x.package?.name||"No plan"}</span></div>
        )):(
         <div className="smartempty">
          <p className="muted">No direct referrals yet.</p>
          {hasPackage?<button type="button" className="secondary narrow" onClick={share}>Share your link</button>:<button type="button" className="secondary narrow" onClick={()=>setTab("plans")}>Get a plan first</button>}
         </div>
        )}
       </div>
       <div className="panel">
        <h3>Level 2 referrals</h3>
        {data.level2.length?data.level2.map(x=>(
         <div className="row simple" key={x.id}><div><b>{x.name}</b><small>{x.email}</small></div><span>{x.package?.name||"No plan"}</span></div>
        )):(
         <p className="muted">No Level 2 referrals yet.</p>
        )}
       </div>
      </div>
      <div className="panel">
       <h3>Recent commissions</h3>
       {earnings.length?earnings.map(x=>(
        <div className="row simple" key={x.id}><div><b>{x.level===1?"Direct":"Level 2"} referral</b><small>{x.sourceUser?.name||"Member"}</small></div><strong className="green">+{money(x.amount)}</strong></div>
       )):(
        <div className="smartempty">
         <p className="muted">No commissions yet.</p>
         {!hasPackage&&<button type="button" className="secondary narrow" onClick={()=>setTab("plans")}>Purchase a plan to earn</button>}
        </div>
       )}
      </div>
     </div>
    )}
   </section>
  </div>
 );
}


function Card({title,value}){return <div className="stat"><span>{title}</span><strong>{value}</strong><ArrowUpRight size={18}/></div>}
function PaystackPaymentModal({payment,onClose,onReceipt,onSuccess}){
 const [status,setStatus]=useState(String(payment?.status||"pending").toLowerCase());
 const [msg,setMsg]=useState(payment?.display_text||payment?.message||"");
 const [busy,setBusy]=useState(false);
 const isDeposit=payment?.paymentType==="DEPOSIT"||String(payment?.reference||"").startsWith("NX-PS-DEP-");
 const endpoint=isDeposit?`/wallet/deposit/status/${encodeURIComponent(payment.reference)}`:`/payments/status/${encodeURIComponent(payment.reference)}`;
 const check=async(silent=false)=>{
  if(busy&&!silent)return;
  setBusy(true);
  try{
   const d=await api(endpoint);
   const next=String(d.status||"pending").toLowerCase();
   setStatus(next);setMsg(d.message||d.display_text||msg);
   if(next==="success"&&status!=="success")onSuccess?.();
  }catch(e){if(!silent)setMsg(e.message||"Could not verify payment status yet.");}
  finally{setBusy(false)}
 };
 useEffect(()=>{
  if(status!=="pending")return;
  let stopped=false,timer,tries=0;
  const poll=async()=>{
   if(stopped||tries++>=36)return;
   try{
    const d=await api(endpoint);
    if(stopped)return;
    const next=String(d.status||"pending").toLowerCase();
    setStatus(next);setMsg(d.message||d.display_text||"");
    if(next==="success"){onSuccess?.();return;}
    if(next==="failed")return;
   }catch{}
   if(!stopped)timer=setTimeout(poll,10000);
  };
  timer=setTimeout(poll,10000);
  return()=>{stopped=true;clearTimeout(timer)};
 },[status,endpoint]);
 const isSuccess=status==="success",isFailed=status==="failed";
 const amount=Number(payment?.amount??payment?.chargeAmount??payment?.package?.price??0);
 return <div className="modalbackdrop payment-layer" role="dialog" aria-modal="true" aria-label="NEXORA M-Pesa payment" onClick={onClose}><div className="modal paymentmodal" onClick={e=>e.stopPropagation()}>
  <div className="modalhead"><div><span className={`pill ${isSuccess?"payment-success":isFailed?"payment-failed":"payment-pending"}`}>NEXORA · M-PESA</span><h2>{isSuccess?"Payment confirmed":isFailed?"Payment not completed":"Check your phone"}</h2><p className="muted small">{payment?.package?.name?`${payment.package.name} membership plan`:"NEXORA wallet deposit"}</p></div><button type="button" className="iconbtn" onClick={onClose} aria-label="Close"><X size={20}/></button></div>
  <div className="paymentbody">
   {isSuccess?<div className="successbox"><CheckCircle2 size={32}/><h3>{isDeposit?"Wallet credited":"Your plan is active"}</h3><p className="muted">NEXORA confirmed this payment successfully.</p><div className="paymentdetails"><div><span>Amount</span><strong>{money(amount)}</strong></div><div><span>Reference</span><strong>{payment.reference}</strong></div></div><button type="button" className="secondary narrow" onClick={()=>onReceipt?.({...payment,amount,method:"Paystack M-Pesa STK Push",status:"PAID"})}><ReceiptText size={15}/> View receipt</button></div>:isFailed?<div className="error"><b>Payment failed or was abandoned.</b><p>NEXORA could not complete this payment. Your wallet has not been credited and your plan has not been activated. Please try again later.</p><button type="button" className="primary" onClick={onClose}>Close</button></div>:<><div className="paymentstatus"><div className="paymenticon pending"><LoaderCircle size={28} className="spin"/></div><div><b>Approve the M-Pesa prompt</b><p className="muted">Check the phone number below and enter your M-Pesa PIN in the prompt from Safaricom. Do not enter your PIN on NEXORA.</p></div></div><div className="paymentdetails"><div><span>Amount</span><strong>{money(amount)}</strong></div><div><span>Phone</span><strong>{payment?.phone||"M-Pesa number"}</strong></div><div><span>Reference</span><strong>{payment.reference}</strong></div></div>{payment?.display_text&&<div className="notice">{payment.display_text}</div>}{msg&&<div className="notice" role="status">{msg}</div>}<button type="button" className="primary" disabled={busy} onClick={()=>check(false)}><RefreshCw size={16}/> {busy?"Checking…":"Check payment status"}</button><p className="muted small">Closing this window will not cancel the request. Pending payments remain visible in Orders & Transactions, and NEXORA verifies the payment before providing value.</p></>}
  </div><div className="modalfoot"><button type="button" className="secondary" onClick={onClose}>{isSuccess?"Done":"Close"}</button></div>
 </div></div>;
}

function DepositModal({onClose,load,countryCode="KE",countryName="Kenya",defaultPhone="",paymentConfig={}}){
 const [amount,setAmount]=useState(""),[phone,setPhone]=useState(cleanPhone(defaultPhone)),[step,setStep]=useState("form"),[payment,setPayment]=useState(null),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 const quickAmountsRef=useRef(null);
 const scrollQuickAmounts=direction=>quickAmountsRef.current?.scrollBy({left:direction*220,behavior:"smooth"});
 const initiate=async e=>{
  e.preventDefault();setMsg("");
  const n=Number(amount);
  if(!Number.isInteger(n)||n<100)return setMsg("Enter a whole deposit amount of at least KSh 100.");
  if(!validPhone(phone))return setMsg("Enter a valid Kenyan M-Pesa number: 07…, 01…, 2547… or 2541….");
  if(!paymentConfig?.stkPush)return setMsg("Paystack M-Pesa STK Push is not enabled on the server yet. Configure PAYSTACK_SECRET_KEY on Render, then reload NEXORA.");
  setBusy(true);
  try{
   const d=await api("/wallet/deposit/initiate",{method:"POST",body:JSON.stringify({amount:n,phone:cleanPhone(phone)})});
   setPayment(d);setMsg(d.message||"");
   if(d.status==="success"){setStep("done");await load(false)}else if(d.status==="failed")setStep("failed");else setStep("waiting");
  }catch(e){setMsg(e.message||"Unable to start the M-Pesa payment.");}
  finally{setBusy(false)}
 };
 const check=async()=>{
  if(!payment?.reference)return;
  setBusy(true);
  try{
   const v=await api(`/wallet/deposit/status/${encodeURIComponent(payment.reference)}`);
   setPayment(x=>({...x,status:v.status||x.status,display_text:v.display_text||x.display_text,message:v.message||x.message}));
   setMsg(v.message||v.display_text||"");
   if(v.status==="success"){setStep("done");await load(false)}else if(v.status==="failed")setStep("failed");
  }catch(e){setMsg(e.message||"Could not check payment status.");}
  finally{setBusy(false)}
 };
 useEffect(()=>{
  if(step!=="waiting"||!payment?.reference)return;
  let tries=0,timer,stopped=false;
  const poll=async()=>{
   if(stopped||tries++>=36)return;
   try{
    const v=await api(`/wallet/deposit/status/${encodeURIComponent(payment.reference)}`);
    if(stopped)return;
    setPayment(x=>({...x,status:v.status||x.status,display_text:v.display_text||x.display_text,message:v.message||x.message}));
    if(v.status==="success"){setStep("done");setMsg(v.message||"Deposit confirmed and wallet credited.");await load(false);return}
    if(v.status==="failed"){setStep("failed");setMsg(v.message||"The payment failed.");return}
    if(v.message||v.display_text)setMsg(v.message||v.display_text);
   }catch{}
   if(!stopped)timer=setTimeout(poll,10000);
  };
  timer=setTimeout(poll,10000);
  return()=>{stopped=true;clearTimeout(timer)};
 },[step,payment?.reference]);
 const title=countryCode!=="KE"?"Payment methods coming soon":step==="form"?"Deposit to wallet":step==="done"?"Deposit successful":step==="failed"?"Deposit failed":"M-Pesa STK Push";
 const body = <div className="modalbackdrop payment-layer depositbackdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}><div className="modal depositmodal" onClick={e=>e.stopPropagation()}>
  <div className="modalhead"><div><span className="pill">WALLET DEPOSIT · PAYSTACK</span><h2>{title}</h2></div><button type="button" className="iconbtn" onClick={onClose} aria-label="Close"><X size={20}/></button></div>
  <div className="depositbody">
   {countryCode!=="KE"?<div className="successbox"><Clock3 size={34}/><h3>Payment methods coming soon</h3><p className="muted">Wallet deposits are not yet enabled for {countryName||"your country"}.</p><button type="button" className="primary" onClick={onClose}>Close</button></div>:step==="form"&&<form onSubmit={initiate}>
    <p className="muted">Enter an amount and Kenyan M-Pesa number. Paystack sends the prompt to your phone; NEXORA credits your wallet only after Paystack confirms a successful payment.</p>
    <div className="depositamountcard"><div className="depositamounttop"><div><span className="depositamountlabel">DEPOSIT AMOUNT</span><b>How much would you like to add?</b></div><div className="depositmethodpill"><Smartphone size={14}/> M-Pesa STK Push</div></div>
     <label className="depositamountfield"><span className="currencybadge">KSh</span><input required inputMode="numeric" type="number" min="100" step="1" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9]/g,""))} aria-label="Deposit amount in Kenyan shillings"/><span className="depositamountsuffix">KES</span></label>
     <div className="depositquicksection"><div className="depositquickcaption"><span>Quick select</span><small>Scroll sideways for amounts</small></div><div className="depositquickwrap"><button type="button" className="depositquicknav" aria-label="Scroll amounts left" onClick={()=>scrollQuickAmounts(-1)}><ChevronLeft size={17}/></button><div className="depositquick" ref={quickAmountsRef} tabIndex={0} role="group" aria-label="Quick deposit amounts">{[500,1000,2000,5000].map(v=><button key={v} type="button" className={Number(amount)===v?"selected":""} onClick={()=>setAmount(String(v))}>KSh {v.toLocaleString()}</button>)}</div><button type="button" className="depositquicknav" aria-label="Scroll amounts right" onClick={()=>scrollQuickAmounts(1)}><ChevronRight size={17}/></button></div></div>
     <div className="depositamountfoot"><span><ShieldCheck size={14}/> Server-side verification</span><span>Minimum KSh 100</span></div>
    </div>
    <label className="fieldlabel" style={{display:"block",marginTop:14}}>M-Pesa phone number<input required autoComplete="tel" inputMode="tel" maxLength="13" placeholder="07…, 01…, or 2547…" value={phone} onChange={e=>setPhone(e.target.value)} /></label>
    {msg&&<div className="error" role="alert">{msg}</div>}
    <button className="primary" disabled={busy}>{busy?"Sending STK Push…":"Send M-Pesa STK Push"}</button>
   </form>}
   {step==="waiting"&&payment&&<div className="paymentbody"><div className="paymentstatus"><div className="paymenticon pending"><LoaderCircle size={28} className="spin"/></div><div><b>Check your phone for the M-Pesa prompt</b><p className="muted">Approve the prompt with your M-Pesa PIN. Keep this window open while Paystack confirms your payment.</p></div></div><div className="paymentdetails"><div><span>Amount</span><strong>{money(payment.amount)}</strong></div><div><span>Phone</span><strong>{payment.phone||phone}</strong></div><div><span>Reference</span><strong>{payment.reference}</strong></div></div>{payment.display_text&&<div className="notice">{payment.display_text}</div>}{msg&&<div className="notice" role="status">{msg}</div>}<button className="primary" disabled={busy} onClick={check}><RefreshCw size={16}/> {busy?"Checking…":"Check payment status"}</button><p className="muted small">NEXORA checks Paystack directly as well as listening for verified payment notifications. An abandoned or incomplete prompt will not credit your wallet.</p></div>}
   {step==="done"&&<div className="successbox"><CheckCircle2 size={34}/><h3>Deposit verified</h3><p className="muted">Your wallet has been credited successfully.</p><p className="muted small">Reference: {payment?.reference}</p><button className="primary" onClick={onClose}>Done</button></div>}
   {step==="failed"&&<div className="error"><b>Payment was not completed.</b><p>{msg||payment?.message||"No money was credited. Please try again."}</p><button className="primary" onClick={()=>{setStep("form");setPayment(null);setMsg("")}}>Try again</button></div>}
  </div><div className="modalfoot"><button type="button" className="secondary" onClick={onClose}>{step==="done"?"Close":"Cancel"}</button></div>
 </div></div>;
 if(typeof document!=="undefined"&&document.body&&typeof createPortal==="function") return createPortal(body,document.body);
 return body;
}

function Wallet({me,load,paymentConfig={}}){
 const [tab,setTab]=useState("balance"),[depositOpen,setDepositOpen]=useState(false);const [amount,setAmount]=useState(""),[phone,setPhone]=useState(me.user.phone||""),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false),[withdrawals,setWithdrawals]=useState([]);
 const loadWithdrawals=async()=>{try{const next=await api("/withdrawals");const changed=withdrawals.some(old=>next.some(row=>row.id===old.id&&String(row.status)!==String(old.status)));setWithdrawals(next);if(changed)await load()}catch{}};
 useEffect(()=>{loadWithdrawals()},[me.user.id]);
 useEffect(()=>{if(!withdrawals.some(w=>["PENDING","PROCESSING"].includes(String(w.status||"").toUpperCase())))return;const timer=window.setInterval(()=>{loadWithdrawals()},15000);return()=>window.clearInterval(timer)},[withdrawals]);
 const withdraw=async()=>{setMsg("");const n=Number(amount);if(!Number.isInteger(n)||n<100)return setMsg("Enter a whole wallet withdrawal amount of at least KSh 100.");const calc=withdrawalBreakdown(n);if(!calc.valid)return setMsg("This amount does not fit the current Paystack M-PESA fee calculation. Adjust it slightly and review the updated payout preview before submitting.");if(n>Number(me.wallet?.balance||0))return setMsg(`Your available wallet balance must cover the total deduction of ${money(n)}.`);if(calc.payoutAmount<10)return setMsg("After fees, the M-PESA payout must be at least KSh 10.");if(!validPhone(phone))return setMsg("Enter a valid Kenyan phone number: 07…, 01…, 2547… or 2541…. ");const available=Number(me.wallet?.balance||0),risk=n>=10000||(available>=5000&&n>=5000&&n>=available*0.75);const confirmText=`Please confirm your withdrawal details:\n\nTotal wallet debit: ${money(n)}\nNEXORA fee: ${money(calc.fee)}\nPaystack fee: ${money(calc.paystackFee)}\nExpected M-PESA payout: ${money(calc.payoutAmount)}\nDestination: ${cleanPhone(phone)}\n\n${risk?"IMPORTANT: This amount is large or unusually high compared with your balance. If confirmed, it will be held for manual review before any payout starts. Incorrect or suspicious requests may be investigated; confirmed misuse may lead to a plan downgrade or account restrictions after review.":"Please ensure the amount and recipient are correct. Incorrect or suspicious requests may be reviewed."}\n\nDo you confirm this exact amount and recipient?`;if(!(await showNexoraWithdrawalConfirm(confirmText)))return;setBusy(true);try{const d=await api("/withdrawals",{method:"POST",body:JSON.stringify({amount:n,phone:cleanPhone(phone),amountConfirmed:true,confirmSuspiciousAmount:risk})});setMsg(`${d.message} Wallet debit: ${money(d.totalDebit??n)}; NEXORA fee: ${money(d.fee??calc.fee)}; Paystack fee: ${money(d.paystackFee??calc.paystackFee)}; M-PESA payout: ${money(d.payoutAmount??d.amount??calc.payoutAmount)}. Reference: ${d.reference}`);setAmount("");await load();await loadWithdrawals()}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 return <section className="nx-one-primary"><div className="sectionhead"><div><span className="pill">WALLET</span><h1>Balance & funds</h1><p className="muted">Manage your available balance, add funds and request withdrawals.</p></div></div>
 <div className="how-row">
  <button type="button" className="how-chip" onClick={e=>{const p=e.currentTarget.parentElement.nextElementSibling;p.classList.toggle("open");e.currentTarget.classList.toggle("open")}}>How deposits work</button>
  <button type="button" className="how-chip" onClick={e=>{const p=e.currentTarget.parentElement.nextElementSibling;const n=p?.nextElementSibling;n?.classList.toggle("open");e.currentTarget.classList.toggle("open")}}>How withdrawals work</button>
 </div>
 <div className="how-panel">Enter your amount and M-Pesa number, approve the Paystack STK Push on your phone, and wait for payment verification before your wallet is credited.</div>
 <div className="how-panel">The amount you enter is the total deducted from your wallet (minimum KSh 100). NEXORA deducts its 5% fee (rounded up to the next whole KSh) and Paystack's applicable M-PESA transfer fee from that total, then sends the remaining amount to your M-PESA number. Routine withdrawals proceed automatically when enabled. Large or unusual amounts may be held for a manual safety review before payout.</div>
<div className="walletbig"><span>Available balance</span><strong>{money(me.wallet?.balance)}</strong><p>Total earned {money(me.wallet?.totalEarned)} · Pending {money(me.wallet?.pendingBalance)} · Withdrawn {money(me.wallet?.totalWithdrawn)}</p></div><div className="wallettabs"><button className={tab==="balance"?"active":""} onClick={()=>setTab("balance")}>Balance</button><button className={tab==="deposit"?"active":""} onClick={()=>setTab("deposit")}>Deposit</button><button className={tab==="withdraw"?"active":""} onClick={()=>setTab("withdraw")}>Withdraw</button></div>{tab==="balance"&&<div className="walletsummarygrid"><div className="panel"><h3>Available</h3><strong className="walletmetric">{money(me.wallet?.balance)}</strong><p className="muted">Funds currently available for eligible wallet purchases or withdrawals.</p></div><div className="panel"><h3>Pending</h3><strong className="walletmetric">{money(me.wallet?.pendingBalance)}</strong><p className="muted">Funds currently reserved for withdrawal processing.</p></div><div className="panel"><h3>Total earned</h3><strong className="walletmetric">{money(me.wallet?.totalEarned)}</strong><p className="muted">Recorded earnings credited to your wallet over time.</p></div></div>}{tab==="deposit"&&<div className="panel formpanel">{me.user.countryCode==="KE"?<><h3>Deposit to wallet</h3><p className="muted">Add funds through Paystack M-Pesa STK Push. Your wallet is credited only after the payment is verified.</p><button className="primary" onClick={()=>setDepositOpen(true)}><Smartphone size={16}/> Deposit via M-Pesa STK Push</button><p className="muted small">Minimum deposit: {money(100)}. Never share your M-Pesa PIN with anyone.</p></>:<><h3>Payment methods coming soon</h3><p className="muted">Wallet deposits are not yet enabled for {me.user.countryName||"your country"}. We’ll show the available payment method here when it is activated.</p><div className="notice"><Clock3 size={16}/> Payment methods coming soon</div></>}</div>}{tab==="withdraw"&&<div className="panel formpanel">{me.user.countryCode==="KE"?<><h3>Request withdrawal</h3>{msg&&<div className="notice">{msg}</div>}<label className="withdraw-input-label">Total amount to withdraw from wallet (KES)<input type="number" min="100" step="1" placeholder="Minimum KSh 100" value={amount} onChange={e=>setAmount(e.target.value)}/></label>{Number.isInteger(Number(amount))&&Number(amount)>=100&&(()=>{const calc=withdrawalBreakdown(Number(amount));return <div className="withdrawal-fee-preview"><div><span>Total deducted from wallet</span><strong>{money(calc.totalDebit)}</strong></div><div><span>NEXORA fee (5%)</span><strong>{money(calc.fee)}</strong></div><div><span>Paystack M-PESA transfer fee</span><strong>{calc.valid?money(calc.paystackFee):"Needs adjustment"}</strong></div><div className="withdrawal-total"><span>You receive in M-PESA</span><strong>{calc.valid?money(calc.payoutAmount):"—"}</strong></div>{!calc.valid&&<small className="withdrawal-fee-warning">This amount sits on a Paystack fee boundary. Adjust it slightly to get an exact payout calculation.</small>}{calc.totalDebit>Number(me.wallet?.balance||0)&&<small className="withdrawal-fee-warning">Your available balance is too low to cover this total deduction.</small>}</div>})()}<label className="withdraw-input-label">M-Pesa number<input inputMode="tel" maxLength="13" placeholder="07…, 01…, 2547… or 2541…" value={phone} onChange={e=>setPhone(e.target.value)}/></label><p className="muted small phonehint">Accepted: 07xxxxxxxx · 01xxxxxxxx · 2547xxxxxxxx · 2541xxxxxxxx</p><button disabled={busy||(Number.isInteger(Number(amount))&&Number(amount)>=100&&!withdrawalBreakdown(Number(amount)).valid)} className="primary" onClick={withdraw}>{busy?"Submitting…":"Request withdrawal"}</button><p className="muted small">Minimum wallet withdrawal: {money(100)}. Your 5% NEXORA fee (rounded up to a whole KSh) and Paystack's applicable M-PESA transfer fee are both deducted from the amount you enter. The preview shows your exact expected payout before you submit. Paystack processes the transfer automatically; your status updates after Paystack confirms the result.</p>{withdrawals.length>0&&<div className="withdrawalhistory"><h3>Recent withdrawal requests</h3>{withdrawals.map(w=><div className="row simple" key={w.id}><div><b>{money(w.payoutAmount??w.amount)} to M-PESA · {w.phone}</b><small>Wallet debit {money(w.totalDebit??w.requestedAmount??w.amount)} · NEXORA {money(w.fee??withdrawalFee(w.requestedAmount??w.amount))} · Paystack {money(w.paystackFee??paystackMpesaTransferFee(w.payoutAmount??w.amount))}</small><small>{new Date(w.createdAt).toLocaleString()} · {w.reference}</small><small>{w.reviewRequired&&String(w.status||"").toUpperCase()==="PENDING"?"Safety review required. The amount is reserved; no payout has started. Please wait for NEXORA review.":String(w.status||"").toUpperCase()==="PENDING"?"Request received; waiting for transfer processing.":String(w.status||"").toUpperCase()==="PROCESSING"?"Paystack is processing this transfer. Do not submit another withdrawal for the same amount.":String(w.status||"").toUpperCase()==="PAID"?"Paystack confirmed this transfer as paid.":String(w.status||"").toUpperCase()==="FAILED"?"This request failed. Check that the reserved amount has returned to your available balance; contact NEXORA support if it has not.":"Status is being checked."}</small>{w.updatedAt&&<small>Last updated {new Date(w.updatedAt).toLocaleString()}</small>}</div><div className="transactionright"><small className={`txstatus ${String(w.status||"").toLowerCase()}`}>{w.status}</small></div></div>)}</div>}</>:<><h3>Withdrawals coming soon</h3><p className="muted">Withdrawal methods are not yet enabled for {me.user.countryName||"your country"}. Your wallet balance remains visible while we prepare local payment support.</p><div className="notice"><Clock3 size={16}/> Withdrawal methods coming soon</div></>}</div>}{depositOpen&&<DepositModal onClose={()=>setDepositOpen(false)} load={load} countryCode={me.user.countryCode||"KE"} countryName={me.user.countryName||"your country"} defaultPhone={me.user.phone||""} paymentConfig={paymentConfig}/>}</section>}
function ReceiptModal({receipt,onClose}){return <div className="modalbackdrop" onClick={onClose}><div className="modal receiptmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill payment-success">PAYMENT RECEIPT</span><h2>Payment successful</h2></div><button className="iconbtn" onClick={onClose}><X size={20}/></button></div><div className="receiptbody nx-receipt"><div className="receiptcheck"><CheckCircle2 size={34}/><div><strong>Payment confirmed</strong><span>Your transaction was recorded successfully.</span></div></div><div className="receiptgrid"><div><span>Item</span><strong>{receipt.package?.name||receipt.type||"NEXORA payment"}</strong></div><div><span>Amount paid</span><strong>{money(receipt.amount)}</strong></div><div><span>Payment method</span><strong>{receipt.method||"NEXORA Wallet"}</strong></div><div><span>Status</span><strong className="receiptpaid">{receipt.status||"PAID"}</strong></div><div><span>Reference</span><strong>{receipt.reference}</strong></div><div><span>Date</span><strong>{new Date(receipt.createdAt||Date.now()).toLocaleString()}</strong></div>{receipt.previousBalance!==undefined&&<div><span>Previous balance</span><strong>{money(receipt.previousBalance)}</strong></div>}{receipt.remainingBalance!==undefined&&<div><span>Remaining balance</span><strong>{money(receipt.remainingBalance)}</strong></div>}</div><div className="notice"><ShieldCheck size={16}/> Keep this reference if you ever need help with this payment.</div></div><div className="modalfoot"><button className="secondary" onClick={onClose}>Close</button><button className="primary" onClick={()=>window.print()}><ReceiptText size={16}/> Print / Save receipt</button></div></div></div>}

function Transactions({rows,onOpenPending,onOpenReceipt}){
 return <section><div className="sectionhead"><div><span className="pill">ACCOUNT RECORDS</span><h1>Orders & Transactions</h1><p className="muted">Review payments, references and account activity. Check pending Paystack attempts before starting another payment.</p></div></div><div className="panel">{rows.length?rows.map(x=>{
  const status=String(x.status||"").toUpperCase();
  const isPaystack=String(x.metadata?.method||"").toUpperCase().startsWith("PAYSTACK")||String(x.reference||"").startsWith("NX-PS-");
  const canCheckPaystack=isPaystack&&["PENDING","FAILED"].includes(status)&&["DEPOSIT","PACKAGE_PURCHASE"].includes(x.type);
  const canCheckLegacyPlan=status==="PENDING"&&x.type==="PACKAGE_PURCHASE";
  const statusHint=status==="PENDING"?"Waiting for confirmation or review.":status==="SUCCESS"?"Confirmed and recorded in your account.":status==="FAILED"?"Not completed. Check with support before retrying.":"Status: "+status.toLowerCase()+".";
  return <div className="row simple" key={x.id}><div><b>{x.type.replaceAll("_"," ")}</b><small>{new Date(x.createdAt).toLocaleString()} · {x.reference}</small></div><div className="transactionright"><strong>{money(x.amount)}</strong><small className={`txstatus ${String(x.status||"").toLowerCase()}`}>{x.status}</small><small className="statushint">{statusHint}</small>{(canCheckPaystack||canCheckLegacyPlan)&&<button className="txcheck" onClick={()=>onOpenPending(x)}><RefreshCw size={13}/> Check payment</button>}{status==="SUCCESS"&&<button className="txcheck" onClick={()=>onOpenReceipt(x)}><ReceiptText size={13}/> View receipt</button>}</div></div>
 }):<div className="smartempty"><p>No transactions yet.</p></div>}</div></section>
}

class NEXORAErrorBoundary extends React.Component {
 constructor(props){super(props);this.state={error:null};}
 static getDerivedStateFromError(error){return{error};}
 componentDidCatch(error,info){try{console.error("NEXORA UI error",error,info);}catch{}}
 render(){
  if(!this.state.error)return this.props.children;
  const msg=String(this.state.error?.message||this.state.error||"Unknown UI error");
  return <div className="app-error-screen"><div className="app-error-card"><span className="pill">NEXORA</span><h1>Something went wrong</h1><p className="muted">This screen could not be displayed. Your account data is safe.</p><p className="error" style={{marginTop:12,textAlign:"left",fontSize:12,wordBreak:"break-word"}}>{msg}</p><div className="rowactions"><button className="secondary" onClick={()=>window.location.reload()}><RefreshCw size={16}/> Reload NEXORA</button><button className="primary" onClick={()=>this.setState({error:null})}>Try again</button></div></div></div>;
 }
}
function NativeLaunchSplash(){
 const [visible,setVisible]=useState(()=>Capacitor.isNativePlatform());
 useEffect(()=>{
  if(!Capacitor.isNativePlatform())return;
  let cancelled=false;
  // Keep Android's native launch screen covering the WebView while the page
  // loads. This branded React layer is already mounted before we release it.
  const handoff=async()=>{
   try{
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    if(!cancelled)await SplashScreen.hide({fadeOutDuration:220});
   }catch(error){try{console.warn("NEXORA native splash handoff",error);}catch{}}
  };
  handoff();
  const timer=window.setTimeout(()=>setVisible(false),2600);
  return ()=>{cancelled=true;window.clearTimeout(timer);};
 },[]);
 if(!visible)return null;
 return <div className="nx-native-launch-splash" role="status" aria-label="NEXORA is starting">
  <div className="nx-launch-glow"/>
  <div className="nx-launch-brand">
   <img src="/nexora-logo.png" alt="NEXORA" onError={e=>{e.currentTarget.style.display="none";const fallback=e.currentTarget.parentElement?.querySelector(".nx-launch-fallback");if(fallback)fallback.style.display="block";}}/><div className="nx-launch-fallback" aria-label="NEXORA" style={{display:"none"}}>NEXORA</div>
   <div className="nx-launch-motto">CONNECT. GROW. EARN.</div>
   <div className="nx-launch-line"><span/></div>
  </div>
  <style>{`
   .nx-native-launch-splash{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#07090d;color:#f5f7ff;animation:nxLaunchFadeOut .55s ease 2.05s forwards}
   .nx-launch-glow{position:absolute;width:min(78vw,420px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(40,113,255,.20) 0%,rgba(40,113,255,.07) 42%,transparent 72%);filter:blur(10px);animation:nxLaunchGlow 1.7s ease-in-out infinite alternate}
   .nx-launch-brand{position:relative;width:min(82vw,420px);display:flex;flex-direction:column;align-items:center;gap:22px;animation:nxLaunchForm .9s cubic-bezier(.2,.8,.2,1) both}
   .nx-launch-brand img{display:block;max-width:100%;max-height:34vh;object-fit:contain;filter:drop-shadow(0 0 18px rgba(69,137,255,.24));animation:nxLaunchPulse 2s ease-in-out infinite}
    .nx-launch-fallback{font:900 clamp(36px,10vw,64px)/1 system-ui,-apple-system,sans-serif;letter-spacing:.16em;color:#f5f7ff;text-shadow:0 0 28px rgba(69,137,255,.48);animation:nxLaunchPulse 2s ease-in-out infinite}
   .nx-launch-motto{font:700 clamp(12px,3.2vw,16px)/1.4 system-ui,-apple-system,sans-serif;letter-spacing:.22em;text-align:center;color:#f5f7ff;text-shadow:0 0 18px rgba(86,147,255,.28);white-space:nowrap}
   .nx-launch-line{width:118px;height:2px;border-radius:99px;background:rgba(255,255,255,.12);overflow:hidden}
   .nx-launch-line span{display:block;width:45%;height:100%;border-radius:99px;background:linear-gradient(90deg,#4a8dff,#b9d6ff);animation:nxLaunchProgress 1.25s ease-in-out infinite}
   @keyframes nxLaunchForm{from{opacity:0;transform:translateY(14px) scale(.94);filter:blur(5px)}to{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}
   @keyframes nxLaunchGlow{from{transform:scale(.88);opacity:.65}to{transform:scale(1.08);opacity:1}}
   @keyframes nxLaunchPulse{0%,100%{filter:drop-shadow(0 0 10px rgba(69,137,255,.18))}50%{filter:drop-shadow(0 0 24px rgba(69,137,255,.42))}}
   @keyframes nxLaunchProgress{from{transform:translateX(-120%)}to{transform:translateX(260%)}}
   @keyframes nxLaunchFadeOut{to{opacity:0;visibility:hidden;pointer-events:none}}
   @media(prefers-reduced-motion:reduce){.nx-native-launch-splash,.nx-launch-glow,.nx-launch-brand,.nx-launch-brand img,.nx-launch-line span{animation:none}}
  `}</style>
 </div>;
}
createRoot(document.getElementById("root")).render(<><NEXORAErrorBoundary><App/></NEXORAErrorBoundary><NativeLaunchSplash/></>);
