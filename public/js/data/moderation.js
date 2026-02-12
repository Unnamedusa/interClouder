/* ══════════════════════════════════════
   interClouder — Global Moderation System
   ══════════════════════════════════════ */

// ── Strike System (timeout translated) ──
window.IC_STRIKES = {
  levels: [
    { strikes: 1, action: "Warning", duration: null, desc: "First offense — verbal warning recorded" },
    { strikes: 2, action: "Strike", duration: "10m", desc: "10 minute timeout from chat" },
    { strikes: 3, action: "Strike", duration: "1h", desc: "1 hour timeout from all channels" },
    { strikes: 4, action: "Strike", duration: "24h", desc: "24 hour timeout, limited to read-only" },
    { strikes: 5, action: "Strike", duration: "7d", desc: "7 day timeout, server-wide restriction" },
    { strikes: 6, action: "Kick", duration: null, desc: "Kicked from server, can rejoin" },
    { strikes: 7, action: "Ban", duration: "30d", desc: "30 day ban from server" },
    { strikes: 8, action: "Permanent Ban", duration: "permanent", desc: "Permanent ban, no rejoin" },
  ],

  // Server-level strike records (mock)
  records: [
    { id:"str1", userId:"u4", serverId:"s1", strikes:2, reason:"Spam in #general", issuedBy:"u1", time:"2h ago", status:"active", expiresIn:"10m" },
    { id:"str2", userId:"u6", serverId:"s2", strikes:1, reason:"Minor rule violation", issuedBy:"u5", time:"1d ago", status:"expired", expiresIn:null },
  ],
};

// ── Global Moderation (Platform-wide) ──
window.IC_GLOBAL_MOD = {
  // Global actions that platform admins/mods can take
  actions: {
    global_warn:    { label: "Global Warning", icon: "⚠️", color: "#FBBF24", desc: "Warning visible across all servers", requiredRole: "moderator" },
    global_strike:  { label: "Global Strike", icon: "⚡", color: "#F59E0B", desc: "Platform-wide timeout", requiredRole: "senior_mod" },
    global_kick:    { label: "Global Kick", icon: "🔨", color: "#F43F5E", desc: "Removed from all servers temporarily", requiredRole: "senior_admin" },
    global_ban:     { label: "Global Ban", icon: "🚫", color: "#EF4444", desc: "Banned from platform, account disabled", requiredRole: "chief_mod" },
    account_disable:{ label: "Disable Account", icon: "🔒", color: "#DC2626", desc: "Account suspended (14 day recovery)", requiredRole: "admin" },
    account_delete: { label: "Delete Account", icon: "💀", color: "#991B1B", desc: "Permanent deletion (CEO can recover from trash)", requiredRole: "senior_admin" },
  },

  // Reputation system
  reputation: {
    levels: [
      { score: 0,   label: "New",        color: "#6B7280", icon: "○" },
      { score: 50,  label: "Trusted",     color: "#818CF8", icon: "◇" },
      { score: 150, label: "Respected",   color: "#06D6A0", icon: "◈" },
      { score: 300, label: "Honored",     color: "#A855F7", icon: "⬢" },
      { score: 500, label: "Legendary",   color: "#FBBF24", icon: "⬡" },
      { score: 1000,label: "Mythic",      color: "#FFD700", icon: "✦" },
    ],
    modifiers: {
      message_helpful:  +2,
      message_reported: -5,
      strike_received:  -15,
      strike_expired:   +3,
      ban_received:     -50,
      active_30_days:   +10,
      boost_server:     +5,
      report_valid:     +3,
      report_false:     -8,
    }
  },

  // Account trash (recoverable within 14 days by CEO)
  accountTrash: [
    { id:"trash1", userId:"del_user1", username:"ToxicUser99", email:"toxic@mail.com", deletedBy:"u1", deletedAt:"2025-02-10", reason:"Repeated harassment across multiple servers", recoverable:true, expiresAt:"2025-02-24" },
    { id:"trash2", userId:"del_user2", username:"SpamBot_X", email:"bot@spam.net", deletedBy:"me", deletedAt:"2025-02-08", reason:"Automated spam bot", recoverable:true, expiresAt:"2025-02-22" },
  ],

  // Mock global log
  globalLog: [
    { id:1, mod:"me", action:"Global Ban", target:"ToxicUser99", reason:"Harassment in 5+ servers", time:"2d ago" },
    { id:2, mod:"u1", action:"Global Strike", target:"CryptoNimbus", reason:"Spam across servers", time:"5d ago" },
    { id:3, mod:"u5", action:"Account Disable", target:"SpamBot_X", reason:"Automated spam", time:"4d ago" },
    { id:4, mod:"me", action:"Account Recovered", target:"FalseFlag_User", reason:"Wrongful ban — CEO recovery", time:"1w ago" },
  ],
};

