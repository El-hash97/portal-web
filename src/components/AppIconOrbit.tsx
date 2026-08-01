'use client';

import { useEffect, useRef } from 'react';
import type { App } from '@/lib/types';
import { ICON_MAP } from '@/lib/constants';
import { useAppStore } from '@/context/AppContext';
import { gsap } from '@/lib/gsapPlugins';

const RADIUS_X = 140;
const RADIUS_Y = 52;
const ICON_SIZE = 44;
const DURATION_S = 24;

function OrbitIconChip({ app }: { app: App }) {
  const { getCategoryStyle } = useAppStore();
  const style = getCategoryStyle(app.kategori);
  const Icon = ICON_MAP[app.icon] ?? ICON_MAP.box;

  return (
    <div
      className="rounded-2xl flex items-center justify-center shrink-0"
      style={{
        width: ICON_SIZE,
        height: ICON_SIZE,
        background: '#0a0f1f',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.5)',
      }}
      title={app.nama}
    >
      {app.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={app.logo} alt={app.nama} className="w-full h-full rounded-2xl object-cover" />
      ) : (
        <div
          className="w-full h-full rounded-2xl flex items-center justify-center"
          style={{ background: style.bg, color: style.color }}
        >
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}

/**
 * A ring of app icons that continuously orbits the center along a real
 * horizontal ellipse — same idea as onewhale.io's dApp-icon ring, but driven
 * by `offset-path` along an actual SVG ellipse rather than "rotate a circle
 * then squash it": squashing a rotated child with a counter-scale only
 * cancels correctly at 0°/180° (verified — every other angle rendered
 * visibly distorted), so the path itself needs to be the ellipse.
 */
export function AppIconOrbit({ apps }: { apps: App[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const tween = gsap.from(wrapper, {
      opacity: 0,
      scale: 0.85,
      duration: 0.8,
      ease: 'back.out(1.5)',
      scrollTrigger: { trigger: wrapper, start: 'top 90%', once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  if (apps.length === 0) return null;

  const width = RADIUS_X * 2 + ICON_SIZE;
  const height = RADIUS_Y * 2 + ICON_SIZE;
  const cx = width / 2;
  const cy = height / 2;
  const ellipsePath =
    `M ${cx + RADIUS_X} ${cy} ` +
    `A ${RADIUS_X} ${RADIUS_Y} 0 1 1 ${cx - RADIUS_X} ${cy} ` +
    `A ${RADIUS_X} ${RADIUS_Y} 0 1 1 ${cx + RADIUS_X} ${cy}`;

  return (
    <div ref={wrapperRef} className="relative shrink-0 mx-auto sm:mx-0" style={{ width, height }}>
      {apps.map((app, i) => (
        <div
          key={app.id}
          className="absolute top-0 left-0"
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            offsetPath: `path('${ellipsePath}')`,
            offsetRotate: '0deg',
            offsetAnchor: 'center',
            animation: `orbit-move ${DURATION_S}s linear infinite`,
            animationDelay: `${-(DURATION_S / apps.length) * i}s`,
          }}
        >
          <OrbitIconChip app={app} />
        </div>
      ))}
    </div>
  );
}
