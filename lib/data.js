/**
 * interClouder v6.0 — Data Module
 * Ported from v5.0 window globals to ES modules.
 */

export const ROLES = {
  ceo: { n: 'C.E.O', c: '#FFD700', i: '👑', p: ['all'], lv: 99 },
  admin: { n: 'Admin', c: '#EF4444', i: '⚡', p: ['ban', 'kick', 'strike', 'manage', 'censor', 'grant'], lv: 90 },
  smod: { n: 'Sr. Mod', c: '#F59E0B', i: '🛡', p: ['ban', 'kick', 'strike', 'mute', 'censor'], lv: 80 },
  mod: { n: 'Moderator', c: '#06D6A0', i: '🔰', p: ['kick', 'strike', 'mute'], lv: 70 },
  vip: { n: 'VIP', c: '#A855F7', i: '💎', p: ['embed'], lv: 50 },
  boost: { n: 'Booster', c: '#F472B6', i: '🚀', p: [], lv: 40 },
  member: { n: 'Member', c: '#818CF8', i: '☁', p: ['chat', 'react', 'voice', 'attach'], lv: 10 },
  cloud: { n: 'Cloudling', c: '#6B7280', i: '○', p: ['chat', 'react'], lv: 0 },
};

export function getRolePerms(role) {
  const lv = (ROLES[role] || {}).lv || 0;
  if (ROLES[role] && ROLES[role].p.includes('all')) {
    return ['all', 'ban', 'kick', 'strike', 'manage', 'mute', 'embed', 'chat', 'react', 'voice', 'attach', 'censor', 'grant'];
  }
  const a = {};
  for (const k in ROLES) {
    if (ROLES[k].lv <= lv) {
      for (const p of ROLES[k].p) a[p] = 1;
    }
  }
  return Object.keys(a);
}

export const BADGES = {
  founder: { l: 'Founder', i: '⬡', c: '#FFD700', t: 'special' },
  early: { l: 'Early Supporter', i: '🌅', c: '#F59E0B', t: 'special' },
  early_owner: { l: 'Early Server Owner', i: '🏰', c: '#14B8A6', t: 'special' },
  dev: { l: 'Developer', i: '</>', c: '#06D6A0', t: 'special' },
  bug: { l: 'Bug Hunter', i: '🐛', c: '#EF4444', t: 'special' },
  nitro: { l: 'Airbound', i: '✨', c: '#C084FC', t: 'premium' },
  elite: { l: 'Airbound Elite', i: '💎', c: '#FFD700', t: 'premium' },
  omega: { l: 'Airbound Omega', i: '🔮', c: '#FF6B6B', t: 'premium' },
  gifted: { l: 'Airbound Gift', i: '🎁', c: '#C084FC', t: 'premium' },
  boost1: { l: 'Booster I', i: '🚀', c: '#F472B6', t: 'boost' },
  boost2: { l: 'Booster II', i: '🚀', c: '#EC4899', t: 'boost' },
  boost3: { l: 'Booster III', i: '🚀', c: '#DB2777', t: 'boost' },
  mod_b: { l: 'Moderator', i: '🛡', c: '#06D6A0', t: 'role' },
  artist: { l: 'Artist', i: '🎨', c: '#818CF8', t: 'community' },
  streamer: { l: 'Streamer', i: '📺', c: '#EF4444', t: 'community' },
  helper: { l: 'Helper', i: '💡', c: '#14B8A6', t: 'community' },
  inex_dev: { l: 'INEX Developer', i: '⟨/⟩', c: '#06D6A0', t: 'special' },
};

export const PLANS = {
  air: {
    id: 'air', n: 'Airbound', p: 1.50, c: '#C084FC', disc: 0,
    perks: ['Custom badges', 'Profile themes', '50MB upload', 'Spoiler files'],
    unlocks: { animAvatar: false, customBanner: false, animBanner: false, gradient: true, maxUp: 50 },
  },
  elite: {
    id: 'elite', n: 'Airbound Elite', p: 4.50, c: '#FFD700', disc: 15,
    perks: ['All Airbound perks', 'Boost x2', '100MB upload', 'Animated avatar', 'Custom banner', '15% boost discount'],
    unlocks: { animAvatar: true, customBanner: true, animBanner: false, gradient: true, maxUp: 100 },
  },
  omega: {
    id: 'omega', n: 'Airbound Omega', p: 8.50, c: '#FF6B6B', disc: 30,
    perks: ['All Elite perks', 'Boost x4', '500MB upload', 'Animated banner', '30% boost discount', 'AI assistant', 'INEX IDE access'],
    unlocks: { animAvatar: true, customBanner: true, animBanner: true, gradient: true, maxUp: 500 },
  },
};

