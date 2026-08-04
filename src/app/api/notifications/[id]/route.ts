import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { neonSql } from '@/db';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-session';

async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

async function notificationId(params: Promise<{ id: string }>): Promise<number | null> {
  const { id } = await params;
  const parsed = Number.parseInt(id, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminRequest()) return NextResponse.json({ error: 'Akses admin diperlukan' }, { status: 401 });
  const id = await notificationId(params);
  if (!id) return NextResponse.json({ error: 'ID notifikasi tidak valid' }, { status: 400 });

  try {
    const { status } = await request.json();
    if (status !== 'active' && status !== 'completed') {
      return NextResponse.json({ error: 'Status notifikasi tidak valid' }, { status: 400 });
    }
    const rows = status === 'completed'
      ? await neonSql`UPDATE notifications SET status = 'completed', completed_at = NOW() WHERE id = ${id} RETURNING id, title, content, status, created_at, completed_at`
      : await neonSql`UPDATE notifications SET status = 'active', completed_at = NULL WHERE id = ${id} RETURNING id, title, content, status, created_at, completed_at`;
    if (!rows[0]) return NextResponse.json({ error: 'Informasi tidak ditemukan' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('[PATCH /api/notifications/:id]', error);
    return NextResponse.json({ error: 'Gagal mengubah informasi' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminRequest()) return NextResponse.json({ error: 'Akses admin diperlukan' }, { status: 401 });
  const id = await notificationId(params);
  if (!id) return NextResponse.json({ error: 'ID notifikasi tidak valid' }, { status: 400 });

  try {
    const rows = await neonSql`DELETE FROM notifications WHERE id = ${id} RETURNING id`;
    if (!rows[0]) return NextResponse.json({ error: 'Informasi tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/notifications/:id]', error);
    return NextResponse.json({ error: 'Gagal menghapus informasi' }, { status: 500 });
  }
}
