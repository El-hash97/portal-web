'use client';

import { useAppStore } from '@/context/AppContext';
import { HenkatenKpiBar } from '@/components/HenkatenKpiBar';
import { HenkatenLineChart } from '@/components/HenkatenLineChart';

export default function DashboardPage() {
  const { apps } = useAppStore();
  const otherApps = apps.filter(a => a.aktif && a.nama !== 'e-Henkaten');

  return (
    <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-[22px] sm:text-[26px] font-bold" style={{ color: '#d9e2ff' }}>
          Dashboard
        </h1>
        <p className="text-[12.5px] mt-1" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Ringkasan aktivitas dari setiap aplikasi.
        </p>
      </div>

      {/* e-Henkaten summary */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/e-henkaten.png" alt="e-Henkaten" className="w-8 h-8 rounded-lg object-cover" />
          <h2 className="font-mono-label text-[13px] font-bold uppercase tracking-wide" style={{ color: 'rgba(217,226,255,0.9)' }}>
            e-Henkaten
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          <HenkatenKpiBar />
          <HenkatenLineChart />
        </div>
      </section>

      {/* Other apps — summary coming soon */}
      {otherApps.length > 0 && (
        <section>
          <p className="font-mono-label text-[10px] uppercase tracking-widest mb-4" style={{ color: 'rgba(217,226,255,0.3)' }}>
            Aplikasi Lainnya
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherApps.map(app => (
              <div
                key={app.id}
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'rgba(10,21,46,0.6)', border: '1px solid #2f3952' }}
              >
                {app.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={app.logo} alt={app.nama} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: 'rgba(217,226,255,0.8)' }}>{app.nama}</p>
                  <p className="text-[10.5px]" style={{ color: 'rgba(217,226,255,0.35)' }}>Ringkasan segera hadir</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
