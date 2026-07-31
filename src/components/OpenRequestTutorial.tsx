'use client';

import { useEffect, useRef, useState } from 'react';
import { ClipboardEdit, ShieldCheck, Wrench, PartyPopper, ImageOff, ArrowRight, ArrowDown } from 'lucide-react';
import { gsap } from '@/lib/gsapPlugins';

const STEPS = [
  { icon: ClipboardEdit, title: 'Isi Request', text: 'Tulis nama, line, aplikasi, dan fitur yang dibutuhkan.', color: '#F59E0B' },
  { icon: ShieldCheck, title: 'Section Menyetujui', text: 'Ditinjau dan disetujui lewat password Section.', color: '#3B82F6' },
  { icon: Wrench, title: 'Developer Mengerjakan', text: 'Request yang disetujui masuk antrean pengerjaan.', color: '#8B5CF6' },
  { icon: PartyPopper, title: 'Selesai', text: 'Fitur tayang, status berubah jadi Selesai.', color: '#10B981' },
];

function TutorialImage({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);

  // A fixed-height frame keeps both states the same size regardless of the
  // source image's own resolution — these are tall phone-screenshot captures
  // (e.g. 720x1600), which at w-full/h-auto would blow up to fill the page.
  return (
    <div
      className="w-full h-56 sm:h-64 rounded-xl flex items-center justify-center overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: broken ? '1px dashed rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {broken ? (
        <div className="text-center px-4">
          <ImageOff size={22} className="mx-auto mb-2" style={{ color: 'rgba(217,226,255,0.25)' }} />
          <p className="font-data text-[11px]" style={{ color: 'rgba(217,226,255,0.3)' }}>Gambar belum tersedia</p>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setBroken(true)}
          className="h-full w-auto max-w-full object-contain"
        />
      )}
    </div>
  );
}

