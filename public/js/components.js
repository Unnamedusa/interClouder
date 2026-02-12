/* ═══ interClouder v5.0 — Components ═══ */
const {useState,useEffect,useRef,useCallback}=React;

// ── Atoms ──
const Av=({src,name,size=32,status,onClick,anim,style={}})=>{
  const h=name?[...""+name].reduce((a,c)=>a+c.charCodeAt(0),0)%360:0;
  return(<div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",flexShrink:0,cursor:onClick?"pointer":"default",position:"relative",...style}} className={anim?"anim-avatar":""}>
    {src?<img src={src} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover"}} onError={e=>{e.target.style.display="none"}}/>
    :<div style={{width:size,height:size,borderRadius:"50%",background:`hsl(${h},55%,42%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.38,fontWeight:700,color:"#fff"}}>{(name||"?")[0].toUpperCase()}</div>}
    {status&&<div style={{position:"absolute",bottom:0,right:0,width:size*.28,height:size*.28,borderRadius:"50%",background:status==="online"?"var(--ok)":status==="idle"?"var(--wrn)":status==="dnd"?"var(--err)":"var(--txg)",border:"2px solid var(--bg2)"}}/>}
  </div>);
};

const Tg=({on,onChange})=><div className={`tg ${on?"on":"off"}`} onClick={()=>onChange(!on)}><div className="k"/></div>;
const Notify=({text})=>text?<div className="toast">{text}</div>:null;
const Bdg=({id,size=16})=>{const b=B[id];if(!b)return null;return<span title={b.l} style={{fontSize:size*.7,color:b.c}}>{b.i}</span>};
const MsgTag=({type})=>{
  const map={ia:{l:"IA",c:"#06D6A0"},mod:{l:"MOD",c:"#F59E0B"},announce:{l:"ANNOUNCE",c:"#818CF8"},system:{l:"SYSTEM",c:"#EF4444"},spoiler:{l:"SPOILER",c:"#6B7280"},file:{l:"FILE",c:"#14B8A6"},warning:{l:"⚠ WARN",c:"#F59E0B"}};
  const t=map[type];if(!t)return null;
  return <span className="mtag" style={{background:`${t.c}18`,color:t.c,border:`1px solid ${t.c}30`}}>{t.l}</span>;
};
const TagChip=({tag,srv})=>{
  if(!tag||!tag.acr)return null;
  const days=Math.floor((Date.now()-(srv?.created||Date.now()))/864e5);
  const c=TE.color(days,srv?.xp||0);
  return <span className="chip" style={{background:`${c}18`,color:c,border:`1px solid ${c}30`}}>[{tag.acr}]</span>;
};
const XPBar=({xp=0,max=1000,w=100})=><div style={{width:w,height:4,borderRadius:2,background:"var(--bdr)",overflow:"hidden"}}><div style={{width:`${Math.min(xp/max,1)*100}%`,height:"100%",borderRadius:2,background:"linear-gradient(90deg,var(--acc),var(--acl))",transition:".3s"}}/></div>;
const RepChip=({user})=>{const rep=REP.calc(user||{});const rl=REP.level(rep);return<span className="chip" style={{background:`${rl.c}18`,color:rl.c}}>{rl.i} {rl.n}</span>};

// ── Spoiler Wrapper ──
const SpoilerWrap=({children,mode="blur"})=>{
  const [revealed,setRevealed]=useState(false);
  if(mode==="block"&&!revealed)return<div className="spoiler-wrap" onClick={()=>setRevealed(true)}><div className="spoiler-block"><span style={{color:"var(--txm)",fontSize:11}}>🔒 Spoiler</span></div></div>;
  return<div className={`spoiler-wrap spoiler-blur ${revealed?"revealed":""}`} onClick={()=>setRevealed(!revealed)}>{children}{!revealed&&<span className="spoiler-label">SPOILER</span>}</div>;
};

// ── File Attachment Display ──
const FileAttach=({file,spoiler,spoilerMode})=>{
  const icons={"image":"🖼","video":"🎬","audio":"🎵","pdf":"📄","default":"📎"};
  const isImg=file.type&&file.type.startsWith("image/");
  const ico=isImg?"image":file.type?.startsWith("video/")?"video":file.type?.startsWith("audio/")?"audio":file.name?.endsWith(".pdf")?"pdf":"default";
  const inner=isImg?<img src={file.url||file.preview} style={{maxWidth:280,maxHeight:200,borderRadius:8,display:"block"}} onError={e=>{e.target.style.display="none"}}/>
    :<div className="file-attach"><span className="fi">{icons[ico]}</span><div><div className="fn">{file.name}</div><div className="fs">{file.size?Math.round(file.size/1024)+"KB":""}</div></div></div>;
  if(spoiler)return<SpoilerWrap mode={spoilerMode}>{inner}</SpoilerWrap>;
  return inner;
};

// ── CloudKids Age Gate ──
const AgeGate=({onPass,onFail})=>{
  const [step,setStep]=useState(0);// 0=intro,1=quiz,2=passed,3=failed
  const [qIdx,setQIdx]=useState([]);const [cur,setCur]=useState(0);const [score,setScore]=useState(0);
  const [timeLeft,setTimeLeft]=useState(CKIDS.timeLimit);const [fails,setFails]=useState(0);
  const [totalQ,setTotalQ]=useState(CKIDS.baseCount);

  const startQuiz=()=>{
    const indices=[];const pool=[...Array(CKIDS.questions.length).keys()];
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
    setQIdx(pool.slice(0,Math.min(totalQ,pool.length)));setCur(0);setScore(0);setTimeLeft(CKIDS.timeLimit);setStep(1);
  };

  useEffect(()=>{
    if(step!==1)return;
    const t=setInterval(()=>setTimeLeft(p=>{if(p<=1){clearInterval(t);setFails(f=>f+1);setTotalQ(q=>Math.min(q+CKIDS.penaltyAdd,CKIDS.maxCount));setStep(3);return 0}return p-1}),1000);
    return()=>clearInterval(t);
  },[step]);

  const answer=(idx)=>{
    const q=CKIDS.questions[qIdx[cur]];
    const correct=idx===q.a;
    const newScore=correct?score+1:score;
    if(cur+1>=qIdx.length){
      if(newScore>=Math.ceil(qIdx.length*0.8)){setStep(2);setTimeout(()=>onPass(),1200)}
      else{setFails(f=>f+1);setTotalQ(q=>Math.min(q+CKIDS.penaltyAdd,CKIDS.maxCount));setStep(3)}
    }else{setCur(cur+1);setScore(newScore)}
  };

  if(step===0)return(
    <div className="age-gate">
      <div style={{width:420,padding:32,borderRadius:22,background:"var(--bg2)",border:"1px solid var(--bdr)",boxShadow:"0 20px 60px rgba(0,0,0,.5)",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>🔐</div>
        <h1 style={{fontSize:20,fontWeight:800,background:"linear-gradient(135deg,var(--acc),var(--pk))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Age Verification</h1>
        <p style={{fontSize:11,color:"var(--txm)",margin:"8px 0 16px"}}>interClouder requires users to be 18+. Please answer {totalQ} questions to verify.</p>
        <div className="card" style={{textAlign:"left",marginBottom:14}}>
          <div style={{fontSize:10,color:"var(--txf)",lineHeight:1.6}}>
            ✓ {totalQ} questions about everyday adult knowledge<br/>
            ✓ {CKIDS.timeLimit} seconds time limit<br/>
            ✓ Need 80% correct to pass<br/>
            {fails>0&&<span style={{color:"var(--wrn)"}}>⚠ Failed {fails}× — {totalQ} questions this attempt</span>}
          </div>
        </div>
        <button className="btn bp" onClick={startQuiz} style={{width:"100%",padding:12,fontSize:14}}>Start Verification</button>
        <p style={{fontSize:8,color:"var(--txg)",marginTop:10}}>🔒 No personal information collected</p>
      </div>
    </div>
  );

  if(step===1){
    const q=CKIDS.questions[qIdx[cur]];
    return(
      <div className="age-gate">
        <div style={{width:460,padding:28,borderRadius:22,background:"var(--bg2)",border:"1px solid var(--bdr)",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:11,color:"var(--txm)"}}>Question {cur+1}/{qIdx.length}</span>
            <span style={{fontSize:12,fontWeight:700,color:timeLeft<15?"var(--err)":"var(--wrn)",fontFamily:"monospace"}}>{timeLeft}s</span>
          </div>
          <div style={{display:"flex",gap:3,marginBottom:14}}>{qIdx.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<cur?"var(--ok)":i===cur?"var(--acc)":"var(--bdr)"}}/>)}</div>
          <h3 style={{fontSize:14,fontWeight:700,color:"var(--tx)",marginBottom:14,lineHeight:1.5}}>{q.q}</h3>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {q.opts.map((o,i)=><button key={i} className="btn bs" onClick={()=>answer(i)} style={{textAlign:"left",padding:12,fontSize:12}}>{o}</button>)}
          </div>
        </div>
      </div>
    );
  }

  if(step===2)return(
    <div className="age-gate"><div style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:48}}>✅</div>
      <h2 style={{fontSize:18,fontWeight:800,color:"var(--ok)",marginTop:8}}>Verified!</h2>
      <p style={{fontSize:11,color:"var(--txm)",marginTop:4}}>Welcome to interClouder</p>
    </div></div>
  );

  return(
    <div className="age-gate">
      <div style={{width:380,padding:32,borderRadius:22,background:"var(--bg2)",border:"1px solid var(--bdr)",textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>❌</div>
        <h2 style={{fontSize:16,fontWeight:800,color:"var(--err)"}}>Verification Failed</h2>
        <p style={{fontSize:11,color:"var(--txm)",margin:"8px 0 16px"}}>You'll need to answer {totalQ} questions next time (+{CKIDS.penaltyAdd} penalty).</p>
        <button className="btn bp" onClick={startQuiz} style={{width:"100%"}}>Try Again ({totalQ} questions)</button>
      </div>
    </div>
  );
};

// ── Update Splash ──
const Splash=({update,onClose})=>(
  <div className="splash" onClick={onClose}>
    <div className="splash-card" onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:48,marginBottom:12}}>🚀</div>
      <h1 style={{fontSize:22,fontWeight:800,background:"linear-gradient(135deg,var(--acc),var(--pk))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4}}>{update.title}</h1>
      <p style={{fontSize:12,color:"var(--txf)",marginBottom:16}}>What's new:</p>
      <div style={{textAlign:"left",maxWidth:400,margin:"0 auto"}}>
        {update.changes.map((c,i)=><div key={i} style={{fontSize:11,color:"var(--tx2)",padding:"3px 0",borderBottom:"1px solid var(--bdr)"}}>{c}</div>)}
      </div>
      <button className="btn bp" onClick={onClose} style={{marginTop:20,width:"100%",padding:12,fontSize:14}}>Let's Go!</button>
    </div>
  </div>
);

// ── Payment Modal ──
const PaymentModal=({tier,onClose,onPurchase,notify,isGift,giftTarget})=>{
  const [step,setStep]=useState(1);const [card,setCard]=useState("");const [exp,setExp]=useState("");const [cvc,setCvc]=useState("");const [name,setName]=useState("");const [proc,setProc]=useState(false);
  const t=P[tier];if(!t)return null;
  const pay=()=>{
    if(!card||!exp||!cvc||!name){notify("Fill all fields");return}
    if(card.replace(/\s/g,"").length<16){notify("Invalid card");return}
    setProc(true);setTimeout(()=>{setProc(false);setStep(3);onPurchase(tier,isGift?giftTarget:null)},2000);
  };
  return(
    <div className="modal" onClick={onClose}><div className="mcard" onClick={e=>e.stopPropagation()} style={{width:400,padding:24}}>
      {step===1&&<div style={{textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:8}}>{isGift?"🎁":"✨"}</div>
        <h2 style={{fontSize:20,fontWeight:800,color:t.c}}>{isGift?`Gift ${t.n}`:t.n}</h2>
        {isGift&&<p style={{fontSize:11,color:"var(--txm)",marginBottom:4}}>Gift to: {giftTarget}</p>}
        <div style={{fontSize:24,fontWeight:800,margin:"8px 0"}}>${t.p.toFixed(2)}<span style={{fontSize:12,color:"var(--txm)"}}>/month</span></div>
        {t.perks.map(p=><div key={p} style={{fontSize:11,color:"var(--tx2)",padding:"2px 0"}}>✓ {p}</div>)}
        <button className="btn bp" onClick={()=>setStep(2)} style={{width:"100%",marginTop:14,padding:10,background:`linear-gradient(135deg,${t.c},${t.c}88)`}}>Subscribe — ${t.p.toFixed(2)}/mo</button>
        <button className="btn bs" onClick={onClose} style={{width:"100%",marginTop:6}}>Cancel</button>
      </div>}
      {step===2&&<div>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:12}}>Payment Details</h3>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <input className="li" placeholder="Name on card" value={name} onChange={e=>setName(e.target.value)}/>
          <input className="li" placeholder="XXXX XXXX XXXX XXXX" value={card} onChange={e=>{let v=e.target.value.replace(/\D/g,"").substring(0,16);v=v.replace(/(.{4})/g,"$1 ").trim();setCard(v)}} maxLength={19}/>
          <div style={{display:"flex",gap:8}}>
            <input className="li" placeholder="MM/YY" value={exp} onChange={e=>{let v=e.target.value.replace(/\D/g,"").substring(0,4);if(v.length>2)v=v.substring(0,2)+"/"+v.substring(2);setExp(v)}} maxLength={5} style={{flex:1}}/>
            <input className="li" placeholder="CVC" value={cvc} onChange={e=>setCvc(e.target.value.replace(/\D/g,"").substring(0,4))} maxLength={4} type="password" style={{width:80}}/>
          </div>
        </div>
        <button className="btn bp" onClick={pay} disabled={proc} style={{width:"100%",marginTop:12,padding:10,background:proc?"var(--txg)":`linear-gradient(135deg,${t.c},${t.c}88)`}}>{proc?"Processing...":"Pay $"+t.p.toFixed(2)}</button>
        <button className="btn bs" onClick={()=>setStep(1)} style={{width:"100%",marginTop:6}}>← Back</button>
        <p style={{fontSize:9,color:"var(--txg)",textAlign:"center",marginTop:8}}>🔒 Secured by 5-Phase Encryption</p>
      </div>}
      {step===3&&<div style={{textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>🎉</div>
        <h2 style={{fontSize:20,fontWeight:800,color:t.c}}>{isGift?`${t.n} Gifted!`:`Welcome to ${t.n}!`}</h2>
        <button className="btn bp" onClick={onClose} style={{width:"100%",marginTop:12,background:`linear-gradient(135deg,${t.c},${t.c}88)`}}>Done</button>
      </div>}
    </div></div>
  );
};

// ── Test Account Creator ──
const TestAccCreator=({onClose,onCreate,notify})=>{
  const [uname,setUname]=useState("");const [dname,setDname]=useState("");const [role,setRole]=useState("member");const [isPerm,setIsPerm]=useState(true);const [dur,setDur]=useState("1h");
  const create=()=>{
    if(!uname.trim()){notify("Username required");return}
    onCreate({id:"test_"+Date.now().toString(36),username:uname.trim(),display:dname.trim()||uname.trim(),role,status:"online",xp:0,msgs:0,strikes:0,badges:[],isTest:true,isPerm,tempDur:isPerm?null:dur,created:Date.now(),avatar:null,banner:null,animAvatar:false,animBanner:false,serverTags:[],premium:null,customBadges:[],blocked:[],ignored:[],censored:false,reports:0});
    notify(`Test "${uname}" created`);setUname("");setDname("");
  };
  return(
    <div className="modal" onClick={onClose}><div className="mcard" onClick={e=>e.stopPropagation()} style={{width:380,padding:24}}>
      <h2 style={{fontSize:18,fontWeight:800,color:"var(--gld)",marginBottom:12}}>👑 Test Account Creator</h2>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        <input className="li" placeholder="Username" value={uname} onChange={e=>setUname(e.target.value)}/>
        <input className="li" placeholder="Display Name (optional)" value={dname} onChange={e=>setDname(e.target.value)}/>
        <select className="li" value={role} onChange={e=>setRole(e.target.value)}>{Object.entries(R).filter(([k])=>k!=="ceo").map(([k,r])=><option key={k} value={k}>{r.i} {r.n}</option>)}</select>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:12,color:"var(--tx2)"}}>Permanent</span><Tg on={isPerm} onChange={setIsPerm}/></div>
        {!isPerm&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{["1h","6h","24h","3d","7d"].map(d=><button key={d} className={`tab ${dur===d?"on":"off"}`} onClick={()=>setDur(d)}>{d}</button>)}</div>}
        <button className="btn bp" onClick={create}>Create</button>
      </div>
    </div></div>
  );
};

// ── Login Screen ──
const LoginScreen=({onLogin})=>{
  const [mode,setMode]=useState("login");
  const [u,setU]=useState("");const [d,setD]=useState("");const [e,setE]=useState("");const [p,setP]=useState("");const [err,setErr]=useState("");
  const go=()=>{
    if(mode==="register"){if(!u.trim()||!d.trim()||!e.trim()||!p.trim()){setErr("All fields required");return}if(u.length<3||u.length>20){setErr("Username: 3-20 chars");return}}
    else{if(!u.trim()||!p.trim()){setErr("Username & password required");return}}
    onLogin({id:"me",username:u.trim(),display:d.trim()||u.trim(),email:e,avatar:null,banner:null,animAvatar:false,animBanner:false,badges:["founder"],role:"ceo",status:"online",xp:0,msgs:0,strikes:0,reports:0,premium:null,isMe:true,serverTags:[],customBadges:[],blocked:[],ignored:[],censored:false,created:Date.now(),password:p,twoFA:false,customRoleIcon:null});
  };
  return(
    <div className="login-bg">
      <div style={{width:360,padding:32,borderRadius:22,background:"var(--bg2)",border:"1px solid var(--bdr)",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <svg viewBox="0 0 100 100" style={{width:42,height:42,marginBottom:6}}><polygon points="50,12 88,30 50,48 12,30" fill="#C084FC"/><polygon points="12,30 50,48 50,86 12,68" fill="#8B5CF6"/><polygon points="50,48 88,30 88,68 50,86" fill="#A855F7"/></svg>
          <h1 style={{fontSize:22,fontWeight:800,background:"linear-gradient(135deg,var(--acc),var(--pk))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>interClouder</h1>
          <p style={{fontSize:11,color:"var(--txf)",marginTop:3}}>The Secure Social Network</p>
        </div>
        <div style={{display:"flex",gap:4,marginBottom:12}}>{["login","register"].map(m=><button key={m} className={`tab ${mode===m?"on":"off"}`} onClick={()=>{setMode(m);setErr("")}} style={{flex:1,textTransform:"capitalize"}}>{m}</button>)}</div>
        {err&&<div style={{padding:"6px 10px",borderRadius:7,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"var(--err)",fontSize:11,marginBottom:10}}>{err}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <input className="li" placeholder="Username" value={u} onChange={ev=>setU(ev.target.value)} onKeyDown={ev=>ev.key==="Enter"&&go()}/>
          {mode==="register"&&<input className="li" placeholder="Display Name" value={d} onChange={ev=>setD(ev.target.value)}/>}
          {mode==="register"&&<input className="li" placeholder="Email" value={e} onChange={ev=>setE(ev.target.value)} type="email"/>}
          <input className="li" placeholder="Password" value={p} onChange={ev=>setP(ev.target.value)} type="password" onKeyDown={ev=>ev.key==="Enter"&&go()}/>
          <button className="btn bp" onClick={go} style={{width:"100%",padding:10,fontSize:13,marginTop:2}}>{mode==="register"?"Create Account":"Login"}</button>
        </div>
        <p style={{fontSize:9,color:"var(--txg)",textAlign:"center",marginTop:12}}>🔒 {ENC.join(" → ")}</p>
      </div>
    </div>
  );
};

// ── Server Creator ──
const ServerCreator=({onClose,onCreate,notify})=>{
  const [mode,setMode]=useState(null);const [step,setStep]=useState(0);
  const [name,setName]=useState("");const [acr,setAcr]=useState("");const [icon,setIcon]=useState("");
  const [tpl,setTpl]=useState(null);const [dur,setDur]=useState("24h");
  const [tch,setTch]=useState(["general"]);const [vch,setVch]=useState(["Voice"]);
  const [ntc,setNtc]=useState("");const [nvc,setNvc]=useState("");
  const [roles,setRoles]=useState([]);const [nr,setNr]=useState("");const [rc,setRc]=useState("#A855F7");
  const [isPublic,setIsPublic]=useState(true);
  const [srvBadge,setSrvBadge]=useState("");const [srvBadgeImg,setSrvBadgeImg]=useState("");
  const [customTheme,setCustomTheme]=useState("");const [tc1,setTc1]=useState("#A855F7");const [tc2,setTc2]=useState("#F472B6");
  const [bannerUrl,setBannerUrl]=useState("");
  const cls=["#A855F7","#EF4444","#06D6A0","#FBBF24","#F472B6","#818CF8","#F43F5E","#14B8A6","#6366F1","#D946EF"];
  const pickTpl=t=>{setTpl(t.id);setName(t.n+" Server");setTch([...t.tc]);setVch([...t.vc]);setRoles(t.rl.map(r=>({...r})));setAcr(t.n.substring(0,3).toUpperCase());setStep(2)};
  const create=()=>{
    if(!name.trim()){notify("Name required!");return}if(!acr.trim()||acr.length>6){notify("Tag: 1-6 chars!");return}
    const id="s"+Date.now().toString(36);
    onCreate({id,name:name.trim(),tag:{acr:acr.trim().toUpperCase()},icon:icon||name.substring(0,2).toUpperCase(),color:rc,members:[],boostLv:0,xp:0,created:Date.now(),isTemp:mode==="temporary",tempDur:mode==="temporary"?dur:null,isPublic,
      channels:tch.map((c,i)=>({id:id+"c"+i,name:c,type:"text",slowmode:0,msgs:[]})),
      vChannels:vch.map((c,i)=>({id:id+"v"+i,name:c,type:"voice",users:[]})),
      roles:[{n:"Owner",c:"#FFD700"},{n:"Admin",c:"#EF4444"},{n:"Mod",c:"#06D6A0"},...roles,{n:"Member",c:"#818CF8"}],
      plugins:{},bots:{},bans:[],strikes:[],
      badge:srvBadgeImg?{name:srvBadge||name.trim(),img:srvBadgeImg}:srvBadge?{name:srvBadge,img:null}:null,
      customTheme:customTheme?{name:customTheme,c1:tc1,c2:tc2}:null,banner:bannerUrl||null,earlyServer:false});
    onClose();notify(`"${name}" created!${mode==="temporary"?" (expires "+dur+")":""}`);
  };

  if(!mode)return(
    <div className="modal" onClick={onClose}><div className="mcard" onClick={e=>e.stopPropagation()} style={{width:420,padding:24}}>
      <h2 style={{fontSize:18,fontWeight:800,marginBottom:16}}>Create Server</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[["template","📋","From Template","Pre-configured channels & roles","var(--acc)"],["temporary","⏱","Temporary","Auto-deletes — events & temp groups","var(--wrn)"]].map(([m,ic,n,d,c])=>
          <div key={m} onClick={()=>{setMode(m);setStep(1)}} className="card" style={{cursor:"pointer",textAlign:"center",transition:".2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=c} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--bdr)"}>
            <div style={{fontSize:36,marginBottom:6}}>{ic}</div><div style={{fontSize:14,fontWeight:700}}>{n}</div><p style={{fontSize:10,color:"var(--txm)",marginTop:3}}>{d}</p>
          </div>)}
      </div>
    </div></div>
  );

  return(
    <div className="modal" onClick={onClose}><div className="mcard" onClick={e=>e.stopPropagation()} style={{width:460,padding:24,maxHeight:"88vh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
        <h2 style={{fontSize:16,fontWeight:800}}>{mode==="template"?"Template":"Temporary"} Server</h2>
        {mode==="temporary"&&<span className="chip" style={{background:"#FBBF2418",color:"var(--wrn)"}}>⏱ TEMP</span>}
      </div>
      <div style={{display:"flex",gap:3,marginBottom:14}}>{[1,2,3,4].map(s=><div key={s} style={{flex:1,height:3,borderRadius:2,background:s<=step?"var(--acc)":"var(--bdr)"}}/>)}</div>

      {step===1&&mode==="template"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>{TPL.map(t=><div key={t.id} onClick={()=>pickTpl(t)} className="card" style={{cursor:"pointer",textAlign:"center",borderColor:tpl===t.id?"var(--acc)":"var(--bdr)"}}>
        <div style={{fontSize:22}}>{t.i}</div><div style={{fontSize:11,fontWeight:700,color:tpl===t.id?"var(--acl)":"var(--tx2)",marginTop:3}}>{t.n}</div>
      </div>)}</div>}

      {step===1&&mode==="temporary"&&<div>
        <div className="sl">Duration</div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>{["1h","6h","24h","3d","7d","30d"].map(d2=><button key={d2} className={`tab ${dur===d2?"on":"off"}`} onClick={()=>setDur(d2)}>{d2}</button>)}</div>
        <button className="btn bp" onClick={()=>setStep(2)} style={{width:"100%"}}>Next →</button>
      </div>}

      {step===2&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div><div className="sl">Server Name</div><input className="li" value={name} onChange={e=>{setName(e.target.value);if(!acr||acr===name.substring(0,3).toUpperCase())setAcr(e.target.value.substring(0,3).toUpperCase())}}/></div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1}}><div className="sl">Tag (1-6 chars)</div><input className="li" value={acr} onChange={e=>setAcr(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").substring(0,6))} maxLength={6} style={{textTransform:"uppercase",letterSpacing:2,fontWeight:800}}/></div>
          <div><div className="sl">Icon</div><input className="li" value={icon} onChange={e=>setIcon(e.target.value.substring(0,2))} maxLength={2} style={{width:60,textAlign:"center"}}/></div>
        </div>
        <div><div className="sl">Color</div><div style={{display:"flex",gap:5}}>{cls.map(c=><div key={c} onClick={()=>setRc(c)} style={{width:24,height:24,borderRadius:7,background:c,cursor:"pointer",border:rc===c?"2px solid #fff":"2px solid transparent"}}/>)}</div></div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:12,color:"var(--tx2)"}}>Public server</span><Tg on={isPublic} onChange={setIsPublic}/></div>
        <div><div className="sl">Text Channels</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:5}}>{tch.map((c,i)=><span key={i} className="chip" style={{background:"var(--bg3)",color:"var(--tx2)"}}>#{c}<span onClick={()=>setTch(p=>p.filter((_,j)=>j!==i))} style={{cursor:"pointer",marginLeft:3,color:"var(--txg)"}}>×</span></span>)}</div>
          <div style={{display:"flex",gap:4}}><input className="li" value={ntc} onChange={e=>setNtc(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&ntc.trim()){setTch(p=>[...p,ntc.trim().toLowerCase().replace(/\s+/g,"-")]);setNtc("")}}} placeholder="Add channel..." style={{flex:1}}/><button className="btn bs" onClick={()=>{if(ntc.trim()){setTch(p=>[...p,ntc.trim().toLowerCase().replace(/\s+/g,"-")]);setNtc("")}}}>+</button></div>
        </div>
        <div><div className="sl">Voice Channels</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:5}}>{vch.map((c,i)=><span key={i} className="chip" style={{background:"var(--bg3)",color:"var(--tx2)"}}>🔊{c}<span onClick={()=>setVch(p=>p.filter((_,j)=>j!==i))} style={{cursor:"pointer",marginLeft:3,color:"var(--txg)"}}>×</span></span>)}</div>
          <div style={{display:"flex",gap:4}}><input className="li" value={nvc} onChange={e=>setNvc(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nvc.trim()){setVch(p=>[...p,nvc.trim()]);setNvc("")}}} placeholder="Add voice..." style={{flex:1}}/><button className="btn bs" onClick={()=>{if(nvc.trim()){setVch(p=>[...p,nvc.trim()]);setNvc("")}}}>+</button></div>
        </div>
        <div style={{display:"flex",gap:6}}><button className="btn bs" onClick={()=>setStep(1)}>←</button><button className="btn bp" onClick={()=>setStep(3)} style={{flex:1}}>Next →</button></div>
      </div>}

      {step===3&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div className="sl">Custom Roles</div>
        {roles.map((r,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:6,borderRadius:7,background:"var(--bg3)",border:"1px solid var(--bdr)"}}><div style={{width:10,height:10,borderRadius:5,background:r.c}}/><span style={{fontSize:12,fontWeight:600,color:r.c,flex:1}}>{r.n}</span><span onClick={()=>setRoles(p=>p.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:"var(--txg)"}}>×</span></div>)}
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <input className="li" value={nr} onChange={e=>setNr(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nr.trim()){setRoles(p=>[...p,{n:nr.trim(),c:rc}]);setNr("")}}} placeholder="Role name..." style={{flex:1}}/>
          <button className="btn bs" onClick={()=>{if(nr.trim()){setRoles(p=>[...p,{n:nr.trim(),c:rc}]);setNr("")}}}>+</button>
        </div>
        <div className="sl">Server Badge (optional)</div>
        <div style={{display:"flex",gap:4}}><input className="li" value={srvBadge} onChange={e=>setSrvBadge(e.target.value)} placeholder="Badge name..." style={{flex:1}}/><input className="li" value={srvBadgeImg} onChange={e=>setSrvBadgeImg(e.target.value)} placeholder="Image URL" style={{flex:1}}/></div>
        <div className="sl">Server Banner URL (optional)</div>
        <input className="li" value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} placeholder="https://..."/>
        <div style={{display:"flex",gap:6}}><button className="btn bs" onClick={()=>setStep(2)}>←</button><button className="btn bp" onClick={()=>setStep(4)} style={{flex:1}}>Next →</button></div>
      </div>}

      {step===4&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div className="sl">Custom Theme (optional)</div>
        <input className="li" value={customTheme} onChange={e=>setCustomTheme(e.target.value)} placeholder="Theme name..."/>
        {customTheme&&<div style={{display:"flex",gap:8}}>
          <div style={{flex:1}}><div style={{fontSize:10,color:"var(--txf)"}}>Primary</div><div style={{display:"flex",gap:3,marginTop:3}}>{cls.slice(0,5).map(c=><div key={c} onClick={()=>setTc1(c)} style={{width:22,height:22,borderRadius:6,background:c,cursor:"pointer",border:tc1===c?"2px solid #fff":"2px solid transparent"}}/>)}</div></div>
          <div style={{flex:1}}><div style={{fontSize:10,color:"var(--txf)"}}>Accent</div><div style={{display:"flex",gap:3,marginTop:3}}>{cls.slice(5).map(c=><div key={c} onClick={()=>setTc2(c)} style={{width:22,height:22,borderRadius:6,background:c,cursor:"pointer",border:tc2===c?"2px solid #fff":"2px solid transparent"}}/>)}</div></div>
        </div>}
        {customTheme&&<div style={{height:30,borderRadius:8,background:`linear-gradient(135deg,${tc1},${tc2})`}}/>}
        <div className="card" style={{background:"var(--bg3)"}}>
          <div style={{fontSize:10,fontWeight:700,color:"var(--txg)",textTransform:"uppercase",marginBottom:5}}>Summary</div>
          <div style={{fontSize:12,color:"var(--txm)",lineHeight:1.7}}>
            <div>📛 <b style={{color:"var(--tx)"}}>{name||"?"}</b> <span className="chip" style={{background:`${rc}18`,color:rc}}>[{acr||"?"}]</span> {isPublic?"🌐 Public":"🔒 Private"}</div>
            <div>📁 {tch.length} text + {vch.length} voice · 🎭 {roles.length+4} roles</div>
            {srvBadge&&<div>🏷 Badge: {srvBadge}</div>}{customTheme&&<div>🎨 {customTheme}</div>}{mode==="temporary"&&<div>⏱ Expires: {dur}</div>}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}><button className="btn bs" onClick={()=>setStep(3)}>←</button><button className="btn bp" onClick={create} style={{flex:1}}>Create Server</button></div>
      </div>}
    </div></div>
  );
};

// ── Confirm Modal (generic) ──
const ConfirmModal=({title,text,onConfirm,onCancel,danger})=>(
  <div className="modal" onClick={onCancel}><div className="mcard" onClick={e=>e.stopPropagation()} style={{width:340,padding:24,textAlign:"center"}}>
    <div style={{fontSize:36,marginBottom:8}}>{danger?"⚠":"❓"}</div>
    <h2 style={{fontSize:16,fontWeight:800,marginBottom:4}}>{title}</h2>
    <p style={{fontSize:12,color:"var(--txm)",marginBottom:16}}>{text}</p>
    <div style={{display:"flex",gap:8}}>
      <button className="btn bs" onClick={onCancel} style={{flex:1}}>Cancel</button>
      <button className="btn" onClick={onConfirm} style={{flex:1,background:danger?"rgba(239,68,68,.12)":"var(--acc)",color:danger?"var(--err)":"#fff",border:danger?"1px solid rgba(239,68,68,.25)":"none",fontWeight:700}}>{danger?"Confirm":"OK"}</button>
    </div>
  </div></div>
);
console.log('[IC] components.js ready');