export const REP = {
  levels: [
    { min: -999, n: 'Blacklisted', c: '#000', i: '⛔' },
    { min: 0, n: 'Untrusted', c: '#EF4444', i: '🔻' },
    { min: 20, n: 'Neutral', c: '#6B7280', i: '○' },
    { min: 50, n: 'Trusted', c: '#06D6A0', i: '✓' },
    { min: 100, n: 'Respected', c: '#818CF8', i: '⭐' },
    { min: 250, n: 'Honored', c: '#FBBF24', i: '🏅' },
    { min: 500, n: 'Legendary', c: '#FFD700', i: '👑' },
    { min: 1000, n: 'Mythic', c: '#FF6B6B', i: '🔱' },
  ],
  calc(u) {
    let s = 0;
    s += Math.min((u.xp || 0) / 10, 100);
    s += Math.min(Math.floor((Date.now() - (u.created || Date.now())) / 864e5), 60);
    s -= (u.strikes || 0) * 15;
    s += Math.min((u.msgs || 0) / 5, 80);
    s += (u.badges || []).length * 3;
    if (u.premium) s += 20;
    return Math.round(s);
  },
  level(sc) {
    let l = this.levels[0];
    for (const lv of this.levels) if (sc >= lv.min) l = lv;
    return l;
  },
};

export const STRIKES = [
  { n: 1, a: 'Warning' }, { n: 2, a: 'Mute 10m' }, { n: 3, a: 'Mute 1h' },
  { n: 4, a: 'Mute 24h' }, { n: 5, a: 'Mute 7d' }, { n: 6, a: 'Kick' },
  { n: 7, a: 'Ban 30d' }, { n: 8, a: 'Permaban' },
];

export const SLOWMODES = [0, 5, 10, 15, 30, 60, 120, 300];
export function smLabel(v) { return v === 0 ? 'Off' : v < 60 ? v + 's' : Math.floor(v / 60) + 'm'; }

export const FILE_SEC = {
  blocked: '.exe .bat .cmd .com .msi .scr .pif .reg .vbs .vbe .js .jse .ws .wsf .ps1 .dll .sys .lnk .hta .cpl .inf .iso .img'.split(' '),
  check(name, size, max) {
    const ext = '.' + name.split('.').pop().toLowerCase();
    if (this.blocked.includes(ext)) return { ok: false, reason: 'Blocked: ' + ext };
    if (size > (max || 52428800)) return { ok: false, reason: 'Too large' };
    const n = name.toLowerCase();
    const bad = ['rat', 'trojan', 'hack', 'crack', 'exploit', 'payload', 'inject', 'backdoor', 'keylog', 'stealer'];
    for (const b of bad) if (n.includes(b)) return { ok: false, reason: 'Suspicious: ' + b };
    if (/\.(jpg|png|gif)\.(exe|bat|scr|cmd|vbs)/i.test(n)) return { ok: false, reason: 'Double extension' };
    return { ok: true };
  },
};

export const CKIDS = {
  questions: [
    { q: 'What is a common monthly expense for an adult living independently?', o: ['Rent/Mortgage', 'Homework', 'Recess', 'Cartoons'], a: 0 },
    { q: 'What document do you need to open a bank account?', o: ['Library card', 'Government-issued ID', 'School report', 'Birthday invitation'], a: 1 },
    { q: 'What is a lease agreement?', o: ['A car engine type', 'A contract for renting property', 'A school permission slip', 'A sports signup'], a: 1 },
    { q: 'What is a credit score used for?', o: ['Grading schoolwork', 'Measuring financial trust', 'Rating video games', 'Scoring sports'], a: 1 },
    { q: 'What happens if you miss a bill payment?', o: ['Extra homework', 'Late fees or service cut', 'Teacher calls home', 'Nothing'], a: 1 },
    { q: 'What is health insurance?', o: ['Phone insurance', 'Coverage for medical costs', 'Sports equipment', 'A school class'], a: 1 },
    { q: 'What does APR stand for in finance?', o: ['Annual Percentage Rate', 'Applied Practice Rating', 'After Practice Review', 'All Purpose Rating'], a: 0 },
    { q: 'What is typically required to sign a legal contract?', o: ['Being at least 18', 'Having a library card', 'Being a student', 'Having social media'], a: 0 },
    { q: 'What is a W-2 form?', o: ['A homework sheet', 'A tax document from employer', 'A hall pass', 'A sports form'], a: 1 },
    { q: 'What is a 401(k)?', o: ['A highway number', 'A retirement savings plan', 'A school grade', 'A phone code'], a: 1 },
  ],
  timeLimit: 90,
  baseCount: 5,
  maxCount: 12,
  penalty: 2,
  profanity: 'fuck shit ass bitch damn hell dick pussy cock cunt bastard whore slut fag retard piss crap'.split(' '),
  filter(text, mode) {
    if (!mode) return text;
    return text.replace(/\b\w+\b/g, (w) => {
      if (this.profanity.includes(w.toLowerCase())) {
        return mode === 'blur'
          ? `<span class="ck-blur">${w}</span>`
          : `<span class="ck-block">${'*'.repeat(w.length)}</span>`;
      }
      return w;
    });
  },
};

