import { gsap } from "gsap";

/**
 * Recharts renders each bar segment as a `<path class="recharts-rectangle">`.
 * ProblemProduksiChart's translucent stack-background panels reuse the same
 * Rectangle shape and therefore carry the same base class alongside their own
 * `recharts-bar-background-rectangle` — excluding that keeps this animation
 * scoped to the real data bars, not the static backdrop behind them.
 */
const BAR_SELECTOR = ".recharts-rectangle:not(.recharts-bar-background-rectangle)";
const LINE_SELECTOR = ".recharts-line-curve";
const DOT_SELECTOR = ".recharts-line-dot";
const LABEL_SELECTOR = ".recharts-label";

function fadeInLabels(container: Element, delay: number) {
  const labels = container.querySelectorAll<SVGTextElement>(LABEL_SELECTOR);
  if (!labels.length) return;
  gsap.set(labels, { opacity: 0 });
  gsap.to(labels, { opacity: 1, duration: 0.4, delay, stagger: 0.03, ease: "power1.out" });
}

/** Vertical bar chart: each bar grows upward from its own baseline. */
export function animateVerticalBars(container: Element, stagger = 0.06) {
  const bars = container.querySelectorAll<SVGPathElement>(BAR_SELECTOR);
  if (!bars.length) return;
  gsap.set(bars, { transformOrigin: "bottom", scaleY: 0 });
  gsap.to(bars, { scaleY: 1, duration: 0.8, ease: "power2.out", stagger });
  fadeInLabels(container, stagger * bars.length + 0.3);
}

/** Horizontal bar chart (Recharts `layout="vertical"`): bars grow left to right. */
export function animateHorizontalBars(container: Element, stagger = 0.08) {
  const bars = container.querySelectorAll<SVGPathElement>(BAR_SELECTOR);
  if (!bars.length) return;
  gsap.set(bars, { transformOrigin: "left", scaleX: 0 });
  gsap.to(bars, { scaleX: 1, duration: 0.8, ease: "power2.out", stagger });
  fadeInLabels(container, stagger * bars.length + 0.3);
}

/** Line series: each line "draws" left to right; its dots fade in as the line reaches them. */
export function animateLines(container: Element, duration = 1.1, seriesStagger = 0.15) {
  const paths = container.querySelectorAll<SVGPathElement>(LINE_SELECTOR);
  paths.forEach((path, i) => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      duration,
      ease: "power1.inOut",
      delay: i * seriesStagger,
    });
  });

  const dots = container.querySelectorAll<SVGCircleElement>(DOT_SELECTOR);
  if (!dots.length) return;
  gsap.set(dots, { opacity: 0 });
  gsap.to(dots, {
    opacity: 1,
    duration,
    ease: "power1.in",
    stagger: { each: duration / dots.length, from: "start" },
  });
}
