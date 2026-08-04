import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { neonSql } from '@/db';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET() {
  try {
    const rows = await neonSql`
      SELECT id, title, content, status, created_at, completed_at
      FROM notifications
      ORDER BY created_at DESC
    `;
    return NextResponse.json(rows, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[GET /api/notifications]', error);
    return NextResponse.json({ error: 'Gagal memuat informasi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await isAdminRequest()) return NextResponse.json({ error: 'Akses admin diperlukan' }, { status: 401 });

  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    if (!title || !content) return NextResponse.json({ error: 'Judul dan isi informasi wajib diisi' }, { status: 400 });
    if (title.length > 160 || content.length > 5000) return NextResponse.json({ error: 'Panjang informasi melebihi batas' }, { status: 400 });

    const rows = await neonSql`
      INSERT INTO notifications (title, content)
      VALUES (${title}, ${content})
      RETURNING id, title, content, status, created_at, completed_at
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('[POST /api/notifications]', error);
    return NextResponse.json({ error: 'Gagal menyimpan informasi' }, { status: 500 });
  }
}
