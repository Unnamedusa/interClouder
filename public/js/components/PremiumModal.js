/* Premium Modal — Airbound Tiers */
window.PremiumModal = ({ onClose, notify }) => {
  const [selected, setSelected] = React.useState("airbound_elite");
  const tiers = IC_PREMIUM.tiers;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ width: 720, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: 28 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)", letterSpacing: -0.5 }}>Airbound Premium</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Elevate your interClouder experience</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {Object.entries(tiers).map(([key, tier]) => (
              <div key={key} onClick={() => setSelected(key)}
                className="premium-card"
                style={{
                  "--card-color1": tier.color,
                  "--card-color2": key === "airbound_omega" ? "#06D6A0" : tier.color,
                  background: selected === key ? `${tier.color}12` : "var(--bg-primary)",
                  cursor: "pointer",
                  border: `2px solid ${selected === key ? tier.color : "transparent"}`,
                }}>
                {/* Best value tag */}
                {key === "airbound_elite" && (
                  <div style={{ position: "absolute", top: -1, right: 16, padding: "2px 10px", borderRadius: "0 0 8px 8px", background: tier.gradient, fontSize: 9, fontWeight: 800, color: "#fff" }}>
                    POPULAR
                  </div>
                )}
                {key === "airbound_omega" && (
                  <div style={{ position: "absolute", top: -1, right: 16, padding: "2px 10px", borderRadius: "0 0 8px 8px", background: tier.gradient, fontSize: 9, fontWeight: 800, color: "#fff" }}>
                    BEST VALUE
                  </div>
                )}

                <div style={{ fontSize: 28, marginBottom: 8 }}>{tier.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800, background: tier.gradient, backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{tier.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 2, margin: "8px 0 12px" }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)" }}>${tier.price.toFixed(2)}</span>
                  <span style={{ fontSize: 11, color: "var(--text-faint)" }}>/mo</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {tier.features.slice(0, 8).map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                      <span style={{ color: tier.color, flexShrink: 0 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                  {tier.features.length > 8 && (
                    <div style={{ fontSize: 10, color: "var(--text-ghost)", fontStyle: "italic" }}>+{tier.features.length - 8} more features...</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Badge Evolution Preview */}
          <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: "var(--bg-primary)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Badge Evolution Timeline (up to 6 years)</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {IC_PREMIUM.badgeEvolution.map((e, i) => {
                const bd = IC_BADGES[e.badge];
                return (
                  <div key={i} style={{ textAlign: "center", flexShrink: 0, minWidth: 60 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${bd.color}18`, border: `1px solid ${bd.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, margin: "0 auto 4px", color: bd.color }}>{bd.icon}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: bd.color }}>{e.label}</div>
                    <div style={{ fontSize: 8, color: "var(--text-ghost)" }}>{e.months < 12 ? `${e.months}mo` : `${e.months / 12}yr`}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
            <button className="btn-secondary" onClick={onClose}>Maybe Later</button>
            <button className="btn-primary" onClick={() => { notify?.(`Subscribed to ${tiers[selected].name}!`); onClose(); }}
              style={{ background: tiers[selected].gradient, padding: "12px 32px" }}>
              Get {tiers[selected].name} — ${tiers[selected].price.toFixed(2)}/mo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
