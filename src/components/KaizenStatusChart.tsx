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
} from "@/lib/chartTheme";

/**
 * Two separate stacks per month, not one 5-way stack: the four "not yet
 * finished" statuses grouped into one horizontal bar, and Finish as its own
 * bar below it. Recharts positions same-category stacks by declaration
 * order — verified against node_modules/recharts/lib/state/selectors/
 * combiners/combineAllBarPositions.js: each stackId gets position.offset =
 * (size + gap) * i for its index i among the declared stacks, and
 * ChartUtils.js's getCateCoordinateOfBar adds that offset directly to the
 * category tick's Y coordinate. Y increases downward in SVG, so declaring
 * the "op" stack's bars before the "finish" stack's bar (as done in the JSX
 * below) reliably renders Finish below On Progress, not just by convention.
 */
const OP_STATUSES = ["On Progress", "Tunggu Material", "Fabrikasi", "Others"] as const;
const FINISH_STATUS = "Finish" as const;
const STATUSES = [...OP_STATUSES, FINISH_STATUS] as const;
type Status = (typeof STATUSES)[number];

const STATUS_COLOR: Record<Status, string> = {
  "On Progress": "#F59E0B",
  "Tunggu Material": "#EAB308",
  Fabrikasi: "#3B82F6",
  Others: "#6B7280",
  Finish: "#10B981",
};

interface MonthRow {
  month: string;
  total: number;
  "On Progress": number;
  "Tunggu Material": number;
  Fabrikasi: number;
  Others: number;
  Finish: number;
}

interface ByMonthResponse {
  statuses: Status[];
  data: MonthRow[];
}

// Each month now holds two stacked sub-bars (On Progress group above,
// Finish below) instead of one, so the per-month row needs more height
// than the earlier single-bar layout did.
const ROW_H = 76;
const MIN_CHART_H = 200;
const SKELETON_RATIOS = [0.5, 0.85, 0.65];

const labelStyle = {
  fill: TEXT_PRIMARY,
  fontSize: 11,
  fontWeight: 700,
  fontFamily: "var(--font-data)",
};

/** Blank instead of a literal 0, matching the other charts' label formatting. */
const hideZero = (value: RenderableText): RenderableText =>
  Number(value) > 0 ? value : "";

/**
 * Same fix as ProblemProduksiChart.tsx (see that file's comment for the full
 * Recharts source citation): a zero-height bar rect is dropped entirely, and
 * any LabelList attached to it disappears along with it. A label fixed to
 * one pre-chosen status would vanish whenever that status is zero for a
 * given month. Every bar in the "op" stack carries the label machinery, but
 * only the bar for that row's topmost surviving (non-zero) OP_STATUSES
 * status actually emits the stack's total — found by scanning OP_STATUSES
 * from the end backward, since Recharts stacks bars start-to-end in
 * declaration order and OP_STATUSES is declared in that same order for
 * every Bar in the "op" stack.
 *
 * The "finish" stack is a single bar, so it needs no scan: its own value
 * is its own total, and if it's zero the bar (and its label) is simply
 * absent, which is correct.
 */
function opTotal(row: MonthRow): number {
  return OP_STATUSES.reduce((sum, status) => sum + Number(row[status]), 0);
}

function topOpContributor(row: MonthRow): (typeof OP_STATUSES)[number] | undefined {
  for (let i = OP_STATUSES.length - 1; i >= 0; i--) {
    const status = OP_STATUSES[i];
    if (Number(row[status]) > 0) return status;
  }
  return undefined;
}

function opLabelValue(row: MonthRow, status: (typeof OP_STATUSES)[number]): RenderableText {
  if (topOpContributor(row) !== status) return "";
  return opTotal(row);
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: MonthRow }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;

  const entries = STATUSES.map((status) => ({ status, value: row[status] })).filter(
    (e) => e.value > 0,
  );
  if (!entries.length) return null;

  return (
    <div
      className="font-data rounded-lg px-3 py-2"
      style={{ background: "#0a152e", border: `1px solid ${CARD_BORDER}`, minWidth: 150 }}
    >
      <div className="text-[12px] font-bold" style={{ color: TEXT_PRIMARY }}>
        {label} · {row.total}
      </div>
      {entries.map((e) => (
        <div key={e.status} className="flex items-center gap-1.5 text-[11px] mt-1">
          <span
            className="w-2 h-2 rounded-sm shrink-0"
            style={{ background: STATUS_COLOR[e.status] }}
          />
          <span style={{ color: TEXT_MUTED }}>{e.status}</span>
          <span className="ml-auto font-bold" style={{ color: TEXT_PRIMARY }}>
            {e.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function KaizenStatusChart() {
  const [resp, setResp] = useState<ByMonthResponse | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/kaizen/by-month")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: ByMonthResponse) => setResp(d))
      .catch(() => setFailed(true));
  }, []);

  const rows = resp?.data ?? [];
  const hasData = rows.length > 0;
  const chartHeight = Math.max(MIN_CHART_H, rows.length * ROW_H);

  const summary = hasData
    ? `Kaizen per bulan: ${rows.map((r) => `${r.month} total ${r.total}`).join("; ")}`
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
          Kaizen per Bulan
        </span>
      </div>

      {failed ? (
        <div className="flex items-center justify-center" style={{ height: MIN_CHART_H }}>
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Data Kaizen Order Sheet per bulan tidak tersedia.
          </span>
        </div>
      ) : !resp ? (
        <div
          className="flex flex-col justify-center gap-3 px-2"
          style={{ height: MIN_CHART_H }}
          aria-hidden="true"
        >
          {SKELETON_RATIOS.map((ratio, i) => (
            <div
              key={i}
              className="h-6 rounded-r-md animate-pulse"
              style={{ width: `${Math.round(ratio * 100)}%`, background: "rgba(217,226,255,0.10)" }}
            />
          ))}
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center" style={{ height: MIN_CHART_H }}>
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Belum ada data.
          </span>
        </div>
      ) : (
        <div style={{ height: chartHeight }} role="img" aria-label={summary}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 4, right: 36, left: 0, bottom: 4 }}
            >
              <CartesianGrid stroke={GRID_LINE} strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                axisLine={{ stroke: AXIS_LINE }}
                tickLine={{ stroke: AXIS_LINE }}
                tick={tickStyle}
              />
              <YAxis
                type="category"
                dataKey="month"
                width={40}
                axisLine={{ stroke: AXIS_LINE }}
                tickLine={{ stroke: AXIS_LINE }}
                tick={tickStyle}
              />
              <Tooltip cursor={{ fill: "rgba(217,226,255,0.06)" }} content={<ChartTooltip />} />
              <Legend
                iconType="square"
                iconSize={9}
                wrapperStyle={{
                  fontSize: 11,
                  fontFamily: "var(--font-data)",
                  color: TEXT_MUTED,
                }}
              />

              {OP_STATUSES.map((status) => (
                <Bar
                  key={status}
                  dataKey={status}
                  stackId="op"
                  name={status}
                  fill={STATUS_COLOR[status]}
                  maxBarSize={20}
                >
                  <LabelList
                    position="right"
                    formatter={hideZero}
                    style={labelStyle}
                    valueAccessor={(entry) => opLabelValue(entry.payload as MonthRow, status)}
                  />
                </Bar>
              ))}

              <Bar
                dataKey={FINISH_STATUS}
                stackId="finish"
                name={FINISH_STATUS}
                fill={STATUS_COLOR[FINISH_STATUS]}
                maxBarSize={20}
              >
                <LabelList
                  position="right"
                  formatter={hideZero}
                  style={labelStyle}
                  dataKey={FINISH_STATUS}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
