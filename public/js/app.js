/* ═══ interClouder v4.5 — Main App ═══ */
function App(){
  const [user,setUser]=useState(null);const [theme,setTheme]=useState("dark");
  const [view,setView]=useState("server");const [srvs,setSrvs]=useState([]);
  const [aS,setAS]=useState(null);const [aCh,setACh]=useState(null);
  const [showCreate,setShowCreate]=useState(false);const [profUser,setProfUser]=useState(null);
  const [voiceCh,setVoiceCh]=useState(null);const [notif,setNotif]=useState(null);
  const [showMem,setShowMem]=useState(true);const [testUsers,setTestUsers]=useState([]);
  const [showTestCreator,setShowTestCreator]=useState(false);
  const [payTier,setPayTier]=useState(null);const [showSplash,setShowSplash]=useState(true);
  const [announcements,setAnnouncements]=useState([]);const [splashAnn,setSplashAnn]=useState(null);

  useEffect(()=>{document.documentElement.setAttribute("data-theme",theme)},[theme]);
  const nf=t=>{setNotif(t);setTimeout(()=>setNotif(null),2200)};

  const login=u=>{setUser(u);setTimeout(()=>setShowCreate(true),400)};

  const createSrv=s=>{setSrvs(p=>[...p,s]);setAS(s.id);setACh(s.channels[0]?.id);setView("server")};

  // Edit any user (me or test)
  const editUser=(id,changes)=>{
    if(id==="me")setUser(p=>({...p,...changes}));
    else setTestUsers(p=>p.map(u=>u.id===id?{...u,...changes}:u));
  };

  // Delete test user
  const delUser=id=>setTestUsers(p=>p.filter(u=>u.id!==id&&u.username!==id));

  // Create test account
  const createTest=acc=>{setTestUsers(p=>[...p,acc]);setShowTestCreator(false)};

  // Send message
  const send=text=>{
    if(!aS||!aCh||!text)return;
    setSrvs(p=>p.map(s=>{
      if(s.id!==aS)return s;
      return{...s,xp:(s.xp||0)+1,channels:s.channels.map(c=>{
        if(c.id!==aCh)return c;
        return{...c,msgs:[...(c.msgs||[]),{id:Date.now(),user:user.display,color:R[user.role]?.c,text,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),reactions:[],rb:{}}]};
      })};
    }));
    setUser(p=>({...p,xp:(p.xp||0)+1}));
  };

  // Announce
  const announce=(text,big,title)=>{
    const ann={id:Date.now(),text,title:title||"Announcement",time:new Date().toLocaleTimeString(),big};
    setAnnouncements(p=>[ann,...p]);
    // Send as system message to all server channels
    setSrvs(p=>p.map(s=>({...s,channels:s.channels.map(c=>({...c,msgs:[...(c.msgs||[]),{id:Date.now()+Math.random(),user:"System",color:"var(--inf)",text:`📢 ${title||"Announcement"}: ${text}`,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),tag:"announce",reactions:[],rb:{}}]}))})));
    if(big)setSplashAnn({title:title||"Update",changes:[text]});
  };

  // React — once per emoji per user
  const react=(mid,emoji)=>{
    setSrvs(p=>p.map(s=>{
      if(s.id!==aS)return s;
      return{...s,channels:s.channels.map(c=>{
        if(c.id!==aCh)return c;
        return{...c,msgs:(c.msgs||[]).map(m=>{
          if(m.id!==mid)return m;
          const rb=m.rb||{};const key=emoji+"_me";
          if(rb[key]){const nrb={...rb};delete nrb[key];return{...m,reactions:(m.reactions||[]).map(r=>r.emoji===emoji?{...r,count:r.count-1,me:false}:r).filter(r=>r.count>0),rb:nrb}}
          const nrb={...rb,[key]:true};const ex=(m.reactions||[]).find(r=>r.emoji===emoji);
          const rxs=ex?(m.reactions||[]).map(r=>r.emoji===emoji?{...r,count:r.count+1,me:true}:r):[...(m.reactions||[]),{emoji,count:1,me:true}];
          return{...m,reactions:rxs,rb:nrb};
        })};
      })};
    }));
  };

  // Purchase Airbound
  const purchase=tier=>{
    const isEarly=EARLY.check(tier);
    setUser(p=>{
      const badges=[...(p.badges||[]),tier==="air"?"nitro":tier==="elite"?"elite":"omega"];
      if(isEarly&&!badges.includes("early"))badges.push("early");
      const unlocks=P[tier]?.unlocks||{};
      return{...p,premium:tier,badges,animAvatar:unlocks.animAvatar||false,animBanner:unlocks.animBanner||false};
    });
    setPayTier(null);nf(`${P[tier].n} activated!${isEarly?" 🌅 Early Supporter badge earned!":""}`);
  };

  if(!user)return <LoginScreen onLogin={login}/>;

  // Update splash on first load
  if(showSplash&&UPDATES.length){const u=UPDATES[0];return<Splash update={u} onClose={()=>setShowSplash(false)}/>}
  // Big announcement splash
  if(splashAnn)return<Splash update={splashAnn} onClose={()=>setSplashAnn(null)}/>;

  const srv=srvs.find(s=>s.id===aS);const ch=srv?.channels?.find(c=>c.id===aCh);const msgs=ch?.msgs||[];
  const allU=[...testUsers];

  return(
    <div className="app">
      <Notify text={notif}/>

      {/* Server Bar */}
      <div className="sbar">
        <div onClick={()=>{if(srvs[0]){setAS(srvs[0].id);setACh(srvs[0].channels[0]?.id);setView("server")}}} style={{cursor:"pointer",marginBottom:3}}>
          <div style={{width:42,height:42,borderRadius:14,background:"linear-gradient(135deg,var(--acc),var(--pk))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#fff"}}>⬡</div>
        </div>
        <div style={{width:30,height:1,background:"var(--bdr)"}}/>
        {srvs.map(s=>{const a=s.id===aS&&view==="server";return(
          <div key={s.id} className={`si ${a?"on":""}`} onClick={()=>{setView("server");setAS(s.id);setACh(s.channels[0]?.id)}} title={s.name}>
            {a&&<div className="ind"/>}{s.icon}
            {s.isTemp&&<div style={{position:"absolute",top:-3,right:-3,fontSize:6,background:"var(--wrn)",borderRadius:2,padding:"0 2px",color:"#000",fontWeight:800}}>⏱</div>}
          </div>
        )})}
        <div className="si" onClick={()=>setShowCreate(true)} style={{background:"transparent",border:"1px dashed var(--bdr)",fontSize:18,color:"var(--txg)"}}>+</div>
        <div style={{flex:1}}/>
        {[["plugins","🧩"],["admin","👑"],["moderation","🛡"],["settings","⚙"]].map(([v,i])=><div key={v} className={`si ${view===v?"on":""}`} onClick={()=>setView(v)} style={{background:view===v?"var(--bga)":"transparent",border:"none",fontSize:15}}>{i}</div>)}
      </div>

      {/* Sidebar */}
      <div className="side">
        {view==="server"&&srv?<React.Fragment>
          <div style={{padding:"10px 12px",borderBottom:"1px solid var(--bdr)"}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontWeight:800,fontSize:13,color:"var(--tx)"}}>{srv.name}</span>
              {srv.isTemp&&<span className="chip" style={{background:"var(--wrn)18",color:"var(--wrn)"}}>⏱</span>}
              {srv.isPublic&&<span className="chip" style={{background:"var(--ok)18",color:"var(--ok)"}}>🌐</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
              <TagChip tag={srv.tag} srv={srv}/>
              {srv.badge&&<span className="chip" style={{background:"var(--acc)18",color:"var(--acl)"}}>{srv.badge.img?<img src={srv.badge.img} style={{width:10,height:10,borderRadius:2}}/>:null}{srv.badge.name}</span>}
              {srv.customTheme&&<span className="chip" style={{background:`${srv.customTheme.c1}18`,color:srv.customTheme.c1}}>🎨 {srv.customTheme.name}</span>}
            </div>
          </div>
          {/* Banner */}
          {srv.banner&&<img src={srv.banner} style={{width:"100%",height:60,objectFit:"cover"}}/>}
          <div style={{padding:"6px 5px",flex:1,overflowY:"auto"}}>
            <div className="sl">Text</div>
            {srv.channels.map(c=><div key={c.id} className={`ch ${aCh===c.id?"on":""}`} onClick={()=>setACh(c.id)}>
              <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{opacity:.5}}>#</span><span style={{fontWeight:aCh===c.id?600:400}}>{c.name}</span>{(c.slowmode||0)>0&&<span style={{fontSize:7,color:"var(--wrn)"}}>⏱</span>}</div>
              {(c.msgs||[]).length>0&&aCh!==c.id&&<span style={{fontSize:8,color:"var(--txg)"}}>{c.msgs.length}</span>}
            </div>)}
            <div className="sl" style={{marginTop:6}}>Voice</div>
            {srv.vChannels.map(c=><div key={c.id} className="ch" onClick={()=>{setVoiceCh(c);nf(`Joined ${c.name}`)}}><span style={{fontSize:11}}>🔊</span> {c.name}</div>)}
          </div>
          {voiceCh&&<VoicePanel ch={voiceCh} onClose={()=>{setVoiceCh(null);nf("Disconnected")}} notify={nf}/>}
        </React.Fragment>
        :view==="server"?<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,gap:10,padding:16}}>
          <div style={{fontSize:44}}>⬡</div><span style={{fontSize:13,fontWeight:700,color:"var(--acl)"}}>interClouder</span>
          <p style={{fontSize:11,color:"var(--txg)",textAlign:"center"}}>Create your first server!</p>
          <button className="btn bp" onClick={()=>setShowCreate(true)}>+ Create Server</button>
        </div>
        :<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,gap:6}}>
          <div style={{fontSize:36}}>⬡</div><span style={{fontSize:13,fontWeight:700,color:"var(--acl)"}}>interClouder</span>
          <span style={{fontSize:9,color:"var(--txg)",fontFamily:"'JetBrains Mono',monospace"}}>v4.5 · Encrypted</span>
        </div>}

        {/* User bar */}
        <div style={{padding:"7px 8px",borderTop:"1px solid var(--bdr)",display:"flex",alignItems:"center",gap:6}}>
          <Av name={user.display} src={user.avatar} size={28} status="online" anim={user.animAvatar} onClick={()=>setProfUser(user)}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:700,color:R[user.role]?.c}}>{user.display}</div>
            <div style={{fontSize:8,color:"var(--ok)"}}>{R[user.role]?.n}{user.premium?` · ${P[user.premium].n}`:""}</div>
          </div>
          <span onClick={()=>setView("settings")} style={{cursor:"pointer",fontSize:13,color:"var(--txg)"}}>⚙</span>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        {view==="server"&&srv&&ch&&<React.Fragment>
          <div style={{padding:"7px 14px",borderBottom:"1px solid var(--bdr)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"color-mix(in srgb,var(--bg2) 90%,transparent)"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14,color:"var(--txg)",fontWeight:800}}>#</span>
              <span style={{fontWeight:700,color:"var(--tx)",fontSize:14}}>{ch.name}</span>
              {(ch.slowmode||0)>0&&<span className="chip" style={{background:"var(--wrn)15",color:"var(--wrn)"}}>⏱ {smL(ch.slowmode)}</span>}
              <TagChip tag={srv.tag} srv={srv}/>
            </div>
            <span onClick={()=>setShowMem(!showMem)} style={{cursor:"pointer",fontSize:13,color:showMem?"var(--acl)":"var(--txg)"}}>👥</span>
          </div>
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>
            <Chat ch={ch} msgs={msgs} onSend={send} onReact={react} user={user} notify={nf}/>
            {showMem&&<div className="mp">
              <div className="sl">Members — {1+allU.filter(u=>srvs.find(s=>s.id===aS)?.members?.includes(u.id)).length}</div>
              {/* Owner (you) */}
              <div onClick={()=>setProfUser(user)} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 5px",borderRadius:6,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="var(--bgh)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Av name={user.display} src={user.avatar} size={24} status="online" anim={user.animAvatar}/>
                <div><div style={{fontSize:11,fontWeight:600,color:R[user.role]?.c}}>{user.display}</div><div style={{fontSize:8,color:R[user.role]?.c}}>{R[user.role]?.i} {R[user.role]?.n}</div></div>
              </div>
              {/* Test users in this server */}
              {allU.filter(u=>srv.members?.includes(u.id)).map(u=>(
                <div key={u.id} onClick={()=>setProfUser(u)} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 5px",borderRadius:6,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="var(--bgh)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <Av name={u.display} size={24} status={u.status}/>
                  <div><div style={{fontSize:11,fontWeight:600,color:R[u.role]?.c}}>{u.display}</div>{u.isTest&&<MsgTag type="system"/>}</div>
                </div>
              ))}
              {/* Public join button */}
              {srv.isPublic&&<div style={{marginTop:8,padding:6,borderRadius:8,background:"var(--bg4)",border:"1px dashed var(--bdr)",textAlign:"center"}}>
                <div style={{fontSize:10,color:"var(--txg)",marginBottom:4}}>🌐 Public server</div>
                <button className="btn bp" onClick={()=>{
                  // Simulate a public user joining
                  const names=["CloudWalker","NeonDrift","PixelNova","StarVoyager","VoidRunner","AetherMind","QuantumLeap","ByteStorm"];
                  const nm=names[Math.floor(Math.random()*names.length)]+Math.floor(Math.random()*100);
                  const nu={id:"pub_"+Date.now().toString(36),username:nm.toLowerCase(),display:nm,role:"member",status:"online",xp:0,badges:[],isTest:false,isPub:true,created:Date.now(),avatar:null,banner:null,animAvatar:false,animBanner:false,serverTags:[],premium:null,customBadges:[]};
                  setTestUsers(p=>[...p,nu]);
                  setSrvs(p=>p.map(s=>s.id===aS?{...s,members:[...(s.members||[]),nu.id]}:s));
                  // Welcome message
                  setSrvs(p=>p.map(s=>{if(s.id!==aS)return s;return{...s,channels:s.channels.map((c,i)=>i===0?{...c,msgs:[...(c.msgs||[]),{id:Date.now()+1,user:"System",color:"var(--ok)",text:`👋 ${nm} joined the server!`,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),tag:"system",reactions:[],rb:{}}]}:c)};}));
                  nf(`${nm} joined!`);
                }} style={{fontSize:10,padding:"4px 10px"}}>Simulate Join</button>
              </div>}
            </div>}
          </div>
        </React.Fragment>}
        {view==="server"&&(!srv||!ch)&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
          <div style={{fontSize:56}}>⬡</div><h2 style={{fontSize:18,fontWeight:800,color:"var(--tx)"}}>Welcome to interClouder</h2>
          <p style={{fontSize:12,color:"var(--txm)"}}>Create a server to start</p>
          <button className="btn bp" onClick={()=>setShowCreate(true)}>+ Create Server</button>
        </div>}
        {view==="moderation"&&<ModPanel srvs={srvs} aS={aS} notify={nf}/>}
        {view==="admin"&&<CEOPanel notify={nf} user={user} allUsers={allU} onEditUser={editUser} onCreateTest={()=>setShowTestCreator(true)} onDeleteUser={delUser} onAnnounce={announce}/>}
        {view==="plugins"&&<PlugPanel notify={nf}/>}
        {view==="settings"&&<SetPanel theme={theme} setTheme={setTheme} user={user} notify={nf} onPay={t=>setPayTier(t)}/>}
      </div>

      {/* Modals */}
      {showCreate&&<ServerCreator onClose={()=>setShowCreate(false)} onCreate={createSrv} notify={nf}/>}
      {profUser&&<ProfileModal user={profUser} onClose={()=>setProfUser(null)} notify={nf} isOwner={true} onEditUser={editUser}/>}
      {showTestCreator&&<TestAccCreator onClose={()=>setShowTestCreator(false)} onCreate={createTest} notify={nf}/>}
      {payTier&&<PaymentModal tier={payTier} onClose={()=>setPayTier(null)} onPurchase={purchase} notify={nf}/>}
    </div>
  );
}

const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
console.log("%c⬡ interClouder v4.5","color:#A855F7;font-weight:bold;font-size:14px");
