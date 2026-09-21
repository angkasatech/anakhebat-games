import './shared/styles/base.css';
import { games } from './app/registry.js';
import { currentGame, hubUrl } from './app/router.js';
const root = document.querySelector('#app');
const game = games.find(item => item.id === currentGame() && item.available);
async function start() {
  if (game) {
    document.title = `${game.name} · AnakHebat`;
    const module = await game.load();
    module.mount(root, { hubUrl });
  } else {
    const { mountHub } = await import('./app/hub.js');
    document.title = 'Main & Belajar · AnakHebat Games';
    mountHub(root);
  }
}
start().catch(() => {
  root.innerHTML = '<main style="padding:40px;max-width:600px;margin:auto"><h1>Yuk, coba buka lagi.</h1><p>Permainan belum berhasil dimuat.</p><button id="retry" style="padding:16px">Coba lagi</button></main>';
  root.querySelector('#retry').addEventListener('click', () => location.reload());
});
