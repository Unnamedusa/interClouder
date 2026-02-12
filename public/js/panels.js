/* ═══ interClouder v4 — Panels ═══ */

// ── Chat Area ──
const ChatArea=({channel,messages,onSend,onReact,myId,notify})=>{
  const [text,setText]=useState("");
  const [showEmoji,setShowEmoji]=useState(null);
  const ref=useRef(null);
  const emojis=["👍","❤️","😂","🔥","💜","👀","🎉","💯","😮","🙏"];

  useEffect(()=>{ref.current?.scrollTo(0,ref.current.scrollHeight)},[messages]);

  const send=()=>{
    if(!text.trim())return;
    onSend(text.trim());setText("");
  };

  const sm=channel?.slowmode||0;

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
      <div ref={ref} style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
        {(!messages||messages.length===0)&&(
          <div style={{textAlign:"center",padding:60,color:"var(--txg)"}}>
            <div style={{fontSize:40,marginBottom:12}}>💬</div>
            <div style={{fontSize:16,fontWeight:700,color:"var(--txm)"}}>Welcome to #{channel?.name||"channel"}</div>
            <p style={{fontSize:12,marginTop:4}}>This is the beginning of this channel. Start the conversation!</p>
          </div>
        )}
        {(messages||[]).map(m=>(
          <div key={m.id} className="msg" onMouseEnter={()=>{}} >
            <Avatar name={m.user} size={36} />
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                <span style={{fontSize:13,fontWeight:700,color:m.color||"var(--tx)"}}>{m.user}</span>
                <span style={{fontSize:10,color:"var(--txg)"}}>{m.time}</span>
                {m.edited&&<span style={{fontSize:9,color:"var(--txg)"}}>(edited)</span>}
              </div>
              <div style={{fontSize:13,color:"var(--tx2)",marginTop:2,wordBreak:"break-word"}}>{m.text}</div>
              {/* Reactions */}
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:4}}>
                {(m.reactions||[]).map((r,i)=>(
                  <span key={i} className={`rx ${r.me?"me":""}`}
                    onClick={()=>onReact(m.id,r.emoji)}>
                    {r.emoji} {r.count}
                  </span>
                ))}
                {/* Add reaction button */}
                <span style={{position:"relative"}}>
                  <span className="rx" onClick={()=>setShowEmoji(showEmoji===m.id?null:m.id)} style={{opacity:.5}}>+</span>
                  {showEmoji===m.id&&(
                    <div style={{position:"absolute",bottom:"100%",left:0,padding:6,borderRadius:10,background:"var(--bg2)",border:"1px solid var(--bdr)",display:"flex",gap:2,zIndex:10,boxShadow:"0 4px 12px rgba(0,0,0,.3)"}}>
                      {emojis.map(e=>(
                        <span key={e} onClick={()=>{onReact(m.id,e);setShowEmoji(null)}} style={{cursor:"pointer",fontSize:16,padding:2,borderRadius:4,transition:".1s"}}
                          onMouseEnter={ev=>ev.currentTarget.style.background="var(--bga)"} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>{e}</span>
                      ))}
                    </div>
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div className="inp">
        <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder={sm>0?`Slowmode: ${smLabel(sm)} — Message #${channel?.name||""}...`:`Message #${channel?.name||""}...`} />
        <button className="btn btn-p" onClick={send} style={{padding:"8px 14px"}}>↑</button>
      </div>
    </div>
  );
};

// ── Profile Modal ──
const ProfileModal=({user,onClose,notify})=>{
  if(!user)return null;
  const [editBadges,setEditBadges]=useState(false);
  const [badgeImg,setBadgeImg]=useState("");
  const r=ROLES[user.role]||ROLES.cloud;
  const tags=user.serverTags||[];

  return(
    <div className="modal" onClick={onClose}>
      <div className="mcard" onClick={e=>e.stopPropagation()} style={{width:360,padding:0,overflow:"hidden"}}>
        {/* Banner */}
        <div style={{height:80,background:`linear-gradient(135deg,${r.c},${r.c}88)`,position:"relative"}}>
          <Avatar name={user.display} size={64} status={user.status} style={{position:"absolute",bottom:-32,left:20,border:"4px solid var(--bg2)"}} />
        </div>
        <div style={{padding:"40px 20px 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <span style={{fontSize:18,fontWeight:800,color:r.c}}>{user.display}</span>
            <span style={{fontSize:10,color:r.c,fontWeight:700}}>{r.i}</span>
          </div>
          <div style={{fontSize:12,color:"var(--txm)",marginBottom:12}}>@{user.username}</div>

          {/* Role */}
          <div className="chip" style={{background:`${r.c}15`,color:r.c,marginBottom:12}}>{r.i} {r.n}</div>

          {/* Server Tags */}
          {tags.length>0&&(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:"var(--txg)",textTransform:"uppercase",marginBottom:4}}>Server Tags</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {tags.map((t,i)=><TagChip key={i} tag={t} />)}
              </div>
            </div>
          )}

          {/* Badges */}
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:10,color:"var(--txg)",textTransform:"uppercase"}}>Badges</span>
              {user.isMe&&<span onClick={()=>setEditBadges(!editBadges)} style={{fontSize:10,color:"var(--acc)",cursor:"pointer"}}>Edit</span>}
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {(user.badges||[]).map((b,i)=>(
                <div key={i} style={{position:"relative"}}>
                  <Badge badge={b} size={24} />
                  {editBadges&&user.isMe&&(
                    <div style={{position:"absolute",top:-8,right:-8,width:14,height:14,borderRadius:7,background:"var(--err)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:8,color:"#fff"}}
                      onClick={()=>{user.badges=user.badges.filter((_,j)=>j!==i);notify("Badge removed")}}>×</div>
                  )}
                </div>
              ))}
              {(user.badges||[]).length===0&&<span style={{fontSize:11,color:"var(--txg)"}}>No badges yet</span>}
            </div>
            {/* Custom badge with image */}
            {editBadges&&user.isMe&&(
              <div style={{marginTop:8,padding:8,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)"}}>
                <div style={{fontSize:10,color:"var(--txf)",marginBottom:4}}>Add badge with image URL:</div>
                <div style={{display:"flex",gap:4}}>
                  <input className="li" value={badgeImg} onChange={e=>setBadgeImg(e.target.value)} placeholder="https://image.url/badge.png" style={{flex:1,fontSize:11}} />
                  <button className="btn btn-s" onClick={()=>{
                    if(badgeImg.trim()){
                      const key="custom_"+Date.now();
                      BADGES[key]={l:"Custom",i:"⭐",c:"var(--acc)",t:"custom",img:badgeImg.trim()};
                      user.badges=[...(user.badges||[]),key];
                      setBadgeImg("");notify("Custom badge added!");
                    }
                  }} style={{padding:"4px 10px",fontSize:11}}>Add</button>
                </div>
              </div>
            )}
          </div>

          {/* XP */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <span style={{fontSize:10,color:"var(--txg)"}}>XP</span>
            <XPBar xp={user.xp||0} w={150} />
            <span style={{fontSize:10,color:"var(--txm)",fontFamily:"monospace"}}>{user.xp||0}</span>
          </div>

          <button className="btn btn-p" onClick={onClose} style={{width:"100%"}}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ── Moderation Panel ──
const ModPanel=({servers,activeServer,notify})=>{
  const [tab,setTab]=useState("strikes");
  const [selUser,setSelUser]=useState("");
  const [reason,setReason]=useState("");
  const [banDur,setBanDur]=useState("permanent");
  const srv=servers.find(s=>s.id===activeServer);
  const tabs=["strikes","kick / ban","slowmode","privileges","auto-mod"];

  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:180,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"16px 8px"}}>
        <div className="sl">Moderation</div>
        {tabs.map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)} style={{fontSize:12,textTransform:"capitalize"}}>{t}</div>)}
      </div>
      <div style={{flex:1,padding:24,overflowY:"auto"}}>
        <h2 style={{fontSize:18,fontWeight:800,color:"var(--tx)",marginBottom:16,textTransform:"capitalize"}}>{tab}</h2>

        {tab==="strikes"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:16}}>
              {STRIKES.map((s,i)=>(
                <div key={i} style={{padding:8,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",textAlign:"center"}}>
                  <div style={{fontSize:16,fontWeight:800,color:i<2?"var(--wrn)":i<5?"#F59E0B":i<7?"var(--pk)":"var(--err)"}}>{s.n}</div>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--txm)"}}>{s.a}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:"var(--tx)",marginBottom:8}}>Issue Strike</div>
              <input className="li" value={selUser} onChange={e=>setSelUser(e.target.value)} placeholder="Username..." style={{marginBottom:8}} />
              <input className="li" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reason..." style={{marginBottom:8}} />
              <button className="btn btn-p" onClick={()=>{if(!selUser||!reason){notify("Fill all fields");return}notify(`⚡ Strike → ${selUser}: ${reason}`);setReason("")}} style={{background:"linear-gradient(135deg,#F59E0B,#D97706)"}}>⚡ Issue Strike</button>
            </div>
          </div>
        )}

        {tab==="kick / ban"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[["Kick","🔨","var(--pk)","Remove from server"],["Ban","🚫","var(--err)","Permanent ban"]].map(([a,ico,col,desc])=>(
              <div key={a} className="card">
                <div style={{fontSize:24,marginBottom:6}}>{ico}</div>
                <div style={{fontSize:15,fontWeight:700,color:col,marginBottom:4}}>{a}</div>
                <p style={{fontSize:12,color:"var(--txm)",marginBottom:10}}>{desc}</p>
                <input className="li" placeholder="Username..." style={{marginBottom:8,fontSize:12}} />
                <input className="li" placeholder="Reason..." style={{marginBottom:8,fontSize:12}} />
                {a==="Ban"&&<select className="li" value={banDur} onChange={e=>setBanDur(e.target.value)} style={{marginBottom:8,fontSize:12}}><option>permanent</option><option>1d</option><option>7d</option><option>30d</option></select>}
                <button className="btn" onClick={()=>notify(`${a} executed!`)} style={{width:"100%",background:`${col}18`,color:col,border:`1px solid ${col}30`,fontWeight:700}}>{ico} {a}</button>
              </div>
            ))}
          </div>
        )}

        {tab==="slowmode"&&srv&&(
          <div>
            <p style={{fontSize:12,color:"var(--txm)",marginBottom:12}}>Configure anti-spam rate limiting per channel.</p>
            {srv.channels.map(ch=>(
              <div key={ch.id} style={{display:"flex",alignItems:"center",gap:10,padding:10,borderRadius:10,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:6}}>
                <span style={{color:"var(--txg)"}}>#</span>
                <span style={{fontSize:13,fontWeight:600,color:"var(--tx)",flex:1}}>{ch.name}</span>
                <select className="li" value={ch.slowmode||0} onChange={e=>{ch.slowmode=parseInt(e.target.value);notify(`#${ch.name}: ${smLabel(parseInt(e.target.value))}`)}} style={{width:120,padding:"4px 8px",fontSize:12}}>
                  {SLOWMODE.map(v=><option key={v} value={v}>{smLabel(v)}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {tab==="privileges"&&(
          <div>
            {Object.entries(ROLES).map(([k,r])=>(
              <div key={k} className="card" style={{marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:16,color:r.c}}>{r.i}</span>
                  <span style={{fontSize:14,fontWeight:700,color:r.c,flex:1}}>{r.n}</span>
                  <button className="btn btn-s" onClick={()=>notify(`Editing ${r.n}`)} style={{fontSize:11,padding:"3px 10px"}}>Edit</button>
                </div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                  {r.p.map(p=><span key={p} className="chip" style={{background:["ban","kick","all"].includes(p)?"rgba(239,68,68,.08)":"rgba(34,197,94,.08)",color:["ban","kick","all"].includes(p)?"var(--err)":"var(--ok)"}}>{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="auto-mod"&&["Spam Detection","Link Filter","Mention Spam","Invite Links","Caps Lock","Word Filter","Raid Protection","NSFW Detection"].map((n,i)=>(
          <div key={n} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:10,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:6}}>
            <span style={{fontSize:13,fontWeight:600,color:"var(--tx)"}}>{n}</span>
            <Toggle on={i<3||i>5} onChange={()=>notify(`${n} toggled`)} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Admin Panel ──
const AdminPanel=({notify,user})=>{
  const [tab,setTab]=useState("cmd");
  const [cmd,setCmd]=useState("");
  const [log,setLog]=useState([]);
  const [trash,setTrash]=useState([]);
  const tabs=["cmd","reputation","global log","trash"];

  const runCmd=()=>{
    if(!cmd.trim())return;
    const c=cmd.trim();let r="",ok=true;
    if(c==="/help")r="Commands: /promote <user> <role> · /demote <user> · /strike <user> <reason> · /kick <user> · /ban <user> [duration] · /unban <user> · /globalban <user> · /globalstrike <user> · /reputation <user> · /disable <user> · /recover <user> · /slowmode <channel> <seconds> · /addadmin <user> · /removeadmin <user>";
    else if(c.startsWith("/promote "))r=`✓ ${c.split(" ")[1]} promoted to ${c.split(" ")[2]||"next role"}`;
    else if(c.startsWith("/demote "))r=`✓ ${c.split(" ")[1]} demoted`;
    else if(c.startsWith("/addadmin "))r=`✓ ${c.split(" ")[1]} is now admin`;
    else if(c.startsWith("/removeadmin "))r=`✓ ${c.split(" ")[1]} admin removed`;
    else if(c.startsWith("/strike "))r=`⚡ Strike → ${c.split(" ")[1]}: ${c.split(" ").slice(2).join(" ")||"No reason"}`;
    else if(c.startsWith("/kick "))r=`🔨 ${c.split(" ")[1]} kicked`;
    else if(c.startsWith("/ban "))r=`🚫 ${c.split(" ")[1]} banned ${c.split(" ")[2]||"permanently"}`;
    else if(c.startsWith("/unban "))r=`✓ ${c.split(" ")[1]} unbanned`;
    else if(c.startsWith("/globalban "))r=`🚫 GLOBAL BAN: ${c.split(" ")[1]}`;
    else if(c.startsWith("/globalstrike "))r=`⚡ GLOBAL STRIKE: ${c.split(" ")[1]}`;
    else if(c.startsWith("/disable ")){r=`🔒 ${c.split(" ")[1]} disabled (14d recovery)`;setTrash(p=>[{u:c.split(" ")[1],t:new Date().toLocaleDateString(),exp:"14 days",ok:true},...p])}
    else if(c.startsWith("/recover ")){r=`♻️ ${c.split(" ")[1]} recovered from trash`;setTrash(p=>p.filter(x=>x.u!==c.split(" ")[1]))}
    else if(c.startsWith("/reputation "))r=`${c.split(" ")[1]}: Rep score — calculating...`;
    else if(c.startsWith("/slowmode "))r=`⏱ Slowmode set to ${c.split(" ")[2]||"10"}s in #${c.split(" ")[1]||"general"}`;
    else{r=`✗ Unknown command. Type /help`;ok=false}
    setLog(p=>[{c,r,ok,t:"now"},...p]);setCmd("");notify(ok?"Command executed":"Command failed");
  };

  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:180,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"16px 8px"}}>
        <div className="sl">👑 Admin Panel</div>
        {tabs.map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)} style={{fontSize:12,textTransform:"capitalize"}}>{t==="cmd"?"⌘ CMD":t}</div>)}
      </div>
      <div style={{flex:1,padding:24,overflowY:"auto"}}>
        <h2 style={{fontSize:18,fontWeight:800,color:"var(--tx)",marginBottom:16}}>{tab==="cmd"?"⌘ Command Console":tab}</h2>

        {tab==="cmd"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:12,background:"#0a0a0a",border:"1px solid var(--bdr)"}}>
                <span style={{color:"var(--ok)",fontWeight:700}}>$</span>
                <input value={cmd} onChange={e=>setCmd(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runCmd()}
                  placeholder="/help for commands..." style={{flex:1,background:"none",border:"none",outline:"none",color:"var(--ok)",fontSize:13,fontFamily:"'JetBrains Mono',monospace"}} />
              </div>
              <button className="btn btn-p" onClick={runCmd} style={{fontFamily:"'JetBrains Mono',monospace",background:"linear-gradient(135deg,var(--ok),#16A34A)"}}>Run</button>
            </div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:12}}>
              {["/help","/addadmin","/promote","/strike","/kick","/ban","/slowmode","/disable","/recover"].map(c=>(
                <button key={c} onClick={()=>setCmd(c+" ")} style={{padding:"3px 8px",borderRadius:6,background:"var(--bg4)",border:"1px solid var(--bdr)",color:"var(--txm)",fontSize:10,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>{c}</button>
              ))}
            </div>
            {log.map((l,i)=>(
              <div key={i} style={{padding:8,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:4,fontFamily:"'JetBrains Mono',monospace"}}>
                <div style={{fontSize:12,color:"var(--ok)"}}>$ {l.c}</div>
                <div style={{fontSize:11,color:l.ok?"var(--txm)":"var(--err)",marginTop:2}}>{l.r}</div>
              </div>
            ))}
          </div>
        )}

        {tab==="reputation"&&(
          <div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {TAG_EVOLUTION.stages.map(s=>(
                <span key={s.label} className="chip" style={{background:`hsl(${s.hue},${s.sat}%,55%,0.12)`,color:`hsl(${s.hue},${s.sat}%,65%)`}}>{s.label} ({s.minXP}+ XP)</span>
              ))}
            </div>
            <p style={{fontSize:12,color:"var(--txm)"}}>Reputation is calculated from activity, reports, strikes, and time. Manage via CMD: /reputation &lt;user&gt;</p>
          </div>
        )}

        {tab==="global log"&&(
          <div>{log.length===0?<p style={{color:"var(--txg)",fontSize:13}}>No actions yet. Use CMD to execute commands.</p>
          :log.map((l,i)=>(
            <div key={i} style={{padding:10,borderRadius:10,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={user?.display||"Admin"} size={24} />
              <div style={{flex:1}}><div style={{fontSize:12,color:l.ok?"var(--ok)":"var(--err)"}}>{l.r}</div><div style={{fontSize:10,color:"var(--txg)"}}>{l.t}</div></div>
            </div>
          ))}</div>
        )}

        {tab==="trash"&&(
          <div>
            <div className="card" style={{background:"rgba(239,68,68,.03)",borderColor:"rgba(239,68,68,.15)",marginBottom:12}}>
              <p style={{fontSize:12,color:"var(--txm)"}}>⚠️ Deleted accounts kept <strong style={{color:"var(--tx)"}}>14 days</strong>. Only <strong style={{color:"var(--gld)"}}>C.E.O</strong> can recover.</p>
            </div>
            {trash.length===0?<p style={{color:"var(--txg)",fontSize:13}}>No deleted accounts. Use /disable &lt;user&gt; to add.</p>
            :trash.map((a,i)=>(
              <div key={i} className="card" style={{marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>{a.u}</span>
                  <span className="chip" style={{background:a.ok?"rgba(251,191,36,.1)":"rgba(239,68,68,.1)",color:a.ok?"var(--wrn)":"var(--err)"}}>{a.ok?"Recoverable":"Expired"}</span>
                </div>
                <div style={{fontSize:11,color:"var(--txg)",marginTop:4}}>Deleted: {a.t} · Expires: {a.exp}</div>
                {a.ok&&<button className="btn btn-s" onClick={()=>{setTrash(p=>p.filter((_,j)=>j!==i));notify(`♻️ ${a.u} recovered!`)}} style={{marginTop:8,fontSize:11,color:"var(--ok)"}}>♻️ Recover (CEO)</button>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Plugin Store ──
const PluginPanel=({notify})=>{
  const [tab,setTab]=useState("plugins");
  const [enabled,setEnabled]=useState({});
  const [botOn,setBotOn]=useState({});
  const [github,setGithub]=useState(false);

  const toggle=(id,type)=>{
    if(type==="p"){setEnabled(p=>({...p,[id]:!p[id]}));notify(`Plugin ${enabled[id]?"disabled":"enabled"}`)}
    else{setBotOn(p=>({...p,[id]:!p[id]}));notify(`Bot ${botOn[id]?"disabled":"enabled"}`)}
  };

  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:180,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"16px 8px"}}>
        <div className="sl">🧩 Plugins & AI</div>
        {["plugins","ai bots","my plugins"].map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)} style={{fontSize:12,textTransform:"capitalize"}}>{t}</div>)}
      </div>
      <div style={{flex:1,padding:24,overflowY:"auto"}}>
        {tab==="plugins"&&PLUGINS.map(p=>(
          <div key={p.id} className="card" style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:26}}>{p.i}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>{p.n}</span>
                {p.v&&<span className="chip" style={{background:"rgba(34,197,94,.1)",color:"var(--ok)"}}>✓ Official</span>}
              </div>
              <div style={{fontSize:12,color:"var(--txm)",marginTop:2}}>{p.d}</div>
            </div>
            <Toggle on={enabled[p.id]||false} onChange={()=>toggle(p.id,"p")} />
          </div>
        ))}
        {tab==="ai bots"&&BOTS.map(b=>(
          <div key={b.id} className="card" style={{marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:`${b.c}18`,border:`1px solid ${b.c}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{b.i}</div>
            <div style={{flex:1}}>
              <span style={{fontSize:14,fontWeight:700,color:b.c}}>{b.n}</span>
              <div style={{fontSize:12,color:"var(--txm)",marginTop:2}}>{b.d}</div>
              <div style={{display:"flex",gap:3,marginTop:4}}>{b.caps.map(c=><span key={c} className="chip" style={{background:"var(--bg3)",color:"var(--txg)"}}>{c}</span>)}</div>
            </div>
            <Toggle on={botOn[b.id]||false} onChange={()=>toggle(b.id,"b")} />
          </div>
        ))}
        {tab==="my plugins"&&(
          <div>
            <div className="card" style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
              <span style={{fontSize:24}}>🐙</span>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"var(--tx)"}}>GitHub Integration (Optional)</div>
                <div style={{fontSize:12,color:"var(--txm)"}}>Link GitHub to create custom plugins & AI bots</div>
              </div>
              <button className={`btn ${github?"btn-s":"btn-p"}`} onClick={()=>{setGithub(!github);notify(github?"Unlinked":"GitHub linked!")}} style={{padding:"6px 14px"}}>{github?"✓ Linked":"Link GitHub"}</button>
            </div>
            {github?<button className="btn btn-p" onClick={()=>notify("Plugin creator: coming v4.5!")}>+ Create Plugin</button>
            :<p style={{color:"var(--txg)",fontSize:13,textAlign:"center",padding:20}}>Link GitHub to get started</p>}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Voice Panel ──
const VoicePanel=({channel,onClose,notify})=>{
  const [muted,setMuted]=useState(false);
  const [deaf,setDeaf]=useState(false);
  const [outVol,setOutVol]=useState(80);
  const [userVols,setUserVols]=useState({});
  const [privMute,setPrivMute]=useState({});

  return(
    <div style={{padding:12,borderTop:"1px solid var(--bdr)",background:"var(--bg4)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div><div style={{fontSize:11,fontWeight:700,color:"var(--ok)"}}>🔊 Connected</div><div style={{fontSize:10,color:"var(--txg)"}}>{channel?.name}</div></div>
        <button className="btn btn-s" onClick={onClose} style={{padding:"3px 8px",fontSize:10,color:"var(--err)"}}>✕</button>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:8}}>
        <button onClick={()=>{setMuted(!muted);notify(muted?"Mic on":"Muted")}} style={{flex:1,padding:6,borderRadius:8,background:muted?"rgba(239,68,68,.1)":"var(--bg3)",border:`1px solid ${muted?"rgba(239,68,68,.3)":"var(--bdr)"}`,color:muted?"var(--err)":"var(--tx2)",fontSize:16,cursor:"pointer"}}>{muted?"🔇":"🎙"}</button>
        <button onClick={()=>{setDeaf(!deaf);notify(deaf?"Audio on":"Deafened")}} style={{flex:1,padding:6,borderRadius:8,background:deaf?"rgba(239,68,68,.1)":"var(--bg3)",border:`1px solid ${deaf?"rgba(239,68,68,.3)":"var(--bdr)"}`,color:deaf?"var(--err)":"var(--tx2)",fontSize:16,cursor:"pointer"}}>{deaf?"🔕":"🔔"}</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
        <span style={{fontSize:10,color:"var(--txm)"}}>🔊</span>
        <input type="range" min="0" max="200" value={outVol} onChange={e=>setOutVol(e.target.value)} style={{flex:1,accentColor:"var(--acc)"}} />
        <span style={{fontSize:9,color:"var(--txg)",fontFamily:"monospace",width:28}}>{outVol}%</span>
      </div>
      {(channel?.users||[]).length>0&&<div className="sl" style={{padding:"4px 0"}}>Users</div>}
      {(channel?.users||[]).map(uid=>(
        <div key={uid} style={{marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Avatar name={uid} size={18} />
            <span style={{fontSize:11,color:privMute[uid]?"var(--txg)":"var(--tx2)",flex:1,textDecoration:privMute[uid]?"line-through":"none"}}>{uid}</span>
            <span onClick={()=>{setPrivMute(p=>({...p,[uid]:!p[uid]}));notify(privMute[uid]?"Unmuted":"Muted (private)")}} style={{cursor:"pointer",fontSize:10}}>{privMute[uid]?"🔇":"🔊"}</span>
          </div>
          <div style={{paddingLeft:24,display:"flex",gap:4,alignItems:"center"}}>
            <input type="range" min="0" max="200" value={userVols[uid]||100} onChange={e=>setUserVols(p=>({...p,[uid]:parseInt(e.target.value)}))} style={{flex:1,accentColor:"var(--acc)",height:2}} />
            <span style={{fontSize:8,color:"var(--txg)",fontFamily:"monospace"}}>{userVols[uid]||100}%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Settings ──
const SettingsPanel=({theme,setTheme,user,notify})=>{
  const [tab,setTab]=useState("appearance");
  const themes=[["dark","Dark Nebula"],["midnight","Midnight"],["void","Void"],["light","Light Cloud"]];
  const tabs=["appearance","account","privacy","premium"];

  return(
    <div style={{flex:1,display:"flex",overflow:"hidden"}}>
      <div style={{width:180,background:"var(--bg2)",borderRight:"1px solid var(--bdr)",padding:"16px 8px"}}>
        <div className="sl">Settings</div>
        {tabs.map(t=><div key={t} className={`ch ${tab===t?"on":""}`} onClick={()=>setTab(t)} style={{fontSize:12,textTransform:"capitalize"}}>{t}</div>)}
      </div>
      <div style={{flex:1,padding:24,overflowY:"auto"}}>
        <h2 style={{fontSize:18,fontWeight:800,color:"var(--tx)",marginBottom:16,textTransform:"capitalize"}}>{tab}</h2>

        {tab==="appearance"&&(
          <div>
            <div className="sl">Theme</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:16}}>
              {themes.map(([k,n])=>(
                <div key={k} onClick={()=>{setTheme(k);notify(`Theme: ${n}`)}} className="card" style={{cursor:"pointer",borderColor:theme===k?"var(--acc)":"var(--bdr)"}}>
                  <span style={{fontSize:14,fontWeight:700,color:theme===k?"var(--acl)":"var(--tx2)"}}>{n}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="account"&&user&&(
          <div>
            <div className="card" style={{marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <Avatar name={user.display} size={48} />
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:"var(--tx)"}}>{user.display}</div>
                  <div style={{fontSize:12,color:"var(--txm)"}}>@{user.username}</div>
                </div>
              </div>
            </div>
            <p style={{fontSize:12,color:"var(--txm)"}}>Account management, email change, password reset coming in v4.5</p>
          </div>
        )}

        {tab==="privacy"&&(
          <div>
            {["DM from anyone","Show online status","Allow friend requests","Show activity status","Data collection"].map((n,i)=>(
              <div key={n} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:12,borderRadius:10,background:"var(--bg4)",border:"1px solid var(--bdr)",marginBottom:6}}>
                <span style={{fontSize:13,color:"var(--tx)"}}>{n}</span>
                <Toggle on={i<3} onChange={()=>notify(`${n} toggled`)} />
              </div>
            ))}
          </div>
        )}

        {tab==="premium"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
            {Object.entries(PREMIUM).map(([k,p])=>(
              <div key={k} className="card" style={{borderColor:`${p.c}30`,textAlign:"center"}}>
                <div style={{fontSize:20,fontWeight:800,color:p.c,marginBottom:4}}>{p.n}</div>
                <div style={{fontSize:14,fontWeight:700,color:"var(--tx)",marginBottom:8}}>{p.p}</div>
                {p.perks.map(pk=><div key={pk} style={{fontSize:11,color:"var(--txm)",marginBottom:2}}>✓ {pk}</div>)}
                <button className="btn btn-p" onClick={()=>notify(`${p.n} — coming soon!`)} style={{width:"100%",marginTop:10,background:`linear-gradient(135deg,${p.c},${p.c}88)`}}>Subscribe</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
