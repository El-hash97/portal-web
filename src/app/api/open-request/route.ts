import { NextResponse } from 'next/server';
import { neonSql } from '@/db';
import { REQUEST_LINES } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await neonSql`
      SELECT
        fr.id, fr.requester, fr.line_name, fr.app_id,
        a.nama AS app_nama,
        fr.request_text, fr.photo_data, fr.status, fr.approver, fr.reject_reason,
        fr.created_at, fr.decided_at, fr.finished_at
      FROM feature_requests fr
      LEFT JOIN apps a ON fr.app_id = a.id
      ORDER BY
        CASE fr.status
          WHEN 'menunggu' THEN 0
          WHEN 'disetujui' THEN 1
          WHEN 'dikerjakan' THEN 2
          WHEN 'selesai' THEN 3
          WHEN 'ditolak' THEN 4
          ELSE 5
        END,
        fr.created_at DESC
    `;
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[GET /api/open-request]', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requester = typeof body.requester === 'string' ? body.requester.trim() : '';
    const lineName = typeof body.line_name === 'string' ? body.line_name : '';
    const appId = Number(body.app_id);
    const requestText = typeof body.request_text === 'string' ? body.request_text.trim() : '';
    const photoData = typeof body.photo_data === 'string' && body.photo_data ? body.photo_data : null;

    if (!requester) {
      return NextResponse.json({ error: 'Nama pemohon wajib diisi' }, { status: 400 });
    }
    if (!REQUEST_LINES.includes(lineName as (typeof REQUEST_LINES)[number])) {
      return NextResponse.json({ error: 'Line tidak valid' }, { status: 400 });
    }
    if (!Number.isInteger(appId) || appId <= 0) {
      return NextResponse.json({ error: 'Aplikasi wajib dipilih' }, { status: 400 });
    }
    if (!requestText) {
      return NextResponse.json({ error: 'Detail request wajib diisi' }, { status: 400 });
    }
    // Sanity-check the shape (a real image data URI) and cap size server-side
    // too — the client already caps the source file at 2MB before encoding,
    // this is defense in depth against a payload sent directly to the API.
    if (photoData && !/^data:image\/(png|jpe?g|webp|gif);base64,/.test(photoData)) {
      return NextResponse.json({ error: 'Format foto tidak didukung' }, { status: 400 });
    }
    if (photoData && photoData.length > 3_000_000) {
      return NextResponse.json({ error: 'Ukuran foto terlalu besar' }, { status: 400 });
    }

    const rows = await neonSql`
      INSERT INTO feature_requests (requester, line_name, app_id, request_text, photo_data)
      VALUES (${requester}, ${lineName}, ${appId}, ${requestText}, ${photoData})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('[POST /api/open-request]', err);
    return NextResponse.json({ error: 'Gagal menyimpan request' }, { status: 500 });
  }
}
