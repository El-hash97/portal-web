# Dashboard Voice Member Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Voice Member" section to `/dashboard` showing a top-3 champion podium plus a rank 4–10 table, ranked by count of `voice_members` submissions per person, sourced live from the Voice Member app's Supabase backend.

**Architecture:** A single server-side API route joins `voice_members` (counted, grouped by sender) with `member_accounts` (for profile photos) through a direct Postgres connection, returning an already-ranked, capped-at-10 array. Two client components — a podium and a table — independently fetch that one endpoint and each decide what slice of the ranking to render, sharing a small avatar component between them.

**Tech Stack:** Next.js 16 App Router, React 19 client components, `postgres` (already installed, no new dependency), Tailwind CSS, `lucide-react` icons.

## Global Constraints

- Source data is the `voice_members` and `member_accounts` tables on the Voice Member Supabase project. Read **only** `member_name` (aggregated to a count) and `profile_photo`. Never select or return `voice_text`, `photo_url`, `input_date`, `noreg`, or `line_name` — this section is a ranking, not a submission log.
- Env var is `VOICE_MEMBER_SUPABASE`, already present in `.env.local` and verified live. It must **never** gain a `NEXT_PUBLIC_` prefix and must only be read inside server-side route handlers.
- Ranking is by count of `voice_members` rows per `member_name`, descending, **capped at 10** (matches the source app's own `MemberBarChart` cutoff).
- The podium (ranks 1–3) renders **only when the API returns 3 or more entries**. With fewer than 3, the podium is hidden entirely and the table renders **all** entries instead of "rank 4+".
- Each entry shows `profile_photo` if set, otherwise a circular initial-letter avatar (first character of `member_name`, uppercased).
- Failure semantics match the existing sections: route logs the error and returns `[]` with HTTP 500; each component catches the non-OK response and renders an inline unavailable message. Nothing throws into the React tree.
- No automated test suite exists in this project (no Jest/Vitest/Playwright config) and none is added. Verification is `npx tsc --noEmit`, `npx eslint`, `curl` against a running dev server, and a browser check.

---

### Task 1: Postgres client and top-senders API route

**Files:**
- Create: `src/db/voiceMember.ts`
- Create: `src/app/api/voice-member/top-senders/route.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `voiceMemberSql` — a `postgres` client exported from `@/db/voiceMember`. And `GET /api/voice-member/top-senders` returning `Array<{ rank: number; member_name: string; total: number; profile_photo: string | null }>`, ordered by `total` descending, length ≤ 10. Tasks 2 and 3 both consume this shape.

- [ ] **Step 1: Create the client module**

Create `src/db/voiceMember.ts`:

```ts
import postgres from 'postgres';

// Separate Supabase Postgres instance owned by the Voice Member app —
// read-only access for surfacing its top-senders ranking on the portal.
export const voiceMemberSql = postgres(process.env.VOICE_MEMBER_SUPABASE ?? '', { ssl: 'require' });
```

- [ ] **Step 2: Create the API route**

Create `src/app/api/voice-member/top-senders/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { voiceMemberSql } from '@/db/voiceMember';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await voiceMemberSql`
      SELECT
        vm.member_name,
        COUNT(*)::int AS total,
        ma.profile_photo
      FROM voice_members vm
      LEFT JOIN member_accounts ma ON ma.nama = vm.member_name
      GROUP BY vm.member_name, ma.profile_photo
      ORDER BY total DESC
      LIMIT 10
    `;

    const ranked = rows.map((row, i) => ({
      rank: i + 1,
      member_name: row.member_name as string,
      total: row.total as number,
      profile_photo: (row.profile_photo as string | null) ?? null,
    }));

    return NextResponse.json(ranked, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[GET /api/voice-member/top-senders]', err);
    return NextResponse.json([], { status: 500 });
  }
}
```

`rank` is assigned by array position (1-based) after `ORDER BY total DESC` — no SQL window function is needed since the whole result (≤10 rows) already arrives in the intended order.

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/db/voiceMember.ts src/app/api/voice-member/top-senders/route.ts`
Expected: no errors.

- [ ] **Step 4: Verify against the live backend**

