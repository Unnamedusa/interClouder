/* ═══ interClouder v4.5 — Panels ═══ */

// ── Chat ──
const Chat=({ch,msgs,onSend,onReact,user,notify})=>{
  const [text,setText]=useState("");const [emo,setEmo]=useState(null);const ref=useRef(null);
  const emojis=["👍","❤️","😂","🔥","💜","👀","🎉","💯","😮","🙏"];
  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[msgs]);
  const send=()=>{if(!text.trim())return;onSend(text.trim());setText("")};
  const sm=ch?.slowmode||0;
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <div ref={ref} style={{flex:1,overflowY:"auto",padding:"6px 0"}}>
        {(!msgs||!msgs.length)&&<div style={{textAlign:"center",padding:50,color:"var(--txg)"}}><div style={{fontSize:36,marginBottom:8}}>💬</div><div style={{fontSize:15,fontWeight:700,color:"var(--txm)"}}>#{ch?.name||"channel"}</div><p style={{fontSize:11,marginTop:3}}>Start the conversation!</p></div>}
        {(msgs||[]).map(m=>(
          <div key={m.id} className="msg">
            <Av name={m.user} size={34}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:12,fontWeight:700,...(m.gradient?{background:`linear-gradient(90deg,${m.gradient.c1},${m.gradient.c2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}:{color:m.color||"var(--tx)"})}}>{m.user}</span>
                {m.tag&&<MsgTag type={m.tag}/>}
                <span style={{fontSize:9,color:"var(--txg)"}}>{m.time}</span>
              </div>
              <div style={{fontSize:13,color:"var(--tx2)",marginTop:2,wordBreak:"break-word"}}>{m.text}</div>
              <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:3}}>
                {(m.reactions||[]).map((r,i)=><span key={i} className={`rx ${r.me?"me":""}`} onClick={()=>onReact(m.id,r.emoji)}>{r.emoji} {r.count}</span>)}
                <span style={{position:"relative"}}><span className="rx" onClick={()=>setEmo(emo===m.id?null:m.id)} style={{opacity:.4}}>+</span>
                  {emo===m.id&&<div style={{position:"absolute",bottom:"100%",left:0,padding:4,borderRadius:8,background:"var(--bg2)",border:"1px solid var(--bdr)",display:"flex",gap:1,zIndex:10,boxShadow:"0 4px 12px rgba(0,0,0,.3)"}}>
                    {emojis.map(e=><span key={e} onClick={()=>{onReact(m.id,e);setEmo(null)}} style={{cursor:"pointer",fontSize:15,padding:2,borderRadius:3}} onMouseEnter={ev=>ev.currentTarget.style.background="var(--bga)"} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>{e}</span>)}
                  </div>}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="inp"><input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder={sm>0?`⏱ ${smL(sm)} — #${ch?.name||""}...`:`Message #${ch?.name||""}...`}/><button className="btn bp" onClick={send} style={{padding:"7px 12px"}}>↑</button></div>
    </div>
  );
};

// ── Profile ──
const ProfileModal=({user,onClose,notify,isOwner,onEditUser})=>{
  const [edit,setEdit]=useState(false);const [bN,setBN]=useState("");const [bI,setBI]=useState("");
  const [eD,setED]=useState(user?.display||"");const [eU,setEU]=useState(user?.username||"");
  const [eAv,setEAv]=useState(user?.avatar||"");const [eBn,setEBn]=useState(user?.banner||"");
  const [eSt,setESt]=useState(user?.status||"online");const [eG1,setEG1]=useState(user?.gradient?.c1||"");const [eG2,setEG2]=useState(user?.gradient?.c2||"");
  const r=R[user?.role]||R.cloud;
  const canAnim=user?.premium&&P[user.premium]?.unlocks?.animAvatar;
  const canBn=user?.premium&&P[user.premium]?.unlocks?.customBanner;
  const canAnimBn=user?.premium&&P[user.premium]?.unlocks?.animBanner;
  const canGr=user?.premium&&P[user.premium]?.unlocks?.gradient;
  const canEdit=user?.isMe||isOwner;

  const save=()=>{
    if(!onEditUser)return;const ch={};
    if(eD.trim()&&eD!==user.display)ch.display=eD.trim();
    if(eU.trim()&&eU!==user.username)ch.username=eU.trim();
    if(eAv!==(user.avatar||""))ch.avatar=eAv.trim()||null;
    if(eSt!==user.status)ch.status=eSt;
    if(canBn&&eBn!==(user.banner||""))ch.banner=eBn.trim()||null;
    if(canGr&&eG1&&eG2)ch.gradient={c1:eG1,c2:eG2};
    else if(canGr&&!eG1&&!eG2&&user.gradient)ch.gradient=null;
    if(Object.keys(ch).length){onEditUser(user.id,ch);notify("Saved!")}else notify("No changes");
  };

  return(
    <div className="modal" onClick={onClose}><div className="mcard" onClick={e=>e.stopPropagation()} style={{width:360,overflow:"hidden"}}>
      {user?.banner?<img src={user.banner} className={`banner ${canAnimBn?"banner-anim":""}`} onError={e=>e.target.style.display="none"}/>
      :<div className={`banner ${canAnimBn?"banner-anim":""}`} style={{background:user?.gradient?`linear-gradient(135deg,${user.gradient.c1},${user.gradient.c2})`:`linear-gradient(135deg,${r.c},${r.c}88)`}}/>}
      <div style={{padding:"0 18px 18px",marginTop:-28}}>
        <Av name={user?.display} src={user?.avatar} size={56} status={user?.status} anim={canAnim} style={{border:"3px solid var(--bg2)"}}/>
        {!edit&&<div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:6}}>
            <span style={{fontSize:16,fontWeight:800,...(user?.gradient?{background:`linear-gradient(90deg,${user.gradient.c1},${user.gradient.c2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}:{color:r.c})}}>{user?.display}</span>
            <span style={{fontSize:10,color:r.c}}>{r.i}</span>{user?.isTest&&<MsgTag type="system"/>}
          </div>
          <div style={{fontSize:11,color:"var(--txm)"}}>@{user?.username}</div>
        </div>}
        {edit&&canEdit&&<div style={{marginTop:8,display:"flex",flexDirection:"column",gap:5}}>
          <div><div style={{fontSize:9,color:"var(--txg)",textTransform:"uppercase",marginBottom:1}}>Display Name</div><input className="li" value={eD} onChange={e=>setED(e.target.value)} style={{fontSize:12}}/></div>
          <div><div style={{fontSize:9,color:"var(--txg)",textTransform:"uppercase",marginBottom:1}}>Username</div><input className="li" value={eU} onChange={e=>setEU(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))} style={{fontSize:12}}/></div>
          <div><div style={{fontSize:9,color:"var(--txg)",textTransform:"uppercase",marginBottom:1}}>Avatar URL</div><input className="li" value={eAv} onChange={e=>setEAv(e.target.value)} placeholder="https://..." style={{fontSize:11}}/></div>
          {eAv&&<div style={{display:"flex",justifyContent:"center"}}><img src={eAv} style={{width:42,height:42,borderRadius:"50%",objectFit:"cover",border:"2px solid var(--bdr)"}} onError={e=>e.target.style.display="none"}/></div>}
          {canBn?<div><div style={{fontSize:9,color:"var(--txg)",textTransform:"uppercase",marginBottom:1}}>Banner URL</div><input className="li" value={eBn} onChange={e=>setEBn(e.target.value)} style={{fontSize:11}}/></div>
          :<div style={{padding:5,borderRadius:5,background:"var(--bg3)",border:"1px dashed var(--bdr)"}}><p style={{fontSize:9,color:"var(--txg)"}}>🔒 Banner → Elite+</p></div>}
          {canGr&&<div><div style={{fontSize:9,color:"var(--txg)",textTransform:"uppercase",marginBottom:1}}>Gradient</div>
            <div style={{display:"flex",gap:4,alignItems:"center"}}><input type="color" value={eG1||"#A855F7"} onChange={e=>setEG1(e.target.value)} style={{width:32,height:24,border:"none",borderRadius:4,cursor:"pointer"}}/><div style={{flex:1,height:16,borderRadius:4,background:eG1&&eG2?`linear-gradient(90deg,${eG1},${eG2})`:"var(--bdr)"}}/><input type="color" value={eG2||"#F472B6"} onChange={e=>setEG2(e.target.value)} style={{width:32,height:24,border:"none",borderRadius:4,cursor:"pointer"}}/></div>
          </div>}
          <div><div style={{fontSize:9,color:"var(--txg)",textTransform:"uppercase",marginBottom:1}}>Status</div><div style={{display:"flex",gap:3}}>{[["online","🟢"],["idle","🟡"],["dnd","🔴"],["offline","⚫"]].map(([s,ic])=><button key={s} className={`tab ${eSt===s?"on":"off"}`} onClick={()=>setESt(s)} style={{fontSize:10}}>{ic}{s}</button>)}</div></div>
          <button className="btn bp" onClick={save}>💾 Save</button>
        </div>}
        <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>
          <span className="chip" style={{background:`${r.c}15`,color:r.c}}>{r.i} {r.n}</span>
          {user?.premium&&<span className="chip" style={{background:`${P[user.premium].c}15`,color:P[user.premium].c}}>✨ {P[user.premium].n}</span>}
        </div>
        <div style={{marginTop:8}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:9,color:"var(--txg)",textTransform:"uppercase"}}>Badges</span>
            {canEdit&&<span onClick={()=>setEdit(!edit)} style={{fontSize:9,color:"var(--acc)",cursor:"pointer",fontWeight:600}}>{edit?"✕ Close":"✏ Edit"}</span>}
          </div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            {(user?.badges||[]).map((b,i)=><div key={i} style={{position:"relative"}}><Bdg id={b} size={20}/>
              {edit&&<div onClick={()=>{if(onEditUser){const nb=[...(user.badges||[])];nb.splice(i,1);onEditUser(user.id,{badges:nb});notify("Removed")}}} style={{position:"absolute",top:-5,right:-5,width:11,height:11,borderRadius:6,background:"var(--err)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:6,color:"#fff"}}>×</div>}
            </div>)}
            {(user?.customBadges||[]).map((cb,i)=><div key={"c"+i} style={{position:"relative"}} title={cb.name}>
              {cb.img?<img src={cb.img} style={{width:20,height:20,borderRadius:3}} onError={e=>e.target.style.display="none"}/>:<span style={{fontSize:14}}>⭐</span>}
              {edit&&<div onClick={()=>{if(onEditUser){const nb=[...(user.customBadges||[])];nb.splice(i,1);onEditUser(user.id,{customBadges:nb});notify("Removed")}}} style={{position:"absolute",top:-5,right:-5,width:11,height:11,borderRadius:6,background:"var(--err)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:6,color:"#fff"}}>×</div>}
            </div>)}
            {!user?.badges?.length&&!user?.customBadges?.length&&<span style={{fontSize:10,color:"var(--txg)"}}>None</span>}
          </div>
          {edit&&<div style={{marginTop:5,display:"flex",gap:3}}>
            <input className="li" value={bN} onChange={e=>setBN(e.target.value)} placeholder="Name" style={{flex:1,fontSize:10}}/>
            <input className="li" value={bI} onChange={e=>setBI(e.target.value)} placeholder="Img URL" style={{flex:1,fontSize:10}}/>
            <button className="btn bs" onClick={()=>{if(bN.trim()&&onEditUser){onEditUser(user.id,{customBadges:[...(user.customBadges||[]),{name:bN.trim(),img:bI.trim()||null}]});setBN("");setBI("");notify("Added!")}}} style={{padding:"3px 7px",fontSize:9}}>+</button>
          </div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}><span style={{fontSize:9,color:"var(--txg)"}}>XP</span><XPBar xp={user?.xp||0} w={120}/><span style={{fontSize:9,color:"var(--txm)",fontFamily:"monospace"}}>{user?.xp||0}</span></div>
        <button className="btn bp" onClick={onClose} style={{width:"100%",marginTop:10}}>Close</button>
      </div>
    </div></div>
  );
};

// ── Moderation — auto-mod persists, server edit tab ──
const ModPanel=({srvs,aS,notify,onEditSrv,onDeleteSrv})=>{
  const [tab,setTab]=useState("strikes");const [su,setSu]=useState("");const [sr,setSr]=useState("");const [bd,setBd]=useState("permanent");
  const [amod,setAmod]=useState(()=>{try{const v=localStorage.getItem("ic_amod");return v?JSON.parse(v):{Spam:true,Links:true,Mentions:true,Invites:false,Caps:false,Words:false,Raids:true,NSFW:true}}catch(e){return{Spam:true,Links:true,Mentions:true,Invites:false,Caps:false,Words:false,Raids:true,NSFW:true}}});
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
          <div className="card"><div style={{fontSize:13,fontWeight:700,marginBottom:8}}>Issue Strike</div><input className="li" value={su} onChange={e=>setSu(e.target.value)} placeholder="Username..." style={{marginBottom:6}}/><input className="li" value={sr} onChange={e=>setSr(e.target.value)} placeholder="Reason..." style={{marginBottom:6}}/><button className="btn bp" onClick={()=>{if(!su||!sr){notify("Fill fields");return}notify(`⚡ Strike → ${su}: ${sr}`);setSr("")}} style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>⚡ Strike</button></div>
        </div>}

        {tab==="kick / ban"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Kick","🔨","var(--pk)"],["Ban","🚫","var(--err)"]].map(([a,ic,c])=><div key={a} className="card"><div style={{fontSize:22,marginBottom:4}}>{ic}</div><div style={{fontSize:14,fontWeight:700,color:c,marginBottom:6}}>{a}</div><input className="li" placeholder="Username..." style={{marginBottom:6,fontSize:11}}/><input className="li" placeholder="Reason..." style={{marginBottom:6,fontSize:11}}/>{a==="Ban"&&<select className="li" value={bd} onChange={e=>setBd(e.target.value)} style={{marginBottom:6,fontSize:11}}><option>permanent</option><option>1d</option><option>7d</option><option>30d</option></select>}<button className="btn" onClick={()=>notify(`${a} done`)} style={{width:"100%",background:`${c}12`,color:c,border:`1px solid ${c}30`,fontWeight:700,fontSize:12}}>{ic} {a}</button></div>)}
        </div>}

        {tab==="slowmode"&&srv?srv.channels.map(ch=><div key={ch.id} style={{display:"flex",alignItems:"center",gap:8,padding:8,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}><span style={{color:"var(--txg)"}}>#</span><span style={{fontSize:12,fontWeight:600,flex:1}}>{ch.name}</span><select className="li" value={ch.slowmode||0} onChange={e=>{ch.slowmode=parseInt(e.target.value);notify(`#${ch.name}: ${smL(parseInt(e.target.value))}`)}} style={{width:100,padding:"3px 6px",fontSize:11}}>{SM.map(v=><option key={v} value={v}>{smL(v)}</option>)}</select></div>)
        :tab==="slowmode"&&<p style={{fontSize:12,color:"var(--txg)"}}>Select a server first</p>}

        {tab==="privileges"&&<div>
          <p style={{fontSize:10,color:"var(--txm)",marginBottom:10}}>⬆ Higher roles inherit lower role perks. Mod+ gets chat, react, voice etc.</p>
          {Object.entries(R).map(([k,r])=>{const all=RP(k);const own=new Set(r.p);return<div key={k} className="card" style={{marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:r.c}}>{r.i}</span><span style={{fontSize:13,fontWeight:700,color:r.c,flex:1}}>{r.n}</span><span style={{fontSize:9,color:"var(--txg)"}}>Lv {r.lv}</span></div>
            <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:4}}>{all.map(p=><span key={p} className="chip" style={{background:["ban","kick","all","manage"].includes(p)?"rgba(239,68,68,.08)":"rgba(34,197,94,.08)",color:["ban","kick","all","manage"].includes(p)?"var(--err)":"var(--ok)",opacity:own.has(p)?1:.55,fontStyle:own.has(p)?"normal":"italic"}}>{p}{!own.has(p)?" ↑":""}</span>)}</div>
          </div>})}
        </div>}

        {tab==="auto-mod"&&Object.keys(amod).map(k=><div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}>
          <div><div style={{fontSize:12,fontWeight:600}}>{k} Filter</div><div style={{fontSize:10,color:amod[k]?"var(--ok)":"var(--txm)"}}>{amod[k]?"Active":"Off"}</div></div>
          <Tg on={!!amod[k]} onChange={v=>tAM(k,v)}/>
        </div>)}

        {tab==="server"&&srv?<div>
          <div className="card" style={{marginBottom:10}}>
            <div className="sl">Server Name</div><input className="li" value={srvN} onChange={e=>setSrvN(e.target.value)} style={{marginBottom:6}}/>
            <div className="sl">Banner URL</div><input className="li" value={srvB} onChange={e=>setSrvB(e.target.value)} placeholder="https://..." style={{marginBottom:6}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12}}>Public server</span><Tg on={!!srv.isPublic} onChange={v=>{onEditSrv(srv.id,{isPublic:v});notify(v?"Public":"Private")}}/></div>
            <button className="btn bp" onClick={()=>{const ch={};if(srvN!==srv.name)ch.name=srvN;if(srvB!==(srv.banner||""))ch.banner=srvB||null;if(Object.keys(ch).length){onEditSrv(srv.id,ch);notify("Updated!")}}} style={{width:"100%"}}>💾 Save Server</button>
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

// ── CEO Panel ──
const CEOPanel=({notify,user,allUsers,onEditUser,onCreateTest,onDeleteUser,onAnnounce})=>{
  const [tab,setTab]=useState("cmd");const [cmd,setCmd]=useState("");const [log,setLog]=useState([]);const [trash,setTrash]=useState([]);
  const [annTitle,setAnnTitle]=useState("");const [annText,setAnnText]=useState("");const [annBig,setAnnBig]=useState(false);
  const fid=u=>u==="me"?"me":allUsers.find(a=>a.username===u)?.id;
  const fusr=u=>u==="me"?user:allUsers.find(a=>a.username===u);

  const run=()=>{
    if(!cmd.trim())return;const c=cmd.trim();let r="",ok=true;
    if(c==="/help")r="/setxp /addxp /addbadge /removebadge /setrole /setname /setgradient /strike /kick /ban /disable /recover /announce /purge";
    else if(c.startsWith("/setxp ")){const[,u,x]=c.split(" ");const uid=fid(u);if(uid&&x){onEditUser(uid,{xp:parseInt(x)||0});r=`✓ ${u} XP → ${x}`}else{r="✗";ok=false}}
    else if(c.startsWith("/addxp ")){const[,u,x]=c.split(" ");const uid=fid(u);const usr=fusr(u);if(uid&&usr&&x){onEditUser(uid,{xp:(usr.xp||0)+(parseInt(x)||0)});r=`✓ ${u} XP += ${x}`}else{r="✗";ok=false}}
    else if(c.startsWith("/addbadge ")){const[,u,...rest]=c.split(" ");const b=rest.join(" ");const uid=fid(u);const usr=fusr(u);if(uid&&usr&&b){onEditUser(uid,{badges:[...(usr.badges||[]),b]});r=`✓ +${b}`}else{r="✗";ok=false}}
    else if(c.startsWith("/removebadge ")){const[,u,b]=c.split(" ");const uid=fid(u);const usr=fusr(u);if(uid&&usr){onEditUser(uid,{badges:(usr.badges||[]).filter(x=>x!==b)});r="✓"}else{r="✗";ok=false}}
    else if(c.startsWith("/setrole ")){const[,u,rl]=c.split(" ");const uid=fid(u);if(uid&&rl&&R[rl]){onEditUser(uid,{role:rl});r=`✓ ${u} → ${R[rl].n}`}else{r=`✗ ${Object.keys(R).join(",")}`;ok=false}}
    else if(c.startsWith("/setname ")){const[,u,...rest]=c.split(" ");const uid=fid(u);if(uid&&rest.length){onEditUser(uid,{display:rest.join(" ")});r="✓"}else{r="✗";ok=false}}
    else if(c.startsWith("/setgradient ")){const[,u,c1,c2]=c.split(" ");const uid=fid(u);if(uid&&c1&&c2){onEditUser(uid,{gradient:{c1,c2}});r=`✓ ${c1}→${c2}`}else{r="/setgradient <u> #c1 #c2";ok=false}}
    else if(c==="/purge"){const k=Object.keys(localStorage).filter(k=>k.startsWith("ic_"));let rm=0;k.forEach(key=>{const v=localStorage.getItem(key);if(v&&v.length<3){localStorage.removeItem(key);rm++}});r=`♻️ Purged ${rm} empty keys`}
    else if(c.startsWith("/strike "))r=`⚡ ${c.split(" ")[1]}: ${c.split(" ").slice(2).join(" ")||"?"}`;
    else if(c.startsWith("/kick "))r=`🔨 ${c.split(" ")[1]} kicked`;
    else if(c.startsWith("/ban "))r=`🚫 ${c.split(" ")[1]} banned`;
    else if(c.startsWith("/disable ")){const u=c.split(" ")[1];r=`🔒 ${u} disabled`;setTrash(p=>[{u,t:new Date().toLocaleDateString()},...p]);onDeleteUser(u)}
    else if(c.startsWith("/recover ")){const u=c.split(" ")[1];r=`♻️ ${u}`;setTrash(p=>p.filter(x=>x.u!==u))}
    else if(c.startsWith("/announce ")){onAnnounce(c.substring(10));r="📢 Sent"}
    else{r="✗ /help";ok=false}
    setLog(p=>[{c,r,ok,t:new Date().toLocaleTimeString()},...p]);setCmd("");
  };

  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:170,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"14px 6px"}}>
        <div className="sl">👑 CEO</div>
        {["cmd","users","announcements","trash","storage"].map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t==="cmd"?"⌘ CMD":t}</div>)}
      </div>
      <div style={{flex:1,padding:22,overflowY:"auto"}}>
        {tab==="cmd"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:10}}>⌘ Console</h2>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:10,background:"#080808",border:"1px solid var(--bdr)"}}>
              <span style={{color:"var(--ok)",fontWeight:700}}>$</span>
              <input value={cmd} onChange={e=>setCmd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()} placeholder="/help" style={{flex:1,background:"none",border:"none",outline:"none",color:"var(--ok)",fontSize:12,fontFamily:"monospace"}}/>
            </div>
            <button className="btn bp" onClick={run} style={{fontFamily:"monospace",background:"linear-gradient(135deg,var(--ok),#16A34A)"}}>Run</button>
          </div>
          <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10}}>{["/help","/setxp","/addxp","/addbadge","/setrole","/setname","/setgradient","/purge"].map(c=><button key={c} onClick={()=>setCmd(c+" ")} style={{padding:"2px 6px",borderRadius:5,background:"var(--bg4)",border:"1px solid var(--bdr)",color:"var(--txm)",fontSize:9,cursor:"pointer",fontFamily:"monospace"}}>{c}</button>)}</div>
          {log.map((l,i)=><div key={i} style={{padding:6,borderRadius:6,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:3,fontFamily:"monospace"}}><div style={{fontSize:11,color:"var(--ok)"}}>$ {l.c}</div><div style={{fontSize:10,color:l.ok?"var(--txm)":"var(--err)"}}>{l.r}</div></div>)}
        </div>}
        {tab==="users"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:10}}>Users</h2>
          <button className="btn bp" onClick={onCreateTest} style={{marginBottom:12}}>+ Test Account</button>
          {[user,...allUsers].filter(Boolean).map(u=><div key={u.id} className="card" style={{marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
            <Av name={u.display} src={u.avatar} size={28} status={u.status}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:12,fontWeight:700,color:R[u.role]?.c}}>{u.display}</span>{u.isTest&&<MsgTag type="system"/>}{u.isMe&&<span className="chip" style={{background:"var(--gld)18",color:"var(--gld)"}}>YOU</span>}</div>
              <div style={{fontSize:10,color:"var(--txm)"}}>@{u.username} · XP:{u.xp||0} · {R[u.role]?.n}</div>
            </div>
            <div style={{display:"flex",gap:2}}>
              <button className="btn bs" onClick={()=>{const x=prompt("XP:",u.xp||0);if(x!==null){onEditUser(u.id,{xp:parseInt(x)||0});notify("Set")}}} style={{padding:"2px 5px",fontSize:8}}>XP</button>
              <button className="btn bs" onClick={()=>{const rl=prompt(Object.keys(R).join(","),u.role);if(rl&&R[rl]){onEditUser(u.id,{role:rl});notify("Set")}}} style={{padding:"2px 5px",fontSize:8}}>Role</button>
              <button className="btn bs" onClick={()=>{const b=prompt(Object.keys(B).join(","));if(b){onEditUser(u.id,{badges:[...(u.badges||[]),b]});notify("Added")}}} style={{padding:"2px 5px",fontSize:8}}>+B</button>
              {u.isTest&&<button className="btn" onClick={()=>{onDeleteUser(u.id);notify("Deleted")}} style={{padding:"2px 5px",fontSize:8,color:"var(--err)",background:"rgba(239,68,68,.06)",border:"1px solid rgba(239,68,68,.15)"}}>✕</button>}
            </div>
          </div>)}
        </div>}
        {tab==="announcements"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:10}}>📢 Announce</h2>
          <div className="card"><input className="li" value={annTitle} onChange={e=>setAnnTitle(e.target.value)} placeholder="Title" style={{marginBottom:6}}/>
            <textarea className="li" value={annText} onChange={e=>setAnnText(e.target.value)} placeholder="Content..." rows={3} style={{resize:"vertical",marginBottom:6}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11}}>Splash popup</span><Tg on={annBig} onChange={setAnnBig}/></div>
            <button className="btn bp" onClick={()=>{if(!annText.trim()){notify("Empty");return}onAnnounce(annText.trim(),annBig,annTitle.trim());setAnnTitle("");setAnnText("");notify("Sent!")}}>📢 Send</button>
          </div>
        </div>}
        {tab==="trash"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:10}}>🗑 Trash</h2>
          {!trash.length?<p style={{color:"var(--txg)",fontSize:12}}>Empty</p>:trash.map((a,i)=><div key={i} className="card" style={{marginBottom:4}}>
            <b>{a.u}</b> <span style={{fontSize:10,color:"var(--txg)"}}>· {a.t}</span>
            <button className="btn bs" onClick={()=>{setTrash(p=>p.filter((_,j)=>j!==i));notify("Recovered")}} style={{marginTop:4,fontSize:10,color:"var(--ok)"}}>♻️</button>
          </div>)}
        </div>}
        {tab==="storage"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:10}}>💾 Storage</h2>
          {(()=>{let t=0,c=0;Object.keys(localStorage).filter(k=>k.startsWith("ic_")).forEach(k=>{t+=localStorage.getItem(k).length;c++});const kb=Math.round(t/1024);return<div>
            <div className="card" style={{marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,fontWeight:600}}>Total used</span><span style={{fontSize:12,fontWeight:700,color:"var(--acl)"}}>{kb} KB</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12}}>Keys</span><span style={{fontSize:12,fontWeight:600}}>{c}</span></div>
              <div style={{width:"100%",height:6,borderRadius:3,background:"var(--bdr)",marginTop:8,overflow:"hidden"}}><div style={{width:`${Math.min(kb/5000*100,100)}%`,height:"100%",borderRadius:3,background:kb>3000?"var(--err)":kb>1000?"var(--wrn)":"var(--ok)"}}/></div>
              <div style={{fontSize:9,color:"var(--txg)",marginTop:2}}>{kb>3000?"⚠ High usage":"✓ Healthy"} · ~5 MB limit</div>
            </div>
            <button className="btn bp" onClick={()=>{Object.keys(localStorage).filter(k=>k.startsWith("ic_")&&!["ic_user","ic_theme","ic_settings"].includes(k)).forEach(k=>{const v=localStorage.getItem(k);if(v&&(v==="null"||v==="undefined"||v.length<3))localStorage.removeItem(k)});notify("Cleaned!")}} style={{width:"100%",marginBottom:6}}>🧹 Clean Empty Data</button>
            <button className="btn" onClick={()=>{if(confirm("Clear ALL data? You'll be logged out.")){Object.keys(localStorage).filter(k=>k.startsWith("ic_")).forEach(k=>localStorage.removeItem(k));location.reload()}}} style={{width:"100%",background:"rgba(239,68,68,.08)",color:"var(--err)",border:"1px solid rgba(239,68,68,.2)",fontWeight:700}}>🗑 Clear Everything</button>
          </div>})()}
        </div>}
      </div>
    </div>
  );
};

