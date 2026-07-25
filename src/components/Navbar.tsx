export function Navbar() {
  return (
    <div
      className="hidden lg:flex items-center justify-between px-10 xl:px-12 h-16 shrink-0"
      style={{
        background: 'linear-gradient(90deg, #050F2E 0%, #0C2358 100%)',
        borderBottom: '1px solid #1f2942',
      }}
    >
      <div className="flex flex-col gap-1.5">
        <span className="font-mono-label text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(217,226,255,0.4)' }}>
          EPSD Sunter 2
        </span>
        <span
          className="font-mono-label text-[10px] tracking-[0.15em] uppercase inline-block w-fit text-white px-6 py-1.5"
          style={{
            background: '#EB0A1E',
            clipPath: 'polygon(0 0, 100% 0, 88% 100%, 0% 100%)',
          }}
        >
          Casting Division
        </span>
      </div>

      <div
        className="text-white flex flex-col justify-center leading-tight px-7 py-2 pl-9"
        style={{
          background: '#EB0A1E',
          clipPath: 'polygon(12% 0, 100% 0, 100% 100%, 0% 100%)',
        }}
      >
        <span className="font-bold text-[12px] tracking-wider">TOYOTA</span>
        <span className="text-[9px] font-normal">Production System</span>
      </div>
    </div>
  );
}
