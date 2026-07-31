'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import { REQUEST_LINES } from '@/lib/constants';

export function OpenRequestForm({ onSubmitted }: { onSubmitted: () => void }) {
  const { apps } = useAppStore();
  const activeApps = apps.filter(a => a.aktif);

  const [requester, setRequester] = useState('');
  const [lineName, setLineName] = useState('');
  const [appId, setAppId] = useState('');
  const [requestText, setRequestText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

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
        }),
      });
      if (res.ok) {
        setState('sent');
        setRequester('');
        setLineName('');
        setAppId('');
        setRequestText('');
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
    requester.trim() && lineName && appId && requestText.trim().length >= 10,
  );

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-10 lg:px-12 mt-10">
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-[16px] font-bold mb-1" style={{ color: '#d9e2ff' }}>
          Ajukan Request
        </h2>
        <p className="text-[12.5px] mb-5" style={{ color: 'rgba(217,226,255,0.45)' }}>
          Ceritakan fitur apa yang Anda butuhkan — Section akan meninjau sebelum dikerjakan developer.
        </p>

        {state === 'sent' ? (
          <div className="flex items-center gap-3 py-4">
            <CheckCircle size={20} style={{ color: '#10B981' }} />
            <div>
              <p className="text-[14px] font-bold" style={{ color: '#d9e2ff' }}>Request terkirim!</p>
              <p className="text-[12.5px]" style={{ color: 'rgba(217,226,255,0.45)' }}>
                Menunggu persetujuan Section.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label
                className="block text-[11px] font-bold uppercase tracking-wide mb-2"
                style={{ color: 'rgba(217,226,255,0.4)' }}
              >
                Nama Pemohon <span style={{ color: '#EB0A1E' }}>*</span>
              </label>
              <input
                type="text"
                value={requester}
                onChange={e => setRequester(e.target.value)}
                placeholder="Nama Anda"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d9e2ff' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-[11px] font-bold uppercase tracking-wide mb-2"
                  style={{ color: 'rgba(217,226,255,0.4)' }}
                >
                  Line <span style={{ color: '#EB0A1E' }}>*</span>
                </label>
                <select
                  value={lineName}
                  onChange={e => setLineName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none appearance-none"
                  style={{ background: '#0a296c', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}
                >
                  <option value="" style={{ background: '#111' }}>— Pilih Line —</option>
                  {REQUEST_LINES.map(line => (
                    <option key={line} value={line} style={{ background: '#111' }}>{line}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-[11px] font-bold uppercase tracking-wide mb-2"
                  style={{ color: 'rgba(217,226,255,0.4)' }}
                >
                  Aplikasi <span style={{ color: '#EB0A1E' }}>*</span>
                </label>
                <select
                  value={appId}
                  onChange={e => setAppId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none appearance-none"
                  style={{ background: '#0a296c', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }}
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
                className="block text-[11px] font-bold uppercase tracking-wide mb-2"
                style={{ color: 'rgba(217,226,255,0.4)' }}
              >
                Detail Request <span style={{ color: '#EB0A1E' }}>*</span>
              </label>
              <textarea
                value={requestText}
                onChange={e => setRequestText(e.target.value)}
                placeholder="Jelaskan fitur yang Anda butuhkan, minimal 10 karakter…"
                rows={4}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] resize-none outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d9e2ff' }}
              />
            </div>

            {state === 'error' && (
              <p className="text-[12px]" style={{ color: '#EB0A1E' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || state === 'sending'}
              className="self-end inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#EB0A1E' }}
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
