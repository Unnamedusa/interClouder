/* Profile Modal — Full profile with badges, XP, roles, premium */
window.ProfileModal = ({ userId, onClose, onDM, notify }) => {
  const u = IC_USERS[userId]; if (!u) return null;
  const role = IC_ROLES[u.role];
  const prem = u.premium && IC_PREMIUM.tiers[u.premium];
  const level = IC_XP.calculateLevel(u.xp);

  // Group badges by tier
  const grouped = {};
  u.badges.forEach(b => {
    const bd = IC_BADGES[b];
    if (bd) { if (!grouped[bd.tier]) grouped[bd.tier] = []; grouped[bd.tier].push({ id: b, ...bd }); }
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ width: 440 }}>
        {/* Banner */}
        <div className={prem ? "profile-animated" : ""} style={{
          height: 80,
          background: prem
            ? `linear-gradient(135deg, ${u.banner || u.color}60, ${u.color}30, transparent), ${prem.gradient}`
            : `linear-gradient(135deg, ${u.banner || u.color}50, ${u.banner || u.color}15, transparent)`,
          backgroundSize: prem ? "200% 200%" : "auto",
          position: "relative",
        }}>
          <div style={{ position: "absolute", bottom: -28, left: 24 }}><Avatar user={u} size={64} /></div>
          {role && (
            <div style={{ position: "absolute", top: 10, right: 12, padding: "3px 10px", borderRadius: 8, background: `${role.color}20`, border: `1px solid ${role.color}35`, fontSize: 10, fontWeight: 700, color: role.color, display: "flex", alignItems: "center", gap: 4 }}>
              {role.icon} {role.name}
            </div>
          )}
          {prem && (
            <div style={{ position: "absolute", top: 10, left: 12, padding: "3px 8px", borderRadius: 6, background: prem.gradient, fontSize: 9, fontWeight: 800, color: "#fff" }}>
              {prem.icon} {prem.name}
            </div>
          )}
        </div>

        <div style={{ padding: "36px 24px 24px" }}>
          {/* Name + badges inline */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 2 }}>
            <RoleName user={u} />
            {u.badges.slice(0, 4).map(b => <Badge key={b} id={b} />)}
            {u.badges.length > 4 && <span style={{ fontSize: 10, color: "var(--text-ghost)" }}>+{u.badges.length - 4}</span>}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-faint)", fontFamily: "'JetBrains Mono',monospace", marginBottom: 4 }}>@{u.username}</div>
          {u.customStatus && <div style={{ fontSize: 12, color: u.color, marginBottom: 8, fontStyle: "italic" }}>{u.customStatus}</div>}
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.6 }}>{u.bio}</div>

          {/* XP */}
          <div style={{ marginBottom: 14 }}><XPBar xp={u.xp} width={160} /></div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 20, marginBottom: 14, padding: "12px 0", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
            {[["Followers", u.followers], ["Following", u.following], ["Posts", u.posts]].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{(v||0).toLocaleString()}</div>
                <div style={{ fontSize: 9, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1.2, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Badges by tier */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Badges Collection</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {u.badges.map(b => {
                const bd = IC_BADGES[b]; if (!bd) return null;
                return (
                  <div key={b} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 8, background: `${bd.color}12`, border: `1px solid ${bd.color}25` }}>
                    <span style={{ color: bd.color, fontSize: 12 }}>{bd.icon}</span>
                    <span style={{ fontSize: 10, color: bd.color, fontWeight: 600 }}>{bd.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DM Permission info */}
          <div style={{ fontSize: 11, color: "var(--text-ghost)", marginBottom: 4 }}>
            DMs: {u.dmPermission === "nobody" ? "🔒 Closed" : u.dmPermission === "friends" ? "👥 Friends only" : "🌐 Open"}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>Joined {u.joined} · {u.boosts > 0 ? `${u.boosts} boosts` : "No boosts"}</div>

          {userId !== "me" && (
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                if (u.dmPermission === "nobody") { notify?.("This user has DMs closed"); return; }
                onClose(); onDM?.(userId);
              }}>
                {u.dmPermission === "nobody" ? "🔒 DMs Closed" : "Message"}
              </button>
              <button className="btn-secondary" onClick={() => notify?.(`Followed ${u.display}!`)}>Follow</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
