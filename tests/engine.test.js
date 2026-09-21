import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSession, addFruit, removeFruit, checkOrder, serve, nextOrder } from '../src/games/pasar-mini/engine.js';
import { makeOrders } from '../src/games/pasar-mini/orders.js';
import { stalls, products, chooseStock, quantityLabel } from '../src/games/pasar-mini/catalog.js';
test('wrong type, too few, too many, removal, success and five-order completion', () => {
  let s = createSession(Array.from({ length: 5 }, () => ({ fruit: 'apple', count: 2 })));
  assert.equal(checkOrder(s).correct, false);
  s = addFruit(s, 'orange'); s = addFruit(s, 'apple');
  assert.equal(checkOrder(s).otherCount, 1);
  assert.equal(serve(s).status, 'playing');
  s = removeFruit(s, 0); s = addFruit(s, 'apple'); s = addFruit(s, 'apple');
  assert.equal(checkOrder(s).correct, false);
  s = removeFruit(s, 2); assert.equal(checkOrder(s).correct, true);
  for (let i = 0; i < 5; i++) {
    if (i) { s = addFruit(addFruit(s, 'apple'), 'apple'); }
    s = serve(s); assert.equal(s.status, 'served');
    assert.equal(addFruit(s, 'orange'), s);
    s = nextOrder(s);
  }
  assert.equal(s.status, 'finished');
});
test('basket bounded, invalid fruit ignored, cannot skip unserved order', () => {
  let s = createSession(makeOrders('beginner'));
  assert.equal(nextOrder(s), s); assert.equal(addFruit(s, 'unknown-product'), s);
  for (let i = 0; i < 15; i++) s = addFruit(s, 'apple');
  assert.equal(s.basket.length, 8);
});
test('both difficulty ranges, exactly five orders', () => {
  for (const [level, max] of [['beginner', 3], ['advanced', 5]]) {
    assert.equal(makeOrders(level).length, 5);
    assert.equal(makeOrders(level, () => 0)[0].count, 1);
    assert.equal(makeOrders(level, () => 0.9999)[1].count, max);
  }
});
test('18 products, three stable choices, no unavailable orders and replay variety', () => {
  assert.equal(Object.keys(products).length, 18);
  for (const stall of Object.keys(stalls)) {
    const stock = chooseStock(stall, [], () => 0.99);
    assert.equal(new Set(stock).size, 3);
    assert.ok(stock.every(id => stalls[stall].items.includes(id)));
    const replay = chooseStock(stall, stock, () => 0.99);
    assert.ok(replay.some(id => !stock.includes(id)));
    const orders = makeOrders('beginner', () => 0.99, stock);
    assert.equal(orders[0].count, 1);
    assert.ok(orders.every(o => stock.includes(o.fruit) && o.count <= 3));
    assert.equal(new Set(orders.map(o => o.fruit)).size, 3);
    const s = createSession(orders, stock);
    const unavailable = Object.keys(products).find(id => !stock.includes(id));
    assert.equal(addFruit(s, unavailable), s);
  }
});
test('counting units match products', () => {
  assert.equal(quantityLabel('tempeh', 'dua'), 'dua potong tempe');
  assert.equal(quantityLabel('egg', 'satu'), 'satu butir telur');
  assert.equal(quantityLabel('fish', 3), '3 ekor ikan');
  assert.equal(quantityLabel('carrot', 2), '2 wortel');
});
