# Dashboard e-Henkaten KPI + Per-Line Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the dormant "Dashboard" sidebar link to a new `/dashboard` page that shows the existing e-Henkaten KPI bar plus a new bar chart of total henkaten records per production line.

**Architecture:** A new API route groups `henkaten_records` by `line_name` using the existing read-only `henkatenSql` connection; a new client component fetches that route and renders a hand-rolled vertical column chart matching the visual style of the existing `HenkatenKpiBar`; a new `/dashboard` page composes the existing KPI bar and the new chart; the Sidebar's `Dashboard` nav entry gets a real `href`.

**Tech Stack:** Next.js (App Router), React client components, `postgres` (via existing `henkatenSql`), Tailwind CSS, `lucide-react` icons. No new dependencies.

## Global Constraints

- No new npm dependencies — no charting library. Charts are hand-rolled SVG/CSS, matching `PortalStats.tsx`'s existing `BarChart`/`LineChart` pattern.
- Do not modify `src/app/api/henkaten-kpi/route.ts` or `src/components/HenkatenKpiBar.tsx` — reused as-is.
- Data source is `henkaten_records.line_name` (confirmed live column) on the external e-Henkaten DB via the existing `henkatenSql` export from `src/db/henkaten.ts`. Do not add a new DB connection.
- Failure mode must match the existing KPI bar: on fetch/query failure, the section silently disappears (`return null`) — no error banner, no thrown exception reaching the user.
- No automated test suite exists in this project (no Jest/Vitest/Playwright config). Verification is manual: `tsc --noEmit`, `eslint`, and a live dev-server check via curl/browser.

---

### Task 1: Per-line totals API route

**Files:**
- Create: `src/app/api/henkaten-kpi/by-line/route.ts`

**Interfaces:**
- Consumes: `henkatenSql` from `@/db/henkaten` (existing export, no changes — a tagged-template Postgres client).
- Produces: `GET /api/henkaten-kpi/by-line` returning JSON `{ line_name: string; total: number }[]`, sorted by `total` descending, `Cache-Control: no-store`. On error, returns `[]` with HTTP 500.

- [ ] **Step 1: Write the route**

```ts
import { NextResponse } from 'next/server';
import { henkatenSql } from '@/db/henkaten';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await henkatenSql`
      SELECT line_name, COUNT(*)::int AS total
      FROM henkaten_records
      GROUP BY line_name
      ORDER BY total DESC
    `;
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[GET /api/henkaten-kpi/by-line]', err);
    return NextResponse.json([], { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/app/api/henkaten-kpi/by-line/route.ts`

- [ ] **Step 3: Start the dev server and verify the endpoint live**

Run (background): `npm run dev`
Then: `curl -s http://localhost:3000/api/henkaten-kpi/by-line`
Expected: a JSON array like `[{"line_name":"Mould-RCS","total":12}, ...]` (exact numbers depend on current live data), sorted with the largest `total` first.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/henkaten-kpi/by-line/route.ts
git commit -m "feat: add per-line henkaten totals API route"
```

---

### Task 2: HenkatenLineChart component

**Files:**
- Create: `src/components/HenkatenLineChart.tsx`

**Interfaces:**
- Consumes: `GET /api/henkaten-kpi/by-line` (Task 1) — `{ line_name: string; total: number }[]`.
- Produces: `export function HenkatenLineChart()` — a self-contained client component with no props, rendering `null` on fetch failure. Consumed by Task 3.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

interface LineTotal {
  line_name: string;
  total: number;
}

export function HenkatenLineChart() {
  const [data, setData] = useState<LineTotal[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/henkaten-kpi/by-line")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: LineTotal[]) => setData(d))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  const max = data && data.length ? Math.max(...data.map((d) => d.total), 1) : 1;
  const COL_H = 120;

  return (
    <div
      className="rounded-xl p-3 sm:p-4 mt-3"
      style={{
        background: "rgba(10,21,46,0.85)",
        border: "1px solid #2f3952",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center gap-2 pl-1 sm:pl-2 mb-4">
        <BarChart3 size={14} style={{ color: "rgba(217,226,255,0.4)" }} />
        <span
          className="font-mono-label text-[9px] sm:text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(217,226,255,0.4)" }}
        >
          Henkaten per Line
        </span>
      </div>

      {!data ? (
        <div className="h-[120px] flex items-center justify-center">
          <span className="text-[12px]" style={{ color: "rgba(217,226,255,0.3)" }}>
            —
          </span>
        </div>
      ) : data.length === 0 ? (
        <div className="h-[120px] flex items-center justify-center">
          <span className="text-[12px]" style={{ color: "rgba(217,226,255,0.3)" }}>
            Belum ada data.
          </span>
        </div>
      ) : (
        <div
          className="flex items-end justify-center gap-6 sm:gap-10 px-2"
          style={{ height: COL_H + 40 }}
        >
          {data.map((d) => {
            const barH = Math.max(6, Math.round((d.total / max) * COL_H));
            return (
              <div key={d.line_name} className="flex flex-col items-center gap-2 w-16">
                <span className="font-display text-[14px] font-bold text-white leading-none">
                  {d.total}
                </span>
                <div
                  className="w-8 sm:w-10 rounded-t-md"
                  style={{ height: barH, background: "#EB0A1E" }}
                />
                <span
                  className="text-[9px] sm:text-[10px] font-mono-label text-center leading-tight"
                  style={{ color: "rgba(217,226,255,0.45)" }}
                >
                  {d.line_name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/components/HenkatenLineChart.tsx`

