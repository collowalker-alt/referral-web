import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {createPortal} from "react-dom";
import {LayoutDashboard,Users,WalletCards,Package as PackageIcon,LogOut,Copy,ArrowUpRight,Menu,X,ShieldCheck,RefreshCw,History,CheckCircle2,MessageCircle,BookOpen,ExternalLink,UsersRound,ReceiptText,HandCoins,Settings2,Search,LockKeyhole,LogIn,Ban,UserCheck,Clock3,Check,ChevronDown,BarChart3, UserRound, Wrench, Activity, Download, Eye, EyeOff, CreditCard, AlertTriangle, FileSpreadsheet, Trophy, Megaphone, Share2, QrCode, Bell, LifeBuoy, GraduationCap, Shield, UserCog, KeyRound, Send, Target, TrendingUp, Medal, Crown, Sparkles, CheckCheck, BarChart2, Users2, CopyCheck, Store, Link2, CalendarCheck2, ShoppingCart, MapPin, Plus, Trash2, PackageCheck, Truck, Heart, Filter, Edit3, Upload, FileImage, Video, ClipboardCopy, Star} from "lucide-react";
import "./styles.css";
const API=(import.meta.env.VITE_API_URL||"https://nexora-api-shxf.onrender.com/api").replace(/\/$/,"");
const money=n=>`KSh ${Number(n||0).toLocaleString()}`;
const waShare=(text)=>{const url=`https://wa.me/?text=${encodeURIComponent(text)}`;window.open(url,"_blank","noopener,noreferrer");};
const checklistKey=id=>`nexora-checklist-${id}`;

