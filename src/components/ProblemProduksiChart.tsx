"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { RenderableText } from "recharts";
import {
  CARD_BORDER,
  TEXT_PRIMARY,
  TEXT_MUTED,
  AXIS_LINE,
  GRID_LINE,
  tickStyle,
  lineColor,
} from "@/lib/chartTheme";

interface MonthRow {
  month: string;
  opTotal: number;
  finTotal: number;
  [seriesKey: string]: string | number;
}

interface ByMonthResponse {
  lines: string[];
  data: MonthRow[];
}

const CHART_H = 280;
const SKELETON_RATIOS = [0.6, 0.9, 0.4, 0.75, 0.55];

const labelStyle = {
  fill: TEXT_PRIMARY,
  fontSize: 11,
  fontWeight: 700,
  fontFamily: "var(--font-data)",
};

/** Blank instead of a literal 0, so empty months stay uncluttered. */
const hideZero = (value: RenderableText): RenderableText =>
  Number(value) > 0 ? value : "";

type StackPrefix = "op" | "fin";

/**
 * In the installed Recharts (3.10.1), a bar segment with height === 0 is
 * dropped from the rendered rect array entirely (node_modules/recharts/lib/
 * cartesian/Bar.js, ~line 676), and any LabelList attached to that segment
 * disappears along with it. A fixed line's Bar is therefore not a safe place
 * to hang the stack's total label, since that particular line can be zero in
 * a given month while the stack itself is not empty.
 *
 * Instead every bar in a stack carries the label machinery, but only the
 * bar for the topmost surviving (non-zero) contributor actually emits the
 * total. Recharts stacks bars bottom-to-top in declaration order, and `lines`
 * is declared in the same order for every Bar, so scanning `lines` from the
 * end backwards finds exactly the line whose rect sits at the top of
 * whatever actually renders for that row.
 */
function topContributor(row: MonthRow, prefix: StackPrefix, lines: string[]): string | undefined {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (Number(row[`${prefix}:${line}`]) > 0) return line;
  }
  return undefined;
}

function stackLabelValue(
  row: MonthRow,
  prefix: StackPrefix,
  line: string,
  lines: string[],
): RenderableText {
  if (topContributor(row, prefix, lines) !== line) return "";
  return prefix === "op" ? row.opTotal : row.finTotal;
}

function ChartTooltip({
  active,
  payload,
  label,
  lines,
}: {
  active?: boolean;
  payload?: { payload: MonthRow }[];
  label?: string;
  lines: string[];
}) {
  if (!active || !payload?.length) return null;

  const row = payload[0].payload;
  if (row.opTotal === 0 && row.finTotal === 0) return null;

  const blocks = [
    { title: "On Progress", prefix: "op:", total: row.opTotal },
    { title: "Finish", prefix: "fin:", total: row.finTotal },
  ];

  return (
    <div
      className="font-data rounded-lg px-3 py-2"
      style={{ background: "#0a152e", border: `1px solid ${CARD_BORDER}`, minWidth: 150 }}
    >
      <div className="text-[12px] font-bold" style={{ color: TEXT_PRIMARY }}>
        {label}
      </div>

      {blocks.map((block) => {
        const entries = lines
          .map((line) => ({ line, value: Number(row[`${block.prefix}${line}`] ?? 0) }))
          .filter((e) => e.value > 0);

        if (!entries.length) return null;

        return (
          <div key={block.title} className="mt-1.5">
            <div className="text-[11px] font-semibold" style={{ color: TEXT_MUTED }}>
              {block.title} · {block.total}
            </div>
            {entries.map((e) => (
              <div key={e.line} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="w-2 h-2 rounded-sm shrink-0"
                  style={{ background: lineColor(e.line) }}
                />
                <span style={{ color: TEXT_MUTED }}>{e.line}</span>
                <span className="ml-auto font-bold" style={{ color: TEXT_PRIMARY }}>
                  {e.value}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function ProblemProduksiChart() {
  const [resp, setResp] = useState<ByMonthResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/problem-produksi/by-month")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: ByMonthResponse) => setResp(d))
      .catch(() => setFailed(true));
  }, []);

  const lines = resp?.lines ?? [];
  const rows = resp?.data ?? [];
  const hasData = rows.some((r) => r.opTotal > 0 || r.finTotal > 0);

  const summary = hasData
    ? `Problem per bulan: ${rows
        .filter((r) => r.opTotal > 0 || r.finTotal > 0)
        .map((r) => `${r.month} on progress ${r.opTotal}, finish ${r.finTotal}`)
        .join("; ")}`
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
          Problem per Bulan
        </span>
      </div>

      {failed ? (
        <div className="flex items-center justify-center" style={{ height: CHART_H }}>
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Data Problem Produksi per bulan tidak tersedia.
          </span>
        </div>
      ) : !resp ? (
        <div
          className="flex items-end justify-center gap-8 sm:gap-12 px-2"
          style={{ height: CHART_H }}
          aria-hidden="true"
        >
          {SKELETON_RATIOS.map((ratio, i) => (
            <div
              key={i}
              className="w-9 sm:w-11 rounded-t-md animate-pulse"
              style={{
                height: Math.round((CHART_H - 40) * ratio),
                background: "rgba(217,226,255,0.10)",
              }}
            />
          ))}
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center" style={{ height: CHART_H }}>
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Belum ada data.
          </span>
        </div>
      ) : (
        <>
          <div style={{ height: CHART_H }} role="img" aria-label={summary}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 24, right: 12, left: 0, bottom: 4 }}>
                <CartesianGrid stroke={GRID_LINE} strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
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
                <Tooltip
                  cursor={{ fill: "rgba(217,226,255,0.06)" }}
                  content={<ChartTooltip lines={lines} />}
                />
                <Legend
                  iconType="square"
                  iconSize={9}
                  wrapperStyle={{
                    fontSize: 11,
                    fontFamily: "var(--font-data)",
                    color: TEXT_MUTED,
                  }}
                />

                {lines.map((line) => (
                  <Bar
                    key={`op:${line}`}
                    dataKey={`op:${line}`}
                    stackId="op"
                    name={line}
                    fill={lineColor(line)}
                    maxBarSize={26}
                  >
                    <LabelList
                      position="top"
                      formatter={hideZero}
                      style={labelStyle}
                      valueAccessor={(entry) =>
                        stackLabelValue(entry.payload as MonthRow, "op", line, lines)
                      }
                    />
                  </Bar>
                ))}

                {lines.map((line) => (
                  <Bar
                    key={`fin:${line}`}
                    dataKey={`fin:${line}`}
                    stackId="fin"
                    legendType="none"
                    fill={lineColor(line)}
                    maxBarSize={26}
                  >
                    <LabelList
                      position="top"
                      formatter={hideZero}
                      style={labelStyle}
                      valueAccessor={(entry) =>
                        stackLabelValue(entry.payload as MonthRow, "fin", line, lines)
                      }
                    />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10.5px] text-center mt-1" style={{ color: TEXT_MUTED }}>
            kiri: On Progress · kanan: Finish
          </p>
        </>
      )}
    </div>
  );
}
