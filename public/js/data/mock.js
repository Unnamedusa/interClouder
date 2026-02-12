/* ══════════════════════════════════════
   interClouder — Mock Data
   ══════════════════════════════════════ */
window.IC_USERS = {
  me: { id:"me", username:"CloudWalker", display:"Cloud Walker", avatar:"CW", color:"#A855F7", status:"online", bio:"Building the future of social ☁️", badges:["founder","cipher_master","airbound_6m"], role:"cloud_master", premium:"airbound_elite", joined:"Jan 2025", followers:12840, following:342, posts:891, xp:15200, boosts:3, banner:"#7C3AED", customStatus:"Securing the cloud ⚡", dmPermission:"friends" },
  u1: { id:"u1", username:"NeonDrift", display:"Neon Drift", avatar:"ND", color:"#06D6A0", status:"online", bio:"Night owl developer & open source contributor", badges:["senior_mod","early_clouder","boost_3"], role:"sky_warden", premium:null, joined:"Jan 2025", followers:8920, following:201, posts:456, xp:9800, boosts:1, banner:"#059669", customStatus:"Patrolling 🛡️", dmPermission:"everyone" },
  u2: { id:"u2", username:"PixelStorm", display:"Pixel Storm", avatar:"PS", color:"#F472B6", status:"idle", bio:"Digital artist · pixel art · generative design", badges:["nexus","harmonic","early_member","airbound_3m"], role:"nebula_elite", premium:"airbound", joined:"Feb 2025", followers:24310, following:567, posts:1203, xp:22100, boosts:2, banner:"#DB2777", customStatus:"Creating ✨", dmPermission:"friends" },
  u3: { id:"u3", username:"AetherWave", display:"Aether Wave", avatar:"AW", color:"#818CF8", status:"dnd", bio:"Music producer | Synthwave | Ambient", badges:["vortex","cloud_architect","airbound_1y"], role:"nebula_elite", premium:"airbound_omega", joined:"Jan 2025", followers:56120, following:128, posts:2341, xp:41500, boosts:4, banner:"#4F46E5", customStatus:"In the zone 🎵", dmPermission:"nobody" },
  u4: { id:"u4", username:"CryptoNimbus", display:"Crypto Nimbus", avatar:"CN", color:"#FBBF24", status:"offline", bio:"Cloud architect & infrastructure nerd", badges:["matrial_clouder","api_pioneer"], role:"drift_walker", premium:null, joined:"Feb 2025", followers:4450, following:89, posts:167, xp:3200, boosts:0, banner:"#D97706", customStatus:"", dmPermission:"everyone" },
  u5: { id:"u5", username:"StarBreeze", display:"Star Breeze", avatar:"SB", color:"#F43F5E", status:"online", bio:"UI/UX Designer · Coffee addict · Cat person", badges:["catalyst","early_clouder","boost_4","airbound_6m"], role:"sky_warden", premium:"airbound_elite", joined:"Jan 2025", followers:32010, following:412, posts:789, xp:18700, boosts:3, banner:"#E11D48", customStatus:"Designing dreams 🎨", dmPermission:"friends" },
  u6: { id:"u6", username:"VoidRunner", display:"Void Runner", avatar:"VR", color:"#34D399", status:"online", bio:"Speedrunner & competitive gamer", badges:["voyager","early_member"], role:"drift_walker", premium:null, joined:"Mar 2025", followers:15600, following:95, posts:534, xp:7600, boosts:0, banner:"#059669", customStatus:"Speedrunning 🏃", dmPermission:"everyone" },
};

window.IC_SERVERS = [
  { id:"s1", name:"interClouder HQ", icon:"IC", color:"#7C3AED", members:154200, boostLevel:4, xp:95000, channels:[
    { id:"ch1", name:"general", type:"text", unread:3 },{ id:"ch2", name:"announcements", type:"text", unread:1, locked:true },
    { id:"ch3", name:"off-topic", type:"text", unread:0 },{ id:"ch4", name:"support", type:"text", unread:5 },
    { id:"ch5", name:"Voice Lounge", type:"voice", users:["u1","u3","u5"] },{ id:"ch6", name:"storm-guard-hq", type:"text", unread:0, restricted:true },
  ]},
  { id:"s2", name:"Game Zone", icon:"GZ", color:"#F43F5E", members:87500, boostLevel:3, xp:42000, channels:[
    { id:"ch7", name:"gaming-general", type:"text", unread:7 },{ id:"ch8", name:"lfg", type:"text", unread:2 },
    { id:"ch10", name:"Game Night", type:"voice", users:["u2","u6"] },
  ]},
  { id:"s3", name:"Art Studio", icon:"AS", color:"#F472B6", members:42000, boostLevel:2, xp:18000, channels:[
    { id:"ch11", name:"showcase", type:"text", unread:5 },{ id:"ch12", name:"feedback", type:"text", unread:0 },
    { id:"ch14", name:"Collab Room", type:"voice", users:["u2"] },
  ]},
  { id:"s4", name:"Code Cloud", icon:"CC", color:"#06D6A0", members:63000, boostLevel:2, xp:21000, channels:[
    { id:"ch15", name:"help", type:"text", unread:12 },{ id:"ch16", name:"projects", type:"text", unread:1 },
  ]},
  { id:"s5", name:"Music Hub", icon:"MH", color:"#818CF8", members:31000, boostLevel:1, xp:8000, channels:[
    { id:"ch18", name:"production", type:"text", unread:0 },{ id:"ch20", name:"Listening Party", type:"voice", users:["u3","u5","u6"] },
  ]},
];

