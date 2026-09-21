# Brief implementasi — Pasar Mini

Prototipe pertama koleksi AnakHebat Games, untuk anak 3–7 tahun dengan pendampingan orang tua. Satu mekanisme: memilih jenis dan menghitung barang untuk pelanggan. Lima pesanan tanpa batas waktu, skor, atau hukuman. Pembaruan 21 September: tiga lapak dengan enam jenis produk masing-masing (18 total).

Referensi baca-saja: `../anakhebat/index.html` dan `../anakhebat/prototype/marketing-revamp.html`. Palet krem #fbf6ea, hijau #236b55, tinta #21332b; serif pada judul dan bahasa yang hangat. CSS marketing yang ditautkan halaman utama tidak tersedia di checkout, sehingga token di prototipe digunakan sebagai referensi. Folder tujuan awalnya hanya memiliki `.git`.

## Alur tiga layar

1. Mulai: pilih Lapak Buah / Sayur / Lauk dengan gambar, pratinjau enam produk, tombol Mulai dan suara. Semua lapak tersedia tanpa kunci. Selalu mulai di tingkat mudah 1–3 dengan gambar, pesanan pertama satu barang. Tidak ada jalan langsung ke tingkat lanjut dari awal.
2. Bermain: pelanggan dan permintaan, gambar hitungan, tiga tombol produk tetap sepanjang sesi, keranjang yang bisa dikoreksi dengan ketukan, Pesanan siap. Keluar, mulai ulang dan pilih lapak lain tersedia. Pindah lapak menjelaskan bahwa sesi dimulai ulang dari mudah. Pesanan memakai satuan yang sesuai (misalnya dua potong tempe).
3. Selesai: apresiasi, Main lagi pada tingkat yang sama, pilihan coba 1–5 setelah sesi mudah, atau kartu langsung ke dua lapak lainnya (kembali mudah). Pada tingkat lanjut tersedia kembali 1–3. Main lagi selalu membawa setidaknya satu produk berbeda. Aktivitas jual-beli bersama orang tua tetap ada; tidak ada interpretasi perkembangan anak.

## Implementasi

JavaScript native + Vite: tanpa runtime framework, backend, akun atau database. `engine.js` berisi transisi murni; `orders.js` data dan generator; `view.js` presentasi dan interaksi; `src/assets` ilustrasi SVG; `shared/settings.js` adapter penyimpanan terpisah; `shared/speech.js` adapter pembaca perangkat. Registrasi game di `src/main.js` dapat diperluas.

Hanya pengaturan suara disimpan di localStorage; tingkat lama yang mungkin tersimpan diabaikan. Progres sesi hanya di memori dan hilang saat reload/keluar. Penyimpanan gagal tidak menghalangi permainan. Tidak ada sinkronisasi antarperangkat. `catalog.js` memisahkan daftar produk, lapak, satuan dan rotasi stok dari tampilan.

Interaksi awal dibangun memakai aset SVG sederhana lalu dirapikan menjadi satu gaya buah dan pelanggan. Tidak ada font jarak jauh, gambar AI, audio unduhan, analytics atau permintaan API. SpeechSynthesis hanya digunakan bila voice Indonesia tersedia; hasil audio fisik tetap harus dicoba pada perangkat sasaran. Voice perangkat mungkin memerlukan jaringan dari penyedia sistem.

Di luar lingkup: 10 buah, pesanan campuran, penjumlahan, akun/member, progres per anak. Rute `/member/` pada build ini hanya jalur contoh, bukan kontrol akses member.
