import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {score,dayKey,dailyAnswer,outcome,statistics,newState,validateState} from '../dist/core.js';
import {answers,words} from '../dist/words.js';
const CACHE_NAME=fs.readFileSync('dist/sw.js','utf8').match(/const CACHE='([^']+)'/)[1];
const allowed=new Set([...words,...answers]);
test('duplicate letters consume only available answer letters, greens first',()=>{
 assert.deepEqual(score('allee','apple'),['correct','present','absent','absent','correct']);
 assert.deepEqual(score('eerie','serve'),['absent','correct','correct','absent','correct']);
 assert.deepEqual(score('sassy','assay'),['present','present','correct','absent','correct']);
 assert.deepEqual(score('apple','apple'),Array(5).fill('correct'));
 for(const answer of answers.slice(0,100))for(const guess of answers.slice(100,130)){
  const scored=score(guess,answer);for(const c of new Set(guess))assert.equal(scored.filter((s,i)=>guess[i]===c&&s!=='absent').length,Math.min([...guess].filter(x=>x===c).length,[...answer].filter(x=>x===c).length));
 }
});
test('six-attempt outcome and win on sixth',()=>{assert.equal(outcome({answer:'apple',guesses:['apple']}),'won');assert.equal(outcome({answer:'apple',guesses:Array(6).fill('other')}),'lost');assert.equal(outcome({answer:'apple',guesses:[...Array(5).fill('other'),'apple']}),'won');assert.equal(outcome({answer:'apple',guesses:[]}),'playing');});
test('Eastern midnight and daylight-saving boundaries',()=>{assert.equal(dayKey(new Date('2026-10-19T03:59:59Z')),'2026-10-18');assert.equal(dayKey(new Date('2026-10-19T04:00:00Z')),'2026-10-19');assert.equal(dayKey(new Date('2026-11-02T04:59:59Z')),'2026-11-01');assert.equal(dayKey(new Date('2026-11-02T05:00:00Z')),'2026-11-02');assert.equal(dayKey(new Date('2026-03-09T03:59:59Z')),'2026-03-08');});
test('daily schedule stable, answer bank unique and accepted',()=>{assert.equal(answers.length,new Set(answers).size);assert.ok(answers.length>1000);assert.ok(answers.every(w=>/^[a-z]{5}$/.test(w)&&allowed.has(w)));const seen=new Set();for(let i=0;i<answers.length;i++){const d=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10);seen.add(dailyAnswer(d,answers));}assert.equal(seen.size,answers.length);assert.equal(dailyAnswer('2026-10-19',answers),dailyAnswer('2026-10-19',answers));});
const make=(date,win=true)=>({id:date,date,mode:'daily',answer:dailyAnswer(date,answers),guesses:win?[dailyAnswer(date,answers)]:Array(6).fill('other')});
test('streak persists until next day ends, resets on gap or loss',()=>{let games={'2026-10-17':make('2026-10-17'),'2026-10-18':make('2026-10-18')};assert.equal(statistics(games,'2026-10-19').streak,2);assert.equal(statistics(games,'2026-10-20').streak,0);games['2026-10-19']=make('2026-10-19',false);const s=statistics(games,'2026-10-19');assert.equal(s.streak,0);assert.equal(s.best,2);assert.equal(s.winRate,67);assert.equal(s.dist[0],2);});
test('backup round-trip and rejects corrupted or injected values',()=>{const s=newState();s.daily['2026-10-18']=make('2026-10-18');assert.deepEqual(validateState(JSON.parse(JSON.stringify(s)),answers,allowed),s);const bad=structuredClone(s);bad.daily['2026-10-18'].guesses=['<img>'];assert.throws(()=>validateState(bad,answers,allowed));const mismatch=structuredClone(s);mismatch.daily['2026-10-18'].answer='abcde';assert.throws(()=>validateState(mismatch,answers,allowed));assert.throws(()=>validateState({version:1},answers,allowed));});
test('manifest icons and all offline assets exist; cache lifecycle',async()=>{const listeners={},cached=[],deleted=[];let claimed=false;const context={URL,Response,Request,fetch:async()=>{throw Error('offline')},self:{skipWaiting:async()=>{},location:{href:'https://example.com/puzzle/sw.js'},clients:{claim:async()=>{claimed=true}},addEventListener:(k,f)=>listeners[k]=f},caches:{open:async()=>({addAll:async files=>cached.push(...files.map(f=>f.url)),match:async url=>typeof url==='string'?({cached:url}):undefined}),keys:async()=>['wordgarden-shell-v0','wordgarden-shell-v1',CACHE_NAME,'other-app'],delete:async k=>deleted.push(k)}};vm.runInNewContext(fs.readFileSync('dist/sw.js','utf8'),context);let promise;listeners.install({waitUntil:p=>promise=p});await promise;assert.ok(cached.includes('https://example.com/puzzle/index.html'));for(const url of cached){const p=new URL(url).pathname.replace('/puzzle/','');assert.ok(fs.existsSync('dist/'+(p||'index.html')),p);}
listeners.activate({waitUntil:p=>promise=p});await promise;assert.deepEqual(deleted,['wordgarden-shell-v0','wordgarden-shell-v1']);assert.ok(claimed);
listeners.fetch({request:{method:'GET',url:'https://example.com/puzzle/',mode:'navigate'},respondWith:p=>promise=p});assert.equal((await promise).cached,'https://example.com/puzzle/index.html');
const manifest=JSON.parse(fs.readFileSync('dist/manifest.webmanifest'));assert.equal(manifest.start_url,'./');assert.ok(manifest.icons.every(i=>fs.existsSync('dist/'+i.src)));});
