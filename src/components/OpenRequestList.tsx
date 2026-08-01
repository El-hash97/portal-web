'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RequestCard } from '@/components/RequestCard';
import type { FeatureRequest, RequestStatus } from '@/lib/types';
import { Flip } from '@/lib/gsapPlugins';

const FILTERS: { key: RequestStatus | 'semua'; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'menunggu', label: 'Menunggu' },
  { key: 'disetujui', label: 'Disetujui' },
  { key: 'dikerjakan', label: 'Dikerjakan' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'ditolak', label: 'Ditolak' },
];

/**
 * Slides a card in from the left (even index) or right (odd index) as it
 * scrolls into view, revealed sequentially since each instance observes its
 * own position independently. Only `transform` ever animates here — never
 * opacity — so a card that never gets to observe/reveal (e.g. an unusual
 * IntersectionObserver failure) is still fully readable, just offset
 * sideways, never invisible. This wraps RequestCard rather than touching it,
 * so the Flip reflow logic below (which targets `.or-request-card` directly)
 * is unaffected by this separate transform.
 */
function CardEntrance({ index, children }: { index: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fromX = index % 2 === 0 ? -48 : 48;
  return (
    <div
      ref={ref}
      style={{
        transform: entered ? 'translateX(0)' : `translateX(${fromX}px)`,
        transition: 'transform 0.6s cubic-bezier(0.22,0.61,0.36,1)',
      }}
    >
      {children}
    </div>
  );
}

export function OpenRequestList({ refreshKey }: { refreshKey: number }) {
  const [requests, setRequests] = useState<FeatureRequest[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<RequestStatus | 'semua'>('semua');
  const gridRef = useRef<HTMLDivElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);

  const load = useCallback(() => {
    fetch('/api/open-request')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((d: FeatureRequest[]) => { setRequests(d); setFailed(false); })
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => { load(); }, [load, refreshKey]);

  // Capture the current card layout before switching filters, so the
  // remaining cards can smoothly slide into their new grid position instead
  // of just popping into place once React removes/adds siblings.
  function selectFilter(key: RequestStatus | 'semua') {
    if (gridRef.current) {
      flipStateRef.current = Flip.getState(gridRef.current.querySelectorAll('.or-request-card'));
    }
    setFilter(key);
  }

  // Cards are always rendered fully visible by default — no entrance
  // animation gates their visibility. This Flip reflow is purely additive:
  // when the filtered set changes, remaining cards smoothly resettle into
  // their new grid position instead of jumping. Cards entering/leaving the
  // filtered view just appear/disappear immediately (React's own default),
  // which is a safe fallback if the reflow tween itself doesn't run for any
  // reason — there is no state here where a card can end up invisible.
  useLayoutEffect(() => {
    const state = flipStateRef.current;
    if (!state) return;
    flipStateRef.current = null;
    Flip.from(state, {
      duration: 0.5,
      ease: 'power2.inOut',
      absolute: true,
      stagger: 0.03,
    });
  }, [filter, requests]);

  const visible = requests
    ? filter === 'semua' ? requests : requests.filter(r => r.status === filter)
    : null;

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-12 mb-10">
      <h2 className="font-display text-[18px] font-bold mb-4" style={{ color: '#eef2ff' }}>
        Daftar Request
      </h2>

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
              onClick={() => selectFilter(f.key)}
              aria-pressed={active}
              className="font-data px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2"
              style={active
                ? { background: '#EB0A1E', color: '#fff', outlineColor: '#EB0A1E' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(217,226,255,0.6)', outlineColor: 'rgba(217,226,255,0.4)' }
              }
            >
              {f.label} <span style={{ opacity: 0.7 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {failed ? (
        <p className="font-data text-[13px] text-center py-10" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Daftar request tidak tersedia.
        </p>
      ) : !requests ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-hidden="true">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
          ))}
        </div>
      ) : visible && visible.length === 0 ? (
        <p className="font-data text-[13px] text-center py-10" style={{ color: 'rgba(217,226,255,0.4)' }}>
          {filter === 'semua' ? 'Belum ada request.' : `Belum ada request dengan status "${FILTERS.find(f => f.key === filter)?.label}".`}
        </p>
      ) : (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visible!.map((r, i) => (
            <CardEntrance key={r.id} index={i}>
              <RequestCard request={r} onChanged={load} />
            </CardEntrance>
          ))}
        </div>
      )}
    </section>
  );
}
