'use client';

import { HeroSection } from './HeroSection';
import { HenkatenKpiBar } from './HenkatenKpiBar';

export function Portal() {
  return (
    <div className="flex-1 flex flex-col">
      <HeroSection />
      <div className="flex-1 flex flex-col justify-end max-w-5xl w-full mx-auto px-4 sm:px-10 lg:px-12 pb-4 sm:pb-6 pt-6">
        <div className="flex items-stretch gap-4">
          <div className="flex-1 min-w-0">
            <HenkatenKpiBar />
          </div>

          {/* Slogan ribbon — aligned with the live KPI bar */}
          <div className="shrink-0 hidden md:flex items-stretch">
            <div
              className="flex flex-col justify-center px-6 py-3"
              style={{
                background: '#EB0A1E',
                clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)',
              }}
            >
              <p className="text-white font-bold uppercase italic text-[11px] leading-tight tracking-wider text-right whitespace-nowrap">
                Stronger Tools<br />Smarter Process<br />Better Results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
