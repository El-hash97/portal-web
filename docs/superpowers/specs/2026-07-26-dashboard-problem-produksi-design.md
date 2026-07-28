# Dashboard: Problem Produksi KPI + Monthly Stacked-by-Line Chart

## Purpose

The `/dashboard` page currently shows one app section ("Henkaten"). This project adds a second section, "Problem Produksi", pulling live data from the separate Problem Produksi application so the portal surfaces a KPI summary plus a monthly breakdown of problems by status and production line.

## Data Source

The Problem Produksi app runs on **InsForge** (not Supabase Postgres like e-Henkaten). Its schema and live values were verified directly against the running backend:

- **Table:** `problems`, 90 rows at time of writing.
- **Columns:** `id`, `date`, `line`, `jenisProblem`, `problem`, `namaMesin`, `planningPerbaikan`, `status`, `keterangan`, `createdAt`, `updatedAt`, `picPerbaikan`, `rencanaperbaikan`, `penemuProblem`.
- **`status` values:** exactly two — `"On progress"` (23) and `"Finish"` (67). Note the lowercase `p` in `"On progress"`.
- **`line` values:** five — `Mould-RCS` (27), `Core Making` (24), `Finishing` (18), `Die Press` (15), `Mel-Pour-Analys` (6). This is one more line than e-Henkaten has (`Die Press` is unique to Problem Produksi).
- **`date` format:** ISO-8601 string with explicit offset, e.g. `2026-01-15T00:00:00+00:00`. Data currently spans June–July 2026.

Access is via `@insforge/sdk`'s `createAdminClient`, using `PP_INSFORGE_URL` and `PP_INSFORGE_API_KEY` from `.env.local`. These are already present locally, copied from the Problem Produksi app's own `.env.local`.

Only the `date`, `line`, and `status` columns are read. Free-text and person-name columns (`problem`, `penemuProblem`, `picPerbaikan`, `namaMesin`, `keterangan`) are never fetched into the portal.

## Scope

- Add a "Problem Produksi" section to `/dashboard` containing a KPI bar and a monthly chart.
- Extract a shared chart-theme module holding the dashboard's chart colors plus a line-name→color map, so a given production line renders in the same color across every dashboard chart and both charts stay visually in step.
- Add `@insforge/sdk` as a dependency.
- Out of scope: filters, date-range pickers, drill-down, a problems table, any write operation, and any change to the Problem Produksi app itself.

## Architecture

```
/dashboard page
  ├── <DashboardAppSection name="Henkaten">          (existing, unchanged)
  │     ├── <HenkatenKpiBar />
  │     └── <HenkatenByLineChart />                  (modified: imports src/lib/chartTheme.ts)
  └── <DashboardAppSection name="Problem Produksi">  (new usage of existing wrapper)
        ├── <ProblemProduksiKpiBar />   → GET /api/problem-produksi/kpi
        └── <ProblemProduksiChart />    → GET /api/problem-produksi/by-month
                                              └── src/db/problemProduksi.ts
                                                    └── createAdminClient (@insforge/sdk)
```

Aggregation happens server-side in the API routes, keeping the components presentational — the same division of labour the Henkaten routes use, where SQL did the grouping.

## Components

### 1. Shared chart theme — `src/lib/chartTheme.ts` (new)

This module is the single source of truth for how every dashboard chart looks, so "same design as the previous chart" is enforced by construction rather than by copy-paste.

It exports the color constants currently declared privately inside `HenkatenByLineChart.tsx` — `CARD_BORDER` (`#2f3952`), `TEXT_PRIMARY` (`#f5f7ff`), `TEXT_MUTED` (`rgba(217,226,255,0.55)`), `AXIS_LINE` (`rgba(217,226,255,0.35)`), `GRID_LINE` (`rgba(217,226,255,0.10)`) — plus the shared `tickStyle` object, plus `lineColor(name: string): string`.

`lineColor` uses a fixed map assigning a stable color per known line, drawn from the palette already used in `HenkatenByLineChart`:

| Line | Color |
|---|---|
| `Mould-RCS` | `#EB0A1E` |
| `Core Making` | `#F59E0B` |
| `Finishing` | `#3B82F6` |
| `Die Press` | `#10B981` |
| `Mel-Pour-Analys` | `#8B5CF6` |

Unknown line names fall back to a deterministic pick from `["#EC4899", "#0EA5E9", "#F97316"]`, chosen by a simple character-sum hash of the name so the same unknown line always gets the same color within and across renders.

`src/components/HenkatenByLineChart.tsx` is modified to import from this module instead of declaring its own constants: its local `BAR_COLORS`, `CARD_BORDER`, `TEXT_PRIMARY`, `TEXT_MUTED`, `AXIS_LINE`, `GRID_LINE`, and `tickStyle` declarations are deleted, and its `BAR_COLORS[i % BAR_COLORS.length]` cell lookup becomes `lineColor(d.line_name)`. Its markup, layout, states, and every rendered value are otherwise untouched — the change is purely where the constants come from, so the component renders identically apart from per-line color assignment now being name-based rather than index-based.

