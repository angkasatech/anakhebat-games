# AnakHebat Games · Main & Belajar

Prototipe lokal untuk usia 3–7 tahun. JavaScript native + Vite menghasilkan situs statis yang ringan tanpa backend atau runtime framework. Referensi AnakHebat dibaca saja, tidak diubah.

## Menjalankan

```sh
npm ci
npm run dev
```

Buka URL yang dicetak terminal. Untuk versi produksi:

```sh
npm run build
npm run preview -- --port 4174
```

URL beranda: `http://127.0.0.1:4174/` atau `/member/games/`. Pasar Mini: `/member/games/pasar-mini/`. Kereta Pola: `/member/games/kereta-pola/`. Empat game sudah bisa dimainkan pada build lokal, termasuk Susun Ceritaku di /member/games/susun-ceritaku/ dan Sehari bersama Kiki di /member/games/sehari-kiki/. Ini prototipe publik tanpa pembatasan member.

## Pengujian

```sh
npm test
npx playwright install chromium
npm run build
npm run test:browser
```

Tes logika mencakup batas jumlah, jenis salah, kurang/kelebihan, pengeluaran barang, transisi kelima pesanan, katalog dan rotasi stok. Tes Chromium menjalankan sesi penuh ketiga lapak pada viewport 390 dan 1280 px; menguji bermain ulang, reset, keluar, tingkat lanjut setelah sesi mudah, perpindahan lapak yang kembali ke mudah, fallback tanpa suara/penyimpanan, keyboard dan seluruh ilustrasi di rute bertingkat pada 320 px. Screenshot ada di `test-results/` setelah pengujian.

Ukur cold load produksi saat preview port 4174 aktif:

```sh
node scripts/measure.mjs
```

Hasil beranda disimpan di `docs/measurements.json`. `PREVIEW_URL` dapat diatur untuk URL lain dan `MEASUREMENT_FILE` untuk file hasil lain (hasil Pasar Mini: `docs/measurements-market.json`). Pengukuran adalah Resource Timing browser lokal, bukan klaim performa CDN atau waktu muat HP.

## Struktur

- `src/app/registry.js`: metadata dan pemuat game; satu daftar untuk kartu beranda dan ketersediaannya.
- `src/app/router.js`: alamat beranda/game, mendukung prefix deployment melalui `data-app-root` pada entry HTML.
- `src/app/hub.js`, `hub.css`, `assets/`: UI katalog dan ilustrasi khusus kartu.
- `src/shared/styles/base.css`: fondasi tampilan bersama.
- `src/games/pasar-mini/index.js`: entry game yang dimuat sesuai rute, termasuk stylesheet game.
- `src/games/pasar-mini/engine.js`: logika murni tanpa DOM/penyimpanan.
- `src/games/pasar-mini/catalog.js`: 18 produk, satuan hitung, tiga lapak dan pilihan stok.
- `src/games/pasar-mini/orders.js`: pelanggan dan pembuat lima pesanan.
- `src/games/pasar-mini/feedback.js`: kalimat yang dipakai bersama oleh tampilan dan narasi suara.
- `src/games/pasar-mini/view.js`: tiga layar dan interaksi.
- `src/shared/`: adapter pengaturan browser dan pembaca suara.
- `src/assets/`: SVG lokal yang digunakan ulang, sebagian di-inline Vite.
- `src/main.js`: memilih entry dari registry lalu memuatnya secara dinamis. Game berikutnya ditambahkan di `src/games/`, didaftarkan di registry, dan diberi entry HTML serta input Vite.
- `member/games/pasar-mini/index.html`: entry rute contoh; hasil build menggunakan jalur aset relatif.

Navigasi menggunakan tautan halaman biasa agar URL langsung, reload dan tombol back/forward browser bekerja. Beranda tidak memuat aturan/CSS Pasar Mini. Tautan “Semua permainan” tersedia sepanjang permainan; suara dihentikan saat halaman ditinggalkan. Kontrol suara menggunakan preferensi yang sama pada beranda dan game. Detail calon game dan tips orang tua memakai elemen `details` native; calon game tidak memiliki tombol bermain palsu.

