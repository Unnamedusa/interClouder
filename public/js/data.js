/* ═══ interClouder v4 — Neutron Core Data Engine ═══
   Compresión de Neutrones Informativa (CNI):
   - Fractal inversa: datos recursivos almacenados como deltas
   - División: split de objetos grandes en chunks referenciados
   - Clamping aproximado: valores numéricos normalizados a rangos [0,1]
   ═══════════════════════════════════════════════════ */

// ── CNI Compression Engine ──
window.CNI={
  // Fractal inverse: store recursive structures as base+delta
  fractal(obj,base={}){const d={};for(const k in obj){if(JSON.stringify(obj[k])!==JSON.stringify(base[k]))d[k]=obj[k]}return d},
  // Clamp normalize values to [0,1] range
  clamp(v,min,max){return Math.max(0,Math.min(1,(v-min)/(max-min||1)))},
  // Pack: compress array of objects by extracting common keys
  pack(arr){if(!arr.length)return{k:[],v:[]};const k=Object.keys(arr[0]);return{k,v:arr.map(o=>k.map(x=>o[x]))}},
  // Unpack
  unpack(p){return p.v.map(r=>{const o={};p.k.forEach((k,i)=>o[k]=r[i]);return o})},
  // Delta encode sorted numbers
  delta(arr){if(!arr.length)return[];return[arr[0],...arr.slice(1).map((v,i)=>v-arr[i])]}
};

// ── Roles Definition ──
window.ROLES={
  ceo:{n:"C.E.O",c:"#FFD700",i:"👑",p:["all"],lv:99},
  admin:{n:"Admin",c:"#EF4444",i:"⚡",p:["ban","kick","strike","manage_server","manage_roles","manage_channels"],lv:90},
  smod:{n:"Sr. Mod",c:"#F59E0B",i:"🛡",p:["ban","kick","strike","moderate","mute"],lv:80},
  mod:{n:"Moderator",c:"#06D6A0",i:"🔰",p:["kick","strike","moderate","mute"],lv:70},
  vip:{n:"VIP",c:"#A855F7",i:"💎",p:["chat","react","voice","embed","upload"],lv:50},
  boost:{n:"Booster",c:"#F472B6",i:"🚀",p:["chat","react","voice","embed"],lv:40},
  member:{n:"Member",c:"#818CF8",i:"☁",p:["chat","react","voice"],lv:10},
  cloud:{n:"Cloudling",c:"#6B7280",i:"○",p:["chat","react"],lv:0},
};

// ── Server Tag Evolution System ──
// Tags evolve color through time+activity, use acronyms (1-6 chars)
window.TAG_EVOLUTION={
  stages:[
    {minDays:0,minXP:0,hue:0,sat:30,label:"New",glow:false},
    {minDays:7,minXP:100,hue:200,sat:50,label:"Active",glow:false},
    {minDays:30,minXP:500,hue:270,sat:60,label:"Established",glow:false},
    {minDays:90,minXP:2000,hue:300,sat:70,label:"Veteran",glow:true},
    {minDays:180,minXP:5000,hue:45,sat:80,label:"Legendary",glow:true},
    {minDays:365,minXP:15000,hue:50,sat:100,label:"Mythic",glow:true},
  ],
  getStage(days,xp){
    let s=this.stages[0];
    for(const st of this.stages){if(days>=st.minDays&&xp>=st.minXP)s=st}
    return s;
  },
  getColor(days,xp){
    const s=this.getStage(days,xp);
    // Interpolate hue based on continuous activity
    const t=CNI.clamp(xp,0,20000);
    const h=(s.hue+t*30)%360;
    return `hsl(${h},${s.sat}%,${55+t*15}%)`;
  }
};

// ── Badge System (with image support) ──
window.BADGES={
  founder:{l:"Founder",i:"⬡",c:"#FFD700",t:"special",img:null},
  early:{l:"Early Adopter",i:"🌅",c:"#F59E0B",t:"special",img:null},
  dev:{l:"Developer",i:"</\>",c:"#06D6A0",t:"special",img:null},
  bug:{l:"Bug Hunter",i:"🐛",c:"#EF4444",t:"special",img:null},
  nitro:{l:"Airbound",i:"✨",c:"#A855F7",t:"premium",img:null},
  boost1:{l:"Booster I",i:"🚀",c:"#F472B6",t:"boost",img:null},
  boost2:{l:"Booster II",i:"🚀",c:"#EC4899",t:"boost",img:null},
  boost3:{l:"Booster III",i:"🚀",c:"#DB2777",t:"boost",img:null},
  mod:{l:"Moderator",i:"🛡",c:"#06D6A0",t:"role",img:null},
  artist:{l:"Artist",i:"🎨",c:"#818CF8",t:"community",img:null},
  streamer:{l:"Streamer",i:"📺",c:"#EF4444",t:"community",img:null},
  helper:{l:"Helper",i:"💡",c:"#14B8A6",t:"community",img:null},
};

