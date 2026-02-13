'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import InexIDE from '@/components/inex/InexIDE';
import { runInex } from '@/lib/inex';
import {
  ROLES, getRolePerms, hasPermission, isModPlus, BADGES, PLANS, getUserTier, hasUnlock,
  REP, STRIKES, SLOWMODES, smLabel, FILE_SEC, FILE_LIMITS, getFileLimit,
  CKIDS, KBS, PLUGINS, BOTS, TEMPLATES, TRUST_ENGINE, GRADIENTS,
  DEFAULT_SETTINGS, UPDATES, DEFAULT_EMOJIS, REACTION_EMOJIS, STICKERS,
  FONT_TYPES, IDE_INSERT, LOGIC_BOARDS, MSG_TRASH, SCRAMBLE_CONFIG,
  SERVER_EMOJI_LIMITS, EXTERNAL_PERMS, EMOJI_CATEGORIES, CODE_LANGUAGES,
  FONT_GRADIENTS, FRIEND_SYSTEM, REPORT_SYSTEM, STEALTH_MODE,
  ACCOUNT_EMULATOR, MANDAMENT_SYSTEM, MODERATION_MANDAMENT, INEX_SPEC,
  PARTY_SYSTEM,
} from '@/lib/data';

/* ── Utilities ── */
function announce(text) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('live-announcer');
  if (el) { el.textContent = ''; setTimeout(() => { el.textContent = text; }, 50); }
}
const SS = {
  s(k, v) { try { localStorage.setItem('ic_' + k, JSON.stringify(v)); } catch (_e) {} },
  l(k, d) { try { const v = localStorage.getItem('ic_' + k); return v ? JSON.parse(v) : d || null; } catch (_e) { return d || null; } },
  c() { try { Object.keys(localStorage).filter(k => k.startsWith('ic_')).forEach(k => localStorage.removeItem(k)); } catch (_e) {} },
};
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/* ═══ FONT/TEXT PARSER ═══ */
function parseMessageText(text) {
  if (!text) return [{ type: 'text', content: text }];
  const segments = [];
  const codeBlockRe = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIdx = 0, m;
  while ((m = codeBlockRe.exec(text)) !== null) {
    if (m.index > lastIdx) segments.push({ type: 'text', content: text.slice(lastIdx, m.index) });
    segments.push({ type: 'terminal', lang: m[1] || 'text', content: m[2] });
    lastIdx = m.index + m[0].length;
  }
  if (segments.length > 0) {
    if (lastIdx < text.length) segments.push({ type: 'text', content: text.slice(lastIdx) });
    return segments.flatMap(s => s.type === 'text' ? parseInline(s.content) : [s]);
  }
  return parseInline(text);
}
function parseInline(text) {
  if (!text) return [];
  const patterns = [
    { re: /\{quantum:([^}]*)\}([\s\S]*?)\{\/quantum\}/g, fn: m => ({ type: 'quantum', users: m[1].split(',').map(u => u.trim().replace('@', '')), content: m[2] }) },
    { re: /\{size:(\d+)\}([\s\S]*?)\{\/size\}/g, fn: m => ({ type: 'resize', size: Math.min(48, Math.max(10, parseInt(m[1]))), content: m[2] }) },
    { re: /\{color:([^}]*)\}([\s\S]*?)\{\/color\}/g, fn: m => ({ type: 'stylized', color: m[1], content: m[2] }) },
    { re: /\{border:([^}]*)\}([\s\S]*?)\{\/border\}/g, fn: m => ({ type: 'boarded', color: m[1], content: m[2] }) },
    { re: /\{pixel\}([\s\S]*?)\{\/pixel\}/g, fn: m => ({ type: 'pixelated', content: m[1] }) },
    { re: /\{wave\}([\s\S]*?)\{\/wave\}/g, fn: m => ({ type: 'wave', content: m[1] }) },
    { re: /\{invert\}([\s\S]*?)\{\/invert\}/g, fn: m => ({ type: 'inverted', content: m[1] }) },
    { re: /\|\|(.+?)\|\|/g, fn: m => ({ type: 'scramble', content: m[1] }) },
    { re: /~~~(.+?)~~~/g, fn: m => ({ type: 'glitch', content: m[1] }) },
    { re: /~~(.+?)~~/g, fn: m => ({ type: 'crossed', content: m[1] }) },
    { re: /==(.+?)==/g, fn: m => ({ type: 'highlighted', content: m[1] }) },
    { re: /\*\*(.+?)\*\*/g, fn: m => ({ type: 'remached', content: m[1] }) },
    { re: /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, fn: m => ({ type: 'curved', content: m[1] }) },
    { re: /__(.+?)__/g, fn: m => ({ type: 'underlined', content: m[1] }) },
    { re: /\^(.+?)\^/g, fn: m => ({ type: 'elevated', content: m[1] }) },
    { re: /`([^`]+)`/g, fn: m => ({ type: 'encoded', content: m[1] }) },
  ];
  const replacements = [];
  for (const p of patterns) {
    let match; const re = new RegExp(p.re.source, p.re.flags);
    while ((match = re.exec(text)) !== null) replacements.push({ start: match.index, end: match.index + match[0].length, segment: p.fn(match) });
  }
  replacements.sort((a, b) => a.start - b.start);
  const filtered = []; let lastEnd = 0;
  for (const r of replacements) { if (r.start >= lastEnd) { filtered.push(r); lastEnd = r.end; } }
  const segs = []; let pos = 0;
  for (const r of filtered) {
    if (r.start > pos) segs.push({ type: 'text', content: text.slice(pos, r.start) });
    segs.push(r.segment); pos = r.end;
  }
  if (pos < text.length) segs.push({ type: 'text', content: text.slice(pos) });
  return segs.length ? segs : [{ type: 'text', content: text }];
}

/* ═══ ATOMS ═══ */
function Av({ src, name, size = 32, status, onClick }) {
  const h = name ? [...('' + name)].reduce((a, c) => a + c.charCodeAt(0), 0) % 360 : 0;
  return (
    <div onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
         onKeyDown={onClick ? e => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
         aria-label={name ? `${name}'s avatar${status ? ', ' + status : ''}` : 'Avatar'}
         style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, cursor: onClick ? 'pointer' : 'default', position: 'relative' }}>
      {src ? <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
      : <div style={{ width: size, height: size, borderRadius: '50%', background: `hsl(${h},55%,42%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, color: '#fff' }} aria-hidden="true">{(name || '?')[0].toUpperCase()}</div>}
      {status && <div aria-label={`Status: ${status}`} style={{ position: 'absolute', bottom: 0, right: 0, width: size * 0.28, height: size * 0.28, borderRadius: '50%', background: status === 'online' ? 'var(--ok)' : status === 'idle' ? 'var(--wrn)' : status === 'dnd' ? 'var(--err)' : 'var(--txg)', border: '2px solid var(--bg2)' }} />}
    </div>
  );
}
function Tg({ on, onChange, label }) {
  return <button className="tg" role="switch" aria-checked={on} aria-label={label || 'Toggle'} onClick={() => onChange(!on)}><div className="k" /></button>;
}
function Notify({ text }) { return text ? <div className="toast" role="alert">{text}</div> : null; }
function MsgTag({ type }) {
  const m = { ia: { l: 'IA', c: '#06D6A0' }, mod: { l: 'MOD', c: '#F59E0B' }, announce: { l: 'ANNOUNCE', c: '#818CF8' }, system: { l: 'SYS', c: '#EF4444' }, bot: { l: 'BOT', c: '#818CF8' }, logicboard: { l: 'BOARD', c: '#A855F7' }, stealth: { l: 'STEALTH', c: '#6B7280' } };
  const t = m[type]; if (!t) return null;
  return <span className="mtag" role="status" style={{ background: t.c + '18', color: t.c, border: '1px solid ' + t.c + '30' }}>{t.l}</span>;
}

/* ═══ TEXT RENDERER ═══ */
function TextRenderer({ segments, scrambleMode, currentUserId, isMinor }) {
  const [revealed, setRevealed] = useState({});
  const toggle = (i) => { if (isMinor) return; setRevealed(r => ({ ...r, [i]: !r[i] })); };
  return <span>{segments.map((seg, i) => {
    switch (seg.type) {
      case 'terminal': return <div key={i} className="ft-terminal">{seg.lang && seg.lang !== 'text' && <span className="lang-badge">{seg.lang}</span>}<pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: '#06D6A0' }}><code>{seg.content}</code></pre></div>;
      case 'encoded': return <code key={i} className="ft-encoded">{seg.content}</code>;
      case 'remached': return <strong key={i} className="ft-remached">{seg.content}</strong>;
      case 'curved': return <em key={i} className="ft-curved">{seg.content}</em>;
      case 'crossed': return <span key={i} className="ft-crossed">{seg.content}</span>;
      case 'underlined': return <span key={i} className="ft-underlined">{seg.content}</span>;
      case 'elevated': return <sup key={i} className="ft-elevated">{seg.content}</sup>;
      case 'highlighted': return <span key={i} className="ft-highlighted">{seg.content}</span>;
      case 'glitch': return <span key={i} className="ft-glitch">{seg.content}</span>;
      case 'pixelated': return <span key={i} className="ft-pixelated">{seg.content}</span>;
      case 'inverted': return <span key={i} className="ft-inverted">{seg.content}</span>;
      case 'wave': return <span key={i} className="ft-wave">{[...seg.content].map((ch, j) => <span key={j} style={{ animationDelay: (j * 0.05) + 's' }}>{ch}</span>)}</span>;
      case 'scramble':
        if (isMinor) return <span key={i} className="ft-scramble-box" title="Content hidden">[ hidden ]</span>;
        return <span key={i} className={`${scrambleMode === 'blackbox' ? 'ft-scramble-box' : 'ft-scramble-blur'} ${revealed[i] ? 'revealed' : ''}`}
                     onClick={() => toggle(i)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter') toggle(i); }}
                     aria-label={revealed[i] ? seg.content : 'Spoiler: click to reveal'}>{seg.content}</span>;
      case 'resize': return <span key={i} style={{ fontSize: seg.size + 'px' }}>{seg.content}</span>;
      case 'stylized':
        if (seg.color?.includes(',')) return <span key={i} className="gradient-text" style={{ background: `linear-gradient(135deg, ${seg.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{seg.content}</span>;
        return <span key={i} style={{ color: seg.color }}>{seg.content}</span>;
      case 'boarded': return <span key={i} className="ft-boarded" style={{ borderColor: seg.color || 'var(--acc)' }}>{seg.content}</span>;
      case 'quantum':
        const canSee = seg.users.includes(currentUserId) || seg.users.includes('*');
        return <span key={i} className={`ft-quantum ${canSee ? 'visible' : ''}`} title={canSee ? 'Quantum: visible to you' : 'Quantum: encrypted'}>{canSee ? seg.content : '██████'}</span>;
      default: return <span key={i}>{seg.content}</span>;
    }
  })}</span>;
}

/* ═══ PICKERS ═══ */
function EmojiPicker({ onSelect, onClose, serverEmojis = [] }) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const ref = useRef(null);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [onClose]);
  const filtered = DEFAULT_EMOJIS.filter(em => (cat === 'all' || em.cat === cat) && (!search || em.n.includes(search.toLowerCase())));
  return <div className="emoji-picker" ref={ref} role="dialog" aria-label="Emoji picker">
    <input className="search-box" placeholder="Search emojis..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
    <div className="cat-tabs">
      <button className={`cat-tab ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>All</button>
      {EMOJI_CATEGORIES.map(c => <button key={c} className={`cat-tab ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
    </div>
    <div className="emoji-grid">{filtered.map(em => <button key={em.id} onClick={() => { onSelect(em.e); onClose(); }} title={em.n}>{em.e}</button>)}</div>
    {serverEmojis.length > 0 && <div className="custom-section"><div className="custom-label">Server Emojis</div><div className="emoji-grid">{serverEmojis.map(em => <button key={em.id} onClick={() => { onSelect(em.e); onClose(); }} title={em.n}>{em.e}</button>)}</div></div>}
  </div>;
}
function StickerPicker({ onSelect, onClose }) {
  const ref = useRef(null);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [onClose]);
  return <div className="sticker-picker" ref={ref} role="dialog" aria-label="Sticker picker">
    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Stickers</div>
    <div className="sticker-grid">{STICKERS.map(s => <button key={s.id} className="sticker-btn" onClick={() => { onSelect(s); onClose(); }} title={s.name}><span style={{ fontSize: 32 }}>{s.emoji}</span><span className="label">{s.name}</span></button>)}</div>
  </div>;
}
function ReactionPicker({ onSelect, onClose }) {
  const ref = useRef(null);
  useEffect(() => { const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, [onClose]);
  return <div className="rx-picker" ref={ref} role="dialog" aria-label="Add reaction">{REACTION_EMOJIS.map(e => <button key={e} onClick={() => { onSelect(e); onClose(); }} aria-label={`React with ${e}`}>{e}</button>)}</div>;
}

/* ═══ IDE INSERT PANEL ═══ */
function IDEInsertPanel({ onInsert, onClose, userRole }) {
  const [lang, setLang] = useState('js');
  const [code, setCode] = useState('');
  const submit = () => {
    if (!code.trim()) return;
    const v = IDE_INSERT.validate(code, userRole);
    if (!v.ok) { alert(v.reason); return; }
    onInsert('```' + lang + '\n' + code + '\n```');
    onClose();
  };
  return <div className="ide-insert">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700 }}>📋 IDE Insert</span>
      <button className="btn bs" onClick={onClose} style={{ padding: '2px 8px', fontSize: 10 }}>✕</button>
    </div>
    <div className="lang-select">{CODE_LANGUAGES.map(l => <button key={l.id} className={`lang-btn ${lang === l.id ? 'on' : ''}`} onClick={() => setLang(l.id)} style={lang === l.id ? { color: l.color, borderColor: l.color } : {}}>{l.name}</button>)}</div>
    <textarea value={code} onChange={e => setCode(e.target.value)} placeholder={`// Write your ${lang} code here...`} onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') submit(); }} />
    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
      <button className="btn bp" onClick={submit} style={{ padding: '4px 14px', fontSize: 11 }}>Insert Code</button>
      <span style={{ fontSize: 9, color: 'var(--txm)', alignSelf: 'center' }}>Ctrl+Enter to insert</span>
    </div>
  </div>;
}

