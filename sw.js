/* Vaihda VERSION jokaisen julkaistavan resurssimuutoksen yhteydessä. */
'use strict';
const VERSION='1.5.2';
const ROOT=new URL('./',self.location.href);
const PREFIX='fysiikka-sprintti-'+encodeURIComponent(ROOT.pathname)+'-';
const CACHE=PREFIX+VERSION;
const FILES=[
  './index.html','./manifest.webmanifest','./css/game.css',
  './js/theme.js','./js/core.js','./js/generators-forces.js',
  './js/generators-friction.js','./js/generators-motion.js',
  './js/generators-measurement.js','./js/diagrams.js','./js/session.js',
  './js/media.js','./js/lessons.js','./js/math.js','./js/app.js','./js/changelog.js','./js/pwa.js',
  './assets/fonts/Manrope-Variable.ttf','./assets/fonts/OFL.txt',
  './assets/icons/icon.svg','./assets/icons/icon-192.png',
  './assets/icons/icon-512.png','./assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './suunnitelma.html','./suunnitelma.css','./suunnitelma.js','./ohje.html',
  './README.md','./MATERIAALIKARTOITUS.md','./TOTEUTUS.md','./TOTEUTUSSUUNNITELMA.md'
];
const ASSETS=new Set(FILES.map(file=>new URL(file,ROOT).href));
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES.map(file=>new Request(new URL(file,ROOT),{cache:'reload'})))));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')event.waitUntil(self.skipWaiting());});
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==ROOT.origin)return;
  const home=url.pathname===ROOT.pathname||url.pathname===new URL('index.html',ROOT).pathname;
  const key=home?new URL('index.html',ROOT).href:url.href;
  if(!ASSETS.has(key))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE),cached=await cache.match(key);
    if(cached)return cached;
    // Vain oman julkaisun ennalta nimetyt resurssit. Virhevastauksia ei tallenneta.
    const response=await fetch(req);
    if(response.ok)await cache.put(key,response.clone());
    return response;
  })());
});
