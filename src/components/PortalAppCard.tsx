'use client';

import {
  Wrench, FileEdit, ClipboardList, TrendingUp, Mic, AlertTriangle, FileCheck2,
} from 'lucide-react';
import type { App } from '@/lib/types';
import { ICON_MAP } from '@/lib/constants';

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
    <div className="snake-border-content p-6 h-full flex flex-col items-center justify-center text-center transition-transform duration-300 group-hover:scale-[1.03]">
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

      <Icon size={32} className="mb-3" style={{ color: 'rgba(217,226,255,0.9)' }} />

      <h3 className="font-mono-label text-[12.5px] font-bold uppercase tracking-wide mb-1" style={{ color: 'rgba(217,226,255,0.95)' }}>
        {app.nama}
      </h3>
      <p className="text-[11px] leading-tight" style={{ color: 'rgba(217,226,255,0.42)' }}>
        {blurb}
      </p>
    </div>
  );

  const cardClass = `relative group snake-border-card h-44 sm:h-48 ${inMaintenance ? 'snake-border-amber' : ''}`;

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
