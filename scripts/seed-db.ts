import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

const DEFAULT_APPS = [
  { nama: 'e-Henkaten',        kategori: 'Input Harian', icon: 'activity',  logo: '/icons/e-henkaten.png',        aktif: true, link: '#', deskripsi: 'Catat setiap perubahan kondisi kerja yang tidak dilakukan seperti biasanya — perubahan Man, Machine, Material, atau Method — agar tidak ada yang terlewat dan bisa ditelusuri.' },
  { nama: 'Form BNF',          kategori: 'Laporan',      icon: 'chart',     logo: '/icons/form-bnf.png',          aktif: true, link: '#', deskripsi: 'Buat dan generate laporan problem resmi (Safety, Kualitas, Mesin, Outsource) lengkap dengan kronologi, penyebab, tanda tangan DpH/SH, langsung dalam format PDF siap kirim.' },
  { nama: 'Kaizen Order Sheet',kategori: 'Kaizen',       icon: 'clipboard', logo: '/icons/kaizen-order-sheet.png',aktif: true, link: '#', deskripsi: 'Ajukan ide perbaikan secara terstruktur — dari identifikasi masalah hingga order pelaksanaan kaizen — dalam satu lembar digital yang mudah dilacak.' },
  { nama: 'Voice Member',      kategori: 'Input Harian', icon: 'pencil',    logo: '/icons/voice-member.png',      aktif: true, link: '#', deskripsi: 'Sampaikan aspirasi, keluhan, atau masukan perbaikan dari anggota line. Setiap suara tercatat, terorganisir, dan bisa disertai foto dokumentasi.' },
  { nama: 'Problem Produksi',  kategori: 'Monitoring',   icon: 'chart',     logo: '/icons/problem-produksi.png',  aktif: true, link: '#', deskripsi: 'Dashboard monitoring dan pelaporan problem yang menghambat produksi secara real-time — lihat status On Progress/Finish, input problem baru, dan kelola data lintas line.' },
];

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);

  const [{ count }] = await sql<[{ count: number }]>`SELECT COUNT(*)::int AS count FROM apps`;
  if (count > 0) {
    console.log(`Skipped: table already has ${count} rows.`);
    await sql.end();
    return;
  }

  for (const app of DEFAULT_APPS) {
    await sql`
      INSERT INTO apps (nama, kategori, deskripsi, link, icon, logo, aktif)
      VALUES (${app.nama}, ${app.kategori}, ${app.deskripsi}, ${app.link}, ${app.icon}, ${app.logo}, ${app.aktif})
    `;
  }

  console.log(`Seeded ${DEFAULT_APPS.length} apps.`);
  await sql.end();
}

main().catch(err => { console.error(err); process.exit(1); });
