# Dashboard Kaizen Order Sheet Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Kaizen Order Sheet" section to `/dashboard` with a KPI bar and a horizontal stacked bar chart (months on the Y axis, count on the X axis, stacked by status), sourced live from the Kaizen Order Sheet app's Supabase backend.

**Architecture:** Two server-side API routes read the `kaizen_entries` table through a Supabase JS client (anon key, RLS already allows public read) and do all aggregation, keeping the two new client components purely presentational. The dashboard page composes them inside the existing `DashboardAppSection` wrapper, reusing `src/lib/chartTheme.ts` for chrome colors exactly as the other two sections do.

**Tech Stack:** Next.js 16 App Router, React 19 client components, Recharts 3.10 (already installed), `@supabase/supabase-js` (added in Task 1), Tailwind CSS, `lucide-react` icons.

## Global Constraints

- Source data is the `kaizen_entries` table on the Kaizen Order Sheet Supabase project (ref `tbvodyqlbsmkfifpmfzc`). Read **only** the `date` and `status` columns. Never select or return `id, timestamp, name, line, category, kaizen_name, area, photo_before, photo_after, keterangan, created_at, updated_at`.
- Env vars are `KAIZEN_SUPABASE_URL` and `KAIZEN_SUPABASE_ANON_KEY`, already present in `.env.local`. They must **never** gain a `NEXT_PUBLIC_` prefix and must only be read inside server-side route handlers.
- `status` has exactly 5 values, enforced by a DB-level CHECK constraint (verified live): `'On Progress'`, `'Fabrikasi'`, `'Tunggu Material'`, `'Finish'`, `'Others'`. The KPI route's `onProgress` = every row where `status !== 'Finish'`. The by-month route's stacked chart shows all 5 as separate colors — `On Progress` is its own category, not folded into `Others`.
- The by-month route emits **only months that have at least one row** — no zero-padding to 12 months (this differs deliberately from the Problem Produksi route).
- Month derivation is string slicing on the `date` column (`row.date.slice(5, 7)` for month, `row.date.slice(0, 4)` for year) — `date` is already `YYYY-MM-DD` with no time component, so no `Date` parsing is needed or wanted.
- The fixed status order for stacking, legend, and coloring is exactly `['On Progress', 'Tunggu Material', 'Fabrikasi', 'Others', 'Finish']` — a constant, never derived from which statuses happen to have data.
- Status colors: `On Progress` `#F59E0B`, `Tunggu Material` `#EAB308`, `Fabrikasi` `#3B82F6`, `Others` `#8B5CF6`, `Finish` `#10B981`.
- Shared chart chrome (`CARD_BORDER`, `TEXT_PRIMARY`, `TEXT_MUTED`, `AXIS_LINE`, `GRID_LINE`, `tickStyle`) comes from `src/lib/chartTheme.ts` — do not re-declare these constants in a new component.
- Failure semantics match the existing sections: route logs the error and returns a safe empty payload with HTTP 500; the component catches the non-OK response and renders an inline unavailable message. Nothing throws into the React tree.
- No automated test suite exists in this project (no Jest/Vitest/Playwright config) and none is added. Verification is `npx tsc --noEmit`, `npx eslint`, `curl` against a running dev server, and a browser check.

---

### Task 1: Supabase client and KPI API route

**Files:**
- Modify: `package.json` (adds `@supabase/supabase-js`)
- Create: `src/db/kaizen.ts`
- Create: `src/app/api/kaizen/kpi/route.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `kaizenSupabase` — a Supabase client exported from `@/db/kaizen`, used by Task 2 as well. And `GET /api/kaizen/kpi` returning `{ total: number; onProgress: number; finish: number }`.

- [ ] **Step 1: Install the SDK**

Run: `npm install @supabase/supabase-js@^2.105.3`
Expected: `@supabase/supabase-js` appears under `dependencies` in `package.json`. (Pinned to match the Kaizen Order Sheet app's own version, which is already verified working against this exact database.)

- [ ] **Step 2: Create the client module**

Create `src/db/kaizen.ts`:

```ts
import { createClient } from '@supabase/supabase-js';

// Separate Supabase backend owned by the Kaizen Order Sheet app —
// anon-key, RLS-constrained read access for surfacing its KPIs on the
// portal dashboard. Server-side only: these env vars carry no
// NEXT_PUBLIC_ prefix and must never be read from a client component.
export const kaizenSupabase = createClient(
  process.env.KAIZEN_SUPABASE_URL ?? '',
  process.env.KAIZEN_SUPABASE_ANON_KEY ?? '',
);
```

- [ ] **Step 3: Create the KPI route**

Create `src/app/api/kaizen/kpi/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { kaizenSupabase } from '@/db/kaizen';

