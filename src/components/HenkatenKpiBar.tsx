"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface HenkatenKpi {
  total: number;
  high: number;
  medium: number;
  low: number;
}

export function HenkatenKpiBar() {
  const [kpi, setKpi] = useState<HenkatenKpi | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/henkaten-kpi")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: HenkatenKpi) => setKpi(d))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  const items = [
    {
      icon: <ClipboardList size={20} />,
      value: kpi?.total,
      label: "Total",
      sub: "Henkaten",
      bg: "rgba(217,226,255,0.7)",
    },
    {
      icon: <AlertOctagon size={16} />,
      value: kpi?.high,
      label: "High Risk",
      bg: "#EB0A1E",
    },
    {
      icon: <AlertTriangle size={16} />,
      value: kpi?.medium,
      label: "Medium Risk",
      bg: "#F59E0B",
    },
    {
      icon: <CheckCircle2 size={16} />,
      value: kpi?.low,
      label: "Low Risk",
      bg: "#10B981",
    },
  ];

  return (
    <div
      className="rounded-xl p-3 sm:p-4 flex flex-wrap items-stretch justify-between gap-3 sm:gap-6 mt-3"
      style={{
        background: "rgba(10,21,46,0.85)",
        border: "1px solid #2f3952",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center gap-2 pl-1 sm:pl-2 w-full sm:w-auto">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "#10B981",
            boxShadow: "0 0 0 3px rgba(16,185,129,0.2)",
          }}
        />
        <span
          className="font-mono-label text-[9px] sm:text-[10px] uppercase tracking-widest"
          style={{ color: "rgba(217,226,255,0.4)" }}
        >
          e-Henkaten · Live
        </span>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 flex-1 sm:justify-center w-full sm:w-auto">
        {items.map((it, i) => (
          <div key={it.label} className="flex items-center gap-2 sm:gap-3">
            {i > 0 && (
              <div
                className="hidden sm:block w-px h-10"
                style={{ background: "#2f3952" }}
              />
            )}
            {i === 0 ? (
              <span style={{ color: it.bg }}>{it.icon}</span>
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: it.bg }}
              >
                <span className="text-white">{it.icon}</span>
              </div>
            )}
            <div>
              <div className="font-display text-[18px] sm:text-[22px] font-bold text-white leading-none">
                {kpi ? it.value : "—"}
              </div>
              <div
                className="text-[9px] sm:text-[10px] font-mono-label leading-tight"
                style={{ color: "rgba(217,226,255,0.45)" }}
              >
                {it.label}
                <br />
                {it.sub}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
