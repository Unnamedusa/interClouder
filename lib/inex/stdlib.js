/**
 * intercoder bridge — Standard Library
 * Built-in functions available in .inex scripts.
 *
 * Language: intercoder bridge (.inex)
 * Platform: interClouder Social Network
 */

export function createStdlib(interpreter) {
  return {
    // ── Output ──
    log: (...args) => {
      interpreter.log('log', ...args);
    },
    error: (...args) => {
      interpreter.log('error', ...args);
    },
    debug: (...args) => {
      interpreter.log('debug', ...args);
    },
    print: (...args) => {
      interpreter.log('log', ...args);
    },

    // ── Platform Actions (simulated) ──
    reply: (text) => {
      interpreter.log('action', `💬 Reply: ${text}`);
      return { type: 'reply', text };
    },
    send: (channel, text) => {
      interpreter.log('action', `📨 Send to ${channel}: ${text}`);
      return { type: 'send', channel, text };
    },
    delete: (target) => {
      interpreter.log('action', `🗑 Delete: ${interpreter.stringify(target)}`);
      return { type: 'delete', target };
    },
    warn: (user, reason) => {
      interpreter.log('action', `⚠️ Warn ${interpreter.stringify(user)}: ${reason || 'No reason'}`);
      return { type: 'warn', user, reason };
    },
    kick: (user, reason) => {
      interpreter.log('action', `👢 Kick ${interpreter.stringify(user)}: ${reason || 'No reason'}`);
      return { type: 'kick', user, reason };
    },
    ban: (user, reason, duration) => {
      interpreter.log('action', `🔨 Ban ${interpreter.stringify(user)}: ${reason || 'No reason'}${duration ? ' (' + duration + ')' : ''}`);
      return { type: 'ban', user, reason, duration };
    },
    mute: (user, duration) => {
      interpreter.log('action', `🔇 Mute ${interpreter.stringify(user)}${duration ? ' for ' + duration : ''}`);
      return { type: 'mute', user, duration };
    },
    unmute: (user) => {
      interpreter.log('action', `🔊 Unmute ${interpreter.stringify(user)}`);
      return { type: 'unmute', user };
    },
    assign_role: (user, role) => {
      interpreter.log('action', `🏷 Assign role "${role}" to ${interpreter.stringify(user)}`);
      return { type: 'assign_role', user, role };
    },
    remove_role: (user, role) => {
      interpreter.log('action', `🏷 Remove role "${role}" from ${interpreter.stringify(user)}`);
      return { type: 'remove_role', user, role };
    },
    create_channel: (name, type) => {
      interpreter.log('action', `📁 Create channel: #${name} (${type || 'text'})`);
      return { type: 'create_channel', name, channelType: type || 'text' };
    },
    set_topic: (channel, topic) => {
      interpreter.log('action', `📝 Set topic of ${channel}: ${topic}`);
      return { type: 'set_topic', channel, topic };
    },
    pin_message: (msgId) => {
      interpreter.log('action', `📌 Pin message: ${msgId}`);
      return { type: 'pin', msgId };
    },
    broadcast: (text) => {
      interpreter.log('action', `📢 Broadcast: ${text}`);
      return { type: 'broadcast', text };
    },

    // ── User/Server Data (simulated) ──
    get_user: (id) => {
      return { id, name: `User_${id}`, role: 'member', xp: 0, status: 'online' };
    },
    get_channel: (id) => {
      return { id, name: id.replace('#', ''), type: 'text', messages: 0 };
    },
    get_server: () => {
      return { name: 'Test Server', members: 0, channels: 0, created: Date.now() };
    },

    // ── String Utilities ──
    len: (v) => {
      if (typeof v === 'string' || Array.isArray(v)) return v.length;
      if (v && typeof v === 'object') return Object.keys(v).length;
      return 0;
    },
    upper: (s) => String(s).toUpperCase(),
    lower: (s) => String(s).toLowerCase(),
    trim: (s) => String(s).trim(),
    split: (s, sep) => String(s).split(sep || ' '),
    join: (arr, sep) => (Array.isArray(arr) ? arr : []).join(sep || ','),
    replace: (s, old, nw) => String(s).replaceAll(old, nw),
    contains: (s, sub) => {
      if (typeof s === 'string') return s.includes(sub);
      if (Array.isArray(s)) return s.includes(sub);
      return false;
    },
    starts_with: (s, pre) => String(s).startsWith(pre),
    ends_with: (s, suf) => String(s).endsWith(suf),
    regex_match: (s, pattern) => {
      try { return new RegExp(pattern).test(String(s)); } catch (_e) { return false; }
    },

    // ── Math ──
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    min: Math.min,
    max: Math.max,
    random: (a, b) => {
      if (a !== undefined && b !== undefined) return Math.floor(Math.random() * (b - a + 1)) + a;
      if (a !== undefined) return Math.floor(Math.random() * a);
      return Math.random();
    },
    sqrt: Math.sqrt,
    pow: Math.pow,

    // ── Array Utilities ──
    range: (start, end, step) => {
      if (end === undefined) { end = start; start = 0; }
      step = step || 1;
      const arr = [];
      for (let i = start; step > 0 ? i < end : i > end; i += step) arr.push(i);
      return arr;
    },
    push: (arr, ...items) => { arr.push(...items); return arr; },
    pop: (arr) => arr.pop(),
    shift: (arr) => arr.shift(),
    map: (arr, fn) => arr.map((item, i) => interpreter.callFunction(fn, [item, i], interpreter.globalEnv)),
    filter: (arr, fn) => arr.filter((item, i) => interpreter.isTruthy(interpreter.callFunction(fn, [item, i], interpreter.globalEnv))),
    reduce: (arr, fn, init) => {
      let acc = init;
      for (let i = 0; i < arr.length; i++) {
        acc = interpreter.callFunction(fn, [acc, arr[i], i], interpreter.globalEnv);
      }
      return acc;
    },
    sort: (arr, fn) => {
      if (fn) return [...arr].sort((a, b) => interpreter.callFunction(fn, [a, b], interpreter.globalEnv));
      return [...arr].sort();
    },
    reverse: (arr) => [...arr].reverse(),
    flat: (arr) => arr.flat(),
    unique: (arr) => [...new Set(arr)],
    slice: (arr, start, end) => arr.slice(start, end),
    find: (arr, fn) => arr.find((item, i) => interpreter.isTruthy(interpreter.callFunction(fn, [item, i], interpreter.globalEnv))),
    count: (v) => {
      if (Array.isArray(v)) return v.length;
      if (typeof v === 'string') return v.length;
      if (v && typeof v === 'object') return Object.keys(v).length;
      return 0;
    },

    // ── Object Utilities ──
    keys: (obj) => Object.keys(obj || {}),
    values: (obj) => Object.values(obj || {}),
    entries: (obj) => Object.entries(obj || {}),
    merge: (...objs) => Object.assign({}, ...objs),
    has_key: (obj, key) => obj && typeof obj === 'object' && key in obj,
    clone: (obj) => JSON.parse(JSON.stringify(obj)),

    // ── Type Checks ──
    type: (v) => {
      if (v === null) return 'null';
      if (Array.isArray(v)) return 'list';
      if (v && v.__type === 'function') return 'function';
      return typeof v;
    },
    is_string: (v) => typeof v === 'string',
    is_number: (v) => typeof v === 'number',
    is_bool: (v) => typeof v === 'boolean',
    is_list: (v) => Array.isArray(v),
    is_map: (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && (!v.__type),
    is_null: (v) => v === null || v === undefined,
    is_fn: (v) => typeof v === 'function' || (v && v.__type === 'function'),

    // ── Conversion ──
    to_string: (v) => interpreter.stringify(v),
    to_number: (v) => Number(v) || 0,
    to_bool: (v) => interpreter.isTruthy(v),
    parse_int: (s) => parseInt(s) || 0,
    parse_float: (s) => parseFloat(s) || 0,

    // ── Time ──
    now: () => Date.now(),
    timestamp: () => Math.floor(Date.now() / 1000),
    format_time: (ms) => new Date(ms).toLocaleString(),
    sleep: (ms) => {
      interpreter.log('system', `⏱ Sleep ${ms}ms (simulated)`);
      return ms;
    },

    // ── Moderation helpers ──
    contains_spam: (text) => {
      const patterns = [/(.)\1{5,}/i, /\b(buy|free|click|subscribe)\b/i, /(https?:\/\/){2,}/i];
      return patterns.some(p => p.test(String(text)));
    },
    contains_profanity: (text) => {
      const words = 'fuck shit ass bitch damn hell dick'.split(' ');
      const lower = String(text).toLowerCase();
      return words.some(w => lower.includes(w));
    },
    sanitize: (text) => {
      return String(text).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c]);
    },

    // ── Platform Constants ──
    VERSION: '6.0.0',
    PLATFORM: 'interClouder',
    LANGUAGE: 'intercoder bridge',
    MAX_MSG_LENGTH: 4000,
    MAX_EMBED_SIZE: 6000,
    ROLES: ['ceo', 'admin', 'smod', 'mod', 'vip', 'boost', 'member', 'cloud'],

    // ── Embed builder ──
    embed: (opts) => {
      const e = {
        __type: 'embed',
        title: opts.title || '',
        description: opts.description || opts.desc || '',
        color: opts.color || '#A855F7',
        fields: opts.fields || [],
        footer: opts.footer || null,
        image: opts.image || null,
        timestamp: opts.timestamp || Date.now(),
      };
      interpreter.log('action', `📋 Embed: "${e.title}"`);
      return e;
    },
  };
}
