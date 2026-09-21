# Validasi AnakHebat Games

## Terbaru: Sehari bersama Kiki (lokal)

21 September 2026. Build produksi berhasil; **19 tes logika dan 51 tes browser lulus**, termasuk 15 tes game Kiki, lima tes hub, dan 31 regresi Pasar Mini/Kereta Pola/Susun Ceritaku. Setelah perbaikan crop ilustrasi hub empat kartu, build dan lima tes hub diulang serta lulus.

Semua sepuluh kegiatan menyelesaikan sesi kata dan kalimat pada 390 px; layar peta, belajar, bermain, selesai, dan hijaiyah diperiksa pada 320/1280 px. Tujuh kelompok huruf masing-masing menyelesaikan empat putaran, termasuk jawaban salah dan ulang. Keyboard, reduced motion, storage diblokir, bantuan gambar, reset, keluar dan navigasi diuji. Tidak ada overflow horizontal/gambar rusak/exception JS pada skenario yang diuji.

Voice mock memastikan bahasa Inggris menggunakan voice en-GB meski voice Indonesia muncul lebih awal; jika voice Inggris tidak ada, tidak memakai voice Indonesia dan bantuan gambar tetap tampil. Mute, reset, pagehide menghentikan narasi. Huruf hijaiyah tidak dikirim ke TTS. Pengujian ini tidak memverifikasi audio audibel; audio Inggris perangkat dan pelafalan Arab belum diuji secara audibel. Panel hijaiyah jelas menyatakan audio Arab belum tersedia dan bukan pelajaran Iqra lengkap.

37 SVG game baru berjumlah 17.133 byte. Cold load rute game lokal: 66031 byte body / 69331 byte transfer, 11 request; font Latin awal 43.840 byte. Font Noto Naskh Arabic 52.668 byte hanya dimuat saat masuk panel huruf (teruji lewat Resource Timing). Beranda empat game: 58448 byte body / 62048 byte transfer. Angka diukur pada preview produksi lokal, bukan CDN. Lihat measurements-day.json dan measurements.json. Nilai fontBytes pada JSON adalah semua font hasil build; initialFontBytes hanya font yang termuat di halaman awal.

Preview: http://127.0.0.1:4174/member/games/sehari-kiki/. Rilis publik tetap dua game; pembaruan empat game belum dipublikasikan.


## Terbaru: Susun Ceritaku (lokal)

21 September 2026. Build Vite berhasil. Total 16 tes logika dan 36 tes browser lulus dalam dua kelompok (16 tes game baru/beranda + 20 regresi Pasar Mini/Kereta Pola). Setelah penyempurnaan sampul pisang dan ukuran kartu desktop, 11 tes Susun Ceritaku diulang dan seluruhnya lulus.

Tiga cerita × 320/390/1280 px: urutan belum lengkap, salah, bantuan, mengeluarkan kartu, menyusun benar, selesai, susun lagi, cerita berikutnya, reset dan keluar. Screenshot tiga layar pada HP dan desktop diperiksa; seluruh gambar termuat, tidak ada overflow horizontal atau exception JavaScript. Suara diuji memakai mock: kalimat sesuai kartu yang disorot; selesai, mute, replay dan pagehide membatalkan pembacaan. Fallback suara, penyimpanan diblokir, keyboard Enter dan reduced motion juga lulus. Ini bukan pengujian suara audibel Indonesia. Tidak ada akses mikrofon.

Sembilan SVG Susun Ceritaku: **7.824 byte**. Cold load rute langsung pada preview produksi lokal: **58.318 byte body**, **61.018 byte transfer**, 9 request, termasuk kedua font lokal 43.840 byte. Ukuran bundel terkompresi diperoleh dari Resource Timing; rincian ada di measurements-story.json. Ini bukan pengukuran CDN atau HP fisik.

Preview: http://127.0.0.1:4174/member/games/susun-ceritaku/. Pembaruan ini belum dipublikasikan; URL produksi masih memakai rilis dua game di bawah.


