'use client';

import React, {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode,
} from 'react';

interface RealtimeStore {
  enabled: boolean;
  loading: boolean;
  setEnabled: (enabled: boolean) => Promise<boolean>;
}

const RealtimeContext = createContext<RealtimeStore | null>(null);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/realtime')
      .then(r => (r.ok ? r.json() : { enabled: true }))
      .then(d => setEnabledState(Boolean(d.enabled)))
      .catch(() => setEnabledState(true))
      .finally(() => setLoading(false));
  }, []);

  const setEnabled = useCallback(async (value: boolean): Promise<boolean> => {
    const res = await fetch('/api/settings/realtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: value }),
    });
    if (!res.ok) return false;
    setEnabledState(value);
    return true;
  }, []);

  return (
    <RealtimeContext.Provider value={{ enabled, loading, setEnabled }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeStore(): RealtimeStore {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtimeStore must be used inside <RealtimeProvider>');
  return ctx;
}
