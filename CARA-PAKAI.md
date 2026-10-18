# globalmarinejakarta.com — Hugo + Cloudflare Pages

## 1. Pasang ke repo gmarinejkt/site
1. Salin semua isi folder ini ke root repo (branch `master`). Folder `static/images` sudah berisi gambar lama.
2. Di repo hapus file lama: `index.html`, `css/`, dan `images/` (sudah pindah ke `static/images/`). Pertahankan `google356b7cd9c20370fd.html` (sudah ada juga di `static/`).
3. Tambahkan logo watermark `static/images/global-marine-cv-putih-256x256.png` (sudah tersedia).

## 2. Secrets GitHub (Settings → Secrets → Actions)
`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (Workers AI), `GSC_CREDENTIALS`, `GSC_SITE_URL` (`https://globalmarinejakarta.com/`), `SERPER_API_KEY`.

## 3. Cloudflare Pages
Connect ke repo, branch `master`. **Build command: kosong**, **Output directory: `public`**. Workflow `deploy.yml` membangun Hugo di GitHub lalu meng-commit folder `public/`; Cloudflare hanya menyajikan isi `public/`.

## 4. Artikel
- Disimpan di `content/blog/`, URL `/blog/<slug>/`.
- Sapaan: "Mitra Global Marine" hanya di paragraf pertama dan penutup, selebihnya "Anda". Dicek otomatis oleh generator (retry) dan `revise-articles.js`.
- Workflow: generate-articles, revise-articles, fix-orphans, recycle, cleanup (jalankan manual atau terjadwal dari tab Actions).
- Edit kata kunci di `keywords.txt` / `seed-keywords.txt`.

## 5. Catatan
- Tidak ada `package-lock.json`; workflow memakai `npm install`.
- Build Hugo belum diuji di lingkungan penyusunan (Hugo tidak bisa diunduh); jalankan `hugo --minify` lokal sekali untuk memastikan.
