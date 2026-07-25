'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, LayoutDashboard, Grid3x3, Database, FileBarChart,
  Bell, KanbanSquare, Settings, LogOut, UserCircle2, Menu, X,
} from 'lucide-react';
import { useAppStore } from '@/context/AppContext';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, logout } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Home',         icon: <Home size={18} />,           href: '/' },
    { label: 'Dashboard',    icon: <LayoutDashboard size={18} /> },
    { label: 'Applications', icon: <Grid3x3 size={18} />,        href: '/#apps-grid' },
    { label: 'Data Center',  icon: <Database size={18} /> },
    { label: 'Reports',      icon: <FileBarChart size={18} />,   href: '/admin' },
    { label: 'Notification', icon: <Bell size={18} /> },
    { label: 'Story Board',  icon: <KanbanSquare size={18} /> },
    { label: 'Settings',     icon: <Settings size={18} />,       href: '/admin' },
  ];

  function handleLogout() {
    logout();
    setMobileOpen(false);
    router.push('/');
  }

  const content = (
    <>
      {/* Brand */}
      <div className="mb-8">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Toyota" className="h-8 w-auto object-contain" />
          <span className="font-display text-[13px] font-bold tracking-[0.15em] uppercase" style={{ color: '#EB0A1E' }}>
            Toyota
          </span>
        </Link>
        <div className="w-full h-px mt-4 opacity-30" style={{ background: '#2a344e' }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(item => {
          const active = item.href === '/'
            ? pathname === '/'
            : item.href === '/admin'
              ? pathname?.startsWith('/admin')
              : false;

          if (!item.href) {
            return (
              <span
                key={item.label}
                title="Segera hadir"
                className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-not-allowed select-none"
                style={{ color: 'rgba(217,226,255,0.28)' }}
              >
                {item.icon}
                <span className="font-mono-label text-[11px] tracking-wide uppercase">{item.label}</span>
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-150"
              style={active
                ? { background: '#EB0A1E', color: '#fff', borderLeft: '4px solid #ffb4aa', fontWeight: 700 }
                : { color: 'rgba(217,226,255,0.55)' }
              }
            >
              {item.icon}
              <span className="font-mono-label text-[11px] tracking-wide uppercase">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Operator / session */}
      <div className="mt-auto pt-4" style={{ borderTop: '1px solid #1f2942' }}>
        {isAdmin ? (
          <>
            <div className="flex items-center gap-3 px-4 py-2" style={{ color: 'rgba(217,226,255,0.55)' }}>
              <UserCircle2 size={18} />
              <div className="flex flex-col">
                <span className="font-mono-label text-[11px] uppercase tracking-wide">Operator</span>
                <span className="text-[10px] opacity-70">Casting Division</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 mt-1 rounded-lg transition-colors duration-150 hover:bg-white/5"
              style={{ color: 'rgba(217,226,255,0.55)' }}
            >
              <LogOut size={18} />
              <span className="font-mono-label text-[11px] tracking-wide uppercase">Logout</span>
            </button>
          </>
        ) : (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-150 hover:bg-white/5"
            style={{ color: 'rgba(217,226,255,0.4)' }}
          >
            <UserCircle2 size={18} />
            <span className="font-mono-label text-[11px] tracking-wide uppercase">Developer Login</span>
          </Link>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar toggle */}
      <div
        className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ background: '#07122a', borderBottom: '1px solid #1f2942' }}
      >
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Toyota" className="h-6 w-auto object-contain" />
          <span className="font-display text-[12px] font-bold tracking-widest uppercase" style={{ color: '#EB0A1E' }}>Toyota</span>
        </Link>
        <button onClick={() => setMobileOpen(o => !o)} style={{ color: 'rgba(217,226,255,0.8)' }} aria-label="Menu">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="w-72 h-full flex flex-col py-6 px-4"
            style={{ background: '#07122a', borderRight: '1px solid #1f2942' }}
          >
            {content}
          </div>
          <div className="flex-1" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex sticky top-0 h-screen w-64 shrink-0 flex-col py-6 px-4"
        style={{ background: '#07122a', borderRight: '1px solid #1f2942' }}
      >
        {content}
      </aside>
    </>
  );
}
