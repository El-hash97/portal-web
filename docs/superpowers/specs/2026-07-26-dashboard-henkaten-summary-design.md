# Dashboard: e-Henkaten KPI Summary + Per-Line Bar Chart

## Purpose

The sidebar has a "Dashboard" nav item that has never been wired up (no `href`, shown disabled with a "Segera hadir" tooltip). This project adds the first real content for it: a live summary of e-Henkaten data pulled from the separate e-Henkaten Supabase instance the portal already has read-only access to.

## Scope

- Wire the `Dashboard` sidebar nav item to a new `/dashboard` route.
- On that page: reuse the existing KPI summary bar, and add a new bar chart of total henkaten records per production line, below it.
- Data source: the existing `henkatenSql` connection (`E_HENKATEN` env var) against the `henkaten_records` table, which was inspected directly and confirmed to have a `line_name` column (sample values: `Mould-RCS`, `Mel-Pour-Analys`, `Finishing`, `Core Making`; counts currently in the single/low-double digits per line).
- No new npm dependencies (no charting library) — matches the codebase's existing hand-rolled SVG/CSS chart pattern (see `PortalStats.tsx`'s `BarChart`/`LineChart`).
- Out of scope: filters, date ranges, drill-down, pagination, or any change to the existing `/api/henkaten-kpi` endpoint or `HenkatenKpiBar` component.

## Architecture

```
Sidebar (nav item now links to /dashboard)
  -> src/app/dashboard/page.tsx
       -> <HenkatenKpiBar />        (existing component, reused unchanged)
       -> <HenkatenLineChart />     (new component)
            -> fetch('/api/henkaten-kpi/by-line')
                 -> src/app/api/henkaten-kpi/by-line/route.ts (new)
                      -> henkatenSql (existing, src/db/henkaten.ts)
                           -> henkaten_records table (external e-Henkaten DB, read-only)
```

## Components

### 1. Sidebar nav wiring
`src/components/Sidebar.tsx`: change the `Dashboard` entry in `navItems` from `{ label: 'Dashboard', icon: <LayoutDashboard size={18} /> }` (no `href`, renders as disabled) to include `href: '/dashboard'`, identical in shape to the `Home`/`Applications`/`Reports` entries. No other changes to `Sidebar.tsx`.

### 2. Dashboard page
`src/app/dashboard/page.tsx` (new): client component following the same header pattern as `src/app/applications/page.tsx` — `max-w-5xl` container, `<h1>` title "Dashboard", one-line subtitle noting the data comes from e-Henkaten. Body renders `<HenkatenKpiBar />` then `<HenkatenLineChart />` in a vertical stack with existing spacing conventions (`mt-3`/`mb-8`-style gaps used elsewhere).

### 3. API route
`src/app/api/henkaten-kpi/by-line/route.ts` (new): mirrors `src/app/api/henkaten-kpi/route.ts` exactly in shape —
```ts
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
Response shape: `{ line_name: string; total: number }[]`.

### 4. HenkatenLineChart component
`src/components/HenkatenLineChart.tsx` (new), client component:
- `useEffect`/`fetch` on mount against `/api/henkaten-kpi/by-line`, same silent-hide-on-failure pattern as `HenkatenKpiBar` (`failed` state -> `return null`).
- Renders a dark card matching `HenkatenKpiBar`'s styling (`background: rgba(10,21,46,0.85)`, `border: 1px solid #2f3952`, small uppercase mono-label header e.g. "Henkaten per Line").
- Vertical column chart: one column per row returned, column height proportional to `total / max(total)`, the count rendered above each column, `line_name` rendered below each column (wrapped/truncated if needed — current data has short names so this is a non-issue in practice).
- Empty/loading state: while data hasn't arrived, render a lightweight placeholder (matching the `kpi ? value : '—'` convention already used); if the fetch fails, return `null` like the KPI bar does, so a missing `E_HENKATEN` env var degrades the same way it already does for the KPI bar (no error surfaced to the user).

## Data Flow / Error Handling

Identical failure semantics to the existing `/api/henkaten-kpi` integration: if `E_HENKATEN` is unset or the external DB is unreachable, the API returns a 500 with an empty/zeroed payload, the component's `fetch(...).catch()` sets `failed`, and the section simply doesn't render — no error banner, no crash. This matches the already-documented behavior in `DEPLOY.md` for the KPI bar.

## Testing

Manual verification via the dev server:
- Navigate to `/dashboard` via the sidebar link, confirm it's no longer disabled.
- Confirm KPI bar renders with the same values as the home page.
- Confirm the bar chart renders 4 columns matching current live counts (`Mould-RCS` 12, `Mel-Pour-Analys` 10, `Finishing` 8, `Core Making` 3) — exact numbers will vary as the source data changes over time, so the check is "renders proportionally, matches a fresh direct query" rather than hardcoded numbers.
- No automated test suite exists in this project for UI/API routes today; none is being added as part of this scope.
