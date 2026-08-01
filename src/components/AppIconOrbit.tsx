'use client';

import { useEffect, useRef } from 'react';
import type { App } from '@/lib/types';
import { ICON_MAP } from '@/lib/constants';
import { useAppStore } from '@/context/AppContext';
import { gsap } from '@/lib/gsapPlugins';

const RADIUS = 78;
const ICON_SIZE = 44;

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
 * A ring of app icons that continuously orbits the center — same technique
 * as onewhale.io's dApp-icon ring: each icon is a child of a container that
 * spins forever (`orbit-spin`), positioned at its own fixed angle + radius
 * on the circle, so it revolves (and tilts) together with the ring.
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

  const size = RADIUS * 2 + ICON_SIZE;

  return (
    <div ref={wrapperRef} className="relative shrink-0 mx-auto sm:mx-0" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(235,10,30,0.10) 0%, transparent 70%)' }}
      />
      <div className="absolute inset-0 rounded-full" style={{ border: '1px dashed rgba(255,255,255,0.08)' }} />

      <div className="absolute inset-0" style={{ animation: 'orbit-spin 24s linear infinite' }}>
        {apps.map((app, i) => (
          <div
            key={app.id}
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
              width: ICON_SIZE,
              height: ICON_SIZE,
              marginLeft: -ICON_SIZE / 2,
              marginTop: -ICON_SIZE / 2,
              transform: `rotate(${(360 / apps.length) * i}deg) translateY(-${RADIUS}px)`,
            }}
          >
            <OrbitIconChip app={app} />
          </div>
        ))}
      </div>
    </div>
  );
}