Run: `npx eslint src/components/HenkatenLineChart.tsx`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/HenkatenLineChart.tsx
git commit -m "feat: add HenkatenLineChart component"
```

---

### Task 3: Dashboard page + Sidebar wiring

**Files:**
- Create: `src/app/dashboard/page.tsx`
- Modify: `src/components/Sidebar.tsx:44`

**Interfaces:**
- Consumes: `HenkatenKpiBar` (existing, `@/components/HenkatenKpiBar`), `HenkatenLineChart` (Task 2, `@/components/HenkatenLineChart`).
- Produces: route `/dashboard`; `Sidebar`'s `Dashboard` nav item becomes an active link instead of a disabled placeholder.

- [ ] **Step 1: Wire the Sidebar nav item**

In `src/components/Sidebar.tsx`, change line 44 from:

```tsx
    { label: 'Dashboard',    icon: <LayoutDashboard size={18} /> },
```

to:

```tsx
    { label: 'Dashboard',    icon: <LayoutDashboard size={18} />, href: '/dashboard' },
```

- [ ] **Step 2: Create the Dashboard page**

```tsx
'use client';

import { HenkatenKpiBar } from '@/components/HenkatenKpiBar';
import { HenkatenLineChart } from '@/components/HenkatenLineChart';

export default function DashboardPage() {
  return (
    <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 py-8 sm:py-10">
      <div className="mb-8">
        <h1 className="font-display text-[22px] sm:text-[26px] font-bold" style={{ color: '#d9e2ff' }}>
          Dashboard
        </h1>
        <p className="text-[12.5px] mt-1" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Ringkasan data live dari aplikasi e-Henkaten.
        </p>
      </div>

      <HenkatenKpiBar />
      <HenkatenLineChart />
    </main>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npx eslint src/app/dashboard/page.tsx src/components/Sidebar.tsx`
Expected: no errors

- [ ] **Step 4: Manual browser verification**

Run (background, if not already running): `npm run dev`
Then, in a browser (or via the project's browser-preview tooling):
1. Load `http://localhost:3000/` and confirm the `Dashboard` sidebar item is now a clickable link (no longer greyed out with "Segera hadir").
2. Click it, confirm the URL becomes `/dashboard`.
3. Confirm the KPI bar renders with the same Total/High/Medium/Low values as the home page.
4. Confirm the bar chart renders one column per line (`Mould-RCS`, `Mel-Pour-Analys`, `Finishing`, `Core Making` as of the last live check), tallest bar first by visual proportion, with the count above each bar and the line name below it.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx src/components/Sidebar.tsx
git commit -m "feat: add /dashboard page with e-Henkaten KPI bar and per-line chart"
```

---

## Self-Review Notes

- **Spec coverage:** Sidebar wiring (Task 3 Step 1), Dashboard page (Task 3 Step 2), API route (Task 1), chart component (Task 2), error/failure semantics (Task 2's `failed` state mirrors `HenkatenKpiBar`'s), no new dependencies (confirmed — only existing `henkatenSql`, `NextResponse`, React, `lucide-react` are used) — all spec sections are covered.
- **Placeholder scan:** No TBDs; all steps contain literal code.
- **Type consistency:** `LineTotal { line_name: string; total: number }` in Task 2 matches the API route's `SELECT line_name, COUNT(*)::int AS total` column aliases exactly (Task 1). `HenkatenKpiBar` and `HenkatenLineChart` are both imported by name with no default-export mismatch (both existing/new files use named exports, matching `HenkatenKpiBar`'s existing `export function HenkatenKpiBar()` convention).
