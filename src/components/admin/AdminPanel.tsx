'use client';

import { useState } from 'react';
import { Plus, Info } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { useAppStore } from '@/context/AppContext';
import { CategorySection } from '@/components/CategorySection';
import { AppFormModal } from './AppFormModal';
import { ConfirmModal } from './ConfirmModal';
import type { App } from '@/lib/types';

export function AdminPanel() {
  const { apps, deleteApp } = useAppStore();
  const [editApp, setEditApp]           = useState<App | null>(null);
  const [formOpen, setFormOpen]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<App | null>(null);

  function openAdd() { setEditApp(null); setFormOpen(true); }
  function openEdit(app: App) { setEditApp(app); setFormOpen(true); }
  function openDelete(app: App) { setDeleteTarget(app); }

  const knownKeys = CATEGORIES.map(c => c.key);
  const extraCats = [...new Set(apps.map(a => a.kategori).filter(k => !knownKeys.includes(k)))];
  const allCats = [
    ...CATEGORIES,
    ...extraCats.map(k => ({ key: k, color: '#58595B', bg: 'rgba(88,89,91,0.10)' })),
  ];

  return (
    <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start sm:items-center justify-between gap-4 mb-6 flex-col sm:flex-row">
        <div>
          <h2 className="text-[20px] font-bold tracking-tight text-[#1A1A1A]">Kelola Aplikasi</h2>
          <p className="text-[13px] text-[#58595B] mt-1">Tambah, ubah, hapus, atau atur status aktif/nonaktif aplikasi.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: '#1A1A1A' }}
        >
          <Plus size={15} />
          Tambah Aplikasi
        </button>
      </div>

      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl mb-8 text-[12.5px]"
        style={{ background: 'rgba(235,10,30,0.06)', border: '1px solid rgba(235,10,30,0.14)', color: '#8B0000' }}
      >
        <Info size={15} className="shrink-0" style={{ color: '#EB0A1E' }} />
        Perubahan disimpan otomatis. Toggle status memengaruhi tampilan portal publik secara langsung.
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Plus size={40} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Belum Ada Aplikasi</h3>
          <p className="text-[14px] text-[#58595B]">Klik &ldquo;Tambah Aplikasi&rdquo; untuk memulai.</p>
        </div>
      ) : (
        allCats.map((cat, ci) => {
          const list = apps.filter(a => a.kategori === cat.key);
          return (
            <CategorySection
              key={cat.key}
              category={cat}
              apps={list}
              adminMode
              onEdit={openEdit}
              onDelete={openDelete}
              delayBase={ci * 60}
            />
          );
        })
      )}

      <AppFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        editApp={editApp}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteApp(deleteTarget.id); }}
        message={`"${deleteTarget?.nama}" akan dihapus permanen dari portal.`}
      />
    </main>
  );
}
