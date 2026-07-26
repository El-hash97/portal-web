# Dashboard Problem Produksi Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Problem Produksi" section to `/dashboard` with a KPI bar and a monthly chart whose bars are stacked by production line, sourced live from the Problem Produksi app's InsForge backend.

**Architecture:** A shared chart-theme module is extracted first so both dashboard charts draw their colors from one place and color each production line identically. Two server-side API routes read the `problems` table through an InsForge admin client and do all aggregation, keeping the two new client components purely presentational. The dashboard page composes them inside the existing `DashboardAppSection` wrapper.

**Tech Stack:** Next.js 16 App Router, React 19 client components, Recharts 3.10 (already installed), `@insforge/sdk` (added in Task 2), Tailwind CSS, `lucide-react` icons.

## Global Constraints

- Source data is the `problems` table on the Problem Produksi InsForge backend. Read **only** the `date`, `line`, and `status` columns. Never select or return `problem`, `penemuProblem`, `picPerbaikan`, `namaMesin`, or `keterangan` — those are free text and person names.
- Env vars are `PP_INSFORGE_URL` and `PP_INSFORGE_API_KEY`, already present in `.env.local`. They must **never** gain a `NEXT_PUBLIC_` prefix and must only be read inside server-side route handlers.
- `status` has exactly two values: `"On progress"` (lowercase `p`) and `"Finish"`. Bucketing rule, copied from the source app: `status === "On progress"` counts as on-progress, **every other value** counts as finish.
- Month bucketing must use string slicing on the ISO date (`row.date.slice(0, 7)`), never `new Date(...).getMonth()`, which would shift rows across month boundaries in non-UTC server zones.
- Indonesian month abbreviations, exactly: `["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]`.
- Recharts `dataKey` treats `.` as a nested-path separator. Line-series keys use a colon prefix (`op:Mould-RCS`, `fin:Mould-RCS`). Never use a dot.
- Failure semantics match the existing Henkaten integration: route logs the error and returns a safe empty payload with HTTP 500; the component catches the non-OK response and renders an inline unavailable message. Nothing throws into the React tree.
- Shared chrome colors — card border, primary/muted text, axis, grid, and the per-line palette — must be imported from `src/lib/chartTheme.ts` (Task 1), never re-declared in a new component. Colors that carry meaning local to one component (status colors such as amber `#F59E0B` for On Progress and emerald `#10B981` for Finish, the tooltip background `#0a152e`, hover and skeleton fills) stay as literals in the component that owns them. `src/components/HenkatenKpiBar.tsx` still holds its own copies of three chrome constants; it is out of scope for this plan and must not be modified.
- No automated test suite exists in this project (no Jest/Vitest/Playwright config) and none is added. Verification is `npx tsc --noEmit`, `npx eslint`, `curl` against a running dev server, and a browser check.

---

### Task 1: Shared chart theme module

**Files:**
- Create: `src/lib/chartTheme.ts`
- Modify: `src/components/HenkatenByLineChart.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `src/lib/chartTheme.ts` exporting the constants `CARD_BORDER`, `TEXT_PRIMARY`, `TEXT_MUTED`, `AXIS_LINE`, `GRID_LINE`, the object `tickStyle`, and the function `lineColor(name: string): string`. Every later task imports from here.

- [ ] **Step 1: Create the theme module**

Create `src/lib/chartTheme.ts`:

```ts
/** Shared visual language for every dashboard chart and KPI card. */

export const CARD_BORDER = "#2f3952";
export const TEXT_PRIMARY = "#f5f7ff";
export const TEXT_MUTED = "rgba(217,226,255,0.55)";
export const AXIS_LINE = "rgba(217,226,255,0.35)";
export const GRID_LINE = "rgba(217,226,255,0.10)";

export const tickStyle = {
  fill: TEXT_MUTED,
  fontSize: 11,
  fontFamily: "var(--font-data)",
};

