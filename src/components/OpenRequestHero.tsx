'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsapPlugins';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(SplitText);
}

export function OpenRequestHero() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sloganRef = useRef<HTMLParagraphElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    const slogan = sloganRef.current;
    const body = bodyRef.current;
    if (!heading || !slogan || !body) return;

    let split: SplitText | undefined;
    let tl: gsap.core.Timeline | undefined;

    document.fonts.ready.then(() => {
      split = SplitText.create(heading, { type: 'chars' });
      gsap.set(split.chars, { opacity: 0, y: 28 });
      gsap.set([slogan, body], { opacity: 0, y: 14 });

      tl = gsap.timeline({
        scrollTrigger: { trigger: heading, start: 'top 85%', once: true },
      });
      tl.to(split.chars, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'back.out(1.6)',
        stagger: 0.02,
      })
        .to(slogan, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
        .to(body, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3');
    });

    return () => {
      tl?.scrollTrigger?.kill();
      tl?.kill();
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
          Open <span style={{ color: '#EB0A1E' }}>Request</span>
        </h1>
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
          Fitur Kurang? Tinggal Minta.
        </p>
        <p
          ref={bodyRef}
          className="font-data text-[12px] sm:text-[13px] max-w-xl mx-auto leading-relaxed px-2"
          style={{ color: 'rgba(217,226,255,0.5)' }}
        >
          Setiap masukan dari line bisa jadi fitur berikutnya. <br className="hidden sm:block" />
          Ajukan, disetujui Section, dikerjakan developer.
        </p>
      </div>
    </section>
  );
}