/* ═══ LOGIC BOARD PANEL ═══ */
function LogicBoardPanel({ boards, onCreate, onDelete, userRole, tierKey, notify }) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const isMod = LOGIC_BOARDS.modBypass.includes(userRole);
  const limit = LOGIC_BOARDS.getLimit(tierKey);
  const codeLimit = LOGIC_BOARDS.getCodeLimit(tierKey);
  const add = () => {
    if (!name.trim() || !content.trim()) return;
    if (!isMod && boards.length >= limit) { notify('Board limit reached (' + limit + ')'); return; }
    if (!isMod && content.length > codeLimit) { notify('Code exceeds ' + codeLimit + ' chars'); return; }
    onCreate({ id: 'lb_' + uid(), name: name.trim(), content: content.trim(), author: 'me', created: Date.now() });
    setName(''); setContent('');
  };
  return <div style={{ padding: 10 }}>
    <div className="sl">🔗 Logic-Boards ({boards.length}/{isMod ? '∞' : limit})</div>
    <p style={{ fontSize: 10, color: 'var(--txm)', marginBottom: 8 }}>Programmable text webhooks</p>
    {boards.map(b => <div key={b.id} className="logic-board">
      <div className="lb-header"><span className="lb-title">{b.name}</span><button className="btn bd" onClick={() => onDelete(b.id)} style={{ padding: '2px 6px', fontSize: 9, marginLeft: 'auto' }}>✕</button></div>
      <div className="lb-content">{b.content}</div>
    </div>)}
    <div style={{ marginTop: 8, background: 'var(--bg3)', borderRadius: 8, padding: 8 }}>
      <input className="li" placeholder="Board name..." value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 4, fontSize: 11 }} />
      <textarea className="li" placeholder="Board content/code..." value={content} onChange={e => setContent(e.target.value)} style={{ fontSize: 11, minHeight: 50, fontFamily: 'var(--mono)', resize: 'vertical' }} />
      <button className="btn bp" onClick={add} style={{ marginTop: 4, padding: '4px 12px', fontSize: 11 }}>Create Board</button>
    </div>
  </div>;
}

/* ═══ MANDAMENT SISTEMATICS SCREEN ═══ */
function MandamentScreen({ ms, mms, isMod, onAccept }) {
  const [readSections, setReadSections] = useState(new Set());
  const [activeTab, setActiveTab] = useState('ms');
  const [msAccepted, setMsAccepted] = useState(false);
  const [mmsAccepted, setMmsAccepted] = useState(false);
  const [mmsRead, setMmsRead] = useState(new Set());

  const current = activeTab === 'ms' ? ms : mms;
  const canAcceptMS = true;
  const canAcceptMMS = mms.sections.every((_, i) => mmsRead.has(i));

  const canFinish = isMod ? (msAccepted && mmsAccepted) : msAccepted;

  return <main className="age-gate" role="main" aria-label="Mandament Sistematics">
    <div style={{ width: 520, maxHeight: '85vh', padding: 26, borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--bdr)', overflow: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 36 }}>📜</div>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--acl)' }}>Mandament Sistematics</h1>
        <p style={{ fontSize: 10, color: 'var(--txm)' }}>Lee y acepta las normativas de interClouder</p>
      </div>
      {isMod && <div style={{ display: 'flex', gap: 4, marginBottom: 12, justifyContent: 'center' }}>
        <button className={`tab ${activeTab === 'ms' ? 'on' : 'off'}`} onClick={() => setActiveTab('ms')}>📜 MS {msAccepted && '✓'}</button>
        <button className={`tab ${activeTab === 'mms' ? 'on' : 'off'}`} onClick={() => setActiveTab('mms')}>🛡 MMS {mmsAccepted && '✓'}</button>
      </div>}
      <div style={{ fontSize: 10, color: 'var(--txm)', marginBottom: 10 }}>{current.name} v{current.version}{activeTab === 'mms' && ' — Debes leer TODAS las secciones'}</div>
      {current.sections.map((s, i) => {
        const isRead = activeTab === 'mms' ? mmsRead.has(i) : readSections.has(i);
        return <div key={i} className="card" style={{ marginBottom: 6, cursor: activeTab === 'mms' ? 'pointer' : 'default', opacity: isRead ? 0.8 : 1, borderLeft: `3px solid ${isRead ? 'var(--ok)' : 'var(--acc)'}` }}
          onClick={() => { if (activeTab === 'mms') setMmsRead(r => new Set([...r, i])); else setReadSections(r => new Set([...r, i])); }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>{s.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{s.title}</span>
            {isRead && <span style={{ fontSize: 9, color: 'var(--ok)', marginLeft: 'auto' }}>✓ Leído</span>}
          </div>
          {s.rules.map((r, j) => <div key={j} style={{ fontSize: 11, color: 'var(--tx2)', padding: '3px 0 3px 22px', borderBottom: j < s.rules.length - 1 ? '1px solid var(--bdr)' : 'none' }}>{r}</div>)}
        </div>;
      })}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {activeTab === 'ms' && !msAccepted && <button className="btn bp" onClick={() => setMsAccepted(true)} style={{ width: '100%', padding: 10 }}>Acepto el MS (Mandament Sistematics)</button>}
        {activeTab === 'ms' && msAccepted && <div style={{ textAlign: 'center', color: 'var(--ok)', fontSize: 12, fontWeight: 700 }}>✓ MS Aceptado</div>}
        {activeTab === 'mms' && !mmsAccepted && <button className="btn bp" onClick={() => { if (canAcceptMMS) setMmsAccepted(true); }} disabled={!canAcceptMMS} style={{ width: '100%', padding: 10, opacity: canAcceptMMS ? 1 : 0.5 }}>
          {canAcceptMMS ? 'Acepto el MMS (Moderation Mandament)' : `Lee todas las secciones (${mmsRead.size}/${mms.sections.length})`}
        </button>}
        {activeTab === 'mms' && mmsAccepted && <div style={{ textAlign: 'center', color: 'var(--ok)', fontSize: 12, fontWeight: 700 }}>✓ MMS Aceptado</div>}
        {canFinish && <button className="btn bp" onClick={onAccept} style={{ width: '100%', padding: 12, background: 'linear-gradient(135deg, var(--acc), var(--pk))' }}>Continuar a interClouder</button>}
      </div>
    </div>
  </main>;
}

/* ═══ REPORT MODAL ═══ */
function ReportModal({ targetUser, targetMsg, onSubmit, onClose }) {
  const [reason, setReason] = useState(null);
  const [desc, setDesc] = useState('');
  const [evidence, setEvidence] = useState([]);
  const valid = reason && desc.length >= REPORT_SYSTEM.descMinChars && desc.length <= REPORT_SYSTEM.descMaxChars && desc.split('\n').length >= REPORT_SYSTEM.descMinLines;
  return <div className="modal" onClick={onClose} role="dialog" aria-modal="true"><div className="mcard" onClick={e => e.stopPropagation()} style={{ width: 460, padding: 22, maxHeight: '80vh', overflow: 'auto' }}>
    <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--err)', marginBottom: 10 }}>🚨 Reportar Usuario</h2>
    {targetUser && <div style={{ fontSize: 11, color: 'var(--txm)', marginBottom: 10 }}>Reportando a: <strong style={{ color: 'var(--tx)' }}>{targetUser}</strong></div>}
    <div className="sl" style={{ marginBottom: 6 }}>Motivo del reporte</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
      {REPORT_SYSTEM.reasons.map(r => <button key={r.id} className={`card ${reason === r.id ? '' : ''}`} onClick={() => setReason(r.id)}
        style={{ padding: 8, cursor: 'pointer', textAlign: 'left', border: reason === r.id ? '2px solid var(--acc)' : '1px solid var(--bdr)', background: reason === r.id ? 'var(--bg4)' : 'var(--bg3)' }}>
        <span style={{ fontSize: 14 }}>{r.icon}</span>
        <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2 }}>{r.label}</div>
      </button>)}
    </div>
    <div className="sl" style={{ marginBottom: 4 }}>Descripción ({REPORT_SYSTEM.descMinLines}-{REPORT_SYSTEM.descMaxLines} líneas, {REPORT_SYSTEM.descMinChars}-{REPORT_SYSTEM.descMaxChars} chars)</div>
    <textarea className="li" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe lo ocurrido con detalle..." rows={4}
      style={{ fontSize: 11, width: '100%', resize: 'vertical', marginBottom: 6 }} />
    <div style={{ fontSize: 9, color: desc.length < REPORT_SYSTEM.descMinChars ? 'var(--err)' : 'var(--ok)' }}>{desc.length}/{REPORT_SYSTEM.descMaxChars} chars · {desc.split('\n').length} líneas</div>
    <div style={{ fontSize: 10, color: 'var(--txm)', marginTop: 6, marginBottom: 4 }}>📎 Evidencia opcional (max {REPORT_SYSTEM.maxEvidence} archivos)</div>
    <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
      <button className="btn bs" onClick={() => setEvidence(ev => [...ev, { id: uid(), name: 'screenshot_' + (ev.length + 1) + '.png', type: 'image/png' }].slice(0, REPORT_SYSTEM.maxEvidence))} style={{ fontSize: 10, padding: '4px 8px' }}>+ Adjuntar</button>
      {evidence.map(e => <span key={e.id} style={{ fontSize: 9, background: 'var(--bg4)', padding: '2px 6px', borderRadius: 4 }}>{e.name}</span>)}
    </div>
    <div style={{ padding: 8, background: 'rgba(239,68,68,.08)', borderRadius: 8, marginBottom: 10, border: '1px solid rgba(239,68,68,.2)' }}>
      <div style={{ fontSize: 10, color: 'var(--err)', fontWeight: 700 }}>⚠ Advertencia (MS Art. IV)</div>
      <div style={{ fontSize: 9, color: 'var(--txm)', marginTop: 2 }}>Los reportes falsos son infracción grave. Penalizaciones: Warning + strike, ban temporal, o ban permanente.</div>
    </div>
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="btn bp" disabled={!valid} onClick={() => { if (valid) onSubmit({ reason, desc, evidence, targetUser, targetMsg, timestamp: Date.now(), id: 'rpt_' + uid() }); }} style={{ flex: 1, padding: 10, opacity: valid ? 1 : 0.5 }}>Enviar Reporte</button>
      <button className="btn bs" onClick={onClose} style={{ padding: '10px 16px' }}>Cancelar</button>
    </div>
  </div></div>;
}

/* ═══ FRIEND REQUEST / FRIENDS PANEL ═══ */
function FriendsPanel({ friends, requests, onSendRequest, onAcceptRequest, onRejectRequest, onRemoveFriend, isMinor, notify, friendRequestMode, onGoToSettings }) {
  const [addInput, setAddInput] = useState('');
  return <div style={{ padding: 12 }}>
    <div className="sl" style={{ marginBottom: 8 }}>👥 Amigos ({friends.length})</div>
    {isMinor && <div style={{ padding: 6, background: 'rgba(245,158,11,.08)', borderRadius: 8, marginBottom: 8, fontSize: 10, color: 'var(--wrn)', border: '1px solid rgba(245,158,11,.2)' }}>🛡 CloudKids: las solicitudes de amistad requieren aprobación de un moderador/admin o tutor.</div>}
    <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
      <input className="li" value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="Nombre de usuario..." style={{ flex: 1, fontSize: 11 }} />
      <button className="btn bp" onClick={() => { if (addInput.trim()) { onSendRequest(addInput.trim()); setAddInput(''); } }} style={{ padding: '4px 12px', fontSize: 11 }}>Enviar solicitud</button>
    </div>
    {requests.length > 0 && <><div className="sl" style={{ marginBottom: 4 }}>Solicitudes pendientes ({requests.length})</div>
      {requests.map(r => <div key={r.id} className="card" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Av name={r.from} size={24} /><div><div style={{ fontSize: 11, fontWeight: 700 }}>{r.from}</div><div style={{ fontSize: 9, color: 'var(--txm)' }}>{r.type === 'incoming' ? 'Quiere ser tu amigo' : 'Solicitud enviada'}{r.needsApproval && <span style={{ color: 'var(--wrn)' }}> (esperando aprobación)</span>}</div></div></div>
        {r.type === 'incoming' && <div style={{ display: 'flex', gap: 3 }}><button className="btn bp" onClick={() => onAcceptRequest(r.id)} style={{ padding: '3px 8px', fontSize: 10 }}>✓</button><button className="btn bd" onClick={() => onRejectRequest(r.id)} style={{ padding: '3px 8px', fontSize: 10 }}>✕</button></div>}
        {r.type === 'outgoing' && <span style={{ fontSize: 9, color: 'var(--txm)' }}>Pendiente...</span>}
      </div>)}
    </>}
    {friends.length === 0 && requests.length === 0 && <div style={{ textAlign: 'center', padding: 20, color: 'var(--txg)' }}><div style={{ fontSize: 28, marginBottom: 6 }}>👥</div><p style={{ fontSize: 11 }}>No tienes amigos aún.</p></div>}
    {friends.map(f => <div key={f.id} className="card" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Av name={f.display} size={28} status={f.status} /><div><div style={{ fontSize: 11, fontWeight: 700 }}>{f.display}</div><div style={{ fontSize: 9, color: 'var(--txm)' }}>@{f.username}</div></div></div>
      <button className="btn bd" onClick={() => onRemoveFriend(f.id)} style={{ padding: '3px 8px', fontSize: 10 }}>Eliminar</button>
    </div>)}
    <div style={{ marginTop: 10, fontSize: 10, color: 'var(--txm)' }}>Modo solicitudes: <strong>{friendRequestMode === 'all' ? 'Bloqueadas' : friendRequestMode === 'server_only' ? 'Solo servidores' : 'Abiertas'}</strong> <button className="btn bs" onClick={onGoToSettings} style={{ fontSize: 9, padding: '2px 6px', marginLeft: 4 }}>Cambiar</button></div>
  </div>;
}

