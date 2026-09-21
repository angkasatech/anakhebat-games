# Beranda Main & Belajar

Tujuan: anak mengenali permainan dari ilustrasi, memilih dengan satu ketukan, dan dapat kembali memilih kapan saja. Orang tua mendapat konteks singkat tanpa memenuhi layar anak dengan penjelasan teknis.

Desain mempertahankan krem/hijau AnakHebat, judul Fredoka One, teks Quicksand dan ilustrasi SVG hangat. Tiga kartu memiliki suasana yang berbeda: toko hijau limau, kereta hijau kebiruan, cerita aprikot. Label ketersediaan selalu tertulis sehingga tidak hanya mengandalkan warna.

Hero menyapa “Hari ini, mau main apa?” dengan pembaca pilihan opsional. Pada HP, hero dipadatkan dan kartu ditumpuk. Pasar Mini adalah kartu aktif yang seluruh permukaannya dapat diketuk melalui satu tautan aksesibel. Game mendatang memiliki label Segera hadir dan detail native yang bisa dibuka, tanpa tautan ke permainan yang belum tersedia. Tidak ada filter karena tiga kartu masih mudah dipindai.

Rute entry nyata: `/`, `/member/games/`, `/member/games/pasar-mini/`. `src/app/registry.js` menjadi daftar game dan metadata; `src/main.js` memuat hub atau game secara dinamis. `src/app/router.js` membaca prefix deployment dari `data-app-root` pada HTML. Navigasi memakai tautan biasa agar reload, bookmark dan back/forward tidak memerlukan state router khusus. Semua permainan dapat membuka beranda dari tautan di dalam game.

Untuk menambahkan game: buat folder `src/games/<id>/` dengan `index.js` yang mengekspor `mount`, beri entry HTML dan daftar input Vite, lalu aktifkan `available` serta pemuatnya di registry. Data, engine, narasi dan aset khusus tetap di folder game; pakai ulang adapter suara/pengaturan dan aset yang relevan. Jangan menandai kartu siap sebelum game teruji.

Pembaruan game kedua: Pasar Mini dan Kereta Pola kini tersedia, termasuk entry `/member/games/kereta-pola/`. Label sesi berasal dari registry (5 pesanan / 5 stasiun). Kartu Kereta Pola juga dapat diketuk seluruh permukaannya. Narasi beranda menyebut kedua game yang tersedia. Pembaruan lokal game ketiga mengaktifkan Susun Ceritaku di /member/games/susun-ceritaku/, label 3 gambar, dan narasi menyebut ketiga game. Rilis publik terakhir masih berisi dua game sampai pembaruan ini dipublikasikan.

Pembaruan lokal keempat: Sehari bersama Kiki aktif di /member/games/sehari-kiki/. Beranda memuat empat kartu, dua kolom desktop dan satu kolom HP, dengan ilustrasi English tersendiri dan narasi empat pilihan. Ilustrasi kartu diberi posisi absolut dalam panel berukuran tetap agar tidak terpotong pada kartu desktop yang lebih lebar. Rilis publik dua game belum diganti.
