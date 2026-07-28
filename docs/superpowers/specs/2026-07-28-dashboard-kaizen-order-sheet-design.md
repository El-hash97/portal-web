# Dashboard: Kaizen Order Sheet KPI + Monthly Status Breakdown

## Purpose

The `/dashboard` page has two live app sections so far (Henkaten, Problem Produksi). This project adds a third: "Kaizen Order Sheet", pulling live data from that app's Supabase backend to show a KPI summary plus a monthly breakdown of kaizen entries by status.

## Data Source

The Kaizen Order Sheet app runs on **Supabase** (Postgres). Project identified and schema verified directly against the live database via the Supabase MCP connection the user set up for this session:

- **Project:** `kaizen-order-sheet` (ref `tbvodyqlbsmkfifpmfzc`), region `ap-southeast-2`.
- **Table:** `kaizen_entries`, 95 rows at time of writing, RLS enabled with policy `public_all` (`USING (true) WITH CHECK (true)`) — full anonymous read access.
- **Columns used:** `date` (`text`, format `YYYY-MM-DD`, e.g. `"2026-05-08"` — no time component, no timezone conversion needed) and `status` (`text`, `CHECK (status = ANY (ARRAY['On Progress','Fabrikasi','Tunggu Material','Finish','Others']))`).
- **Live status counts:** Finish 53, On Progress 20, Tunggu Material 15, Others 7, Fabrikasi 0. The DB-level CHECK constraint (verified live) already includes all 5 values, though the `Fabrikasi` value has no rows yet — the UI must not assume all 5 always have data.
- Not read: `id, timestamp, name, line, category, kaizen_name, area, photo_before, photo_after, keterangan, created_at, updated_at` — free text, person names, and photo references are never fetched into the portal.

### Connection method — deviates from the Henkaten precedent

Henkaten and (originally planned) Kaizen both use Supabase, and Henkaten's connection (`src/db/henkaten.ts`) is a direct Postgres connection string via the `postgres` package — no SDK dependency. That approach needs the database password, which **Supabase's management API does not expose after creation** (only resettable, which is a destructive, out-of-scope action for this project). Since the user connected this session to Supabase via MCP rather than handing over a password, the only credentials retrievable are the project URL and the anon/publishable key — the same public, RLS-constrained credential the Kaizen app's own frontend already ships to browsers.

This project therefore uses `@supabase/supabase-js` (new dependency, mirroring the Problem Produksi section's acceptance of `@insforge/sdk` for the same reason: the natural credential for that backend wasn't a raw connection string). Env vars, already added to `.env.local`:

- `KAIZEN_SUPABASE_URL` = `https://tbvodyqlbsmkfifpmfzc.supabase.co`
- `KAIZEN_SUPABASE_ANON_KEY` = the project's anon key

Both are read server-side only (no `NEXT_PUBLIC_` prefix), inside API route handlers, matching the existing server-only pattern even though this specific key is designed to be public.

## Scope

- Add a "Kaizen Order Sheet" section to `/dashboard`: a KPI bar and a horizontal stacked bar chart.
- Out of scope: filters, date-range pickers, drill-down, a records table, any write operation, and any change to the Kaizen Order Sheet app itself.

## Decisions from clarification

Two points were ambiguous from the initial request and were resolved directly with the user:

1. **The literal `On Progress` status is its own chart category**, not folded into `Others`. The chart therefore has 5 stacked colors per month: `On Progress`, `Tunggu Material`, `Fabrikasi`, `Others`, `Finish` — nothing from the table is excluded from the visual breakdown.
2. **The chart includes `Finish` rows**, not just unfinished ones. It shows total kaizen entries per month, broken down by status.

## Architecture

```
DashboardAppSection name="Kaizen Order Sheet"
  ├── <KaizenKpiBar />          → GET /api/kaizen/kpi
  └── <KaizenStatusChart />     → GET /api/kaizen/by-month
                                       └── src/db/kaizen.ts
                                             └── createClient (@supabase/supabase-js)
```

Aggregation happens server-side in the API routes, keeping both components presentational — same division of labor as the other two sections.

## Components

