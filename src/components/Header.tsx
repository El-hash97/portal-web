'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ChevronLeft } from 'lucide-react';
import { useClock } from '@/hooks/useClock';
import { useAppStore } from '@/context/AppContext';

export function Header() {
  const { time, date } = useClock();
  const { isAdmin, logout } = useAppStore();
  const pathname = usePathname();
  const router = useRouter();
  const onAdmin = pathname?.startsWith('/admin');

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header
      className="sticky top-0 z-40 shadow-[0_2px_12px_rgba(0,0,0,0.28)]"
      style={{ background: '#1A1A1A' }}
    >
      {/* dot-grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        {/* ── LEFT: brand + title ── */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="shrink-0 text-[10px] font-black tracking-[.18em] px-2.5 py-1 uppercase leading-none text-white"
            style={{ background: '#EB0A1E' }}
          >
            TOYOTA
          </span>

          <div className="hidden sm:block h-5 w-px bg-white/15 shrink-0" />

          <div className="hidden sm:block shrink-0">
            <div className="text-[9px] font-semibold tracking-[.1em] uppercase leading-none" style={{ color: 'rgba(255,255,255,0.35)' }}>
              TMMIN · EPSD Sunter 2
            </div>
            <div className="text-[11px] font-medium mt-0.5 leading-none" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Casting Division
            </div>
          </div>

          <div className="h-5 w-px bg-white/15 shrink-0 hidden sm:block" />

          <Link
            href="/"
            className="text-white font-bold text-[15px] leading-none tracking-tight hover:text-white/80 transition-colors truncate"
          >
            Casting Tools Hub
          </Link>
        </div>

        {/* ── RIGHT: admin controls + clock ── */}
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && onAdmin && (
            <>
              <span
                className="hidden sm:inline text-[10px] font-bold tracking-[.1em] px-2 py-1 rounded uppercase"
                style={{ color: '#ff7070', background: 'rgba(235,10,30,0.18)', border: '1px solid rgba(235,10,30,0.3)' }}
              >
                ADMIN
              </span>
              <Link
                href="/"
                className="flex items-center gap-1 text-[12px] font-medium px-2.5 py-1.5 rounded-md transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                <ChevronLeft size={13} />
                <span className="hidden sm:inline">Portal</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1.5 rounded-md text-white transition-colors"
                style={{ background: '#EB0A1E' }}
              >
                <LogOut size={12} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}

          <div className="text-right hidden sm:block pl-2 border-l border-white/10">
            <div
              className="text-[15px] font-light tabular-nums tracking-wide leading-none"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {time}
            </div>
            <div className="text-[9.5px] mt-1 leading-none" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {date}
            </div>
          </div>
        </div>
      </div>

      {/* red stripe */}
      <div className="h-[3px]" style={{ background: '#EB0A1E' }} />
    </header>
  );
}
