/* Tutorial — Brief onboarding walkthrough */
const { useState } = React;

window.Tutorial = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { icon: "☁️", title: "Welcome to interClouder", desc: "Your new home for communities, chat, and creativity. Explore servers, make friends, and express yourself in a secure environment.", img: null },
    { icon: "🛡️", title: "You're Protected", desc: "Every message and connection is secured. Control who can DM you, manage your privacy, and feel safe in every conversation.", img: null },
    { icon: "⬡", title: "Roles & Badges", desc: "Earn badges like Matrial Clouder, Early Member, and more. Level up with XP, boost servers, and unlock gradient roles.", img: null },
    { icon: "✨", title: "Airbound Premium", desc: "Unlock animated profiles, evolving badges, colored names, and 4K streaming with Airbound, Elite, or Omega tiers.", img: null },
    { icon: "🌐", title: "Auto-Translate & DMs", desc: "Messages translate automatically. DMs require permission by default — your privacy comes first. Moderators can reach you for safety.", img: null },
    { icon: "🚀", title: "Ready to Explore!", desc: "Jump into servers, customize your profile, and start connecting. Welcome to interClouder!", img: null },
  ];
  const s = steps[step];

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card" style={{ animation:"scaleIn 0.3s ease" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>{s.icon}</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:"var(--text-primary)", marginBottom:10, letterSpacing:-0.3 }}>{s.title}</h2>
        <p style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.7, marginBottom:24, maxWidth:360, margin:"0 auto 24px" }}>{s.desc}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          {step > 0 && <button className="btn-secondary" onClick={() => setStep(step - 1)}>Back</button>}
          {step < steps.length - 1 ? (
            <button className="btn-primary" onClick={() => setStep(step + 1)}>Next</button>
          ) : (
            <button className="btn-primary" onClick={onComplete} style={{ background:"linear-gradient(135deg,#22C55E,#16A34A)" }}>Let's Go! 🚀</button>
          )}
        </div>
        <div className="tutorial-dots">
          {steps.map((_, i) => <div key={i} className={`tutorial-dot ${i === step ? "active" : ""}`} />)}
        </div>
        <p onClick={onComplete} style={{ marginTop:16, fontSize:11, color:"var(--text-ghost)", cursor:"pointer" }}>Skip tutorial</p>
      </div>
    </div>
  );
};
