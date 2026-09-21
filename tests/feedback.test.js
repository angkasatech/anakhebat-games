import { test } from 'node:test';
import assert from 'node:assert/strict';
import { basketChangeMessage, orderFeedback } from '../src/games/pasar-mini/feedback.js';

test('click narration names product, unit, category and current total', () => {
  assert.equal(basketChangeMessage('fruit', 'apple', 5), '1 apel dimasukkan ke keranjang. Ada 5 buah di keranjang.');
  assert.equal(basketChangeMessage('vegetable', 'broccoli', 2), '1 brokoli dimasukkan ke keranjang. Ada 2 sayur di keranjang.');
  assert.equal(basketChangeMessage('protein', 'egg', 3), '1 butir telur dimasukkan ke keranjang. Ada 3 lauk di keranjang.');
  assert.equal(basketChangeMessage('protein', 'tempeh', 0, 'remove'), '1 potong tempe dikeluarkan dari keranjang. Keranjang sekarang kosong.');
});
test('empty and short baskets explain exact missing quantity', () => {
  const order = { fruit: 'apple', count: 3 };
  assert.match(orderFeedback(order, []), /Masih kurang 3 apel\. Tambahkan 3 apel/);
  assert.match(orderFeedback(order, ['apple']), /Masih kurang 2 apel\. Tambahkan 2 apel/);
});
test('extra quantity and mixed wrong products receive all corrections', () => {
  const order = { fruit: 'egg', count: 2 };
  const text = orderFeedback(order, ['egg', 'egg', 'egg', 'fish', 'fish', 'tempeh']);
  assert.match(text, /^Pesananku belum sesuai\. Yuk, coba lagi!/);
  assert.match(text, /Aku meminta 2 butir telur/);
  assert.match(text, /Keluarkan 2 ekor ikan dan 1 potong tempe/);
  assert.match(text, /kelebihan 1 butir telur\. Keluarkan 1 butir telur/);
});
test('wrong products plus missing requested product are both explained', () => {
  const text = orderFeedback({ fruit: 'broccoli', count: 3 }, ['broccoli', 'carrot', 'carrot']);
  assert.match(text, /Keluarkan 2 wortel/);
  assert.match(text, /Masih kurang 2 brokoli\. Tambahkan 2 brokoli/);
});
test('correct quantity with unwanted product does not claim shortage/excess', () => {
  const text = orderFeedback({ fruit: 'apple', count: 1 }, ['apple', 'banana']);
  assert.match(text, /Keluarkan 1 pisang/);
  assert.match(text, /Jumlah 1 apel sudah pas/);
  assert.doesNotMatch(text, /kurang|kelebihan/);
  assert.equal(orderFeedback({ fruit: 'apple', count: 1 }, ['apple']), 'Pas sekali! Terima kasih sudah membantu.');
});
