/** Shared visual language for every dashboard chart and KPI card. */

export const CARD_BORDER = "#2f3952";
export const TEXT_PRIMARY = "#f5f7ff";
export const TEXT_MUTED = "rgba(217,226,255,0.55)";
export const AXIS_LINE = "rgba(217,226,255,0.35)";
export const GRID_LINE = "rgba(217,226,255,0.10)";

export const tickStyle = {
  fill: TEXT_MUTED,
  fontSize: 11,
  fontFamily: "var(--font-data)",
};

/**
 * Fixed colors per production line so the same line reads the same in
 * every chart on the dashboard. Keyed by the exact `line` / `line_name`
 * values stored by the source applications.
 */
const LINE_COLORS: Record<string, string> = {
  "Mould-RCS": "#EB0A1E",
  "Core Making": "#F59E0B",
  Finishing: "#3B82F6",
  "Die Press": "#10B981",
  "Mel-Pour-Analys": "#8B5CF6",
};

const FALLBACK_COLORS = ["#EC4899", "#0EA5E9", "#F97316"];

/** Stable color for a line name, including ones not yet in LINE_COLORS. */
export function lineColor(name: string): string {
  const known = LINE_COLORS[name];
  if (known) return known;

  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}
