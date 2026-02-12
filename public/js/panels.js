/* ═══ interClouder v5.0 — Panels ═══ */

// ── Chat with file attachments, spoilers, keyboard shortcuts, CloudKids filter ──
const Chat=({ch,msgs,onSend,onReact,user,notify,settings,onEditMsg,onDeleteMsg,onBlock,onIgnore})=>{
  const [text,setText]=useState("");const [emo,setEmo]=useState(null);const ref=useRef(null);
  const [fileP,setFileP]=useState(null);const [isSpoiler,setIsSpoiler]=useState(false);const [editing,setEditing]=useState(null);
  const emojis=["👍","❤️","😂","🔥","💜","👀","🎉","💯","😮","🙏"];
  const ckMode=settings?.cloudKids?.enabled?settings.cloudKids.filterMode:null;
  const spMode=settings?.spoilerMode||"blur";
  const ignored=settings?.ignored||[];const blocked=settings?.blocked||[];
  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs]);

  const send=()=>{
    if(!text.trim()&&!fileP)return;
    if(editing){onEditMsg(editing,text.trim());setEditing(null);setText("");return}
    onSend(text.trim(),fileP?{...fileP,spoiler:isSpoiler}:null);setText("");setFileP(null);setIsSpoiler(false);
  };

  const handleFile=(e)=>{
    const file=e.target.files[0];if(!file)return;
    const maxUp=(user.premium?P[user.premium]?.unlocks?.maxUpload:50)*1024*1024;
    const secCheck=FSEC.check(file.name,file.size,maxUp);
    if(!secCheck.ok){notify("🚫 "+secCheck.reason);return}
    const scanCheck=FSEC.scanContent(file.name);
    if(!scanCheck.safe){notify("🚨 "+scanCheck.reason+" — File blocked");return}
    if(secCheck.warn)notify("⚠ "+secCheck.reason);
    const reader=new FileReader();
    reader.onload=()=>setFileP({name:file.name,size:file.size,type:file.type,preview:reader.result,url:reader.result});
    if(file.type.startsWith("image/")||file.type.startsWith("video/"))reader.readAsDataURL(file);
    else{setFileP({name:file.name,size:file.size,type:file.type,preview:null,url:null})}
  };

  const handleKey=(e)=>{
    if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}
    if(e.key==="ArrowUp"&&e.shiftKey&&!text){
      const myMsgs=(msgs||[]).filter(m=>m.uid===user.id);
      if(myMsgs.length){const last=myMsgs[myMsgs.length-1];setEditing(last.id);setText(last.text)}
    }
    if(e.key==="Delete"&&!text){
      const myMsgs=(msgs||[]).filter(m=>m.uid===user.id);
      if(myMsgs.length&&onDeleteMsg){onDeleteMsg(myMsgs[myMsgs.length-1].id);notify("Message deleted")}
    }
    if(e.key==="Escape"){setEditing(null);setText("");setFileP(null)}
  };

  const sm=ch?.slowmode||0;
  const renderText=(text)=>{
    if(ckMode)return<span dangerouslySetInnerHTML={{__html:CKIDS.filterText(text,ckMode)}}/>;
    return text;
  };

  const [ctxMsg,setCtxMsg]=useState(null);

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <div ref={ref} style={{flex:1,overflowY:"auto",padding:"6px 0"}}>
        {(!msgs||!msgs.length)&&<div style={{textAlign:"center",padding:50,color:"var(--txg)"}}><div style={{fontSize:36,marginBottom:8}}>💬</div><div style={{fontSize:15,fontWeight:700,color:"var(--txm)"}}>#{ch?.name||"channel"}</div><p style={{fontSize:11,marginTop:3}}>Start the conversation!</p></div>}
        {(msgs||[]).map(m=>{
          if(ignored.includes(m.uid))return null;
          const isBlocked=blocked.includes(m.uid);
          const [showBlocked,setShowBlocked]=useState(false);
          return(
            <div key={m.id} className="msg" onContextMenu={e=>{e.preventDefault();setCtxMsg(ctxMsg===m.id?null:m.id)}}>
              <Av name={m.user} size={34}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:12,fontWeight:700,...(m.gradient?{background:`linear-gradient(90deg,${m.gradient.c1},${m.gradient.c2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}:{color:m.color||"var(--tx)"})}}>{m.user}</span>
                  {m.roleIcon&&<span style={{fontSize:10}}>{m.roleIcon}</span>}
                  {m.tag&&<MsgTag type={m.tag}/>}
                  <span style={{fontSize:9,color:"var(--txg)"}}>{m.time}</span>
                  {m.edited&&<span style={{fontSize:8,color:"var(--txg)"}}>(edited)</span>}
                  {m.uid!==user.id&&<RepChip user={{xp:m.xp||0,msgs:m.msgs||0,strikes:m.strikes||0,badges:m.badges||[],created:m.created||Date.now()}}/>}
                </div>
                {isBlocked&&!showBlocked?<div style={{fontSize:11,color:"var(--txg)",fontStyle:"italic",cursor:"pointer"}} onClick={()=>setShowBlocked(true)}>Blocked message — click to reveal</div>
                :<div style={{fontSize:13,color:"var(--tx2)",marginTop:2,wordBreak:"break-word"}}>{renderText(m.text)}</div>}
                {m.file&&<div style={{marginTop:4}}><FileAttach file={m.file} spoiler={m.file.spoiler} spoilerMode={spMode}/></div>}
                <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:3}}>
                  {(m.reactions||[]).map((r,i)=><span key={i} className={`rx ${r.me?"me":""}`} onClick={()=>onReact(m.id,r.emoji)}>{r.emoji} {r.count}</span>)}
                  <span style={{position:"relative"}}><span className="rx" onClick={()=>setEmo(emo===m.id?null:m.id)} style={{opacity:.4}}>+</span>
                    {emo===m.id&&<div style={{position:"absolute",bottom:"100%",left:0,padding:4,borderRadius:8,background:"var(--bg2)",border:"1px solid var(--bdr)",display:"flex",gap:1,zIndex:10,boxShadow:"0 4px 12px rgba(0,0,0,.3)"}}>
                      {emojis.map(e=><span key={e} onClick={()=>{onReact(m.id,e);setEmo(null)}} style={{cursor:"pointer",fontSize:15,padding:2,borderRadius:3}} onMouseEnter={ev=>ev.currentTarget.style.background="var(--bga)"} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>{e}</span>)}
                    </div>}
                  </span>
                </div>
                {/* Context actions */}
                {ctxMsg===m.id&&m.uid!==user.id&&<div style={{display:"flex",gap:3,marginTop:4}}>
                  <button className="btn bs" onClick={()=>{onBlock(m.uid);setCtxMsg(null);notify("User blocked")}} style={{fontSize:8,padding:"2px 6px"}}>🚫 Block</button>
                  <button className="btn bs" onClick={()=>{onIgnore(m.uid);setCtxMsg(null);notify("User ignored")}} style={{fontSize:8,padding:"2px 6px"}}>👁‍🗨 Ignore</button>
                </div>}
              </div>
            </div>
          );
        })}
      </div>
      {/* File preview */}
      {fileP&&<div style={{padding:"6px 16px",borderTop:"1px solid var(--bdr)",background:"var(--bg2)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div className="file-attach" style={{flex:1}}>
            <span className="fi">{fileP.type?.startsWith("image/")?"🖼":"📎"}</span>
            <div style={{flex:1}}><div className="fn">{fileP.name}</div><div className="fs">{Math.round(fileP.size/1024)} KB</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:10,color:"var(--txm)"}}>Spoiler</span><Tg on={isSpoiler} onChange={setIsSpoiler}/>
            <span onClick={()=>setFileP(null)} style={{cursor:"pointer",color:"var(--txg)",fontSize:14}}>×</span>
          </div>
        </div>
      </div>}
      {editing&&<div style={{padding:"4px 16px",background:"rgba(168,85,247,.06)",borderTop:"1px solid var(--acc)",display:"flex",alignItems:"center",gap:6"}}>
        <span style={{fontSize:10,color:"var(--acl)"}}>✏ Editing</span><span onClick={()=>{setEditing(null);setText("")}} style={{cursor:"pointer",fontSize:10,color:"var(--txg)"}}>Cancel</span>
      </div>}
      <div className="inp">
        <label style={{cursor:"pointer",fontSize:16,color:"var(--txg)"}}>📎<input type="file" onChange={handleFile} style={{display:"none"}}/></label>
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={handleKey} placeholder={sm>0?`⏱ ${smL(sm)} — #${ch?.name||""}...`:`Message #${ch?.name||""}...`}/>
        <button className="btn bp" onClick={send} style={{padding:"7px 12px"}}>↑</button>
      </div>
    </div>
  );
};

// ── Profile Modal with block/ignore/censor ──
const ProfileModal=({user,onClose,notify,isOwner,onEditUser,onBlock,onIgnore,onCensor,isMod})=>{
  const [edit,setEdit]=useState(false);
  const [eD,setED]=useState(user?.display||"");const [eU,setEU]=useState(user?.username||"");
  const [eAv,setEAv]=useState(user?.avatar||"");const [eBn,setEBn]=useState(user?.banner||"");
  const [eSt,setESt]=useState(user?.status||"online");const [eG1,setEG1]=useState(user?.gradient?.c1||"");const [eG2,setEG2]=useState(user?.gradient?.c2||"");
  const [eRI,setERI]=useState(user?.customRoleIcon||"");
  const r=R[user?.role]||R.cloud;
  const canEdit=user?.isMe||isOwner;const canGr=user?.premium&&P[user.premium]?.unlocks?.gradient;
  const canBn=user?.premium&&P[user.premium]?.unlocks?.customBanner;
  const rep=REP.calc(user||{});const rl=REP.level(rep);

  const save=()=>{
    if(!onEditUser)return;const ch={};
    if(eD.trim()&&eD!==user.display)ch.display=eD.trim();
    if(eU.trim()&&eU!==user.username)ch.username=eU.trim();
    if(eAv!==(user.avatar||""))ch.avatar=eAv.trim()||null;
    if(eSt!==user.status)ch.status=eSt;
    if(canBn&&eBn!==(user.banner||""))ch.banner=eBn.trim()||null;
    if(canGr&&eG1&&eG2)ch.gradient={c1:eG1,c2:eG2};
    if(eRI!==user.customRoleIcon)ch.customRoleIcon=eRI.trim()||null;
    if(Object.keys(ch).length){onEditUser(user.isMe?"me":user.id,ch);notify("Saved!")}
    setEdit(false);
  };

  return(
    <div className="modal" onClick={onClose}><div className="mcard" onClick={e=>e.stopPropagation()} style={{width:380,padding:0,overflow:"hidden"}}>
      {user?.censored&&<div style={{padding:"6px 12px",background:"rgba(239,68,68,.08)",textAlign:"center"}}><span style={{fontSize:10,fontWeight:700,color:"var(--err)"}}>⚠ Profile censored by moderation</span></div>}
      <div style={{height:80,background:user?.banner&&!user.censored?`url(${user.banner}) center/cover`:`linear-gradient(135deg,${r.c}44,${r.c}22)`}}/>
      <div style={{padding:"0 20px 20px",marginTop:-30}}>
        <div style={{display:"flex",alignItems:"flex-end",gap:10}}>
          <Av name={user?.display} src={user?.censored?null:user?.avatar} size={56} status={user?.status} anim={user?.animAvatar}/>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:16,fontWeight:800,...(user?.gradient&&!user.censored?{background:`linear-gradient(90deg,${user.gradient.c1},${user.gradient.c2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}:{color:r.c})}}>{user?.display}</span>
              {user?.customRoleIcon&&<span style={{fontSize:12}}>{user.customRoleIcon}</span>}
            </div>
            <div style={{fontSize:10,color:"var(--txm)"}}>@{user?.username} · {r.i} {r.n}</div>
          </div>
          {canEdit&&!edit&&<button className="btn bs" onClick={()=>setEdit(true)} style={{fontSize:10}}>✏</button>}
        </div>

        {/* Badges */}
        <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:8}}>
          {(user?.badges||[]).map((bid,i)=>{const b=B[bid];return b?<span key={i} className="chip" style={{background:`${b.c}18`,color:b.c}}>{b.i} {b.l}</span>:null})}
        </div>

        {/* XP & Rep */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}><span style={{fontSize:9,color:"var(--txg)"}}>XP</span><XPBar xp={user?.xp||0} w={120}/><span style={{fontSize:9,color:"var(--txm)",fontFamily:"monospace"}}>{user?.xp||0}</span></div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
          <span style={{fontSize:9,color:"var(--txg)"}}>Rep</span>
          <div style={{width:120,height:4,borderRadius:2,background:"var(--bdr)",overflow:"hidden"}}><div style={{width:`${Math.min(Math.max(rep,0)/500*100,100)}%`,height:"100%",borderRadius:2,background:rl.c}}/></div>
          <RepChip user={user}/><span style={{fontSize:9,color:rl.c,fontFamily:"monospace"}}>{rep}</span>
        </div>

        {/* Edit mode */}
        {edit&&<div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
          <input className="li" value={eD} onChange={e=>setED(e.target.value)} placeholder="Display name"/>
          <input className="li" value={eU} onChange={e=>setEU(e.target.value)} placeholder="Username"/>
          <input className="li" value={eAv} onChange={e=>setEAv(e.target.value)} placeholder="Avatar URL"/>
          {canBn&&<input className="li" value={eBn} onChange={e=>setEBn(e.target.value)} placeholder="Banner URL"/>}
          <input className="li" value={eRI} onChange={e=>setERI(e.target.value)} placeholder="Custom role icon (emoji, Booster+)" maxLength={2}/>
          <select className="li" value={eSt} onChange={e=>setESt(e.target.value)}>{["online","idle","dnd","offline"].map(s=><option key={s} value={s}>{s}</option>)}</select>
          {canGr&&<div style={{display:"flex",gap:6,alignItems:"center"}}><input type="color" value={eG1||"#A855F7"} onChange={e=>setEG1(e.target.value)} style={{width:36,height:28,border:"none",borderRadius:4}}/><span style={{fontSize:10,color:"var(--txg)"}}>→</span><input type="color" value={eG2||"#F472B6"} onChange={e=>setEG2(e.target.value)} style={{width:36,height:28,border:"none",borderRadius:4}}/></div>}
          <div style={{display:"flex",gap:6}}><button className="btn bp" onClick={save} style={{flex:1}}>Save</button><button className="btn bs" onClick={()=>setEdit(false)}>Cancel</button></div>
        </div>}

        {/* Actions for other users */}
        {!user?.isMe&&<div style={{display:"flex",gap:4,marginTop:10}}>
          {onBlock&&<button className="btn bs" onClick={()=>{onBlock(user.id);notify("Blocked");onClose()}} style={{fontSize:10}}>🚫 Block</button>}
          {onIgnore&&<button className="btn bs" onClick={()=>{onIgnore(user.id);notify("Ignored");onClose()}} style={{fontSize:10}}>👁‍🗨 Ignore</button>}
          {isMod&&onCensor&&<button className="btn" onClick={()=>{onCensor(user.id);notify(user.censored?"Uncensored":"Censored");onClose()}} style={{fontSize:10,background:"rgba(239,68,68,.06)",color:"var(--err)",border:"1px solid rgba(239,68,68,.15)"}}>{user.censored?"📢 Uncensor":"🔇 Censor"}</button>}
        </div>}

        <button className="btn bp" onClick={onClose} style={{width:"100%",marginTop:10}}>Close</button>
      </div>
    </div></div>
  );
};

// ── Moderation Panel ──
const ModPanel=({srvs,aS,notify,onEditSrv,onDeleteSrv})=>{
  const [tab,setTab]=useState("strikes");const [su,setSu]=useState("");const [sr,setSr]=useState("");const [bd,setBd]=useState("permanent");
  const [amod,setAmod]=useState(()=>{try{return JSON.parse(localStorage.getItem("ic_amod"))||{Spam:true,Links:true,Mentions:true,Invites:false,Caps:false,Words:false,Raids:true,NSFW:true}}catch(e){return{Spam:true,Links:true,Mentions:true,Invites:false,Caps:false,Words:false,Raids:true,NSFW:true}}});
  const [srvN,setSrvN]=useState("");const [srvB,setSrvB]=useState("");const [delC,setDelC]=useState(false);
  const srv=srvs.find(s=>s.id===aS);
  useEffect(()=>{if(srv){setSrvN(srv.name);setSrvB(srv.banner||"")}},[aS]);
  const tAM=(k,v)=>{const n={...amod,[k]:v};setAmod(n);try{localStorage.setItem("ic_amod",JSON.stringify(n))}catch(e){}notify(`${k}: ${v?"on":"off"}`)};
  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:170,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"14px 6px"}}>
        <div className="sl">Moderation</div>
        {["strikes","kick / ban","slowmode","privileges","auto-mod","server"].map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t}</div>)}
      </div>
      <div style={{flex:1,padding:22,overflowY:"auto"}}>
        <h2 style={{fontSize:16,fontWeight:800,marginBottom:14,textTransform:"capitalize"}}>{tab}</h2>
        {tab==="strikes"&&<div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:12}}>{STR.map((s,i)=><div key={i} style={{padding:6,borderRadius:7,background:"var(--bg4)",border:"1px solid var(--bdr)",textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:i<2?"var(--wrn)":i<5?"#F59E0B":i<7?"var(--pk)":"var(--err)"}}>{s.n}</div><div style={{fontSize:9,color:"var(--txm)"}}>{s.a}</div></div>)}</div>
          <div className="card"><input className="li" value={su} onChange={e=>setSu(e.target.value)} placeholder="Username..." style={{marginBottom:6}}/><input className="li" value={sr} onChange={e=>setSr(e.target.value)} placeholder="Reason..." style={{marginBottom:6}}/><button className="btn bp" onClick={()=>{if(!su||!sr){notify("Fill fields");return}notify(`⚡ Strike → ${su}: ${sr}`);setSr("")}} style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>⚡ Strike</button></div>
        </div>}
        {tab==="kick / ban"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Kick","🔨","var(--pk)"],["Ban","🚫","var(--err)"]].map(([a,ic,c])=><div key={a} className="card"><div style={{fontSize:22,marginBottom:4}}>{ic}</div><div style={{fontSize:14,fontWeight:700,color:c,marginBottom:6}}>{a}</div><input className="li" placeholder="Username..." style={{marginBottom:6,fontSize:11}}/><input className="li" placeholder="Reason..." style={{marginBottom:6,fontSize:11}}/>{a==="Ban"&&<select className="li" value={bd} onChange={e=>setBd(e.target.value)} style={{marginBottom:6,fontSize:11}}><option>permanent</option><option>1d</option><option>7d</option><option>30d</option></select>}<button className="btn" onClick={()=>notify(`${a} done`)} style={{width:"100%",background:`${c}12`,color:c,border:`1px solid ${c}30`,fontWeight:700}}>{ic} {a}</button></div>)}
        </div>}
        {tab==="slowmode"&&srv?srv.channels.map(ch=><div key={ch.id} style={{display:"flex",alignItems:"center",gap:8,padding:8,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}><span style={{color:"var(--txg)"}}>#</span><span style={{fontSize:12,fontWeight:600,flex:1}}>{ch.name}</span><select className="li" value={ch.slowmode||0} onChange={e=>{ch.slowmode=parseInt(e.target.value);notify(`#${ch.name}: ${smL(parseInt(e.target.value))}`)}} style={{width:100,padding:"3px 6px",fontSize:11}}>{SM.map(v=><option key={v} value={v}>{smL(v)}</option>)}</select></div>)
        :tab==="slowmode"&&<p style={{fontSize:12,color:"var(--txg)"}}>Select a server</p>}
        {tab==="privileges"&&<div>
          <p style={{fontSize:10,color:"var(--txm)",marginBottom:10}}>Higher roles inherit lower perks. Booster+ gets custom role icons.</p>
          {Object.entries(R).map(([k,r])=>{const all=RP(k);const own=new Set(r.p);return<div key={k} className="card" style={{marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:r.c}}>{r.i}</span><span style={{fontSize:13,fontWeight:700,color:r.c,flex:1}}>{r.n}</span><span style={{fontSize:9,color:"var(--txg)"}}>Lv {r.lv}</span></div>
            <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:4}}>{all.map(p=><span key={p} className="chip" style={{background:["ban","kick","all","manage","censor","grant"].includes(p)?"rgba(239,68,68,.08)":"rgba(34,197,94,.08)",color:["ban","kick","all","manage","censor","grant"].includes(p)?"var(--err)":"var(--ok)",opacity:own.has(p)?1:.55,fontStyle:own.has(p)?"normal":"italic"}}>{p}{!own.has(p)?" ↑":""}</span>)}</div>
          </div>})}
        </div>}
        {tab==="auto-mod"&&Object.keys(amod).map(k=><div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}><div><div style={{fontSize:12,fontWeight:600}}>{k} Filter</div><div style={{fontSize:10,color:amod[k]?"var(--ok)":"var(--txm)"}}>{amod[k]?"Active":"Off"}</div></div><Tg on={!!amod[k]} onChange={v=>tAM(k,v)}/></div>)}
        {tab==="server"&&srv?<div>
          <div className="card" style={{marginBottom:10}}>
            <div className="sl">Server Name</div><input className="li" value={srvN} onChange={e=>setSrvN(e.target.value)} style={{marginBottom:6}}/>
            <div className="sl">Banner URL</div><input className="li" value={srvB} onChange={e=>setSrvB(e.target.value)} style={{marginBottom:6}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12}}>Public</span><Tg on={!!srv.isPublic} onChange={v=>{onEditSrv(srv.id,{isPublic:v});notify(v?"Public":"Private")}}/></div>
            <button className="btn bp" onClick={()=>{const ch={};if(srvN!==srv.name)ch.name=srvN;if(srvB!==(srv.banner||""))ch.banner=srvB||null;if(Object.keys(ch).length){onEditSrv(srv.id,ch);notify("Saved!")}}} style={{width:"100%"}}>💾 Save</button>
          </div>
          <div style={{padding:12,borderRadius:10,border:"1px solid rgba(239,68,68,.2)",background:"rgba(239,68,68,.03)"}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--err)",marginBottom:6}}>Danger Zone</div>
            {!delC?<button className="btn" onClick={()=>setDelC(true)} style={{background:"rgba(239,68,68,.08)",color:"var(--err)",border:"1px solid rgba(239,68,68,.2)",fontSize:11}}>🗑 Delete Server</button>
            :<div><p style={{fontSize:11,color:"var(--err)",marginBottom:6}}>Delete "{srv.name}"?</p><div style={{display:"flex",gap:6}}><button className="btn bs" onClick={()=>setDelC(false)}>Cancel</button><button className="btn" onClick={()=>{onDeleteSrv(srv.id);setDelC(false)}} style={{background:"rgba(239,68,68,.12)",color:"var(--err)",border:"1px solid rgba(239,68,68,.25)",fontWeight:700}}>Delete</button></div></div>}
          </div>
        </div>:tab==="server"&&<p style={{fontSize:12,color:"var(--txg)"}}>Select a server</p>}
      </div>
    </div>
  );
};

// ── CEO Panel — visual dashboard ──
const CEOPanel=({notify,user,allUsers,onEditUser,onCreateTest,onDeleteUser,onAnnounce,srvs,onGiftAirbound})=>{
  const [tab,setTab]=useState("dashboard");const [cmd,setCmd]=useState("");const [log,setLog]=useState([]);const [trash,setTrash]=useState([]);
  const [annTitle,setAnnTitle]=useState("");const [annText,setAnnText]=useState("");const [annBig,setAnnBig]=useState(false);
  const [selU,setSelU]=useState(null);const [editXP,setEditXP]=useState("");const [editBadge,setEditBadge]=useState("");
  const [tagSearch,setTagSearch]=useState("");const [giftUser,setGiftUser]=useState("");const [giftTier,setGiftTier]=useState("air");
  const everyone=[user,...allUsers].filter(Boolean);
  const totalMsgs=srvs.reduce((a,s)=>a+s.channels.reduce((b,c)=>b+(c.msgs||[]).length,0),0);

  const Stat=({icon,label,value,color,sub})=><div className="card" style={{textAlign:"center",padding:14}}><div style={{fontSize:24,marginBottom:4}}>{icon}</div><div style={{fontSize:22,fontWeight:800,color:color||"var(--tx)"}}>{value}</div><div style={{fontSize:10,color:"var(--txm)",marginTop:2}}>{label}</div>{sub&&<div style={{fontSize:8,color:"var(--txg)",marginTop:1}}>{sub}</div>}</div>;

  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:180,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"14px 6px"}}>
        <div style={{padding:"8px 8px 12px",textAlign:"center"}}><div style={{fontSize:24}}>👑</div><div style={{fontSize:12,fontWeight:800,background:"linear-gradient(135deg,#FFD700,#F59E0B)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>CEO Panel</div></div>
        {[["dashboard","📊 Dashboard"],["users","👥 Users"],["reputation","⭐ Reputation"],["tags","🏷 Tags"],["gift","🎁 Gift Airbound"],["announcements","📢 Announce"],["trash","🗑 Trash"],["storage","💾 Storage"],["cmd","⌘ Terminal"]].map(([k,n])=>
          <div key={k} className={`ch ${tab===k?"on":""}`} onClick={()=>setTab(k)} style={{fontSize:11}}>{n}</div>)}
      </div>
      <div style={{flex:1,padding:22,overflowY:"auto"}}>

        {tab==="dashboard"&&<div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:14,background:"linear-gradient(135deg,#FFD700,#F59E0B)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Dashboard</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
            <Stat icon="👥" label="Users" value={everyone.length} color="var(--acl)"/>
            <Stat icon="🖥" label="Servers" value={srvs.length} color="var(--ok)" sub={`${ESRV.count}/${ESRV.max} early`}/>
            <Stat icon="💬" label="Messages" value={totalMsgs} color="var(--inf)"/>
            <Stat icon="⭐" label="Total XP" value={everyone.reduce((a,u)=>a+(u.xp||0),0)} color="var(--wrn)"/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div className="card"><div style={{fontSize:12,fontWeight:700,marginBottom:8}}>🏰 Early Servers</div>
              <div style={{width:"100%",height:8,borderRadius:4,background:"var(--bdr)",overflow:"hidden"}}><div style={{width:`${Math.min(ESRV.count/ESRV.max*100,100)}%`,height:"100%",borderRadius:4,background:"linear-gradient(90deg,#14B8A6,#06D6A0)"}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}><span style={{fontSize:9,color:"var(--txm)"}}>{ESRV.count} / {ESRV.max}</span><span style={{fontSize:9,color:ESRV.count>=ESRV.max?"var(--err)":"var(--ok)"}}>{ESRV.count>=ESRV.max?"CAP":"ACTIVE"}</span></div>
            </div>
            <div className="card"><div style={{fontSize:12,fontWeight:700,marginBottom:8}}>📈 Top XP</div>
              {[...everyone].sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,4).map((u,i)=><div key={u.id||i} style={{display:"flex",alignItems:"center",gap:6,padding:"2px 0"}}><span style={{fontSize:10,fontWeight:800,color:i===0?"#FFD700":"var(--txm)",width:14}}>{i+1}.</span><span style={{fontSize:11,fontWeight:600,color:R[u.role]?.c,flex:1}}>{u.display}</span><span style={{fontSize:10,fontWeight:700,color:"var(--wrn)",fontFamily:"monospace"}}>{u.xp||0}</span></div>)}
            </div>
          </div>
        </div>}

        {tab==="users"&&<div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><h2 style={{fontSize:18,fontWeight:800}}>Users</h2><button className="btn bp" onClick={onCreateTest}>+ Test Account</button></div>
          {everyone.map(u=>{const rep=REP.calc(u);const rl=REP.level(rep);const sel=selU===u.id;return<div key={u.id} className="card" style={{marginBottom:6,borderColor:sel?"var(--acc)":"var(--bdr)"}}>
            <div onClick={()=>setSelU(sel?null:u.id)} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
              <Av name={u.display} src={u.avatar} size={34} status={u.status}/>
              <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:13,fontWeight:700,color:R[u.role]?.c}}>{u.display}</span>{u.isMe&&<span className="chip" style={{background:"#FFD70018",color:"var(--gld)"}}>YOU</span>}{u.censored&&<MsgTag type="warning"/>}</div>
                <div style={{fontSize:10,color:"var(--txm)"}}>@{u.username} · XP:{u.xp||0} · {rl.i}{rl.n}({rep})</div></div>
              <span style={{transform:sel?"rotate(180deg)":"",transition:".2s",color:"var(--txg)"}}>▾</span>
            </div>
            {sel&&<div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--bdr)"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                <div><div className="sl">XP</div><div style={{display:"flex",gap:3}}><input className="li" value={editXP} onChange={e=>setEditXP(e.target.value)} placeholder=""+(u.xp||0) style={{flex:1,fontSize:11}}/><button className="btn bp" onClick={()=>{if(editXP){onEditUser(u.isMe?"me":u.id,{xp:parseInt(editXP)||0});setEditXP("");notify("Set")}}} style={{padding:"4px 8px",fontSize:9}}>Set</button></div></div>
                <div><div className="sl">Role</div><select className="li" value={u.role} onChange={e=>{onEditUser(u.isMe?"me":u.id,{role:e.target.value});notify(`→ ${R[e.target.value]?.n}`)}} style={{fontSize:11}}>{Object.entries(R).map(([k,r])=><option key={k} value={k}>{r.i} {r.n}</option>)}</select></div>
                <div><div className="sl">Badge</div><div style={{display:"flex",gap:3}}><select className="li" value={editBadge} onChange={e=>setEditBadge(e.target.value)} style={{flex:1,fontSize:10}}><option value="">pick</option>{Object.entries(B).map(([k,b])=><option key={k} value={k}>{b.i}{b.l}</option>)}</select><button className="btn bp" onClick={()=>{if(editBadge){onEditUser(u.isMe?"me":u.id,{badges:[...(u.badges||[]),editBadge]});setEditBadge("");notify("+")}}} style={{padding:"4px 6px",fontSize:9}}>+</button></div></div>
              </div>
              <div style={{display:"flex",gap:3,flexWrap:"wrap"}}><span style={{fontSize:9,color:"var(--txg)"}}>Badges:</span>{(u.badges||[]).map((bid,i)=>{const b=B[bid];return b?<span key={i} className="chip" style={{background:`${b.c}18`,color:b.c}}>{b.i} {b.l}<span onClick={()=>{onEditUser(u.isMe?"me":u.id,{badges:(u.badges||[]).filter((_,j)=>j!==i)});notify("Removed")}} style={{cursor:"pointer",marginLeft:2,opacity:.5}}>×</span></span>:null})}</div>
              <div style={{display:"flex",gap:4,marginTop:6}}>
                <button className="btn bp" onClick={()=>{onEditUser(u.isMe?"me":u.id,{xp:(u.xp||0)+50});notify("+50 XP")}} style={{fontSize:9,padding:"3px 8px"}}>+50 XP</button>
                <button className="btn bs" onClick={()=>{onEditUser(u.isMe?"me":u.id,{strikes:(u.strikes||0)+1});notify("Strike")}} style={{fontSize:9,color:"var(--wrn)"}}>⚡</button>
                <button className="btn bs" onClick={()=>{onEditUser(u.isMe?"me":u.id,{censored:!u.censored});notify(u.censored?"Uncensored":"Censored")}} style={{fontSize:9,color:"var(--err)"}}>{u.censored?"📢":"🔇"}</button>
                {u.isTest&&<button className="btn" onClick={()=>{onDeleteUser(u.id);setSelU(null);notify("Deleted")}} style={{fontSize:9,color:"var(--err)",background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.15)",marginLeft:"auto"}}>🗑</button>}
              </div>
            </div>}
          </div>})}
        </div>}

        {tab==="reputation"&&<div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:14}}>⭐ Reputation</h2>
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:14}}>{REP.levels.map(l=><div key={l.n} className="chip" style={{background:`${l.c}18`,color:l.c,padding:"3px 8px"}}>{l.i} {l.n} {l.min}+</div>)}</div>
          {[...everyone].sort((a,b)=>REP.calc(b)-REP.calc(a)).map(u=>{const rep=REP.calc(u);const rl=REP.level(rep);return<div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}>
            <Av name={u.display} size={28}/><div style={{flex:1}}><span style={{fontSize:12,fontWeight:700,color:R[u.role]?.c}}>{u.display}</span> <RepChip user={u}/></div>
            <span style={{fontSize:16,fontWeight:800,color:rl.c}}>{rep}</span>
            <button className="btn bp" onClick={()=>{onEditUser(u.isMe?"me":u.id,{xp:(u.xp||0)+25});notify("+25")}} style={{fontSize:8,padding:"2px 6px"}}>+</button>
          </div>})}
        </div>}

        {tab==="tags"&&<div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:14}}>🏷 Tags & Badges</h2>
          <div className="card" style={{marginBottom:14,borderColor:"rgba(20,184,166,.3)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:24}}>🏰</span><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#14B8A6"}}>Early Server Owner</div><div style={{fontSize:10,color:"var(--txm)"}}>{ESRV.count}/{ESRV.max} — {ESRV.count>=ESRV.max?"CAP REACHED":"Active"}</div></div></div>
          </div>
          <input className="li" value={tagSearch} onChange={e=>setTagSearch(e.target.value)} placeholder="Search user..." style={{marginBottom:10}}/>
          {everyone.filter(u=>!tagSearch||u.display.toLowerCase().includes(tagSearch.toLowerCase())).map(u=><div key={u.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:"1px solid var(--bdr)"}}>
            <Av name={u.display} size={22}/><span style={{fontSize:11,fontWeight:600,color:R[u.role]?.c,flex:1}}>{u.display}</span>
            {["early_owner","early","founder","dev"].map(tag=>(u.badges||[]).includes(tag)?<span key={tag} className="chip" style={{background:`${B[tag]?.c||"var(--txg)"}18`,color:B[tag]?.c}}>{B[tag]?.i} ✓</span>
            :<button key={tag} className="btn bs" onClick={()=>{onEditUser(u.isMe?"me":u.id,{badges:[...(u.badges||[]),tag]});notify(`+${B[tag]?.l}`)}} style={{fontSize:7,padding:"1px 4px"}}>{B[tag]?.i}</button>)}
          </div>)}
        </div>}

        {tab==="gift"&&<div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:14}}>🎁 Gift Airbound</h2>
          <p style={{fontSize:11,color:"var(--txm)",marginBottom:14}}>Grant Airbound subscriptions as prizes to users. CEO/Admin only.</p>
          <div className="card" style={{marginBottom:14}}>
            <div className="sl">Select User</div>
            <select className="li" value={giftUser} onChange={e=>setGiftUser(e.target.value)} style={{marginBottom:8}}>
              <option value="">Choose a user...</option>
              {allUsers.map(u=><option key={u.id} value={u.username}>{u.display} (@{u.username})</option>)}
            </select>
            <div className="sl">Select Tier</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:10}}>
              {Object.entries(P).map(([k,p])=><div key={k} onClick={()=>setGiftTier(k)} className="card" style={{cursor:"pointer",textAlign:"center",borderColor:giftTier===k?p.c:"var(--bdr)",padding:10}}>
                <div style={{fontSize:14,fontWeight:800,color:p.c}}>{p.n}</div>
                <div style={{fontSize:11,fontWeight:700}}>${p.p.toFixed(2)}/mo</div>
              </div>)}
            </div>
            <button className="btn bp" onClick={()=>{
              if(!giftUser){notify("Select a user");return}
              const target=allUsers.find(u=>u.username===giftUser);
              if(!target){notify("User not found");return}
              onGiftAirbound(target.id,giftTier);
              notify(`🎁 ${P[giftTier].n} gifted to ${giftUser}!`);setGiftUser("");
            }} style={{width:"100%",background:"linear-gradient(135deg,#C084FC,#F472B6)"}}>🎁 Gift {P[giftTier]?.n}</button>
          </div>
        </div>}

        {tab==="announcements"&&<div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:10}}>📢 Announcements</h2>
          <div className="card"><input className="li" value={annTitle} onChange={e=>setAnnTitle(e.target.value)} placeholder="Title" style={{marginBottom:6}}/>
            <textarea className="li" value={annText} onChange={e=>setAnnText(e.target.value)} placeholder="Content..." rows={3} style={{resize:"vertical",marginBottom:6}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11}}>Splash popup</span><Tg on={annBig} onChange={setAnnBig}/></div>
            <button className="btn bp" onClick={()=>{if(!annText.trim()){notify("Empty");return}onAnnounce(annText.trim(),annBig,annTitle.trim());setAnnTitle("");setAnnText("");notify("Sent!")}}>📢 Send</button>
          </div>
        </div>}

        {tab==="trash"&&<div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:10}}>🗑 Trash (14-day recovery)</h2>
          {!trash.length?<p style={{color:"var(--txg)",fontSize:12}}>Empty</p>:trash.map((a,i)=><div key={i} className="card" style={{marginBottom:4,display:"flex",alignItems:"center",gap:8}}><Av name={a.u} size={24}/><div style={{flex:1}}><b>{a.u}</b><div style={{fontSize:9,color:"var(--txg)"}}>{a.t}</div></div><button className="btn" onClick={()=>{setTrash(p=>p.filter((_,j)=>j!==i));notify("Recovered")}} style={{fontSize:10,color:"var(--ok)",background:"rgba(34,197,94,.06)",border:"1px solid rgba(34,197,94,.15)"}}>♻️</button></div>)}
        </div>}

        {tab==="storage"&&<div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:10}}>💾 Storage</h2>
          {(()=>{let t=0,c=0;Object.keys(localStorage).filter(k=>k.startsWith("ic_")).forEach(k=>{t+=localStorage.getItem(k).length;c++});const kb=Math.round(t/1024);return<div><div className="card" style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,fontWeight:600}}>Used</span><span style={{fontSize:12,fontWeight:700,color:"var(--acl)"}}>{kb} KB</span></div><div style={{width:"100%",height:6,borderRadius:3,background:"var(--bdr)",marginTop:4,overflow:"hidden"}}><div style={{width:`${Math.min(kb/5000*100,100)}%`,height:"100%",borderRadius:3,background:kb>3000?"var(--err)":"var(--ok)"}}/></div><div style={{fontSize:9,color:"var(--txg)",marginTop:2}}>{c} keys · {kb>3000?"⚠":"✓"}</div></div>
            <button className="btn bp" onClick={()=>{let rm=0;Object.keys(localStorage).filter(k=>k.startsWith("ic_")).forEach(k=>{const v=localStorage.getItem(k);if(v&&v.length<3){localStorage.removeItem(k);rm++}});notify(`Cleaned ${rm}`)}} style={{width:"100%",marginBottom:6}}>🧹 Clean</button>
            <button className="btn" onClick={()=>{if(confirm("Clear ALL?")){Object.keys(localStorage).filter(k=>k.startsWith("ic_")).forEach(k=>localStorage.removeItem(k));location.reload()}}} style={{width:"100%",background:"rgba(239,68,68,.08)",color:"var(--err)",border:"1px solid rgba(239,68,68,.2)",fontWeight:700}}>🗑 Clear All</button>
          </div>})()}
        </div>}

        {tab==="cmd"&&<div>
          <h2 style={{fontSize:18,fontWeight:800,marginBottom:10}}>⌘ Terminal</h2>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:10,background:"#060606",border:"1px solid var(--bdr)"}}><span style={{color:"var(--ok)",fontWeight:700}}>$</span>
              <input value={cmd} onChange={e=>setCmd(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&cmd.trim()){
                let r="",ok=true;const c=cmd.trim();
                if(c==="/help")r="setxp addxp addbadge removebadge setrole setname purge announce granttag gift";
                else r="Use dashboard tabs instead";
                setLog(p=>[{c,r,ok,t:new Date().toLocaleTimeString()},...p]);setCmd("");
              }}} placeholder="/help" style={{flex:1,background:"none",border:"none",outline:"none",color:"var(--ok)",fontSize:12,fontFamily:"monospace"}}/>
            </div>
            <button className="btn bp" style={{fontFamily:"monospace",background:"linear-gradient(135deg,var(--ok),#16A34A)"}}>Run</button>
          </div>
          {log.map((l,i)=><div key={i} style={{padding:6,borderRadius:6,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:3,fontFamily:"monospace"}}><div style={{fontSize:11,color:"var(--ok)"}}>$ {l.c}</div><div style={{fontSize:10,color:"var(--txm)"}}>{l.r}</div></div>)}
        </div>}
      </div>
    </div>
  );
};

