/* ═══ interClouder v5.0 — App ═══ */

const SS={
  s(k,v){try{localStorage.setItem("ic_"+k,JSON.stringify(v))}catch(e){}},
  l(k,d=null){try{const v=localStorage.getItem("ic_"+k);return v?JSON.parse(v):d}catch(e){return d}},
  c(){Object.keys(localStorage).filter(k=>k.startsWith("ic_")).forEach(k=>localStorage.removeItem(k))},
};

function App(){
  // ── Core State (persisted) ──
  const [user,setUser]=useState(()=>SS.l("user",null));
  const [theme,setTheme]=useState(()=>SS.l("theme","dark"));
  const [srvs,setSrvs]=useState(()=>SS.l("srvs",[]));
  const [aS,setAS]=useState(()=>SS.l("aS",null));
  const [aCh,setACh]=useState(()=>SS.l("aCh",null));
  const [testUsers,setTestUsers]=useState(()=>SS.l("tU",[]));
  const [settings,setSettings]=useState(()=>SS.l("settings",{...DSET}));
  const [ageVerified,setAgeVerified]=useState(()=>SS.l("ageOK",false));

  // ── UI State ──
  const [view,setView]=useState("server");
  const [showCreate,setShowCreate]=useState(false);
  const [profUser,setProfUser]=useState(null);
  const [voiceCh,setVoiceCh]=useState(null);
  const [notif,setNotif]=useState(null);
  const [showMem,setShowMem]=useState(true);
  const [showTestCreator,setShowTestCreator]=useState(false);
  const [payTier,setPayTier]=useState(null);
  const [giftTarget,setGiftTarget]=useState(null);
  const [showSplash,setShowSplash]=useState(()=>!SS.l("splash50",false));
  const [splashAnn,setSplashAnn]=useState(null);

  // ── Persist Effects ──
  useEffect(()=>{if(user)SS.s("user",user)},[user]);
  useEffect(()=>{SS.s("theme",theme);document.documentElement.setAttribute("data-theme",theme)},[theme]);
  useEffect(()=>{SS.s("srvs",srvs)},[srvs]);
  useEffect(()=>{SS.s("aS",aS)},[aS]);
  useEffect(()=>{SS.s("aCh",aCh)},[aCh]);
  useEffect(()=>{SS.s("tU",testUsers)},[testUsers]);
  useEffect(()=>{SS.s("settings",settings)},[settings]);
  useEffect(()=>{const fs=settings?.access?.fontSize||13;document.documentElement.style.fontSize=fs+"px"},[settings?.access?.fontSize]);

  // ── Keyboard Shortcuts ──
  useEffect(()=>{
    const handler=(e)=>{
      if(e.key==="Escape"){setProfUser(null);setShowCreate(false);setShowTestCreator(false);setPayTier(null)}
      if(e.ctrlKey&&e.key===","){e.preventDefault();setView("settings")}
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[]);

  const nf=t=>{setNotif(t);setTimeout(()=>setNotif(null),2500)};

  // ── Auth ──
  const login=u=>{
    u.created=u.created||Date.now();
    u.msgs=u.msgs||0;
    u.strikes=u.strikes||0;
    u.reports=u.reports||0;
    setUser(u);SS.s("user",u);
    if(!srvs.length)setTimeout(()=>setShowCreate(true),500);
  };
  const logout=()=>{SS.c();setUser(null);setSrvs([]);setAS(null);setACh(null);setTestUsers([]);setSettings({...DSET});document.documentElement.style.fontSize="13px"};
  const deleteAccount=()=>{logout();nf("Account deleted permanently")};

  // ── Server CRUD ──
  const createSrv=s=>{
    const isEarly=ESRV.inc();
    if(isEarly){
      s.earlyServer=true;
      if(user&&!(user.badges||[]).includes("early_owner")){
        setUser(p=>({...p,badges:[...(p.badges||[]),"early_owner"]}));
        nf("🏰 Early Server Owner badge earned! (#"+ESRV.count+")");
      }
    }
    setSrvs(p=>[...p,s]);setAS(s.id);setACh(s.channels[0]?.id);setView("server");
  };
  const editSrv=(id,ch)=>setSrvs(p=>p.map(s=>s.id===id?{...s,...ch}:s));
  const deleteSrv=id=>{setSrvs(p=>p.filter(s=>s.id!==id));if(aS===id){const rest=srvs.filter(s=>s.id!==id);setAS(rest[0]?.id||null);setACh(rest[0]?.channels?.[0]?.id||null)}nf("Server deleted")};

  // ── User Edit ──
  const editUser=(id,ch)=>{
    if(id==="me")setUser(p=>({...p,...ch}));
    else setTestUsers(p=>p.map(u=>u.id===id?{...u,...ch}:u));
    if(profUser&&(profUser.id===id||(id==="me"&&profUser.isMe)))setProfUser(p=>({...p,...ch}));
  };
  const delUser=id=>{setTestUsers(p=>p.filter(u=>u.id!==id&&u.username!==id));setSrvs(p=>p.map(s=>({...s,members:(s.members||[]).filter(m=>m!==id)})))};
  const createTest=acc=>{setTestUsers(p=>[...p,acc]);setShowTestCreator(false)};

  // ── Block / Ignore ──
  const blockUser=uid=>{
    setSettings(p=>({...p,blocked:[...(p.blocked||[]),uid].filter((v,i,a)=>a.indexOf(v)===i)}));
    nf("User blocked");
  };
  const ignoreUser=uid=>{
    setSettings(p=>({...p,ignored:[...(p.ignored||[]),uid].filter((v,i,a)=>a.indexOf(v)===i)}));
    nf("User ignored");
  };
  const censorProfile=uid=>{
    editUser(uid,{censored:true,censoredBy:user?.display||"mod"});
    nf("Profile censored + reputation reduced");
    const u=uid==="me"?user:testUsers.find(t=>t.id===uid);
    if(u)editUser(uid,{strikes:(u.strikes||0)+1,censored:true});
  };

  // ── Messages ──
  const send=(text,fileData)=>{
    if(!aS||!aCh||(!text&&!fileData))return;
    const ts=Date.now();
    setSrvs(p=>p.map(s=>{
      if(s.id!==aS)return s;
      return{...s,xp:(s.xp||0)+1,channels:s.channels.map(c=>{
        if(c.id!==aCh)return c;
        return{...c,msgs:[...(c.msgs||[]),{
          id:ts,uid:"me",user:user.display,color:R[user.role]?.c,text:text||"",
          time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
          reactions:[],rb:{},gradient:user.gradient||null,ts,
          file:fileData||null,
        }]};
      })};
    }));
    setUser(p=>({...p,xp:(p.xp||0)+1,msgs:(p.msgs||0)+1}));
  };

  const editMsg=(mid,newText)=>{
    setSrvs(p=>p.map(s=>{if(s.id!==aS)return s;return{...s,channels:s.channels.map(c=>{if(c.id!==aCh)return c;return{...c,msgs:(c.msgs||[]).map(m=>m.id===mid&&m.uid==="me"?{...m,text:newText,edited:true}:m)}})}}));
    nf("Message edited");
  };
  const deleteMsg=(mid)=>{
    setSrvs(p=>p.map(s=>{if(s.id!==aS)return s;return{...s,channels:s.channels.map(c=>{if(c.id!==aCh)return c;return{...c,msgs:(c.msgs||[]).filter(m=>m.id!==mid||m.uid!=="me")}})}}));
    nf("Message deleted");
  };

  const announce=(text,big,title)=>{
    setSrvs(p=>p.map(s=>({...s,channels:s.channels.map(c=>({...c,msgs:[...(c.msgs||[]),{id:Date.now()+Math.random(),uid:"system",user:"System",color:"var(--inf)",text:"📢 "+(title||"Announcement")+": "+text,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),tag:"announce",reactions:[],rb:{},ts:Date.now()}]}))})));
    if(big)setSplashAnn({title:title||"Update",changes:[text]});
  };

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
          return{...m,reactions:ex?(m.reactions||[]).map(r=>r.emoji===emoji?{...r,count:r.count+1,me:true}:r):[...(m.reactions||[]),{emoji,count:1,me:true}],rb:nrb};
        })};
      })};
    }));
  };

  // ── Purchase / Gift Airbound ──
  const purchase=(tier,giftTo)=>{
    const isEarly=EARLY.check(tier);
    if(giftTo){
      // Gift to another user
      const u=testUsers.find(t=>t.display===giftTo||t.username===giftTo);
      if(u){
        const badges=[...(u.badges||[])];
        const bid=tier==="air"?"nitro":tier==="elite"?"elite":"omega";
        if(!badges.includes(bid))badges.push(bid);
        if(!badges.includes("gifted"))badges.push("gifted");
        editUser(u.id,{premium:tier,badges});
        nf("🎁 "+P[tier].n+" gifted to "+giftTo+"!");
      }
    }else{
      // Self purchase
      setUser(p=>{
        const badges=[...(p.badges||[])];const bid=tier==="air"?"nitro":tier==="elite"?"elite":"omega";
        if(!badges.includes(bid))badges.push(bid);
        if(isEarly&&!badges.includes("early"))badges.push("early");
        const ul=P[tier]?.unlocks||{};
        return{...p,premium:tier,badges,animAvatar:ul.animAvatar||false,animBanner:ul.animBanner||false};
      });
      nf(P[tier].n+" activated!"+(isEarly?" 🌅 Early Supporter!":""));
    }
    setPayTier(null);setGiftTarget(null);
  };

  const giftAirbound=(username)=>{
    setGiftTarget(username);setPayTier("air");// default to basic, user can change in modal
  };

  // ── Age Gate ──
  if(!ageVerified)return<AgeGate onPass={()=>{setAgeVerified(true);SS.s("ageOK",true)}} onFail={()=>nf("Verification failed")}/>;

  // ── Login ──
  if(!user)return <LoginScreen onLogin={login}/>;

  // ── Splash ──
  if(showSplash&&UPDATES.length)return<Splash update={UPDATES[0]} onClose={()=>{setShowSplash(false);SS.s("splash50",true)}}/>;
  if(splashAnn)return<Splash update={splashAnn} onClose={()=>setSplashAnn(null)}/>;

  // ── Derived State ──
  const srv=srvs.find(s=>s.id===aS);
  const ch=srv?.channels?.find(c=>c.id===aCh);
  const msgs=(ch?.msgs||[]).filter(m=>{
    const ign=settings?.ignored||[];
    return ign.indexOf(m.uid)===-1;// filter out ignored users
  });
  const allU=[...testUsers];
  const srvMem=allU.filter(u=>srv?.members?.includes(u.id));
  const blocked=settings?.blocked||[];
  const rep=REP.calc(user);const rl=REP.level(rep);

  return(
    <div className="app">
      <Notify text={notif}/>

      {/* ═══ SERVER BAR ═══ */}
      <div className="sbar">
        <div onClick={()=>{if(srvs[0]){setAS(srvs[0].id);setACh(srvs[0].channels[0]?.id);setView("server")}}} style={{cursor:"pointer",marginBottom:3}}>
          <div style={{width:42,height:42,borderRadius:14,background:"linear-gradient(135deg,var(--acc),var(--pk))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:"#fff"}}>⬡</div>
        </div>
        <div style={{width:30,height:1,background:"var(--bdr)"}}/>
        {srvs.map(s=>{const a=s.id===aS&&view==="server";return(
          <div key={s.id} className={"si "+(a?"on":"")} onClick={()=>{setView("server");setAS(s.id);setACh(s.channels[0]?.id)}} title={s.name}>
            {a&&<div className="ind"/>}{s.icon}
            {s.isTemp&&<div style={{position:"absolute",top:-3,right:-3,fontSize:6,background:"var(--wrn)",borderRadius:2,padding:"0 2px",color:"#000",fontWeight:800}}>⏱</div>}
            {s.earlyServer&&<div style={{position:"absolute",bottom:-3,right:-3,fontSize:7}}>🏰</div>}
          </div>
        )})}
        <div className="si" onClick={()=>setShowCreate(true)} style={{background:"transparent",border:"1px dashed var(--bdr)",fontSize:18,color:"var(--txg)"}}>+</div>
        <div style={{flex:1}}/>
        {[["plugins","🧩"],["admin","👑"],["moderation","🛡"],["settings","⚙"]].map(([v2,ic])=>(
          <div key={v2} className={"si "+(view===v2?"on":"")} onClick={()=>setView(v2)} style={{background:view===v2?"var(--bga)":"transparent",border:"none",fontSize:15}}>{ic}</div>
        ))}
      </div>

      {/* ═══ SIDEBAR ═══ */}
      <div className="side">
        {view==="server"&&srv?<React.Fragment>
          <div style={{padding:"10px 12px",borderBottom:"1px solid var(--bdr)"}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontWeight:800,fontSize:13}}>{srv.name}</span>
              {srv.isTemp&&<span className="chip" style={{background:"#FBBF2418",color:"var(--wrn)"}}>⏱</span>}
              {srv.isPublic&&<span className="chip" style={{background:"#22C55E18",color:"var(--ok)"}}>🌐</span>}
              {srv.earlyServer&&<span className="chip" style={{background:"#14B8A618",color:"#14B8A6"}}>🏰</span>}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:4,marginTop:2}}>
              <TagChip tag={srv.tag} srv={srv}/>
              {srv.badge&&<span className="chip" style={{background:"var(--acc)18",color:"var(--acl)"}}>{srv.badge.name}</span>}
              {srv.customTheme&&<span className="chip" style={{background:(srv.customTheme.c1||"#A855F7")+"18",color:srv.customTheme.c1||"#A855F7"}}>🎨</span>}
            </div>
          </div>
          {srv.banner&&<img src={srv.banner} style={{width:"100%",height:60,objectFit:"cover"}} onError={e=>{e.target.style.display="none"}}/>}
          <div style={{padding:"6px 5px",flex:1,overflowY:"auto"}}>
            <div className="sl">Text</div>
            {srv.channels.map(c=><div key={c.id} className={"ch "+(aCh===c.id?"on":"")} onClick={()=>setACh(c.id)}>
              <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{opacity:.5}}>#</span><span style={{fontWeight:aCh===c.id?600:400}}>{c.name}</span>{(c.slowmode||0)>0&&<span style={{fontSize:7,color:"var(--wrn)"}}>⏱</span>}</div>
              {(c.msgs||[]).length>0&&aCh!==c.id&&<span style={{fontSize:8,color:"var(--txg)"}}>{c.msgs.length}</span>}
            </div>)}
            <div className="sl" style={{marginTop:6}}>Voice</div>
            {srv.vChannels.map(c=><div key={c.id} className="ch" onClick={()=>{setVoiceCh(c);nf("Joined "+c.name)}}><span style={{fontSize:11}}>🔊</span> {c.name}</div>)}
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
          <span style={{fontSize:9,color:"var(--txg)",fontFamily:"monospace"}}>v5.0</span>
        </div>}

        {/* User bar */}
        <div style={{padding:"7px 8px",borderTop:"1px solid var(--bdr)",display:"flex",alignItems:"center",gap:6}}>
          <Av name={user.display} src={user.avatar} size={28} status={user.status||"online"} anim={user.animAvatar} onClick={()=>setProfUser({...user})}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:700,...(user.gradient?{background:"linear-gradient(90deg,"+user.gradient.c1+","+user.gradient.c2+")",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}:{color:R[user.role]?.c||"#fff"})}}>{user.display}</div>
            <div style={{display:"flex",alignItems:"center",gap:3}}>
              <span style={{fontSize:8,color:"var(--ok)"}}>{R[user.role]?.n}{user.premium?" · "+P[user.premium].n:""}</span>
              <span style={{fontSize:7,color:rl.c}}>{rl.i}</span>
            </div>
          </div>
          <span onClick={()=>setView("settings")} style={{cursor:"pointer",fontSize:13,color:"var(--txg)"}}>⚙</span>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="main">
        {view==="server"&&srv&&ch&&<React.Fragment>
          <div style={{padding:"7px 14px",borderBottom:"1px solid var(--bdr)",display:"flex",alignItems:"center",justifyContent:"space-between",background:"color-mix(in srgb,var(--bg2) 90%,transparent)"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14,color:"var(--txg)",fontWeight:800}}>#</span>
              <span style={{fontWeight:700,fontSize:14}}>{ch.name}</span>
              {(ch.slowmode||0)>0&&<span className="chip" style={{background:"#FBBF2415",color:"var(--wrn)"}}>⏱ {smL(ch.slowmode)}</span>}
              <TagChip tag={srv.tag} srv={srv}/>
            </div>
            <span onClick={()=>setShowMem(!showMem)} style={{cursor:"pointer",fontSize:13,color:showMem?"var(--acl)":"var(--txg)"}}>👥</span>
          </div>
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>
            <Chat ch={ch} msgs={msgs} onSend={send} onReact={react} user={user} notify={nf} settings={settings} onEditMsg={editMsg} onDeleteMsg={deleteMsg} onBlock={blockUser} onIgnore={ignoreUser}/>
            {showMem&&<div className="mp">
              <div className="sl">Members — {1+srvMem.length}</div>
              <div onClick={()=>setProfUser({...user})} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 5px",borderRadius:6,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="var(--bgh)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <Av name={user.display} src={user.avatar} size={24} status={user.status||"online"} anim={user.animAvatar}/>
                <div>
                  <div style={{fontSize:11,fontWeight:600,...(user.gradient?{background:"linear-gradient(90deg,"+user.gradient.c1+","+user.gradient.c2+")",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}:{color:R[user.role]?.c||"#fff"})}}>{user.display}</div>
                  <div style={{display:"flex",alignItems:"center",gap:2}}><span style={{fontSize:8,color:R[user.role]?.c||"#6B7280"}}>{R[user.role]?.i} {R[user.role]?.n}</span><span style={{fontSize:7,color:rl.c}}>{rl.i}</span></div>
                </div>
              </div>
              {srvMem.map(u=>{
                if(blocked.indexOf(u.id)!==-1)return<div key={u.id} style={{padding:"4px 8px",fontSize:10,color:"var(--txg)",cursor:"pointer"}} onClick={()=>setProfUser({...u})}>🚫 Blocked user</div>;
                return(
                <div key={u.id} onClick={()=>setProfUser({...u})} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 5px",borderRadius:6,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="var(--bgh)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <Av name={u.display} src={u.avatar} size={24} status={u.status}/>
                  <div><div style={{fontSize:11,fontWeight:600,color:R[u.role]?.c||"#6B7280"}}>{u.display}</div>{u.isTest&&<MsgTag type="system"/>}{u.censored&&<MsgTag type="warning"/>}</div>
                </div>
              )})}
              {srvMem.length===0&&<div style={{padding:10,textAlign:"center"}}>
                <p style={{fontSize:10,color:"var(--txg)"}}>No members yet</p>
                <p style={{fontSize:9,color:"var(--txf)",marginTop:4}}>👑 → Users → Test Account</p>
              </div>}
            </div>}
          </div>
        </React.Fragment>}

        {view==="server"&&(!srv||!ch)&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
          <div style={{fontSize:56}}>⬡</div><h2 style={{fontSize:18,fontWeight:800}}>Welcome to interClouder</h2>
          <p style={{fontSize:12,color:"var(--txm)"}}>Create a server to start</p>
          <button className="btn bp" onClick={()=>setShowCreate(true)}>+ Create Server</button>
        </div>}

        {view==="moderation"&&<ModPanel srvs={srvs} aS={aS} notify={nf} onEditSrv={editSrv} onDeleteSrv={deleteSrv}/>}
        {view==="admin"&&<CEOPanel notify={nf} user={user} allUsers={allU} onEditUser={editUser} onCreateTest={()=>setShowTestCreator(true)} onDeleteUser={delUser} onAnnounce={announce} srvs={srvs} onGiftAirbound={giftAirbound}/>}
        {view==="plugins"&&<PlugPanel notify={nf}/>}
        {view==="settings"&&<SetPanel theme={theme} setTheme={setTheme} user={user} notify={nf} onPay={t=>setPayTier(t)} onLogout={logout} onEditUser={editUser} settings={settings} onSetSettings={setSettings} onDeleteAccount={deleteAccount}/>}
      </div>

      {/* ═══ MODALS ═══ */}
      {showCreate&&<ServerCreator onClose={()=>setShowCreate(false)} onCreate={createSrv} notify={nf}/>}
      {profUser&&<ProfileModal user={profUser} onClose={()=>setProfUser(null)} notify={nf} isOwner={true}
        onEditUser={(id,ch)=>{editUser(id,ch);setProfUser(p=>({...p,...ch}))}}
        onBlock={blockUser} onIgnore={ignoreUser} onCensor={censorProfile}
        isMod={R[user.role]?.lv>=70}/>}
      {showTestCreator&&<TestAccCreator onClose={()=>setShowTestCreator(false)} onCreate={createTest} notify={nf}/>}
      {payTier&&<PaymentModal tier={payTier} onClose={()=>{setPayTier(null);setGiftTarget(null)}} onPurchase={purchase} notify={nf} isGift={!!giftTarget} giftTarget={giftTarget}/>}
    </div>
  );
}

const root=ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
console.log("%c⬡ interClouder v5.0","color:#A855F7;font-weight:bold;font-size:14px");
