import { NextResponse } from 'next/server';
import { adminSessionCookie, ADMIN_SESSION_COOKIE, createAdminSession, hasValidAdminCredentials, type AdminRole } from '@/lib/admin-session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    // Callers choose what the resulting session can reach: logging in from the
    // Notification page passes scope: 'notification', which never unlocks the
    // full /admin panel. Anything else (including no scope, e.g. /admin's own
    // login form) defaults to the existing full-access 'developer' role.
    const scope: AdminRole = body.scope === 'notification' ? 'notification' : 'developer';

    const expectedPasswordVar = scope === 'developer' ? process.env.DEVELOPER_PASSWORD : process.env.ADMIN_PASSWORD;
    if (!process.env.ADMIN_USERNAME || !expectedPasswordVar) {
      return NextResponse.json({ error: 'Login admin belum dikonfigurasi' }, { status: 503 });
    }
    if (!hasValidAdminCredentials(username, password, scope)) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const session = createAdminSession(scope);
    if (!session) return NextResponse.json({ error: 'Sesi admin belum dikonfigurasi' }, { status: 503 });

    const response = NextResponse.json({ ok: true, role: scope });
    response.cookies.set(ADMIN_SESSION_COOKIE, session, adminSessionCookie);
    return response;
  } catch {
    return NextResponse.json({ error: 'Data login tidak valid' }, { status: 400 });
  }
}
