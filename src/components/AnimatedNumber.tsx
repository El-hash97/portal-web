"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** Counts up from 0 to `value` once, then holds — used by every dashboard KPI card. */
export function AnimatedNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const counter = { n: 0 };
    const tween = gsap.to(counter, {
      n: value,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = Math.round(counter.n).toString();
      },
    });

    return () => {
      tween.kill();
    };
  }, [value, duration]);

  return <span ref={ref}>0</span>;
}
