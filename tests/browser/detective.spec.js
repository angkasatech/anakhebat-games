import {test,expect} from '@playwright/test';
const path='/member/games/detektif-suara/';
for(const [level,width] of [['calm',320],['explore',390],['challenge',1280]])test(`detective full five missions ${level} ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(path);
 await page.locator(`[data-act="level"][data-id="${level}"]`).click();await page.getByLabel('Main dengan gambar').check();await page.getByRole('button',{name:'Mulai petualangan'}).click();
 for(let i=0;i<5;i++){
  await expect(page.locator('.ds-progress')).toHaveAttribute('aria-label',`Misi ${i+1} dari 5`);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('.ds-choice:not(.ds-hinted)').first().click();await expect(page.locator('#ds-feedback')).toContainText('Yuk dengarkan');
  while(await page.locator('.ds-hinted:not(:disabled)').count())await page.locator('.ds-hinted:not(:disabled)').first().click();
  await page.getByRole('button',{name:i===4?'Buka Peta Bunyi':'Ke misi berikutnya'}).click();
 }
 await expect(page.getByRole('heading',{name:'Peta Bunyi Hari Ini'})).toBeVisible();await expect(page.getByText('Kamu sudah menyelesaikan 5 misi.',{exact:false})).toBeVisible();
 await page.screenshot({path:`test-results/detective-finish-${width}.png`,fullPage:true});await page.getByRole('button',{name:'Main Lagi',exact:true}).click();await expect(page.locator('.ds-progress')).toHaveAttribute('aria-label','Misi 1 dari 5');
 await page.getByText('Ubah tingkat atau pilih misi').click();await page.locator('[data-act="level"][data-id="calm"]').click();await page.getByRole('button',{name:'Istirahat & lihat peta'}).click();await expect(page.getByText('Kamu sudah menyelesaikan 0 misi.',{exact:false})).toBeVisible();expect(errors).toEqual([]);
});
test('detective audio silent on entry, Indonesian word replay, stop on exit; help after two attempts',async({page})=>{
 await page.addInitScript(()=>{window.spoken=[];window.cancelled=0;window.SpeechSynthesisUtterance=class{constructor(t){this.text=t}};Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>[{lang:'id-ID'}],speak:u=>window.spoken.push(u.text),cancel:()=>window.cancelled++}});});
 await page.goto(path);expect(await page.evaluate(()=>spoken.length)).toBe(0);await page.getByRole('button',{name:'Mulai petualangan'}).click();await page.getByText('Ubah tingkat atau pilih misi').click();await page.locator('[data-act=mission][data-id="1"]').click();await page.getByRole('button',{name:'Ulangi suara'}).click();expect(await page.evaluate(()=>spoken.length)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Bantu aku'}).click();await page.screenshot({path:'test-results/detective-play.png',fullPage:true});await page.locator('.ds-choice:not(.ds-hinted)').first().click();await page.locator('.ds-choice:not(.ds-hinted)').first().click();await expect(page.locator('.ds-hinted')).toHaveCount(1);
 await page.getByRole('button',{name:'Istirahat & lihat peta'}).click();expect(await page.evaluate(()=>cancelled)).toBeGreaterThan(0);
});
test('detective tablet keyboard and lazy hub',async({page})=>{
 await page.setViewportSize({width:768,height:1024});await page.goto('/');await page.waitForLoadState('networkidle');expect(await page.evaluate(()=>performance.getEntriesByType('resource').some(r=>r.name.includes('/detektif-suara/assets/')))).toBe(false);
 await page.goto(path);await page.waitForLoadState('networkidle');await page.screenshot({path:'test-results/detective-start-tablet.png',fullPage:true});
 await page.getByRole('button',{name:'Mulai petualangan'}).focus();await page.keyboard.press('Enter');await expect(page.locator('.ds-board')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Bantu aku'}).focus();await page.keyboard.press('Enter');await expect(page.locator('.ds-hinted')).toBeVisible();
});