Hanya pilihan suara tersimpan di browser ini. Tingkat selalu dimulai dari mudah (1–3 dengan gambar, pesanan pertama satu barang), termasuk setelah reload atau pindah lapak. Setelah lima pesanan, anak boleh bermain lagi, mencoba 1–5, atau langsung mengunjungi lapak lain. Tingkat lanjut tidak diwajibkan. Keluar/pilih lapak saat bermain memulai sesi baru. Progres sesi tidak disimpan atau tersinkron antarperangkat. Nilai tingkat dari versi lama sengaja diabaikan. Kegagalan localStorage tidak menghentikan permainan.

Kereta Pola memiliki folder terpisah `src/games/kereta-pola/` (data, engine, feedback, view, styles, assets). Pilih Buah ceria atau Bentuk berwarna; keduanya pola AB mudah dengan satu tempat kosong dan dua pilihan. Lima perjalanan, bantuan sorotan/suara, percobaan ulang, animasi berangkat, dan layar selesai. Pola AAB/ABC dan pola buatan anak belum termasuk. Brief lengkap: `docs/KERETA-POLA.md`. Pengukuran cold load game: `docs/measurements-train.json`. Seluruh game dimuat sesuai rute, dengan aset buah dan adapter suara yang digunakan ulang.

Tiga lapak: Buah (apel, pisang, jeruk, pir, mangga, alpukat), Sayur (wortel, brokoli, terong, mentimun, jagung, tomat), Lauk (telur, ikan, ayam, tempe, tahu, udang). Tiga produk tetap tampil selama satu sesi dan semuanya mendapat pesanan. Main lagi mengganti setidaknya satu produk; Mulai ulang mempertahankan stok agar anak tidak kehilangan orientasi. Pesanan menggunakan satuan butir/ekor/potong bila sesuai.

Suara bersifat opsional lewat SpeechSynthesis dan hanya menggunakan voice Indonesia yang tersedia di perangkat. Fallback tanpa voice teruji; keluaran audio Bahasa Indonesia **belum diuji secara audibel** karena voice tersebut tidak tersedia pada browser uji. Uji kembali di Android Chrome dan iOS Safari sebelum rilis. Belum ada pengujian langsung dengan anak.

Saat memilih produk, narasi menyebut satuan dan nama produk serta total kelompok lapaknya, misalnya “1 apel dimasukkan ke keranjang. Ada 5 buah di keranjang.” Mengeluarkan barang juga mendapat narasi jumlah terbaru. Jika pesanan belum sesuai, UI dan suara memakai penjelasan yang sama: pesanan yang diminta, produk salah beserta jumlahnya, lalu kekurangan atau kelebihan produk yang diminta. Tombol “Dengarkan penjelasan” mengulang pesan terakhir. Ketukan terbaru mengganti narasi sebelumnya agar jumlah lama tidak mengantre. Tes browser memeriksa teks yang dikirim ke API suara melalui mock; ini bukan pengujian audio audibel.

## Cloudflare Pages

Produksi: https://anakhebat-games.pages.dev/. Proyek Pages `anakhebat-games` terhubung ke repositori GitHub `angkasatech/anakhebat-games`.

Push ke `main` membangun produksi; branch lain mendapat preview. Kedua environment memakai Node.js 24, perintah `npm ci && npm test && npm run build`, dan output `dist`. Tidak ada secret atau variabel lingkungan aplikasi yang dibutuhkan. Detail setup dan cara pembaruan: [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md).

## Tipografi

Quicksand 600 untuk isi, instruksi dan dialog; bobot 700 untuk penekanan/tombol. Fredoka One 400 untuk judul dan elemen display. Fredoka One sudah tebal pada bobot 400; tidak perlu bold sintetis. Keduanya dimuat sebagai WOFF2 Latin lokal melalui Vite, tanpa permintaan Google Fonts/CDN eksternal. Definisi bersama: src/shared/styles/base.css; modul game memakai variabel font yang sama.

