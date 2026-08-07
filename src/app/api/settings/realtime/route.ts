import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { neonSql } from '@/db';
import { ADMIN_SESSION_COOKIE, isDeveloperSession } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

const REALTIME_KEY = 'dashboard_realtime';

// This is an app-wide "Pengaturan" control (AdminPanel's Pengaturan tab) —
// requires the full developer role, not just any admin session, so a
// notification-scoped login can't flip it via a direct API call.
async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  return isDeveloperSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET() {
  try {
    const rows = await neonSql`SELECT value FROM settings WHERE key = ${REALTIME_KEY}`;
    const enabled = rows.length === 0 ? true : rows[0].value === 'true';
    return NextResponse.json({ enabled }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[GET /api/settings/realtime]', err);
    return NextResponse.json({ enabled: true }, { headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(request: Request) {
  if (!await isAdminRequest()) {
    return NextResponse.json({ error: 'Akses admin diperlukan' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const enabled = typeof body.enabled === 'boolean' ? body.enabled : true;

    await neonSql`
      INSERT INTO settings (key, value)
      VALUES (${REALTIME_KEY}, ${enabled ? 'true' : 'false'})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;

    return NextResponse.json({ enabled });
  } catch (err) {
    console.error('[POST /api/settings/realtime]', err);
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan' }, { status: 500 });
  }
}
