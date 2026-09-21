const positions = ['pertama', 'kedua', 'ketiga'];
export function hintText(story, index) {
  if (index < 0) return 'Ketiga kartu sudah berurutan. Yuk, tekan Ceritaku siap!';
  return `Di cerita ini, kartu ${positions[index]} adalah ${story.cards[index].label.toLowerCase()}. ${story.cards[index].hint}`;
}
export function resultText(story, result) {
  if (result.kind === 'incomplete') return `Masih ada ${result.missing} tempat kosong. Yuk, pilih gambar untuk melanjutkan cerita.`;
  if (result.kind === 'correct') return 'Ceritanya sudah tersusun. Terima kasih sudah mencoba!';
  return `Yuk, lihat lagi urutannya. ${hintText(story, result.index)} Ketuk kartu di atas untuk mengubah pilihanmu.`;
}
