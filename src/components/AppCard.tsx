'use client';

import { ArrowRight, Pencil, Trash2 } from 'lucide-react';
import type { App } from '@/lib/types';
import { ICON_MAP } from '@/lib/constants';
import { useAppStore } from '@/context/AppContext';

interface AppCardProps {
  app: App;
  adminMode?: boolean;
  delay?: number;
  onEdit?: (app: App) => void;
  onDelete?: (app: App) => void;
}

export function AppCard({ app, adminMode = false, delay = 0, onEdit, onDelete }: AppCardProps) {
  const { getCategoryStyle, toggleApp } = useAppStore();
  const style = getCategoryStyle(app.kategori);
  const Icon = ICON_MAP[app.icon] ?? ICON_MAP.box;

  return (
    <div
      className={`
        border rounded-2xl p-6 flex flex-col relative overflow-hidden
        transition-all duration-200 group
        ${adminMode && !app.aktif
          ? 'opacity-40 border-white/10'
          : 'border-white/10 hover:-translate-y-1 hover:border-[rgba(235,10,30,0.5)]'
        }
      `}
      style={{
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1e0808 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* red top-bar reveal on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
        style={{ background: '#EB0A1E' }}
      />

      {/* admin: status badge */}
      {adminMode && (
        <span
          className="absolute top-3.5 right-3.5 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded"
          style={app.aktif
            ? { color: '#1D8A56', background: 'rgba(29,138,86,0.12)', border: '1px solid rgba(29,138,86,0.22)' }
            : { color: '#B45309', background: 'rgba(180,83,9,0.10)', border: '1px solid rgba(180,83,9,0.22)' }
          }
        >
          {app.aktif ? 'Aktif' : 'Nonaktif'}
        </span>
      )}

      {/* icon / logo */}
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
      <div className="text-[13px] leading-relaxed flex-1 mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {app.deskripsi}
      </div>

      {/* action row */}
      <div className="flex items-center gap-2 flex-wrap">
        {app.link && app.link !== '#' ? (
          <a
            href={app.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              try { navigator.sendBeacon(`/api/apps/${app.id}/click`); }
              catch { fetch(`/api/apps/${app.id}/click`, { method: 'POST' }).catch(() => {}); }
            }}
            className="inline-flex items-center gap-2 text-white text-[12.5px] font-bold tracking-wide px-4 py-2.5 rounded-lg transition-all hover:translate-x-0.5"
            style={{ background: '#EB0A1E' }}
          >
            Buka Aplikasi <ArrowRight size={13} />
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 text-[12.5px] font-bold tracking-wide px-4 py-2.5 rounded-lg cursor-not-allowed" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.3)' }}>
            Link Belum Diisi
          </span>
        )}

        {adminMode && (
          <div className="flex items-center gap-2 ml-auto">
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
            <button
              onClick={() => onEdit?.(app)}
              className="p-2 rounded-lg border transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}
              title="Edit"
            >
              <Pencil size={13} />
            </button>
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
