'use client';

import { HeroSection } from './HeroSection';
import { QuickStatsBar } from './QuickStatsBar';

export function Portal() {
  return (
    <>
      <HeroSection />
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 pb-10 sm:pb-16">
        <QuickStatsBar />
      </main>
    </>
  );
}
