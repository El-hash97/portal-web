'use client';

import { useCallback, useState } from 'react';
import { OpenRequestHero } from '@/components/OpenRequestHero';
import { OpenRequestTutorial } from '@/components/OpenRequestTutorial';
import { OpenRequestForm } from '@/components/OpenRequestForm';
import { OpenRequestList } from '@/components/OpenRequestList';

export default function OpenRequestPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <main className="relative z-10 pb-10">
      <OpenRequestHero />
      <OpenRequestTutorial />
      <OpenRequestForm onSubmitted={bump} />
      <OpenRequestList refreshKey={refreshKey} />
    </main>
  );
}
