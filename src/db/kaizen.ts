import { createClient } from '@supabase/supabase-js';

// Separate Supabase backend owned by the Kaizen Order Sheet app —
// anon-key, RLS-constrained read access for surfacing its KPIs on the
// portal dashboard. Server-side only: these env vars carry no
// NEXT_PUBLIC_ prefix and must never be read from a client component.
//
// A placeholder URL is used when the real one is missing so that
// createClient() (which validates its URL argument eagerly and throws
// synchronously on an empty string) never crashes at module-evaluation
// time. Any real connection failure then surfaces later as a normal
// { data, error } result inside a route handler's try/catch, matching
// how the sibling Henkaten/Problem Produksi clients degrade — those
// connect lazily and only fail at query time.
export const kaizenSupabase = createClient(
  process.env.KAIZEN_SUPABASE_URL || 'https://placeholder.invalid',
  process.env.KAIZEN_SUPABASE_ANON_KEY || 'placeholder-anon-key',
);