### 1. Supabase client — `src/db/kaizen.ts` (new)

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

### 2. KPI API route — `src/app/api/kaizen/kpi/route.ts` (new)

`export const dynamic = 'force-dynamic'`. Selects only `status` from `kaizen_entries`, counts in JS, returns:

```ts
{ total: number; onProgress: number; finish: number }
```

`total` counts every row. `finish` counts `status === 'Finish'`. `onProgress` counts every row where `status !== 'Finish'` (i.e. `On Progress` + `Tunggu Material` + `Fabrikasi` + `Others` combined) — matching how the other two KPI bars define their "on progress" total as everything not yet finished, and consistent with decision #2 above (the chart's status split and the KPI's on-progress total must agree: `onProgress` in the KPI equals the sum of the four non-Finish chart segments for a given period, though the KPI is all-time while the chart is year-scoped — same relationship as the Problem Produksi section).

Response carries `Cache-Control: no-store`. On any error (including a missing env var, or a Supabase client error), logs `[GET /api/kaizen/kpi]` and returns `{ total: 0, onProgress: 0, finish: 0 }` with HTTP 500.

### 3. Monthly API route — `src/app/api/kaizen/by-month/route.ts` (new)

`export const dynamic = 'force-dynamic'`. Selects `date, status` from `kaizen_entries`, filters to the current calendar year, and buckets by month and status.

**Month derivation is string-based:** `date` is already `YYYY-MM-DD` with no time component, so the month key is `row.date.slice(5, 7)` and the year is `row.date.slice(0, 4)` — no `Date` parsing, no timezone concerns, consistent with the string-slicing discipline established for the Problem Produksi route.

**Only months with data are included** — this route does not pad in empty months (unlike the Problem Produksi route, which always emits 12). The horizontal chart's Y axis is exactly "bulan sesuai data saja" per the request, so the API reflects that directly rather than the chart filtering a full 12-month response client-side.

Response shape:

```ts
{
  statuses: ['On Progress', 'Tunggu Material', 'Fabrikasi', 'Others', 'Finish'],
  data: Array<{
    month: string;              // "Jan" … "Des", only populated months, chronological
    total: number;
    'On Progress': number;
    'Tunggu Material': number;
    'Fabrikasi': number;
    'Others': number;
    'Finish': number;
  }>;
}
```

`statuses` is a fixed, ordered constant (not derived from the data) so the stack order and legend order never depend on which statuses happen to have data this year — `Fabrikasi` currently has zero rows but still gets a legend entry and a color, consistent with "ambil data yang ada saja" meaning *display* only what has data, not that the category itself is conditionally omitted from the color scheme.

On error, logs `[GET /api/kaizen/by-month]` and returns `{ statuses: [...], data: [] }` with HTTP 500 (the fixed `statuses` array is still meaningful even on failure, since it's a constant, not derived — though the component only renders it when there's data to show).

### 4. KPI component — `src/components/KaizenKpiBar.tsx` (new)

Client component, no props. Fetches `/api/kaizen/kpi` on mount, same fetch/catch/fail pattern as the other two KPI bars. Visual treatment matches them exactly: border-only card (`CARD_BORDER` from `src/lib/chartTheme.ts`), status dot with `Kaizen Order Sheet · Live`/`· Offline`, three metrics (Total, On Progress, Finish) with icons and colors matching the established convention (neutral/amber/emerald). This duplicates the established KPI-bar shape by design — same precedent as `ProblemProduksiKpiBar`, not re-litigated here.

### 5. Chart component — `src/components/KaizenStatusChart.tsx` (new)

Client component, no props. Fetches `/api/kaizen/by-month` on mount.

