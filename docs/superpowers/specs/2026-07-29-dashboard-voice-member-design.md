# Dashboard: Voice Member Top-Senders Podium + Ranking Table

## Purpose

The `/dashboard` page has three live app sections so far (Henkaten, Problem Produksi, Kaizen Order Sheet). This project adds a fourth: "Voice Member", showing a champion-podium of the top 3 people who have submitted the most voice-member entries, plus a ranking table for everyone else.

## Data Source

The Voice Member app runs on **Supabase** (Postgres), a separate project from all three existing integrations (verified via the Supabase MCP connection: project `voice-member-db`, ref `mqpkeuqkfxbxfzijjjjn`). Schema confirmed directly against the live database:

- **Table `voice_members`:** `id` (uuid), `created_at` (timestamptz), `input_date` (date), `member_name` (text), `line_name` (text), `voice_text` (text), `photo_url` (text, nullable — a documentation photo attached to the submission, unrelated to the sender's profile picture), `noreg` (text). 4 rows at time of writing.
- **Table `member_accounts`:** `noreg` (PK), `nama`, `password_hash`, `role`, `created_at`, `profile_photo` (text, nullable). Holds each member's own profile photo, joined by name — this is the same join the source app's own admin dashboard (`voice-app/src/app/result/page.tsx`'s `MemberBarChart`) performs client-side to show avatars next to its "Top Pengirim" ranking.
- **Connection:** a direct Postgres connection string (transaction pooler), already added to `.env.local` as `VOICE_MEMBER_SUPABASE` and verified live. This matches the Henkaten precedent — a raw `postgres` client, no new SDK dependency — since a real database credential was available here (unlike the Kaizen section, which had to fall back to `@supabase/supabase-js` because only an anon key was retrievable).

Only `member_name` (aggregated to a count) and `profile_photo` are read. `voice_text`, `photo_url`, `input_date`, `noreg`, and `line_name` are never fetched into the portal — this section shows a ranking, not a submission log.

## Scope

- Add a "Voice Member" section to `/dashboard`: a top-3 podium plus a ranking table for ranks 4–10.
- Out of scope: the raw submission log (date, line, voice text, documentation photo), any write operation, any change to the Voice Member app itself, and any per-line breakdown.

## Ranking Rules

- Ranking is by count of `voice_members` rows per `member_name`, descending, **capped at 10** — matching the cutoff the source app's own `MemberBarChart` already uses (`counts.slice(0, 10)`).
- **Podium (ranks 1–3)** renders only when there are **3 or more** unique senders. With fewer than 3, the podium is hidden entirely.
- **Table** shows ranks 4–10 when the podium is showing. When the podium is hidden (fewer than 3 unique senders), the table shows **everyone** instead of "rank 4+", so the section never renders an empty podium next to an empty table. Right now, with exactly 3 unique senders live, the podium would show all 3 and the table would render its own empty state ("Belum ada data lain.") — this is expected, not a bug, and will resolve naturally as more people submit.
- Each entry shows a profile photo if `member_accounts.profile_photo` is set for that name, otherwise a circular initial-letter avatar (first character of `member_name`, uppercased) — matching the avatar treatment already used in the source app's own admin table (`result/page.tsx`'s "Nama" column).

## Architecture

```
DashboardAppSection name="Voice Member"
  ├── <VoiceMemberPodium />   ─┐
  └── <VoiceMemberTable />    ─┴─→ GET /api/voice-member/top-senders
                                        └── src/db/voiceMember.ts
                                              └── postgres(VOICE_MEMBER_SUPABASE)
```

Both components fetch the same endpoint independently (matching the existing pattern where a section's KPI bar and chart each fetch their own data) — the response is small (at most 10 rows), so a shared fetch/cache layer isn't warranted.

## Components

### 1. Postgres client — `src/db/voiceMember.ts` (new)

Mirrors `src/db/henkaten.ts` exactly:

```ts
import postgres from 'postgres';

// Separate Supabase Postgres instance owned by the Voice Member app —
// read-only access for surfacing its top-senders ranking on the portal.
export const voiceMemberSql = postgres(process.env.VOICE_MEMBER_SUPABASE ?? '', { ssl: 'require' });
```

### 2. API route — `src/app/api/voice-member/top-senders/route.ts` (new)

`export const dynamic = 'force-dynamic'`. Runs the join-and-rank query from the Data Source section, capped at 10, and returns:

```ts
Array<{ rank: number; member_name: string; total: number; profile_photo: string | null }>
```

`rank` is `1`-based, assigned by array position after the `ORDER BY total DESC` — the SQL doesn't need a window function since the whole result set (≤10 rows) is already in the intended order.

On success: `Cache-Control: no-store`. On any error (including a missing env var or an unreachable database), logs `[GET /api/voice-member/top-senders]` and returns `[]` with HTTP 500 — matching the empty-array fallback shape already used by `/api/henkaten-kpi/by-line`.

### 3. Podium component — `src/components/VoiceMemberPodium.tsx` (new)

Client component, no props. Fetches the endpoint on mount, same `fetch(...).then(r => r.ok ? r.json() : Promise.reject()).catch(() => setFailed(true))` pattern as every other section.

Renders only when the response has **3 or more** entries. Layout is a classic champion podium: rank 1 center and tallest, rank 2 to its left, rank 3 to its right, each shorter than the last. Each podium slot shows: the avatar (photo or initial), the name, the total count, and a rank badge (gold/silver/bronze-toned, reusing the app's existing accent palette rather than introducing new colors — e.g. `#F59E0B` for 1st, `rgba(217,226,255,0.55)`-toned silver for 2nd, a muted bronze for 3rd).

Card chrome (border-only, `CARD_BORDER` from `src/lib/chartTheme.ts`) matches the other sections' KPI bars.

### 4. Table component — `src/components/VoiceMemberTable.tsx` (new)

Client component, no props. Fetches the same endpoint independently.

- If the response has ≥3 entries: renders ranks 4–10 (i.e., `data.slice(3)`). If that slice is empty (3–3 senders exactly, nothing beyond the podium yet), shows `Belum ada data lain.`
- If the response has <3 entries: renders **all** entries (the podium is not showing in this case).
- Columns: `#` (rank), avatar (photo or initial, smaller than the podium's), Nama, Total Voice Member.
- States: failure → `Data Voice Member tidak tersedia.`; loading → a skeleton matching this table's row shape (not the bar-chart skeletons the other sections use, since this is genuinely a table); a successful response with zero total senders → `Belum ada data.`

### 5. Dashboard page — `src/app/dashboard/page.tsx` (modified)

Gains a fourth `<DashboardAppSection>`, after Kaizen Order Sheet:

```tsx
<DashboardAppSection
  name="Voice Member"
  blurb="Data diambil langsung dari aplikasi Voice Member — peringkat pengirim aspirasi terbanyak."
>
  <VoiceMemberPodium />
  <VoiceMemberTable />
</DashboardAppSection>
```

No other change to the page.

## Error Handling

Same contract as the other three sections: a missing env var, an unreachable database, or a query error all produce a logged server-side error and `[]` with HTTP 500. Both components catch the non-OK response and render their own inline unavailable message. Nothing throws into the React tree, and this section's failure never affects the other three.

## Deployment

`VOICE_MEMBER_SUPABASE` must be added to the Netlify environment before this works in production, mirroring the existing entries in `DEPLOY.md`. Without it, the section degrades to its offline messages.

## Testing

No automated test suite exists in this project, and none is added here. Verification is manual:

- `npx tsc --noEmit` and `npx eslint` clean on all new and modified files.
- `curl http://localhost:3000/api/voice-member/top-senders` returns an array of up to 10 `{ rank, member_name, total, profile_photo }` entries, ranked descending by `total`. Against current live data that's 3 entries (`SIGIT WIDYO NUGROHO` 2, then two others at 1 each) — exact values will change as more submissions arrive.
- In the browser at `/dashboard`: with fewer than 3 unique senders (today's actual state), confirm the podium is absent and the table shows all senders. Once the data grows past 3 unique senders, confirm the podium appears with ranks 1–3 and the table shows only rank 4 onward.
- Confirm a sender with a `profile_photo` set in `member_accounts` shows their photo, and one without shows an initial-letter avatar.
