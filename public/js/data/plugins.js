/* ══════════════════════════════════════
   interClouder — Plugins & AI System
   ══════════════════════════════════════ */
window.IC_PLUGINS = {
  // Built-in official plugins
  official: [
    { id:"plg_automod", name:"AutoMod+", icon:"🛡️", desc:"Advanced auto-moderation with AI-powered spam & toxicity detection", author:"interClouder", verified:true, installs:142000, category:"moderation", enabled:true, version:"2.1.0" },
    { id:"plg_translate", name:"CloudTranslate", icon:"🌐", desc:"Real-time message translation in 30+ languages", author:"interClouder", verified:true, installs:98000, category:"utility", enabled:true, version:"1.5.0" },
    { id:"plg_music", name:"CloudBeats", icon:"🎵", desc:"Music player bot for voice channels with queue & playlists", author:"interClouder", verified:true, installs:87000, category:"entertainment", enabled:false, version:"3.0.1" },
    { id:"plg_levels", name:"XP Tracker", icon:"📊", desc:"Track member activity, XP, levels with leaderboards & role rewards", author:"interClouder", verified:true, installs:120000, category:"engagement", enabled:true, version:"2.3.0" },
    { id:"plg_welcome", name:"Greeter", icon:"👋", desc:"Custom welcome messages, auto-role assignment, rules acceptance", author:"interClouder", verified:true, installs:105000, category:"utility", enabled:true, version:"1.8.0" },
    { id:"plg_tickets", name:"CloudTickets", icon:"🎫", desc:"Support ticket system with categories, priorities & staff assignment", author:"interClouder", verified:true, installs:64000, category:"moderation", enabled:false, version:"1.2.0" },
  ],
  // Community plugins (require admin approval)
  community: [
    { id:"plg_poll", name:"PollMaster", icon:"📋", desc:"Create polls, surveys, and votes with rich formatting", author:"NeonDrift", authorId:"u1", verified:false, installs:12000, category:"engagement", githubUrl:"https://github.com/neondrift/pollmaster", version:"1.0.3" },
    { id:"plg_giveaway", name:"CloudGiveaway", icon:"🎁", desc:"Host giveaways with requirements, timers & winner selection", author:"StarBreeze", authorId:"u5", verified:false, installs:8500, category:"engagement", githubUrl:"https://github.com/starbreeze/cloudgiveaway", version:"0.9.1" },
    { id:"plg_rpg", name:"CloudQuest RPG", icon:"⚔️", desc:"Text-based RPG with inventory, battles & guilds", author:"VoidRunner", authorId:"u6", verified:false, installs:5200, category:"entertainment", githubUrl:"", version:"0.7.0" },
  ],
  categories: ["all", "moderation", "utility", "entertainment", "engagement", "custom"],
};

// AI Bots
window.IC_AI_BOTS = [
  { id:"ai_mod", name:"SentinelAI", icon:"🤖", color:"#06D6A0", desc:"AI moderator that auto-detects toxicity, spam, raids & NSFW content", capabilities:["auto-mod","raid-detection","nsfw-filter","spam-filter","toxicity-score"], status:"online", isOfficial:true, createdBy:"interClouder" },
  { id:"ai_assist", name:"CloudAssist", icon:"💡", color:"#818CF8", desc:"General purpose assistant — answers questions, provides info, helps users", capabilities:["chat","qa","help","search"], status:"online", isOfficial:true, createdBy:"interClouder" },
  { id:"ai_music", name:"BeatCloud", icon:"🎶", color:"#F472B6", desc:"Music recommendation & voice channel DJ with AI-powered playlists", capabilities:["music","voice","playlist","recommendations"], status:"idle", isOfficial:true, createdBy:"interClouder" },
  { id:"ai_custom", name:"Custom AI Bot", icon:"⚙️", color:"#FBBF24", desc:"Create your own AI bot with custom behavior (requires GitHub)", capabilities:["custom"], status:"offline", isOfficial:false, createdBy:null },
];

// Plugin permissions
window.IC_PLUGIN_PERMS = {
  read_messages: { label: "Read Messages", desc: "Can read channel messages", risk: "low" },
  send_messages: { label: "Send Messages", desc: "Can send messages in channels", risk: "low" },
  manage_messages: { label: "Manage Messages", desc: "Can delete/pin messages", risk: "medium" },
  kick_members: { label: "Kick Members", desc: "Can kick members from server", risk: "high" },
  ban_members: { label: "Ban Members", desc: "Can ban members from server", risk: "high" },
  manage_roles: { label: "Manage Roles", desc: "Can assign/remove roles", risk: "high" },
  manage_channels: { label: "Manage Channels", desc: "Can create/edit/delete channels", risk: "medium" },
  voice_connect: { label: "Voice Connect", desc: "Can join voice channels", risk: "low" },
  voice_speak: { label: "Voice Speak", desc: "Can speak in voice channels", risk: "low" },
  webhook: { label: "Webhooks", desc: "Can create webhooks", risk: "medium" },
};
