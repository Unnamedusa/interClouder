/* ═══ interClouder v4.5 — All Panels ═══ */

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
        {(!msgs||!msgs.length)&&<div style={{textAlign:"center",padding:50,color:"var(--txg)"}}><div style={{fontSize:36,marginBottom:8}}>💬</div><div style={{fontSize:15,fontWeight:700,color:"var(--txm)"}}>Welcome to #{ch?.name||"channel"}</div><p style={{fontSize:11,marginTop:3}}>Start the conversation!</p></div>}
        {(msgs||[]).map(m=>(
          <div key={m.id} className="msg">
            <Av name={m.user} size={34}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:12,fontWeight:700,color:m.color||"var(--tx)"}}>{m.user}</span>
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

// ── Profile Modal ──
const ProfileModal=({user,onClose,notify,isOwner,onEditUser})=>{
  const [editMode,setEditMode]=useState(false);const [badgeImg,setBadgeImg]=useState("");const [badgeName,setBadgeName]=useState("");
  const [bannerUrl,setBannerUrl]=useState(user?.banner||"");const [avatarUrl,setAvatarUrl]=useState(user?.avatar||"");
  const r=R[user?.role]||R.cloud;
  const canAnimAvatar=user?.premium&&P[user.premium]?.unlocks?.animAvatar;
  const canBanner=user?.premium&&P[user.premium]?.unlocks?.customBanner;
  const canAnimBanner=user?.premium&&P[user.premium]?.unlocks?.animBanner;

  return(
    <div className="modal" onClick={onClose}><div className="mcard" onClick={e=>e.stopPropagation()} style={{width:340,overflow:"hidden"}}>
      {/* Banner */}
      {user?.banner?<img src={user.banner} className={`banner ${canAnimBanner?"banner-anim":""}`}/>
      :<div className={`banner ${canAnimBanner?"banner-anim":""}`} style={{background:`linear-gradient(135deg,${r.c},${r.c}88)`}}/>}

      <div style={{padding:"0 18px 18px",marginTop:-28}}>
        <Av name={user?.display} src={user?.avatar} size={56} status={user?.status} anim={canAnimAvatar} style={{border:"3px solid var(--bg2)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:6}}>
          <span style={{fontSize:16,fontWeight:800,color:r.c}}>{user?.display}</span><span style={{fontSize:10,color:r.c}}>{r.i}</span>
          {user?.isTest&&<MsgTag type="system"/>}
        </div>
        <div style={{fontSize:11,color:"var(--txm)"}}>@{user?.username}</div>

        {/* Role & Premium */}
        <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>
          <span className="chip" style={{background:`${r.c}15`,color:r.c}}>{r.i} {r.n}</span>
          {user?.premium&&<span className="chip" style={{background:`${P[user.premium].c}15`,color:P[user.premium].c}}>✨ {P[user.premium].n}</span>}
        </div>

        {/* Badges */}
        <div style={{marginTop:10}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:9,color:"var(--txg)",textTransform:"uppercase"}}>Badges</span>
            {(user?.isMe||isOwner)&&<span onClick={()=>setEditMode(!editMode)} style={{fontSize:9,color:"var(--acc)",cursor:"pointer"}}>{editMode?"Done":"Edit"}</span>}
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {(user?.badges||[]).map((b,i)=><div key={i} style={{position:"relative"}}><Bdg id={b} size={22}/>
              {editMode&&<div onClick={()=>{if(onEditUser){const nb=[...(user.badges||[])];nb.splice(i,1);onEditUser(user.id,{badges:nb});notify("Badge removed")}}} style={{position:"absolute",top:-6,right:-6,width:12,height:12,borderRadius:6,background:"var(--err)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:7,color:"#fff"}}>×</div>}
            </div>)}
            {/* Custom image badges */}
            {(user?.customBadges||[]).map((cb,i)=><div key={"c"+i} style={{position:"relative"}} title={cb.name}>
              {cb.img?<img src={cb.img} style={{width:22,height:22,borderRadius:4}}/>:<span style={{fontSize:15}}>⭐</span>}
              {editMode&&<div onClick={()=>{if(onEditUser){const nb=[...(user.customBadges||[])];nb.splice(i,1);onEditUser(user.id,{customBadges:nb});notify("Custom badge removed")}}} style={{position:"absolute",top:-6,right:-6,width:12,height:12,borderRadius:6,background:"var(--err)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:7,color:"#fff"}}>×</div>}
            </div>)}
            {(!user?.badges?.length&&!user?.customBadges?.length)&&<span style={{fontSize:10,color:"var(--txg)"}}>No badges</span>}
          </div>
          {editMode&&<div style={{marginTop:6,display:"flex",gap:3}}>
            <input className="li" value={badgeName} onChange={e=>setBadgeName(e.target.value)} placeholder="Badge name" style={{flex:1,fontSize:10}}/>
            <input className="li" value={badgeImg} onChange={e=>setBadgeImg(e.target.value)} placeholder="Image URL" style={{flex:1,fontSize:10}}/>
            <button className="btn bs" onClick={()=>{if(badgeName.trim()&&onEditUser){onEditUser(user.id,{customBadges:[...(user.customBadges||[]),{name:badgeName.trim(),img:badgeImg.trim()||null}]});setBadgeName("");setBadgeImg("");notify("Badge added!")}}} style={{padding:"4px 8px",fontSize:10}}>+</button>
          </div>}
        </div>

        {/* XP */}
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10}}>
          <span style={{fontSize:9,color:"var(--txg)"}}>XP</span><XPBar xp={user?.xp||0} w={120}/><span style={{fontSize:9,color:"var(--txm)",fontFamily:"monospace"}}>{user?.xp||0}</span>
        </div>

        {/* Edit avatar/banner (if premium) */}
        {editMode&&(user?.isMe||isOwner)&&<div style={{marginTop:10,display:"flex",flexDirection:"column",gap:4}}>
          <div className="sl">Customize</div>
          <input className="li" value={avatarUrl} onChange={e=>setAvatarUrl(e.target.value)} placeholder="Avatar URL" style={{fontSize:10}}/>
          {canBanner&&<input className="li" value={bannerUrl} onChange={e=>setBannerUrl(e.target.value)} placeholder="Banner URL (Elite+)" style={{fontSize:10}}/>}
          {!canBanner&&<p style={{fontSize:9,color:"var(--txg)"}}>🔒 Custom banner requires Airbound Elite+</p>}
          <button className="btn bs" onClick={()=>{if(onEditUser){onEditUser(user.id,{avatar:avatarUrl||null,banner:canBanner?bannerUrl||null:user.banner});notify("Profile updated!")}}} style={{fontSize:10}}>Save</button>
        </div>}

        <button className="btn bp" onClick={onClose} style={{width:"100%",marginTop:12}}>Close</button>
      </div>
    </div></div>
  );
};

// ── Moderation ──
const ModPanel=({srvs,aS,notify})=>{
  const [tab,setTab]=useState("strikes");const [su,setSu]=useState("");const [sr,setSr]=useState("");const [bd,setBd]=useState("permanent");
  const srv=srvs.find(s=>s.id===aS);
  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:170,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"14px 6px"}}>
        <div className="sl">Moderation</div>
        {["strikes","kick / ban","slowmode","privileges","auto-mod"].map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t}</div>)}
      </div>
      <div style={{flex:1,padding:22,overflowY:"auto"}}>
        <h2 style={{fontSize:16,fontWeight:800,color:"var(--tx)",marginBottom:14,textTransform:"capitalize"}}>{tab}</h2>
        {tab==="strikes"&&<div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:12}}>
            {STR.map((s,i)=><div key={i} style={{padding:6,borderRadius:7,background:"var(--bg4)",border:"1px solid var(--bdr)",textAlign:"center"}}><div style={{fontSize:14,fontWeight:800,color:i<2?"var(--wrn)":i<5?"#F59E0B":i<7?"var(--pk)":"var(--err)"}}>{s.n}</div><div style={{fontSize:9,color:"var(--txm)"}}>{s.a}</div></div>)}
          </div>
          <div className="card" style={{marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--tx)",marginBottom:8}}>Issue Strike</div>
            <input className="li" value={su} onChange={e=>setSu(e.target.value)} placeholder="Username..." style={{marginBottom:6}}/>
            <input className="li" value={sr} onChange={e=>setSr(e.target.value)} placeholder="Reason..." style={{marginBottom:6}}/>
            <button className="btn bp" onClick={()=>{if(!su||!sr){notify("Fill fields");return}notify(`⚡ Strike → ${su}: ${sr}`);setSr("")}} style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>⚡ Strike</button>
          </div>
        </div>}
        {tab==="kick / ban"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Kick","🔨","var(--pk)"],["Ban","🚫","var(--err)"]].map(([a,ic,c])=><div key={a} className="card">
            <div style={{fontSize:22,marginBottom:4}}>{ic}</div><div style={{fontSize:14,fontWeight:700,color:c,marginBottom:6}}>{a}</div>
            <input className="li" placeholder="Username..." style={{marginBottom:6,fontSize:11}}/>
            <input className="li" placeholder="Reason..." style={{marginBottom:6,fontSize:11}}/>
            {a==="Ban"&&<select className="li" value={bd} onChange={e=>setBd(e.target.value)} style={{marginBottom:6,fontSize:11}}><option>permanent</option><option>1d</option><option>7d</option><option>30d</option></select>}
            <button className="btn" onClick={()=>notify(`${a} executed!`)} style={{width:"100%",background:`${c}12`,color:c,border:`1px solid ${c}30`,fontWeight:700,fontSize:12}}>{ic} {a}</button>
          </div>)}
        </div>}
        {tab==="slowmode"&&srv&&srv.channels.map(ch=><div key={ch.id} style={{display:"flex",alignItems:"center",gap:8,padding:8,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}>
          <span style={{color:"var(--txg)"}}>#</span><span style={{fontSize:12,fontWeight:600,color:"var(--tx)",flex:1}}>{ch.name}</span>
          <select className="li" value={ch.slowmode||0} onChange={e=>{ch.slowmode=parseInt(e.target.value);notify(`#${ch.name}: ${smL(parseInt(e.target.value))}`)}} style={{width:100,padding:"3px 6px",fontSize:11}}>
            {SM.map(v=><option key={v} value={v}>{smL(v)}</option>)}
          </select>
        </div>)}
        {tab==="privileges"&&Object.entries(R).map(([k,r])=><div key={k} className="card" style={{marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{color:r.c}}>{r.i}</span><span style={{fontSize:13,fontWeight:700,color:r.c,flex:1}}>{r.n}</span></div>
          <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:4}}>{r.p.map(p=><span key={p} className="chip" style={{background:["ban","kick","all"].includes(p)?"rgba(239,68,68,.08)":"rgba(34,197,94,.08)",color:["ban","kick","all"].includes(p)?"var(--err)":"var(--ok)"}}>{p}</span>)}</div>
        </div>)}
        {tab==="auto-mod"&&["Spam","Links","Mentions","Invites","Caps","Words","Raids","NSFW"].map((n,i)=><div key={n} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:10,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}>
          <span style={{fontSize:12,fontWeight:600,color:"var(--tx)"}}>{n} Filter</span><Tg on={i<3||i>5} onChange={()=>notify(`${n} toggled`)}/>
        </div>)}
      </div>
    </div>
  );
};

