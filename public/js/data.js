/* ═══ interClouder v4.5 — Core Data Engine ═══ */

// CNI Compression
window.CNI={clamp:(v,a,b)=>Math.max(0,Math.min(1,(v-a)/(b-a||1)))};

// Roles
window.R={
  ceo:{n:"C.E.O",c:"#FFD700",i:"👑",p:["all"],lv:99},
  admin:{n:"Admin",c:"#EF4444",i:"⚡",p:["ban","kick","strike","manage"],lv:90},
  smod:{n:"Sr. Mod",c:"#F59E0B",i:"🛡",p:["ban","kick","strike","mute"],lv:80},
  mod:{n:"Moderator",c:"#06D6A0",i:"🔰",p:["kick","strike","mute"],lv:70},
  vip:{n:"VIP",c:"#A855F7",i:"💎",p:["chat","react","voice","embed"],lv:50},
  boost:{n:"Booster",c:"#F472B6",i:"🚀",p:["chat","react","voice"],lv:40},
  member:{n:"Member",c:"#818CF8",i:"☁",p:["chat","react","voice"],lv:10},
  cloud:{n:"Cloudling",c:"#6B7280",i:"○",p:["chat","react"],lv:0},
};

// Badges (img=null means emoji, otherwise URL)
window.B={
  founder:{l:"Founder",i:"⬡",c:"#FFD700",t:"special",img:null},
  early:{l:"Early Supporter",i:"🌅",c:"#F59E0B",t:"special",img:null,desc:"First 10,000 Airbound Elite+ buyers"},
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

// Premium with REAL payment flow
window.P={
  air:{id:"air",n:"Airbound",p:1.50,c:"#C084FC",perks:["Custom badges","Profile themes","50MB upload","Priority support","Custom status"],unlocks:{animAvatar:false,customBanner:false,animBanner:false}},
  elite:{id:"elite",n:"Airbound Elite",p:4.50,c:"#FFD700",perks:["All Airbound perks","Server boost ×2","Gradient names","100MB upload","Voice effects","Animated avatar","Custom banner"],unlocks:{animAvatar:true,customBanner:true,animBanner:false}},
  omega:{id:"omega",n:"Airbound Omega",p:8.50,c:"#FF6B6B",perks:["All Elite perks","Server boost ×4","Custom plugins","500MB upload","AI assistant","Priority queue","Animated banner"],unlocks:{animAvatar:true,customBanner:true,animBanner:true}},
};

// Early supporter tracking
window.EARLY={count:0,max:10000,check(tier){if(tier!=="air"&&this.count<this.max){this.count++;return true}return false}};

// Strike levels
window.STR=[{n:1,a:"Warning"},{n:2,a:"Mute 10m",d:600},{n:3,a:"Mute 1h",d:3600},{n:4,a:"Mute 24h",d:86400},{n:5,a:"Mute 7d",d:604800},{n:6,a:"Kick"},{n:7,a:"Ban 30d",d:2592000},{n:8,a:"Permaban"}];

// Slowmode
window.SM=[0,5,10,15,30,60,120,300,600,1800,3600];
window.smL=v=>v===0?"Off":v<60?v+"s":v<3600?Math.floor(v/60)+"m":Math.floor(v/3600)+"h";

// Encryption
window.ENC=["HoneyTrap","Fractal-Quantum","Neo-Enigma","Reverse-Matrix","Jaw-Breaker"];

// Plugins
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

// AI Bots
window.BOT=[
  {id:"b1",n:"SentinelAI",i:"🤖",c:"#06D6A0",d:"Auto-detect toxicity, spam, raids & NSFW",caps:["auto-mod","raid-detect","nsfw-filter"]},
  {id:"b2",n:"CloudAssist",i:"💡",c:"#818CF8",d:"General purpose AI assistant",caps:["chat","qa","help"]},
  {id:"b3",n:"BeatCloud",i:"🎶",c:"#F472B6",d:"Music DJ with AI-powered playlists",caps:["music","voice","playlist"]},
];

// Tag evolution by time+activity
window.TE={
  stages:[
    {d:0,x:0,h:0,s:30,l:"New"},
    {d:7,x:100,h:200,s:50,l:"Active"},
    {d:30,x:500,h:270,s:60,l:"Established"},
    {d:90,x:2000,h:300,s:70,l:"Veteran"},
    {d:180,x:5000,h:45,s:80,l:"Legendary"},
    {d:365,x:15000,h:50,s:100,l:"Mythic"},
  ],
  get(days,xp){let s=this.stages[0];for(const st of this.stages)if(days>=st.d&&xp>=st.x)s=st;return s},
  color(days,xp){const s=this.get(days,xp);const t=CNI.clamp(xp,0,20000);return`hsl(${(s.h+t*30)%360},${s.s}%,${55+t*15}%)`},
};

// Templates
window.TPL=[
  {id:"gaming",n:"Gaming",i:"🎮",tc:["general","lfg","clips","memes"],vc:["Game Night","Voice"],rl:[{n:"Gamer",c:"#F43F5E"},{n:"Streamer",c:"#A855F7"}]},
  {id:"community",n:"Community",i:"👥",tc:["general","introductions","events","off-topic"],vc:["Lounge","Music"],rl:[{n:"Regular",c:"#06D6A0"},{n:"VIP",c:"#FBBF24"}]},
  {id:"creative",n:"Creative",i:"🎨",tc:["showcase","feedback","resources","collab"],vc:["Studio"],rl:[{n:"Artist",c:"#F472B6"},{n:"Mentor",c:"#818CF8"}]},
  {id:"tech",n:"Tech & Code",i:"💻",tc:["help","projects","code-review"],vc:["Pair Prog"],rl:[{n:"Dev",c:"#06D6A0"},{n:"Reviewer",c:"#FBBF24"}]},
  {id:"blank",n:"Blank",i:"📝",tc:["general"],vc:["Voice"],rl:[]},
];

// Update announcements
window.UPDATES=[
  {id:"v45",ver:"v4.5",title:"interClouder v4.5 — Complete Overhaul",big:true,changes:["Full payment system for Airbound tiers","CEO control panel with XP/badge/rank management","Test account creator (CEO only)","Server badges & custom themes","Animated profiles & banners","Bot IA tags, Moderation tags, Announcement system","Public server discovery","Early Supporter badge (first 10K Elite+ buyers)"]},
];
