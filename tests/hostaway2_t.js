const {chromium}=require('playwright');const fs=require('fs');
const URL='http://127.0.0.1:8765/index.html',MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
let fails=0;const errs=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:390,height:800}});await ctx.addInitScript(MOCK);
 const mk=async(label,hash)=>{const p=await ctx.newPage();
  await p.addInitScript(pre=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem,r=Storage.prototype.removeItem;Storage.prototype.getItem=function(k){return g.call(this,pre+k)};Storage.prototype.setItem=function(k,v){return s.call(this,pre+k,v)};Storage.prototype.removeItem=function(k){return r.call(this,pre+k)}},label+':');
  p.on('pageerror',e=>errs.push(label+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(label+': '+m.text())});
  await p.goto(URL+(hash||''));await p.waitForSelector('#app .screen');return p};
 const txt=p=>p.evaluate(()=>document.body.innerText);
 const L=await mk('Lokal');

 let t;
 console.log('== Tote Verbindung nach Hintergrund ==');
 const H=await mk('Host');await H.evaluate(()=>{localStorage.setItem('pb_dnote','1')});
 await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk('Ben','#'+code);await B.fill('#myn','Ben');await B.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(700);
 // Verbindung Anna <-> Host „stirbt leise“: weiter als offen markiert, aber nichts kommt an
 await A.evaluate(()=>{window.__oldConn=NET.conn;NET.conn.send=function(){}});
 await H.evaluate(()=>{NET.m[1].conn.send=function(){}});
 await A.evaluate(()=>{NET.lastHost=Date.now()-20000;hbTick()});await sleep(300);
 ok(await A.evaluate(()=>!!NET.wait&&NET.conn.open===true),'Anna: Host stumm, Verbindung wirkt noch „offen“ → Wartebanner');
 await A.evaluate(()=>{NET.wait.t0=Date.now()-11000});
 await sleep(5800);
 ok(await A.evaluate(()=>NET.conn!==window.__oldConn&&NET.conn&&NET.conn.open&&!NET.wait&&!document.getElementById('hwait')),'Nach 10 s Stille baut Anna die Verbindung neu auf und ist wieder da');
 ok(await H.evaluate(()=>NET.m.length===3&&NET.m.some(m=>m.name==='Anna'&&isOpen(m)&&m.conn.send.toString().length>30)&&!NET.m.some(m=>/Anna 2/.test(m.name))),'Host: Anna ist mit neuer Verbindung wieder in der Lobby (kein „Anna 2“, keine doppelte Anna)');
 ok(await A.evaluate(()=>!!document.querySelector('.room')),'Anna sieht wieder den Warteraum');
 // Client kommt aus dem Hintergrund zurück
 await B.evaluate(()=>{NET.conn.send=function(){}});await H.evaluate(()=>{NET.m[2].conn.send=function(){}});
 await B.evaluate(()=>{NET.lastHost=Date.now()-5000;document.dispatchEvent(new Event('visibilitychange'))});
 await sleep(300);
 ok(await B.evaluate(()=>!NET.wait),'Zurück in die App: noch kein Alarm (Host darf sich 6 s Zeit lassen)');
 await H.evaluate(()=>{sendTo(NET.m[1],{t:'hb'})});   // nur Anna bekommt Lebenszeichen; Ben nicht
 await sleep(6600);
 ok(await B.evaluate(()=>!!NET.wait||(NET.conn&&NET.conn.open&&!NET.wait&&Date.now()-NET.lastHost<20000)),'Ben: nach 6 s ohne Host-Meldung läuft die Wiederverbindung an');
 await sleep(6000);
 ok(await H.evaluate(()=>NET.m.length===3&&NET.m.some(m=>m.name==='Ben'&&isOpen(m))),'Ben ist wieder verbunden');
 // im laufenden Spiel behält ein Spieler seinen Platz
 await H.evaluate(()=>{OPT.ttt.vs='mensch';OPT.ttt.best=3;home();pickGame('ttt');startSession('ttt')});await sleep(700);
 const idxA=await H.evaluate(()=>NET.m.findIndex(m=>m.name==='Anna'));
 await A.evaluate(()=>{NET.conn.send=function(){}});await H.evaluate(i=>{NET.m[i].conn.send=function(){}},idxA);
 await A.evaluate(()=>{NET.lastHost=Date.now()-20000;hbTick();NET.wait.t0=Date.now()-11000});
 await sleep(5800);
 ok(await H.evaluate(i=>NET.m[i].name==='Anna'&&isOpen(NET.m[i])&&NET.m.length===3,idxA)&&await A.evaluate(()=>document.querySelectorAll('.ttc').length===9),'Im laufenden Spiel: Anna behält ihren Platz und sieht sofort wieder das Spielbrett');
 await H.evaluate(()=>home());await sleep(500);
 // Host-Peer zerstört
 await H.evaluate(()=>{window.__oldPeer=NET.peer;NET.peer.destroyed=true});
 await H.evaluate(()=>hbTick());await sleep(500);
 ok(await H.evaluate(()=>NET.peer!==window.__oldPeer&&!NET.reviving&&!!NET.peer),'Host: zerstörter Peer wird unter derselben Lobby-ID neu angemeldet');
 const C=await mk('Cem','#'+code);await C.fill('#myn','Cem');await C.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===4&&NET.m.some(m=>m.name==='Cem'&&isOpen(m)),null,{timeout:8000}).catch(()=>{});
 ok(await H.evaluate(()=>NET.m.length===4&&NET.m.some(m=>m.name==='Cem'&&isOpen(m))),'Neue Mitspieler können nach dem Neustart des Peers wieder beitreten');
 // Peer „disconnected“ -> reconnect
 await H.evaluate(()=>{window.__rc=0;NET.peer.disconnected=true;NET.peer.reconnect=function(){window.__rc++}});
 await H.evaluate(()=>hbTick());
 ok(await H.evaluate(()=>window.__rc===1),'Host: getrennter Vermittlungsserver → reconnect()');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
