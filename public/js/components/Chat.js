/* Chat Area — Messages, Reactions, Translate, Input */
window.ChatArea = ({ view, channel, dmUser, messages, onSend, onReact, onProfile, notify }) => {
  const [msgInput, setMsgInput] = React.useState("");
  const msgEnd = React.useRef(null);
  const inpRef = React.useRef(null);
  const qe = ["👍","❤️","🔥","😂","💜","🚀","✨","👀"];

  React.useEffect(() => { msgEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = () => {
    if (!msgInput.trim()) return;
    onSend(msgInput);
    setMsgInput("");
    inpRef.current?.focus();
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
      <div style={{ flex:1, overflowY:"auto", padding:"12px 16px 8px" }}>
        {/* Welcome header */}
        <div style={{ textAlign:"center", padding:"16px 0 20px" }}>
          {view === "server" ? (
            <React.Fragment>
              <div style={{ fontSize:32, color:"var(--border-light)" }}>#</div>
              <div style={{ fontSize:18, fontWeight:800, color:"var(--text-primary)" }}>#{channel?.name}</div>
              <div style={{ fontSize:11, color:"var(--text-ghost)", marginTop:4 }}>🔒 Secured channel</div>
            </React.Fragment>
          ) : dmUser && (
            <React.Fragment>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:8 }}><Avatar user={dmUser} size={52} showStatus={false} /></div>
              <div style={{ fontSize:18, fontWeight:800, color:"var(--text-primary)" }}>{dmUser.display}</div>
              <div style={{ fontSize:11, color:"var(--text-ghost)", marginTop:4 }}>
                🔒 End-to-end encrypted · DMs: {dmUser.dmPermission === "nobody" ? "Closed" : dmUser.dmPermission === "friends" ? "Friends only" : "Open"}
              </div>
            </React.Fragment>
          )}
        </div>

        {/* Messages */}
        {(messages || []).map((m, i) => {
          const u = IC_USERS[m.user] || IC_USERS.me;
          const h = i === 0 || messages[i-1]?.user !== m.user;
          return (
            <div key={m.id} className={`message-row ${h ? "" : "compact"}`}>
              {h ? (
                <div style={{ display:"flex", gap:10 }}>
                  <Avatar user={u} size={36} showStatus={false} onClick={() => onProfile(m.user)} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap", marginBottom:1 }}>
                      <span onClick={() => onProfile(m.user)} style={{ cursor:"pointer" }}><RoleName user={u} /></span>
                      <RoleBadge user={u} />
                      {u.badges?.slice(0,2).map(b => <Badge key={b} id={b} />)}
                      <span style={{ fontSize:10, color:"var(--text-ghost)" }}>{m.time}</span>
                    </div>
                    <div style={{ fontSize:13.5, color:"var(--text-secondary)", lineHeight:1.5 }}>{m.text}</div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize:13.5, color:"var(--text-secondary)", lineHeight:1.5 }}>{m.text}</div>
              )}
              {m.reactions?.length > 0 && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4, paddingLeft:h?46:0 }}>
                  {m.reactions.map((r,ri) => (
                    <button key={ri} onClick={() => onReact(m.id, r.emoji)} className="reaction-btn">
                      <span>{r.emoji}</span><span style={{ fontSize:10, fontWeight:700 }}>{r.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={msgEnd} />
      </div>

      {/* Input */}
      <div style={{ padding:"8px 16px 14px" }}>
        <div style={{ display:"flex", gap:3, marginBottom:6, paddingLeft:4 }}>
          {qe.map(e => (
            <button key={e} onClick={() => setMsgInput(p => p + e)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, padding:"2px 3px", borderRadius:4, opacity:0.4, transition:"0.15s" }}
              onMouseEnter={ev => ev.target.style.opacity = 1} onMouseLeave={ev => ev.target.style.opacity = 0.4}>{e}</button>
          ))}
        </div>
        <div className="msg-input-wrap">
          <button style={{ background:"none", border:"none", fontSize:16, cursor:"pointer", color:"var(--text-faint)", padding:0 }}>＋</button>
          <input ref={inpRef} className="msg-input" value={msgInput} onChange={e => setMsgInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder={view === "dms" ? `Message ${dmUser?.display || ""}` : `Message #${channel?.name || ""}`} />
          <span style={{ fontSize:10, color:"var(--text-ghost)" }}>🔒</span>
          <button onClick={send} className={`send-btn ${msgInput.trim() ? "active" : "inactive"}`}>↑</button>
        </div>
      </div>
    </div>
  );
};
