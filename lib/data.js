/* interClouder v6.3 — Data Layer (Complete + Friends, Reports, MS, Stealth, Emulator) */

export const ROLES = {
  ceo:    { n: 'CEO',         c: '#FFD700', i: '👑', lv: 100, p: ['*'] },
  admin:  { n: 'Admin',       c: '#EF4444', i: '🛡',  lv: 90,  p: ['manage_server','manage_roles','manage_channels','manage_messages','kick','ban','mute','view_audit','manage_emojis','manage_stickers','manage_logicboards','quantum_text','edit_any','delete_any','view_trash','restore_messages','perm_delete','stealth_view','disable_account','emulate_account','approve_minor_friend','view_reports'] },
  smod:   { n: 'Sr. Mod',     c: '#F59E0B', i: '⚔',  lv: 80,  p: ['manage_messages','kick','ban','mute','view_audit','quantum_text','edit_any','delete_any','view_trash','restore_messages','stealth_view','disable_account','emulate_account','approve_minor_friend','view_reports'] },
  mod:    { n: 'Moderator',   c: '#22C55E', i: '🔧', lv: 70,  p: ['manage_messages','kick','mute','view_audit','quantum_text','edit_any','delete_any','view_trash','restore_messages','stealth_view','approve_minor_friend','view_reports'] },
  vip:    { n: 'VIP',         c: '#A855F7', i: '💎', lv: 50,  p: ['embed_links','attach_files','ext_emoji'] },
  boost:  { n: 'Booster',     c: '#EC4899', i: '🚀', lv: 40,  p: ['embed_links','ext_emoji','custom_banner'] },
  member: { n: 'Member',      c: '#818CF8', i: '👤', lv: 10,  p: ['send_messages','read_messages','add_reactions','use_emoji'] },
  cloud:  { n: 'Cloud',       c: '#4a4460', i: '☁',  lv: 0,   p: ['read_messages'] },
};

export function getRolePerms(role) {
  const r = ROLES[role]; if (!r) return [];
  if (r.p.includes('*')) { const all = new Set(); Object.values(ROLES).forEach(x => x.p.forEach(p => { if (p !== '*') all.add(p); })); return [...all]; }
  const perms = new Set();
  const levels = Object.entries(ROLES).sort((a, b) => a[1].lv - b[1].lv);
  for (const [, v] of levels) { v.p.forEach(p => perms.add(p)); if (v.lv >= r.lv) break; }
  r.p.forEach(p => perms.add(p));
  return [...perms].filter(p => p !== '*');
}

export function hasPermission(user, perm) {
  if (!user || !user.role) return false;
  const r = ROLES[user.role];
  if (!r) return false;
  if (r.p.includes('*')) return true;
  return getRolePerms(user.role).includes(perm);
}

export function isModPlus(user) {
  if (!user || !user.role) return false;
  return (ROLES[user.role]?.lv || 0) >= 70;
}

export const BADGES = {
  founder: { l: 'Founder', i: '⬡', c: '#FFD700' }, early: { l: 'Early Adopter', i: '🌅', c: '#F59E0B' },
  dev: { l: 'Developer', i: '⟨/⟩', c: '#22C55E' }, bug: { l: 'Bug Hunter', i: '🐛', c: '#EF4444' },
  nitro: { l: 'Airbound', i: '🎐', c: '#A855F7' }, elite: { l: 'Elite', i: '💠', c: '#6366F1' },
  omega: { l: 'Omega', i: '♾', c: '#EC4899' }, gifted: { l: 'Gifted', i: '🎁', c: '#14B8A6' },
  boost1: { l: 'Boost I', i: '⚡', c: '#F472B6' }, boost2: { l: 'Boost II', i: '⚡', c: '#C084FC' },
  boost3: { l: 'Boost III', i: '⚡', c: '#818CF8' }, mod_b: { l: 'Moderator', i: '🔧', c: '#22C55E' },
  artist: { l: 'Artist', i: '🎨', c: '#FB923C' }, streamer: { l: 'Streamer', i: '📡', c: '#EF4444' },
  helper: { l: 'Helper', i: '💡', c: '#FBBF24' }, inex_dev: { l: 'INEX Dev', i: '⟨/⟩', c: '#06D6A0' },
  party_engager: { l: 'PartyEngager', i: '🎊', c: '#FF6B6B', desc: 'Eventos, gifts y comunidad' },
  party_beast: { l: 'PartyBeast', i: '🔥', c: '#FF4500', sub: 'party_engager', desc: 'Eventos animados y hype' },
  party_introvert: { l: 'PartyIntrovert', i: '💻', c: '#7C3AED', sub: 'party_engager', desc: 'Eventos de coding y tech' },
  party_boomer: { l: 'PartyBoomer', i: '🎉', c: '#F59E0B', sub: 'party_engager', desc: 'Eventos comunes y variados' },
};

