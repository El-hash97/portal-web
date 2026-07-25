'use client';

import { HeroSection } from './HeroSection';
import { QuickStatsBar } from './QuickStatsBar';
import { PortalStats } from './PortalStats';
import { FeedbackForm } from './FeedbackForm';

export function Portal() {
  return (
    <>
      <HeroSection />
      <main className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 pb-16">
        <QuickStatsBar />
        <div className="mt-12">
          <PortalStats />
          <FeedbackForm />
        </div>
      </main>
    </>
  );
}
