import { quantityLabel, stalls } from './catalog.js';

export function basketSummary(stall, count) {
  return count === 0 ? 'Keranjang sekarang kosong.' : `Ada ${count} ${stalls[stall].short.toLowerCase()} di keranjang.`;
}

export function basketChangeMessage(stall, product, count, action = 'add') {
  return `${quantityLabel(product, 1)} ${action === 'remove' ? 'dikeluarkan dari' : 'dimasukkan ke'} keranjang. ${basketSummary(stall, count)}`;
}

export function orderFeedback(order, basket) {
  const count = basket.filter(id => id === order.fruit).length;
  const other = new Map();
  for (const id of basket) if (id !== order.fruit) other.set(id, (other.get(id) || 0) + 1);
  if (count === order.count && other.size === 0) return 'Pas sekali! Terima kasih sudah membantu.';

  const messages = ['Pesananku belum sesuai. Yuk, coba lagi!', `Aku meminta ${quantityLabel(order.fruit, order.count)}.`];
  if (other.size) {
    const unwanted = [...other].map(([id, amount]) => quantityLabel(id, amount)).join(' dan ');
    messages.push(`Ada ${unwanted} yang tidak dipesan.`, `Keluarkan ${unwanted}, ya.`);
  }
  const difference = order.count - count;
  if (difference > 0) {
    const missing = quantityLabel(order.fruit, difference);
    messages.push(`Masih kurang ${missing}.`, `Tambahkan ${missing}, ya.`);
  } else if (difference < 0) {
    const excess = quantityLabel(order.fruit, -difference);
    messages.push(`Ada kelebihan ${excess}.`, `Keluarkan ${excess}, ya.`);
  } else {
    messages.push(`Jumlah ${quantityLabel(order.fruit, count)} sudah pas.`);
  }
  return messages.join(' ');
}
