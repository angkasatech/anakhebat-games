// Run after npm run build and local Wrangler with the documented test-only binding.
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const origin='http://127.0.0.1:4181';
const secret='test-only-secret-not-for-deployment-123456';
function headers(url, method='GET') {
  const u=new URL(url), timestamp=String(Math.floor(Date.now()/1000));
  return {'X-AH-Games-Timestamp':timestamp,'X-AH-Games-Signature':createHmac('sha256',secret).update(['v1',timestamp,method,u.origin,u.pathname+u.search].join('\n')).digest('hex')};
}
const files=(await readdir('dist/member/games',{recursive:true,withFileTypes:true})).filter(e=>e.isFile()).map(e=>`${e.parentPath}/${e.name}`.replaceAll('\\','/').replace(/^dist/,''));
for(const path of ['/', '/assets/missing.js', '/_worker.js', ...files]) {
  const r=await fetch(origin+path); assert.ok([401,403].includes(r.status),path);
  assert.equal(r.headers.get('cache-control'),'private, no-store');
}
for(const path of files.filter(p=>!p.endsWith('index.html'))) {
  const url=origin+path,r=await fetch(url,{headers:headers(url)});
  assert.equal(r.status,200,path);assert.equal(r.headers.get('cache-control'),'private, no-store');
}
const browser=await chromium.launch();
try {
  for(const width of [320,1280]) {
    const context=await browser.newContext({viewport:{width,height:900}});
    const errors=[];
    await context.route('**/*',async route=>{
      const request=route.request(),url=new URL(request.url());
      assert.equal(url.origin,origin);assert.ok(url.pathname.startsWith('/member/games/'),url.href);
      const response=await route.fetch({headers:{...request.headers(),...headers(url.href,request.method())}});
      assert.ok(response.status()<400,`${response.status()} ${url}`);
      await route.fulfill({response});
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    for(const game of ['', 'pasar-mini/', 'kereta-pola/', 'susun-ceritaku/', 'sehari-kiki/']) {
      await page.goto(origin+'/member/games/'+game);await page.waitForLoadState('networkidle');
      assert.ok(await page.locator('h1').count());
      await page.evaluate(()=>document.fonts.ready);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,game);
      assert.equal(await page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)),true,game);
    }
    await page.locator('[data-day="activity"][data-id="iqra"]').click();
    await page.getByRole('button',{name:'Lihat huruf'}).click();
    await page.evaluate(()=>document.fonts.ready);await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('.day-letter-cards article').count(),4);
    assert.deepEqual(errors,[]);await context.close();
  }
} finally {await browser.close();}
console.log(`Origin runtime passed: ${files.length} protected files, signed assets, all four games + hub at 320/1280px, lazy Arabic font.`);
