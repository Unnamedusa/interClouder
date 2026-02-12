/* ═══ interClouder v5.0 — Core Data ═══ */
window.CNI={clamp:function(v,a,b){return Math.max(0,Math.min(1,(v-a)/(b-a||1)))}};

// ── Roles ──
window.R={
  ceo:{n:"C.E.O",c:"#FFD700",i:"👑",p:["all"],lv:99},
  admin:{n:"Admin",c:"#EF4444",i:"⚡",p:["ban","kick","strike","manage","censor","grant"],lv:90},
  smod:{n:"Sr. Mod",c:"#F59E0B",i:"🛡",p:["ban","kick","strike","mute","censor"],lv:80},
  mod:{n:"Moderator",c:"#06D6A0",i:"🔰",p:["kick","strike","mute","censor"],lv:70},
  vip:{n:"VIP",c:"#A855F7",i:"💎",p:["embed","customicon"],lv:50},
  boost:{n:"Booster",c:"#F472B6",i:"🚀",p:["customicon"],lv:40},
  member:{n:"Member",c:"#818CF8",i:"☁",p:["chat","react","voice","attach"],lv:10},
  cloud:{n:"Cloudling",c:"#6B7280",i:"○",p:["chat","react"],lv:0},
};
window.RP=function(role){
  var lv=R[role]?R[role].lv:0;
  if(R[role]&&R[role].p&&R[role].p.indexOf("all")!==-1)return["all","ban","kick","strike","manage","mute","embed","chat","react","voice","attach","censor","grant","customicon"];
  var all={};Object.keys(R).forEach(function(k){if(R[k].lv<=lv)R[k].p.forEach(function(p){all[p]=1})});return Object.keys(all);
};

// ── Badges ──
window.B={
  founder:{l:"Founder",i:"⬡",c:"#FFD700",t:"special"},
  early:{l:"Early Supporter",i:"🌅",c:"#F59E0B",t:"special"},
  early_owner:{l:"Early Server Owner",i:"🏰",c:"#14B8A6",t:"special"},
  dev:{l:"Developer",i:"</>",c:"#06D6A0",t:"special"},
  bug:{l:"Bug Hunter",i:"🐛",c:"#EF4444",t:"special"},
  nitro:{l:"Airbound",i:"✨",c:"#C084FC",t:"premium"},
  elite:{l:"Airbound Elite",i:"💎",c:"#FFD700",t:"premium"},
  omega:{l:"Airbound Omega",i:"🔮",c:"#FF6B6B",t:"premium"},
  boost1:{l:"Booster I",i:"🚀",c:"#F472B6",t:"boost"},
  boost2:{l:"Booster II",i:"🚀",c:"#EC4899",t:"boost"},
  boost3:{l:"Booster III",i:"🚀",c:"#DB2777",t:"boost"},
  mod_b:{l:"Moderator",i:"🛡",c:"#06D6A0",t:"role"},
  artist:{l:"Artist",i:"🎨",c:"#818CF8",t:"community"},
  streamer:{l:"Streamer",i:"📺",c:"#EF4444",t:"community"},
  helper:{l:"Helper",i:"💡",c:"#14B8A6",t:"community"},
  gifted:{l:"Airbound Gift",i:"🎁",c:"#C084FC",t:"premium"},
};

// ── Premium tiers with boost discounts ──
window.P={
  air:{id:"air",n:"Airbound",p:1.50,c:"#C084FC",boostDisc:0,perks:["Custom badges","Profile themes","50MB upload","Custom status","Spoiler attachments"],unlocks:{animAvatar:false,customBanner:false,animBanner:false,gradient:true,maxUpload:50}},
  elite:{id:"elite",n:"Airbound Elite",p:4.50,c:"#FFD700",boostDisc:15,perks:["All Airbound perks","Server boost ×2","100MB upload","Animated avatar","Custom banner","15% boost discount","Custom role icon"],unlocks:{animAvatar:true,customBanner:true,animBanner:false,gradient:true,maxUpload:100}},
  omega:{id:"omega",n:"Airbound Omega",p:8.50,c:"#FF6B6B",boostDisc:30,perks:["All Elite perks","Server boost ×4","500MB upload","Animated banner","30% boost discount","Priority queue","AI assistant"],unlocks:{animAvatar:true,customBanner:true,animBanner:true,gradient:true,maxUpload:500}},
};

