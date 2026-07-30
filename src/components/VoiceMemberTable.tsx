"use client";

import { useEffect, useState } from "react";
import { ListOrdered } from "lucide-react";
import { CARD_BORDER, TEXT_PRIMARY, TEXT_MUTED } from "@/lib/chartTheme";
import { VoiceMemberAvatar } from "@/components/VoiceMemberAvatar";

interface Sender {
  rank: number;
  member_name: string;
  total: number;
  profile_photo: string | null;
}

const SKELETON_ROWS = 4;

export function VoiceMemberTable() {
  const [data, setData] = useState<Sender[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/voice-member/top-senders")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Sender[]) => setData(d))
      .catch(() => setFailed(true));
  }, []);

  const hasPodium = (data?.length ?? 0) >= 3;
  // Podium already covers ranks 1-3; this table shows the rest. When there
  // are fewer than 3 senders total, the podium isn't showing at all, so
  // the table shows everyone instead of an empty "rank 4+" slice.
  const rows = data ? (hasPodium ? data.slice(3) : data) : [];

  return (
    <div
      className="font-data rounded-xl px-3 sm:px-4 pt-3 sm:pt-3.5 pb-3 sm:pb-3.5 mt-3"
      style={{ border: `1px solid ${CARD_BORDER}` }}
    >
      <div className="flex items-center gap-2 pl-1 sm:pl-2 mb-3">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: failed ? "#EB0A1E" : "#10B981",
            boxShadow: failed
              ? "0 0 0 3px rgba(235,10,30,0.18)"
              : "0 0 0 3px rgba(16,185,129,0.18)",
          }}
        />
        <ListOrdered size={15} style={{ color: TEXT_MUTED }} />
        <span
          className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-widest"
          style={{ color: TEXT_MUTED }}
        >
          {hasPodium ? "Peringkat Selanjutnya" : "Pengirim Voice Member"}{failed ? " · Offline" : ""}
        </span>
      </div>

      <div aria-live="polite">
      {failed ? (
        <div className="flex items-center justify-center py-10">
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Data Voice Member tidak tersedia.
          </span>
        </div>
      ) : !data ? (
        <div className="flex flex-col gap-2" aria-hidden="true">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div
              key={i}
              className="h-9 rounded-lg animate-pulse"
              style={{ background: "rgba(217,226,255,0.08)" }}
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Belum ada data.
          </span>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <span className="text-[13px]" style={{ color: TEXT_MUTED }}>
            Belum ada data lain.
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
                <th className="text-left py-2 pr-2 font-medium w-10" style={{ color: TEXT_MUTED }}>
                  #
                </th>
                <th className="text-left py-2 pr-2 font-medium" style={{ color: TEXT_MUTED }}>
                  Nama
                </th>
                <th className="text-right py-2 pl-2 font-medium" style={{ color: TEXT_MUTED }}>
                  Total Voice Member
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.member_name} style={{ borderBottom: "1px solid rgba(47,57,82,0.5)" }}>
                  <td className="py-2 pr-2" style={{ color: TEXT_MUTED }}>
                    {s.rank}
                  </td>
                  <td className="py-2 pr-2">
                    <div className="flex items-center gap-2">
                      <VoiceMemberAvatar name={s.member_name} photo={s.profile_photo} size={28} />
                      <span className="font-medium" style={{ color: TEXT_PRIMARY }}>
                        {s.member_name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 pl-2 text-right font-bold" style={{ color: TEXT_PRIMARY }}>
                    {s.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
}