/* ═══ PARTY BADGE SYSTEM ═══ */
export const PARTY_SYSTEM = {
  mainBadge: 'party_engager',
  subBadges: ['party_beast', 'party_introvert', 'party_boomer'],
  cloudKidsBlocked: true,
  equalPerks: true,
  descriptions: {
    party_beast: { name: 'PartyBeast', icon: '🔥', color: '#FF4500', tagline: 'Los más animados de interClouder', events: 'Eventos hype, competiciones, raids comunitarios, voice chats épicos', vibe: 'Energía pura, diversión a tope' },
    party_introvert: { name: 'PartyIntrovert', icon: '💻', color: '#7C3AED', tagline: 'Para los que prefieren crear', events: 'Code jams, hackathons, INEX workshops, tech talks, debugging sessions', vibe: 'Creatividad, código y comunidad tranquila' },
    party_boomer: { name: 'PartyBoomer', icon: '🎉', color: '#F59E0B', tagline: 'Un poco de todo, para todos', events: 'Gifts, sorteos, chatting sessions, voice hangouts, juegos casuales', vibe: 'Relajado, variado y divertido' },
  },
  quiz: [
    { q: '¿Qué prefieres en un viernes por la noche?', o: [
      { t: 'Evento en vivo con música y gente', s: 'beast' },
      { t: 'Programar un proyecto personal', s: 'introvert' },
      { t: 'Charlar con amigos en un voice chat', s: 'boomer' },
    ]},
    { q: '¿Qué tipo de evento te emociona más?', o: [
      { t: 'Competición o raid grupal', s: 'beast' },
      { t: 'Hackathon o code jam', s: 'introvert' },
      { t: 'Sorteo de regalos o trivia', s: 'boomer' },
    ]},
    { q: '¿Cómo describes tu energía?', o: [
      { t: 'Siempre al 100%, hype constante', s: 'beast' },
      { t: 'Tranquilo pero concentrado', s: 'introvert' },
      { t: 'Depende del día, flexible', s: 'boomer' },
    ]},
    { q: '¿Qué regalo preferirías recibir?', o: [
      { t: 'Acceso VIP a un evento exclusivo', s: 'beast' },
      { t: 'Licencia de software o curso de programación', s: 'introvert' },
      { t: 'Gift card o suscripción de algo útil', s: 'boomer' },
    ]},
    { q: '¿Tu emoji favorito?', o: [
      { t: '🔥 Fire', s: 'beast' },
      { t: '💻 Laptop', s: 'introvert' },
      { t: '🎉 Party', s: 'boomer' },
    ]},
  ],
  getResult(answers) {
    const scores = { beast: 0, introvert: 0, boomer: 0 };
    answers.forEach(a => { if (scores[a] !== undefined) scores[a]++; });
    const max = Math.max(...Object.values(scores));
    const winner = Object.entries(scores).find(([, v]) => v === max);
    return 'party_' + (winner ? winner[0] : 'boomer');
  },
};

export const PLANS = {
  air:   { id: 'air',   n: 'Airbound',       i: '🎐', c: '#A855F7', tier: 1, monthly: 4.99, annual: 49.99,
    perks: ['Custom profile banner','Animated avatar','Upload up to 25MB','50 custom server emojis','Extended history','Priority support','Glitch font'],
    unlocks: { fileLimit: 25, emojiSlots: 50, stickerSlots: 10, fancyFont: false, gradientFont: false, boardedText: false } },
  elite: { id: 'elite', n: 'Airbound Elite',  i: '💠', c: '#6366F1', tier: 2, monthly: 9.99, annual: 99.99,
    perks: ['Everything in Air','Fancy font styles','Bordered text','Upload 100MB','150 custom emojis','30 stickers','Custom invite URL','Decoration tags','Pixelated + Highlighted fonts'],
    unlocks: { fileLimit: 100, emojiSlots: 150, stickerSlots: 30, fancyFont: true, gradientFont: false, boardedText: true } },
  omega: { id: 'omega', n: 'Airbound Omega',  i: '♾', c: '#EC4899', tier: 3, monthly: 14.99, annual: 149.99,
    perks: ['Everything in Elite','Gradient fonts','Custom gradient presets','Upload 500MB','300 emojis','100 stickers','Custom server URL','Animated banner','Wave + Inverted fonts','Omega badge'],
    unlocks: { fileLimit: 500, emojiSlots: 300, stickerSlots: 100, fancyFont: true, gradientFont: true, boardedText: true } },
};

export function getUserTier(user) { if (!user || !user.premium) return 0; return PLANS[user.premium]?.tier || 0; }
export function hasUnlock(user, key) { if (!user || !user.premium) return false; return PLANS[user.premium]?.unlocks?.[key] || false; }
export function getFileLimit(user) {
  const tier = getUserTier(user);
  if (tier >= 3) return { maxMB: 500, label: '500MB max' };
  if (tier >= 2) return { maxMB: 100, label: '100MB max' };
  if (tier >= 1) return { maxMB: 25, label: '25MB max' };
  return { maxMB: 8, label: '8MB max' };
}

