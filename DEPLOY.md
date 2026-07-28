# Panduan Deploy `design-v2` & Rollback ke Desain Lama

## Ringkasan situasi saat ini

| | |
|---|---|
| Branch lama (desain awal) | `main` — worktree di `C:\Users\El\Documents\casting-web` |
| Branch baru (redesign)    | `design-v2` — worktree di `C:\Users\El\Documents\casting-web-design-v2` |
| Remote                    | `https://github.com/El-hash97/portal-web.git` |
| Status                    | `design-v2` sudah 9 commit di depan `main`, **belum di-push** ke GitHub |
| Build config (`netlify.toml`) | `npm run build` → publish `.next`, plugin `@netlify/plugin-nextjs`, Node 20 |
| Env var yang dibutuhkan   | `DATABASE_URL` (sudah ada, DB utama) + `E_HENKATEN` (baru, untuk KPI live e-Henkaten) |

`main` sama sekali tidak tersentuh oleh semua pekerjaan redesign — aman sebagai fallback kapan pun.

---

## Bagian 1 — Deploy `design-v2`

### Langkah 1: Push branch ke GitHub

```bash
cd C:\Users\El\Documents\casting-web-design-v2
git push -u origin design-v2
```

### Langkah 2: Pilih cara deploy

**Opsi A — Deploy Preview (disarankan, paling aman)**
Tidak menyentuh production sama sekali. Cocok untuk cek dulu sebelum yakin.

