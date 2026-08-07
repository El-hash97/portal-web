'use client';

import { Suspense } from 'react';
import { useAppStore } from '@/context/AppContext';
import { LoginForm } from '@/components/admin/LoginForm';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { GradientBars } from '@/components/ui/gradient-bars-background';

export default function AdminPage() {
  const { isDeveloper } = useAppStore();

  return (
    <div className="relative flex-1 min-h-screen">
      <GradientBars
        numBars={15}
        gradientFrom="rgba(235, 10, 30, 0.18)"
        gradientTo="transparent"
        animationDuration={3}
      />
      <div className="relative z-10">
        {/* Requires the full developer role — a notification-scoped session
            (from the Notification page's own login) lands here too but sees
            the login form again, since it can't reach app-wide settings. */}
        {isDeveloper
          ? <Suspense fallback={null}><AdminPanel /></Suspense>
          : <LoginForm onSuccess={() => {}} />
        }
      </div>
    </div>
  );
}
