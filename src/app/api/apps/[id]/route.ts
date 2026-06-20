import { NextResponse } from 'next/server';
import { neonSql, db } from '@/db';
import { apps } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);
    if (isNaN(id)) return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });

    const body = await request.json();

    // Use neon tagged template directly — bypasses Drizzle ORM serialization
    // which has a known issue with boolean/integer params on the neon-http driver.
    //
    // Two-path: if `nama` is present the caller is submitting the full form
    // (all fields known); otherwise it's a partial toggle (aktif / maintenance only).
    // COALESCE(provided, current_column) preserves existing values for absent fields.
    let rows: Record<string, unknown>[];
    if (body.nama !== undefined) {
      rows = await neonSql`
        UPDATE apps SET
          nama        = ${body.nama},
          kategori    = ${body.kategori},
          deskripsi   = ${body.deskripsi},
          link        = ${body.link},
          icon        = ${body.icon},
          logo        = ${body.logo ?? null},
          aktif       = ${body.aktif ?? true},
          maintenance = COALESCE(${body.maintenance ?? null}, maintenance)
        WHERE id = ${id}
        RETURNING *
      `;
    } else {
      rows = await neonSql`
        UPDATE apps SET
          aktif       = COALESCE(${body.aktif       ?? null}, aktif),
          maintenance = COALESCE(${body.maintenance ?? null}, maintenance)
        WHERE id = ${id}
        RETURNING *
      `;
    }

    if (!rows[0]) return NextResponse.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (err) {
    const cause = (err as Record<string, unknown>).cause;
    const detail = err instanceof Error
      ? `${err.message} | cause: ${JSON.stringify(cause)}`
      : String(err);
    console.error('[PATCH /api/apps/:id]', detail);
    return NextResponse.json({ error: 'Gagal mengupdate aplikasi', detail }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);

    await db.delete(apps).where(eq(apps.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/apps/:id]', err);
    return NextResponse.json({ error: 'Gagal menghapus aplikasi' }, { status: 500 });
  }
}