export const KBS = [
  { k: 'Shift+ArrowUp', d: 'Edit last message' },
  { k: 'Delete', d: 'Delete last message' },
  { k: 'Escape', d: 'Close modal' },
  { k: 'Ctrl+,', d: 'Open settings' },
  { k: 'Alt+ArrowUp', d: 'Previous channel' },
  { k: 'Alt+ArrowDown', d: 'Next channel' },
  { k: 'Ctrl+Shift+I', d: 'Open INEX IDE' },
];

export const PLUGINS = [
  { id: 'p1', n: 'AutoMod+', i: '🛡️', d: 'AI auto-moderation', v: true },
  { id: 'p2', n: 'CloudTranslate', i: '🌐', d: 'Translation in 30+ languages', v: true },
  { id: 'p3', n: 'CloudBeats', i: '🎵', d: 'Music player for voice', v: true },
  { id: 'p4', n: 'XP Tracker', i: '📊', d: 'Activity leaderboards', v: true },
  { id: 'p5', n: 'Greeter', i: '👋', d: 'Welcome messages & auto-roles', v: true },
  { id: 'p6', n: 'Tickets', i: '🎫', d: 'Support ticket system', v: true },
  { id: 'p7', n: 'INEX Runner', i: '⟨/⟩', d: 'Run .inex scripts on events', v: true },
];

export const BOTS = [
  { id: 'b1', n: 'SentinelAI', i: '🤖', c: '#06D6A0', d: 'Auto-detect toxicity & spam' },
  { id: 'b2', n: 'CloudAssist', i: '💡', c: '#818CF8', d: 'AI assistant' },
  { id: 'b3', n: 'BeatCloud', i: '🎶', c: '#F472B6', d: 'Music DJ bot' },
  { id: 'b4', n: 'InexBot', i: '⟨/⟩', c: '#06D6A0', d: 'Run .inex scripts as bot' },
];

export const TEMPLATES = [
  { id: 'gaming', n: 'Gaming', i: '🎮', tc: ['general', 'lfg', 'clips'], vc: ['Voice'], rl: [{ n: 'Gamer', c: '#F43F5E' }] },
  { id: 'community', n: 'Community', i: '👥', tc: ['general', 'introductions', 'events'], vc: ['Lounge'], rl: [{ n: 'Regular', c: '#06D6A0' }] },
  { id: 'creative', n: 'Creative', i: '🎨', tc: ['showcase', 'feedback'], vc: ['Studio'], rl: [{ n: 'Artist', c: '#F472B6' }] },
  { id: 'tech', n: 'Tech', i: '💻', tc: ['help', 'projects'], vc: ['Pair'], rl: [{ n: 'Dev', c: '#06D6A0' }] },
  { id: 'blank', n: 'Blank', i: '📝', tc: ['general'], vc: ['Voice'], rl: [] },
];

export const TRUST_ENGINE = {
  stages: [
    { d: 0, x: 0, h: 0, s: 30 },
    { d: 7, x: 100, h: 200, s: 50 },
    { d: 30, x: 500, h: 270, s: 60 },
    { d: 90, x: 2000, h: 300, s: 70 },
  ],
  color(d, x) {
    let s = this.stages[0];
    for (const st of this.stages) if (d >= st.d && x >= st.x) s = st;
    return `hsl(${s.h},${s.s}%,55%)`;
  },
};

export const GRADIENTS = [
  { id: 'g1', n: 'Nebula', c1: '#A855F7', c2: '#F472B6' },
  { id: 'g2', n: 'Aurora', c1: '#06D6A0', c2: '#818CF8' },
  { id: 'g3', n: 'Sunset', c1: '#F59E0B', c2: '#EF4444' },
  { id: 'g4', n: 'Ocean', c1: '#0EA5E9', c2: '#14B8A6' },
  { id: 'g5', n: 'Fire', c1: '#EF4444', c2: '#F59E0B' },
  { id: 'g6', n: 'Frost', c1: '#818CF8', c2: '#06D6A0' },
];

export const DEFAULT_SETTINGS = {
  privacy: { dms: true, online: true, friends: true, activity: true },
  notifs: { messages: true, mentions: true, sounds: true, desktop: false },
  access: { reducedMotion: false, fontSize: 14, compactMode: false, highContrast: false, screenReader: false },
  cloudKids: { enabled: false, mode: 'blur' },
  blocked: [],
  ignored: [],
};

export const UPDATES = [{
  id: 'v60', title: 'interClouder v6.0', changes: [
    '⟨/⟩ intercoder bridge — Custom .inex language',
    '🧠 Full INEX IDE with syntax highlighting',
    '🤖 Bot scripting with .inex files',
    '🧩 Plugin system with .inex hooks',
    '♿ Full accessibility (ARIA, keyboard nav, focus management)',
    '⚡ Migrated to Next.js',
    '🎨 Improved themes & contrast',
    '🏰 Early Server system (first 15K)',
    '⭐ Reputation engine (8 levels)',
    '👑 Visual Admin Panel',
    '📎 File attachments + security scan',
    '🔐 CloudKids age verification',
  ],
}];
