export { names } from './catalog.js';
export const words = ['', 'satu', 'dua', 'tiga', 'empat', 'lima'];
export const customers = ['Kiki', 'Bimo', 'Lala', 'Mimi', 'Toto'];
export function makeOrders(level, random = Math.random, stock = ['apple', 'banana', 'orange']) {
  const max = level === 'advanced' ? 5 : 3;
  const offset = Math.floor(random() * stock.length);
  return Array.from({ length: 5 }, (_, i) => ({ fruit: stock[(i + offset) % stock.length], count: level === 'beginner' && i === 0 ? 1 : 1 + Math.floor(random() * max), customer: customers[i] }));
}
