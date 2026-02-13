'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import InexIDE from '@/components/inex/InexIDE';
import { runInex } from '@/lib/inex';
import {
  ROLES, getRolePerms, BADGES, PLANS, REP, STRIKES, SLOWMODES, smLabel,
  FILE_SEC, CKIDS, KBS, PLUGINS, BOTS, TEMPLATES, TRUST_ENGINE,
  GRADIENTS, DEFAULT_SETTINGS, UPDATES,
} from '@/lib/data';

/* ── Utility: announce to screen readers ── */
function announce(text) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('live-announcer');
  if (el) { el.textContent = ''; setTimeout(() => { el.textContent = text; }, 50); }
}

/* ── Utility: local storage wrapper ── */
const SS = {
  s(k, v) { try { localStorage.setItem('ic_' + k, JSON.stringify(v)); } catch (_e) {} },
  l(k, d) { try { const v = localStorage.getItem('ic_' + k); return v ? JSON.parse(v) : d || null; } catch (_e) { return d || null; } },
  c() { try { Object.keys(localStorage).filter(k => k.startsWith('ic_')).forEach(k => localStorage.removeItem(k)); } catch (_e) {} },
};

/* ══════════════════════════════════════════════════════════════
   ATOMS — Small reusable accessible components
   ══════════════════════════════════════════════════════════════ */

function Av({ src, name, size = 32, status, onClick }) {
  const h = name ? [...('' + name)].reduce((a, c) => a + c.charCodeAt(0), 0) % 360 : 0;
  return (
    <div onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
         onKeyDown={onClick ? e => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
         aria-label={name ? `${name}'s avatar${status ? ', ' + status : ''}` : 'Avatar'}
         style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0,
                  cursor: onClick ? 'pointer' : 'default', position: 'relative' }}>
      {src ? (
        <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
             onError={e => { e.target.style.display = 'none'; }} />
      ) : (
        <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${h},55%,42%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: size * 0.38, fontWeight: 700, color: '#fff' }}
             aria-hidden="true">
          {(name || '?')[0].toUpperCase()}
        </div>
      )}
      {status && (
        <div aria-label={`Status: ${status}`}
             style={{ position: 'absolute', bottom: 0, right: 0,
                      width: size * 0.28, height: size * 0.28, borderRadius: '50%',
                      background: status === 'online' ? 'var(--ok)' : status === 'idle' ? 'var(--wrn)' : status === 'dnd' ? 'var(--err)' : 'var(--txg)',
                      border: '2px solid var(--bg2)' }} />
      )}
    </div>
  );
}

function Tg({ on, onChange, label }) {
  return (
    <button className="tg" role="switch" aria-checked={on} aria-label={label || 'Toggle'}
            onClick={() => onChange(!on)}>
      <div className="k" />
    </button>
  );
}

function Notify({ text }) {
  return text ? <div className="toast" role="alert">{text}</div> : null;
}

function MsgTag({ type }) {
  const m = { ia: { l: 'IA', c: '#06D6A0' }, mod: { l: 'MOD', c: '#F59E0B' }, announce: { l: 'ANNOUNCE', c: '#818CF8' }, system: { l: 'SYS', c: '#EF4444' }, warn: { l: 'WARN', c: '#F59E0B' } };
  const t = m[type]; if (!t) return null;
  return <span className="mtag" role="status" style={{ background: t.c + '18', color: t.c, border: '1px solid ' + t.c + '30' }}>{t.l}</span>;
}

