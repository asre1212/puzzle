import {emptyExtras,validateExtras} from './puzzles.js';
import {ladderWords} from './ladder-words.js';
export function score(guess, answer) {
  const result = Array(5).fill('absent'), remaining = {};
  for (let i=0;i<5;i++) { if (guess[i]===answer[i]) result[i]='correct'; else remaining[answer[i]]=(remaining[answer[i]]||0)+1; }
  for (let i=0;i<5;i++) if(result[i]!=='correct' && remaining[guess[i]]>0) { result[i]='present'; remaining[guess[i]]--; }
  return result;
}
export function dayKey(date=new Date()) { return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(date); }
export function dayNumber(key) { return Math.floor(Date.parse(key+'T12:00:00Z')/86400000); }
export function dailyAnswer(key,answers) { return answers[((dayNumber(key)-20744)%answers.length+answers.length)%answers.length]; }
export function outcome(game) { return game.guesses.includes(game.answer)?'won':game.guesses.length===6?'lost':'playing'; }
export function statistics(games,today) {
 const completed=Object.values(games).filter(g=>outcome(g)!=='playing'), wins=completed.filter(g=>outcome(g)==='won'), dist=Array(6).fill(0);
 wins.forEach(g=>dist[g.guesses.length-1]++);
 const sorted=completed.filter(g=>g.mode==='daily').sort((a,b)=>a.date.localeCompare(b.date)); let best=0,run=0,last=-Infinity;
 for(const g of sorted) {const day=dayNumber(g.date);run=outcome(g)==='won'?(day===last+1?run+1:1):0;best=Math.max(best,run);last=day;}
 let streak=0,d=dayNumber(today);const byDay=new Map(sorted.map(g=>[dayNumber(g.date),g]));if(!byDay.has(d))d--;
 while(byDay.has(d)&&outcome(byDay.get(d))==='won'){streak++;d--;}
 return {played:completed.length,winRate:completed.length?Math.round(wins.length/completed.length*100):0,streak,best,dist};
}
export function newState() { return {version:1,daily:{},practice:[],settings:{contrast:false,motion:false},activePractice:null,extras:emptyExtras()}; }
export function validateState(s,answers,allowed) {
 if(!s || s.version!==1 || !s.daily || Array.isArray(s.daily) || typeof s.daily!=='object' || !Array.isArray(s.practice) || Object.keys(s.daily).length>20000 || s.practice.length>10000 || !s.settings) throw Error('This is not a valid Wordgarden backup.');
 const valid=(g,mode)=>g && g.mode===mode && typeof g.id==='string' && g.id.length<100 && /^\d{4}-\d{2}-\d{2}$/.test(g.date) && Number.isFinite(dayNumber(g.date)) && answers.includes(g.answer) && Array.isArray(g.guesses) && g.guesses.length<=6 && (g.draft===undefined||typeof g.draft==='string'&&/^[a-z]{0,5}$/.test(g.draft)) && g.guesses.every(w=>typeof w==='string' && /^[a-z]{5}$/.test(w) && allowed.has(w)) && (g.guesses.indexOf(g.answer)<0 || g.guesses.indexOf(g.answer)===g.guesses.length-1);
 for(const [date,g] of Object.entries(s.daily)) if(date!==g.date||g.id!==date||!valid(g,'daily')||g.answer!==dailyAnswer(date,answers))throw Error('Invalid daily game in backup.');
 if(s.practice.some(g=>!valid(g,'practice')) || new Set(s.practice.map(g=>g.id)).size!==s.practice.length)throw Error('Invalid practice game in backup.');
 if(s.activePractice!==null && !s.practice.some(g=>g.id===s.activePractice))throw Error('Invalid active game in backup.');
 return {extras:validateExtras(s.extras,new Set(ladderWords)),version:1,daily:s.daily,practice:s.practice,activePractice:s.activePractice,settings:{contrast:!!s.settings.contrast,motion:!!s.settings.motion}};
}
