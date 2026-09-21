import './hub.css';
import { games } from './registry.js';
import { gameUrl, hubUrl } from './router.js';
import { loadSettings, saveSettings } from '../shared/settings.js';
import { createSpeech } from '../shared/speech.js';
import bunny from '../assets/bunny.svg';
import apple from '../assets/apple.svg';
import banana from '../assets/banana.svg';
import orange from '../assets/orange.svg';
import train from './assets/train.svg';
import story from './assets/story.svg';
import day from './assets/day.svg';

const leaf = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M9 24C1 9 12 5 26 6c1 14-7 22-17 18Z" fill="currentColor"/><path d="M6 28 21 12" stroke="#236b55" stroke-width="2" stroke-linecap="round"/></svg>';
function artwork(theme) {
  if (theme !== 'market') return `<img class="hub-art-image" src="${theme === 'train' ? train : theme === 'day' ? day : story}" alt="" width="400" height="240">`;
  return `<div class="hub-market"><div class="hub-mini-sign">PASAR MINI</div><div class="hub-mini-awning"></div><div class="hub-mini-back"><img src="${bunny}" alt="" class="hub-shopkeeper"></div><div class="hub-mini-produce">${[apple, banana, orange].map(src => `<span><img src="${src}" alt=""></span>`).join('')}</div><div class="hub-mini-counter"><span>♡</span></div><div class="hub-mini-ground"></div></div>`;
}