/* ═══ ACCOUNT EMULATOR ═══ */
function AccountEmulatorPanel({ targetAccount, onClose }) {
  if (!targetAccount) return null;
  return <div className="modal" onClick={onClose} role="dialog" aria-modal="true"><div className="mcard" onClick={e => e.stopPropagation()} style={{ width: 500, padding: 22, maxHeight: '80vh', overflow: 'auto' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--wrn)' }}>🔍 Emulador de Cuenta (Solo lectura)</h2>
      <button className="btn bs" onClick={onClose} style={{ padding: '3px 8px', fontSize: 11 }}>✕</button>
    </div>
    <div style={{ padding: 8, background: 'rgba(245,158,11,.08)', borderRadius: 8, marginBottom: 10, border: '1px solid rgba(245,158,11,.2)', fontSize: 10, color: 'var(--wrn)' }}>⚠ Modo sandbox — Sin descargas, sin archivos externos, sin modificaciones. Auditado por MMS Art. III.</div>
    <div className="card" style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Av name={targetAccount.display} size={40} />
        <div><div style={{ fontSize: 14, fontWeight: 700 }}>{targetAccount.display}</div><div style={{ fontSize: 10, color: 'var(--txm)' }}>@{targetAccount.username} · {ROLES[targetAccount.role]?.n} · <span style={{ color: 'var(--err)' }}>DESHABILITADA</span></div></div>
      </div>
    </div>
    <div className="sl">Información visible</div>
    {ACCOUNT_EMULATOR.canView.map(v => <div key={v} style={{ fontSize: 11, padding: '4px 8px', background: 'var(--bg3)', borderRadius: 6, marginBottom: 3, display: 'flex', justifyContent: 'space-between' }}>
      <span>{v}</span><span style={{ color: 'var(--ok)', fontSize: 10 }}>✓ Accesible</span>
    </div>)}
    <div className="sl" style={{ marginTop: 8 }}>Restringido</div>
    {ACCOUNT_EMULATOR.cannotView.map(v => <div key={v} style={{ fontSize: 11, padding: '4px 8px', background: 'rgba(239,68,68,.06)', borderRadius: 6, marginBottom: 3, display: 'flex', justifyContent: 'space-between' }}>
      <span>{v}</span><span style={{ color: 'var(--err)', fontSize: 10 }}>✕ Bloqueado</span>
    </div>)}
    <div className="sl" style={{ marginTop: 8 }}>Mensajes del usuario ({(targetAccount.messages || []).length})</div>
    {(targetAccount.messages || [{ text: 'Ejemplo de mensaje del usuario investigado', time: '14:30' }]).map((m, i) => <div key={i} style={{ fontSize: 11, padding: 6, background: 'var(--bg3)', borderRadius: 6, marginBottom: 3, color: 'var(--tx2)' }}>{m.text} <span style={{ fontSize: 9, color: 'var(--txg)' }}>— {m.time}</span></div>)}
    <div className="sl" style={{ marginTop: 8 }}>Amigos ({(targetAccount.friends || ['User1', 'User2']).length})</div>
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{(targetAccount.friends || ['User1', 'User2']).map((f, i) => <span key={i} style={{ fontSize: 10, background: 'var(--bg4)', padding: '2px 8px', borderRadius: 12 }}>{f}</span>)}</div>
  </div></div>;
}

/* ═══ AIRBOUND CONFIRMATION MODAL ═══ */
function AirboundConfirmModal({ requiredTier, onConfirm, onCancel }) {
  const plan = requiredTier === 1 ? PLANS.air : requiredTier === 2 ? PLANS.elite : PLANS.omega;
  return <div className="modal" onClick={onCancel} role="dialog" aria-modal="true"><div className="mcard" onClick={e => e.stopPropagation()} style={{ width: 380, padding: 22, textAlign: 'center' }}>
    <div style={{ fontSize: 36, marginBottom: 8 }}>{plan.i}</div>
    <h2 style={{ fontSize: 16, fontWeight: 800, color: plan.c, marginBottom: 6 }}>Requiere {plan.n}</h2>
    <p style={{ fontSize: 11, color: 'var(--txm)', marginBottom: 14 }}>Esta función requiere una suscripción {plan.n}. Serás redirigido a Ajustes {'>'} Airbound.</p>
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="btn bp" onClick={onConfirm} style={{ flex: 1, padding: 10, fontSize: 12 }}>Ir a Airbound</button>
      <button className="btn bs" onClick={onCancel} style={{ padding: '10px 16px', fontSize: 12 }}>Cancelar</button>
    </div>
  </div></div>;
}

/* ═══ PARTY BADGE QUIZ ═══ */
function PartyQuiz({ onComplete, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const q = PARTY_SYSTEM.quiz[step];

  const answer = (score) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);
    if (step + 1 >= PARTY_SYSTEM.quiz.length) {
      const badge = PARTY_SYSTEM.getResult(newAnswers);
      setResult(badge);
    } else {
      setStep(step + 1);
    }
  };

  if (result) {
    const info = PARTY_SYSTEM.descriptions[result];
    return <div className="modal" onClick={onClose} role="dialog" aria-modal="true"><div className="mcard" onClick={e => e.stopPropagation()} style={{ width: 420, padding: 26, textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 8 }}>{info.icon}</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: info.color, marginBottom: 4 }}>{info.name}</h2>
      <p style={{ fontSize: 12, color: 'var(--txm)', marginBottom: 8 }}>{info.tagline}</p>
      <div className="card" style={{ textAlign: 'left', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, color: 'var(--tx)' }}>Tus eventos:</div>
        <div style={{ fontSize: 11, color: 'var(--tx2)' }}>{info.events}</div>
        <div style={{ fontSize: 10, color: 'var(--txm)', marginTop: 6, fontStyle: 'italic' }}>{info.vibe}</div>
      </div>
      <div style={{ padding: 8, background: 'rgba(34,197,94,.08)', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(34,197,94,.2)' }}>
        <div style={{ fontSize: 10, color: 'var(--ok)' }}>🎊 También recibes el badge principal: <strong>PartyEngager</strong></div>
        <div style={{ fontSize: 9, color: 'var(--txm)', marginTop: 2 }}>Todos los sub-badges son igualitarios — ni más ni menos perks.</div>
      </div>
      <button className="btn bp" onClick={() => onComplete(result)} style={{ width: '100%', padding: 12, background: `linear-gradient(135deg, ${info.color}, var(--acc))` }}>Aceptar mi badge: {info.name}</button>
    </div></div>;
  }

  return <div className="modal" onClick={onClose} role="dialog" aria-modal="true"><div className="mcard" onClick={e => e.stopPropagation()} style={{ width: 440, padding: 24 }}>
    <div style={{ textAlign: 'center', marginBottom: 14 }}>
      <div style={{ fontSize: 32 }}>🎊</div>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--acl)', marginBottom: 2 }}>Encuesta PartyEngager</h2>
      <p style={{ fontSize: 10, color: 'var(--txm)' }}>Descubre tu Party Badge — {PARTY_SYSTEM.quiz.length} preguntas rápidas</p>
    </div>
    <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>{PARTY_SYSTEM.quiz.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < step ? 'var(--ok)' : i === step ? 'var(--acc)' : 'var(--bdr)' }} />)}</div>
    <div style={{ fontSize: 10, color: 'var(--txm)', marginBottom: 6 }}>Pregunta {step + 1}/{PARTY_SYSTEM.quiz.length}</div>
    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, lineHeight: 1.5 }}>{q.q}</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {q.o.map((o, i) => <button key={i} className="btn bs" onClick={() => answer(o.s)} style={{ width: '100%', textAlign: 'left', padding: 12, fontSize: 12 }}>{o.t}</button>)}
    </div>
  </div></div>;
}

/* ═══ SUBSCRIPTION PANEL (in settings) ═══ */
function SubscriptionPanel({ user, onSubscribe, isMinor }) {
  const [billing, setBilling] = useState('monthly');
  const currentTier = getUserTier(user);
  if (isMinor) return <div style={{ padding: 8, background: 'rgba(239,68,68,.08)', borderRadius: 8, fontSize: 11, color: 'var(--err)', border: '1px solid rgba(239,68,68,.2)' }}>🛡 CloudKids: las compras requieren autorización de un tutor/moderador verificado.</div>;
  return <div>
    <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4, color: 'var(--acl)' }}>🚀 Airbound</h3>
    <p style={{ fontSize: 10, color: 'var(--txm)', marginBottom: 8 }}>Desbloquea funciones premium, fuentes y más uploads</p>
    <div style={{ display: 'flex', gap: 4, marginBottom: 10, justifyContent: 'center' }}>{['monthly', 'annual'].map(b => <button key={b} className={`tab ${billing === b ? 'on' : 'off'}`} onClick={() => setBilling(b)} style={{ textTransform: 'capitalize' }}>{b}{b === 'annual' && <span style={{ fontSize: 9, color: 'var(--ok)' }}> ~17% off</span>}</button>)}</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>{Object.entries(PLANS).map(([key, plan]) => <div key={key} className={`sub-card ${currentTier === plan.tier ? 'active' : ''}`} onClick={() => onSubscribe(key, billing)}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{plan.i}</div>
      <div style={{ fontSize: 12, fontWeight: 800, color: plan.c }}>{plan.n}</div>
      <div className="sub-price">${billing === 'monthly' ? plan.monthly : plan.annual}</div>
      <div className="sub-period">/{billing === 'monthly' ? 'mes' : 'año'}</div>
      <div style={{ margin: '6px 0', borderTop: '1px solid var(--bdr)', paddingTop: 6 }}>{plan.perks.slice(0, 4).map((p, i) => <div key={i} style={{ fontSize: 9, color: 'var(--tx2)', padding: '1px 0' }}>✓ {p}</div>)}</div>
      {currentTier === plan.tier ? <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ok)' }}>✓ Actual</div> : currentTier < plan.tier ? <button className="btn bp" style={{ width: '100%', padding: 5, fontSize: 10 }}>Suscribirse</button> : null}
    </div>)}</div>
  </div>;
}

