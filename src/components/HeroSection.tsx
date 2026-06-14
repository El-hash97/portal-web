'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';

function CountUp({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - t0) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(ease * to));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to, duration]);

  return <span ref={ref}>{val}</span>;
}

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  orange: boolean;
}

export function HeroSection() {
  const { apps } = useAppStore();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Client-side only — avoids SSR hydration mismatch
    setParticles(
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        x: (i * 4.7 + Math.sin(i * 1.3) * 3.5) % 100,
        size: 1.4 + (i % 4) * 0.55,
        duration: 5.5 + (i % 6) * 1.1,
        delay: -((i * 0.55) % 9),
        opacity: 0.22 + (i % 5) * 0.1,
        orange: i % 6 === 0,
      }))
    );
    const t = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(t);
  }, []);

  const totalApps = apps.length || 5;
  const activeApps = apps.filter(a => a.aktif).length || 5;

  const stats = [
    { value: 5,         label: 'Furnace',  sub: 'MF1–3, LF4–5' },
    { value: 3,         label: 'Shift',    sub: 'per hari' },
    { value: totalApps, label: 'Aplikasi', sub: `${activeApps} aktif` },
    { value: 4,         label: 'Kategori', sub: 'tools internal' },
  ];

  function scrollToApps() {
    document.getElementById('apps-content')?.scrollIntoView({ behavior: 'smooth' });
  }

  const reveal = (delay: number): React.CSSProperties => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.22,0.61,0.36,1)',
    transitionDelay: `${delay}ms`,
  });

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#080808', minHeight: 'min(72vh, 600px)' }}
    >
      {/* Technical grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          ].join(','),
          backgroundSize: '48px 48px',
        }}
      />

      {/* Furnace heat glow — bottom left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 62% 52% at -8% 118%, rgba(235,10,30,0.28) 0%, rgba(255,68,0,0.09) 38%, transparent 66%)',
        }}
      />

      {/* Cool accent — top right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 36% 32% at 112% -8%, rgba(150,165,200,0.055) 0%, transparent 55%)',
        }}
      />

      {/* Radar scan line */}
      <div className="hero-scan-line pointer-events-none" />

      {/* Ember particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="hero-ember pointer-events-none"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.9}px`,
            background: p.orange ? '#FF6200' : '#EB0A1E',
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-[1240px] mx-auto px-6 sm:px-10 py-16 sm:py-20 flex flex-col justify-center">

        {/* Corner targeting brackets */}
        {(
          [
            'top-7 left-6 sm:left-10 border-t border-l',
            'top-7 right-6 sm:right-10 border-t border-r',
            'bottom-14 left-6 sm:left-10 border-b border-l',
            'bottom-14 right-6 sm:right-10 border-b border-r',
          ] as const
        ).map((cls, i) => (
          <div
            key={i}
            className={`absolute w-6 h-6 pointer-events-none ${cls}`}
            style={{ borderColor: 'rgba(235,10,30,0.28)' }}
          />
        ))}

        {/* Live indicator badge */}
        <div className="inline-flex items-center gap-2 self-start mb-8" style={reveal(0)}>
          <span className="w-1.5 h-1.5 rounded-full hero-pulse-dot" style={{ background: '#EB0A1E' }} />
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255,255,255,0.38)' }}
          >
            TMMIN · Casting Division · EPSD Sunter 2
          </span>
        </div>

        {/* Headline line 1 — white, masked slide-up */}
        <div style={{ overflow: 'hidden', marginBottom: '4px' }}>
          <div
            style={{
              fontSize: 'clamp(38px, 7.5vw, 82px)',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'translateY(0)' : 'translateY(105%)',
              transition: 'opacity 0.4s ease, transform 0.75s cubic-bezier(0.22,0.61,0.36,1)',
              transitionDelay: '100ms',
            }}
          >
            Semua Tools.
          </div>
        </div>

        {/* Headline line 2 — Toyota Red */}
        <div style={{ overflow: 'hidden', marginBottom: '28px' }}>
          <div
            style={{
              fontSize: 'clamp(38px, 7.5vw, 82px)',
              fontWeight: 900,
              color: '#EB0A1E',
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'translateY(0)' : 'translateY(105%)',
              transition: 'opacity 0.4s ease, transform 0.75s cubic-bezier(0.22,0.61,0.36,1)',
              transitionDelay: '210ms',
            }}
          >
            Satu Klik.
          </div>
        </div>

        {/* Red accent underline — expands left to right */}
        <div
          style={{
            height: '2px',
            background: '#EB0A1E',
            marginBottom: '24px',
            width: revealed ? '72px' : '0px',
            opacity: revealed ? 1 : 0,
            transition: 'width 0.55s cubic-bezier(0.22,0.61,0.36,1), opacity 0.3s ease',
            transitionDelay: '370ms',
          }}
        />

        {/* Subtitle */}
        <p
          className="max-w-[460px] leading-relaxed mb-10"
          style={{
            fontSize: '13.5px',
            color: 'rgba(255,255,255,0.4)',
            ...reveal(450),
          }}
        >
          Portal akses terpusat untuk seluruh aplikasi digital Casting Division —
          input harian, checksheet, kalkulator proses, hingga monitoring produksi.
        </p>

        {/* Stat cards */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[580px] mb-10"
          style={reveal(550)}
        >
          {stats.map((s, i) => (
            <div key={s.label} className="hero-stat-card rounded-xl p-4">
              <div
                className="tabular-nums font-black leading-none mb-1"
                style={{ fontSize: '28px', color: '#EB0A1E', letterSpacing: '-0.04em' }}
              >
                <CountUp to={s.value} duration={1100 + i * 130} />
              </div>
              <div className="text-[12px] font-bold text-white">{s.label}</div>
              <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={scrollToApps}
          className="inline-flex items-center gap-2.5 self-start group"
          style={reveal(680)}
        >
          <span
            className="text-[13px] font-semibold hero-cta-text"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Lihat Aplikasi
          </span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center hero-bounce-down"
            style={{
              background: 'rgba(235,10,30,0.12)',
              border: '1px solid rgba(235,10,30,0.28)',
            }}
          >
            <ChevronDown size={13} style={{ color: '#EB0A1E' }} />
          </div>
        </button>
      </div>

      {/* Diagonal SVG divider into body #F0F0F0 */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 52"
          preserveAspectRatio="none"
          style={{ display: 'block', width: '100%', height: '52px' }}
        >
          <path d="M0,52 L0,22 L1440,0 L1440,52 Z" fill="#F0F0F0" />
        </svg>
      </div>
    </section>
  );
}
