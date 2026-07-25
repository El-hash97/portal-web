'use client';

export function Footer() {
  return (
    <footer className="mt-auto" style={{ background: 'rgba(3,13,37,0.8)', borderTop: '1px solid #1f2942' }}>
      <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-12 py-3 flex flex-col sm:flex-row items-center justify-between gap-1">
        <span className="font-mono-label text-[10px] tracking-wide uppercase text-center sm:text-left" style={{ color: 'rgba(217,226,255,0.4)' }}>
          PT Toyota Motor Manufacturing Indonesia · EPSD Sunter 2 – Casting Division
        </span>
        <span className="font-mono-label text-[10px] tracking-wide" style={{ color: 'rgba(217,226,255,0.25)' }}>
          © 2026
        </span>
      </div>
    </footer>
  );
}
