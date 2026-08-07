import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getAdminSessionRole } from '@/lib/admin-session';

export async function GET() {
  const cookieStore = await cookies();
  const role = getAdminSessionRole(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  return NextResponse.json({ isAdmin: role !== null, role }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
