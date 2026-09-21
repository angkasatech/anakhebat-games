import { words, letters } from './data.js';
export function feedbackFor(session, result, selected) {
  const target = session.rounds[session.index].target;
  if (session.mode === 'letters') {
    const letter=letters.find(l=>l.id===target);
    return result.kind === 'correct' ? `Bentuknya sama. Ini huruf ${letter.name}.` : `Yuk, lihat bentuk dan titiknya lagi. Cari huruf ${letter.name} seperti contoh di atas.`;
  }
  if (result.kind === 'correct') return `Ya, ${words[target].en.toLowerCase()} berarti ${words[target].idn.toLowerCase()}. Terima kasih sudah mencoba!`;
  return `Kamu memilih ${words[selected].en.toLowerCase()} (${words[selected].idn.toLowerCase()}). Kali ini Kiki mencari ${words[target].en.toLowerCase()} (${words[target].idn.toLowerCase()}). Yuk, coba lagi.`;
}
