'use client';

import { useState } from 'react';
import { Check, X as XIcon } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import { PasswordModal } from '@/components/PasswordModal';
import type { FeatureRequest, RequestStatus } from '@/lib/types';

const STATUS_COLOR: Record<RequestStatus, string> = {
  menunggu: '#F59E0B',
  disetujui: '#3B82F6',
  dikerjakan: '#8B5CF6',
  selesai: '#10B981',
  ditolak: '#EB0A1E',
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  menunggu: 'Menunggu',
  disetujui: 'Disetujui',
  dikerjakan: 'Dikerjakan',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function RequestCard({ request, onChanged }: { request: FeatureRequest; onChanged: () => void }) {
  const { isAdmin } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [modal, setModal] = useState<'approve' | 'reject' | null>(null);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  async function runAction(
    action: 'approve' | 'reject' | 'start' | 'finish',
    extra: Record<string, string> = {},
  ): Promise<string | null> {
    const password = action === 'approve' || action === 'reject' ? extra.password : '';
    if ((action === 'approve' || action === 'reject') && !password) return 'Password wajib diisi.';

    try {
      const res = await fetch(`/api/open-request/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, password, ...extra }),
      });

      if (res.ok) {
        onChanged();
        return null;
      }
      const body = await res.json().catch(() => ({}));
      if (res.status === 409) onChanged();
      return body.error || 'Gagal memproses aksi.';
    } catch {
      return 'Gagal memproses aksi. Periksa koneksi Anda.';
    }
  }

  async function handleModalConfirm(password: string, reason: string): Promise<string | null> {
    const action = modal;
    if (!action) return null;
    const extra: Record<string, string> = { password };
    if (action === 'reject') extra.reject_reason = reason;
    const error = await runAction(action, extra);
    if (!error) setModal(null);
    return error;
  }

  async function handleDirectAction(action: 'start' | 'finish') {
    setBusy(true);
    setActionError('');
    const error = await runAction(action);
    if (error) setActionError(error);
    setBusy(false);
  }

  const requestText = request.request_text;
  const isLong = requestText.length > 160;
  const statusColor = STATUS_COLOR[request.status];

  return (
    <div
      data-flip-id={`request-${request.id}`}
      className="or-request-card group relative rounded-2xl p-5 flex flex-col gap-3.5 transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Status rail — a thin accent tied to the card's own state, not a generic border-left habit */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${statusColor}, transparent)` }}
      />

      <div className="flex items-center justify-between">
        <div
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full"
          style={{ background: `${statusColor}1a` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
          <span
            className="font-data text-[10.5px] font-bold tracking-wide uppercase"
            style={{ color: statusColor }}
          >
            {STATUS_LABEL[request.status]}
          </span>
        </div>
        <span className="font-data text-[11px]" style={{ color: 'rgba(217,226,255,0.4)' }}>
          {formatDate(request.created_at)}
        </span>
      </div>

      <div>
        <div className="flex items-start gap-3">
          {request.photo_data && (
            <a
              href={request.photo_data}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg overflow-hidden transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2"
              style={{ outlineColor: '#EB0A1E' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={request.photo_data}
                alt={`Foto lampiran request ${request.app_nama ?? ''}`}
                className="w-14 h-14 object-cover"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </a>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[15px] font-bold leading-tight mb-1.5" style={{ color: '#eef2ff' }}>
              {request.app_nama ?? '— Aplikasi dihapus —'}
            </h3>
            <p
              className={`font-data text-[13px] leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}
              style={{ color: 'rgba(217,226,255,0.65)' }}
            >
              {requestText}
            </p>
          </div>
        </div>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="font-data text-[11.5px] font-semibold mt-1 transition-opacity hover:opacity-80"
            style={{ color: '#ff6b6b' }}
          >
            {expanded ? 'Sembunyikan' : 'Selengkapnya'}
          </button>
        )}
      </div>

      {request.status === 'disetujui' && (
        <p className="font-data text-[11.5px]" style={{ color: 'rgba(217,226,255,0.45)' }}>
          Disetujui oleh {request.approver}
        </p>
      )}
      {request.status === 'ditolak' && (
        <p className="font-data text-[11.5px]" style={{ color: 'rgba(217,226,255,0.45)' }}>
          Ditolak — {request.reject_reason}
        </p>
      )}
      {request.status === 'selesai' && (
        <p className="font-data text-[11.5px]" style={{ color: 'rgba(217,226,255,0.45)' }}>
          Disetujui oleh {request.approver}
          {request.finished_at && ` · Selesai ${formatDate(request.finished_at)}`}
        </p>
      )}

      {actionError && (
        <p className="font-data text-[11.5px]" style={{ color: '#ff6b6b' }} role="alert">
          {actionError}
        </p>
      )}

      <div
        className="flex items-center justify-between gap-3 mt-1 pt-3.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="font-data text-[11.5px] truncate" style={{ color: 'rgba(217,226,255,0.45)' }}>
          {request.requester} · {request.line_name}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {request.status === 'menunggu' && (
            <>
              <button
                type="button"
                onClick={() => setModal('reject')}
                className="font-data inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors hover:bg-white/5 focus-visible:outline focus-visible:outline-2"
                style={{ color: 'rgba(217,226,255,0.55)', outlineColor: 'rgba(217,226,255,0.4)' }}
              >
                <XIcon size={13} />
                Tolak
              </button>
              <button
                type="button"
                onClick={() => setModal('approve')}
                className="font-data inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11.5px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2"
                style={{ background: STATUS_COLOR.disetujui, outlineColor: STATUS_COLOR.disetujui }}
              >
                <Check size={13} />
                Setujui
              </button>
            </>
          )}
          {request.status === 'disetujui' && isAdmin && (
            <button
              type="button"
              onClick={() => handleDirectAction('start')}
              disabled={busy}
              className="font-data px-3 py-1.5 rounded-lg text-[11.5px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline focus-visible:outline-2"
              style={{ background: STATUS_COLOR.dikerjakan, outlineColor: STATUS_COLOR.dikerjakan }}
            >
              Mulai Kerjakan
            </button>
          )}
          {request.status === 'dikerjakan' && isAdmin && (
            <button
              type="button"
              onClick={() => handleDirectAction('finish')}
              disabled={busy}
              className="font-data px-3 py-1.5 rounded-lg text-[11.5px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline focus-visible:outline-2"
              style={{ background: STATUS_COLOR.selesai, outlineColor: STATUS_COLOR.selesai }}
            >
              Tandai Selesai
            </button>
          )}
        </div>
      </div>

      {modal && (
        <PasswordModal
          title={modal === 'approve' ? 'Setujui Request' : 'Tolak Request'}
          confirmLabel={modal === 'approve' ? 'Setujui' : 'Tolak'}
          confirmColor={modal === 'approve' ? STATUS_COLOR.disetujui : STATUS_COLOR.ditolak}
          requireReason={modal === 'reject'}
          onCancel={() => setModal(null)}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
}
