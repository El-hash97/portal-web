"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
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
}

const CHART_H = 280;
const SKELETON_RATIOS = [0.6, 0.9, 0.4, 0.75, 0.55];

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
      style={{ background: "#0a152e", border: `1px solid ${CARD_BORDER}` }}
    >
      <div className="text-[11px] font-medium" style={{ color: TEXT_MUTED }}>
        {d.line_name}
      </div>
      <div className="text-[13px] font-bold" style={{ color: TEXT_PRIMARY }}>
        {d.total} Henkaten
      </div>
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
            <BarChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 4 }}>
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
                  <Cell key={d.line_name} fill={lineColor(d.line_name)} />
                ))}
                <LabelList
                  dataKey="total"
                  position="top"
                  style={{ fill: TEXT_PRIMARY, fontSize: 12, fontWeight: 700, fontFamily: "var(--font-data)" }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
