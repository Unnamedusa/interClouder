/* ══════════════════════════════════════
   interClouder — Badge System
   ══════════════════════════════════════ */
window.IC_BADGES = {
  // ── Staff Badges ──
  ceo:           { icon: "👑", label: "C.E.O", color: "#FFD700", desc: "Chief Executive Officer of interClouder", tier: "staff" },
  founder:       { icon: "⬡", label: "Founder", color: "#A855F7", desc: "Founder of interClouder — the origin", tier: "staff" },
  chief_mod:     { icon: "◆", label: "Chief Moderator", color: "#EF4444", desc: "Head of all moderation operations", tier: "staff" },
  senior_admin:  { icon: "◈", label: "Senior Admin", color: "#F43F5E", desc: "Senior platform administrator", tier: "staff" },
  admin:         { icon: "◇", label: "Admin", color: "#FB7185", desc: "Platform administrator", tier: "staff" },
  senior_mod:    { icon: "⬢", label: "Senior Mod", color: "#06D6A0", desc: "Experienced moderator with extended permissions", tier: "staff" },
  moderator:     { icon: "◉", label: "Moderator", color: "#34D399", desc: "Community moderator", tier: "staff" },
  trial_mod:     { icon: "○", label: "Trial Mod", color: "#6EE7B7", desc: "Moderator in training period", tier: "staff" },

  // ── Community Badges ──
  matrial_clouder:{ icon: "🔧", label: "Matrial Clouder", color: "#14B8A6", desc: "Found & reported bugs — keeping interClouder stable", tier: "community" },
  early_clouder: { icon: "☀", label: "Early Clouder", color: "#FBBF24", desc: "Supported interClouder in its earliest days", tier: "community" },
  early_member:  { icon: "⟡", label: "Early Member", color: "#F59E0B", desc: "Among the first 50,000 members", tier: "community" },
  
  // ── Technical Badges ──
  cloud_architect:{ icon: "⬡", label: "Cloud Architect", color: "#818CF8", desc: "Contributed to platform infrastructure", tier: "technical" },
  api_pioneer:   { icon: "⟐", label: "API Pioneer", color: "#6366F1", desc: "Built integrations using the interClouder API", tier: "technical" },
  cipher_master: { icon: "🔐", label: "Cipher Master", color: "#8B5CF6", desc: "Security researcher & encryption contributor", tier: "technical" },
  
  // ── Creative Badges ──
  nexus:         { icon: "⬢", label: "Nexus", color: "#F472B6", desc: "The connector — bridges people & ideas", tier: "creative" },
  catalyst:      { icon: "◈", label: "Catalyst", color: "#EC4899", desc: "Sparks change, ignites movements", tier: "creative" },
  harmonic:      { icon: "≋", label: "Harmonic", color: "#E879F9", desc: "Creates harmony in chaos", tier: "creative" },
  vortex:        { icon: "◎", label: "Vortex", color: "#D946EF", desc: "Pull of creativity that draws everyone in", tier: "creative" },
  voyager:       { icon: "◇", label: "Voyager", color: "#06B6D4", desc: "Explorer of the digital frontier", tier: "creative" },

  // ── Boost Badge (Evolving Cloud ☁️) ──
  boost_1:       { icon: "☁", label: "Cloud Seed", color: "#C4B5D9", desc: "First server boost — a cloud is born", tier: "boost", level: 1 },
  boost_2:       { icon: "☁", label: "Rising Cloud", color: "#A78BFA", desc: "Cloud growing stronger", tier: "boost", level: 2 },
  boost_3:       { icon: "⛅", label: "Storm Cloud", color: "#8B5CF6", desc: "Power of the storm", tier: "boost", level: 3 },
  boost_4:       { icon: "🌩", label: "Thunder Cloud", color: "#7C3AED", desc: "Lightning strikes", tier: "boost", level: 4 },
  boost_5:       { icon: "🌪", label: "Vortex Cloud", color: "#6D28D9", desc: "Unstoppable force", tier: "boost", level: 5 },
  boost_6:       { icon: "🌌", label: "Nebula Cloud", color: "#5B21B6", desc: "Cosmic cloud — max evolution", tier: "boost", level: 6 },

  // ── Airbound Purchase Badge (Evolving Cube 🔮) ──
  airbound_1m:   { icon: "▫", label: "Cube: Origin", color: "#C084FC", desc: "Airbound 1 month — cube materializes", tier: "purchase", months: 1 },
  airbound_3m:   { icon: "◻", label: "Cube: Forming", color: "#A855F7", desc: "3 months — cube takes shape", tier: "purchase", months: 3 },
  airbound_6m:   { icon: "◼", label: "Cube: Solid", color: "#9333EA", desc: "6 months — solid matrix cube", tier: "purchase", months: 6 },
  airbound_1y:   { icon: "🔮", label: "Cube: Prismatic", color: "#7C3AED", desc: "1 year — prismatic matrix", tier: "purchase", months: 12 },
  airbound_2y:   { icon: "💎", label: "Cube: Crystal", color: "#6D28D9", desc: "2 years — crystallized power", tier: "purchase", months: 24 },
  airbound_3y:   { icon: "✦", label: "Cube: Radiant", color: "#5B21B6", desc: "3 years — radiant energy", tier: "purchase", months: 36 },
  airbound_4y:   { icon: "⟐", label: "Cube: Quantum", color: "#4C1D95", desc: "4 years — quantum matrix", tier: "purchase", months: 48 },
  airbound_5y:   { icon: "⬡", label: "Cube: Cosmic", color: "#3B0764", desc: "5 years — cosmic matrix form", tier: "purchase", months: 60 },
  airbound_6y:   { icon: "🌟", label: "Cube: Eternal", color: "#FFD700", desc: "6 years — eternal legendary status", tier: "purchase", months: 72 },
};

window.IC_BADGE_TIERS = {
  staff: { label: "Staff", color: "#EF4444", priority: 1 },
  community: { label: "Community", color: "#FBBF24", priority: 2 },
  technical: { label: "Technical", color: "#818CF8", priority: 3 },
  creative: { label: "Creative", color: "#F472B6", priority: 4 },
  boost: { label: "Boost Evolution", color: "#A855F7", priority: 5 },
  purchase: { label: "Airbound Evolution", color: "#C084FC", priority: 6 },
};
