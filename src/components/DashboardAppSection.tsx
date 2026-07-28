import type { ReactNode } from "react";

interface DashboardAppSectionProps {
  icon?: ReactNode;
  name: string;
  blurb: string;
  accent?: string;
  children: ReactNode;
}

export function DashboardAppSection({
  icon,
  name,
  blurb,
  accent = "#EB0A1E",
  children,
}: DashboardAppSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2.5 mb-3">
        {icon && (
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${accent}1f`, border: `1px solid ${accent}40` }}
          >
            <span style={{ color: accent }}>{icon}</span>
          </span>
        )}
        <div>
          <h2
            className="font-display text-[15px] sm:text-[16px] font-bold leading-tight"
            style={{ color: "#d9e2ff" }}
          >
            {name}
          </h2>
          <p className="text-[11px] leading-tight" style={{ color: "rgba(217,226,255,0.4)" }}>
            {blurb}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}