export function mountHub(root) {
  const settings = loadSettings();
  const events = new AbortController();
  const speech = createSpeech(message => { root.querySelector('#hub-audio-status').textContent = message; });
  root.innerHTML = `<div class="hub-page"><a class="skip-link" href="#permainan">Langsung ke permainan</a>
    <header class="hub-header"><a class="hub-brand" href="${hubUrl}" aria-label="Beranda AnakHebat Games"><span class="hub-brand-mark">${leaf}</span><span>AnakHebat<small>MAIN & BELAJAR</small></span></a><div class="hub-header-actions"><a href="#untuk-orang-tua" class="hub-parent-link">Untuk orang tua <span aria-hidden="true">↗</span></a><button class="hub-sound" data-hub-action="sound" aria-pressed="${settings.sound}"><span aria-hidden="true">♫</span> <span class="hub-sound-label">Suara ${settings.sound ? 'nyala' : 'mati'}</span></button></div></header>
    <main><section class="hub-hero"><div class="hub-hero-copy"><p class="hub-eyebrow"><span></span> RUANG KECIL UNTUK RASA INGIN TAHU</p><h1>Hari ini,<br>mau <em>main apa?</em><span class="hub-title-spark" aria-hidden="true">✳</span></h1><p>Pilih petualanganmu. Coba, temukan,<br class="hub-desktop-break"> dan belajar dengan caramu sendiri.</p><button class="hub-listen" data-hub-action="listen"><span aria-hidden="true">♫</span> Dengarkan pilihan permainan <span aria-hidden="true">→</span></button></div><div class="hub-hero-art" aria-hidden="true"><span class="hub-sun">✳</span><span class="hub-cloud cloud-one"></span><span class="hub-cloud cloud-two"></span><div class="hub-hello">Halo, teman kecil! <span>♡</span></div><div class="hub-hill"></div><img src="${bunny}" alt="" class="hub-greeter"><span class="hub-hero-flower">✿</span><span class="hub-tiny-flower">✧</span><div class="hub-hero-note">Banyak cara untuk tumbuh.</div></div></section>
    <section class="hub-games" id="permainan" tabindex="-1" aria-labelledby="hub-games-title"><div class="hub-section-heading"><div><p class="hub-eyebrow">PETUALANGAN PILIHANMU</p><h2 id="hub-games-title">Satu ketukan, mulai bermain.</h2></div><span class="hub-availability"><i></i> ${games.filter(game => game.available).length} permainan siap dimainkan</span></div>
      <div class="hub-game-grid">${games.map((game, i) => `<article class="hub-game-card hub-card-${game.theme}" aria-labelledby="title-${game.id}"><div class="hub-card-art" aria-hidden="true"><span class="hub-art-spark">✦</span>${artwork(game.theme)}</div><div class="hub-card-body"><div class="hub-card-topline"><span class="hub-card-number">0${i + 1}</span><p class="hub-eyebrow">${game.eyebrow}</p><span class="hub-status ${game.available ? 'is-ready' : ''}">${game.available ? 'Bisa dimainkan' : 'Segera hadir'}</span></div><h3 id="title-${game.id}">${game.name}</h3><p class="hub-card-description">${game.description}</p><div class="hub-tags">${game.skills.map(skill => `<span>${skill}</span>`).join('')}</div>${game.available ? `<a class="hub-play" href="${gameUrl(game.id)}" aria-label="Main ${game.name}">Ayo main <span aria-hidden="true">→</span></a><p class="hub-card-footnote">Mulai mudah · ${game.sessionLabel} · usia 3–7</p>` : `<div class="hub-coming"><span aria-hidden="true">✧</span> Petualangan baru sedang disiapkan</div><details class="hub-game-detail"><summary>Intip cara bermainnya</summary><p>${game.detail}</p></details>`}</div></article>`).join('')}</div>
    </section><aside class="hub-kind-note"><span aria-hidden="true">♡</span><p><strong>Tidak perlu cepat. Tidak harus langsung bisa.</strong><br>Di sini, mencoba lagi adalah bagian dari bermain.</p><span class="hub-kind-flower" aria-hidden="true">✿</span></aside>
    <section class="hub-parent" id="untuk-orang-tua" aria-labelledby="hub-parent-title"><div><p class="hub-eyebrow">UNTUK AYAH, IBU & PENDAMPING</p><h2 id="hub-parent-title">Momen kecil,<br>lebih berarti bersama.</h2></div><div><p>Duduk di dekat anak, beri ruang untuk memilih, dan dengarkan ceritanya. Setelah bermain, bawa petualangannya ke dunia nyata.</p><details><summary>Tips menemani anak bermain <span aria-hidden="true">+</span></summary><ul><li>Biarkan anak mencoba. Beri bantuan saat ia membutuhkannya.</li><li>Mulai dari mudah dan berhenti saat anak ingin beristirahat.</li><li>Lanjutkan dengan main toko-tokoan atau bercerita bersama.</li></ul><p>Permainan ini bukan tes atau penilaian perkembangan anak. Progres sesi belum disimpan atau tersinkron antarperangkat.</p></details></div></section></main>
    <p class="hub-audio-status" id="hub-audio-status" role="status"></p><footer class="hub-footer"><span>AnakHebat <span aria-hidden="true">·</span> Langkah kecil, tumbuh bersama.</span><span>Dibuat untuk bermain, bukan berlomba.</span></footer></div>`;
  const syncSound = () => { const button = root.querySelector('[data-hub-action="sound"]'); button.setAttribute('aria-pressed', String(settings.sound)); button.querySelector('.hub-sound-label').textContent = `Suara ${settings.sound ? 'nyala' : 'mati'}`; saveSettings(settings); };
  root.addEventListener('click', event => {
    const action = event.target.closest('[data-hub-action]')?.dataset.hubAction;
    if (action === 'sound') {
      settings.sound = !settings.sound; syncSound();
      if (settings.sound) speech.say('Halo, teman kecil! Yuk, pilih permainanmu.');
      else { speech.stop(); root.querySelector('#hub-audio-status').textContent = ''; }
    }
    if (action === 'listen') {
      settings.sound = true; syncSound();
      speech.say('Mau main apa hari ini? Pasar Mini, Kereta Pola, Susun Ceritaku, dan Sehari bersama Kiki sudah bisa dimainkan. Mau menyiapkan belanjaan, melengkapi pola, menyusun cerita, atau belajar bahasa Inggris bersama Kiki?');
    }
  }, { signal: events.signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) speech.stop(); }, { signal: events.signal });
  window.addEventListener('pagehide', () => speech.stop(), { signal: events.signal });
  return () => { speech.stop(); events.abort(); };
}
