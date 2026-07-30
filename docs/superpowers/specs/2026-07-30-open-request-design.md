# Open Request — Portal Feature Request Workflow

## Purpose

The sidebar's "Data Center" item has never been built — it renders as a disabled
"Segera hadir" stub (`src/components/Sidebar.tsx:46`). This project replaces it with
**Open Request**: a place where any portal user can ask for a missing feature in one of
the division's apps, have a Section approve or reject it, and watch a developer carry it
through to done.

Today there is no path from "this app is missing something" to a tracked commitment. The
existing `FeedbackForm` on `/reports` collects free-text comments, but they have no
requester identity, no approval step, no status, and no closure — they are suggestions,
not requests. Open Request is a workflow with accountability at each step.

## Scope

- A new `/open-request` page: hero, static tutorial, submission form, and the request list.
- A new `feature_requests` table in the portal's own database.
- Section approval gated by a server-verified password.
- Developer transitions (start work, mark finished) gated by the existing admin session.
- Replacing the sidebar's "Data Center" entry with "Open Request".

**Out of scope:** editing or deleting a submitted request, file/screenshot attachments on a
request, email or chat notifications, per-line approver accounts, and any change to the
existing `/reports` feedback feature (they coexist — feedback is for comments, Open Request
is for tracked feature work).

## Status Lifecycle

```
              ┌─────────────┐
   user  →    │  menunggu   │
              └──────┬──────┘
         Section     │     Section
         approve     │     reject
            ┌────────┴────────┐
            ▼                 ▼
      ┌───────────┐     ┌───────────┐
      │ disetujui │     │  ditolak  │  ← terminal
      └─────┬─────┘     └───────────┘
            │ developer starts
            ▼
      ┌────────────┐
      │ dikerjakan │
      └─────┬──────┘
            │ developer finishes
            ▼
      ┌───────────┐
      │  selesai  │  ← terminal
      └───────────┘
```

Five states: `menunggu`, `disetujui`, `ditolak`, `dikerjakan`, `selesai`. Transitions are
one-directional; nothing moves backward. `ditolak` and `selesai` are terminal.

The API rejects any transition not in this diagram (e.g. `menunggu` → `selesai`) with HTTP
409, so a stale browser tab cannot skip the approval step.

## Data

New table in the portal's own Neon/Drizzle database (`src/db/schema.ts`) — the same database
that already holds `apps`, `feedback`, and `app_ratings`. This is portal-owned data, unlike
the four dashboard sections which read external apps' databases read-only.

```ts
export const featureRequests = pgTable('feature_requests', {
  id:           serial('id').primaryKey(),
  requester:    text('requester').notNull(),
  lineName:     text('line_name').notNull(),
  appId:        integer('app_id').references(() => apps.id, { onDelete: 'set null' }),
  requestText:  text('request_text').notNull(),
  status:       text('status').notNull().default('menunggu'),
  approver:     text('approver'),
  rejectReason: text('reject_reason'),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  decidedAt:    timestamp('decided_at', { withTimezone: true }),
  finishedAt:   timestamp('finished_at', { withTimezone: true }),
});
```

`appId` references the existing `apps` table with `onDelete: 'set null'`, matching the
`feedback` table's precedent — deleting an app must not delete the history of requests made
against it. The list endpoint renders a null `appId` as "— Aplikasi dihapus —".

`approver` records who made the Section decision. Because the Section password is shared,
this name is self-declared, not authenticated — it is an accountability record, not proof of
identity. That is an accepted tradeoff for an internal tool.

### Line options

Fixed list of 8, defined as a constant in `src/lib/constants.ts` (not free text, so the list
stays filterable and typo-free):

Core Making · Die Press · Finishing · Mel-Pour-Analys · Mould-RCS · Maintenance ·
Die Maintenance · Engineering

Note this is a different list from `LINE_OPTIONS` used by the Voice Member app and from the
line names in `chartTheme.ts`'s `LINE_COLORS` — it includes Die Maintenance and Engineering,
which those do not. It is therefore its own constant, `REQUEST_LINES`, not a reuse.

## Security

The user's stated concern is that approval must not be something just anyone can do
("agar tidak sembarang orang bisa approval"). That drives the following:

**Section approval** is verified **server-side** in the route handler, comparing against
`SECTION_PASSWORD` from `.env.local`. The password is never sent to the browser and never
appears in the client bundle, so approval cannot be forged through DevTools. The approver
types their name and the password in a modal each time they approve or reject.

**Developer transitions** (`disetujui` → `dikerjakan` → `selesai`) are also verified
server-side against `DEVELOPER_PASSWORD` from `.env.local`. To honor "no new password to
type", the client sends the password it already holds from the admin login:
`startAdminSession()` is extended to stash the entered password in `sessionStorage`, and the
developer action buttons send it automatically. The developer types nothing extra — the
buttons simply appear once logged in via the existing gear icon → `/admin`.

