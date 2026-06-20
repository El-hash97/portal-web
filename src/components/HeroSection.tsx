'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import { ICON_MAP } from '@/lib/constants';

/* ── orbit config ─────────────────────────────────────── */
const RADIUS      = 378;   // 252 × 1.5 — orbit surrounds hero text
const ICON_SIZE   = 69;                                  // 1.5× original (46 × 1.5)
const SQUISH      = 0.55;                                // scaleY to turn circle → oval
const ORBIT_SPEED = '32s';
const ORBIT_DIM   = (RADIUS + ICON_SIZE / 2 + 8) * 2;  // square container pre-squish

/* ── text entrance ────────────────────────────────────── */
const fadeUp = (i: number) => ({
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.9, delay: 0.45 + i * 0.18, ease: [0.25, 0.4, 0.25, 1] as const },
  },
});

/* ── one orbiting app icon ────────────────────────────── */
function OrbitIcon({
  nama, logo, index, total, catBg, catColor, Icon,
}: {
  nama: string; logo?: string; index: number; total: number;
  catBg: string; catColor: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Icon: any;
}) {
  const angle = -Math.PI / 2 + (index / total) * 2 * Math.PI;
  const cx    = ORBIT_DIM / 2 + RADIUS * Math.cos(angle) - ICON_SIZE / 2;
  const cy    = ORBIT_DIM / 2 + RADIUS * Math.sin(angle) - ICON_SIZE / 2;

  return (
    <div className="absolute" style={{ left: cx, top: cy, width: ICON_SIZE, height: ICON_SIZE }}>
      {/* 1. counter-spin — cancels the orbit rotation */}
      <div style={{ width: '100%', height: '100%', animation: `cast-counter ${ORBIT_SPEED} linear infinite` }}>
        {/* 2. correction — undoes the oval squish + 45° tilt so icons look normal
               inverse of rotate(45deg) scaleY(SQUISH) = scaleY(1/SQUISH) rotate(0deg) */}
        <div style={{ transform: `scaleY(${1 / SQUISH})` }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo} alt={nama}
              style={{
                width: ICON_SIZE, height: ICON_SIZE, borderRadius: '50%', objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.7)',
              }}
            />
          ) : (
            <div style={{
              width: ICON_SIZE, height: ICON_SIZE, borderRadius: '50%',
              background: catBg, color: catColor,
              border: '2px solid rgba(255,255,255,0.12)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={26} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── floating shape (original background element) ────── */
function ElegantShape({
  className, delay = 0, width = 400, height = 100, rotate = 0, gradient = 'from-white/[0.08]',
}: {
  className?: string; delay?: number; width?: number; height?: number; rotate?: number; gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{ duration: 2.4, delay, ease: [0.23, 0.86, 0.39, 0.96], opacity: { duration: 1.2 } }}
      className={`absolute ${className ?? ''}`}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width, height }}
        className="relative"
      >
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r to-transparent ${gradient} backdrop-blur-[2px] border-2 border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] after:absolute after:inset-0 after:rounded-full after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]`} />
      </motion.div>
    </motion.div>
  );
}

/* ── hero ─────────────────────────────────────────────── */
export function HeroSection() {
  const { apps, getCategoryStyle } = useAppStore();
  const orbitApps = apps.filter(a => a.aktif).slice(0, 12);

  function scrollToApps() {
    document.getElementById('apps-content')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section
      className="relative overflow-hidden flex items-center justify-center"
      style={{ background: '#080808', minHeight: 'min(80vh, 640px)' }}
    >
      {/* Grid */}
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

      {/* Red glow — bottom left (original) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 62% 52% at -8% 118%, rgba(235,10,30,0.22) 0%, rgba(255,68,0,0.07) 38%, transparent 66%)',
        }}
      />

      {/* Floating ElegantShapes (original background) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ElegantShape delay={0.3} width={580} height={130} rotate={12}  gradient="from-red-500/[0.12]"    className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]" />
        <ElegantShape delay={0.5} width={460} height={110} rotate={-15} gradient="from-orange-500/[0.10]" className="right-[-5%] md:right-[0%] top-[60%] md:top-[65%]" />
        <ElegantShape delay={0.4} width={280} height={75}  rotate={-8}  gradient="from-rose-700/[0.10]"   className="left-[5%] md:left-[10%] bottom-[8%] md:bottom-[12%]" />
        <ElegantShape delay={0.6} width={180} height={55}  rotate={20}  gradient="from-red-400/[0.09]"    className="right-[15%] md:right-[20%] top-[10%] md:top-[14%]" />
        <ElegantShape delay={0.7} width={140} height={38}  rotate={-25} gradient="from-orange-300/[0.08]" className="left-[20%] md:left-[26%] top-[5%] md:top-[9%]" />
      </div>

      {/* Scan line */}
      <div className="hero-scan-line" />

      {/* ── ORBIT layer — behind text ─────────────────── */}
      {/* Visible on md+ to avoid overlapping text on small screens */}
      <div
        className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {/* oval tilt wrapper — scaleY squish → horizontal oval */}
        <div style={{ transform: `translateY(-32px) scaleY(${SQUISH})` }}>
          <div className="relative" style={{ width: ORBIT_DIM, height: ORBIT_DIM }}>

            {/* Dashed orbit ring — circle inside squished wrapper = tilted oval */}
            <div
              className="absolute rounded-full"
              style={{
                inset: ICON_SIZE / 2 - 2,
                border: '1px dashed rgba(255,255,255,0.09)',
                animation: 'cast-pulse-ring 5s ease-in-out infinite',
              }}
            />

            {/* Spinning ring with icons */}
            <div
              className="absolute inset-0"
              style={{ animation: `cast-spin ${ORBIT_SPEED} linear infinite` }}
            >
              {orbitApps.length > 0
                ? orbitApps.map((app, i) => {
                    const cat  = getCategoryStyle(app.kategori);
                    const Icon = ICON_MAP[app.icon] ?? ICON_MAP.box;
                    return (
                      <OrbitIcon
                        key={app.id}
                        nama={app.nama}
                        logo={app.logo}
                        index={i}
                        total={orbitApps.length}
                        catBg={cat.bg}
                        catColor={cat.color}
                        Icon={Icon}
                      />
                    );
                  })
                /* placeholder dots while apps load */
                : Array.from({ length: 8 }).map((_, i) => {
                    const angle = -Math.PI / 2 + (i / 8) * 2 * Math.PI;
                    const cx    = ORBIT_DIM / 2 + RADIUS * Math.cos(angle) - ICON_SIZE / 2;
                    const cy    = ORBIT_DIM / 2 + RADIUS * Math.sin(angle) - ICON_SIZE / 2;
                    return (
                      <div key={i} className="absolute" style={{ left: cx, top: cy, width: ICON_SIZE, height: ICON_SIZE }}>
                        <div style={{ width: '100%', height: '100%', animation: `cast-counter ${ORBIT_SPEED} linear infinite` }}>
                          <div style={{ transform: `scaleY(${1 / SQUISH})` }}>
                            <div style={{
                              width: ICON_SIZE, height: ICON_SIZE, borderRadius: '50%',
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }} />
                          </div>
                        </div>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── TEXT content — centered, above orbit ─────── */}
      <div
        className="relative flex flex-col items-center text-center px-6 sm:px-10 py-16 sm:py-20 max-w-[640px] mx-auto"
        style={{ zIndex: 10 }}
      >
        {/* Corner targeting brackets */}
        {(['top-7 left-6 sm:left-10 border-t border-l',
           'top-7 right-6 sm:right-10 border-t border-r',
           'bottom-14 left-6 sm:left-10 border-b border-l',
           'bottom-14 right-6 sm:right-10 border-b border-r'] as const
        ).map((cls, i) => (
          <div
            key={i}
            className={`absolute w-5 h-5 pointer-events-none ${cls}`}
            style={{ borderColor: 'rgba(235,10,30,0.25)' }}
          />
        ))}

        {/* Live badge */}
        <motion.div
          variants={fadeUp(0)} initial="hidden" animate="visible"
          className="inline-flex items-center gap-2 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full hero-pulse-dot" style={{ background: '#EB0A1E' }} />
          <span
            className="text-[10px] font-bold tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255,255,255,0.38)' }}
          >
            PT. Toyota Motor Manufacturing Indonesia · EPSD Sunter 2 · Casting Division
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          variants={fadeUp(1)} initial="hidden" animate="visible"
          style={{
            fontSize: 'clamp(38px, 7.5vw, 82px)',
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.04em',
            lineHeight: 1.15,
            marginBottom: '4px',
          }}
        >
          Casting Tools
        </motion.div>

        <motion.div
          variants={fadeUp(2)} initial="hidden" animate="visible"
          style={{
            fontSize: 'clamp(38px, 7.5vw, 82px)',
            fontWeight: 900,
            color: '#EB0A1E',
            letterSpacing: '-0.04em',
            lineHeight: 1.15,
            marginBottom: '28px',
          }}
        >
          Hub
        </motion.div>

        {/* Red accent line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 72, opacity: 1 }}
          transition={{ duration: 0.55, delay: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ height: '2px', background: '#EB0A1E', marginBottom: '24px' }}
        />

        {/* Subtitle */}
        <motion.p
          variants={fadeUp(3)} initial="hidden" animate="visible"
          className="max-w-[480px] leading-relaxed mb-10"
          style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.4)' }}
        >
          Satu pintu akses ke seluruh aplikasi digital Casting Division — dari input harian hingga pelaporan resmi.
        </motion.p>

        {/* CTA */}
        <motion.button
          variants={fadeUp(4)} initial="hidden" animate="visible"
          onClick={scrollToApps}
          className="inline-flex items-center gap-2.5 group"
        >
          <span
            className="text-[13px] font-semibold hero-cta-text"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Lihat Aplikasi
          </span>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center hero-bounce-down"
            style={{ background: 'rgba(235,10,30,0.12)', border: '1px solid rgba(235,10,30,0.28)' }}
          >
            <ChevronDown size={13} style={{ color: '#EB0A1E' }} />
          </div>
        </motion.button>
      </div>

      {/* Gradient fade to content */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0a0a0a)', zIndex: 5 }}
      />
    </section>
  );
}
