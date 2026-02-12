/* Voice Controls Panel */
window.VoicePanel = ({ channelName, users, onClose, notify }) => {
  const [selfMuted, setSelfMuted] = React.useState(false);
  const [selfDeafen, setSelfDeafen] = React.useState(false);
  const [inputVol, setInputVol] = React.useState(IC_VOICE.settings.inputVolume);
  const [outputVol, setOutputVol] = React.useState(IC_VOICE.settings.outputVolume);
  const [userVols, setUserVols] = React.useState({ ...IC_VOICE.userVolumes });
  const [privateMuted, setPrivateMuted] = React.useState({});
  const [showSettings, setShowSettings] = React.useState(false);

  const setUserVol = (uid, vol) => setUserVols(p => ({ ...p, [uid]: vol }));
  const togglePrivateMute = (uid) => setPrivateMuted(p => ({ ...p, [uid]: !p[uid] }));

  return (
    <div style={{ padding: 16, borderTop: "1px solid var(--border)", background: "var(--bg-tertiary)" }}>
      {/* Active channel */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
            <span>🔊</span> Voice Connected
          </div>
          <div style={{ fontSize: 11, color: "var(--text-ghost)" }}>{channelName || "Voice Channel"}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setShowSettings(!showSettings)} style={{
            width: 28, height: 28, borderRadius: 8, background: showSettings ? "var(--bg-active)" : "transparent",
            border: "none", fontSize: 12, cursor: "pointer", color: "var(--text-muted)",
          }}>⚙</button>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, background: "rgba(239,68,68,0.1)",
            border: "none", fontSize: 12, cursor: "pointer", color: "#EF4444",
          }}>✕</button>
        </div>
      </div>

      {/* Self controls */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <button onClick={() => { setSelfMuted(!selfMuted); notify(selfMuted ? "Mic on" : "Mic muted"); }} style={{
          flex: 1, padding: "8px", borderRadius: 10,
          background: selfMuted ? "rgba(239,68,68,0.12)" : "var(--bg-primary)",
          border: `1px solid ${selfMuted ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
          color: selfMuted ? "#EF4444" : "var(--text-secondary)", fontSize: 18, cursor: "pointer",
        }}>{selfMuted ? "🔇" : "🎙"}</button>
        <button onClick={() => { setSelfDeafen(!selfDeafen); notify(selfDeafen ? "Audio on" : "Deafened"); }} style={{
          flex: 1, padding: "8px", borderRadius: 10,
          background: selfDeafen ? "rgba(239,68,68,0.12)" : "var(--bg-primary)",
          border: `1px solid ${selfDeafen ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
          color: selfDeafen ? "#EF4444" : "var(--text-secondary)", fontSize: 18, cursor: "pointer",
        }}>{selfDeafen ? "🔕" : "🔔"}</button>
      </div>

      {/* Settings */}
      {showSettings && (
        <div style={{ marginBottom: 12, padding: 10, borderRadius: 10, background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>
              <span>🎙 Input Volume</span><span>{inputVol}%</span>
            </div>
            <input type="range" min="0" max="200" value={inputVol} onChange={e => setInputVol(e.target.value)}
              style={{ width: "100%", accentColor: "var(--accent)" }} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginBottom: 3 }}>
              <span>🔊 Output Volume</span><span>{outputVol}%</span>
            </div>
            <input type="range" min="0" max="200" value={outputVol} onChange={e => setOutputVol(e.target.value)}
              style={{ width: "100%", accentColor: "var(--accent)" }} />
          </div>
          {[["Noise Suppression", IC_VOICE.settings.noiseSuppression], ["Echo Cancel", IC_VOICE.settings.echoCancellation]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{l}</span>
              <div className={`toggle ${v ? "on" : "off"}`} style={{ transform: "scale(0.75)" }} onClick={() => notify(`${l} toggled`)}><div className="knob" /></div>
            </div>
          ))}
        </div>
      )}

      {/* Users in voice */}
      <div className="section-label" style={{ marginBottom: 6 }}>In Channel — {(users || []).length}</div>
      {(users || []).map(uid => {
        const u = IC_USERS[uid]; if (!u) return null;
        const vol = userVols[uid] ?? 100;
        const pm = privateMuted[uid];
        return (
          <div key={uid} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Avatar user={u} size={22} />
              <span style={{ fontSize: 12, color: pm ? "var(--text-ghost)" : "var(--text-secondary)", flex: 1, textDecoration: pm ? "line-through" : "none" }}>{u.display}</span>
              {/* Private mute */}
              <button onClick={() => { togglePrivateMute(uid); notify(pm ? `${u.display} unmuted` : `${u.display} muted (only for you)`); }} style={{
                width: 22, height: 22, borderRadius: 6, border: "none", fontSize: 10, cursor: "pointer",
                background: pm ? "rgba(239,68,68,0.12)" : "transparent", color: pm ? "#EF4444" : "var(--text-ghost)",
              }}>{pm ? "🔇" : "🔊"}</button>
              {/* Mod: server mute */}
              <button onClick={() => notify(`Server muted ${u.display}`)} style={{
                width: 22, height: 22, borderRadius: 6, border: "none", fontSize: 10, cursor: "pointer",
                background: "transparent", color: "var(--text-ghost)",
              }} title="Server mute (mod)">🛡</button>
            </div>
            {/* Per-user volume */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 30 }}>
              <input type="range" min="0" max="200" value={vol} onChange={e => setUserVol(uid, parseInt(e.target.value))}
                style={{ flex: 1, accentColor: vol === 0 ? "#EF4444" : vol > 100 ? "#FBBF24" : "var(--accent)", height: 3 }} />
              <span style={{ fontSize: 9, color: "var(--text-ghost)", fontFamily: "'JetBrains Mono',monospace", width: 32, textAlign: "right" }}>{vol}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
