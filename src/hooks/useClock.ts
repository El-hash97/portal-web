'use client';

import { useState, useEffect } from 'react';

interface ClockState {
  time: string;
  date: string;
}

export function useClock(): ClockState {
  const [state, setState] = useState<ClockState>({ time: '--:--:--', date: '—' });

  useEffect(() => {
    function tick() {
      const now = new Date();
      setState({
        time: now.toLocaleTimeString('id-ID', { hour12: false }),
        date: now.toLocaleDateString('id-ID', {
          weekday: 'long', day: 'numeric',
          month: 'long', year: 'numeric',
        }),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}