/**
 * Fixed colors per production line so the same line reads the same in
 * every chart on the dashboard. Keyed by the exact `line` / `line_name`
 * values stored by the source applications.
 */
const LINE_COLORS: Record<string, string> = {
  "Mould-RCS": "#EB0A1E",
  "Core Making": "#F59E0B",
  Finishing: "#3B82F6",
  "Die Press": "#10B981",
  "Mel-Pour-Analys": "#8B5CF6",
};

const FALLBACK_COLORS = ["#EC4899", "#0EA5E9", "#F97316"];

/** Stable color for a line name, including ones not yet in LINE_COLORS. */
export function lineColor(name: string): string {
  const known = LINE_COLORS[name];
  if (known) return known;

  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}
```

- [ ] **Step 2: Point HenkatenByLineChart at the module**

In `src/components/HenkatenByLineChart.tsx`, add this import directly below the existing `recharts` import block:

```tsx
import {
  CARD_BORDER,
  TEXT_PRIMARY,
  TEXT_MUTED,
  AXIS_LINE,
  GRID_LINE,
  tickStyle,
  lineColor,
} from "@/lib/chartTheme";
```

Then delete these now-duplicated local declarations from that file, keeping `CHART_H` and `SKELETON_RATIOS`:

```tsx
const CARD_BORDER = "#2f3952";
const TEXT_PRIMARY = "#f5f7ff";
const TEXT_MUTED = "rgba(217,226,255,0.55)";
const AXIS_LINE = "rgba(217,226,255,0.35)";
const GRID_LINE = "rgba(217,226,255,0.10)";

const BAR_COLORS = [
  "#EB0A1E",
  "#F59E0B",
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
  "#EC4899",
  "#0EA5E9",
  "#F97316",
];

