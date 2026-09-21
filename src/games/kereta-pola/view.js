import { themes, makeRounds } from './data.js';
import { name, patternText, hintText, choiceFeedback } from './feedback.js';
import { createSession, choose, arrive, nextRound } from './engine.js';
import { createSpeech } from '../../shared/speech.js';
import { loadSettings, saveSettings } from '../../shared/settings.js';
import engineImage from './assets/locomotive.svg';
import apple from '../../assets/apple.svg';
import banana from '../../assets/banana.svg';
import orange from '../../assets/orange.svg';
import pear from '../../assets/pear.svg';
import circle from './assets/circle.svg';
import triangle from './assets/triangle.svg';
import square from './assets/square.svg';
import star from './assets/star.svg';
const images = { apple, banana, orange, pear, circle, triangle, square, star };
const picture = id => `<img src="${images[id]}" alt="${name(id)}" draggable="false">`;

export function mountTrain(root, { hubUrl = '/member/games/' } = {}) {
  const settings = loadSettings(), events = new AbortController();
  let screen = 'start', theme = 'fruit', session, feedback = '', audioNotice = '', guiding = false, step = -1;
  let guideToken = 0, guideTimer, journeyTimer;
  const speech = createSpeech(message => { audioNotice = message; const status = root.querySelector('#rail-audio'); if (status) status.textContent = message; });
  const say = text => { if (settings.sound) speech.say(text); };
  const round = () => session.rounds[session.index];
  function stopGuide() { guideToken++; clearTimeout(guideTimer); speech.stop(); guiding = false; step = -1; }
  function stopAll() { stopGuide(); clearTimeout(journeyTimer); }
  function highlight(index) {
    step = index;
    root.querySelectorAll('[data-slot]').forEach((el, i) => {
      el.classList.toggle('rail-highlight', i === index);
      if (i === index) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
    });
  }
  function guide(readFeedback = false) {
    if (session.status !== 'playing') return;
    stopGuide(); guiding = true;
    const token = guideToken, current = round();
    render();
    function narrate(text, next) {
      if (token !== guideToken) return;
      let finished = false;
      const done = () => { if (finished || token !== guideToken) return; finished = true; clearTimeout(guideTimer); next(); };
      const spoken = settings.sound && speech.say(text, { onEnd: done });
      // Devices without voice still get paced visual help. A watchdog covers broken speech engines.
      if (!finished) guideTimer = setTimeout(done, spoken ? 7000 : 900);
    }
    function show(index) {
      if (token !== guideToken) return;
      highlight(index);
      const status = root.querySelector('#rail-guide-status');
      if (status) status.textContent = index < 3 ? `Gerbong ${index + 1}: ${name(current.sequence[index])}.` : hintText(current);
      narrate(index < 3 ? name(current.sequence[index]) : hintText(current), () => {
        if (index < 3) show(index + 1);
        else { guiding = false; highlight(-1); const button = root.querySelector('[data-train="help"]'); if (button) { button.textContent = '◉ Lihat polanya'; button.setAttribute('aria-pressed', 'false'); } }
      });
    }
    if (readFeedback) narrate(feedback, () => show(0)); else show(0);
  }

  function train(sequence, selected = null, status = 'playing', demo = false) {
    return `<div class="rail-track-window"><div class="rail-train ${status === 'departing' ? 'rail-departing' : ''}"><div class="rail-wagons">${sequence.map((id, i) => `<div class="rail-wagon ${i === 3 ? 'rail-last' : ''} ${step === i && !demo ? 'rail-highlight' : ''}" ${!demo ? `data-slot="${i}"` : ''}><span class="rail-slot-number" aria-hidden="true">${i + 1}</span><div class="rail-cargo">${id || selected && i === 3 ? picture(id || selected) : '<span class="rail-question" aria-label="Gerbong kosong">?</span>'}</div><div class="rail-car-body"><span>${i === 3 && selected ? (status !== 'playing' ? '✓' : 'Pilihanmu') : i === 3 ? 'Isi di sini' : '●'}</span></div><i class="rail-wheel left"></i><i class="rail-wheel right"></i></div>`).join('')}</div><div class="rail-engine"><span class="rail-smoke" aria-hidden="true">○</span><img src="${engineImage}" alt="Lokomotif menuju kanan"></div></div><div class="rail-tracks" aria-hidden="true"></div></div>`;
  }
  function startView() {
    const preview = themes[theme].preview;
    return `<main class="rail-start"><section class="rail-intro"><p class="rail-eyebrow">PETUALANGAN 02 · AMATI & LANJUTKAN</p><h1>Satu pola kecil,<br><em>perjalanan seru.</em></h1><p class="rail-lead">Bantu Kereta Pola berangkat!<br>Lihat muatannya, lalu pilih yang berikutnya.</p><fieldset><legend>Mau membawa apa?</legend><div class="rail-themes">${Object.entries(themes).map(([id, item]) => `<button class="rail-theme ${theme === id ? 'selected' : ''}" data-train="theme" data-value="${id}" aria-pressed="${theme === id}"><span class="rail-theme-pictures" aria-hidden="true">${item.preview.map(picture).join('')}</span><strong>${item.name}</strong><span>${theme === id ? '✓ Dipilih' : 'Pilih muatan'}</span></button>`).join('')}</div></fieldset><div class="rail-easy"><span aria-hidden="true">1</span><p><strong>Mulai dari pola sederhana</strong><small>Satu gerbong kosong · dua pilihan · dibantu gambar</small></p></div><button class="rail-primary" data-train="start">Mulai perjalanan <span aria-hidden="true">→</span></button><p class="rail-soft-note">Lima stasiun. Tidak perlu terburu-buru.</p></section>
    <section class="rail-start-scene" aria-label="Contoh kereta dengan pola bergantian"><div class="rail-scene-title"><span class="rail-station-icon" aria-hidden="true">⌂</span><span>SELAMAT DATANG DI<br><strong>Stasiun Pola</strong></span></div><div class="rail-scenery" aria-hidden="true"><span class="rail-sun">✳</span><span class="rail-cloud"></span><span class="rail-hill hill-back"></span><span class="rail-hill"></span><span class="rail-tree">♧</span></div>${train([preview[0], preview[1], preview[0], null], null, 'playing', true)}<p class="rail-demo-caption">${name(preview[0])} <span>→</span> ${name(preview[1])} <span>→</span> ${name(preview[0])} <span>→</span> <strong>apa, ya?</strong></p><div class="rail-ticket"><span>♡</span><p>Amati. Coba. Temukan.<small>Kita belajar sambil berjalan.</small></p></div></section>
    <section class="rail-how" aria-label="Cara bermain"><div><b>1</b><p><strong>Lihat dari kiri</strong><small>Amati muatan satu per satu.</small></p></div><div><b>2</b><p><strong>Pilih lanjutannya</strong><small>Ketuk gambar yang cocok.</small></p></div><div><b>3</b><p><strong>Yuk, berangkat!</strong><small>Kunjungi lima stasiun bersama.</small></p></div></section></main>`;
  }
  function playView() {
    const current = round(), locked = session.status !== 'playing';
    return `<main class="rail-play"><div class="rail-toolbar"><button class="rail-text-button" data-train="home">← Pilih muatan</button><div class="rail-progress" aria-label="Perjalanan ${session.index + 1} dari 5">${session.rounds.map((_, i) => `<span class="${i < session.index ? 'done' : i === session.index ? 'current' : ''}">${i < session.index ? '✓' : i + 1}</span>`).join('')}</div><button class="rail-text-button" data-train="restart">↻ Mulai ulang</button></div>
    <div class="rail-play-heading"><p class="rail-eyebrow">PERJALANAN ${session.index + 1} DARI 5 · POLA BERGANTIAN</p><h1>${locked ? (session.status === 'arrived' ? 'Sampai di stasiun!' : 'Yuk, berangkat!') : 'Apa muatan berikutnya?'}</h1><p>${locked ? 'Terima kasih sudah melengkapi polanya.' : 'Lihat dari kiri ke kanan, lalu isi gerbong kosong.'}</p></div>
    <section class="rail-play-scene" aria-label="Kereta dan urutan muatan"><div class="rail-destination"><span aria-hidden="true">⌂</span><p>TUJUAN KITA<strong>${current.station}</strong></p><span class="rail-direction" aria-hidden="true">→</span></div><div class="rail-scenery" aria-hidden="true"><span class="rail-sun">✳</span><span class="rail-cloud"></span><span class="rail-hill hill-back"></span><span class="rail-hill"></span></div>${train(current.sequence, session.selected, session.status)}<p class="rail-read-direction">Mulai di sini <span aria-hidden="true">→ → →</span></p>${session.status === 'arrived' ? `<div class="rail-arrival" role="status">✓ &nbsp; Tiba di ${current.station}</div>` : ''}</section>
    <section class="rail-answer-area" aria-label="Pilihan muatan"><div class="rail-question-row"><h2>${locked ? 'Pola lengkap. Kamu sudah mencoba!' : 'Pilih satu muatan'}</h2><button class="rail-small-button" data-train="help" aria-pressed="${guiding}" ${locked ? 'disabled' : ''}>${guiding ? '■ Hentikan bantuan' : '◉ Lihat polanya'}</button></div><div class="rail-choices">${current.choices.map(id => `<button class="rail-choice ${session.selected === id ? 'selected' : ''}" data-train="choose" data-value="${id}" aria-label="Pilih ${name(id)}" ${locked ? 'disabled' : ''}>${picture(id)}<strong>${name(id)}</strong><span aria-hidden="true">${session.selected === id ? (locked ? '✓' : 'Dipilih') : '+'}</span></button>`).join('')}</div><p class="rail-guide-status" id="rail-guide-status" role="status">${guiding ? 'Kita lihat muatannya satu per satu, ya.' : 'Polanya bergantian. Kamu boleh mencoba lagi.'}</p></section>
    <div class="rail-feedback-area"><p class="rail-feedback" id="rail-feedback" role="status">${feedback || 'Ketuk pilihanmu untuk mengisi gerbong terakhir.'}</p>${session.status === 'arrived' ? `<button class="rail-primary" data-train="next">${session.index === 4 ? 'Selesai' : 'Stasiun berikutnya'} <span aria-hidden="true">→</span></button>` : session.status === 'departing' ? '<span class="rail-travel-note" role="status">Kereta sedang menuju stasiun…</span>' : '<button class="rail-small-button" data-train="listen">♫ Dengarkan pola</button>'}</div></main>`;
  }
  function finishView() {
    return `<main class="rail-finish"><p class="rail-eyebrow">LIMA STASIUN, BANYAK PENEMUAN</p><div class="rail-finish-art"><span aria-hidden="true">✦</span><img src="${engineImage}" alt="Kereta tiba di tujuan"><span aria-hidden="true">✦</span></div><h1>Perjalanan selesai,<br><em>penjelajah kecil!</em></h1><p>Kamu sudah mengamati dan mencoba<br>melengkapi pola di lima perjalanan.</p><div class="rail-finish-stations" aria-label="Lima stasiun dikunjungi">${session.rounds.map(r => `<span>✓ <small>${r.station}</small></span>`).join('')}</div><button class="rail-primary" data-train="start">Main lagi <span aria-hidden="true">↻</span></button><button class="rail-text-button" data-train="home">← Pilih muatan lain</button><aside class="rail-home-activity"><span aria-hidden="true">⌂</span><p><strong>Cari pola di rumah, yuk!</strong><br>Bersama orang tua, susun sendok–gelas–sendok–gelas. Lalu bergantian memilih benda berikutnya.</p></aside><small>Permainan ini bukan penilaian perkembangan anak.</small></main>`;
  }
  function render(focus = false) {
    const active = document.activeElement, action = active?.dataset.train, value = active?.dataset.value;
    root.innerHTML = `<div class="rail-page"><header class="rail-header"><a class="rail-brand" href="${hubUrl}"><span aria-hidden="true">❧</span>AnakHebat<small>Main & Belajar</small></a><button class="rail-sound" data-train="sound" aria-pressed="${settings.sound}">♫ Suara ${settings.sound ? 'nyala' : 'mati'}</button></header><nav class="rail-breadcrumb" aria-label="Navigasi permainan"><a href="${hubUrl}">← Semua permainan</a><span>Kereta Pola</span></nav>${screen === 'start' ? startView() : screen === 'play' ? playView() : finishView()}<p id="rail-audio" class="rail-audio" role="status">${audioNotice}</p><footer class="rail-footer"><span>Langkah kecil, tumbuh bersama.</span><span>Suara tersimpan di browser ini. Progres sesi belum disimpan atau tersinkron.</span></footer></div>`;
    if (focus) { const heading = root.querySelector('main h1'); heading.tabIndex = -1; heading.focus(); }
    else if (action) [...root.querySelectorAll('[data-train]')].find(el => el.dataset.train === action && el.dataset.value === value)?.focus({ preventScroll: true });
  }
  function begin() { stopAll(); session = createSession(makeRounds(theme)); screen = 'play'; feedback = ''; render(true); say(`Lihat pola ini. ${patternText(round())}`); }
  function finishJourney() { session = arrive(session); render(); root.querySelector('[data-train="next"]')?.focus({ preventScroll: true }); }
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-train]'); if (!button || button.disabled) return;
    const { train: action, value } = button.dataset;
    if (action === 'sound') {
      settings.sound = !settings.sound; saveSettings(settings); stopGuide();
      if (!settings.sound) audioNotice = ''; else say(screen === 'play' ? patternText(round()) : 'Selamat datang di Kereta Pola. Yuk, amati dan lanjutkan polanya.');
      render(); return;
    }
    if (action === 'home') { stopAll(); screen = 'start'; feedback = ''; render(true); return; }
    if (action === 'theme' && themes[value]) { stopGuide(); theme = value; render(); say(themes[theme].name); return; }
    if (action === 'start' || action === 'restart') { begin(); return; }
    if (screen !== 'play') return;
    if (action === 'help') { if (guiding) { stopGuide(); render(); } else guide(); return; }
    if (action === 'listen') { settings.sound = true; saveSettings(settings); guide(); return; }
    if (action === 'choose' && session.status === 'playing') {
      stopGuide(); const previous = session; session = choose(session, value); if (session === previous) return;
      feedback = choiceFeedback(round(), value);
      if (session.status === 'departing') {
        render(); say(feedback);
        journeyTimer = setTimeout(finishJourney, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900);
      } else { render(); guide(true); }
      return;
    }
    if (action === 'next' && session.status === 'arrived') {
      stopAll(); session = nextRound(session); feedback = '';
      if (session.status === 'finished') { screen = 'finish'; say('Lima stasiun sudah dikunjungi. Terima kasih sudah mencoba dan mengamati bersama!'); }
      else say(patternText(round()));
      render(true);
    }
  }, { signal: events.signal });
  const pause = () => { stopGuide(); if (screen === 'play' && session.status === 'departing') { clearTimeout(journeyTimer); session = arrive(session); } render(); };
  window.addEventListener('pagehide', pause, { signal: events.signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); }, { signal: events.signal });
  render();
  return () => { stopAll(); events.abort(); };
}
