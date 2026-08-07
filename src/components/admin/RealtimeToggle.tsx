'use client';

import { useState } from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { useRealtimeStore } from '@/context/RealtimeContext';

export function RealtimeToggle() {
  const { enabled, setEnabled } = useRealtimeStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setSaving(true);
    setError(null);
    const ok = await setEnabled(!enabled);
    if (!ok) setError('Gagal menyimpan pengaturan. Coba lagi.');
    setSaving(false);
  }

  return (
    <div
      className="rounded-xl px-5 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start gap-3">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={enabled
            ? { background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }
            : { background: 'rgba(235,10,30,0.10)', color: '#EB0A1E', border: '1px solid rgba(235,10,30,0.25)' }
          }
        >
          {enabled ? <Wifi size={17} /> : <WifiOff size={17} />}
        </span>
        <div>
          <p className="text-[14px] font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Real-time Data Dashboard
          </p>
          <p className="text-[12.5px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {enabled
              ? 'Dashboard menampilkan data live langsung dari tiap aplikasi.'
              : 'Dashboard mematikan tampilan data live. KPI & chart diganti placeholder.'}
          </p>
          {error && (
            <p className="text-[12px] mt-1.5 font-medium" style={{ color: '#EB0A1E' }}>
              {error}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleToggle}
        disabled={saving}
        className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-bold text-white transition-opacity disabled:opacity-60"
        style={enabled
          ? { background: '#EB0A1E' }
          : { background: '#1D8A56' }
        }
        title={enabled ? 'Matikan real-time data' : 'Hidupkan real-time data'}
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : enabled ? <WifiOff size={14} /> : <Wifi size={14} />}
        {saving ? 'Menyimpan...' : enabled ? 'Matikan Real-time' : 'Hidupkan Real-time'}
      </button>
    </div>
  );
}
