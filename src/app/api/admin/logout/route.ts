import { NextResponse } from 'next/server';
import { adminSessionCookie, ADMIN_SESSION_COOKIE } from '@/lib/admin-session';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { ...adminSessionCookie, maxAge: 0 });
  return response;
}