/* ═══ AUTH SCREENS ═══ */
function AgeGate({ onPass, onSkipCloudKids }) {
  const [step, setStep] = useState(0);
  const [locale, setLocale] = useState('intl');
  const [questions, setQuestions] = useState([]);
  const [cur, setCur] = useState(0);
  const [time, setTime] = useState(CKIDS.timeLimit);
  const [fails, setFails] = useState(0);
  const [failedQ, setFailedQ] = useState(null);

  useEffect(() => {
    const loc = CKIDS.getLocale();
    setLocale(loc);
  }, []);

  const start = () => {
    const qs = CKIDS.getQuestions(locale);
    setQuestions(qs);
    setCur(0);
    setTime(CKIDS.timeLimit);
    setFailedQ(null);
    setStep(1);
  };

  useEffect(() => {
    if (step !== 1) return;
    const t = setInterval(() => setTime(prev => {
      if (prev <= 1) {
        clearInterval(t);
        setFails(f => f + 1);
        setStep(4);
        return 0;
      }
      return prev - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [step]);

  const answer = (idx) => {
    const currentQ = questions[cur];
    if (!currentQ) return;
    if (idx !== currentQ.a) {
      setFailedQ(currentQ);
      setFails(f => f + 1);
      setStep(3);
      return;
    }
    if (cur + 1 >= questions.length) {
      setStep(2);
      setTimeout(() => onPass(), 1200);
    } else {
      setCur(cur + 1);
    }
  };

  const localeNames = { es: '🇪🇸 Español', en: '🇺🇸 English', fr: '🇫🇷 Français', pt: '🇵🇹 Português', de: '🇩🇪 Deutsch', intl: '🌐 International' };

  /* Step 0: Welcome */
  if (step === 0) return <main className="age-gate" role="main" aria-label="Age verification">
    <div style={{ width: 420, padding: 30, borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--bdr)', textAlign: 'center' }}>
      <div style={{ fontSize: 40 }} aria-hidden="true">🔐</div>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--acl)', margin: '10px 0 4px' }}>Verificación de Edad</h1>
      <p style={{ fontSize: 12, color: 'var(--txm)', marginBottom: 16 }}>Responde {CKIDS.questionCount} preguntas correctamente para verificar que eres mayor de 18 años.</p>

      <div className="card" style={{ textAlign: 'left', marginBottom: 14, fontSize: 11, color: 'var(--txm)', lineHeight: 1.8 }}>
        <div>✓ {CKIDS.questionCount} preguntas de vida cotidiana</div>
        <div>✓ {Math.floor(CKIDS.timeLimit / 60)}:{(CKIDS.timeLimit % 60).toString().padStart(2, '0')} minutos de tiempo</div>
        <div style={{ color: 'var(--err)', fontWeight: 700 }}>✗ Modo estricto: si fallas una sola pregunta, se reinicia todo</div>
        <div style={{ marginTop: 6 }}>📍 Preguntas adaptadas a tu región: <strong style={{ color: 'var(--acl)' }}>{localeNames[locale] || locale}</strong></div>
        {fails > 0 && <div style={{ color: 'var(--wrn)', marginTop: 4 }}>Intentos fallidos: {fails}</div>}
      </div>

      <div style={{ display: 'flex', gap: 3, marginBottom: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {Object.entries(localeNames).map(([k, v]) => <button key={k} className={`tab ${locale === k ? 'on' : 'off'}`} onClick={() => setLocale(k)} style={{ fontSize: 10 }}>{v}</button>)}
      </div>

      <button className="btn bp" onClick={start} style={{ width: '100%', padding: 12, fontSize: 13 }}>Comenzar Verificación</button>

      <div style={{ marginTop: 14, borderTop: '1px solid var(--bdr)', paddingTop: 12 }}>
        <p style={{ fontSize: 10, color: 'var(--txm)', marginBottom: 8 }}>¿Eres menor de 18 años? Puedes usar interClouder en modo <strong style={{ color: 'var(--wrn)' }}>CloudKids</strong> con restricciones de seguridad.</p>
        <button className="btn bs" onClick={onSkipCloudKids} style={{ width: '100%', padding: 10, fontSize: 11, border: '1px dashed var(--wrn)' }}>
          ☁ Omitir verificación y entrar como CloudKids
        </button>
      </div>
    </div>
  </main>;

  /* Step 1: Questions */
  if (step === 1) {
    const currentQ = questions[cur];
    if (!currentQ) { setStep(0); return null; }
    return <main className="age-gate" role="main">
      <div style={{ width: 460, padding: 26, borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--bdr)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--txm)' }}>Pregunta {cur + 1} de {questions.length}</span>
          <span aria-live="polite" style={{ fontSize: 13, fontWeight: 700, color: time < 20 ? 'var(--err)' : 'var(--wrn)', fontFamily: 'monospace' }}>
            {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
          {questions.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < cur ? 'var(--ok)' : i === cur ? 'var(--acc)' : 'var(--bdr)', transition: 'background .2s' }} />)}
        </div>

        <div style={{ padding: 4, background: 'rgba(239,68,68,.06)', borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>
          <span style={{ fontSize: 9, color: 'var(--err)' }}>⚠ Modo estricto — una respuesta incorrecta reinicia todo</span>
        </div>

        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, lineHeight: 1.6, color: 'var(--tx)' }}>{currentQ.q}</h2>

        <div role="radiogroup" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {currentQ.o.map((opt, i) => <button key={i} className="btn bs" onClick={() => answer(i)}
            style={{ width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: 12, borderRadius: 10, transition: 'all .15s' }}
            onMouseEnter={e => e.target.style.background = 'var(--bg4)'}
            onMouseLeave={e => e.target.style.background = ''}
          >{opt}</button>)}
        </div>

        <div style={{ marginTop: 10, fontSize: 9, color: 'var(--txg)', textAlign: 'center' }}>📍 {localeNames[locale] || locale}</div>
      </div>
    </main>;
  }

  /* Step 2: Success */
  if (step === 2) return <main className="age-gate">
    <div style={{ textAlign: 'center', padding: 50, background: 'var(--bg2)', borderRadius: 20, border: '1px solid var(--bdr)', width: 380 }}>
      <div style={{ fontSize: 56 }}>✅</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--ok)', marginTop: 10 }}>¡Verificado!</h2>
      <p style={{ fontSize: 12, color: 'var(--txm)', marginTop: 6 }}>Has completado las {CKIDS.questionCount} preguntas correctamente.</p>
      <p style={{ fontSize: 10, color: 'var(--txg)', marginTop: 8 }}>Redirigiendo...</p>
    </div>
  </main>;

  /* Step 3: Failed a question (strict) */
  if (step === 3) return <main className="age-gate">
    <div style={{ width: 420, padding: 30, borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--bdr)', textAlign: 'center' }}>
      <div style={{ fontSize: 44 }}>❌</div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--err)', marginTop: 6 }}>Respuesta Incorrecta</h2>
      <p style={{ fontSize: 12, color: 'var(--txm)', margin: '8px 0 12px' }}>Modo estricto: una respuesta incorrecta reinicia toda la verificación.</p>
      {failedQ && <div className="card" style={{ textAlign: 'left', marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--txm)', marginBottom: 4 }}>Pregunta fallida:</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', marginBottom: 6 }}>{failedQ.q}</div>
        <div style={{ fontSize: 11, color: 'var(--ok)' }}>Respuesta correcta: {failedQ.o[failedQ.a]}</div>
      </div>}
      <div style={{ fontSize: 10, color: 'var(--wrn)', marginBottom: 12 }}>Intentos fallidos totales: {fails}</div>
      <button className="btn bp" onClick={start} style={{ width: '100%', padding: 12, marginBottom: 8 }}>Intentar de Nuevo</button>
      <button className="btn bs" onClick={onSkipCloudKids} style={{ width: '100%', padding: 10, fontSize: 11, border: '1px dashed var(--wrn)' }}>
        ☁ Entrar como CloudKids en su lugar
      </button>
    </div>
  </main>;

  /* Step 4: Time expired */
  return <main className="age-gate">
    <div style={{ width: 400, padding: 30, borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--bdr)', textAlign: 'center' }}>
      <div style={{ fontSize: 44 }}>⏰</div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--wrn)', marginTop: 6 }}>Tiempo Agotado</h2>
      <p style={{ fontSize: 12, color: 'var(--txm)', margin: '8px 0 14px' }}>Se acabó el tiempo. Las preguntas se generarán de nuevo.</p>
      <button className="btn bp" onClick={start} style={{ width: '100%', padding: 12, marginBottom: 8 }}>Intentar de Nuevo</button>
      <button className="btn bs" onClick={onSkipCloudKids} style={{ width: '100%', padding: 10, fontSize: 11, border: '1px dashed var(--wrn)' }}>
        ☁ Entrar como CloudKids en su lugar
      </button>
    </div>
  </main>;
}

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); const [u, setU] = useState(''); const [d, setD] = useState('');
  const [e, setE] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('');
  const nameRef = useRef(null);
  useEffect(() => { if (nameRef.current) nameRef.current.focus(); }, [mode]);
  const go = () => {
    if (mode === 'register') { if (!u.trim() || !d.trim() || !p.trim()) { setErr('All fields required'); return; } }
    else { if (!u.trim() || !p.trim()) { setErr('Username & password required'); return; } }
    onLogin({ id: 'me', username: u.trim(), display: d.trim() || u.trim(), email: e, avatar: null, banner: null, badges: ['founder'], role: 'ceo', status: 'online', xp: 0, msgs: 0, strikes: 0, premium: null, isMe: true, censored: false, created: Date.now(), password: p, gradient: null, isMinor: false, friends: [], friendRequests: [], disabledAccounts: [] });
  };
  return <main className="login-bg" role="main"><div style={{ width: 380, padding: 30, borderRadius: 20, background: 'var(--bg2)', border: '1px solid var(--bdr)' }}><div style={{ textAlign: 'center', marginBottom: 18 }}><div style={{ fontSize: 36 }}>⬡</div><h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--acl)' }}>interClouder</h1><p style={{ fontSize: 11, color: 'var(--txg)' }}>Secure Social Network</p></div><div style={{ display: 'flex', gap: 4, marginBottom: 12 }} role="tablist">{['login', 'register'].map(m => <button key={m} role="tab" aria-selected={mode === m} className={`tab ${mode === m ? 'on' : 'off'}`} onClick={() => { setMode(m); setErr(''); }} style={{ flex: 1, textTransform: 'capitalize' }}>{m}</button>)}</div>{err && <div role="alert" style={{ padding: 6, borderRadius: 7, background: 'rgba(239,68,68,.1)', color: 'var(--err)', fontSize: 12, marginBottom: 8 }}>{err}</div>}<form onSubmit={ev => { ev.preventDefault(); go(); }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}><input id="login-user" ref={nameRef} className="li" placeholder="Username" value={u} onChange={ev => setU(ev.target.value)} autoComplete="username" required />{mode === 'register' && <><input className="li" placeholder="Display Name" value={d} onChange={ev => setD(ev.target.value)} /><input className="li" placeholder="Email" value={e} onChange={ev => setE(ev.target.value)} type="email" /></>}<input className="li" placeholder="Password" value={p} onChange={ev => setP(ev.target.value)} type="password" required /><button type="submit" className="btn bp" style={{ width: '100%', padding: 10 }}>{mode === 'register' ? 'Create Account' : 'Login'}</button></form></div></main>;
}

/* ═══ MODALS ═══ */
function Splash({ update, onClose }) { return <div className="splash" onClick={onClose} role="dialog" aria-modal="true"><div className="splash-card" onClick={e => e.stopPropagation()}><div style={{ fontSize: 48, marginBottom: 10 }}>🚀</div><h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--acl)', marginBottom: 14 }}>{update.title}</h1><ul style={{ listStyle: 'none', padding: 0 }}>{update.changes.map((c, i) => <li key={i} style={{ fontSize: 12, color: 'var(--tx2)', padding: '3px 0', borderBottom: '1px solid var(--bdr)' }}>{c}</li>)}</ul><button className="btn bp" onClick={onClose} style={{ marginTop: 16, width: '100%', padding: 10 }}>{"Let's Go!"}</button></div></div>; }

/* ═══ TRASH PANEL ═══ */
function TrashPanel({ trash, onRestore, onPermanentDelete }) {
  const now = Date.now();
  return <div><div className="sl">🗑 Trash ({trash.length})</div><p style={{ fontSize: 10, color: 'var(--txm)', marginBottom: 8 }}>30 días para restaurar.</p>
    {trash.length === 0 && <p style={{ fontSize: 11, color: 'var(--txg)', textAlign: 'center', padding: 20 }}>Vacío</p>}
    {trash.map(t => { const daysLeft = Math.max(0, 30 - Math.floor((now - t.deletedAt) / 86400000));
      return <div key={t.id} className="trash-item"><div style={{ flex: 1, minWidth: 0 }}><div className="trash-msg">{t.text || '(file)'}</div><div className="trash-meta">por {t.user} · {new Date(t.deletedAt).toLocaleDateString()}</div></div><div className="trash-days">{daysLeft}d</div><div style={{ display: 'flex', gap: 3, marginLeft: 8 }}><button className="btn bs" onClick={() => onRestore(t.id)} style={{ padding: '3px 8px', fontSize: 10 }}>Restaurar</button><button className="btn bd" onClick={() => onPermanentDelete(t.id)} style={{ padding: '3px 8px', fontSize: 10 }}>Eliminar</button></div></div>; })}
  </div>;
}

