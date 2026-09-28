# Detektif Suara: Cari Bunyi Rahasia

Prototipe playable kelima, rute `/member/games/detektif-suara/`. Tidak mengubah autentikasi, pembayaran, entitlement atau database. Worker origin yang sudah ada tetap melindungi jalur game pada Pages. Belum deploy.

## Alur dan lingkup

Mulai: Bintang dan burung Bunyi, tiga tingkat tanpa meminta usia, peta lima lokasi. Bermain: tebak suara lingkungan, cari teman bunyi awal, pilih bunyi pertama, bedakan bunyi mirip, lalu cari dua/tiga gambar berkode bunyi. Selesai: peta misi yang tuntas, apresiasi usaha dan ajakan mencari benda di rumah. Anak bisa berhenti, mengganti tingkat (sesi baru), memilih misi, atau bermain ulang.

Ada 60 kata dalam 10 kelompok /b k m s p d t g n c/. /ny/ tidak dimasukkan ke kelompok /n/. Misi bunyi mirip tingkat santai memakai /m/ dan /s/, tingkat lain menggunakan pasangan kontras. Tidak ada timer, skor, nyawa, rekaman anak atau progres tersimpan. Lima misi tidak memaksa durasi: target 8–15 menit membutuhkan percakapan dan eksplorasi bersama pendamping, belum diuji bersama anak.

## Menjalankan dan menguji

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:browser
```

Vite lokal tidak menjalankan autentikasi origin; ini alat review. Produksi tetap memakai Worker yang sudah ada. `engine.js` logika murni, `data.js` konten, `detektif-suara.js` UI, `audio.js` adapter, `recordings.js` katalog rekaman, `styles.css` tampilan. Game-specific JS/CSS/audio berada di `/member/games/detektif-suara/`; font, router dan adapter bersama tetap memakai `/member/games/assets/`.

## Audio dan batas versi ini

Tidak ada rekaman audio produksi yang disertakan. Tiga bunyi lingkungan (hujan, bel sepeda, mobil) ditirukan Web Audio setelah ketukan anak, dengan volume rendah. Kata dan instruksi memakai TTS Indonesia jika perangkat menyediakan voice. Tidak ada audio otomatis pada halaman pembuka. Tombol efek terpisah dari narasi inti; tombol Ulangi suara tetap bekerja. Mode gambar memberikan petunjuk jawaban, sehingga dapat dimainkan tanpa membaca/mendengar sendiri bersama pendamping; ini bukan pengukuran kemampuan dengar.

Fonem terisolasi belum direkam. Jangan memakai TTS untuk membaca `/b/` atau `bbbb`: bunyi letup tidak dapat dipanjangkan. Tombol bunyi untuk sementara membacakan contoh kata. Rekaman manusia perlu diverifikasi pelafalannya, terutama /c/, /g/, /k/ dan pasangan bunyi mirip, sebelum klaim pembelajaran fonem berbasis audio penuh. Output audibel perangkat belum disahkan oleh penguji manusia; tes menggunakan fallback dan mock API.

Tambahkan file rekaman yang sudah ditinjau di `public/member/games/detektif-suara/audio/`, lalu isikan `recordings.js`, misalnya `'word-bola': 'word-bola.mp3'` dan `'phoneme-b': 'phoneme-b.mp3'`. File hanya diminta saat diputar, tidak preload seluruh katalog. Kesalahan pemutaran kembali ke contoh kata/gambar. Gunakan MP3 mono yang ringkas, tanpa jeda awal panjang, volume konsisten. Katalog awal kosong mencegah 404 berulang.

Daftar produksi: lihat `DETEKTIF-SUARA-AUDIO.md`. Ilustrasi memakai emoji sistem dan empat SVG inline untuk benda yang ambigu (meja/gula/durian/nangka); variasi emoji antarsistem masih perlu uji perangkat nyata. Belum menggunakan ilustrasi berbayar/AI atau aset raster besar.

## Hasil pengukuran lokal

Cold context Chromium pada build lokal: 55.981 byte response body, 58.381 byte transfer (8 permintaan), termasuk 43.840 byte font bersama. JS khusus game 13.058 byte dan CSS 4.986 byte sebelum kompresi; suara rekaman 0 byte (belum tersedia). Emoji menggunakan font sistem dan SVG inline masuk ukuran JS. Detail Resource Timing: `docs/measurements-detective.json`. Ini pengukuran lokal, bukan klaim kecepatan CDN/perangkat anak.
