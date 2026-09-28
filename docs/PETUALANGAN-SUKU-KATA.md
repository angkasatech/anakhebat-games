# Petualangan Suku Kata — Jembatan Kata Ceria

Game lokal untuk kesiapan membaca usia 4–7 tahun di `/member/games/petualangan-suku-kata/`. Lima pulau/misi: tepuk suku kata, pilih pasangan, susun jembatan, pecah kata, dan peti harta. Tiga mode kesulitan memilih kata dua atau tiga suku kata. Data kata berada di `src/games/petualangan-suku-kata/data.js`; aturan di `engine.js`; tampilan di `index.js`; adapter suara di `audio.js`.

Versi ini memakai gambar emoji ringan dan TTS perangkat sebagai fallback. Rekaman manusia dapat ditambahkan tanpa mengubah aturan permainan melalui `audio.js` dan folder audio game. Tidak ada login, entitlement, database, progres anak, timer, atau service worker.

Jalankan `npm test`, `npm run build`, lalu `npm run test:browser`. Pastikan lebar 320 px dan desktop tetap tidak overflow. Untuk deployment premium, gunakan Worker origin yang sudah ada dan jangan menambahkan token ke game.

Game ini belum dipublikasikan. Detektif Suara juga tetap ditahan dari rilis sampai audio dan kontennya ditinjau ulang.