export const FRIEND_SYSTEM = {
  requestStates: ['pending', 'accepted', 'rejected', 'blocked'],
  blockModes: { all: 'Block all requests', server_only: 'Only mutual servers', none: 'Accept all' },
  minorRestrictions: { requiresApproval: true, approvalRoles: ['ceo', 'admin', 'smod', 'mod'] },
};

export const REPORT_SYSTEM = {
  reasons: [
    { id: 'spam', label: 'Spam or phishing', icon: '📧' },
    { id: 'harass', label: 'Harassment or bullying', icon: '⚠' },
    { id: 'hate', label: 'Hate speech', icon: '🚫' },
    { id: 'nsfw', label: 'Inappropriate content (NSFW)', icon: '🔞' },
    { id: 'threat', label: 'Threats or violence', icon: '⚡' },
    { id: 'impersonate', label: 'Impersonation', icon: '🎭' },
    { id: 'minor_safety', label: 'Minor safety concern', icon: '🛡' },
    { id: 'scam', label: 'Scam or fraud', icon: '💰' },
    { id: 'exploit', label: 'Bug exploit or hacking', icon: '🐛' },
    { id: 'other', label: 'Other', icon: '📋' },
  ],
  descMinChars: 20, descMaxChars: 500, descMinLines: 2, descMaxLines: 10,
  maxEvidence: 3, evidenceTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
  falseReportPenalty: { first: 'Warning + 1 strike', repeated: 'Temp ban 7d', severe: 'Permanent ban' },
};

export const STEALTH_MODE = {
  minRole: 'mod', features: { invisiblePresence: true, noTypingIndicator: true, chatDisabled: true, noReadReceipts: true, silentNavigation: true },
  restrictions: ['Cannot send messages', 'Cannot react', 'Cannot modify', 'Typing hidden', 'Presence hidden'],
  auditLog: true,
};

export const ACCOUNT_EMULATOR = {
  minRole: 'smod',
  canView: ['messages', 'friends', 'dms', 'serverList', 'profile', 'badges'],
  cannotView: ['passwords', 'email_full', 'payment_info', 'security_tokens', '2fa_codes', 'ip_addresses'],
  cannotDo: ['download_files', 'export_data', 'modify_account', 'send_messages'],
  sandboxed: true, noExternalFiles: true, auditTrail: true, requiresDisabledAccount: true,
};

export const MANDAMENT_SYSTEM = {
  name: 'Mandament Sistematics', shortName: 'MS', version: '1.0.0',
  sections: [
    { title: 'I. Respeto y Convivencia', icon: '🤝', rules: ['Trata a todos con respeto y dignidad sin importar su origen.', 'No se permite acoso, bullying, odio, amenazas ni discriminación.', 'Resuelve conflictos civilizadamente o usa el sistema de reportes.'] },
    { title: 'II. Contenido y Seguridad', icon: '🔒', rules: ['No compartas contenido ilegal, explícito no autorizado ni material peligroso.', 'NSFW solo en canales marcados, nunca accesible para menores (CloudKids).', 'No compartas información personal de otros sin consentimiento.', 'Usa Scramble/Spoiler para contenido sensible.'] },
    { title: 'III. Integridad de Cuentas', icon: '🛡', rules: ['Una cuenta principal por persona. Multicuentas para evadir sanciones = ban.', 'No hackear, explotar bugs ni acceder a cuentas ajenas.', 'Menores (CloudKids) no pueden comprar ni agregar amigos sin verificación de un superior.'] },
    { title: 'IV. Reportes y Justicia', icon: '⚖', rules: ['Los reportes falsos son infracción grave: pueden causar suspensión temporal o permanente.', 'Todo usuario puede apelar sanciones por el sistema oficial.', 'Adjunta evidencia cuando reportes si es posible.'] },
    { title: 'V. Comercio y Suscripciones', icon: '💎', rules: ['Airbound es suscripción con renovación automática. Cancela desde Ajustes.', 'Transacciones fraudulentas y venta de cuentas están prohibidas.', 'Menores no pueden comprar sin autorización de un tutor verificado.'] },
    { title: 'VI. Código y Automatización', icon: '⟨/⟩', rules: ['Logic-Boards e INEX deben usarse responsablemente. Código malicioso prohibido.', 'No usar bots para spam, raids o manipulación de sistemas.', 'El IDE Insert tiene filtros de moderación; evadirlos es infracción.'] },
    { title: 'VII. Privacidad y Datos', icon: '🔐', rules: ['interClouder cifra y protege tus datos.', 'No recopiles datos de otros sin autorización.', 'Stealth de moderadores es exclusivo para seguridad y está auditado.'] },
  ],
  acceptance: { required: true, mustReadAll: false, mustAccept: true },
};