// ── Plugins ──
const PlugPanel=({notify})=>{
  const [tab,setTab]=useState("plugins");const [on,setOn]=useState(()=>{try{return JSON.parse(localStorage.getItem("ic_plg"))||{}}catch(e){return{}}});const [bon,setBon]=useState(()=>{try{return JSON.parse(localStorage.getItem("ic_bot"))||{}}catch(e){return{}}});
  const tP=(id)=>{const n={...on,[id]:!on[id]};setOn(n);try{localStorage.setItem("ic_plg",JSON.stringify(n))}catch(e){}notify(`${PLG.find(p=>p.id===id)?.n} ${n[id]?"on":"off"}`)};
  const tB=(id)=>{const n={...bon,[id]:!bon[id]};setBon(n);try{localStorage.setItem("ic_bot",JSON.stringify(n))}catch(e){}notify(`${BOT.find(b=>b.id===id)?.n} ${n[id]?"on":"off"}`)};
  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:170,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"14px 6px"}}><div className="sl">🧩 Plugins</div>{["plugins","ai bots","my plugins"].map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t}</div>)}</div>
      <div style={{flex:1,padding:22,overflowY:"auto"}}>
        {tab==="plugins"&&PLG.map(p=><div key={p.id} className="card" style={{marginBottom:6,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24}}>{p.i}</span><div style={{flex:1}}><span style={{fontSize:13,fontWeight:700}}>{p.n}</span>{p.v&&<span className="chip" style={{background:"rgba(34,197,94,.1)",color:"var(--ok)",marginLeft:4}}>Official</span>}<div style={{fontSize:11,color:"var(--txm)"}}>{p.d}</div></div><Tg on={!!on[p.id]} onChange={()=>tP(p.id)}/></div>)}
        {tab==="ai bots"&&BOT.map(b=><div key={b.id} className="card" style={{marginBottom:6,display:"flex",alignItems:"center",gap:10}}><div style={{width:40,height:40,borderRadius:10,background:`${b.c}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{b.i}</div><div style={{flex:1}}><span style={{fontSize:13,fontWeight:700}}>{b.n}</span><div style={{fontSize:11,color:"var(--txm)"}}>{b.d}</div></div><Tg on={!!bon[b.id]} onChange={()=>tB(b.id)}/></div>)}
        {tab==="my plugins"&&<div style={{textAlign:"center",padding:30}}><div style={{fontSize:36,marginBottom:8}}>🔧</div><p style={{fontSize:12,color:"var(--txm)"}}>Connect GitHub to build custom plugins</p><button className="btn bp" style={{marginTop:10}}>Connect GitHub</button></div>}
      </div>
    </div>
  );
};

// ── Voice ──
const VoicePanel=({ch,onClose,notify})=>{
  const [m,setM]=useState(false);const [d,setD]=useState(false);const [v,setV]=useState(100);
  return(<div style={{padding:8,borderTop:"1px solid var(--bdr)",background:"var(--bg3)"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}><div><div style={{fontSize:10,fontWeight:700,color:"var(--ok)"}}>🔊 Connected</div><div style={{fontSize:9,color:"var(--txg)"}}>{ch?.name}</div></div><button className="btn bs" onClick={onClose} style={{padding:"2px 6px",fontSize:9,color:"var(--err)"}}>✕</button></div>
    <div style={{display:"flex",gap:3,marginBottom:6}}>
      <button onClick={()=>{setM(!m);notify(m?"Unmuted":"Muted")}} style={{flex:1,padding:5,borderRadius:7,background:m?"rgba(239,68,68,.1)":"var(--bg3)",border:`1px solid ${m?"rgba(239,68,68,.3)":"var(--bdr)"}`,color:m?"var(--err)":"var(--tx2)",fontSize:14,cursor:"pointer"}}>{m?"🔇":"🎙"}</button>
      <button onClick={()=>{setD(!d);notify(d?"Undeafened":"Deafened")}} style={{flex:1,padding:5,borderRadius:7,background:d?"rgba(239,68,68,.1)":"var(--bg3)",border:`1px solid ${d?"rgba(239,68,68,.3)":"var(--bdr)"}`,color:d?"var(--err)":"var(--tx2)",fontSize:14,cursor:"pointer"}}>{d?"🔕":"🔔"}</button>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:9}}>🔊</span><input type="range" min="0" max="200" value={v} onChange={e=>setV(e.target.value)} style={{flex:1,accentColor:"var(--acc)"}}/><span style={{fontSize:8,color:"var(--txg)",fontFamily:"monospace"}}>{v}%</span></div>
  </div>);
};

// ── Settings with CloudKids, blocked/ignored, account delete ──
const SetPanel=({theme,setTheme,user,notify,onPay,onLogout,onEditUser,settings,onSetSettings,onDeleteAccount})=>{
  const [tab,setTab]=useState("appearance");const [logoutC,setLogoutC]=useState(false);const [deleteC,setDeleteC]=useState(false);const [delPwd,setDelPwd]=useState("");
  const [eN,setEN]=useState(user?.display||"");const [eU,setEU]=useState(user?.username||"");const [eE,setEE]=useState(user?.email||"");const [eAv,setEAv]=useState(user?.avatar||"");
  const [eG1,setEG1]=useState(user?.gradient?.c1||"");const [eG2,setEG2]=useState(user?.gradient?.c2||"");
  const canGr=user?.premium&&P[user.premium]?.unlocks?.gradient;

  useEffect(()=>{setEN(user?.display||"");setEU(user?.username||"");setEE(user?.email||"");setEAv(user?.avatar||"");setEG1(user?.gradient?.c1||"");setEG2(user?.gradient?.c2||"")},[user?.display,user?.username,user?.email,user?.avatar,user?.gradient?.c1,user?.gradient?.c2]);

  const ps=k=>settings?.privacy?.[k]??DSET.privacy[k];const ns=k=>settings?.notifs?.[k]??DSET.notifs[k];const as=k=>settings?.access?.[k]??DSET.access[k];
  const setP=(k,v)=>onSetSettings({...settings,privacy:{...(settings?.privacy||DSET.privacy),[k]:v}});
  const setN=(k,v)=>onSetSettings({...settings,notifs:{...(settings?.notifs||DSET.notifs),[k]:v}});
  const setA=(k,v)=>onSetSettings({...settings,access:{...(settings?.access||DSET.access),[k]:v}});

  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:170,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"14px 6px"}}>
        <div className="sl">Settings</div>
        {["appearance","account","gradient","privacy","notifications","accessibility","cloudkids","blocked","premium","shortcuts"].map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)} style={{textTransform:"capitalize"}}>{t==="cloudkids"?"☁ CloudKids":t==="blocked"?"🚫 Blocked":t==="shortcuts"?"⌨ Shortcuts":t}</div>)}
        <div style={{borderTop:"1px solid var(--bdr)",marginTop:8,paddingTop:8}}><div className="ch" onClick={()=>setLogoutC(true)} style={{color:"var(--err)"}}>🚪 Logout</div>
          <div className="ch" onClick={()=>setDeleteC(true)} style={{color:"var(--err)",opacity:.6}}>🗑 Delete Account</div>
        </div>
      </div>
      <div style={{flex:1,padding:22,overflowY:"auto"}}>
        {tab==="appearance"&&<div><h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Appearance</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>{[["dark","Dark Nebula","🌌"],["midnight","Midnight","🌙"],["void","Void","⚫"],["light","Light Cloud","☁"]].map(([k,n,ic])=><div key={k} onClick={()=>{setTheme(k);notify(`Theme: ${n}`)}} className="card" style={{cursor:"pointer",borderColor:theme===k?"var(--acc)":"var(--bdr)",display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18}}>{ic}</span><span style={{fontSize:13,fontWeight:700,color:theme===k?"var(--acl)":"var(--tx2)"}}>{n}</span>{theme===k&&<span style={{marginLeft:"auto",color:"var(--ok)"}}>✓</span>}</div>)}</div>
        </div>}

        {tab==="account"&&<div><h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Account</h2>
          <div className="card" style={{marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
            <Av name={user?.display} src={user?.avatar} size={48} status={user?.status}/><div><div style={{fontSize:15,fontWeight:800,color:R[user?.role]?.c}}>{user?.display}</div><div style={{fontSize:11,color:"var(--txm)"}}>@{user?.username}</div></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><div className="sl">Display Name</div><input className="li" value={eN} onChange={e=>setEN(e.target.value)}/></div>
            <div><div className="sl">Username</div><input className="li" value={eU} onChange={e=>setEU(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))}/></div>
            <div><div className="sl">Email</div><input className="li" value={eE} onChange={e=>setEE(e.target.value)} type="email"/></div>
            <div><div className="sl">Avatar URL</div><input className="li" value={eAv} onChange={e=>setEAv(e.target.value)} placeholder="https://..."/></div>
            <button className="btn bp" onClick={()=>{const ch={};if(eN.trim()&&eN!==user.display)ch.display=eN.trim();if(eU.trim()&&eU!==user.username)ch.username=eU.trim();if(eE!==user.email)ch.email=eE;if(eAv!==(user.avatar||""))ch.avatar=eAv||null;if(Object.keys(ch).length){onEditUser("me",ch);notify("Saved!")}else notify("No changes")}}>💾 Save</button>
          </div>
        </div>}

        {tab==="gradient"&&<div><h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Gradient</h2>
          {canGr?<div><div className="sl">Presets</div><div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>{GRAD.map(g=><div key={g.id} onClick={()=>{setEG1(g.c1);setEG2(g.c2)}} style={{padding:"4px 10px",borderRadius:8,background:`linear-gradient(90deg,${g.c1},${g.c2})`,cursor:"pointer",fontSize:11,fontWeight:700,color:"#fff"}}>{g.n}</div>)}</div>
            <div className="sl">Custom</div><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}><input type="color" value={eG1||"#A855F7"} onChange={e=>setEG1(e.target.value)} style={{width:44,height:32,border:"none",borderRadius:6}}/><div style={{flex:1,height:24,borderRadius:6,background:eG1&&eG2?`linear-gradient(90deg,${eG1},${eG2})`:"var(--bdr)"}}/><input type="color" value={eG2||"#F472B6"} onChange={e=>setEG2(e.target.value)} style={{width:44,height:32,border:"none",borderRadius:6}}/></div>
            <div style={{display:"flex",gap:6}}><button className="btn bp" onClick={()=>{if(eG1&&eG2){onEditUser("me",{gradient:{c1:eG1,c2:eG2}});notify("Applied!")}}} style={{flex:1}}>Apply</button><button className="btn bs" onClick={()=>{setEG1("");setEG2("");onEditUser("me",{gradient:null});notify("Removed")}}>Remove</button></div>
          </div>:<div className="card" style={{textAlign:"center",padding:20}}><p style={{fontSize:11,color:"var(--txm)"}}>Requires Airbound+</p><button className="btn bp" onClick={()=>setTab("premium")} style={{marginTop:8}}>View Plans</button></div>}
        </div>}

        {tab==="privacy"&&<div><h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Privacy</h2>
          {[["dms","Allow DMs"],["online","Online status"],["friends","Friend requests"],["activity","Activity status"],["data","Analytics"]].map(([k,n])=>
            <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}><span style={{fontSize:12,fontWeight:600}}>{n}</span><Tg on={!!ps(k)} onChange={v=>{setP(k,v);notify(`${n}: ${v?"on":"off"}`)}}/></div>)}
        </div>}

        {tab==="notifications"&&<div><h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Notifications</h2>
          {[["messages","Messages"],["mentions","Mentions"],["sounds","Sounds"],["desktop","Desktop"]].map(([k,n])=>
            <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}><span style={{fontSize:12,fontWeight:600}}>{n}</span><Tg on={!!ns(k)} onChange={v=>{setN(k,v);notify(`${n}: ${v?"on":"off"}`)}}/></div>)}
        </div>}

        {tab==="accessibility"&&<div><h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Accessibility</h2>
          {[["reducedMotion","Reduced motion"],["compactMode","Compact mode"]].map(([k,n])=><div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}><span style={{fontSize:12,fontWeight:600}}>{n}</span><Tg on={!!as(k)} onChange={v=>{setA(k,v);notify(`${n}: ${v?"on":"off"}`)}}/></div>)}
          <div style={{padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)"}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Font size: {as("fontSize")||13}px</div><input type="range" min="11" max="18" value={as("fontSize")||13} onChange={e=>setA("fontSize",parseInt(e.target.value))} style={{width:"100%",accentColor:"var(--acc)"}}/></div>
        </div>}

        {tab==="cloudkids"&&<div><h2 style={{fontSize:16,fontWeight:800,marginBottom:4}}>☁ CloudKids Mode</h2>
          <p style={{fontSize:10,color:"var(--txm)",marginBottom:14}}>Filter profanity and inappropriate content. Safe mode for younger audiences.</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:8}}>
            <div><div style={{fontSize:12,fontWeight:600}}>CloudKids Filter</div><div style={{fontSize:10,color:settings?.cloudKids?.enabled?"var(--ok)":"var(--txm)"}}>{settings?.cloudKids?.enabled?"Active":"Off"}</div></div>
            <Tg on={!!settings?.cloudKids?.enabled} onChange={v=>onSetSettings({...settings,cloudKids:{...settings?.cloudKids,enabled:v}})}/>
          </div>
          {settings?.cloudKids?.enabled&&<div>
            <div className="sl">Filter Mode</div>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {[["blur","🔵 Blur (hover to peek)"],["block","⬛ Black box (click to reveal)"]].map(([m,n])=><button key={m} className={`tab ${settings?.cloudKids?.filterMode===m?"on":"off"}`} onClick={()=>onSetSettings({...settings,cloudKids:{...settings.cloudKids,filterMode:m}})} style={{flex:1}}>{n}</button>)}
            </div>
            <div className="card" style={{background:"var(--bg3)"}}>
              <div style={{fontSize:11,fontWeight:600,marginBottom:4}}>Preview:</div>
              <div style={{fontSize:12,color:"var(--tx2)"}} dangerouslySetInnerHTML={{__html:CKIDS.filterText("This word is filtered: damn and this too: hell",settings?.cloudKids?.filterMode||"blur")}}/>
            </div>
          </div>}
          <div className="sl" style={{marginTop:12}}>Spoiler Attachments Mode</div>
          <div style={{display:"flex",gap:6}}>{[["blur","🔵 Blur"],["block","⬛ Block"]].map(([m,n])=><button key={m} className={`tab ${(settings?.spoilerMode||"blur")===m?"on":"off"}`} onClick={()=>onSetSettings({...settings,spoilerMode:m})}>{n}</button>)}</div>
        </div>}

        {tab==="blocked"&&<div><h2 style={{fontSize:16,fontWeight:800,marginBottom:14}}>🚫 Blocked & Ignored</h2>
          <div className="sl">Blocked Users ({(settings?.blocked||[]).length})</div>
          <p style={{fontSize:10,color:"var(--txm)",marginBottom:8}}>Messages hidden by default, click to reveal</p>
          {(settings?.blocked||[]).length===0?<p style={{fontSize:11,color:"var(--txg)",marginBottom:12}}>None</p>
          :(settings?.blocked||[]).map((uid,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:8,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}>
            <span style={{fontSize:12}}>{uid}</span><button className="btn bs" onClick={()=>{const nb=(settings.blocked||[]).filter((_,j)=>j!==i);onSetSettings({...settings,blocked:nb});notify("Unblocked")}} style={{fontSize:10}}>Unblock</button>
          </div>)}
          <div className="sl" style={{marginTop:10}}>Ignored Users ({(settings?.ignored||[]).length})</div>
          <p style={{fontSize:10,color:"var(--txm)",marginBottom:8}}>Completely hidden — no messages shown anywhere</p>
          {(settings?.ignored||[]).length===0?<p style={{fontSize:11,color:"var(--txg)"}}>None</p>
          :(settings?.ignored||[]).map((uid,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:8,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}>
            <span style={{fontSize:12}}>{uid}</span><button className="btn bs" onClick={()=>{const ni=(settings.ignored||[]).filter((_,j)=>j!==i);onSetSettings({...settings,ignored:ni});notify("Unignored")}} style={{fontSize:10}}>Unignore</button>
          </div>)}
        </div>}

        {tab==="premium"&&<div><h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Premium</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{Object.entries(P).map(([k,p])=>{const act=user?.premium===k;return<div key={k} className="card" style={{borderColor:act?`${p.c}60`:`${p.c}30`,textAlign:"center"}}>
            {act&&<div className="chip" style={{background:`${p.c}18`,color:p.c,marginBottom:4}}>✓ Active</div>}
            <div style={{fontSize:18,fontWeight:800,color:p.c}}>{p.n}</div><div style={{fontSize:13,fontWeight:700,marginBottom:6}}>${p.p.toFixed(2)}/mo</div>
            {p.boostDisc>0&&<div style={{fontSize:10,color:"var(--wrn)",marginBottom:4}}>🛒 {p.boostDisc}% boost discount</div>}
            {p.perks.map(pk=><div key={pk} style={{fontSize:10,color:"var(--txm)",marginBottom:1}}>✓ {pk}</div>)}
            <button className="btn bp" onClick={()=>act?notify("Active"):onPay(k)} style={{width:"100%",marginTop:8,background:act?"var(--bg4)":`linear-gradient(135deg,${p.c},${p.c}88)`,color:act?"var(--txm)":"#fff"}}>{act?"Current":"Subscribe"}</button>
          </div>})}</div>
        </div>}

        {tab==="shortcuts"&&<div><h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>⌨ Keyboard Shortcuts</h2>
          {KBS.list.map(s=><div key={s.keys} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:10,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}>
            <span style={{fontSize:12}}>{s.desc}</span><span style={{fontSize:11,fontWeight:700,color:"var(--acl)",fontFamily:"monospace",padding:"2px 8px",borderRadius:5,background:"var(--bg3)"}}>{s.keys}</span>
          </div>)}
        </div>}
      </div>
      {logoutC&&<ConfirmModal title="Logout?" text="Clears session and all local data." onConfirm={onLogout} onCancel={()=>setLogoutC(false)} danger/>}
      {deleteC&&<div className="modal" onClick={()=>setDeleteC(false)}><div className="mcard" onClick={e=>e.stopPropagation()} style={{width:360,padding:24,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>⚠</div><h2 style={{fontSize:16,fontWeight:800,color:"var(--err)"}}>Delete Account?</h2>
        <p style={{fontSize:11,color:"var(--txm)",margin:"8px 0 14px"}}>This is permanent. Enter your password to confirm.</p>
        <input className="li" type="password" value={delPwd} onChange={e=>setDelPwd(e.target.value)} placeholder="Password" style={{marginBottom:10}}/>
        <div style={{display:"flex",gap:8}}><button className="btn bs" onClick={()=>{setDeleteC(false);setDelPwd("")}} style={{flex:1}}>Cancel</button>
          <button className="btn" onClick={()=>{if(!delPwd){notify("Enter password");return}if(delPwd!==user?.password){notify("Wrong password");return}onDeleteAccount();}} style={{flex:1,background:"rgba(239,68,68,.12)",color:"var(--err)",border:"1px solid rgba(239,68,68,.25)",fontWeight:700}}>Delete Forever</button></div>
      </div></div>}
    </div>
  );
};
console.log('[IC] panels.js ready');
