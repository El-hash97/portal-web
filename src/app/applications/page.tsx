'use client';

import { Box } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import { AppCard } from '@/components/AppCard';

export default function ApplicationsPage() {
  const { apps } = useAppStore();
  const activeApps = apps.filter(a => a.aktif);

  return (
    <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-[22px] sm:text-[26px] font-bold" style={{ color: '#d9e2ff' }}>
          Applications
        </h1>
        <p className="text-[12.5px] mt-1" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Seluruh aplikasi digital Casting Division beserta deskripsi lengkapnya.
        </p>
      </div>

      {activeApps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Box size={40} className="mb-4" style={{ color: 'rgba(217,226,255,0.2)' }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: 'rgba(217,226,255,0.8)' }}>Belum Ada Aplikasi</h3>
          <p className="text-[13px]" style={{ color: 'rgba(217,226,255,0.35)' }}>Admin belum mengaktifkan aplikasi apapun.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
          {activeApps.map((app, i) => (
            <AppCard key={app.id} app={app} delay={i * 60} />
          ))}
        </div>
      )}
    </main>
  );
}
