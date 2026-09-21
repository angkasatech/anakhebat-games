export const stories = [
  { id: 'bunga', title: 'Bunga untuk Ibu', subtitle: 'Rawat bijinya, lihat bunganya.', prompt: 'Bagaimana kamu merawat tanamanmu?', cards: [
    { id: 'seed', label: 'Menanam biji', sentence: 'Pertama, kita menanam biji di dalam pot.', hint: 'Tanam bijinya dahulu, baru siram dengan air.' },
    { id: 'water', label: 'Menyiram', sentence: 'Lalu, kita menyiram dan merawatnya setiap hari.', hint: 'Setelah biji ditanam, kita menyiram dan merawatnya. Bunganya tumbuh kemudian.' },
    { id: 'flower', label: 'Bunga tumbuh', sentence: 'Setelah beberapa waktu, bunga pun tumbuh. Indah sekali!', hint: 'Bunga tumbuh setelah tanaman dirawat selama beberapa waktu.' },
  ] },
  { id: 'tangan', title: 'Tangan Bersih', subtitle: 'Bermain, lalu bersih lagi.', prompt: 'Kapan kamu biasanya mencuci tangan?', cards: [
    { id: 'wet', label: 'Basahi tangan', sentence: 'Pertama, kita membasahi tangan dengan air mengalir.', hint: 'Basahi tangan dahulu sebelum memakai sabun.' },
    { id: 'soap', label: 'Gosok sabun', sentence: 'Lalu, kita menggosok seluruh bagian tangan dengan sabun.', hint: 'Setelah tangan basah, kita menggosoknya dengan sabun sebelum membilas.' },
    { id: 'rinse', label: 'Bilas dan keringkan', sentence: 'Terakhir, kita membilas sabun dan mengeringkan tangan.', hint: 'Bilas sabunnya, lalu keringkan tangan di akhir cerita.' },
  ] },
  { id: 'pisang', coverIndex: 0, title: 'Waktu Pisang', subtitle: 'Camilan kecil, cerita seru.', prompt: 'Ceritakan camilan kesukaanmu!', cards: [
    { id: 'peel', label: 'Kupas pisang', sentence: 'Pertama, kita mengupas pisang yang sudah matang.', hint: 'Kupas kulit pisangnya dahulu sebelum dimakan.' },
    { id: 'eat', label: 'Makan pisang', sentence: 'Lalu, kita menikmati pisangnya. Nyam, nyam!', hint: 'Setelah dikupas, pisangnya bisa dimakan. Setelah selesai, kita merapikan.' },
    { id: 'tidy', label: 'Rapikan meja', sentence: 'Setelah selesai makan, kita membuang kulit pisang ke tempat sampah.', hint: 'Setelah selesai makan, kita membuang kulit pisang dan merapikan meja.' },
  ] },
];
export const getStory = id => stories.find(story => story.id === id) || stories[0];