// ── Early Server & Early Supporter ──
window.EARLY={count:0,max:10000,check:function(t){if(t!=="air"&&this.count<this.max){this.count++;return true}return false}};
window.ESRV={max:15000,get count(){return parseInt(localStorage.getItem("ic_esrv_count")||"0")},inc:function(){var c=this.count+1;localStorage.setItem("ic_esrv_count",""+c);return c<=this.max}};

// ── Reputation ──
window.REP={
  levels:[{min:-999,n:"Blacklisted",c:"#000",i:"⛔"},{min:0,n:"Untrusted",c:"#EF4444",i:"🔻"},{min:20,n:"Neutral",c:"#6B7280",i:"○"},{min:50,n:"Trusted",c:"#06D6A0",i:"✓"},{min:100,n:"Respected",c:"#818CF8",i:"⭐"},{min:250,n:"Honored",c:"#FBBF24",i:"🏅"},{min:500,n:"Legendary",c:"#FFD700",i:"👑"},{min:1000,n:"Mythic",c:"#FF6B6B",i:"🔱"}],
  calc:function(u){var s=0;s+=Math.min((u.xp||0)/10,100);s+=Math.min(Math.floor((Date.now()-(u.created||Date.now()))/864e5),60);s-=(u.strikes||0)*15;s-=(u.reports||0)*5;s+=Math.min((u.msgs||0)/5,80);s+=(u.badges||[]).length*3;if(u.premium)s+=20;return Math.round(s)},
  level:function(score){var l=this.levels[0];for(var i=0;i<this.levels.length;i++)if(score>=this.levels[i].min)l=this.levels[i];return l},
};

// ── Strikes ──
window.STR=[{n:1,a:"Warning"},{n:2,a:"Mute 10m",d:600},{n:3,a:"Mute 1h",d:3600},{n:4,a:"Mute 24h",d:86400},{n:5,a:"Mute 7d",d:604800},{n:6,a:"Kick"},{n:7,a:"Ban 30d",d:2592000},{n:8,a:"Permaban"}];
window.SM=[0,5,10,15,30,60,120,300,600,1800,3600];
window.smL=function(v){return v===0?"Off":v<60?v+"s":v<3600?Math.floor(v/60)+"m":Math.floor(v/3600)+"h"};
window.ENC=["HoneyTrap","Fractal-Quantum","Neo-Enigma","Reverse-Matrix","Jaw-Breaker"];

// ── File Security ──
window.FSEC={
  blocked:[".exe",".bat",".cmd",".com",".msi",".scr",".pif",".reg",".vbs",".vbe",".js",".jse",".ws",".wsf",".wsc",".wsh",".ps1",".psm1",".psd1",".ps1xml",".cpl",".inf",".hta",".dll",".sys",".drv",".ocx",".lnk",".url",".iso",".img",".vhd"],
  dangerous:[".zip",".rar",".7z",".tar",".gz"],// warned but allowed
  allowed:[".png",".jpg",".jpeg",".gif",".webp",".svg",".bmp",".mp4",".webm",".mov",".mp3",".ogg",".wav",".pdf",".txt",".doc",".docx",".xls",".xlsx",".ppt",".pptx",".csv",".json",".xml"],
  maxSize:50*1024*1024,// 50MB default
  check:function(name,size,userMax){
    var ext="."+name.split(".").pop().toLowerCase();
    if(this.blocked.indexOf(ext)!==-1)return{ok:false,reason:"Blocked file type: "+ext+" (security risk)"};
    if(size>(userMax||this.maxSize))return{ok:false,reason:"File too large (max "+(Math.round((userMax||this.maxSize)/1048576))+"MB)"};
    var warn=this.dangerous.indexOf(ext)!==-1;
    return{ok:true,warn:warn,reason:warn?"Archive files may contain malicious content":"OK"};
  },
  scanContent:function(name){
    var n=name.toLowerCase();
    var rats=["rat","trojan","hack","crack","keygen","exploit","payload","inject","backdoor","rootkit","keylog","phish","stealer","grabber","crypter"];
    for(var i=0;i<rats.length;i++)if(n.indexOf(rats[i])!==-1)return{safe:false,reason:"Filename contains suspicious keyword: "+rats[i]};
    if(/\.(jpg|png|gif)\.(exe|bat|scr|cmd|vbs)/i.test(n))return{safe:false,reason:"Double extension detected (disguised executable)"};
    if(/[^\x20-\x7E]/.test(n))return{safe:false,reason:"Filename contains suspicious characters"};
    return{safe:true};
  }
};