Storing that password in `sessionStorage` is not a security regression: `ADMIN_CRED` is
already hardcoded in `src/lib/constants.ts` and therefore already ships in the client bundle
today. This design leaves that exactly as-is for the login gate while adding a genuine
server-side check for the actions that mutate request state.

Both env vars must be added to `.env.local` (gitignored) and to Netlify before deploy, and
neither may carry a `NEXT_PUBLIC_` prefix. Without them, the API returns 503 and the UI shows
that approvals are temporarily unavailable — submissions still work.

## API

All three routes use `export const dynamic = 'force-dynamic'` and follow the error contract
already used across this codebase: log server-side, return a safe fallback.

### `GET /api/open-request`

Returns every request with its app name joined in, ordered by status priority
(`menunggu` → `disetujui` → `dikerjakan` → `selesai` → `ditolak`) then newest first, so
things needing attention sit at the top. On failure: `[]` + 500.

```ts
Array<{
  id: number; requester: string; line_name: string;
  app_id: number | null; app_nama: string | null;
  request_text: string; status: Status;
  approver: string | null; reject_reason: string | null;
  created_at: string; decided_at: string | null; finished_at: string | null;
}>
```

### `POST /api/open-request`

Body: `{ requester, line_name, app_id, request_text }`. Validates that all four are present,
that `line_name` is one of the 8 known lines, and that `request_text` is at least 10
characters (a one-word request is not actionable). Inserts with `status: 'menunggu'`.
Returns 201 with the created row, or 400 with a message the form displays inline.

### `PATCH /api/open-request/[id]`

Body: `{ action, password, approver?, reject_reason? }` where `action` is one of
`approve` | `reject` | `start` | `finish`.

- `approve` / `reject` require a correct `SECTION_PASSWORD` and a non-empty `approver`;
  `reject` additionally requires `reject_reason`. Both set `decided_at`.
- `start` / `finish` require a correct `DEVELOPER_PASSWORD`. `finish` sets `finished_at`.
- Wrong password → 401 with a generic message (no hint about which part was wrong).
- Transition not allowed from the row's current status → 409.
- The current status is read from the database inside the same request, so two people acting
  at once cannot both approve — the second gets the 409.

After any successful `POST` or `PATCH`, the page refetches `GET /api/open-request` rather
than patching its local copy. The list is at most a few dozen rows, and refetching means the
displayed state always matches the database — including any change another person made in
the meantime.

## Page Layout

One page, top to bottom, matching the existing dark portal theme (`#07122a` surfaces,
`#d9e2ff` text, `#EB0A1E` Toyota red accent) and the card conventions already used on
`/dashboard` and `/reports`. Design follows minimalist principles: generous whitespace,
color used only to carry meaning (status), no decorative chrome.

### 1. Hero

Mirrors `HeroSection.tsx`'s treatment but without the app grid — headline, slogan, one line
of explanation, then straight into content.

```
                    OPEN REQUEST
          Fitur Kurang? Tinggal Minta.

   Setiap masukan dari line bisa jadi fitur berikutnya.
   Ajukan, disetujui Section, dikerjakan developer.
```

"REQUEST" takes the red accent, the way "Tools" does in `Casting Tools`. Same
`font-display`, same `clamp()` sizing, same soft text-shadow.

### 2. Tutorial statis

Four numbered steps in a row (stacking to a single column on mobile), each a small card with
an icon, a title, and one sentence:

1. **Isi Request** — Tulis nama, line, aplikasi, dan fitur yang Anda butuhkan.
2. **Section Menyetujui** — Section meninjau dan menyetujui lewat password.
3. **Developer Mengerjakan** — Request yang disetujui masuk antrean pengerjaan.
4. **Selesai** — Fitur tayang, status berubah jadi Selesai.

Below the steps, a **"Contoh Nyata"** block showing the real before → after case from the
Problem Produksi app, using the two screenshots the user supplied:

- **Sebelum** — the table without a "PIC NAME" column (red arrow marking the gap).
- **Sesudah** — the same table with "PIC NAME" added.
- Caption: *"User merasa tabel Problem Produksi perlu kolom Nama PIC. Request diajukan,
  disetujui Section, dikerjakan developer — dan sekarang kolomnya ada."*

The two images stack vertically on mobile and sit side by side on desktop, each labelled
with a small SEBELUM / SESUDAH badge. They are static assets, not live data.

**Required from the user:** these two screenshots must be saved into the repository as
`public/tutorial/open-request-before.jpg` and `public/tutorial/open-request-after.jpg`.
They cannot be extracted from the chat automatically. Until they exist, the block renders
its captions with a neutral placeholder frame rather than a broken image.

### 3. Form Open Request

A single card, fields stacked vertically:

| Field | Control | Notes |
|---|---|---|
| Nama Pemohon | text input | required |
| Line | select | the 8 `REQUEST_LINES`, required |
| Aplikasi | select | active apps from `useAppStore()`, required |
| Detail Request | textarea, 4 rows | required, min 10 chars |