// ── CEO Admin Panel (XP, badges, ranks, test accounts, trash, announcements) ──
const CEOPanel=({notify,user,allUsers,onEditUser,onCreateTest,onDeleteUser,onAnnounce})=>{
  const [tab,setTab]=useState("cmd");const [cmd,setCmd]=useState("");const [log,setLog]=useState([]);const [trash,setTrash]=useState([]);
  const [annTitle,setAnnTitle]=useState("");const [annText,setAnnText]=useState("");const [annBig,setAnnBig]=useState(false);

  const run=()=>{
    if(!cmd.trim())return;const c=cmd.trim();let r="",ok=true;
    if(c==="/help")r="Commands: /addadmin <u> · /removeadmin <u> · /promote <u> <role> · /demote <u> · /setxp <u> <amount> · /addxp <u> <amount> · /addbadge <u> <badge> · /removebadge <u> <badge> · /setrole <u> <role> · /strike <u> <reason> · /kick <u> · /ban <u> [dur] · /unban <u> · /globalban <u> · /globalstrike <u> · /disable <u> · /recover <u> · /slowmode <ch> <sec> · /announce <msg>";
    else if(c.startsWith("/setxp ")){const[,u,x]=c.split(" ");if(u&&x){onEditUser(u==="me"?"me":allUsers.find(a=>a.username===u)?.id,{xp:parseInt(x)||0});r=`✓ ${u} XP → ${x}`}else{r="Usage: /setxp <user> <amount>";ok=false}}
    else if(c.startsWith("/addxp ")){const[,u,x]=c.split(" ");if(u&&x){const usr=u==="me"?user:allUsers.find(a=>a.username===u);if(usr){onEditUser(usr.id,{xp:(usr.xp||0)+(parseInt(x)||0)});r=`✓ ${u} XP += ${x}`}else{r=`✗ User not found`;ok=false}}else{r="Usage: /addxp <user> <amount>";ok=false}}
    else if(c.startsWith("/addbadge ")){const[,u,...rest]=c.split(" ");const b=rest.join(" ");if(u&&b){const uid=u==="me"?"me":allUsers.find(a=>a.username===u)?.id;if(uid){const usr=uid==="me"?user:allUsers.find(a=>a.id===uid);onEditUser(uid,{badges:[...(usr?.badges||[]),b]});r=`✓ Badge "${b}" → ${u}`}else{r="✗ User not found";ok=false}}else{r="Usage: /addbadge <user> <badge_id>";ok=false}}
    else if(c.startsWith("/removebadge ")){const[,u,b]=c.split(" ");if(u&&b){const uid=u==="me"?"me":allUsers.find(a=>a.username===u)?.id;if(uid){const usr=uid==="me"?user:allUsers.find(a=>a.id===uid);onEditUser(uid,{badges:(usr?.badges||[]).filter(x=>x!==b)});r=`✓ Badge "${b}" removed from ${u}`}else{r="✗ User not found";ok=false}}}
    else if(c.startsWith("/setrole ")){const[,u,rl]=c.split(" ");if(u&&rl&&R[rl]){onEditUser(u==="me"?"me":allUsers.find(a=>a.username===u)?.id,{role:rl});r=`✓ ${u} role → ${R[rl].n}`}else{r=`✗ Invalid. Roles: ${Object.keys(R).join(", ")}`;ok=false}}
    else if(c.startsWith("/addadmin "))r=`✓ ${c.split(" ")[1]} → Admin`;
    else if(c.startsWith("/removeadmin "))r=`✓ ${c.split(" ")[1]} admin removed`;
    else if(c.startsWith("/promote ")){const[,u,rl]=c.split(" ");r=`✓ ${u} promoted to ${rl||"next"}`}
    else if(c.startsWith("/demote "))r=`✓ ${c.split(" ")[1]} demoted`;
    else if(c.startsWith("/strike "))r=`⚡ Strike → ${c.split(" ")[1]}: ${c.split(" ").slice(2).join(" ")||"No reason"}`;
    else if(c.startsWith("/kick "))r=`🔨 ${c.split(" ")[1]} kicked`;
    else if(c.startsWith("/ban "))r=`🚫 ${c.split(" ")[1]} banned ${c.split(" ")[2]||"permanently"}`;
    else if(c.startsWith("/unban "))r=`✓ ${c.split(" ")[1]} unbanned`;
    else if(c.startsWith("/globalban "))r=`🚫 GLOBAL: ${c.split(" ")[1]} banned`;
    else if(c.startsWith("/globalstrike "))r=`⚡ GLOBAL: ${c.split(" ")[1]} struck`;
    else if(c.startsWith("/disable ")){const u=c.split(" ")[1];r=`🔒 ${u} disabled (14d)`;setTrash(p=>[{u,t:new Date().toLocaleDateString(),ok:true},...p]);if(onDeleteUser)onDeleteUser(u)}
    else if(c.startsWith("/recover ")){const u=c.split(" ")[1];r=`♻️ ${u} recovered`;setTrash(p=>p.filter(x=>x.u!==u))}
    else if(c.startsWith("/announce ")){const msg=c.substring(10);onAnnounce(msg);r=`📢 Announced: ${msg}`}
    else{r="✗ Unknown. /help";ok=false}
    setLog(p=>[{c,r,ok,t:new Date().toLocaleTimeString()},...p]);setCmd("");
  };

  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:170,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"14px 6px"}}>
        <div className="sl">👑 CEO Panel</div>
        {["cmd","users","announcements","trash"].map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t==="cmd"?"⌘ CMD":t}</div>)}
      </div>
      <div style={{flex:1,padding:22,overflowY:"auto"}}>
        {tab==="cmd"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,color:"var(--tx)",marginBottom:10}}>⌘ Command Console</h2>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            <div style={{flex:1,display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:10,background:"#080808",border:"1px solid var(--bdr)"}}>
              <span style={{color:"var(--ok)",fontWeight:700}}>$</span>
              <input value={cmd} onChange={e=>setCmd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&run()} placeholder="/help" style={{flex:1,background:"none",border:"none",outline:"none",color:"var(--ok)",fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}/>
            </div>
            <button className="btn bp" onClick={run} style={{fontFamily:"'JetBrains Mono',monospace",background:"linear-gradient(135deg,var(--ok),#16A34A)"}}>Run</button>
          </div>
          <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:10}}>
            {["/help","/setxp","/addxp","/addbadge","/setrole","/strike","/ban","/disable","/recover","/announce"].map(c=><button key={c} onClick={()=>setCmd(c+" ")} style={{padding:"2px 6px",borderRadius:5,background:"var(--bg4)",border:"1px solid var(--bdr)",color:"var(--txm)",fontSize:9,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{c}</button>)}
          </div>
          {log.map((l,i)=><div key={i} style={{padding:6,borderRadius:6,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:3,fontFamily:"'JetBrains Mono',monospace"}}>
            <div style={{fontSize:11,color:"var(--ok)"}}>$ {l.c}</div>
            <div style={{fontSize:10,color:l.ok?"var(--txm)":"var(--err)"}}>{l.r}</div>
            <div style={{fontSize:8,color:"var(--txg)"}}>{l.t}</div>
          </div>)}
        </div>}

        {tab==="users"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,color:"var(--tx)",marginBottom:10}}>User Management</h2>
          <button className="btn bp" onClick={onCreateTest} style={{marginBottom:12}}>+ Create Test Account</button>
          {[user,...allUsers].filter(Boolean).map(u=><div key={u.id} className="card" style={{marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
            <Av name={u.display} size={30} status={u.status}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12,fontWeight:700,color:R[u.role]?.c||"var(--tx)"}}>{u.display}</span>{u.isTest&&<MsgTag type="system"/>}{u.isMe&&<span className="chip" style={{background:"var(--gld)18",color:"var(--gld)"}}>YOU</span>}</div>
              <div style={{fontSize:10,color:"var(--txm)"}}>@{u.username} · XP:{u.xp||0} · {R[u.role]?.n}</div>
            </div>
            <div style={{display:"flex",gap:3}}>
              <button className="btn bs" onClick={()=>{const x=prompt("Set XP:",u.xp||0);if(x!==null){onEditUser(u.id,{xp:parseInt(x)||0});notify(`XP → ${x}`)}}} style={{padding:"2px 6px",fontSize:9}}>XP</button>
              <button className="btn bs" onClick={()=>{const rl=prompt("Set role ("+Object.keys(R).join(",")+":",u.role);if(rl&&R[rl]){onEditUser(u.id,{role:rl});notify(`Role → ${R[rl].n}`)}}} style={{padding:"2px 6px",fontSize:9}}>Role</button>
              <button className="btn bs" onClick={()=>{const b=prompt("Add badge ID:",Object.keys(B).join(","));if(b){onEditUser(u.id,{badges:[...(u.badges||[]),b]});notify("Badge added")}}} style={{padding:"2px 6px",fontSize:9}}>+Badge</button>
              {u.isTest&&<button className="btn" onClick={()=>{onDeleteUser(u.id);notify(`${u.display} deleted`)}} style={{padding:"2px 6px",fontSize:9,color:"var(--err)",background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)"}}>Del</button>}
            </div>
          </div>)}
        </div>}

        {tab==="announcements"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,color:"var(--tx)",marginBottom:10}}>📢 Announcements</h2>
          <div className="card">
            <input className="li" value={annTitle} onChange={e=>setAnnTitle(e.target.value)} placeholder="Announcement title" style={{marginBottom:6}}/>
            <textarea className="li" value={annText} onChange={e=>setAnnText(e.target.value)} placeholder="Announcement content..." rows={4} style={{resize:"vertical",marginBottom:6}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:11,color:"var(--tx2)"}}>Big update (popup splash)</span><Tg on={annBig} onChange={setAnnBig}/>
            </div>
            <button className="btn bp" onClick={()=>{if(!annText.trim()){notify("Content required");return}onAnnounce(annText.trim(),annBig,annTitle.trim());setAnnTitle("");setAnnText("");notify("Announced!")}}>📢 Send Announcement</button>
          </div>
        </div>}

        {tab==="trash"&&<div>
          <h2 style={{fontSize:16,fontWeight:800,color:"var(--tx)",marginBottom:10}}>🗑 Account Trash</h2>
          <div className="card" style={{background:"rgba(239,68,68,.03)",borderColor:"rgba(239,68,68,.15)",marginBottom:10}}>
            <p style={{fontSize:11,color:"var(--txm)"}}>⚠️ 14 day recovery. Only <b style={{color:"var(--gld)"}}>C.E.O</b> can recover.</p>
          </div>
          {!trash.length&&<p style={{fontSize:12,color:"var(--txg)"}}>Empty. Use /disable to add.</p>}
          {trash.map((a,i)=><div key={i} className="card" style={{marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <b style={{color:"var(--tx)"}}>{a.u}</b>
              <span className="chip" style={{background:a.ok?"var(--wrn)15":"var(--err)15",color:a.ok?"var(--wrn)":"var(--err)"}}>{a.ok?"Recoverable":"Expired"}</span>
            </div>
            <div style={{fontSize:10,color:"var(--txg)",marginTop:3}}>Deleted: {a.t}</div>
            {a.ok&&<button className="btn bs" onClick={()=>{setTrash(p=>p.filter((_,j)=>j!==i));notify(`♻️ ${a.u} recovered`)}} style={{marginTop:6,fontSize:10,color:"var(--ok)"}}>♻️ Recover</button>}
          </div>)}
        </div>}
      </div>
    </div>
  );
};

