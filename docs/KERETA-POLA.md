# Kereta Pola — brief versi pertama

Game kedua AnakHebat Games. Anak melanjutkan pola muatan bergantian untuk membantu kereta berangkat. Tidak ada batas waktu menjawab, nyawa, skor, hukuman, atau klaim perkembangan anak.

## Alur

1. Mulai: memilih Buah ceria atau Bentuk berwarna. Keduanya selalu mudah, satu pola AB, empat posisi dengan satu tempat kosong di ujung, dua pilihan. Contoh terlihat sebelum bermain.
2. Bermain: baca urutan dari kiri ke kanan, ketuk pilihan untuk gerbong keempat. Jawaban cocok menggerakkan kereta menuju stasiun. Setelah tiba anak menekan Stasiun berikutnya; permainan tidak maju sendiri. Jawaban belum sesuai tetap bisa diganti tanpa batas percobaan dan memulai bantuan.
3. Selesai: setelah lima perjalanan, apresiasi usaha, main lagi, pilih muatan lain, serta ajakan membuat pola sendok–gelas di rumah dengan orang tua.

Lima stasiun: Kebun Apel, Padang Bunga, Bukit Pelangi, Danau Tenang, Taman Ceria. Pola tetap AB dengan pasangan yang bervariasi. Buah memakai aset bersama; bentuk memiliki siluet serta nama yang berbeda (lingkaran biru, segitiga kuning, persegi ungu, bintang hijau), sehingga warna bukan satu-satunya petunjuk.

## Bantuan dan suara

Lihat polanya menyorot gerbong satu per satu. Bila suara aktif/tersedia, nama muatan dibacakan selama gerbong tersebut disorot, lalu diberi petunjuk lanjutan. Callback akhir ucapan memicu gerbong berikutnya. Tanpa audio, sorotan tetap berjalan dengan jeda 900 ms. Watchdog mencegah bantuan macet pada mesin ucapan yang tidak memberikan callback. Ini durasi animasi/bantuan, bukan penghitung waktu jawaban.

Dengarkan pola mengaktifkan preferensi suara dan menjalankan bantuan. Memilih jawaban, menghentikan bantuan, mematikan suara, mulai ulang, mengganti muatan, atau meninggalkan halaman membatalkan rangkaian sorotan/ucapan lama. Preferensi suara dibagi dengan game lain; sesi hanya dalam memori. Tidak ada rekaman suara anak.

Gerakan berangkat sekitar 850 ms dan selesai otomatis sebelum tombol berikutnya muncul; reduced motion melewati gerakan dan langsung memberi keadaan tiba. Berpindah tab saat kereta berjalan menyelesaikan transisi agar game tidak macet.

## Struktur

- `src/games/kereta-pola/data.js`: tema, pasangan muatan, generator lima perjalanan.
- `engine.js`: state murni playing → departing → arrived → finished; jawaban salah tetap playing.
- `feedback.js`: nama muatan, pembacaan pola dan petunjuk.
- `view.js`: layar, input ketukan, fokus keyboard dan lifecycle bantuan.
- `styles.css`, `assets/`: tampilan khusus dan SVG bentuk/lokomotif.
- Entry: `/member/games/kereta-pola/`, dynamic import melalui registry. Beranda menampilkan game sebagai tersedia setelah validasi.

Belum termasuk AAB/ABC, beberapa gerbong kosong, pola buatan anak, login atau progres per anak. Ini menjaga versi pertama pada satu mekanisme yang matang. Suara nyata dan pengujian penggunaan bersama anak masih perlu diverifikasi sebelum rilis; tes mock hanya membuktikan teks/callback yang digunakan aplikasi.
