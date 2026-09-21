import { pieces } from './data.js';
export const name = id => pieces[id].label;
export function patternText(round) { return `${round.sequence.slice(0, -1).map(name).join(', ')}, lalu apa?`; }
export function hintText(round) { return `${name(round.pair[0])} bergantian dengan ${name(round.pair[1])}. Setelah ${name(round.pair[0])}, pilih ${name(round.answer)}.`; }
export function choiceFeedback(round, id) {
  return id === round.answer ? `Pas sekali! ${name(id)} melengkapi polanya. Yuk, berangkat ke ${round.station}!` : `Belum pas. Yuk, coba lagi! ${hintText(round)}`;
}
