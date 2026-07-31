'use client';

import { useCallback, useEffect, useState } from 'react';
import { ListFilter } from 'lucide-react';
import { RequestCard } from '@/components/RequestCard';
import type { FeatureRequest, RequestStatus } from '@/lib/types';

const FILTERS: { key: RequestStatus | 'semua'; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'menunggu', label: 'Menunggu' },
  { key: 'disetujui', label: 'Disetujui' },
  { key: 'dikerjakan', label: 'Dikerjakan' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'ditolak', label: 'Ditolak' },
];

export function OpenRequestList({ refreshKey }: { refreshKey: number }) {
  const [requests, setRequests] = useState<FeatureRequest[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<RequestStatus | 'semua'>('semua');

  const load = useCallback(() => {
    fetch('/api/open-request')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((d: FeatureRequest[]) => setRequests(d))
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  const visible = requests
    ? filter === 'semua' ? requests : requests.filter(r => r.status === filter)
    : null;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-10 mb-10">
      <div className="flex items-center gap-2 mb-4">
        <ListFilter size={15} style={{ color: 'rgba(217,226,255,0.5)' }} />
        <span
          className="text-[11px] font-bold uppercase tracking-widest"
          style={{ color: 'rgba(217,226,255,0.5)' }}
        >
          Daftar Request
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(f => {
          const count = !requests
            ? 0
            : f.key === 'semua'
              ? requests.length
              : requests.filter(r => r.status === f.key).length;
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-colors"
              style={active
                ? { background: '#EB0A1E', color: '#fff' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(217,226,255,0.6)' }
              }
            >
              {f.label} ({count})
            </button>
          );
        })}
      </div>

      {failed ? (
        <p className="text-[13px] text-center py-10" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Daftar request tidak tersedia.
        </p>
      ) : !requests ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-hidden="true">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
          ))}
        </div>
      ) : visible && visible.length === 0 ? (
        <p className="text-[13px] text-center py-10" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Belum ada request.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visible!.map(r => (
            <RequestCard key={r.id} request={r} onChanged={load} />
          ))}
        </div>
      )}
    </section>
  );
}
