'use client';

import { useState } from 'react';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import { getDeviceId } from '@/lib/device';

export function FeedbackForm() {
  const { apps } = useAppStore();
  const activeApps = apps.filter(a => a.aktif);
  const [appId, setAppId]   = useState('');
  const [pesan, setPesan]   = useState('');
  const [state, setState]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pesan.trim() || state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: appId ? Number(appId) : null,
          pesan: pesan.trim(),
          device_id: getDeviceId(),
        }),
      });
      if (res.ok) {
        setState('sent');
        setPesan('');
        setAppId('');
        setTimeout(() => setState('idle'), 4000);
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  return (
    <section className="mt-10 mb-2">
      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare size={13} style={{ color: '#EB0A1E' }} />
        <span className="text-[10.5px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>
          Saran &amp; Komentar
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-[13px] mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Bantu kami tingkatkan tool dengan melaporkan bug, memberikan ide perbaikan, atau menyampaikan pengalaman. Setiap masukan dibaca langsung oleh developer.
        </p>

        {state === 'sent' ? (
          <div className="flex items-center gap-3 py-4">
            <CheckCircle size={20} style={{ color: '#1D8A56' }} />
            <div>
              <p className="text-[14px] font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>Terima kasih!</p>
              <p className="text-[12.5px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Masukan kamu sudah diterima dan akan ditinjau oleh admin.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* App selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Aplikasi terkait (opsional)
              </label>
              <select
                value={appId}
                onChange={e => setAppId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none appearance-none"
                style={{
                  background: '#460a0aff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255, 255, 255, 0.71)',
                }}
              >
                <option value="" style={{ background: '#111111' }}>— Tidak ada / Umum —</option>
                {activeApps.map(a => <option key={a.id} value={a.id} style={{ background: '#111111' }}>{a.nama}</option>)}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Pesan <span style={{ color: '#EB0A1E' }}>*</span>
              </label>
              <textarea
                value={pesan}
                onChange={e => setPesan(e.target.value)}
                placeholder="Tulis saran, laporan bug, atau feedback lainnya…"
                rows={4}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] resize-none outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.85)',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(235,10,30,0.5)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>

            {state === 'error' && (
              <p className="text-[12px]" style={{ color: '#EB0A1E' }}>Gagal mengirim. Coba lagi.</p>
            )}

            <button
              type="submit"
              disabled={!pesan.trim() || state === 'sending'}
              className="self-end inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#EB0A1E' }}
            >
              <Send size={13} />
              {state === 'sending' ? 'Mengirim…' : 'Kirim'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
