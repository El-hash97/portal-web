'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getDeviceId } from '@/lib/device';

export interface RatingEntry {
  avg: number;
  count: number;
  mine: number; // 0 = not yet rated by this device
}

interface RatingsStore {
  ratings: Record<number, RatingEntry>;
  rate: (appId: number, star: number) => Promise<void>;
}

const RatingsContext = createContext<RatingsStore | null>(null);

interface Row { app_id: number; avg_rating: number; count: number; my_rating: number | null; }

function toMap(rows: Row[]): Record<number, RatingEntry> {
  const m: Record<number, RatingEntry> = {};
  rows.forEach(r => { m[r.app_id] = { avg: r.avg_rating ?? 0, count: r.count ?? 0, mine: r.my_rating ?? 0 }; });
  return m;
}

export function RatingsProvider({ children }: { children: React.ReactNode }) {
  const [ratings, setRatings] = useState<Record<number, RatingEntry>>({});

  const refresh = useCallback(async () => {
    const id = getDeviceId();
    if (!id) return;
    const rows: Row[] = await fetch(`/api/ratings?device_id=${encodeURIComponent(id)}`)
      .then(r => r.ok ? r.json() : []).catch(() => []);
    setRatings(toMap(rows));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const rate = useCallback(async (appId: number, star: number) => {
    const id = getDeviceId();
    // Optimistic update
    setRatings(prev => {
      const cur = prev[appId] ?? { avg: 0, count: 0, mine: 0 };
      if (star === 0) {
        if (cur.mine === 0) return prev;
        const newCount = cur.count - 1;
        const newAvg = newCount > 0
          ? parseFloat(((cur.avg * cur.count - cur.mine) / newCount).toFixed(1))
          : 0;
        return { ...prev, [appId]: { avg: newAvg, count: newCount, mine: 0 } };
      }
      const wasRated = cur.mine > 0;
      const newCount = wasRated ? cur.count : cur.count + 1;
      const newAvg = wasRated
        ? parseFloat(((cur.avg * cur.count - cur.mine + star) / cur.count).toFixed(1))
        : parseFloat(((cur.avg * cur.count + star) / newCount).toFixed(1));
      return { ...prev, [appId]: { avg: newAvg, count: newCount, mine: star } };
    });
    await fetch(`/api/apps/${appId}/rate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: id, rating: star }),
    }).catch(() => {});
    await refresh();
  }, [refresh]);

  return <RatingsContext.Provider value={{ ratings, rate }}>{children}</RatingsContext.Provider>;
}

export function useRatingsStore(): RatingsStore {
  const ctx = useContext(RatingsContext);
  if (!ctx) throw new Error('useRatingsStore must be inside RatingsProvider');
  return ctx;
}
