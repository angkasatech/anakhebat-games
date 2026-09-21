import test from 'node:test';
import assert from 'node:assert/strict';
import { stories } from '../src/games/susun-ceritaku/data.js';
import { createSession, addCard, removeCard, completeStory, nextHint } from '../src/games/susun-ceritaku/engine.js';
import { resultText, hintText } from '../src/games/susun-ceritaku/feedback.js';

test('each three-scene story starts shuffled and has all unique available choices', () => {
  for (const story of stories) for (const random of [() => 0, () => .5, () => .999999, Math.random]) {
    const s = createSession(story, random);
    assert.equal(s.order.length, 3); assert.equal(new Set(s.choices).size, 3);
    assert.notDeepEqual(s.choices, s.order); assert.deepEqual([...s.choices].sort(), [...s.order].sort());
  }
});
test('incomplete, wrong, removal and correction preserve choices and finish only valid sequence', () => {
  for (const story of stories) {
    const s = createSession(story); assert.equal(completeStory(s).missing, 3);
    assert.equal(addCard(s, 'unknown'), false);
    for (const id of [...s.order].reverse()) addCard(s, id);
    assert.equal(addCard(s, s.order[0]), false);
    const result = completeStory(s); assert.equal(result.kind, 'reorder'); assert.equal(result.expected, s.order[0]);
    assert.equal(s.status, 'playing'); assert.match(resultText(story, result), /Di cerita ini/);
    removeCard(s, s.order[1]); assert.deepEqual(s.selected, [s.order[2], s.order[0]]);
    for (const id of [...s.selected]) removeCard(s, id);
    for (const id of s.order) addCard(s, id);
    assert.equal(nextHint(s), -1); assert.match(hintText(story, -1), /Ceritaku siap/);
    assert.equal(completeStory(s).kind, 'correct'); assert.equal(s.status, 'complete');
    assert.equal(removeCard(s, s.order[0]), false); assert.equal(addCard(s, s.order[0]), false);
  }
});