/* ═══ TERMINAL ═══ */
function TerminalPanel({ notify, user, allUsers, onEditUser }) {
  const [cmd, setCmd] = useState(''); const [logs, setLogs] = useState(['[System] Terminal ready. Type /help']); const logRef = useRef(null);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);
  const run = () => { if (!cmd.trim()) return; const c = cmd.trim(); setCmd(''); const args = c.split(' '); const command = args[0].toLowerCase();
    const log = m => setLogs(p => [...p, '[' + new Date().toLocaleTimeString() + '] ' + m]); log('> ' + c);
    if (command === '/help') log('Commands: /help /stats /users /grant /xp /strike /inex /stealth /emulate');
    else if (command === '/stats') log('Users: ' + (1 + allUsers.length) + ' | XP: ' + (user.xp || 0));
    else if (command === '/users') { log('Owner: ' + user.display); allUsers.forEach(u => log('  ' + u.display + ' [' + u.role + ']')); }
    else if (command === '/inex') { const code = args.slice(1).join(' '); if (!code) { log('Usage: /inex <code>'); return; } try { const r = runInex(code); r.output.forEach(o => log('  ' + o.args.join(' '))); if (r.errors.length) r.errors.forEach(e => log('  ✗ ' + e.message)); else log('  ✓ OK (' + r.elapsed + 'ms)'); } catch (e) { log('  ✗ ' + e.message); } }
    else log('Unknown. /help');
  };
  return <div role="region" aria-label="Terminal"><div ref={logRef} style={{ background: '#0a0a0a', borderRadius: 10, padding: 10, height: 250, overflowY: 'auto', fontFamily: 'var(--mono)', fontSize: 11, marginBottom: 8 }} role="log" aria-live="polite">{logs.map((l, i) => <div key={i} style={{ color: l.includes('>') ? 'var(--acl)' : l.includes('[System]') ? 'var(--ok)' : 'var(--tx2)', padding: '1px 0' }}>{l}</div>)}</div><div style={{ display: 'flex', gap: 4 }}><input id="term-in" className="li" value={cmd} onChange={e => setCmd(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') run(); }} placeholder="/command..." style={{ fontFamily: 'var(--mono)' }} /><button className="btn bp" onClick={run}>Run</button></div></div>;
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null); const [theme, setTheme] = useState('dark');
  const [srvs, setSrvs] = useState([]); const [aS, setAS] = useState(null); const [aCh, setACh] = useState(null);
  const [testUsers, setTestUsers] = useState([]); const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [ageOK, setAgeOK] = useState(false); const [view, setView] = useState('server');
  const [cloudKidsMode, setCloudKidsMode] = useState(false);
  const [showCreate, setShowCreate] = useState(false); const [notif, setNotif] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false); const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState(''); const [trash, setTrash] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false); const [showSticker, setShowSticker] = useState(false);
  const [showRxPicker, setShowRxPicker] = useState(null); const [showIdeInsert, setShowIdeInsert] = useState(false);
  /* v6.3 new state */
  const [msAccepted, setMsAccepted] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [showReport, setShowReport] = useState(null);
  const [stealthMode, setStealthMode] = useState(false);
  const [showEmulator, setShowEmulator] = useState(null);
  const [airboundConfirm, setAirboundConfirm] = useState(null);
  const [modAlerts, setModAlerts] = useState([]);
  const [showMS, setShowMS] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  const [showPartyQuiz, setShowPartyQuiz] = useState(false);

  useEffect(() => { setUser(SS.l('user')); setTheme(SS.l('theme', 'dark')); setSrvs(SS.l('srvs', [])); setAS(SS.l('aS')); setACh(SS.l('aCh')); setTestUsers(SS.l('tU', [])); setSettings(SS.l('settings', { ...DEFAULT_SETTINGS })); setAgeOK(SS.l('ageOK', false)); setCloudKidsMode(SS.l('ckMode', false)); setTrash(SS.l('trash', [])); setShowSplash(!SS.l('splash63')); setMsAccepted(SS.l('msOK', false)); setFriends(SS.l('friends', [])); setFriendRequests(SS.l('fReqs', [])); setReports(SS.l('reports', [])); setMounted(true); }, []);
  useEffect(() => { if (mounted && user) SS.s('user', user); }, [user, mounted]);
  useEffect(() => { if (mounted) { SS.s('theme', theme); document.documentElement.setAttribute('data-theme', theme); } }, [theme, mounted]);
  useEffect(() => { if (mounted) SS.s('srvs', srvs); }, [srvs, mounted]);
  useEffect(() => { if (mounted) SS.s('aS', aS); }, [aS, mounted]);
  useEffect(() => { if (mounted) SS.s('aCh', aCh); }, [aCh, mounted]);
  useEffect(() => { if (mounted) SS.s('tU', testUsers); }, [testUsers, mounted]);
  useEffect(() => { if (mounted) SS.s('settings', settings); }, [settings, mounted]);
  useEffect(() => { if (mounted) SS.s('trash', trash); }, [trash, mounted]);
  useEffect(() => { if (mounted) SS.s('friends', friends); }, [friends, mounted]);
  useEffect(() => { if (mounted) SS.s('fReqs', friendRequests); }, [friendRequests, mounted]);
  useEffect(() => { if (mounted) SS.s('reports', reports); }, [reports, mounted]);
  useEffect(() => { if (!mounted) return; const fs = settings?.access?.fontSize || 14; document.documentElement.style.fontSize = fs + 'px'; if (settings?.access?.reducedMotion) document.documentElement.setAttribute('data-reduced-motion', 'true'); else document.documentElement.removeAttribute('data-reduced-motion'); }, [settings, mounted]);
  useEffect(() => { const h = e => { if (e.key === 'Escape') { setShowCreate(false); setShowEmoji(false); setShowSticker(false); setShowRxPicker(null); setEditingMsg(null); setShowIdeInsert(false); setShowReport(null); setShowEmulator(null); setAirboundConfirm(null); setShowMS(false); setShowPartyQuiz(false); } if (e.ctrlKey && e.key === ',') { e.preventDefault(); setView('settings'); } if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); setView('inex'); } if (e.ctrlKey && e.key === 'e' && !e.shiftKey) { e.preventDefault(); setShowEmoji(v => !v); } if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); setShowIdeInsert(v => !v); } if (e.ctrlKey && e.shiftKey && e.key === 'S') { e.preventDefault(); if (isModPlus(user)) setStealthMode(v => !v); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [user]);

  const nf = useCallback(t => { setNotif(t); announce(t); setTimeout(() => setNotif(null), 2500); }, []);
  const editUser = useCallback((id, changes) => { if (id === 'me') setUser(u => ({ ...u, ...changes })); else setTestUsers(us => us.map(u => u.id === id ? { ...u, ...changes } : u)); }, []);
  const createServer = useCallback(srv => { setSrvs(s => [...s, srv]); setAS(srv.id); setACh(srv.channels[0]?.id || null); }, []);

  const sendMessage = useCallback((text, file, sticker) => {
    if (!aS || !aCh || stealthMode) return;
    const msg = { id: 'm' + uid(), uid: 'me', user: user.display, text: text || null, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), timestamp: Date.now(), color: ROLES[user.role]?.c, reactions: {}, file: file || null, tag: null, edited: false, sticker: sticker || null };
    setSrvs(ss => ss.map(s => { if (s.id !== aS) return s; return { ...s, channels: s.channels.map(c => { if (c.id !== aCh) return c; return { ...c, msgs: [...(c.msgs || []), msg] }; }) }; }));
    setUser(u => ({ ...u, msgs: (u.msgs || 0) + 1, xp: (u.xp || 0) + 5 }));
  }, [aS, aCh, user, stealthMode]);

  const editMessage = useCallback((msgId, newText) => { setSrvs(ss => ss.map(s => ({ ...s, channels: s.channels.map(c => ({ ...c, msgs: (c.msgs || []).map(m => m.id === msgId ? { ...m, text: newText, edited: true } : m) })) }))); setEditingMsg(null); setEditText(''); nf('Mensaje editado'); }, [nf]);
  const deleteMessage = useCallback(msgId => { let del = null; setSrvs(ss => ss.map(s => ({ ...s, channels: s.channels.map(c => { const msg = (c.msgs || []).find(m => m.id === msgId); if (msg) del = { ...msg, deletedAt: Date.now(), channelId: c.id, serverId: s.id }; return { ...c, msgs: (c.msgs || []).filter(m => m.id !== msgId) }; }) }))); if (del) { setTrash(t => [...t, del].slice(-MSG_TRASH.maxPerServer)); nf('Movido a papelera (30d)'); } }, [nf]);
  const restoreMessage = useCallback(trashId => { const msg = trash.find(t => t.id === trashId); if (!msg) return; setSrvs(ss => ss.map(s => { if (s.id !== msg.serverId) return s; return { ...s, channels: s.channels.map(c => { if (c.id !== msg.channelId) return c; const { deletedAt, channelId, serverId, ...restored } = msg; return { ...c, msgs: [...(c.msgs || []), restored] }; }) }; })); setTrash(t => t.filter(x => x.id !== trashId)); nf('Restaurado'); }, [trash, nf]);
  const permanentDelete = useCallback(trashId => { setTrash(t => t.filter(x => x.id !== trashId)); nf('Eliminado permanentemente'); }, [nf]);
  const toggleReaction = useCallback((msgId, emoji) => { if (stealthMode) return; setSrvs(ss => ss.map(s => ({ ...s, channels: s.channels.map(c => ({ ...c, msgs: (c.msgs || []).map(m => { if (m.id !== msgId) return m; const rx = { ...(m.reactions || {}) }; if (!rx[emoji]) rx[emoji] = { count: 0, users: [] }; const hasMe = rx[emoji].users.includes('me'); if (hasMe) { rx[emoji] = { count: rx[emoji].count - 1, users: rx[emoji].users.filter(u => u !== 'me') }; if (rx[emoji].count <= 0) delete rx[emoji]; } else { rx[emoji] = { count: rx[emoji].count + 1, users: [...rx[emoji].users, 'me'] }; } return { ...m, reactions: rx }; }) })) }))); }, [stealthMode]);

  /* Airbound: moved to settings, with confirmation */
  const handleSubscribe = useCallback((plan, billing) => {
    if (user?.isMinor) { nf('CloudKids: compras no permitidas sin autorización'); return; }
    setUser(u => ({ ...u, premium: plan, badges: [...new Set([...(u.badges || []), 'nitro'])] }));
    setSettings(s => ({ ...s, subscription: { plan, billing, autoRenew: true } }));
    nf('Suscrito a ' + PLANS[plan].n + '!');
  }, [nf, user]);

  const requireAirbound = useCallback((tier) => {
    const current = getUserTier(user);
    if (current >= tier) return true;
    setAirboundConfirm(tier);
    return false;
  }, [user]);

  /* Friends */
  const sendFriendRequest = useCallback((username) => {
    if (user?.isMinor) { nf('CloudKids: solicitud pendiente de aprobación de un superior'); setFriendRequests(r => [...r, { id: 'fr_' + uid(), from: user.display, to: username, type: 'outgoing', needsApproval: true, timestamp: Date.now() }]); return; }
    const mode = settings?.privacy?.friendRequests || 'none';
    setFriendRequests(r => [...r, { id: 'fr_' + uid(), from: user.display, to: username, type: 'outgoing', needsApproval: false, timestamp: Date.now() }]);
    nf('Solicitud enviada a ' + username);
    setTimeout(() => { setFriendRequests(r => [...r, { id: 'fr_' + uid(), from: username, to: user.display, type: 'incoming', needsApproval: false, timestamp: Date.now() }]); }, 1500);
  }, [user, settings, nf]);
  const acceptFriendRequest = useCallback((reqId) => { const req = friendRequests.find(r => r.id === reqId); if (!req) return; setFriends(f => [...f, { id: 'f_' + uid(), username: req.from, display: req.from, status: 'online', addedAt: Date.now() }]); setFriendRequests(r => r.filter(x => x.id !== reqId)); nf(req.from + ' es ahora tu amigo!'); }, [friendRequests, nf]);
  const rejectFriendRequest = useCallback((reqId) => { setFriendRequests(r => r.filter(x => x.id !== reqId)); nf('Solicitud rechazada'); }, [nf]);
  const removeFriend = useCallback((friendId) => { setFriends(f => f.filter(x => x.id !== friendId)); nf('Amigo eliminado'); }, [nf]);

  /* Reports */
  const submitReport = useCallback((report) => {
    setReports(r => [...r, report]);
    setShowReport(null);
    nf('Reporte enviado');
    if (isModPlus(user)) { setModAlerts(a => [...a, { id: 'alert_' + uid(), type: 'report', report, timestamp: Date.now(), read: false }]); }
    setTimeout(() => { setModAlerts(a => [...a, { id: 'alert_' + uid(), type: 'report', report, timestamp: Date.now(), read: false }]); }, 500);
  }, [nf, user]);

  /* Party Badge */
  const completePartyQuiz = useCallback((badge) => {
    setUser(u => ({ ...u, badges: [...new Set([...(u.badges || []), 'party_engager', badge])] }));
    setShowPartyQuiz(false);
    nf('🎊 Badge obtenido: ' + BADGES[badge]?.l + '!');
  }, [nf]);

  const addLogicBoard = useCallback(board => { setSrvs(ss => ss.map(s => { if (s.id !== aS) return s; return { ...s, logicBoards: [...(s.logicBoards || []), board] }; })); nf('Logic Board creado'); }, [aS, nf]);
  const deleteLogicBoard = useCallback(boardId => { setSrvs(ss => ss.map(s => ({ ...s, logicBoards: (s.logicBoards || []).filter(b => b.id !== boardId) }))); nf('Logic Board eliminado'); }, [nf]);
  const addCustomEmoji = useCallback((emoji, name) => { if (!aS) return; setSrvs(ss => ss.map(s => { if (s.id !== aS) return s; const cur = s.customEmojis || []; const lvl = SERVER_EMOJI_LIMITS.getServerLevel((s.members || []).length); if (cur.length >= lvl.emojis) { nf('Límite de emojis alcanzado'); return s; } return { ...s, customEmojis: [...cur, { id: 'ce_' + uid(), e: emoji, n: name, addedBy: 'me', addedAt: Date.now() }] }; })); nf('Emoji personalizado añadido!'); }, [aS, nf]);

  if (!mounted) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0a14' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: 42 }}>⬡</div><h1 style={{ fontSize: 22, fontWeight: 800, color: '#C084FC', marginTop: 14 }}>interClouder</h1><p style={{ fontSize: 10, color: '#4a4460', marginTop: 6 }}>Loading...</p></div></div>;
  if (!ageOK) return <AgeGate onPass={() => { setAgeOK(true); setCloudKidsMode(false); SS.s('ageOK', true); SS.s('ckMode', false); }} onSkipCloudKids={() => { setAgeOK(true); setCloudKidsMode(true); SS.s('ageOK', true); SS.s('ckMode', true); nf('☁ Modo CloudKids activado — restricciones de seguridad aplicadas'); }} />;
  if (!user) return <LoginScreen onLogin={u => { const finalUser = cloudKidsMode ? { ...u, isMinor: true, badges: [...(u.badges || []), 'cloud_kids'] } : u; setUser(finalUser); nf(cloudKidsMode ? '☁ Bienvenido, ' + finalUser.display + '! (CloudKids)' : 'Bienvenido, ' + finalUser.display + '!'); }} />;
  if (!msAccepted) return <MandamentScreen ms={MANDAMENT_SYSTEM} mms={MODERATION_MANDAMENT} isMod={isModPlus(user)} onAccept={() => { setMsAccepted(true); SS.s('msOK', true); }} />;
  if (showSplash) return <Splash update={UPDATES[0]} onClose={() => { setShowSplash(false); SS.s('splash63', true); }} />;

  const srv = srvs.find(s => s.id === aS); const ch = srv?.channels?.find(c => c.id === aCh); const msgs = ch?.msgs || [];
  const userTier = getUserTier(user); const fileLimit = getFileLimit(user);
  const scrambleMode = settings?.chat?.scrambleMode || 'blur';
  const canEditAny = hasPermission(user, 'edit_any'); const canDeleteAny = hasPermission(user, 'delete_any');
  const canViewTrash = hasPermission(user, 'view_trash');
  const canStealth = hasPermission(user, 'stealth_view');
  const canEmulate = hasPermission(user, 'emulate_account');
  const canViewReports = hasPermission(user, 'view_reports');
  const tierKey = user.premium || 'free';
  const unreadAlerts = modAlerts.filter(a => !a.read).length;

  const navItems = [{ id: 'server', icon: '💬', label: 'Servers' }, { id: 'friends', icon: '👥', label: 'Amigos' }, { id: 'mod', icon: '🛡', label: 'Moderación' }, { id: 'admin', icon: '👑', label: 'Admin' }, { id: 'inex', icon: '⟨/⟩', label: 'INEX IDE' }, { id: 'plugins', icon: '🧩', label: 'Plugins' }, { id: 'settings', icon: '⚙', label: 'Ajustes' }];

  return (
    <div className="app" id="main-content">
      <Notify text={notif} />
      {/* STEALTH INDICATOR */}
      {stealthMode && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999, background: 'rgba(107,114,128,.9)', padding: '3px 0', textAlign: 'center', fontSize: 10, color: '#fff', fontWeight: 700 }}>👁 MODO STEALTH ACTIVO — Chat deshabilitado, presencia oculta <button onClick={() => setStealthMode(false)} style={{ marginLeft: 8, background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', padding: '1px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>Desactivar</button></div>}
      {/* MOD ALERT */}
      {modAlerts.length > 0 && !modAlerts[modAlerts.length - 1].read && <div style={{ position: 'fixed', top: stealthMode ? 28 : 8, right: 8, zIndex: 998, background: 'var(--bg2)', border: '2px solid var(--err)', borderRadius: 12, padding: 12, maxWidth: 300, boxShadow: '0 4px 20px rgba(0,0,0,.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--err)' }}>🚨 Nuevo Reporte</span><button onClick={() => setModAlerts(a => a.map(x => ({ ...x, read: true })))} style={{ background: 'none', border: 'none', color: 'var(--txm)', cursor: 'pointer', fontSize: 14 }}>✕</button></div>
        <div style={{ fontSize: 10, color: 'var(--tx2)' }}>De: {modAlerts[modAlerts.length - 1].report?.targetUser || 'Unknown'}</div>
        <div style={{ fontSize: 10, color: 'var(--txm)' }}>Razón: {REPORT_SYSTEM.reasons.find(r => r.id === modAlerts[modAlerts.length - 1].report?.reason)?.label || 'N/A'}</div>
        <button className="btn bp" onClick={() => { setView('mod'); setModAlerts(a => a.map(x => ({ ...x, read: true }))); }} style={{ marginTop: 6, padding: '3px 10px', fontSize: 10, width: '100%' }}>Ver en Moderación</button>
      </div>}

      {/* Airbound confirmation */}
      {airboundConfirm && <AirboundConfirmModal requiredTier={airboundConfirm} onConfirm={() => { setAirboundConfirm(null); setView('settings'); setSettingsTab('airbound'); }} onCancel={() => setAirboundConfirm(null)} />}
      {/* Report modal */}
      {showReport && <ReportModal targetUser={showReport.user} targetMsg={showReport.msg} onSubmit={submitReport} onClose={() => setShowReport(null)} />}
      {/* Emulator modal */}
      {showEmulator && <AccountEmulatorPanel targetAccount={showEmulator} onClose={() => setShowEmulator(null)} />}
      {/* Party quiz modal */}
      {showPartyQuiz && <PartyQuiz onComplete={completePartyQuiz} onClose={() => setShowPartyQuiz(false)} />}
      {/* MS viewer */}
      {showMS && <div className="modal" onClick={() => setShowMS(false)} role="dialog"><div className="mcard" onClick={e => e.stopPropagation()} style={{ width: 520, maxHeight: '80vh', padding: 22, overflow: 'auto' }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--acl)', marginBottom: 10 }}>📜 Mandament Sistematics v{MANDAMENT_SYSTEM.version}</h2>
        {MANDAMENT_SYSTEM.sections.map((s, i) => <div key={i} className="card" style={{ marginBottom: 6, borderLeft: '3px solid var(--acc)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><span>{s.icon}</span><span style={{ fontSize: 12, fontWeight: 700 }}>{s.title}</span></div>{s.rules.map((r, j) => <div key={j} style={{ fontSize: 11, color: 'var(--tx2)', padding: '2px 0 2px 22px' }}>{r}</div>)}</div>)}
        <button className="btn bp" onClick={() => setShowMS(false)} style={{ width: '100%', marginTop: 10, padding: 8 }}>Cerrar</button>
      </div></div>}

      <nav className="sbar" role="navigation" aria-label="Server navigation">
        <button className="si" aria-label="Home" onClick={() => { setAS(null); setView('server'); }} style={{ background: 'linear-gradient(135deg, var(--acc), var(--pk))', color: '#fff', border: 'none' }}>⬡</button>
        <div style={{ width: 28, height: 1, background: 'var(--bdr)', margin: '2px 0' }} role="separator" />
        {srvs.map(s => <button key={s.id} className={`si ${aS === s.id ? 'on' : ''}`} aria-label={s.name} onClick={() => { setAS(s.id); setACh(s.channels[0]?.id || null); setView('server'); }}>{aS === s.id && <div className="ind" />}{s.icon || s.name.substring(0, 2)}</button>)}
        <button className="si" aria-label="Create server" onClick={() => setShowCreate(true)} style={{ color: 'var(--ok)', fontSize: 20 }}>+</button>
        <div style={{ flex: 1 }} />
        {navItems.filter(n => n.id !== 'server').map(n => <button key={n.id} className={`si ${view === n.id ? 'on' : ''}`} aria-label={n.label} onClick={() => setView(n.id)} style={{ position: 'relative' }}><span style={{ fontSize: n.id === 'inex' ? 11 : 15 }}>{n.icon}</span>{n.id === 'mod' && unreadAlerts > 0 && <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: 'var(--err)' }} />}</button>)}
      </nav>

      {view === 'inex' ? <InexIDE onClose={() => setView('server')} notify={nf} /> : <>
        <aside className="side" role="complementary">
          <div style={{ padding: '12px 12px 6px', borderBottom: '1px solid var(--bdr)' }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--acl)' }}>{srv ? srv.name : 'interClouder'}</h2>
            <p style={{ fontSize: 9, color: 'var(--txg)' }}>{srv ? `${srv.channels.length} ch · ${(srv.customEmojis || []).length} emojis` : 'Selecciona o crea un servidor'}</p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px' }} role="listbox">
            {srv ? srv.channels.map(c => <div key={c.id} className={`ch ${aCh === c.id ? 'on' : ''}`} role="option" aria-selected={aCh === c.id} tabIndex={0} onClick={() => { setACh(c.id); setView('server'); }} onKeyDown={e => { if (e.key === 'Enter') { setACh(c.id); setView('server'); } }}><span># {c.name}</span>{(c.msgs || []).length > 0 && <span style={{ fontSize: 9, color: 'var(--txg)', background: 'var(--bg3)', padding: '1px 5px', borderRadius: 4 }}>{(c.msgs || []).length}</span>}</div>)
            : <div style={{ padding: 20, textAlign: 'center', color: 'var(--txg)' }}><div style={{ fontSize: 28, marginBottom: 8 }}>☁</div><p style={{ fontSize: 12 }}>Sin servidor seleccionado.</p><button className="btn bp" onClick={() => setShowCreate(true)} style={{ marginTop: 10 }}>Crear Servidor</button></div>}
          </div>
          <div style={{ padding: 8, borderTop: '1px solid var(--bdr)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Av name={user.display} size={28} status={stealthMode ? 'offline' : user.status} />
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 11, fontWeight: 700, color: ROLES[user.role]?.c, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userTier >= 3 ? <span className="gradient-text" style={{ background: 'linear-gradient(90deg,#EC4899,#A855F7,#6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.display}</span> : userTier >= 2 ? <span className="fancy-font">{user.display}</span> : user.display}{stealthMode && <span style={{ fontSize: 8, color: 'var(--txg)' }}> 👁</span>}</div><div style={{ fontSize: 8, color: 'var(--txg)' }}>@{user.username}{user.premium && <span style={{ color: PLANS[user.premium]?.c }}> • {PLANS[user.premium]?.i}</span>}</div></div>
            <button className="btn bs" onClick={() => setView('settings')} aria-label="Settings" style={{ padding: '4px 6px', fontSize: 12 }}>⚙</button>
          </div>
        </aside>

        <main className="main" role="main" aria-label={view}>
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid var(--bdr)', background: 'var(--bg2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {view === 'server' && ch && <h1 style={{ fontSize: 14, fontWeight: 700 }}># {ch.name}</h1>}
              {view === 'friends' && <h1 style={{ fontSize: 14, fontWeight: 700 }}>👥 Amigos</h1>}
              {view === 'mod' && <h1 style={{ fontSize: 14, fontWeight: 700 }}>🛡 Moderación{unreadAlerts > 0 && <span style={{ fontSize: 10, color: 'var(--err)', marginLeft: 4 }}>({unreadAlerts} alertas)</span>}</h1>}
              {view === 'admin' && <h1 style={{ fontSize: 14, fontWeight: 700 }}>👑 Admin</h1>}
              {view === 'plugins' && <h1 style={{ fontSize: 14, fontWeight: 700 }}>🧩 Plugins</h1>}
              {view === 'settings' && <h1 style={{ fontSize: 14, fontWeight: 700 }}>⚙ Ajustes</h1>}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {canStealth && <button className={`btn ${stealthMode ? 'bd' : 'bs'}`} onClick={() => setStealthMode(!stealthMode)} style={{ padding: '4px 8px', fontSize: 10 }}>{stealthMode ? '👁 Stealth ON' : '👁 Stealth'}</button>}
              <button className="btn bs" onClick={() => setView('inex')} style={{ padding: '4px 10px', fontSize: 11, fontFamily: 'var(--mono)' }}>⟨/⟩ INEX</button>
            </div>
          </header>

          {/* CHAT VIEW */}
          {view === 'server' && <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} role="log" aria-label="Messages" aria-live="polite">
              {msgs.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--txg)' }}><div style={{ fontSize: 36 }}>💬</div><p style={{ fontSize: 13, marginTop: 6 }}>No hay mensajes aún!</p><p style={{ fontSize: 10, marginTop: 4 }}>Prueba: **bold** *italic* ~~strike~~ ||spoiler|| `code` ==highlight==</p></div>}
              {msgs.map(m => {
                const isMe = m.uid === 'me'; const canEdit = isMe || canEditAny; const canDelete = isMe || canDeleteAny;
                const segments = m.text ? parseMessageText(m.text) : [];
                const rxEntries = Object.entries(m.reactions || {});
                return <div key={m.id} className="msg" style={{ position: 'relative' }}>
                  <Av name={m.user} size={28} status={isMe ? (stealthMode ? 'offline' : 'online') : undefined} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: m.color || 'var(--tx)' }}>{m.user}</span>
                      {m.tag && <MsgTag type={m.tag} />}
                      <time style={{ fontSize: 9, color: 'var(--txg)' }}>{m.time}</time>
                      {m.edited && <span style={{ fontSize: 8, color: 'var(--txg)' }}>(editado)</span>}
                    </div>
                    {m.sticker && <div className="sticker-msg">{m.sticker.emoji}</div>}
                    {editingMsg === m.id ? <div className="msg-editing"><textarea value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); editMessage(m.id, editText); } if (e.key === 'Escape') setEditingMsg(null); }} /><div className="edit-actions"><button className="btn bp" onClick={() => editMessage(m.id, editText)} style={{ padding: '3px 10px', fontSize: 10 }}>Guardar</button><button className="btn bs" onClick={() => setEditingMsg(null)} style={{ padding: '3px 10px', fontSize: 10 }}>Cancelar</button></div></div>
                    : m.text ? <div style={{ fontSize: 13, color: 'var(--tx2)', marginTop: 1, wordBreak: 'break-word' }}><TextRenderer segments={segments} scrambleMode={scrambleMode} currentUserId={user?.username} isMinor={user?.isMinor} /></div> : null}
                    {m.file?.url && m.file.type?.startsWith('image/') && (
                      m.file.scramble ? (user?.isMinor ? <div style={{ padding: 8, background: 'var(--bg4)', borderRadius: 8, fontSize: 11, color: 'var(--txm)' }}>[ Imagen oculta ]</div>
                        : <div className={scrambleMode === 'blackbox' ? 'ft-scramble-box' : 'ft-scramble-blur'} style={{ display: 'inline-block', borderRadius: 8 }}><img src={m.file.url} alt={m.file.name || 'Attachment'} style={{ maxWidth: 260, maxHeight: 180, borderRadius: 8 }} /></div>
                      ) : <img src={m.file.url} alt={m.file.name || 'Attachment'} style={{ maxWidth: 260, maxHeight: 180, borderRadius: 8, display: 'block', marginTop: 4 }} />
                    )}
                    {(rxEntries.length > 0 || true) && <div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                      {rxEntries.map(([emoji, data]) => <button key={emoji} className="rx" aria-pressed={data.users.includes('me')} onClick={() => toggleReaction(m.id, emoji)}>{emoji} {data.count}</button>)}
                      {!stealthMode && <div style={{ position: 'relative' }}><button className="rx-add" onClick={() => setShowRxPicker(showRxPicker === m.id ? null : m.id)}>+</button>{showRxPicker === m.id && <ReactionPicker onSelect={e => toggleReaction(m.id, e)} onClose={() => setShowRxPicker(null)} />}</div>}
                    </div>}
                  </div>
                  <div className="actions">
                    {!stealthMode && <button className="btn bs" onClick={() => setShowRxPicker(showRxPicker === m.id ? null : m.id)} style={{ padding: '2px 5px', fontSize: 12 }}>😀</button>}
                    {canEdit && !stealthMode && <button className="btn bs" onClick={() => { setEditingMsg(m.id); setEditText(m.text || ''); }} style={{ padding: '2px 5px', fontSize: 10 }}>✏️</button>}
                    {canDelete && !stealthMode && <button className="btn bd" onClick={() => deleteMessage(m.id)} style={{ padding: '2px 5px', fontSize: 10 }}>🗑</button>}
                    <button className="btn bs" onClick={() => setShowReport({ user: m.user, msg: m.id })} style={{ padding: '2px 5px', fontSize: 10 }}>🚨</button>
                  </div>
                </div>;
              })}
            </div>
            {stealthMode ? <div style={{ padding: 12, textAlign: 'center', background: 'var(--bg3)', borderTop: '1px solid var(--bdr)' }}><span style={{ fontSize: 11, color: 'var(--txm)' }}>👁 Modo Stealth — Chat deshabilitado</span></div>
            : <div className="inp" style={{ position: 'relative' }}>
              {showIdeInsert && <IDEInsertPanel userRole={user.role} onInsert={code => { sendMessage(code); setShowIdeInsert(false); }} onClose={() => setShowIdeInsert(false)} />}
              <div style={{ position: 'relative' }}><button className="btn bs" onClick={() => setShowEmoji(!showEmoji)} style={{ padding: '5px 8px', fontSize: 14 }}>😀</button>{showEmoji && <EmojiPicker onSelect={e => { const inp = document.getElementById('msg-input'); if (inp) { inp.value = (inp.value || '') + e; inp.focus(); } }} onClose={() => setShowEmoji(false)} serverEmojis={srv?.customEmojis || []} />}</div>
              <div style={{ position: 'relative' }}><button className="btn bs" onClick={() => setShowSticker(!showSticker)} style={{ padding: '5px 8px', fontSize: 14 }}>🎭</button>{showSticker && <StickerPicker onSelect={s => sendMessage(null, null, s)} onClose={() => setShowSticker(false)} />}</div>
              <button className="btn bs" onClick={() => setShowIdeInsert(!showIdeInsert)} style={{ padding: '5px 8px', fontSize: 11, fontFamily: 'var(--mono)' }} title="IDE Insert (Ctrl+Shift+C)">{'</>'}</button>
              <input id="msg-input" style={{ flex: 1 }} placeholder={`Mensaje #${ch?.name || 'general'}...`} onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { sendMessage(e.target.value.trim()); e.target.value = ''; } }} autoComplete="off" />
              <div style={{ fontSize: 9, color: 'var(--txm)', whiteSpace: 'nowrap' }}>{fileLimit.label}</div>
              <button className="btn bp" onClick={() => { const inp = document.getElementById('msg-input'); if (inp?.value.trim()) { sendMessage(inp.value.trim()); inp.value = ''; } }} style={{ padding: '7px 14px' }}>→</button>
            </div>}
          </div>}

          {/* FRIENDS VIEW */}
          {view === 'friends' && <div style={{ flex: 1, overflowY: 'auto' }}>
            <FriendsPanel friends={friends} requests={friendRequests} onSendRequest={sendFriendRequest} onAcceptRequest={acceptFriendRequest} onRejectRequest={rejectFriendRequest} onRemoveFriend={removeFriend} isMinor={user?.isMinor} notify={nf} friendRequestMode={settings?.privacy?.friendRequests || 'none'} onGoToSettings={() => { setView('settings'); setSettingsTab('privacy'); }} />
          </div>}

          {/* ADMIN */}
          {view === 'admin' && <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>{[['👥', 1 + testUsers.length, 'Usuarios'], ['🖥', srvs.length, 'Servidores'], ['💬', srvs.reduce((a, s) => a + s.channels.reduce((b, c) => b + (c.msgs || []).length, 0), 0), 'Mensajes'], ['⭐', user.xp || 0, 'XP']].map(([i, v, l]) => <div key={l} className="card" style={{ textAlign: 'center' }}><div style={{ fontSize: 20 }}>{i}</div><div style={{ fontSize: 18, fontWeight: 800 }}>{v}</div><div style={{ fontSize: 9, color: 'var(--txm)' }}>{l}</div></div>)}</div>
            <div className="card" style={{ marginBottom: 10 }}><div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6 }}>Acciones Rápidas</div><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}><button className="btn bs" onClick={() => setView('inex')}>⟨/⟩ INEX IDE</button><button className="btn bs" onClick={() => setShowCreate(true)}>+ Servidor</button><button className="btn bs" onClick={() => { setView('settings'); setSettingsTab('airbound'); }}>🚀 Airbound</button><button className="btn bs" onClick={() => setShowMS(true)}>📜 MS</button></div></div>
            {srv && <div className="card" style={{ marginBottom: 10 }}><LogicBoardPanel boards={srv.logicBoards || []} onCreate={addLogicBoard} onDelete={deleteLogicBoard} userRole={user.role} tierKey={tierKey} notify={nf} /></div>}
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>💻 Terminal</h3>
            <TerminalPanel notify={nf} user={user} allUsers={testUsers} onEditUser={editUser} />
            {canViewTrash && <div className="card" style={{ marginTop: 10 }}><TrashPanel trash={trash} onRestore={restoreMessage} onPermanentDelete={permanentDelete} /></div>}
          </div>}

          {/* PLUGINS */}
          {view === 'plugins' && <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            <div className="sl">Plugins</div>
            {PLUGINS.map(p => <div key={p.id} className="card" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 18 }}>{p.i}</span><div><div style={{ fontSize: 12, fontWeight: 700 }}>{p.n}</div><div style={{ fontSize: 10, color: 'var(--txm)' }}>{p.d}</div></div></div><Tg on={true} onChange={() => nf('Toggled ' + p.n)} label={`Toggle ${p.n}`} /></div>)}
            <div className="sl" style={{ marginTop: 12 }}>Bots</div>
            {BOTS.map(b => <div key={b.id} className="card" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>{b.i}</span><div><div style={{ fontSize: 12, fontWeight: 700, color: b.c }}>{b.n}</div><div style={{ fontSize: 10, color: 'var(--txm)' }}>{b.d}</div></div></div>)}
          </div>}

          {/* SETTINGS */}
          {view === 'settings' && <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            <div className="card" style={{ marginBottom: 10 }}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Av name={user.display} size={44} status={user.status} /><div><div style={{ fontSize: 14, fontWeight: 700 }}>{user.display}</div><div style={{ fontSize: 10, color: 'var(--txm)' }}>@{user.username} · {ROLES[user.role]?.n}{user.premium && <span style={{ color: PLANS[user.premium]?.c }}> · {PLANS[user.premium]?.n}</span>}</div><div style={{ display: 'flex', gap: 3, marginTop: 3, flexWrap: 'wrap' }}>{(user.badges || []).map(b => { const bg = BADGES[b]; if (!bg) return null; return <span key={b} title={bg.l + (bg.desc ? ' — ' + bg.desc : '')} style={{ fontSize: 12, padding: '1px 5px', borderRadius: 6, background: bg.c + '18', color: bg.c, border: '1px solid ' + bg.c + '30', cursor: 'default', lineHeight: 1.2 }}>{bg.i}</span>; })}</div></div></div></div>

            {/* Settings tabs */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 10, flexWrap: 'wrap' }}>{[{id:'general',l:'General'},{id:'airbound',l:'🚀 Airbound'},{id:'privacy',l:'🔒 Privacidad'},{id:'party',l:'🎊 Party'},{id:'fonts',l:'🔤 Fuentes'},{id:'server',l:'🖥 Servidor'},{id:'ms',l:'📜 MS'}].map(t => <button key={t.id} className={`tab ${settingsTab === t.id ? 'on' : 'off'}`} onClick={() => setSettingsTab(t.id)} style={{ fontSize: 10 }}>{t.l}</button>)}</div>

            {settingsTab === 'general' && <>
              <fieldset style={{ border: 'none', marginBottom: 12 }}><legend className="sl">Tema</legend><div style={{ display: 'flex', gap: 4 }} role="radiogroup">{['dark', 'midnight', 'void', 'light', 'high-contrast'].map(t => <button key={t} role="radio" aria-checked={theme === t} className={`tab ${theme === t ? 'on' : 'off'}`} onClick={() => setTheme(t)} style={{ textTransform: 'capitalize' }}>{t.replace('-', ' ')}</button>)}</div></fieldset>
              <fieldset style={{ border: 'none', marginBottom: 12 }}><legend className="sl">Accesibilidad</legend><div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--bg4)' }}><span style={{ fontSize: 12 }}>Movimiento reducido</span><Tg on={settings?.access?.reducedMotion || false} onChange={v => setSettings(s => ({ ...s, access: { ...s.access, reducedMotion: v } }))} label="Reduced motion" /></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--bg4)' }}><span style={{ fontSize: 12 }}>Alto Contraste</span><Tg on={settings?.access?.highContrast || false} onChange={v => { setSettings(s => ({ ...s, access: { ...s.access, highContrast: v } })); if (v) setTheme('high-contrast'); else setTheme('dark'); }} label="High contrast" /></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--bg4)' }}><span style={{ fontSize: 12 }}>Tamaño fuente: {settings?.access?.fontSize || 14}px</span><input type="range" min={11} max={20} value={settings?.access?.fontSize || 14} onChange={e => setSettings(s => ({ ...s, access: { ...s.access, fontSize: parseInt(e.target.value) } }))} style={{ width: 100 }} /></div>
              </div></fieldset>
              <fieldset style={{ border: 'none', marginBottom: 12 }}><legend className="sl">Chat</legend><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--bg4)' }}><span style={{ fontSize: 12 }}>Modo Scramble</span><div style={{ display: 'flex', gap: 3 }}>{['blur', 'blackbox'].map(m => <button key={m} className={`tab ${scrambleMode === m ? 'on' : 'off'}`} onClick={() => setSettings(s => ({ ...s, chat: { ...s.chat, scrambleMode: m } }))} style={{ fontSize: 10 }}>{m === 'blackbox' ? '⬛ Box' : '🌫 Blur'}</button>)}</div></div></fieldset>
              <fieldset style={{ border: 'none', marginBottom: 12 }}><legend className="sl">Estado</legend><div style={{ display: 'flex', gap: 4 }} role="radiogroup">{['online', 'idle', 'dnd', 'offline'].map(s => <button key={s} role="radio" aria-checked={user.status === s} className={`tab ${user.status === s ? 'on' : 'off'}`} onClick={() => { editUser('me', { status: s }); nf('Estado: ' + s); }} style={{ textTransform: 'capitalize' }}>{s}</button>)}</div></fieldset>
              <fieldset style={{ border: 'none', marginBottom: 12 }}><legend className="sl">Atajos</legend>{KBS.map(s => <div key={s.k} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--bg4)', marginBottom: 4 }}><span style={{ fontSize: 12 }}>{s.d}</span><kbd style={{ fontSize: 11, fontWeight: 700, color: 'var(--acl)', fontFamily: 'var(--mono)', padding: '2px 8px', borderRadius: 5, background: 'var(--bg3)' }}>{s.k}</kbd></div>)}</fieldset>
              <button className="btn bs" onClick={() => { SS.c(); setUser(null); nf('Sesión cerrada'); }} style={{ width: '100%' }}>Cerrar Sesión</button>
            </>}

            {settingsTab === 'airbound' && <div className="card" style={{ padding: 12 }}><SubscriptionPanel user={user} onSubscribe={handleSubscribe} isMinor={user?.isMinor} /></div>}

            {settingsTab === 'privacy' && <>
              <fieldset style={{ border: 'none', marginBottom: 12 }}><legend className="sl">Solicitudes de amistad</legend>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{Object.entries(FRIEND_SYSTEM.blockModes).map(([k, v]) => <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--bg4)', cursor: 'pointer', border: (settings?.privacy?.friendRequests || 'none') === k ? '2px solid var(--acc)' : '1px solid var(--bdr)' }} onClick={() => setSettings(s => ({ ...s, privacy: { ...s.privacy, friendRequests: k } }))}><div><span style={{ fontSize: 12, fontWeight: 600 }}>{k === 'none' ? 'Aceptar todas' : k === 'server_only' ? 'Solo servidores mutuos' : 'Bloquear todas'}</span><div style={{ fontSize: 9, color: 'var(--txm)' }}>{v}</div></div>{(settings?.privacy?.friendRequests || 'none') === k && <span style={{ color: 'var(--ok)' }}>✓</span>}</div>)}</div>
              </fieldset>
              <fieldset style={{ border: 'none', marginBottom: 12 }}><legend className="sl">DMs</legend>
                <div style={{ display: 'flex', gap: 4 }}>{['friends', 'everyone', 'none'].map(m => <button key={m} className={`tab ${(settings?.privacy?.dms || 'friends') === m ? 'on' : 'off'}`} onClick={() => setSettings(s => ({ ...s, privacy: { ...s.privacy, dms: m } }))} style={{ fontSize: 10 }}>{m === 'friends' ? 'Solo amigos' : m === 'everyone' ? 'Todos' : 'Nadie'}</button>)}</div>
              </fieldset>
            </>}

            {settingsTab === 'party' && <div>
              <div style={{ textAlign: 'center', marginBottom: 12 }}><div style={{ fontSize: 36 }}>🎊</div><h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--acl)', marginBottom: 2 }}>PartyEngager Badges</h3><p style={{ fontSize: 10, color: 'var(--txm)' }}>Eventos, gifts y comunidad — Todos los sub-badges son igualitarios</p></div>
              {user?.isMinor ? <div style={{ padding: 12, background: 'rgba(239,68,68,.08)', borderRadius: 10, border: '1px solid rgba(239,68,68,.2)', textAlign: 'center' }}><div style={{ fontSize: 24, marginBottom: 4 }}>🛡</div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--err)' }}>No disponible para CloudKids</div><div style={{ fontSize: 10, color: 'var(--txm)', marginTop: 4 }}>Los badges de Party no son accesibles para menores de edad.</div></div>
              : <>
                {/* Current badges */}
                {(user.badges || []).some(b => b.startsWith('party_')) ? <div className="card" style={{ marginBottom: 10, borderLeft: '3px solid var(--ok)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--ok)' }}>✓ Tus Party Badges</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{(user.badges || []).filter(b => b.startsWith('party_')).map(b => {
                    const badge = BADGES[b]; if (!badge) return null;
                    return <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, background: badge.c + '18', border: '1px solid ' + badge.c + '30' }}>
                      <span style={{ fontSize: 18 }}>{badge.i}</span><div><div style={{ fontSize: 11, fontWeight: 700, color: badge.c }}>{badge.l}</div>{badge.desc && <div style={{ fontSize: 9, color: 'var(--txm)' }}>{badge.desc}</div>}</div>
                    </div>;
                  })}</div>
                  <button className="btn bs" onClick={() => { setUser(u => ({ ...u, badges: (u.badges || []).filter(b => !b.startsWith('party_')) })); nf('Party badges removidos — puedes volver a hacer la encuesta'); }} style={{ marginTop: 8, fontSize: 10, padding: '3px 10px' }}>Resetear y volver a hacer encuesta</button>
                </div>
                : <div className="card" style={{ marginBottom: 10, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>¿Aún no tienes Party Badge?</div>
                  <p style={{ fontSize: 10, color: 'var(--txm)', marginBottom: 10 }}>Haz una encuesta rápida de 5 preguntas para descubrir tu perfil.</p>
                  <button className="btn bp" onClick={() => setShowPartyQuiz(true)} style={{ padding: '8px 20px', fontSize: 12 }}>🎊 Hacer Encuesta</button>
                </div>}

                {/* All badges info */}
                <div className="sl" style={{ marginBottom: 6 }}>Sub-Badges Disponibles</div>
                {Object.entries(PARTY_SYSTEM.descriptions).map(([key, info]) => <div key={key} className="card" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10, borderLeft: '3px solid ' + info.color }}>
                  <span style={{ fontSize: 24 }}>{info.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: info.color }}>{info.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--txm)' }}>{info.tagline}</div>
                    <div style={{ fontSize: 9, color: 'var(--tx2)', marginTop: 2 }}>{info.events}</div>
                  </div>
                  {(user.badges || []).includes(key) && <span style={{ fontSize: 10, color: 'var(--ok)', fontWeight: 700 }}>✓ Tuyo</span>}
                </div>)}
                <div style={{ padding: 8, background: 'var(--bg4)', borderRadius: 8, marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--txm)' }}>ℹ️ Todos los sub-badges son igualitarios: ni uno da más, ni otro menos. La diferencia es el tipo de eventos que recibirás.</div>
                </div>
              </>}
            </div>}

            {settingsTab === 'fonts' && <fieldset style={{ border: 'none', marginBottom: 12 }}><legend className="sl">Tipos de Fuente</legend>{Object.values(FONT_TYPES).map(ft => { const locked = ft.minTier && userTier < ft.minTier; const permLocked = ft.requiresPerm && !hasPermission(user, ft.requiredPerm);
              return <div key={ft.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderRadius: 8, background: 'var(--bg4)', marginBottom: 4, opacity: (locked || permLocked) ? 0.5 : 1, cursor: locked ? 'pointer' : 'default' }} onClick={() => { if (locked) requireAirbound(ft.minTier); }}>
                <div><span style={{ fontSize: 12, fontWeight: 600 }}>{ft.icon} {ft.name}</span><div style={{ fontSize: 9, color: 'var(--txm)' }}>{ft.desc}</div><code style={{ fontSize: 9, color: 'var(--pk)' }}>{ft.syntax}</code></div>
                {locked ? <span style={{ fontSize: 9, color: 'var(--wrn)' }}>Tier {ft.minTier}+ 🔒</span> : permLocked ? <span style={{ fontSize: 9, color: 'var(--err)' }}>Mod+</span> : <span style={{ fontSize: 9, color: 'var(--ok)' }}>✓</span>}
              </div>; })}</fieldset>}

            {settingsTab === 'server' && srv && <>
              <fieldset style={{ border: 'none', marginBottom: 12 }}><legend className="sl">Permisos de Emoji</legend>
                {[EXTERNAL_PERMS.send, EXTERNAL_PERMS.receive].map(perm => <div key={perm.id} className="perm-panel">
                  <div className="perm-row"><span className="perm-name">{perm.name}</span><Tg on={srv?.permissions?.[perm.id] !== false} onChange={v => { setSrvs(ss => ss.map(s => s.id !== aS ? s : { ...s, permissions: { ...s.permissions, [perm.id]: v } })); nf(perm.name + ': ' + (v ? 'on' : 'off')); }} label={perm.name} /></div>
                  <div className="perm-sub">{perm.subPerms.map(sp => <div key={sp.id} className="perm-row"><span className="perm-name" style={{ fontSize: 10 }}>{sp.name}</span><Tg on={(srv?.permissions?.[sp.id]) || false} onChange={v => { setSrvs(ss => ss.map(s => s.id !== aS ? s : { ...s, permissions: { ...s.permissions, [sp.id]: v } })); }} label={sp.name} /></div>)}</div>
                </div>)}
              </fieldset>
              <fieldset style={{ border: 'none', marginBottom: 12 }}><legend className="sl">Emojis Personalizados ({(srv.customEmojis || []).length}/{SERVER_EMOJI_LIMITS.getServerLevel((srv.members || []).length).emojis})</legend>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>{(srv.customEmojis || []).map(em => <div key={em.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4, borderRadius: 6, background: 'var(--bg4)', minWidth: 50 }}><span style={{ fontSize: 20 }}>{em.e}</span><span style={{ fontSize: 8, color: 'var(--txm)' }}>{em.n}</span></div>)}</div>
                <div style={{ display: 'flex', gap: 4 }}><input id="new-emoji-char" className="li" placeholder="Emoji" style={{ width: 60, fontSize: 16, textAlign: 'center' }} maxLength={2} /><input id="new-emoji-name" className="li" placeholder="Nombre" style={{ flex: 1, fontSize: 11 }} /><button className="btn bp" onClick={() => { const ch = document.getElementById('new-emoji-char')?.value; const nm = document.getElementById('new-emoji-name')?.value; if (ch && nm) { addCustomEmoji(ch, nm); document.getElementById('new-emoji-char').value = ''; document.getElementById('new-emoji-name').value = ''; } }} style={{ padding: '4px 10px', fontSize: 11 }}>Añadir</button></div>
              </fieldset>
            </>}

            {settingsTab === 'ms' && <div>
              <div className="card" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => setShowMS(true)}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>📜</span><div><div style={{ fontSize: 12, fontWeight: 700 }}>Mandament Sistematics (MS)</div><div style={{ fontSize: 9, color: 'var(--txm)' }}>v{MANDAMENT_SYSTEM.version} · {MANDAMENT_SYSTEM.sections.length} secciones</div></div><span style={{ fontSize: 10, color: 'var(--acc)', marginLeft: 'auto' }}>Ver →</span></div></div>
              {isModPlus(user) && <div className="card" style={{ cursor: 'pointer', borderLeft: '3px solid var(--wrn)' }} onClick={() => setShowMS(true)}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 20 }}>🛡</span><div><div style={{ fontSize: 12, fontWeight: 700 }}>Moderation Mandament (MMS)</div><div style={{ fontSize: 9, color: 'var(--txm)' }}>v{MODERATION_MANDAMENT.version} · {MODERATION_MANDAMENT.sections.length} secciones</div></div><span style={{ fontSize: 10, color: 'var(--wrn)', marginLeft: 'auto' }}>Ver →</span></div></div>}
            </div>}
          </div>}

          {/* MOD */}
          {view === 'mod' && <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {/* Stealth controls */}
            {canStealth && <div className="card" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div><div style={{ fontSize: 12, fontWeight: 700 }}>👁 Modo Stealth / Espectador</div><div style={{ fontSize: 9, color: 'var(--txm)' }}>Lee chats sin ser detectado. Chat, typing y presencia ocultos.</div></div><Tg on={stealthMode} onChange={v => { setStealthMode(v); nf('Stealth ' + (v ? 'activado' : 'desactivado')); }} label="Stealth mode" /></div>
              {stealthMode && <div style={{ marginTop: 6, fontSize: 9, color: 'var(--wrn)' }}>{STEALTH_MODE.restrictions.join(' · ')}</div>}
            </div>}

            {/* Account emulator */}
            {canEmulate && <div className="card" style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>🔍 Emulador de Cuentas Deshabilitadas</div>
              <p style={{ fontSize: 10, color: 'var(--txm)', marginBottom: 6 }}>Accede a cuentas deshabilitadas en modo sandbox (MMS Art. III)</p>
              <button className="btn bs" onClick={() => setShowEmulator({ display: 'UsuarioTest', username: 'usertest', role: 'member', disabled: true, messages: [{ text: 'Mensaje ejemplo 1', time: '10:15' }, { text: 'Contenido investigado', time: '10:22' }], friends: ['Amigo1', 'Amigo2', 'Amigo3'] })} style={{ fontSize: 10, padding: '4px 12px' }}>Emular cuenta de prueba</button>
            </div>}

            {/* Reports */}
            {canViewReports && <div className="card" style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>🚨 Reportes ({reports.length})</div>
              {reports.length === 0 && <p style={{ fontSize: 10, color: 'var(--txg)' }}>Sin reportes</p>}
              {reports.map(r => <div key={r.id} style={{ padding: 8, background: 'var(--bg3)', borderRadius: 8, marginBottom: 4, borderLeft: '3px solid var(--err)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}><span style={{ fontSize: 11, fontWeight: 700 }}>{REPORT_SYSTEM.reasons.find(x => x.id === r.reason)?.icon} {REPORT_SYSTEM.reasons.find(x => x.id === r.reason)?.label}</span><span style={{ fontSize: 9, color: 'var(--txg)' }}>{new Date(r.timestamp).toLocaleString()}</span></div>
                <div style={{ fontSize: 10, color: 'var(--tx2)' }}>Contra: <strong>{r.targetUser}</strong></div>
                <div style={{ fontSize: 10, color: 'var(--txm)', marginTop: 2 }}>{r.desc}</div>
                {r.evidence?.length > 0 && <div style={{ fontSize: 9, color: 'var(--wrn)', marginTop: 2 }}>📎 {r.evidence.length} evidencia(s)</div>}
                <div style={{ display: 'flex', gap: 3, marginTop: 4 }}><button className="btn bp" onClick={() => nf('Navegando al mensaje reportado (stealth)...')} style={{ padding: '2px 8px', fontSize: 9 }}>Ir al mensaje</button><button className="btn bd" onClick={() => setReports(rr => rr.filter(x => x.id !== r.id))} style={{ padding: '2px 8px', fontSize: 9 }}>Descartar</button></div>
              </div>)}
            </div>}

            {/* Server list */}
            {srvs.map(s => <div key={s.id} className="card" style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><div style={{ fontWeight: 700, fontSize: 13 }}>{s.icon || '⬡'} {s.name}</div><div style={{ fontSize: 10, color: 'var(--txm)' }}>{s.channels.length} ch · emojis: {(s.customEmojis || []).length} · boards: {(s.logicBoards || []).length}</div></div><button className="btn bd" onClick={() => { setSrvs(ss => ss.filter(x => x.id !== s.id)); nf('Eliminado ' + s.name); }} style={{ fontSize: 10 }}>Eliminar</button></div>)}
            {canViewTrash && trash.length > 0 && <div className="card" style={{ marginTop: 10 }}><TrashPanel trash={trash} onRestore={restoreMessage} onPermanentDelete={permanentDelete} /></div>}
          </div>}
        </main>
      </>}

      {showCreate && <div className="modal" onClick={() => setShowCreate(false)} role="dialog" aria-modal="true"><div className="mcard" onClick={e => e.stopPropagation()} style={{ width: 400, padding: 22 }}><h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}>Crear Servidor</h2><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>{TEMPLATES.map(t => <button key={t.id} className="card" onClick={() => { const id = 's' + uid(); createServer({ id, name: t.n + ' Server', tag: { acr: t.n.substring(0, 3).toUpperCase() }, icon: t.i, members: [], xp: 0, created: Date.now(), isPublic: true, channels: t.tc.map((c, i) => ({ id: id + 'c' + i, name: c, type: 'text', slowmode: 0, msgs: [] })), vChannels: t.vc.map((c, i) => ({ id: id + 'v' + i, name: c, type: 'voice' })), roles: [{ n: 'Owner', c: '#FFD700' }, { n: 'Admin', c: '#EF4444' }, { n: 'Member', c: '#818CF8' }, ...t.rl], customEmojis: [], customStickers: [], logicBoards: [], permissions: { ext_emoji_send: true, ext_content_recv: true, ext_emoji_send_public: true, ext_content_recv_public: true } }); setShowCreate(false); nf(t.n + ' creado!'); }} style={{ cursor: 'pointer', textAlign: 'center' }}><div style={{ fontSize: 22 }}>{t.i}</div><div style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>{t.n}</div></button>)}</div></div></div>}
    </div>
  );
}
