export function shuffled(items, random = Math.random) {
  const copy = [...items];
  for (let i=copy.length-1;i>0;i--) { const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1)))); [copy[i],copy[j]]=[copy[j],copy[i]]; }
  return copy;
}
export function createSession(activity, mode = 'words', random = Math.random) {
  const items = mode === 'phrases' ? activity.phrases : activity.words.map(target => ({target}));
  const rounds = shuffled(items,random).map(item => ({...item, choices:shuffled([item.target,...shuffled(activity.words.filter(id => id!==item.target),random).slice(0,mode==='phrases'?2:1)],random)}));
  return {activityId:activity.id,mode,rounds,index:0,status:'playing',selected:null};
}
export function createLettersSession(group, random = Math.random) {
  const session=createSession({id:'letters',words:group.map(l=>l.id)},'words',random); session.mode='letters'; return session;
}
export const currentRound = s => s.rounds[s.index];
export function choose(session, id) {
  if (session.status!=='playing' || !currentRound(session).choices.includes(id)) return {kind:'ignored'};
  session.selected=id;
  if (id!==currentRound(session).target) return {kind:'retry'};
  session.status='answered'; return {kind:'correct'};
}
export function nextRound(session) {
  if(session.status!=='answered')return false;
  if(session.index===session.rounds.length-1){session.status='complete';return true;}
  session.index++;session.status='playing';session.selected=null;return true;
}
