'use client';

import { useState } from 'react';
import { ClipboardEdit, ShieldCheck, Wrench, PartyPopper, ImageOff } from 'lucide-react';

const STEPS = [
  { icon: ClipboardEdit, title: 'Isi Request', text: 'Tulis nama, line, aplikasi, dan fitur yang Anda butuhkan.' },
  { icon: ShieldCheck, title: 'Section Menyetujui', text: 'Section meninjau dan menyetujui lewat password.' },
  { icon: Wrench, title: 'Developer Mengerjakan', text: 'Request yang disetujui masuk antrean pengerjaan.' },
  { icon: PartyPopper, title: 'Selesai', text: 'Fitur tayang, status berubah jadi Selesai.' },
];

function TutorialImage({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div
        className="w-full aspect-video rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}
      >
        <div className="text-center px-4">
          <ImageOff size={22} className="mx-auto mb-2" style={{ color: 'rgba(217,226,255,0.25)' }} />
          <p className="text-[11px]" style={{ color: 'rgba(217,226,255,0.3)' }}>Gambar belum tersedia</p>
        </div>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setBroken(true)}
      className="w-full h-auto rounded-xl"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    />
  );
}

export function OpenRequestTutorial() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(235,10,30,0.14)', color: '#EB0A1E' }}
                >
                  <Icon size={16} />
                </div>
                <span className="text-[11px] font-bold" style={{ color: 'rgba(217,226,255,0.4)' }}>
                  Langkah {i + 1}
                </span>
              </div>
              <h3 className="text-[13.5px] font-bold mb-1" style={{ color: '#d9e2ff' }}>{step.title}</h3>
              <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(217,226,255,0.5)' }}>{step.text}</p>
            </div>
          );
        })}
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h3 className="text-[13px] font-bold uppercase tracking-wide mb-3" style={{ color: 'rgba(217,226,255,0.5)' }}>
          Contoh Nyata
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
          <div>
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-2"
              style={{ background: 'rgba(235,10,30,0.14)', color: '#EB0A1E' }}
            >
              Sebelum
            </span>
            <TutorialImage
              src="/tutorial/open-request-before.jpg"
              alt="Tabel Problem Produksi sebelum kolom PIC Name ditambahkan"
            />
          </div>
          <div>
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mb-2"
              style={{ background: 'rgba(16,185,129,0.14)', color: '#10B981' }}
            >
              Sesudah
            </span>
            <TutorialImage
              src="/tutorial/open-request-after.jpg"
              alt="Tabel Problem Produksi sesudah kolom PIC Name ditambahkan"
            />
          </div>
        </div>
        <p className="text-[12px] leading-relaxed" style={{ color: 'rgba(217,226,255,0.55)' }}>
          User merasa tabel Problem Produksi perlu kolom Nama PIC. Request diajukan, disetujui Section,
          dikerjakan developer — dan sekarang kolomnya ada.
        </p>
      </div>
    </section>
  );
}
