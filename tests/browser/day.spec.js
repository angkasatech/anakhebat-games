import { test,expect } from '@playwright/test';
import { activities, words, letterGroups } from '../../src/games/sehari-kiki/data.js';
const path='/member/games/sehari-kiki/';
async function layout(page){await page.evaluate(()=>document.fonts.ready);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect.poll(()=>page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0))).toBe(true);}
async function target(page){return page.locator('.day-prompt-picture>span').textContent();}
async function playAll(page,count){for(let i=0;i<count;i++){await page.getByRole('button',{name:`Pilih ${await target(page)}`,exact:true}).click();await expect(page.locator('#day-feedback')).toContainText('Terima kasih');await page.getByRole('button',{name:i===count-1?'Selesai':'Lanjut',exact:false}).click();}await expect(page.getByRole('heading',{name:/Terima kasih/})).toBeVisible();}
for(const activity of activities)test(`day ${activity.id}: learn words, retry, sentences, conversation and next activity`,async({page})=>{
  await page.setViewportSize({width:390,height:844});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(path);
  await page.locator(`[data-day="activity"][data-id="${activity.id}"]`).click();await expect(page.locator('.day-word')).toHaveCount(5);await layout(page);
  await page.getByRole('button',{name:'Ayo cari katanya'}).click();await expect(page.locator('.day-choice')).toHaveCount(2);
  const answer=await target(page);await page.locator('.day-choice').filter({hasNot:page.getByText(answer,{exact:true})}).click();
  await expect(page.locator('#day-feedback')).toContainText('Kamu memilih');await expect(page.locator('.day-progress .current')).toHaveText('1');
  await playAll(page,5);await expect(page.locator('.day-dialogue article')).toHaveCount(2);
  await page.getByRole('button',{name:'Yuk, coba kalimat'}).click();await expect(page.locator('.day-choice')).toHaveCount(3);await layout(page);
  await playAll(page,3);await expect(page.getByText(activity.home,{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Kegiatan berikutnya'}).click();await expect(page.locator('.day-heading .day-eyebrow')).not.toContainText(activity.title);
  await page.getByRole('button',{name:'Pilih kegiatan',exact:false}).click();await expect(page.locator('.day-activity')).toHaveCount(10);expect(errors).toEqual([]);
});
for(const width of [320,1280])test(`day screens and hijaiyah at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});await page.goto(path);await layout(page);await page.screenshot({path:`test-results/day-map-${width}.png`,fullPage:true});
  expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('noto-naskh')))).toBe(false);
  await page.getByRole('button',{name:'Mulai dari pagi'}).click();await layout(page);await page.screenshot({path:`test-results/day-learn-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Ayo cari katanya'}).click();await layout(page);await page.screenshot({path:`test-results/day-play-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Mulai ulang'}).click();await expect(page.locator('.day-progress .current')).toHaveText('1');
  await playAll(page,5);await layout(page);await page.screenshot({path:`test-results/day-finish-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Main lagi',exact:false}).click();await expect(page.locator('.day-progress .current')).toHaveText('1');
  await page.getByRole('button',{name:'Pilih kegiatan',exact:false}).click();await page.locator('[data-day="activity"][data-id="iqra"]').click();
  await page.getByRole('button',{name:'Lihat huruf'}).click();await layout(page);await expect(page.locator('.day-letter-cards article')).toHaveCount(4);
  expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('noto-naskh')))).toBe(true);
  await page.screenshot({path:`test-results/day-letters-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'Cari huruf yang sama'}).click();await layout(page);await page.screenshot({path:`test-results/day-letter-play-${width}.png`,fullPage:true});
  await page.getByRole('link',{name:'Semua permainan',exact:false}).click();await expect(page.getByRole('link',{name:'Main Sehari bersama Kiki'})).toBeVisible();
});
test('all seven hijaiyah groups, retry and completion; no speech attempted for letters',async({page})=>{
  await page.addInitScript(()=>{window.spoken=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'en-GB',name:'English'}],speak:u=>window.spoken.push(u.text),cancel:()=>{}}});});
  await page.goto(path);await page.locator('[data-day="activity"][data-id="iqra"]').click();await page.getByRole('button',{name:'Lihat huruf'}).click();
  for(let group=0;group<7;group++){
    await page.getByRole('button',{name:`Kelompok ${group+1}`,exact:true}).click();await expect(page.locator('.day-letter-cards .day-glyph')).toHaveText(letterGroups[group].map(l=>l.glyph));
    await page.getByRole('button',{name:'Cari huruf yang sama'}).click();
    for(let i=0;i<4;i++){const name=await page.locator('.day-letter-target strong').textContent();if(i===0){await page.locator('.day-choice').filter({hasNot:page.getByText(name,{exact:true})}).click();await expect(page.locator('#day-feedback')).toContainText('bentuk dan titiknya');}await page.getByRole('button',{name:`Pilih ${name}`,exact:true}).click();await page.getByRole('button',{name:i===3?'Selesai':'Lanjut',exact:false}).click();}
    await expect(page.getByRole('heading',{name:/Terima kasih/})).toBeVisible();await page.getByRole('button',{name:'Kelompok berikutnya'}).click();
  }expect(await page.evaluate(()=>window.spoken)).toEqual([]);
});
test('English voice is selected instead of Indonesian; replay, mute and leaving cancel it',async({page})=>{
  await page.addInitScript(()=>{window.spoken=[];window.cancels=0;window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'id-ID',name:'Indonesia'},{lang:'en-GB',name:'English'}],speak:u=>window.spoken.push({text:u.text,lang:u.lang,voice:u.voice.lang}),cancel:()=>window.cancels++}});});
  await page.goto(path);await page.getByRole('button',{name:'Mulai dari pagi'}).click();await page.getByRole('button',{name:'Dengarkan Pillow',exact:true}).click();
  expect(await page.evaluate(()=>window.spoken.at(-1))).toEqual({text:'Pillow',lang:'en-GB',voice:'en-GB'});
  await page.getByRole('button',{name:'Coba kalimat',exact:true}).click();await expect(page.locator('.day-prompt-picture')).toBeHidden();
  await page.getByRole('button',{name:'Lihat bantuan'}).click();await expect(page.locator('.day-prompt-picture')).toBeVisible();
  const english=await page.locator('.day-request h2').textContent();await page.getByRole('button',{name:'Dengarkan lagi'}).click();expect(await page.evaluate(()=>window.spoken.at(-1).text)).toBe(english);
  await page.getByRole('button',{name:'Suara nyala',exact:false}).click();const n=await page.evaluate(()=>window.spoken.length);await page.getByRole('button',{name:'Mulai ulang'}).click();expect(await page.evaluate(()=>window.spoken.length)).toBe(n);
  const before=await page.evaluate(()=>window.cancels);await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));expect(await page.evaluate(()=>window.cancels)).toBeGreaterThan(before);
});
test('no English voice: visual fallback, blocked storage, keyboard and reduced motion',async({page})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}});window.spoken=[];window.SpeechSynthesisUtterance=class{};Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'id-ID',name:'Indonesia'}],speak:u=>window.spoken.push(u),cancel:()=>{}}});});
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(path);await page.getByRole('button',{name:'Mulai dari pagi'}).focus();await page.keyboard.press('Enter');
  await page.getByRole('button',{name:'Dengarkan sapaan'}).click();await expect(page.locator('#day-audio')).toContainText('Bahasa Inggris belum tersedia');
  await page.getByRole('button',{name:'Coba kalimat',exact:true}).click();await expect(page.locator('.day-prompt-picture')).toBeVisible();
  await page.getByRole('button',{name:`Pilih ${await target(page)}`,exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('#day-feedback')).toContainText('Terima kasih');
  expect(await page.evaluate(()=>window.spoken)).toEqual([]);
});
