import {getWords,modes} from './data.js';
const shuffle=(a)=>[...a].sort(()=>Math.random()-.5);
export function makeMissions(mode='jalan-santai'){const pool=getWords(mode);const pick=(i)=>pool[i%pool.length];return [
 {type:'clap',word:pick(0),need:pick(0).syllables.length},
 {type:'pair',word:pick(1),choices:shuffle([pick(1),pick(2),pick(3)]).filter((w,i,a)=>a.findIndex(x=>x.id===w.id)===i).slice(0,3)},
 {type:'bridge',word:pick(2),stones:shuffle(pick(2).syllables)},
 {type:'split',word:pick(3),choices:shuffle([pick(3).syllables.join(' | '),pick(3).syllables.slice(0,-1).join(' | ')+' '+pick(3).syllables.at(-1),pick(3).syllables.join('')]).filter((x,i,a)=>a.indexOf(x)===i)},
 {type:'treasure',word:pick(4),stones:shuffle(pick(4).syllables),choices:shuffle([pick(4),pick(5),pick(6)])}
];}
export function createState(mode='jalan-santai'){return {mode,missions:makeMissions(mode),index:0,selected:[],attempts:0,completed:0,claps:0,summary:[]};}
export function answer(state,value){const m=state.missions[state.index];if(m.type==='clap'){state.claps++;if(state.claps<m.need)return 'progress';state.completed++;return 'complete';}if(m.type==='split'){if(value!==m.word.syllables.join(' | '))return 'retry';state.completed++;return 'complete';}if(m.type==='pair'){if(value!==m.word.id)return 'retry';state.completed++;return 'complete';}if(m.type==='bridge'||m.type==='treasure'){if(value===m.word.syllables[state.selected.length]){state.selected.push(value);if(state.selected.length===m.word.syllables.length){state.completed++;return 'complete';}return 'progress';}state.attempts++;return 'retry';}return 'retry';}
export function next(state){if(state.index>=4)return false;state.summary.push(state.missions[state.index].word.label);state.index++;state.selected=[];state.attempts=0;state.claps=0;return true;}