const PHONE_RE=/^(?:07\d{8}|011\d{7}|2547\d{8}|2541\d{8})$/;
const cleanPhone=v=>String(v||"").trim().replace(/[\s().-]/g,"").replace(/^\+/,"");
const validPhone=v=>PHONE_RE.test(cleanPhone(v));
async function api(path,opts={}){const token=localStorage.getItem("token");const r=await fetch(API+path,{...opts,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||"Request failed");return d}

function NexoraSplash({label="Loading your workspace…"}){return <div className="nexorasplash" role="status" aria-label="Loading NEXORA"><div className="splashorb splashorb1"/><div className="splashorb splashorb2"/><div className="splashring splashring1"/><div className="splashring splashring2"/><div className="splashlogo"><span className="splashlogoLayer layerBack"><img src="/nexora-logo.png" alt=""/></span><span className="splashlogoLayer layerMid"><img src="/nexora-logo.png" alt=""/></span><span className="splashlogoLayer layerMain"><img src="/nexora-logo.png" alt="NEXORA"/></span><i className="splashshine"/></div><div className="splashscan"/><div className="splashdots"><i/><i/><i/><i/><i/><i/></div><div className="splashbrand">NEXORA<span>.</span></div><div className="splashlabel">{label}</div></div>}

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

  const submit=async e=>{
    e.preventDefault();setErr("");setSuccessMsg("");
    if(mode==="register"){
      if(f.password!==confirmPassword) return setErr("Passwords do not match.");
      if(!validPhone(f.phone)) return setErr("Enter a valid Kenyan phone number: 07…, 011…, 2547… or 2541….");
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
        const body={...f,phone:mode==="register"?cleanPhone(f.phone):f.phone,referralCode:(f.referralCode||ref||"").toUpperCase(),website:""};
        const d=await api(`/auth/${mode==="login"?"login":"register"}`,{method:"POST",body:JSON.stringify(body)});
        if(mode==="register"){
          setSuccessMsg("Account created successfully. Opening your workspace…");
          localStorage.setItem("token",d.token);
          await new Promise(r=>setTimeout(r,700));
          await onLogin();onClose();
        }else{
          localStorage.setItem("token",d.token);
          await onLogin();onClose();
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
          <label className="fieldlabel">Phone (M-Pesa)
            <input required inputMode="tel" maxLength={13} autoComplete="tel" value={f.phone} onChange={e=>setField("phone",e.target.value)} placeholder="07…, 011…, 2547… or 2541…"/>
            {f.phone&&phoneValid===true&&<span className="fieldhint ok">✓ Valid Kenyan number</span>}
            {f.phone&&phoneValid===false&&<span className="fieldhint bad">Use 07…, 011…, 2547… or 2541…</span>}
            {!f.phone&&<span className="fieldhint">We will use this number for M-Pesa payment requests.</span>}
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
      {(mode==="login"||mode==="register")&&<p className="muted small">By continuing you confirm that NEXORA does not guarantee income. Review the membership rules before activating a membership plan.</p>}
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
   {loading&&<p className="muted">Loading plans…</p>}
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
   <div className="earningsnotice" style={{marginTop:24}}><div><strong>Important</strong><p>Plan levels define which purchases you may be eligible to earn from. NEXORA does not guarantee income. Review Terms and Membership Rules before paying.</p></div></div>
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
        ["Membership & payments","Plan purchases and upgrades are processed through the payment providers configured by NEXORA (including Paystack / M-Pesa). Charges, upgrades (price difference only) and refunds follow the rules shown in the platform at the time of the transaction."],
        ["No income guarantee","Nothing on NEXORA constitutes a guarantee of income, profit or financial return. Referral commissions are recorded only when qualifying purchases and plan eligibility rules are satisfied."],
        ["Acceptable use","You must not misrepresent the platform, make guaranteed-income claims, share accounts, attempt to manipulate referrals, or use NEXORA for unlawful activity."],
        ["Suspension","NEXORA may suspend or restrict accounts that violate these terms, present security risk, or require review for payment or withdrawal integrity."],
        ["Contact","Questions about these terms can be raised through the in-app Help & Support centre or the published support channel."]
      ]
    },
    privacy:{
      title:"Privacy Policy",
      sections:[
        ["What we collect","Account data such as name, email, phone number, referral relationships, plan status, wallet and transaction records, support messages and basic device/session information needed to operate the service."],
        ["How we use it","To provide membership, payments, referral tracking, analytics, Academy progress, support, security and account recovery functions."],
        ["Payments","Payment processing is handled by third-party providers (e.g. Paystack). NEXORA does not store full card or M-Pesa PIN data."],
        ["Sharing","We share data only as needed with payment processors, infrastructure providers, and when required by law. We do not sell personal data."],
        ["Security","Access is limited to operational needs. You should use a strong unique password and never share it with anyone, including people claiming to be support."],
        ["Retention","We keep account and transaction records for as long as needed to operate the platform, meet legal obligations and resolve disputes."],
        ["Your choices","You may update profile details in the Security Centre and contact support for account-related requests."]
      ]
    },
    membership:{
      title:"Membership & Referral Rules",
      sections:[
        ["Plan eligibility","Starter can earn from Starter purchases; Growth from Starter + Growth; Pro from Starter + Growth + Pro; Elite from Starter through Elite; Premium from all five plans. Commission amounts come from the plan purchased by the referral."],
        ["Recorded commissions only","Commissions are recorded when a qualifying referral purchase completes and your plan level is eligible. The UI describes eligibility and recorded outcomes — never guaranteed income."],
        ["Upgrades","Upgrading charges only the price difference between your current plan and the new plan."],
        ["Withdrawals","Withdrawal requests depend on available balance, plan withdrawal limits and review. Processing times and outcomes can vary."],
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


const adminApi=async(path,opts={})=>{const token=localStorage.getItem("adminToken");const r=await fetch(API+path,{...opts,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.message||"Admin request failed");return d};
const downloadAdminCsv=async(type)=>{const token=localStorage.getItem("adminToken");const r=await fetch(API+`/admin/export/${type}`,{headers:{Authorization:`Bearer ${token}`}});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||"Export failed")}const blob=await r.blob();const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`nexora-${type}.csv`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href)};
function AdminLogin({onLogin}){const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[err,setErr]=useState(""),[busy,setBusy]=useState(false);const submit=async e=>{e.preventDefault();setErr("");setBusy(true);try{const d=await adminApi("/admin/auth/login",{method:"POST",body:JSON.stringify({email,password})});localStorage.setItem("adminToken",d.token);onLogin(d.admin)}catch(e){setErr(e.message)}finally{setBusy(false)}};return <div className="adminauth"><div className="adminloginbox"><div className="adminlogo"><img src="/nexora-logo.png"/><div><div className="brand">NEXORA<span>.</span></div><span>ADMIN CONTROL</span></div></div><div className="adminshield"><LockKeyhole size={26}/></div><h1>Administrator login</h1><p className="muted">Secure access to users, payments, withdrawals and plans.</p>{err&&<div className="error">{err}</div>}<form onSubmit={submit}><label>Email</label><input required type="email" autoComplete="username" placeholder="admin@yourdomain.com" value={email} onChange={e=>setEmail(e.target.value)}/><label>Password</label><input required type="password" autoComplete="current-password" placeholder="Admin password" value={password} onChange={e=>setPassword(e.target.value)}/><button disabled={busy} className="primary adminloginbtn"><LogIn size={17}/>{busy?"Signing in…":"Sign in securely"}</button></form><a className="adminback" href="/">← Back to member login</a></div></div>}
function AdminApp(){const [admin,setAdmin]=useState(null),[loading,setLoading]=useState(true),[page,setPage]=useState("overview"),[data,setData]=useState({overview:null,users:[],transactions:[],withdrawals:[],packages:[],announcements:[],deposits:[]}),[error,setError]=useState(""),[search,setSearch]=useState(""),[mobile,setMobile]=useState(false),[notice,setNotice]=useState("");
 const load=async(show=true)=>{if(show)setLoading(true);setError("");try{const a=await adminApi("/admin/me");setAdmin(a.admin);const [overview,users,transactions,withdrawals,packages,announcements,adProducts,adSubmissions,deposits,marketProducts,marketOrders]=await Promise.all([adminApi("/admin/overview"),adminApi("/admin/users"),adminApi("/admin/transactions"),adminApi("/admin/withdrawals"),adminApi("/admin/packages"),adminApi("/admin/announcements"),adminApi("/admin/ad-products"),adminApi("/admin/ad-submissions"),adminApi("/admin/wallet/deposits"),adminApi("/admin/marketplace/products"),adminApi("/admin/marketplace/orders")]);setData({overview,users,transactions,withdrawals,packages,announcements,adProducts,adSubmissions,deposits,marketProducts,marketOrders});}catch(e){localStorage.removeItem("adminToken");setAdmin(null);if(!String(e.message).toLowerCase().includes("session"))setError(e.message)}finally{setLoading(false)}};
 useEffect(()=>{if(localStorage.getItem("adminToken"))load();else setLoading(false)},[]);
 const action=async(fn,msg)=>{try{await fn();setNotice(msg);await load(false);return true}catch(e){setError(e.message);return false}};
 if(loading&&!admin)return <NexoraSplash label="Opening admin console…"/>;if(!admin)return <AdminLogin onLogin={a=>{setAdmin(a);load(false)}}/>;
 const nav=[["overview","Overview",BarChart3],["users","Users",UsersRound],["transactions","Transactions",ReceiptText],["repair","Payment repair",Wrench],["paybillverify","Paybill payments",CheckCircle2],["deposits","Wallet deposits",WalletCards],["withdrawals","Withdrawals",HandCoins],["packages","Packages",PackageIcon],["advertising","Advertising",Megaphone],["marketplace","Marketplace",Store],["announcements","Announcements",Megaphone],["support","Support tickets",LifeBuoy],["activity","Activity log",Activity]];
 const logout=()=>{localStorage.removeItem("adminToken");setAdmin(null)};
 const title=nav.find(x=>x[0]===page)?.[1]||"Overview";
 return <div className="adminapp"><aside className={mobile?"open":""}><div className="adminnavbrand"><img src="/nexora-logo.png"/><div><b>NEXORA</b><small>ADMIN</small></div></div>{nav.map(([id,t,I])=><button key={id} className={page===id?"active":""} onClick={()=>{setPage(id);setMobile(false)}}><I size={18}/>{t}</button>)}<div className="adminnavspacer"/><button onClick={()=>setNotice(`Paystack is currently in ${data.overview?.paystackMode||"unknown"} mode.`)}><Settings2 size={18}/>Payment mode</button><button onClick={logout}><LogOut size={18}/>Logout</button></aside><main className="adminmain"><header className="adminheader"><button className="mobilemenu" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button><div><b>{title}</b><div className="muted small">NEXORA administrator console</div></div><div className="adminuser"><PWAInstall compact/><ShieldCheck size={17}/><span>{admin.name}</span></div></header>{error&&<div className="error topmsg"><span>{error}</span><button onClick={()=>load(false)}><RefreshCw size={15}/> Retry</button></div>}{notice&&<div className="notice topmsg"><span>{notice}</span><button onClick={()=>setNotice("")}>×</button></div>}
 {page==="overview"&&<AdminOverview data={data.overview} onRefresh={()=>load(false)}/>} {page==="users"&&<AdminUsers rows={data.users} search={search} setSearch={setSearch} action={action}/>} {page==="transactions"&&<AdminTransactions rows={data.transactions}/>} {page==="repair"&&<AdminPaymentRepair action={action}/>} {page==="paybillverify"&&<AdminPaybillVerify action={action}/>} {page==="deposits"&&<AdminDepositVerify action={action}/>} {page==="withdrawals"&&<AdminWithdrawals rows={data.withdrawals} action={action}/>} {page==="packages"&&<AdminPackages rows={data.packages} action={action}/>} {page==="advertising"&&<AdminAdvertising products={data.adProducts||[]} submissions={data.adSubmissions||[]} action={action} reload={()=>load(false)}/>} {page==="marketplace"&&<AdminMarketplace products={data.marketProducts||[]} orders={data.marketOrders||[]} action={action}/>} {page==="announcements"&&<AdminAnnouncements action={action}/>} {page==="support"&&<AdminSupportTickets action={action}/>} {page==="activity"&&<AdminActivity/>}</main></div>}
function AdminMarketplace({products,orders,action}){const [tab,setTab]=useState("products");const moderate=async(p,status)=>{await action(()=>adminApi(`/admin/marketplace/products/${p.id}`,{method:"PATCH",body:JSON.stringify({status})}),`Product ${status.toLowerCase()}`)};const verifySeller=async(id,v)=>{await action(()=>adminApi(`/admin/marketplace/sellers/${id}`,{method:"PATCH",body:JSON.stringify({sellerVerified:v})}),v?"Seller verified":"Seller verification removed")};return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">MARKETPLACE CONTROL</span><h1>Marketplace Manager</h1><p className="muted">Moderate listings, verify sellers and monitor marketplace orders.</p></div></div><div className="adminquick adtabs"><button className={tab==="products"?"active":""} onClick={()=>setTab("products")}>Listings ({products.length})</button><button className={tab==="orders"?"active":""} onClick={()=>setTab("orders")}>Orders ({orders.length})</button></div>{tab==="products"&&<div className="table">{products.map(p=><div className="row" key={p.id}><div><b>{p.title}</b><small>{p.seller?.name} · {p.seller?.email}</small></div><strong>{money(p.price)}</strong><span>{p.status}</span><span>{p.seller?.sellerVerified?"Verified seller":"Seller not verified"}</span><div className="rowactions">{!p.seller?.sellerVerified&&<button className="secondary" onClick={()=>verifySeller(p.sellerId,true)}>Verify seller</button>}<button className="secondary" onClick={()=>moderate(p,p.status==="ACTIVE"?"HIDDEN":"ACTIVE")}>{p.status==="ACTIVE"?"Hide":"Publish"}</button><button className="secondary" onClick={()=>moderate(p,"REJECTED")}>Reject</button></div></div>)}{!products.length&&<p className="muted">No marketplace listings.</p>}</div>}{tab==="orders"&&<div className="table">{orders.map(o=><div className="row" key={o.id}><div><b>{o.reference}</b><small>Buyer: {o.buyer?.name} · Seller: {o.seller?.name}</small></div><strong>{money(o.total)}</strong><span>{o.status}</span><span>{o.paymentStatus}</span><small>{new Date(o.createdAt).toLocaleString()}</small></div>)}{!orders.length&&<p className="muted">No marketplace orders.</p>}</div>}</section>}
function AdminOverview({data,onRefresh}){if(!data)return <div className="adminloading">Loading overview…</div>;const cards=[["Total users",data.users,UsersRound],["Active users",data.activeUsers,UserCheck],["Transactions",data.transactions,ReceiptText],["Pending payments",data.pendingPayments,Clock3],["Failed payments",data.failedPayments||0,AlertTriangle],["Successful plan activations",money(data.successfulPayments),CheckCircle2],["Pending withdrawals",data.pendingWithdrawals,HandCoins],["Total commissions",money(data.totalCommissions),ArrowUpRight]];return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">CONTROL CENTER</span><h1>Good to see you, Administrator</h1><p className="muted">Monitor NEXORA activity, repair verified payments and manage member operations.</p></div><button className="secondary" onClick={onRefresh}><RefreshCw size={16}/> Refresh</button></div><div className="adminstats">{cards.map(([label,value,I])=><div className="adminstat" key={label}><I size={19}/><span>{label}</span><strong>{value}</strong></div>)}</div>{((data.pendingPayments||0)>0||(data.pendingWithdrawals||0)>0||(data.failedPayments||0)>0)&&<div className="adminpanel alertpanel"><div><h3><AlertTriangle size={18}/> Attention needed</h3><p className="muted">{data.pendingPayments||0} pending payment(s), {data.pendingWithdrawals||0} pending withdrawal(s), and {data.failedPayments||0} failed payment(s) are currently recorded.</p></div><div className="adminquick"><span>{data.pendingPayments||0} Pending payments</span><span>{data.pendingWithdrawals||0} Pending withdrawals</span><span>{data.failedPayments||0} Failed payments</span></div></div>}<div className="adminpanel"><div><h3>Admin access</h3><p className="muted">Admin sessions expire after 12 hours. Sensitive actions are recorded in the Activity Log.</p></div><div className="adminquick"><span><Check size={14}/> Users</span><span><Check size={14}/> Payments</span><span><Check size={14}/> Withdrawals</span><span><Check size={14}/> Audit log</span></div></div><div className="adminpanel"><div><h3>Data exports</h3><p className="muted">Download current member, transaction or withdrawal records as CSV.</p></div><div className="adminquick"><button className="rowaction" onClick={()=>downloadAdminCsv("users")}><Download size={14}/> Users CSV</button><button className="rowaction" onClick={()=>downloadAdminCsv("transactions")}><Download size={14}/> Transactions CSV</button><button className="rowaction" onClick={()=>downloadAdminCsv("withdrawals")}><Download size={14}/> Withdrawals CSV</button></div></div><div className="adminpanel warningpanel"><div><h3>Paystack environment</h3><p className="muted">Current server key mode: <strong>{data.paystackMode}</strong>. Live mode is required for real M-Pesa transactions.</p></div><a className="secondary" href="https://dashboard.paystack.com/" target="_blank" rel="noreferrer">Open Paystack</a></div></section>}
function AdminUsers({rows,search,setSearch,action}){
 const [balanceOpen,setBalanceOpen]=useState(false),[detail,setDetail]=useState(null),[detailsLoading,setDetailsLoading]=useState(false);
 const [form,setForm]=useState({email:"",mode:"add",amount:"",reason:"",updateTotalEarned:false});
 const filtered=rows.filter(u=>!search||`${u.name} ${u.email} ${u.phone} ${u.referralCode}`.toLowerCase().includes(search.toLowerCase()));
 const openBalance=(u=null)=>{const preset=u?.email || (search.includes("@") ? search : "");setForm({email:preset,mode:"add",amount:"",reason:"",updateTotalEarned:false});setBalanceOpen(true)};
 const openDetails=async u=>{setDetailsLoading(true);try{setDetail(await adminApi(`/admin/users/${u.id}/details`))}catch(e){alert(e.message)}finally{setDetailsLoading(false)}};
 const submit=async e=>{e.preventDefault();const ok=await action(()=>adminApi("/admin/users/balance",{method:"POST",body:JSON.stringify({...form,amount:Number(form.amount)})}),"Member balance corrected successfully");if(ok){setBalanceOpen(false);setForm({email:"",mode:"add",amount:"",reason:"",updateTotalEarned:false})}};
 return <section className="adminsection">
  <div className="adminsectionhead"><div><h1>Users</h1><p className="muted">Search members, inspect full account history and manage account status.</p></div><div className="rowactions"><button className="secondary" onClick={()=>downloadAdminCsv("users")}><Download size={16}/> Export CSV</button><button className="secondary" onClick={()=>openBalance()}><WalletCards size={16}/> Correct balance</button></div></div>
  <div className="adminsearch"><Search size={17}/><input placeholder="Search name, email, phone or referral code" value={search} onChange={e=>setSearch(e.target.value)}/></div>
  <div className="adminpanel balancehelp"><div><h3>Manual balance correction</h3><p className="muted">Use this only after verifying the member's payment or earnings. Every correction requires a reason and is added to the audit trail.</p></div><button className="secondary" onClick={()=>openBalance()}>Open tool</button></div>
  <div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>User</span><span>Phone</span><span>Plan</span><span>Balance</span><span>Status</span><span>Action</span></div>{filtered.map(u=><div className="adminrow" key={u.id}><div><b>{u.name}</b><small>{u.email}</small><small>Ref: {u.referralCode}</small></div><span>{u.phone}</span><span>{u.package?.name||"—"}</span><span>{money(u.wallet?.balance)}</span><span><em className={`adminstatus ${u.status.toLowerCase()}`}>{u.status}</em></span><div className="rowactions"><button className="rowaction" onClick={()=>openDetails(u)}><Eye size={14}/> Details</button><button className="rowaction" onClick={()=>openBalance(u)}><WalletCards size={14}/> Balance</button><button className="rowaction" onClick={()=>action(()=>adminApi(`/admin/users/${u.id}/status`,{method:"PATCH",body:JSON.stringify({status:u.status==="ACTIVE"?"SUSPENDED":"ACTIVE"})}),u.status==="ACTIVE"?"User suspended":"User reactivated")}>{u.status==="ACTIVE"?<><Ban size={14}/> Suspend</>:<><UserCheck size={14}/> Activate</>}</button></div></div>)}{!filtered.length&&<div className="adminempty">No users match your search.</div>}</div></div>
  {balanceOpen&&<div className="modalbackdrop" onClick={()=>setBalanceOpen(false)}><div className="modal adminbalance" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">WALLET CORRECTION</span><h2>Update member balance</h2></div><button className="iconbtn" onClick={()=>setBalanceOpen(false)}><X size={20}/></button></div><form className="adminbalanceform" onSubmit={submit}><p className="muted">Enter the member's email address. For a missing commission, choose <b>Add to balance</b> and enter the verified amount.</p><label>Member email<input required type="email" placeholder="member@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Correction type<select value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})}><option value="add">Add to balance</option><option value="subtract">Subtract from balance</option><option value="set">Set exact balance</option></select></label><label>Amount (KSh)<input required type="number" min="0" step="1" placeholder="e.g. 200" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label><label>Reason<input required maxLength="500" placeholder="Verified plan commission missing" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/></label><label className="checkline"><input type="checkbox" checked={form.updateTotalEarned} onChange={e=>setForm({...form,updateTotalEarned:e.target.checked})}/> Also update Total Earned</label><p className="muted small">Only enable Total Earned when the correction represents genuine earnings that were missed. Pending balance is not changed.</p><div className="rowactions"><button type="button" className="secondary" onClick={()=>setBalanceOpen(false)}>Cancel</button><button type="submit" className="primary narrow">Apply correction</button></div></form></div></div>}
  {detail&&<div className="modalbackdrop" onClick={()=>setDetail(null)}><div className="modal adminmemberdetail" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">MEMBER PROFILE</span><h2>{detail.name}</h2><p className="muted">{detail.email} · {detail.phone}</p></div><button className="iconbtn" onClick={()=>setDetail(null)}><X size={20}/></button></div><div className="detailgrid"><div><span>Balance</span><b>{money(detail.wallet?.balance)}</b></div><div><span>Total earned</span><b>{money(detail.wallet?.totalEarned)}</b></div><div><span>Pending</span><b>{money(detail.wallet?.pendingBalance)}</b></div><div><span>Withdrawn</span><b>{money(detail.wallet?.totalWithdrawn)}</b></div><div><span>Plan</span><b>{detail.package?.name||"None"}</b></div><div><span>Status</span><b>{detail.status}</b></div></div><div className="detailcols"><div><h3>Recent transactions</h3>{(detail.transactions||[]).slice(0,10).map(x=><div className="detailrow" key={x.id}><span>{x.type.replaceAll("_"," ")}<small>{x.reference}</small></span><b>{money(x.amount)} · {x.status}</b></div>)}{!detail.transactions?.length&&<p className="muted">No transactions.</p>}</div><div><h3>Referrals</h3>{(detail.referrals||[]).slice(0,10).map(x=><div className="detailrow" key={x.id}><span>{x.name}<small>{x.email}</small></span><b>{x.package?.name||"No plan"}</b></div>)}{!detail.referrals?.length&&<p className="muted">No referrals.</p>}</div></div><div className="detailactions"><button className="secondary" onClick={()=>{setDetail(null);openBalance(detail)}}><WalletCards size={15}/> Correct balance</button></div></div></div>}
  {detailsLoading&&<div className="detailloading">Loading member details…</div>}
 </section>
}
function AdminTransactions({rows}){const [repair,setRepair]=useState(null);return <section className="adminsection"><div className="adminsectionhead"><div><h1>Transactions</h1><p className="muted">Plan payments, commissions, refunds and withdrawal records.</p></div><div className="rowactions"><button className="secondary" onClick={()=>downloadAdminCsv("transactions")}><Download size={16}/> Export CSV</button><button className="secondary" onClick={()=>setRepair({email:"",reference:""})}><Wrench size={16}/> Repair payment</button></div></div><div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Reference</span><span>Member</span><span>Type</span><span>Amount</span><span>Status</span><span>Date</span></div>{rows.map(x=><div className="adminrow" key={x.id}><div><b>{x.reference}</b><small>{x.metadata?.paystack?.gateway_response||x.metadata?.paystack?.display_text||""}</small></div><div><b>{x.user?.name}</b><small>{x.user?.email}</small></div><span>{x.metadata?.adminBalanceAdjustment?"ADMIN BALANCE ADJUSTMENT":x.type.replaceAll("_"," ")}</span><strong className={x.metadata?.adminBalanceAdjustment?(Number(x.amount)>=0?"green":"adminnegative"):""}>{money(x.amount)}</strong><em className={`adminstatus ${String(x.status).toLowerCase()}`}>{x.status}</em><small>{new Date(x.createdAt).toLocaleString()}</small></div>)}{!rows.length&&<div className="adminempty">No transactions yet.</div>}</div></div>{repair&&<AdminPaymentRepairInline value={repair} onClose={()=>setRepair(null)}/>}</section>}


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
function AdminPaymentRepair({action}){return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">PAYMENT RECOVERY</span><h1>Repair a verified payment</h1><p className="muted">Enter the member email and Paystack reference. NEXORA verifies the charge with Paystack before activating the plan or restoring the missing record.</p></div></div><AdminPaymentRepairInline action={action}/></section>}
function AdminPaymentRepairInline({value,onClose,action}){const [form,setForm]=useState(value||{email:"",reference:""}),[busy,setBusy]=useState(false),[result,setResult]=useState(""),[ok,setOk]=useState(false);const submit=async e=>{e.preventDefault();setBusy(true);setResult("");setOk(false);try{const d=await adminApi("/admin/payments/repair",{method:"POST",body:JSON.stringify(form)});setResult(d.message||"Payment repair complete");setOk(true);if(action)await action(async()=>d,"Payment repair completed")}catch(e){setResult(e.message);setOk(false)}finally{setBusy(false)}};return <div className="adminpanel repairpanel"><form className="repairform" onSubmit={submit}><div className="repairintro"><CreditCard size={22}/><div><h3>Verify before crediting</h3><p className="muted small">This tool never trusts an email or reference alone. The backend checks Paystack and only repairs a successful charge.</p></div></div><label>Member email<input required type="email" placeholder="member@example.com" value={form.email} onChange={e=>{setForm({...form,email:e.target.value});setOk(false);setResult("")}}/></label><label>Paystack transaction reference<input required placeholder="e.g. NEXORA-..." value={form.reference} onChange={e=>{setForm({...form,reference:e.target.value});setOk(false);setResult("")}}/></label>{result&&<div className={ok?"repairdone":"error"} role="status">{ok&&<CheckCircle2 size={20}/>}<div><b>{ok?"Done — payment repaired":"Repair failed"}</b><p>{result}</p></div></div>}<div className="rowactions">{onClose&&<button type="button" className="secondary" onClick={onClose}>Cancel</button>}<button className="primary" disabled={busy}>{busy?"Verifying…":ok?"Repair another":"Verify & repair payment"}</button></div></form></div>}

function AdminAdvertising({products:initialProducts,submissions:initialSubs,action,reload}){
 const [tab,setTab]=useState("submissions"),[products,setProducts]=useState(initialProducts),[subs,setSubs]=useState(initialSubs),[editing,setEditing]=useState(null),[form,setForm]=useState({title:"",description:"",platforms:"WhatsApp Status\nTikTok\nInstagram\nX",viewRatePer1000:0,engagementRate:0,active:true});
 useEffect(()=>{setProducts(initialProducts);setSubs(initialSubs)},[initialProducts,initialSubs]);
 const refresh=async()=>{setProducts(await adminApi("/admin/ad-products"));setSubs(await adminApi("/admin/ad-submissions"));if(reload)await reload()};
 const save=async()=>{const body={...form,platforms:form.platforms.split("\n").map(x=>x.trim()).filter(Boolean),viewRatePer1000:Number(form.viewRatePer1000),engagementRate:Number(form.engagementRate)};const ok=await action(()=>adminApi(editing?`/admin/ad-products/${editing}`:"/admin/ad-products",{method:editing?"PATCH":"POST",body:JSON.stringify(body)}),editing?"Advertising product updated":"Advertising product created");if(ok){setEditing(null);await refresh()}};
 const review=async(x,status)=>{const approved=status==="APPROVED"?(x.approvedPay??x.calculatedPay):status==="PAID"?(x.approvedPay??x.calculatedPay):0;const ok=await action(()=>adminApi(`/admin/ad-submissions/${x.id}`,{method:"PATCH",body:JSON.stringify({status,approvedPay:approved})}),`Submission marked ${status}`);if(ok)await refresh()};
 return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">ADVERTISING CONTROL CENTER</span><h1>Advertising Manager</h1><p className="muted">Create campaigns, set view/engagement rates, review member evidence and process Friday advertising payouts.</p></div><button className="secondary" onClick={refresh}><RefreshCw size={16}/> Refresh</button></div><div className="adminquick adtabs"><button className={tab==="submissions"?"active": ""} onClick={()=>setTab("submissions")}>Submissions ({subs.length})</button><button className={tab==="products"?"active": ""} onClick={()=>setTab("products")}>Products ({products.length})</button></div>{tab==="products"&&<><div className="adminpanel"><div className="adminedit packagecreate"><label>Campaign title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Description<textarea rows="3" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Approved platforms <span className="muted small">one per line</span><textarea rows="4" value={form.platforms} onChange={e=>setForm({...form,platforms:e.target.value})}/></label><label>KSh per 1,000 views<input type="number" min="0" value={form.viewRatePer1000} onChange={e=>setForm({...form,viewRatePer1000:e.target.value})}/></label><label>KSh per engagement<input type="number" min="0" value={form.engagementRate} onChange={e=>setForm({...form,engagementRate:e.target.value})}/></label><label className="checkline"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Campaign active</label><div className="rowactions"><button className="primary" onClick={save}>{editing?"Save campaign":"Create campaign"}</button>{editing&&<button className="secondary" onClick={()=>setEditing(null)}>Cancel</button>}</div></div></div><div className="adminpanel tablepanel"><div className="admintable">{products.map(p=><div className="adminrow" key={p.id}><div><b>{p.title}</b><small>{p.description}</small></div><span>{(p.platforms||[]).join(", ")}</span><span>{money(p.viewRatePer1000)}/1k views</span><span>{money(p.engagementRate)}/engagement</span><span>{p._count?.submissions||0} submissions</span><em className={`adminstatus ${p.active?"active":"suspended"}`}>{p.active?"LIVE":"OFF"}</em><button className="rowaction" onClick={()=>{setEditing(p.id);setForm({title:p.title,description:p.description,platforms:(p.platforms||[]).join("\n"),viewRatePer1000:p.viewRatePer1000,engagementRate:p.engagementRate,active:p.active})}}>Edit</button></div>)}</div></div></>}{tab==="submissions"&&<div className="adminpanel tablepanel"><div className="admintable">{subs.map(x=><div className="adminrow adreviewrow" key={x.id}><div><b>{x.user?.name}</b><small>{x.user?.email}</small><small>{x.product?.title}</small></div><div><a href={x.postUrl} target="_blank" rel="noreferrer">Open post</a>{x.postMediaData&&<details><summary>View submitted creative</summary>{String(x.postMediaType||"").startsWith("video/")?<video controls src={x.postMediaData}/>:<img src={x.postMediaData} alt="Submitted campaign creative"/>}</details>}</div><span>{x.views.toLocaleString()} views<br/>{x.engagements.toLocaleString()} engagements</span><strong>Calc: {money(x.calculatedPay)}<br/>Approved: {money(x.approvedPay??0)}</strong><em className={`adminstatus ${String(x.status).toLowerCase()}`}>{x.status}</em><div className="rowactions">{x.status==="SUBMITTED"&&<><button className="rowaction successaction" onClick={()=>review(x,"APPROVED")}>Approve</button><button className="rowaction dangeraction" onClick={()=>review(x,"REJECTED")}>Reject</button></>}{x.status==="APPROVED"&&<button className="rowaction successaction" onClick={()=>review(x,"PAID")}>Mark Friday paid</button>}</div></div>)}{!subs.length&&<div className="adminempty">No advertising submissions yet.</div>}</div></div>}</section>
}
function AdminWithdrawals({rows,action}){return <section className="adminsection"><div className="adminsectionhead"><div><h1>Withdrawals</h1><p className="muted">Review M-Pesa withdrawal requests and mark them processed.</p></div></div><div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Member</span><span>Phone</span><span>Amount</span><span>Reference</span><span>Status</span><span>Action</span></div>{rows.map(x=><div className="adminrow" key={x.id}><div><b>{x.user?.name}</b><small>{x.user?.email}</small></div><span>{x.phone}</span><strong>{money(x.amount)}</strong><span>{x.reference}</span><em className={`adminstatus ${String(x.status).toLowerCase()}`}>{x.status}</em><div className="rowactions">{x.status!=="PAID"&&x.status!=="FAILED"&&<><button className="rowaction" onClick={()=>action(()=>adminApi(`/admin/withdrawals/${x.id}/status`,{method:"PATCH",body:JSON.stringify({status:"PROCESSING"})}),"Withdrawal marked processing")}><Clock3 size={13}/> Process</button><button className="rowaction successaction" onClick={()=>action(()=>adminApi(`/admin/withdrawals/${x.id}/status`,{method:"PATCH",body:JSON.stringify({status:"PAID"})}),"Withdrawal marked paid")}><Check size={13}/> Paid</button><button className="rowaction dangeraction" onClick={()=>action(()=>adminApi(`/admin/withdrawals/${x.id}/status`,{method:"PATCH",body:JSON.stringify({status:"FAILED"})}),"Withdrawal failed and funds returned")}><Ban size={13}/> Fail</button></>}</div></div>)}{!rows.length&&<div className="adminempty">No withdrawal requests yet.</div>}</div></div></section>}
function AdminActivity(){const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[err,setErr]=useState("");const load=async()=>{setLoading(true);try{setRows(await adminApi("/admin/activity"))}catch(e){setErr(e.message)}finally{setLoading(false)}};useEffect(()=>{load()},[]);return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">AUDIT TRAIL</span><h1>Admin activity</h1><p className="muted">A record of sensitive administrator actions.</p></div><button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div>{err&&<div className="error">{err}</div>}<div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Action</span><span>Target</span><span>Admin</span><span>Details</span><span>Date</span><span>Reference</span></div>{loading?<div className="adminempty">Loading activity…</div>:rows.map(x=><div className="adminrow" key={x.id}><div><b>{String(x.action).replaceAll("_"," ")}</b></div><div><b>{x.targetType||"—"}</b><small>{x.targetEmail||x.targetId||""}</small></div><span>{x.adminEmail}</span><span>{x.details?.reason||x.details?.reference||x.details?.status||"—"}</span><small>{new Date(x.createdAt).toLocaleString()}</small><small>{x.details?.reference||"—"}</small></div>)}{!loading&&!rows.length&&<div className="adminempty">No admin activity recorded yet.</div>}</div></div></section>}
function AdminSupportTickets({action}){const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[open,setOpen]=useState(null),[response,setResponse]=useState("");const load=async()=>{setLoading(true);try{setRows(await adminApi("/admin/support/tickets"))}catch(e){alert(e.message)}finally{setLoading(false)}};useEffect(()=>{load()},[]);const save=async()=>{if(!open)return;await action(()=>adminApi(`/admin/support/tickets/${open.id}`,{method:"PATCH",body:JSON.stringify({status:open.status,response})}),"Support ticket updated");setOpen(null);setResponse("");await load()};return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">MEMBER CARE</span><h1>Support tickets</h1><p className="muted">Respond to member questions and keep the support history in one place.</p></div><button className="secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div><div className="adminpanel tablepanel"><div className="admintable"><div className="adminrow adminrowhead"><span>Member</span><span>Subject</span><span>Status</span><span>Message</span><span>Date</span><span>Action</span></div>{loading?<div className="adminempty">Loading tickets…</div>:rows.map(t=><div className="adminrow" key={t.id}><div><b>{t.user?.name}</b><small>{t.user?.email}</small></div><span>{t.subject}</span><em className={`adminstatus ${t.status.toLowerCase()}`}>{t.status}</em><small>{t.message}</small><small>{new Date(t.createdAt).toLocaleString()}</small><button className="rowaction" onClick={()=>{setOpen(t);setResponse(t.response||"")}}>Open</button></div>)}{!loading&&!rows.length&&<div className="adminempty">No support tickets yet.</div>}</div></div>{open&&<div className="modalbackdrop" onClick={()=>setOpen(null)}><div className="modal adminbalance" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">SUPPORT TICKET</span><h2>{open.subject}</h2><p className="muted">{open.user?.name} · {open.user?.email}</p></div><button className="iconbtn" onClick={()=>setOpen(null)}><X size={20}/></button></div><div className="adminbalanceform"><div className="notice">{open.message}</div><label>Status<select value={open.status} onChange={e=>setOpen({...open,status:e.target.value})}><option>OPEN</option><option>IN_PROGRESS</option><option>CLOSED</option></select></label><label>Support reply<textarea rows="8" value={response} onChange={e=>setResponse(e.target.value)} placeholder="Write a clear response to the member…"/></label><div className="rowactions"><button className="secondary" onClick={()=>setOpen(null)}>Cancel</button><button className="primary" onClick={save}><Send size={15}/> Save response</button></div></div></div></div>}</section>}
function AdminAnnouncements({action}){const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[editing,setEditing]=useState(null),[form,setForm]=useState({title:"",body:"",category:"UPDATE",active:true});const load=async()=>{setLoading(true);try{setRows(await adminApi("/admin/announcements"))}catch(e){alert(e.message)}finally{setLoading(false)}};useEffect(()=>{load()},[]);const save=async()=>{if(!form.title.trim()||!form.body.trim())return alert("Title and body are required");const ok=await action(()=>adminApi(editing?`/admin/announcements/${editing}`:"/admin/announcements",{method:editing?"PATCH":"POST",body:JSON.stringify(form)}),editing?"Announcement updated":"Announcement published");if(ok){setEditing(null);setForm({title:"",body:"",category:"UPDATE",active:true});await load()}};return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">COMMUNICATION CENTER</span><h1>Announcements</h1><p className="muted">Publish platform updates, education reminders and member guidance.</p></div><button className="primary" onClick={()=>{setEditing("");setForm({title:"",body:"",category:"UPDATE",active:true})}}>New announcement</button></div>{editing!==null&&<div className="adminpanel adminedit"><label>Title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Category<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label><label>Message<textarea rows="7" value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></label><label className="checkline"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Visible to members</label><div className="rowactions"><button className="secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="primary" onClick={save}>Publish</button></div></div>}<div className="adminpanel tablepanel"><div className="admintable">{loading?<div className="adminempty">Loading announcements…</div>:rows.map(x=><div className="adminrow" key={x.id}><div><b>{x.title}</b><small>{x.category}</small></div><span>{x.body}</span><em className={`adminstatus ${x.active?"active":"suspended"}`}>{x.active?"LIVE":"HIDDEN"}</em><small>{new Date(x.createdAt).toLocaleString()}</small><div className="rowactions"><button className="rowaction" onClick={()=>{setEditing(x.id);setForm({title:x.title,body:x.body,category:x.category,active:x.active})}}><Settings2 size={13}/> Edit</button><button className="rowaction" onClick={()=>action(()=>adminApi(`/admin/announcements/${x.id}`,{method:"PATCH",body:JSON.stringify({active:!x.active})}),x.active?"Announcement hidden":"Announcement published")}>{x.active?"Hide":"Publish"}</button></div></div>)}{!rows.length&&!loading&&<div className="adminempty">No announcements yet.</div>}</div></div></section>}
function AdminPackages({rows,action}){const [editing,setEditing]=useState(null),[creating,setCreating]=useState(false),[form,setForm]=useState({});const open=p=>{setEditing(p.id);setForm({price:p.price,directCommission:p.directCommission,level2Commission:p.level2Commission,active:p.active,description:p.description||"",features:(p.features||[]).join("\n"),badge:p.badge||"",popular:!!p.popular,withdrawalLimit:p.withdrawalLimit||0})};return <section className="adminsection"><div className="adminsectionhead"><div><span className="pill">PLAN CONTROL</span><h1>Plans</h1><p className="muted">Control prices, referral rewards, benefits, badges, limits and which plan is highlighted.</p></div><button className="primary" onClick={()=>{setCreating(true);setEditing(null);setForm({name:"",price:0,directCommission:0,level2Commission:0,description:"",features:"",badge:"",popular:false,active:true,withdrawalLimit:0})}}>Add plan</button></div>{creating&&<div className="adminpanel"><div className="adminedit packagecreate"><label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Price<input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Direct commission<input type="number" value={form.directCommission} onChange={e=>setForm({...form,directCommission:e.target.value})}/></label><label>Level 2 commission<input type="number" value={form.level2Commission} onChange={e=>setForm({...form,level2Commission:e.target.value})}/></label><label>Description<input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Features <span className="muted small">one per line</span><textarea rows="5" value={form.features} onChange={e=>setForm({...form,features:e.target.value})}/></label><label>Badge<input value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})}/></label><label>Withdrawal limit<input type="number" value={form.withdrawalLimit} onChange={e=>setForm({...form,withdrawalLimit:e.target.value})}/></label><label className="checkline"><input type="checkbox" checked={form.popular} onChange={e=>setForm({...form,popular:e.target.checked})}/> Mark as popular</label><div className="rowactions"><button className="secondary" onClick={()=>setCreating(false)}>Cancel</button><button className="primary" onClick={()=>action(()=>adminApi("/admin/packages",{method:"POST",body:JSON.stringify({...form,name:form.name.trim(),price:Number(form.price),directCommission:Number(form.directCommission),level2Commission:Number(form.level2Commission),withdrawalLimit:Number(form.withdrawalLimit),features:form.features.split("\n").map(x=>x.trim()).filter(Boolean)})}),"Plan created")}>Create plan</button></div></div></div>}<div className="adminpackagegrid">{rows.map(p=><div className="adminpkg" key={p.id}><div className="adminpkghead"><div><span className="pkgname">{p.name}</span><small>{p._count?.users||0} members</small></div><em className={`adminstatus ${p.active?"active":"suspended"}`}>{p.active?"ACTIVE":"OFF"}</em></div>{editing===p.id?<div className="adminedit"><label>Price<input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Direct commission<input type="number" value={form.directCommission} onChange={e=>setForm({...form,directCommission:e.target.value})}/></label><label>Level 2 commission<input type="number" value={form.level2Commission} onChange={e=>setForm({...form,level2Commission:e.target.value})}/></label><label>Description<input value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label>Features <span className="muted small">one per line</span><textarea rows="6" value={form.features} onChange={e=>setForm({...form,features:e.target.value})}/></label><label>Badge<input value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})}/></label><label>Withdrawal limit (0 = no plan limit)<input type="number" value={form.withdrawalLimit} onChange={e=>setForm({...form,withdrawalLimit:e.target.value})}/></label><label className="checkline"><input type="checkbox" checked={form.popular} onChange={e=>setForm({...form,popular:e.target.checked})}/> Mark as popular</label><label className="checkline"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Active</label><div className="rowactions"><button className="secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="primary" onClick={()=>action(()=>adminApi(`/admin/packages/${p.id}`,{method:"PATCH",body:JSON.stringify({...form,price:Number(form.price),directCommission:Number(form.directCommission),level2Commission:Number(form.level2Commission),withdrawalLimit:Number(form.withdrawalLimit),features:form.features.split("\n").map(x=>x.trim()).filter(Boolean)})}),"Plan updated")}>Save</button></div></div>:<><h2>{money(p.price)}</h2>{p.description&&<p className="pkgdesc">{p.description}</p>}<div className="commission"><div><b>{money(p.directCommission)}</b><small>Direct</small></div><div><b>{money(p.level2Commission)}</b><small>Level 2</small></div></div>{p.features?.length>0&&<ul className="pkgfeatures">{p.features.slice(0,4).map((x,j)=><li key={j}><Check size={14}/>{x}</li>)}</ul>}<button className="secondary" onClick={()=>open(p)}>Edit plan benefits</button></>}</div>)}</div></section>}


function ReferralTree({data,me}){const direct=data?.direct||[];const level2=data?.level2||[];return <div className="panel trepanel"><div className="paneltitle"><h3><Users2 size={18}/> Network map</h3><span>{direct.length} direct · {level2.length} level 2</span></div><div className="tree"><div className="treeperson root"><div className="avatar">{me.user.name?.[0]?.toUpperCase()||"N"}</div><b>{me.user.name?.split(" ")[0]}</b><small>Your account</small></div><div className="treebranch">{direct.slice(0,8).map((x,i)=><div className="treecolumn" key={x.id}><div className="treeperson"><div className="avatar">{x.name?.[0]?.toUpperCase()||"M"}</div><b>{x.name?.split(" ")[0]}</b><small>{x.package?.name||"No plan"}</small></div><div className="treechildren">{level2.filter(y=>y.referredById===x.id).slice(0,4).map(y=><div className="treeperson mini" key={y.id}><div className="avatar">{y.name?.[0]?.toUpperCase()||"M"}</div><b>{y.name?.split(" ")[0]}</b></div>)}</div></div>)}</div>{!direct.length&&<p className="muted">Your network map will appear here as your direct referrals join.</p>}</div></div>}
function ProfileCard({me,strength,goSecurity}){return <div className="panel profilecard"><div className="profileavatar">{me.user.name?.[0]?.toUpperCase()||"N"}</div><div className="profileinfo"><span className="pill">MEMBER PROFILE</span><h2>{me.user.name}</h2><p>{me.user.email}</p><div className="profilemeta"><span>{me.package?.name||"No plan"}</span><span>Code: {me.user.referralCode}</span><span>Member since {new Date(me.user.createdAt).toLocaleDateString()}</span></div><div className="profilemeter"><b>Profile completeness · {strength}%</b><div className="progress"><i style={{width:`${strength}%`}}/></div></div><button className="secondary" onClick={goSecurity}><UserCog size={15}/> Edit profile</button></div></div>}
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
            <li>NEXORA does not guarantee income. Advertising results vary by campaign, platform and audience.</li>
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
 <div className="adtruststrip"><ShieldCheck size={16}/><span>Verified post + Friday review · Performance-based — results vary by campaign.</span></div>
 {products[0]&&<div className="panel campaignweek"><div className="campaignweekhead"><span className="pill">CAMPAIGN OF THE WEEK</span><h3>{products[0].title}</h3><p className="muted">{products[0].description||"Featured advertising product."}</p></div><div className="campaignweekmeta"><span>{money(products[0].viewRatePer1000)} / 1,000 views</span><span>{money(products[0].engagementRate)} / engagement</span></div><button type="button" className="primary" onClick={()=>openSubmit(products[0])}><Link2 size={16}/> Promote this campaign</button></div>}
 <div className="adpolicygrid"><div className="panel"><Store size={22}/><h3>How it works</h3><p className="muted">1. Select a campaign. 2. Publish the campaign creative on an approved platform. 3. Submit the public post link and the exact image/video you posted. 4. Enter the platform's current views and engagements. 5. NEXORA reviews the evidence and schedules approved earnings for Friday processing.</p></div><div className="panel"><CalendarCheck2 size={22}/><h3>Friday payout cycle</h3><p className="muted">Rates are configured per campaign. Final payout uses verified performance, not unverified screenshots or self-reported figures alone.</p></div></div>
 <div className="panel marketingpostkit"><div><Megaphone size={22}/><h3>Ready-to-use NEXORA marketing post</h3><p className="muted">Use this as a starting point. Add your own voice and never promise guaranteed earnings.</p></div><div className="postpreview"><strong>🚀 Discover NEXORA</strong><p>Learn. Connect. Grow. Build.</p><p>NEXORA brings referrals, learning tools, analytics and — for Premium members — approved advertising opportunities together in one workspace.</p><p>Premium members can promote selected products on approved social platforms and submit verified performance for Friday payout review.</p><b>Learn more: {location.origin}</b></div><button className="secondary" onClick={copyPost}><ClipboardCopy size={15}/> Copy marketing post</button></div>
 {msg&&<div className="notice">{msg}</div>}{err&&<div className="error">{err}</div>}
 {loading?<div className="panel"><p className="muted">Loading available products…</p></div>:products.length?<div className="productgrid">{products.map(p=><div className="productcard" key={p.id}><div className="producttop"><span className="pill">AVAILABLE</span><small>{(p.platforms||[]).join(" · ")}</small></div><h3>{p.title}</h3><p className="muted">{p.description}</p><div className="productmeta"><span>Views rate: {money(p.viewRatePer1000)} / 1,000</span><span>Engagement rate: {money(p.engagementRate)} / engagement</span></div><button className="primary" onClick={()=>openSubmit(p)}><Link2 size={16}/> Submit promotion</button></div>)}</div>:<div className="panel empty"><Store size={30}/><h3>No advertising products are available yet</h3><p className="muted">Check back when NEXORA publishes a campaign.</p></div>}
 <div className="panel"><h3>Your advertising submissions</h3>{submissions.length?submissions.map(x=><div className="adsubmissionrow" key={x.id}><div><b>{x.product?.title}</b><small>{new Date(x.submittedAt).toLocaleString()} · {x.views.toLocaleString()} views · {x.engagements.toLocaleString()} engagements</small></div><em className={`adminstatus ${String(x.status).toLowerCase()}`}>{x.status}</em><strong>{money(x.approvedPay??x.calculatedPay)}</strong></div>):<p className="muted">No advertising submissions yet.</p>}</div>
 {selected&&<div className="modalbackdrop" onClick={()=>setSelected(null)}><div className="modal adsubmitmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">CAMPAIGN SUBMISSION</span><h2>{selected.title}</h2></div><button className="iconbtn" onClick={()=>setSelected(null)}><X size={20}/></button></div><form onSubmit={submit}><div className="adsubmitbody"><p className="muted">Paste the public post URL and upload the exact creative you published. This helps NEXORA verify that the campaign was actually posted.</p><label className="fieldlabel">Public post / status link<input required type="url" value={form.postUrl} onChange={e=>setForm({...form,postUrl:e.target.value})} placeholder="https://…"/></label><label className="fieldlabel">Upload the post you published<input required type="file" accept="image/*,video/*" onChange={readMedia}/></label>{form.postMediaData&&<div className="mediapreview">{form.postMediaType.startsWith("video/")?<video controls src={form.postMediaData}/>:<img src={form.postMediaData} alt="Submitted campaign post"/>}<small>{form.postMediaName}</small></div>}<label className="fieldlabel">Proof / analytics screenshot link (optional)<input type="url" value={form.proofUrl} onChange={e=>setForm({...form,proofUrl:e.target.value})} placeholder="https://…"/></label><div className="admetricgrid"><label className="fieldlabel">Current views<input required min="0" type="number" value={form.views} onChange={e=>setForm({...form,views:e.target.value})}/></label><label className="fieldlabel">Current engagements<input required min="0" type="number" value={form.engagements} onChange={e=>setForm({...form,engagements:e.target.value})}/></label></div><div className="notice"><Eye size={16}/> Enter the figures visible on the platform. NEXORA can request additional verification before approval.</div></div><div className="modalfoot"><button type="button" className="secondary" onClick={()=>setSelected(null)} disabled={busy}>Cancel</button><button className="primary" disabled={busy}>{busy?"Submitting…":"Submit for review"}</button></div></form></div></div>}</section>
}

function Marketplace({me}){
 const [tab,setTab]=useState("shop"),[products,setProducts]=useState([]),[mine,setMine]=useState([]),[orders,setOrders]=useState({buying:[],selling:[]}),[wishlist,setWishlist]=useState([]),[cart,setCart]=useState(()=>{try{return JSON.parse(localStorage.getItem("nexora-cart")||"[]")}catch{return[]}}),[recentViews,setRecentViews]=useState(()=>{try{return JSON.parse(localStorage.getItem("nexora-recent-products")||"[]")}catch{return[]}}),[q,setQ]=useState(""),[category,setCategory]=useState("All"),[location,setLocation]=useState(""),[sort,setSort]=useState("newest"),[minPrice,setMinPrice]=useState(""),[maxPrice,setMaxPrice]=useState(""),[selected,setSelected]=useState(null),[notice,setNotice]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[form,setForm]=useState({title:"",description:"",price:"",stock:"1",category:"Other",location:"",phone:me.user.phone||"",images:[]}),[checkout,setCheckout]=useState({deliveryName:me.user.name||"",deliveryPhone:me.user.phone||"",deliveryAddress:"",deliveryNotes:"",paymentMethod:"CASH_ON_DELIVERY"});
 const categories=["All","Fashion","Electronics","Phones & Accessories","Home","Beauty","Food","Services","Vehicles","Property","Jobs","Other"];
 const saveCart=c=>{setCart(c);localStorage.setItem("nexora-cart",JSON.stringify(c))};
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
 const total=cart.reduce((a,x)=>a+x.price*x.quantity,0);
 const displayedProducts=[...products].filter(p=>(!minPrice||Number(p.price)>=Number(minPrice))&&(!maxPrice||Number(p.price)<=Number(maxPrice))).sort((a,b)=>sort==="priceLow"?Number(a.price)-Number(b.price):sort==="priceHigh"?Number(b.price)-Number(a.price):sort==="popular"?Number(b._count?.orderItems||0)-Number(a._count?.orderItems||0):new Date(b.createdAt)-new Date(a.createdAt));
 const submitProduct=async e=>{e.preventDefault();setBusy(true);setError("");try{const r=await api("/marketplace/products",{method:"POST",body:JSON.stringify(form)});setNotice("Product published successfully.");setMine([r,...mine]);setForm({title:"",description:"",price:"",stock:"1",category:"Other",location:"",phone:me.user.phone||"",images:[]});}catch(e){setError(e.message)}finally{setBusy(false)}};
 const readImages=e=>{const files=[...e.target.files].slice(0,6);Promise.all(files.map(f=>new Promise((resolve,reject)=>{if(f.size>1800000)return reject(new Error("Each product image must be under 1.8 MB."));const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(f)}))).then(images=>setForm({...form,images})).catch(e=>setError(e.message))};
 const checkoutNow=async e=>{e.preventDefault();if(!cart.length)return setError("Your cart is empty.");setBusy(true);setError("");try{const r=await api("/marketplace/orders",{method:"POST",body:JSON.stringify({...checkout,items:cart.map(x=>({productId:x.productId,quantity:x.quantity}))})});setNotice(r.message);saveCart([]);setTab("orders");await loadOrders();}catch(e){setError(e.message)}finally{setBusy(false)}};
 const updateOrder=async(id,status)=>{try{await api(`/marketplace/orders/${id}/status`,{method:"PATCH",body:JSON.stringify({status})});await loadOrders();setNotice("Order status updated.")}catch(e){setError(e.message)}};
 const disputeOrder=async(id)=>{const reason=window.prompt("What is the issue with this order?","Order issue");if(!reason)return;try{await api(`/marketplace/orders/${id}/disputes`,{method:"POST",body:JSON.stringify({reason,details:"Submitted from NEXORA Marketplace"})});setNotice("Order issue submitted to NEXORA support.")}catch(e){setError(e.message)}};
 const sameSeller=cart.length<2||cart.every(x=>x.sellerId===cart[0].sellerId);
 return <section><div className="sectionhead"><div><span className="pill">NEXORA MARKETPLACE</span><h1>Shop, sell & grow</h1><p className="muted">A member marketplace for buying and selling products and services with clear pricing, seller details and delivery information.</p></div><div className="sectionactions"><button className="primary" onClick={()=>setTab("cart")}><ShoppingCart size={16}/> Cart ({cart.reduce((a,x)=>a+x.quantity,0)})</button></div></div>
 <div className="market-tabs"><button className={tab==="shop"?"active":""} onClick={()=>setTab("shop")}><Store size={16}/> Shop</button><button className={tab==="wishlist"?"active":""} onClick={()=>setTab("wishlist")}><Heart size={16}/> Wishlist ({wishlist.length})</button><button className={tab==="cart"?"active":""} onClick={()=>setTab("cart")}><ShoppingCart size={16}/> Cart</button><button className={tab==="sell"?"active":""} onClick={()=>setTab("sell")}><Plus size={16}/> Sell a product</button><button className={tab==="myshop"?"active":""} onClick={()=>{setTab("myshop");loadMine()}}><PackageIcon size={16}/> My listings</button><button className={tab==="orders"?"active":""} onClick={()=>{setTab("orders");loadOrders()}}><Truck size={16}/> Orders</button><button className={tab==="seller"?"active":""} onClick={()=>{setTab("seller");loadMine();loadOrders()}}><BarChart2 size={16}/> Seller dashboard</button></div>
 {notice&&<div className="notice">{notice}</div>}{error&&<div className="error">{error}</div>}
 {tab==="shop"&&<>{recentViews.length>0&&<div className="recentstrip panel"><div className="paneltitle"><h3>Recently viewed</h3><button type="button" className="secondary narrow" onClick={()=>{setRecentViews([]);localStorage.removeItem("nexora-recent-products")}}>Clear</button></div><div className="recentrow">{recentViews.map(p=><button type="button" className="recentchip" key={p.id} onClick={()=>setSelected(p)}><b>{p.title}</b><span>{money(p.price)}</span></button>)}</div></div>}<div className="marketfilters"><div className="searchbox"><Search size={17}/><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadProducts()} placeholder="Search products, services or locations…"/></div><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select><div className="searchbox"><MapPin size={17}/><input value={location} onChange={e=>setLocation(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loadProducts()} placeholder="Location e.g. Nairobi"/></div><input className="pricefilter" type="number" min="0" value={minPrice} onChange={e=>setMinPrice(e.target.value)} placeholder="Min KSh"/><input className="pricefilter" type="number" min="0" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} placeholder="Max KSh"/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest</option><option value="priceLow">Price: low to high</option><option value="priceHigh">Price: high to low</option><option value="popular">Most ordered</option></select><button className="secondary" onClick={loadProducts}><Filter size={15}/> Search</button></div>{busy?<div className="panel"><p className="muted">Loading marketplace…</p></div>:<div className="marketgrid">{displayedProducts.map(p=><article className="marketcard" key={p.id}><div className="marketimage">{p.images?.[0]?<img src={p.images[0]} alt={p.title}/>:<Store size={38}/>}<span>{p.category}</span></div><div className="marketcardbody"><h3>{p.title}</h3><p className="muted marketdesc">{p.description}</p><strong className="marketprice">{money(p.price)}</strong><div className="marketseller"><span><MapPin size={14}/> {p.location}</span><span>Seller: {p.seller?.name||"Member"}</span>{p.seller?.sellerVerified&&<span className="verifiedseller"><ShieldCheck size={12}/> Verified</span>}</div><div className="marketstock">{p.stock} available</div><div className="marketactions"><button className="iconbtn" title="Wishlist" onClick={()=>toggleWishlist(p)}><Heart size={16} fill={isSaved(p)?"currentColor":"none"}/></button><button className="secondary" onClick={()=>{setSelected(p);const next=[p,...recentViews.filter(x=>x.id!==p.id)].slice(0,8);setRecentViews(next);try{localStorage.setItem("nexora-recent-products",JSON.stringify(next.map(x=>({id:x.id,title:x.title,price:x.price,images:x.images,location:x.location,category:x.category,seller:x.seller}))))}catch{}}}>View details</button><button className="primary" onClick={()=>addToCart(p)}><ShoppingCart size={15}/> Add</button></div></div></article>)}{!displayedProducts.length&&<div className="panel empty"><Store size={30}/><h3>No products found</h3><p className="muted">Try another search or category.</p></div>}</div>}</>}
 {tab==="wishlist"&&<div className="marketgrid">{wishlist.map(w=>{const p=w.product;return <article className="marketcard" key={p.id}><div className="marketimage">{p.images?.[0]?<img src={p.images[0]} alt={p.title}/>:<Store size={38}/>}<span>{p.category}</span></div><div className="marketcardbody"><h3>{p.title}</h3><p className="muted marketdesc">{p.description}</p><strong className="marketprice">{money(p.price)}</strong><div className="marketactions"><button className="secondary" onClick={()=>setSelected(p)}>View</button><button className="primary" onClick={()=>addToCart(p)}><ShoppingCart size={15}/> Add</button></div></div></article>})}{!wishlist.length&&<div className="panel empty"><Heart size={30}/><h3>Your wishlist is empty</h3><p className="muted">Save products you want to compare or buy later.</p></div>}</div>}{tab==="cart"&&<div className="marketlayout"><div className="panel cartpanel"><div className="paneltitle"><h3>Your cart</h3>{cart.length>0&&<button className="secondary" onClick={()=>saveCart([])}><Trash2 size={15}/> Clear</button>}</div>{cart.map(x=><div className="cartrow" key={x.productId}><div className="cartthumb">{x.images?.[0]?<img src={x.images[0]} alt=""/>:<Store size={20}/>}</div><div className="cartinfo"><b>{x.title}</b><small>{money(x.price)} · {x.sellerName||"Member seller"}</small></div><input type="number" min="1" max={x.stock} value={x.quantity} onChange={e=>changeQty(x.productId,e.target.value)}/><strong>{money(x.price*x.quantity)}</strong><button className="iconbtn" onClick={()=>remove(x)}><Trash2 size={16}/></button></div>)}{!cart.length&&<p className="muted">Your cart is empty. Browse the marketplace and add something you like.</p>}</div>{cart.length>0&&<form className="panel checkoutpanel" onSubmit={checkoutNow}><h3>Checkout</h3>{!sameSeller&&<div className="error">Checkout is currently one seller at a time. Remove items from other sellers.</div>}<div className="checkouttotal"><span>Total</span><strong>{money(total)}</strong></div><div className="couponrow"><input placeholder="Coupon code (optional)" id="market-coupon"/><button type="button" className="secondary" onClick={async()=>{const code=document.getElementById("market-coupon")?.value?.trim();if(!code)return;try{const r=await api("/marketplace/coupons/validate",{method:"POST",body:JSON.stringify({code,subtotal:total})});setNotice(`Coupon applied: ${money(r.discount)} discount.`)}catch(e){setError(e.message)}}}>Apply</button></div><input required placeholder="Delivery / pickup name" value={checkout.deliveryName} onChange={e=>setCheckout({...checkout,deliveryName:e.target.value})}/><input required inputMode="tel" placeholder="Phone" value={checkout.deliveryPhone} onChange={e=>setCheckout({...checkout,deliveryPhone:e.target.value})}/><textarea required placeholder="Delivery address / location" value={checkout.deliveryAddress} onChange={e=>setCheckout({...checkout,deliveryAddress:e.target.value})}/><textarea placeholder="Delivery notes (optional)" value={checkout.deliveryNotes} onChange={e=>setCheckout({...checkout,deliveryNotes:e.target.value})}/><label className="fieldlabel">Payment method<select value={checkout.paymentMethod} onChange={e=>setCheckout({...checkout,paymentMethod:e.target.value})}><option value="CASH_ON_DELIVERY">Cash / M-Pesa on delivery</option><option value="WALLET">NEXORA Wallet</option></select></label><button className="primary" disabled={busy||!sameSeller}>{busy?"Placing order…":"Place order"}</button><p className="muted small">Seller contact and delivery details are shared only for fulfilling the order. For wallet orders, the amount is deducted immediately.</p></form>}</div>}
 {tab==="sell"&&<form className="panel sellerform" onSubmit={submitProduct}><div className="paneltitle"><div><h3>List a product or service</h3><p className="muted">Add accurate information so buyers know exactly what they are purchasing.</p></div><Store size={24}/></div><div className="formgrid two"><label className="fieldlabel">Product title<input required maxLength="120" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Samsung Galaxy S24"/></label><label className="fieldlabel">Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.filter(x=>x!=="All").map(c=><option key={c}>{c}</option>)}</select></label></div><label className="fieldlabel">Description<textarea required maxLength="5000" rows="6" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe condition, features, size, color, what is included, warranty/returns, etc."/></label><div className="formgrid three"><label className="fieldlabel">Price (KSh)<input required type="number" min="1" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label className="fieldlabel">Stock / quantity<input required type="number" min="0" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/></label><label className="fieldlabel">Seller phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label></div><label className="fieldlabel">Location / pickup area<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="e.g. Westlands, Nairobi"/></label>
<div className="deliveryhints"><span className="muted small">Delivery tips for Kenya buyers:</span><div className="deliverychiprow">
<button type="button" className="secondary narrow" onClick={()=>setForm(f=>({...f,location:(f.location?f.location+", ":"")+"Nairobi meetup"}))}>Nairobi meetup</button>
<button type="button" className="secondary narrow" onClick={()=>setForm(f=>({...f,location:(f.location?f.location+", ":"")+"County courier"}))}>County courier</button>
<button type="button" className="secondary narrow" onClick={()=>setForm(f=>({...f,location:(f.location?f.location+", ":"")+"G4S / Well-pack"}))}>G4S / Well-pack</button>
<button type="button" className="secondary narrow" onClick={()=>setForm(f=>({...f,description:(f.description?f.description+"\n":"")+"Delivery: buyer pays courier / meetup preferred."}))}>Add delivery note</button>
</div></div><label className="fieldlabel">Product photos <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={readImages}/><small className="muted">Up to 6 images. Use clear photos; each image must be under 1.8 MB.</small></label>{form.images.length>0&&<div className="imagepickgrid">{form.images.map((x,i)=><img key={i} src={x} alt="Product preview"/>)}</div>}<div className="notice"><ShieldCheck size={16}/> Only list products you are authorized to sell. Do not upload counterfeit, illegal or misleading listings. Buyers should verify products and delivery details before payment.</div><button className="primary" disabled={busy}>{busy?"Publishing…":"Publish listing"}</button></form>}
 {tab==="seller"&&<SellerDashboard me={me} mine={mine} orders={orders} goSell={()=>setTab("sell")}/>}{tab==="myshop"&&<div className="marketgrid">{mine.map(p=><article className="marketcard" key={p.id}><div className="marketimage">{p.images?.[0]?<img src={p.images[0]} alt={p.title}/>:<Store size={38}/>}<span>{p.status}</span></div><div className="marketcardbody"><h3>{p.title}</h3><p className="muted marketdesc">{p.description}</p><strong className="marketprice">{money(p.price)}</strong><div className="marketseller"><span>{p.stock} in stock</span><span><MapPin size={14}/> {p.location}</span></div><div className="marketactions"><button className="secondary" onClick={async()=>{const next=p.status==="ACTIVE"?"HIDDEN":"ACTIVE";try{const u=await api(`/marketplace/products/${p.id}`,{method:"PATCH",body:JSON.stringify({status:next})});setMine(mine.map(x=>x.id===u.id?u:x));}catch(e){setError(e.message)}}}><Edit3 size={15}/> {p.status==="ACTIVE"?"Hide":"Publish"}</button></div></div></article>)}{!mine.length&&<div className="panel empty"><PackageIcon size={30}/><h3>No listings yet</h3><p className="muted">Use Sell a product to publish your first listing.</p></div>}</div>}
 {tab==="orders"&&<div className="ordersgrid" data-market-orders><div className="panel"><h3>My purchases</h3>{orders.buying.map(o=><div className="ordercard" key={o.id}><div><b>{o.items.map(i=>i.title).join(", ")}</b><small>{o.reference} · {new Date(o.createdAt).toLocaleString()}</small></div><strong>{money(o.total)}</strong><span className={`orderstatus ${o.status.toLowerCase()}`}>{o.status}</span><small>Seller: {o.seller?.name} · {o.seller?.phone}</small>{o.status!=="DELIVERED"&&o.status!=="CANCELLED"&&<button className="secondary" onClick={()=>updateOrder(o.id,"DELIVERED")}><PackageCheck size={15}/> Confirm received</button>}<button className="secondary" onClick={()=>disputeOrder(o.id)}>Report an issue</button></div>)}{!orders.buying.length&&<p className="muted">No purchases yet.</p>}</div><div className="panel"><h3>Orders for my listings</h3>{orders.selling.map(o=><div className="ordercard" key={o.id}><div><b>{o.items.map(i=>i.title).join(", ")}</b><small>{o.reference} · Buyer: {o.buyer?.name} · {o.buyer?.phone}</small></div><strong>{money(o.total)}</strong><span className={`orderstatus ${o.status.toLowerCase()}`}>{o.status}</span><select value={o.status} onChange={e=>updateOrder(o.id,e.target.value)}><option>PENDING</option><option>CONFIRMED</option><option>PROCESSING</option><option>SHIPPED</option><option>DELIVERED</option><option>CANCELLED</option></select><button className="secondary" onClick={()=>disputeOrder(o.id)}>Report an issue</button></div>)}{!orders.selling.length&&<p className="muted">No customer orders yet.</p>}</div></div>}
 {selected&&<div className="modalbackdrop" onClick={()=>setSelected(null)}><div className="modal productdetailmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">MARKETPLACE</span><h2>{selected.title}</h2></div><button className="iconbtn" onClick={()=>setSelected(null)}><X size={20}/></button></div><div className="productdetailbody"><div className="detailhero">{selected.images?.length?<div className="detailimages">{selected.images.map((x,i)=><img key={i} src={x} alt={`${selected.title} ${i+1}`}/>)}</div>:<div className="detailplaceholder"><Store size={48}/></div>}</div><div><strong className="marketprice">{money(selected.price)}</strong><p>{selected.description}</p><p><MapPin size={15}/> {selected.location}</p><p>Seller: <b>{selected.seller?.name}</b> {selected.seller?.sellerVerified&&<span className="pill">Verified seller</span>} · {selected.seller?.phone}</p><p className="muted">{selected.seller?.sellerBio||"Member seller on NEXORA Marketplace."}</p>{selected.reviews?.length>0&&<div className="reviewlist"><b>Recent reviews</b>{selected.reviews.map(r=><div key={r.id}><span>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span> · {r.author?.name}<p className="muted small">{r.body||"Verified purchase"}</p></div>)}</div>}<p>{selected.stock} available</p><button className="primary" onClick={()=>{addToCart(selected);setSelected(null)}}><ShoppingCart size={16}/> Add to cart</button></div></div></div></div>}</section>
}

function Community({announcements=[]}){const fallback=[["Welcome to NEXORA","Explore your member workspace, Academy, analytics, referral tools and support center.","WELCOME"],["Learn before you share","Use NEXORA Academy to understand the platform and communicate membership details clearly.","EDUCATION"],["Protect your account","Never share your password or M-Pesa PIN. NEXORA support will not ask for those credentials.","SECURITY"]];const posts=announcements.length?announcements.map(x=>[x.title,x.body,x.category]):fallback;return <section><div className="sectionhead"><div><span className="pill">NEXORA COMMUNITY</span><h1>Community & updates</h1><p className="muted">A calm place for platform announcements, learning reminders and member guidance.</p></div></div><div className="communitygrid">{posts.map(([t,d,c])=><article className="communitypost" key={t}><div className="featureicon"><Megaphone size={20}/></div><small>{c||"PLATFORM UPDATE"}</small><h3>{t}</h3><p>{d}</p><span>Platform guidance →</span></article>)}</div><div className="panel"><h3>Community principles</h3><div className="principles"><span><Check size={15}/> Be transparent</span><span><Check size={15}/> Respect other members</span><span><Check size={15}/> Avoid misleading income claims</span><span><Check size={15}/> Protect private information</span></div></div></section>}
function NotificationsCenter({me,analytics,tickets}){const notes=[];if(me.package)notes.push({I:CheckCircle2,t:"Membership active",d:`Your ${me.package.name} plan is active.`});else notes.push({I:PackageIcon,t:"Explore membership",d:"Review the membership plans and benefits when you're ready."});if((analytics?.month?.directReferrals||0)<5)notes.push({I:Target,t:"Monthly activity goal",d:`${5-(analytics?.month?.directReferrals||0)} direct referral(s) remaining for the current activity goal.`});if(tickets?.some(x=>x.status!=="CLOSED"))notes.push({I:LifeBuoy,t:"Support ticket open",d:"You have an active support request. Check Help & Support for replies."});if((me.transactions||[]).some(x=>x.status==="PENDING"))notes.push({I:Clock3,t:"Payment awaiting confirmation",d:"A plan payment is still pending. Open Transactions to check it."});return <section><div className="sectionhead"><div><span className="pill">NOTIFICATION CENTER</span><h1>Stay up to date</h1><p className="muted">Useful account reminders and platform activity in one place.</p></div></div><div className="notificationcenter">{notes.map((n,i)=><div className="notification large" key={i}><n.I size={20}/><div><b>{n.t}</b><p>{n.d}</p><small>Account update</small></div></div>)}</div><div className="panel"><h3>Notification guidance</h3><p className="muted">NEXORA notifications describe recorded account activity and useful reminders. They do not represent guaranteed earnings or future financial outcomes.</p></div></section>}
function App(){
 const path=window.location.pathname || "/";
 const [me,setMe]=useState(null),[payMethods,setPayMethods]=useState({wallet:true,paybill:false}),[page,setPage]=useState("dashboard"),[packages,setPackages]=useState([]),[referrals,setReferrals]=useState({direct:[],level2:[]}),[earnings,setEarnings]=useState([]),[transactions,setTransactions]=useState([]),[analytics,setAnalytics]=useState(null),[leaderboard,setLeaderboard]=useState([]),[announcements,setAnnouncements]=useState([]),[tickets,setTickets]=useState([]),[msg,setMsg]=useState(""),[error,setError]=useState(""),[mobile,setMobile]=useState(false),[loading,setLoading]=useState(true),[instructions,setInstructions]=useState(false),[phoneModal,setPhoneModal]=useState(null),[payment,setPayment]=useState(null),[copiedKind,setCopiedKind]=useState("");
 if(path === "/admin" || path.startsWith("/admin/")) return <AdminApp/>;
 if(path === "/terms" || path === "/privacy" || path === "/membership") return <LegalPage type={path.slice(1)}/>;
 if(path === "/packages" || path === "/packages/") return <PublicPackagesPage/>;
 const load=async(show=true)=>{if(show)setLoading(true);setError("");try{const m=await api("/me");setMe(m);try{setPayMethods(await api("/payments/methods"))}catch{};const results=await Promise.allSettled([api("/packages"),api("/referrals"),api("/earnings"),api("/transactions"),api("/member/analytics"),api("/member/leaderboard"),api("/announcements"),api("/support/tickets")]);if(results[0].status==="fulfilled")setPackages(results[0].value);if(results[1].status==="fulfilled")setReferrals(results[1].value);if(results[2].status==="fulfilled")setEarnings(results[2].value);if(results[3].status==="fulfilled")setTransactions(results[3].value);if(results[4].status==="fulfilled")setAnalytics(results[4].value);if(results[5].status==="fulfilled")setLeaderboard(results[5].value);if(results[6].status==="fulfilled")setAnnouncements(results[6].value);if(results[7].status==="fulfilled")setTickets(results[7].value);const failed=results.find(x=>x.status==="rejected");if(failed)setError(failed.reason?.message||"Some account data could not be loaded")}catch(e){if(/session|authentication|expired/i.test(e.message)){localStorage.removeItem("token");setMe(null)}else setError(e.message)}finally{setLoading(false)}};
 useEffect(()=>{if(localStorage.getItem("token"))load();else setLoading(false)},[]);
 if(loading&&!me)return <NexoraSplash label="Opening your workspace…"/>;if(!me)return <PublicLanding onLogin={()=>load()}/>;
 const nav=[
  ["dashboard","Home",BarChart3],["marketplace","🛒 Marketplace",Store],["referrals","💰 Earn",WalletCards],["products","📣 Advertise",Megaphone],["wallet","Wallet",WalletCards],["transactions","Transactions",History],["marketing","Marketing Center",Megaphone],["academy","🎓 Academy",GraduationCap],["analytics","Analytics",BarChart2],["community","Community",Users2],["notifications","Notifications",Bell],["leaderboard","Leaderboard",Trophy],["challenges","Challenges",Target],["support","Help & Support",LifeBuoy],["security","Profile & Security",Shield]
 ];
 const primaryNavIds=new Set(["dashboard","marketplace","referrals","products","wallet"]);
 const startPayment=async(phone,p)=>{setPhoneModal(null);setMsg("");setError("");try{const normalized=cleanPhone(phone);if(!validPhone(normalized))return setError("Invalid Kenyan phone number. Use 07…, 011…, 2547… or 2541…. ");const d=await api("/payments/initialize",{method:"POST",body:JSON.stringify({packageId:p.id,phone:normalized})});const charge=Number(d.chargeAmount||p.price);setPayment({reference:d.reference,package:p,phone:normalized,status:d.status||"pending",chargeAmount:charge,display_text:d.display_text||"",message:d.message&&d.message!=="Charge attempted"?d.message:""});if(d.status==="success"){await load(false);setMsg("Payment confirmed. Your plan is now active.");try{localStorage.setItem("nexora-milestone-paid","1")}catch{};return}if(d.status==="failed")return;let tries=0;const poll=async()=>{if(tries>=12)return;tries++;try{const v=await api(`/payments/status/${d.reference}`);setPayment(x=>x?{...x,status:v.status||"pending",display_text:v.display_text||x.display_text,message:v.message&&v.message!=="Charge attempted"?v.message:x.message}:x);if(v.status==="success"){await load(false);setMsg("Payment confirmed. Your plan is now active.");try{localStorage.setItem("nexora-milestone-paid","1")}catch{};return}if(v.status==="failed")return}catch{}if(tries<12)setTimeout(poll,10000)};setTimeout(poll,10000)}catch(e){setError(e.message)}};
 const hasPackage=Boolean(me?.package);
 const purchase=p=>{setMsg("");setError("");if(p?.id)setPhoneModal({package:p,chargeAmount:Math.max(0,Number(p.price)-Number(me.package?.price||0)),phone:cleanPhone(me.user.phone||"")})};
 const paybillInitiate=async(p)=>{
  const d=await api("/payments/paybill/initiate",{method:"POST",body:JSON.stringify({packageId:p.id})});
  return d;
 };
 const paybillSubmitCode=async(reference,mpesaCode)=>{
  const d=await api("/payments/paybill/submit-code",{method:"POST",body:JSON.stringify({reference,mpesaCode})});
  await load(false);
  setMsg(d.message||"Payment submitted for verification.");
  return d;
 };
 const walletPurchase=async(p)=>{
  setMsg("");setError("");
  const d=await api("/payments/wallet-purchase",{method:"POST",body:JSON.stringify({packageId:p.id})});
  setPhoneModal(null);
  await load(false);
  setMsg(d.message||"Plan activated using your wallet balance.");
 };
 const flashCopied=(kind,msg)=>{
  setError("");
  setCopiedKind(kind);
  setMsg(msg);
  clearTimeout(window.__nexoraCopyTimer);
  window.__nexoraCopyTimer=setTimeout(()=>setCopiedKind(""),2500);
 };
 const copy=async()=>{
  if(!hasPackage){setError("Purchase a plan first to unlock your referral link.");return;}
  const link=`${location.origin}/?ref=${me.user.referralCode}`;
  try{await navigator.clipboard.writeText(link)}catch{window.prompt("Copy your referral link:",link)}
  flashCopied("link","Referral link copied. Share it so people can join under you.");
 };
 const copyCode=async()=>{
  if(!hasPackage){setError("Purchase a plan first to unlock your referral code.");return;}
  const code=me.user.referralCode;
  try{await navigator.clipboard.writeText(code)}catch{window.prompt("Copy your referral code:",code)}
  flashCopied("code","Referral code copied. Friends can paste it when they register.");
 };
 const share=async()=>{
  if(!hasPackage){setError("Purchase a plan first to unlock your referral link.");return;}
  const link=`${location.origin}/?ref=${me.user.referralCode}`;
  if(navigator.share){try{await navigator.share({title:"Join NEXORA",text:"Join me on NEXORA.",url:link})}catch{}}else copy()
 };
 const logout=()=>{localStorage.removeItem("token");setMe(null);setPage("dashboard");setMobile(false);setInstructions(false);window.history.replaceState({},"","/");window.location.replace("/")};
 const profileStrength=Math.round(([me.user.name,me.user.email,me.user.phone,me.user.referralCode,me.package].filter(Boolean).length/5)*100);
 return <div className="app">{mobile&&<button className="navoverlay" aria-label="Close menu" onClick={()=>setMobile(false)}/>}<aside className={mobile?"open":""}><div className="membernavbrand"><img src="/nexora-logo.png"/><div><b>NEXORA</b><small>MEMBER PLATFORM</small></div><button className="mobileclose" onClick={()=>setMobile(false)} aria-label="Close menu"><X size={19}/></button></div><div className="membernavscroll">{nav.map(([id,t,I])=><button className={`${page===id?"active":""}${primaryNavIds.has(id)?"":" navsecondary"}`} onClick={()=>{setPage(id);setMobile(false);setMsg("")}} key={id}><I size={18}/>{t}{id==="support" && tickets.some(x=>x.status==="OPEN") && <span className="navbadge">!</span>}</button>)}<button onClick={()=>{setInstructions(true);setMobile(false)}}><BookOpen size={18}/>Instructions</button><button onClick={()=>{setPage("security");setMobile(false)}}><UserCog size={18}/>Profile & Security</button><button className="logoutbtn" onClick={logout}><LogOut size={18}/>Logout</button></div></aside><main><header><button className="mobilemenu" onClick={()=>setMobile(!mobile)} aria-label={mobile?"Close menu":"Open menu"} title={mobile?"Close navigation":"Open navigation"}>{mobile?<X size={22}/>:<span className="hamburgerglyph" aria-hidden="true">☰</span>}</button><div className="memberpagetitle"><b>{nav.find(x=>x[0]===page)?.[1]||"Dashboard"}</b><div className="muted small">Shop · Earn · Advertise · Learn</div></div><div className="memberheaderbrand"><img src="/nexora-logo.png"/><PWAInstall compact/><button className="avatar avatarbtn" onClick={()=>setMobile(true)} aria-label="Open account menu">{me.user.name?.[0]?.toUpperCase()||"N"}</button></div></header>{error&&<div className="error topmsg"><span>{error}</span><button onClick={()=>load(false)}><RefreshCw size={15}/> Retry</button></div>}{msg&&<div className="notice topmsg">{msg}</div>}
 <PendingPaymentBanner transactions={transactions} goPage={setPage}/>{page==="dashboard"&&<Dashboard goPage={setPage} me={me} copy={copy} copyCode={copyCode} copiedKind={copiedKind} share={share} goPackages={()=>{setPage("referrals"); try{sessionStorage.setItem("nexora-earn-tab","plans")}catch{}}} profileStrength={profileStrength} analytics={analytics} tickets={tickets} goSecurity={()=>setPage("security")} load={load}/>} 
 {page==="packages"&&<section><div className="sectionhead"><div><span className="pill">EARN · PLANS</span><h1>Membership plans</h1><p className="muted">Plans live under Earn — purchase a plan to unlock referral earning tools.</p></div><button className="secondary" onClick={()=>setPage("referrals")}>Back to Earn</button></div><div className="earnnotice panel"><PackageIcon size={20}/><div><h3>Plan required to earn</h3><p className="muted">Activate a membership plan to unlock your referral link. Commissions follow plan rules only; NEXORA does not guarantee income. See <a href="/membership" target="_blank" rel="noreferrer">Membership rules</a>.</p></div></div><Packages packages={packages} current={me.package} purchase={purchase} reload={()=>load(false)}/></section>} 
 {page==="referrals"&&<><Referrals data={referrals} earnings={earnings} me={me} copy={copy} copyCode={copyCode} copiedKind={copiedKind} share={share} packages={packages} purchase={purchase} reload={()=>load(false)} initialTab={(typeof sessionStorage!=="undefined"&&sessionStorage.getItem("nexora-earn-tab")==="plans"?(sessionStorage.removeItem("nexora-earn-tab"),"plans"):"network")}/><ReferralTree data={referrals} me={me}/></>} 
 {page==="analytics"&&<Analytics data={analytics} earnings={earnings} referrals={referrals}/>} 
 {page==="marketing"&&<Marketing me={me} copy={copy} copyCode={copyCode} copiedKind={copiedKind} share={share}/>} {page==="marketplace"&&<Marketplace me={me}/>} {page==="products"&&<Products me={me} packages={packages} purchase={purchase} goPlans={()=>{setPage("referrals");try{sessionStorage.setItem("nexora-earn-tab","plans")}catch{}}}/>} {page==="community"&&<Community announcements={announcements}/>} {page==="notifications"&&<NotificationsCenter me={me} analytics={analytics} tickets={tickets}/>} 
 {page==="academy"&&<Academy/>} 
 {page==="leaderboard"&&<Leaderboard rows={leaderboard}/>} 
 {page==="challenges"&&<Challenges referrals={referrals} earnings={earnings}/>} 
 {page==="wallet"&&<Wallet me={me} load={()=>load(false)}/>} 
 {page==="transactions"&&<Transactions rows={transactions} onOpenPending={x=>{const packageId=x.metadata?.packageId;const pkg=packages.find(p=>p.id===packageId);if(pkg)setPayment({reference:x.reference,package:pkg,phone:cleanPhone(x.metadata?.phone||me.user.phone||""),status:String(x.status||"PENDING").toLowerCase(),chargeAmount:Number(x.metadata?.chargeAmount||x.amount),display_text:x.metadata?.paystack?.display_text||"",message:""})}}/>} 
 {page==="support"&&<SupportCenter tickets={tickets} reload={()=>load(false)}/>} {page==="security"&&<Security me={me} reload={()=>load(false)} strength={profileStrength}/>}</main><SupportButton/>{instructions&&<Instructions onClose={()=>setInstructions(false)}/>} {phoneModal&&<PhoneModal data={phoneModal} walletBalance={Number(me?.wallet?.balance||0)} paybillInfo={payMethods} onCancel={()=>{setPhoneModal(null);load(false)}} onContinue={phone=>startPayment(phone,phoneModal.package)} onWallet={walletPurchase} onPaybillInitiate={paybillInitiate} onPaybillSubmitCode={paybillSubmitCode}/>} {payment&&<PaymentModal payment={payment} onClose={()=>setPayment(null)} onCheck={async()=>{try{const v=await api(`/payments/status/${payment.reference}`);setPayment(x=>x?{...x,status:v.status||"pending",display_text:v.display_text||x.display_text,message:v.message&&v.message!=="Charge attempted"?v.message:x.message}:x);if(v.status==="success"){await load(false);setMsg("Payment confirmed. Your plan is now active.");try{localStorage.setItem("nexora-milestone-paid","1")}catch{}}}catch(e){setError(e.message)}}}/>}</div>
}
function Notifications({me,analytics,tickets}){const notes=[];if(!me.package)notes.push([PackageIcon,"Choose a plan","Explore the membership plans when you are ready."]);if(me.package)notes.push([CheckCircle2,"Plan active",`${me.package.name} is currently active on your account.`]);if((analytics?.month?.directReferrals||0)<5)notes.push([Target,"Monthly challenge",`${5-(analytics?.month?.directReferrals||0)} more direct referral(s) to reach the current activity goal.`]);if(tickets?.some(x=>x.status!=="CLOSED"))notes.push([Bell,"Support update","You have an open support request. Check Help & Support for updates."]);if((me.transactions||[]).some(x=>x.status==="PENDING"))notes.push([Clock3,"Payment pending","A payment is still awaiting confirmation. Check Transactions for status."]);return <div className="panel notificationpanel"><div className="paneltitle"><h3><Bell size={17}/> Smart notifications</h3><span>{notes.length} active</span></div><div className="notificationlist">{notes.slice(0,4).map(([I,t,d],i)=><div className="notification" key={i}><I size={17}/><div><b>{t}</b><p>{d}</p></div></div>)}{!notes.length&&<p className="muted">You're all caught up.</p>}</div></div>}

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
  if(me?.package) return null;
  const [hide,setHide]=useState(()=>sessionStorage.getItem("nexora-plan-nudge")==="1");
  if(hide) return null;
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

function Dashboard({me,copy,copyCode,copiedKind,share,goPackages,goPage,profileStrength,analytics,tickets,goSecurity,load}){
 const [depositOpen,setDepositOpen]=useState(false);
 const recent=(me.transactions||[]).slice(0,4);
 const direct=Number(me.stats?.direct||0);
 const level2=Number(me.stats?.level2||0);
 const balance=Number(me.wallet?.balance||0);
 const earned=Number(me.wallet?.totalEarned||0);
 const monthly=Number(analytics?.month?.directReferrals||0);
 const monthlyGoal=5;
 const progress=Math.min(100,Math.round(monthly/monthlyGoal*100));
 const openTickets=(tickets||[]).filter(x=>x.status!=="CLOSED").length;
 const pendingPayments=(me.transactions||[]).filter(x=>String(x.status||"").toUpperCase()==="PENDING").length;
 const quickActions=[
  {label:"Deposit",hint:"Add money to wallet",icon:WalletCards,action:()=>setDepositOpen(true),tone:"mint"},
  {label:"Marketplace",hint:"Buy from members",icon:Store,action:()=>goPage("marketplace"),tone:"blue"},
  {label:"Sell product",hint:"Create a listing",icon:Plus,action:()=>goPage("marketplace"),tone:"purple"},
  {label:"Invite",hint:"Share your referral",icon:Share2,action:share,tone:"gold"},
  {label:"Transactions",hint:"View payment history",icon:History,action:()=>goPage("transactions"),tone:"slate"},
  {label:"Academy",hint:"Learn platform skills",icon:GraduationCap,action:()=>goPage("academy"),tone:"indigo"},
  {label:"Support",hint:openTickets?`${openTickets} open request${openTickets>1?"s":""}`:"Get help",icon:LifeBuoy,action:()=>goPage("support"),tone:"rose"},
  {label:"Profile",hint:`${profileStrength}% complete`,icon:UserCog,action:goSecurity,tone:"teal"}
 ];
 const nextAction=!me.package
  ? {title:"Activate your membership",text:"Review the available plans to unlock referral tools.",button:"View plans",action:goPackages,icon:PackageIcon}
  : pendingPayments
  ? {title:"Check your pending payment",text:"A payment is still waiting for confirmation.",button:"View transactions",action:()=>goPage("transactions"),icon:Clock3}
  : profileStrength<100
  ? {title:"Finish your profile",text:"A complete profile makes your account easier to manage.",button:"Complete profile",action:goSecurity,icon:UserCog}
  : {title:"Grow your network",text:`You have ${direct} direct referral${direct===1?"":"s"} and ${level2} Level 2 connection${level2===1?"":"s"}.`,button:"Open Earn",action:()=>goPage("referrals"),icon:UsersRound};
 const NextIcon=nextAction.icon;
 return <>
  <section className="hero dashboardhero">
   <div className="dashboardhero-copy">
    <span className="pill">NEXORA DASHBOARD</span>
    <h1>Welcome back, {me.user.name.split(" ")[0]} <span aria-hidden="true">👋</span></h1>
    <p>Your command center for wallet activity, marketplace, referrals, learning and account support.</p>
    <div className="heroactions">
     <button className="primary" onClick={()=>goPage("marketplace")}><Store size={16}/> Open Marketplace</button>
     <button className="secondary" onClick={()=>goPage("referrals")}><WalletCards size={16}/> Open Earn</button>
     <button className="secondary" onClick={()=>goPage("academy")}><GraduationCap size={16}/> Learn</button>
    </div>
   </div>
   <div className="dashboardhero-side">
    <div className="dashboardmini-label">CURRENT PLAN</div>
    <strong>{me.package?.name||"No plan yet"}</strong>
    <span>{me.package?`${money(me.package.price)} membership`:"Explore plans when you're ready"}</span>
    {!me.package&&<button className="hero-plan-btn" onClick={goPackages}>View plans <ArrowUpRight size={14}/></button>}
   </div>
  </section>

  <div className="dashboardquick">
   <div className="dashboardquick-head">
    <div><span className="pill">QUICK ACTIONS</span><h2>What do you want to do?</h2></div>
    <span className="muted small">Shortcuts to the tools you use most</span>
   </div>
   <div className="dashboardquick-grid">
    {quickActions.map(({label,hint,icon:Icon,action,tone})=><button key={label} className={`quickaction ${tone}`} onClick={action}>
      <span className="quickaction-icon"><Icon size={18}/></span><span className="quickaction-copy"><b>{label}</b><small>{hint}</small></span><ArrowUpRight size={15}/>
    </button>)}
   </div>
  </div>

  <div className="dashboardstats">
   <div className="dashboardstat balance"><span>Available balance</span><strong>{money(balance)}</strong><button onClick={()=>setDepositOpen(true)}><WalletCards size={13}/> Deposit</button></div>
   <div className="dashboardstat"><span>Total recorded earnings</span><strong>{money(earned)}</strong><small>Account history</small></div>
   <div className="dashboardstat"><span>Direct referrals</span><strong>{direct}</strong><small>Level 1 network</small></div>
   <div className="dashboardstat"><span>Level 2 network</span><strong>{level2}</strong><small>Extended network</small></div>
  </div>

  <div className="dashboard-main-grid">
   <div className="dashboard-left">
    <div className="panel nextaction">
     <div className="nextaction-icon"><NextIcon size={21}/></div>
     <div className="nextaction-copy"><span className="pill">RECOMMENDED NEXT STEP</span><h3>{nextAction.title}</h3><p className="muted">{nextAction.text}</p></div>
     <button className="primary narrow" onClick={nextAction.action}>{nextAction.button}<ArrowUpRight size={14}/></button>
    </div>

    <div className="panel progresspanel">
     <div className="paneltitle"><div><span className="pill">MONTHLY ACTIVITY</span><h3>Your progress</h3></div><strong>{monthly}/{monthlyGoal}</strong></div>
     <div className="progress"><i style={{width:`${progress}%`}}/></div>
     <div className="progressmeta"><span>{progress}% of the current activity goal</span><span>{monthly>=monthlyGoal?"Goal reached":"Keep building steadily"}</span></div>
    </div>

    <div className="panel">
     <div className="paneltitle"><div><span className="pill">RECENT ACTIVITY</span><h3>Latest account activity</h3></div><button className="secondary narrow" onClick={()=>goPage("transactions")}>View all</button></div>
     {recent.length?recent.map(x=><div className="activityrow" key={x.id}>
       <span className="activityicon"><History size={15}/></span><div><b>{String(x.type||"Activity").replaceAll("_"," ")}</b><small>{new Date(x.createdAt).toLocaleString()}</small></div><strong>{money(x.amount)}</strong>
      </div>):<div className="smartempty"><p className="muted">No account activity yet.</p><button className="secondary narrow" onClick={goPackages}>Explore plans</button></div>}
    </div>
   </div>

   <div className="dashboard-right">
    <ProfileCard me={me} strength={profileStrength} goSecurity={goSecurity}/>
    <div className="panel referralpanel">
     <div className="paneltitle"><div><span className="pill">REFERRAL TOOLKIT</span><h3>Share your link</h3></div><Share2 size={18}/></div>
     {me.package?<><div className="copybox"><span>{location.origin}/?ref={me.user.referralCode}</span><button onClick={copy}>{copiedKind==="link"?<><Check size={16}/> Copied</>:<><Copy size={16}/> Copy</>}</button></div><div className="heroactions compact"><button className="secondary" onClick={share}><Share2 size={15}/> Share</button><button className="secondary" onClick={()=>waShare(`Hi! Join me on NEXORA — review plans first (no guaranteed income): ${location.origin}/?ref=${me.user.referralCode}`)}><MessageCircle size={15}/> WhatsApp</button><button className="secondary" onClick={copyCode}>{copiedKind==="code"?<><Check size={15}/> Copied</>:<><CopyCheck size={15}/> Copy code</>}</button></div></>:<div className="lockedinline"><LockKeyhole size={18}/><div><b>Referral tools are locked</b><p className="muted small">Activate a plan to unlock your referral link and sharing tools.</p></div><button className="secondary narrow" onClick={goPackages}>View plans</button></div>}
    </div>
   </div>
  </div>

  <RecommendedMarketplace goPage={goPage}/>
  {!me.package&&<OnboardingChecklist me={me} goPackages={goPackages} goPage={goPage}/>}
  <Notifications me={me} analytics={analytics} tickets={tickets}/>
  {depositOpen&&<DepositModal onClose={()=>setDepositOpen(false)} load={load}/>}
 </>
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
    <div className="panel"><Megaphone size={24}/><h3>Share link</h3><p className="muted">Your personal referral link.</p><div className="copybox"><span>{link}</span><button onClick={copy}>{(copiedKind==="link"||localCopied==="link")?<><Check size={16}/> Copied</>:<><Copy size={16}/> Copy</>}</button></div><div className="heroactions compact" style={{marginTop:12}}><button className="primary" onClick={share}><Share2 size={16}/> Share link</button><button className="secondary" onClick={()=>waShare(`Hi! I use NEXORA for membership + referrals. Review plans first (no guaranteed income): ${link}`)}><MessageCircle size={16}/> WhatsApp</button><button className="secondary" onClick={copyCode}>{(copiedKind==="code"||localCopied==="code")?<><Check size={15}/> Copied</>:<><CopyCheck size={15}/> Copy code</>}</button></div>{(copiedKind==="link"||copiedKind==="code"||localCopied)&&<p className="muted small copyhint">{copiedKind==="code"||localCopied==="code"?"Referral code copied — friends paste it when registering.":copiedKind==="link"||localCopied==="link"?"Referral link copied — paste it in chat or social media.":"Message copied."}</p>}</div>
    <div className="panel qrcodepanel"><QrCode size={24}/><h3>QR referral card</h3><p className="muted">Let people scan your referral link from your screen.</p><img className="qrcode" alt="Referral QR code" src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link)}`}/><small className="muted">Scan to open your NEXORA referral page.</small></div>
    <div className="panel"><Sparkles size={24}/><h3>Ready-to-share messages</h3>
     <div className="template"><b>Short</b><p>Join me on NEXORA — member tools, learning and network in one place: {link}</p><button className="secondary" onClick={()=>copyText(`Join me on NEXORA — member tools, learning and network in one place: ${link}`)}>Copy</button></div>
     <div className="template"><b>Honest invite</b><p>I'm on NEXORA. It is a membership platform with plans, referrals and Academy lessons. No guaranteed income — review the plans first: {link}</p><button className="secondary" onClick={()=>copyText(`I'm on NEXORA. It is a membership platform with plans, referrals and Academy lessons. No guaranteed income — review the plans first: ${link}`)}>Copy</button></div>
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


function Academy(){
 const [selected,setSelected]=useState(null);
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
 return <section><div className="sectionhead"><div><span className="pill">LEARNING HUB</span><h1>NEXORA Academy</h1><p className="muted">Practical, step-by-step lessons to help members understand NEXORA, use its tools and communicate responsibly.</p></div></div><div className="panel academyintro"><BookOpen size={23}/><div><h3>Learn at your own pace</h3><p className="muted">Start with the foundations, then work through referrals, marketing, analytics, payment safety and sustainable growth. These lessons are educational and do not guarantee earnings.</p></div></div><div className="academygrid">{lessons.map((lesson,i)=><div className="academycard" key={lesson.title}><div className="lessonnum">{i+1}</div><GraduationCap size={23}/><small className="lessonlevel">{lesson.level} · {lesson.time}</small><h3>{lesson.title}</h3><p className="muted">{lesson.text}</p><button className="secondary" onClick={()=>setSelected(i)}><BookOpen size={15}/> Start lesson</button></div>)}</div>{lesson&&<div className="modalbackdrop" onClick={()=>setSelected(null)}><div className="modal lessonmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">{lesson.level} · {lesson.time}</span><h2>{lesson.title}</h2></div><button className="iconbtn" onClick={()=>setSelected(null)} aria-label="Close lesson"><X size={20}/></button></div><div className="lessonbody"><p className="lessonlead">{lesson.text}</p>{lesson.sections.map(([heading,body])=><div className="lessonsection" key={heading}><h3>{heading}</h3><p>{body}</p></div>)}<div className="lessontakeaway"><CheckCircle2 size={19}/><div><b>Key takeaway</b><p>{lesson.takeaway}</p></div></div></div><div className="modalfoot"><button className="primary" onClick={()=>setSelected(null)}><Check size={16}/> Finish lesson</button></div></div></div>}</section>}
function Leaderboard({rows}){return <section><div className="sectionhead"><div><span className="pill">COMMUNITY</span><h1>Leaderboard</h1><p className="muted">A transparent snapshot of recorded referral commissions. Only first names are displayed.</p></div></div><div className="panel leaderboard"><div className="leaderhead"><span>Rank</span><span>Member</span><span>Plan</span><span>Recorded earnings</span></div>{rows.map((x,i)=><div className="leaderrow" key={x.id}><strong className="rank">{i<3?<Crown size={17}/>:i+1}</strong><div><b>{x.name}</b><small>Member since {new Date(x.createdAt).toLocaleDateString()}</small></div><span>{x.package||"No plan"}</span><strong>{money(x.totalEarned)}</strong></div>)}{!rows.length&&<p className="muted">No leaderboard data yet.</p>}</div><div className="notice"><Trophy size={16}/> Leaderboard figures are informational and reflect recorded commissions, not guaranteed future income.</div></section>}
function Challenges({referrals,earnings}){const now=new Date(),month=now.getMonth(),year=now.getFullYear();const count=referrals.direct.filter(x=>{const d=new Date(x.createdAt);return d.getMonth()===month&&d.getFullYear()===year}).length;const goal=5;const pct=Math.min(100,count/goal*100);const directE=earnings.filter(x=>x.level===1).reduce((a,x)=>a+Number(x.amount||0),0);return <section><div className="sectionhead"><div><span className="pill">MONTHLY CHALLENGE</span><h1>Build your momentum</h1><p className="muted">Track useful activity goals without turning them into promises of earnings.</p></div></div><div className="challengehero"><div><Target size={30}/><span>Current challenge</span><h2>Make 5 quality direct referrals</h2><p>Invite people who genuinely want to understand and use NEXORA.</p></div><div className="challengecount"><strong>{count}</strong><span>/ {goal}</span></div></div><div className="progress challengeprogress"><i style={{width:`${pct}%`}}/></div><div className="cards three"><Card title="Direct referrals this month" value={count}/><Card title="Direct commissions recorded" value={money(directE)}/><Card title="Challenge progress" value={`${Math.round(pct)}%`}/></div><div className="panel"><h3>Achievement ideas</h3><div className="achievementgrid"><Achievement icon={<Users2/>} title="First connection" text="Make your first direct referral." unlocked={referrals.direct.length>=1}/><Achievement icon={<TrendingUp/>} title="Network builder" text="Reach 5 direct referrals." unlocked={referrals.direct.length>=5}/><Achievement icon={<Medal/>} title="Consistent promoter" text="Reach 10 direct referrals." unlocked={referrals.direct.length>=10}/><Achievement icon={<Crown/>} title="Community leader" text="Reach 25 direct referrals." unlocked={referrals.direct.length>=25}/></div></div></section>}
function Achievement({icon,title,text,unlocked}){return <div className={`achievement ${unlocked?"unlocked":""}`}>{icon}<div><b>{title}</b><p>{text}</p></div><span>{unlocked?<CheckCheck size={17}/>:"Locked"}</span></div>}
function SupportCenter({tickets,reload}){const [subject,setSubject]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[err,setErr]=useState("");const submit=async e=>{e.preventDefault();if(!subject.trim()||!message.trim())return setErr("Enter a subject and message.");setBusy(true);setErr("");try{await api("/support/tickets",{method:"POST",body:JSON.stringify({subject,message})});setSubject("");setMessage("");await reload()}catch(e){setErr(e.message)}finally{setBusy(false)}};return <section><div className="sectionhead"><div><span className="pill">MEMBER CARE</span><h1>Help & Support</h1><p className="muted">Get help, track your requests and use the direct WhatsApp support option.</p></div><a className="secondary" href="https://wa.me/254703265774" target="_blank" rel="noreferrer"><MessageCircle size={16}/> WhatsApp</a></div><div className="supportgrid"><div className="panel"><LifeBuoy size={24}/><h3>Open a support ticket</h3>{err&&<div className="error">{err}</div>}<form className="supportform" onSubmit={submit}><input required maxLength="120" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)}/><textarea required maxLength="3000" rows="7" placeholder="Describe what you need help with…" value={message} onChange={e=>setMessage(e.target.value)}/><button className="primary" disabled={busy}><Send size={16}/>{busy?"Sending…":"Send support request"}</button></form></div><div className="panel"><h3>Your tickets</h3>{tickets.length?tickets.map(t=><div className="ticket" key={t.id}><div><b>{t.subject}</b><small>{new Date(t.createdAt).toLocaleString()}</small></div><span className={`ticketstatus ${t.status.toLowerCase()}`}>{t.status}</span><p>{t.message}</p>{t.response&&<div className="ticketresponse"><b>Support reply</b><p>{t.response}</p></div>}</div>):<p className="muted">No support tickets yet.</p>}</div></div><div className="notice"><Bell size={16}/> For payment issues, include your transaction reference. Never send your password or PIN to support.</div></section>}
function Security({me,reload,strength}){const [name,setName]=useState(me.user.name),[phone,setPhone]=useState(me.user.phone),[oldPass,setOld]=useState(""),[newPass,setNew]=useState(""),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false);const saveProfile=async()=>{setBusy(true);setMsg("");try{const d=await api("/member/profile",{method:"PATCH",body:JSON.stringify({name,phone})});setMsg(d.message);await reload()}catch(e){setMsg(e.message)}finally{setBusy(false)}};const changePassword=async()=>{setBusy(true);setMsg("");try{const d=await api("/member/password",{method:"POST",body:JSON.stringify({currentPassword:oldPass,newPassword:newPass})});setMsg(d.message);setOld("");setNew("")}catch(e){setMsg(e.message)}finally{setBusy(false)}};return <section><div className="sectionhead"><div><span className="pill">ACCOUNT SECURITY</span><h1>Security center</h1><p className="muted">Keep your profile accurate and protect your account.</p></div><Shield size={22}/></div>{msg&&<div className="notice">{msg}</div>}<div className="securitygrid"><div className="panel"><UserCog size={23}/><h3>Profile</h3><label>Name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Phone<input inputMode="tel" value={phone} onChange={e=>setPhone(e.target.value)}/></label><button className="primary" disabled={busy} onClick={saveProfile}>Save profile</button></div><div className="panel"><KeyRound size={23}/><h3>Change password</h3><label>Current password<input type="password" value={oldPass} onChange={e=>setOld(e.target.value)}/></label><label>New password<input type="password" minLength="8" value={newPass} onChange={e=>setNew(e.target.value)} placeholder="8+ characters"/></label><button className="primary" disabled={busy} onClick={changePassword}>Update password</button></div></div><div className="panel"><h3>Security checklist</h3><div className="securitychecks"><span><Check size={15}/> Use a unique password</span><span><Check size={15}/> Never share your M-Pesa PIN</span><span><Check size={15}/> Verify payment references before reporting a problem</span><span><Check size={15}/> Keep your phone number current</span></div><div className="profilemeter"><b>Profile completeness: {strength}%</b><div className="progress"><i style={{width:`${strength}%`}}/></div></div></div></section>}
function PhoneModal({data,onCancel,onContinue,onWallet,onPaybillInitiate,onPaybillSubmitCode,walletBalance=0,paybillInfo}){
 const [phone,setPhone]=useState(data.phone||"");
 const [err,setErr]=useState("");
 const [method,setMethod]=useState(walletBalance>=Number(data.chargeAmount||0)?"wallet":"paybill");
 const [busy,setBusy]=useState(false);
 const [walletConfirm,setWalletConfirm]=useState(false);
 const [paybillStep,setPaybillStep]=useState(data.paybillSession?"code":"instructions"); // instructions | code | done
 const [paybillSession,setPaybillSession]=useState(data.paybillSession||null);
 const [mpesaCode,setMpesaCode]=useState("");
 const amount=Number(data.chargeAmount||data.package?.price||0);
 const canWallet=walletBalance>=amount && amount>0;
 const paybillReady=Boolean((paybillInfo?.paybillNumber&&paybillInfo?.paybillAccount)|| (paybillSession?.paybillNumber&&paybillSession?.paybillAccount));

 const submit=async e=>{
  e.preventDefault();setErr("");
  if(method==="wallet"){
   if(!canWallet) return setErr("Insufficient wallet balance for this plan.");
   if(!walletConfirm) return setErr("Please confirm you want to pay from your wallet.");
   setBusy(true);
   try{ await onWallet(data.package); } catch(ex){ setErr(ex.message||"Wallet purchase failed"); } finally{ setBusy(false); }
   return;
  }
  // paybill
  if(paybillStep==="instructions"){
   if(!paybillReady && !onPaybillInitiate) return setErr("Paybill payments are not configured.");
   setBusy(true);
   try{
    const session=await onPaybillInitiate(data.package);
    setPaybillSession(session);
    setPaybillStep("code");
   }catch(ex){ setErr(ex.message||"Could not start paybill payment"); }
   finally{ setBusy(false); }
   return;
  }
  if(paybillStep==="code"){
   if(!mpesaCode.trim()) return setErr("Enter the M-Pesa confirmation code from your SMS.");
   setBusy(true);
   try{
    const r=await onPaybillSubmitCode(paybillSession?.reference, mpesaCode.trim());
    setPaybillStep("done");
    setErr("");
    setPaybillSession(s=>({...s, status:r.status, message:r.message}));
   }catch(ex){ setErr(ex.message||"Could not submit code"); }
   finally{ setBusy(false); }
  }
 };

 const displayPaybill=paybillSession?.paybillNumber||paybillInfo?.paybillNumber||"";
 const displayName=paybillSession?.paybillName||paybillInfo?.paybillName||"NEXORA";
 const displayAccount=paybillSession?.paybillAccount||paybillInfo?.paybillAccount||"";
 const displayRef=paybillSession?.reference||paybillSession?.accountReference||"";
 const [copied,setCopied]=useState("");
 const copyValue=async(label,value)=>{
  if(!value) return;
  try{
   await navigator.clipboard.writeText(String(value));
  }catch{
   window.prompt("Copy this value:", String(value));
  }
  setCopied(label);
  setTimeout(()=>setCopied(""),2000);
 };

 return <div className="modalbackdrop" onClick={onCancel}><div className="modal phonemodal" onClick={e=>e.stopPropagation()}>
  <div className="modalhead"><div><span className="pill">PURCHASE PACKAGE</span><h2>{paybillStep==="done"?"Payment submitted":"Choose how to pay"}</h2></div><button type="button" className="iconbtn" onClick={onCancel} aria-label="Close payment window"><X size={20}/></button></div>
  <form className="phonemodalform" onSubmit={submit}>
   <div className="paymentbody phonebody">
    <div className="phonepackage">
     <div><span>Plan</span><strong>{data.package?.name}</strong></div>
     <div><span>Amount due</span><strong>{money(amount)}</strong></div>
     <div><span>Wallet balance</span><strong>{money(walletBalance)}</strong></div>
    </div>

    {paybillStep!=="done"&&paybillStep!=="code"&&(
     <div className="paymethods">
      <button type="button" className={`paymethod ${method==="paybill"?"active":""}`} disabled={busy} onClick={async()=>{
       setMethod("paybill");setErr("");
       if(paybillStep!=="instructions" || !onPaybillInitiate) return;
       if(!paybillReady) return setErr("Paybill payments are not configured yet.");
       setBusy(true);
       try{const session=await onPaybillInitiate(data.package);setPaybillSession(session);setPaybillStep("code");}
       catch(ex){setErr(ex.message||"Could not start paybill payment");}
       finally{setBusy(false);}
      }}>
       <MessageCircle size={18}/><div><b>{busy&&method==="paybill"?"Opening M-Pesa payment…":"M-Pesa Paybill"}</b><span>Tap to continue directly to the paybill payment details</span></div>
      </button>
      <button type="button" className={`paymethod ${method==="wallet"?"active":""} ${!canWallet?"disabled":""}`} onClick={()=>{if(canWallet){setMethod("wallet");setErr("")}}} disabled={!canWallet}>
       <WalletCards size={18}/><div><b>Wallet balance</b><span>{canWallet?`Use ${money(amount)} from your wallet`:`Need ${money(amount)} · you have ${money(walletBalance)}`}</span></div>
      </button>
     </div>
    )}

    {method==="wallet"&&paybillStep!=="done"&&(
     <div className="walletconfirmbox">
      <p className="muted small">Your wallet will be charged <strong>{money(amount)}</strong>. The plan activates immediately. <strong>This cannot be undone.</strong></p>
      <label className="termscheck"><input type="checkbox" checked={walletConfirm} onChange={e=>setWalletConfirm(e.target.checked)}/><span>I confirm paying {money(amount)} from my wallet for {data.package?.name}.</span></label>
     </div>
    )}

    {method==="paybill"&&paybillStep==="instructions"&&(
     <div className="paybillbox">
      <p className="muted small">You will pay <strong>{money(amount)}</strong> to the NEXORA M-Pesa Paybill. After paying, you must submit the M-Pesa confirmation code. Your plan activates only after we verify the payment amount and code.</p>
      {!paybillReady&&<div className="error">Paybill number is not configured yet. Contact support or use wallet balance.</div>}
     </div>
    )}

    {method==="paybill"&&paybillStep==="code"&&paybillSession&&(
     <div className="paybillbox">
      <div className="paybilldetails">
       <div className="paybillrowcopy">
        <div><span>Paybill</span><strong className="paybillnumber">{displayPaybill}</strong></div>
        <button type="button" className="secondary copypaybillbtn" onClick={()=>copyValue("paybill",displayPaybill)}>
         {copied==="paybill"?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy paybill</>}
        </button>
       </div>
       <div className="paybillrowcopy">
        <div><span>Co-op account</span><strong className="refcode">{displayAccount}</strong></div>
        <button type="button" className="secondary copypaybillbtn" onClick={()=>copyValue("account",displayAccount)}>
         {copied==="account"?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy account</>}
        </button>
       </div>
       <div><span>Business name</span><strong>{displayName}</strong></div>
       <div className="paybillrowcopy">
        <div><span>Amount (exact)</span><strong>{money(paybillSession.chargeAmount||amount)}</strong></div>
        <button type="button" className="secondary copypaybillbtn" onClick={()=>copyValue("amount",String(paybillSession.chargeAmount||amount))}>
         {copied==="amount"?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy amount</>}
        </button>
       </div>
       <div className="paybillrowcopy">
        <div><span>Payment reference</span><strong className="refcode">{displayRef}</strong></div>
        <button type="button" className="secondary copypaybillbtn" onClick={()=>copyValue("ref",displayRef)}>
         {copied==="ref"?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy ref</>}
        </button>
       </div>
      </div>
      {copied&&<p className="muted small copyhint">{copied==="paybill"?"Paybill number copied — paste it in M-Pesa.":copied==="account"?"Co-op account number copied.":copied==="amount"?"Amount copied.":"Reference copied."}</p>}
      <ol className="paybillsteps">
       <li>Open M-Pesa → Lipa na M-Pesa → Paybill</li>
       <li>Enter Paybill Number <b>{displayPaybill}</b></li>
       <li>Enter account number <b>{displayAccount}</b></li><li>Enter amount <b>{money(paybillSession.chargeAmount||amount)}</b> (exact)</li>
       <li>Use the Co-op account number exactly as shown above. Keep the NEXORA reference for support.</li>
       <li>Enter your M-Pesa PIN and confirm</li>
       <li>Paste the confirmation code from the SMS below</li>
      </ol>
      <label className="fieldlabel">M-Pesa confirmation code
       <input required value={mpesaCode} onChange={e=>setMpesaCode(e.target.value.toUpperCase())} placeholder="e.g. QH12ABCDE1" autoComplete="off"/>
      </label>
      <p className="muted small">We verify the code and that the amount matches before activating your plan.</p>
     </div>
    )}

    {paybillStep==="done"&&(
     <div className="repairdone" style={{margin:"12px 0"}}>
      <CheckCircle2 size={22}/>
      <div><b>Submitted for verification</b><p>{paybillSession?.message||"We will confirm your M-Pesa payment and activate the plan once the amount matches."}</p></div>
     </div>
    )}

    {err&&<div className="error">{err}</div>}
   </div>
   <div className="modalfoot paymentfoot">
    <button type="button" className="secondary" onClick={onCancel} disabled={busy}>{paybillStep==="done"?"Close":"Cancel"}</button>
    {paybillStep!=="done"&&(
     <button type="submit" className="primary" disabled={busy||(method==="paybill"&&paybillStep==="instructions"&&!paybillReady)}>
      {busy?"Please wait…":method==="wallet"?`Pay ${money(amount)} from wallet`:paybillStep==="code"?"Submit M-Pesa code":"Continue to paybill payment"}
     </button>
    )}
   </div>
  </form>
 </div></div>;
}


