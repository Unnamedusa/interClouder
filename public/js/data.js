/* ═══ interClouder v4.5 — Core Data ═══ */
window.CNI={clamp:(v,a,b)=>Math.max(0,Math.min(1,(v-a)/(b-a||1)))};

// Roles — perks are OWN only; use RP() for inherited
window.R={
  ceo:{n:"C.E.O",c:"#FFD700",i:"👑",p:["all"],lv:99},
  admin:{n:"Admin",c:"#EF4444",i:"⚡",p:["ban","kick","strike","manage"],lv:90},
  smod:{n:"Sr. Mod",c:"#F59E0B",i:"🛡",p:["ban","kick","strike","mute"],lv:80},
  mod:{n:"Moderator",c:"#06D6A0",i:"🔰",p:["kick","strike","mute"],lv:70},
  vip:{n:"VIP",c:"#A855F7",i:"💎",p:["embed"],lv:50},
  boost:{n:"Booster",c:"#F472B6",i:"🚀",p:[],lv:40},
  member:{n:"Member",c:"#818CF8",i:"☁",p:["chat","react","voice"],lv:10},
  cloud:{n:"Cloudling",c:"#6B7280",i:"○",p:["chat","react"],lv:0},
};
// Get ALL perks for a role (inherited from lower roles)
window.RP=role=>{
  const lv=R[role]?.lv||0;if(R[role]?.p?.includes("all"))return["all","ban","kick","strike","manage","mute","embed","chat","react","voice"];
  const all=new Set();Object.values(R).forEach(r=>{if(r.lv<=lv)r.p.forEach(p=>all.add(p))});return[...all];
};

window.B={
  founder:{l:"Founder",i:"⬡",c:"#FFD700",t:"special",img:null},
  early:{l:"Early Supporter",i:"🌅",c:"#F59E0B",t:"special",img:null},
  dev:{l:"Developer",i:"</>",c:"#06D6A0",t:"special",img:null},
  bug:{l:"Bug Hunter",i:"🐛",c:"#EF4444",t:"special",img:null},
  nitro:{l:"Airbound",i:"✨",c:"#C084FC",t:"premium",img:null},
  elite:{l:"Airbound Elite",i:"💎",c:"#FFD700",t:"premium",img:null},
  omega:{l:"Airbound Omega",i:"🔮",c:"#FF6B6B",t:"premium",img:null},
  boost1:{l:"Booster I",i:"🚀",c:"#F472B6",t:"boost",img:null},
  boost2:{l:"Booster II",i:"🚀",c:"#EC4899",t:"boost",img:null},
  boost3:{l:"Booster III",i:"🚀",c:"#DB2777",t:"boost",img:null},
  mod_b:{l:"Moderator",i:"🛡",c:"#06D6A0",t:"role",img:null},
  artist:{l:"Artist",i:"🎨",c:"#818CF8",t:"community",img:null},
  streamer:{l:"Streamer",i:"📺",c:"#EF4444",t:"community",img:null},
  helper:{l:"Helper",i:"💡",c:"#14B8A6",t:"community",img:null},
};

window.P={
  air:{id:"air",n:"Airbound",p:1.50,c:"#C084FC",perks:["Custom badges","Profile themes","50MB upload","Priority support","Custom status"],unlocks:{animAvatar:false,customBanner:false,animBanner:false,gradient:true}},
  elite:{id:"elite",n:"Airbound Elite",p:4.50,c:"#FFD700",perks:["All Airbound perks","Server boost ×2","Custom gradient","100MB upload","Voice effects","Animated avatar","Custom banner"],unlocks:{animAvatar:true,customBanner:true,animBanner:false,gradient:true}},
  omega:{id:"omega",n:"Airbound Omega",p:8.50,c:"#FF6B6B",perks:["All Elite perks","Server boost ×4","Custom plugins","500MB upload","AI assistant","Priority queue","Animated banner"],unlocks:{animAvatar:true,customBanner:true,animBanner:true,gradient:true}},
};

window.EARLY={count:0,max:10000,check(t){if(t!=="air"&&this.count<this.max){this.count++;return true}return false}};
window.STR=[{n:1,a:"Warning"},{n:2,a:"Mute 10m",d:600},{n:3,a:"Mute 1h",d:3600},{n:4,a:"Mute 24h",d:86400},{n:5,a:"Mute 7d",d:604800},{n:6,a:"Kick"},{n:7,a:"Ban 30d",d:2592000},{n:8,a:"Permaban"}];
window.SM=[0,5,10,15,30,60,120,300,600,1800,3600];
window.smL=v=>v===0?"Off":v<60?v+"s":v<3600?Math.floor(v/60)+"m":Math.floor(v/3600)+"h";
window.ENC=["HoneyTrap","Fractal-Quantum","Neo-Enigma","Reverse-Matrix","Jaw-Breaker"];