export function OpenRequestTutorial() {
  const railRef = useRef<HTMLDivElement>(null);
  const glowLineHRef = useRef<SVGLineElement>(null);
  const glowLineVRef = useRef<SVGLineElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const exampleRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    const glowH = glowLineHRef.current;
    const glowV = glowLineVRef.current;
    const nodes = nodeRefs.current.filter((n): n is HTMLDivElement => n !== null);
    if (!rail || !glowH || !glowV || nodes.length !== STEPS.length) return;

    const ctx = gsap.context(() => {
      // The connecting rail itself (the base gradient line) is always fully
      // visible by default — it must never depend on an animation completing
      // to be seen. A separate, purely decorative glow line is layered on top
      // and "draws" itself once on scroll into view (DrawSVGPlugin); if that
      // glow never plays for any reason, the base rail underneath is
      // untouched and still fully there.
      gsap.set([glowH, glowV], { drawSVG: '0%' });
      // Nodes start at their normal, fully visible size — the entrance is a
      // brief overshoot bounce (scale 1 -> up -> settle), never a hide/reveal,
      // so a node is never invisible even if this animation doesn't run.
      gsap.set(nodes, { scale: 1, opacity: 1, transformOrigin: 'center' });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: rail, start: 'top 75%', once: true },
      });
      tl.to([glowH, glowV], { drawSVG: '100%', duration: 1.1, ease: 'power1.inOut' }, 0);
      nodes.forEach((node, i) => {
        tl.fromTo(node, { scale: 0.85 }, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, i * 0.15);
      });

      // Contoh Nyata: before/after settle in from opposite sides toward the
      // arrow. They stay fully opaque throughout — only position animates —
      // so the case study images are never hidden, only ever offset briefly.
      if (beforeRef.current && afterRef.current && arrowRef.current && exampleRef.current) {
        gsap.set(beforeRef.current, { x: -32 });
        gsap.set(afterRef.current, { x: 32 });
        gsap.set(arrowRef.current, { scale: 0.7 });

        gsap.timeline({
          scrollTrigger: { trigger: exampleRef.current, start: 'top 85%', once: true },
        })
          .to(beforeRef.current, { x: 0, duration: 0.6, ease: 'power3.out' })
          .to(afterRef.current, { x: 0, duration: 0.6, ease: 'power3.out' }, '<')
          .to(arrowRef.current, { scale: 1, duration: 0.4, ease: 'back.out(2)' }, '-=0.2');
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-2">
      {/* Step rail — mirrors the request lifecycle's own status colors, so the
          tutorial teaches the exact visual language the list below already uses. */}
      <div ref={railRef} className="relative mb-12 sm:mb-14">
        {/* Base rail: always fully visible, no animation dependency. */}
        <div
          className="hidden sm:block absolute left-0 right-0 top-6 h-px opacity-70"
          style={{ background: `linear-gradient(90deg, ${STEPS.map(s => s.color).join(', ')})` }}
        />
        <div
          className="sm:hidden absolute top-3 bottom-3 left-6 w-px opacity-70"
          style={{ background: `linear-gradient(180deg, ${STEPS.map(s => s.color).join(', ')})` }}
        />

        {/* Decorative glow overlay: draws in once on scroll, purely additive. */}
        <svg className="hidden sm:block absolute left-0 right-0 top-6 w-full" height="4" viewBox="0 0 100 4" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="or-glow-h" x1="0%" y1="0%" x2="100%" y2="0%">
              {STEPS.map((s, i) => (
                <stop key={s.title} offset={`${(i / (STEPS.length - 1)) * 100}%`} stopColor={s.color} />
              ))}
            </linearGradient>
          </defs>
          <line ref={glowLineHRef} x1="0" y1="2" x2="100" y2="2" stroke="url(#or-glow-h)" strokeWidth="3" opacity="0.9" style={{ filter: 'blur(1.5px)' }} />
        </svg>
        <svg className="sm:hidden absolute top-3 bottom-3 left-6 h-full" width="4" viewBox="0 0 4 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="or-glow-v" x1="0%" y1="0%" x2="0%" y2="100%">
              {STEPS.map((s, i) => (
                <stop key={s.title} offset={`${(i / (STEPS.length - 1)) * 100}%`} stopColor={s.color} />
              ))}
            </linearGradient>
          </defs>
          <line ref={glowLineVRef} x1="2" y1="0" x2="2" y2="100" stroke="url(#or-glow-v)" strokeWidth="3" opacity="0.9" style={{ filter: 'blur(1.5px)' }} />
        </svg>

        <div className="relative flex flex-col sm:flex-row gap-7 sm:gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3.5 sm:flex-1 sm:text-center">
                <div
                  ref={el => { nodeRefs.current[i] = el; }}
                  className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: '#0a0f1f', border: `2px solid ${step.color}` }}
                >
                  <Icon size={19} style={{ color: step.color }} />
                </div>
                <div className="pt-1 sm:pt-0 sm:max-w-[15rem]">
                  <h3 className="font-display text-[14.5px] font-bold leading-tight mb-1" style={{ color: '#eef2ff' }}>
                    {step.title}
                  </h3>
                  <p className="font-data text-[12px] leading-relaxed" style={{ color: 'rgba(217,226,255,0.55)' }}>
                    {step.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Contoh Nyata — the feature's real persuasion device: a genuine before/after case. */}
      <div
        ref={exampleRef}
        className="rounded-2xl p-5 sm:p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h3 className="font-display text-[16px] font-bold mb-4" style={{ color: '#eef2ff' }}>
          Contoh Nyata
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-3 mb-4">
          <div ref={beforeRef} className="flex-1">
            <span
              className="font-data inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ background: 'rgba(235,10,30,0.16)', color: '#ff6b6b' }}
            >
              Sebelum
            </span>
            <TutorialImage
              src="/tutorial/open-request-before.png"
              alt="Tabel Problem Produksi sebelum kolom PIC Name ditambahkan"
            />
          </div>

          <div ref={arrowRef} className="flex items-center justify-center shrink-0 self-center sm:self-auto" style={{ color: 'rgba(217,226,255,0.3)' }}>
            <ArrowRight size={20} className="hidden sm:block" />
            <ArrowDown size={20} className="sm:hidden" />
          </div>

          <div ref={afterRef} className="flex-1">
            <span
              className="font-data inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ background: 'rgba(16,185,129,0.16)', color: '#34d399' }}
            >
              Sesudah
            </span>
            <TutorialImage
              src="/tutorial/open-request-after.png"
              alt="Tabel Problem Produksi sesudah kolom PIC Name ditambahkan"
            />
          </div>
        </div>

        <p className="font-data text-[12.5px] leading-relaxed" style={{ color: 'rgba(217,226,255,0.6)' }}>
          User merasa tabel Problem Produksi perlu kolom Nama PIC. Request diajukan, disetujui Section,
          dikerjakan developer — dan sekarang kolomnya ada.
        </p>
      </div>
    </section>
  );
}
