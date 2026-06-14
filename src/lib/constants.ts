import {
  Activity, Calculator, Thermometer, ClipboardCheck,
  PenLine, BarChart2, Box, type LucideIcon,
} from 'lucide-react';
import type { App, Category, IconKey } from './types';

/* ── Admin credentials ───────────────────────────────────
   Ganti username & password untuk keamanan.
   (No backend: credentials visible in source — internal use only)
─────────────────────────────────────────────────────── */
export const ADMIN_CRED = { user: 'admin', pass: 'Cast2026!' };

export const STORAGE_KEY  = 'casting_hub_v1';
export const SESSION_KEY  = 'casting_hub_admin';

/* ── Categories ─────────────────────────────────────────── */
export const CATEGORIES: Category[] = [
  { key: 'Monitoring',   color: '#1A6DB0', bg: 'rgba(26,109,176,0.10)'  },
  { key: 'Kalkulator',   color: '#1D8A56', bg: 'rgba(29,138,86,0.10)'   },
  { key: 'Checksheet',   color: '#C47A00', bg: 'rgba(196,122,0,0.10)'   },
  { key: 'Input Harian', color: '#7330C0', bg: 'rgba(115,48,192,0.10)'  },
];

/* ── Icon map ────────────────────────────────────────────── */
export const ICON_MAP: Record<IconKey | string, LucideIcon> = {
  activity:    Activity,
  calculator:  Calculator,
  thermometer: Thermometer,
  clipboard:   ClipboardCheck,
  pencil:      PenLine,
  chart:       BarChart2,
  box:         Box,
};

export const ICON_OPTIONS: { value: string; label: string }[] = [
  { value: 'activity',    label: 'Aktivitas / Monitoring' },
  { value: 'calculator',  label: 'Kalkulator' },
  { value: 'thermometer', label: 'Termometer' },
  { value: 'clipboard',   label: 'Clipboard / Checksheet' },
  { value: 'pencil',      label: 'Input / Pencil' },
  { value: 'chart',       label: 'Grafik / Chart' },
  { value: 'box',         label: 'Kotak / Default' },
];

export const CATEGORY_OPTIONS = ['Monitoring', 'Kalkulator', 'Checksheet', 'Input Harian'];

/* ── Default apps (first load) ──────────────────────────── */
export const DEFAULT_APPS: App[] = [
  {
    id: 1, aktif: true,
    nama: 'Furnace Tapping Tracker',
    kategori: 'Monitoring',
    deskripsi: 'Monitoring waktu tapping 5 furnace (MF1–MF3, LF4–LF5) secara real-time.',
    link: '#',
    icon: 'activity',
  },
  {
    id: 2, aktif: true,
    nama: 'MatPrep',
    kategori: 'Kalkulator',
    deskripsi: 'Kalkulasi kebutuhan bon material per shift (2TR / 1TR / KAI / CRANK).',
    link: '#',
    icon: 'calculator',
  },
  {
    id: 3, aktif: true,
    nama: 'Thermoholder Checksheet',
    kategori: 'Checksheet',
    deskripsi: 'Checksheet digital pemeriksaan 16 unit thermoholder.',
    link: '#',
    icon: 'thermometer',
  },
  {
    id: 4, aktif: true,
    nama: 'FC/FCD Pouring Checksheet',
    kategori: 'Checksheet',
    deskripsi: 'Checksheet pouring runner shift Red/White untuk FC dan FCD.',
    link: '#',
    icon: 'clipboard',
  },
  {
    id: 5, aktif: true,
    nama: 'Scrap Recording',
    kategori: 'Input Harian',
    deskripsi: 'Pencatatan 5 jenis scrap harian beserta perbandingan selisih berat.',
    link: '#',
    icon: 'pencil',
  },
];