Run (background): `npm run dev`
Then: `curl -s http://localhost:3000/api/voice-member/top-senders`
Expected: a JSON array of up to 10 objects, each with `rank`, `member_name`, `total`, `profile_photo`, sorted by `total` descending. Against current live data that's 3 entries (`SIGIT WIDYO NUGROHO` total 2, then two others at total 1) — exact values track live data, so the real check is that `rank` is `1, 2, 3, ...` in order and `total` is non-increasing down the array.

- [ ] **Step 5: Commit**

```bash
git add src/db/voiceMember.ts src/app/api/voice-member/top-senders/route.ts
git commit -m "feat: add Voice Member Postgres client and top-senders route"
```

---

### Task 2: Shared avatar and podium component

**Files:**
- Create: `src/components/VoiceMemberAvatar.tsx`
- Create: `src/components/VoiceMemberPodium.tsx`

**Interfaces:**
- Consumes: `CARD_BORDER`, `TEXT_PRIMARY`, `TEXT_MUTED` from `@/lib/chartTheme` (existing); `GET /api/voice-member/top-senders` (Task 1).
- Produces: `export function VoiceMemberAvatar({ name, photo, size }: { name: string; photo: string | null; size: number })` — used by Task 3 as well. And `export function VoiceMemberPodium()` — a client component with no props, rendered by Task 4.

- [ ] **Step 1: Create the shared avatar component**

Create `src/components/VoiceMemberAvatar.tsx`:

```tsx
"use client";

export function VoiceMemberAvatar({
  name,
  photo,
  size,
}: {
  name: string;
  photo: string | null;
  size: number;
}) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: "rgba(217,226,255,0.16)",
        color: "#d9e2ff",
        fontSize: Math.round(size * 0.4),
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
```

- [ ] **Step 2: Create the podium component**

Create `src/components/VoiceMemberPodium.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { CARD_BORDER, TEXT_PRIMARY, TEXT_MUTED } from "@/lib/chartTheme";
import { VoiceMemberAvatar } from "@/components/VoiceMemberAvatar";

interface Sender {
  rank: number;
  member_name: string;
  total: number;
  profile_photo: string | null;
}

const RANK_COLOR: Record<1 | 2 | 3, string> = {
  1: "#F59E0B",
  2: "#C0C7D6",
  3: "#C97A44",
};

const RANK_HEIGHT: Record<1 | 2 | 3, number> = {
  1: 96,
  2: 72,
  3: 56,
};

/** CSS flex `order`: rank 1 renders center, rank 2 to its left, rank 3 to its right. */
const RANK_VISUAL_ORDER: Record<1 | 2 | 3, number> = {
  1: 2,
  2: 1,
  3: 3,
};

export function VoiceMemberPodium() {
  const [data, setData] = useState<Sender[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/voice-member/top-senders")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Sender[]) => setData(d))
      .catch(() => setFailed(true));
  }, []);

  // The table component owns the loading/failed/empty states for this
  // section; the podium simply doesn't render until there's a confirmed
  // top 3, and says nothing on failure.
  if (failed || !data || data.length < 3) return null;

  const top3 = data.slice(0, 3) as [Sender, Sender, Sender];

  return (
    <div
      className="font-data rounded-xl px-3 sm:px-4 pt-3 sm:pt-3.5 pb-3 sm:pb-3.5 mt-3"
      style={{ border: `1px solid ${CARD_BORDER}` }}
    >
      <div className="flex items-center gap-2 pl-1 sm:pl-2 mb-4">
        <Trophy size={15} style={{ color: TEXT_MUTED }} />
        <span
          className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-widest"
          style={{ color: TEXT_MUTED }}
        >
          Top Pengirim
        </span>
      </div>

      <div className="flex items-end justify-center gap-4 sm:gap-8 px-2">
        {top3.map((s) => {
          const rank = s.rank as 1 | 2 | 3;
          return (
            <div
              key={s.member_name}
              className="flex flex-col items-center gap-2"
              style={{ order: RANK_VISUAL_ORDER[rank] }}
            >
              <VoiceMemberAvatar name={s.member_name} photo={s.profile_photo} size={rank === 1 ? 56 : 44} />
              <span
                className="text-[12px] sm:text-[13px] font-bold text-center max-w-[100px] truncate"
                style={{ color: TEXT_PRIMARY }}
              >
                {s.member_name}
              </span>
              <span className="text-[11px]" style={{ color: TEXT_MUTED }}>
                {s.total} Voice Member
              </span>
              <div
                className="w-full rounded-t-lg flex items-start justify-center pt-2"
                style={{
                  height: RANK_HEIGHT[rank],
                  background: `${RANK_COLOR[rank]}1f`,
                  border: `1px solid ${RANK_COLOR[rank]}40`,
                  minWidth: 72,
                }}
              >
                <span className="text-[20px] font-bold" style={{ color: RANK_COLOR[rank] }}>
                  {s.rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/components/VoiceMemberAvatar.tsx src/components/VoiceMemberPodium.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/VoiceMemberAvatar.tsx src/components/VoiceMemberPodium.tsx
git commit -m "feat: add VoiceMemberAvatar and VoiceMemberPodium components"
```

