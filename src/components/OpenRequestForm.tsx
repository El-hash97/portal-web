'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, CheckCircle, ImagePlus, X } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import { REQUEST_LINES } from '@/lib/constants';
import { STEPS } from '@/components/OpenRequestTutorial';
import { gsap } from '@/lib/gsapPlugins';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB, before base64 encoding

// Compact zigzag flow filling the empty space below the form's heading —
// same idea as the tutorial section's rail, sized down to fit this column.
const MINI_ROW_HEIGHT = 108;
const MINI_AMP = 30;
const MINI_RAIL_HEIGHT = STEPS.length * MINI_ROW_HEIGHT;

const MINI_NODE_POINTS = STEPS.map((_, i) => ({
  x: i % 2 === 0 ? MINI_AMP : 100 - MINI_AMP,
  y: i * MINI_ROW_HEIGHT + 40,
}));

/** A smooth S-curve through each point, using vertical-only control points. */
function miniZigzagPath(points: { x: number; y: number }[]): string {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${p0.x} ${midY}, ${p1.x} ${midY}, ${p1.x} ${p1.y}`;
  }
  return d;
}

const MINI_PATH_D = miniZigzagPath(MINI_NODE_POINTS);

/**
 * Reveal is driven by a native IntersectionObserver (not GSAP ScrollTrigger):
 * ScrollTrigger only auto-refreshes on window resize/load, neither of which
 * fires on a Next.js client-side route change, so it can go stale and never
 * fire when navigating here in-app.
 */
function RequestFlowMini() {
  const railRef = useRef<HTMLDivElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const rail = railRef.current;
    const glowPath = glowPathRef.current;
    const nodes = nodeRefs.current.filter((n): n is HTMLDivElement => n !== null);
    const texts = textRefs.current.filter((n): n is HTMLDivElement => n !== null);
    if (!rail || !glowPath || nodes.length !== STEPS.length || texts.length !== STEPS.length) return;

    const ctx = gsap.context(() => {
      gsap.set(glowPath, { drawSVG: '0%' });
      gsap.set(nodes, { scale: 0.6, opacity: 0, transformOrigin: 'center' });
      gsap.set(texts, { opacity: 0, y: 10 });

      const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
      STEPS.forEach((_, i) => {
        const label = `mstep${i}`;
        tl.addLabel(label, i === 0 ? 0 : '+=0.05');
        tl.to(glowPath, { drawSVG: `${((i + 1) / STEPS.length) * 100}%`, duration: 0.5, ease: 'power1.inOut' }, label);
        tl.to(nodes[i], { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.2)' }, `${label}+=0.12`);
        tl.to(texts[i], { opacity: 1, y: 0, duration: 0.35 }, '<0.05');
      });

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            tl.play();
            observer.disconnect();
          }
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      observer.observe(rail);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={railRef} className="relative mt-8" style={{ height: MINI_RAIL_HEIGHT }}>
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 100 ${MINI_RAIL_HEIGHT}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="or-mini-rail-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            {STEPS.map((s, i) => (
              <stop key={s.title} offset={`${(i / (STEPS.length - 1)) * 100}%`} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
        <path d={MINI_PATH_D} fill="none" stroke="url(#or-mini-rail-grad)" strokeWidth="1.5" opacity="0.4" vectorEffect="non-scaling-stroke" />
        <path
          ref={glowPathRef}
          d={MINI_PATH_D}
          fill="none"
          stroke="url(#or-mini-rail-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
          vectorEffect="non-scaling-stroke"
          style={{ filter: 'blur(1px)' }}
        />
      </svg>

      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const point = MINI_NODE_POINTS[i];
        return (
          <div
            key={step.title}
            className="absolute flex flex-col items-center text-center"
            style={{ left: `${point.x}%`, top: point.y, transform: 'translate(-50%, -50%)', width: 140 }}
          >
            <div
              ref={el => { nodeRefs.current[i] = el; }}
              className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 mb-2"
              style={{ background: '#0a0f1f', border: `2px solid ${step.color}` }}
            >
              <Icon size={14} style={{ color: step.color }} />
            </div>
            <div ref={el => { textRefs.current[i] = el; }}>
              <h4 className="font-display text-[11.5px] font-bold leading-tight mb-0.5" style={{ color: '#eef2ff' }}>
                {step.title}
              </h4>
              <p className="font-data text-[10px] leading-snug" style={{ color: 'rgba(217,226,255,0.5)' }}>
                {step.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const fieldStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#eef2ff',
};

function focusHandlers(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = 'rgba(235,10,30,0.6)';
}
function blurHandlers(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function OpenRequestForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { apps } = useAppStore();
  const activeApps = apps.filter(a => a.aktif);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // A native IntersectionObserver (not GSAP ScrollTrigger) drives this reveal:
  // ScrollTrigger only auto-refreshes on window resize/load, neither of which
  // fires on a Next.js client-side route change, so it can go stale and never
  // fire when navigating here in-app (works on a hard refresh, not on SPA
  // nav). IntersectionObserver re-evaluates against the live DOM on every
  // mount, so it can't go stale that way.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const [requester, setRequester] = useState('');
  const [lineName, setLineName] = useState('');
  const [appId, setAppId] = useState('');
  const [requestText, setRequestText] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    setPhotoError('');
    if (!file.type.startsWith('image/')) {
      setPhotoError('File harus berupa gambar.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Ukuran foto maksimal 2MB.');
      return;
    }
    try {
      setPhotoData(await readAsDataUrl(file));
    } catch {
      setPhotoError('Gagal membaca file foto.');
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/open-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester: requester.trim(),
          line_name: lineName,
          app_id: appId ? Number(appId) : null,
          request_text: requestText.trim(),
          photo_data: photoData,
        }),
      });
      if (res.ok) {
        setState('sent');
        setRequester('');
        setLineName('');
        setAppId('');
        setRequestText('');
        setPhotoData(null);
        onSubmitted();
        setTimeout(() => setState('idle'), 4000);
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Gagal mengirim request.');
        setState('error');
      }
    } catch {
      setError('Gagal mengirim request.');
      setState('error');
    }
  }

  const canSubmit = Boolean(
    requester.trim() && lineName && appId && requestText.trim(),
  );

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-10 lg:px-12 mt-10">
      <div
        ref={cardRef}
        className="rounded-2xl p-6 sm:p-10 flex flex-col md:flex-row gap-8 md:gap-14 transition-all duration-700 ease-out"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
        }}
      >
        <div className="w-full md:w-2/5 shrink-0">
          <h2 className="font-display text-[18px] font-bold mb-1.5" style={{ color: '#eef2ff' }}>
            Ajukan Request
          </h2>
          <p className="font-data text-[12.5px]" style={{ color: 'rgba(217,226,255,0.45)' }}>
            Ceritakan fitur apa yang Anda butuhkan — Section akan meninjau sebelum dikerjakan developer.
          </p>
          <RequestFlowMini />
        </div>

        <div className="w-full md:w-3/5">
        {state === 'sent' ? (
          <div className="flex items-center gap-3 py-4">
            <CheckCircle size={20} style={{ color: '#10B981' }} />
            <div>
              <p className="font-display text-[14.5px] font-bold" style={{ color: '#eef2ff' }}>Request terkirim!</p>
              <p className="font-data text-[12.5px]" style={{ color: 'rgba(217,226,255,0.45)' }}>
                Menunggu persetujuan Section.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label
                className="font-data block text-[11px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'rgba(217,226,255,0.4)' }}
              >
                Nama Pemohon <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <input
                type="text"
                value={requester}
                onChange={e => setRequester(e.target.value)}
                placeholder="Nama Anda"
                required
                className="font-data w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none transition-colors"
                style={fieldStyle}
                onFocus={focusHandlers}
                onBlur={blurHandlers}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="font-data block text-[11px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'rgba(217,226,255,0.4)' }}
                >
                  Line <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <select
                  value={lineName}
                  onChange={e => setLineName(e.target.value)}
                  required
                  className="font-data w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none appearance-none transition-colors"
                  style={{ background: '#0a296c', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}
                  onFocus={focusHandlers}
                  onBlur={blurHandlers}
                >
                  <option value="" style={{ background: '#111' }}>— Pilih Line —</option>
                  {REQUEST_LINES.map(line => (
                    <option key={line} value={line} style={{ background: '#111' }}>{line}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="font-data block text-[11px] font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'rgba(217,226,255,0.4)' }}
                >
                  Aplikasi <span style={{ color: '#ff6b6b' }}>*</span>
                </label>
                <select
                  value={appId}
                  onChange={e => setAppId(e.target.value)}
                  required
                  className="font-data w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none appearance-none transition-colors"
                  style={{ background: '#0a296c', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' }}
                  onFocus={focusHandlers}
                  onBlur={blurHandlers}
                >
                  <option value="" style={{ background: '#111' }}>— Pilih Aplikasi —</option>
                  {activeApps.map(a => (
                    <option key={a.id} value={a.id} style={{ background: '#111' }}>{a.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                className="font-data block text-[11px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'rgba(217,226,255,0.4)' }}
              >
                Detail Request <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <textarea
                value={requestText}
                onChange={e => setRequestText(e.target.value)}
                placeholder="Jelaskan fitur yang Anda butuhkan…"
                rows={4}
                required
                className="font-data w-full px-3.5 py-2.5 rounded-xl text-[13px] resize-none outline-none transition-colors"
                style={fieldStyle}
                onFocus={focusHandlers}
                onBlur={blurHandlers}
              />
            </div>

            <div>
              <label
                className="font-data block text-[11px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'rgba(217,226,255,0.4)' }}
              >
                Foto <span style={{ color: 'rgba(217,226,255,0.35)' }}>(opsional)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              {photoData ? (
                <div className="relative inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoData}
                    alt="Pratinjau foto request"
                    className="h-36 w-36 rounded-xl object-cover"
                    style={{ border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoData(null)}
                    aria-label="Hapus foto"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors hover:bg-red-500/20 focus-visible:outline focus-visible:outline-2"
                    style={{ background: '#0a152e', border: '1px solid rgba(255,255,255,0.15)', color: '#ff6b6b', outlineColor: '#EB0A1E' }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-data w-full h-36 flex flex-col items-center justify-center gap-2.5 px-3.5 rounded-xl text-[12.5px] font-semibold transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.18)', color: 'rgba(217,226,255,0.55)', outlineColor: 'rgba(235,10,30,0.6)' }}
                >
                  <ImagePlus size={26} />
                  Klik untuk unggah foto (maks. 2MB)
                </button>
              )}
              {photoError && (
                <p className="font-data text-[11.5px] mt-1.5" style={{ color: '#ff6b6b' }} role="alert">{photoError}</p>
              )}
            </div>

            {state === 'error' && (
              <p className="font-data text-[12px]" style={{ color: '#ff6b6b' }} role="alert">{error}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || state === 'sending'}
              className="font-data self-end inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline focus-visible:outline-2"
              style={{ background: '#EB0A1E', outlineColor: '#EB0A1E' }}
            >
              <Send size={13} />
              {state === 'sending' ? 'Mengirim…' : 'Kirim Request'}
            </button>
          </form>
        )}
        </div>
      </div>
    </section>
  );
}
