"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { CARD_BORDER, TEXT_PRIMARY, TEXT_MUTED } from "@/lib/chartTheme";
import { VoiceMemberAvatar } from "@/components/VoiceMemberAvatar";

interface Sender {
  rank: number;
  member_name: string;
  total: number;
  profile_photo: string | null;
}

const RANK_STYLE: Record<1 | 2 | 3, { text: string; bg: string; border: string }> = {
  1: { text: "#3D2B00", bg: "#FFD700", border: "#B8860B" },
  2: { text: "#2B2B2B", bg: "#C0C0C0", border: "#9CA3AF" },
  3: { text: "#FFFFFF", bg: "#CD7F32", border: "#8B5A2B" },
};

const RANK_HEIGHT: Record<1 | 2 | 3, number> = {
  1: 96,
  2: 72,
  3: 56,
};

/** CSS flex `order`: rank 1 renders center, rank 2 to its left, rank 3 to its right. */
const RANK_VISUAL_ORDER: Record<1 | 2 | 3, number> = {
  1: 2,
  2: 1,
  3: 3,
};

export function VoiceMemberPodium() {
  const [data, setData] = useState<Sender[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/voice-member/top-senders")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Sender[]) => setData(d))
      .catch(() => setFailed(true));
  }, []);

  // The table component owns the loading/failed/empty states for this
  // section; the podium simply doesn't render until there's a confirmed
  // top 3, and says nothing on failure.
  if (failed || !data || data.length < 3) return null;

  const top3 = data.slice(0, 3) as [Sender, Sender, Sender];

  return (
    <div
      className="font-data rounded-xl px-3 sm:px-4 pt-3 sm:pt-3.5 pb-3 sm:pb-3.5 mt-3"
      style={{ border: `1px solid ${CARD_BORDER}` }}
    >
      <div className="flex items-center gap-2 pl-1 sm:pl-2 mb-4">
        <Trophy size={15} style={{ color: TEXT_MUTED }} />
        <span
          className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-widest"
          style={{ color: TEXT_MUTED }}
        >
          Top Pengirim
        </span>
      </div>

      <div className="flex items-end justify-center gap-4 sm:gap-8 px-2">
        {top3.map((s) => {
          const rank = s.rank as 1 | 2 | 3;
          return (
            <div
              key={s.member_name}
              className="flex flex-col items-center gap-2"
              style={{ order: RANK_VISUAL_ORDER[rank] }}
            >
              <VoiceMemberAvatar name={s.member_name} photo={s.profile_photo} size={rank === 1 ? 56 : 44} />
              <span
                className="text-[10px] sm:text-[11px] font-bold text-center leading-tight max-w-[110px]"
                style={{ color: TEXT_PRIMARY }}
              >
                {s.member_name}
              </span>
              <span className="text-[11px]" style={{ color: TEXT_MUTED }}>
                {s.total} Voice Member
              </span>
              <div
                className="w-full rounded-t-lg flex items-start justify-center pt-2"
                style={{
                  height: RANK_HEIGHT[rank],
                  background: RANK_STYLE[rank].bg,
                  border: `1px solid ${RANK_STYLE[rank].border}`,
                  minWidth: 72,
                }}
              >
                <span className="text-[20px] font-bold" style={{ color: RANK_STYLE[rank].text }}>
                  {s.rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
