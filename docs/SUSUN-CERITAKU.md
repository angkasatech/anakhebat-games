# Susun Ceritaku — brief versi pertama

Tiga layar: mulai (pilih cerita, mulai mudah), bermain (ketuk tiga kartu sesuai urutan, ketuk kartu terpilih untuk mengeluarkannya, bantuan dan pemeriksaan), selesai (cerita lengkap, pembacaan opsional, ajakan bercerita sendiri, ulang atau cerita lain).

Mulai dengan Bunga untuk Ibu; tersedia Cuci Tangan dan Waktu Pisang. Semua cerita berisi tiga kejadian, tanpa tingkat sulit, waktu, skor, rekaman, atau hukuman. Urutan acak tidak pernah langsung benar. Kesalahan dijelaskan sesuai kejadian pertama yang belum cocok; anak tetap boleh memperbaiki sendiri. Kata “Di cerita ini” membedakan urutan contoh dari kebebasan bercerita setelah bermain.

Font dan warna mengikuti beranda: Fredoka One untuk judul, Quicksand untuk instruksi. Kartu memakai SVG lokal yang konsisten, gambar besar dan label singkat. Ketukan dan keyboard adalah interaksi utama. Pada HP, kartu berjajar tiga agar urutan tetap terbaca dari kiri ke kanan.

Logika murni di engine.js, cerita di data.js, kalimat bantuan di feedback.js, ilustrasi di assets/, dan UI di view.js/styles.css. Adapter suara/pengaturan digunakan ulang. Suara Indonesia bergantung perangkat; cerita lengkap selalu terbaca tanpa audio. Tidak merekam anak. Hanya preferensi suara disimpan di browser; progres tidak tersinkron.

Versi ini disiapkan untuk tinjauan lokal sebelum publikasi pembaruan.

## Hasil implementasi

Tiga cerita aktif di beranda lokal. Sembilan ilustrasi SVG konsisten berjumlah 7.824 byte; muatan awal terukur 61.018 byte transfer termasuk font pada preview produksi lokal. 11 tes browser game ini mencakup tiga cerita di tiga ukuran layar, fallback/keyboard dan narasi tersinkron melalui mock. Audio audibel masih bergantung pengujian perangkat. Ukuran kartu desktop dipadatkan setelah tinjauan visual, dan sampul pisang menggunakan gambar pisang dikupas agar topiknya mudah dikenali.
