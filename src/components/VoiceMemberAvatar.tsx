"use client";

import { useState } from "react";

export function VoiceMemberAvatar({
  name,
  photo,
  size,
}: {
  name: string;
  photo: string | null;
  size: number;
}) {
  const [broken, setBroken] = useState(false);

  if (photo && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setBroken(true)}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: "rgba(217,226,255,0.16)",
        color: "#d9e2ff",
        fontSize: Math.round(size * 0.4),
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