const tickStyle = {
  fill: TEXT_MUTED,
  fontSize: 11,
  fontFamily: "var(--font-data)",
};
```

- [ ] **Step 3: Switch the cell fill from index-based to name-based**

Still in `src/components/HenkatenByLineChart.tsx`, replace this block:

```tsx
                {data.map((d, i) => (
                  <Cell key={d.line_name} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
```

with:

```tsx
                {data.map((d) => (
                  <Cell key={d.line_name} fill={lineColor(d.line_name)} />
                ))}
```

The `i` parameter is dropped because it is no longer used; leaving it would trip the unused-variable lint rule.

- [ ] **Step 4: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/lib/chartTheme.ts src/components/HenkatenByLineChart.tsx`
Expected: no errors, no unused-variable warnings.

- [ ] **Step 5: Verify the Henkaten chart still renders**

Run (background): `npm run dev`
Then open `http://localhost:3000/dashboard` in a browser.
Expected: the Henkaten section renders exactly as before — four bars, axis lines, grid, labels above each bar. Colors are now assigned by line name, so confirm `Mould-RCS` is red (`#EB0A1E`) and `Core Making` is amber (`#F59E0B`).

- [ ] **Step 6: Commit**

```bash
git add src/lib/chartTheme.ts src/components/HenkatenByLineChart.tsx
git commit -m "refactor: extract shared chart theme with per-line colors"
```

---

### Task 2: InsForge client and KPI API route

**Files:**
- Modify: `package.json` (adds `@insforge/sdk`)
- Create: `src/db/problemProduksi.ts`
- Create: `src/app/api/problem-produksi/kpi/route.ts`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `problemProduksi` — an InsForge admin client exported from `@/db/problemProduksi`, used by Task 3 as well. And `GET /api/problem-produksi/kpi` returning `{ total: number; onProgress: number; finish: number }`.

- [ ] **Step 1: Install the SDK**

Run: `npm install @insforge/sdk@latest`
Expected: `@insforge/sdk` appears under `dependencies` in `package.json`.

- [ ] **Step 2: Create the client module**

Create `src/db/problemProduksi.ts`:

```ts
import { createAdminClient } from '@insforge/sdk';

// Separate InsForge backend owned by the Problem Produksi app —
// read-only use for surfacing its live KPIs on the portal dashboard.
// Server-side only: these env vars carry no NEXT_PUBLIC_ prefix and must
// never be read from a client component.
export const problemProduksi = createAdminClient({
  baseUrl: process.env.PP_INSFORGE_URL ?? '',
  apiKey: process.env.PP_INSFORGE_API_KEY ?? '',
});
```

- [ ] **Step 3: Create the KPI route**

Create `src/app/api/problem-produksi/kpi/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { problemProduksi } from '@/db/problemProduksi';

export const dynamic = 'force-dynamic';

const EMPTY = { total: 0, onProgress: 0, finish: 0 };

export async function GET() {
  try {
    const { data, error } = await problemProduksi.database
      .from('problems')
      .select('status');

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as { status: string }[];
    const onProgress = rows.filter((r) => r.status === 'On progress').length;
    const finish = rows.filter((r) => r.status === 'Finish').length;

    return NextResponse.json(
      { total: rows.length, onProgress, finish },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[GET /api/problem-produksi/kpi]', err);
    return NextResponse.json(EMPTY, { status: 500 });
  }
}
```

- [ ] **Step 4: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/db/problemProduksi.ts src/app/api/problem-produksi/kpi/route.ts`
Expected: no errors.

- [ ] **Step 5: Verify against the live backend**

Run (background, if not already running): `npm run dev`
Then: `curl -s http://localhost:3000/api/problem-produksi/kpi`
Expected: JSON with three numeric fields, e.g. `{"total":90,"onProgress":23,"finish":67}`. The exact numbers track live data, so the real check is that `onProgress + finish === total` and that the values match the Problem Produksi app's own dashboard.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/db/problemProduksi.ts src/app/api/problem-produksi/kpi/route.ts
git commit -m "feat: add Problem Produksi InsForge client and KPI route"
```

---

### Task 3: Monthly aggregation API route

**Files:**
- Create: `src/app/api/problem-produksi/by-month/route.ts`

**Interfaces:**
- Consumes: `problemProduksi` from `@/db/problemProduksi` (Task 2).
- Produces: `GET /api/problem-produksi/by-month` returning
  `{ lines: string[]; data: Array<{ month: string; opTotal: number; finTotal: number; [seriesKey: string]: string | number }> }`,
  where `lines` is ordered by descending total and every month object carries an `op:<line>` and `fin:<line>` key for every entry in `lines`. Task 5 consumes this shape.

- [ ] **Step 1: Create the route**

Create `src/app/api/problem-produksi/by-month/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { problemProduksi } from '@/db/problemProduksi';

export const dynamic = 'force-dynamic';

const MONTHS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

const UNKNOWN_LINE = 'Tidak diketahui';

interface ProblemRow {
  date: string;
  line: string;
  status: string;
}

export async function GET() {
  try {
    const { data, error } = await problemProduksi.database
      .from('problems')
      .select('date, line, status');

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as ProblemRow[];
    const currentYear = String(new Date().getFullYear());

    // Line totals drive the legend order; buckets hold the month x line counts.
    const lineTotals = new Map<string, number>();
    const buckets = new Map<string, { op: number; fin: number }>();

    for (const row of rows) {
      // Slice the ISO string rather than parsing a Date: parsing would apply
      // the server's local offset and could move a record into another month.
      if (typeof row.date !== 'string' || row.date.slice(0, 4) !== currentYear) continue;

      const monthIndex = Number(row.date.slice(5, 7)) - 1;
      if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) continue;

      const line = row.line || UNKNOWN_LINE;
      lineTotals.set(line, (lineTotals.get(line) ?? 0) + 1);

      const key = `${monthIndex}|${line}`;
      const bucket = buckets.get(key) ?? { op: 0, fin: 0 };
      if (row.status === 'On progress') bucket.op++;
      else bucket.fin++;
      buckets.set(key, bucket);
    }

    const lines = [...lineTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([line]) => line);

    const monthly = MONTHS_ID.map((month, monthIndex) => {
      const entry: Record<string, string | number> = { month };
      let opTotal = 0;
      let finTotal = 0;

      for (const line of lines) {
        const bucket = buckets.get(`${monthIndex}|${line}`) ?? { op: 0, fin: 0 };
        entry[`op:${line}`] = bucket.op;
        entry[`fin:${line}`] = bucket.fin;
        opTotal += bucket.op;
        finTotal += bucket.fin;
      }

      entry.opTotal = opTotal;
      entry.finTotal = finTotal;
      return entry;
    });

    return NextResponse.json(
      { lines, data: monthly },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('[GET /api/problem-produksi/by-month]', err);
    return NextResponse.json({ lines: [], data: [] }, { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/app/api/problem-produksi/by-month/route.ts`
Expected: no errors.

- [ ] **Step 3: Verify against the live backend**

Run (background, if not already running): `npm run dev`
Then: `curl -s http://localhost:3000/api/problem-produksi/by-month`
Expected, against current live data:
- `lines` is an array of five strings, `Mould-RCS` first (highest total).
- `data` has exactly 12 entries, `month` running `Jan` through `Des`.
- The `Jun` and `Jul` entries have non-zero `opTotal` / `finTotal`; the other ten months are all zero.
- Each entry has an `op:<line>` and `fin:<line>` key for all five lines.

Cross-check the totals sum correctly:

```bash
curl -s http://localhost:3000/api/problem-produksi/by-month | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const r=JSON.parse(s);console.log('months:',r.data.length,'lines:',r.lines.length,'sum:',r.data.reduce((a,m)=>a+m.opTotal+m.finTotal,0))})"
```

Expected: `months: 12`, `lines: 5`, and a `sum` equal to the number of records in the current year.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/problem-produksi/by-month/route.ts
git commit -m "feat: add Problem Produksi monthly per-line aggregation route"
```

---

### Task 4: KPI bar component

**Files:**
- Create: `src/components/ProblemProduksiKpiBar.tsx`

**Interfaces:**
- Consumes: `CARD_BORDER`, `TEXT_PRIMARY`, `TEXT_MUTED` from `@/lib/chartTheme` (Task 1); `GET /api/problem-produksi/kpi` (Task 2).
- Produces: `export function ProblemProduksiKpiBar()` — a client component with no props. Task 6 renders it.

- [ ] **Step 1: Create the component**

Create `src/components/ProblemProduksiKpiBar.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { FileBarChart, Clock, CheckCircle2 } from "lucide-react";
import { CARD_BORDER, TEXT_PRIMARY, TEXT_MUTED } from "@/lib/chartTheme";

interface ProblemKpi {
  total: number;
  onProgress: number;
  finish: number;
}

export function ProblemProduksiKpiBar() {
  const [kpi, setKpi] = useState<ProblemKpi | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/problem-produksi/kpi")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: ProblemKpi) => setKpi(d))
      .catch(() => setFailed(true));
  }, []);

  const loading = !kpi && !failed;

  const items = [
    {
      icon: <FileBarChart size={17} />,
      value: kpi?.total,
      label: "Total Problem",
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
          Problem Produksi · {failed ? "Offline" : "Live"}
        </span>
      </div>

      {failed ? (
        <div className="w-full sm:w-auto flex-1 flex items-center justify-center py-3 sm:py-0">
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Data Problem Produksi tidak tersedia.
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

Run: `npx eslint src/components/ProblemProduksiKpiBar.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProblemProduksiKpiBar.tsx
git commit -m "feat: add ProblemProduksiKpiBar component"
```

---

### Task 5: Monthly chart component

**Files:**
- Create: `src/components/ProblemProduksiChart.tsx`

**Interfaces:**
- Consumes: `CARD_BORDER`, `TEXT_PRIMARY`, `TEXT_MUTED`, `AXIS_LINE`, `GRID_LINE`, `tickStyle`, `lineColor` from `@/lib/chartTheme` (Task 1); `GET /api/problem-produksi/by-month` (Task 3).
- Produces: `export function ProblemProduksiChart()` — a client component with no props. Task 6 renders it.

- [ ] **Step 1: Create the component**

Create `src/components/ProblemProduksiChart.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
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
const hideZero = (value: ReactNode) => (Number(value) > 0 ? value : "");

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

  // The last line sits at the cumulative top of each stack, so its Bar is the
  // one that carries the stack-total label.
  const topLine = lines[lines.length - 1];

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
                    {line === topLine && (
                      <LabelList
                        dataKey="opTotal"
                        position="top"
                        formatter={hideZero}
                        style={labelStyle}
                      />
                    )}
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
                    {line === topLine && (
                      <LabelList
                        dataKey="finTotal"
                        position="top"
                        formatter={hideZero}
                        style={labelStyle}
                      />
                    )}
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
```

All `op:` bars are declared before all `fin:` bars. Recharts groups bars by `stackId` in order of first appearance, so this renders the On Progress stack on the left and the Finish stack on the right within each month.

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

If the `LabelList` `formatter` prop reports a type mismatch, the Recharts version in use expects a different signature — inspect `node_modules/recharts/types/component/LabelList.d.ts` for the declared `formatter` type and adjust `hideZero`'s parameter type to match. Do not silence it with `any` or `@ts-expect-error`.

Run: `npx eslint src/components/ProblemProduksiChart.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ProblemProduksiChart.tsx
git commit -m "feat: add ProblemProduksiChart monthly stacked-by-line chart"
```

---

### Task 6: Wire the section into the dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `DEPLOY.md`

**Interfaces:**
- Consumes: `ProblemProduksiKpiBar` (Task 4), `ProblemProduksiChart` (Task 5), and the existing `DashboardAppSection`.
- Produces: the finished `/dashboard` page with both app sections.

- [ ] **Step 1: Replace the dashboard page**

Replace the full contents of `src/app/dashboard/page.tsx` with:

```tsx
'use client';

import { DashboardAppSection } from '@/components/DashboardAppSection';
import { HenkatenKpiBar } from '@/components/HenkatenKpiBar';
import { HenkatenByLineChart } from '@/components/HenkatenByLineChart';
import { ProblemProduksiKpiBar } from '@/components/ProblemProduksiKpiBar';
import { ProblemProduksiChart } from '@/components/ProblemProduksiChart';

export default function DashboardPage() {
  return (
    <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-[22px] sm:text-[26px] font-bold" style={{ color: '#d9e2ff' }}>
          Dashboard
        </h1>
        <p className="text-[12.5px] mt-1" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Ringkasan data live dari tiap aplikasi.
        </p>
      </div>

      <DashboardAppSection
        name="Henkaten"
        blurb="Data diambil langsung dari aplikasi e-Henkaten — Change Point Management."
      >
        <HenkatenKpiBar />
        <HenkatenByLineChart />
      </DashboardAppSection>

      <DashboardAppSection
        name="Problem Produksi"
        blurb="Data diambil langsung dari aplikasi Problem Produksi — monitoring problem yang menghambat produksi."
      >
        <ProblemProduksiKpiBar />
        <ProblemProduksiChart />
      </DashboardAppSection>
    </main>
  );
}
```

- [ ] **Step 2: Document the new deployment variables**

In `DEPLOY.md`, find the section listing required environment variables (it currently describes `DATABASE_URL` and `E_HENKATEN`). Add these two entries alongside them, matching the surrounding formatting and language:

```markdown
- `PP_INSFORGE_URL` — **baru**, wajib ditambahkan manual. URL backend InsForge milik aplikasi Problem Produksi (format `https://<appkey>.<region>.insforge.app`)
- `PP_INSFORGE_API_KEY` — **baru**, wajib ditambahkan manual. Admin API key InsForge milik aplikasi Problem Produksi. Hanya dibaca di server (tanpa prefix `NEXT_PUBLIC_`), jadi tidak ikut ter-bundle ke browser
```

Then add this note directly below, mirroring the existing `E_HENKATEN` fallback note:

```markdown
Tanpa kedua variabel di atas, bagian "Problem Produksi" di halaman `/dashboard` akan menampilkan status *Offline* dengan pesan data tidak tersedia (sudah ada fallback di kodenya), tidak bikin error, cuma datanya tidak muncul.
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/app/dashboard/page.tsx`
Expected: no errors.

- [ ] **Step 4: Verify the full page in a browser**

Run (background, if not already running): `npm run dev`
Then open `http://localhost:3000/dashboard` and confirm:

1. Two sections render: "Henkaten" then "Problem Produksi".
2. The Problem Produksi KPI bar shows a green dot with `Problem Produksi · Live` and three values whose on-progress plus finish equals the total.
3. The chart shows twelve month ticks `Jan`–`Des`, with two stacked bars side by side in `Jun` and `Jul` and nothing in the empty months.
4. The legend lists five line names, each with its color square.
5. Stack totals appear above the `Jun` and `Jul` bars, and no `0` labels appear over empty months.
6. The caption `kiri: On Progress · kanan: Finish` sits below the chart.
7. Hovering a populated month shows a tooltip with the month name, an On Progress block, and a Finish block, each listing only non-zero lines.
8. `Mould-RCS` is the same red in both the Henkaten chart and the Problem Produksi legend.

- [ ] **Step 5: Verify the offline fallback**

Stop the dev server. Temporarily rename `PP_INSFORGE_URL` to `PP_INSFORGE_URL_DISABLED` in `.env.local`, restart the dev server, and reload `/dashboard`.
Expected: the Problem Produksi section still renders, with a red dot reading `Problem Produksi · Offline`, the message `Data Problem Produksi tidak tersedia.`, and the chart showing `Data Problem Produksi per bulan tidak tersedia.` The Henkaten section is unaffected and the page does not crash.

Restore the variable name, restart, and confirm live data returns.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/page.tsx DEPLOY.md
git commit -m "feat: add Problem Produksi section to dashboard"
```

---

## Self-Review Notes

**Spec coverage.** Every spec section maps to a task: shared chart theme §1 → Task 1; InsForge client §2 → Task 2; KPI route §3 → Task 2; monthly route §4 → Task 3; KPI component §5 → Task 4; chart component §6 → Task 5; dashboard page §7 → Task 6; Error Handling → the try/catch plus 500 fallback in Tasks 2 and 3 and the `failed` state in Tasks 4 and 5, exercised by Task 6 Step 5; Security Considerations → the server-only comment in Task 2 Step 2 and the `NEXT_PUBLIC_` prohibition in Global Constraints; Deployment → Task 6 Step 2; Testing → the verification steps throughout.

**Placeholder scan.** No TBD/TODO markers; every code step contains complete literal code. The one conditional instruction (Task 5 Step 2's Recharts `formatter` fallback) names the exact file to inspect and forbids `any`/`@ts-expect-error`, rather than leaving the resolution vague.

**Type consistency.** `ProblemKpi { total, onProgress, finish }` in Task 4 matches the KPI route's response in Task 2. `MonthRow { month, opTotal, finTotal, [seriesKey] }` and `ByMonthResponse { lines, data }` in Task 5 match the `{ lines, data: monthly }` payload built in Task 3, including the `op:`/`fin:` key prefixes. `lineColor(name: string): string` is defined once in Task 1 and called with a `string` in Tasks 1 and 5. All components use named exports, matching the existing `HenkatenKpiBar` convention and the import statements in Task 6.
