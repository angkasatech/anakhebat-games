import { stories, getStory } from './data.js';
import { createSession, addCard, removeCard, completeStory, nextHint } from './engine.js';
import { hintText, resultText } from './feedback.js';
import { createSpeech } from '../../shared/speech.js';
import { loadSettings, saveSettings } from '../../shared/settings.js';
const pictures = import.meta.glob('./assets/*.svg', { eager: true, query: '?url', import: 'default' });
const picture = card => `<img src="${pictures[`./assets/${card.id}.svg`]}" alt="${card.label}" width="240" height="200" draggable="false">`;
const positions = ['Pertama', 'Lalu', 'Terakhir'];

export function mountStory(root, { hubUrl = '/member/games/' } = {}) {
  const settings = loadSettings(), events = new AbortController();
  let screen = 'start', story = stories[0], session, feedback = '', notice = '', suggested = '', reading = false;
  let narrationToken = 0, timer;
  const speech = createSpeech(message => { notice = message; const el = root.querySelector('#story-audio'); if (el) el.textContent = message; });
  const say = message => { if (settings.sound) speech.say(message); };
  function stopReading() {
    narrationToken++; clearTimeout(timer); speech.stop(); reading = false;
    root.querySelectorAll('.story-reading').forEach(el => { el.classList.remove('story-reading'); el.removeAttribute('aria-current'); });
    const button = root.querySelector('[data-story-action="read"]');
    if (button) { button.textContent = '♫ Dengarkan cerita'; button.setAttribute('aria-pressed', 'false'); }
  }
  function readStory() {
    stopReading(); settings.sound = true; saveSettings(settings); syncSound();
    if (!speech.available()) { speech.say(story.cards[0].sentence); return; }
    reading = true; const token = narrationToken;
    const button = root.querySelector('[data-story-action="read"]');
    button.textContent = '■ Hentikan cerita'; button.setAttribute('aria-pressed', 'true');
    function readAt(index) {
      if (token !== narrationToken || !reading) return;
      root.querySelectorAll('[data-story-scene]').forEach((el, i) => {
        el.classList.toggle('story-reading', i === index);
        if (i === index) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
      });
      if (index === story.cards.length) { stopReading(); return; }
      let advanced = false;
      const advance = () => { if (advanced || token !== narrationToken) return; advanced = true; clearTimeout(timer); readAt(index + 1); };
      // End callbacks drive highlighting. A silent/broken browser voice must not leave a stuck playback state.
      timer = setTimeout(() => { if (token === narrationToken) { stopReading(); notice = 'Suara terhenti. Yuk, baca ceritanya bersama.'; root.querySelector('#story-audio').textContent = notice; } }, 15000);
      if (!speech.say(story.cards[index].sentence, { onEnd: advance })) stopReading();
    }
    readAt(0);
  }
  function syncSound() {
    const button = root.querySelector('[data-story-action="sound"]');
    button.textContent = `♫ Suara ${settings.sound ? 'nyala' : 'mati'}`; button.setAttribute('aria-pressed', String(settings.sound));
  }
  function start() { stopReading(); session = createSession(story); screen = 'play'; feedback = 'Ketuk gambar yang terjadi lebih dulu.'; suggested = ''; notice = ''; render('h1'); say(feedback); }
  function header() { return `<header class="story-header"><a class="story-brand" href="${hubUrl}"><span aria-hidden="true">❧</span> AnakHebat</a><button class="story-quiet" data-story-action="sound" aria-pressed="${settings.sound}">♫ Suara ${settings.sound ? 'nyala' : 'mati'}</button></header><nav class="story-nav"><a href="${hubUrl}">← Semua permainan</a><span>Susun Ceritaku</span></nav>`; }
  function intro() { return `<section class="story-intro"><div class="story-intro-copy"><p class="story-eyebrow">PETUALANGAN 03 · SUSUN & CERITAKAN</p><h1>Tiga gambar,<br><em>cerita darimu.</em></h1><p class="story-lead">Mana yang terjadi lebih dulu?<br>Ketuk gambarnya, lalu ceritakan!</p><h2 class="story-small-title">Mau cerita tentang apa?</h2><div class="story-themes">${stories.map(item => `<button class="story-theme" data-story-action="theme" data-id="${item.id}" aria-pressed="${story.id === item.id}">${picture(item.cards[item.coverIndex ?? 2])}<span>${item.title}</span><small>${story.id === item.id ? '✓ Dipilih' : 'Pilih cerita'}</small></button>`).join('')}</div><div class="story-easy"><b>1</b><span>Mulai dari tiga gambar<small>Ketuk untuk menyusun · boleh mencoba lagi</small></span></div><button class="story-primary" data-story-action="start">Mulai bercerita <span aria-hidden="true">→</span></button></div><div class="story-cover"><span class="story-cover-tag">BUKU CERITA KECILKU</span><div class="story-cover-art">${picture(story.cards[story.coverIndex ?? 2])}<span aria-hidden="true">✧</span></div><h2>${story.title}</h2><p>${story.subtitle}</p><div class="story-cover-dots" aria-hidden="true">● · ● · ●</div></div></section><ol class="story-how"><li><b>1</b><span>Lihat gambarnya<small>Amati tiga kejadian.</small></span></li><li><b>2</b><span>Susun dengan ketukan<small>Pilih yang pertama, lalu berikutnya.</small></span></li><li><b>3</b><span>Ceritakan versimu<small>Ayah dan Ibu boleh mendengarkan.</small></span></li></ol>`; }
  function play() { return `<div class="story-toolbar"><button data-story-action="home">← Pilih cerita</button><span>Mulai mudah · 3 gambar</span><button data-story-action="restart">↻ Mulai ulang</button></div><section class="story-play"><div class="story-heading"><p class="story-eyebrow">${story.title}</p><h1>Apa yang terjadi dulu?</h1><p>Isi dari kiri ke kanan, satu gambar setiap kali.</p></div><section class="story-board" aria-label="Urutan ceritamu"><div class="story-board-top"><h2>Ceritamu</h2><span>${session.selected.length} dari 3 gambar</span></div><ol class="story-slots">${positions.map((label, i) => { const card = story.cards.find(c => c.id === session.selected[i]); return `<li><span class="story-position"><b>${i + 1}</b> ${label}</span>${card ? `<button class="story-slot filled" data-story-action="remove" data-id="${card.id}" aria-label="Keluarkan ${card.label}, kartu ${i + 1}">${picture(card)}<span>${card.label}</span><i aria-hidden="true">−</i></button>` : `<div class="story-slot empty"><span aria-hidden="true">${i === session.selected.length ? '＋' : '···'}</span><small>${i === session.selected.length ? 'Pilih gambar' : 'Berikutnya'}</small></div>`}</li>`; }).join('')}</ol><p class="story-board-note">Ketuk kartu di atas untuk mengubah pilihan.</p></section><div class="story-choice-heading"><h2>Pilih gambarnya</h2><button class="story-quiet" data-story-action="hint">✧ Bantu aku</button></div><div class="story-choices">${session.choices.map(id => { const card = story.cards.find(c => c.id === id), selected = session.selected.includes(id); return `<button class="story-choice ${suggested === id ? 'story-suggested' : ''}" data-story-action="add" data-id="${id}" aria-label="Pilih ${card.label}" ${selected ? 'disabled' : ''}>${picture(card)}<span>${card.label}</span><small>${selected ? '✓ Di ceritamu' : suggested === id ? '✧ Lihat gambar ini' : '＋ Pilih'}</small></button>`; }).join('')}</div><p class="story-feedback" id="story-feedback" role="status">${feedback}</p><div class="story-play-actions"><button class="story-quiet" data-story-action="listen">♫ Dengarkan petunjuk</button><button class="story-primary" data-story-action="check">Ceritaku siap <span aria-hidden="true">✓</span></button></div></section>`; }
  function finish() { return `<section class="story-finish"><div class="story-heading"><p class="story-eyebrow">TIGA GAMBAR, SATU CERITA</p><span class="story-finish-spark" aria-hidden="true">✧</span><h1>Terima kasih,<br><em>pencerita kecil!</em></h1><p>Kamu sudah mencoba dan menyusun ceritamu.</p></div><article class="story-book"><div class="story-book-title"><h2>${story.title}</h2><button class="story-quiet" data-story-action="read" aria-pressed="false">♫ Dengarkan cerita</button></div><ol class="story-scenes">${story.cards.map((card, i) => `<li data-story-scene="${i}"><span class="story-position"><b>${i + 1}</b> ${positions[i]}</span>${picture(card)}<h3>${card.label}</h3><p>${card.sentence}</p></li>`).join('')}</ol></article><aside class="story-your-turn"><span aria-hidden="true">♡</span><div><h2>Sekarang, ceritakan dengan versimu!</h2><p>${story.prompt}</p><small>Ayah atau Ibu bisa mendengarkan. Tidak perlu merekam.</small></div></aside><div class="story-finish-actions"><button class="story-primary" data-story-action="restart">Susun lagi <span aria-hidden="true">↻</span></button><button class="story-secondary" data-story-action="next">Cerita berikutnya →</button><button class="story-text-button" data-story-action="home">← Pilih cerita lain</button></div><p class="story-parent-note">Boleh menambahkan tokoh atau akhir cerita yang berbeda.<br>Permainan ini bukan penilaian perkembangan anak.</p></section>`; }
  function render(focus) {
    root.innerHTML = `<div class="story-page">${header()}<main>${screen === 'start' ? intro() : screen === 'play' ? play() : finish()}</main><p id="story-audio" class="story-audio" role="status">${notice}</p><footer class="story-footer"><span>Langkah kecil, tumbuh bersama.</span><span>Suara tersimpan di browser ini. Progres belum disimpan atau tersinkron.</span></footer></div>`;
    if (focus) { const el = root.querySelector(focus); if (el) { if (el.tagName === 'H1') el.tabIndex = -1; el.focus({ preventScroll: true }); } }
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-story-action]'); if (!button || button.disabled) return;
    const action = button.dataset.storyAction, id = button.dataset.id;
    if (action === 'sound') { stopReading(); settings.sound = !settings.sound; saveSettings(settings); syncSound(); if (settings.sound) speech.say('Yuk, susun gambar dan ceritakan!'); else { notice = ''; root.querySelector('#story-audio').textContent = ''; } return; }
    if (action === 'theme') { stopReading(); story = getStory(id); notice = ''; render(`[data-id="${id}"]`); say(story.title); }
    if (action === 'start' || action === 'restart') start();
    if (action === 'home') { stopReading(); screen = 'start'; notice = ''; render('h1'); }
    if (action === 'next') { story = stories[(stories.indexOf(story) + 1) % stories.length]; start(); }
    if (action === 'read') { if (reading) stopReading(); else readStory(); }
    if (screen !== 'play') return;
    if (action === 'add' && addCard(session, id)) {
      stopReading(); suggested = ''; const card = story.cards.find(c => c.id === id);
      feedback = `${card.label} menjadi kartu ${session.selected.length}. ${session.selected.length === 3 ? 'Yuk, lihat cerita kita!' : 'Pilih kejadian berikutnya.'}`;
      render(session.selected.length === 3 ? '[data-story-action="check"]' : '.story-choice:not(:disabled)'); say(feedback);
    }
    if (action === 'remove' && removeCard(session, id)) { stopReading(); suggested = ''; feedback = 'Kartunya kembali. Yuk, ubah urutannya.'; render(`[data-story-action="add"][data-id="${id}"]`); say(feedback); }
    if (action === 'hint') { stopReading(); const index = nextHint(session); suggested = story.cards[index]?.id || ''; feedback = hintText(story, index); render('[data-story-action="hint"]'); say(feedback); }
    if (action === 'listen') { stopReading(); settings.sound = true; saveSettings(settings); syncSound(); speech.say(feedback); }
    if (action === 'check') {
      stopReading(); const result = completeStory(session); feedback = resultText(story, result);
      if (result.kind === 'correct') { screen = 'finish'; render('h1'); if (settings.sound) readStory(); }
      else { suggested = result.expected || ''; render('[data-story-action="check"]'); say(feedback); }
    }
  }, { signal: events.signal });
  window.addEventListener('pagehide', stopReading, { signal: events.signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopReading(); }, { signal: events.signal });
  render();
  return () => { stopReading(); events.abort(); };
}
