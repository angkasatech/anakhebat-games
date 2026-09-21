import { products } from './catalog.js';
// The original `fruit` field now holds any product ID from the catalog.
export function createSession(orders, stock = Object.keys(products)) { return { orders, stock, index: 0, basket: [], status: 'playing' }; }
export function addFruit(state, fruit) {
  if (state.status !== 'playing' || !products[fruit] || !state.stock.includes(fruit) || state.basket.length >= 8) return state;
  return { ...state, basket: [...state.basket, fruit] };
}
export function removeFruit(state, index) {
  if (state.status !== 'playing') return state;
  return { ...state, basket: state.basket.filter((_, i) => i !== index) };
}
export function checkOrder(state) {
  const order = state.orders[state.index];
  const correctCount = state.basket.filter(f => f === order.fruit).length;
  return { correct: correctCount === order.count && state.basket.length === order.count, correctCount, otherCount: state.basket.length - correctCount };
}
export function serve(state) { return state.status === 'playing' && checkOrder(state).correct ? { ...state, status: 'served' } : state; }
export function nextOrder(state) {
  if (state.status !== 'served') return state;
  return state.index === state.orders.length - 1 ? { ...state, status: 'finished' } : { ...state, index: state.index + 1, basket: [], status: 'playing' };
}
