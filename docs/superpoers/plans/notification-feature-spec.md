# Spesifikasi Fitur: Notification

## Tujuan
Mengaktifkan menu **Notification** agar seluruh pengguna dapat membaca informasi operasional. Admin dapat masuk melalui ikon SVG kecil pada halaman ini untuk menambah, menyelesaikan, atau menghapus informasi.

## Akses & navigasi
- Menu sidebar **Notification** aktif dan mengarah ke `/notifications` pada desktop dan mobile.
- Semua user dapat membuka dan membaca daftar notifikasi.
- Header halaman memiliki tombol ikon SVG kecil dengan label aksesibel `Login admin`.

## Login admin
- Klik ikon membuka modal login dengan username, password, tombol masuk, dan pesan error.
- Kredensial dibaca dari `.env.local` melalui `ADMIN_USERNAME` dan `ADMIN_PASSWORD`.
- Server memvalidasi kredensial dan membuat sesi melalui cookie `HttpOnly`, `Secure` di production, dan `SameSite=Lax`.
- Password tidak dikembalikan ke browser serta tidak disimpan di `sessionStorage` atau `localStorage`.
- Tersedia tombol logout pada area admin notifikasi.

## Data notifikasi
Setiap informasi memiliki `id`, `title`, `content`, `status` (`active` atau `completed`), `created_at`, dan `completed_at`.

## Tampilan user
- Notifikasi terbaru tampil paling atas.
- Notifikasi aktif tampil normal.
- Notifikasi selesai tetap tampil dengan opacity teks lebih rendah, badge `Selesai`, dan waktu selesai bila tersedia.
- Bila kosong, tampilkan “Belum ada informasi.”

## Tampilan admin
Setelah login sukses, admin melihat form tambah informasi (judul, isi, tombol publikasikan) dan kontrol per item: **Selesai**, **Aktifkan kembali**, dan **Hapus**. Penghapusan meminta konfirmasi.

## API
| Endpoint | Akses | Fungsi |
| --- | --- | --- |
| `GET /api/notifications` | Publik | Mengambil seluruh notifikasi |
| `POST /api/notifications` | Admin | Membuat informasi |
| `PATCH /api/notifications/:id` | Admin | Mengubah status aktif/selesai |
| `DELETE /api/notifications/:id` | Admin | Menghapus informasi |
| `POST /api/admin/login` | Publik | Validasi kredensial dan membuat sesi |
| `POST /api/admin/logout` | Admin | Menghapus sesi |
| `GET /api/admin/session` | Publik | Memeriksa status sesi admin |

Semua perubahan data harus diverifikasi oleh sesi server-side.

## Validasi
- Judul wajib diisi, maksimum 160 karakter.
- Isi wajib diisi, maksimum 5.000 karakter.
- ID harus valid.
- Status hanya `active` atau `completed`.

## Kriteria penerimaan
1. Menu dapat dibuka pada desktop dan mobile.
2. Semua user melihat informasi aktif dan selesai.
3. Informasi selesai tetap terbaca dan tampak redup.
4. Ikon SVG membuka modal login admin.
5. Admin dapat menambah, menyelesaikan, mengaktifkan ulang, dan menghapus informasi.
6. User biasa tidak dapat mengakses aksi admin melalui API.
7. Rahasia tidak masuk source code atau Git.
8. `npm run lint` dan `npm run build` lulus.
