'use client';

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from 'react';
import type { App } from '@/lib/types';
import { ADMIN_CRED, CATEGORIES } from '@/lib/constants';
import {
  loadApps, saveApps,
  isAdminLoggedIn, startAdminSession, clearAdminSession,
} from '@/lib/storage';

interface AppStore {
  apps: App[];
  isAdmin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  toggleApp: (id: number) => void;
  addApp: (data: Omit<App, 'id'>) => void;
  updateApp: (id: number, data: Partial<Omit<App, 'id'>>) => void;
  deleteApp: (id: number) => void;
  getCategoryStyle: (key: string) => { color: string; bg: string };
}

const AppContext = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [apps, setApps]       = useState<App[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setApps(loadApps());
    setIsAdmin(isAdminLoggedIn());
  }, []);

  const persist = useCallback((next: App[]) => {
    setApps(next);
    saveApps(next);
  }, []);

  // suppress unused warning — persist is used internally
  void persist;

  const login = useCallback((user: string, pass: string) => {
    if (user === ADMIN_CRED.user && pass === ADMIN_CRED.pass) {
      startAdminSession();
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    clearAdminSession();
    setIsAdmin(false);
  }, []);

  const toggleApp = useCallback((id: number) => {
    setApps(prev => {
      const next = prev.map(a => a.id === id ? { ...a, aktif: !a.aktif } : a);
      saveApps(next);
      return next;
    });
  }, []);

  const addApp = useCallback((data: Omit<App, 'id'>) => {
    setApps(prev => {
      const id = prev.length ? Math.max(...prev.map(a => a.id)) + 1 : 1;
      const next = [...prev, { ...data, id }];
      saveApps(next);
      return next;
    });
  }, []);

  const updateApp = useCallback((id: number, data: Partial<Omit<App, 'id'>>) => {
    setApps(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...data } : a);
      saveApps(next);
      return next;
    });
  }, []);

  const deleteApp = useCallback((id: number) => {
    setApps(prev => {
      const next = prev.filter(a => a.id !== id);
      saveApps(next);
      return next;
    });
  }, []);

  const getCategoryStyle = useCallback((key: string) => {
    const cat = CATEGORIES.find(c => c.key === key);
    return cat ?? { color: '#58595B', bg: 'rgba(88,89,91,0.10)' };
  }, []);

  return (
    <AppContext.Provider value={{
      apps, isAdmin,
      login, logout,
      toggleApp, addApp, updateApp, deleteApp,
      getCategoryStyle,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore(): AppStore {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used inside <AppProvider>');
  return ctx;
}
