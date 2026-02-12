/* ═══ interClouder v4 — Main App ═══ */
function App(){
  const [user,setUser]=useState(null);
  const [theme,setTheme]=useState("dark");
  const [view,setView]=useState("server");
  const [servers,setServers]=useState([]);
  const [activeSrv,setActiveSrv]=useState(null);
  const [activeCh,setActiveCh]=useState(null);
  const [showCreate,setShowCreate]=useState(false);
  const [profileUser,setProfileUser]=useState(null);
  const [voiceCh,setVoiceCh]=useState(null);
  const [notif,setNotif]=useState(null);
  const [showMembers,setShowMembers]=useState(true);

  useEffect(()=>{document.documentElement.setAttribute("data-theme",theme)},[theme]);
  const notify=t=>{setNotif(t);setTimeout(()=>setNotif(null),2500)};

  // Login
  const handleLogin=(u)=>{
    const me={...u,id:"me",isMe:true,xp:0,badges:["founder"],role:"ceo",status:"online",serverTags:[]};
    setUser(me);
    // Auto-create first server prompt
    setTimeout(()=>setShowCreate(true),500);
  };

  // Create server
  const handleCreateServer=(srv)=>{
    setServers(p=>[...p,srv]);
    setActiveSrv(srv.id);
    setActiveCh(srv.channels[0]?.id||null);
    setView("server");
  };

  // Send message
  const handleSend=(text)=>{
    if(!activeSrv||!activeCh||!text)return;
    setServers(p=>p.map(s=>{
      if(s.id!==activeSrv)return s;
      return{...s,xp:(s.xp||0)+1,channels:s.channels.map(c=>{
        if(c.id!==activeCh)return c;
        return{...c,msgs:[...(c.msgs||[]),{
          id:Date.now(),user:user.display,color:ROLES[user.role]?.c||"var(--tx)",
          text,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
          reactions:[],reactedBy:{}
        }]};
      })};
    }));
    // Add XP to user
    setUser(p=>({...p,xp:(p.xp||0)+1}));
  };

  // React — ONCE per user per emoji
  const handleReact=(msgId,emoji)=>{
    setServers(p=>p.map(s=>{
      if(s.id!==activeSrv)return s;
      return{...s,channels:s.channels.map(c=>{
        if(c.id!==activeCh)return c;
        return{...c,msgs:(c.msgs||[]).map(m=>{
          if(m.id!==msgId)return m;
          const rb=m.reactedBy||{};
          const key=emoji+"_"+user.id;
          // Already reacted with this emoji? Remove it
          if(rb[key]){
            const newRb={...rb};delete newRb[key];
            const rxs=(m.reactions||[]).map(r=>r.emoji===emoji?{...r,count:r.count-1,me:false}:r).filter(r=>r.count>0);
            return{...m,reactions:rxs,reactedBy:newRb};
          }
          // Add reaction
          const newRb={...rb,[key]:true};
          const existing=(m.reactions||[]).find(r=>r.emoji===emoji);
          let rxs;
          if(existing){rxs=(m.reactions||[]).map(r=>r.emoji===emoji?{...r,count:r.count+1,me:true}:r)}
          else{rxs=[...(m.reactions||[]),{emoji,count:1,me:true}]}
          return{...m,reactions:rxs,reactedBy:newRb};
        })};
      })};
    }));
  };

  if(!user)return <LoginScreen onLogin={handleLogin} />;

  const srv=servers.find(s=>s.id===activeSrv);
  const ch=srv?.channels?.find(c=>c.id===activeCh);
  const msgs=ch?.msgs||[];

  return(
    <div className="app">
      <Notify text={notif} />

      {/* Server Bar */}
      <div className="sbar">
        <div onClick={()=>{if(servers[0]){setActiveSrv(servers[0].id);setActiveCh(servers[0].channels[0]?.id);setView("server")}}} style={{cursor:"pointer",marginBottom:4}}>
          <div style={{width:44,height:44,borderRadius:16,background:"linear-gradient(135deg,var(--acc),var(--pk))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:800,color:"#fff"}}>⬡</div>
        </div>
        <div style={{width:32,height:1,background:"var(--bdr)"}} />

        {/* Servers */}
        {servers.map(s=>{
          const a=s.id===activeSrv&&view==="server";
          return(
            <div key={s.id} className={`si ${a?"on":""}`}
              onClick={()=>{setView("server");setActiveSrv(s.id);setActiveCh(s.channels[0]?.id)}}
              title={`${s.name}${s.isTemp?" ⏱":""}`}>
              {a&&<div className="ind" />}
              {s.icon}
              {s.isTemp&&<div style={{position:"absolute",top:-3,right:-3,fontSize:7,background:"var(--wrn)",borderRadius:3,padding:"0 2px",color:"#000",fontWeight:800}}>⏱</div>}
            </div>
          );
        })}

        {/* Create */}
        <div className="si" onClick={()=>setShowCreate(true)} title="Create Server" style={{background:"transparent",border:"1px dashed var(--bdr)",fontSize:20,color:"var(--txg)"}}>+</div>

        <div style={{flex:1}} />

        {/* Bottom nav */}
        {[["plugins","🧩"],["admin","👑"],["moderation","🛡"],["settings","⚙"]].map(([v,i])=>(
          <div key={v} className={`si ${view===v?"on":""}`} onClick={()=>setView(v)} title={v} style={{background:view===v?"var(--bga)":"transparent",border:"none",fontSize:16}}>{i}</div>
        ))}
      </div>

      {/* Sidebar */}
      <div className="side">
        {view==="server"&&srv?(
          <React.Fragment>
            <div style={{padding:"12px 14px",borderBottom:"1px solid var(--bdr)"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontWeight:800,fontSize:14,color:"var(--tx)"}}>{srv.name}</span>
                {srv.isTemp&&<span className="chip" style={{background:"var(--wrn)18",color:"var(--wrn)"}}>⏱</span>}
              </div>
              <div style={{fontSize:10,color:"var(--txg)",marginTop:2}}>
                <TagChip tag={srv.tags} server={srv} /> · {srv.channels.length+srv.vChannels.length} channels
              </div>
            </div>
            <div style={{padding:"8px 6px",flex:1,overflowY:"auto"}}>
              <div className="sl">Text Channels</div>
              {srv.channels.map(c=>{
                const sm=c.slowmode||0;
                return(
                  <div key={c.id} className={`ch ${activeCh===c.id?"on":""}`} onClick={()=>setActiveCh(c.id)}>
                    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}>
                      <span style={{opacity:.5}}>#</span>
                      <span style={{fontWeight:activeCh===c.id?600:400}}>{c.name}</span>
                      {sm>0&&<span style={{fontSize:8,color:"var(--wrn)"}}>⏱</span>}
                    </div>
                    {(c.msgs||[]).length>0&&activeCh!==c.id&&<span style={{fontSize:9,color:"var(--txg)"}}>{c.msgs.length}</span>}
                  </div>
                );
              })}
              <div className="sl" style={{marginTop:8}}>Voice Channels</div>
              {srv.vChannels.map(c=>(
                <div key={c.id} className="ch" onClick={()=>{setVoiceCh(c);notify(`Joined ${c.name}`)}} style={{color:"var(--txf)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13}}>
                    <span style={{fontSize:12}}>🔊</span><span>{c.name}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Voice panel */}
            {voiceCh&&<VoicePanel channel={voiceCh} onClose={()=>{setVoiceCh(null);notify("Disconnected")}} notify={notify} />}
          </React.Fragment>
        ):view==="server"&&!srv?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,gap:12,padding:20}}>
            <div style={{fontSize:48}}>⬡</div>
            <span style={{fontSize:14,fontWeight:700,color:"var(--acl)"}}>interClouder</span>
            <p style={{fontSize:12,color:"var(--txg)",textAlign:"center"}}>Create your first server to get started!</p>
            <button className="btn btn-p" onClick={()=>setShowCreate(true)}>+ Create Server</button>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,gap:8}}>
            <div style={{fontSize:40}}>⬡</div>
            <span style={{fontSize:14,fontWeight:700,color:"var(--acl)"}}>interClouder</span>
            <span style={{fontSize:10,color:"var(--txg)",fontFamily:"'JetBrains Mono',monospace"}}>v4.0 · Encrypted</span>
          </div>
        )}

        {/* User bar */}
        <div style={{padding:"8px 10px",borderTop:"1px solid var(--bdr)",display:"flex",alignItems:"center",gap:8,background:"color-mix(in srgb,var(--bg2) 80%,transparent)"}}>
          <Avatar name={user.display} size={30} status="online" onClick={()=>setProfileUser(user)} />
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:ROLES[user.role]?.c||"var(--tx)"}}>{user.display}</div>
            <div style={{fontSize:9,color:"var(--ok)"}}>Online · {ROLES[user.role]?.n}</div>
          </div>
          <span onClick={()=>setView("settings")} style={{cursor:"pointer",fontSize:14,color:"var(--txg)"}}>⚙</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main">
        {view==="server"&&srv&&ch&&(
          <React.Fragment>
            {/* Header */}
            <div style={{padding:"8px 16px",borderBottom:"1px solid var(--bdr)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"color-mix(in srgb,var(--bg2) 90%,transparent)",backdropFilter:"blur(10px)"}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16,color:"var(--txg)",fontWeight:800}}>#</span>
                <span style={{fontWeight:700,color:"var(--tx)",fontSize:15}}>{ch.name}</span>
                {(ch.slowmode||0)>0&&<span className="chip" style={{background:"var(--wrn)15",color:"var(--wrn)"}}>⏱ {smLabel(ch.slowmode)}</span>}
                <TagChip tag={srv.tags} server={srv} />
              </div>
              <span onClick={()=>setShowMembers(!showMembers)} style={{cursor:"pointer",fontSize:14,color:showMembers?"var(--acl)":"var(--txg)"}}>👥</span>
            </div>
            <div style={{flex:1,display:"flex",overflow:"hidden"}}>
              <ChatArea channel={ch} messages={msgs} onSend={handleSend} onReact={handleReact} myId={user.id} notify={notify} />
              {showMembers&&(
                <div className="mp">
                  <div className="sl">Members</div>
                  <div onClick={()=>setProfileUser(user)} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 6px",borderRadius:8,cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.background="var(--bgh)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <Avatar name={user.display} size={26} status="online" />
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:ROLES[user.role]?.c}}>{user.display}</div>
                      <div style={{fontSize:9,color:ROLES[user.role]?.c}}>{ROLES[user.role]?.i} {ROLES[user.role]?.n}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </React.Fragment>
        )}
        {view==="server"&&(!srv||!ch)&&(
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
            <div style={{fontSize:60}}>⬡</div>
            <h2 style={{fontSize:20,fontWeight:800,color:"var(--tx)"}}>Welcome to interClouder</h2>
            <p style={{fontSize:13,color:"var(--txm)"}}>Create a server to start chatting</p>
            <button className="btn btn-p" onClick={()=>setShowCreate(true)}>+ Create Server</button>
          </div>
        )}
        {view==="moderation"&&<ModPanel servers={servers} activeServer={activeSrv} notify={notify} />}
        {view==="admin"&&<AdminPanel notify={notify} user={user} />}
        {view==="plugins"&&<PluginPanel notify={notify} />}
        {view==="settings"&&<SettingsPanel theme={theme} setTheme={setTheme} user={user} notify={notify} />}
      </div>

      {/* Modals */}
      {showCreate&&<ServerCreator onClose={()=>setShowCreate(false)} onCreate={handleCreateServer} notify={notify} />}
      {profileUser&&<ProfileModal user={profileUser} onClose={()=>setProfileUser(null)} notify={notify} />}
    </div>
  );
}

const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
console.log("%c⬡ interClouder v4.0 — Neutron Compressed","color:#A855F7;font-weight:bold;font-size:14px");
