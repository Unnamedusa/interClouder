/* Shared UI Components */

window.StatusDot = ({ status, size = 10 }) => {
  const cls = `status-dot status-${status || 'offline'}`;
  return <div className={cls} style={{ width: size, height: size }} />;
};

window.Avatar = ({ user, size = 36, showStatus = true, onClick }) => (
  <div style={{ position:"relative", width:size, height:size, flexShrink:0, cursor:onClick?"pointer":"default" }} onClick={onClick}>
    <div className={user.premium ? "profile-animated" : ""} style={{
      width:size, height:size, borderRadius:size>50?20:12,
      background:`linear-gradient(135deg,${user.color}50,${user.color}20)`,
      border:`2px solid ${user.color}40`, display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.32, fontWeight:800, color:user.color,
      fontFamily:"'JetBrains Mono',monospace", letterSpacing:-0.5,
    }}>{user.avatar}</div>
    {showStatus && <div style={{position:"absolute",bottom:-1,right:-1}}><StatusDot status={user.status} size={Math.max(size*0.28,8)}/></div>}
  </div>
);

window.Badge = ({ id, size = "sm" }) => {
  const b = IC_BADGES[id]; if (!b) return null;
  const s = size==="sm"?18:size==="md"?24:30;
  return (
    <div title={`${b.label}: ${b.desc}`} className={`badge badge-${size}`}
      style={{ background:`${b.color}18`, border:`1px solid ${b.color}35`, color:b.color, width:s, height:s, fontSize:s*0.55 }}
      onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 12px ${b.color}40`}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
      {b.icon}
    </div>
  );
};

window.RoleName = ({ user }) => {
  if (!user) return null;
  const role = IC_ROLES[user.role];
  const premTier = user.premium && IC_PREMIUM.tiers[user.premium];
  const nameClass = premTier ? premTier.nameClass : "";
  const roleGradient = role && IC_GRADIENT_ROLES ? IC_GRADIENT_ROLES.find(g => g.name === role.gradient) : null;

  return (
    <span className={nameClass} style={{
      fontWeight: 700, fontSize: 13, cursor: "pointer",
      color: !nameClass ? (role?.color || user.color) : undefined,
    }}>
      {user.display}
    </span>
  );
};

window.RoleBadge = ({ user }) => {
  const role = IC_ROLES[user?.role];
  if (!role) return null;
  return (
    <span style={{
      fontSize:9, padding:"1px 6px", borderRadius:4,
      background:`${role.color}15`, color:role.color, fontWeight:700,
      display:"inline-flex", alignItems:"center", gap:3,
    }}>
      <span>{role.icon}</span> {role.name}
    </span>
  );
};

window.XPBar = ({ xp, width = 120 }) => {
  const level = IC_XP.calculateLevel(xp);
  const nextThreshold = IC_XP.levelThresholds[Math.min(level + 1, IC_XP.levelThresholds.length - 1)];
  const prevThreshold = IC_XP.levelThresholds[level] || 0;
  const progress = nextThreshold > prevThreshold ? ((xp - prevThreshold) / (nextThreshold - prevThreshold)) * 100 : 100;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      <span style={{ fontSize:10, color:"var(--text-faint)", fontWeight:700 }}>Lv.{level}</span>
      <div style={{ width, height:4, borderRadius:2, background:"var(--border)" }}>
        <div style={{ width:`${progress}%`, height:"100%", borderRadius:2, background:"linear-gradient(90deg,var(--accent),var(--accent-light))", transition:"width 0.5s" }}/>
      </div>
      <span style={{ fontSize:9, color:"var(--text-ghost)", fontFamily:"'JetBrains Mono',monospace" }}>{xp.toLocaleString()}</span>
    </div>
  );
};

window.TranslateButton = ({ text, onTranslated }) => {
  const [loading, setLoading] = React.useState(false);
  const detected = IC_Translate.detectLanguage(text);
  const isForeign = detected !== IC_Translate.targetLang;
  if (!isForeign || !IC_Translate.enabled) return null;
  return (
    <button onClick={async () => {
      setLoading(true);
      const t = await IC_Translate.translate(text, IC_Translate.targetLang);
      onTranslated?.(t);
      setLoading(false);
    }} className="translate-bar" style={{ cursor:"pointer", border:"none", marginTop:4 }}>
      {loading ? "⏳" : "🌐"} <span style={{fontSize:10}}>Translate from {detected.toUpperCase()}</span>
    </button>
  );
};
