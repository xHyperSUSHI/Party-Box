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
 console.log('== Host kurz weg (Variante A) ==');
 const H=await mk('Host');await H.evaluate(()=>{localStorage.setItem('pb_dnote','1')});
 await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk('Ben','#'+code);await B.fill('#myn','Ben');await B.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(400);
 // Kontrolle: ohne eingefrorene Zeit fliegt ein stummes Gerät raus
 await H.evaluate(()=>{hbPrev=Date.now();NET.m[2].last=Date.now()-30000;hbTick()});await sleep(300);
 ok(await H.evaluate(()=>!isOpen(NET.m[2])),'Kontrolle: Ein 30 s stummes Gerät wird (ohne Lücke) getrennt');
 await B.evaluate(c=>netJoin(NET.code,NET.name),code);await sleep(1200);
 ok(await H.evaluate(()=>NET.m.length===3&&isOpen(NET.m[2])),'Ben ist wieder drin (gleicher Platz)');
 // Host war eingefroren: Gnadenfrist
 await H.evaluate(()=>{NET.m.forEach((m,i)=>{if(i>0)m.last=Date.now()-60000});hbPrev=Date.now()-60000;hbTick()});await sleep(300);
 ok(await H.evaluate(()=>NET.m.every((m,i)=>i===0||isOpen(m))),'Host 60 s eingefroren: niemand wird rausgeworfen');
 ok(await H.evaluate(()=>NET.m.every((m,i)=>i===0||Date.now()-m.last<3000)),'Alle Verbindungen bekommen eine frische Frist');
 // Zeitfenster verlängern
 await H.evaluate(()=>{Object.assign(OPT.bluff,{timer:60,rounds:3,cats:{}});home();pickGame('bluff');startSession('bluff')});await sleep(900);
 const e0=await H.evaluate(()=>PAR.end);
 await H.evaluate(()=>{hbPrev=Date.now()-30000;hbTick()});await sleep(200);
 const e1=await H.evaluate(()=>PAR.end);
 ok(e1-e0>=29000&&e1-e0<=31500,'Laufendes Zeitfenster wird um die Abwesenheit verlängert (+'+Math.round((e1-e0)/1000)+' s)');
 // Client wartet
 const scr0=await A.evaluate(()=>document.getElementById('app').innerText.length);
 const st=await A.evaluate(()=>{NET.lastHost=Date.now()-20000;hbTick();const h=document.getElementById('hwait');return {w:!!NET.wait,b:h?h.textContent:'',app:document.getElementById('app').innerText.length,bye:document.body.innerText.includes('Verbindung zur Lobby getrennt')}});
 ok(st.w&&st.b.includes('Host ist kurz weg'),'Anna: Banner „Der Host ist kurz weg“ statt Abbruch ('+st.b+')');
 ok(st.app>10&&!st.bye,'Das letzte Bild bleibt stehen, kein „getrennt“-Bildschirm');
 await H.evaluate(()=>{sendTo(NET.m[1],{t:'hb'})});await sleep(400);
 ok(await A.evaluate(()=>!NET.wait&&!document.getElementById('hwait')),'Sobald der Host sich meldet, verschwindet das Banner von selbst');
 // Verbindung wirklich weg -> stilles Neuverbinden
 await A.evaluate(()=>{NET.conn.close()});await sleep(500);
 ok(await A.evaluate(()=>!!NET.wait&&!!document.getElementById('hwait')),'Verbindung geschlossen: Anna wartet');
 await sleep(6500);
 ok(await A.evaluate(()=>NET.conn&&NET.conn.open&&!NET.wait&&!document.getElementById('hwait')),'Anna verbindet sich still neu, Banner weg');
 ok(await H.evaluate(()=>NET.m.length===3&&isOpen(NET.m[1])&&NET.m[1].name==='Anna'),'Host: Anna hat ihren Platz zurück (kein „Anna 2“)');
 ok(await A.evaluate(()=>document.querySelectorAll('input[data-f]').length>0||document.body.innerText.includes('schreib')||document.getElementById('app').innerText.length>10),'Anna sieht wieder das laufende Spiel');
 // Aufgeben nach der Frist
 await A.evaluate(()=>{NET.wait={t0:Date.now()-200000,iv:null};NET.wait.iv=setInterval(()=>{},999999);NET.lastHost=Date.now()-20000;NET.conn.close();});
 await A.evaluate(()=>{netWaitStop();NET.wait=null;netWaitStart();NET.wait.t0=Date.now()-190000});await sleep(5600);
 ok(await A.evaluate(()=>document.body.innerText.includes('Verbindung zur Lobby getrennt')&&!document.getElementById('hwait')),'Nach 3 Minuten ohne Host: „Verbindung zur Lobby getrennt“ mit Knopf zum erneuten Verbinden');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
