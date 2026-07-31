'use client';

import { useState } from 'react';
import { ClipboardEdit, ShieldCheck, Wrench, PartyPopper, ImageOff, ArrowRight, ArrowDown } from 'lucide-react';

const STEPS = [
  { icon: ClipboardEdit, title: 'Isi Request', text: 'Tulis nama, line, aplikasi, dan fitur yang dibutuhkan.', color: '#F59E0B' },
  { icon: ShieldCheck, title: 'Section Menyetujui', text: 'Ditinjau dan disetujui lewat password Section.', color: '#3B82F6' },
  { icon: Wrench, title: 'Developer Mengerjakan', text: 'Request yang disetujui masuk antrean pengerjaan.', color: '#8B5CF6' },
  { icon: PartyPopper, title: 'Selesai', text: 'Fitur tayang, status berubah jadi Selesai.', color: '#10B981' },
];

const RAIL_GRADIENT = `linear-gradient(90deg, ${STEPS.map(s => s.color).join(', ')})`;
const RAIL_GRADIENT_VERTICAL = `linear-gradient(180deg, ${STEPS.map(s => s.color).join(', ')})`;

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
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-2">
      {/* Step rail — mirrors the request lifecycle's own status colors, so the
          tutorial teaches the exact visual language the list below already uses. */}
      <div className="relative mb-12 sm:mb-14">
        <div
          className="hidden sm:block absolute left-0 right-0 top-6 h-px opacity-70"
          style={{ background: RAIL_GRADIENT }}
        />
        <div
          className="sm:hidden absolute top-3 bottom-3 left-6 w-px opacity-70"
          style={{ background: RAIL_GRADIENT_VERTICAL }}
        />

        <div className="relative flex flex-col sm:flex-row gap-7 sm:gap-4">
          {STEPS.map(step => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3.5 sm:flex-1 sm:text-center">
                <div
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
        className="rounded-2xl p-5 sm:p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h3 className="font-display text-[16px] font-bold mb-4" style={{ color: '#eef2ff' }}>
          Contoh Nyata
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-3 mb-4">
          <div className="flex-1">
            <span
              className="font-data inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ background: 'rgba(235,10,30,0.16)', color: '#ff6b6b' }}
            >
              Sebelum
            </span>
            <TutorialImage
              src="/tutorial/open-request-before.jpg"
              alt="Tabel Problem Produksi sebelum kolom PIC Name ditambahkan"
            />
          </div>

          <div className="flex items-center justify-center shrink-0 self-center sm:self-auto" style={{ color: 'rgba(217,226,255,0.3)' }}>
            <ArrowRight size={20} className="hidden sm:block" />
            <ArrowDown size={20} className="sm:hidden" />
          </div>

          <div className="flex-1">
            <span
              className="font-data inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2"
              style={{ background: 'rgba(16,185,129,0.16)', color: '#34d399' }}
            >
              Sesudah
            </span>
            <TutorialImage
              src="/tutorial/open-request-after.jpg"
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
