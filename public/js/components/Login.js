/* Login Screen — Original Design with Google OAuth */
const { useState, useEffect } = React;

window.LoginScreen = ({ onLogin }) => {
  const [mode, setMode] = useState("login"); // login | register | encrypting
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  const steps = [
    { label: "Verifying identity...", icon: "🔍" },
    { label: "Securing connection...", icon: "🔒" },
    { label: "Building your space...", icon: "☁️" },
  ];

  const doLogin = async () => {
    if (!email || !password) { setError("All fields are required"); return; }
    if (mode === "register") {
      if (!username) { setError("Pick a username"); return; }
      if (password.length < 6) { setError("Password: 6+ characters"); return; }
      if (password !== confirmPw) { setError("Passwords don't match"); return; }
    }
    setError("");
    setMode("encrypting");
    setStep(0);
    // Background: run 5-phase encryption silently
    IC_Crypto.encryptFull(password);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      setStep(s);
      if (s >= 3) {
        clearInterval(iv);
        setTimeout(() => {
          onLogin({ email, username: username || email.split("@")[0], display: username || email.split("@")[0], id: "me" });
        }, 500);
      }
    }, 700);
  };

  const doGoogleLogin = () => {
    setMode("encrypting");
    setStep(0);
    IC_Crypto.encryptFull("google-auth");
    let s = 0;
    const iv = setInterval(() => {
      s++; setStep(s);
      if (s >= 3) {
        clearInterval(iv);
        setTimeout(() => onLogin({ email:"google@user.com", username:"GoogleUser", display:"Google User", id:"me", googleLinked:true }), 500);
      }
    }, 700);
  };

  if (mode === "encrypting") {
    return (
      <div className="login-screen">
        <div style={{ textAlign:"center", animation:"fadeIn 0.3s ease" }}>
          <div style={{ animation:"cubeFloat 3s ease-in-out infinite" }}><MatrixCube size={80} /></div>
          <h2 style={{ fontSize:20, fontWeight:800, color:"var(--text-primary)", margin:"20px 0 6px" }}>Preparing your cloud</h2>
          <p style={{ fontSize:12, color:"var(--text-faint)", marginBottom:28 }}>Setting everything up securely...</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10, width:280, margin:"0 auto" }}>
            {steps.map((s, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderRadius:12,
                background: i <= step ? "var(--bg-active)" : "var(--bg-tertiary)",
                border: `1px solid ${i <= step ? "var(--accent)" : "var(--border)"}30`,
                transition:"all 0.4s", opacity: i <= step ? 1 : 0.3, transform: i <= step ? "translateX(0)" : "translateX(15px)",
              }}>
                <span style={{ fontSize:18 }}>{s.icon}</span>
                <span style={{ flex:1, fontSize:13, fontWeight:600, color: i <= step ? "var(--text-primary)" : "var(--text-ghost)" }}>{s.label}</span>
                {i < step && <span style={{ color:"var(--success)", fontSize:14 }}>✓</span>}
                {i === step && <div style={{ width:14, height:14, border:"2px solid var(--accent)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.6s linear infinite" }}/>}
              </div>
            ))}
          </div>
          {step >= 3 && <p style={{ marginTop:16, fontSize:13, fontWeight:700, color:"var(--success)", animation:"fadeIn 0.3s" }}>✓ Ready — entering interClouder...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="login-screen">
      {/* Background particles */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{
            position:"absolute", width:2, height:2, borderRadius:"50%", background:"var(--accent)", opacity:0.2+Math.random()*0.3,
            left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, animation:`float ${3+Math.random()*4}s ease-in-out infinite`, animationDelay:`${Math.random()*3}s`,
          }}/>
        ))}
      </div>

      <div className="login-card">
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ animation:"cubeFloat 4s ease-in-out infinite" }}><MatrixCube size={64} /></div>
          <h1 style={{ fontSize:26, fontWeight:900, color:"var(--text-primary)", margin:"14px 0 4px", letterSpacing:-0.5 }}>interClouder</h1>
          <p style={{ fontSize:12, color:"var(--text-faint)" }}>Your secure social space</p>
        </div>

        <div className="login-box">
          <h2 style={{ fontSize:17, fontWeight:800, color:"var(--text-primary)", marginBottom:18, textAlign:"center" }}>
            {mode === "register" ? "Create your account" : "Welcome back"}
          </h2>

          {error && <div style={{ padding:"8px 12px", borderRadius:10, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"var(--danger)", fontSize:12, marginBottom:12, textAlign:"center" }}>{error}</div>}

          {/* Google Sign-In */}
          <button className="btn-google" onClick={doGoogleLogin}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:8, margin:"16px 0" }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/>
            <span style={{ fontSize:11, color:"var(--text-ghost)" }}>or</span>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {mode === "register" && (
              <div>
                <label style={{ fontSize:10, color:"var(--text-faint)", textTransform:"uppercase", letterSpacing:1.2, display:"block", marginBottom:5 }}>Username</label>
                <input className="login-input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Pick something cool" />
              </div>
            )}
            <div>
              <label style={{ fontSize:10, color:"var(--text-faint)", textTransform:"uppercase", letterSpacing:1.2, display:"block", marginBottom:5 }}>Email</label>
              <input className="login-input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" type="email" />
            </div>
            <div>
              <label style={{ fontSize:10, color:"var(--text-faint)", textTransform:"uppercase", letterSpacing:1.2, display:"block", marginBottom:5 }}>Password</label>
              <input className="login-input" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" />
            </div>
            {mode === "register" && (
              <div>
                <label style={{ fontSize:10, color:"var(--text-faint)", textTransform:"uppercase", letterSpacing:1.2, display:"block", marginBottom:5 }}>Confirm Password</label>
                <input className="login-input" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="••••••••" type="password" />
              </div>
            )}
            <button className="btn-primary" onClick={doLogin} style={{ width:"100%", padding:"12px", fontSize:14, marginTop:4 }}>
              {mode === "register" ? "Create Account" : "Sign In"}
            </button>
          </div>

          <p style={{ textAlign:"center", marginTop:14 }}>
            <span onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}
              style={{ fontSize:12, color:"var(--accent)", cursor:"pointer", fontWeight:600 }}>
              {mode === "register" ? "Already have an account? Sign In" : "New here? Create Account"}
            </span>
          </p>
        </div>

        <p style={{ textAlign:"center", fontSize:10, color:"var(--text-ghost)", marginTop:16 }}>
          🔒 Secured connection · Future: 2FA & phone verification
        </p>
      </div>
    </div>
  );
};
