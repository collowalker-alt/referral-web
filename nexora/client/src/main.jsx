import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {createPortal} from "react-dom";
import {LayoutDashboard,Users,WalletCards,Package as PackageIcon,LogOut,Copy,ArrowUpRight,Menu,X,ShieldCheck,RefreshCw,History,CheckCircle2,MessageCircle,BookOpen,ExternalLink,UsersRound,ReceiptText,HandCoins,Settings2,Search,LockKeyhole,LogIn,Ban,UserCheck,Clock3,Check,ChevronDown,BarChart3, UserRound, Wrench, Activity, Download, Eye, EyeOff, CreditCard, AlertTriangle, Info, FileSpreadsheet, Trophy, Megaphone, Share2, QrCode, Bell, LifeBuoy, GraduationCap, Shield, UserCog, KeyRound, Send, Target, TrendingUp, Medal, Crown, Sparkles, CheckCheck, BarChart2, Users2, CopyCheck, Store, Link2, CalendarCheck2, ShoppingCart, MapPin, Plus, Trash2, PackageCheck, Truck, Heart, Filter, Edit3, Upload, FileImage, Video, ClipboardCopy, Star,Bot,Mic,Volume2,VolumeX,SendHorizontal,ShoppingBag,MapPinned,ArrowRight,LoaderCircle,MessageSquareText,WalletMinimal,PackageSearch,BadgeCheck} from "lucide-react";
import "./styles.css";
const API=(import.meta.env.VITE_API_URL||"https://nexora-api-shxf.onrender.com/api").replace(/\/$/,"");
const money=n=>`KSh ${Number(n||0).toLocaleString()}`;
const waShare=(text)=>{const url=`https://wa.me/?text=${encodeURIComponent(text)}`;window.open(url,"_blank","noopener,noreferrer");};
const checklistKey=id=>`nexora-checklist-${id}`;

