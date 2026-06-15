import { NextResponse } from 'next/server';
import { db } from '@/db';
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

    // Only pass known schema fields to Drizzle to avoid runtime errors
    const update: Record<string, unknown> = {};
    if (typeof body.nama      === 'string')  update.nama      = body.nama;
    if (typeof body.kategori  === 'string')  update.kategori  = body.kategori;
    if (typeof body.deskripsi === 'string')  update.deskripsi = body.deskripsi;
    if (typeof body.link      === 'string')  update.link      = body.link;
    if (typeof body.icon      === 'string')  update.icon      = body.icon;
    if ('logo' in body)                      update.logo      = body.logo ?? null;
    if (typeof body.aktif     === 'boolean') update.aktif     = body.aktif;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'Tidak ada field yang diupdate' }, { status: 400 });
    }

    const [updated] = await db
      .update(apps)
      .set(update)
      .where(eq(apps.id, id))
      .returning();

    if (!updated) return NextResponse.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/apps/:id]', err);
    return NextResponse.json({ error: 'Gagal mengupdate aplikasi' }, { status: 500 });
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
