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

  // Fire-and-forget — don't await so redirect is instant
  neonSql`INSERT INTO app_clicks (app_id) VALUES (${appId})`.catch(() => {});

  return NextResponse.redirect(app.link);
}
