'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface PasswordModalProps {
  title: string;
  confirmLabel: string;
  confirmColor: string;
  requireReason?: boolean;
  onCancel: () => void;
  onConfirm: (password: string, reason: string) => Promise<string | null>;
}

export function PasswordModal({
  title,
  confirmLabel,
  confirmColor,
  requireReason,
  onCancel,
  onConfirm,
}: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    passwordRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await onConfirm(password, reason.trim());
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
      style={{ background: 'rgba(4,8,20,0.72)', backdropFilter: 'blur(2px)' }}
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{
          background: '#0a152e',
          border: '1px solid #26314f',
          boxShadow: '0 24px 64px -16px rgba(0,0,0,0.55)',
        }}
      >
        <div className="flex items-start justify-between mb-5">
          <h3 id="password-modal-title" className="font-display text-[17px] font-bold leading-tight" style={{ color: '#eef2ff' }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup"
            className="shrink-0 -mt-1 -mr-1 p-1.5 rounded-lg transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2"
            style={{ color: 'rgba(217,226,255,0.5)', outlineColor: '#EB0A1E' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="flex flex-col gap-4">
          {requireReason && (
            <div>
              <label
                className="font-data block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'rgba(217,226,255,0.45)' }}
              >
                Alasan Penolakan
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={2}
                required
                className="font-data w-full px-3.5 py-2.5 rounded-xl text-[13px] resize-none outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#eef2ff' }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(235,10,30,0.6)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
            </div>
          )}

          <div>
            <label
              className="font-data block text-[11px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'rgba(217,226,255,0.45)' }}
            >
              Password Section
            </label>
            <input
              ref={passwordRef}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="font-data w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#eef2ff' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(235,10,30,0.6)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            />
          </div>

          {error && (
            <p className="font-data text-[12px]" style={{ color: '#ff6b6b' }} role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={onCancel}
              className="font-data px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2"
              style={{ color: 'rgba(217,226,255,0.6)', outlineColor: 'rgba(217,226,255,0.4)' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={busy}
              className="font-data px-4 py-2 rounded-xl text-[13px] font-bold text-white transition-opacity disabled:opacity-40 focus-visible:outline focus-visible:outline-2"
              style={{ background: confirmColor, outlineColor: confirmColor }}
            >
              {busy ? 'Memproses…' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
