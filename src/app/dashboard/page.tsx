'use client';

import { HenkatenKpiBar } from '@/components/HenkatenKpiBar';
import { HenkatenLineChart } from '@/components/HenkatenLineChart';

export default function DashboardPage() {
  return (
    <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-[22px] sm:text-[26px] font-bold" style={{ color: '#d9e2ff' }}>
          Dashboard
        </h1>
        <p className="text-[12.5px] mt-1" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Ringkasan data live dari aplikasi e-Henkaten.
        </p>
      </div>

      <HenkatenKpiBar />
      <HenkatenLineChart />
    </main>
  );
}
