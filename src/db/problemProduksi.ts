import { createAdminClient } from '@insforge/sdk';

// Separate InsForge backend owned by the Problem Produksi app —
// read-only use for surfacing its live KPIs on the portal dashboard.
// Server-side only: these env vars carry no NEXT_PUBLIC_ prefix and must
// never be read from a client component.
export const problemProduksi = createAdminClient({
  baseUrl: process.env.PP_INSFORGE_URL ?? '',
  apiKey: process.env.PP_INSFORGE_API_KEY ?? '',
});
