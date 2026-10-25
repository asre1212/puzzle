import test from 'node:test';
import assert from 'node:assert/strict';
import {themeForDate,themes,puzzleArtwork} from '../dist/splash-themes.js';
import {createSplashController,SPLASH_DURATION} from '../dist/splash.js';
const on=d=>themeForDate(new Date(d+'T12:00:00-05:00'));
test('All holiday windows activate on their first day and revert after their last day',()=>{
 for(const [start,end,before,after,id,next] of [
 ['02-07','02-15','02-06','02-16','valentine','generic'],
 ['06-27','07-07','06-26','07-08','july4','summer'],
 ['10-18','11-01','10-17','11-02','halloween','generic'],
 ['12-10','12-26','12-09','12-27','christmas','newyear']]){
  assert.notEqual(on('2026-'+before),id);assert.equal(on('2026-'+start),id);assert.equal(on('2026-'+end),id);assert.equal(on('2026-'+after),next);
 }
 assert.equal(on('2026-12-27'),'newyear');assert.equal(on('2027-01-03'),'newyear');assert.equal(on('2027-01-04'),'generic');
});
test('Seasonal windows and annual repetition respect holiday priority and Eastern midnight',()=>{
 for(const year of [2026,2027,2028,2030])for(const [md,id] of [['02-28','generic'],['03-01','spring'],['05-31','spring'],['06-01','summer'],['07-04','july4'],['08-31','summer'],['09-01','generic'],['10-25','halloween']])assert.equal(on(year+'-'+md),id);
 assert.equal(on('2028-02-29'),'generic');
 assert.equal(themeForDate(new Date('2026-10-18T03:59:59Z')),'generic');assert.equal(themeForDate(new Date('2026-10-18T04:00:00Z')),'halloween');
 assert.equal(themeForDate(new Date('2027-01-04T04:59:59Z')),'newyear');assert.equal(themeForDate(new Date('2027-01-04T05:00:00Z')),'generic');
 assert.equal(themeForDate(new Date('invalid')),'generic');
});
test('Eight distinct artwork designs contain nine clipped jigsaw pieces with unique IDs',()=>{
 assert.equal(Object.keys(themes).length,8);const arts=Object.keys(themes).map(id=>puzzleArtwork(id));assert.equal(new Set(arts).size,8);
 for(const svg of arts){assert.equal((svg.match(/class="jigsaw-piece"/g)||[]).length,9);assert.equal((svg.match(/<clipPath/g)||[]).length,9);assert.equal(new Set([...svg.matchAll(/id="([^"]+)"/g)].map(m=>m[1])).size,9);assert.ok(!/https?:\/\//.test(svg.replace('http://www.w3.org/2000/svg','')));}
});
function fixture({motion=false,blockedStorage=false}={}){
 let clock=Date.parse('2026-10-25T16:00:00Z'),id=0,focused=false;const timers=new Map(),listeners=new Map(),session=new Map();
 const button={focus(){focused=true;},isConnected:true},normalDialog={open:false};
 const doc={hidden:false,activeElement:button,body:{classList:{contains:()=>false},append(d){d.isConnected=true;}},querySelector:s=>s==='#dialog'?normalDialog:button,addEventListener:(n,fn)=>listeners.set(n,fn),removeEventListener:n=>listeners.delete(n),createElement(){return {dataset:{},style:{},open:false,isConnected:false,innerHTML:'',setAttribute(){},querySelector:()=>({}),addEventListener(){},showModal(){this.open=true;},close(){this.open=false;},remove(){this.isConnected=false;}};}};
 const win={localStorage:{getItem(){if(blockedStorage)throw Error('blocked');return JSON.stringify({settings:{motion}});},setItem(){throw Error('Splash must never write progress');}},sessionStorage:{getItem:k=>{if(blockedStorage)throw Error('blocked');return session.get(k);},setItem:(k,v)=>{if(blockedStorage)throw Error('blocked');session.set(k,v);}},matchMedia:()=>({matches:false})};
 const seen=[];doc.body.append=d=>{d.isConnected=true;seen.push(d);};
 const controller=createSplashController({doc,win,now:()=>clock,later:(fn,ms)=>{timers.set(++id,{fn,due:clock+ms});return id;},cancel:n=>timers.delete(n)});
 return {controller,seen,doc,normalDialog,session,timers,get focused(){return focused;},advance(ms){clock+=ms;for(const [id,t] of [...timers])if(t.due<=clock){timers.delete(id);t.fn();}},visibility(hidden){doc.hidden=hidden;listeners.get('visibilitychange')();},setDate(date){clock=Date.parse(date);}};
}
test('Every theme closes at exactly 3000ms, including reduced motion and blocked storage',()=>{
 assert.equal(SPLASH_DURATION,3000);
 for(const opts of [{},{motion:true},{blockedStorage:true}])for(const id of Object.keys(themes)){
  const f=fixture(opts);assert.equal(f.controller.show(id,true),true);const d=f.seen.at(-1);
  assert.equal(d.dataset.theme,id);if(opts.motion)assert.ok(d.className.includes('splash-static'));
  f.advance(2999);assert.equal(d.open,true);f.advance(1);assert.equal(d.open,false);assert.equal(d.isConnected,false);assert.equal(f.timers.size,0);assert.ok(f.focused);
 }
});
test('Skipping, quick update reloads and brief app switches do not replay or block gameplay',()=>{
 const f=fixture();f.controller.launch();const d=f.seen.at(-1);f.advance(200);f.controller.dismiss();assert.equal(d.open,false);assert.equal(f.timers.size,0);
 f.controller.launch();assert.equal(f.seen.length,1); // Avoid a second animation during an automatic update reload.
 f.visibility(true);f.advance(30000);f.visibility(false);assert.equal(f.seen.length,1);
 f.visibility(true);f.advance(30*60*1000);f.visibility(false);assert.equal(f.seen.length,2);f.controller.dismiss();
 f.normalDialog.open=true;assert.equal(f.controller.show(),false);assert.equal(f.seen.length,2);
});
test('Returning after a theme window switches back to generic, and preview never pins a theme',()=>{
 const f=fixture();f.controller.launch();f.advance(3000);f.controller.show('christmas',true);f.advance(3000);
 f.visibility(true);f.advance(1000);f.visibility(false);assert.equal(f.seen.length,2);
 f.visibility(true);f.setDate('2026-11-02T05:00:00Z');f.visibility(false);assert.equal(f.seen.at(-1).dataset.theme,'generic');
 f.controller.destroy();assert.equal(f.seen.at(-1).open,false);assert.equal(f.timers.size,0);
});
