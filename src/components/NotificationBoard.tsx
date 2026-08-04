'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Bell, Check, LogIn, LogOut, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { useAppStore } from '@/context/AppContext';
import type { Notification, NotificationStatus } from '@/lib/types';

function formatDate(value: string | null): string {
  if (!value) return '';
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function NotificationBoard() {
  const { isAdmin, login, logout } = useAppStore();
  const [items, setItems] = useState<Notification[] | null>(null);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  async function load() {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error();
      setItems(await response.json());
      setError('');
    } catch {
      setError('Informasi tidak dapat dimuat.');
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function submitLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const ok = await login(username.trim(), password);
      if (!ok) {
        setLoginError('Username atau password salah.');
        setPassword('');
        return;
      }
      setModalOpen(false);
      setPassword('');
    } catch {
      setLoginError('Login tidak dapat diproses.');
    } finally {
      setLoading(false);
    }
  }

  async function createNotification(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setItems(previous => previous ? [body, ...previous] : [body]);
      setTitle('');
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan informasi.');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: NotificationStatus) {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setItems(previous => previous?.map(item => item.id === id ? body : item) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengubah informasi.');
    } finally {
      setLoading(false);
    }
  }

  async function removeNotification(id: number) {
    if (!window.confirm('Hapus informasi ini?')) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setItems(previous => previous?.filter(item => item.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus informasi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
      <section className="relative overflow-hidden rounded-2xl px-5 py-6 sm:px-7 sm:py-7" style={{ background: 'linear-gradient(135deg, #07122a 0%, #12355b 100%)', border: '1px solid rgba(217,226,255,0.15)' }}>
        <div className="absolute inset-0 v2-scanline opacity-30" />
        <div className="relative flex items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-3" style={{ color: '#ffb4aa' }}><Bell size={17} /><span className="font-mono-label text-[10px] tracking-[0.2em] uppercase">Pusat Informasi</span></div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: '#fff' }}>Notification</h1>
            <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: 'rgba(217,226,255,0.72)' }}>Informasi terbaru untuk seluruh pengguna Casting Tools Hub.</p>
          </div>
          {isAdmin ? <button onClick={() => void logout()} className="shrink-0 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold" style={{ color: 'rgba(217,226,255,0.85)', background: 'rgba(255,255,255,0.08)' }}><LogOut size={15} />Logout</button> : <button onClick={() => setModalOpen(true)} title="Login admin" aria-label="Login admin" className="shrink-0 grid place-items-center w-9 h-9 rounded-full" style={{ color: '#fff', background: '#EB0A1E' }}><LogIn size={17} /></button>}
        </div>
      </section>

      {isAdmin && <section className="mt-7 rounded-2xl p-5 sm:p-6" style={{ background: 'rgba(3,13,37,0.72)', border: '1px solid rgba(217,226,255,0.14)' }}>
        <div className="flex items-center gap-2 mb-5" style={{ color: '#fff' }}><Plus size={17} /><h2 className="font-display font-bold">Tambah Informasi</h2></div>
        <form onSubmit={createNotification} className="grid gap-3">
          <input value={title} onChange={event => setTitle(event.target.value)} maxLength={160} required placeholder="Judul informasi" className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ color: '#eef2ff', background: '#071a35', border: '1px solid rgba(217,226,255,0.2)' }} />
          <textarea value={content} onChange={event => setContent(event.target.value)} maxLength={5000} required rows={4} placeholder="Isi informasi" className="w-full resize-y rounded-xl px-4 py-3 text-sm outline-none" style={{ color: '#eef2ff', background: '#071a35', border: '1px solid rgba(217,226,255,0.2)' }} />
          <button disabled={loading} className="justify-self-start rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50" style={{ background: '#EB0A1E' }}>Publikasikan</button>
        </form>
      </section>}

      <section className="mt-9">
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: '#eef2ff' }}>Daftar Informasi</h2>
        {error && <p className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ color: '#ffb4aa', background: 'rgba(235,10,30,0.12)' }}>{error}</p>}
        {!items ? <div className="grid gap-4"><div className="h-32 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} /><div className="h-32 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} /></div> : items.length === 0 ? <p className="py-12 text-center text-sm" style={{ color: 'rgba(217,226,255,0.55)' }}>Belum ada informasi.</p> : <div className="grid gap-4">{items.map(item => {
          const completed = item.status === 'completed';
          return <article key={item.id} className="rounded-xl p-4 sm:p-5 transition-opacity" style={{ background: 'rgba(3,13,37,0.74)', border: '1px solid rgba(217,226,255,0.14)', opacity: completed ? 0.56 : 1 }}>
            <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-lg font-bold" style={{ color: '#fff' }}>{item.title}</h3>{completed && <span className="rounded-full px-2 py-0.5 font-mono-label text-[9px] tracking-wider uppercase" style={{ background: 'rgba(217,226,255,0.15)', color: '#d9e2ff' }}>Selesai</span>}</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6" style={{ color: 'rgba(217,226,255,0.76)' }}>{item.content}</p><p className="mt-4 font-mono-label text-[10px]" style={{ color: 'rgba(217,226,255,0.45)' }}>{completed ? `Selesai ${formatDate(item.completed_at)}` : `Dipublikasikan ${formatDate(item.created_at)}`}</p></div>
            {isAdmin && <div className="flex shrink-0 gap-2">{completed ? <button disabled={loading} onClick={() => void updateStatus(item.id, 'active')} title="Aktifkan kembali" aria-label="Aktifkan kembali" className="p-2 rounded-lg disabled:opacity-50" style={{ color: '#9bd5ff', background: 'rgba(80,180,255,0.12)' }}><RotateCcw size={16} /></button> : <button disabled={loading} onClick={() => void updateStatus(item.id, 'completed')} title="Selesai" aria-label="Selesai" className="p-2 rounded-lg disabled:opacity-50" style={{ color: '#a8edc2', background: 'rgba(45,180,100,0.12)' }}><Check size={16} /></button>}<button disabled={loading} onClick={() => void removeNotification(item.id)} title="Hapus" aria-label="Hapus" className="p-2 rounded-lg disabled:opacity-50" style={{ color: '#ffb4aa', background: 'rgba(235,10,30,0.12)' }}><Trash2 size={16} /></button></div>}</div>
          </article>;
        })}</div>}
      </section>

      {modalOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-label="Login admin"><form onSubmit={submitLogin} className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: '#07122a', border: '1px solid rgba(217,226,255,0.18)' }}><button type="button" onClick={() => setModalOpen(false)} aria-label="Tutup" className="absolute right-4 top-4 p-1" style={{ color: 'rgba(217,226,255,0.7)' }}><X size={18} /></button><h2 className="font-display text-xl font-bold" style={{ color: '#eef2ff' }}>Login Admin</h2><p className="mt-1 text-sm" style={{ color: 'rgba(217,226,255,0.6)' }}>Masuk untuk mengelola informasi.</p>{loginError && <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ color: '#ffb4aa', background: 'rgba(235,10,30,0.16)' }}>{loginError}</p>}<div className="mt-5 grid gap-3"><input value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" required placeholder="Username" className="rounded-xl px-3 py-2.5 text-sm outline-none" style={{ color: '#eef2ff', background: '#0b1f3d', border: '1px solid rgba(217,226,255,0.2)' }} /><input value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required type="password" placeholder="Password" className="rounded-xl px-3 py-2.5 text-sm outline-none" style={{ color: '#eef2ff', background: '#0b1f3d', border: '1px solid rgba(217,226,255,0.2)' }} /><button disabled={loading} className="rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-50" style={{ background: '#EB0A1E' }}>{loading ? 'Memverifikasi...' : 'Masuk'}</button></div></form></div>}
    </main>
  );
}
