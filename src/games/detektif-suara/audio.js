import {createSpeech} from '../../shared/speech.js';
import {recordings,audioRoot} from './recordings.js';
export function createAudio(status){
 let player,context,nodes=[];
 const speech=createSpeech(status);
 function stop(){speech.stop();if(player){player.pause();player=null;}nodes.forEach(n=>{try{n.stop();}catch{}});nodes=[];}
 function tone(kind){try{context ||= new (window.AudioContext||window.webkitAudioContext)();void context.resume();const time=context.currentTime;for(let i=0;i<(kind==='rain'?18:2);i++){const o=context.createOscillator(),g=context.createGain();o.type=kind==='car'?'sawtooth':'sine';o.frequency.value=kind==='car'?70:kind==='bell'?1100:800+i*93;const start=time+i*(kind==='rain'?.075:.35);g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(.035,start+.015);g.gain.exponentialRampToValueAtTime(.0001,start+(kind==='car'?.6:.15));o.connect(g).connect(context.destination);o.start(start);o.stop(start+.7);nodes.push(o);}return true;}catch{status('Suara belum tersedia. Yuk, gunakan petunjuk gambar.');return false;}}
 return {stop,available:()=>speech.available(),async play(key,text,{environment=false,phoneme=false}={}){stop();if(recordings[key]){player=new Audio(audioRoot+recordings[key]);try{await player.play();return;}catch{status('Rekaman belum bisa diputar. Gunakan petunjuk gambar.');}}
 if(environment){if(tone(key))status('Bunyi tiruan sederhana. Lihat petunjuk jika perlu.');return;}
 if(phoneme)status('Rekaman bunyi huruf belum tersedia. Dengarkan contoh kata atau main dengan gambar.');
 speech.say(text);},effect(){stop();tone('bell');},dispose(){stop();void context?.close();}};
}
