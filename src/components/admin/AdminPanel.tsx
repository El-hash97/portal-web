'use client';

import { useState } from 'react';
import { Plus, Info } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import { AppCard } from '@/components/AppCard';
import { AppFormModal } from './AppFormModal';
import { ConfirmModal } from './ConfirmModal';
import { KpiSection } from './KpiSection';
import type { App } from '@/lib/types';

export function AdminPanel() {
  const { apps, deleteApp } = useAppStore();
  const [editApp, setEditApp]           = useState<App | null>(null);
  const [formOpen, setFormOpen]         = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<App | null>(null);

  function openAdd() { setEditApp(null); setFormOpen(true); }
  function openEdit(app: App) { setEditApp(app); setFormOpen(true); }
  function openDelete(app: App) { setDeleteTarget(app); }

  return (
    <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start sm:items-center justify-between gap-4 mb-6 flex-col sm:flex-row">
        <div>
          <h2 className="text-[20px] font-bold tracking-tight" style={{ color: 'rgba(255,255,255,0.92)' }}>Kelola Aplikasi</h2>
          <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Tambah, ubah, hapus, atau atur status aktif/nonaktif aplikasi.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: '#EB0A1E' }}
        >
          <Plus size={15} />
          Tambah Aplikasi
        </button>
      </div>

      <div
        className="flex items-center gap-3 px-5 py-3 rounded-xl mb-8 text-[12.5px]"
        style={{ background: 'rgba(235,10,30,0.10)', border: '1px solid rgba(235,10,30,0.25)', color: 'rgba(255,120,120,0.9)' }}
      >
        <Info size={15} className="shrink-0" style={{ color: '#EB0A1E' }} />
        Perubahan disimpan otomatis. Toggle status memengaruhi tampilan portal publik secara langsung.
      </div>

      <KpiSection apps={apps} />

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Plus size={40} className="mb-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>Belum Ada Aplikasi</h3>
          <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Klik &ldquo;Tambah Aplikasi&rdquo; untuk memulai.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {apps.map((app, i) => (
            <AppCard
              key={app.id}
              app={app}
              adminMode
              delay={i * 60}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
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
