export const products = {
  apple: { name: 'apel' }, banana: { name: 'pisang' }, orange: { name: 'jeruk' },
  pear: { name: 'pir' }, mango: { name: 'mangga' }, avocado: { name: 'alpukat' },
  carrot: { name: 'wortel' }, broccoli: { name: 'brokoli' }, eggplant: { name: 'terong' },
  cucumber: { name: 'mentimun' }, corn: { name: 'jagung' }, tomato: { name: 'tomat' },
  egg: { name: 'telur', unit: 'butir' }, fish: { name: 'ikan', unit: 'ekor' },
  chicken: { name: 'ayam', unit: 'potong' }, tempeh: { name: 'tempe', unit: 'potong' },
  tofu: { name: 'tahu', unit: 'potong' }, shrimp: { name: 'udang', unit: 'ekor' },
};
// Market grouping, not a botanical classification or nutrition assessment.
export const stalls = {
  fruit: { name: 'Lapak Buah', short: 'Buah', items: ['apple', 'banana', 'orange', 'pear', 'mango', 'avocado'], preview: ['apple', 'pear', 'mango'] },
  vegetable: { name: 'Lapak Sayur', short: 'Sayur', items: ['carrot', 'broccoli', 'eggplant', 'cucumber', 'corn', 'tomato'], preview: ['carrot', 'broccoli', 'eggplant'] },
  protein: { name: 'Lapak Lauk', short: 'Lauk', items: ['egg', 'fish', 'chicken', 'tempeh', 'tofu', 'shrimp'], preview: ['egg', 'fish', 'tempeh'] },
};
export const names = Object.fromEntries(Object.entries(products).map(([key, item]) => [key, item.name]));
export function quantityLabel(id, count) {
  const item = products[id];
  return `${count} ${item.unit ? `${item.unit} ` : ''}${item.name}`;
}
export function chooseStock(stall, previous = [], random = Math.random) {
  const pool = [...stalls[stall].items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const stock = pool.slice(0, 3);
  if (previous.length && stock.every(id => previous.includes(id))) stock[2] = pool.find(id => !previous.includes(id));
  return stock;
}
