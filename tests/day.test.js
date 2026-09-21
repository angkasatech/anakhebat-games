import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { activities,words,letters,letterGroups } from '../src/games/sehari-kiki/data.js';
import { createSession,createLettersSession,choose,nextRound,currentRound } from '../src/games/sehari-kiki/engine.js';
import { feedbackFor } from '../src/games/sehari-kiki/feedback.js';
test('ten activities, valid illustrated vocabulary and three distinct contextual requests each',()=>{
  assert.equal(activities.length,10);assert.equal(Object.keys(words).length,39);
  for(const a of activities){assert.equal(new Set(a.words).size,5);assert.equal(a.phrases.length,3);assert.equal(new Set(a.phrases.map(p=>p.target)).size,3);
    for(const id of a.words){assert(words[id]);assert(['egg','banana'].includes(id)||existsSync(`src/games/sehari-kiki/assets/${id}.svg`));}
    for(const p of a.phrases){assert(a.words.includes(p.target));assert(p.en&&p.idn);}
  }
});
test('all activities are solvable in words and phrases modes; retries do not advance, answers lock',()=>{
  for(const a of activities)for(const mode of ['words','phrases']){
    const s=createSession(a,mode,()=>.4);assert.equal(s.rounds.length,mode==='words'?5:3);assert.equal(nextRound(s),false);
    for(let i=0;i<s.rounds.length;i++){
      const r=currentRound(s);assert.equal(new Set(r.choices).size,mode==='words'?2:3);assert(r.choices.includes(r.target));
      assert.equal(choose(s,'unknown').kind,'ignored');const other=r.choices.find(id=>id!==r.target);
      assert.equal(choose(s,other).kind,'retry');assert.equal(s.index,i);assert.equal(nextRound(s),false);
      assert.match(feedbackFor(s,{kind:'retry'},other),/Kamu memilih/);
      assert.equal(choose(s,r.target).kind,'correct');assert.equal(choose(s,other).kind,'ignored');assert(nextRound(s));
    }assert.equal(s.status,'complete');assert.equal(nextRound(s),false);
  }
});
test('28 distinct isolated letters form seven playable small groups without English prompts',()=>{
  assert.equal(new Set(letters.map(l=>l.glyph)).size,28);assert.equal(letterGroups.length,7);
  for(const group of letterGroups){assert.equal(group.length,4);const s=createLettersSession(group);assert.equal(s.mode,'letters');for(let i=0;i<4;i++){const r=currentRound(s);assert(r.choices.every(id=>group.some(l=>l.id===id)));assert(!r.en);assert.equal(choose(s,r.target).kind,'correct');nextRound(s);}assert.equal(s.status,'complete');}
});
