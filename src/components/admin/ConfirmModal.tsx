'use client';

import { Modal } from '@/components/ui/Modal';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
}

export function ConfirmModal({ open, onClose, onConfirm, title = 'Hapus Aplikasi?', message }: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
      <div className="px-7 py-7 text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(235,10,30,0.10)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EB0A1E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        <h3 className="text-[17px] font-bold text-[#1A1A1A] mb-2">{title}</h3>
        <p className="text-[13.5px] text-[#58595B] leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold"
            style={{ border: '1.5px solid #E0E0E0', color: '#58595B' }}>
            Batal
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white"
            style={{ background: '#EB0A1E' }}>
            Hapus
          </button>
        </div>
      </div>
    </Modal>
  );
}