// ── Plugins ──
const PlugPanel=({notify})=>{
  const [tab,setTab]=useState("plugins");const [on,setOn]=useState(()=>{try{return JSON.parse(localStorage.getItem("ic_plg"))||{}}catch(e){return{}}});const [bon,setBon]=useState(()=>{try{return JSON.parse(localStorage.getItem("ic_bot"))||{}}catch(e){return{}}});const [gh,setGh]=useState(false);
  const tP=(id)=>{const n={...on,[id]:!on[id]};setOn(n);try{localStorage.setItem("ic_plg",JSON.stringify(n))}catch(e){}notify(`${PLG.find(p=>p.id===id)?.n} ${n[id]?"on":"off"}`)};
  const tB=(id)=>{const n={...bon,[id]:!bon[id]};setBon(n);try{localStorage.setItem("ic_bot",JSON.stringify(n))}catch(e){}notify(`${BOT.find(b=>b.id===id)?.n} ${n[id]?"on":"off"}`)};
  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:170,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"14px 6px"}}>
        <div className="sl">🧩 Plugins</div>
        {["plugins","ai bots","my plugins"].map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t}</div>)}
      </div>
      <div style={{flex:1,padding:22,overflowY:"auto"}}>
        {tab==="plugins"&&PLG.map(p=><div key={p.id} className="card" style={{marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}>{p.i}</span>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:13,fontWeight:700}}>{p.n}</span>{p.v&&<span className="chip" style={{background:"rgba(34,197,94,.1)",color:"var(--ok)"}}>Official</span>}</div><div style={{fontSize:11,color:"var(--txm)",marginTop:1}}>{p.d}</div></div>
          <Tg on={!!on[p.id]} onChange={()=>tP(p.id)}/>
        </div>)}
        {tab==="ai bots"&&BOT.map(b=><div key={b.id} className="card" style={{marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:10,background:`${b.c}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{b.i}</div>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:13,fontWeight:700,color:b.c}}>{b.n}</span><MsgTag type="ia"/></div><div style={{fontSize:11,color:"var(--txm)",marginTop:1}}>{b.d}</div></div>
          <Tg on={!!bon[b.id]} onChange={()=>tB(b.id)}/>
        </div>)}
        {tab==="my plugins"&&<div>
          <div className="card" style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:22}}>🐙</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>GitHub</div><div style={{fontSize:11,color:"var(--txm)"}}>Link for custom plugins</div></div>
            <button className={`btn ${gh?"bs":"bp"}`} onClick={()=>{setGh(!gh);notify(gh?"Unlinked":"Linked!")}}>{gh?"✓":"Link"}</button>
          </div>
        </div>}
      </div>
    </div>
  );
};

// ── Voice ──
const VoicePanel=({ch,onClose,notify})=>{
  const [m,setM]=useState(false);const [d,setD]=useState(false);const [v,setV]=useState(80);
  return(<div style={{padding:10,borderTop:"1px solid var(--bdr)",background:"var(--bg4)"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
      <div><div style={{fontSize:10,fontWeight:700,color:"var(--ok)"}}>🔊 Connected</div><div style={{fontSize:9,color:"var(--txg)"}}>{ch?.name}</div></div>
      <button className="btn bs" onClick={onClose} style={{padding:"2px 6px",fontSize:9,color:"var(--err)"}}>✕</button>
    </div>
    <div style={{display:"flex",gap:3,marginBottom:6}}>
      <button onClick={()=>{setM(!m);notify(m?"Unmuted":"Muted")}} style={{flex:1,padding:5,borderRadius:7,background:m?"rgba(239,68,68,.1)":"var(--bg3)",border:`1px solid ${m?"rgba(239,68,68,.3)":"var(--bdr)"}`,color:m?"var(--err)":"var(--tx2)",fontSize:14,cursor:"pointer"}}>{m?"🔇":"🎙"}</button>
      <button onClick={()=>{setD(!d);notify(d?"Undeafened":"Deafened")}} style={{flex:1,padding:5,borderRadius:7,background:d?"rgba(239,68,68,.1)":"var(--bg3)",border:`1px solid ${d?"rgba(239,68,68,.3)":"var(--bdr)"}`,color:d?"var(--err)":"var(--tx2)",fontSize:14,cursor:"pointer"}}>{d?"🔕":"🔔"}</button>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:9}}>🔊</span><input type="range" min="0" max="200" value={v} onChange={e=>setV(e.target.value)} style={{flex:1,accentColor:"var(--acc)"}}/><span style={{fontSize:8,color:"var(--txg)",fontFamily:"monospace"}}>{v}%</span></div>
  </div>);
};

// ── Settings — fully persisted switches, gradient, storage, logout ──
const SetPanel=({theme,setTheme,user,notify,onPay,onLogout,onEditUser,settings,onSetSettings})=>{
  const [tab,setTab]=useState("appearance");const [logoutC,setLogoutC]=useState(false);
  const [eN,setEN]=useState(user?.display||"");const [eU,setEU]=useState(user?.username||"");const [eE,setEE]=useState(user?.email||"");const [eAv,setEAv]=useState(user?.avatar||"");
  const [eG1,setEG1]=useState(user?.gradient?.c1||"");const [eG2,setEG2]=useState(user?.gradient?.c2||"");
  const canGr=user?.premium&&P[user.premium]?.unlocks?.gradient;

  useEffect(()=>{setEN(user?.display||"");setEU(user?.username||"");setEE(user?.email||"");setEAv(user?.avatar||"");setEG1(user?.gradient?.c1||"");setEG2(user?.gradient?.c2||"")},[user?.display,user?.username,user?.email,user?.avatar,user?.gradient?.c1,user?.gradient?.c2]);

  const saveAcc=()=>{
    const ch={};
    if(eN.trim()&&eN!==user.display)ch.display=eN.trim();
    if(eU.trim()&&eU!==user.username)ch.username=eU.trim();
    if(eE!==user.email)ch.email=eE.trim();
    if(eAv!==(user.avatar||""))ch.avatar=eAv.trim()||null;
    if(canGr&&eG1&&eG2)ch.gradient={c1:eG1,c2:eG2};else if(canGr&&!eG1&&!eG2&&user.gradient)ch.gradient=null;
    if(Object.keys(ch).length){onEditUser("me",ch);notify("Saved!")}else notify("No changes");
  };

  const ps=k=>settings?.privacy?.[k]??DSET.privacy[k];
  const ns=k=>settings?.notifs?.[k]??DSET.notifs[k];
  const as=k=>settings?.access?.[k]??DSET.access[k];
  const setP=(k,v)=>onSetSettings({...settings,privacy:{...(settings?.privacy||DSET.privacy),[k]:v}});
  const setN=(k,v)=>onSetSettings({...settings,notifs:{...(settings?.notifs||DSET.notifs),[k]:v}});
  const setA=(k,v)=>onSetSettings({...settings,access:{...(settings?.access||DSET.access),[k]:v}});

  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:170,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"14px 6px"}}>
        <div className="sl">Settings</div>
        {["appearance","account","gradient","privacy","notifications","accessibility","premium"].map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)} style={{textTransform:"capitalize"}}>{t}</div>)}
        <div style={{borderTop:"1px solid var(--bdr)",marginTop:8,paddingTop:8}}><div className="ch" onClick={()=>setLogoutC(true)} style={{color:"var(--err)"}}>🚪 Logout</div></div>
      </div>
      <div style={{flex:1,padding:22,overflowY:"auto"}}>
        {tab==="appearance"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Appearance</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
            {[["dark","Dark Nebula","🌌"],["midnight","Midnight","🌙"],["void","Void","⚫"],["light","Light Cloud","☁"]].map(([k,n,ic])=>
              <div key={k} onClick={()=>{setTheme(k);notify(`Theme: ${n}`)}} className="card" style={{cursor:"pointer",borderColor:theme===k?"var(--acc)":"var(--bdr)",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:18}}>{ic}</span><span style={{fontSize:13,fontWeight:700,color:theme===k?"var(--acl)":"var(--tx2)"}}>{n}</span>
                {theme===k&&<span style={{marginLeft:"auto",fontSize:10,color:"var(--ok)"}}>✓</span>}
              </div>
            )}
          </div>
        </div>}

        {tab==="account"&&user&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Account</h2>
          <div className="card" style={{marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Av name={eN||user.display} src={eAv||user.avatar} size={48} status={user.status} anim={user.animAvatar}/>
              <div><div style={{fontSize:15,fontWeight:800,...(user.gradient?{background:`linear-gradient(90deg,${user.gradient.c1},${user.gradient.c2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}:{color:R[user.role]?.c})}}>{eN||user.display}</div>
                <div style={{fontSize:11,color:"var(--txm)"}}>@{eU||user.username} · {R[user.role]?.n}</div>
                {user.premium&&<span className="chip" style={{background:`${P[user.premium].c}15`,color:P[user.premium].c,marginTop:3}}>✨ {P[user.premium].n}</span>}
              </div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div><div className="sl">Display Name</div><input className="li" value={eN} onChange={e=>setEN(e.target.value)}/></div>
            <div><div className="sl">Username</div><input className="li" value={eU} onChange={e=>setEU(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))}/></div>
            <div><div className="sl">Email</div><input className="li" value={eE} onChange={e=>setEE(e.target.value)} type="email"/></div>
            <div><div className="sl">Avatar URL</div><input className="li" value={eAv} onChange={e=>setEAv(e.target.value)} placeholder="https://..."/>
              {eAv&&<div style={{marginTop:6,display:"flex",justifyContent:"center"}}><img src={eAv} style={{width:56,height:56,borderRadius:"50%",objectFit:"cover",border:"2px solid var(--bdr)"}} onError={e=>e.target.style.display="none"}/></div>}
            </div>
            <button className="btn bp" onClick={saveAcc}>💾 Save</button>
          </div>
        </div>}

        {tab==="gradient"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Name Gradient</h2>
          {canGr?<div>
            <div className="sl">Presets</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>{GRAD.map(g=><div key={g.id} onClick={()=>{setEG1(g.c1);setEG2(g.c2)}} style={{padding:"4px 10px",borderRadius:8,background:`linear-gradient(90deg,${g.c1},${g.c2})`,cursor:"pointer",border:eG1===g.c1&&eG2===g.c2?"2px solid #fff":"2px solid transparent",fontSize:11,fontWeight:700,color:"#fff"}}>{g.n}</div>)}</div>
            <div className="sl">Custom</div>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:8}}>
              <input type="color" value={eG1||"#A855F7"} onChange={e=>setEG1(e.target.value)} style={{width:44,height:32,border:"none",cursor:"pointer",borderRadius:6}}/>
              <div style={{flex:1,height:24,borderRadius:6,background:eG1&&eG2?`linear-gradient(90deg,${eG1},${eG2})`:"var(--bdr)"}}/>
              <input type="color" value={eG2||"#F472B6"} onChange={e=>setEG2(e.target.value)} style={{width:44,height:32,border:"none",cursor:"pointer",borderRadius:6}}/>
            </div>
            <div className="card" style={{textAlign:"center",marginBottom:12}}>
              <span style={{fontSize:20,fontWeight:800,...(eG1&&eG2?{background:`linear-gradient(90deg,${eG1},${eG2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}:{})}}>{user?.display||"Preview"}</span>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button className="btn bp" onClick={()=>{if(eG1&&eG2){onEditUser("me",{gradient:{c1:eG1,c2:eG2}});notify("Applied!")}}} style={{flex:1}}>💾 Apply</button>
              <button className="btn bs" onClick={()=>{setEG1("");setEG2("");onEditUser("me",{gradient:null});notify("Removed")}}>✕ Remove</button>
            </div>
          </div>:<div className="card" style={{textAlign:"center",padding:20}}>
            <div style={{fontSize:28,marginBottom:8}}>✨</div>
            <p style={{fontSize:11,color:"var(--txm)",marginBottom:12}}>Custom gradient requires Airbound+</p>
            <button className="btn bp" onClick={()=>setTab("premium")}>View Plans</button>
          </div>}
        </div>}

        {tab==="privacy"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Privacy</h2>
          {[["dms","Allow DMs","Who can message you"],["online","Online status","Show when active"],["friends","Friend requests","Allow requests"],["activity","Activity status","Show what you're doing"],["data","Analytics","Anonymous usage data"]].map(([k,n,d])=>
            <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}>
              <div><div style={{fontSize:12,fontWeight:600}}>{n}</div><div style={{fontSize:10,color:"var(--txm)"}}>{d}</div></div>
              <Tg on={!!ps(k)} onChange={v=>{setP(k,v);notify(`${n}: ${v?"on":"off"}`)}}/>
            </div>
          )}
        </div>}

        {tab==="notifications"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Notifications</h2>
          {[["messages","Messages","New message alerts"],["mentions","Mentions","@mention notifications"],["sounds","Sounds","Notification sounds"],["desktop","Desktop","Browser push notifications"]].map(([k,n,d])=>
            <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}>
              <div><div style={{fontSize:12,fontWeight:600}}>{n}</div><div style={{fontSize:10,color:"var(--txm)"}}>{d}</div></div>
              <Tg on={!!ns(k)} onChange={v=>{setN(k,v);notify(`${n}: ${v?"on":"off"}`)}}/>
            </div>
          )}
        </div>}

        {tab==="accessibility"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Accessibility</h2>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}>
            <div><div style={{fontSize:12,fontWeight:600}}>Reduced motion</div><div style={{fontSize:10,color:"var(--txm)"}}>Disable animations</div></div>
            <Tg on={!!as("reducedMotion")} onChange={v=>{setA("reducedMotion",v);notify(`Motion: ${v?"reduced":"normal"}`)}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}>
            <div><div style={{fontSize:12,fontWeight:600}}>Compact mode</div><div style={{fontSize:10,color:"var(--txm)"}}>Smaller spacing</div></div>
            <Tg on={!!as("compactMode")} onChange={v=>{setA("compactMode",v);notify(`Compact: ${v?"on":"off"}`)}}/>
          </div>
          <div style={{padding:12,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)"}}>
            <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>Font size: {as("fontSize")||13}px</div>
            <input type="range" min="11" max="18" value={as("fontSize")||13} onChange={e=>setA("fontSize",parseInt(e.target.value))} style={{width:"100%",accentColor:"var(--acc)"}}/>
          </div>
        </div>}

        {tab==="premium"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,marginBottom:12}}>Premium</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {Object.entries(P).map(([k,p])=>{const act=user?.premium===k;return<div key={k} className="card" style={{borderColor:act?`${p.c}60`:`${p.c}30`,textAlign:"center"}}>
              {act&&<div className="chip" style={{background:`${p.c}18`,color:p.c,marginBottom:4}}>✓ Active</div>}
              <div style={{fontSize:18,fontWeight:800,color:p.c,marginBottom:2}}>{p.n}</div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>${p.p.toFixed(2)}<span style={{fontSize:10,color:"var(--txm)"}}>/mo</span></div>
              {p.perks.map(pk=><div key={pk} style={{fontSize:10,color:"var(--txm)",marginBottom:1}}>✓ {pk}</div>)}
              <button className="btn bp" onClick={()=>act?notify("Active!"):onPay(k)} style={{width:"100%",marginTop:8,background:act?"var(--bg4)":`linear-gradient(135deg,${p.c},${p.c}88)`,fontSize:11,color:act?"var(--txm)":"#fff"}}>{act?"Current":"Subscribe"}</button>
            </div>})}
          </div>
        </div>}
      </div>
      {logoutC&&<div className="modal" onClick={()=>setLogoutC(false)}><div className="mcard" onClick={e=>e.stopPropagation()} style={{width:320,padding:24,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>🚪</div>
        <h2 style={{fontSize:16,fontWeight:800,marginBottom:4}}>Logout?</h2>
        <p style={{fontSize:12,color:"var(--txm)",marginBottom:16}}>Clears session and all local data.</p>
        <div style={{display:"flex",gap:8}}>
          <button className="btn bs" onClick={()=>setLogoutC(false)} style={{flex:1}}>Cancel</button>
          <button className="btn" onClick={onLogout} style={{flex:1,background:"rgba(239,68,68,.12)",color:"var(--err)",border:"1px solid rgba(239,68,68,.25)",fontWeight:700}}>Logout</button>
        </div>
      </div></div>}
    </div>
  );
};
