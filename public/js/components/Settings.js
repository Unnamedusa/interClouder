/* Settings Panel */
window.SettingsView = ({ notify, onThemeChange, currentTheme }) => {
  const [tab, setTab] = React.useState("profile");
  const tabs = ["profile", "account", "appearance", "privacy", "language", "roles"];
  const me = IC_USERS.me;

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{ width: 200, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", padding: "20px 10px" }}>
        <div className="section-label" style={{ padding: "0 10px", marginBottom: 8 }}>Settings</div>
        {tabs.map(t => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: "8px 12px", borderRadius: 8, marginBottom: 2, cursor: "pointer",
            background: tab === t ? "var(--bg-active)" : "transparent",
            color: tab === t ? "var(--accent-light)" : "var(--text-muted)",
            fontWeight: tab === t ? 600 : 400, fontSize: 13, textTransform: "capitalize",
          }}>{t}</div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 24, textTransform: "capitalize" }}>{tab}</h2>

        {tab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Avatar user={me} size={64} showStatus={false} />
              <div>
                <button className="btn-secondary" onClick={() => notify("Avatar picker coming soon!")}>Change Avatar</button>
                <p style={{ fontSize: 10, color: "var(--text-ghost)", marginTop: 4 }}>Animated avatars available with Airbound Elite+</p>
              </div>
            </div>
            {[["Display Name", me.display], ["Custom Status", me.customStatus || "Set a status..."], ["Bio", me.bio]].map(([l, v]) => (
              <div key={l}>
                <label style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 5 }}>{l}</label>
                <div className="login-input" style={{ cursor: "text" }}>{v}</div>
              </div>
            ))}
            <div>
              <label style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 8 }}>Banner Color</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["#7C3AED", "#EF4444", "#06D6A0", "#FBBF24", "#F472B6", "#818CF8", "#14B8A6", "#F43F5E"].map(c => (
                  <div key={c} onClick={() => notify("Banner updated!")} style={{ width: 34, height: 34, borderRadius: 10, background: c, cursor: "pointer", border: c === "#7C3AED" ? "2px solid #fff" : "2px solid transparent", transition: "transform 0.15s" }}
                    onMouseEnter={e => e.target.style.transform = "scale(1.15)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                ))}
              </div>
              <p style={{ fontSize: 10, color: "var(--text-ghost)", marginTop: 4 }}>Custom image banners with Airbound Elite+</p>
            </div>
          </div>
        )}

        {tab === "account" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[["Username", me.username], ["Email", "cloudwalker@interclouder.app"]].map(([l, v]) => (
              <div key={l}>
                <label style={{ fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 5 }}>{l}</label>
                <div className="login-input">{v}</div>
              </div>
            ))}
            <div style={{ padding: 14, borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>🔗 Google Account</div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>Link for faster login, 2FA setup, and phone verification (coming soon)</p>
              <button className="btn-google" style={{ width: "auto", padding: "8px 16px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Link Google Account
              </button>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--danger)", marginBottom: 6 }}>🔮 Future Security</div>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>2FA, phone verification, and advanced encryption verification coming in v3.5</p>
            </div>
          </div>
        )}

        {tab === "appearance" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label className="section-label" style={{ display: "block", marginBottom: 12 }}>Theme (Free)</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[["Dark Nebula", "dark", "#0d0a14"], ["Midnight", "midnight", "#0a0e1a"], ["Void", "void", "#000"], ["Light Cloud", "light", "#FAFAFE"]].map(([n, id, c]) => (
                  <div key={id} onClick={() => { onThemeChange(id); notify(`Theme: ${n}`); }} style={{
                    height: 64, borderRadius: 14, background: c, border: `2px solid ${currentTheme === id ? "var(--accent)" : "var(--border)"}`,
                    display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 8, cursor: "pointer",
                  }}>
                    <span style={{ fontSize: 10, color: id === "light" ? "#6B5F82" : "#7B6F99", fontWeight: 600 }}>{n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="section-label" style={{ display: "block", marginBottom: 12 }}>Accent Color</label>
              <div style={{ display: "flex", gap: 10 }}>
                {["#A855F7", "#06D6A0", "#F43F5E", "#818CF8", "#FBBF24", "#F472B6", "#34D399", "#06B6D4"].map(c => (
                  <div key={c} onClick={() => notify("Accent updated!")} style={{
                    width: 34, height: 34, borderRadius: 10, background: c, cursor: "pointer",
                    border: c === "#A855F7" ? "2px solid #fff" : "2px solid transparent",
                  }} onMouseEnter={e => e.target.style.transform = "scale(1.15)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                ))}
              </div>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: "var(--bg-active)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--accent-light)" }}>✨ Custom web themes available with Airbound Omega</span>
            </div>
          </div>
        )}

        {tab === "privacy" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              ["Allow DMs from", "everyone / friends / nobody", "Select who can message you directly. Moderator bots can always reach you for safety."],
              ["Show online status", "", "Let others see when you're online"],
              ["Show activity status", "", "Display what you're doing"],
              ["Allow follow requests", "", "Anyone can follow you, or require approval"],
              ["Show badges publicly", "", "Display your badge collection on your profile"],
            ].map(([label, sub, desc], i) => (
              <div key={i} style={{ padding: "14px 16px", borderRadius: 12, background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ color: "var(--text-primary)", fontSize: 14, fontWeight: 600 }}>{label}</div>
                    {desc && <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 2 }}>{desc}</div>}
                  </div>
                  <div className={`toggle ${i < 3 ? "on" : i === 4 ? "on" : "off"}`} onClick={() => notify("Updated!")}>
                    <div className="knob" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "language" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ padding: "14px 16px", borderRadius: 12, background: "var(--bg-tertiary)", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>🌐 Auto-Translate Messages</div>
                <div style={{ fontSize: 11, color: "var(--text-ghost)", marginTop: 2 }}>Automatically translate foreign messages</div>
              </div>
              <div className="toggle on" onClick={() => notify("Translate toggled!")}><div className="knob" /></div>
            </div>
            <div>
              <label className="section-label" style={{ display: "block", marginBottom: 8 }}>Your Language</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {IC_Translate.supportedLangs.map(l => (
                  <div key={l.code} onClick={() => { IC_Translate.targetLang = l.code; notify(`Language: ${l.name}`); }} style={{
                    padding: "8px 10px", borderRadius: 10, background: IC_Translate.targetLang === l.code ? "var(--bg-active)" : "var(--bg-primary)",
                    border: `1px solid ${IC_Translate.targetLang === l.code ? "var(--accent)" : "var(--border)"}`,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12,
                    color: IC_Translate.targetLang === l.code ? "var(--accent-light)" : "var(--text-muted)",
                  }}>
                    <span>{l.flag}</span> {l.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "roles" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>interClouder uses unique roles. Server owners can also create custom roles.</p>
            {Object.entries(IC_ROLES).map(([k, r]) => (
              <div key={k} style={{ padding: 14, borderRadius: 12, background: "var(--bg-tertiary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 22, color: r.color }}>{r.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: r.color }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>{r.desc}</div>
                  <div style={{ fontSize: 10, color: "var(--text-ghost)", fontFamily: "'JetBrains Mono',monospace", marginTop: 2 }}>{r.perms.join(" · ")}</div>
                </div>
              </div>
            ))}
            <div style={{ padding: 14, borderRadius: 12, background: "var(--bg-active)", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent-light)", marginBottom: 6 }}>🌈 Gradient Roles (Boost Tier 5)</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {IC_GRADIENT_ROLES.map(g => (
                  <span key={g.name} style={{ padding: "3px 10px", borderRadius: 6, background: g.gradient, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, fontSize: 12, border: "1px solid var(--border)" }}>{g.name} ({g.colors} colors)</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
