'use client';

import { Box } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import { AppShowcaseRow } from '@/components/AppShowcaseRow';
import { AppIconOrbit } from '@/components/AppIconOrbit';

export default function ApplicationsPage() {
  const { apps } = useAppStore();
  const activeApps = apps.filter(a => a.aktif);

  return (
    <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <h1 className="font-display text-[22px] sm:text-[26px] font-bold" style={{ color: '#d9e2ff' }}>
            Applications
          </h1>
          <p className="text-[12.5px] mt-1" style={{ color: 'rgba(217,226,255,0.4)' }}>
            Seluruh aplikasi digital Casting Division beserta deskripsi lengkapnya.
          </p>
        </div>
        <AppIconOrbit apps={activeApps} />
      </div>

      {activeApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Box size={40} className="mb-4" style={{ color: 'rgba(217,226,255,0.2)' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: 'rgba(217,226,255,0.8)' }}>Belum Ada Aplikasi</h3>
          <p className="text-[13px]" style={{ color: 'rgba(217,226,255,0.35)' }}>Admin belum mengaktifkan aplikasi apapun.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-14 sm:gap-20">
          {activeApps.map((app, i) => (
            <div
              key={app.id}
              className={i > 0 ? 'pt-14 sm:pt-20' : ''}
              style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.06)' } : undefined}
            >
              <AppShowcaseRow app={app} reversed={i % 2 === 1} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