export const MODERATION_MANDAMENT = {
  name: "Moderation's Mandament System", shortName: 'MMS', version: '1.0.0',
  sections: [
    { title: 'I. Deber de Imparcialidad', icon: '⚖', rules: ['Toda moderación debe ser imparcial. No uses poderes para beneficio personal.', 'Documenta tus acciones. El audit log es obligatorio y será revisado.', 'Si hay conflicto de interés, delega a otro moderador.'] },
    { title: 'II. Uso del Modo Stealth', icon: '👁', rules: ['Stealth es exclusivo para investigaciones de seguridad y moderación.', 'Nunca espíes conversaciones privadas sin justificación de seguridad.', 'Toda sesión Stealth queda registrada. El abuso = remoción inmediata.'] },
    { title: 'III. Emulador de Cuentas', icon: '🔍', rules: ['Solo accede a cuentas deshabilitadas cuando sea necesario para investigación.', 'No descargues archivos ni accedas a info financiera o contraseñas.', 'Puedes ver mensajes, amigos y DMs para verificar infracciones.', 'Cada acceso queda registrado con tu ID, timestamp y motivo.'] },
    { title: 'IV. Protección de Menores', icon: '🛡', rules: ['Seguridad de menores es prioridad absoluta.', 'Evalúa cuidadosamente solicitudes de amistad de menores.', 'Reporta inmediatamente cualquier intento de grooming o explotación.'] },
    { title: 'V. Sanciones Proporcionadas', icon: '⚡', rules: ['Aplica sanciones proporcionadas. Sigue la escala de strikes.', 'Antes de ban permanente, asegúrate de pruebas sólidas.', 'Los usuarios siempre deben conocer el motivo de su sanción.'] },
    { title: 'VI. Responsabilidad', icon: '📋', rules: ['Estás sujeto al MS + MMS. Incumplimiento = remoción y posible ban.', 'Tus acciones representan a interClouder. Actúa con profesionalismo.'] },
  ],
  acceptance: { required: true, mustReadAll: true, mustAccept: true },
};

export const DEFAULT_EMOJIS = [
  { id: 'smile', e: '😊', n: 'smile', cat: 'faces' }, { id: 'laugh', e: '😂', n: 'laugh', cat: 'faces' },
  { id: 'heart', e: '❤️', n: 'heart', cat: 'faces' }, { id: 'fire', e: '🔥', n: 'fire', cat: 'nature' },
  { id: 'thumbsup', e: '👍', n: 'thumbs up', cat: 'hands' }, { id: 'thumbsdown', e: '👎', n: 'thumbs down', cat: 'hands' },
  { id: 'clap', e: '👏', n: 'clap', cat: 'hands' }, { id: 'wave', e: '👋', n: 'wave', cat: 'hands' },
  { id: 'thinking', e: '🤔', n: 'thinking', cat: 'faces' }, { id: 'cry', e: '😢', n: 'cry', cat: 'faces' },
  { id: 'angry', e: '😡', n: 'angry', cat: 'faces' }, { id: 'cool', e: '😎', n: 'cool', cat: 'faces' },
  { id: 'wink', e: '😉', n: 'wink', cat: 'faces' }, { id: 'skull', e: '💀', n: 'skull', cat: 'faces' },
  { id: 'eyes', e: '👀', n: 'eyes', cat: 'faces' }, { id: 'rocket', e: '🚀', n: 'rocket', cat: 'objects' },
  { id: 'star', e: '⭐', n: 'star', cat: 'nature' }, { id: 'lightning', e: '⚡', n: 'lightning', cat: 'nature' },
  { id: 'check', e: '✅', n: 'check', cat: 'symbols' }, { id: 'cross', e: '❌', n: 'cross', cat: 'symbols' },
  { id: 'party', e: '🎉', n: 'party', cat: 'objects' }, { id: 'crown', e: '👑', n: 'crown', cat: 'objects' },
  { id: 'gem', e: '💎', n: 'gem', cat: 'objects' }, { id: 'sparkles', e: '✨', n: 'sparkles', cat: 'nature' },
  { id: 'hundred', e: '💯', n: 'hundred', cat: 'symbols' }, { id: 'brain', e: '🧠', n: 'brain', cat: 'faces' },
  { id: 'ghost', e: '👻', n: 'ghost', cat: 'faces' }, { id: 'alien', e: '👽', n: 'alien', cat: 'faces' },
  { id: 'devil', e: '😈', n: 'devil', cat: 'faces' }, { id: 'rainbow', e: '🌈', n: 'rainbow', cat: 'nature' },
  { id: 'moon', e: '🌙', n: 'moon', cat: 'nature' }, { id: 'sun', e: '☀️', n: 'sun', cat: 'nature' },
  { id: 'music', e: '🎵', n: 'music', cat: 'objects' }, { id: 'key', e: '🔑', n: 'key', cat: 'objects' },
  { id: 'lock', e: '🔒', n: 'lock', cat: 'objects' }, { id: 'bulb', e: '💡', n: 'lightbulb', cat: 'objects' },
  { id: 'pin', e: '📌', n: 'pin', cat: 'objects' }, { id: 'bell', e: '🔔', n: 'bell', cat: 'objects' },
  { id: 'mega', e: '📢', n: 'megaphone', cat: 'objects' }, { id: 'shrug', e: '🤷', n: 'shrug', cat: 'faces' },
  { id: 'pray', e: '🙏', n: 'pray', cat: 'hands' }, { id: 'love', e: '🥰', n: 'love', cat: 'faces' },
  { id: 'nerd', e: '🤓', n: 'nerd', cat: 'faces' }, { id: 'sob', e: '😭', n: 'sob', cat: 'faces' },
  { id: 'salute', e: '🫡', n: 'salute', cat: 'faces' }, { id: 'ok', e: '👌', n: 'ok', cat: 'hands' },
  { id: 'peace', e: '✌️', n: 'peace', cat: 'hands' }, { id: 'sweat', e: '😅', n: 'sweat', cat: 'faces' },
  { id: 'zany', e: '🤪', n: 'zany', cat: 'faces' }, { id: 'fist', e: '✊', n: 'fist', cat: 'hands' },
];

