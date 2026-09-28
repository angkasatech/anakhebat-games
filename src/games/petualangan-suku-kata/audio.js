import {createSpeech} from '../../shared/speech.js';
import {audioRoot} from './data.js';
export function createAudio(status){const speech=createSpeech(status);let player;return {stop(){speech.stop();player?.pause();},say(text,key=''){if(player)player.pause();if(key){player=new Audio(`${audioRoot}${key}.mp3`);player.play().catch(()=>speech.say(text));}else speech.say(text);},available:()=>speech.available()};}
