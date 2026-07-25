'use client';

import { useAppStore } from '@/context/AppContext';
import { PortalAppCard } from '@/components/PortalAppCard';
import { Box } from 'lucide-react';

export function HeroSection() {
  const { apps } = useAppStore();
  const activeApps = apps.filter(a => a.aktif);

  return (
    <section className="relative px-6 sm:px-10 lg:px-12 pt-8 sm:pt-10 pb-4">
      {/* Ambient glow */}
      <div className="absolute inset-0 v2-radial-glow pointer-events-none" />

      {/* Top strip: EPSD tag + Toyota production ribbon */}
      <div className="relative flex justify-between items-start mb-10 gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono-label text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(217,226,255,0.4)' }}>
            EPSD Sunter 2
          </span>
          <span
            className="font-mono-label text-[10px] tracking-[0.15em] uppercase inline-block w-fit text-white"
            style={{
              background: '#EB0A1E',
              clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0% 100%)',
              padding: '6px 24px 6px 10px',
            }}
          >
            Casting Division
          </span>
        </div>

        <div
          className="text-white font-bold text-[13px] tracking-wider flex items-center"
          style={{
            background: '#EB0A1E',
            clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)',
            padding: '12px 28px 12px 36px',
          }}
        >
          TOYOTA<br />
          <span className="text-[10px] font-normal block">Production System</span>
        </div>
      </div>

      {/* Hero headline */}
      <div className="relative max-w-3xl mx-auto text-center mb-14">
        <h1
          className="font-display uppercase tracking-wide mb-3"
          style={{
            fontSize: 'clamp(38px, 6vw, 64px)',
            fontWeight: 700,
            color: '#d9e2ff',
            lineHeight: 1.05,
            textShadow: '0 0 24px rgba(255,180,170,0.35)',
          }}
        >
          Casting <span style={{ color: '#EB0A1E' }}>Tools</span>
        </h1>
        <p className="font-display italic text-[18px] sm:text-[22px] font-light mb-3" style={{ color: '#b9c7e4' }}>
          One Door. All Tools. Better Tomorrow.
        </p>
        <p className="text-[13px] max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(217,226,255,0.5)' }}>
          Integrated Digital Platform for Casting Division<br className="hidden sm:block" />
          Driving Efficiency, Quality and Continuous Improvement.
        </p>
      </div>

      {/* App grid */}
      <div id="apps-grid" className="relative max-w-5xl mx-auto scroll-mt-20">
        {activeApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Box size={40} className="mb-4" style={{ color: 'rgba(217,226,255,0.2)' }} />
            <h3 className="text-lg font-bold mb-2" style={{ color: 'rgba(217,226,255,0.8)' }}>Belum Ada Aplikasi</h3>
            <p className="text-[13px]" style={{ color: 'rgba(217,226,255,0.35)' }}>Admin belum mengaktifkan aplikasi apapun.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeApps.map((app, i) => (
              <PortalAppCard key={app.id} app={app} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
