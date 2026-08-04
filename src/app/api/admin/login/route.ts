import { NextResponse } from 'next/server';
import { adminSessionCookie, ADMIN_SESSION_COOKIE, createAdminSession, hasValidAdminCredentials } from '@/lib/admin-session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Login admin belum dikonfigurasi' }, { status: 503 });
    }
    if (!hasValidAdminCredentials(username, password)) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const session = createAdminSession();
    if (!session) return NextResponse.json({ error: 'Sesi admin belum dikonfigurasi' }, { status: 503 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, session, adminSessionCookie);
    return response;
  } catch {
    return NextResponse.json({ error: 'Data login tidak valid' }, { status: 400 });
  }
}