export const dynamic = 'force-dynamic';

const EMPTY = { total: 0, onProgress: 0, finish: 0 };

export async function GET() {
  try {
    const { data, error } = await kaizenSupabase
      .from('kaizen_entries')
      .select('status');

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as { status: string }[];
    const finish = rows.filter((r) => r.status === 'Finish').length;
    const onProgress = rows.length - finish;

    return NextResponse.json(
      { total: rows.length, onProgress, finish },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[GET /api/kaizen/kpi]', err);
    return NextResponse.json(EMPTY, { status: 500 });
  }
}
```

`onProgress` is deliberately `rows.length - finish` (everything not `'Finish'`), not a literal `status === 'On Progress'` count — that literal status is only one of four non-Finish states.

- [ ] **Step 4: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/db/kaizen.ts src/app/api/kaizen/kpi/route.ts`
Expected: no errors.

- [ ] **Step 5: Verify against the live backend**

Run (background): `npm run dev`
Then: `curl -s http://localhost:3000/api/kaizen/kpi`
Expected: JSON with three numeric fields, e.g. `{"total":95,"onProgress":42,"finish":53}`. The exact numbers track live data, so the real check is that `onProgress + finish === total`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/db/kaizen.ts src/app/api/kaizen/kpi/route.ts
git commit -m "feat: add Kaizen Order Sheet Supabase client and KPI route"
```

---

### Task 2: Monthly status-breakdown API route

**Files:**
- Create: `src/app/api/kaizen/by-month/route.ts`

**Interfaces:**
- Consumes: `kaizenSupabase` from `@/db/kaizen` (Task 1).
- Produces: `GET /api/kaizen/by-month` returning
  `{ statuses: string[]; data: Array<{ month: string; total: number; "On Progress": number; "Tunggu Material": number; Fabrikasi: number; Others: number; Finish: number }> }`,
  where `statuses` is the fixed order `['On Progress', 'Tunggu Material', 'Fabrikasi', 'Others', 'Finish']` and `data` contains one entry per month that has at least one row, in chronological order. Task 4 consumes this shape.

- [ ] **Step 1: Create the route**

Create `src/app/api/kaizen/by-month/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { kaizenSupabase } from '@/db/kaizen';

export const dynamic = 'force-dynamic';

const MONTHS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const STATUSES = ['On Progress', 'Tunggu Material', 'Fabrikasi', 'Others', 'Finish'] as const;

interface KaizenRow {
  date: string;
  status: string;
}

export async function GET() {
  try {
    const { data, error } = await kaizenSupabase
      .from('kaizen_entries')
      .select('date, status');

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as KaizenRow[];
    const currentYear = String(new Date().getFullYear());

    // monthIndex (0-11) -> { status -> count }. Only months that appear in
    // the data get an entry here — this route does not zero-pad months.
    const buckets = new Map<number, Record<string, number>>();

    for (const row of rows) {
      // Slice the plain YYYY-MM-DD string rather than parsing a Date: the
      // column has no time component, and slicing avoids any timezone
      // reinterpretation entirely.
      if (typeof row.date !== 'string' || row.date.slice(0, 4) !== currentYear) continue;

      const monthIndex = Number(row.date.slice(5, 7)) - 1;
      if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) continue;

      const bucket = buckets.get(monthIndex) ?? {};
      bucket[row.status] = (bucket[row.status] ?? 0) + 1;
      buckets.set(monthIndex, bucket);
    }

    const monthly = [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([monthIndex, bucket]) => {
        const entry: Record<string, string | number> = { month: MONTHS_ID[monthIndex] };
        let total = 0;
        for (const status of STATUSES) {
          const count = bucket[status] ?? 0;
          entry[status] = count;
          total += count;
        }
        entry.total = total;
        return entry;
      });

    return NextResponse.json(
      { statuses: STATUSES, data: monthly },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[GET /api/kaizen/by-month]', err);
    return NextResponse.json({ statuses: STATUSES, data: [] }, { status: 500 });
  }
}
```

`total` is computed by summing only the 5 known `STATUSES` values, not every key seen in `bucket`. This relies on the DB's own CHECK constraint (verified live in the spec) guaranteeing `status` is always one of the 5 — if that constraint were ever removed and an unrecognized status appeared, this route's per-month `total` would silently undercount relative to the KPI route's all-status total. This is an accepted, documented reliance on the schema, not a gap to defend against here.

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/app/api/kaizen/by-month/route.ts`
Expected: no errors.

- [ ] **Step 3: Verify against the live backend**

Run (background, if not already running): `npm run dev`
Then: `curl -s http://localhost:3000/api/kaizen/by-month`
Expected, against current live data:
- `statuses` is exactly `["On Progress","Tunggu Material","Fabrikasi","Others","Finish"]`.
- `data` has 3 entries (May, Jun, Jul 2026 — current data range), each with all 5 status keys present (including `Fabrikasi: 0`) plus `month` and `total`.
- No entries for any other month.

Cross-check the totals sum correctly:

```bash
curl -s http://localhost:3000/api/kaizen/by-month | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s);console.log('months:',r.data.length,'statuses:',r.statuses.length,'sum:',r.data.reduce((a,m)=>a+m.total,0))})"
```

Expected: `months: 3`, `statuses: 5`, and `sum` equal to the number of current-year records (95 at time of writing, assuming all rows are in 2026).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/kaizen/by-month/route.ts
git commit -m "feat: add Kaizen Order Sheet monthly status-breakdown route"
```

---

### Task 3: KPI bar component

**Files:**
- Create: `src/components/KaizenKpiBar.tsx`

**Interfaces:**
- Consumes: `CARD_BORDER`, `TEXT_PRIMARY`, `TEXT_MUTED` from `@/lib/chartTheme` (existing, from an earlier plan); `GET /api/kaizen/kpi` (Task 1).
- Produces: `export function KaizenKpiBar()` — a client component with no props. Task 5 renders it.

- [ ] **Step 1: Create the component**

Create `src/components/KaizenKpiBar.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { CARD_BORDER, TEXT_PRIMARY, TEXT_MUTED } from "@/lib/chartTheme";

interface KaizenKpi {
  total: number;
  onProgress: number;
  finish: number;
}

export function KaizenKpiBar() {
  const [kpi, setKpi] = useState<KaizenKpi | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/kaizen/kpi")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: KaizenKpi) => setKpi(d))
      .catch(() => setFailed(true));
  }, []);

  const loading = !kpi && !failed;

  const items = [
    {
      icon: <ClipboardList size={17} />,
      value: kpi?.total,
      label: "Total Kaizen",
      iconBg: "rgba(217,226,255,0.16)",
      iconColor: "#d9e2ff",
    },
    {
      icon: <Clock size={17} />,
      value: kpi?.onProgress,
      label: "On Progress",
      iconBg: "#F59E0B",
      iconColor: "#ffffff",
    },
    {
      icon: <CheckCircle2 size={17} />,
      value: kpi?.finish,
      label: "Finish",
      iconBg: "#10B981",
      iconColor: "#ffffff",
    },
  ];

  return (
    <div
      className="font-data rounded-xl px-3 sm:px-4 pt-3 sm:pt-3.5 pb-3 sm:pb-3.5 flex flex-wrap items-stretch justify-between gap-4 sm:gap-8 mt-3"
      style={{ border: `1px solid ${CARD_BORDER}` }}
    >
      <div className="flex items-center gap-2 pl-1 sm:pl-2 w-full sm:w-auto">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: failed ? "#EB0A1E" : "#10B981",
            boxShadow: failed
              ? "0 0 0 3px rgba(235,10,30,0.18)"
              : "0 0 0 3px rgba(16,185,129,0.18)",
          }}
        />
        <span
          className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-widest"
          style={{ color: TEXT_MUTED }}
        >
          Kaizen Order Sheet · {failed ? "Offline" : "Live"}
        </span>
      </div>

      {failed ? (
        <div className="w-full sm:w-auto flex-1 flex items-center justify-center py-3 sm:py-0">
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Data Kaizen Order Sheet tidak tersedia.
          </span>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:flex sm:items-center gap-5 sm:gap-10 flex-1 sm:justify-center w-full sm:w-auto"
          aria-live="polite"
        >
          {items.map((it, i) => (
            <div key={it.label} className="flex items-center gap-2.5 sm:gap-3.5">
              {i > 0 && (
                <div
                  className="hidden sm:block w-px h-11"
                  style={{ background: CARD_BORDER }}
                />
              )}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: it.iconBg }}
              >
                <span style={{ color: it.iconColor }}>{it.icon}</span>
              </div>
              <div>
                {loading ? (
                  <div
                    className="h-[20px] sm:h-[26px] w-9 rounded animate-pulse"
                    style={{ background: "rgba(217,226,255,0.12)" }}
                  />
                ) : (
                  <div
                    className="text-[20px] sm:text-[26px] font-bold leading-none"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    {it.value}
                  </div>
                )}
                <div
                  className="text-[11px] sm:text-[12px] font-medium leading-tight mt-1"
                  style={{ color: TEXT_MUTED }}
                >
                  {it.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/components/KaizenKpiBar.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/KaizenKpiBar.tsx
git commit -m "feat: add KaizenKpiBar component"
```

---

### Task 4: Horizontal status chart component

**Files:**
- Create: `src/components/KaizenStatusChart.tsx`

**Interfaces:**
- Consumes: `CARD_BORDER`, `TEXT_PRIMARY`, `TEXT_MUTED`, `AXIS_LINE`, `GRID_LINE`, `tickStyle` from `@/lib/chartTheme`; `GET /api/kaizen/by-month` (Task 2).
- Produces: `export function KaizenStatusChart()` — a client component with no props. Task 5 renders it.

- [ ] **Step 1: Create the component**

Create `src/components/KaizenStatusChart.tsx`:

```tsx
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

const STATUSES = ["On Progress", "Tunggu Material", "Fabrikasi", "Others", "Finish"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_COLOR: Record<Status, string> = {
  "On Progress": "#F59E0B",
  "Tunggu Material": "#EAB308",
  Fabrikasi: "#3B82F6",
  Others: "#8B5CF6",
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

const ROW_H = 44;
const MIN_CHART_H = 160;
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
 * given month. Every bar in the stack carries the label machinery, but only
 * the bar for that row's topmost surviving (non-zero) status actually emits
 * the row's total — found by scanning STATUSES from the end backward, since
 * Recharts stacks bars bottom-to-top (here: start-to-end) in declaration
 * order and STATUSES is declared in that same order for every Bar.
 */
function topContributor(row: MonthRow): Status | undefined {
  for (let i = STATUSES.length - 1; i >= 0; i--) {
    const status = STATUSES[i];
    if (Number(row[status]) > 0) return status;
  }
  return undefined;
}

function totalLabelValue(row: MonthRow, status: Status): RenderableText {
  if (topContributor(row) !== status) return "";
  return row.total;
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

              {STATUSES.map((status) => (
                <Bar
                  key={status}
                  dataKey={status}
                  stackId="status"
                  name={status}
                  fill={STATUS_COLOR[status]}
                  maxBarSize={26}
                >
                  <LabelList
                    position="right"
                    formatter={hideZero}
                    style={labelStyle}
                    valueAccessor={(entry) => totalLabelValue(entry.payload as MonthRow, status)}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
```

`LabelList`'s `position="right"` is the horizontal-orientation equivalent of the `position="top"` used in `ProblemProduksiChart.tsx`'s vertical bars — verify this against `node_modules/recharts/types/component/Label.d.ts`'s position type if `tsc` or the visual result raises any doubt; do not guess past what the types confirm.

None of the 5 status strings contain a `.`, so no colon-prefixing trick (used in `ProblemProduksiChart.tsx` for `op:`/`fin:` keys) is needed here — Recharts only special-cases `.` in a `dataKey`, and spaces are not a path separator.

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors. If `LabelList`'s `formatter` or `valueAccessor` prop reports a type mismatch, inspect `node_modules/recharts/types/component/LabelList.d.ts` for the real declared type and adjust to match — do not resolve it with `any`, `as any`, `@ts-expect-error`, or `@ts-ignore`.

Run: `npx eslint src/components/KaizenStatusChart.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/KaizenStatusChart.tsx
git commit -m "feat: add KaizenStatusChart horizontal stacked-by-status chart"
```

---

### Task 5: Wire the section into the dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `DEPLOY.md`

**Interfaces:**
- Consumes: `KaizenKpiBar` (Task 3), `KaizenStatusChart` (Task 4), and the existing `DashboardAppSection`.
- Produces: the finished `/dashboard` page with all three app sections.

- [ ] **Step 1: Add the imports and section**

In `src/app/dashboard/page.tsx`, add these imports alongside the existing ones:

```tsx
import { KaizenKpiBar } from '@/components/KaizenKpiBar';
import { KaizenStatusChart } from '@/components/KaizenStatusChart';
```

Then add this block directly after the existing `Problem Produksi` `<DashboardAppSection>`, before the closing `</main>`:

```tsx
<DashboardAppSection
  name="Kaizen Order Sheet"
  blurb="Data diambil langsung dari aplikasi Kaizen Order Sheet — pencatatan kaizen dan status penyelesaiannya."
>
  <KaizenKpiBar />
  <KaizenStatusChart />
</DashboardAppSection>
```

- [ ] **Step 2: Document the new deployment variables**

In `DEPLOY.md`, find the section listing required environment variables (it already documents `DATABASE_URL`, `E_HENKATEN`, `PP_INSFORGE_URL`, `PP_INSFORGE_API_KEY`). Add these two entries alongside them, matching the surrounding formatting and language:

```markdown
- `KAIZEN_SUPABASE_URL` — **baru**, wajib ditambahkan manual. URL project Supabase milik aplikasi Kaizen Order Sheet (format `https://<ref>.supabase.co`)
- `KAIZEN_SUPABASE_ANON_KEY` — **baru**, wajib ditambahkan manual. Anon key Supabase milik aplikasi Kaizen Order Sheet — key publik yang dibatasi oleh RLS, tapi tetap hanya dibaca di server (tanpa prefix `NEXT_PUBLIC_`) mengikuti konvensi variabel lain di file ini
```

Then add this note directly below, mirroring the existing fallback notes for the other two sections:

```markdown
Tanpa kedua variabel di atas, bagian "Kaizen Order Sheet" di halaman `/dashboard` akan menampilkan status *Offline* dengan pesan data tidak tersedia (sudah ada fallback di kodenya), tidak bikin error, cuma datanya tidak muncul.
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/app/dashboard/page.tsx`
Expected: no errors.

- [ ] **Step 4: Verify the full page in a browser**

Run (background, if not already running): `npm run dev`
Then open `http://localhost:3000/dashboard` and confirm:

1. Three sections render in order: "Henkaten", "Problem Produksi", "Kaizen Order Sheet".
2. The Kaizen KPI bar shows a green dot with `Kaizen Order Sheet · Live` and three values whose on-progress plus finish equals the total.
3. The chart shows one horizontal row per populated month (currently May, Jun, Jul 2026), each a single stacked bar.
4. The legend lists all 5 statuses, including `Fabrikasi` even though it currently has zero data.
5. A total count label appears at the end of every populated row, and no row is missing its label even where the topmost-declared status (`Finish`) happens to be zero for some month.
6. Hovering a row shows a tooltip listing only the non-zero statuses for that month plus the row's total.

- [ ] **Step 5: Verify the offline fallback**

Stop the dev server. Temporarily rename `KAIZEN_SUPABASE_URL` to `KAIZEN_SUPABASE_URL_DISABLED` in `.env.local`, restart the dev server, and reload `/dashboard`.
Expected: the Kaizen Order Sheet section still renders, with a red dot reading `Kaizen Order Sheet · Offline`, the message `Data Kaizen Order Sheet tidak tersedia.`, and the chart showing `Data Kaizen Order Sheet per bulan tidak tersedia.` The other two sections are unaffected and the page does not crash.

Restore the variable name, restart, and confirm live data returns. Do not leave `.env.local` modified when done — verify the restoration actually worked (a fresh `curl http://localhost:3000/api/kaizen/kpi` should return real counts, not the zeroed fallback) before finishing this task.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/page.tsx DEPLOY.md
git commit -m "feat: add Kaizen Order Sheet section to dashboard"
```

---

## Self-Review Notes

**Spec coverage.** Data source and connection method (§ Data Source, § Connection method) → Task 1. KPI semantics (§ Decisions #2, KPI route) → Task 1. Monthly aggregation, populated-months-only, fixed status order (§ Monthly API route) → Task 2. KPI component (§ Component 4) → Task 3. Chart orientation, colors, stack-label fix, dynamic height (§ Component 5) → Task 4. Dashboard composition and deployment docs (§ Components 6, § Deployment) → Task 5. Error handling contract is threaded through every route/component (Tasks 1, 2, 3, 4). Testing steps mirror the spec's Testing section throughout.

**Placeholder scan.** No TBD/TODO markers; every code step contains complete literal code. The one conditional instruction (Task 4's `LabelList` position/type verification) names the exact file to check and forbids `any`/`@ts-expect-error`, matching how the equivalent risk was handled in the Problem Produksi plan.

**Type consistency.** `KaizenKpi { total, onProgress, finish }` in Task 3 matches the KPI route's response in Task 1. `MonthRow` and `ByMonthResponse` in Task 4 match the `{ statuses, data: monthly }` payload built in Task 2 exactly, including the literal status-string keys (`"On Progress"`, `"Tunggu Material"`, `Fabrikasi`, `Others`, `Finish`) with no colon-prefix transformation, since none of these strings contain a `.`. `STATUSES` is declared identically (same 5 values, same order) in both Task 2 and Task 4 — this is the source of truth for stack order, legend order, and color assignment, and any mismatch between the two declarations would be a real bug; both were copied from the same spec table to guarantee this. All new components use named exports, matching the existing `HenkatenKpiBar`/`ProblemProduksiKpiBar` convention.
