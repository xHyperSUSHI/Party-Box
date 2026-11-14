/* Party Box – Service Worker: Netzwerk zuerst (immer die neueste Version), bei fehlendem Netz aus dem Cache. */
const CACHE='pbox-v1';
const ASSETS=['index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','favicon-32.png'];
const INDEX=new URL('index.html',self.registration.scope).href;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
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
      const res=await Promise.race([fetch(r),new Promise((_,j)=>setTimeout(j,5000))]);
      if(res&&res.ok&&res.type==='basic')c.put(isIndex?INDEX:r.url,res.clone());
      return res;
    }catch(_){
      const hit=await c.match(isIndex?INDEX:r.url);
      return hit||(isIndex?Response.error():Response.error());
    }
  })());
});
