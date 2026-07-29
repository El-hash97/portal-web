"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { CARD_BORDER, TEXT_PRIMARY, TEXT_MUTED } from "@/lib/chartTheme";

interface KaizenKpi {
  total: number;
  onProgress: number;
  finish: number;
}

export function KaizenKpiBar() {
  const [kpi, setKpi] = useState<KaizenKpi | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/kaizen/kpi")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: KaizenKpi) => setKpi(d))
      .catch(() => setFailed(true));
  }, []);

  const loading = !kpi && !failed;

  const items = [
    {
      icon: <ClipboardList size={17} />,
      value: kpi?.total,
      label: "Total Kaizen",
      iconBg: "rgba(217,226,255,0.16)",
      iconColor: "#d9e2ff",
    },
    {
      icon: <Clock size={17} />,
      value: kpi?.onProgress,
      label: "On Progress",
      iconBg: "#F59E0B",
      iconColor: "#ffffff",
    },
    {
      icon: <CheckCircle2 size={17} />,
      value: kpi?.finish,
      label: "Finish",
      iconBg: "#10B981",
      iconColor: "#ffffff",
    },
  ];

  return (
    <div
      className="font-data rounded-xl px-3 sm:px-4 pt-3 sm:pt-3.5 pb-3 sm:pb-3.5 flex flex-wrap items-stretch justify-between gap-4 sm:gap-8 mt-3"
      style={{ border: `1px solid ${CARD_BORDER}` }}
    >
      <div className="flex items-center gap-2 pl-1 sm:pl-2 w-full sm:w-auto">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: failed ? "#EB0A1E" : "#10B981",
            boxShadow: failed
              ? "0 0 0 3px rgba(235,10,30,0.18)"
              : "0 0 0 3px rgba(16,185,129,0.18)",
          }}
        />
        <span
          className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-widest"
          style={{ color: TEXT_MUTED }}
        >
          Kaizen Order Sheet · {failed ? "Offline" : "Live"}
        </span>
      </div>

      {failed ? (
        <div className="w-full sm:w-auto flex-1 flex items-center justify-center py-3 sm:py-0">
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Data Kaizen Order Sheet tidak tersedia.
          </span>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 sm:flex sm:items-center gap-5 sm:gap-10 flex-1 sm:justify-center w-full sm:w-auto"
          aria-live="polite"
        >
          {items.map((it, i) => (
            <div key={it.label} className="flex items-center gap-2.5 sm:gap-3.5">
              {i > 0 && (
                <div
                  className="hidden sm:block w-px h-11"
                  style={{ background: CARD_BORDER }}
                />
              )}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: it.iconBg }}
              >
                <span style={{ color: it.iconColor }}>{it.icon}</span>
              </div>
              <div>
                {loading ? (
                  <div
                    className="h-[20px] sm:h-[26px] w-9 rounded animate-pulse"
                    style={{ background: "rgba(217,226,255,0.12)" }}
                  />
                ) : (
                  <div
                    className="text-[20px] sm:text-[26px] font-bold leading-none"
                    style={{ color: TEXT_PRIMARY }}
                  >
                    {it.value}
                  </div>
                )}
                <div
                  className="text-[11px] sm:text-[12px] font-medium leading-tight mt-1"
                  style={{ color: TEXT_MUTED }}
                >
                  {it.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
