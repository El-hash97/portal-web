import { createClient } from '@supabase/supabase-js';

// Separate Supabase backend owned by the Kaizen Order Sheet app —
// anon-key, RLS-constrained read access for surfacing its KPIs on the
// portal dashboard. Server-side only: these env vars carry no
// NEXT_PUBLIC_ prefix and must never be read from a client component.
export const kaizenSupabase = createClient(
  process.env.KAIZEN_SUPABASE_URL ?? '',
  process.env.KAIZEN_SUPABASE_ANON_KEY ?? '',
);
