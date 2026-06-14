'use client';

import { Box } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { useAppStore } from '@/context/AppContext';
import { CategorySection } from './CategorySection';
import { HeroSection } from './HeroSection';

export function Portal() {
  const { apps } = useAppStore();
  const activeApps = apps.filter(a => a.aktif);
  const knownKeys = CATEGORIES.map(c => c.key);
  const otherApps = activeApps.filter(a => !knownKeys.includes(a.kategori));

  return (
    <>
      <HeroSection />
      <main id="apps-content" className="max-w-[1240px] mx-auto px-4 sm:px-6 py-10">
        {activeApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-4">
            <Box size={48} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Belum Ada Aplikasi</h3>
            <p className="text-[14px] text-[#58595B]">Admin belum mengaktifkan aplikasi apapun.</p>
          </div>
        ) : (
          <>
            {CATEGORIES.map((cat, ci) => {
              const list = activeApps.filter(a => a.kategori === cat.key);
              return (
                <CategorySection
                  key={cat.key}
                  category={cat}
                  apps={list}
                  delayBase={ci * 100}
                />
              );
            })}
            {otherApps.length > 0 && (
              <CategorySection
                category={{ key: 'Lainnya', color: '#58595B', bg: 'rgba(88,89,91,0.10)' }}
                apps={otherApps}
              />
            )}
          </>
        )}
      </main>
    </>
  );
}
