const {chromium}=require('playwright');const fs=require('fs');
const URL='http://127.0.0.1:8765/index.html',MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
let fails=0;const errs=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:390,height:800}});await ctx.addInitScript(MOCK);
 async function mk(label,hash,cid){const p=await ctx.newPage();await p.addInitScript(pre=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem,r=Storage.prototype.removeItem;Storage.prototype.getItem=function(k){return g.call(this,pre+k)};Storage.prototype.setItem=function(k,v){return s.call(this,pre+k,v)};Storage.prototype.removeItem=function(k){return r.call(this,pre+k)}},label+':');p.on('pageerror',e=>errs.push(label+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(label+': '+m.text())});
  await p.goto(URL+(hash||''));await p.waitForSelector('#app .screen');await p.evaluate(([l,c])=>{window.Peer=window.__MockPeer;NET.cid=c},[label,cid]);return p}
 const H=await mk('Host','','cid-host');await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const names=()=>H.evaluate(()=>NET.m.map((m,i)=>m.name+(i===0||(m.conn&&m.conn.open)?'':'(zu)')));

 console.log('1) Doppelter Beitritt vom selben Gerät (Doppeltippen)');
 const L=await mk('Leni','#'+code,'cid-leni');await L.fill('#myn','Leni');
 await L.evaluate(c=>{netJoinStart(c);netJoinStart(c)},code);await sleep(800);
 let n=await names();ok(JSON.stringify(n)==='["Hosti","Leni"]','Nur ein Leni in der Lobby: '+JSON.stringify(n));
 ok(await L.evaluate(()=>NET.client&&NET.got&&NET.conn&&NET.conn.open),'Leni ist verbunden');

 console.log('2) Neuer Beitritt desselben Geräts, während die alte Verbindung noch offen wirkt');
 await L.evaluate(([c])=>netJoin(c,'Leni'),[code]);await sleep(800);
 n=await names();ok(JSON.stringify(n)==='["Hosti","Leni"]','Weiterhin nur ein Leni: '+JSON.stringify(n));

 console.log('3) Zweites Gerät mit derselben ID (z. B. App neu gestartet), alte Verbindung hängt noch');
 const L2=await mk('Leni-neu','#'+code,'cid-leni');await L2.fill('#myn','Leni');await L2.evaluate(c=>netJoinStart(c),code);await sleep(800);
 n=await names();ok(JSON.stringify(n)==='["Hosti","Leni"]','Platz wurde übernommen, kein "Leni 2": '+JSON.stringify(n));
 ok(await H.evaluate(()=>NET.m[1].conn&&NET.m[1].conn.open),'Neue Verbindung ist die aktive');

 console.log('4) Anderes Gerät mit gleichem Namen (andere ID) = neuer Spieler');
 const X=await mk('Leni-fremd','#'+code,'cid-fremd');await X.fill('#myn','Leni');await X.evaluate(c=>netJoinStart(c),code);await sleep(800);
 n=await names();ok(n.length===3&&n[2].startsWith('Leni 2'),'Zweite Person heißt "Leni 2": '+JSON.stringify(n));

 console.log('5) Alter Client ohne ID (Abwärtskompatibilität)');
 const O=await mk('Alt','#'+code,'x');await O.fill('#myn','Opa');
 await O.evaluate(c=>{const orig=NET;netJoinStart(c)},code);await sleep(600);
 ok((await names()).length===4,'Weiterer Spieler erscheint normal: '+JSON.stringify(await names()));

 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