const PHONE_RE=/^(?:0[17]\d{8}|254[17]\d{8})$/;
const cleanPhone=v=>String(v||"").trim().replace(/[\s().-]/g,"").replace(/^\+/,"");
const validPhone=v=>PHONE_RE.test(cleanPhone(v));
async function api(path,opts={}){const token=localStorage.getItem("token");const r=await fetch(API+path,{...opts,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||"Request failed");return d}

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
 const [deferred,setDeferred]=useState(null);
 const [installed,setInstalled]=useState(false);
 const [showHelp,setShowHelp]=useState(false);
 const [platform,setPlatform]=useState("android");
 useEffect(()=>{
  try{
   const standalone=window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone===true;
   setInstalled(!!standalone);
   const ua=navigator.userAgent||"";
   setPlatform(/iPad|iPhone|iPod/.test(ua)&&!window.MSStream?"ios":"android");
   const onBefore=e=>{e.preventDefault();setDeferred(e)};
   const onInstalled=()=>{setInstalled(true);setDeferred(null);setShowHelp(false)};
   window.addEventListener("beforeinstallprompt",onBefore);
   window.addEventListener("appinstalled",onInstalled);
   return()=>{window.removeEventListener("beforeinstallprompt",onBefore);window.removeEventListener("appinstalled",onInstalled)};
  }catch(e){console.warn("PWA setup",e)}
 },[]);
 if(installed) return null;

 const openInstaller=async(e)=>{
  e?.preventDefault?.();
  e?.stopPropagation?.();
  if(deferred){
   try{
    deferred.prompt();
    const choice=await deferred.userChoice;
    setDeferred(null);
    if(choice&&choice.outcome==="accepted") return;
   }catch(err){setDeferred(null)}
  }
  setShowHelp(true);
 };
 const androidInstall=async(e)=>{
  e?.preventDefault?.();
  e?.stopPropagation?.();
  if(deferred){
   try{deferred.prompt();await deferred.userChoice}catch{}
   setDeferred(null);
   return;
  }
  setPlatform("android");
  setShowHelp(true);
 };
 const iosHelp=(e)=>{e?.preventDefault?.();setPlatform("ios");setShowHelp(true)};

 const modal=(
  <div className="modalbackdrop installbackdrop" role="dialog" aria-modal="true" aria-label="Install NEXORA" onClick={()=>setShowHelp(false)}>
   <div className="modal pwahelp moderninstall" onClick={e=>e.stopPropagation()}>
    <div className="modalhead installhead">
     <div>
      <span className="pill">NEXORA APP</span>
      <h2>Get NEXORA on your device</h2>
      <p>Install NEXORA like an app for faster access and a home-screen icon.</p>
     </div>
     <button type="button" className="iconbtn" onClick={()=>setShowHelp(false)} aria-label="Close"><X size={20}/></button>
    </div>
    <div className="pwahelpbody installbody">
     <div className={`installcard ${platform==="android"?"selected":""}`}>
      <div className="installicon androidicon">A</div>
      <div className="installcopy"><b>Android</b><span>Chrome can install NEXORA directly on your phone.</span></div>
      <button type="button" className="primary installaction" onClick={androidInstall}><Download size={16}/>{deferred?"Install now":"Install"}</button>
     </div>
     <div className={`installcard ${platform==="ios"?"selected":""}`}>
      <div className="installicon iosicon">iOS</div>
      <div className="installcopy"><b>iPhone / iPad</b><span>Use Safari to add NEXORA to your Home Screen.</span></div>
      <button type="button" className="secondary installaction" onClick={iosHelp}><Download size={16}/>Add to Home</button>
     </div>
     <div className="installnote"><ShieldCheck size={17}/><span>NEXORA is a secure installable web app. No separate APK or App Store download is required.</span></div>
     <div className="installsteps">
      <b>{platform==="ios"?"iPhone / iPad":"Android"}</b>
      {platform==="ios"
        ? <span>Open this site in <strong>Safari</strong> → tap <strong>Share</strong> → choose <strong>Add to Home Screen</strong>.</span>
        : <span>Tap <strong>Install</strong>. If your browser does not show the install prompt, open the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>}
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
function Instructions({onClose}){return <div className="modalbackdrop" onClick={onClose}><div className="modal instructions" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">NEXORA GUIDE</span><h2>How to use NEXORA</h2></div><button className="iconbtn" onClick={onClose}><X size={20}/></button></div><div className="instructionbody"><div><b>1. Create your account</b><p>Register with your name, email, password and valid Kenyan M-Pesa phone number. Keep your login details private.</p></div><div><b>2. Explore your workspace</b><p>Dashboard shows your account, plan status, referral activity, wallet, notifications and recent activity.</p></div><div><b>3. Choose or upgrade a membership plan</b><p>Open Earn → Membership plans to review prices and benefits before paying. Upgrades charge only the displayed price difference.</p></div><div><b>4. Understand the two earning paths</b><p>Starter, Growth, Pro and Elite members earn through qualifying referrals according to the plan rules. Premium members can also access Advertise and may earn from approved advertising campaigns.</p></div><div><b>5. Advertising is Premium-only</b><p>Products are not available to non-Premium members. Premium members can select available products, promote them on WhatsApp Status, TikTok, Instagram, X or another approved platform, then submit the public post link, upload the exact post creative you published, and provide the platform performance figures.</p></div><div><b>6. Advertising payouts</b><p>Approved advertising earnings are processed weekly on Friday. The amount is based on verified views and engagements and the rates configured for the specific campaign. Submission does not guarantee approval or a particular payout.</p></div><div><b>7. Grow your referral network</b><p>Open Earn to manage referrals and Marketing Center to share your personal referral link. Referral commissions are recorded only when a qualifying referral plan purchase is completed and your plan is eligible.</p></div><div><b>8. Use analytics, challenges and achievements</b><p>Analytics shows recorded activity. Challenges and achievements track activity milestones; neither guarantees future earnings.</p></div><div><b>9. Learn in NEXORA Academy</b><p>Use Academy to learn membership plans, referrals, advertising, ethical promotion, analytics, payments, security and responsible communication.</p></div><div><b>10. Wallet and payments</b><p>Wallet shows available, pending and withdrawn amounts. Transactions keeps your payment history. Never share your password, M-Pesa PIN or security codes.</p></div><div><b>11. Get help</b><p>Open Help & Support for a ticket or use WhatsApp Support. For payment or advertising questions, include the relevant reference or campaign information, but never send your PIN.</p></div><div><b>12. Use the NEXORA Marketplace</b><p>Marketplace lets members browse, search, wishlist, compare and purchase products, manage a cart, use eligible coupons, provide delivery details, review completed purchases and open a dispute when an order has a problem. Sellers can list products with photos, descriptions, prices, stock, seller information and location, manage orders and build a trustworthy seller profile. Verified sellers and approved listings are highlighted. Keep listings accurate and use safe payment and delivery practices.</p></div><div><b>13. Install NEXORA as an app</b><p>Use the Install NEXORA button when supported. On iPhone/iPad, open NEXORA in Safari and choose Add to Home Screen.</p></div></div><div className="modalfoot"><a className="secondary supportinline" href="https://wa.me/254703265774" target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp Support <ExternalLink size={14}/></a></div></div></div>}

function NexBot({goPage,goPackages,me}){
 const storagePos="nexora-nexbot-pos";
 const [open,setOpen]=useState(false);
 const [input,setInput]=useState("");
 const [loading,setLoading]=useState(false);
 const [listening,setListening]=useState(false);
 const [speakReplies,setSpeakReplies]=useState(false);
 const [products,setProducts]=useState([]);
 const [orders,setOrders]=useState([]);
 const [wallet,setWallet]=useState(null);
 const [suggestions,setSuggestions]=useState([]);
 const [msgs,setMsgs]=useState([{role:"bot",text:`Hi ${me?.user?.name?.split(" ")[0]||"there"}! I'm NexBot. Ask me anything about NEXORA — you can type naturally, use voice, or tap a shortcut.`}]);
 const [tip,setTip]=useState(false);
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
  if(sessionStorage.getItem("nexora-nexbot-greeted")==="1") return;
  setTip(true); sessionStorage.setItem("nexora-nexbot-greeted","1");
  const t=setTimeout(()=>setTip(false),5200); return()=>clearTimeout(t);
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
  if(/\b(hi|hello|hey|habari|niaje)\b/.test(s)) return "Hi! I'm NexBot. You can ask me about shopping, orders, wallet, payments, membership, referrals, advertising, selling, support, Academy, or how to use NEXORA.";
  if(/\b(balance|wallet|money|funds)\b/.test(s)) return `Your wallet balance is ${money(me?.wallet?.balance)}. I can help you with deposits, withdrawals and transaction history.`;
  if(/\b(plan|plans|membership|starter|growth|pro|elite|premium|upgrade)\b/.test(s)) return `Your current membership is ${me?.package?.name||"not active"}. Open Earn → Membership plans to review the available plans and their rules.`;
  if(/\b(referral|referrals|commission|earn|earning|invite|network)\b/.test(s)) return `Your NEXORA referral tools are under Earn. Referral commissions depend on the qualifying plan rules; NEXORA does not guarantee income.`;
  if(/\b(order|orders|delivery|track|tracking)\b/.test(s)) return orders.length?`I found ${orders.length} recent order${orders.length===1?"":"s"}. I can show the latest status below.`:"I don't see any recent orders yet. Start shopping to place your first order.";
  if(/\b(shop|product|products|buy|sell|seller|cart|wishlist|electronics|fashion)\b/.test(s)) return "I can help you find products, compare listings, use your wishlist/cart, or sell a product on NEXORA.";
  if(/\b(advertise|advertising|campaign|views|engagement)\b/.test(s)) return "Advertising is for eligible Premium members. Campaign submissions are reviewed and approved payouts follow the campaign rules.";
  if(/\b(payment|pay|mpesa|m-pesa|stk|deposit)\b/.test(s)) return "NEXORA currently uses Co-op Bank M-Pesa Paybill for manual payment verification while live Paystack verification is pending. Never share your M-Pesa PIN or security codes.";
  if(/\b(support|help|ticket|human)\b/.test(s)) return "Open Help & Support to create or review a ticket. For payment questions, include the transaction reference but never send your PIN.";
  return "I can help with NEXORA, including shopping, products, orders, wallet, payments, membership, referrals, advertising, selling, Academy and support. Tell me what you're trying to do and I'll guide you step by step.";
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
  ["🏪 Sell","How do I sell a product?"],
  ["❓ Help","What can NexBot help me with?"]
 ];
 const actionInfo={plans:["Open Membership Plans",()=>goPackages?.()],marketplace:["Open Marketplace",()=>goPage?.("marketplace")],transactions:["Open Orders & Transactions",()=>goPage?.("transactions")],wallet:["Open Wallet",()=>goPage?.("wallet")],referrals:["Open Earn & Referrals",()=>goPage?.("referrals")],products:["Open Advertise",()=>goPage?.("products")],notifications:["Open Notifications",()=>goPage?.("notifications")],academy:["Open Academy",()=>goPage?.("academy")],support:["Open Help & Support",()=>goPage?.("support")],security:["Open Profile & Security",()=>goPage?.("security")]};

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
  if(!open||!fabRef.current||!sheetRef.current) return;
  const fab=fabRef.current.getBoundingClientRect(), panel=sheetRef.current.getBoundingClientRect(), gap=10,pad=8;
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
  <div className="nexbot-panel" role="dialog" aria-label="NexBot intelligent assistant">
   <div className="nexbot-head">
    <div className="nexbot-avatar"><Face size={30}/></div><div><b>NexBot</b><small>NEXORA intelligent assistant</small></div>
    <div className="nexbot-head-actions"><button type="button" className="iconbtn" onClick={speakLast} aria-label="Read latest reply"><Volume2 size={16}/></button><button type="button" className="iconbtn" onClick={()=>setOpen(false)} aria-label="Close"><X size={18}/></button></div>
   </div>
   <div className="nexbot-welcome"><Sparkles size={15}/><span>Ask naturally. I understand NEXORA features, your account context, shopping, orders and common follow-up questions.</span></div>
   <div className="nexbot-msgs">
    {msgs.map((m,i)=><div key={i} className={`nexbot-msg ${m.role}`}><span>{m.text}</span>{m.action&&actionInfo[m.action]&&<button className="nexbot-action" type="button" onClick={()=>{setOpen(false);actionInfo[m.action][1]()}}>{actionInfo[m.action][0]} <ArrowRight size={13}/></button>}</div>)}
    {loading&&<div className="nexbot-msg bot typing"><LoaderCircle size={15}/><span>NexBot is thinking…</span></div>}
    {products.length>0&&<div className="nexbot-results"><div className="nexbot-results-title"><ShoppingBag size={14}/> Product matches</div>{products.slice(0,4).map(p=><button key={p.id} type="button" className="nexbot-product" onClick={()=>{setOpen(false);goPage?.("marketplace")}}>{p.image?<img src={p.image} alt=""/>:<span className="nexbot-product-placeholder"><PackageSearch size={17}/></span>}<span><b>{p.title}</b><small>{money(p.price)} · {p.stock>0?`${p.stock} in stock`:"Sold out"}</small><em>{p.verified?"✓ Verified seller · ":""}{p.location||p.category||"NEXORA Marketplace"}</em></span><ArrowRight size={14}/></button>)}</div>}
    {orders.length>0&&<div className="nexbot-results"><div className="nexbot-results-title"><Truck size={14}/> Recent orders</div>{orders.slice(0,3).map(o=><button key={o.id} type="button" className="nexbot-order" onClick={()=>{setOpen(false);goPage?.("marketplace")}}><span><b>{o.reference||o.id}</b><small>{o.items?.map(x=>`${x.title} ×${x.quantity}`).join(", ")||"Marketplace order"}</small></span><strong>{String(o.status||"PENDING").replaceAll("_"," ")}</strong></button>)}</div>}
    {wallet&&<div className="nexbot-wallet"><WalletMinimal size={16}/><div><small>Available wallet</small><b>{money(wallet.balance)}</b></div><button type="button" onClick={()=>{setOpen(false);goPage?.("wallet")}}>Open</button></div>}
   </div>
   <div className="nexbot-quick">{quick.map(([l,q])=><button type="button" key={l} onClick={()=>send(q)}>{l}</button>)}</div>
   {suggestions.length>0&&<div className="nexbot-suggestions">{suggestions.slice(0,3).map(q=><button key={q} type="button" onClick={()=>send(q)}>{q}</button>)}</div>}
   <form className="nexbot-form" onSubmit={e=>{e.preventDefault();send()}}>
    <button type="button" className={`nexbot-mic ${listening?"active":""}`} onClick={startVoice} aria-label={listening?"Stop voice input":"Use voice input"}><Mic size={17}/></button>
    <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask anything about NEXORA…" autoComplete="off"/>
    <button type="submit" className="primary narrow" disabled={loading||!input.trim()} aria-label="Send"><SendHorizontal size={16}/></button>
   </form>
   <div className="nexbot-footer"><button type="button" onClick={()=>setSpeakReplies(v=>!v)}>{speakReplies?<Volume2 size={13}/>:<VolumeX size={13}/>} {speakReplies?"Read replies on":"Read replies off"}</button><span>Never share your PIN or password.</span></div>
  </div>
 );
 return <>
  {open&&createPortal(<div className="nexbot-overlay"><div ref={sheetRef} className="nexbot-sheet" onClick={e=>e.stopPropagation()} style={panelPos?{left:panelPos.left,top:panelPos.top,visibility:"visible"}:{left:0,top:0,visibility:"hidden"}}>{panel}</div></div>,document.body)}
  <div className={`nexbot-root ${open?"is-open":""}`} style={fabStyle}>
   {tip&&!open&&<div className="nexbot-tip" role="status"><b>Hi — I'm NexBot</b><span>Ask me anything about NEXORA.</span></div>}
   <button ref={fabRef} type="button" className="nexbot-fab" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onClick={onClick} title="NexBot — drag to move, tap to chat" aria-label="Open NexBot"><span className="nexbot-fab-glow"/><Face size={34}/><span className="nexbot-fab-dot"/></button>
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
   <section className="publichero"><div className="publicheroCopy"><span className="pill">NEXORA · MARKETPLACE & MEMBER PLATFORM</span><h1>Shop. Sell. Advertise. <span>Grow.</span></h1><p>NEXORA brings a modern marketplace, member wallet, product advertising, referrals, learning and support together in one platform.</p><div className="heroactions"><button className="primary" onClick={()=>go("register")}><Store size={17}/> Start with NEXORA <ArrowUpRight size={17}/></button><button className="secondary" onClick={()=>document.getElementById("how")?.scrollIntoView({behavior:"smooth"})}>See how it works</button></div><div className="publictrust"><span><ShieldCheck size={16}/> Account-focused workspace</span><span><BarChart3 size={16}/> Transparent activity tracking</span><span><LifeBuoy size={16}/> Member support</span></div></div><div className="publicheroCard"><img src="/nexora-logo.png"/><div className="floatingmetric"><small>NEXORA MARKETPLACE</small><b>Shop, sell and grow in one place</b><span>Marketplace · Wallet · Advertising · Academy</span></div></div></section>
   <section id="features" className="publicsection"><div className="sectionhead"><div><span className="pill">ONE DIGITAL MARKETPLACE</span><h2>More than a referral platform</h2><p className="muted">Shop products, sell your own products, promote approved campaigns and manage your NEXORA account in one place.</p></div></div><div className="featuregrid">{[[Store,"Marketplace","Browse products, save favorites, add to cart and track purchases from NEXORA sellers."],[Plus,"Sell Products","List products with photos, descriptions, prices, stock and location and manage customer orders."],[Megaphone,"Premium Advertising","Premium members can promote approved products and submit verified performance for Friday payout review."],[GraduationCap,"NEXORA Academy","Practical lessons on platform use, ethical marketing and account safety."],[Trophy,"Achievements","Track milestones and activity without promising or guaranteeing income."],[LifeBuoy,"Member Support","Create support tickets and keep replies in one place."],[Shield,"Security Center","Manage your profile and keep your account information current."]].map(([I,t,d])=><div className="featurecard" key={t}><div className="featureicon"><I size={22}/></div><h3>{t}</h3><p>{d}</p></div>)}</div></section>
   <section id="how" className="publicsection darksection"><div className="sectionhead"><div><span className="pill">SIMPLE FLOW</span><h2>How NEXORA works</h2></div></div><div className="steps">{[["01","Create","Create your account and complete your profile."],["02","Explore","Review membership benefits, learning tools and your workspace."],["03","Connect","Use your personal referral tools to share NEXORA with people who genuinely want to learn about it."],["04","Advertise","Premium members can publish approved products, submit their post link and creative, and have verified performance reviewed for Friday payouts."],["05","Track","Follow activity, transactions, support requests and achievements from your dashboard."]].map(([n,t,d])=><div className="step" key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p></div>)}</div></section>
   <section id="packages" className="publicsection"><div className="sectionhead"><div><span className="pill">MEMBERSHIP</span><h2>Choose the level that fits you</h2><p className="muted">Benefits and prices are shown transparently inside the member workspace.</p></div><button className="secondary" onClick={()=>go("register")}>Explore membership</button></div><div className="publicpackagegrid"><div><b>Starter</b><span>Foundation level</span><small>Access begins with the Starter level and its configured benefits.</small></div><div><b>Growth</b><span>Expand your toolkit</span><small>Unlock the Growth plan and the plan levels available to it.</small></div><div className="featured"><b>Pro</b><span>MOST POPULAR</span><small>A broader member experience with more configured benefits and earning access.</small></div><div><b>Elite</b><span>Advanced level</span><small>Designed for members who want the additional benefits configured for Elite.</small></div><div><b>Premium</b><span>Full platform level</span><small>The highest configured membership level and plan earning access.</small></div></div></section>
   <section className="publicsection publicstats"><div><strong>One workspace</strong><span>Account, wallet, referrals, learning and support</span></div><div><strong>Clear records</strong><span>Transactions and recorded commissions are visible to members</span></div><div><strong>Member-first</strong><span>Tools designed to help members understand their activity</span></div></section>
   <section id="faq" className="publicsection"><div className="sectionhead"><div><span className="pill">FAQ</span><h2>Questions, answered</h2></div></div><div className="faqgrid"><details open><summary>Does NEXORA guarantee earnings?</summary><p>No. Referral commissions are only recorded when the platform rules are met. Nothing on NEXORA should be interpreted as a guaranteed return or income promise.</p></details><details><summary>What can I do after joining?</summary><p>Explore your dashboard, membership, referral tools, analytics, Academy, achievements, wallet, transactions and support center.</p></details><details><summary>How do plan levels work?</summary><p>Your plan level determines the plan purchases from which you may be eligible to receive referral commissions, subject to the platform's rules.</p></details><details><summary>How does Premium advertising work?</summary><p>Premium unlocks approved advertising products. Premium members publish campaign posts on approved platforms, submit the public post link and the exact creative they posted, then provide current views and engagements for review. Approved advertising earnings are processed weekly on Friday.</p></details><details><summary>How do I get help?</summary><p>Members can create support tickets or use the direct support option inside NEXORA.</p></details></div></section>
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
  const [f,setF]=useState({name:"",email:"",phone:"",password:"",referralCode:""});
  const [confirmPassword,setConfirmPassword]=useState("");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const [showPassword,setShowPassword]=useState(false);
  const [showConfirmPassword,setShowConfirmPassword]=useState(false);
  const [agreed,setAgreed]=useState(false);
  const [successMsg,setSuccessMsg]=useState("");
  const [resetToken,setResetToken]=useState(initialResetToken||"");
  const [devResetToken,setDevResetToken]=useState("");
  const modalRef=React.useRef(null);
  const ref=new URLSearchParams(location.search).get("ref")||"";

  useEffect(()=>{setMode(onMode);setErr("");setSuccessMsg("");setDevResetToken("");if(onMode==="reset"&&initialResetToken)setResetToken(initialResetToken);},[onMode,initialResetToken]);
  useEffect(()=>{
    if(ref && !f.referralCode) setF(prev=>({...prev,referralCode:ref.toUpperCase()}));
  },[ref]);
  useEffect(()=>{
    const onKey=e=>{if(e.key==="Escape") onClose();};
    window.addEventListener("keydown",onKey);
    // basic focus trap: focus first input
    const t=setTimeout(()=>{const el=modalRef.current?.querySelector("input:not([type=hidden]),button.primary");el?.focus?.();},50);
    return ()=>{window.removeEventListener("keydown",onKey);clearTimeout(t);};
  },[mode,onClose]);

  const passwordMatch=mode==="register"&&confirmPassword.length>0&&f.password===confirmPassword;
  const passwordMismatch=mode==="register"&&confirmPassword.length>0&&f.password!==confirmPassword;
  const strength=passwordStrength(f.password);
  const phoneClean=cleanPhone(f.phone);
  const phoneValid=f.phone?validPhone(f.phone):null;
  const canSubmit=()=>{
    if(busy) return false;
    if(mode==="login") return f.email && f.password;
    if(mode==="register") return f.name && f.email && f.phone && f.password && confirmPassword && passwordMatch && agreed && phoneValid!==false;
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

  const submit=async e=>{e.preventDefault();setErr("");if(!pkg?.id)return setErr("This plan is unavailable. Please refresh the membership plans and try again.");if(method==="wallet")return useWallet();setBusy(true);try{await onContinue?.(null,pkg)}catch(ex){setErr(ex.message||"Could not start Paybill payment");setBusy(false)}};
 return <div className="modalbackdrop" onClick={onCancel}><div className="modal phonemodal" onClick={e=>e.stopPropagation()}>
  <div className="modalhead"><div><span className="pill">CO-OP BANK · LIPA NA M-PESA</span><h2>Choose how to pay</h2></div><button type="button" className="iconbtn" onClick={onCancel} aria-label="Close payment window"><X size={20}/></button></div>
  <form className="phonemodalform" onSubmit={submit}><div className="paymentbody phonebody">
   <div className="phonepackage"><div><span>Plan</span><strong>{pkg?.name}</strong></div><div><span>Amount due</span><strong>{money(amount)}</strong></div><div><span>Wallet balance</span><strong>{money(walletBalance)}</strong></div></div>
   <div className="paymethods"><button type="button" className={`paymethod ${method==="paybill"?"active":""}`} disabled={busy} onClick={()=>{setMethod("paybill");setErr("")}}><CreditCard size={18}/><div><b>Co-op Bank Lipa na M-Pesa Paybill</b><span>Pay manually using Paybill 400200, then submit your M-Pesa confirmation code</span></div></button><button type="button" className={`paymethod ${method==="wallet"?"active":""} ${!canWallet?"disabled":""}`} onClick={useWallet} disabled={!canWallet||busy}><WalletCards size={18}/><div><b>Use wallet balance</b><span>{canWallet?`Pay ${money(amount)} instantly from your wallet`:`Need ${money(amount)} · you have ${money(walletBalance)}`}</span></div></button></div>
   {method==="paybill"&&<div className="paybillbox"><div className="paybilltitle"><div><b>{paybillName}</b><span>Manual M-Pesa payment</span></div><span className="paybillsecure">LIPA NA M-PESA</span></div><div className="paybilldetails"><div><span>Paybill</span><strong>{paybillNumber}</strong></div><div className="paybillrowcopy"><span>Account number</span><div className="paybillaccountvalue"><strong>{paybillAccount||"Configured on server"}</strong>{paybillAccount&&<button type="button" className="copyaccountbtn" onClick={copyAccount} aria-label="Copy Co-op account number">{copied?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy</>}</button>}</div></div><div><span>Amount</span><strong>{money(amount)}</strong></div></div><ol className="paybillsteps"><li>Open <b>M-Pesa → Lipa na M-Pesa → PayBill</b>.</li><li>Enter Paybill number <b>{paybillNumber}</b>.</li><li>Enter account number <b>{paybillAccount||"shown above"}</b>.</li><li>Enter exactly <b>{money(amount)}</b> and complete with your M-Pesa PIN.</li><li>Return here and submit the M-Pesa confirmation code.</li></ol><div className="notice"><Info size={15}/> Your payment is manually verified before the plan is activated.</div></div>}
   {method==="wallet"&&walletConfirm&&!busy&&<div className="walletconfirmbox"><div className="walletconfirmicon"><WalletCards size={22}/></div><div><h3>Confirm wallet payment</h3><p className="muted small">Are you sure you want to use your NEXORA wallet balance to pay <strong>{money(amount)}</strong> for the <strong>{pkg?.name}</strong> plan?</p><p className="muted small">Your available balance is <strong>{money(walletBalance)}</strong>.</p></div><div className="walletconfirmactions"><button type="button" className="dangeroutline" onClick={()=>{setWalletConfirm(false);setMethod("paybill");setErr("")}} disabled={busy}>Cancel</button><button type="button" className="primary" onClick={confirmWallet} disabled={busy}>Yes, use my balance</button></div></div>}
   {method==="wallet"&&busy&&<div className="walletconfirmbox"><p className="muted small"><strong>Processing wallet payment…</strong> Please wait for confirmation.</p></div>}
   {err&&<div className="error">{err}</div>}
  </div><div className="modalfoot paymentfoot"><button type="button" className="secondary" onClick={onCancel} disabled={busy}>Cancel</button>{method==="paybill"&&<button type="submit" className="primary" disabled={busy}>{busy?"Starting payment…":"Continue to Paybill"}</button>}</div></form>
 </div></div>;
}
function PaymentModal({payment,onClose,onReceipt,onSuccess}){
 const [code,setCode]=useState(""),[busy,setBusy]=useState(false),[msg,setMsg]=useState(""),[status,setStatus]=useState(payment.status||"pending"),[copied,setCopied]=useState(false);
 const copyAccount=async()=>{const a=String(payment.paybillAccount||"");if(!a)return;try{await navigator.clipboard.writeText(a);setCopied(true);setTimeout(()=>setCopied(false),2200)}catch{window.prompt("Copy Co-op account number:",a)}};
 const submitted=status==="pending_verification";
 const submitCode=async e=>{e.preventDefault();const c=String(code||"").trim().toUpperCase().replace(/\s+/g,"");if(c.length<8||c.length>15)return setMsg("Enter the M-Pesa confirmation code from your SMS.");setBusy(true);setMsg("");try{const d=await api("/payments/paybill/submit-code",{method:"POST",body:JSON.stringify({reference:payment.reference,mpesaCode:c})});setStatus(d.status||"pending_verification");setMsg(d.message||"Confirmation code received.")}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 useEffect(()=>{if(status!=="pending_verification")return;let tries=0,timer;const check=async()=>{if(tries++>=36)return;try{const v=await api(`/payments/paybill/status/${payment.reference}`);if(v.status==="success"){setStatus("success");onSuccess?.();return}if(v.status==="failed"){setStatus("failed");setMsg(v.message||"Payment was rejected.");return}}catch{}timer=setTimeout(check,10000)};timer=setTimeout(check,10000);return()=>clearTimeout(timer)},[status,payment.reference]);
 const isSuccess=status==="success",isFailed=status==="failed";
 return <div className="modalbackdrop" onClick={onClose}><div className="modal paymentmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className={`pill ${isSuccess?"payment-success":isFailed?"payment-failed":"payment-pending"}`}>{isSuccess?"COMPLETED":isFailed?"FAILED":"PAYMENT VERIFICATION"}</span><h2>{isSuccess?"Payment confirmed":isFailed?"Payment could not be confirmed":"Complete your M-Pesa payment"}</h2></div><button className="iconbtn" onClick={onClose}><X size={20}/></button></div><div className="paymentbody">
 {isSuccess?<div className="successbox"><CheckCircle2 size={34}/><h3>Payment verified</h3><p className="muted">Your {payment.package?.name||"plan"} payment has been verified and your account has been updated.</p><button className="secondary" onClick={()=>onReceipt?.({...payment,status:"PAID",amount:Number(payment.chargeAmount||payment.package?.price||0),method:"M-Pesa Paybill"})}><ReceiptText size={16}/> View receipt</button></div>:isFailed?<div className="error"><b>Payment was not confirmed.</b><p>{msg||"The payment was rejected or could not be verified. You can close this window and start again."}</p></div>:<><div className="paymentstatus"><div className="paymenticon pending"><CreditCard size={28}/></div><div><b>Pay KSh {Number(payment.chargeAmount||0).toLocaleString()} to Co-op Bank</b><p className="muted">Use <strong>Lipa na M-Pesa → PayBill</strong> · Paybill <strong>{payment.paybillNumber||"400200"}</strong></p></div></div><div className="paymentdetails"><div><span>Plan</span><strong>{payment.package?.name}</strong></div><div><span>Amount</span><strong>{money(payment.chargeAmount||payment.package?.price)}</strong></div><div><span>Paybill</span><strong>{payment.paybillNumber||"400200"}</strong></div><div className="paybillrowcopy"><span>Account</span><div className="paybillaccountvalue"><strong>{payment.paybillAccount||"—"}</strong>{payment.paybillAccount&&<button type="button" className="copyaccountbtn" onClick={copyAccount}>{copied?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy account</>}</button>}</div></div><div><span>Reference</span><strong>{payment.reference}</strong></div></div>{!submitted?<form onSubmit={submitCode} className="paybillcodeform"><label className="fieldlabel">M-Pesa confirmation code<input required value={code} onChange={e=>setCode(e.target.value)} placeholder="e.g. QH12XXXXXX" autoComplete="one-time-code"/></label><p className="muted small">Enter the confirmation code from the M-Pesa SMS after paying the exact amount.</p><button className="primary" disabled={busy}>{busy?"Submitting code…":"Submit confirmation code"}</button></form>:<div className="notice"><LoaderCircle size={15} className="spin"/><strong>Awaiting administrator verification.</strong><p className="muted small">Your code has been received. The payment will be confirmed after the M-Pesa payment is checked.</p></div>}{msg&&<div className="notice">{msg}</div>}</>}
 </div><div className="modalfoot paymentfoot"><button className="secondary" onClick={onClose}>{isSuccess?"Done":"Close"}</button></div></div></div>;
}

function Packages({packages,current,purchase,reload}){
 const sorted=[...packages].sort((a,b)=>Number(a.tier||999)-Number(b.tier||999)||Number(a.price)-Number(b.price));
 const currentPrice=Number(current?.price||0);
 const upgradeOnly=sorted.filter(p=>Number(p.price)>currentPrice);
 return <section><div className="sectionhead"><div><h1>Choose your plan</h1><p className="muted">Compare transparent membership plan benefits and understand exactly which plan levels you can earn from.</p></div><button className="secondary" onClick={reload}><RefreshCw size={16}/> Refresh</button></div>
 <div className="earningsnotice"><div><strong>How plan earnings work</strong><p>Starter, Growth, Pro and Elite earn through qualifying referrals. Premium can earn through qualifying referrals across all five plan levels and also unlocks the Products & Advertising area for approved campaigns.</p><p>Your plan unlocks the plan levels you can earn from. Starter can earn from Starter purchases; Growth can earn from Starter + Growth; Pro can earn from Starter + Growth + Pro; Elite can earn from Starter + Growth + Pro + Elite; Premium can earn from all five. When an eligible referral purchases a plan, the commission shown for that purchased plan applies.</p></div></div>
 {current&&upgradeOnly.length>0&&<div className="upgradebanner"><div><span className="pill">UPGRADE AVAILABLE</span><h3>Unlock more NEXORA benefits</h3><p className="muted">You already have {current.name}. Upgrading charges the difference between your current plan and the higher plan.</p></div><button className="primary" onClick={()=>purchase(upgradeOnly[0])}>See upgrade options</button></div>}
 {sorted.length?<><div className="packages">{sorted.map((p,i)=>{const isCurrent=current?.id===p.id;const isUpgrade=current&&Number(p.price)>currentPrice;const difference=isUpgrade?Number(p.price)-currentPrice:Number(p.price);return <div className={`pkg ${p.popular||(!p.popular&&i===2) ?"featured":""}`} key={p.id}>{(p.popular||(!p.popular&&i===2))&&<div className="popular">{p.badge||"POPULAR"}</div>}<span className="pkgname">{p.name}</span>{p.badge&&!(p.popular||(!p.popular&&i===2))&&<span className="packagebadge">{p.badge}</span>}<h2>{money(p.price)}</h2>{p.description&&<p className="pkgdesc">{p.description}</p>}<div className="commission"><div><b>{money(p.directCommission)}</b><small>Direct referral</small></div><div><b>{money(p.level2Commission)}</b><small>Level 2 referral</small></div></div><ul className="pkgfeatures">{(p.features||[]).map((x,j)=><li key={j}><Check size={14}/>{x}</li>)}</ul>{current&&isUpgrade&&<div className="upgradecost">Upgrade cost: <strong>{money(difference)}</strong></div>}<button className="primary" disabled={isCurrent} onClick={()=>purchase(p)}>{isCurrent?<><CheckCircle2 size={16}/> Current plan</>:isUpgrade?"Upgrade plan":"Activate plan"}</button></div>})}</div>
 <div className="comparison"><h2>Why upgrade?</h2><p className="muted">See what each plan unlocks compared to where you are now.</p>
 <div className="planmatrixwrap"><table className="planmatrix"><thead><tr><th>Benefit</th>{sorted.map(p=><th key={p.id} className={current?.id===p.id?"iscurrent":""}>{p.name}{current?.id===p.id&&<small> · you</small>}</th>)}</tr></thead><tbody>
 <tr><td>Price</td>{sorted.map(p=><td key={p.id}>{money(p.price)}</td>)}</tr>
 <tr><td>Direct referral</td>{sorted.map(p=><td key={p.id}>{money(p.directCommission)}</td>)}</tr>
 <tr><td>Level 2 referral</td>{sorted.map(p=><td key={p.id}>{money(p.level2Commission)}</td>)}</tr>
 <tr><td>Earn from plans</td>{sorted.map((p,i)=><td key={p.id}>{sorted.slice(0,i+1).map(x=>x.name).join(", ")}</td>)}</tr>
 <tr><td>Advertising</td>{sorted.map(p=><td key={p.id}>{p.name==="Premium"?<b className="yes">Yes</b>:<span className="no">—</span>}</td>)}</tr>
 <tr><td>Your move</td>{sorted.map(p=>{const isCurrent=current?.id===p.id;const isUpgrade=current&&Number(p.price)>Number(current?.price||0);const diff=isUpgrade?Number(p.price)-Number(current.price):Number(p.price);return <td key={p.id}>{isCurrent?<span className="yes">Current</span>:<button type="button" className="secondary narrow" onClick={()=>purchase(p)}>{isUpgrade?`Upgrade ${money(diff)}`:`Activate`}</button>}</td>})}</tr>
 </tbody></table></div>
 <div className="earningtiers">{sorted.map((p,i)=><div key={p.id}><strong>{p.name}</strong><span>Can earn from: {sorted.slice(0,i+1).map(x=>x.name).join(" + ")}</span></div>)}</div><h2>Compare plan benefits</h2><div className="comparisongrid">{sorted.map(p=><div key={p.id}><h3>{p.name}</h3>{p.description&&<p>{p.description}</p>}<ul>{(p.features||[]).map((x,j)=><li key={j}><Check size={14}/>{x}</li>)}</ul><strong>{money(p.directCommission)} direct · {money(p.level2Commission)} Level 2</strong></div>)}</div></div></>:<div className="panel empty"><PackageIcon size={32}/><h3>No plans available</h3><p className="muted">We couldn't load the plan list.</p><button className="primary narrow" onClick={reload}>Reload plans</button></div>}</section>}

function Referrals({data,earnings,me,copy,copyCode,copiedKind,share,packages=[],purchase,reload,initialTab="network"}){
 const hasPackage=Boolean(me?.package);
 const [tab,setTab]=useState(initialTab==="plans"?"plans":"network");
 return <section className="earnsection">
  <div className="sectionhead"><div><span className="pill">EARN CENTER</span><h1>Earn with NEXORA</h1><p className="muted">Activate a membership plan to unlock your referral link and earn from qualifying referrals under the plan rules.</p></div>
   {hasPackage&&tab==="network"&&<div className="heroactions compact"><button className="secondary" onClick={copy}><Copy size={15}/> Copy link</button><button className="secondary" onClick={()=>waShare(`Hi! Join me on NEXORA — review plans first (no guaranteed income): ${location.origin}/?ref=${me.user.referralCode}`)}><MessageCircle size={15}/> WhatsApp</button><button className="primary" onClick={share}><Share2 size={15}/> Share</button></div>}
  </div>
  <div className="earntabs">
   <button type="button" className={tab==="network"?"active":""} onClick={()=>setTab("network")}>Network & referrals</button>
   <button type="button" className={tab==="plans"?"active":""} onClick={()=>setTab("plans")}>Membership plans</button>
  </div>

  {tab==="plans"&&(
    <div className="earnplans">
      <div className="earnnotice panel">
        <PackageIcon size={22}/>
        <div>
          <h3>Purchase a plan to start earning</h3>
          <p className="muted">Referral commissions are only recorded when you have an active membership plan and a referred member completes a qualifying plan purchase under the rules below. NEXORA does not guarantee income.</p>
          <ul className="earnterms">
            <li>You must activate a plan before your personal referral link unlocks for earning.</li>
            <li>Commissions apply only to eligible referral purchases for the plan levels your membership can earn from.</li>
            <li>Upgrades charge only the price difference from your current plan.</li>
            <li>Review the <a href="/membership" target="_blank" rel="noreferrer">Membership rules</a>, <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> before paying.</li>
            <li>Nothing on NEXORA should be read as a promise of fixed or guaranteed earnings.</li>
          </ul>
        </div>
      </div>
      <Packages packages={packages} current={me.package} purchase={purchase} reload={reload||(()=>{})}/>
    </div>
  )}

  {tab==="network"&&<>
    {!hasPackage&&(
      <div className="lockedpanel earnlock">
        <LockKeyhole size={28}/>
        <div>
          <h3>Plan required to start earning</h3>
          <p className="muted">Your referral link and commission tracking unlock after you purchase a membership plan. Choose a plan to begin — commissions follow the published plan rules only.</p>
          <ul className="earnterms compact">
            <li>No active plan = referral link stays locked for earning tools.</li>
            <li>Qualifying referrals are recorded only after a successful plan purchase by your invitee (where rules allow).</li>
            <li>By continuing to plans you confirm you understand NEXORA does not guarantee income.</li>
          </ul>
          <button type="button" className="primary" onClick={()=>setTab("plans")}><PackageIcon size={16}/> View membership plans</button>
        </div>
      </div>
    )}
    <div className="cards three"><Card title="Direct referrals" value={data.direct.length}/><Card title="Level 2 referrals" value={data.level2.length}/><Card title="Commission records" value={earnings.length}/></div>
    {hasPackage&&<div className="panel"><h3>Referral link</h3><div className="copybox"><span>{location.origin}/?ref={me.user.referralCode}</span><button onClick={copy}>{copiedKind==="link"?<><Check size={16}/> Copied</>:<><Copy size={16}/> Copy</>}</button></div><div className="heroactions compact" style={{marginTop:10}}><button className="secondary" onClick={copyCode}>{copiedKind==="code"?<><Check size={15}/> Copied</>:<><CopyCheck size={15}/> Copy code</>}</button></div>{(copiedKind==="link"||copiedKind==="code")&&<p className="muted small copyhint">{copiedKind==="code"?"Referral code copied — share it when someone registers.":"Referral link copied — paste it in WhatsApp or SMS."}</p>}</div>}
    <div className="grid2">
      <div className="panel"><h3>Direct referrals</h3>{data.direct.length?data.direct.map(x=><div className="row simple" key={x.id}><div><b>{x.name}</b><small>{x.email}</small></div><span>{x.package?.name||"No plan"}</span></div>):<div className="smartempty"><p className="muted">No direct referrals yet.</p>{hasPackage?<button type="button" className="secondary narrow" onClick={share}>Share your link</button>:<button type="button" className="secondary narrow" onClick={()=>setTab("plans")}>Get a plan first</button>}</div>}</div>
      <div className="panel"><h3>Level 2 referrals</h3>{data.level2.length?data.level2.map(x=><div className="row simple" key={x.id}><div><b>{x.name}</b><small>{x.email}</small></div><span>{x.package?.name||"No plan"}</span></div>):<p className="muted">No Level 2 referrals yet.</p>}</div>
    </div>
    <div className="panel"><h3>Recent commissions</h3>{earnings.length?earnings.map(x=><div className="row simple" key={x.id}><div><b>{x.level===1?"Direct":"Level 2"} referral</b><small>{x.sourceUser?.name||"Member"}</small></div><strong className="green">+{money(x.amount)}</strong></div>):<div className="smartempty"><p className="muted">No commissions yet.</p>{!hasPackage&&<button type="button" className="secondary narrow" onClick={()=>setTab("plans")}>Purchase a plan to earn</button>}</div>}</div>
  </>}
 </section>}

function Card({title,value}){return <div className="stat"><span>{title}</span><strong>{value}</strong><ArrowUpRight size={18}/></div>}
function DepositModal({onClose,load}){
 const [amount,setAmount]=useState(""),[step,setStep]=useState("form"),[payment,setPayment]=useState(null),[code,setCode]=useState(""),[busy,setBusy]=useState(false),[msg,setMsg]=useState("");
 const initiate=async e=>{e.preventDefault();setMsg("");const n=Number(amount);if(!Number.isInteger(n)||n<100)return setMsg("Enter a whole deposit amount of at least KSh 100.");setBusy(true);try{const d=await api("/wallet/deposit/paybill/initiate",{method:"POST",body:JSON.stringify({amount:n})});setPayment(d);setStep("pay")}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 const submitCode=async e=>{e.preventDefault();const c=String(code||"").trim().toUpperCase().replace(/\s+/g,"");if(c.length<8||c.length>15)return setMsg("Enter the M-Pesa confirmation code from your SMS.");setBusy(true);setMsg("");try{const d=await api("/wallet/deposit/paybill/submit-code",{method:"POST",body:JSON.stringify({reference:payment.reference,mpesaCode:c})});setPayment(x=>({...x,status:d.status||"pending_verification"}));setStep("waiting");setMsg(d.message||"Confirmation code received.")}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 const check=async()=>{if(!payment?.reference)return;setBusy(true);try{const v=await api(`/wallet/deposit/paybill/status/${payment.reference}`);setPayment(x=>({...x,status:v.status||x.status,message:v.message||x.message}));if(v.status==="success"){setStep("done");await load(false)}else if(v.status==="failed")setStep("failed")}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 useEffect(()=>{if(step!=="waiting"||!payment?.reference)return;let tries=0,timer;const poll=async()=>{if(tries++>=36)return;try{const v=await api(`/wallet/deposit/paybill/status/${payment.reference}`);setPayment(x=>({...x,status:v.status||x.status,message:v.message||x.message}));if(v.status==="success"){setStep("done");await load(false);return}if(v.status==="failed"){setStep("failed");return}}catch{}timer=setTimeout(poll,10000)};timer=setTimeout(poll,10000);return()=>clearTimeout(timer)},[step,payment?.reference]);
 return <div className="modalbackdrop" onClick={onClose}><div className="modal depositmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">WALLET DEPOSIT</span><h2>{step==="form"?"Deposit to wallet":step==="done"?"Deposit successful":step==="failed"?"Deposit failed":"Co-op Bank Lipa na M-Pesa"}</h2></div><button type="button" className="iconbtn" onClick={onClose}><X size={20}/></button></div><div className="depositbody">
 {step==="form"&&<form onSubmit={initiate}><p className="muted">Deposit money into your NEXORA wallet using Co-op Bank Paybill. You will pay manually in M-Pesa and submit the confirmation code for verification.</p><div className="depositamountcard">
  <div className="depositamounttop">
    <div>
      <span className="depositamountlabel">DEPOSIT AMOUNT</span>
      <b>How much would you like to add?</b>
    </div>
    <div className="depositmethodpill"><WalletCards size={14}/> M-Pesa Paybill</div>
  </div>
  <label className="depositamountfield">
    <span className="currencybadge">KSh</span>
    <input required inputMode="numeric" pattern="[0-9]*" type="number" min="100" step="1" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value.replace(/[^0-9]/g,""))} aria-label="Deposit amount in Kenyan shillings"/>
    <span className="depositamountsuffix">KES</span>
  </label>
  <div className="depositquick">
    {[500,1000,2000,5000].map(v=><button key={v} type="button" className={Number(amount)===v?"selected":""} onClick={()=>setAmount(String(v))}>KSh {v.toLocaleString()}</button>)}
  </div>
  <div className="depositamountfoot"><span><ShieldCheck size={14}/> Secure manual verification</span><span>Minimum KSh 100</span></div>
</div>{msg&&<div className="error">{msg}</div>}<button className="primary" disabled={busy}>{busy?"Preparing payment…":"Continue to Paybill"}</button></form>}
 {step==="pay"&&payment&&<><div className="paybillbox"><div className="paybilldetails"><div><span>Paybill</span><strong>{payment.paybillNumber}</strong></div><div className="paybillrowcopy"><span>Account</span><div className="paybillaccountvalue"><strong>{payment.paybillAccount}</strong><button type="button" className="copyaccountbtn" onClick={async()=>{try{await navigator.clipboard.writeText(String(payment.paybillAccount));setMsg("Co-op account number copied.");}catch{window.prompt("Copy Co-op account number:",String(payment.paybillAccount))}}}><Copy size={14}/> Copy</button></div></div><div><span>Amount</span><strong>{money(payment.amount)}</strong></div><div><span>Reference</span><strong className="refcode">{payment.reference}</strong></div></div><ol className="paybillsteps"><li>Open M-Pesa → Lipa na M-Pesa → PayBill.</li><li>Enter Paybill <b>{payment.paybillNumber}</b>.</li><li>Enter account <b>{payment.paybillAccount}</b>.</li><li>Enter exactly <b>{money(payment.amount)}</b> and complete with your PIN.</li><li>Return here and submit the M-Pesa confirmation code.</li></ol></div><form onSubmit={submitCode} className="paybillcodeform"><label className="fieldlabel">M-Pesa confirmation code<input required value={code} onChange={e=>setCode(e.target.value)} placeholder="e.g. QH12XXXXXX" autoComplete="one-time-code"/></label>{msg&&<div className="error">{msg}</div>}<button className="primary" disabled={busy}>{busy?"Submitting code…":"Submit confirmation code"}</button></form></>}
 {step==="waiting"&&payment&&<div className="paymentbody"><div className="paymentstatus"><div className="paymenticon pending"><RefreshCw size={28}/></div><div><b>Deposit awaiting verification</b><p className="muted">Your M-Pesa code was submitted. An administrator will verify the payment before the wallet is credited.</p></div></div><div className="paymentdetails"><div><span>Amount</span><strong>{money(payment.amount)}</strong></div><div><span>Reference</span><strong>{payment.reference}</strong></div></div>{msg&&<div className="notice">{msg}</div>}<button className="secondary" disabled={busy} onClick={check}><RefreshCw size={16}/> Check verification</button></div>}
 {step==="done"&&<div className="successbox"><CheckCircle2 size={34}/><h3>Deposit verified</h3><p className="muted">Your wallet has been credited successfully.</p><button className="primary" onClick={onClose}>Done</button></div>}
 {step==="failed"&&<div className="error"><b>Deposit was rejected.</b><p>{payment?.message||"The payment could not be verified."}</p><button className="primary" onClick={()=>{setStep("form");setPayment(null);setCode("")}}>Try again</button></div>}
 </div><div className="modalfoot"><button type="button" className="secondary" onClick={onClose}>{step==="done"?"Close":"Cancel"}</button></div></div></div>;
}

function Wallet({me,load}){
 const [tab,setTab]=useState("balance"),[depositOpen,setDepositOpen]=useState(false);const [amount,setAmount]=useState(""),[phone,setPhone]=useState(me.user.phone||""),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false);
 const withdraw=async()=>{setMsg("");const n=Number(amount);if(!Number.isInteger(n)||n<100)return setMsg("Enter a whole amount of at least KSh 100.");if(n>Number(me.wallet?.balance||0))return setMsg("The withdrawal amount exceeds your available balance.");if(!validPhone(phone))return setMsg("Enter a valid Kenyan phone number: 07…, 01…, 2547… or 2541…. ");setBusy(true);try{const d=await api("/withdrawals",{method:"POST",body:JSON.stringify({amount:n,phone:cleanPhone(phone)})});setMsg(`${d.message}. Reference: ${d.reference}`);setAmount("");await load()}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 return <section><div className="sectionhead"><div><span className="pill">WALLET</span><h1>Balance & funds</h1><p className="muted">Manage your available balance, add funds and request withdrawals.</p></div></div><div className="walletbig"><span>Available balance</span><strong>{money(me.wallet?.balance)}</strong><p>Total earned {money(me.wallet?.totalEarned)} · Pending {money(me.wallet?.pendingBalance)} · Withdrawn {money(me.wallet?.totalWithdrawn)}</p></div><div className="wallettabs"><button className={tab==="balance"?"active":""} onClick={()=>setTab("balance")}>Balance</button><button className={tab==="deposit"?"active":""} onClick={()=>setTab("deposit")}>Deposit</button><button className={tab==="withdraw"?"active":""} onClick={()=>setTab("withdraw")}>Withdraw</button></div>{tab==="balance"&&<div className="walletsummarygrid"><div className="panel"><h3>Available</h3><strong className="walletmetric">{money(me.wallet?.balance)}</strong><p className="muted">Funds currently available for eligible wallet purchases or withdrawals.</p></div><div className="panel"><h3>Pending</h3><strong className="walletmetric">{money(me.wallet?.pendingBalance)}</strong><p className="muted">Funds currently reserved for withdrawal processing.</p></div><div className="panel"><h3>Total earned</h3><strong className="walletmetric">{money(me.wallet?.totalEarned)}</strong><p className="muted">Recorded earnings credited to your wallet over time.</p></div></div>}{tab==="deposit"&&<div className="panel formpanel"><h3>Deposit to wallet</h3><p className="muted">Add money through Co-op Bank Paybill. You pay manually in M-Pesa and NEXORA verifies the confirmation code before crediting your wallet.</p><button className="primary" onClick={()=>setDepositOpen(true)}><WalletCards size={16}/> Deposit via Co-op Paybill</button><p className="muted small">Minimum deposit: KSh 100. Never share your M-Pesa PIN with anyone.</p></div>}{tab==="withdraw"&&<div className="panel formpanel"><h3>Request withdrawal</h3>{msg&&<div className="notice">{msg}</div>}<input type="number" min="100" step="1" placeholder="Amount (KSh)" value={amount} onChange={e=>setAmount(e.target.value)}/><input inputMode="tel" maxLength="13" placeholder="M-Pesa phone: 07…, 01…, 2547… or 2541…" value={phone} onChange={e=>setPhone(e.target.value)}/><p className="muted small phonehint">Accepted: 07xxxxxxxx · 01xxxxxxxx · 2547xxxxxxxx · 2541xxxxxxxx</p><button disabled={busy} className="primary" onClick={withdraw}>{busy?"Submitting…":"Request withdrawal"}</button><p className="muted small">Minimum withdrawal: KSh 100. Withdrawals are reviewed/processed by the administrator.</p></div>}{depositOpen&&<DepositModal onClose={()=>setDepositOpen(false)} load={load} defaultPhone={me.user.phone||""}/>}</section>}
function ReceiptModal({receipt,onClose}){return <div className="modalbackdrop" onClick={onClose}><div className="modal receiptmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill payment-success">PAYMENT RECEIPT</span><h2>Payment successful</h2></div><button className="iconbtn" onClick={onClose}><X size={20}/></button></div><div className="receiptbody"><div className="receiptcheck"><CheckCircle2 size={34}/><div><strong>Payment confirmed</strong><span>Your transaction was recorded successfully.</span></div></div><div className="receiptgrid"><div><span>Item</span><strong>{receipt.package?.name||receipt.type||"NEXORA payment"}</strong></div><div><span>Amount paid</span><strong>{money(receipt.amount)}</strong></div><div><span>Payment method</span><strong>{receipt.method||"NEXORA Wallet"}</strong></div><div><span>Status</span><strong className="receiptpaid">{receipt.status||"PAID"}</strong></div><div><span>Reference</span><strong>{receipt.reference}</strong></div><div><span>Date</span><strong>{new Date(receipt.createdAt||Date.now()).toLocaleString()}</strong></div>{receipt.previousBalance!==undefined&&<div><span>Previous balance</span><strong>{money(receipt.previousBalance)}</strong></div>}{receipt.remainingBalance!==undefined&&<div><span>Remaining balance</span><strong>{money(receipt.remainingBalance)}</strong></div>}</div><div className="notice"><ShieldCheck size={16}/> Keep this reference if you ever need help with this payment.</div></div><div className="modalfoot"><button className="secondary" onClick={onClose}>Close</button><button className="primary" onClick={()=>window.print()}><ReceiptText size={16}/> Print / Save receipt</button></div></div></div>}

function Transactions({rows,onOpenPending,onOpenReceipt}){return <section><div className="sectionhead"><div><span className="pill">ACCOUNT RECORDS</span><h1>Orders & Transactions</h1><p className="muted">Review payments, references and account activity. Open a completed payment for its receipt.</p></div></div><div className="panel">{rows.length?rows.map(x=><div className="row simple" key={x.id}><div><b>{x.type.replaceAll("_"," ")}</b><small>{new Date(x.createdAt).toLocaleString()} · {x.reference}</small></div><div className="transactionright"><strong>{money(x.amount)}</strong><small className={`txstatus ${String(x.status||"").toLowerCase()}`}>{x.status}</small>{String(x.status||"").toUpperCase()==="PENDING"&&x.type==="PACKAGE_PURCHASE"&&<button className="txcheck" onClick={()=>onOpenPending(x)}><RefreshCw size={13}/> Check payment</button>}{String(x.status||"").toUpperCase()==="SUCCESS"&&<button className="txcheck" onClick={()=>onOpenReceipt(x)}><ReceiptText size={13}/> View receipt</button>}</div></div>):<p className="muted">No transactions yet.</p>}</div></section>}

class NEXORAErrorBoundary extends React.Component {
 constructor(props){super(props);this.state={error:null};}
 static getDerivedStateFromError(error){return {error};}
 componentDidCatch(error,info){console.error("NEXORA UI error",error,info);}
 render(){if(!this.state.error)return this.props.children;return <div className="app-error-screen"><div className="app-error-card"><span className="pill">NEXORA</span><h1>Something went wrong</h1><p className="muted">This screen could not be displayed. Your account data is safe. Please try again.</p><div className="rowactions"><button className="secondary" onClick={()=>window.location.reload()}><RefreshCw size={16}/> Reload NEXORA</button><button className="primary" onClick={()=>this.setState({error:null})}>Try again</button></div></div></div>}}

createRoot(document.getElementById("root")).render(<NEXORAErrorBoundary><App/></NEXORAErrorBoundary>);
