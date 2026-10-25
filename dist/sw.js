// Bump this version for every release. Never delete progress storage here.
const CACHE='wordgarden-shell-26c5bd12fd6f', BASE=new URL('./',self.location.href), ASSETS=['./','./index.html','./app.js','./core.js','./words.js','./semantic.js','./semantic-ui.js','./semantic-data.js','./puzzles.js','./puzzle-ui.js','./ladder-words.js','./style.css','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./credits.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(p=>new Request(new URL(p,BASE).href,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('wordgarden-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
// Serve one coherent cached version; opening the app separately checks sw.js for updates.
event.respondWith(caches.open(CACHE).then(async cache=>{if(event.request.mode==='navigate')return (await cache.match(event.request,{ignoreSearch:true}))||(await cache.match(new URL('./index.html',BASE).href))||fetch(event.request);return (await cache.match(event.request))||fetch(event.request);}));});
