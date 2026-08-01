'use client';

import { useEffect, useState } from 'react';

const CYCLE_MS = 3200;

/** Fan position for a card at `offset` steps away from the current center. */
function slotStyle(offset: number) {
  if (offset === 0) return { x: 0, rotate: 0, scale: 1, z: 30, opacity: 1 };
  if (offset < 0) return { x: -58, rotate: -9, scale: 0.9, z: 20, opacity: 0.82 };
  return { x: 58, rotate: 9, scale: 0.9, z: 20, opacity: 0.82 };
}

/** Position of image `i` relative to `center`, as a signed offset (…, -1, 0, 1, …). */
function offsetOf(i: number, center: number, total: number): number {
  const raw = ((i - center) % total + total) % total;
  return raw > total / 2 ? raw - total : raw;
}

export function AppShowcaseGallery({ images, alt }: { images: string[]; alt: string }) {
  const [center, setCenter] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => setCenter(c => (c + 1) % images.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div
      className="relative w-full aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center overflow-hidden"
      style={{ perspective: 1000 }}
    >
      {images.map((src, i) => {
        const offset = offsetOf(i, center, images.length);
        const { x, rotate, scale, z, opacity } = slotStyle(offset);
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={`${alt} — tampilan ${i + 1}`}
            className="absolute rounded-2xl object-cover object-top"
            style={{
              width: '62%',
              height: '85%',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
              transform: `translateX(${x}%) rotate(${rotate}deg) scale(${scale})`,
              zIndex: z,
              opacity,
              transition: 'transform 0.9s cubic-bezier(0.22,0.61,0.36,1), opacity 0.9s ease',
            }}
          />
        );
      })}
    </div>
  );
}
