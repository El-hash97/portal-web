'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Slides content in from the left (even index) or right (odd index) as it
 * scrolls into view, revealed sequentially since each instance observes its
 * own position independently. Hidden-state opacity stays just above zero
 * (0.04, not 0) rather than fully invisible — visually indistinguishable
 * from gone, but content that never gets to observe/reveal (e.g. an unusual
 * IntersectionObserver failure) is still technically present on screen,
 * never truly invisible.
 */
export function ScrollEntrance({
  index,
  children,
  distance = 48,
}: {
  index: number;
  children: React.ReactNode;
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fromX = index % 2 === 0 ? -distance : distance;
  return (
    <div
      ref={ref}
      style={{
        transform: entered ? 'translateX(0)' : `translateX(${fromX}px)`,
        opacity: entered ? 1 : 0.04,
        transition: 'transform 0.6s cubic-bezier(0.22,0.61,0.36,1), opacity 0.6s ease-out',
      }}
    >
      {children}
    </div>
  );
}
