import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeRounds, themes } from '../src/games/kereta-pola/data.js';
import { createSession, choose, arrive, nextRound } from '../src/games/kereta-pola/engine.js';
import { choiceFeedback, hintText } from '../src/games/kereta-pola/feedback.js';

test('both themes always have five solvable AB rounds and two distinct choices', () => {
  for (const theme of Object.keys(themes)) for (const random of [() => 0, () => 0.99]) {
    const rounds = makeRounds(theme, random);
    assert.equal(rounds.length, 5);
    for (const r of rounds) {
      assert.equal(r.sequence.length, 4);
      assert.equal(r.sequence.filter(id => id === null).length, 1);
      assert.equal(r.sequence[0], r.sequence[2]);
      assert.equal(r.answer, r.sequence[1]);
      assert.equal(new Set(r.choices).size, 2);
      assert.ok(r.choices.includes(r.answer));
      assert.ok(themes[theme].pairs.some(pair => r.pair.every(id => pair.includes(id))));
    }
  }
});
test('wrong answer stays retryable; correct answer locks while traveling and five arrivals finish', () => {
  let s = createSession(makeRounds('fruit', () => 0));
  assert.equal(nextRound(s), s);
  assert.equal(choose(s, 'invalid'), s);
  for (let i = 0; i < 5; i++) {
    const r = s.rounds[s.index];
    s = choose(s, r.pair[0]); assert.equal(s.status, 'playing'); assert.equal(s.index, i);
    s = choose(s, r.answer); assert.equal(s.status, 'departing');
    assert.equal(choose(s, r.pair[0]), s); assert.equal(nextRound(s), s);
    s = arrive(s); assert.equal(s.status, 'arrived');
    s = nextRound(s);
  }
  assert.equal(s.status, 'finished');
});
test('feedback explains alternation and next product without penalties', () => {
  const r = makeRounds('fruit', () => 0)[0];
  assert.equal(hintText(r), 'apel bergantian dengan pisang. Setelah apel, pilih pisang.');
  assert.match(choiceFeedback(r, 'apple'), /Belum pas. Yuk, coba lagi!/);
  assert.match(choiceFeedback(r, 'banana'), /Pas sekali/);
});
test('shape labels include both geometry and color', () => {
  const r = makeRounds('shapes', () => 0)[0];
  assert.match(hintText(r), /lingkaran biru/);
  assert.match(hintText(r), /segitiga kuning/);
});