21 September 2026, Asia/Jakarta. Build produksi Vite 7.3.6. Sudah dipublikasikan di https://anakhebat-games.pages.dev/.

## Riwayat rilis dua game: tipografi seluruh halaman

- Build produksi berhasil; 14 tes logika lulus.
- 12 tes regresi Pasar Mini lulus pada build terbaru: sesi lima pelanggan di tiga lapak pada 390/1280 px, pesanan benar/salah, narasi, koreksi gabungan, replay/reset, tingkat lanjut, perpindahan lapak, fallback audio/penyimpanan, dan rute bertingkat pada 320 px.
- 5 tes beranda dan 8 tes Kereta Pola lulus. Total 25 tes browser lulus pada build dengan font baru dalam 1,1 menit.
- Beranda `/` dan `/member/games/` menampilkan tiga kartu. Pasar Mini dan Kereta Pola memiliki tautan bermain; Susun Ceritaku menampilkan “Segera hadir” serta detail rencana. Label dan narasi beranda mengikuti dua game yang tersedia.
- Navigasi beranda → Pasar Mini → Semua permainan, browser back/forward, dan membuka melalui Enter berhasil pada 320, 390, dan 1280 px.
- Tidak ada overflow horizontal atau gambar rusak pada ukuran yang diuji. Seluruh kartu Pasar Mini memiliki area tautan yang luas melalui stretched link, dengan fokus keyboard yang terlihat.
- Detail calon game dan tips orang tua dapat dibuka; preferensi suara sama pada beranda/game dan bertahan setelah reload. API suara tidak tersedia: pemberitahuan jelas, navigasi tetap bekerja.
- Pembacaan respons JS/CSS memastikan beranda tidak memuat aturan pesanan/CSS game. Modul game dimuat sesudah dipilih.
- Screenshot `hub-320.png`, `hub-390.png`, dan `hub-1280.png` tersedia setelah tes. Desktop dan HP diperiksa secara visual. Judul/hero HP dipadatkan agar kartu pilihan lebih cepat terlihat.
- Preview browser pengguna dimuat ulang dan terverifikasi menampilkan beranda “Hari ini, mau main apa?”.

Tes pembacaan respons jaringan awal gagal karena mencoba mengambil body respons dari halaman yang sudah ditinggalkan. Test harness diperbaiki dengan menyimpan promise body segera pada respons HTTP 200, lalu lima tes beranda diulang dan lulus. Ini tidak memerlukan perubahan kode permainan.

## Pengukuran aktual

Cold context Chromium, server preview produksi lokal port 4174, pengukuran setelah pembaruan font pada 21 September 2026. Resource Timing mengukur body dan transfer (termasuk overhead browser). Bukan hasil pengukuran CDN Cloudflare atau perangkat HP fisik.

| Halaman | Body respons awal | Transfer awal | Request |
|---|---:|---:|---:|
| Beranda `/` | 57.285 byte | **60.585 byte** | 11 |
| Pasar Mini, buka langsung | 62.708 byte | **65.708 byte** | 10 |
| Kereta Pola, buka langsung | 59.824 byte | **63.124 byte** | 11 |

Beranda memuat HTML, entry JS/CSS dasar, modul hub, modul bersama, CSS hub, dan favicon. Setiap game memuat modul/CSS permainannya. Aset kecil di-inline dan dipakai ulang. Total SVG sumber proyek 15.450 byte, termasuk 1.983 byte untuk empat bentuk dan lokomotif Kereta Pola. Buah Kereta Pola memakai aset yang sudah ada. Dua font WOFF2 lokal berjumlah 43.840 byte. Tidak ada permintaan font ke domain luar atau file audio unduhan aplikasi. Ukuran raw/gzip tiap bundel ada pada JSON pengukuran; bundel game yang tidak dibuka tidak termasuk transfer awal.