---

### Task 3: Ranking table component

**Files:**
- Create: `src/components/VoiceMemberTable.tsx`

**Interfaces:**
- Consumes: `CARD_BORDER`, `TEXT_PRIMARY`, `TEXT_MUTED` from `@/lib/chartTheme`; `VoiceMemberAvatar` from `@/components/VoiceMemberAvatar` (Task 2); `GET /api/voice-member/top-senders` (Task 1).
- Produces: `export function VoiceMemberTable()` — a client component with no props, rendered by Task 4.

- [ ] **Step 1: Create the component**

Create `src/components/VoiceMemberTable.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { ListOrdered } from "lucide-react";
import { CARD_BORDER, TEXT_PRIMARY, TEXT_MUTED } from "@/lib/chartTheme";
import { VoiceMemberAvatar } from "@/components/VoiceMemberAvatar";

interface Sender {
  rank: number;
  member_name: string;
  total: number;
  profile_photo: string | null;
}

const SKELETON_ROWS = 4;

export function VoiceMemberTable() {
  const [data, setData] = useState<Sender[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/voice-member/top-senders")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Sender[]) => setData(d))
      .catch(() => setFailed(true));
  }, []);

  const hasPodium = (data?.length ?? 0) >= 3;
  // Podium already covers ranks 1-3; this table shows the rest. When there
  // are fewer than 3 senders total, the podium isn't showing at all, so
  // the table shows everyone instead of an empty "rank 4+" slice.
  const rows = data ? (hasPodium ? data.slice(3) : data) : [];

  return (
    <div
      className="font-data rounded-xl px-3 sm:px-4 pt-3 sm:pt-3.5 pb-3 sm:pb-3.5 mt-3"
      style={{ border: `1px solid ${CARD_BORDER}` }}
    >
      <div className="flex items-center gap-2 pl-1 sm:pl-2 mb-3">
        <ListOrdered size={15} style={{ color: TEXT_MUTED }} />
        <span
          className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-widest"
          style={{ color: TEXT_MUTED }}
        >
          {hasPodium ? "Peringkat Selanjutnya" : "Pengirim Voice Member"}
        </span>
      </div>

      {failed ? (
        <div className="flex items-center justify-center py-10">
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Data Voice Member tidak tersedia.
          </span>
        </div>
      ) : !data ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div
              key={i}
              className="h-9 rounded-lg animate-pulse"
              style={{ background: "rgba(217,226,255,0.08)" }}
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Belum ada data.
          </span>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Belum ada data lain.
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                <th className="text-left py-2 pr-2 font-medium w-10" style={{ color: TEXT_MUTED }}>
                  #
                </th>
                <th className="text-left py-2 pr-2 font-medium" style={{ color: TEXT_MUTED }}>
                  Nama
                </th>
                <th className="text-right py-2 pl-2 font-medium" style={{ color: TEXT_MUTED }}>
                  Total Voice Member
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.member_name} style={{ borderBottom: "1px solid rgba(47,57,82,0.5)" }}>
                  <td className="py-2 pr-2" style={{ color: TEXT_MUTED }}>
                    {s.rank}
                  </td>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      <VoiceMemberAvatar name={s.member_name} photo={s.profile_photo} size={28} />
                      <span className="font-medium" style={{ color: TEXT_PRIMARY }}>
                        {s.member_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pl-2 text-right font-bold" style={{ color: TEXT_PRIMARY }}>
                    {s.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/components/VoiceMemberTable.tsx`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/VoiceMemberTable.tsx
