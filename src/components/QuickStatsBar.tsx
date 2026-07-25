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
      icon: <MousePointerClick size={22} className="sm:hidden" />, iconLg: <MousePointerClick size={26} className="hidden sm:block" />,
      accent: 'rgba(217,226,255,0.7)',
      value: loading ? '—' : totalAll.toLocaleString('id-ID'),
      label: 'Total Dibuka', sub: 'Semua Waktu',
    },
    {
      icon: <CalendarClock size={22} className="sm:hidden" />, iconLg: <CalendarClock size={26} className="hidden sm:block" />,
      accent: '#00dbe9',
      value: loading ? '—' : totalToday.toLocaleString('id-ID'),
      label: 'Hari Ini', sub: 'Dibuka',
    },
    {
      icon: <TrendingUp size={22} className="sm:hidden" />, iconLg: <TrendingUp size={26} className="hidden sm:block" />,
      accent: '#10B981',
      value: loading ? '—' : totalWeek.toLocaleString('id-ID'),
      label: '7 Hari', sub: 'Terakhir',
    },
    {
      icon: <LayoutGrid size={22} className="sm:hidden" />, iconLg: <LayoutGrid size={26} className="hidden sm:block" />,
      accent: '#EB0A1E',
      value: String(activeApps),
      label: 'Aplikasi', sub: 'Aktif',
    },
  ];

  return (
    <div
      className="rounded-xl p-3 sm:p-4 flex flex-wrap items-stretch justify-between gap-3 sm:gap-6"
      style={{
        background: 'rgba(10,21,46,0.85)',
        border: '1px solid #2f3952',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center gap-2 pl-1 sm:pl-2 w-full sm:w-auto">
        <span className="font-mono-label text-[9px] sm:text-[10px] uppercase tracking-widest" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Quick Stats
        </span>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 flex-1 sm:justify-center w-full sm:w-auto">
        {items.map((it, i) => (
          <div key={it.label} className="flex items-center gap-2 sm:gap-3">
            {i > 0 && <div className="hidden sm:block w-px h-10" style={{ background: '#2f3952' }} />}
            <span style={{ color: it.accent }}>{it.icon}{it.iconLg}</span>
            <div>
              <div className="font-display text-[18px] sm:text-[22px] font-bold text-white leading-none">{it.value}</div>
              <div className="text-[9px] sm:text-[10px] font-mono-label leading-tight" style={{ color: 'rgba(217,226,255,0.45)' }}>
                {it.label}<br />{it.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