Rincian per request/aset ada di `measurements.json` (beranda), `measurements-market.json`, dan `measurements-train.json`. `node scripts/measure.mjs` mengukur root; gunakan `PREVIEW_URL` dan `MEASUREMENT_FILE` untuk halaman/output lain. Ukuran produksi total proyek bukan total muatan awal tiap halaman.

## Kereta Pola

Enam sesi penuh (buah/bentuk × 320/390/1280 px) menguji jawaban salah, bantuan otomatis, menghentikan bantuan, mengganti pilihan, penguncian saat berangkat, tiba, kelima stasiun, selesai, main lagi, mulai ulang dan memilih muatan lain. Semua gambar termuat, tidak ada overflow horizontal atau exception JavaScript. Screenshot intro HP, bermain desktop dan selesai HP diperiksa. Posisi matahari pada intro HP diperbaiki agar tidak menimpa nama stasiun.

Tes tambahan menguji bantuan visual tanpa API suara, penyimpanan diblokir, navigasi dari/ke beranda, Enter, reduced motion, serta mock audio yang memverifikasi teks apel/pisang/apel bersamaan dengan sorotan gerbong 1/2/3. Reset membatalkan bantuan. Ini memverifikasi callback dan teks, bukan kualitas ucapan yang terdengar. Preview pengguna dibuka dari kartu Kereta Pola dan terverifikasi menampilkan layar awal game.

## Validasi Pasar Mini yang tetap berlaku

Tiga pilihan tetap sepanjang satu sesi. Tingkat awal 1–3 dengan pesanan pertama satu barang; pengaturan tingkat lama diabaikan. Setelah selesai, anak boleh mencoba 1–5 atau pindah lapak dari mudah. Main lagi mengganti setidaknya satu produk; Mulai ulang menjaga stok. Permainan tetap berjalan bila localStorage diblokir. Batas delapan barang dan penguncian pesanan benar teruji.

Narasi tambah/keluar menyebut nama, satuan, kelompok lapak dan jumlah terbaru. Teks yang dikirim ke mock SpeechSynthesis identik dengan UI. Salah barang plus kurang/lebih dijelaskan bersamaan, termasuk jumlah setiap produk salah. Tombol Dengarkan penjelasan mengulang pesan. Suara dihentikan saat pagehide, termasuk saat kembali ke katalog.

## Batas verifikasi

Pada rilis publik terakhir, Susun Ceritaku masih berupa kartu pratinjau; build lokal terbaru sudah mengaktifkan game ini. Kereta Pola versi ini hanya pola AB dengan satu bagian kosong, belum AAB/ABC atau pola buatan anak. Voice Bahasa Indonesia tidak tersedia pada lingkungan tes nyata; fallback dan isi narasi diuji, kualitas suara audibel belum. Android/iOS fisik, pembaca layar, dan penggunaan bersama anak/orang tua belum diuji. Progres sesi belum disimpan/tersinkron, tidak ada login/pembayaran/database atau penilaian perkembangan anak. Prefix `/member/` bukan kontrol autentikasi.

## Verifikasi publikasi dan font

Deployment produksi 7cfee78d-a25a-424e-85f9-665a20435f1a sukses. Empat rute (/ dan /member/games/ serta kedua game) merespons HTTP 200. document.fonts memastikan Quicksand dan Fredoka One berstatus loaded, family judul/isi sesuai. Interaksi awal kedua game di situs publik berhasil tanpa error JS/jaringan dan tanpa overflow pada 390 px. Selector smoke test awal keliru memakai data-add; diperbaiki menjadi tombol Tambah, lalu pemeriksaan publik berhasil.

Screenshot beranda, Pasar Mini mulai/bermain/selesai, Kereta Pola mulai/bermain/selesai diperiksa pada HP dan desktop. Muatan awal beranda Cloudflare benar-benar terukur 56.599 byte body / 59.899 byte transfer dalam cold context Chromium. Lihat docs/measurements-live.json. Angka bergantung kompresi dan kondisi respons saat pengukuran.