window.IC_MESSAGES = {
  ch1:[
    { id:1, user:"u1", text:"Hey everyone! Just pushed a new security update 🔒", time:"10:24 AM", reactions:[{emoji:"🔥",count:5},{emoji:"👏",count:3}] },
    { id:2, user:"u5", text:"Nice! The new DM permission system is great — I feel much safer", time:"10:26 AM", reactions:[{emoji:"💜",count:2}] },
    { id:3, user:"u3", text:"Anyone want to collab stream this weekend? My Airbound Omega lets me do 4K 🎵", time:"10:33 AM", reactions:[{emoji:"🎵",count:4},{emoji:"✨",count:7}] },
    { id:4, user:"u6", text:"New speedrun record! 23:41 on Celeste any% 🏃", time:"10:42 AM", reactions:[{emoji:"⚡",count:9},{emoji:"🏆",count:4}] },
    { id:5, user:"me", text:"Welcome new members! Be sure to check #announcements and set up your DM permissions in settings 🛡️", time:"10:50 AM", reactions:[{emoji:"💜",count:12},{emoji:"👋",count:8}] },
  ],
  ch2:[{ id:1, user:"me", text:"📢 interClouder v3.0 — Airbound Premium is live! Three tiers: Airbound ($1.50), Elite ($4.50), Omega ($8.50). Plus new DM permissions, auto-translate, evolving badges, gradient roles, and so much more!", time:"9:00 AM", reactions:[{emoji:"🎉",count:342},{emoji:"🔒",count:218},{emoji:"🚀",count:156}] }],
  ch7:[
    { id:1, user:"u6", text:"Valorant tonight anyone?", time:"11:00 AM", reactions:[{emoji:"🎯",count:3}] },
    { id:2, user:"u2", text:"Count me in! Even though I'm terrible lol", time:"11:10 AM", reactions:[{emoji:"😂",count:4}] },
  ],
};

window.IC_DM_CONVOS = [
  { id:"dm1", userId:"u1", lastMsg:"I'll review the encryption PR tonight!", time:"2m", unread:1 },
  { id:"dm2", userId:"u5", lastMsg:"Love the new profile customization 💜", time:"15m", unread:0 },
  { id:"dm3", userId:"u3", lastMsg:"Stream starts at 8pm EST", time:"1h", unread:2 },
  { id:"dm4", userId:"u2", lastMsg:"Sent you the asset pack!", time:"3h", unread:0 },
];

window.IC_DM_MSGS = {
  dm1:[
    { id:1, user:"u1", text:"The new permission system is working great — DMs only from approved users now", time:"2:10 PM" },
    { id:2, user:"me", text:"Perfect! And the auto-translate module is live too", time:"2:12 PM" },
    { id:3, user:"u1", text:"I'll review the encryption PR tonight!", time:"2:16 PM" },
  ],
  dm2:[
    { id:1, user:"u5", text:"The Airbound Elite profile animations are stunning!", time:"1:00 PM" },
    { id:2, user:"me", text:"Wait until you see the gradient role creator 🌈", time:"1:02 PM" },
    { id:3, user:"u5", text:"Love the new profile customization 💜", time:"1:10 PM" },
  ],
  dm3:[
    { id:1, user:"u3", text:"Co-stream tomorrow? My Omega gives 4K streaming", time:"11:00 AM" },
    { id:2, user:"me", text:"Absolutely! Music + code stream let's go", time:"11:05 AM" },
    { id:3, user:"u3", text:"Stream starts at 8pm EST", time:"11:10 AM" },
  ],
};
