import { NextResponse } from 'next/server';
import { neonSql } from '@/db';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const appId = parseInt(idParam, 10);
    if (isNaN(appId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    await neonSql`INSERT INTO app_clicks (app_id) VALUES (${appId})`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/apps/:id/click]', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
