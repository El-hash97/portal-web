'use client';

import { PortalStats } from '@/components/PortalStats';
import { FeedbackForm } from '@/components/FeedbackForm';

export default function ReportsPage() {
  return (
    <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-[22px] sm:text-[26px] font-bold" style={{ color: '#d9e2ff' }}>
          Reports
        </h1>
        <p className="text-[12.5px] mt-1" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Aktivitas portal, tren pembukaan aplikasi, dan saran &amp; komentar pengguna.
        </p>
      </div>
      <PortalStats />
      <FeedbackForm />
    </main>
  );
}