window.PLG=[
  {id:"p1",n:"AutoMod+",i:"🛡️",d:"AI auto-moderation with toxicity & spam detection",v:true,cat:"mod"},
  {id:"p2",n:"CloudTranslate",i:"🌐",d:"Real-time translation in 30+ languages",v:true,cat:"util"},
  {id:"p3",n:"CloudBeats",i:"🎵",d:"Music player for voice channels with playlists",v:true,cat:"fun"},
  {id:"p4",n:"XP Tracker",i:"📊",d:"Activity tracking with leaderboards & role rewards",v:true,cat:"eng"},
  {id:"p5",n:"Greeter",i:"👋",d:"Welcome messages, auto-roles & rules acceptance",v:true,cat:"util"},
  {id:"p6",n:"Tickets",i:"🎫",d:"Support ticket system with categories & priorities",v:true,cat:"mod"},
  {id:"p7",n:"PollMaster",i:"📋",d:"Create polls, surveys and votes",v:true,cat:"eng"},
  {id:"p8",n:"Giveaway",i:"🎁",d:"Host giveaways with requirements & timers",v:true,cat:"eng"},
];
window.BOT=[
  {id:"b1",n:"SentinelAI",i:"🤖",c:"#06D6A0",d:"Auto-detect toxicity, spam, raids & NSFW",caps:["auto-mod","raid-detect","nsfw-filter"]},
  {id:"b2",n:"CloudAssist",i:"💡",c:"#818CF8",d:"General purpose AI assistant",caps:["chat","qa","help"]},
  {id:"b3",n:"BeatCloud",i:"🎶",c:"#F472B6",d:"Music DJ with AI-powered playlists",caps:["music","voice","playlist"]},
];
window.TE={
  stages:[{d:0,x:0,h:0,s:30,l:"New"},{d:7,x:100,h:200,s:50,l:"Active"},{d:30,x:500,h:270,s:60,l:"Established"},{d:90,x:2000,h:300,s:70,l:"Veteran"},{d:180,x:5000,h:45,s:80,l:"Legendary"},{d:365,x:15000,h:50,s:100,l:"Mythic"}],
  get(d,x){let s=this.stages[0];for(const st of this.stages)if(d>=st.d&&x>=st.x)s=st;return s},
  color(d,x){const s=this.get(d,x);const t=CNI.clamp(x,0,20000);return`hsl(${(s.h+t*30)%360},${s.s}%,${55+t*15}%)`},
};
window.TPL=[
  {id:"gaming",n:"Gaming",i:"🎮",tc:["general","lfg","clips","memes"],vc:["Game Night","Voice"],rl:[{n:"Gamer",c:"#F43F5E"},{n:"Streamer",c:"#A855F7"}]},
  {id:"community",n:"Community",i:"👥",tc:["general","introductions","events","off-topic"],vc:["Lounge","Music"],rl:[{n:"Regular",c:"#06D6A0"},{n:"VIP",c:"#FBBF24"}]},
  {id:"creative",n:"Creative",i:"🎨",tc:["showcase","feedback","resources","collab"],vc:["Studio"],rl:[{n:"Artist",c:"#F472B6"},{n:"Mentor",c:"#818CF8"}]},
  {id:"tech",n:"Tech & Code",i:"💻",tc:["help","projects","code-review"],vc:["Pair Prog"],rl:[{n:"Dev",c:"#06D6A0"},{n:"Reviewer",c:"#FBBF24"}]},
  {id:"blank",n:"Blank",i:"📝",tc:["general"],vc:["Voice"],rl:[]},
];

// Gradient presets
window.GRAD=[
  {id:"g1",n:"Nebula",c1:"#A855F7",c2:"#F472B6"},
  {id:"g2",n:"Aurora",c1:"#06D6A0",c2:"#818CF8"},
  {id:"g3",n:"Sunset",c1:"#F59E0B",c2:"#EF4444"},
  {id:"g4",n:"Ocean",c1:"#0EA5E9",c2:"#14B8A6"},
  {id:"g5",n:"Fire",c1:"#EF4444",c2:"#F59E0B"},
  {id:"g6",n:"Frost",c1:"#818CF8",c2:"#06D6A0"},
  {id:"g7",n:"Gold",c1:"#FFD700",c2:"#F59E0B"},
  {id:"g8",n:"Void",c1:"#6B7280",c2:"#A855F7"},
];

// Default settings structure
window.DSET={
  privacy:{dms:true,online:true,friends:true,activity:true,data:false},
  notifs:{messages:true,mentions:true,sounds:true,desktop:false},
  access:{reducedMotion:false,fontSize:13,compactMode:false},
  gradient:null, // {c1,c2} or null
};

window.UPDATES=[{id:"v45",ver:"v4.5",title:"interClouder v4.5 — Complete Overhaul",big:true,changes:["Full payment system for Airbound tiers","CEO panel with XP/badge/rank management","Test account creator (CEO only)","Custom gradient profiles","Animated profiles & banners","Persistent settings & switches","Role perk inheritance","Early Supporter (first 10K Elite+ buyers)"]}];