File font: Quicksand 28.240 byte, Fredoka One 15.600 byte, total 43.840 byte. Lisensi OFL disertakan di public/licenses/ dan ikut build. Paket Fontsource dipatok dalam lockfile. Referensi: https://fontsource.org/fonts/quicksand dan https://fontsource.org/fonts/fredoka-one.

Saat integrasi kelak, pindahkan kedua entry dan aset sesuai build/hosting induk; jangan menganggap prefix `/member/` memberi autentikasi. Adapter penyimpanan dapat diganti dengan API progres AnakHebat tanpa mengubah aturan permainan.

Referensi resmi: [konfigurasi build Pages](https://developers.cloudflare.com/pages/configuration/build-configuration/) dan [situs HTML statis](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).

Brief dan alasan desain: [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md). Hasil validasi: [docs/QA.md](docs/QA.md).

## Game ketiga: Susun Ceritaku

Buka /member/games/susun-ceritaku/ pada server lokal. Beranda lokal kini memiliki empat game aktif. Tiga cerita: Bunga untuk Ibu, Tangan Bersih, Waktu Pisang; masing-masing tiga kartu. Ketuk kartu untuk mengisi urutan, ketuk kartu terpilih untuk mengeluarkannya, gunakan Bantu aku atau Ceritaku siap. Jika belum sesuai, hubungan kejadian dijelaskan tanpa mengurangi kesempatan mencoba.

Layar selesai menampilkan semua kejadian, pembacaan opsional dengan sorotan kartu, dan ajakan cerita versi anak. Tidak memakai mikrofon atau perekaman. Progres sesi tidak disimpan. Narasi berhenti saat mute, replay, memilih cerita, halaman disembunyikan atau ditinggalkan. Suara audibel Indonesia belum terverifikasi; gambar/teks selalu tersedia.

Struktur mandiri di src/games/susun-ceritaku/: data.js, engine.js, feedback.js, view.js, styles.css dan assets/. Brief: docs/SUSUN-CERITAKU.md. Pengukuran: docs/measurements-story.json.

## Game keempat: Sehari bersama Kiki

Rute /member/games/sehari-kiki/. Sepuluh kegiatan: bangun tidur, mandi/sikat gigi, berpakaian, makan/minum, sekolah, les/Iqra, pergi salat, bermain, merapikan, tidur. 39 kosakata unik dipakai ulang dalam 50 kartu kegiatan; 30 permintaan dan 10 contoh percakapan dua giliran. Mulai dengan eksplorasi lima kata, sesi cari kata lima putaran dua pilihan, lalu sesi kalimat tiga putaran tiga pilihan. Ada bantuan gambar otomatis tanpa suara, pengulangan, reset, apresiasi usaha, dan kegiatan bersama orang tua.

Les/Iqra menyediakan panel 28 huruf dasar terpisah dalam tujuh kelompok empat huruf. Belum mencakup bacaan Iqra lengkap, harakat, sambungan atau tajwid. Audio huruf Arab belum tersedia; tidak memakai TTS Inggris untuk huruf hijaiyah. Salat hanya konteks kosakata/persiapan ke masjid, bukan panduan bacaan atau gerakan.

Adapter createSpeech menerima bahasa opsional; default Indonesia untuk game lama, Inggris en-GB (fallback voice en lain) untuk Kiki. Tidak memakai suara Indonesia sebagai pengganti Inggris. Suara perangkat tetap opsional dan keluaran audibel belum diuji; pemilihan bahasa, narasi dan pembatalan diuji melalui mock. Tidak merekam suara anak.

Font Noto Naskh Arabic WOFF2 lokal 52.668 byte baru dimuat saat panel huruf dibuka; lisensi OFL di public/licenses. 37 SVG baru berjumlah 17.133 byte, ditambah aset pisang/telur/kelinci yang digunakan ulang. Pengukuran awal game: docs/measurements-day.json. Brief dan batas konten: docs/SEHARI-KIKI.md.
