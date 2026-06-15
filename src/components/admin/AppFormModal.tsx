'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ICON_OPTIONS, CATEGORY_OPTIONS } from '@/lib/constants';
import { useAppStore } from '@/context/AppContext';
import type { App } from '@/lib/types';

interface AppFormModalProps {
  open: boolean;
  onClose: () => void;
  editApp?: App | null;
}

const EMPTY = { nama: '', kategori: '', deskripsi: '', link: '', icon: 'activity', logo: '', aktif: true };

export function AppFormModal({ open, onClose, editApp }: AppFormModalProps) {
  const { addApp, updateApp } = useAppStore();
  const [form, setForm]     = useState(EMPTY);
  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editApp
        ? { nama: editApp.nama, kategori: editApp.kategori, deskripsi: editApp.deskripsi, link: editApp.link, icon: editApp.icon, logo: editApp.logo ?? '', aktif: editApp.aktif }
        : EMPTY
      );
      setError('');
      setSaving(false);
    }
  }, [open, editApp]);

  function set(field: string, val: string | boolean) {
    setForm(p => ({ ...p, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama.trim() || !form.kategori || !form.deskripsi.trim() || !form.link.trim()) {
      setError('Semua field wajib (*) harus diisi.');
      return;
    }
    if (form.link !== '#' && !form.link.startsWith('http://') && !form.link.startsWith('https://')) {
      setError('Link harus dimulai dengan https:// atau http://');
      return;
    }

    setSaving(true);
    setError('');

    const payload = { ...form, logo: form.logo.trim() || undefined };
    const ok = editApp
      ? await updateApp(editApp.id, payload)
      : await addApp(payload as Omit<App, 'id'>);

    if (ok) {
      onClose();
    } else {
      setError('Gagal menyimpan ke database. Periksa koneksi dan coba lagi.');
      setSaving(false);
    }
  }

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl text-[14px] text-[#1A1A1A] outline-none";
  const inputStyle = { border: '1.5px solid #E0E0E0', background: '#FAFAFA' };
  const fh = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = '#EB0A1E';
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(235,10,30,0.12)';
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = '#E0E0E0';
      e.currentTarget.style.boxShadow = 'none';
    },
  };

  return (
    <Modal open={open} onClose={saving ? () => {} : onClose} title={editApp ? 'Edit Aplikasi' : 'Tambah Aplikasi'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
        {error && (
          <div className="text-[13px] font-semibold px-4 py-3 rounded-lg"
            style={{ background: 'rgba(235,10,30,0.08)', color: '#EB0A1E', border: '1px solid rgba(235,10,30,0.2)' }}>
            {error}
          </div>
        )}

        <div>
          <label className="block text-[12.5px] font-bold text-[#1A1A1A] mb-2">
            Nama Aplikasi <span style={{ color: '#EB0A1E' }}>*</span>
          </label>
          <input type="text" value={form.nama} onChange={e => set('nama', e.target.value)}
            placeholder="mis. Furnace Tapping Tracker" className={inputCls} style={inputStyle} {...fh} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12.5px] font-bold text-[#1A1A1A] mb-2">Kategori <span style={{ color: '#EB0A1E' }}>*</span></label>
            <select value={form.kategori} onChange={e => set('kategori', e.target.value)} className={inputCls} style={inputStyle} {...fh}>
              <option value="">-- Pilih --</option>
              {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12.5px] font-bold text-[#1A1A1A] mb-2">Ikon</label>
            <select value={form.icon} onChange={e => set('icon', e.target.value)} className={inputCls} style={inputStyle} {...fh}>
              {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[12.5px] font-bold text-[#1A1A1A] mb-2">Deskripsi <span style={{ color: '#EB0A1E' }}>*</span></label>
          <textarea value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)}
            placeholder="Jelaskan fungsi aplikasi ini dalam 1–2 kalimat." rows={3}
            className={inputCls + ' resize-none'} style={inputStyle} {...fh} />
        </div>

        <div>
          <label className="block text-[12.5px] font-bold text-[#1A1A1A] mb-2">URL / Link <span style={{ color: '#EB0A1E' }}>*</span></label>
          <input type="text" value={form.link} onChange={e => set('link', e.target.value)}
            placeholder="https://..." className={inputCls} style={inputStyle} {...fh} />
          <p className="text-[11.5px] text-[#58595B] mt-1.5">Masukkan link lengkap termasuk https://</p>
        </div>

        <div>
          <label className="block text-[12.5px] font-bold text-[#1A1A1A] mb-2">Logo (path gambar)</label>
          <input type="text" value={form.logo} onChange={e => set('logo', e.target.value)}
            placeholder="/icons/nama-app.png" className={inputCls} style={inputStyle} {...fh} />
          <p className="text-[11.5px] text-[#58595B] mt-1.5">Opsional — path relatif ke folder /public (mis. /icons/e-henkaten.png)</p>
        </div>

        <div>
          <label className="block text-[12.5px] font-bold text-[#1A1A1A] mb-2">Status</label>
          <select value={form.aktif ? '1' : '0'} onChange={e => set('aktif', e.target.value === '1')} className={inputCls} style={inputStyle} {...fh}>
            <option value="1">Aktif — tampil di portal publik</option>
            <option value="0">Nonaktif — tersembunyi dari portal publik</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold disabled:opacity-40"
            style={{ border: '1.5px solid #E0E0E0', color: '#58595B' }}>
            Batal
          </button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center gap-2 disabled:opacity-70"
            style={{ background: '#EB0A1E' }}>
            {saving && (
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            )}
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
