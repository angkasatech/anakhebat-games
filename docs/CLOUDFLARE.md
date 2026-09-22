# Cloudflare Pages

**Rilis origin untuk cutover member:** build terbaru memerlukan secret server GAMES_ORIGIN_SECRET dan menolak akses langsung. Rilis origin telah diotorisasi; akses member menunggu kesiapan web utama. Bagian setup statis di bawah mendokumentasikan produksi lama. Ikuti [MEMBER-INTEGRATION.md](MEMBER-INTEGRATION.md) untuk rilis berikutnya.

Proyek: `anakhebat-games`. Repositori: `angkasatech/anakhebat-games`.
Alamat produksi: https://anakhebat-games.pages.dev/.

## Build otomatis

- GitHub sudah terhubung ke proyek Pages yang sama; push ke `main` membangun produksi.
- Branch selain `main` membangun preview terpisah. Komentar otomatis pada PR dinonaktifkan.
- Root directory: root repositori.
- Build command: `npm ci && npm test && npm run build`.
- Output directory: `dist`.
- Build image: v3.
- Production dan Preview memakai `NODE_VERSION=24` dan `SKIP_DEPENDENCY_INSTALL=true`.
- Instalasi dependency dijalankan secara eksplisit oleh `npm ci` menggunakan lockfile.

`.node-version` menyamakan versi mayor Node lokal dengan build cloud. `wrangler.jsonc` menyimpan nama proyek, output dan compatibility date; variabel build di atas dikelola di pengaturan Pages, bukan variabel runtime Wrangler.

Tidak ada environment variable aplikasi, API key, secret, database, atau binding yang dibutuhkan. Jangan menambahkan credential Cloudflare ke Git. Pengaturan suara hanya disimpan pada browser dan tidak tersinkron antarperangkat.

## Pembaruan

Jalankan `npm test`, `npm run build`, dan `npm run test:browser` sebelum push perubahan game. Periksa hasil build di dashboard Pages setelah push. Kegagalan build mempertahankan deployment produksi terakhir yang berhasil.

Untuk pengembangan lokal: `npm ci`, lalu `npm run dev`. Untuk memeriksa output produksi: `npm run build`, lalu `npm run preview -- --port 4174`.

Unggah manual tetap tersedia melalui `npm run deploy` setelah autentikasi `npx wrangler login`; alur utama menggunakan GitHub. Tidak perlu login Wrangler untuk deployment otomatis Git.

## Rute

Beranda `/` dan `/member/games/`, serta `/member/games/pasar-mini/`, `/member/games/kereta-pola/`, `/member/games/susun-ceritaku/`, `/member/games/sehari-kiki/` memiliki entry HTML sendiri. Tidak perlu rewrite SPA. Aset menggunakan jalur relatif. Prefix `/member/` belum menyediakan autentikasi.

Proyek utama AnakHebat tidak diubah. Preview juga publik, sehingga jangan memasukkan data pribadi anak atau credential ke konten build.

Referensi: [build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/) dan [build image](https://developers.cloudflare.com/pages/configuration/build-image/).
