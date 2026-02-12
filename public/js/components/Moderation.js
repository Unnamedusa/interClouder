/* Moderation Panel — Enhanced with Strikes, Slowmode, Kick/Ban, Privileges */
window.ModerationView = ({ notify }) => {
  const [tab, setTab] = React.useState("reports");
  const [selectedUser, setSelectedUser] = React.useState("");
  const [strikeReason, setStrikeReason] = React.useState("");

  const tabs = ["reports", "strikes", "kick / ban", "slowmode", "privileges", "mod log", "auto-mod", "badges", "roles"];
  const reports = [
    { id:1, reporter:"u5", reported:"u4", reason:"Spam messages in #general", status:"pending", time:"2h ago" },
    { id:2, reporter:"u1", reported:"u6", reason:"Inappropriate content", status:"resolved", time:"1d ago" },
    { id:3, reporter:"u2", reported:"u4", reason:"Harassment in DMs", status:"pending", time:"5h ago" },
  ];
  const log = [
    { id:1, mod:"u1", action:"Warning", target:"u4", reason:"Spam", time:"1d ago", color:"#FBBF24" },
    { id:2, mod:"me", action:"Strike (10m)", target:"u6", reason:"Inappropriate", time:"2d ago", color:"#F59E0B" },
    { id:3, mod:"u1", action:"Banned (30d)", target:"ShadowBot", reason:"Bot spam", time:"3d ago", color:"#EF4444" },
    { id:4, mod:"u5", action:"Slowmode 10s", target:"#support", reason:"Spam wave", time:"4d ago", color:"#818CF8" },
  ];

  return (
    <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
      <div style={{ width:200, background:"var(--bg-secondary)", borderRight:"1px solid var(--border)", padding:"20px 10px", overflowY:"auto" }}>
        <div className="section-label" style={{ padding:"0 10px", marginBottom:8 }}>Moderation</div>
        {tabs.map(t => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding:"7px 12px", borderRadius:8, marginBottom:2, cursor:"pointer",
            background:tab===t?"rgba(6,214,160,0.08)":"transparent",
            color:tab===t?"#06D6A0":"var(--text-muted)", fontWeight:tab===t?600:400, fontSize:12, textTransform:"capitalize",
          }}>{t}</div>
        ))}
      </div>
      <div style={{ flex:1, padding:28, overflowY:"auto" }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:"var(--text-primary)", marginBottom:20, textTransform:"capitalize" }}>{tab}</h2>

        {tab === "reports" && reports.map(r => (
          <div key={r.id} style={{ padding:14, borderRadius:14, background:"var(--bg-tertiary)", border:`1px solid ${r.status==="pending"?"rgba(251,191,36,0.2)":"var(--border)"}`, marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <Avatar user={IC_USERS[r.reporter]} size={22} showStatus={false} />
                <span style={{ fontSize:12, color:"var(--text-muted)" }}>→</span>
                <Avatar user={IC_USERS[r.reported]} size={22} showStatus={false} />
                <span style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{IC_USERS[r.reported]?.display}</span>
              </div>
              <span style={{ padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700, background:r.status==="pending"?"rgba(251,191,36,0.1)":"rgba(34,197,94,0.1)", color:r.status==="pending"?"#FBBF24":"#22C55E" }}>{r.status}</span>
            </div>
            <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:10 }}>{r.reason}</div>
            {r.status==="pending" && (
              <div style={{ display:"flex", gap:6 }}>
                {[["Warn","#FBBF24"],["Strike","#F59E0B"],["Kick","#F43F5E"],["Ban","#EF4444"],["Dismiss","#6B7280"]].map(([a,c]) => (
                  <button key={a} onClick={() => notify(`${a} → ${IC_USERS[r.reported]?.display}`)} style={{ padding:"4px 10px", borderRadius:8, background:`${c}12`, border:`1px solid ${c}25`, color:c, fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{a}</button>
                ))}
              </div>
            )}
          </div>
        ))}

        {tab === "strikes" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div className="section-label" style={{ marginBottom:8 }}>Strike Escalation</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
                {IC_STRIKES.levels.map((l,i) => (
                  <div key={i} style={{ padding:8, borderRadius:8, background:"var(--bg-primary)", border:"1px solid var(--border)", textAlign:"center" }}>
                    <div style={{ fontSize:16, fontWeight:800, color:i<2?"#FBBF24":i<5?"#F59E0B":i<7?"#F43F5E":"#EF4444" }}>{l.strikes}</div>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)" }}>{l.action}</div>
                    <div style={{ fontSize:9, color:"var(--text-ghost)" }}>{l.duration||"—"}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding:16, borderRadius:14, background:"var(--bg-tertiary)", border:"1px solid var(--border)", marginBottom:16 }}>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:10 }}>Issue Strike</div>
              <select value={selectedUser} onChange={e=>setSelectedUser(e.target.value)} style={{ width:"100%", padding:"8px 10px", borderRadius:8, background:"var(--bg-input)", border:"1px solid var(--border)", color:"var(--text-secondary)", fontSize:13, fontFamily:"inherit", marginBottom:8 }}>
                <option value="">Select user...</option>
                {Object.values(IC_USERS).filter(u=>u.id!=="me").map(u=><option key={u.id} value={u.id}>{u.display} (@{u.username})</option>)}
              </select>
              <input className="login-input" value={strikeReason} onChange={e=>setStrikeReason(e.target.value)} placeholder="Reason for strike..." style={{ marginBottom:8 }} />
              <button className="btn-primary" onClick={() => { if(!selectedUser||!strikeReason){notify("Select user & reason");return;} notify(`⚡ Strike → ${IC_USERS[selectedUser]?.display}: ${strikeReason}`); setStrikeReason(""); }} style={{ background:"linear-gradient(135deg,#F59E0B,#D97706)" }}>⚡ Issue Strike</button>
            </div>
            <div className="section-label" style={{ marginBottom:8 }}>Active Strikes</div>
            {IC_STRIKES.records.map(s => (
              <div key={s.id} style={{ padding:12, borderRadius:10, background:"var(--bg-tertiary)", border:`1px solid ${s.status==="active"?"#F59E0B20":"var(--border)"}`, marginBottom:6, display:"flex", alignItems:"center", gap:10 }}>
                <Avatar user={IC_USERS[s.userId]} size={28} showStatus={false} />
                <div style={{ flex:1 }}><div style={{ display:"flex", alignItems:"center", gap:6 }}><span style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{IC_USERS[s.userId]?.display}</span><span style={{ fontSize:10, padding:"1px 6px", borderRadius:4, background:s.status==="active"?"#F59E0B10":"#6B728010", color:s.status==="active"?"#F59E0B":"#6B7280" }}>×{s.strikes}</span></div><div style={{ fontSize:11, color:"var(--text-ghost)" }}>{s.reason} · {s.time}</div></div>
                {s.expiresIn && <span style={{ fontSize:10, color:"#F59E0B", fontFamily:"monospace" }}>{s.expiresIn}</span>}
                <button onClick={() => notify("Strike removed")} style={{ padding:"3px 8px", borderRadius:6, background:"#22C55E10", border:"1px solid #22C55E20", color:"#22C55E", fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>Remove</button>
              </div>
            ))}
          </div>
        )}

        {tab === "kick / ban" && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
              {[["Kick","🔨","#F43F5E","Remove user. They can rejoin with invite."],["Ban","🚫","#EF4444","Banned from server. Cannot rejoin."]].map(([act,ico,col,desc]) => (
                <div key={act} style={{ padding:16, borderRadius:14, background:"var(--bg-tertiary)", border:"1px solid var(--border)" }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{ico}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:col, marginBottom:4 }}>{act}</div>
                  <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:12 }}>{desc}</p>
                  <select style={{ width:"100%", padding:"8px", borderRadius:8, background:"var(--bg-input)", border:"1px solid var(--border)", color:"var(--text-secondary)", fontSize:12, fontFamily:"inherit", marginBottom:8 }}>
                    <option>Select user...</option>
                    {Object.values(IC_USERS).filter(u=>u.id!=="me").map(u=><option key={u.id}>{u.display}</option>)}
                  </select>
                  <input className="login-input" placeholder="Reason..." style={{ marginBottom:8, fontSize:12 }} />
                  {act==="Ban" && <select style={{ width:"100%", padding:"8px", borderRadius:8, background:"var(--bg-input)", border:"1px solid var(--border)", color:"var(--text-secondary)", fontSize:12, fontFamily:"inherit", marginBottom:8 }}><option>Permanent</option><option>1 Day</option><option>7 Days</option><option>30 Days</option></select>}
                  <button onClick={()=>notify(`User ${act.toLowerCase()}ed!`)} style={{ width:"100%", padding:"8px", borderRadius:8, background:`${col}12`, border:`1px solid ${col}30`, color:col, fontWeight:700, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>{ico} {act}</button>
                </div>
              ))}
            </div>
            <div style={{ padding:16, borderRadius:14, background:"var(--bg-tertiary)", border:"1px solid var(--border)" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:8 }}>🔀 Move & Privilege Controls</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {["Move to AFK","Restrict Channel","Temp Permissions","Remove Voice","Strip Roles"].map(a => (
                  <button key={a} onClick={()=>notify(a)} className="btn-secondary" style={{ fontSize:11 }}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "slowmode" && (
          <div>
            <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:16 }}>Slowmode limits message frequency. Configurable by owners & roles with manage_channels permission.</p>
            {IC_SERVERS[0].channels.filter(c=>c.type==="text").map(ch => {
              const cur = IC_SLOWMODE.channelSettings[ch.id]||0;
              return (
                <div key={ch.id} style={{ padding:12, borderRadius:12, background:"var(--bg-tertiary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                  <span style={{ fontSize:14, color:"var(--text-ghost)" }}>#</span>
                  <span style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)", flex:1 }}>{ch.name}</span>
                  <select value={cur} onChange={e=>{IC_SLOWMODE.channelSettings[ch.id]=parseInt(e.target.value);const l=IC_SLOWMODE.options.find(o=>o.value===parseInt(e.target.value))?.label||"Off";notify(`#${ch.name}: ${l}`);}} style={{ padding:"6px 10px", borderRadius:8, background:"var(--bg-input)", border:"1px solid var(--border)", color:"var(--text-secondary)", fontSize:12, fontFamily:"inherit" }}>
                    {IC_SLOWMODE.options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <span style={{ fontSize:10, color:cur>0?"#FBBF24":"var(--text-ghost)", fontWeight:700, width:40 }}>{cur>0?"⏱ On":"Off"}</span>
                </div>
              );
            })}
          </div>
        )}

        {tab === "privileges" && (
          <div>
            <p style={{ fontSize:12, color:"var(--text-muted)", marginBottom:16 }}>Manage role permissions within the server.</p>
            {Object.entries(IC_ROLES).map(([k,r]) => (
              <div key={k} style={{ padding:14, borderRadius:12, background:"var(--bg-tertiary)", border:"1px solid var(--border)", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:18, color:r.color }}>{r.icon}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:r.color, flex:1 }}>{r.name}</span>
                  <button onClick={()=>notify(`Editing ${r.name}`)} className="btn-secondary" style={{ padding:"4px 10px", fontSize:11 }}>Edit</button>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {r.perms.map(p => (
                    <span key={p} style={{ padding:"2px 8px", borderRadius:6, fontSize:10, fontFamily:"monospace", background:["ban","kick","all","manage_server"].includes(p)?"#EF444410":["moderate","mute","manage_channels"].includes(p)?"#FBBF2410":"#22C55E10", color:["ban","kick","all","manage_server"].includes(p)?"#EF4444":["moderate","mute","manage_channels"].includes(p)?"#FBBF24":"#22C55E" }}>{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "mod log" && log.map(l => (
          <div key={l.id} style={{ padding:12, borderRadius:10, background:"var(--bg-tertiary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
            <Avatar user={IC_USERS[l.mod]||IC_USERS.me} size={26} showStatus={false} />
            <div><span style={{ fontSize:13, color:"var(--text-muted)" }}><strong style={{ color:"var(--text-primary)" }}>{IC_USERS[l.mod]?.display||"System"}</strong> <span style={{ color:l.color }}>{l.action}</span> <strong style={{ color:"var(--text-primary)" }}>{IC_USERS[l.target]?.display||l.target}</strong></span><div style={{ fontSize:11, color:"var(--text-ghost)" }}>{l.reason} · {l.time}</div></div>
          </div>
        ))}

        {tab === "auto-mod" && ["Spam Detection","Link Filter","Mention Spam","Invite Links","Caps Filter","Word Filter","Raid Protection","NSFW Detection"].map((n,i) => (
          <div key={n} style={{ padding:14, borderRadius:12, background:"var(--bg-tertiary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{n}</span>
            <div className={`toggle ${i<3||i>5?"on":"off"}`} onClick={()=>notify(`${n} toggled`)}><div className="knob" /></div>
          </div>
        ))}

        {tab === "badges" && (
          <div>
            <button className="btn-primary" onClick={()=>notify("Badge creator v3.5!")} style={{ marginBottom:14 }}>+ Create Custom Badge</button>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {Object.entries(IC_BADGES).filter(([_,b])=>b.tier!=="boost"&&b.tier!=="purchase").slice(0,12).map(([k,b]) => (
                <div key={k} style={{ padding:8, borderRadius:8, background:"var(--bg-primary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:16, color:b.color }}>{b.icon}</span>
                  <div><div style={{ fontSize:11, fontWeight:700, color:b.color }}>{b.label}</div><div style={{ fontSize:9, color:"var(--text-ghost)" }}>{b.tier}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "roles" && (
          <div>
            <button className="btn-primary" onClick={()=>notify("Role creator v3.5!")} style={{ marginBottom:14 }}>+ Create Custom Role</button>
            {Object.entries(IC_ROLES).map(([k,r]) => (
              <div key={k} style={{ padding:12, borderRadius:12, background:"var(--bg-tertiary)", border:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                <span style={{ fontSize:18, color:r.color }}>{r.icon}</span>
                <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:700, color:r.color }}>{r.name}</div><div style={{ fontSize:10, color:"var(--text-ghost)" }}>{r.perms.join(" · ")}</div></div>
                <button className="btn-secondary" style={{ padding:"4px 10px", fontSize:11 }} onClick={()=>notify("Edit role")}>Edit</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
