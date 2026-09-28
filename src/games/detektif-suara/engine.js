import {words,levels,environments,pairs} from './data.js';
export function shuffle(items,random=Math.random){return items.map(x=>({x,n:random()})).sort((a,b)=>a.n-b.n).map(v=>v.x);}
export function createMissions(level='calm',random=Math.random){
 const count=levels.find(l=>l.id===level)?.count||2;
 const group=shuffle(pairs,random)[0];
 const sound=group[0], sample=shuffle(words.filter(w=>w.sound===sound),random);
 const target=sample[0];
 const others=shuffle(words.filter(w=>w.sound!==sound),random);
 const env=shuffle(environments,random)[0];
 const soundCard=s=>({id:s,label:`/${s}/`,picture:words.find(w=>w.sound===s).picture,example:words.find(w=>w.sound===s).label});
 const sounds=shuffle([sound,...shuffle(Object.keys(Object.fromEntries(words.map(w=>[w.sound,1]))).filter(s=>s!==sound),random).slice(0,count-1)],random).map(soundCard);
 const similar=level==='calm'?['m','s']:group;
 const similarTarget=shuffle(words.filter(w=>w.sound===similar[0]),random)[0];
 const code=shuffle(Object.keys(Object.fromEntries(words.map(w=>[w.sound,1]))),random)[0];
 const codeWords=shuffle(words.filter(w=>w.sound===code),random).slice(0,level==='calm'?2:3);
 return [
 {kind:'environment',target:env,choices:shuffle([env,...environments.filter(e=>e.id!==env.id).slice(0,count-1)],random),answers:[env.id]},
 {kind:'match',target,choices:shuffle([sample[1],...others.slice(0,count-1)],random),answers:[sample[1].id],sound},
 {kind:'first',target,choices:sounds,answers:[sound],sound},
 {kind:'similar',target:similarTarget,choices:shuffle([...similar,...(level==='challenge'?['s'].filter(s=>!similar.includes(s)):[])],random).map(soundCard),answers:[similar[0]],sound:similar[0]},
 {kind:'code',target:codeWords[0],choices:shuffle([...codeWords,...shuffle(words.filter(w=>w.sound!==code),random).slice(0,level==='calm'?1:2)],random),answers:codeWords.map(w=>w.id),sound:code}
 ];
}
export function createState(level='calm'){return {level,missions:createMissions(level),index:0,selected:[],attempts:0,completed:0,completedIds:[]};}
export function choose(state,id){const mission=state.missions[state.index];if(!mission||!mission.choices.some(c=>c.id===id)||state.selected.includes(id))return 'ignored';if(!mission.answers.includes(id)){state.attempts++;return 'retry';}state.selected.push(id);if(mission.answers.every(a=>state.selected.includes(a))){state.completed++;state.completedIds.push(state.index);return 'complete';}return 'found';}
export function next(state){if(state.selected.length!==state.missions[state.index].answers.length)return false;state.index++;state.selected=[];state.attempts=0;return true;}
