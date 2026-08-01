'use client';

import {
  Wrench, FileEdit, ClipboardList, TrendingUp, Mic, AlertTriangle, FileCheck2, ArrowUpRight,
} from 'lucide-react';
import type { App } from '@/lib/types';
import { ICON_MAP } from '@/lib/constants';
import { GradientBars } from '@/components/ui/gradient-bars-background';

interface PortalAppCardProps {
  app: App;
  index: number;
}

/* Icon + short blurb matched to the reference design, keyed by app name.
   Falls back to the app's own icon/kategori for anything added later. */
const CARD_META: Record<string, { icon: typeof FileEdit; blurb: string }> = {
  'e-Henkaten':          { icon: FileEdit,      blurb: 'Change Point Management' },
  'Form BNF':            { icon: ClipboardList, blurb: 'Problem Report (PDF)' },
  'Kaizen Order Sheet':  { icon: TrendingUp,     blurb: 'Kaizen Activity Management' },
  'Voice Member':        { icon: Mic,            blurb: 'Aspirasi & Keluhan' },
  'Problem Produksi':    { icon: AlertTriangle,  blurb: 'Real-time Monitoring & Tracking' },
  'Rekap Laporan 5W':    { icon: FileCheck2,     blurb: '5W Analysis & Report' },
};

export function PortalAppCard({ app, index }: PortalAppCardProps) {
  const meta = CARD_META[app.nama];
  const Icon = meta?.icon ?? ICON_MAP[app.icon] ?? ICON_MAP.box;
  const blurb = meta?.blurb ?? app.kategori;
  const inMaintenance = app.maintenance ?? false;
  const hasLink = !!app.link && app.link !== '#';
  const number = String(index + 1).padStart(2, '0');

  const body = (
    <div className="snake-border-content relative overflow-hidden p-6 h-full flex flex-col items-center justify-center text-center transition-transform duration-300 group-hover:scale-[1.02]">
      <GradientBars
        numBars={7}
        gradientFrom="rgb(12, 1, 60)"
        gradientTo="transparent"
        animationDuration={2 + index * 0.15}
        className="opacity-45 transition-opacity duration-300 group-hover:opacity-70"
      />
      <span
        className="absolute top-3.5 left-4 text-white rounded-full w-6 h-6 flex items-center justify-center font-display text-[10px] font-bold z-10"
        style={{ background: inMaintenance ? '#F59E0B' : '#EB0A1E' }}
      >
        {number}
      </span>

      {inMaintenance && (
        <span
          className="absolute top-3.5 right-4 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded z-10"
          style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <Wrench size={9} /> Maintenance
        </span>
      )}

      <div className="relative z-10 flex flex-col items-center">
        <Icon size={34} className="mb-3.5" style={{ color: 'rgba(217,226,255,0.9)' }} />

        <h3 className="font-mono-label text-[13px] font-bold uppercase tracking-wide mb-1.5" style={{ color: 'rgba(217,226,255,0.95)' }}>
          {app.nama}
        </h3>
        <p className="text-[11.5px] leading-snug mb-4" style={{ color: 'rgba(217,226,255,0.42)' }}>
          {blurb}
        </p>

        <div
          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide transition-all duration-200 group-hover:gap-2"
          style={{ color: inMaintenance ? '#F59E0B' : hasLink ? 'rgba(217,226,255,0.5)' : 'rgba(217,226,255,0.25)' }}
        >
          {inMaintenance ? 'Maintenance' : hasLink ? 'Open' : 'Link Belum Diisi'}
          {!inMaintenance && hasLink && (
            <ArrowUpRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}
        </div>
      </div>
    </div>
  );

  const cardClass = `relative group snake-border-card h-48 sm:h-52 ${inMaintenance ? 'snake-border-amber' : ''}`;

  if (inMaintenance) {
    return (
      <div className={cardClass} title="Sedang dalam maintenance">
        {body}
      </div>
    );
  }

  if (!hasLink) {
    return (
      <div className={cardClass} title="Link belum diisi">
        {body}
      </div>
    );
  }

  return (
    <a
      href={`/go/${app.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClass}
    >
      {body}
    </a>
  );
}
