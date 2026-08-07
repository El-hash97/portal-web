import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_SESSION_COOKIE = 'casting_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

// 'developer' can reach the full /admin panel (Kelola Aplikasi, Komentar,
// Pengaturan). 'notification' is scoped to posting/managing Notification
// board entries only — used when logging in from the Notification page.
export type AdminRole = 'developer' | 'notification';

function sessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? null;
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

// Same username for both roles, but a separate password per role: the
// 'notification' password (ADMIN_PASSWORD) stays as-is for the Notification
// page's own login, while 'developer' (full /admin access) is gated by its
// own DEVELOPER_PASSWORD so the two can't be used interchangeably.
export function hasValidAdminCredentials(username: string, password: string, role: AdminRole): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = role === 'developer' ? process.env.DEVELOPER_PASSWORD : process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;

  const userMatches = username.length === expectedUsername.length
    && timingSafeEqual(Buffer.from(username), Buffer.from(expectedUsername));
  const passwordMatches = password.length === expectedPassword.length
    && timingSafeEqual(Buffer.from(password), Buffer.from(expectedPassword));
  return userMatches && passwordMatches;
}

export function createAdminSession(role: AdminRole = 'developer'): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const payload = Buffer.from(JSON.stringify({
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

// Validates signature + expiry and returns the session's role, or null if
// the token is missing/invalid/expired. Tokens signed before roles existed
// have no `role` field — those are treated as 'developer' so already-logged-in
// developers aren't silently logged out by this change.
export function getAdminSessionRole(token: string | undefined): AdminRole | null {
  const secret = sessionSecret();
  if (!token || !secret) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expectedSignature = sign(payload, secret);
  if (signature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number; role?: AdminRole };
    if (typeof parsed.exp !== 'number' || parsed.exp <= Math.floor(Date.now() / 1000)) return null;
    return parsed.role === 'notification' ? 'notification' : 'developer';
  } catch {
    return null;
  }
}

export function isValidAdminSession(token: string | undefined): boolean {
  return getAdminSessionRole(token) !== null;
}

export function isDeveloperSession(token: string | undefined): boolean {
  return getAdminSessionRole(token) === 'developer';
}

export const adminSessionCookie = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
