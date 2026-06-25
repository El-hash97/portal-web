import { NextResponse } from 'next/server';
import { neonSql } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const appId = parseInt(idParam, 10);

  if (isNaN(appId)) {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'));
  }

  const rows = await neonSql`
    SELECT link, aktif, maintenance FROM apps WHERE id = ${appId} LIMIT 1
  ` as { link: string | null; aktif: boolean; maintenance: boolean }[];

  const app = rows[0];

  if (!app || !app.aktif || app.maintenance || !app.link || app.link === '#') {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'));
  }

  // Await the insert so the click is recorded reliably on serverless
  // (Netlify) — the function may freeze right after returning the redirect,
  // dropping any pending fire-and-forget write. Shared-link opens are the
  // exact case we must not miss, so a wrapped failure must not block redirect.
  try {
    await neonSql`INSERT INTO app_clicks (app_id) VALUES (${appId})`;
  } catch (err) {
    console.error('[GET /go/:id] click insert failed', err);
  }

  return NextResponse.redirect(app.link);
}
