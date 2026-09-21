import { words, makeOrders } from './orders.js';
import { stalls, names, products, quantityLabel, chooseStock } from './catalog.js';
import { createSession, addFruit, removeFruit, checkOrder, serve, nextOrder } from './engine.js';
import { loadSettings, saveSettings } from '../../shared/settings.js';
import { createSpeech } from '../../shared/speech.js';
import { basketSummary, basketChangeMessage, orderFeedback } from './feedback.js';
import bunny from '../../assets/bunny.svg';

const assetModules = import.meta.glob('../../assets/*.svg', { eager: true, query: '?url', import: 'default' });
const images = Object.fromEntries(Object.entries(assetModules).map(([path, url]) => [path.split('/').pop().replace('.svg', ''), url]));
const productImage = id => `<img class="fruit" src="${images[id]}" alt="${names[id]}" draggable="false">`;

export function mountMarket(root, { hubUrl = '/member/games/' } = {}) {
  const settings = loadSettings();
  let screen = 'start', stall = 'fruit', session, help = false, feedback = '', audioNotice = '';
  const previousStock = {};
  const speech = createSpeech(message => {
    audioNotice = message;
    const node = root.querySelector('#audio-notice');
    if (node) node.textContent = message;
  });
  const say = text => { if (settings.sound) speech.say(text); };
  const orderText = () => { const o = session.orders[session.index]; return `Aku mau ${quantityLabel(o.fruit, words[o.count])}.`; };
  const difficulty = () => settings.level === 'beginner' ? 'Mulai kecil · 1–3' : 'Coba lebih banyak · 1–5';
  const dots = () => `<div class="progress" aria-label="Pesanan ${session.index + 1} dari 5">${session.orders.map((_, i) => {
    const done = i < session.index || (i === session.index && session.status === 'served');
    return `<span class="${done ? 'done' : i === session.index ? 'current' : ''}">${done ? '✓' : i + 1}</span>`;
  }).join('')}</div>`;

  function stallCards(action, excludeCurrent = false) {
    return `<div class="stall-cards">${Object.entries(stalls).filter(([id]) => !excludeCurrent || id !== stall).map(([id, item]) => `
      <button class="stall-card ${id === stall && !excludeCurrent ? 'selected' : ''}" data-action="${action}" data-value="${id}" aria-label="${action === 'visit' ? 'Pindah ke ' : ''}${item.name}" ${action === 'stall' ? `aria-pressed="${id === stall}"` : ''}>
        <span class="stall-pictures" aria-hidden="true">${item.preview.map(productImage).join('')}</span>
        <strong>${item.short}</strong><small>${action === 'visit' ? 'Mulai dari 1 barang →' : '6 jenis pilihan'}</small>
        ${action === 'stall' && id === stall ? '<span class="stall-check" aria-hidden="true">✓</span>' : ''}
      </button>`).join('')}</div>`;
  }

  function scene() {
    return `<div class="shop-illustration" aria-label="Kelinci menyambut di ${stalls[stall].name}"><div class="sun">✳</div><span class="little-leaf leaf-one">✦</span><div class="shop-sign">${stalls[stall].name.toUpperCase()}</div><div class="awning"></div><div class="shop-back"><div class="shelf-line"></div><img class="shop-bunny" src="${bunny}" alt="Kelinci penjaga toko"><div class="hello">Halo, teman! <span>♡</span></div></div><div class="counter-fruits">${stalls[stall].preview.map(id => `<div>${productImage(id)}${productImage(id)}</div>`).join('')}</div><div class="shop-counter"><span>SEGAR SETIAP HARI</span><div>♡</div></div><div class="shop-shadow"></div><span class="little-leaf leaf-two">✦</span></div>`;
  }

  function startView() {
    return `<main class="start-layout"><section class="intro"><div class="eyebrow"><span class="tiny-dot"></span> MAIN & BELAJAR · 3–7 TAHUN</div><h1>Toko kecil,<br><em>cerita besar.</em></h1><p class="lead">Selamat datang di <strong>Pasar Mini!</strong><br>Pilih lapakmu. Kita mulai pelan-pelan, ya.</p>
      <fieldset class="stall-picker"><legend>Mau jaga lapak yang mana?</legend>${stallCards('stall')}</fieldset>
      <div class="easy-start"><span class="easy-number" aria-hidden="true">1</span><div><strong>Mulai kecil, dari satu barang</strong><p>Jumlah 1–3 · dibantu gambar · 5 pesanan</p></div></div>
      <button class="primary start-button" data-action="start" aria-label="Mulai">Mulai di ${stalls[stall].short} <span>→</span></button>
      <p class="reassurance">Setelah selesai, boleh pindah lapak atau coba 1–5.</p></section>
      <section class="illustration-wrap">${scene()}<div class="illustration-caption"><span>01</span><div><strong>${stalls[stall].name}</strong><small>Pilih · hitung · berbagi senyum</small></div><span class="caption-flower">✿</span></div><div class="catalog-preview"><p>Kenalan dengan isi lapaknya</p><div>${stalls[stall].items.map(id => `<span>${productImage(id)}<small>${names[id]}</small></span>`).join('')}</div><small>Tiga pilihan per sesi. Main lagi untuk pilihan berbeda.</small></div></section>
      <section class="how-to" aria-label="Cara bermain"><div><b>1</b><span><strong>Lihat pesanan</strong><small>Temanmu ingin membeli apa?</small></span></div><div><b>2</b><span><strong>Ketuk pilihannya</strong><small>Masukkan ke keranjang.</small></span></div><div><b>3</b><span><strong>Berikan dengan senyum</strong><small>Tekan “Pesanan siap”.</small></span></div></section></main>`;
  }

  function playView() {
    const o = session.orders[session.index], served = session.status === 'served';
    return `<main class="play-layout"><div class="play-top"><button class="text-button" data-action="home">← Keluar</button>${dots()}<button class="text-button" data-action="restart">↻ Mulai ulang</button></div>
      <div class="session-label"><strong>${stalls[stall].name}</strong><span>${difficulty()}</span></div>
      <section class="play-shop"><div class="play-awning"></div><div class="customer"><div class="customer-portrait"><img src="${bunny}" alt="Kelinci ${o.customer}"><span>${o.customer}</span></div><div class="speech-bubble"><p class="eyebrow">PESANAN ${session.index + 1} DARI 5</p><h1>${served ? 'Terima kasih, teman!' : `Aku mau <em>${quantityLabel(o.fruit, words[o.count])}</em>.`}</h1>
      <div class="order-actions"><button class="small-button" data-action="listen" aria-label="Dengarkan pesanan">♫ Dengarkan</button>${settings.level === 'advanced' && !served ? `<button class="small-button" data-action="help" aria-expanded="${help}">◉ ${help ? 'Tutup bantuan' : 'Bantu hitung'}</button>` : ''}</div>
      ${!served && (settings.level === 'beginner' || help) ? `<div class="visual-order" aria-label="${quantityLabel(o.fruit, o.count)}">${Array.from({ length: o.count }, (_, i) => `<span>${productImage(o.fruit)}<b>${i + 1}</b></span>`).join('')}</div>` : ''}</div></div>
      <div class="worktop"><section class="fruit-section"><h2>Ketuk pilihanmu</h2><div class="fruit-picks">${session.stock.map(id => `<button class="fruit-pick ${id}" data-action="add" data-value="${id}" aria-label="Tambah ${names[id]}" ${served ? 'disabled' : ''}>${productImage(id)}<strong>${names[id]}</strong>${products[id].unit ? `<small class="product-unit">1 ${products[id].unit}</small>` : ''}<span class="plus">+</span></button>`).join('')}</div></section>
      <section class="basket-section"><div class="basket-heading"><h2>Keranjangmu</h2><span>${session.basket.length} ${stalls[stall].short.toLowerCase()}</span></div><div class="basket ${session.basket.length ? 'filled' : ''}">${session.basket.length ? session.basket.map((id, i) => `<button class="basket-fruit" data-action="remove" data-value="${i}" aria-label="Keluarkan ${names[id]} ke-${i + 1}" ${served ? 'disabled' : ''}>${productImage(id)}<span>−</span></button>`).join('') : '<span class="basket-empty">＋<small>Pilihanmu masuk di sini</small></span>'}</div><p class="basket-hint">Ketuk isi keranjang untuk mengeluarkannya.</p></section></div>
      <div class="serve-row"><div class="feedback-panel"><p id="feedback" role="status" class="feedback ${served ? 'success' : ''}">${feedback || 'Pilih satu per satu, yuk.'}</p>${feedback ? '<button class="small-button replay-feedback" data-action="listen-feedback">♫ Dengarkan penjelasan</button>' : ''}</div><button class="primary" data-action="${served ? 'next' : 'serve'}">${served ? (session.index === 4 ? 'Selesai' : 'Teman berikutnya') + ' →' : 'Pesanan siap ✓'}</button></div></section>
      <p class="play-note">Tidak perlu terburu-buru. Kamu boleh mencoba lagi.</p><button class="text-button switch-stall" data-action="home">↔ Pilih lapak lain</button><p class="switch-note">Pindah lapak memulai sesi baru dari mudah.</p></main>`;
  }

  function finishView() {
    return `<main class="finish"><div class="eyebrow">${stalls[stall].name.toUpperCase()} · LIMA PESANAN SELESAI</div><div class="finish-art"><span>✦</span><img src="${bunny}" alt="Kelinci tersenyum"><span>✦</span></div><h1>Terima kasih,<br><em>penjaga toko kecil!</em></h1><p>Kamu sudah menyiapkan lima pesanan.<br>Terima kasih sudah mencoba dan menghitung bersama.</p><div class="finish-dots" aria-label="Lima pesanan selesai">✓ &nbsp; ✓ &nbsp; ✓ &nbsp; ✓ &nbsp; ✓</div>
      <div class="finish-actions"><button class="primary" data-action="replay">Main lagi ↻</button><button class="secondary-button" data-action="${settings.level === 'beginner' ? 'advance' : 'easy'}">${settings.level === 'beginner' ? 'Coba 1–5 barang →' : 'Kembali ke 1–3 barang'}</button></div><p class="choice-note">Boleh tetap di tingkat ini. Pilihan barang akan berganti.</p>
      <section class="next-stalls"><h2>Mampir ke lapak lain?</h2><p>Lapak baru dimulai dari satu barang, dibantu gambar.</p>${stallCards('visit', true)}</section>
      <button class="text-button" data-action="home">← Kembali ke awal</button><aside class="home-activity"><span>⌂</span><div><strong>Petualangan lanjut di rumah</strong><p>Yuk, main jual-beli bersama orang tua! Pakai makanan mainan atau benda aman di rumah. Bergantian jadi pembeli dan penjaga toko.</p></div></aside><small>Permainan ini bukan penilaian perkembangan anak.</small></main>`;
  }

  function render(focus = false) {
    const active = document.activeElement;
    const lastAction = active?.dataset.action, lastValue = active?.dataset.value;
    root.innerHTML = `<div class="page-shell"><header class="header"><a class="brand" href="#" data-action="home"><span class="brand-icon">❧</span>AnakHebat<span class="brand-divider"></span><small>Main & Belajar</small></a><button class="sound-button" data-action="sound" aria-pressed="${settings.sound}">${settings.sound ? '♫' : '♪'} <span>Suara ${settings.sound ? 'nyala' : 'mati'}</span></button></header><nav class="all-games-nav" aria-label="Navigasi permainan"><a href="${hubUrl}">← Semua permainan</a><span>Pasar Mini</span></nav>${screen === 'start' ? startView() : screen === 'play' ? playView() : finishView()}<p id="audio-notice" class="audio-notice" role="status">${audioNotice}</p><footer><span>Langkah kecil, tumbuh bersama.</span><span>Suara tersimpan di browser ini. Progres sesi tidak disimpan atau tersinkron.</span></footer></div>`;
    if (focus) { const heading = root.querySelector('main h1'); heading.tabIndex = -1; heading.focus(); }
    else if (lastAction) [...root.querySelectorAll('[data-action]')].find(el => el.dataset.action === lastAction && el.dataset.value === lastValue)?.focus({ preventScroll: true });
  }

  function begin(level = 'beginner', keepStock = false) {
    speech.stop(); settings.level = level;
    const stock = keepStock && session ? session.stock : chooseStock(stall, previousStock[stall]);
    previousStock[stall] = stock;
    session = createSession(makeOrders(level, Math.random, stock), stock);
    screen = 'play'; help = false; feedback = '';
    render(true); say(`${stalls[stall].name}. ${orderText()}`);
  }

  root.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    const { action, value } = button.dataset;
    if (action === 'home') { event.preventDefault(); speech.stop(); screen = 'start'; settings.level = 'beginner'; feedback = ''; render(true); return; }
    if (action === 'sound') { settings.sound = !settings.sound; saveSettings(settings); if (!settings.sound) { speech.stop(); audioNotice = ''; } else say(screen === 'play' ? orderText() : 'Selamat datang di Pasar Mini. Yuk, bermain bersama.'); render(); return; }
    if (action === 'stall' && screen === 'start' && stalls[value]) { stall = value; settings.level = 'beginner'; render(); say(stalls[stall].name); return; }
    if (action === 'start' && screen === 'start') { begin(); return; }
    if (action === 'restart' && screen === 'play') { begin(settings.level, true); return; }
    if (screen === 'finish') {
      if (action === 'replay') begin(settings.level);
      if (action === 'advance' && settings.level === 'beginner') begin('advanced');
      if (action === 'easy') begin();
      if (action === 'visit' && stalls[value]) { stall = value; begin(); }
      return;
    }
    if (screen !== 'play') return;
    if (action === 'listen') { settings.sound = true; saveSettings(settings); say(orderText()); }
    if (action === 'listen-feedback' && feedback) { settings.sound = true; saveSettings(settings); say(feedback); }
    if (action === 'help') help = !help;
    if (action === 'add') {
      const before = session.basket.length;
      session = addFruit(session, value);
      if (session.basket.length > before) feedback = basketChangeMessage(stall, value, session.basket.length);
      else if (before === 8) feedback = `Keranjang sudah penuh. ${basketSummary(stall, before)} Ketuk isinya untuk mengeluarkan pilihanmu, ya.`;
      say(feedback);
    }
    if (action === 'remove') {
      const product = session.basket[Number(value)], before = session.basket.length;
      session = removeFruit(session, Number(value));
      if (session.basket.length < before) { feedback = basketChangeMessage(stall, product, session.basket.length, 'remove'); say(feedback); }
    }
    if (action === 'serve') {
      const result = checkOrder(session), o = session.orders[session.index];
      feedback = orderFeedback(o, session.basket);
      if (result.correct) session = serve(session);
      else help = true;
      say(feedback);
    }
    if (action === 'next') {
      session = nextOrder(session); feedback = ''; help = false;
      if (session.status === 'finished') { screen = 'finish'; say('Terima kasih sudah mencoba dan menghitung bersama! Boleh main lagi atau mampir ke lapak lain.'); }
      else say(orderText());
      render(true); return;
    }
    render();
    if (action === 'serve' && session.status === 'served') root.querySelector('[data-action="next"]').focus();
    if (action === 'remove') (root.querySelector('[data-action="remove"]') || root.querySelector('[data-action="add"]')).focus({ preventScroll: true });
  });
  window.addEventListener('pagehide', () => speech.stop());
  document.addEventListener('visibilitychange', () => { if (document.hidden) speech.stop(); });
  render();
}