function XPBar({ xp = 0, w = 100 }) {
  const pct = Math.min(xp / 1000, 1) * 100;
  return (
    <div role="progressbar" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={1000}
         aria-label={`XP: ${xp}`}
         style={{ width: w, height: 4, borderRadius: 2, background: 'var(--bdr)', overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,var(--acc),var(--acl))' }} />
    </div>
  );
}

function RepChip({ user }) {
  const rep = REP.calc(user || {}); const rl = REP.level(rep);
  return <span className="chip" style={{ background: rl.c + '18', color: rl.c }}>{rl.i} {rl.n}</span>;
}

/* ══════════════════════════════════════════════════════════════
   AUTH SCREENS
   ══════════════════════════════════════════════════════════════ */

function AgeGate({ onPass }) {
  const [step, setStep] = useState(0);
  const [idxs, setIdxs] = useState([]);
  const [cur, setCur] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(CKIDS.timeLimit);
  const [fails, setFails] = useState(0);
  const [total, setTotal] = useState(CKIDS.baseCount);

  const start = () => {
    const pool = [...Array(CKIDS.questions.length).keys()];
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    setIdxs(pool.slice(0, Math.min(total, pool.length)));
    setCur(0); setScore(0); setTime(CKIDS.timeLimit); setStep(1);
  };

  useEffect(() => {
    if (step !== 1) return;
    const t = setInterval(() => setTime(p => {
      if (p <= 1) { clearInterval(t); setFails(f => f + 1); setTotal(q => Math.min(q + CKIDS.penalty, CKIDS.maxCount)); setStep(3); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [step]);

  const answer = (i) => {
    const q = CKIDS.questions[idxs[cur]]; const ok = i === q.a; const ns = ok ? score + 1 : score;
    if (cur + 1 >= idxs.length) {
      if (ns >= Math.ceil(idxs.length * 0.8)) { setStep(2); setTimeout(onPass, 1000); }
      else { setFails(f => f + 1); setTotal(q => Math.min(q + CKIDS.penalty, CKIDS.maxCount)); setStep(3); }
    } else { setCur(cur + 1); setScore(ns); }
  };

  if (step === 0) return (
    <main className="age-gate" role="main" aria-label="Age verification">
      <div style={{ width: 400, padding: 30, borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--bdr)', textAlign: 'center' }}>
        <div style={{ fontSize: 36 }} aria-hidden="true">🔐</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--acl)', margin: '8px 0' }}>Age Verification</h1>
        <p style={{ fontSize: 12, color: 'var(--txm)', marginBottom: 14 }}>
          Answer {total} questions to verify you are 18+.
        </p>
        <div className="card" style={{ textAlign: 'left', marginBottom: 14, fontSize: 11, color: 'var(--txm)', lineHeight: 1.7 }}>
          ✓ {total} questions · {CKIDS.timeLimit}s timer · 80% to pass
          {fails > 0 && <div style={{ color: 'var(--wrn)' }}>Failed {fails}x — +{CKIDS.penalty} penalty questions</div>}
        </div>
        <button className="btn bp" onClick={start} style={{ width: '100%', padding: 12 }}>
          Start Verification
        </button>
      </div>
    </main>
  );

  if (step === 1) {
    const q = CKIDS.questions[idxs[cur]];
    return (
      <main className="age-gate" role="main" aria-label="Age verification quiz">
        <div style={{ width: 440, padding: 26, borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--txm)' }}>Question {cur + 1} of {idxs.length}</span>
            <span aria-live="polite" style={{ fontSize: 12, fontWeight: 700, color: time < 15 ? 'var(--err)' : 'var(--wrn)', fontFamily: 'monospace' }}>{time}s</span>
          </div>
          <div style={{ display: 'flex', gap: 3, marginBottom: 12 }} role="progressbar" aria-valuenow={cur + 1} aria-valuemax={idxs.length}>
            {idxs.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < cur ? 'var(--ok)' : i === cur ? 'var(--acc)' : 'var(--bdr)' }} />)}
          </div>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, lineHeight: 1.5 }}>{q.q}</h2>
          <div role="radiogroup" aria-label="Answer options">
            {q.o.map((o, i) => (
              <button key={i} className="btn bs" onClick={() => answer(i)}
                      style={{ width: '100%', textAlign: 'left', padding: 12, marginBottom: 4 }}>
                {o}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (step === 2) return (
    <main className="age-gate" aria-label="Verification passed">
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ fontSize: 48 }} aria-hidden="true">✅</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ok)', marginTop: 8 }}>Verified!</h2>
      </div>
    </main>
  );

  return (
    <main className="age-gate" aria-label="Verification failed">
      <div style={{ width: 360, padding: 30, borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--bdr)', textAlign: 'center' }}>
        <div style={{ fontSize: 36 }} aria-hidden="true">❌</div>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--err)' }}>Failed</h2>
        <p style={{ fontSize: 12, color: 'var(--txm)', margin: '8px 0 14px' }}>Next attempt: {total} questions</p>
        <button className="btn bp" onClick={start} style={{ width: '100%' }}>Try Again</button>
      </div>
    </main>
  );
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [u, setU] = useState(''); const [d, setD] = useState('');
  const [e, setE] = useState(''); const [p, setP] = useState('');
  const [err, setErr] = useState('');
  const nameRef = useRef(null);

  useEffect(() => { if (nameRef.current) nameRef.current.focus(); }, [mode]);

  const go = () => {
    if (mode === 'register') { if (!u.trim() || !d.trim() || !p.trim()) { setErr('All fields required'); return; } }
    else { if (!u.trim() || !p.trim()) { setErr('Username & password required'); return; } }
    onLogin({
      id: 'me', username: u.trim(), display: d.trim() || u.trim(), email: e,
      avatar: null, banner: null, badges: ['founder'], role: 'ceo', status: 'online',
      xp: 0, msgs: 0, strikes: 0, premium: null, isMe: true, censored: false,
      created: Date.now(), password: p, gradient: null,
    });
  };

  return (
    <main className="login-bg" role="main" aria-label="Login">
      <div style={{ width: 380, padding: 30, borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 36 }} aria-hidden="true">⬡</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--acl)' }}>interClouder</h1>
          <p style={{ fontSize: 11, color: 'var(--txg)' }}>Secure Social Network</p>
        </div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12 }} role="tablist">
          {['login', 'register'].map(m => (
            <button key={m} role="tab" aria-selected={mode === m}
                    className={`tab ${mode === m ? 'on' : 'off'}`}
                    onClick={() => { setMode(m); setErr(''); }}
                    style={{ flex: 1, textTransform: 'capitalize' }}>
              {m}
            </button>
          ))}
        </div>
        {err && <div role="alert" style={{ padding: 6, borderRadius: 7, background: 'rgba(239,68,68,.1)', color: 'var(--err)', fontSize: 12, marginBottom: 8 }}>{err}</div>}
        <form onSubmit={ev => { ev.preventDefault(); go(); }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="sr-only" htmlFor="login-user">Username</label>
          <input id="login-user" ref={nameRef} className="li" placeholder="Username" value={u}
                 onChange={ev => setU(ev.target.value)} autoComplete="username" required />
          {mode === 'register' && <>
            <label className="sr-only" htmlFor="login-display">Display Name</label>
            <input id="login-display" className="li" placeholder="Display Name" value={d} onChange={ev => setD(ev.target.value)} />
            <label className="sr-only" htmlFor="login-email">Email</label>
            <input id="login-email" className="li" placeholder="Email" value={e} onChange={ev => setE(ev.target.value)} type="email" autoComplete="email" />
          </>}
          <label className="sr-only" htmlFor="login-pw">Password</label>
          <input id="login-pw" className="li" placeholder="Password" value={p} onChange={ev => setP(ev.target.value)}
                 type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required />
          <button type="submit" className="btn bp" style={{ width: '100%', padding: 10 }}>
            {mode === 'register' ? 'Create Account' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   SPLASH & MODALS
   ══════════════════════════════════════════════════════════════ */

function Splash({ update, onClose }) {
  return (
    <div className="splash" onClick={onClose} role="dialog" aria-modal="true" aria-label={update.title}>
      <div className="splash-card" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 48, marginBottom: 10 }} aria-hidden="true">🚀</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--acl)', marginBottom: 14 }}>{update.title}</h1>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {update.changes.map((c, i) => (
            <li key={i} style={{ fontSize: 12, color: 'var(--tx2)', padding: '3px 0', borderBottom: '1px solid var(--bdr)' }}>{c}</li>
          ))}
        </ul>
        <button className="btn bp" onClick={onClose} style={{ marginTop: 16, width: '100%', padding: 10 }}>
          Let&apos;s Go!
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TERMINAL with INEX support
   ══════════════════════════════════════════════════════════════ */

function TerminalPanel({ notify, user, allUsers, onEditUser }) {
  const [cmd, setCmd] = useState('');
  const [logs, setLogs] = useState(['[System] Terminal ready. Type /help — intercoder bridge enabled']);
  const logRef = useRef(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  const run = () => {
    if (!cmd.trim()) return;
    const c = cmd.trim(); setCmd('');
    const args = c.split(' '); const command = args[0].toLowerCase();
    const log = (m) => setLogs(p => [...p, '[' + new Date().toLocaleTimeString() + '] ' + m]);
    log('> ' + c);
    if (command === '/help') log('Commands: /help /stats /users /grant <user> <badge> /xp <user> <amount> /strike <user> /inex <code>');
    else if (command === '/stats') log('Users: ' + (1 + allUsers.length) + ' | XP: ' + (user.xp || 0));
    else if (command === '/users') { log('Owner: ' + user.display); allUsers.forEach(u => log('  ' + u.display + ' [' + u.role + '] XP:' + u.xp)); }
    else if (command === '/inex') {
      const inexCode = args.slice(1).join(' ');
      if (!inexCode) { log('Usage: /inex <code>'); return; }
      try {
        const result = runInex(inexCode);
        result.output.forEach(o => log('  ' + o.args.join(' ')));
        if (result.errors.length > 0) result.errors.forEach(e => log('  ✗ ' + e.message));
        else log('  ✓ OK (' + result.elapsed + 'ms)');
      } catch (e) { log('  ✗ ' + e.message); }
    }
    else if (command === '/grant' && args.length >= 3) {
      const target = allUsers.find(u => u.display.toLowerCase() === args[1].toLowerCase());
      if (!target) { log('User not found'); return; }
      const badge = args[2];
      if (!BADGES[badge]) { log('Badge not found. Valid: ' + Object.keys(BADGES).join(', ')); return; }
      onEditUser(target.id, { badges: [...(target.badges || []), badge] });
      log('Granted ' + BADGES[badge].l + ' to ' + target.display);
    }
    else if (command === '/xp' && args.length >= 3) {
      const target = allUsers.find(u => u.display.toLowerCase() === args[1].toLowerCase());
      if (!target) { log('User not found'); return; }
      const amt = parseInt(args[2]) || 0;
      onEditUser(target.id, { xp: (target.xp || 0) + amt });
      log('Added ' + amt + ' XP to ' + target.display);
    }
    else if (command === '/strike' && args.length >= 2) {
      const target = allUsers.find(u => u.display.toLowerCase() === args[1].toLowerCase());
      if (!target) { log('User not found'); return; }
      onEditUser(target.id, { strikes: (target.strikes || 0) + 1 });
      log('Strike added to ' + target.display);
    }
    else log('Unknown command. Type /help');
  };

  return (
    <div role="region" aria-label="Terminal">
      <div ref={logRef} style={{ background: '#0a0a0a', borderRadius: 10, padding: 10, height: 250, overflowY: 'auto', fontFamily: 'var(--mono)', fontSize: 11, marginBottom: 8 }}
           role="log" aria-live="polite" aria-label="Terminal output">
        {logs.map((l, i) => (
          <div key={i} style={{ color: l.startsWith('>') ? 'var(--acl)' : l.startsWith('[System]') ? 'var(--ok)' : 'var(--tx2)', padding: '1px 0' }}>{l}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <label className="sr-only" htmlFor="terminal-input">Terminal command</label>
        <input id="terminal-input" className="li" value={cmd} onChange={e => setCmd(e.target.value)}
               onKeyDown={e => { if (e.key === 'Enter') run(); }}
               placeholder="/command..." style={{ fontFamily: 'var(--mono)' }} />
        <button className="btn bp" onClick={run}>Run</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════════ */

export default function App() {
  // ── State ──
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [srvs, setSrvs] = useState([]);
  const [aS, setAS] = useState(null);
  const [aCh, setACh] = useState(null);
  const [testUsers, setTestUsers] = useState([]);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [ageOK, setAgeOK] = useState(false);
  const [view, setView] = useState('server');
  const [showCreate, setShowCreate] = useState(false);
  const [showIDE, setShowIDE] = useState(false);
  const [notif, setNotif] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [payTier, setPayTier] = useState(null);
  const [mounted, setMounted] = useState(false);

  // ── Hydration ──
  useEffect(() => {
    setUser(SS.l('user'));
    setTheme(SS.l('theme', 'dark'));
    setSrvs(SS.l('srvs', []));
    setAS(SS.l('aS'));
    setACh(SS.l('aCh'));
    setTestUsers(SS.l('tU', []));
    setSettings(SS.l('settings', { ...DEFAULT_SETTINGS }));
    setAgeOK(SS.l('ageOK', false));
    setShowSplash(!SS.l('splash60'));
    setMounted(true);
  }, []);

  // ── Persist ──
  useEffect(() => { if (mounted && user) SS.s('user', user); }, [user, mounted]);
  useEffect(() => { if (mounted) { SS.s('theme', theme); document.documentElement.setAttribute('data-theme', theme); } }, [theme, mounted]);
  useEffect(() => { if (mounted) SS.s('srvs', srvs); }, [srvs, mounted]);
  useEffect(() => { if (mounted) SS.s('aS', aS); }, [aS, mounted]);
  useEffect(() => { if (mounted) SS.s('aCh', aCh); }, [aCh, mounted]);
  useEffect(() => { if (mounted) SS.s('tU', testUsers); }, [testUsers, mounted]);
  useEffect(() => { if (mounted) SS.s('settings', settings); }, [settings, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const fs = settings?.access?.fontSize || 14;
    document.documentElement.style.fontSize = fs + 'px';
    if (settings?.access?.reducedMotion) document.documentElement.setAttribute('data-reduced-motion', 'true');
    else document.documentElement.removeAttribute('data-reduced-motion');
    if (settings?.access?.highContrast) document.documentElement.setAttribute('data-theme', 'high-contrast');
  }, [settings, mounted]);

  // ── Keyboard ──
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') { setShowCreate(false); setShowIDE(false); setPayTier(null); }
      if (e.ctrlKey && e.key === ',') { e.preventDefault(); setView('settings'); }
      if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); setShowIDE(v => !v); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const nf = useCallback((t) => { setNotif(t); announce(t); setTimeout(() => setNotif(null), 2500); }, []);

  // ── User/Server Helpers ──
  const editUser = useCallback((id, changes) => {
    if (id === 'me') setUser(u => ({ ...u, ...changes }));
    else setTestUsers(us => us.map(u => u.id === id ? { ...u, ...changes } : u));
  }, []);

  const createServer = useCallback((srv) => {
    setSrvs(s => [...s, srv]);
    setAS(srv.id);
    setACh(srv.channels[0]?.id || null);
  }, []);

  const sendMessage = useCallback((text, file) => {
    if (!aS || !aCh) return;
    setSrvs(ss => ss.map(s => {
      if (s.id !== aS) return s;
      return {
        ...s, channels: s.channels.map(c => {
          if (c.id !== aCh) return c;
          return {
            ...c, msgs: [...(c.msgs || []), {
              id: 'm' + Date.now(), uid: 'me', user: user.display,
              text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              color: ROLES[user.role]?.c, reactions: [], file, tag: null, edited: false,
            }],
          };
        }),
      };
    }));
    setUser(u => ({ ...u, msgs: (u.msgs || 0) + 1, xp: (u.xp || 0) + 5 }));
  }, [aS, aCh, user]);

  const addReaction = useCallback((msgId, emoji) => {
    setSrvs(ss => ss.map(s => ({
      ...s, channels: s.channels.map(c => ({
        ...c, msgs: (c.msgs || []).map(m => {
          if (m.id !== msgId) return m;
          const existing = (m.reactions || []).find(r => r.emoji === emoji);
          if (existing) {
            return { ...m, reactions: m.reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + (r.me ? -1 : 1), me: !r.me } : r).filter(r => r.count > 0) };
          }
          return { ...m, reactions: [...(m.reactions || []), { emoji, count: 1, me: true }] };
        }),
      })),
    })));
  }, []);

  // ── Loading State ──
  if (!mounted) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0a14' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 42 }}>⬡</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#C084FC', marginTop: 14 }}>interClouder</h1>
        <p style={{ fontSize: 10, color: '#4a4460', marginTop: 6 }}>Loading...</p>
      </div>
    </div>
  );

  // ── Auth Flow ──
  if (!ageOK) return <AgeGate onPass={() => { setAgeOK(true); SS.s('ageOK', true); }} />;
  if (!user) return <LoginScreen onLogin={(u) => { setUser(u); nf('Welcome, ' + u.display + '!'); }} />;

  // ── Splash ──
  if (showSplash) return <Splash update={UPDATES[0]} onClose={() => { setShowSplash(false); SS.s('splash60', true); }} />;

  // ── Derived state ──
  const srv = srvs.find(s => s.id === aS);
  const ch = srv?.channels?.find(c => c.id === aCh);
  const msgs = ch?.msgs || [];

  // ── Nav items ──
  const navItems = [
    { id: 'server', icon: '💬', label: 'Servers' },
    { id: 'mod', icon: '🛡', label: 'Moderation' },
    { id: 'admin', icon: '👑', label: 'Admin Panel' },
    { id: 'inex', icon: '⟨/⟩', label: 'INEX IDE' },
    { id: 'plugins', icon: '🧩', label: 'Plugins & Bots' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ];

  return (
    <div className="app" id="main-content">
      <Notify text={notif} />

      {/* ── Server Bar ── */}
      <nav className="sbar" role="navigation" aria-label="Server navigation">
        <button className="si" aria-label="Home" onClick={() => { setAS(null); setView('server'); }}
                style={{ background: 'linear-gradient(135deg, var(--acc), var(--pk))', color: '#fff', border: 'none' }}>
          ⬡
        </button>

        <div style={{ width: 28, height: 1, background: 'var(--bdr)', margin: '2px 0' }} role="separator" />

        {srvs.map(s => (
          <button key={s.id} className={`si ${aS === s.id ? 'on' : ''}`}
                  aria-label={s.name} aria-selected={aS === s.id}
                  onClick={() => { setAS(s.id); setACh(s.channels[0]?.id || null); setView('server'); }}>
            {aS === s.id && <div className="ind" />}
            {s.icon || s.name.substring(0, 2)}
          </button>
        ))}

        <button className="si" aria-label="Create server" onClick={() => setShowCreate(true)}
                style={{ color: 'var(--ok)', fontSize: 20 }}>
          +
        </button>

        <div style={{ flex: 1 }} />

        {navItems.filter(n => n.id !== 'server').map(n => (
          <button key={n.id} className={`si ${view === n.id ? 'on' : ''}`}
                  aria-label={n.label} aria-selected={view === n.id}
                  onClick={() => setView(n.id)}>
            <span style={{ fontSize: n.id === 'inex' ? 11 : 15 }}>{n.icon}</span>
          </button>
        ))}
      </nav>

      {/* ── INEX IDE (full screen overlay) ── */}
      {view === 'inex' ? (
        <InexIDE onClose={() => setView('server')} notify={nf} />
      ) : (
        <>
          {/* ── Side Panel ── */}
          <aside className="side" role="complementary" aria-label="Channel list">
            <div style={{ padding: '12px 12px 6px', borderBottom: '1px solid var(--bdr)' }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--acl)' }}>
                {srv ? srv.name : 'interClouder'}
              </h2>
              <p style={{ fontSize: 9, color: 'var(--txg)' }}>
                {srv ? `${srv.channels.length} channels` : 'Select or create a server'}
              </p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px' }} role="listbox" aria-label="Channels">
              {srv && <>
                <div className="sl">Text Channels</div>
                {srv.channels.map(c => (
                  <div key={c.id} className={`ch ${aCh === c.id ? 'on' : ''}`}
                       role="option" aria-selected={aCh === c.id} tabIndex={0}
                       onClick={() => { setACh(c.id); setView('server'); }}
                       onKeyDown={e => { if (e.key === 'Enter') { setACh(c.id); setView('server'); } }}>
                    <span># {c.name}</span>
                    {(c.msgs || []).length > 0 && (
                      <span style={{ fontSize: 9, color: 'var(--txg)', background: 'var(--bg3)', padding: '1px 5px', borderRadius: 4 }}>
                        {(c.msgs || []).length}
                      </span>
                    )}
                  </div>
                ))}
                {(srv.vChannels || []).length > 0 && <>
                  <div className="sl">Voice Channels</div>
                  {srv.vChannels.map(vc => (
                    <div key={vc.id} className="ch" role="option" tabIndex={0}>
                      <span>🔊 {vc.name}</span>
                    </div>
                  ))}
                </>}
              </>}
              {!srv && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--txg)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>☁</div>
                  <p style={{ fontSize: 12 }}>No server selected.</p>
                  <button className="btn bp" onClick={() => setShowCreate(true)} style={{ marginTop: 10 }}>
                    Create Server
                  </button>
                </div>
              )}
            </div>

            {/* User status bar */}
            <div style={{ padding: 8, borderTop: '1px solid var(--bdr)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Av name={user.display} size={28} status={user.status} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ROLES[user.role]?.c, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.display}
                </div>
                <div style={{ fontSize: 8, color: 'var(--txg)' }}>@{user.username}</div>
              </div>
              <button className="btn bs" onClick={() => setView('settings')} aria-label="Settings"
                      style={{ padding: '4px 6px', fontSize: 12 }}>⚙</button>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="main" role="main" aria-label={view === 'server' ? 'Chat' : view}>

            {/* Header Bar */}
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid var(--bdr)', background: 'var(--bg2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {view === 'server' && ch && <h1 style={{ fontSize: 14, fontWeight: 700 }}># {ch.name}</h1>}
                {view === 'mod' && <h1 style={{ fontSize: 14, fontWeight: 700 }}>🛡 Moderation</h1>}
                {view === 'admin' && <h1 style={{ fontSize: 14, fontWeight: 700 }}>👑 Admin Panel</h1>}
                {view === 'plugins' && <h1 style={{ fontSize: 14, fontWeight: 700 }}>🧩 Plugins & Bots</h1>}
                {view === 'settings' && <h1 style={{ fontSize: 14, fontWeight: 700 }}>⚙ Settings</h1>}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn bs" onClick={() => setView('inex')} aria-label="Open INEX IDE"
                        style={{ padding: '4px 10px', fontSize: 11, fontFamily: 'var(--mono)' }}>
                  ⟨/⟩ INEX
                </button>
              </div>
            </header>

            {/* ── View: Chat ── */}
            {view === 'server' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} role="log" aria-label="Messages" aria-live="polite">
                  {msgs.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--txg)' }}>
                      <div style={{ fontSize: 36 }} aria-hidden="true">💬</div>
                      <p style={{ fontSize: 13, marginTop: 6 }}>No messages yet. Say something!</p>
                    </div>
                  )}
                  {msgs.map(m => (
                    <div key={m.id} className="msg">
                      <Av name={m.user} size={28} status={m.uid === 'me' ? 'online' : undefined} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: m.color || 'var(--tx)' }}>{m.user}</span>
                          {m.tag && <MsgTag type={m.tag} />}
                          <time style={{ fontSize: 9, color: 'var(--txg)' }}>{m.time}</time>
                          {m.edited && <span style={{ fontSize: 8, color: 'var(--txg)' }}>(edited)</span>}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--tx2)', marginTop: 1, wordBreak: 'break-word' }}>
                          {m.text}
                        </div>
                        {m.file && m.file.url && m.file.type?.startsWith('image/') && (
                          <img src={m.file.url} alt={m.file.name || 'Attachment'}
                               style={{ maxWidth: 260, maxHeight: 180, borderRadius: 8, display: 'block', marginTop: 4 }} />
                        )}
                        {m.reactions?.length > 0 && (
                          <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap' }}>
                            {m.reactions.map((r, i) => (
                              <button key={i} className="rx" aria-pressed={r.me}
                                      onClick={() => addReaction(m.id, r.emoji)} aria-label={`${r.emoji} ${r.count}`}>
                                {r.emoji} {r.count}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="inp">
                  <label className="sr-only" htmlFor="msg-input">Type a message</label>
                  <input id="msg-input"
                    placeholder={`Message #${ch?.name || 'general'}...`}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        sendMessage(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                    autoComplete="off"
                  />
                  <button className="btn bp" aria-label="Send message"
                          onClick={() => {
                            const inp = document.getElementById('msg-input');
                            if (inp.value.trim()) { sendMessage(inp.value.trim()); inp.value = ''; }
                          }}
                          style={{ padding: '7px 14px' }}>→</button>
                </div>
              </div>
            )}

            {/* ── View: Admin ── */}
            {view === 'admin' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
                  {[['👥', 1 + testUsers.length, 'Users'], ['🖥', srvs.length, 'Servers'], ['💬', srvs.reduce((a, s) => a + s.channels.reduce((b, c) => b + (c.msgs || []).length, 0), 0), 'Messages'], ['⭐', user.xp || 0, 'XP']].map(([i, v, l]) => (
                    <div key={l} className="card" style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20 }} aria-hidden="true">{i}</div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{v}</div>
                      <div style={{ fontSize: 9, color: 'var(--txm)' }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div className="card" style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Quick Actions</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button className="btn bs" onClick={() => nf('Feature coming soon')}>+ Test Account</button>
                    <button className="btn bs" onClick={() => setView('inex')}>⟨/⟩ Open INEX IDE</button>
                    <button className="btn bs" onClick={() => setShowCreate(true)}>+ Create Server</button>
                  </div>
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>💻 Terminal</h3>
                <TerminalPanel notify={nf} user={user} allUsers={testUsers} onEditUser={editUser} />
              </div>
            )}

            {/* ── View: Plugins ── */}
            {view === 'plugins' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                <div className="sl">Plugins</div>
                {PLUGINS.map(p => (
                  <div key={p.id} className="card" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }} aria-hidden="true">{p.i}</span>
                      <div><div style={{ fontSize: 12, fontWeight: 700 }}>{p.n}</div>
                        <div style={{ fontSize: 10, color: 'var(--txm)' }}>{p.d}</div></div>
                    </div>
                    <Tg on={true} onChange={() => nf('Toggled ' + p.n)} label={`Toggle ${p.n}`} />
                  </div>
                ))}
                <div className="sl" style={{ marginTop: 12 }}>AI Bots</div>
                {BOTS.map(b => (
                  <div key={b.id} className="card" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }} aria-hidden="true">{b.i}</span>
                    <div><div style={{ fontSize: 12, fontWeight: 700, color: b.c }}>{b.n}</div>
                      <div style={{ fontSize: 10, color: 'var(--txm)' }}>{b.d}</div></div>
                  </div>
                ))}
              </div>
            )}

            {/* ── View: Settings ── */}
            {view === 'settings' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                <div className="card" style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Av name={user.display} size={44} status={user.status} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{user.display}</div>
                      <div style={{ fontSize: 10, color: 'var(--txm)' }}>@{user.username} · {ROLES[user.role]?.n || 'Member'}</div>
                    </div>
                  </div>
                </div>

                <fieldset style={{ border: 'none', marginBottom: 12 }}>
                  <legend className="sl">Theme</legend>
                  <div style={{ display: 'flex', gap: 4 }} role="radiogroup" aria-label="Theme selection">
                    {['dark', 'midnight', 'void', 'light', 'high-contrast'].map(t => (
                      <button key={t} role="radio" aria-checked={theme === t}
                              className={`tab ${theme === t ? 'on' : 'off'}`}
                              onClick={() => setTheme(t)} style={{ textTransform: 'capitalize' }}>
                        {t.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset style={{ border: 'none', marginBottom: 12 }}>
                  <legend className="sl">Accessibility</legend>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--bg4)' }}>
                      <span style={{ fontSize: 12 }}>Reduced Motion</span>
                      <Tg on={settings?.access?.reducedMotion || false}
                          onChange={v => setSettings(s => ({ ...s, access: { ...s.access, reducedMotion: v } }))}
                          label="Toggle reduced motion" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--bg4)' }}>
                      <span style={{ fontSize: 12 }}>High Contrast</span>
                      <Tg on={settings?.access?.highContrast || false}
                          onChange={v => { setSettings(s => ({ ...s, access: { ...s.access, highContrast: v } })); if (v) setTheme('high-contrast'); else setTheme('dark'); }}
                          label="Toggle high contrast" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--bg4)' }}>
                      <span style={{ fontSize: 12 }}>Font Size: {settings?.access?.fontSize || 14}px</span>
                      <input type="range" min={11} max={20} value={settings?.access?.fontSize || 14}
                             onChange={e => setSettings(s => ({ ...s, access: { ...s.access, fontSize: parseInt(e.target.value) } }))}
                             aria-label="Font size" style={{ width: 100 }} />
                    </div>
                  </div>
                </fieldset>

                <fieldset style={{ border: 'none', marginBottom: 12 }}>
                  <legend className="sl">Status</legend>
                  <div style={{ display: 'flex', gap: 4 }} role="radiogroup" aria-label="Status selection">
                    {['online', 'idle', 'dnd', 'offline'].map(s => (
                      <button key={s} role="radio" aria-checked={user.status === s}
                              className={`tab ${user.status === s ? 'on' : 'off'}`}
                              onClick={() => { editUser('me', { status: s }); nf('Status: ' + s); }}
                              style={{ textTransform: 'capitalize' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset style={{ border: 'none', marginBottom: 12 }}>
                  <legend className="sl">Keyboard Shortcuts</legend>
                  {KBS.map(s => (
                    <div key={s.k} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--bg4)', marginBottom: 4 }}>
                      <span style={{ fontSize: 12 }}>{s.d}</span>
                      <kbd style={{ fontSize: 11, fontWeight: 700, color: 'var(--acl)', fontFamily: 'var(--mono)', padding: '2px 8px', borderRadius: 5, background: 'var(--bg3)' }}>{s.k}</kbd>
                    </div>
                  ))}
                </fieldset>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn bs" onClick={() => { SS.c(); setUser(null); nf('Logged out'); }} style={{ flex: 1 }}>
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* ── View: Mod ── */}
            {view === 'mod' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {srvs.length === 0 && <p style={{ color: 'var(--txm)', fontSize: 12 }}>No servers</p>}
                {srvs.map(s => (
                  <div key={s.id} className="card" style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{s.icon || '⬡'} {s.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--txm)' }}>{s.channels.length} channels · {(s.members || []).length} members</div>
                    </div>
                    <button className="btn bs" onClick={() => { setSrvs(ss => ss.filter(x => x.id !== s.id)); nf('Deleted ' + s.name); }}
                            style={{ fontSize: 10, color: 'var(--err)' }}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* ── Create Server Modal ── */}
      {showCreate && (
        <div className="modal" onClick={() => setShowCreate(false)} role="dialog" aria-modal="true" aria-label="Create server">
          <div className="mcard" onClick={e => e.stopPropagation()} style={{ width: 400, padding: 22 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Create Server</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} className="card" onClick={() => {
                  const id = 's' + Date.now().toString(36);
                  createServer({
                    id, name: t.n + ' Server', tag: { acr: t.n.substring(0, 3).toUpperCase() },
                    icon: t.i, members: [], xp: 0, created: Date.now(), isPublic: true,
                    channels: t.tc.map((c, i) => ({ id: id + 'c' + i, name: c, type: 'text', slowmode: 0, msgs: [] })),
                    vChannels: t.vc.map((c, i) => ({ id: id + 'v' + i, name: c, type: 'voice' })),
                    roles: [{ n: 'Owner', c: '#FFD700' }, { n: 'Admin', c: '#EF4444' }, { n: 'Member', c: '#818CF8' }, ...t.rl],
                    badge: null, customTheme: null, banner: null, earlyServer: false, boostLv: 0,
                  });
                  setShowCreate(false);
                  nf(t.n + ' Server created!');
                }} style={{ cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 22 }} aria-hidden="true">{t.i}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>{t.n}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
