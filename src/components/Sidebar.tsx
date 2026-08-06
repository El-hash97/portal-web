'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Home, LayoutDashboard, Grid3x3, MessageSquarePlus, FileBarChart,
  Bell, KanbanSquare, LogOut, Menu, X, AppWindow, MessageSquare, Settings,
} from 'lucide-react';
import { useAppStore } from '@/context/AppContext';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
}

function GearIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

interface AdminNavItem {
  label: string;
  icon: React.ReactNode;
  tab: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAdmin, logout } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Home',         icon: <Home size={18} />,           href: '/' },
    { label: 'Dashboard',    icon: <LayoutDashboard size={18} />, href: '/dashboard' },
    { label: 'Applications', icon: <Grid3x3 size={18} />,        href: '/applications' },
    { label: 'Open Request', icon: <MessageSquarePlus size={18} />, href: '/open-request' },
    { label: 'Reports',      icon: <FileBarChart size={18} />,   href: '/reports' },
    { label: 'Notification', icon: <Bell size={18} />,        href: '/notifications' },
    { label: 'Story Board',  icon: <KanbanSquare size={18} /> },
  ];

  const adminNavItems: AdminNavItem[] = [
    { label: 'Kelola Aplikasi', icon: <AppWindow size={18} />, tab: 'apps' },
    { label: 'Komentar',        icon: <MessageSquare size={18} />, tab: 'komentar' },
    { label: 'Pengaturan',      icon: <Settings size={18} />, tab: 'pengaturan' },
  ];

  async function handleLogout() {
    await logout();
    setMobileOpen(false);
    router.push('/');
  }

  const content = (
    <>
      {/* Brand */}
      <div className="mb-6 sm:mb-8">
        <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Toyota" className="h-8 w-auto object-contain" />
        </Link>
        <div className="w-full h-px mt-4 opacity-30" style={{ background: '#2a344e' }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(item => {
          const active = item.href === '/'
            ? pathname === '/'
            : item.href
              ? pathname?.startsWith(item.href)
              : false;

          if (!item.href) {
            return (
              <div
                key={item.label}
                title="Segera hadir"
                className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-not-allowed select-none"
                style={{ color: 'rgba(217,226,255,0.28)' }}
              >
                {item.icon}
                <span className="font-mono-label text-[11px] tracking-wide uppercase">{item.label}</span>
              </div>
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

        {/* Admin-only menu items */}
        {isAdmin && (
          <>
            <div className="mx-4 my-2 h-px" style={{ background: '#1f2942' }} />
            <div className="px-4 pb-1">
              <span className="font-mono-label text-[9px] tracking-widest uppercase" style={{ color: 'rgba(217,226,255,0.25)' }}>
                Admin
              </span>
            </div>
            {adminNavItems.map(item => {
              const currentTab = searchParams.get('tab') ?? 'apps';
              const active = pathname === '/admin' && currentTab === item.tab;
              return (
                <Link
                  key={item.tab}
                  href={`/admin?tab=${item.tab}`}
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
          </>
        )}
      </nav>

      {/* Operator / session */}
      <div className="mt-auto pt-4 flex items-center justify-between gap-2" style={{ borderTop: '1px solid #1f2942' }}>
        {isAdmin ? (
          <>
            <div className="flex items-center gap-2 px-2" style={{ color: 'rgba(217,226,255,0.55)' }}>
              <span className="font-mono-label text-[10px] uppercase tracking-wide">Operator</span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="flex items-center justify-center p-2.5 rounded-lg transition-colors duration-150 hover:bg-white/5"
              style={{ color: 'rgba(217,226,255,0.55)' }}
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <>
            <span className="font-mono-label text-[10px] uppercase tracking-wide px-2" style={{ color: 'rgba(217,226,255,0.3)' }}>
              User
            </span>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              title="Developer Login"
              aria-label="Developer Login"
              className="flex items-center justify-center p-2.5 rounded-lg transition-colors duration-150 hover:bg-white/5"
              style={{ color: 'rgba(217,226,255,0.4)' }}
            >
              <GearIcon size={18} />
            </Link>
          </>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar toggle */}
      <div
        className="lg:hidden sticky top-0 z-40 w-full flex items-center justify-between px-3 sm:px-4 h-14 shrink-0"
        style={{ background: '#07122a', borderBottom: '1px solid #1f2942' }}
      >
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Toyota" className="h-7 w-auto object-contain" />
        </Link>
        <button onClick={() => setMobileOpen(o => !o)} style={{ color: 'rgba(217,226,255,0.8)' }} aria-label="Menu">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="w-[82vw] max-w-72 h-full flex flex-col py-6 px-4 overflow-y-auto"
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