### 2. InsForge client — `src/db/problemProduksi.ts` (new)

Mirrors the role of `src/db/henkaten.ts`: a single module-level client, created once and reused.

```ts
import { createAdminClient } from '@insforge/sdk';

// Separate InsForge backend owned by the Problem Produksi app —
// read-only use for surfacing its KPIs on the portal dashboard.
export const problemProduksi = createAdminClient({
  baseUrl: process.env.PP_INSFORGE_URL ?? '',
  apiKey: process.env.PP_INSFORGE_API_KEY ?? '',
});
```

### 3. KPI API route — `src/app/api/problem-produksi/kpi/route.ts` (new)

`export const dynamic = 'force-dynamic'`. Selects only `status` from `problems`, counts in JS, and returns:

```ts
{ total: number; onProgress: number; finish: number }
```

`total` counts every row; `onProgress` counts `status === "On progress"`; `finish` counts `status === "Finish"`. Response carries `Cache-Control: no-store`. On any error (including a missing env var), logs `[GET /api/problem-produksi/kpi]` and returns `{ total: 0, onProgress: 0, finish: 0 }` with HTTP 500.

These KPI counts cover **all** rows regardless of year, matching how the source app computes the same three numbers. The chart below is year-filtered; this difference is intentional and mirrors the source app's own behavior.

### 4. Monthly API route — `src/app/api/problem-produksi/by-month/route.ts` (new)

`export const dynamic = 'force-dynamic'`. Selects `date`, `line`, `status` from `problems`, filters to the current calendar year, and buckets by month and line.

**Month derivation is string-based, not `Date`-based:** the month key comes from `row.date.slice(0, 7)` (yielding `"2026-06"`), and the year from `row.date.slice(0, 4)`. Using `new Date(...).getMonth()` would read the timestamp in the server's local zone and could shift a row into an adjacent month; slicing the ISO string avoids that entirely.

**Status bucketing:** `status === "On progress"` counts as on-progress; every other value counts as finish. This mirrors the source app's `if (status === "On progress") … else …` logic exactly, so the portal's totals always agree with the source app's.

Response shape:

```ts
{
  lines: string[];                       // distinct line names, ordered by total desc
  data: Array<{
    month: string;                       // "Jan" … "Des"
    opTotal: number;
    finTotal: number;
    [key: `op:${string}`]: number;       // e.g. "op:Mould-RCS"
    [key: `fin:${string}`]: number;      // e.g. "fin:Mould-RCS"
  }>;
}
```

`data` always contains all twelve months of the current year in order, using Indonesian abbreviations `["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]`, with zeros for months that have no records. Every month object carries an `op:` and `fin:` key for every line in `lines`, so Recharts never encounters a missing dataKey.

The `op:`/`fin:` key prefixes use a colon deliberately: Recharts treats `.` in a `dataKey` as a nested-path separator, and line names must not be parsed as paths. Colons and hyphens are safe.

On error, logs `[GET /api/problem-produksi/by-month]` and returns `{ lines: [], data: [] }` with HTTP 500.

### 5. KPI component — `src/components/ProblemProduksiKpiBar.tsx` (new)

Client component, no props. Fetches `/api/problem-produksi/kpi` on mount using the same `fetch(...).then(r => r.ok ? r.json() : Promise.reject()).catch(() => setFailed(true))` pattern as `HenkatenKpiBar`.

Visual treatment copies `HenkatenKpiBar` exactly: border-only card (`1px solid #2f3952`), `font-data`, `rounded-xl`, status dot with the label `Problem Produksi · Live` (or `· Offline` when the fetch failed), and three metrics separated by vertical rules:

| Metric | Label | Icon | Icon background |
|---|---|---|---|
| `total` | Total Problem | `FileBarChart` | `rgba(217,226,255,0.16)` |
| `onProgress` | On Progress | `Clock` | `#F59E0B` |
| `finish` | Finish | `CheckCircle2` | `#10B981` |

While loading, each value renders the same pulsing skeleton block `HenkatenKpiBar` uses. On failure the metrics are replaced by the message `Data Problem Produksi tidak tersedia.`

### 6. Chart component — `src/components/ProblemProduksiChart.tsx` (new)

Client component, no props. Fetches `/api/problem-produksi/by-month` on mount, same pattern as above.

Card chrome matches `HenkatenByLineChart`: border-only card, `BarChart3` icon, uppercase tracked header reading `Problem per Bulan`, and a fixed chart height of 280px. Border, text, axis, grid colors and `tickStyle` are imported from `src/lib/chartTheme.ts` (§1), which is what guarantees the two charts stay visually identical.

Chart composition, using Recharts:

