/**
 * Real screenshots per app, used by the Applications page's fanned image
 * gallery. Keyed by a slug derived from the app's own name
 * (`nama.toLowerCase().replace(/\s+/g, '-')`), matching the folder names
 * under `public/asset/`.
 */
export const APP_ASSET_IMAGES: Record<string, string[]> = {
  'e-henkaten': [
    '/asset/e-henkaten/screencapture-e-henkaten-netlify-app-2026-07-31-23_11_47.png',
    '/asset/e-henkaten/screencapture-e-henkaten-netlify-app-2026-07-31-23_12_15.png',
    '/asset/e-henkaten/screencapture-e-henkaten-netlify-app-2026-08-01-11_04_03.png',
  ],
  'form-bnf': [
    '/asset/form-bnf/screencapture-bnf-form-netlify-app-2026-07-31-23_14_25.png',
    '/asset/form-bnf/screencapture-bnf-form-netlify-app-preview-2026-07-31-23_15_26.png',
    '/asset/form-bnf/Screenshot%202026-08-01%20110021.png',
  ],
  'kaizen-order-sheet': [
    '/asset/kaizen-order-sheet/screencapture-kaizen-order-sheet-netlify-app-2026-07-31-23_16_06.png',
    '/asset/kaizen-order-sheet/screencapture-kaizen-order-sheet-netlify-app-input-2026-07-31-23_16_24.png',
    '/asset/kaizen-order-sheet/screencapture-kaizen-order-sheet-netlify-app-data-2026-07-31-23_16_54.png',
  ],
  'problem-produksi': [
    '/asset/problem-produksi/screencapture-problem-produksi-insforge-site-2026-07-31-23_18_52.png',
    '/asset/problem-produksi/screencapture-problem-produksi-insforge-site-input-2026-07-31-23_19_06.png',
    '/asset/problem-produksi/screencapture-problem-produksi-insforge-site-data-2026-07-31-23_19_31.png',
  ],
  'rekap-laporan-5w': [
    '/asset/rekap-laporan-5w/screencapture-recap-report-vercel-app-2026-07-31-23_19_55.png',
    '/asset/rekap-laporan-5w/screencapture-recap-report-vercel-app-rekap-2026-07-31-23_21_47.png',
    '/asset/rekap-laporan-5w/screencapture-recap-report-vercel-app-api-reports-cms5f0q7j000004l43rbuaxyn-download-2026-08-01-10_55_46.png',
  ],
  'voice-member': [
    '/asset/voice-member/screencapture-voice-member-app-netlify-app-login-2026-07-31-23_17_36.png',
    '/asset/voice-member/screencapture-voice-member-app-netlify-app-2026-07-31-23_18_11.png',
    '/asset/voice-member/screencapture-voice-member-app-netlify-app-result-2026-07-31-23_18_26.png',
  ],
};

export function appSlug(nama: string): string {
  return nama.toLowerCase().replace(/\s+/g, '-');
}
