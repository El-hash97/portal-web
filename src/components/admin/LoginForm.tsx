'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/context/AppContext';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAppStore();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const userRef = useRef<HTMLInputElement>(null);

  useEffect(() => { userRef.current?.focus(); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const ok = login(user.trim(), pass);
      if (ok) {
        onSuccess();
      } else {
        setError('Username atau password salah.');
        setPass('');
        setLoading(false);
      }
    }, 300);
  }

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-7 text-center" style={{ background: '#1A1A1A' }}>
            <span
              className="inline-block text-[10px] font-black tracking-[.18em] px-3 py-1 uppercase text-white mb-4"
              style={{ background: '#EB0A1E' }}
            >
              TOYOTA
            </span>
            <h2 className="text-[22px] font-bold text-white tracking-tight">Admin Login</h2>
            <p className="text-[12px] mt-1.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
              Casting Tools Hub · Casting Division
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
            {error && (
              <div
                className="text-[13px] font-semibold px-4 py-3 rounded-lg"
                style={{ background: 'rgba(235,10,30,0.08)', color: '#EB0A1E', border: '1px solid rgba(235,10,30,0.2)' }}
              >
                {error}
              </div>
            )}

            <div>
              <label className="block text-[12.5px] font-bold text-[#1A1A1A] mb-2">
                Username <span style={{ color: '#EB0A1E' }}>*</span>
              </label>
              <input
                ref={userRef}
                type="text"
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="username"
                autoComplete="username"
                required
                className="w-full px-4 py-2.5 rounded-xl text-[14px] text-[#1A1A1A] outline-none"
                style={{ border: '1.5px solid #E0E0E0', background: '#FAFAFA' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#EB0A1E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(235,10,30,0.12)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-bold text-[#1A1A1A] mb-2">
                Password <span style={{ color: '#EB0A1E' }}>*</span>
              </label>
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-2.5 rounded-xl text-[14px] text-[#1A1A1A] outline-none"
                style={{ border: '1.5px solid #E0E0E0', background: '#FAFAFA' }}
                onFocus={e => { e.currentTarget.style.borderColor = '#EB0A1E'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(235,10,30,0.12)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = '#E0E0E0'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white text-[14px] font-bold tracking-wide mt-2 transition-opacity"
              style={{ background: loading ? '#ccc' : '#EB0A1E' }}
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
