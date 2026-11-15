const {chromium}=require('playwright');const fs=require('fs');
const URL='http://127.0.0.1:8765/index.html',MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
let fails=0;const errs=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:390,height:800}});await ctx.addInitScript(MOCK);
 const mk=async(label,hash,vp)=>{const p=await ctx.newPage();if(vp)await p.setViewportSize(vp);
  await p.addInitScript(pre=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem,r=Storage.prototype.removeItem;Storage.prototype.getItem=function(k){return g.call(this,pre+k)};Storage.prototype.setItem=function(k,v){return s.call(this,pre+k,v)};Storage.prototype.removeItem=function(k){return r.call(this,pre+k)}},label+':');
  p.on('pageerror',e=>errs.push(label+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(label+': '+m.text())});
  await p.goto(URL+(hash||''));await p.waitForSelector('#app .screen');return p};
 const vis=p=>p.evaluate(()=>getComputedStyle(document.getElementById('hm')).display!=='none');
 const txt=p=>p.evaluate(()=>document.body.innerText);

 console.log('== Lokal ==');
 const L=await mk('Lokal');
 ok(!(await vis(L)),'Startseite: kein Hauptmenü-Knopf');
 await L.evaluate(()=>{OPT.arsch.timer=0;pickGame('arsch')});await sleep(200);
 ok(!(await vis(L)),'Spiel-Setup: kein Knopf');
 await L.evaluate(()=>startSession('arsch'));await sleep(200);
 ok(await vis(L),'Im Spiel (Weitergeben-Bildschirm): Knopf sichtbar');
 await L.evaluate(()=>HF());await sleep(200);
 ok(await vis(L),'Im Spiel (Schätzen): Knopf sichtbar');
 await L.screenshot({path:'hm-phone.png'});
 await L.click('#hm');await sleep(200);
 ok(await L.evaluate(()=>!!document.getElementById('hmc')),'Rückfrage erscheint');
 await L.evaluate(()=>[...document.querySelectorAll('#hmc button')].find(x=>/Weiter spielen/.test(x.textContent)).click());await sleep(100);
 ok(await L.evaluate(()=>!document.getElementById('hmc')&&!!document.getElementById('g')),'"Weiter spielen": Dialog weg, Spiel läuft weiter (Eingabefeld da)');
 await L.click('#hm');await sleep(150);
 await L.evaluate(()=>[...document.querySelectorAll('#hmc button')].find(x=>/ins Hauptmenü/.test(x.textContent)).click());await sleep(300);
 ok((await txt(L)).includes('Such dir ein Spiel')&&!(await vis(L)),'"Ja": Hauptmenü, Knopf wieder weg');
 ok(await L.evaluate(()=>getComputedStyle(document.getElementById('tmr')).display==='none'),'Kein Timer mehr sichtbar');
 // anderes Spiel: Pantomime Weitergeben-Screen & Spion
 await L.evaluate(()=>{pickGame('react');startSession('react')});await sleep(200);
 ok(await vis(L),'Auch bei Reflex sichtbar');
 await L.evaluate(()=>{home()});
 // Spielende
 await L.evaluate(()=>{OPT.arsch.rounds=5;startSession('arsch');G.pts=[3,1,0];arFinish()});await sleep(500);
 ok(!(await vis(L)),'Endergebnis: Knopf weg (dort gibt es "Alle Spiele")');
 await L.evaluate(()=>{startSession('arsch')});await sleep(150);
 ok(await vis(L),'"Nochmal" zeigt ihn wieder');
 await L.evaluate(()=>{settings()});await sleep(100);
 ok(!(await vis(L)),'Einstellungen: kein Knopf');

 console.log('== Online ==');
 const H=await mk('Host');await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===2&&NET.m[1].conn&&NET.m[1].conn.open);await sleep(300);
 ok(!(await vis(H)),'Lobby: kein Knopf');
 await H.evaluate(()=>{OPT.arsch.timer=0;home();pickGame('arsch');startSession('arsch')});await sleep(600);
 ok(await vis(H),'Host im Spiel: Knopf sichtbar (auch über dem Formular-Overlay)');
 ok(await vis(A),'Client: Knopf ebenfalls sichtbar (verlässt die Lobby)');
 await H.click('#hm');await sleep(200);
 ok((await H.evaluate(()=>document.querySelector('#hmc').innerText)).includes('für alle Mitspieler'),'Host-Rückfrage warnt: beendet für alle');
 await H.evaluate(()=>[...document.querySelectorAll('#hmc button')].find(x=>/ins Hauptmenü/.test(x.textContent)).click());await sleep(700);
 ok(await H.evaluate(()=>PAR===null&&document.getElementById('app').innerText.includes('Such dir ein Spiel')),'Host: Hauptmenü, Spiel beendet');
 ok((await txt(A)).includes('Such dir ein Spiel')&&!(await txt(A)).includes('Weiter zum Tippen'),'Anna sieht ebenfalls das Hauptmenü');
 ok(await A.evaluate(()=>NET.client&&NET.conn&&NET.conn.open),'Anna bleibt in der Lobby verbunden');

 console.log('== iPad-Layout (Optik) ==');
 const I=await mk('Ipad','',{width:1180,height:820});
 await I.evaluate(()=>{OPT.arsch.timer=30;pickGame('arsch');startSession('arsch');HF()});await sleep(900);
 await I.screenshot({path:'hm-ipad.png'});
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
