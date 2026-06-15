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

export const STORAGE_KEY  = 'casting_hub_v2';
export const SESSION_KEY  = 'casting_hub_admin';

/* ── Categories ─────────────────────────────────────────── */
export const CATEGORIES: Category[] = [
  { key: 'Monitoring',   color: '#1A6DB0', bg: 'rgba(26,109,176,0.10)'  },
  { key: 'Input Harian', color: '#7330C0', bg: 'rgba(115,48,192,0.10)'  },
  { key: 'Laporan',      color: '#C47A00', bg: 'rgba(196,122,0,0.10)'   },
  { key: 'Kaizen',       color: '#1D8A56', bg: 'rgba(29,138,86,0.10)'   },
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

export const CATEGORY_OPTIONS = ['Monitoring', 'Input Harian', 'Laporan', 'Kaizen'];

/* ── Default apps (first load) ──────────────────────────── */
export const DEFAULT_APPS: App[] = [
  {
    id: 1, aktif: true,
    nama: 'e-Henkaten',
    kategori: 'Input Harian',
    deskripsi: 'Catat setiap perubahan kondisi kerja yang tidak dilakukan seperti biasanya — perubahan Man, Machine, Material, atau Method — agar tidak ada yang terlewat dan bisa ditelusuri.',
    link: '#',
    icon: 'activity',
    logo: '/icons/e-henkaten.png',
  },
  {
    id: 2, aktif: true,
    nama: 'Form BNF',
    kategori: 'Laporan',
    deskripsi: 'Buat dan generate laporan problem resmi (Safety, Kualitas, Mesin, Outsource) lengkap dengan kronologi, penyebab, tanda tangan DpH/SH, langsung dalam format PDF siap kirim.',
    link: '#',
    icon: 'chart',
    logo: '/icons/form-bnf.png',
  },
  {
    id: 3, aktif: true,
    nama: 'Kaizen Order Sheet',
    kategori: 'Kaizen',
    deskripsi: 'Ajukan ide perbaikan secara terstruktur — dari identifikasi masalah hingga order pelaksanaan kaizen — dalam satu lembar digital yang mudah dilacak.',
    link: '#',
    icon: 'clipboard',
    logo: '/icons/kaizen-order-sheet.png',
  },
  {
    id: 4, aktif: true,
    nama: 'Voice Member',
    kategori: 'Input Harian',
    deskripsi: 'Sampaikan aspirasi, keluhan, atau masukan perbaikan dari anggota line. Setiap suara tercatat, terorganisir, dan bisa disertai foto dokumentasi.',
    link: '#',
    icon: 'pencil',
    logo: '/icons/voice-member.png',
  },
  {
    id: 5, aktif: true,
    nama: 'Problem Produksi',
    kategori: 'Monitoring',
    deskripsi: 'Dashboard monitoring dan pelaporan problem yang menghambat produksi secara real-time — lihat status On Progress/Finish, input problem baru, dan kelola data lintas line.',
    link: '#',
    icon: 'chart',
    logo: '/icons/problem-produksi.png',
  },
];