export const EMOJI_CATEGORIES = ['faces', 'hands', 'nature', 'objects', 'symbols'];
export const REACTION_EMOJIS = ['👍','👎','😂','❤️','🔥','😢','😡','🎉','💯','👀','✅','❌','🚀','💀','🤔','👏','💎','⭐','😎','🤯'];

export const STICKERS = [
  { id: 'stk_wave', emoji: '👋', name: 'Big Wave' }, { id: 'stk_party', emoji: '🎉', name: 'Party Time' },
  { id: 'stk_fire', emoji: '🔥', name: 'On Fire' }, { id: 'stk_heart', emoji: '❤️', name: 'Big Heart' },
  { id: 'stk_skull', emoji: '💀', name: 'Dead' }, { id: 'stk_rocket', emoji: '🚀', name: 'Launch' },
  { id: 'stk_brain', emoji: '🧠', name: 'Big Brain' }, { id: 'stk_ghost', emoji: '👻', name: 'Spooky' },
  { id: 'stk_crown', emoji: '👑', name: 'Royal' }, { id: 'stk_gem', emoji: '💎', name: 'Precious' },
  { id: 'stk_eyes', emoji: '👀', name: 'Side Eye' }, { id: 'stk_100', emoji: '💯', name: 'Perfect' },
];

export const FONT_TYPES = {
  remached:    { id: 'remached',    icon: '𝐑', name: 'Remached',    desc: 'Bold text',                syntax: '**text**',                          minTier: 0 },
  curved:      { id: 'curved',      icon: '𝘊', name: 'Curved',      desc: 'Italic text',               syntax: '*text*',                            minTier: 0 },
  encoded:     { id: 'encoded',     icon: '⟨⟩', name: 'Encoded',    desc: 'Inline code',               syntax: '`code`',                            minTier: 0 },
  terminal:    { id: 'terminal',    icon: '▣', name: 'Terminal',     desc: 'Code block + lang',         syntax: '```lang\\ncode\\n```',               minTier: 0 },
  scramble:    { id: 'scramble',    icon: '▓', name: 'Scramble',     desc: 'Spoiler (blur/box)',         syntax: '||spoiler||',                       minTier: 0 },
  resize:      { id: 'resize',      icon: '↕', name: 'Resize',       desc: 'Resize (10-48px)',          syntax: '{size:24}text{/size}',              minTier: 0 },
  crossed:     { id: 'crossed',     icon: 'X̶', name: 'Crossed',      desc: 'Strikethrough',             syntax: '~~text~~',                          minTier: 0 },
  underlined:  { id: 'underlined',  icon: 'U̲', name: 'Underlined',  desc: 'Underline',                 syntax: '__text__',                          minTier: 0 },
  elevated:    { id: 'elevated',    icon: 'X²', name: 'Elevated',   desc: 'Superscript',               syntax: '^text^',                            minTier: 0 },
  highlighted: { id: 'highlighted', icon: '◼', name: 'Highlighted', desc: 'Highlight bg',              syntax: '==text==',                          minTier: 0 },
  glitch:      { id: 'glitch',      icon: '▦', name: 'Glitch',       desc: 'Glitch anim',               syntax: '~~~text~~~',                        minTier: 1 },
  boarded:     { id: 'boarded',     icon: '☐', name: 'Boarded',      desc: 'Bordered',                  syntax: '{border:#c}text{/border}',          minTier: 2 },
  stylized:    { id: 'stylized',    icon: '◆', name: 'Stylized',     desc: 'Color/gradient',            syntax: '{color:#hex}text{/color}',          minTier: 3 },
  pixelated:   { id: 'pixelated',   icon: '▪', name: 'Pixelated',    desc: '8-bit pixel',               syntax: '{pixel}text{/pixel}',               minTier: 2 },
  wave_t:      { id: 'wave_t',      icon: '〰', name: 'Wave',         desc: 'Wavy animation',            syntax: '{wave}text{/wave}',                 minTier: 3 },
  inverted:    { id: 'inverted',    icon: '◇', name: 'Inverted',     desc: 'Inverted colors',           syntax: '{invert}text{/invert}',             minTier: 3 },
  quantum:     { id: 'quantum',     icon: '◈', name: 'Quantum',      desc: 'Encrypted (mod+)',          syntax: '{quantum:@user}text{/quantum}',     minTier: 0, requiresPerm: true, requiredPerm: 'quantum_text' },
};

