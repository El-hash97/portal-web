'use client';

import { useEffect, useRef } from 'react';
import { gsap, SplitText } from '@/lib/gsapPlugins';

interface PageHeroProps {
  titlePrefix?: string;
  titleAccent: string;
  slogan?: string;
  description: React.ReactNode;
}

/**
 * Shared page-intro hero — big uppercase glow heading (SplitText char
 * reveal), optional italic slogan, then a muted description. Used across
 * Open Request, Dashboard, Applications, and Reports for one consistent
 * entrance treatment.
 *
 * Reveal is driven by a native IntersectionObserver playing a paused GSAP
 * timeline, not GSAP ScrollTrigger: ScrollTrigger only auto-refreshes on
 * window resize/load, neither of which fires on a Next.js client-side route
 * change, so it can go stale and never fire when navigating here in-app.
 */
export function PageHero({ titlePrefix, titleAccent, slogan, description }: PageHeroProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sloganRef = useRef<HTMLParagraphElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    const body = bodyRef.current;
    const sloganEl = sloganRef.current;
    if (!heading || !body) return;

    let split: SplitText | undefined;
    let observer: IntersectionObserver | undefined;
    let cancelled = false;

    document.fonts.ready.then(() => {
      if (cancelled) return;
      split = SplitText.create(heading, { type: 'chars' });
      gsap.set(split.chars, { opacity: 0, y: 28 });
      gsap.set(sloganEl ? [sloganEl, body] : [body], { opacity: 0, y: 14 });

      const tl = gsap.timeline({ paused: true });
      tl.to(split.chars, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'back.out(1.6)',
        stagger: 0.02,
      });
      if (sloganEl) {
        tl.to(sloganEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');
      }
      tl.to(body, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, sloganEl ? '-=0.3' : '-=0.2');

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            tl.play();
            observer?.disconnect();
          }
        },
        { rootMargin: '0px 0px -15% 0px' },
      );
      observer.observe(heading);
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      split?.revert();
    };
  }, []);

  return (
    <section className="relative px-4 sm:px-10 lg:px-12 pt-8 sm:pt-12 pb-4">
      <div className="absolute inset-0 v2-radial-glow pointer-events-none" />
      <div className="relative max-w-3xl mx-auto text-center mb-6 sm:mb-10">
        <h1
          ref={headingRef}
          className="font-display uppercase tracking-wide mb-3"
          style={{
            fontSize: 'clamp(28px, 7vw, 56px)',
            fontWeight: 700,
            color: '#d9e2ff',
            lineHeight: 1.05,
            textShadow: '0 0 24px rgba(255,180,170,0.35)',
          }}
        >
          {titlePrefix}<span style={{ color: '#EB0A1E' }}>{titleAccent}</span>
        </h1>
        {slogan && (
          <p
            ref={sloganRef}
            className="font-display italic mb-3"
            style={{
              fontSize: 'clamp(14px, 2.6vw, 22px)',
              fontWeight: 500,
              letterSpacing: '0.06em',
              color: '#b9c7e4',
            }}
          >
            {slogan}
          </p>
        )}
        <p
          ref={bodyRef}
          className="font-data text-[12px] sm:text-[13px] max-w-xl mx-auto leading-relaxed px-2"
          style={{ color: 'rgba(217,226,255,0.5)' }}
        >
          {description}
        </p>
      </div>
    </section>
  );
}
