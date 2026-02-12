/* Admin Panel — Global Administration, CMD, Account Management, Reputation */
window.AdminPanel = ({ notify }) => {
  const [tab, setTab] = React.useState("cmd");
  const [cmdInput, setCmdInput] = React.useState("");
  const [cmdLog, setCmdLog] = React.useState([
    { cmd: "/adduser NeonDrift admin", result: "✓ NeonDrift promoted to admin", time: "2m ago", success: true },
    { cmd: "/reputation CryptoNimbus", result: "Reputation: 85 (Trusted ◇)", time: "10m ago", success: true },
  ]);
  const tabs = ["cmd", "accounts", "reputation", "global log", "trash"];

  const handleCmd = () => {
    if (!cmdInput.trim()) return;
    const input = cmdInput.trim();
    let result = ""; let success = true;

    // Parse commands
    if (input.startsWith("/adduser ")) {
      const parts = input.split(" ");
      const username = parts[1] || "?";
      const role = parts[2] || "cloudling";
      result = `✓ ${username} added as ${role}`;
    } else if (input.startsWith("/removeuser ")) {
      const username = input.split(" ")[1] || "?";
      result = `✓ ${username} removed from server`;
    } else if (input.startsWith("/promote ")) {
      const parts = input.split(" ");
      result = `✓ ${parts[1] || "?"} promoted to ${parts[2] || "next role"}`;
    } else if (input.startsWith("/demote ")) {
      const parts = input.split(" ");
      result = `✓ ${parts[1] || "?"} demoted to ${parts[2] || "previous role"}`;
    } else if (input.startsWith("/strike ")) {
      const parts = input.split(" ");
      const reason = parts.slice(2).join(" ") || "No reason";
      result = `⚡ Strike issued to ${parts[1] || "?"} — ${reason}`;
    } else if (input.startsWith("/kick ")) {
      result = `🔨 ${input.split(" ")[1] || "?"} kicked from server`;
    } else if (input.startsWith("/ban ")) {
      const parts = input.split(" ");
      result = `🚫 ${parts[1] || "?"} banned ${parts[2] ? "for " + parts[2] : "permanently"}`;
    } else if (input.startsWith("/unban ")) {
      result = `✓ ${input.split(" ")[1] || "?"} unbanned`;
    } else if (input.startsWith("/globalban ")) {
      result = `🚫 GLOBAL BAN: ${input.split(" ")[1] || "?"} banned from platform`;
    } else if (input.startsWith("/reputation ")) {
      const user = input.split(" ")[1];
      const u = Object.values(IC_USERS).find(u => u.username.toLowerCase() === user?.toLowerCase());
      if (u) {
        const rep = IC_GLOBAL_MOD.reputation.levels.find((l, i, arr) => !arr[i + 1] || u.xp / 10 < arr[i + 1].score) || IC_GLOBAL_MOD.reputation.levels[0];
        result = `${u.display}: Rep ${Math.floor(u.xp / 10)} — ${rep.label} ${rep.icon}`;
      } else { result = `✗ User "${user}" not found`; success = false; }
    } else if (input.startsWith("/disable ")) {
      result = `🔒 Account ${input.split(" ")[1] || "?"} disabled (14 day recovery)`;
    } else if (input.startsWith("/recover ")) {
      result = `♻️ Account ${input.split(" ")[1] || "?"} recovered from trash`;
    } else if (input.startsWith("/slowmode ")) {
      const parts = input.split(" ");
      result = `⏱ Slowmode set to ${parts[2] || "10"}s in #${parts[1] || "general"}`;
    } else if (input === "/help") {
      result = "Commands: /adduser <name> <role> · /removeuser <name> · /promote <name> <role> · /demote <name> <role> · /strike <name> <reason> · /kick <name> · /ban <name> [duration] · /unban <name> · /globalban <name> · /reputation <name> · /disable <name> · /recover <name> · /slowmode <channel> <seconds>";
    } else {
      result = `✗ Unknown command. Type /help for available commands.`;
      success = false;
    }

    setCmdLog(p => [{ cmd: input, result, time: "now", success }, ...p]);
    setCmdInput("");
    notify(success ? "Command executed" : "Command failed");
  };

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{ width: 200, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", padding: "20px 10px" }}>
        <div className="section-label" style={{ padding: "0 10px", marginBottom: 8 }}>Admin Panel</div>
        {tabs.map(t => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: "8px 12px", borderRadius: 8, marginBottom: 2, cursor: "pointer",
            background: tab === t ? "rgba(239,68,68,0.08)" : "transparent",
            color: tab === t ? "#EF4444" : "var(--text-muted)", fontWeight: tab === t ? 600 : 400, fontSize: 13, textTransform: "capitalize",
          }}>{t === "cmd" ? "⌘ CMD" : t}</div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
          {tab === "cmd" ? "⌘ Command Console" : tab.charAt(0).toUpperCase() + tab.slice(1)}
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 20 }}>
          {tab === "cmd" ? "Execute admin commands in real-time" : tab === "accounts" ? "Manage user accounts across the platform" : tab === "reputation" ? "View & manage user reputation scores" : tab === "global log" ? "Platform-wide moderation history" : "Recover deleted accounts (14 day window)"}
        </p>

        {/* CMD TAB */}
        {tab === "cmd" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: "#0d0a1490", border: "1px solid var(--border)", fontFamily: "'JetBrains Mono', monospace" }}>
                <span style={{ color: "#22C55E", fontWeight: 700 }}>$</span>
                <input value={cmdInput} onChange={e => setCmdInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCmd()}
                  placeholder="Type a command... (/help for list)" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#22C55E", fontSize: 13, fontFamily: "inherit" }} />
              </div>
              <button className="btn-primary" onClick={handleCmd} style={{ fontFamily: "'JetBrains Mono',monospace", background: "linear-gradient(135deg,#22C55E,#16A34A)" }}>Run</button>
            </div>

            {/* Quick commands */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {["/help","/adduser","/kick","/strike","/ban","/reputation","/slowmode"].map(c => (
                <button key={c} onClick={() => setCmdInput(c + " ")} style={{
                  padding: "4px 10px", borderRadius: 6, background: "var(--bg-primary)", border: "1px solid var(--border)",
                  color: "var(--text-muted)", fontSize: 11, fontFamily: "'JetBrains Mono',monospace", cursor: "pointer",
                }}>{c}</button>
              ))}
            </div>

            {/* Log */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {cmdLog.map((l, i) => (
                <div key={i} style={{ padding: 10, borderRadius: 10, background: "var(--bg-primary)", border: "1px solid var(--border)", fontFamily: "'JetBrains Mono',monospace" }}>
                  <div style={{ fontSize: 12, color: "#22C55E" }}>$ {l.cmd}</div>
                  <div style={{ fontSize: 11, color: l.success ? "var(--text-muted)" : "#EF4444", marginTop: 2 }}>{l.result}</div>
                  <div style={{ fontSize: 9, color: "var(--text-ghost)", marginTop: 2 }}>{l.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACCOUNTS TAB */}
        {tab === "accounts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.values(IC_USERS).map(u => (
              <div key={u.id} style={{ padding: 14, borderRadius: 12, background: "var(--bg-tertiary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar user={u} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <RoleName user={u} />
                    <RoleBadge user={u} />
                    <span style={{ fontSize: 10, color: "var(--text-ghost)" }}>@{u.username}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                    <XPBar xp={u.xp} width={80} />
                    <span style={{ fontSize: 10, color: "var(--text-ghost)" }}>Rep: {Math.floor(u.xp / 10)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => notify(`Promoted ${u.display}`)} style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#22C55E", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Promote</button>
                  <button onClick={() => notify(`Striked ${u.display}`)} style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#FBBF24", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Strike</button>
                  {u.id !== "me" && <button onClick={() => notify(`Disabled ${u.display}`)} style={{ padding: "3px 8px", borderRadius: 6, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}>Disable</button>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* REPUTATION TAB */}
        {tab === "reputation" && (
          <div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              {IC_GLOBAL_MOD.reputation.levels.map(l => (
                <div key={l.label} style={{ padding: "6px 12px", borderRadius: 8, background: `${l.color}12`, border: `1px solid ${l.color}25`, fontSize: 12, color: l.color, fontWeight: 600 }}>
                  {l.icon} {l.label} ({l.score}+)
                </div>
              ))}
            </div>
            {Object.values(IC_USERS).sort((a,b) => b.xp - a.xp).map((u, i) => {
              const rep = Math.floor(u.xp / 10);
              const lvl = IC_GLOBAL_MOD.reputation.levels.slice().reverse().find(l => rep >= l.score) || IC_GLOBAL_MOD.reputation.levels[0];
              return (
                <div key={u.id} style={{ padding: 12, borderRadius: 10, background: "var(--bg-tertiary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text-ghost)", width: 20, textAlign: "right" }}>#{i + 1}</span>
                  <Avatar user={u} size={28} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", flex: 1 }}>{u.display}</span>
                  <span style={{ fontSize: 12, color: lvl.color, fontWeight: 700 }}>{lvl.icon} {lvl.label}</span>
                  <span style={{ fontSize: 11, color: "var(--text-ghost)", fontFamily: "'JetBrains Mono',monospace" }}>{rep} pts</span>
                </div>
              );
            })}
          </div>
        )}

        {/* GLOBAL LOG TAB */}
        {tab === "global log" && (
          <div>
            {IC_GLOBAL_MOD.globalLog.map(l => (
              <div key={l.id} style={{ padding: 14, borderRadius: 12, background: "var(--bg-tertiary)", border: "1px solid var(--border)", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar user={IC_USERS[l.mod] || IC_USERS.me} size={28} showStatus={false} />
                <div>
                  <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    <strong style={{ color: "var(--text-primary)" }}>{IC_USERS[l.mod]?.display || "Admin"}</strong>{" "}
                    <span style={{ color: IC_GLOBAL_MOD.actions[l.action.toLowerCase().replace(/\s/g, "_")]?.color || "var(--text-muted)" }}>{l.action}</span>{" "}
                    <strong style={{ color: "var(--text-primary)" }}>{l.target}</strong>
                  </span>
                  <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 2 }}>{l.reason} · {l.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TRASH TAB */}
        {tab === "trash" && (
          <div>
            <div style={{ padding: 14, borderRadius: 12, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                ⚠️ Deleted accounts are kept for <strong style={{ color: "var(--text-primary)" }}>14 days</strong>. 
                Only <strong style={{ color: "#FFD700" }}>C.E.O</strong> can recover accounts from trash. 
                After 14 days, accounts are permanently deleted.
              </p>
            </div>
            {IC_GLOBAL_MOD.accountTrash.map(a => (
              <div key={a.id} style={{ padding: 14, borderRadius: 12, background: "var(--bg-tertiary)", border: "1px solid var(--border)", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{a.username}</span>
                    <span style={{ fontSize: 11, color: "var(--text-ghost)", marginLeft: 8 }}>{a.email}</span>
                  </div>
                  <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: a.recoverable ? "rgba(251,191,36,0.1)" : "rgba(239,68,68,0.1)", color: a.recoverable ? "#FBBF24" : "#EF4444" }}>
                    {a.recoverable ? "Recoverable" : "Expired"}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Reason: {a.reason}</div>
                <div style={{ fontSize: 11, color: "var(--text-ghost)", marginBottom: 8 }}>Deleted: {a.deletedAt} · Expires: {a.expiresAt}</div>
                {a.recoverable && (
                  <button onClick={() => notify(`♻️ ${a.username} recovered!`)} style={{
                    padding: "6px 14px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                    color: "#22C55E", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}>♻️ Recover Account (CEO Only)</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