1. Buka [Netlify dashboard](https://app.netlify.com) → pilih site project ini
2. **Site configuration → Build & deploy → Branches & deploy contexts**
3. Tambahkan `design-v2` sebagai *branch deploy* — Netlify otomatis build tiap kali branch ini di-push, dengan URL sendiri (mis. `design-v2--nama-site.netlify.app`), terpisah dari production
4. Atau: buka Pull Request dari `design-v2` ke `main` di GitHub → Netlify otomatis membuat **Deploy Preview** dengan URL unik di komentar PR

**Opsi B — Jadikan Production (kalau sudah yakin)**

```bash
cd C:\Users\El\Documents\casting-web-design-v2
git checkout main
git pull origin main
git merge design-v2
git push origin main
```

Netlify akan otomatis deploy `main` yang sudah ter-update (asumsi continuous deployment dari `main` sudah aktif seperti biasanya).

### Langkah 3: Set environment variable baru

Di Netlify dashboard → **Site configuration → Environment variables**, pastikan ada:

- `DATABASE_URL` — kemungkinan besar sudah ada (dipakai desain lama juga)
- `E_HENKATEN` — **baru**, wajib ditambahkan manual. Ambil dari `.env.local` lokal (yang sudah pakai *Transaction pooler*, port `6543` — bukan direct connection, karena Netlify Functions itu serverless/IPv4)
- `PP_INSFORGE_URL` — **baru**, wajib ditambahkan manual. URL backend InsForge milik aplikasi Problem Produksi (format `https://<appkey>.<region>.insforge.app`)
- `PP_INSFORGE_API_KEY` — **baru**, wajib ditambahkan manual. Admin API key InsForge milik aplikasi Problem Produksi. Hanya dibaca di server (tanpa prefix `NEXT_PUBLIC_`), jadi tidak ikut ter-bundle ke browser
- `KAIZEN_SUPABASE_URL` — **baru**, wajib ditambahkan manual. URL project Supabase milik aplikasi Kaizen Order Sheet (format `https://<ref>.supabase.co`)
- `KAIZEN_SUPABASE_ANON_KEY` — **baru**, wajib ditambahkan manual. Anon key Supabase milik aplikasi Kaizen Order Sheet — key publik yang dibatasi oleh RLS, tapi tetap hanya dibaca di server (tanpa prefix `NEXT_PUBLIC_`) mengikuti konvensi variabel lain di file ini

Tanpa `E_HENKATEN` di Netlify, bagian "e-Henkaten · Live" di home page akan otomatis hilang dari tampilan (sudah ada fallback `failed → return null` di kodenya), tidak bikin error, cuma datanya tidak muncul. Halaman `/dashboard` (KPI bar + chart per line) juga bergantung pada env var yang sama — tanpanya, kedua bagian jatuh ke fallback masing-masing (bukan blank), tapi datanya tidak akan pernah muncul.

Tanpa kedua variabel di atas, bagian "Problem Produksi" di halaman `/dashboard` akan menampilkan status *Offline* dengan pesan data tidak tersedia (sudah ada fallback di kodenya), tidak bikin error, cuma datanya tidak muncul.

Tanpa kedua variabel di atas, bagian "Kaizen Order Sheet" di halaman `/dashboard` akan menampilkan status *Offline* dengan pesan data tidak tersedia (sudah ada fallback di kodenya), tidak bikin error, cuma datanya tidak muncul.

### Langkah 4: Verifikasi setelah deploy

- [ ] Home: hero, grid 6 aplikasi, bar "e-Henkaten · Live" muncul dengan angka benar (33/4/24/5)
- [ ] `/applications` — deskripsi lengkap tiap app tampil
- [ ] `/reports` — chart & form saran tampil
- [ ] `/admin` — login masih berfungsi (`admin` / password sesuai `ADMIN_CRED`)
- [ ] `/dashboard` — link Dashboard di sidebar berfungsi, KPI bar & chart per line tampil dengan data asli
- [ ] Tampilan mobile — sidebar drawer & navbar responsif

---

## Bagian 2 — Rollback ke desain lama (tanpa error, tanpa ubah struktur)

### Kalau `design-v2` baru di-deploy sebagai Deploy Preview/Branch deploy (Opsi A)

**Tidak perlu rollback apa pun.** Production masih 100% menjalankan `main` yang lama. Cukup:
- Hapus branch deploy-nya di Netlify (**Branches & deploy contexts** → hapus `design-v2`), atau
- Biarkan saja — tidak memengaruhi production sama sekali

### Kalau `design-v2` sudah di-merge ke `main` dan sudah production (Opsi B)

**Cara tercepat & paling aman — lewat Netlify UI (tanpa sentuh git sama sekali):**

1. Netlify dashboard → tab **Deploys**
2. Cari deploy yang paling terakhir **sebelum** merge `design-v2` (biasanya berlabel commit `dcf81d3 add logo` atau sebelumnya)
3. Klik deploy tersebut → tombol **"Publish deploy"**
4. Production langsung kembali ke desain lama dalam hitungan detik, **tanpa build ulang, tanpa risiko error** — struktur git juga tidak berubah sama sekali

**Cara permanen di git (kalau mau riwayat commit-nya bersih & konsisten dengan production):**

```bash
cd C:\Users\El\Documents\casting-web
git checkout main
git pull origin main
git revert -m 1 <hash-commit-merge-design-v2>
git push origin main
```

- `git revert` **tidak menghapus history**, cuma menambah commit baru yang membatalkan perubahan — aman, tidak butuh force-push, tidak mengubah struktur branch/worktree yang sudah ada
- Ganti `<hash-commit-merge-design-v2>` dengan hash commit merge yang muncul dari `git log --oneline main` (biasanya baris paling atas setelah merge, berformat `Merge branch 'design-v2'`)

### Yang **jangan** dilakukan saat rollback

- ❌ `git reset --hard` ke commit lama lalu force-push — menghapus history, berisiko kalau ada orang lain yang sudah pull
- ❌ Menghapus branch/worktree `design-v2` — kerjaan redesign akan hilang; biarkan saja tetap ada meski tidak dipakai
- ❌ Menghapus env var `E_HENKATEN` saat rollback — tidak perlu, desain lama tidak memakainya sama sekali jadi aman dibiarkan menganggur

---

## Referensi cepat

| Mau ngapain | Command / lokasi |
|---|---|
| Kerja di desain baru | `cd C:\Users\El\Documents\casting-web-design-v2` |
| Kerja di desain lama | `cd C:\Users\El\Documents\casting-web` |
| Cek branch mana yang aktif di mana | `git worktree list` |
| Rollback instan tanpa git | Netlify → Deploys → pilih deploy lama → **Publish deploy** |
| Rollback permanen via git | `git revert -m 1 <hash-merge>` di branch `main` |