export const CODE_LANGUAGES = [
  { id: 'js', name: 'JavaScript', color: '#F7DF1E' }, { id: 'ts', name: 'TypeScript', color: '#3178C6' },
  { id: 'py', name: 'Python', color: '#3776AB' }, { id: 'java', name: 'Java', color: '#ED8B00' },
  { id: 'rust', name: 'Rust', color: '#CE422B' }, { id: 'go', name: 'Go', color: '#00ADD8' },
  { id: 'cpp', name: 'C++', color: '#00599C' }, { id: 'html', name: 'HTML', color: '#E34F26' },
  { id: 'css', name: 'CSS', color: '#1572B6' }, { id: 'inex', name: 'InterCoder', color: '#C084FC' },
  { id: 'json', name: 'JSON', color: '#292929' }, { id: 'bash', name: 'Bash', color: '#4EAA25' },
  { id: 'sql', name: 'SQL', color: '#CC2927' }, { id: 'custom', name: 'Custom', color: '#6B7280' },
];

export const IDE_INSERT = {
  modFilter: { maxLines: 100, maxChars: 5000, blocked: [/eval\s*\(/i, /exec\s*\(/i, /system\s*\(/i, /rm\s+-rf/i, /__import__/i, /os\.system/i, /Runtime\.getRuntime/i, /ProcessBuilder/i] },
  modBypass: ['ceo', 'admin', 'smod'],
  validate(code, role) {
    if (this.modBypass.includes(role)) return { ok: true };
    const lines = code.split('\n').length;
    if (lines > this.modFilter.maxLines) return { ok: false, reason: 'Max ' + this.modFilter.maxLines + ' lines' };
    if (code.length > this.modFilter.maxChars) return { ok: false, reason: 'Max ' + this.modFilter.maxChars + ' chars' };
    for (const p of this.modFilter.blocked) if (p.test(code)) return { ok: false, reason: 'Blocked pattern detected' };
    return { ok: true };
  },
};

export const LOGIC_BOARDS = {
  limits: { free: 3, air: 10, elite: 25, omega: 50 },
  codeLimits: { free: 500, air: 2000, elite: 5000, omega: 15000 },
  cooldown: { free: 60, air: 30, elite: 10, omega: 5 },
  modBypass: ['ceo', 'admin', 'smod'],
  getLimit(tier) { return this.limits[tier] || this.limits.free; },
  getCodeLimit(tier) { return this.codeLimits[tier] || this.codeLimits.free; },
};

export const MSG_TRASH = { retentionDays: 30, maxPerServer: 500 };
export const SCRAMBLE_CONFIG = { modes: ['blur', 'blackbox'], minorRestricted: true, imageScramble: true };

export const SERVER_EMOJI_LIMITS = {
  levels: [
    { n: 'Starter', min: 0, emojis: 15 }, { n: 'Growing', min: 50, emojis: 30 },
    { n: 'Active', min: 200, emojis: 75 }, { n: 'Popular', min: 500, emojis: 150 },
    { n: 'Large', min: 1000, emojis: 300 }, { n: 'Massive', min: 5000, emojis: 500 },
  ],
  getServerLevel(mc) { return [...this.levels].reverse().find(l => mc >= l.min) || this.levels[0]; },
};

export const EXTERNAL_PERMS = {
  send: { id: 'ext_emoji_send', name: 'Allow External Emojis', subPerms: [{ id: 'ext_emoji_send_public', name: 'Public emojis' }, { id: 'ext_emoji_send_airbound', name: 'Airbound emojis' }] },
  receive: { id: 'ext_content_recv', name: 'Receive External Content', subPerms: [{ id: 'ext_content_recv_public', name: 'Public content' }, { id: 'ext_content_recv_airbound', name: 'Airbound content' }] },
};

export const INEX_SPEC = {
  version: '2.0.0', description: 'InterCoder — cultural-linguistic programming',
  syntax: {
    imports: { external: 'add <lang> <extras>', modules: 'import <mod> with <mod2> and <mod3>' },
    symbols: { "'": 'String', '"': 'Maths', ':': 'Final separation', ';': 'Multi-colon', '.': 'Separation', ',': 'Code separation' },
    assignment: '<var> : <type> = call to "<source>"',
    modules: ['maths', 'string', 'compat', 'crypto', 'net', 'file', 'ui', 'audio', 'visual', 'compress'],
    compatLangs: ['java', 'javascript', 'python', 'rust', 'go', 'cpp'],
  },
  javaCompat: { enabled: true, features: ['compression', 'math_operations', 'string_processing', 'data_structures', 'threading'], compressionMethods: ['gzip', 'deflate', 'lz4', 'zstd'] },
};

export const REP = {
  levels: [
    { n: 'Toxic', c: '#EF4444', i: '☣', min: -999 }, { n: 'Untrusted', c: '#F97316', i: '⚠', min: -100 },
    { n: 'Cautious', c: '#F59E0B', i: '👁', min: -10 }, { n: 'Neutral', c: '#6B7280', i: '●', min: 0 },
    { n: 'Trusted', c: '#22C55E', i: '✓', min: 50 }, { n: 'Respected', c: '#3B82F6', i: '★', min: 200 },
    { n: 'Elite', c: '#A855F7', i: '◆', min: 500 }, { n: 'Legendary', c: '#FFD700', i: '♛', min: 1000 },
  ],
  calc(u) { const xp=(u.xp||0)/10; const days=u.created?Math.floor((Date.now()-u.created)/86400000):0; const msgs=(u.msgs||0)/5; const badges=((u.badges||[]).length)*3; const premium=u.premium?10:0; const strikes=(u.strikes||0)*15; return Math.round(xp+days+msgs+badges+premium-strikes); },
  level(rep) { return [...this.levels].reverse().find(l => rep >= l.min) || this.levels[0]; },
};

export const STRIKES = [
  { n: 0, a: 'Clean', c: '#22C55E' }, { n: 1, a: 'Warning', c: '#F59E0B' },
  { n: 2, a: 'Mute 10m', c: '#F97316' }, { n: 3, a: 'Mute 1h', c: '#F97316' },
  { n: 4, a: 'Mute 24h', c: '#EF4444' }, { n: 5, a: 'Temp Ban 7d', c: '#EF4444' },
  { n: 6, a: 'Temp Ban 30d', c: '#DC2626' }, { n: 7, a: 'Permanent Ban', c: '#991B1B' },
];

export const SLOWMODES = [0, 5, 10, 15, 30, 60, 120, 300];
export function smLabel(s) { if (s === 0) return 'Off'; if (s < 60) return s + 's'; return Math.floor(s / 60) + 'm'; }
export const FILE_SEC = { scan: true, maxSize: 500, blocked: ['.exe','.bat','.cmd','.scr','.com','.vbs','.msi','.dll','.sys'] };
export const FILE_LIMITS = { free: 8, air: 25, elite: 100, omega: 500 };

export const CKIDS = {
  baseCount: 5, maxCount: 15, penalty: 3, timeLimit: 90,
  restrictions: { noPurchases: true, noFriendsWithoutApproval: true, noNSFW: true, noScrambleReveal: true },
  questions: [
    { q: 'What year was the internet publicly available?', o: ['1985','1991','2000','1975'], a: 1 },
    { q: 'Legal driving age in most US states?', o: ['14','15','16','18'], a: 2 },
    { q: 'Document filed annually with IRS?', o: ['Resume','Tax Return','Passport','Diploma'], a: 1 },
    { q: 'What is a mortgage?', o: ['Car insurance','Home loan','Credit card','Bank account'], a: 1 },
    { q: 'APR stands for?', o: ['Annual Payment Rate','Annual Percentage Rate','Applied Premium Rate','Auto Payment Record'], a: 1 },
    { q: 'US voting age?', o: ['16','17','18','21'], a: 2 },
    { q: 'What is a 401(k)?', o: ['Area code','Retirement plan','Tax form','Insurance policy'], a: 1 },
    { q: 'SSN issuing agency?', o: ['FBI','SSA','IRS','DMV'], a: 1 },
    { q: 'FICO measures?', o: ['Income','Credit score','Blood pressure','GPA'], a: 1 },
    { q: 'US legal drinking age?', o: ['18','19','20','21'], a: 3 },
  ],
};

export const KBS = [
  { k: 'Ctrl+,', d: 'Open Settings' }, { k: 'Ctrl+Shift+I', d: 'Toggle INEX IDE' },
  { k: 'Escape', d: 'Close modal/panel' }, { k: 'Ctrl+E', d: 'Toggle emoji picker' },
  { k: 'Ctrl+S', d: 'Toggle sticker picker' }, { k: 'Shift+↑', d: 'Edit last message' },
  { k: 'Ctrl+Shift+C', d: 'IDE Insert' }, { k: 'Ctrl+Enter', d: 'Run code (IDE)' },
  { k: 'Ctrl+Shift+S', d: 'Stealth Mode (Mod+)' }, { k: 'Ctrl+Shift+R', d: 'Reports (Mod+)' },
];

export const PLUGINS = [
  { id: 'log', i: '📋', n: 'Audit Log', d: 'Logs all server events' }, { id: 'lvl', i: '📊', n: 'Level System', d: 'XP and leveling' },
  { id: 'wel', i: '👋', n: 'Welcome Bot', d: 'Greet new members' }, { id: 'antsp', i: '🛡', n: 'Anti-Spam', d: 'Auto spam detection' },
  { id: 'music', i: '🎵', n: 'Music Player', d: 'Play music in voice' }, { id: 'polls', i: '📊', n: 'Polls', d: 'Create polls' },
  { id: 'inex_r', i: '⟨/⟩', n: 'INEX Runner', d: 'Run .inex scripts' },
];

export const BOTS = [
  { id: 'ava', i: '🤖', n: 'Ava', c: '#A855F7', d: 'AI assistant bot' },
  { id: 'guard', i: '🛡', n: 'Guardian', c: '#EF4444', d: 'Auto-moderation' },
  { id: 'tix', i: '🎫', n: 'Tix', c: '#22C55E', d: 'Ticket support' },
  { id: 'inex', i: '⟨/⟩', n: 'InexBot', c: '#06D6A0', d: 'Run .inex code' },
];

export const TEMPLATES = [
  { id: 'gaming', n: 'Gaming', i: '🎮', tc: ['general','gameplay','lfg','memes'], vc: ['lobby','team-1','team-2'], rl: [{ n: 'Gamer', c: '#22C55E' }] },
  { id: 'community', n: 'Community', i: '🌐', tc: ['general','introductions','events','media'], vc: ['hangout','events'], rl: [{ n: 'Active', c: '#3B82F6' }] },
  { id: 'creative', n: 'Creative', i: '🎨', tc: ['general','showcase','feedback','resources'], vc: ['collab','stream'], rl: [{ n: 'Artist', c: '#F59E0B' }] },
  { id: 'tech', n: 'Tech', i: '💻', tc: ['general','help','projects','inex-lab'], vc: ['pair-prog','standup'], rl: [{ n: 'Dev', c: '#06D6A0' }] },
  { id: 'blank', n: 'Blank', i: '📄', tc: ['general'], vc: ['voice'], rl: [] },
];

export const TRUST_ENGINE = {
  calc(srv) { const age = srv.created ? Math.floor((Date.now() - srv.created) / 86400000) : 0; return Math.min(age * 2 + (srv.xp || 0), 1000); },
  color(trust) { if (trust >= 800) return '#FFD700'; if (trust >= 500) return '#A855F7'; if (trust >= 200) return '#22C55E'; if (trust >= 50) return '#3B82F6'; return '#6B7280'; },
};

export const GRADIENTS = [
  { id: 'sunset', n: 'Sunset', g: 'linear-gradient(135deg,#F97316,#EC4899)' },
  { id: 'ocean', n: 'Ocean', g: 'linear-gradient(135deg,#06B6D4,#6366F1)' },
  { id: 'forest', n: 'Forest', g: 'linear-gradient(135deg,#22C55E,#14B8A6)' },
  { id: 'aurora', n: 'Aurora', g: 'linear-gradient(135deg,#A855F7,#06D6A0)' },
  { id: 'fire', n: 'Fire', g: 'linear-gradient(135deg,#EF4444,#F59E0B)' },
  { id: 'cosmic', n: 'Cosmic', g: 'linear-gradient(135deg,#6366F1,#EC4899,#F59E0B)' },
];

export const FONT_GRADIENTS = [
  { id: 'fg_sunset', n: 'Sunset', c: '#F97316,#EC4899' }, { id: 'fg_ice', n: 'Ice', c: '#06B6D4,#818CF8' },
  { id: 'fg_neon', n: 'Neon', c: '#A855F7,#22C55E' }, { id: 'fg_gold', n: 'Gold', c: '#F59E0B,#FFD700' },
  { id: 'fg_flame', n: 'Flame', c: '#EF4444,#F97316,#FBBF24' }, { id: 'fg_ocean', n: 'Ocean', c: '#0EA5E9,#6366F1,#A855F7' },
];

export const DEFAULT_SETTINGS = {
  privacy: { dms: 'friends', showActivity: true, showStatus: true, friendRequests: 'none' },
  notif: { desktop: true, sound: true, mentions: true },
  access: { reducedMotion: false, fontSize: 14, compactMode: false, highContrast: false },
  chat: { scrambleMode: 'blur' },
  subscription: null,
  blockedServersForRequests: [],
};

export const UPDATES = [{
  v: '6.3.0', title: 'interClouder v6.3 — Justice & Social Update',
  changes: [
    '📜 Mandament Sistematics (MS) — EULA for users',
    '🛡 Moderation Mandament System (MMS) for mods',
    '👥 Friend system with requests + verification',
    '🔍 Account Emulator for disabled accounts',
    '👁 Stealth/Spectator mode for mods',
    '🚨 Report system with evidence + mod alerts',
    '👶 CloudKids: verified friends, no purchases',
    '🎐 Airbound moved to Settings + confirmations',
    '☕ Java compat + compression via InterCoder',
    '⟨/⟩ InterCoder (.inex) v2 cultural-linguistic',
    '🔒 Security: Next.js 14.2.35 (CVE patches)',
    '😊 50+ emojis + reactions + stickers + 17 fonts',
    '♿ WCAG 2.1 AA accessibility maintained',
    '🎊 PartyEngager badge + 3 sub-badges (Beast/Introvert/Boomer)',
  ],
}];