- `<CartesianGrid stroke={GRID_LINE} strokeDasharray="3 3" vertical={false} />`
- `<XAxis dataKey="month" />` and `<YAxis allowDecimals={false} width={32} />`, both with the existing axis/tick styling.
- For each line `L` in `lines`, two `<Bar>` elements sharing `fill={lineColor(L)}`:
  - `<Bar dataKey={"op:" + L} stackId="op" name={L} />`
  - `<Bar dataKey={"fin:" + L} stackId="fin" legendType="none" />`

  Two distinct `stackId`s render as two stacks side by side within each month. `legendType="none"` on the `fin` series keeps each line in the legend exactly once.
- `<Legend />` listing the five line names with their colors.
- Stack totals: every `<Bar>` in both stacks carries a `<LabelList>`, but only one of them actually renders a value for a given month. In the installed Recharts (3.10.1), a bar segment with `height === 0` is dropped from the rendered rect array entirely — it does not render as an invisible zero-height rectangle at the stack's running total, it simply never gets created, and any `LabelList` attached to that segment disappears along with it. Picking a single fixed line (e.g. the last one in `lines`) to carry the label is therefore unsafe: whenever that line's own value is `0` for a month, its label vanishes even though the stack's total is non-zero. The fix is a `valueAccessor` (not `dataKey`, which recharts's `LabelList` treats with priority over `valueAccessor` when both are set) on every bar in the stack: for a given row, it scans `lines` from the last entry backwards and finds the first line whose value is greater than zero — the bar for that line emits `opTotal`/`finTotal`, every other bar in the stack emits an empty string. Because zero-value segments never render, that surviving line's bar is always the one sitting at the visual top of the stack, so its label lands in the right place. Labels use a formatter returning an empty string when the total is `0`, so empty months stay clean instead of showing a row of zeros.

**Distinguishing the two stacks:** Recharts offers no clean sub-tick label under a shared category. The pair is identified three ways instead — the totals above each stack, a static caption below the chart reading `kiri: On Progress · kanan: Finish`, and the tooltip.

**Tooltip:** a custom component styled like `HenkatenByLineChart`'s (`#0a152e` background, `#2f3952` border). Because grouped stacks deliver the whole month's payload on hover, the tooltip shows the month name as a header, then an "On Progress" block and a "Finish" block, each listing only its non-zero lines with counts, followed by that block's total. This sidesteps any ambiguity about which stack the cursor is over.

**States:** failure renders `Data Problem Produksi per bulan tidak tersedia.`; loading renders the same pulsing skeleton bars `HenkatenByLineChart` uses; a successful response whose months are all zero renders `Belum ada data.` An `aria-label` summarising per-month totals is applied to the chart container, matching the existing chart's accessibility approach.

### 7. Dashboard page — `src/app/dashboard/page.tsx` (modified)

Gains a second `<DashboardAppSection>` below the Henkaten one:

```tsx
<DashboardAppSection
  name="Problem Produksi"
  blurb="Data diambil langsung dari aplikasi Problem Produksi — monitoring problem yang menghambat produksi."
>
  <ProblemProduksiKpiBar />
  <ProblemProduksiChart />
</DashboardAppSection>
```

No other change to the page.

## Error Handling

Failure semantics match the existing Henkaten integration throughout. A missing env var, an unreachable InsForge backend, or a rejected query all produce a logged server-side error and a safe empty payload with HTTP 500. Each component catches the non-OK response and renders its own inline unavailable message. Nothing throws into the React tree, and one section failing never affects the other.

## Security Considerations

`PP_INSFORGE_API_KEY` is an InsForge **admin** key with full access to the Problem Produksi backend — the same key its own app uses via `createAdminClient`. Two properties keep this acceptable:

- It is read exclusively inside API route handlers (server-side). The variable name carries no `NEXT_PUBLIC_` prefix, so Next.js will never inline it into the client bundle.
- No component receives the key or talks to InsForge directly.

A least-privilege alternative — an anon key plus a read-only RLS policy on `problems` — was considered and deferred, since it requires RLS configuration on the Problem Produksi project. This is worth revisiting if the portal later needs more InsForge-backed sections.

## Deployment

Both `PP_INSFORGE_URL` and `PP_INSFORGE_API_KEY` must be added to the Netlify environment before this works in production. Without them, both routes return their 500 fallback and the Problem Produksi section degrades to its offline messages — visible but not broken, matching the `E_HENKATEN` behavior already documented in `DEPLOY.md`.

## Testing

The project has no automated test suite (no Jest/Vitest/Playwright config), and none is added here. Verification is manual:

- `npx tsc --noEmit` and `npx eslint` clean on all new and modified files.
- `curl http://localhost:3000/api/problem-produksi/kpi` returns `total`, `onProgress`, `finish`. Against current live data that is 90 / 23 / 67; these values change as the source data does, so the real check is that they match a fresh read of the source app's own dashboard.
- `curl http://localhost:3000/api/problem-produksi/by-month` returns twelve month entries and five line names, with June and July populated.
- In the browser at `/dashboard`: both sections render; the Problem Produksi chart shows two stacks per populated month; the legend lists five lines; and `Mould-RCS` is the same color in both the Henkaten and Problem Produksi charts.
