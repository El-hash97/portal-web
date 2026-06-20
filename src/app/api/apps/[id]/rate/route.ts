import { NextResponse } from 'next/server';
import { neonSql } from '@/db';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const appId = parseInt(idParam, 10);
    if (isNaN(appId)) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    const { device_id, rating } = await request.json();
    if (!device_id || typeof rating !== 'number' || rating < 0 || rating > 5) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
    }

    // rating=0 means cancel — delete the row
    if (rating === 0) {
      await neonSql`DELETE FROM app_ratings WHERE app_id = ${appId} AND device_id = ${device_id}`;
      return NextResponse.json({ deleted: true });
    }

    const rows = await neonSql`
      INSERT INTO app_ratings (app_id, device_id, rating)
      VALUES (${appId}, ${device_id}, ${rating})
      ON CONFLICT (app_id, device_id) DO UPDATE
        SET rating = EXCLUDED.rating, rated_at = NOW()
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[POST /api/apps/:id/rate]', err);
    return NextResponse.json({ error: 'Gagal menyimpan rating' }, { status: 500 });
  }
}