function PaymentModal({payment,onClose,onCheck}){
 const status=payment.status||"pending";
 const isSuccess=status==="success";
 const isFailed=status==="failed";
 const isPending=!isSuccess&&!isFailed;
 const title=isSuccess?"Payment successful":isFailed?"Payment failed":"M-Pesa request sent";
 const text=isSuccess?"Your plan has been activated.":isFailed?"The M-Pesa payment was not completed. You can close this window and try again.":"Check your phone now. An M-Pesa prompt should be waiting for your approval.";
 return <div className="modalbackdrop" onClick={onClose}><div className="modal paymentmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className={`pill ${isSuccess?"payment-success":isFailed?"payment-failed":"payment-pending"}`}>{isSuccess?"COMPLETED":isFailed?"FAILED":"WAITING FOR PAYMENT"}</span><h2>{title}</h2></div><button className="iconbtn" onClick={onClose}><X size={20}/></button></div><div className="paymentbody"><div className="paymentstatus"><div className={`paymenticon ${isSuccess?"success":isFailed?"failed":"pending"}`}>{isSuccess?<CheckCircle2 size={28}/>:isFailed?<X size={28}/>:<RefreshCw size={28}/>}</div><div><b>{text}</b><p className="muted">{isSuccess?"Payment confirmed by NEXORA.":isFailed?(payment.display_text||"Please try the payment again."):(payment.display_text||"Please enter your M-Pesa PIN on your phone to approve the payment.")}</p></div></div><div className="paymentdetails"><div><span>Plan</span><strong>{payment.package?.name}</strong></div><div><span>Amount</span><strong>{money(payment.chargeAmount||payment.package?.price)}</strong></div><div><span>M-Pesa number</span><strong>{payment.phone}</strong></div><div><span>Reference</span><strong>{payment.reference}</strong></div></div>{isPending&&<div className="paymentwait"><div className="paymentwaittitle"><span className="live-dot"></span><strong>Waiting for confirmation</strong></div><p className="muted small">We will keep checking automatically. Paystack recommends waiting at least 10 seconds before checking a pending charge.</p></div>}{payment.message&&<p className="muted small">{payment.message}</p>}</div><div className="modalfoot paymentfoot">{isPending&&<button className="secondary" onClick={onCheck}><RefreshCw size={16}/> Check payment status</button>}<button className="primary paymentclose" onClick={onClose}>{isSuccess?"Go to dashboard":isFailed?"Close":"Close for now"}</button></div></div></div>}

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
 const [amount,setAmount]=useState("");const [step,setStep]=useState("amount");const [session,setSession]=useState(null);const [code,setCode]=useState("");const [busy,setBusy]=useState(false);const [msg,setMsg]=useState("");const [copied,setCopied]=useState("");
 const copy=async(v,k)=>{try{await navigator.clipboard.writeText(String(v))}catch{window.prompt("Copy this value:",String(v))}setCopied(k);setTimeout(()=>setCopied(""),1800)};
 const initiate=async e=>{e.preventDefault();setMsg("");const n=Number(amount);if(!Number.isInteger(n)||n<100)return setMsg("Enter a whole deposit amount of at least KSh 100.");setBusy(true);try{const d=await api("/wallet/deposit/initiate",{method:"POST",body:JSON.stringify({amount:n})});setSession(d);setStep("code")}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 const submit=async e=>{e.preventDefault();if(!code.trim())return setMsg("Enter the M-Pesa confirmation code from your SMS.");setBusy(true);setMsg("");try{const d=await api("/wallet/deposit/submit-code",{method:"POST",body:JSON.stringify({reference:session.reference,mpesaCode:code.trim()})});setMsg(d.message||"Deposit submitted for verification.");setStep("done");await load()}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 return <div className="modalbackdrop" onClick={onClose}><div className="modal depositmodal" onClick={e=>e.stopPropagation()}><div className="modalhead"><div><span className="pill">WALLET DEPOSIT</span><h2>{step==="amount"?"Deposit to wallet":step==="code"?"Complete M-Pesa deposit":"Deposit submitted"}</h2></div><button type="button" className="iconbtn" onClick={onClose}><X size={20}/></button></div>
  <div className="depositbody">
   {step==="amount"&&<form onSubmit={initiate}><p className="muted">Add funds to your NEXORA wallet using the NEXORA M-Pesa Paybill. Deposits are credited after the payment and confirmation code are verified by NEXORA.</p><label>Deposit amount (KSh)<input required type="number" min="100" step="1" placeholder="e.g. 1,000" value={amount} onChange={e=>setAmount(e.target.value)}/></label>{msg&&<div className="error">{msg}</div>}<button className="primary" disabled={busy}>{busy?"Opening payment…":"Continue to M-Pesa Paybill"}</button></form>}
   {step==="code"&&session&&<form onSubmit={submit}><div className="paybillbox"><div className="paybilldetails"><div className="paybillrowcopy"><div><span>Paybill</span><strong className="paybillnumber">{session.paybillNumber}</strong></div><button type="button" className="secondary copypaybillbtn" onClick={()=>copy(session.paybillNumber,"paybill")}>{copied==="paybill"?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy paybill</>}</button></div><div><span>Business name</span><strong>{session.paybillName||"NEXORA"}</strong></div><div className="paybillrowcopy"><div><span>Co-op account</span><strong className="refcode">{session.paybillAccount}</strong></div><button type="button" className="secondary copypaybillbtn" onClick={()=>copy(session.paybillAccount,"account")}>{copied==="account"?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy account</>}</button></div><div className="paybillrowcopy"><div><span>Amount</span><strong>{money(session.amount)}</strong></div><button type="button" className="secondary copypaybillbtn" onClick={()=>copy(session.amount,"amount")}>{copied==="amount"?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy amount</>}</button></div><div className="paybillrowcopy"><div><span>Reference</span><strong className="refcode">{session.reference}</strong></div><button type="button" className="secondary copypaybillbtn" onClick={()=>copy(session.reference,"ref")}>{copied==="ref"?<><Check size={14}/> Copied</>:<><Copy size={14}/> Copy ref</>}</button></div></div><ol className="paybillsteps"><li>Open M-Pesa → Lipa na M-Pesa → Paybill.</li><li>Enter Paybill <b>{session.paybillNumber}</b>.</li><li>Enter account number <b>{session.paybillAccount}</b>.</li><li>Enter amount <b>{money(session.amount)}</b>.</li><li>If asked for a reference, use <b>{session.reference}</b>.</li><li>Complete the payment and keep the confirmation SMS.</li></ol><label className="fieldlabel">M-Pesa confirmation code<input required value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="e.g. QH12ABCDE1" autoComplete="off"/></label>{msg&&<div className="error">{msg}</div>}<button className="primary" disabled={busy}>{busy?"Submitting…":"Submit confirmation code"}</button></div></form>}
   {step==="done"&&<div className="successbox"><CheckCircle2 size={34}/><h3>Deposit submitted</h3><p className="muted">Your deposit is awaiting verification. Once approved, the amount will be added to your available wallet balance.</p>{msg&&<p className="notice">{msg}</p>}<button className="primary" onClick={onClose}>Done</button></div>}
  </div><div className="modalfoot"><button type="button" className="secondary" onClick={onClose}>{step==="done"?"Close":"Cancel"}</button></div>
 </div></div>
}
function Wallet({me,load}){
 const [tab,setTab]=useState("balance"),[depositOpen,setDepositOpen]=useState(false);const [amount,setAmount]=useState(""),[phone,setPhone]=useState(me.user.phone||""),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false);
 const withdraw=async()=>{setMsg("");const n=Number(amount);if(!Number.isInteger(n)||n<100)return setMsg("Enter a whole amount of at least KSh 100.");if(n>Number(me.wallet?.balance||0))return setMsg("The withdrawal amount exceeds your available balance.");if(!validPhone(phone))return setMsg("Enter a valid Kenyan phone number: 07…, 011…, 2547… or 2541…. ");setBusy(true);try{const d=await api("/withdrawals",{method:"POST",body:JSON.stringify({amount:n,phone:cleanPhone(phone)})});setMsg(`${d.message}. Reference: ${d.reference}`);setAmount("");await load()}catch(e){setMsg(e.message)}finally{setBusy(false)}};
 return <section><div className="sectionhead"><div><span className="pill">WALLET</span><h1>Balance & funds</h1><p className="muted">Manage your available balance, add funds and request withdrawals.</p></div></div><div className="walletbig"><span>Available balance</span><strong>{money(me.wallet?.balance)}</strong><p>Total earned {money(me.wallet?.totalEarned)} · Pending {money(me.wallet?.pendingBalance)} · Withdrawn {money(me.wallet?.totalWithdrawn)}</p></div><div className="wallettabs"><button className={tab==="balance"?"active":""} onClick={()=>setTab("balance")}>Balance</button><button className={tab==="deposit"?"active":""} onClick={()=>setTab("deposit")}>Deposit</button><button className={tab==="withdraw"?"active":""} onClick={()=>setTab("withdraw")}>Withdraw</button></div>{tab==="balance"&&<div className="walletsummarygrid"><div className="panel"><h3>Available</h3><strong className="walletmetric">{money(me.wallet?.balance)}</strong><p className="muted">Funds currently available for eligible wallet purchases or withdrawals.</p></div><div className="panel"><h3>Pending</h3><strong className="walletmetric">{money(me.wallet?.pendingBalance)}</strong><p className="muted">Funds currently reserved for withdrawal processing.</p></div><div className="panel"><h3>Total earned</h3><strong className="walletmetric">{money(me.wallet?.totalEarned)}</strong><p className="muted">Recorded earnings credited to your wallet over time.</p></div></div>}{tab==="deposit"&&<div className="panel formpanel"><h3>Deposit to wallet</h3><p className="muted">Add money through the NEXORA M-Pesa Paybill. Your deposit is credited after admin verification of the M-Pesa confirmation code and amount.</p><button className="primary" onClick={()=>setDepositOpen(true)}><WalletCards size={16}/> Deposit via M-Pesa Paybill</button><p className="muted small">Minimum deposit: KSh 100. Never share your M-Pesa PIN with anyone.</p></div>}{tab==="withdraw"&&<div className="panel formpanel"><h3>Request withdrawal</h3>{msg&&<div className="notice">{msg}</div>}<input type="number" min="100" step="1" placeholder="Amount (KSh)" value={amount} onChange={e=>setAmount(e.target.value)}/><input inputMode="tel" maxLength="13" placeholder="M-Pesa phone: 07…, 011…, 2547… or 2541…" value={phone} onChange={e=>setPhone(e.target.value)}/><p className="muted small phonehint">Accepted: 07xxxxxxxx · 011xxxxxxx · 2547xxxxxxxx · 2541xxxxxxxx</p><button disabled={busy} className="primary" onClick={withdraw}>{busy?"Submitting…":"Request withdrawal"}</button><p className="muted small">Minimum withdrawal: KSh 100. Withdrawals are reviewed/processed by the administrator.</p></div>}{depositOpen&&<DepositModal onClose={()=>setDepositOpen(false)} load={load}/>}</section>}
function Transactions({rows,onOpenPending}){return <section><div className="sectionhead"><div><h1>Transactions</h1><p className="muted">Your recent account activity.</p></div></div><div className="panel">{rows.length?rows.map(x=><div className="row simple" key={x.id}><div><b>{x.type.replaceAll("_"," ")}</b><small>{new Date(x.createdAt).toLocaleString()} · {x.reference}</small></div><div className="transactionright"><strong>{money(x.amount)}</strong><small className={`txstatus ${String(x.status||"").toLowerCase()}`}>{x.status}</small>{String(x.status||"").toUpperCase()==="PENDING"&&x.type==="PACKAGE_PURCHASE"&&<button className="txcheck" onClick={()=>onOpenPending(x)}><RefreshCw size={13}/> Check payment</button>}</div></div>):<p className="muted">No transactions yet.</p>}</div></section>}
createRoot(document.getElementById("root")).render(<App/>);
