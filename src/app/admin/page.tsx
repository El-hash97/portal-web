'use client';

import { useAppStore } from '@/context/AppContext';
import { LoginForm } from '@/components/admin/LoginForm';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { GradientBars } from '@/components/ui/gradient-bars-background';

export default function AdminPage() {
  const { isAdmin } = useAppStore();

  return (
    <div className="relative min-h-screen" style={{ background: '#0a0a0a' }}>
      <GradientBars
        numBars={15}
        gradientFrom="rgba(235, 10, 30, 0.18)"
        gradientTo="transparent"
        animationDuration={3}
      />
      <div className="relative z-10">
        {isAdmin ? <AdminPanel /> : <LoginForm onSuccess={() => {}} />}
      </div>
    </div>
  );
}