// ── Plugin Store ──
const PlugPanel=({notify})=>{
  const [tab,setTab]=useState("plugins");const [on,setOn]=useState({});const [bon,setBon]=useState({});const [gh,setGh]=useState(false);
  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:170,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"14px 6px"}}>
        <div className="sl">🧩 Plugins</div>
        {["plugins","ai bots","my plugins"].map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t}</div>)}
      </div>
      <div style={{flex:1,padding:22,overflowY:"auto"}}>
        {tab==="plugins"&&PLG.map(p=><div key={p.id} className="card" style={{marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:24}}>{p.i}</span>
          <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:13,fontWeight:700,color:"var(--tx)"}}>{p.n}</span>{p.v&&<span className="chip" style={{background:"rgba(34,197,94,.1)",color:"var(--ok)"}}>Official</span>}</div><div style={{fontSize:11,color:"var(--txm)",marginTop:1}}>{p.d}</div></div>
          <Tg on={on[p.id]||false} onChange={()=>{setOn(x=>({...x,[p.id]:!x[p.id]}));notify(`${p.n} ${on[p.id]?"off":"on"}`)}}/>
        </div>)}
        {tab==="ai bots"&&BOT.map(b=><div key={b.id} className="card" style={{marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:10,background:`${b.c}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{b.i}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:13,fontWeight:700,color:b.c}}>{b.n}</span><MsgTag type="ia"/></div>
            <div style={{fontSize:11,color:"var(--txm)",marginTop:1}}>{b.d}</div>
            <div style={{display:"flex",gap:2,marginTop:3}}>{b.caps.map(c=><span key={c} className="chip" style={{background:"var(--bg3)",color:"var(--txg)"}}>{c}</span>)}</div>
          </div>
          <Tg on={bon[b.id]||false} onChange={()=>{setBon(x=>({...x,[b.id]:!x[b.id]}));notify(`${b.n} ${bon[b.id]?"off":"on"}`)}}/>
        </div>)}
        {tab==="my plugins"&&<div>
          <div className="card" style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{fontSize:22}}>🐙</span>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:"var(--tx)"}}>GitHub Integration</div><div style={{fontSize:11,color:"var(--txm)"}}>Link to create custom plugins & bots</div></div>
            <button className={`btn ${gh?"bs":"bp"}`} onClick={()=>{setGh(!gh);notify(gh?"Unlinked":"Linked!")}}>{gh?"✓ Linked":"Link"}</button>
          </div>
          {gh&&<button className="btn bp" onClick={()=>notify("Plugin creator ready — use /createplugin in CMD")}>+ Create Plugin</button>}
        </div>}
      </div>
    </div>
  );
};

// ── Voice ──
const VoicePanel=({ch,onClose,notify})=>{
  const [m,setM]=useState(false);const [d,setD]=useState(false);const [v,setV]=useState(80);
  return(
    <div style={{padding:10,borderTop:"1px solid var(--bdr)",background:"var(--bg4)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <div><div style={{fontSize:10,fontWeight:700,color:"var(--ok)"}}>🔊 Connected</div><div style={{fontSize:9,color:"var(--txg)"}}>{ch?.name}</div></div>
        <button className="btn bs" onClick={onClose} style={{padding:"2px 6px",fontSize:9,color:"var(--err)"}}>✕</button>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:6}}>
        <button onClick={()=>{setM(!m);notify(m?"Mic on":"Muted")}} style={{flex:1,padding:5,borderRadius:7,background:m?"rgba(239,68,68,.1)":"var(--bg3)",border:`1px solid ${m?"rgba(239,68,68,.3)":"var(--bdr)"}`,color:m?"var(--err)":"var(--tx2)",fontSize:14,cursor:"pointer"}}>{m?"🔇":"🎙"}</button>
        <button onClick={()=>{setD(!d);notify(d?"Audio on":"Deaf")}} style={{flex:1,padding:5,borderRadius:7,background:d?"rgba(239,68,68,.1)":"var(--bg3)",border:`1px solid ${d?"rgba(239,68,68,.3)":"var(--bdr)"}`,color:d?"var(--err)":"var(--tx2)",fontSize:14,cursor:"pointer"}}>{d?"🔕":"🔔"}</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:9}}>🔊</span><input type="range" min="0" max="200" value={v} onChange={e=>setV(e.target.value)} style={{flex:1,accentColor:"var(--acc)"}}/><span style={{fontSize:8,color:"var(--txg)",fontFamily:"monospace"}}>{v}%</span></div>
    </div>
  );
};

// ── Settings ──
const SetPanel=({theme,setTheme,user,notify,onPay})=>{
  const [tab,setTab]=useState("appearance");
  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:170,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"14px 6px"}}>
        <div className="sl">Settings</div>
        {["appearance","account","privacy","premium"].map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{t}</div>)}
      </div>
      <div style={{flex:1,padding:22,overflowY:"auto"}}>
        {tab==="appearance"&&<div>
          <div className="sl">Theme</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
            {[["dark","Dark Nebula"],["midnight","Midnight"],["void","Void"],["light","Light Cloud"]].map(([k,n])=>
              <div key={k} onClick={()=>{setTheme(k);notify(`Theme: ${n}`)}} className="card" style={{cursor:"pointer",borderColor:theme===k?"var(--acc)":"var(--bdr)"}}>
                <span style={{fontSize:13,fontWeight:700,color:theme===k?"var(--acl)":"var(--tx2)"}}>{n}</span>
              </div>
            )}
          </div>
        </div>}
        {tab==="account"&&user&&<div className="card"><div style={{display:"flex",alignItems:"center",gap:10}}><Av name={user.display} size={44} anim={user.animAvatar}/><div><div style={{fontSize:15,fontWeight:800,color:"var(--tx)"}}>{user.display}</div><div style={{fontSize:11,color:"var(--txm)"}}>@{user.username} · {R[user.role]?.n}</div></div></div></div>}
        {tab==="privacy"&&["DMs from anyone","Show online status","Friend requests","Activity status","Data collection"].map((n,i)=>
          <div key={n} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:10,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4}}><span style={{fontSize:12,color:"var(--tx)"}}>{n}</span><Tg on={i<3} onChange={()=>notify(`${n} toggled`)}/></div>
        )}
        {tab==="premium"&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {Object.entries(P).map(([k,p])=><div key={k} className="card" style={{borderColor:`${p.c}30`,textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:800,color:p.c,marginBottom:2}}>{p.n}</div>
            <div style={{fontSize:13,fontWeight:700,color:"var(--tx)",marginBottom:6}}>${p.p.toFixed(2)}<span style={{fontSize:10,color:"var(--txm)"}}>/mo</span></div>
            {p.perks.map(pk=><div key={pk} style={{fontSize:10,color:"var(--txm)",marginBottom:1}}>✓ {pk}</div>)}
            <button className="btn bp" onClick={()=>onPay(k)} style={{width:"100%",marginTop:8,background:`linear-gradient(135deg,${p.c},${p.c}88)`,fontSize:11}}>Subscribe</button>
          </div>)}
        </div>}
      </div>
    </div>
  );
};
