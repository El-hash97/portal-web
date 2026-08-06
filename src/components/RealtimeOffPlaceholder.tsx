"use client";

import { WifiOff } from "lucide-react";

const TEXT_MUTED = "rgba(217,226,255,0.55)";
const TEXT_FAINT = "rgba(217,226,255,0.35)";
const CARD_BORDER = "#2f3952";

/**
 * Rendered inside each DashboardAppSection when the admin has turned
 * real-time data off. Replaces the live KPI bar / chart entirely, so no
 * fetch to the upstream apps happens at all while the setting is OFF.
 */
export function RealtimeOffPlaceholder() {
  return (
    <div
      className="font-data rounded-xl px-4 py-8 sm:py-10 mt-3 flex flex-col items-center justify-center gap-2.5 text-center"
      style={{ border: `1px dashed ${CARD_BORDER}` }}
    >
      <span
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(217,226,255,0.08)" }}
      >
        <WifiOff size={18} style={{ color: TEXT_MUTED }} />
      </span>
      <span className="text-[13px] font-semibold" style={{ color: TEXT_MUTED }}>
        Real-time data dimatikan oleh admin
      </span>
      <span className="text-[12px] leading-relaxed max-w-[320px]" style={{ color: TEXT_FAINT }}>
        Data live dari aplikasi sementara tidak ditampilkan. Silakan cek kembali nanti.
      </span>
    </div>
  );
}
