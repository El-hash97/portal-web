import type { LucideIcon } from 'lucide-react';

/**
 * Each category gets its own small abstract mockup — not a generic
 * icon-in-a-circle repeated four times with a different tint. The shape of
 * the mockup itself reflects what that category of app actually does.
 */

function MonitoringMockup({ color }: { color: string }) {
  const heights = [38, 58, 46, 72, 54, 64];
  return (
    <div className="flex items-end gap-2 h-24">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-3 rounded-t"
          style={{ height: `${h}%`, background: i === heights.length - 2 ? color : `${color}55` }}
        />
      ))}
    </div>
  );
}

function InputHarianMockup({ color }: { color: string }) {
  const widths = ['85%', '65%', '45%'];
  return (
    <div className="w-full flex flex-col gap-2.5">
      {widths.map((w, i) => (
        <div key={i} className="h-2.5 rounded-full" style={{ width: w, background: 'rgba(255,255,255,0.08)' }} />
      ))}
      <div className="flex justify-end mt-1">
        <div className="h-6 w-16 rounded-md" style={{ background: color }} />
      </div>
    </div>
  );
}

function LaporanMockup({ color }: { color: string }) {
  const widths = ['92%', '78%', '85%', '60%'];
  return (
    <div
      className="w-full rounded-lg p-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="h-2 w-10 rounded-full" style={{ background: color }} />
        <div className="w-4 h-4 rounded-sm" style={{ background: `${color}33` }} />
      </div>
      <div className="flex flex-col gap-1.5">
        {widths.map((w, i) => (
          <div key={i} className="h-1.5 rounded-full" style={{ width: w, background: 'rgba(255,255,255,0.09)' }} />
        ))}
      </div>
    </div>
  );
}

function KaizenMockup({ color }: { color: string }) {
  const rows = [
    { done: true, w: '70%' },
    { done: true, w: '55%' },
    { done: false, w: '62%' },
  ];
  return (
    <div className="w-full flex flex-col gap-2.5">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div
            className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
            style={r.done
              ? { background: color }
              : { border: `1.5px solid ${color}66` }
            }
          >
            {r.done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          <div className="h-2 rounded-full flex-1" style={{ maxWidth: r.w, background: 'rgba(255,255,255,0.09)' }} />
        </div>
      ))}
      <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-full rounded-full" style={{ width: '66%', background: color }} />
      </div>
    </div>
  );
}

const MOCKUPS: Record<string, (props: { color: string }) => React.JSX.Element> = {
  Monitoring: MonitoringMockup,
  'Input Harian': InputHarianMockup,
  Laporan: LaporanMockup,
  Kaizen: KaizenMockup,
};

export function AppShowcaseVisual({
  category,
  color,
  bg,
  Icon,
  logo,
  appName,
}: {
  category: string;
  color: string;
  bg: string;
  Icon: LucideIcon;
  logo?: string;
  appName: string;
}) {
  const Mockup = MOCKUPS[category] ?? MonitoringMockup;

  return (
    <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden">
      {/* Ambient glow tinted to the app's category */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(120% 100% at 30% 15%, ${color}22 0%, transparent 60%)` }}
      />
      <div
        className="absolute inset-0"
        style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'inherit' }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.015)' }} />

      <div className="relative h-full flex flex-col items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[220px]">
          <Mockup color={color} />
        </div>
      </div>

      {/* App identity badge, floating in the corner */}
      <div
        className="absolute bottom-4 left-4 flex items-center gap-2.5 rounded-xl px-3 py-2"
        style={{ background: 'rgba(6,10,24,0.75)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(6px)' }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg, color }}>
            <Icon size={16} />
          </div>
        )}
        <span className="font-data text-[11px] font-semibold tracking-wide" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {appName}
        </span>
      </div>
    </div>
  );
}
