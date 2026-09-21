export const pieces = {
  apple: { label: 'apel' }, banana: { label: 'pisang' }, orange: { label: 'jeruk' }, pear: { label: 'pir' },
  circle: { label: 'lingkaran biru' }, triangle: { label: 'segitiga kuning' }, square: { label: 'persegi ungu' }, star: { label: 'bintang hijau' },
};
export const themes = {
  fruit: { name: 'Buah ceria', preview: ['apple', 'banana'], pairs: [['apple', 'banana'], ['orange', 'pear'], ['banana', 'orange']] },
  shapes: { name: 'Bentuk berwarna', preview: ['circle', 'triangle'], pairs: [['circle', 'triangle'], ['square', 'star'], ['triangle', 'square']] },
};
export const stations = ['Kebun Apel', 'Padang Bunga', 'Bukit Pelangi', 'Danau Tenang', 'Taman Ceria'];
export function makeRounds(theme = 'fruit', random = Math.random) {
  const pairs = themes[theme]?.pairs || themes.fruit.pairs;
  return stations.map((station, i) => {
    const pair = [...pairs[i % pairs.length]];
    if (i > 1 && random() > 0.5) pair.reverse();
    const sequence = [pair[0], pair[1], pair[0], null];
    return { station, pair, sequence, answer: pair[1], choices: random() > 0.5 ? [...pair].reverse() : [...pair] };
  });
}
