"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Cell,
  Line,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  CARD_BORDER,
  TEXT_PRIMARY,
  TEXT_MUTED,
  AXIS_LINE,
  GRID_LINE,
  tickStyle,
  lineColor,
} from "@/lib/chartTheme";

interface LineTotal {
  line_name: string;
  total: number;
  high: number;
  medium: number;
  low: number;
}

const CHART_H = 280;
const SKELETON_RATIOS = [0.6, 0.9, 0.4, 0.75, 0.55];

/** Same three colors already used for these risk levels in HenkatenKpiBar. */
const RISK_COLOR = {
  high: "#EB0A1E",
  medium: "#F59E0B",
  low: "#10B981",
} as const;

/**
 * Two of `lineColor()`'s per-line colors (Mould-RCS red, Core Making amber)
 * are the exact same hex as the High/Medium risk Line series now overlaid
 * on these bars, so a same-color dot disappears into its own bar. Darkening
 * only the BAR fill — not `lineColor()` itself, which ProblemProduksiChart
 * also relies on for its own (unrelated) per-line coloring — keeps every
 * line's color assignment intact everywhere else while giving the overlaid
 * risk lines contrast against whichever bar they happen to cross.
 */
const BAR_DARKEN_FACTOR = 0.72;

function darken(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 0xff) * factor);
  const g = Math.round(((n >> 8) & 0xff) * factor);
  const b = Math.round((n & 0xff) * factor);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function RiskLegend() {
  const items = [
    { label: "High", color: RISK_COLOR.high },
    { label: "Medium", color: RISK_COLOR.medium },
    { label: "Low", color: RISK_COLOR.low },
  ];
  return (
    <div className="flex items-center gap-4 pl-1 sm:pl-2 mb-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: item.color }}
          />
          <span className="text-[10px]" style={{ color: TEXT_MUTED }}>
            {item.label} Risk
          </span>
        </div>
      ))}
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: LineTotal }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="font-data rounded-lg px-3 py-2"
      style={{ background: "#0a152e", border: `1px solid ${CARD_BORDER}`, minWidth: 140 }}
    >
      <div className="text-[11px] font-medium" style={{ color: TEXT_MUTED }}>
        {d.line_name}
      </div>
      <div className="text-[13px] font-bold mb-1" style={{ color: TEXT_PRIMARY }}>
        {d.total} Henkaten
      </div>
      {[
        { label: "High", value: d.high, color: RISK_COLOR.high },
        { label: "Medium", value: d.medium, color: RISK_COLOR.medium },
        { label: "Low", value: d.low, color: RISK_COLOR.low },
      ]
        .filter((r) => r.value > 0)
        .map((r) => (
          <div key={r.label} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
            <span style={{ color: TEXT_MUTED }}>{r.label}</span>
            <span className="ml-auto font-bold" style={{ color: TEXT_PRIMARY }}>
              {r.value}
            </span>
          </div>
        ))}
    </div>
  );
}

export function HenkatenByLineChart() {
  const [data, setData] = useState<LineTotal[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/henkaten-kpi/by-line")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: LineTotal[]) => setData(d))
      .catch(() => setFailed(true));
  }, []);

  const summary =
    data && data.length
      ? `Henkaten per line: ${data.map((d) => `${d.line_name} ${d.total}`).join(", ")}`
      : undefined;

  return (
    <div
      className="font-data rounded-xl px-3 sm:px-4 pt-3 sm:pt-3.5 pb-3 sm:pb-3.5 mt-3"
      style={{ border: `1px solid ${CARD_BORDER}` }}
    >
      <div className="flex items-center gap-2 pl-1 sm:pl-2 mb-3">
        <BarChart3 size={15} style={{ color: TEXT_MUTED }} />
        <span
          className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-widest"
          style={{ color: TEXT_MUTED }}
        >
          Henkaten per Line
        </span>
      </div>

      <RiskLegend />

      {failed ? (
        <div className="flex items-center justify-center" style={{ height: CHART_H }}>
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Data e-Henkaten per line tidak tersedia.
          </span>
        </div>
      ) : !data ? (
        <div
          className="flex items-end justify-center gap-8 sm:gap-12 px-2"
          style={{ height: CHART_H }}
          aria-hidden="true"
        >
          {SKELETON_RATIOS.map((ratio, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-14">
              <div
                className="w-9 sm:w-11 rounded-t-md animate-pulse"
                style={{
                  height: Math.round((CHART_H - 40) * ratio),
                  background: "rgba(217,226,255,0.10)",
                }}
              />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: CHART_H }}>
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Belum ada data.
          </span>
        </div>
      ) : (
        <div style={{ height: CHART_H }} role="img" aria-label={summary}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke={GRID_LINE} strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="line_name"
                axisLine={{ stroke: AXIS_LINE }}
                tickLine={{ stroke: AXIS_LINE }}
                tick={tickStyle}
              />
              <YAxis
                allowDecimals={false}
                width={32}
                axisLine={{ stroke: AXIS_LINE }}
                tickLine={{ stroke: AXIS_LINE }}
                tick={tickStyle}
              />
              <Tooltip cursor={{ fill: "rgba(217,226,255,0.06)" }} content={<ChartTooltip />} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {data.map((d) => (
                  <Cell key={d.line_name} fill={darken(lineColor(d.line_name), BAR_DARKEN_FACTOR)} />
                ))}
                <LabelList
                  dataKey="total"
                  position="top"
                  style={{ fill: TEXT_PRIMARY, fontSize: 12, fontWeight: 700, fontFamily: "var(--font-data)" }}
                />
              </Bar>
              {/*
                Real data series, not floating labels: each Line plots its
                risk count on the SAME Y-axis scale the bars use, so a dot's
                vertical position is the actual value read against the axis
                ticks — and same-color dots across categories are connected,
                like a standard combo bar+line chart.
              */}
              <Line
                type="linear"
                dataKey="high"
                stroke={RISK_COLOR.high}
                strokeWidth={2}
                dot={{ r: 3, fill: RISK_COLOR.high, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="medium"
                stroke={RISK_COLOR.medium}
                strokeWidth={2}
                dot={{ r: 3, fill: RISK_COLOR.medium, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="low"
                stroke={RISK_COLOR.low}
                strokeWidth={2}
                dot={{ r: 3, fill: RISK_COLOR.low, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
