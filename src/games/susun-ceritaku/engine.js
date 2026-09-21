export function createSession(story, random = Math.random) {
  const order = story.cards.map(card => card.id);
  const choices = [...order];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  if (choices.every((id, i) => id === order[i])) choices.push(choices.shift());
  return { storyId: story.id, order, choices, selected: [], status: 'playing' };
}
export function addCard(session, id) {
  if (session.status !== 'playing' || !session.order.includes(id) || session.selected.includes(id) || session.selected.length === session.order.length) return false;
  session.selected.push(id); return true;
}
export function removeCard(session, id) {
  const index = session.selected.indexOf(id);
  if (session.status !== 'playing' || index < 0) return false;
  session.selected.splice(index, 1); return true;
}
export function checkStory(session) {
  if (session.selected.length < session.order.length) return { kind: 'incomplete', missing: session.order.length - session.selected.length };
  const mismatch = session.order.findIndex((id, i) => session.selected[i] !== id);
  return mismatch < 0 ? { kind: 'correct' } : { kind: 'reorder', index: mismatch, expected: session.order[mismatch] };
}
export function completeStory(session) {
  const result = checkStory(session);
  if (result.kind === 'correct') session.status = 'complete';
  return result;
}
export function nextHint(session) {
  return session.order.findIndex((id, i) => session.selected[i] !== id);
}
