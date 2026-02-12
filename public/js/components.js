/* ═══ interClouder v4 — Neutron Compressed App ═══ */
const {useState,useEffect,useRef,useCallback}=React;

// ── Utility Components ──
const Avatar=({src,name,size=32,status,onClick,style={}})=>{
  const c=name?[...""+name].reduce((a,c)=>a+c.charCodeAt(0),0)%360:0;
  return(
    <div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",flexShrink:0,cursor:onClick?"pointer":"default",position:"relative",...style}}>
      {src?<img src={src} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover"}} />
      :<div style={{width:size,height:size,borderRadius:"50%",background:`hsl(${c},60%,45%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.4,fontWeight:700,color:"#fff"}}>{(name||"?")[0].toUpperCase()}</div>}
      {status&&<div style={{position:"absolute",bottom:0,right:0,width:size*.3,height:size*.3,borderRadius:"50%",background:status==="online"?"var(--ok)":status==="idle"?"var(--wrn)":status==="dnd"?"var(--err)":"var(--txg)",border:"2px solid var(--bg2)"}} />}
    </div>
  );
};

const Toggle=({on,onChange})=>(
  <div className={`tg ${on?"on":"off"}`} onClick={()=>onChange(!on)}><div className="k"/></div>
);

const Notify=({text})=>text?<div className="toast">{text}</div>:null;

const Badge=({badge,size=16})=>{
  const b=BADGES[badge];if(!b)return null;
  return b.img?<img src={b.img} title={b.l} style={{width:size,height:size,borderRadius:4}} />
    :<span title={b.l} style={{fontSize:size*.75,color:b.c}}>{b.i}</span>;
};

const TagChip=({tag,server})=>{
  if(!tag)return null;
  const days=Math.floor((Date.now()-(server?.created||Date.now()))/(86400000));
  const xp=server?.xp||0;
  const color=TAG_EVOLUTION.getColor(days,xp);
  const stage=TAG_EVOLUTION.getStage(days,xp);
  return(
    <span className="chip" style={{background:`${color}18`,color,border:`1px solid ${color}30`}}>
      [{tag.acronym}]{stage.glow&&"✦"}
    </span>
  );
};

const XPBar=({xp=0,max=1000,w=100})=>{
  const p=Math.min(xp/max,1);
  return(
    <div style={{width:w,height:4,borderRadius:2,background:"var(--bdr)",overflow:"hidden"}}>
      <div style={{width:`${p*100}%`,height:"100%",borderRadius:2,background:"linear-gradient(90deg,var(--acc),var(--acl))",transition:".3s"}} />
    </div>
  );
};

// ── Login Screen ──
const LoginScreen=({onLogin})=>{
  const [mode,setMode]=useState("login");
  const [username,setUsername]=useState("");
  const [display,setDisplay]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");

  const handle=()=>{
    if(mode==="register"){
      if(!username.trim()||!display.trim()||!email.trim()||!pass.trim()){setErr("All fields required");return}
      if(username.length<3||username.length>20){setErr("Username: 3-20 chars");return}
      onLogin({username:username.trim(),display:display.trim(),email:email.trim(),avatar:null,badges:[],role:"ceo",status:"online"});
    }else{
      if(!username.trim()||!pass.trim()){setErr("Username and password required");return}
      onLogin({username:username.trim(),display:username.trim(),email:"",avatar:null,badges:[],role:"ceo",status:"online"});
    }
  };

  return(
    <div className="login-bg">
      <div style={{width:380,padding:36,borderRadius:24,background:"var(--bg2)",border:"1px solid var(--bdr)",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:36,marginBottom:8}}>⬡</div>
          <h1 style={{fontSize:24,fontWeight:800,background:"linear-gradient(135deg,var(--acc),var(--pk))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>interClouder</h1>
          <p style={{fontSize:12,color:"var(--txf)",marginTop:4}}>The Secure Social Network</p>
        </div>

        <div style={{display:"flex",gap:4,marginBottom:16}}>
          {["login","register"].map(m=>(
            <button key={m} className={`tab ${mode===m?"on":"off"}`} onClick={()=>{setMode(m);setErr("")}} style={{flex:1,textTransform:"capitalize"}}>{m}</button>
          ))}
        </div>

        {err&&<div style={{padding:"8px 12px",borderRadius:8,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",color:"var(--err)",fontSize:12,marginBottom:12}}>{err}</div>}

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <input className="li" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} />
          {mode==="register"&&<input className="li" placeholder="Display Name" value={display} onChange={e=>setDisplay(e.target.value)} />}
          {mode==="register"&&<input className="li" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} type="email" />}
          <input className="li" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} type="password" onKeyDown={e=>e.key==="Enter"&&handle()} />
          <button className="btn btn-p" onClick={handle} style={{width:"100%",padding:12,fontSize:14,marginTop:4}}>
            {mode==="register"?"Create Account":"Login"}
          </button>
        </div>

        <div style={{textAlign:"center",marginTop:16}}>
          <p style={{fontSize:10,color:"var(--txg)"}}>🔒 5-Phase Encryption: {ENC_PHASES.join(" → ")}</p>
        </div>
      </div>
    </div>
  );
};

// ── Server Creator Modal ──
const ServerCreator=({onClose,onCreate,notify})=>{
  const [mode,setMode]=useState(null); // "template" or "temporary"
  const [step,setStep]=useState(0);
  const [name,setName]=useState("");
  const [acronym,setAcronym]=useState("");
  const [icon,setIcon]=useState("");
  const [template,setTemplate]=useState(null);
  const [tempDur,setTempDur]=useState("24h");
  const [channels,setChannels]=useState(["general"]);
  const [vChannels,setVChannels]=useState(["Voice"]);
  const [newCh,setNewCh]=useState("");
  const [newVCh,setNewVCh]=useState("");
  const [roles,setRoles]=useState([]);
  const [newRole,setNewRole]=useState("");
  const [roleColor,setRoleColor]=useState("#A855F7");
  const colors=["#A855F7","#EF4444","#06D6A0","#FBBF24","#F472B6","#818CF8","#F43F5E","#14B8A6","#6366F1","#D946EF"];
  const durOpts=[{v:"1h",l:"1 Hour"},{v:"6h",l:"6 Hours"},{v:"24h",l:"24 Hours"},{v:"3d",l:"3 Days"},{v:"7d",l:"7 Days"},{v:"30d",l:"30 Days"}];

  const pickTemplate=(t)=>{
    setTemplate(t.id);setName(t.n+" Server");setChannels([...t.chs]);setVChannels([...t.vch]);setRoles(t.roles.map(r=>({...r})));
    setAcronym(t.n.substring(0,3).toUpperCase());setStep(2);
  };

  const create=()=>{
    if(!name.trim()){notify("Name required!");return}
    if(!acronym.trim()||acronym.length>6){notify("Acronym: 1-6 chars!");return}
    const id="s"+Date.now().toString(36);
    const srv={
      id,name:name.trim(),acronym:acronym.trim().toUpperCase(),icon:icon||name.substring(0,2).toUpperCase(),
      color:roleColor,members:[],boostLv:0,xp:0,created:Date.now(),
      isTemp:mode==="temporary",tempDur:mode==="temporary"?tempDur:null,
      channels:channels.map((c,i)=>({id:id+"c"+i,name:c,type:"text",slowmode:0,msgs:[]})),
      vChannels:vChannels.map((c,i)=>({id:id+"v"+i,name:c,type:"voice",users:[]})),
      roles:[{n:"Owner",c:"#FFD700"},{n:"Admin",c:"#EF4444"},{n:"Mod",c:"#06D6A0"},...roles,{n:"Member",c:"#818CF8"}],
      plugins:[],bots:[],bans:[],strikes:[],tags:{acronym:acronym.trim().toUpperCase()},
    };
    onCreate(srv);onClose();
    notify(`Server "${name}" created!${mode==="temporary"?" (expires in "+tempDur+")":""}`);
  };

  // Mode Selection
  if(!mode)return(
    <div className="modal" onClick={onClose}>
      <div className="mcard" onClick={e=>e.stopPropagation()} style={{width:440,padding:28}}>
        <h2 style={{fontSize:20,fontWeight:800,color:"var(--tx)",marginBottom:6}}>Create Server</h2>
        <p style={{fontSize:12,color:"var(--txf)",marginBottom:20}}>Choose how to create your server</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div onClick={()=>{setMode("template");setStep(1)}} style={{padding:24,borderRadius:16,background:"var(--bg4)",border:"1px solid var(--bdr)",cursor:"pointer",textAlign:"center",transition:".2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--acc)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--bdr)"}>
            <div style={{fontSize:40,marginBottom:8}}>📋</div>
            <div style={{fontSize:15,fontWeight:700,color:"var(--tx)"}}>From Template</div>
            <p style={{fontSize:11,color:"var(--txm)",marginTop:4}}>Pick a template to start with pre-configured channels & roles</p>
          </div>
          <div onClick={()=>{setMode("temporary");setStep(1)}} style={{padding:24,borderRadius:16,background:"var(--bg4)",border:"1px solid var(--bdr)",cursor:"pointer",textAlign:"center",transition:".2s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--wrn)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--bdr)"}>
            <div style={{fontSize:40,marginBottom:8}}>⏱</div>
            <div style={{fontSize:15,fontWeight:700,color:"var(--tx)"}}>Temporary Server</div>
            <p style={{fontSize:11,color:"var(--txm)",marginTop:4}}>Auto-deletes after set time — perfect for events & temp groups</p>
          </div>
        </div>
      </div>
    </div>
  );

  return(
    <div className="modal" onClick={onClose}>
      <div className="mcard" onClick={e=>e.stopPropagation()} style={{width:480,padding:28}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <h2 style={{fontSize:18,fontWeight:800,color:"var(--tx)"}}>{mode==="template"?"Template Server":"Temporary Server"}</h2>
          {mode==="temporary"&&<span className="chip" style={{background:"#FBBF2418",color:"#FBBF24"}}>⏱ TEMP</span>}
        </div>
        {/* Steps */}
        <div style={{display:"flex",gap:4,margin:"12px 0 16px"}}>
          {[1,2,3].map(s=><div key={s} className="step" style={{background:s<=step?"var(--acc)":"var(--bdr)"}} />)}
        </div>

        {/* Step 1: Template pick OR temp duration */}
        {step===1&&mode==="template"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
              {TEMPLATES.map(t=>(
                <div key={t.id} onClick={()=>pickTemplate(t)} style={{padding:14,borderRadius:12,background:template===t.id?"var(--bga)":"var(--bg4)",border:`1px solid ${template===t.id?"var(--acc)":"var(--bdr)"}`,cursor:"pointer",textAlign:"center",transition:".2s"}}>
                  <div style={{fontSize:26}}>{t.i}</div>
                  <div style={{fontSize:12,fontWeight:700,color:template===t.id?"var(--acl)":"var(--tx2)",marginTop:4}}>{t.n}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step===1&&mode==="temporary"&&(
          <div>
            <label style={{fontSize:10,color:"var(--txf)",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:6}}>Duration</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
              {durOpts.map(o=>(
                <button key={o.v} className={`tab ${tempDur===o.v?"on":"off"}`} onClick={()=>setTempDur(o.v)}>{o.l}</button>
              ))}
            </div>
            <button className="btn btn-p" onClick={()=>setStep(2)} style={{width:"100%"}}>Next →</button>
          </div>
        )}

        {/* Step 2: Name, Acronym, Channels */}
        {step===2&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <label style={{fontSize:10,color:"var(--txf)",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:4}}>Server Name</label>
              <input className="li" value={name} onChange={e=>{setName(e.target.value);if(!acronym||acronym===name.substring(0,3).toUpperCase())setAcronym(e.target.value.substring(0,3).toUpperCase())}} placeholder="My Server" />
            </div>
            <div style={{display:"flex",gap:10}}>
              <div style={{flex:1}}>
                <label style={{fontSize:10,color:"var(--txf)",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:4}}>Tag Acronym (1-6 chars)</label>
                <input className="li" value={acronym} onChange={e=>setAcronym(e.target.value.toUpperCase().substring(0,6).replace(/[^A-Z0-9]/g,""))} placeholder="TAG" maxLength={6} style={{textTransform:"uppercase",letterSpacing:2,fontWeight:800}} />
              </div>
              <div>
                <label style={{fontSize:10,color:"var(--txf)",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:4}}>Icon (2 chars)</label>
                <input className="li" value={icon} onChange={e=>setIcon(e.target.value.substring(0,2))} placeholder={name?name.substring(0,2).toUpperCase():"IC"} maxLength={2} style={{width:70,textAlign:"center"}} />
              </div>
            </div>
            <div>
              <label style={{fontSize:10,color:"var(--txf)",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:4}}>Color</label>
              <div style={{display:"flex",gap:6}}>{colors.map(c=><div key={c} onClick={()=>setRoleColor(c)} style={{width:26,height:26,borderRadius:8,background:c,cursor:"pointer",border:roleColor===c?"2px solid #fff":"2px solid transparent"}} />)}</div>
            </div>
            <div>
              <label style={{fontSize:10,color:"var(--txf)",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:4}}>Text Channels</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                {channels.map((c,i)=>(
                  <span key={i} className="chip" style={{background:"var(--bg3)",color:"var(--tx2)"}}>
                    # {c} <span onClick={()=>setChannels(p=>p.filter((_,j)=>j!==i))} style={{cursor:"pointer",marginLeft:3,color:"var(--txg)"}}>×</span>
                  </span>
                ))}
              </div>
              <div style={{display:"flex",gap:6}}>
                <input className="li" value={newCh} onChange={e=>setNewCh(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newCh.trim()){setChannels(p=>[...p,newCh.trim().toLowerCase().replace(/\s+/g,"-")]);setNewCh("")}}} placeholder="Add channel..." style={{flex:1}} />
                <button className="btn btn-s" onClick={()=>{if(newCh.trim()){setChannels(p=>[...p,newCh.trim().toLowerCase().replace(/\s+/g,"-")]);setNewCh("")}}}>+</button>
              </div>
            </div>
            <div>
              <label style={{fontSize:10,color:"var(--txf)",textTransform:"uppercase",letterSpacing:1,display:"block",marginBottom:4}}>Voice Channels</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                {vChannels.map((c,i)=>(
                  <span key={i} className="chip" style={{background:"var(--bg3)",color:"var(--tx2)"}}>
                    🔊 {c} <span onClick={()=>setVChannels(p=>p.filter((_,j)=>j!==i))} style={{cursor:"pointer",marginLeft:3,color:"var(--txg)"}}>×</span>
                  </span>
                ))}
              </div>
              <div style={{display:"flex",gap:6}}>
                <input className="li" value={newVCh} onChange={e=>setNewVCh(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newVCh.trim()){setVChannels(p=>[...p,newVCh.trim()]);setNewVCh("")}}} placeholder="Add voice channel..." style={{flex:1}} />
                <button className="btn btn-s" onClick={()=>{if(newVCh.trim()){setVChannels(p=>[...p,newVCh.trim()]);setNewVCh("")}}}>+</button>
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-s" onClick={()=>setStep(1)}>← Back</button>
              <button className="btn btn-p" onClick={()=>setStep(3)} style={{flex:1}}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Roles & Create */}
        {step===3&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:12,color:"var(--txm)"}}>Default roles (Owner, Admin, Mod, Member) are included. Add custom roles:</p>
            {roles.map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:8,borderRadius:8,background:"var(--bg4)",border:"1px solid var(--bdr)"}}>
                <div style={{width:12,height:12,borderRadius:6,background:r.c}} />
                <span style={{fontSize:13,fontWeight:600,color:r.c,flex:1}}>{r.n}</span>
                <span onClick={()=>setRoles(p=>p.filter((_,j)=>j!==i))} style={{cursor:"pointer",color:"var(--txg)",fontSize:14}}>×</span>
              </div>
            ))}
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input className="li" value={newRole} onChange={e=>setNewRole(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&newRole.trim()){setRoles(p=>[...p,{n:newRole.trim(),c:roleColor}]);setNewRole("")}}} placeholder="Role name..." style={{flex:1}} />
              <div style={{display:"flex",gap:2}}>{colors.slice(0,5).map(c=><div key={c} onClick={()=>setRoleColor(c)} style={{width:20,height:20,borderRadius:6,background:c,cursor:"pointer",border:roleColor===c?"2px solid #fff":"2px solid transparent"}} />)}</div>
              <button className="btn btn-s" onClick={()=>{if(newRole.trim()){setRoles(p=>[...p,{n:newRole.trim(),c:roleColor}]);setNewRole("")}}} style={{padding:"6px 12px"}}>+</button>
            </div>

            {/* Summary */}
            <div className="card" style={{background:"var(--bg3)"}}>
              <div style={{fontSize:10,fontWeight:700,color:"var(--txg)",textTransform:"uppercase",marginBottom:6}}>Summary</div>
              <div style={{fontSize:12,color:"var(--txm)",lineHeight:1.8}}>
                <div>📛 <strong style={{color:"var(--tx)"}}>{name||"Unnamed"}</strong> <span className="chip" style={{background:`${roleColor}18`,color:roleColor}}>[{acronym||"???"}]</span></div>
                <div>📁 {channels.length} text + {vChannels.length} voice channels</div>
                <div>🎭 {roles.length+4} roles</div>
                {mode==="temporary"&&<div>⏱ Expires in {tempDur}</div>}
              </div>
            </div>

            <div style={{display:"flex",gap:8}}>
              <button className="btn btn-s" onClick={()=>setStep(2)}>← Back</button>
              <button className="btn btn-p" onClick={create} style={{flex:1}}>Create Server</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
