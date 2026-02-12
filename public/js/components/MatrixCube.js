/* MatrixCube — Animated Purple Matrix Cube Logo */
const { useState, useEffect } = React;

window.MatrixCube = ({ size = 40 }) => {
  const [ch, setCh] = useState([]);
  useEffect(() => {
    const k = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const i = setInterval(() => setCh(Array.from({ length: 9 }, () => k[Math.floor(Math.random() * k.length)])), 180);
    return () => clearInterval(i);
  }, []);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 ${size/4}px rgba(168,85,247,0.6))` }}>
      <defs>
        <linearGradient id="cf1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#A855F7"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient>
        <linearGradient id="cf2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#5B21B6"/></linearGradient>
        <linearGradient id="cf3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#C084FC"/><stop offset="100%" stopColor="#9333EA"/></linearGradient>
      </defs>
      <polygon points="50,12 88,30 50,48 12,30" fill="url(#cf3)" opacity="0.95"><animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite"/></polygon>
      <polygon points="12,30 50,48 50,86 12,68" fill="url(#cf2)" opacity="0.85"><animate attributeName="opacity" values="0.75;0.9;0.75" dur="3.5s" repeatCount="indefinite"/></polygon>
      <polygon points="50,48 88,30 88,68 50,86" fill="url(#cf1)" opacity="0.9"><animate attributeName="opacity" values="0.8;0.95;0.8" dur="2.8s" repeatCount="indefinite"/></polygon>
      {[0.33,0.66].map((t,i)=>(<g key={`g${i}`}><line x1={12+38*t} y1={30-18*t} x2={50+38*t} y2={48-18*t} stroke="#E9D5FF" strokeWidth="0.4" opacity="0.3"><animate attributeName="opacity" values="0.15;0.45;0.15" dur={`${2+i}s`} repeatCount="indefinite"/></line></g>))}
      {[{x:35,y:35},{x:50,y:30},{x:65,y:35},{x:25,y:50},{x:35,y:58},{x:28,y:68},{x:65,y:50},{x:75,y:55},{x:70,y:65}].map((p,i)=>(
        <text key={`m${i}`} x={p.x} y={p.y} fill="#E9D5FF" fontSize="7" fontFamily="monospace" textAnchor="middle" opacity="0">{ch[i]||"ア"}
          <animate attributeName="opacity" values="0;0.7;0.3;0.8;0" dur={`${1.5+(i%3)*0.4}s`} repeatCount="indefinite" begin={`${i*0.2}s`}/>
        </text>
      ))}
      <polygon points="50,12 88,30 50,48 12,30" fill="none" stroke="#C084FC" strokeWidth="1.2" opacity="0.5"><animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite"/></polygon>
      <polygon points="50,48 88,30 88,68 50,86" fill="none" stroke="#A855F7" strokeWidth="0.8" opacity="0.3"/>
      <polygon points="12,30 50,48 50,86 12,68" fill="none" stroke="#7C3AED" strokeWidth="0.8" opacity="0.3"/>
    </svg>
  );
};
