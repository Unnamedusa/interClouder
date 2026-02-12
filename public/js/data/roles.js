/* ══════════════════════════════════════
   interClouder — Role & XP System
   ══════════════════════════════════════ */

// ── Default Platform Roles ──
window.IC_ROLES = {
  cloud_master:  { name: "Cloud Master", icon: "⬡", color: "#A855F7", gradient: null, perms: ["all"], desc: "Full platform control", tier: 0 },
  storm_chief:   { name: "Storm Chief", icon: "◆", color: "#EF4444", gradient: null, perms: ["moderate","ban","mute","kick","manage_server"], desc: "Chief moderation officer", tier: 1 },
  sky_warden:    { name: "Sky Warden", icon: "◈", color: "#06D6A0", gradient: null, perms: ["moderate","mute","kick","manage_channels"], desc: "Senior moderator", tier: 2 },
  nebula_elite:  { name: "Nebula Elite", icon: "◉", color: "#C084FC", gradient: null, perms: ["premium","custom_emoji","upload","stream"], desc: "Premium member", tier: 3 },
  drift_walker:  { name: "Drift Walker", icon: "◇", color: "#818CF8", gradient: null, perms: ["verified","chat","react","voice"], desc: "Verified member", tier: 4 },
  cloudling:     { name: "Cloudling", icon: "○", color: "#6B7280", gradient: null, perms: ["chat","react"], desc: "New member", tier: 5 },
};

// ── Server Boost Tiers ──
window.IC_BOOST_TIERS = [
  { level: 1, boostsRequired: 2, xpRequired: 0, name: "Cumulus", color: "#C4B5D9", perks: ["50 emoji slots", "Better audio quality", "Server banner"] },
  { level: 2, boostsRequired: 7, xpRequired: 5000, name: "Stratus", color: "#A78BFA", perks: ["100 emoji slots", "HD streaming", "Custom invite bg", "Role icons"] },
  { level: 3, boostsRequired: 14, xpRequired: 15000, name: "Nimbus", color: "#8B5CF6", perks: ["200 emoji slots", "Animated server icon", "Vanity URL", "60fps streaming"] },
  { level: 4, boostsRequired: 25, xpRequired: 35000, name: "Cumulonimbus", color: "#7C3AED", perks: ["500 emoji slots", "Animated banner", "Custom splash", "Premium audio"] },
  { level: 5, boostsRequired: 40, xpRequired: 75000, name: "Supercell", color: "#6D28D9", perks: ["Unlimited emoji", "Full customization", "Priority support", "Gradient roles unlocked"] },
];

// ── XP System ──
window.IC_XP = {
  actions: {
    message_sent: 5,
    reaction_given: 1,
    reaction_received: 2,
    voice_minute: 3,
    member_joined_referral: 50,
    daily_active: 25,
    weekly_streak: 100,
    boost_purchased: 500,
    event_hosted: 200,
    event_attended: 50,
  },
  // Level thresholds
  levelThresholds: [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 9000, 13000, 18000, 25000, 35000, 50000],
  
  calculateLevel: function(xp) {
    for (let i = this.levelThresholds.length - 1; i >= 0; i--) {
      if (xp >= this.levelThresholds[i]) return i;
    }
    return 0;
  },

  xpToNext: function(xp) {
    const level = this.calculateLevel(xp);
    if (level >= this.levelThresholds.length - 1) return 0;
    return this.levelThresholds[level + 1] - xp;
  }
};

// ── Gradient Role Templates (unlocked at Boost Tier 5) ──
window.IC_GRADIENT_ROLES = [
  { name: "Aurora", gradient: "linear-gradient(135deg, #A855F7, #EC4899, #F59E0B)", colors: 3 },
  { name: "Nebula", gradient: "linear-gradient(135deg, #6366F1, #A855F7, #EC4899)", colors: 3 },
  { name: "Solar Flare", gradient: "linear-gradient(135deg, #F59E0B, #EF4444, #EC4899)", colors: 3 },
  { name: "Ocean Depth", gradient: "linear-gradient(135deg, #06B6D4, #6366F1, #A855F7)", colors: 3 },
  { name: "Northern Lights", gradient: "linear-gradient(135deg, #22C55E, #06B6D4, #6366F1, #A855F7)", colors: 4 },
  { name: "Prismatic", gradient: "linear-gradient(135deg, #EF4444, #F59E0B, #22C55E, #06B6D4, #6366F1, #A855F7)", colors: 6 },
];
