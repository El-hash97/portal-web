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
        bg-white border rounded-2xl p-6 flex flex-col relative overflow-hidden
        transition-all duration-200 group
        ${adminMode && !app.aktif
          ? 'opacity-50 border-gray-200'
          : 'border-gray-200 hover:-translate-y-1 hover:shadow-xl hover:border-[rgba(235,10,30,0.2)]'
        }
      `}
      style={{
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
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

      {/* icon */}
      <div
        className="w-[52px] h-[52px] rounded-[13px] flex items-center justify-center mb-4 shrink-0"
        style={{ background: style.bg, color: style.color }}
      >
        <Icon size={23} />
      </div>

      <div className="text-[15.5px] font-bold text-[#1A1A1A] leading-snug mb-2 tracking-tight pr-14">
        {app.nama}
      </div>
      <div className="text-[13px] leading-relaxed flex-1 mb-5" style={{ color: '#58595B' }}>
        {app.deskripsi}
      </div>

      {/* action row */}
      <div className="flex items-center gap-2 flex-wrap">
        {app.link && app.link !== '#' ? (
          <a
            href={app.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white text-[12.5px] font-bold tracking-wide px-4 py-2.5 rounded-lg transition-all hover:translate-x-0.5"
            style={{ background: '#EB0A1E' }}
          >
            Buka Aplikasi <ArrowRight size={13} />
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 text-[12.5px] font-bold tracking-wide px-4 py-2.5 rounded-lg cursor-not-allowed" style={{ background: '#D0D0D0', color: '#888' }}>
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
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
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
