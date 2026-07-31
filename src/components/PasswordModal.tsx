'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface PasswordModalProps {
  title: string;
  requireReason?: boolean;
  onCancel: () => void;
  onConfirm: (approver: string, password: string, reason: string) => Promise<string | null>;
}

export function PasswordModal({ title, requireReason, onCancel, onConfirm }: PasswordModalProps) {
  const [approver, setApprover] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await onConfirm(approver.trim(), password, reason.trim());
    if (result) {
      setError(result);
      setPassword('');
      setBusy(false);
    }
    // On success the parent unmounts this modal — no further local state needed.
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
    >
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#0a152e', border: '1px solid #2f3952' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold" style={{ color: '#d9e2ff' }}>{title}</h3>
          <button type="button" onClick={onCancel} aria-label="Tutup" style={{ color: 'rgba(217,226,255,0.5)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="flex flex-col gap-3">
          <div>
            <label
              className="block text-[11px] font-bold uppercase tracking-wide mb-1.5"
              style={{ color: 'rgba(217,226,255,0.4)' }}
            >
              Nama Anda
            </label>
            <input
              type="text"
              value={approver}
              onChange={e => setApprover(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d9e2ff' }}
            />
          </div>

          {requireReason && (
            <div>
              <label
                className="block text-[11px] font-bold uppercase tracking-wide mb-1.5"
                style={{ color: 'rgba(217,226,255,0.4)' }}
              >
                Alasan Penolakan
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={2}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] resize-none outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d9e2ff' }}
              />
            </div>
          )}

          <div>
            <label
              className="block text-[11px] font-bold uppercase tracking-wide mb-1.5"
              style={{ color: 'rgba(217,226,255,0.4)' }}
            >
              Password Section
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d9e2ff' }}
            />
          </div>

          {error && <p className="text-[12px]" style={{ color: '#EB0A1E' }}>{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold"
              style={{ color: 'rgba(217,226,255,0.6)' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
              style={{ background: '#EB0A1E' }}
            >
              {busy ? 'Memproses…' : 'Konfirmasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
