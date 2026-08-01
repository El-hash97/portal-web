import type { App } from './types';
import { STORAGE_KEY, SESSION_KEY, DEFAULT_APPS } from './constants';

export function loadApps(): App[] {
  if (typeof window === 'undefined') return structuredClone(DEFAULT_APPS);
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(DEFAULT_APPS);
  try {
    return JSON.parse(raw) as App[];
  } catch {
    return structuredClone(DEFAULT_APPS);
  }
}

export function saveApps(apps: App[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

const ADMIN_PW_KEY = `${SESSION_KEY}_pw`;

export function startAdminSession(pass: string): void {
  sessionStorage.setItem(SESSION_KEY, '1');
  sessionStorage.setItem(ADMIN_PW_KEY, pass);
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(ADMIN_PW_KEY);
}

export function getAdminPassword(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ADMIN_PW_KEY);
}