**Orientation:** horizontal bars — Recharts `<BarChart layout="vertical">` (Recharts' own naming: `layout="vertical"` produces horizontal bars with a categorical Y axis and numeric X axis). `<YAxis type="category" dataKey="month" />`, `<XAxis type="number" allowDecimals={false} />`. One `<Bar>` per status in the fixed `statuses` order, all sharing `stackId="status"`, so each month's row is a single horizontal stack of 5 colored segments.

**Colors:** a fixed status→color map local to this component (this is a status dimension, not a line dimension, so it does not belong in `chartTheme.ts`'s `lineColor()`), matching the existing status-color conventions already used elsewhere on the dashboard (amber for in-progress-flavored states, emerald for Finish):

| Status | Color |
|---|---|
| `On Progress` | `#F59E0B` (amber — matches the existing On Progress convention) |
| `Tunggu Material` | `#EAB308` (yellow, distinct from On Progress's amber) |
| `Fabrikasi` | `#3B82F6` (blue) |
| `Others` | `#8B5CF6` (purple) |
| `Finish` | `#10B981` (emerald — matches the existing Finish convention) |

**Stack-total labels:** this hits the exact same Recharts pitfall already fixed once this session in `ProblemProduksiChart.tsx` — a `LabelList` fixed to one arbitrary segment disappears whenever that segment is zero for a given row, because Recharts drops zero-length bar rects (and anything attached to them) entirely rather than rendering them at zero size. The fix already proven there applies directly here: every bar in the stack carries the label machinery, but only the bar for that row's topmost surviving (non-zero) status actually emits the row's `total`, found by scanning `statuses` from the end backward per row.

**Card chrome:** border-only card, `BarChart3` icon, header text `Kaizen per Bulan`, using `CARD_BORDER`/`TEXT_PRIMARY`/`TEXT_MUTED`/`AXIS_LINE`/`GRID_LINE`/`tickStyle` from `src/lib/chartTheme.ts` — identical visual language to the other two charts.

**Height:** unlike the two existing vertical charts (fixed `CHART_H = 280`), a horizontal bar chart's height must grow with the number of rows (months), or rows with many months would compress unreadably. Height is computed as `Math.max(160, rows.length * 44)` — roughly 44px per month row, with a floor so a single-month chart doesn't render too short.

**States:** failure renders `Data Kaizen Order Sheet per bulan tidak tersedia.`; loading renders a pulsing skeleton (horizontal bars this time, matching the new orientation); a successful response with zero rows (no months at all) renders `Belum ada data.` No "all-zero" case needs separate handling the way the other two charts do, since this route only ever returns months that already have at least one entry.

### 6. Dashboard page — `src/app/dashboard/page.tsx` (modified)

Gains a third `<DashboardAppSection>`:

```tsx
<DashboardAppSection
  name="Kaizen Order Sheet"
  blurb="Data diambil langsung dari aplikasi Kaizen Order Sheet — pencatatan kaizen dan status penyelesaiannya."
>
  <KaizenKpiBar />
  <KaizenStatusChart />
</DashboardAppSection>
```

No other change to the page.

## Error Handling

Same contract as the other two sections throughout: a missing env var, an unreachable Supabase project, or a query error all produce a logged server-side error and a safe empty payload with HTTP 500. Each component catches the non-OK response and renders its own inline unavailable message. Nothing throws into the React tree, and this section's failure never affects Henkaten or Problem Produksi.

## Deployment

`KAIZEN_SUPABASE_URL` and `KAIZEN_SUPABASE_ANON_KEY` must be added to the Netlify environment before this works in production, mirroring the existing `E_HENKATEN`/`PP_INSFORGE_*` entries in `DEPLOY.md`. Without them, the section degrades to its offline messages — visible but not broken.

## Testing

No automated test suite exists in this project, and none is added here. Verification is manual:

- `npx tsc --noEmit` and `npx eslint` clean on all new and modified files.
- `curl http://localhost:3000/api/kaizen/kpi` returns `total`, `onProgress`, `finish` — against current live data, 95 / 42 / 53 (`42 = 20 + 15 + 0 + 7`); exact numbers will drift as the source data changes.
- `curl http://localhost:3000/api/kaizen/by-month` returns only populated months (currently May, Jun, Jul 2026), each with all 5 status keys present even where the count is 0.
- In the browser at `/dashboard`: the new section renders below Problem Produksi; the chart shows one horizontal row per populated month; the legend lists all 5 statuses including `Fabrikasi` even though it currently has no data; stack-total labels appear at the end of every populated row.
