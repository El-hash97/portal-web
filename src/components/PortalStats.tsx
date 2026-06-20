'use client';

import { useEffect, useRef, useState } from 'react';
import { Activity, Flame, MousePointerClick, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import type { App } from '@/lib/types';

/* ── types ──────────────────────────────────────────────── */
interface DayCount    { date: string; clicks: number; }
interface AnalyticRow { app_id: number; clicks_total: number; clicks_today: number; clicks_week: number; }

/* ── helpers ────────────────────────────────────────────── */
function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function smooth(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

/* ── KPI Card ───────────────────────────────────────────── */
function KpiCard({
  icon, label, value, sub, accent, truncate = false,
}: {
  icon: React.ReactNode; label: string; value: string | number;
  sub: string; accent: string; truncate?: boolean;
}) {
  const display = typeof value === 'number' ? value.toLocaleString('id-ID') : value;
  return (
    <div
      className="rounded-xl px-4 py-3.5 flex flex-col gap-1"
      style={{ background: 'linear-gradient(135deg, #111 0%, #1a0808 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
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
        title={truncate ? String(display) : undefined}
      >
        {display}
      </div>
      <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
    </div>
  );
}

/* ── Line Chart ─────────────────────────────────────────── */
const CW = 800, CH = 185;
const CPL = 42, CPR = 12, CPT = 16, CPB = 32;
const ciW = CW - CPL - CPR, ciH = CH - CPT - CPB;

function LineChart({ data, loading }: { data: DayCount[]; loading: boolean }) {
  const [hIdx, setHIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const max  = data.length ? Math.max(...data.map(d => d.clicks), 1) : 1;
  const pts: [number, number][] = data.map((d, i) => [
    CPL + (i / Math.max(data.length - 1, 1)) * ciW,
    CPT + (1 - d.clicks / max) * ciH,
  ]);

  const linePath = pts.length >= 2 ? smooth(pts) : '';
  const areaPath = linePath
    ? `${linePath} L${pts[pts.length - 1][0]},${CPT + ciH} L${pts[0][0]},${CPT + ciH} Z`
    : '';

  const yTicks = [0, 0.5, 1].map(f => ({ y: CPT + (1 - f) * ciH, v: Math.round(f * max) }));
  const step   = Math.max(1, Math.ceil(data.length / 7));

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current || !pts.length) return;
    const r  = svgRef.current.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * CW;
    let ci = 0, md = Infinity;
    pts.forEach(([px], i) => { const dist = Math.abs(sx - px); if (dist < md) { md = dist; ci = i; } });
    setHIdx(ci);
  }

  const hov = hIdx !== null && data[hIdx] ? { pt: pts[hIdx], d: data[hIdx] } : null;
  const TW  = 130;

  if (!loading && data.length < 2) {
    return (
      <div className="h-20 flex items-center justify-center">
        <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.22)' }}>Belum ada data.</p>
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CW} ${CH}`}
      className="w-full cursor-crosshair"
      style={{ overflow: 'visible', opacity: loading ? 0.35 : 1, transition: 'opacity 0.25s' }}
      onMouseMove={onMove}
      onMouseLeave={() => setHIdx(null)}
    >
      <defs>
        <linearGradient id="pg-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#EB0A1E" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#EB0A1E" stopOpacity="0"    />
        </linearGradient>
      </defs>

      {/* Grid */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={CPL} y1={t.y} x2={CW - CPR} y2={t.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          <text x={CPL - 6} y={t.y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.22)">{t.v}</text>
        </g>
      ))}

      {/* Area + Line */}
      {areaPath && <path d={areaPath} fill="url(#pg-fill)" />}
      {linePath && (
        <path d={linePath} fill="none" stroke="#EB0A1E" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Regular dots (skip hovered) */}
      {pts.map(([x, y], i) => hIdx !== i && (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#EB0A1E" opacity={data[i].clicks > 0 ? 1 : 0.3} />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => {
        if (i % step !== 0 && i !== data.length - 1) return null;
        return (
          <text key={i} x={pts[i][0]} y={CH - 4} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.22)">
            {fmtDate(d.date)}
          </text>
        );
      })}

      {/* Hover: crosshair + dot + tooltip */}
      {hov && (() => {
        const [hx, hy] = hov.pt;
        const tx = Math.max(CPL, Math.min(CW - CPR - TW, hx - TW / 2));
        const ty = Math.max(CPT, hy - 52);
        return (
          <g>
            <line x1={hx} y1={CPT} x2={hx} y2={CPT + ciH}
              stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3,2" />
            <circle cx={hx} cy={hy} r="5"   fill="#EB0A1E" />
            <circle cx={hx} cy={hy} r="2.5" fill="#fff"    />
            <rect x={tx} y={ty} width={TW} height={42} rx="5"
              fill="#1c0606" stroke="rgba(235,10,30,0.38)" strokeWidth="1" />
            <text x={tx + TW / 2} y={ty + 15} textAnchor="middle" fontSize="9.5" fill="rgba(255,255,255,0.5)">
              {fmtDate(hov.d.date)}
            </text>
            <text x={tx + TW / 2} y={ty + 32} textAnchor="middle" fontSize="13" fontWeight="bold" fill="rgba(255,255,255,0.92)">
              {hov.d.clicks.toLocaleString('id-ID')} dibuka
            </text>
          </g>
        );
      })()}

      {/* Invisible hit area */}
      <rect x={CPL} y={CPT} width={ciW} height={ciH} fill="transparent" />
    </svg>
  );
}

/* ── Horizontal Bar Chart ───────────────────────────────── */
function BarChart({ analytics, apps }: { analytics: AnalyticRow[]; apps: App[] }) {
  const ranked = analytics
    .map(r => ({ ...r, app: apps.find(a => a.id === r.app_id) }))
    .filter(r => r.app)
    .slice(0, 8);

  if (!ranked.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8">
        <MousePointerClick size={18} className="mb-2" style={{ color: 'rgba(255,255,255,0.13)' }} />
        <p className="text-[11px] text-center" style={{ color: 'rgba(255,255,255,0.28)' }}>Belum ada data klik.</p>
      </div>
    );
  }

  const max = ranked[0].clicks_total;
  const barColor = (i: number) =>
    i === 0 ? '#EB0A1E' : i === 1 ? '#F97316' : i === 2 ? '#F59E0B' : 'rgba(255,255,255,0.18)';

  return (
    <div className="flex flex-col gap-2.5">
      {ranked.map((r, i) => (
        <div key={r.app_id} className="flex items-center gap-2.5">
          <span
            className="w-4 text-[10px] font-bold text-right shrink-0"
            style={{ color: i < 3 ? '#EB0A1E' : 'rgba(255,255,255,0.22)' }}
          >
            {i + 1}
          </span>
          <span
            className="text-[12px] font-medium shrink-0 truncate"
            style={{ color: 'rgba(255,255,255,0.75)', width: 100 }}
            title={r.app!.nama}
          >
            {r.app!.nama}
          </span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.round((r.clicks_total / max) * 100)}%`, background: barColor(i) }}
            />
          </div>
          <span
            className="text-[11px] font-bold shrink-0 text-right"
            style={{ color: 'rgba(255,255,255,0.85)', width: 36 }}
          >
            {r.clicks_total.toLocaleString('id-ID')}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Main ───────────────────────────────────────────────── */
export function PortalStats() {
  const { apps } = useAppStore();
  const [analytics, setAnalytics]       = useState<AnalyticRow[]>([]);
  const [series, setSeries]             = useState<DayCount[]>([]);
  const [period, setPeriod]             = useState<7 | 14 | 30>(14);
  const [kpiLoading, setKpiLoading]     = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [failed, setFailed]             = useState(false);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => (r.ok ? r.json() : []))
      .then((d: AnalyticRow[]) => setAnalytics(d))
      .catch(() => setFailed(true))
      .finally(() => setKpiLoading(false));
  }, []);

  useEffect(() => {
    setSeriesLoading(true);
    fetch(`/api/analytics/timeseries?days=${period}`)
      .then(r => (r.ok ? r.json() : []))
      .then((d: DayCount[]) => setSeries(d))
      .catch(() => {})
      .finally(() => setSeriesLoading(false));
  }, [period]);

  if (failed) return null;

  const totals = {
    today: analytics.reduce((s, r) => s + r.clicks_today, 0),
    week:  analytics.reduce((s, r) => s + r.clicks_week,  0),
    all:   analytics.reduce((s, r) => s + r.clicks_total, 0),
  };
  const topRow = analytics[0];
  const topApp = topRow ? apps.find(a => a.id === topRow.app_id) : undefined;

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Activity size={13} style={{ color: '#EB0A1E' }} />
        <span className="text-[10.5px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>
          Aktivitas Portal
        </span>
        {kpiLoading && (
          <span className="text-[10px] px-2 py-0.5 rounded"
            style={{ color: 'rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.04)' }}>
            memuat…
          </span>
        )}
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KpiCard
          icon={<MousePointerClick size={15} />} label="Hari Ini"
          value={kpiLoading ? '—' : totals.today} sub="dibuka hari ini" accent="#3B82F6"
        />
        <KpiCard
          icon={<TrendingUp size={15} />} label="7 Hari Terakhir"
          value={kpiLoading ? '—' : totals.week} sub="dibuka minggu ini" accent="#10B981"
        />
        <KpiCard
          icon={<Activity size={15} />} label="Semua Waktu"
          value={kpiLoading ? '—' : totals.all} sub="total pembukaan" accent="#EB0A1E"
        />
        <KpiCard
          icon={<Flame size={15} />} label="Terpopuler"
          value={kpiLoading ? '—' : (topApp ? topApp.nama : '—')}
          sub={!kpiLoading && topRow
            ? `${topRow.clicks_total.toLocaleString('id-ID')} kali dibuka`
            : 'belum ada data'}
          accent="#F59E0B" truncate
        />
      </div>

      {/* Charts row: line chart + bar chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">

        {/* Line chart */}
        <div
          className="rounded-xl px-5 pt-4 pb-3"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.18)' }}>
              Tren Pembukaan
            </p>
            <div className="flex gap-1">
              {([7, 14, 30] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-2.5 py-1 rounded-md text-[10.5px] font-bold transition-all"
                  style={{
                    background: period === p ? 'rgba(235,10,30,0.18)' : 'transparent',
                    color:      period === p ? '#EB0A1E' : 'rgba(255,255,255,0.3)',
                    border:     `1px solid ${period === p ? 'rgba(235,10,30,0.35)' : 'transparent'}`,
                  }}
                >
                  {p}H
                </button>
              ))}
            </div>
          </div>
          <LineChart data={series} loading={seriesLoading} />
        </div>

        {/* Ranking bar chart */}
        <div
          className="rounded-xl px-5 pt-4 pb-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Ranking Pembukaan
          </p>
          {kpiLoading
            ? <div className="h-20 flex items-center justify-center">
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.22)' }}>memuat…</span>
              </div>
            : <BarChart analytics={analytics} apps={apps} />
          }
        </div>

      </div>
    </section>
  );
}