// ── Slowmode / Chat Timing ──
window.IC_SLOWMODE = {
  options: [
    { value: 0,    label: "Off" },
    { value: 5,    label: "5 seconds" },
    { value: 10,   label: "10 seconds" },
    { value: 15,   label: "15 seconds" },
    { value: 30,   label: "30 seconds" },
    { value: 60,   label: "1 minute" },
    { value: 120,  label: "2 minutes" },
    { value: 300,  label: "5 minutes" },
    { value: 600,  label: "10 minutes" },
    { value: 900,  label: "15 minutes" },
    { value: 1800, label: "30 minutes" },
    { value: 3600, label: "1 hour" },
    { value: 21600,label: "6 hours" },
  ],
  // Per-channel slowmode settings
  channelSettings: {
    ch1: 0,   // general: no slowmode
    ch2: 3600, // announcements: 1h (locked anyway)
    ch4: 10,  // support: 10s
    ch7: 5,   // gaming: 5s
  }
};

// ── Server Tags ──
window.IC_SERVER_TAGS = {
  // Tags earnable via server XP, displayable on profile
  tags: [
    { id:"tag_active",   name:"Active Member", icon:"⚡", color:"#FBBF24", xpRequired:500, desc:"Regularly active in the server" },
    { id:"tag_helper",   name:"Helper",        icon:"💡", color:"#06D6A0", xpRequired:1500, desc:"Frequently helps other members" },
    { id:"tag_veteran",  name:"Veteran",       icon:"🏛", color:"#818CF8", xpRequired:5000, desc:"Long-time respected member" },
    { id:"tag_legend",   name:"Legend",         icon:"👑", color:"#A855F7", xpRequired:15000, desc:"Legendary contributor" },
    { id:"tag_mythic",   name:"Mythic",         icon:"✦", color:"#FFD700", xpRequired:50000, desc:"Among the greatest of all time" },
  ],
  // User unlocked tags (mock)
  userTags: {
    me: ["tag_active","tag_helper","tag_veteran"],
    u1: ["tag_active","tag_helper"],
    u2: ["tag_active","tag_helper","tag_veteran","tag_legend"],
    u3: ["tag_active","tag_helper","tag_veteran","tag_legend"],
    u5: ["tag_active","tag_helper","tag_veteran"],
    u6: ["tag_active"],
  }
};

// ── Voice Controls ──
window.IC_VOICE = {
  // Per-user voice settings
  settings: {
    inputVolume: 100,
    outputVolume: 80,
    inputDevice: "Default",
    outputDevice: "Default",
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
  },
  // Per-user volume overrides (how loud each person sounds to you)
  userVolumes: {
    u1: 100,
    u2: 75,
    u3: 100,
    u5: 90,
    u6: 50, // lowered because they're loud
  },
  // Admin/mod controls
  modControls: {
    serverMute: [],    // server-muted users
    serverDeafen: [],  // server-deafened users
    forceMoved: [],    // users forced to another channel
  }
};
