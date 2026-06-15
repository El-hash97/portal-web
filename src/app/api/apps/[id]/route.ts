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
    const id   = parseInt(idParam, 10);
    const body = await request.json();

    const [updated] = await db
      .update(apps)
      .set(body)
      .where(eq(apps.id, id))
      .returning();

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
