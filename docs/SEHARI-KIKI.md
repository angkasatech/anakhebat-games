# Sehari bersama Kiki — brief implementasi

Game keempat, bahasa Inggris usia 3–7 tahun. Peta kegiatan bebas dipilih: bangun tidur, mandi & sikat gigi, berpakaian, makan, sekolah, les & Iqra, pergi salat, bermain, merapikan, tidur. Default tombol utama mulai dari bangun tidur dan kenalan kata; tidak mengunci kegiatan berdasarkan umur atau hasil.

Alur: pilih kegiatan → kenalan lima kata bergambar + ungkapan sehari-hari → cari kata (lima putaran, dua pilihan) → selesai dan opsional coba kalimat (tiga permintaan, tiga pilihan). Anak boleh mendengarkan ulang, melihat gambar bantuan, mencoba lagi, reset atau keluar kapan saja. Tidak ada skor, waktu, hukuman, mikrofon atau login. Gambar bantuan otomatis tersedia jika suara dimatikan/tidak tersedia.

Les & Iqra mengenalkan kosakata aktivitas belajar dalam bahasa Inggris. Pengenalan hijaiyah tersendiri: 28 huruf dasar terpisah dalam tujuh kelompok kecil, eksplorasi dan pencocokan bentuk. Bukan pengganti buku/metode Iqra lengkap; belum ada harakat, huruf sambung, tajwid atau audio Arab terverifikasi. Nama huruf untuk pendamping; huruf tidak dibacakan memakai suara Inggris/Indonesia. Salat memakai konteks persiapan dan pergi ke masjid; bukan tutorial tata cara atau bacaan salat.

UI konsisten dengan AnakHebat: Fredoka One, Quicksand, krem/sage, SVG lokal. Arabic memakai font lokal dengan glyph lengkap. Semua aset game dimuat lewat entry game, font Arab baru dipakai saat panel hijaiyah dibuka. Suara Inggris browser opsional; audio audibel harus diuji terpisah, fallback tidak boleh menghalangi bermain.

Data kosakata/kalimat, engine murni, UI, aset, serta adapter suara/pengaturan dipisahkan. Hanya pengaturan suara tersimpan di browser; progres sesi belum disimpan/tersinkron.

Referensi konten: [British Council — Daily routines](https://learnenglishkids.britishcouncil.org/category/topics/daily-routines) dan [Quran Academy — pengenalan alfabet](https://alphabet.quranacademy.org/en/course/alphabet). Konten dan ilustrasi game disusun sendiri, tidak menyalin lembar aktivitas/audio rujukan.

Versi ini untuk tinjauan lokal; belum dipublikasikan.

## Hasil implementasi dan validasi

39 kosakata unik, 50 kartu kegiatan (kata lama dipakai ulang), 30 permintaan, 10 sapaan, dan 10 percakapan dua giliran. 28 huruf dasar dalam tujuh kelompok. Mode kata lima putaran, mode kalimat tiga putaran, mode bentuk empat putaran. Semua dimulai tanpa batas waktu/skor.

37 SVG baru 17.133 byte. Cold load Chromium pada preview produksi lokal: 66.031 byte body / 69.331 byte transfer / 11 request, termasuk font Latin 43.840 byte. Noto Naskh Arabic 52.668 byte dibuktikan tidak diunduh saat masuk game, baru diunduh ketika membuka panel huruf. Ini pengukuran lokal, bukan CDN atau perangkat HP fisik.

15 tes browser Kiki mencakup semua kegiatan pada 390 px, semua layar pada 320/1280 px, tujuh kelompok huruf, salah/benar, bantuan, replay/reset, pindah kegiatan, keyboard, storage diblokir, reduced motion, fallback suara dan pemilihan voice Inggris di antara voice Indonesia. Audio Inggris audibel dan pelafalan Arab belum diverifikasi. Latihan huruf adalah pencocokan visual dengan pendamping.

Build akhir berhasil. Total proyek: 19 tes logika + 51 tes browser lulus (20 Kiki/beranda, 31 regresi tiga game). Setelah memperbaiki crop ilustrasi beranda, lima tes hub diulang dan lulus. Semua pengujian browser memakai Chromium; perangkat Android/iOS fisik belum diuji.
