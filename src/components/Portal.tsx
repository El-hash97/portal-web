'use client';

import { HeroSection } from './HeroSection';
import { QuickStatsBar } from './QuickStatsBar';
import { HenkatenKpiBar } from './HenkatenKpiBar';

export function Portal() {
  return (
    <div className="flex-1 flex flex-col">
      <HeroSection />
      <div className="flex-1 flex flex-col justify-end max-w-5xl w-full mx-auto px-4 sm:px-10 lg:px-12 pb-4 sm:pb-6 pt-6">
        <QuickStatsBar />
        <HenkatenKpiBar />
      </div>
    </div>
  );
}
