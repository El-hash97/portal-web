'use client';

import { PageHero } from '@/components/PageHero';
import { PortalStats } from '@/components/PortalStats';
import { FeedbackForm } from '@/components/FeedbackForm';

export default function ReportsPage() {
  return (
    <>
      <PageHero
        titleAccent="Reports"
        description="Aktivitas portal, tren pembukaan aplikasi, dan saran & komentar pengguna."
      />
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 pb-8 sm:pb-10">
        <PortalStats />
        <FeedbackForm />
      </main>
    </>
  );
}
