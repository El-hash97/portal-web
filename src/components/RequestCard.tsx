'use client';

import { useState } from 'react';
import { useAppStore } from '@/context/AppContext';
import { getAdminPassword } from '@/lib/storage';
import { PasswordModal } from '@/components/PasswordModal';
import type { FeatureRequest, RequestStatus } from '@/lib/types';

const STATUS_COLOR: Record<RequestStatus, string> = {
  menunggu: '#F59E0B',
  disetujui: '#3B82F6',
  dikerjakan: '#8B5CF6',
  selesai: '#10B981',
  ditolak: '#EB0A1E',
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
    const password = action === 'approve' || action === 'reject' ? extra.password : getAdminPassword();
    if (!password) return 'Sesi admin tidak valid, silakan login ulang.';

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
    return body.error || 'Gagal memproses aksi.';
  }

  async function handleModalConfirm(approver: string, password: string, reason: string): Promise<string | null> {
    const action = modal;
    if (!action) return null;
    const extra: Record<string, string> = { password, approver };
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

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[request.status] }} />
          <span
            className="text-[10.5px] font-bold tracking-widest uppercase"
            style={{ color: STATUS_COLOR[request.status] }}
          >
            {request.status}
          </span>
        </div>
        <span className="text-[11px]" style={{ color: 'rgba(217,226,255,0.4)' }}>
          {formatDate(request.created_at)}
        </span>
      </div>

      <div>
        <h3 className="text-[14px] font-bold mb-1" style={{ color: '#d9e2ff' }}>
          {request.app_nama ?? '— Aplikasi dihapus —'}
        </h3>
        <p
          className={`text-[13px] leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}
          style={{ color: 'rgba(217,226,255,0.65)' }}
        >
          {requestText}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="text-[11.5px] font-semibold mt-1"
            style={{ color: '#EB0A1E' }}
          >
            {expanded ? 'Sembunyikan' : 'Selengkapnya'}
          </button>
        )}
      </div>

      {request.status === 'disetujui' && request.approver && (
        <p className="text-[11.5px]" style={{ color: 'rgba(217,226,255,0.45)' }}>
          Disetujui oleh {request.approver}
        </p>
      )}
      {request.status === 'ditolak' && (
        <p className="text-[11.5px]" style={{ color: 'rgba(217,226,255,0.45)' }}>
          Ditolak oleh {request.approver} — {request.reject_reason}
        </p>
      )}
      {request.status === 'selesai' && (
        <p className="text-[11.5px]" style={{ color: 'rgba(217,226,255,0.45)' }}>
          Disetujui oleh {request.approver}
          {request.finished_at && ` · Selesai ${formatDate(request.finished_at)}`}
        </p>
      )}

      {actionError && <p className="text-[11.5px]" style={{ color: '#EB0A1E' }}>{actionError}</p>}

      <div
        className="flex items-center justify-between mt-1 pt-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-[11.5px]" style={{ color: 'rgba(217,226,255,0.45)' }}>
          {request.requester} · {request.line_name}
        </span>

        <div className="flex gap-2">
          {request.status === 'menunggu' && (
            <>
              <button
                type="button"
                onClick={() => setModal('approve')}
                className="px-3 py-1.5 rounded-lg text-[11.5px] font-bold text-white"
                style={{ background: '#3B82F6' }}
              >
                Setujui
              </button>
              <button
                type="button"
                onClick={() => setModal('reject')}
                className="px-3 py-1.5 rounded-lg text-[11.5px] font-bold text-white"
                style={{ background: '#EB0A1E' }}
              >
                Tolak
              </button>
            </>
          )}
          {request.status === 'disetujui' && isAdmin && (
            <button
              type="button"
              onClick={() => handleDirectAction('start')}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg text-[11.5px] font-bold text-white disabled:opacity-40"
              style={{ background: '#8B5CF6' }}
            >
              Mulai Kerjakan
            </button>
          )}
          {request.status === 'dikerjakan' && isAdmin && (
            <button
              type="button"
              onClick={() => handleDirectAction('finish')}
              disabled={busy}
              className="px-3 py-1.5 rounded-lg text-[11.5px] font-bold text-white disabled:opacity-40"
              style={{ background: '#10B981' }}
            >
              Tandai Selesai
            </button>
          )}
        </div>
      </div>

      {modal && (
        <PasswordModal
          title={modal === 'approve' ? 'Setujui Request' : 'Tolak Request'}
          requireReason={modal === 'reject'}
          onCancel={() => setModal(null)}
          onConfirm={handleModalConfirm}
        />
      )}
    </div>
  );
}
