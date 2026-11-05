import React, { useState, useEffect } from 'react';

const STAR_COLORS = ['#ffffff', '#fff8f0', '#f0f4ff', '#ffe8d0', '#d0e8ff'];
const STATIC_STARS = Array.from({ length: 220 }).map((_, i) => {
  const r = Math.random() * 1.4 + 0.2;
  return {
    id: i, x: Math.random() * 100, y: Math.random() * 100, r,
    opacity: Math.random() * 0.7 + 0.2,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    twinkle: r > 1.0 && Math.random() > 0.5,
  };
});

function ShootingStars() {
  const [star, setStar] = useState<{ id: number; x: number; y: number } | null>(null);
  useEffect(() => {
    let id = 0;
    const launch = () => {
      setStar({ id: id++, x: Math.random() * 100, y: Math.random() * 30 });
      setTimeout(() => setStar(null), 800);
      setTimeout(launch, 1200 + Math.random() * 3000);
    };
    const t = setTimeout(launch, 2000);
    return () => clearTimeout(t);
  }, []);
  if (!star) return null;
  return (
    <div key={star.id} className="absolute w-24 h-px bg-gradient-to-r from-white to-transparent" 
      style={{ left: `${star.x}%`, top: `${star.y}%`, transform: 'rotate(35deg)', animation: 'sk-rain-0 0.8s linear forwards' }} 
    />
  );
}

export function ClearNightBackground() {
  return (
    <div className="absolute inset-0">
      <svg className="w-full h-full">
        {STATIC_STARS.map(s => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill={s.color}
            style={{ opacity: s.opacity, animation: s.twinkle ? 'sk-twinkle 4s infinite ease-in-out' : 'none', animationDelay: `${Math.random() * 5}s` }} />
        ))}
        {STATIC_STARS.filter(s => s.r > 1.3).slice(0, 8).map(s => (
          <circle key={`g-${s.id}`} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r * 2.5} fill={s.color} opacity={0.08} />
        ))}
      </svg>
      <ShootingStars />
    </div>
  );
}

export function RainBackground({ heavy }: { heavy: boolean }) {
  const count = heavy ? 180 : 90;
  const drops = Array.from({ length: count }).map((_, i) => ({
    id: i, x: Math.random() * 110 - 5, delay: Math.random() * 2,
    duration: Math.random() * 0.3 + (heavy ? 0.35 : 0.55),
    height: Math.random() * 20 + (heavy ? 16 : 10),
    opacity: Math.random() * 0.45 + 0.2, layer: Math.floor(Math.random() * 3)
  }));
  const layerProps = [
    { width: 1, blur: '0.5px', scale: 0.7 },
    { width: 1.5, blur: '0px', scale: 1.0 },
    { width: 2, blur: '0px', scale: 1.3 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none">
      {drops.map(d => {
        const lp = layerProps[d.layer];
        const lf = (d.layer + 1) / 3;
        return (
          <div key={d.id} className="absolute top-0 rounded-full"
            style={{
              left: `${d.x}%`, width: `${lp.width}px`, height: `${d.height}px`,
              background: `linear-gradient(to bottom, transparent, rgba(180,220,255,${d.opacity * lf}), rgba(200,230,255,${d.opacity}))`,
              filter: `blur(${lp.blur})`, transform: `scale(${lp.scale})`,
              animation: `sk-rain-${d.layer} ${d.duration}s linear infinite`, animationDelay: `-${d.delay}s`
            }} />
        );
      })}
      <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-[rgba(100,160,220,0.08)] to-transparent" />
    </div>
  );
}

export function DrizzleBackground() {
  const drops = Array.from({ length: 55 }).map((_, i) => ({
    id: i, x: Math.random() * 110 - 5, delay: Math.random() * 2,
    duration: Math.random() * 1.0 + 1.4, height: Math.random() * 15 + 8,
    opacity: Math.random() * 0.3 + 0.1, layer: Math.floor(Math.random() * 2)
  }));
  return (
    <div className="absolute inset-0 pointer-events-none bg-[rgba(80,110,140,0.15)]">
      {drops.map(d => (
        <div key={d.id} className="absolute top-0 w-[1px] rounded-full"
          style={{
            left: `${d.x}%`, height: `${d.height}px`,
            background: `rgba(200,230,255,${d.opacity})`,
            animation: `sk-drizzle ${d.duration}s linear infinite`, animationDelay: `-${d.delay}s`
          }} />
      ))}
    </div>
  );
}

function LightningBolt({ active, offset }: { active: boolean; offset: number }) {
  if (!active) return null;
  const segments = Math.floor(Math.random() * 5) + 6;
  const points = [];
  let cx = 50 + offset + (Math.random() * 40 - 20);
  let cy = Math.random() * 15 + 5;
  points.push(`${cx},${cy}`);
  for (let i = 0; i < segments; i++) {
    cx += Math.random() * 60 - 30;
    cy += Math.random() * 40 + 80;
    points.push(`${cx},${cy}`);
  }
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <polyline points={points.join(' ')} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" filter="url(#glow)" />
    </svg>
  );
}

export function ThunderBackground() {
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    const doFlash = () => {
      setFlash(true);
      setTimeout(() => setFlash(false), 80);
      setTimeout(() => setFlash(true), 230);
      setTimeout(() => setFlash(false), 340);
      setTimeout(doFlash, 2500 + Math.random() * 5000);
    };
    const t = setTimeout(doFlash, 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="absolute inset-0">
      <RainBackground heavy />
      <div className={`absolute inset-0 bg-white transition-opacity duration-75 ${flash ? 'opacity-30' : 'opacity-0'}`} />
      <LightningBolt active={flash} offset={0} />
      <LightningBolt active={flash} offset={20} />
    </div>
  );
}

export function SnowBackground() {
  const flakes = Array.from({ length: 110 }).map((_, i) => {
    const size = Math.random() * 5 + 1.5;
    return {
      id: i, x: Math.random() * 105, size, delay: Math.random() * 8, duration: Math.random() * 6 + 5,
      drift: (Math.random() - 0.5) * 80, opacity: Math.random() * 0.6 + 0.3
    };
  });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flakes.map(f => (
        <div key={f.id} className="absolute top-0 bg-white rounded-full"
          style={{
            left: `${f.x}%`, width: `${f.size}px`, height: `${f.size}px`, opacity: f.opacity,
            '--drift': `${f.drift}vw`,
            animation: `sk-snow ${f.duration}s linear infinite`, animationDelay: `-${f.delay}s`,
            boxShadow: f.size > 4 ? '0 0 3px rgba(255,255,255,0.5)' : 'none',
            filter: f.size < 2.5 ? 'blur(0.5px)' : 'none'
          } as React.CSSProperties} />
      ))}
      <div className="absolute bottom-0 w-full h-[12%] bg-white/20 blur-[4px]" />
    </div>
  );
}

