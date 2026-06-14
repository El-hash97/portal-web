'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const onAdmin = pathname?.startsWith('/admin');

  return (
    <footer style={{ background: '#2B2B2B', borderTop: '3px solid #111' }} className="mt-auto">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[10.5px] font-medium tracking-[.06em] uppercase" style={{ color: 'rgba(255,255,255,0.28)' }}>
            PRD-TMMIN-CAST-HUB-001 · v1.0 · 14 Juni 2026
          </div>
          <div className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Penambahan aplikasi → Admin Portal · Casting Division
          </div>
        </div>

        {!onAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-md transition-colors hover:border-white/30"
            style={{
              color: 'rgba(255,255,255,0.35)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <Settings size={13} />
            Admin
          </Link>
        )}
      </div>
    </footer>
  );
}
