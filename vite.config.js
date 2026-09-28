import { defineConfig } from 'vite';
export default defineConfig({
 base: './',
 build: {
  assetsDir: 'member/games/assets',
  rollupOptions: {
   input: { main: 'index.html', games: 'member/games/index.html', pasarMini: 'member/games/pasar-mini/index.html', keretaPola: 'member/games/kereta-pola/index.html', susunCeritaku: 'member/games/susun-ceritaku/index.html', sehariKiki: 'member/games/sehari-kiki/index.html', detektifSuara: 'member/games/detektif-suara/index.html', petualanganSukuKata: 'member/games/petualangan-suku-kata/index.html' },
   output: {
    chunkFileNames(chunk) { return chunk.name === 'detektif-suara' ? 'member/games/detektif-suara/assets/[name]-[hash].js' : 'member/games/assets/[name]-[hash].js'; },
    assetFileNames(asset) { return asset.names?.some(name => name.includes('detektif-suara')) ? 'member/games/detektif-suara/assets/[name]-[hash][extname]' : 'member/games/assets/[name]-[hash][extname]'; },
   },
  },
 },
});