export function FogBackground({ dark }: { dark: boolean }) {
  const bands = [
    { id: 0, top: 8, height: 120, speed: 14, delay: 0, opacity: dark ? 0.18 : 0.30 },
    { id: 1, top: 24, height: 100, speed: 20, delay: -5, opacity: dark ? 0.14 : 0.25 },
    { id: 2, top: 40, height: 140, speed: 11, delay: -9, opacity: dark ? 0.20 : 0.35 },
    { id: 3, top: 58, height: 90, speed: 17, delay: -3, opacity: dark ? 0.16 : 0.28 },
    { id: 4, top: 72, height: 160, speed: 24, delay: -14, opacity: dark ? 0.22 : 0.38 },
    { id: 5, top: 88, height: 80, speed: 9, delay: -7, opacity: dark ? 0.12 : 0.20 },
  ];
  const color = dark ? '130,150,190' : '255,255,255';
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bands.map(b => (
        <div key={b.id} className="absolute -left-[15%] w-[130%]"
          style={{
            top: `${b.top}%`, height: `${b.height}px`,
            background: `linear-gradient(90deg, transparent, rgba(${color},${b.opacity}) 20%, rgba(${color},${b.opacity}) 80%, transparent)`,
            filter: 'blur(30px)', animation: `sk-fog-${b.id % 2 === 0 ? 'l' : 'r'} ${b.speed}s ease-in-out infinite alternate`, animationDelay: `${b.delay}s`
          }} />
      ))}
      <div className="absolute bottom-0 w-full h-[25%] bg-[rgba(255,255,255,0.2)] blur-[20px]" style={{ background: `rgba(${color}, 0.25)` }} />
    </div>
  );
}

function CloudShape({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 100 60" fill={fill} className="w-full h-full drop-shadow-md">
      <ellipse cx="30" cy="45" rx="20" ry="15" />
      <ellipse cx="50" cy="45" rx="25" ry="15" />
      <ellipse cx="70" cy="45" rx="20" ry="15" />
      <ellipse cx="40" cy="30" rx="22" ry="18" />
      <ellipse cx="60" cy="30" rx="22" ry="18" />
    </svg>
  );
}

export function CloudyBackground({ dark }: { dark: boolean }) {
  const color = dark ? 'rgba(60,70,90,0.8)' : 'rgba(255,255,255,0.85)';
  const layers = Array.from({ length: 6 }).map((_, i) => ({
    id: i, top: Math.random() * 40 - 10, speed: Math.random() * 40 + 60,
    size: Math.random() * 200 + 300, delay: Math.random() * -60
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {layers.map(l => (
        <div key={l.id} className="absolute"
          style={{
            top: `${l.top}%`, width: `${l.size}px`, height: `${l.size * 0.6}px`, opacity: 0.8,
            animation: `sk-cloud-${l.id} ${l.speed}s linear infinite`, animationDelay: `${l.delay}s`
          }}>
          <CloudShape fill={color} />
        </div>
      ))}
    </div>
  );
}

export function ClearDayBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[8%] left-[50%] w-20 h-20 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,240,160,1) 0%, rgba(255,210,80,0.9) 50%, rgba(255,170,40,0.6) 100%)',
          boxShadow: '0 0 60px rgba(255,210,80,0.5), 0 0 120px rgba(255,180,40,0.25)',
          animation: 'sk-sunpulse 6s infinite ease-in-out'
        }} />
      <div className="absolute top-[8%] left-[50%] -ml-10 mt-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="absolute origin-top w-[2px] h-[55vh] bg-[rgba(255,200,100,0.8)]"
            style={{ transform: `rotate(${i * 30}deg)`, animation: 'sk-sunray 6s infinite alternate', animationDelay: `${-i * 0.5}s` }} />
        ))}
      </div>
      <div className="absolute top-0 left-[20%] w-[60%] h-[50%] rounded-full bg-[rgba(255,200,50,0.15)] blur-[30px]" />
    </div>
  );
}
