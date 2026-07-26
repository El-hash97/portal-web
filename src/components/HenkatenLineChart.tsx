'use client';

import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

interface LineCount {
  line: string;
  total: number;
}

export function HenkatenLineChart() {
  const [data, setData] = useState<LineCount[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/henkaten-by-line')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((d: LineCount[]) => setData(d))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  const max = data && data.length ? Math.max(...data.map(d => d.total)) : 1;

  return (
    <div
      className="rounded-xl p-4 sm:p-5"
      style={{ background: 'rgba(10,21,46,0.85)', border: '1px solid #2f3952', backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={14} style={{ color: 'rgba(217,226,255,0.5)' }} />
        <p className="font-mono-label text-[10px] uppercase tracking-widest" style={{ color: 'rgba(217,226,255,0.4)' }}>
          Total Henkaten per Line
        </p>
      </div>

      {data === null ? (
        <p className="text-[12px] py-6 text-center" style={{ color: 'rgba(217,226,255,0.3)' }}>Memuat data...</p>
      ) : data.length === 0 ? (
        <p className="text-[12px] py-6 text-center" style={{ color: 'rgba(217,226,255,0.3)' }}>Belum ada data Henkaten.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map(row => (
            <div key={row.line} className="flex items-center gap-3">
              <span
                className="text-[11px] font-medium shrink-0 truncate"
                style={{ color: 'rgba(217,226,255,0.75)', width: 120 }}
                title={row.line}
              >
                {row.line}
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round((row.total / max) * 100)}%`, background: '#EB0A1E' }}
                />
              </div>
              <span
                className="text-[12px] font-bold shrink-0 text-right"
                style={{ color: 'rgba(217,226,255,0.9)', width: 28 }}
              >
                {row.total}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
