'use client';

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from 'react';
import type { App } from '@/lib/types';
import { ADMIN_CRED, CATEGORIES, DEFAULT_APPS } from '@/lib/constants';
import { isAdminLoggedIn, startAdminSession, clearAdminSession } from '@/lib/storage';

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
    fetch('/api/apps')
      .then(r => r.json())
      .then((data: App[]) => setApps(data.length ? data : DEFAULT_APPS))
      .catch(() => setApps(DEFAULT_APPS));
    setIsAdmin(isAdminLoggedIn());
  }, []);

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
      const target = next.find(a => a.id === id);
      if (target) {
        fetch(`/api/apps/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aktif: target.aktif }),
        });
      }
      return next;
    });
  }, []);

  const addApp = useCallback((data: Omit<App, 'id'>) => {
    const tempId = -Date.now();
    setApps(prev => [...prev, { ...data, id: tempId }]);

    fetch('/api/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(r => r.json())
      .then((created: App) => {
        setApps(prev => prev.map(a => a.id === tempId ? created : a));
      });
  }, []);

  const updateApp = useCallback((id: number, data: Partial<Omit<App, 'id'>>) => {
    let snapshot: App[] | null = null;

    setApps(prev => {
      snapshot = prev;
      return prev.map(a => a.id === id ? { ...a, ...data } : a);
    });

    fetch(`/api/apps/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(res => {
        if (!res.ok && snapshot) setApps(snapshot);
      })
      .catch(() => {
        if (snapshot) setApps(snapshot);
      });
  }, []);

  const deleteApp = useCallback((id: number) => {
    setApps(prev => prev.filter(a => a.id !== id));

    fetch(`/api/apps/${id}`, { method: 'DELETE' });
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
