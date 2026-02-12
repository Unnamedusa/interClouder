/* ══════════════════════════════════════════════
   interClouder v3.5 — Main Application
   Features: Server creation, Plugins, Admin CMD,
   Strikes, Slowmode, Voice, Tags, Global Mod
   ══════════════════════════════════════════════ */
const { useState, useEffect, useRef } = React;

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [view, setView] = useState("server");
  const [activeServer, setActiveServer] = useState("s1");
  const [activeChannel, setActiveChannel] = useState("ch1");
  const [activeDM, setActiveDM] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [showPremium, setShowPremium] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [messages, setMessages] = useState({});
  const [dmMessages, setDmMessages] = useState(IC_DM_MSGS);
  const [notif, setNotif] = useState(null);
  const [showUsers, setShowUsers] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [servers, setServers] = useState(IC_SERVERS);
  const [voiceChannel, setVoiceChannel] = useState(null);

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);
  useEffect(() => {
    if (activeChannel && !messages[activeChannel]) {
      setMessages(p => ({...p, [activeChannel]: IC_MESSAGES[activeChannel] || [
        {id:1, user:"u1", text:"Welcome to this channel! 🚀", time:"12:00 PM", reactions:[{emoji:"🎉",count:3}]},
        {id:2, user:"u5", text:"Excited to be here!", time:"12:05 PM", reactions:[{emoji:"💜",count:2}]}
      ]}));
    }
  }, [activeChannel]);

  const notify = t => { setNotif(t); setTimeout(() => setNotif(null), 2500); };

  const handleLogin = () => { setLoggedIn(true); setShowTutorial(true); };
  const handleSend = (text) => {
    const m = { id:Date.now(), user:"me", text, time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), reactions:[] };
    IC_Crypto.encryptFull(text);
    // Slowmode check
    const sm = IC_SLOWMODE.channelSettings[activeChannel] || 0;
    if (sm > 0 && view === "server") {
      // In production: track last send time
    }
    if (view === "dms" && activeDM) setDmMessages(p => ({...p, [activeDM]:[...(p[activeDM]||[]),m]}));
    else setMessages(p => ({...p, [activeChannel]:[...(p[activeChannel]||[]),m]}));
  };
  const handleReact = (mid, emoji) => {
    if (view === "dms") return;
    setMessages(p => {
      const c = [...(p[activeChannel]||[])]; const i = c.findIndex(m => m.id === mid); if (i === -1) return p;
      const m = {...c[i], reactions:[...c[i].reactions]}; const r = m.reactions.findIndex(x => x.emoji === emoji);
      if (r >= 0) m.reactions[r] = {...m.reactions[r], count:m.reactions[r].count+1}; else m.reactions.push({emoji,count:1});
      c[i] = m; return {...p, [activeChannel]:c};
    });
  };
  const handleServerCreated = (srv) => {
    setServers(p => [...p, srv]);
    setActiveServer(srv.id);
    setActiveChannel(srv.channels[0]?.id);
    setView("server");
  };

  if (!loggedIn) return <LoginScreen onLogin={handleLogin} />;
  if (showTutorial) return <Tutorial onComplete={() => setShowTutorial(false)} />;

  const srv = servers.find(s => s.id === activeServer);
  const ch = srv?.channels?.find(c => c.id === activeChannel);
  const curMsgs = view === "dms" ? (dmMessages[activeDM]||[]) : (messages[activeChannel]||[]);
  const dm = IC_DM_CONVOS.find(d => d.id === activeDM);
  const dmU = dm ? IC_USERS[dm.userId] : null;
  const onlineU = Object.values(IC_USERS).filter(u => u.status === "online");
  const offlineU = Object.values(IC_USERS).filter(u => u.status !== "online");
  const slowmode = IC_SLOWMODE.channelSettings[activeChannel] || 0;
  const slowLabel = IC_SLOWMODE.options.find(o => o.value === slowmode)?.label;
  // Server tags for current user
  const myTags = IC_SERVER_TAGS.userTags["me"] || [];

  return (
    <div className="app-container">
      {notif && <div className="toast">{notif}</div>}

      {/* SERVER BAR */}
      <div className="server-bar">
        <div onClick={() => {setView("server");setActiveServer("s1");setActiveChannel("ch1");}} style={{ cursor:"pointer", marginBottom:6, transition:"transform 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          <MatrixCube size={44} />
        </div>
        <div style={{ width:32, height:1, background:"var(--border)", margin:"2px 0 6px" }} />

        {/* DMs */}
        <div className={`server-icon ${view==="dms"?"active":""}`} onClick={()=>{setView("dms");setActiveDM("dm1");}}
          style={view==="dms"?{background:"linear-gradient(135deg,var(--accent),var(--accent-dark))",borderRadius:16,color:"#fff",border:"none"}:{}}>💬</div>
        <div style={{ width:32, height:1, background:"var(--border)", margin:"4px 0 6px" }} />

        {/* Servers */}
        {servers.map(s => {
          const a = activeServer===s.id && view==="server";
          const ur = s.channels?.reduce((x,c) => x+(c.unread||0),0)||0;
          return (
            <div key={s.id} style={{ position:"relative" }}>
              <div className={`server-icon ${a?"active":""}`}
                onClick={() => {setView("server");setActiveServer(s.id);setActiveChannel(s.channels?.[0]?.id);}}
                title={`${s.name}${s.isTemporary?" (temp)":""}`}
                style={a?{background:`linear-gradient(135deg,${s.color},${s.color}BB)`,borderRadius:16,color:"#fff",border:"none"}:{}}>
                {a && <div className="indicator" />}
                {s.icon}
                {ur > 0 && !a && <div className="badge-count">{ur}</div>}
                {s.isTemporary && <div style={{ position:"absolute", top:-2, left:-2, fontSize:8, background:"#FBBF24", borderRadius:4, padding:"0 3px", color:"#000", fontWeight:800 }}>⏱</div>}
              </div>
            </div>
          );
        })}

        {/* Create Server */}
        <div className="server-icon" onClick={() => setShowCreateServer(true)} title="Create Server"
          style={{ background:"transparent", border:"1px dashed var(--border)", color:"var(--text-ghost)", fontSize:20 }}>+</div>

        <div style={{ flex:1 }} />

        {/* Bottom icons */}
        <div className="server-icon" onClick={() => setShowPremium(true)} title="Airbound" style={{ background:"transparent", border:"none", fontSize:16, color:"var(--text-ghost)" }}>✨</div>
        <div className="server-icon" onClick={() => setView("plugins")} title="Plugins & AI"
          style={{ background:view==="plugins"?"var(--bg-active)":"transparent", border:"none", fontSize:16, color:view==="plugins"?"var(--accent)":"var(--text-ghost)" }}>🧩</div>
        <div className="server-icon" onClick={() => setView("admin")} title="Admin Panel"
          style={{ background:view==="admin"?"rgba(239,68,68,0.08)":"transparent", border:"none", fontSize:16, color:view==="admin"?"#EF4444":"var(--text-ghost)" }}>👑</div>
        <div className="server-icon" onClick={() => setView("moderation")} title="Moderation"
          style={{ background:view==="moderation"?"rgba(6,214,160,0.08)":"transparent", border:"none", fontSize:16, color:view==="moderation"?"#06D6A0":"var(--text-ghost)" }}>🛡️</div>
        <div className="server-icon" onClick={() => setView("settings")} title="Settings"
          style={{ background:view==="settings"?"var(--bg-active)":"transparent", border:"none", fontSize:16, color:view==="settings"?"var(--accent-light)":"var(--text-ghost)" }}>⚙</div>
      </div>

      {/* SIDEBAR */}
      <div className="sidebar">
        {view === "server" && srv && (
          <React.Fragment>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <span style={{ fontWeight:800, fontSize:15, color:"var(--text-primary)" }}>{srv.name}</span>
                {srv.isTemporary && <span style={{ fontSize:9, padding:"1px 5px", borderRadius:4, background:"#FBBF2418", color:"#FBBF24", fontWeight:700, marginLeft:6 }}>TEMP</span>}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:9, padding:"2px 6px", borderRadius:4, background:"var(--bg-active)", color:"var(--accent-light)", fontWeight:700 }}>Lv.{srv.boostLevel}</span>
                <span style={{ fontSize:10, color:"var(--text-ghost)", fontFamily:"monospace" }}>{srv.members?.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ padding:"10px 8px", flex:1, overflowY:"auto" }}>
              <div className="section-label">Text Channels</div>
              {srv.channels?.filter(c => c.type==="text").map(c => {
                const sm = IC_SLOWMODE.channelSettings[c.id] || 0;
                return (
                  <div key={c.id} className={`channel-item ${activeChannel===c.id?"active":""}`} onClick={() => setActiveChannel(c.id)}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:13 }}>
                      <span style={{ fontSize:14, opacity:0.5 }}>{c.locked?"🔒":c.restricted?"🔐":"#"}</span>
                      <span style={{ fontWeight:activeChannel===c.id?600:400 }}>{c.name}</span>
                      {sm > 0 && <span style={{ fontSize:8, color:"#FBBF24" }}>⏱</span>}
                    </div>
                    {c.unread>0 && <span style={{ minWidth:18, height:18, borderRadius:9, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff", padding:"0 4px" }}>{c.unread}</span>}
                  </div>
                );
              })}
              <div className="section-label" style={{ marginTop:10 }}>Voice</div>
              {srv.channels?.filter(c => c.type==="voice").map(c => (
                <div key={c.id} style={{ padding:"6px 10px", borderRadius:8 }}>
                  <div onClick={() => { setVoiceChannel(c); notify(`Joined ${c.name}`); }} style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, color:"var(--text-faint)", cursor:"pointer" }}>
                    <span style={{ fontSize:12 }}>🔊</span><span>{c.name}</span>
                    {c.users?.length>0 && <span style={{ fontSize:10, marginLeft:"auto" }}>{c.users.length}</span>}
                  </div>
                  {c.users?.length>0 && <div style={{ paddingLeft:22, marginTop:4 }}>{c.users.map(uid => IC_USERS[uid] && (
                    <div key={uid} onClick={() => setProfileUser(uid)} style={{ display:"flex", alignItems:"center", gap:6, padding:"2px 0", cursor:"pointer", fontSize:11, color:"var(--text-muted)" }}>
                      <Avatar user={IC_USERS[uid]} size={16} /><span>{IC_USERS[uid].display}</span>
                    </div>
                  ))}</div>}
                </div>
              ))}
            </div>
            {/* Voice panel if connected */}
            {voiceChannel && (
              <VoicePanel channelName={voiceChannel.name} users={voiceChannel.users || []} onClose={() => { setVoiceChannel(null); notify("Disconnected from voice"); }} notify={notify} />
            )}
          </React.Fragment>
        )}

        {view === "dms" && (
          <React.Fragment>
            <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)" }}><span style={{ fontWeight:800, fontSize:15, color:"var(--text-primary)" }}>Direct Messages</span></div>
            <div style={{ padding:"8px" }}>
              <div style={{ padding:"7px 10px", borderRadius:10, background:"var(--bg-input)", border:"1px solid var(--border)", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:13, color:"var(--text-ghost)" }}>⌕</span>
                <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder="Find..." style={{ flex:1, background:"none", border:"none", outline:"none", color:"var(--text-secondary)", fontSize:12 }} />
              </div>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"0 6px" }}>
              {IC_DM_CONVOS.filter(d => !searchQ || IC_USERS[d.userId].display.toLowerCase().includes(searchQ.toLowerCase())).map(d => {
                const u = IC_USERS[d.userId];
                return (
                  <div key={d.id} className={`channel-item ${activeDM===d.id?"active":""}`} onClick={() => setActiveDM(d.id)} style={{ padding:"8px", gap:10 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flex:1, minWidth:0 }}>
                      <Avatar user={u} size={34} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                          <span style={{ fontSize:13, fontWeight:600, color:"var(--text-secondary)" }}>{u.display}</span>
                          <span style={{ fontSize:10, color:"var(--text-ghost)" }}>{d.time}</span>
                        </div>
                        <div style={{ fontSize:11, color:"var(--text-faint)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{d.lastMsg}</div>
                      </div>
                      {d.unread>0 && <span style={{ minWidth:18, height:18, borderRadius:9, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:800, color:"#fff" }}>{d.unread}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}

        {["settings","moderation","admin","plugins"].includes(view) && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:8, opacity:0.7 }}>
            <MatrixCube size={56} />
            <span style={{ fontSize:16, fontWeight:800, color:"var(--accent-light)", letterSpacing:1 }}>interClouder</span>
            <span style={{ fontSize:11, color:"var(--text-ghost)", fontFamily:"'JetBrains Mono',monospace" }}>v3.5 · Encrypted</span>
          </div>
        )}

        {/* User Bar */}
        <div style={{ padding:"10px 12px", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8, background:"color-mix(in srgb, var(--bg-primary) 50%, transparent)" }}>
          <Avatar user={IC_USERS.me} size={32} onClick={() => setProfileUser("me")} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:700 }}><RoleName user={IC_USERS.me} /></div>
            <div style={{ fontSize:10, color:"var(--success)" }}>Online</div>
          </div>
          <div onClick={() => setView("settings")} style={{ cursor:"pointer", fontSize:14, color:"var(--text-ghost)" }}>⚙</div>
        </div>
      </div>

      {/* MAIN */}
      <div className="main-content">
        {view === "settings" && <SettingsView notify={notify} onThemeChange={setTheme} currentTheme={theme} />}
        {view === "moderation" && <ModerationView notify={notify} />}
        {view === "admin" && <AdminPanel notify={notify} />}
        {view === "plugins" && <PluginStore notify={notify} />}

        {(view === "server" || view === "dms") && (
          <React.Fragment>
            {/* Header */}
            <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"color-mix(in srgb, var(--bg-secondary) 90%, transparent)", backdropFilter:"blur(10px)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {view === "server" ? (
                  <React.Fragment>
                    <span style={{ fontSize:16, color:"var(--text-ghost)", fontWeight:800 }}>#</span>
                    <span style={{ fontWeight:700, color:"var(--text-primary)", fontSize:15 }}>{ch?.name}</span>
                    {slowmode > 0 && <span style={{ fontSize:10, padding:"2px 6px", borderRadius:6, background:"#FBBF2410", color:"#FBBF24", fontWeight:700 }}>⏱ {slowLabel}</span>}
                  </React.Fragment>
                ) : dmU && (
                  <React.Fragment><Avatar user={dmU} size={26} /><span style={{ fontWeight:700, color:"var(--text-primary)", fontSize:15 }}>{dmU.display}</span><StatusDot status={dmU.status} size={8} />
                    <span style={{ fontSize:10, color:"var(--text-ghost)" }}>DMs: {dmU.dmPermission === "nobody" ? "🔒" : dmU.dmPermission === "friends" ? "👥" : "🌐"}</span>
                  </React.Fragment>
                )}
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {view === "server" && (
                  <React.Fragment>
                    {/* Server Tags */}
                    {myTags.length > 0 && (
                      <div style={{ display:"flex", gap:3 }}>
                        {myTags.slice(0,2).map(tid => {
                          const t = IC_SERVER_TAGS.tags.find(x => x.id === tid);
                          return t ? <span key={tid} style={{ fontSize:9, padding:"2px 5px", borderRadius:4, background:`${t.color}12`, color:t.color, fontWeight:700 }}>{t.icon} {t.name}</span> : null;
                        })}
                      </div>
                    )}
                    <span onClick={() => setShowUsers(!showUsers)} style={{ cursor:"pointer", fontSize:16, color:showUsers?"var(--accent-light)":"var(--text-ghost)" }}>👥</span>
                  </React.Fragment>
                )}
              </div>
            </div>

            <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
              <ChatArea view={view} channel={ch} dmUser={dmU} messages={curMsgs} onSend={handleSend} onReact={handleReact} onProfile={setProfileUser} notify={notify} />

              {showUsers && view === "server" && (
                <div className="members-panel">
                  <div className="section-label">Online — {onlineU.length}</div>
                  {onlineU.map(u => (
                    <div key={u.id} onClick={() => setProfileUser(u.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 6px", borderRadius:8, cursor:"pointer", marginBottom:1 }}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <Avatar user={u} size={28} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:500 }}><RoleName user={u} /></div>
                        {u.role && IC_ROLES[u.role] && <div style={{ fontSize:9, color:IC_ROLES[u.role].color }}>{IC_ROLES[u.role].icon} {IC_ROLES[u.role].name}</div>}
                      </div>
                    </div>
                  ))}
                  <div className="section-label" style={{ marginTop:10 }}>Offline — {offlineU.length}</div>
                  {offlineU.map(u => (
                    <div key={u.id} onClick={() => setProfileUser(u.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 6px", borderRadius:8, cursor:"pointer", marginBottom:1, opacity:0.45 }}
                      onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <Avatar user={u} size={28} /><span style={{ fontSize:12, color:"var(--text-muted)" }}>{u.display}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </React.Fragment>
        )}
      </div>

      {/* Modals */}
      {profileUser && <ProfileModal userId={profileUser} onClose={() => setProfileUser(null)} onDM={uid => {setView("dms");setActiveDM("dm1");}} notify={notify} />}
      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} notify={notify} />}
      {showCreateServer && <ServerCreator onClose={() => setShowCreateServer(false)} onCreated={handleServerCreated} notify={notify} />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
console.log("%c⬡ interClouder v3.5 loaded", "color: #A855F7; font-weight: bold; font-size: 14px");
