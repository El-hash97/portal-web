'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, CheckCircle, ImagePlus, X } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import { REQUEST_LINES } from '@/lib/constants';
import { gsap } from '@/lib/gsapPlugins';

const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // 2MB, before base64 encoding

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

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const tween = gsap.from(card, {
      opacity: 0,
      y: 28,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 85%', once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
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
    <section className="max-w-2xl mx-auto px-4 sm:px-10 lg:px-12 mt-10">
      <div
        ref={cardRef}
        className="rounded-2xl p-6 sm:p-7"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="font-display text-[18px] font-bold mb-1.5" style={{ color: '#eef2ff' }}>
          Ajukan Request
        </h2>
        <p className="font-data text-[12.5px] mb-6" style={{ color: 'rgba(217,226,255,0.45)' }}>
          Ceritakan fitur apa yang Anda butuhkan — Section akan meninjau sebelum dikerjakan developer.
        </p>

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
                    className="h-28 w-28 rounded-xl object-cover"
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
                  className="font-data w-full flex items-center justify-center gap-2 px-3.5 py-4 rounded-xl text-[12.5px] font-semibold transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.18)', color: 'rgba(217,226,255,0.55)', outlineColor: 'rgba(235,10,30,0.6)' }}
                >
                  <ImagePlus size={16} />
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
    </section>
  );
}
