import { NextResponse } from 'next/server';
import { neonSql } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await neonSql`
      SELECT f.id, f.app_id, f.pesan, f.status, f.device_id, f.created_at,
             a.nama AS app_nama
      FROM feedback f
      LEFT JOIN apps a ON f.app_id = a.id
      ORDER BY
        CASE f.status WHEN 'baru' THEN 0 WHEN 'dibaca' THEN 1 ELSE 2 END,
        f.created_at DESC
    `;
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[GET /api/feedback]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { app_id, pesan, device_id } = await request.json();
    if (!pesan?.trim()) return NextResponse.json({ error: 'Pesan kosong' }, { status: 400 });

    const rows = await neonSql`
      INSERT INTO feedback (app_id, pesan, device_id)
      VALUES (${app_id ?? null}, ${pesan.trim()}, ${device_id ?? null})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('[POST /api/feedback]', err);
    return NextResponse.json({ error: 'Gagal menyimpan' }, { status: 500 });
  }
}
