'use client';

import type { App } from '@/lib/types';
import { ICON_MAP } from '@/lib/constants';
import { useAppStore } from '@/context/AppContext';

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
 *
 * The entrance fade is a plain CSS mount animation rather than a GSAP
 * ScrollTrigger: ScrollTrigger only auto-refreshes on window resize/load,
 * neither of which fires on a Next.js client-side route transition, so the
 * trigger could go stale and never fire when navigating here in-app
 * (works on a hard refresh, not on SPA nav) — same reasoning that already
 * keeps the orbit's own motion on plain CSS instead of GSAP.
 */
export function AppIconOrbit({ apps }: { apps: App[] }) {
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
    <div
      className="relative shrink-0 mx-auto sm:mx-0"
      style={{ width, height, animation: 'orbit-enter 0.8s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
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
