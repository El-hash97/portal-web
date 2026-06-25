'use client';

import { useState } from 'react';
import { ArrowRight, Check, Link2, Pencil, Trash2, Wrench } from 'lucide-react';
import type { App } from '@/lib/types';
import { ICON_MAP } from '@/lib/constants';
import { useAppStore } from '@/context/AppContext';
import { StarRating } from '@/components/StarRating';
import { useRatingsStore } from '@/context/RatingsContext';

interface AppCardProps {
  app: App;
  adminMode?: boolean;
  delay?: number;
  onEdit?: (app: App) => void;
  onDelete?: (app: App) => void;
}

export function AppCard({ app, adminMode = false, delay = 0, onEdit, onDelete }: AppCardProps) {
  const { getCategoryStyle, toggleApp, toggleMaintenance } = useAppStore();
  const { ratings, rate } = useRatingsStore();
  const ratingData = ratings[app.id] ?? { avg: 0, count: 0, mine: 0 };
  const style = getCategoryStyle(app.kategori);
  const Icon  = ICON_MAP[app.icon] ?? ICON_MAP.box;
  const inMaintenance = app.maintenance ?? false;
  const hasLink = !!app.link && app.link !== '#';

  /* ── shareable tracking link ─────────────────────────── */
  const [copied, setCopied] = useState(false);
  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/go/${app.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  /* ── border / hover ──────────────────────────────────── */
  const borderClass = (() => {
    if (adminMode && !app.aktif) return 'opacity-40 border-white/10';
    if (inMaintenance && !adminMode) return 'border-[rgba(245,158,11,0.25)] hover:-translate-y-1 hover:border-[rgba(245,158,11,0.45)]';
    return 'border-white/10 hover:-translate-y-1 hover:border-[rgba(235,10,30,0.5)]';
  })();

  /* ── corner badge ────────────────────────────────────── */
  const badge = (() => {
    if (inMaintenance) return {
      label: 'Maintenance',
      icon:  <Wrench size={9} />,
      style: { color: '#D97706', background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.28)' },
    };
    if (adminMode) return app.aktif
      ? { label: 'Aktif',    icon: null, style: { color: '#1D8A56', background: 'rgba(29,138,86,0.12)',  border: '1px solid rgba(29,138,86,0.22)'  } }
      : { label: 'Nonaktif', icon: null, style: { color: '#B45309', background: 'rgba(180,83,9,0.10)',   border: '1px solid rgba(180,83,9,0.22)'   } };
    return null;
  })();

  return (
    <div
      className={`border rounded-2xl p-6 flex flex-col relative overflow-hidden transition-all duration-200 group ${borderClass}`}
      style={{
        background:     'linear-gradient(135deg, #0f0f0f 0%, #1e0808 100%)',
        boxShadow:      '0 2px 8px rgba(0,0,0,0.4)',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
        style={{ background: inMaintenance ? '#F59E0B' : '#EB0A1E' }}
      />

      {/* Corner status badge */}
      {badge && (
        <span
          className="absolute top-3.5 right-3.5 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded flex items-center gap-1"
          style={badge.style}
        >
          {badge.icon}
          {badge.label}
        </span>
      )}

      {/* Icon / logo */}
      {app.logo ? (
        <img
          src={app.logo}
          alt={app.nama}
          className="w-[56px] h-[56px] rounded-[14px] mb-4 shrink-0 object-cover"
        />
      ) : (
        <div
          className="w-[52px] h-[52px] rounded-[13px] flex items-center justify-center mb-4 shrink-0"
          style={{ background: style.bg, color: style.color }}
        >
          <Icon size={23} />
        </div>
      )}

      <div className="text-[15.5px] font-bold leading-snug mb-2 tracking-tight pr-14" style={{ color: 'rgba(255,255,255,0.92)' }}>
        {app.nama}
      </div>
      <div className="text-[13px] leading-relaxed flex-1 mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {app.deskripsi}
      </div>

      {/* Star rating */}
      <div className="mb-4">
        <StarRating
          avg={ratingData.avg}
          count={ratingData.count}
          mine={ratingData.mine}
          onRate={!adminMode ? (star) => rate(app.id, star) : undefined}
        />
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Open / maintenance / no-link */}
        {inMaintenance && !adminMode ? (
          <span
            className="inline-flex items-center gap-2 text-[12.5px] font-bold tracking-wide px-4 py-2.5 rounded-lg cursor-not-allowed select-none"
            style={{ background: 'rgba(245,158,11,0.10)', color: '#D97706', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            <Wrench size={13} /> Sedang Maintenance
          </span>
        ) : hasLink ? (
          <>
            <a
              href={`/go/${app.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white text-[12.5px] font-bold tracking-wide px-4 py-2.5 rounded-lg transition-all hover:translate-x-0.5"
              style={{ background: '#EB0A1E' }}
            >
              Buka Aplikasi <ArrowRight size={13} />
            </a>

            {/* Salin link (tracking) untuk dibagikan — ikon saja */}
            <button
              onClick={copyShareLink}
              className="inline-flex items-center justify-center p-2.5 rounded-lg border transition-all"
              style={copied
                ? { borderColor: 'rgba(29,138,86,0.4)', color: '#1D8A56', background: 'rgba(29,138,86,0.10)' }
                : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.55)', background: 'transparent' }
              }
              title={copied ? 'Tersalin' : 'Salin link untuk dibagikan'}
            >
              {copied ? <Check size={14} /> : <Link2 size={14} />}
            </button>
          </>
        ) : (
          <span
            className="inline-flex items-center gap-2 text-[12.5px] font-bold tracking-wide px-4 py-2.5 rounded-lg cursor-not-allowed"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}
          >
            Link Belum Diisi
          </span>
        )}

        {/* Admin controls */}
        {adminMode && (
          <div className="flex items-center gap-2 ml-auto">

            {/* Aktif toggle */}
            <button
              onClick={() => toggleApp(app.id)}
              className="w-10 h-[22px] rounded-full relative transition-colors shrink-0"
              style={{ background: app.aktif ? '#1D8A56' : '#CACACA' }}
              title={app.aktif ? 'Nonaktifkan' : 'Aktifkan'}
            >
              <span
                className="absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-all"
                style={{ left: app.aktif ? '18px' : '3px' }}
              />
            </button>

            {/* Maintenance toggle */}
            <button
              onClick={() => toggleMaintenance(app.id)}
              className="p-2 rounded-lg border transition-all"
              style={inMaintenance
                ? { borderColor: 'rgba(245,158,11,0.45)', color: '#F59E0B', background: 'rgba(245,158,11,0.10)' }
                : { borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', background: 'transparent' }
              }
              title={inMaintenance ? 'Matikan Maintenance' : 'Mode Maintenance'}
            >
              <Wrench size={13} />
            </button>

            {/* Edit */}
            <button
              onClick={() => onEdit?.(app)}
              className="p-2 rounded-lg border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
              title="Edit"
            >
              <Pencil size={13} />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete?.(app)}
              className="p-2 rounded-lg border text-[#EB0A1E] hover:border-[rgba(235,10,30,0.4)] transition-colors"
              style={{ borderColor: 'rgba(235,10,30,0.22)' }}
              title="Hapus"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
