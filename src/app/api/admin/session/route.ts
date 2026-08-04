import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, isValidAdminSession } from '@/lib/admin-session';

export async function GET() {
  const cookieStore = await cookies();
  return NextResponse.json({ isAdmin: isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value) }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
