'use client';

import { useEffect, useState } from 'react';
import { MousePointerClick, TrendingUp, BarChart3, Calendar, Flame } from 'lucide-react';
import type { App } from '@/lib/types';

interface AnalyticRow {
  app_id: number;
  clicks_total: number;
  clicks_today: number;
  clicks_week: number;
}

interface KpiSectionProps {
  apps: App[];
}

export function KpiSection({ apps }: KpiSectionProps) {
  const [stats, setStats]     = useState<AnalyticRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.ok ? r.json() : [])
      .then((data: AnalyticRow[]) => setStats(data))
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, []);

  const totalAll   = stats.reduce((s, r) => s + r.clicks_total, 0);
  const totalToday = stats.reduce((s, r) => s + r.clicks_today, 0);
  const totalWeek  = stats.reduce((s, r) => s + r.clicks_week,  0);
  const topRow     = stats[0];
  const topApp     = topRow ? apps.find(a => a.id === topRow.app_id) : undefined;

  const maxClicks = stats[0]?.clicks_total ?? 1;

  const ranked = stats
    .map(r => ({ ...r, app: apps.find(a => a.id === r.app_id) }))
    .filter(r => r.app)
    .slice(0, 8);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} style={{ color: '#EB0A1E' }} />
        <h3 className="text-[15px] font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.85)' }}>
          Statistik Aktivitas
        </h3>
        {loading && (
          <span className="text-[11px] px-2 py-0.5 rounded" style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)' }}>
            memuat...
          </span>
        )}
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard
          icon={<MousePointerClick size={15} />}
          label="Total Dibuka"
          value={loading ? '—' : totalAll.toLocaleString('id-ID')}
          sub="semua waktu"
          accent="#EB0A1E"
        />
        <KpiCard
          icon={<Calendar size={15} />}
          label="Hari Ini"
          value={loading ? '—' : totalToday.toLocaleString('id-ID')}
          sub="dibuka hari ini"
          accent="#3B82F6"
        />
        <KpiCard
          icon={<TrendingUp size={15} />}
          label="7 Hari Terakhir"
          value={loading ? '—' : totalWeek.toLocaleString('id-ID')}
          sub="klik minggu ini"
          accent="#10B981"
        />
        <KpiCard
          icon={<Flame size={15} />}
          label="Terpopuler"
          value={loading || !topApp ? '—' : topApp.nama}
          sub={topApp ? `${topRow!.clicks_total.toLocaleString('id-ID')} klik` : 'belum ada data'}
          accent="#F59E0B"
          truncate
        />
      </div>

      {/* Per-app ranked bar list */}
      {!loading && ranked.length > 0 && (
        <div
          className="rounded-xl px-5 py-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Ranking Pembukaan Aplikasi
          </p>
          <div className="flex flex-col gap-2.5">
            {ranked.map((r, i) => {
              const pct = maxClicks > 0 ? Math.round((r.clicks_total / maxClicks) * 100) : 0;
              return (
                <div key={r.app_id} className="flex items-center gap-3">
                  <span
                    className="w-5 text-[11px] font-bold text-right shrink-0"
                    style={{ color: i < 3 ? '#EB0A1E' : 'rgba(255,255,255,0.22)' }}
                  >
                    {i + 1}
                  </span>
                  <span
                    className="text-[13px] font-medium w-[140px] shrink-0 truncate"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                    title={r.app!.nama}
                  >
                    {r.app!.nama}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: i === 0 ? '#EB0A1E' : i === 1 ? '#F97316' : i === 2 ? '#F59E0B' : 'rgba(255,255,255,0.18)',
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[12px] font-bold w-12 text-right" style={{ color: 'rgba(255,255,255,0.85)' }}>
                      {r.clicks_total.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] w-10 text-right" style={{ color: '#3B82F6' }}>
                      +{r.clicks_today}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10.5px] mt-3 text-right" style={{ color: 'rgba(255,255,255,0.18)' }}>
            biru = tambahan hari ini
          </p>
        </div>
      )}

      {!loading && ranked.length === 0 && (
        <div
          className="rounded-xl px-5 py-6 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <MousePointerClick size={24} className="mx-auto mb-2" style={{ color: 'rgba(255,255,255,0.13)' }} />
          <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Belum ada data klik. Data muncul setelah pengguna membuka aplikasi.
          </p>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon, label, value, sub, accent, truncate = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
  truncate?: boolean;
}) {
  return (
    <div
      className="rounded-xl px-4 py-3.5 flex flex-col gap-1"
      style={{
        background: 'linear-gradient(135deg, #111 0%, #1a0808 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span style={{ color: accent }}>{icon}</span>
        <span className="text-[10.5px] font-bold tracking-wide uppercase" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {label}
        </span>
      </div>
      <div
        className={`text-[22px] font-black leading-none tracking-tight ${truncate ? 'truncate' : ''}`}
        style={{ color: 'rgba(255,255,255,0.92)' }}
        title={truncate ? value : undefined}
      >
        {value}
      </div>
      <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {sub}
      </div>
    </div>
  );
}
