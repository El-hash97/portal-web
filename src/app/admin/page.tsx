'use client';

import { useAppStore } from '@/context/AppContext';
import { LoginForm } from '@/components/admin/LoginForm';
import { AdminPanel } from '@/components/admin/AdminPanel';

export default function AdminPage() {
  const { isAdmin } = useAppStore();

  if (!isAdmin) {
    // Context state update in login() will automatically re-render this page
    return <LoginForm onSuccess={() => {}} />;
  }

  return <AdminPanel />;
}
