'use client';

import { useEffect, useState } from 'react';
import { MousePointerClick, CalendarClock, TrendingUp, LayoutGrid } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';

interface AnalyticRow {
  app_id: number;
  clicks_total: number;
  clicks_today: number;
  clicks_week: number;
}

export function QuickStatsBar() {
  const { apps } = useAppStore();
  const [analytics, setAnalytics] = useState<AnalyticRow[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.ok ? r.json() : [])
      .then((d: AnalyticRow[]) => setAnalytics(d))
      .catch(() => setAnalytics([]))
      .finally(() => setLoading(false));
  }, []);

  const totalAll   = analytics.reduce((s, r) => s + r.clicks_total, 0);
  const totalToday = analytics.reduce((s, r) => s + r.clicks_today, 0);
  const totalWeek  = analytics.reduce((s, r) => s + r.clicks_week,  0);
  const activeApps = apps.filter(a => a.aktif).length;

  const items = [
    {
      icon: <MousePointerClick size={26} />, accent: 'rgba(217,226,255,0.7)',
      value: loading ? '—' : totalAll.toLocaleString('id-ID'),
      label: 'Total Dibuka', sub: 'Semua Waktu',
    },
    {
      icon: <CalendarClock size={26} />, accent: '#00dbe9',
      value: loading ? '—' : totalToday.toLocaleString('id-ID'),
      label: 'Hari Ini', sub: 'Dibuka',
    },
    {
      icon: <TrendingUp size={26} />, accent: '#10B981',
      value: loading ? '—' : totalWeek.toLocaleString('id-ID'),
      label: '7 Hari', sub: 'Terakhir',
    },
    {
      icon: <LayoutGrid size={26} />, accent: '#EB0A1E',
      value: String(activeApps),
      label: 'Aplikasi', sub: 'Aktif',
    },
  ];

  return (
    <div
      className="rounded-xl p-4 flex flex-wrap items-stretch justify-between gap-6"
      style={{
        background: 'rgba(10,21,46,0.85)',
        border: '1px solid #2f3952',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center gap-2 pl-2">
        <span className="font-mono-label text-[10px] uppercase tracking-widest" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Quick Stats
        </span>
      </div>

      <div className="flex items-center gap-6 sm:gap-8 flex-1 justify-center flex-wrap">
        {items.map((it, i) => (
          <div key={it.label} className="flex items-center gap-3">
            {i > 0 && <div className="hidden sm:block w-px h-10" style={{ background: '#2f3952' }} />}
            <span style={{ color: it.accent }}>{it.icon}</span>
            <div>
              <div className="font-display text-[22px] font-bold text-white leading-none">{it.value}</div>
              <div className="text-[10px] font-mono-label leading-tight" style={{ color: 'rgba(217,226,255,0.45)' }}>
                {it.label}<br />{it.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
