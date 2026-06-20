'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, Clock, Eye, CheckCircle, RotateCcw, ChevronDown } from 'lucide-react';

interface FeedbackRow {
  id: number;
  app_id: number | null;
  app_nama: string | null;
  pesan: string;
  status: 'baru' | 'dibaca' | 'selesai';
  created_at: string;
}

type Filter = 'semua' | 'baru' | 'dibaca' | 'selesai';

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string; label: string }> = {
  baru:    { color: '#EB0A1E', bg: 'rgba(235,10,30,0.10)',  border: 'rgba(235,10,30,0.25)',  label: 'Baru'    },
  dibaca:  { color: '#3B82F6', bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.25)', label: 'Dibaca'  },
  selesai: { color: '#1D8A56', bg: 'rgba(29,138,86,0.10)',  border: 'rgba(29,138,86,0.22)',  label: 'Selesai' },
};

export function FeedbackInbox() {
  const [items, setItems]   = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('semua');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/feedback')
      .then(r => r.ok ? r.json() : [])
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function patchStatus(id: number, status: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: status as FeedbackRow['status'] } : i));
    fetch(`/api/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  const filtered = filter === 'semua' ? items : items.filter(i => i.status === filter);
  const counts: Record<Filter, number> = {
    semua:   items.length,
    baru:    items.filter(i => i.status === 'baru').length,
    dibaca:  items.filter(i => i.status === 'dibaca').length,
    selesai: items.filter(i => i.status === 'selesai').length,
  };

  return (
    <div className="mt-10">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={15} style={{ color: '#EB0A1E' }} />
        <h3 className="text-[15px] font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Saran &amp; Komentar
        </h3>
        {counts.baru > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#EB0A1E', color: '#fff' }}>
            {counts.baru} baru
          </span>
        )}
        {loading && (
          <span className="text-[10px] px-2 py-0.5 rounded" style={{ color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.04)' }}>
            memuat…
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4">
        {(['semua', 'baru', 'dibaca', 'selesai'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(235,10,30,0.15)' : 'rgba(255,255,255,0.04)',
              color:      filter === f ? '#EB0A1E' : 'rgba(255,255,255,0.4)',
              border:     `1px solid ${filter === f ? 'rgba(235,10,30,0.3)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            {f} {counts[f] > 0 && `(${counts[f]})`}
          </button>
        ))}
      </div>

      {/* List */}
      {!loading && filtered.length === 0 ? (
        <div className="rounded-xl px-5 py-8 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <MessageSquare size={20} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.13)' }} />
          <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {filter === 'semua' ? 'Belum ada masukan.' : `Tidak ada masukan dengan status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(item => {
            const s = STATUS_STYLE[item.status];
            const isOpen = expanded === item.id;
            return (
              <div
                key={item.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* Row header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  className="w-full flex items-start gap-3 px-5 py-3.5 text-left"
                >
                  {/* Status dot */}
                  <span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {item.app_nama && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{ background: 'rgba(235,10,30,0.10)', color: '#EB0A1E', border: '1px solid rgba(235,10,30,0.2)' }}>
                          {item.app_nama}
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {s.label}
                      </span>
                      <span className="text-[10.5px] ml-auto flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        <Clock size={10} /> {fmtTime(item.created_at)}
                      </span>
                    </div>
                    <p className={`text-[13px] ${isOpen ? '' : 'truncate'}`} style={{ color: 'rgba(255,255,255,0.75)' }}>
                      {item.pesan}
                    </p>
                  </div>

                  <ChevronDown size={14} className={`shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'rgba(255,255,255,0.25)' }} />
                </button>

                {/* Expanded: action buttons */}
                {isOpen && (
                  <div className="px-5 pb-3.5 flex items-center gap-2 flex-wrap"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-[10.5px] mr-auto" style={{ color: 'rgba(255,255,255,0.25)' }}>
                      Ubah status:
                    </span>
                    {item.status !== 'dibaca' && (
                      <button onClick={() => patchStatus(item.id, 'dibaca')}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)' }}>
                        <Eye size={11} /> Dibaca
                      </button>
                    )}
                    {item.status !== 'selesai' && (
                      <button onClick={() => patchStatus(item.id, 'selesai')}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(29,138,86,0.12)', color: '#1D8A56', border: '1px solid rgba(29,138,86,0.22)' }}>
                        <CheckCircle size={11} /> Selesai
                      </button>
                    )}
                    {item.status !== 'baru' && (
                      <button onClick={() => patchStatus(item.id, 'baru')}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <RotateCcw size={11} /> Baru lagi
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
