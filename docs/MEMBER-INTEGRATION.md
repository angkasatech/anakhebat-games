# Integrasi akses member games — kontrak v1

Status: rilis origin telah diotorisasi sebagai langkah cutover terkoordinasi. Task utama menyiapkan secret produksi dan fail_open=false; preview sengaja tanpa secret sehingga akses ditolak. Origin terkunci sampai integrasi utama dirilis. Deployment publik historis harus ditutup oleh task utama; perubahan source ini tidak melindungi deployment lama.

## Pembagian tanggung jawab

Task AnakHebat memeriksa membership aktif DAN flag akses games tersendiri; pembayaran paket biasa tidak otomatis memberi akses games. Task AnakHebat memiliki login, cookie server, entitlement, menu, proxy `/member/games/*`, dan konfigurasi Cloudflare. Repo ini hanya memverifikasi permintaan origin dari proxy sebelum melayani HTML/aset. Tidak membaca token/sesi browser dan tidak memeriksa pembayaran sendiri. Pengaturan suara lokal tetap terpisah dari autentikasi. Progres per anak belum disimpan.

`public/_worker.js` disalin Vite ke `dist/_worker.js` (Pages advanced mode). `public/_routes.json` mencakup `/*` tanpa pengecualian, termasuk root, aset, dan URL preview. `GAMES_ORIGIN_SECRET` wajib secret server minimal 32 karakter, tanpa fallback. Secret tidak boleh memakai prefix `VITE_`.

Main menandatangani GET/HEAD dengan HMAC-SHA256 hex lowercase:

```js
['v1', timestamp, method, new URL(request.url).origin, pathname + search].join('\n')
```

Header: `X-AH-Games-Timestamp` epoch detik integer, `X-AH-Games-Signature` tanda tangan. Origin berarti URL tujuan Pages yang benar-benar di-fetch, termasuk hostname preview bila dipakai. Umur maksimal 30 detik, toleransi masa depan 5 detik. Signature tidak bisa dipakai ulang pada origin/path/query/method berbeda. Replay identik dalam jendela tersebut tetap dimungkinkan oleh kontrak v1; header hanya digunakan antarserver.

Origin menolak path di luar `/member/games/`, metode selain GET/HEAD, dan signature invalid. Status: 401 jika header tidak ada, 403 jika tidak diizinkan, 503 jika konfigurasi/layanan gagal. Semua respons memakai `Cache-Control: private, no-store`. Request credential/signature dihapus sebelum ASSETS.fetch; respons tidak mengembalikan signature atau Set-Cookie. Tidak menggunakan service worker atau cache offline.

Aset build berada di `/member/games/assets/`; lisensi di `/member/games/licenses/`. Entry `/member/games/` dan empat game tetap sama. Root `/` hanya membantu preview Vite lokal dan selalu ditolak oleh worker origin. Main melakukan canonical redirect path game tanpa ekstensi setelah autentikasi, sebelum meminta origin. Main menolak seluruh redirect upstream; tidak meneruskannya ke browser atau mengikuti redirect dengan header tanda tangan.

## Validasi lokal

```sh
npm test
npm run build
npx wrangler pages dev dist --port 4181 --binding GAMES_ORIGIN_SECRET=test-only-secret-not-for-deployment-123456
```

Di terminal kedua:

```sh
node scripts/test-origin.mjs
npm run test:browser
```

Secret di atas hanya fixture lokal, jangan dipakai produksi. Tes runtime memakai Wrangler ASSETS asli dan signer Node independen, memeriksa semua file build tidak bisa diakses tanpa signature, aset bertanda tangan, seluruh halaman pada HP/desktop, dan font Arab lazy load. Tes browser biasa memakai Vite preview untuk menguji gameplay; Vite tidak menjalankan proteksi Worker.

## Syarat cutover oleh task utama

1. Siapkan sesi/entitlement dan proxy main; jangan aktifkan menu sebelum origin terlindungi. Migrasi main `migrations/m16-member-web-sessions.sql` untuk tabel sesi khusus server belum diterapkan per laporan task utama; penerapannya merupakan prasyarat rilis.
2. Pasang secret server pada main dan games untuk produksi/preview yang sesuai. Jangan menyalin token sesi pengguna ke origin games. **Wajib set Pages `fail_open=false` pada production dan preview, terutama proyek games**, agar keterbatasan kuota/ketersediaan Functions tidak membuka fallback langsung ke aset statis. Lakukan PATCH sempit hanya untuk field yang diperlukan; pertahankan seluruh environment variable, secret, binding, dan pengaturan lain. Baca ulang konfigurasi kedua environment untuk memverifikasi nilai sebelum aktivasi.
3. Deploy build games yang memiliki worker + routes; verifikasi unsigned HTML/aset ditolak dan permintaan signed dilayani.
4. Inventaris dan hapus atau lindungi deployment games historis dan preview lama. Worker baru tidak mengubah deployment lama. Repo games saat ini publik; source juga tetap dapat disalin, sehingga ini pembatasan akses hosted service, bukan DRM.
5. Aktifkan proxy/main dan uji pengguna belum login, member aktif, expired, logout, kegagalan entitlement, direct origin, dan URL preview. Pastikan tidak ada cache respons berisi game yang melewati pengecekan sesi.

Worker tidak mengelola DNS atau secret Cloudflare. Rilis origin melalui Git dilakukan terpisah dari migrasi SQL dan aktivasi akses pada web utama.