git commit -m "feat: add VoiceMemberTable component"
```

---

### Task 4: Wire the section into the dashboard

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `DEPLOY.md`

**Interfaces:**
- Consumes: `VoiceMemberPodium` (Task 2), `VoiceMemberTable` (Task 3), and the existing `DashboardAppSection`.
- Produces: the finished `/dashboard` page with all four app sections.

- [ ] **Step 1: Add the imports and section**

In `src/app/dashboard/page.tsx`, add these imports alongside the existing ones:

```tsx
import { VoiceMemberPodium } from '@/components/VoiceMemberPodium';
import { VoiceMemberTable } from '@/components/VoiceMemberTable';
```

Then add this block directly after the existing `Kaizen Order Sheet` `<DashboardAppSection>`, before the closing `</main>`:

```tsx
<DashboardAppSection
  name="Voice Member"
  blurb="Data diambil langsung dari aplikasi Voice Member — peringkat pengirim aspirasi terbanyak."
>
  <VoiceMemberPodium />
  <VoiceMemberTable />
</DashboardAppSection>
```

- [ ] **Step 2: Document the new deployment variable**

In `DEPLOY.md`, find the section listing required environment variables (it already documents `DATABASE_URL`, `E_HENKATEN`, `PP_INSFORGE_URL`, `PP_INSFORGE_API_KEY`, `KAIZEN_SUPABASE_URL`, `KAIZEN_SUPABASE_ANON_KEY`). Add this entry alongside them, matching the surrounding formatting and language:

```markdown
- `VOICE_MEMBER_SUPABASE` — **baru**, wajib ditambahkan manual. Connection string Postgres (transaction pooler) milik aplikasi Voice Member
```

Then add this note directly below, mirroring the existing fallback notes for the other sections:

```markdown
Tanpa variabel di atas, bagian "Voice Member" di halaman `/dashboard` akan menampilkan status tidak tersedia (sudah ada fallback di kodenya), tidak bikin error, cuma datanya tidak muncul.
```

- [ ] **Step 3: Typecheck and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/app/dashboard/page.tsx`
Expected: no errors.

- [ ] **Step 4: Verify the full page in a browser**

Run (background, if not already running): `npm run dev`
Then open `http://localhost:3000/dashboard` and confirm:

1. Four sections render in order: "Henkaten", "Problem Produksi", "Kaizen Order Sheet", "Voice Member".
2. With current live data (3 unique senders), the podium shows all 3 ranks, and the table below shows `Belum ada data lain.`
3. Each podium slot and table row shows either a real photo or a circular initial-letter avatar.
4. Rank 1 renders center and tallest; ranks 2 and 3 flank it, shorter.

- [ ] **Step 5: Verify the offline fallback**

Stop the dev server. Temporarily rename `VOICE_MEMBER_SUPABASE` to `VOICE_MEMBER_SUPABASE_DISABLED` in `.env.local`, restart the dev server, and reload `/dashboard`.
Expected: the podium does not render (fails silently), the table shows `Data Voice Member tidak tersedia.`, the other three sections are unaffected, and the page does not crash.

Restore the variable name, restart, and confirm live data returns. Do not leave `.env.local` modified when done — verify the restoration actually worked (a fresh `curl http://localhost:3000/api/voice-member/top-senders` should return real entries, not `[]`) before finishing this task.

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/page.tsx DEPLOY.md
git commit -m "feat: add Voice Member section to dashboard"
```

---

## Self-Review Notes

**Spec coverage.** Data source, join query, and env var (§ Data Source) → Task 1. Ranking cutoff and rank-assignment logic (§ Ranking Rules) → Task 1. Podium's ≥3 gating and visual layout (§ Component 3) → Task 2. Table's <3-vs-≥3 branching and empty states (§ Component 4) → Task 3. Dashboard composition and deployment docs (§ Components 5, § Deployment) → Task 4. Error handling contract is threaded through Tasks 1, 2, and 3. Testing steps mirror the spec's Testing section throughout, including the specific <3/≥3 behaviors called out there.

**Placeholder scan.** No TBD/TODO markers; every code step contains complete literal code.

**Type consistency.** `Sender { rank, member_name, total, profile_photo }` is declared identically in Task 2 (`VoiceMemberPodium.tsx`) and Task 3 (`VoiceMemberTable.tsx`), matching the API route's mapped response in Task 1 field-for-field. `VoiceMemberAvatar`'s prop signature (`name: string; photo: string | null; size: number`) is defined once in Task 2 and consumed identically in Task 3. All new components use named exports, matching the established convention from every earlier dashboard section this branch has added.