// ── Premium Tiers ──
window.PREMIUM={
  air:{n:"Airbound",p:"$1.50/mo",c:"#C084FC",perks:["Custom badges","Profile themes","Animated avatar","50MB upload","Priority support"]},
  elite:{n:"Elite",p:"$4.50/mo",c:"#FFD700",perks:["All Airbound","Server boost x2","Custom roles","Gradient names","100MB upload","Voice effects"]},
  omega:{n:"Omega",p:"$8.50/mo",c:"#FF6B6B",perks:["All Elite","Server boost x4","Custom plugin creation","Animated banners","500MB upload","AI assistant","Priority queue"]},
};

// ── Strike Escalation ──
window.STRIKES=[
  {n:1,a:"Warning",d:null},
  {n:2,a:"Mute 10m",d:600},
  {n:3,a:"Mute 1h",d:3600},
  {n:4,a:"Mute 24h",d:86400},
  {n:5,a:"Mute 7d",d:604800},
  {n:6,a:"Kick",d:null},
  {n:7,a:"Ban 30d",d:2592000},
  {n:8,a:"Permaban",d:null},
];

// ── Slowmode Options ──
window.SLOWMODE=[0,5,10,15,30,60,120,300,600,900,1800,3600];
window.smLabel=v=>v===0?"Off":v<60?v+"s":v<3600?Math.floor(v/60)+"m":Math.floor(v/3600)+"h";

// ── Encryption Phases ──
window.ENC_PHASES=["HoneyTrap","Fractal-Quantum","Neo-Enigma","Reverse-Matrix","Jaw-Breaker"];
window.encrypt=t=>{let h=0;for(let i=0;i<t.length;i++)h=(h<<5)-h+t.charCodeAt(i);return"◈"+Math.abs(h).toString(36)+"◈"};

// ── Plugin Definitions ──
window.PLUGINS=[
  {id:"p1",n:"AutoMod+",i:"🛡️",d:"AI-powered auto-moderation",a:"interClouder",v:true,cat:"mod"},
  {id:"p2",n:"CloudTranslate",i:"🌐",d:"Real-time translation in 30+ languages",a:"interClouder",v:true,cat:"util"},
  {id:"p3",n:"CloudBeats",i:"🎵",d:"Music player for voice channels",a:"interClouder",v:true,cat:"fun"},
  {id:"p4",n:"XP Tracker",i:"📊",d:"Activity tracking with leaderboards",a:"interClouder",v:true,cat:"eng"},
  {id:"p5",n:"Greeter",i:"👋",d:"Welcome messages & auto-roles",a:"interClouder",v:true,cat:"util"},
  {id:"p6",n:"Tickets",i:"🎫",d:"Support ticket system",a:"interClouder",v:true,cat:"mod"},
];

// ── AI Bots ──
window.BOTS=[
  {id:"b1",n:"SentinelAI",i:"🤖",c:"#06D6A0",d:"Auto-detect toxicity, spam & raids",caps:["auto-mod","raid-detect","nsfw-filter"]},
  {id:"b2",n:"CloudAssist",i:"💡",c:"#818CF8",d:"General purpose AI assistant",caps:["chat","qa","help"]},
  {id:"b3",n:"BeatCloud",i:"🎶",c:"#F472B6",d:"Music DJ with AI playlists",caps:["music","voice","playlist"]},
];

// ── Server Templates ──
window.TEMPLATES=[
  {id:"gaming",n:"Gaming",i:"🎮",chs:["general","lfg","clips","memes"],vch:["Game Night","Voice Chat"],roles:[{n:"Gamer",c:"#F43F5E"},{n:"Streamer",c:"#A855F7"}]},
  {id:"community",n:"Community",i:"👥",chs:["general","introductions","events","off-topic"],vch:["Lounge","Music"],roles:[{n:"Regular",c:"#06D6A0"},{n:"VIP",c:"#FBBF24"}]},
  {id:"creative",n:"Creative",i:"🎨",chs:["showcase","feedback","resources","collab"],vch:["Studio"],roles:[{n:"Artist",c:"#F472B6"},{n:"Mentor",c:"#818CF8"}]},
  {id:"tech",n:"Tech & Code",i:"💻",chs:["help","projects","code-review"],vch:["Pair Programming"],roles:[{n:"Dev",c:"#06D6A0"},{n:"Reviewer",c:"#FBBF24"}]},
  {id:"blank",n:"Blank",i:"📝",chs:["general"],vch:["Voice"],roles:[]},
];
