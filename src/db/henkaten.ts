import postgres from 'postgres';

// Separate Supabase Postgres instance owned by the e-Henkaten app —
// read-only access for surfacing its live KPIs on the portal home page.
export const henkatenSql = postgres(process.env.E_HENKATEN ?? '', { ssl: 'require' });
