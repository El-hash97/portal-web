'use client';

import type { App, Category } from '@/lib/types';
import { AppCard } from './AppCard';

interface CategorySectionProps {
  category: Category;
  apps: App[];
  adminMode?: boolean;
  onEdit?: (app: App) => void;
  onDelete?: (app: App) => void;
  delayBase?: number;
}

export function CategorySection({
  category, apps, adminMode = false, onEdit, onDelete, delayBase = 0,
}: CategorySectionProps) {
  if (!apps.length) return null;

  const activeCount = apps.filter(a => a.aktif).length;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-6 rounded-full shrink-0" style={{ background: '#EB0A1E' }} />
        <h2 className="text-[17px] font-bold tracking-tight text-[#1A1A1A]">{category.key}</h2>
        <span
          className="text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ color: '#EB0A1E', background: 'rgba(235,10,30,0.10)', border: '1px solid rgba(235,10,30,0.18)' }}
        >
          {adminMode
            ? `${apps.length} total · ${activeCount} aktif`
            : `${apps.length} aplikasi`}
        </span>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {apps.map((app, i) => (
          <AppCard
            key={app.id}
            app={app}
            adminMode={adminMode}
            delay={delayBase + i * 60}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}