// ── CloudKids age verification questions ──
window.CKIDS={
  questions:[
    {q:"What is a common monthly expense for an adult living independently?",opts:["Rent/Mortgage","Homework","Recess","Cartoons"],a:0},
    {q:"What document do you need to open a bank account?",opts:["Library card","Government-issued ID","School report","Birthday invitation"],a:1},
    {q:"What is a common responsibility when renting an apartment?",opts:["Paying a security deposit","Bringing toys","Getting permission from teachers","Asking parents for allowance"],a:0},
    {q:"What does 'filing taxes' mean?",opts:["Organizing papers alphabetically","Reporting income to the government","Filing homework in a binder","Cleaning file cabinets"],a:1},
    {q:"What is a lease agreement?",opts:["A type of car engine","A contract for renting property","A school permission slip","A sports league signup"],a:1},
    {q:"What is a credit score used for?",opts:["Grading schoolwork","Measuring financial trustworthiness","Rating video games","Scoring sports matches"],a:1},
    {q:"What happens if you miss a bill payment?",opts:["You get extra homework","Late fees or service interruption","Your teacher calls home","Nothing happens"],a:1},
    {q:"What is health insurance?",opts:["Insurance for your phone","Coverage that helps pay medical costs","A type of sports equipment","A school health class"],a:1},
    {q:"What does APR stand for in finance?",opts:["Annual Percentage Rate","Applied Practice Rating","After Practice Review","All Purpose Rating"],a:0},
    {q:"What is typically required to sign a legal contract?",opts:["Being at least 18 years old","Having a library card","Being a student","Having a social media account"],a:0},
    {q:"What is a W-2 form?",opts:["A homework worksheet","A tax document from your employer","A hall pass","A sports registration form"],a:1},
    {q:"What is a 401(k)?",opts:["A highway route number","A retirement savings plan","A school grade","A phone area code"],a:1},
  ],
  timeLimit:90,// seconds per set of 5
  baseCount:5,
  maxCount:12,
  penaltyAdd:2,// questions added per failure
  profanity:["fuck","shit","ass","bitch","damn","hell","dick","pussy","cock","cunt","bastard","whore","slut","fag","nigger","retard","piss","crap","bollocks","wank","twat","arse"],
  filterText:function(text,mode){
    if(!mode)return text;
    var words=text.split(/\b/);
    var self=this;
    return words.map(function(w){
      var low=w.toLowerCase().replace(/[^a-z]/g,"");
      for(var i=0;i<self.profanity.length;i++){
        if(low===self.profanity[i]||low.indexOf(self.profanity[i])!==-1){
          return mode==="blur"?"<span class='ck-blur'>"+w+"</span>":"<span class='ck-block'>"+("█".repeat(w.length))+"</span>";
        }
      }
      return w;
    }).join("");
  }
};

