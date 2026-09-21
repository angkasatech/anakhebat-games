export function createSession(rounds) { return { rounds, index: 0, selected: null, status: 'playing' }; }
export function choose(state, id) {
  const round = state.rounds[state.index];
  if (state.status !== 'playing' || !round.choices.includes(id)) return state;
  return { ...state, selected: id, status: id === round.answer ? 'departing' : 'playing' };
}
export function arrive(state) { return state.status === 'departing' ? { ...state, status: 'arrived' } : state; }
export function nextRound(state) {
  if (state.status !== 'arrived') return state;
  return state.index === state.rounds.length - 1 ? { ...state, status: 'finished' } : { ...state, index: state.index + 1, selected: null, status: 'playing' };
}
