import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import worker from '../public/_worker.js';
import { readFile } from 'node:fs/promises';
const secret = 'test-only-secret-not-for-deployment-123456';
const origin = 'https://anakhebat-games.pages.dev';
function signed(path='/member/games/', options={}) {
  const method=options.method || 'GET';
  const url=new URL(path, options.origin || origin);
  const timestamp=String(options.timestamp ?? Math.floor(Date.now()/1000));
  const value=['v1',timestamp,method,url.origin,url.pathname+url.search].join('\n');
  const signature=createHmac('sha256',options.secret || secret).update(value).digest('hex');
  return new Request(url,{method,headers:{'X-AH-Games-Timestamp':timestamp,'X-AH-Games-Signature':signature,...options.headers}});
}
function environment(overrides={}) {
  let calls=0;
  return {get calls(){return calls},env:{GAMES_ORIGIN_SECRET:secret,ASSETS:{fetch:async request=>{
    calls++;
    for(const name of ['cookie','authorization','x-ah-games-signature','x-ah-games-timestamp']) assert.equal(request.headers.get(name),null);
    return new Response('game',{headers:{'Cache-Control':'public, max-age=999','Set-Cookie':'bad=1','X-AH-Games-Signature':'bad','CDN-Cache-Control':'public'}});
  }},...overrides}};
}
test('signed GET and HEAD serve HTML/assets privately and strip credentials',async()=>{
  for(const method of ['GET','HEAD']) for(const path of ['/member/games/','/member/games/assets/example.js?x=1']) {
    const e=environment();
    const r=await worker.fetch(signed(path,{method,headers:{Cookie:'session=private',Authorization:'Bearer private'}}),e.env);
    assert.equal(r.status,200); assert.equal(e.calls,1);
    assert.equal(await r.text(),method==='HEAD'?'':'game');
    assert.equal(r.headers.get('cache-control'),'private, no-store');
    for(const name of ['set-cookie','x-ah-games-signature','cdn-cache-control']) assert.equal(r.headers.get(name),null);
  }
});
test('unsigned production and preview requests never reach assets, including legacy paths',async()=>{
  for(const host of [origin,'https://branch.anakhebat-games.pages.dev']) for(const path of ['/','/assets/game.js','/member/games/','/public-member-lock/login/','/_worker.js','/member/games/assets/file.woff2']) {
    const e=environment(); const r=await worker.fetch(new Request(host+path),e.env);
    assert.ok([401,403].includes(r.status)); assert.equal(e.calls,0);
    assert.equal(r.headers.get('cache-control'),'private, no-store');
  }
});
test('reject expired, future, invalid, wrong-secret and unsupported method signatures',async()=>{
  const now=Math.floor(Date.now()/1000);
  const requests=[signed(undefined,{timestamp:now-31}),signed(undefined,{timestamp:now+6}),signed(undefined,{secret:'wrong'}),signed(undefined,{method:'POST'}),signed('/',{}),signed(undefined,{headers:{'X-AH-Games-Timestamp':'1.5'}}),signed(undefined,{headers:{'X-AH-Games-Signature':'A'.repeat(64)}})];
  for(const request of requests){const e=environment();assert.equal((await worker.fetch(request,e.env)).status,403);assert.equal(e.calls,0);}
});
test('signature binds exact origin, method, path and query',async()=>{
  const original=signed('/member/games/assets/a.js?a=1');
  for(const [url,method] of [['https://preview.anakhebat-games.pages.dev/member/games/assets/a.js?a=1','GET'],[origin+'/member/games/assets/b.js?a=1','GET'],[origin+'/member/games/assets/a.js?a=2','GET'],[original.url,'HEAD']]) {
    const e=environment(); const r=await worker.fetch(new Request(url,{method,headers:original.headers}),e.env);
    assert.equal(r.status,403);assert.equal(e.calls,0);
  }
});
test('missing configuration and asset failures fail closed',async()=>{
  for(const value of [undefined,'short']){const e=environment({GAMES_ORIGIN_SECRET:value});assert.equal((await worker.fetch(signed(),e.env)).status,503);assert.equal(e.calls,0);}
  assert.equal((await worker.fetch(signed(),{GAMES_ORIGIN_SECRET:secret,ASSETS:{fetch(){throw Error('internal')}}})).status,503);
});
test('all Pages requests run the guard with no excluded assets',async()=>{
  assert.deepEqual(JSON.parse(await readFile(new URL('../public/_routes.json',import.meta.url),'utf8')),{version:1,include:['/*'],exclude:[]});
});
