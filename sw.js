/* Party Box – Service Worker: Netzwerk zuerst (immer die neueste Version), bei fehlendem Netz aus dem Cache. */
const CACHE='pbox-v12';
const ASSETS=[
  'index.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'apple-touch-icon.png',
  'favicon-32.png',
  'css/style.css',
  'lib/peerjs.min.js',
  'lib/qrcode.js',
  'js/01-core.js',
  'js/02-fragen.js',
  'js/03-fragen-kategorien.js',
  'js/04-info.js',
  'js/05-woerter-twists.js',
  'js/06-ui-basis.js',
  'js/07-ui-einstellungen.js',
  'js/08-ui-session.js',
  'js/09-charakter.js',
  'js/games/arsch.js',
  'js/games/pant.js',
  'js/games/spy.js',
  'js/games/wave.js',
  'js/games/bluff-daten.js',
  'js/games/bluff.js',
  'js/games/react.js',
  'js/games/bomb.js',
  'js/games/c4.js',
  'js/games/most.js',
  'js/games/taboo-daten.js',
  'js/games/taboo.js',
  'js/games/hilo.js',
  'js/games/memo.js',
  'js/games/hang.js',
  'js/games/code.js',
  'js/games/ttt.js',
  'js/games/dots.js',
  'js/games/slf.js',
  'js/games/bs.js',
  'js/40-kategorien-trinken.js',
  'js/games/never.js',
  'js/games/kings.js',
  'js/41-startseite.js',
  'js/50-net-basis.js',
  'js/51-net-rechte.js',
  'js/52-net-host.js',
  'js/53-net-client.js',
  'js/60-vollbild-pwa.js',
  'js/61-tastatur.js',
  'js/62-diagnose.js',
  'js/63-eingaben.js',
  'js/99-boot.js'
];
const INDEX=new URL('index.html',self.registration.scope).href;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(ASSETS.map(a=>fetch(new Request(a,{cache:'no-cache'})).then(r=>{if(!r.ok)throw new Error(a);return c.put(new URL(a,self.registration.scope).href,r)})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return;   // PeerJS/WebSocket und alles Fremde läuft am Cache vorbei
  if(u.searchParams.has('c'))return;      // Update-Prüfung der App: immer echt ans Netz (offline soll sie scheitern)
  const isIndex=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('/index.html');
  e.respondWith((async()=>{
    const c=await caches.open(CACHE);
    try{
      const res=await Promise.race([fetch(r,{cache:'no-cache'}),new Promise((_,j)=>setTimeout(j,5000))]);
      if(res&&res.ok&&res.type==='basic')c.put(isIndex?INDEX:r.url,res.clone());
      return res;
    }catch(_){
      const hit=await c.match(isIndex?INDEX:r.url);
      return hit||(isIndex?Response.error():Response.error());
    }
  })());
});
