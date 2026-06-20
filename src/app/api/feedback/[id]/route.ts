import { NextResponse } from 'next/server';
import { neonSql } from '@/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    const { status } = await request.json();
    if (!['baru', 'dibaca', 'selesai'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    const rows = await neonSql`
      UPDATE feedback SET status = ${status} WHERE id = ${id} RETURNING *
    `;
    if (!rows[0]) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[PATCH /api/feedback/:id]', err);
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 });
  }
}