// ── Spam Detection ──
window.SPAM={
  patterns:[/(.)\1{8,}/,/https?:\/\/[^\s]+/gi,/@everyone|@here/gi],
  thresholds:{msgRate:5,repeatRate:3,linkRate:2},// per 10 seconds
  check:function(msgs,userId){
    if(!msgs||msgs.length<3)return{spam:false};
    var recent=msgs.filter(function(m){return m.uid===userId&&Date.now()-m.ts<10000});
    if(recent.length>=this.thresholds.msgRate)return{spam:true,reason:"Message flooding ("+recent.length+" msgs in 10s)"};
    var lastText=recent.length>0?recent[recent.length-1].text:"";
    var dupes=recent.filter(function(m){return m.text===lastText}).length;
    if(dupes>=this.thresholds.repeatRate)return{spam:true,reason:"Repeated messages"};
    return{spam:false};
  }
};

// ── Keyboard Shortcuts ──
window.KBS={
  list:[
    {keys:"Shift+↑",action:"editLast",desc:"Edit last message"},
    {keys:"Delete",action:"deleteLast",desc:"Delete last message"},
    {keys:"Escape",action:"closeModal",desc:"Close any modal/panel"},
    {keys:"Ctrl+K",action:"search",desc:"Quick search"},
    {keys:"Ctrl+Shift+M",action:"toggleMute",desc:"Toggle mute"},
    {keys:"Ctrl+Shift+D",action:"toggleDeafen",desc:"Toggle deafen"},
    {keys:"Alt+↑",action:"prevChannel",desc:"Previous channel"},
    {keys:"Alt+↓",action:"nextChannel",desc:"Next channel"},
    {keys:"Ctrl+,",action:"openSettings",desc:"Open settings"},
  ]
};

// ── Plugins & Bots ──
window.PLG=[
  {id:"p1",n:"AutoMod+",i:"🛡️",d:"AI auto-moderation with toxicity & spam detection",v:true,cat:"mod"},
  {id:"p2",n:"CloudTranslate",i:"🌐",d:"Real-time translation in 30+ languages",v:true,cat:"util"},
  {id:"p3",n:"CloudBeats",i:"🎵",d:"Music player for voice channels",v:true,cat:"fun"},
  {id:"p4",n:"XP Tracker",i:"📊",d:"Activity tracking with leaderboards",v:true,cat:"eng"},
  {id:"p5",n:"Greeter",i:"👋",d:"Welcome messages & auto-roles",v:true,cat:"util"},
  {id:"p6",n:"Tickets",i:"🎫",d:"Support ticket system",v:true,cat:"mod"},
  {id:"p7",n:"PollMaster",i:"📋",d:"Create polls & votes",v:true,cat:"eng"},
  {id:"p8",n:"Giveaway",i:"🎁",d:"Host giveaways",v:true,cat:"eng"},
];
window.BOT=[
  {id:"b1",n:"SentinelAI",i:"🤖",c:"#06D6A0",d:"Auto-detect toxicity, spam, raids",caps:["auto-mod","raid-detect","nsfw-filter"]},
  {id:"b2",n:"CloudAssist",i:"💡",c:"#818CF8",d:"General AI assistant",caps:["chat","qa","help"]},
  {id:"b3",n:"BeatCloud",i:"🎶",c:"#F472B6",d:"Music DJ bot",caps:["music","voice","playlist"]},
];

// ── Templates ──
window.TPL=[
  {id:"gaming",n:"Gaming",i:"🎮",tc:["general","lfg","clips","memes"],vc:["Game Night","Voice"],rl:[{n:"Gamer",c:"#F43F5E"},{n:"Streamer",c:"#A855F7"}]},
  {id:"community",n:"Community",i:"👥",tc:["general","introductions","events","off-topic"],vc:["Lounge","Music"],rl:[{n:"Regular",c:"#06D6A0"},{n:"VIP",c:"#FBBF24"}]},
  {id:"creative",n:"Creative",i:"🎨",tc:["showcase","feedback","resources","collab"],vc:["Studio"],rl:[{n:"Artist",c:"#F472B6"},{n:"Mentor",c:"#818CF8"}]},
  {id:"tech",n:"Tech & Code",i:"💻",tc:["help","projects","code-review"],vc:["Pair Prog"],rl:[{n:"Dev",c:"#06D6A0"},{n:"Reviewer",c:"#FBBF24"}]},
  {id:"blank",n:"Blank",i:"📝",tc:["general"],vc:["Voice"],rl:[]},
];

