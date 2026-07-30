"use client";

export function VoiceMemberAvatar({
  name,
  photo,
  size,
}: {
  name: string;
  photo: string | null;
  size: number;
}) {
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name}
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
