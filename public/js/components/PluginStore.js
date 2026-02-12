/* Plugin Store & AI Bot Management */
window.PluginStore = ({ notify }) => {
  const [tab, setTab] = React.useState("plugins");
  const [category, setCategory] = React.useState("all");
  const [enabledPlugins, setEnabledPlugins] = React.useState(
    IC_PLUGINS.official.filter(p => p.enabled).map(p => p.id)
  );
  const [enabledBots, setEnabledBots] = React.useState(["ai_mod", "ai_assist"]);
  const [showPerms, setShowPerms] = React.useState(null);
  const [githubLinked, setGithubLinked] = React.useState(false);
  const tabs = ["plugins", "ai bots", "my plugins"];

  const allPlugins = [...IC_PLUGINS.official, ...IC_PLUGINS.community];
  const filtered = category === "all" ? allPlugins : allPlugins.filter(p => p.category === category);

  const togglePlugin = (id) => {
    setEnabledPlugins(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const pl = allPlugins.find(p => p.id === id);
    notify(enabledPlugins.includes(id) ? `${pl?.name} disabled` : `${pl?.name} enabled`);
  };

  const toggleBot = (id) => {
    setEnabledBots(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const bot = IC_AI_BOTS.find(b => b.id === id);
    notify(enabledBots.includes(id) ? `${bot?.name} disabled` : `${bot?.name} enabled`);
  };

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <div style={{ width: 200, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", padding: "20px 10px" }}>
        <div className="section-label" style={{ padding: "0 10px", marginBottom: 8 }}>Plugins & AI</div>
        {tabs.map(t => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: "8px 12px", borderRadius: 8, marginBottom: 2, cursor: "pointer",
            background: tab === t ? "rgba(168,85,247,0.08)" : "transparent",
            color: tab === t ? "var(--accent)" : "var(--text-muted)", fontWeight: tab === t ? 600 : 400, fontSize: 13, textTransform: "capitalize",
          }}>{t}</div>
        ))}
        {tab === "plugins" && (
          <React.Fragment>
            <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />
            <div className="section-label" style={{ padding: "0 10px", marginBottom: 6 }}>Category</div>
            {IC_PLUGINS.categories.map(c => (
              <div key={c} onClick={() => setCategory(c)} style={{
                padding: "5px 12px", borderRadius: 6, marginBottom: 1, cursor: "pointer",
                background: category === c ? "var(--bg-active)" : "transparent",
                color: category === c ? "var(--accent-light)" : "var(--text-ghost)", fontSize: 12, textTransform: "capitalize",
              }}>{c}</div>
            ))}
          </React.Fragment>
        )}
      </div>
      <div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20, textTransform: "capitalize" }}>{tab}</h2>

        {/* PLUGINS TAB */}
        {tab === "plugins" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(p => {
              const isOn = enabledPlugins.includes(p.id);
              return (
                <div key={p.id} style={{ padding: 16, borderRadius: 14, background: "var(--bg-tertiary)", border: `1px solid ${isOn ? "var(--accent)30" : "var(--border)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{p.name}</span>
                        {p.verified && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: "rgba(34,197,94,0.1)", color: "#22C55E", fontWeight: 700 }}>✓ Official</span>}
                        <span style={{ fontSize: 10, color: "var(--text-ghost)", fontFamily: "'JetBrains Mono',monospace" }}>v{p.version}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{p.desc}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: "var(--text-ghost)" }}>by {p.author}</span>
                        <span style={{ fontSize: 10, color: "var(--text-ghost)" }}>{p.installs?.toLocaleString()} installs</span>
                        {p.githubUrl && <span style={{ fontSize: 10, color: "var(--info)" }}>GitHub</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      <div className={`toggle ${isOn ? "on" : "off"}`} onClick={() => togglePlugin(p.id)}><div className="knob" /></div>
                      <span onClick={() => setShowPerms(showPerms === p.id ? null : p.id)} style={{ fontSize: 10, color: "var(--text-ghost)", cursor: "pointer" }}>Permissions</span>
                    </div>
                  </div>
                  {showPerms === p.id && (
                    <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "var(--bg-primary)", display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {Object.entries(IC_PLUGIN_PERMS).slice(0, 5).map(([k, v]) => (
                        <span key={k} style={{
                          padding: "3px 8px", borderRadius: 6, fontSize: 10,
                          background: v.risk === "high" ? "rgba(239,68,68,0.08)" : v.risk === "medium" ? "rgba(251,191,36,0.08)" : "rgba(34,197,94,0.08)",
                          color: v.risk === "high" ? "#EF4444" : v.risk === "medium" ? "#FBBF24" : "#22C55E",
                          border: `1px solid ${v.risk === "high" ? "#EF444420" : v.risk === "medium" ? "#FBBF2420" : "#22C55E20"}`,
                        }}>{v.label}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* AI BOTS TAB */}
        {tab === "ai bots" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {IC_AI_BOTS.map(bot => {
              const isOn = enabledBots.includes(bot.id);
              return (
                <div key={bot.id} style={{ padding: 16, borderRadius: 14, background: "var(--bg-tertiary)", border: `1px solid ${isOn ? bot.color + "30" : "var(--border)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${bot.color}20`, border: `2px solid ${bot.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{bot.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: bot.color }}>{bot.name}</span>
                        {bot.isOfficial && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: `${bot.color}15`, color: bot.color, fontWeight: 700 }}>Official</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{bot.desc}</div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                        {bot.capabilities.map(c => (
                          <span key={c} style={{ padding: "2px 6px", borderRadius: 4, background: "var(--bg-primary)", fontSize: 10, color: "var(--text-ghost)" }}>{c}</span>
                        ))}
                      </div>
                    </div>
                    {bot.id !== "ai_custom" ? (
                      <div className={`toggle ${isOn ? "on" : "off"}`} onClick={() => toggleBot(bot.id)}><div className="knob" /></div>
                    ) : (
                      <button className="btn-secondary" onClick={() => notify(githubLinked ? "Custom bot creator coming soon!" : "Link GitHub first")} style={{ padding: "6px 12px", fontSize: 11 }}>
                        Create
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MY PLUGINS TAB */}
        {tab === "my plugins" && (
          <div>
            {/* GitHub Link */}
            <div style={{ padding: 16, borderRadius: 14, background: "var(--bg-tertiary)", border: "1px solid var(--border)", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--text-muted)"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>GitHub Integration (Optional)</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Link your GitHub to create custom plugins & AI bots</div>
                </div>
                <button className={githubLinked ? "btn-secondary" : "btn-primary"} onClick={() => { setGithubLinked(!githubLinked); notify(githubLinked ? "GitHub unlinked" : "GitHub linked!"); }}
                  style={{ padding: "8px 16px" }}>
                  {githubLinked ? "✓ Linked" : "Link GitHub"}
                </button>
              </div>
            </div>

            {githubLinked ? (
              <div>
                <button className="btn-primary" onClick={() => notify("Plugin creator coming in v3.5!")} style={{ marginBottom: 16 }}>
                  + Create New Plugin
                </button>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>You haven't created any plugins yet. Plugins must be approved by server admins before installation.</p>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "var(--text-ghost)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚙️</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>Link GitHub to get started</div>
                <p style={{ fontSize: 12, marginTop: 4 }}>Create custom plugins and AI bots for your servers</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
