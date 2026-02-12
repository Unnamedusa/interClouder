/* Server Creator — Create new servers (permanent/temporary) */
window.ServerCreator = ({ onClose, onCreated, notify }) => {
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("");
  const [isTemp, setIsTemp] = React.useState(false);
  const [tempDuration, setTempDuration] = React.useState("24h");
  const [template, setTemplate] = React.useState(null);
  const [customRoles, setCustomRoles] = React.useState([]);
  const [newRoleName, setNewRoleName] = React.useState("");
  const [newRoleColor, setNewRoleColor] = React.useState("#A855F7");
  const [channels, setChannels] = React.useState(["general", "off-topic"]);
  const [newChannel, setNewChannel] = React.useState("");

  const templates = [
    { id:"gaming", name:"Gaming", icon:"🎮", channels:["general","lfg","clips","voice-chat","Game Night"], roles:[{name:"Gamer",color:"#F43F5E"},{name:"Streamer",color:"#A855F7"}] },
    { id:"community", name:"Community", icon:"👥", channels:["general","introductions","events","off-topic","Voice Lounge"], roles:[{name:"Regular",color:"#06D6A0"},{name:"VIP",color:"#FBBF24"}] },
    { id:"creative", name:"Creative", icon:"🎨", channels:["showcase","feedback","resources","collab","Studio"], roles:[{name:"Artist",color:"#F472B6"},{name:"Mentor",color:"#818CF8"}] },
    { id:"tech", name:"Tech & Code", icon:"💻", channels:["help","projects","code-review","devops","Pair Programming"], roles:[{name:"Developer",color:"#06D6A0"},{name:"Reviewer",color:"#FBBF24"}] },
    { id:"blank", name:"Blank", icon:"📝", channels:["general"], roles:[] },
  ];

  const tempOptions = [
    { value:"1h", label:"1 Hour" }, { value:"6h", label:"6 Hours" },
    { value:"24h", label:"24 Hours" }, { value:"3d", label:"3 Days" },
    { value:"7d", label:"7 Days" }, { value:"30d", label:"30 Days" },
  ];

  const colors = ["#A855F7","#EF4444","#06D6A0","#FBBF24","#F472B6","#818CF8","#F43F5E","#14B8A6","#6366F1","#D946EF"];

  const addRole = () => {
    if (!newRoleName.trim()) return;
    setCustomRoles(p => [...p, { name: newRoleName.trim(), color: newRoleColor, perms: ["chat","react"] }]);
    setNewRoleName("");
  };

  const addChannel = () => {
    if (!newChannel.trim()) return;
    setChannels(p => [...p, newChannel.trim().toLowerCase().replace(/\s+/g, "-")]);
    setNewChannel("");
  };

  const handleCreate = () => {
    if (!name.trim()) { notify("Server name required!"); return; }
    const srv = {
      id: "s_" + Date.now().toString(36),
      name: name.trim(),
      icon: icon || name.substring(0, 2).toUpperCase(),
      color: newRoleColor,
      members: 1,
      boostLevel: 0,
      xp: 0,
      isTemporary: isTemp,
      tempExpires: isTemp ? tempDuration : null,
      channels: channels.map((ch, i) => ({
        id: "ch_" + Date.now().toString(36) + i,
        name: ch,
        type: ch.includes("voice") || ch.includes("Voice") || ch.includes("Night") || ch.includes("Studio") || ch.includes("Programming") || ch.includes("Lounge") ? "voice" : "text",
        unread: 0,
      })),
      customRoles: customRoles,
    };
    onCreated(srv);
    notify(`Server "${name}" created!${isTemp ? ` (expires in ${tempDuration})` : ""}`);
    onClose();
  };

  const selectTemplate = (t) => {
    setTemplate(t.id);
    setChannels([...t.channels]);
    setCustomRoles([...t.roles.map(r => ({ ...r, perms: ["chat","react"] }))]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ width: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            {step === 1 ? "Create Server" : step === 2 ? "Customize" : "Roles & Finish"}
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 20 }}>
            {step === 1 ? "Choose a template or start from scratch" : step === 2 ? "Add channels and configure" : "Set up roles for your server"}
          </p>

          {/* Step indicators */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? "var(--accent)" : "var(--border)", transition: "0.3s" }} />
            ))}
          </div>

          {/* STEP 1: Template */}
          {step === 1 && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                {templates.map(t => (
                  <div key={t.id} onClick={() => selectTemplate(t)} style={{
                    padding: 14, borderRadius: 14, background: template === t.id ? "var(--bg-active)" : "var(--bg-primary)",
                    border: `1px solid ${template === t.id ? "var(--accent)" : "var(--border)"}`,
                    cursor: "pointer", textAlign: "center", transition: "0.2s",
                  }}>
                    <div style={{ fontSize: 28 }}>{t.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: template === t.id ? "var(--accent-light)" : "var(--text-secondary)", marginTop: 4 }}>{t.name}</div>
                  </div>
                ))}
              </div>

              {/* Temporary toggle */}
              <div style={{ padding: 14, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border)", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>⏱ Temporary Server</div>
                    <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 2 }}>Auto-deletes after set time</div>
                  </div>
                  <div className={`toggle ${isTemp ? "on" : "off"}`} onClick={() => setIsTemp(!isTemp)}><div className="knob" /></div>
                </div>
                {isTemp && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {tempOptions.map(o => (
                      <button key={o.value} onClick={() => setTempDuration(o.value)} style={{
                        padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                        background: tempDuration === o.value ? "var(--accent)" : "var(--bg-tertiary)",
                        color: tempDuration === o.value ? "#fff" : "var(--text-muted)",
                        border: `1px solid ${tempDuration === o.value ? "var(--accent)" : "var(--border)"}`,
                      }}>{o.label}</button>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn-primary" onClick={() => setStep(2)} style={{ width: "100%" }}>Next →</button>
            </div>
          )}

          {/* STEP 2: Name, Icon, Channels */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 5 }}>Server Name</label>
                <input className="login-input" value={name} onChange={e => setName(e.target.value)} placeholder="My Awesome Server" />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 5 }}>Icon (2 letters or emoji)</label>
                <input className="login-input" value={icon} onChange={e => setIcon(e.target.value.substring(0, 2))} placeholder={name ? name.substring(0,2).toUpperCase() : "IC"} maxLength={2} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 5 }}>Server Color</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {colors.map(c => (
                    <div key={c} onClick={() => setNewRoleColor(c)} style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: "pointer", border: newRoleColor === c ? "2px solid #fff" : "2px solid transparent" }} />
                  ))}
                </div>
              </div>

              {/* Channels */}
              <div>
                <label style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 5 }}>Channels</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {channels.map((ch, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, background: "var(--bg-primary)", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-secondary)" }}>
                      <span style={{ opacity: 0.5 }}>{ch.includes("Voice") || ch.includes("Night") || ch.includes("Studio") ? "🔊" : "#"}</span> {ch}
                      <span onClick={() => setChannels(p => p.filter((_, j) => j !== i))} style={{ cursor: "pointer", color: "var(--text-ghost)", fontSize: 14, marginLeft: 2 }}>×</span>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input className="login-input" value={newChannel} onChange={e => setNewChannel(e.target.value)} onKeyDown={e => e.key === "Enter" && addChannel()} placeholder="Add channel..." style={{ flex: 1 }} />
                  <button className="btn-secondary" onClick={addChannel} style={{ padding: "8px 14px" }}>+</button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(3)} style={{ flex: 1 }}>Next →</button>
              </div>
            </div>
          )}

          {/* STEP 3: Roles & Create */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Custom roles for your server. Default roles (Cloud Master, Cloudling) are always included.</p>

              {/* Existing roles */}
              {customRoles.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: r.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: r.color, flex: 1 }}>{r.name}</span>
                  <span onClick={() => setCustomRoles(p => p.filter((_, j) => j !== i))} style={{ cursor: "pointer", color: "var(--text-ghost)", fontSize: 16 }}>×</span>
                </div>
              ))}

              {/* Add role */}
              <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <input className="login-input" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} onKeyDown={e => e.key === "Enter" && addRole()} placeholder="Role name..." />
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  {colors.slice(0, 5).map(c => (
                    <div key={c} onClick={() => setNewRoleColor(c)} style={{ width: 22, height: 22, borderRadius: 6, background: c, cursor: "pointer", border: newRoleColor === c ? "2px solid #fff" : "2px solid transparent" }} />
                  ))}
                </div>
                <button className="btn-secondary" onClick={addRole} style={{ padding: "8px 14px" }}>+</button>
              </div>

              {/* Summary */}
              <div style={{ padding: 14, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 6 }}>Summary</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.8 }}>
                  <div>📛 <strong style={{ color: "var(--text-primary)" }}>{name || "Unnamed"}</strong></div>
                  <div>📁 {channels.length} channels</div>
                  <div>🎭 {customRoles.length + 2} roles (including defaults)</div>
                  {isTemp && <div>⏱ Expires in {tempDuration}</div>}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
                <button className="btn-primary" onClick={handleCreate} style={{ flex: 1 }}>Create Server</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