The Aplikasi dropdown reuses exactly the pattern in `FeedbackForm.tsx:76-88` — it reads the
live app list from `AppContext`, so it stays in sync as apps are added or removed. Unlike
the feedback form, the app here is **required**: a feature request always belongs to a
specific app.

Submit button bottom-right in Toyota red, disabled while sending. On success the form
collapses into a confirmation ("Request terkirim — menunggu persetujuan Section") and the
list below refreshes so the user immediately sees their own entry at the top.

### 4. Daftar Request

Filter chips across the top: **Semua · Menunggu · Disetujui · Dikerjakan · Selesai · Ditolak**,
each showing a count. Filtering is client-side over the already-fetched list — the dataset is
small and this keeps it instant.

Below, one card per request (one column on mobile, two on desktop):

```
┌──────────────────────────────────────────────┐
│ ● MENUNGGU                        30 Jul 2026│
│                                              │
│ Problem Produksi                             │
│ Tolong tambahkan kolom Nama PIC di tabel …   │
│                                              │
│ Budi · Core Making        [Setujui] [Tolak]  │
└──────────────────────────────────────────────┘
```

- Status badge top-left with its dot colour; submission date top-right.
- App name as the card's heading, then the request text (clamped to 3 lines, expandable).
- Requester · line on the footer row, with any available action buttons opposite.
- Approved/finished cards additionally show `Disetujui oleh <approver>`; rejected cards show
  the rejection reason; finished cards show the completion date.

**Status colours**, all drawn from the palette already in use across the portal:

| Status | Colour | Reused from |
|---|---|---|
| Menunggu | `#F59E0B` amber | "On Progress" in the KPI bars |
| Disetujui | `#3B82F6` blue | Finishing line / Fabrikasi status |
| Dikerjakan | `#8B5CF6` purple | Mel-Pour-Analys line colour |
| Selesai | `#10B981` green | "Finish" in the KPI bars |
| Ditolak | `#EB0A1E` red | Toyota red / high risk |

### Action buttons — who sees what

- **Setujui / Tolak** appear on `menunggu` cards for everyone; clicking opens the password
  modal. Visible-but-gated is deliberate: it tells users the approval step is real without
  letting them perform it.
- **Mulai Kerjakan** (on `disetujui`) and **Tandai Selesai** (on `dikerjakan`) appear only
  when `isAdmin` is true — no modal, they fire directly using the stored session password.

### Password modal

One small reusable modal for Section actions: a name field, a password field, a reason field
(reject only), and Batal/Konfirmasi. A wrong password shows an inline error and keeps the
modal open with the typed name preserved.

## Error Handling

Matches the contract used by every other section of this portal: nothing throws into the
React tree, and one failing piece never takes down the page.

- List fetch fails → the list area shows "Daftar request tidak tersedia." The hero, tutorial,
  and form stay fully usable.
- Submit fails → inline error under the form, entered values preserved so nothing is retyped.
- Wrong password → inline error inside the modal.
- Conflicting transition (409) → a short message telling the user the request has already
  moved on, then the list refreshes to show its real state.
- Missing env var → 503, and the UI notes that approvals are temporarily unavailable.

## Testing

This project has no automated test suite and none is added here — consistent with the four
dashboard sections built before it. Verification is manual:

- `npx tsc --noEmit` and `npx eslint` clean on all new and changed files.
- `curl` the three endpoints: list returns an array; POST with a missing field returns 400;
  PATCH with a wrong password returns 401; PATCH with an illegal transition returns 409.
- In the browser: submit a request and confirm it appears as Menunggu; approve it with the
  correct password and confirm it becomes Disetujui with the approver's name; log in as
  admin and walk it through Dikerjakan and Selesai; reject a second request and confirm the
  reason displays.
- Confirm the filter chips' counts match the cards shown.
- Confirm the page is usable at mobile width — cards readable with no horizontal scrolling,
  which is the specific failing of the wide tables in the reference screenshots.

## Deployment

`SECTION_PASSWORD` and `DEVELOPER_PASSWORD` must be added to `.env.local` locally and to the
Netlify environment before this works in production, and documented in `DEPLOY.md` alongside
the existing entries.

The `feature_requests` table is created by `npm run db:push`. Note that this project's
`db:push` is **not** a Drizzle migration generator — `scripts/setup-db.ts` is a hand-written,
idempotent script of `CREATE TABLE IF NOT EXISTS` statements. Adding the table to
`src/db/schema.ts` alone does nothing at runtime; the matching `CREATE TABLE IF NOT EXISTS
feature_requests (…)` block must also be appended to `scripts/setup-db.ts`, together with
indexes on `status` and `created_at DESC` (mirroring what the script already does for
`feedback`). Because every statement is `IF NOT EXISTS`, re-running it is safe and leaves
existing tables untouched.