// ── Tag Evolution ──
window.TE={
  stages:[{d:0,x:0,h:0,s:30,l:"New"},{d:7,x:100,h:200,s:50,l:"Active"},{d:30,x:500,h:270,s:60,l:"Established"},{d:90,x:2000,h:300,s:70,l:"Veteran"},{d:180,x:5000,h:45,s:80,l:"Legendary"},{d:365,x:15000,h:50,s:100,l:"Mythic"}],
  get:function(d,x){var s=this.stages[0];for(var i=0;i<this.stages.length;i++)if(d>=this.stages[i].d&&x>=this.stages[i].x)s=this.stages[i];return s},
  color:function(d,x){var s=this.get(d,x);var t=CNI.clamp(x,0,20000);return"hsl("+(s.h+t*30)%360+","+s.s+"%,"+(55+t*15)+"%)"},
};

// ── Gradients ──
window.GRAD=[
  {id:"g1",n:"Nebula",c1:"#A855F7",c2:"#F472B6"},{id:"g2",n:"Aurora",c1:"#06D6A0",c2:"#818CF8"},
  {id:"g3",n:"Sunset",c1:"#F59E0B",c2:"#EF4444"},{id:"g4",n:"Ocean",c1:"#0EA5E9",c2:"#14B8A6"},
  {id:"g5",n:"Fire",c1:"#EF4444",c2:"#F59E0B"},{id:"g6",n:"Frost",c1:"#818CF8",c2:"#06D6A0"},
  {id:"g7",n:"Gold",c1:"#FFD700",c2:"#F59E0B"},{id:"g8",n:"Void",c1:"#6B7280",c2:"#A855F7"},
];

// ── Boost Shop ──
window.BOOSTS={
  items:[
    {id:"bst1",n:"Server Boost",p:3.99,desc:"Boost a server for 30 days",dur:30},
    {id:"bst2",n:"Super Boost",p:6.99,desc:"Double boost for 30 days",dur:30},
    {id:"bst3",n:"Mega Boost",p:11.99,desc:"Quad boost for 30 days",dur:30},
  ],
  discount:function(tier){return P[tier]?P[tier].boostDisc:0}
};

// ── Default Settings ──
window.DSET={
  privacy:{dms:true,online:true,friends:true,activity:true,data:false},
  notifs:{messages:true,mentions:true,sounds:true,desktop:false},
  access:{reducedMotion:false,fontSize:13,compactMode:false},
  gradient:null,
  cloudKids:{enabled:false,filterMode:"blur"},// blur or block
  spoilerMode:"blur",// blur or block
  blocked:[],
  ignored:[],
  twoFA:false,
};

// ── Update Log ──
window.UPDATES=[{id:"v50",ver:"v5.0",title:"interClouder v5.0 — Massive Update",big:true,changes:[
  "🏰 Early Server system (first 15K get special tag)",
  "⭐ Full reputation engine with 8 levels",
  "👑 Fancy visual Admin Panel with dashboard",
  "📎 File attachments with security scanning",
  "🔒 CloudKids age verification & profanity filter",
  "⌨ Keyboard shortcuts (Shift+↑ edit, Del delete, etc.)",
  "🖼 Spoiler attachments (blur/block mode)",
  "🚫 Block & Ignore users system",
  "🎁 Gift Airbound to users (CEO/Admin)",
  "🛒 Boost shop with tier discounts",
  "🛡 Anti-malware file scanning",
  "⏳ Loading screen with progress bar",
  "🔐 Account disable/delete with password confirmation",
  "📢 Profile censoring by moderators",
]}];

console.log('[IC] data.js loaded — all globals ready');
