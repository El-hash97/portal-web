"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

interface LineTotal {
  line_name: string;
  total: number;
}

const COL_H = 120;
const CARD_H = COL_H + 70;

export function HenkatenByLineChart() {
  const [data, setData] = useState<LineTotal[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/henkaten-kpi/by-line")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: LineTotal[]) => setData(d))
      .catch(() => setFailed(true));
  }, []);

  const max = data && data.length ? Math.max(...data.map((d) => d.total), 1) : 1;

  return (
    <div
      className="rounded-xl p-3 sm:p-4 mt-3"
      style={{
        background: "rgba(10,21,46,0.85)",
        border: "1px solid #2f3952",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center gap-2 pl-1 sm:pl-2 mb-4">
        <BarChart3 size={14} style={{ color: "rgba(217,226,255,0.4)" }} />
        <span
          className="font-mono-label text-[9px] sm:text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(217,226,255,0.4)" }}
        >
          Henkaten per Line
        </span>
      </div>

      {failed ? (
        <div className="flex items-center justify-center" style={{ height: CARD_H }}>
          <span className="text-[12px]" style={{ color: "rgba(217,226,255,0.3)" }}>
            Data e-Henkaten per line tidak tersedia.
          </span>
        </div>
      ) : !data ? (
        <div className="flex items-center justify-center" style={{ height: CARD_H }}>
          <span className="text-[12px]" style={{ color: "rgba(217,226,255,0.3)" }}>
            —
          </span>
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center" style={{ height: CARD_H }}>
          <span className="text-[12px]" style={{ color: "rgba(217,226,255,0.3)" }}>
            Belum ada data.
          </span>
        </div>
      ) : (
        <div
          className="flex items-end justify-center gap-6 sm:gap-10 px-2"
          style={{ height: CARD_H }}
        >
          {data.map((d) => {
            const barH = Math.max(6, Math.round((d.total / max) * COL_H));
            return (
              <div key={d.line_name} className="flex flex-col items-center gap-2 w-16">
                <span className="font-display text-[14px] font-bold text-white leading-none">
                  {d.total}
                </span>
                <div
                  className="w-8 sm:w-10 rounded-t-md"
                  style={{ height: barH, background: "#EB0A1E" }}
                />
                <span
                  className="text-[9px] sm:text-[10px] font-mono-label text-center leading-tight"
                  style={{ color: "rgba(217,226,255,0.45)" }}
                >
                  {d.line_name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
