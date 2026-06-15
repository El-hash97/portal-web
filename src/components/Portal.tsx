'use client';

import { Box } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import { AppCard } from './AppCard';
import { HeroSection } from './HeroSection';
import { GradientBars } from '@/components/ui/gradient-bars-background';

export function Portal() {
  const { apps } = useAppStore();
  const activeApps = apps.filter(a => a.aktif);

  return (
    <>
      <HeroSection />
      <div className="relative" style={{ background: '#0a0a0a' }}>
        <GradientBars
          numBars={15}
          gradientFrom="rgba(235, 10, 30, 0.18)"
          gradientTo="transparent"
          animationDuration={3}
        />
        <main id="apps-content" className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 py-10">
          {activeApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <Box size={48} className="mb-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>Belum Ada Aplikasi</h3>
              <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin belum mengaktifkan aplikasi apapun.</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeApps.map((app, i) => (
                <AppCard key={app.id} app={app} delay={i * 60} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
