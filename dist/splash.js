import {themes,themeForDate,puzzleArtwork,themeSchedule} from './splash-themes.js';
export {themes,themeForDate,themeSchedule};
export const SPLASH_DURATION=3000;
const REOPEN_AFTER=30*60*1000,RELOAD_GRACE=12000;
// Only presentation timestamps use session storage; game progress is never changed here.
export function createSplashController({doc=document,win=window,now=()=>Date.now(),later=setTimeout,cancel=clearTimeout}={}){
 let active=null,hiddenAt=null,lastTheme=themeForDate(new Date(now()));
 function dismiss(){
  if(!active)return;
  const {dialog,timer,previous}=active;active=null;cancel(timer);
  if(dialog.open)dialog.close();dialog.remove();
  const focus=previous?.isConnected&&previous!==doc.body?previous:doc.querySelector('#menu-toggle');focus?.focus({preventScroll:true});
 }
 function show(id=themeForDate(new Date(now())),preview=false){
  if(doc.hidden||doc.querySelector('#dialog')?.open)return false;
  const theme=themes[id]||themes.generic;id=themes[id]?id:'generic';
  dismiss();const dialog=doc.createElement('dialog');
  if(typeof dialog.showModal!=='function')return false;
  let reduced=doc.body.classList.contains('reduce-motion');
  try{reduced ||= !!JSON.parse(win.localStorage.getItem('wordgarden-v1')||'null')?.settings?.motion;}catch{}
  reduced ||= !!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  dialog.id='splash-screen';dialog.className='puzzle-splash'+(reduced?' splash-static':'');
  dialog.setAttribute('aria-labelledby','splash-title');dialog.setAttribute('aria-describedby','splash-subtitle');
  dialog.dataset.theme=id;
  dialog.style.cssText=`--splash-bg:${theme.bg};--splash-ink:${theme.ink};--splash-muted:${theme.muted};--splash-accent:${theme.accent}`;
  dialog.innerHTML=`<div class="splash-content"><span class="splash-kicker">THE PUZZLE COLLECTION</span><span class="splash-season">${theme.label}</span><div class="splash-art">${puzzleArtwork(id)}</div><h1 id="splash-title">${theme.title}</h1><p id="splash-subtitle">${theme.subtitle}</p><div class="splash-progress" aria-hidden="true"><span></span></div><button class="splash-skip" type="button">${preview?'Close preview':'Play now'} <span aria-hidden="true">→</span></button></div>`;
  const previous=doc.activeElement;doc.body.append(dialog);
  active={dialog,previous,timer:null};dialog.querySelector('button').onclick=dismiss;
  dialog.addEventListener('cancel',e=>{e.preventDefault();dismiss();});
  try{dialog.showModal();}catch{dismiss();return false;}
  // One timer closes every design after three seconds, even with motion disabled.
  active.timer=later(dismiss,SPLASH_DURATION);
  if(!preview){lastTheme=id;try{win.sessionStorage.setItem('wordgarden-splash-last',String(now()));}catch{}}
  return true;
 }
 function launch(){
  let recent=0;try{recent=Number(win.sessionStorage.getItem('wordgarden-splash-last'));}catch{}
  const elapsed=now()-recent;
  if(!recent||elapsed<0||elapsed>=RELOAD_GRACE)show();
 }
 function onVisibility(){
  if(doc.hidden){hiddenAt=now();dismiss();return;}
  const current=themeForDate(new Date(now())),away=hiddenAt!==null?now()-hiddenAt:0;hiddenAt=null;
  if(current!==lastTheme||away>=REOPEN_AFTER)show(current);
 }
 doc.addEventListener('visibilitychange',onVisibility);
 return {show,dismiss,launch,destroy(){dismiss();doc.removeEventListener('visibilitychange',onVisibility);}};
}
let controller=null;
if(typeof document!=='undefined'){
 controller=createSplashController();controller.launch();
}
export function previewSplash(id){return controller?.show(id,true);}
