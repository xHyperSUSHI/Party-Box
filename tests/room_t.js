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
 console.log('== Warteraum & Lobby schließen ==');
 const H=await mk('Host');await H.evaluate(()=>{localStorage.setItem('pb_dnote','1')});
 await H.evaluate(()=>{S.names=['Eigen1','Eigen2']});
 await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk('Ben','#'+code);await B.fill('#myn','Ben');await B.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(700);
 const room=p=>p.evaluate(()=>({room:!!document.querySelector('.room'),txt:document.getElementById('app').innerText,qr:!!document.querySelector('.qrbox'),btn:[...document.querySelectorAll('#app button')].map(b=>b.textContent.trim())}));
 let r=await room(A);
 ok(r.room&&r.txt.includes(code)&&r.txt.includes('Anna')&&r.txt.includes('Du bist dabei als'),'Anna sieht den Warteraum mit Code und ihrem Namen');
 ok(r.txt.includes('Hosti')&&r.txt.includes('Ben')&&r.txt.includes('In der Lobby (3)')&&r.txt.includes('Host'),'... und alle in der Lobby (3), Host markiert');
 ok(r.txt.includes('Alle versammeln sich')&&!r.qr&&!r.btn.some(b=>/Spiel auswählen/.test(b)),'Statt des Host-Menüs: Hinweis „Alle versammeln sich“, kein QR-Code, kein „Spiel auswählen“');
 ok(r.txt.includes('Lass die App offen'),'Hinweis, die App offen zu lassen');
 // Host im Menü
 await H.evaluate(()=>home());await sleep(500);
 ok((await room(A)).txt.includes('sucht ein Spiel aus'),'Host auf der Startseite: „sucht ein Spiel aus“');
 await H.evaluate(()=>{pickGame('ttt')});await sleep(500);
 ok(!(await room(B)).room&&(await room(B)).txt.includes('Drei gewinnt')&&(await room(B)).txt.includes('Einstellungen'),'Host im Setup: Ben sieht das Setup live statt des Warteraums');
 await H.evaluate(()=>settings());await sleep(400);
 ok((await room(A)).txt.includes('in den Einstellungen'),'Host in den Einstellungen: „gerade in den Einstellungen“');
 // Zugang / Abgang
 await B.evaluate(()=>{NET.conn.close()});await sleep(1500);
 const off=await A.evaluate(()=>document.querySelectorAll('.lroom .lrf.off').length);
 ok(await H.evaluate(()=>!isOpen(NET.m[2]))&&(await room(A)).txt.length>0,'Ben getrennt: Warteraum bleibt bei Anna ('+off+' graue Figuren)');
 await sleep(6500);
 ok((await room(B)).room&&(await room(B)).txt.includes('Ben'),'Ben ist nach dem stillen Neuverbinden wieder im Warteraum');
 // Spiel startet -> Spiegelung
 await H.evaluate(()=>{OPT.ttt.vs='mensch';OPT.ttt.best=3;home();pickGame('ttt');startSession('ttt')});await sleep(800);
 r=await room(A);
 ok(!r.room&&await A.evaluate(()=>document.querySelectorAll('.ttc').length===9),'Spiel gestartet: Anna sieht das Spielbrett statt des Warteraums');
 // zurück ins Menü -> Warteraum
 await H.evaluate(()=>home());await sleep(600);
 ok((await room(A)).room,'Host zurück im Hauptmenü: Warteraum wieder da');
 // Lobby schließen: Abbrechen
 await H.evaluate(()=>lobbyScreen());await sleep(400);
 ok(await H.evaluate(()=>[...document.querySelectorAll('button')].some(b=>/Lobby schließen/.test(b.textContent))),'Host sieht „Lobby schließen“');
 await H.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/Lobby schließen/.test(b.textContent)).click());await sleep(200);
 ok(await H.evaluate(()=>!!document.getElementById('lcd')&&document.activeElement.textContent.includes('Abbrechen')),'Rückfrage erscheint, Fokus auf „Abbrechen“');
 await H.keyboard.press('Escape');await sleep(150);
 ok(await H.evaluate(()=>!document.getElementById('lcd')&&NET.on&&NET.host),'Esc schließt nur die Rückfrage, Lobby bleibt');
 await H.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/Lobby schließen/.test(b.textContent)).click());await sleep(200);
 await H.evaluate(()=>document.querySelector('#lcd button.sec').click());await sleep(150);
 ok(await H.evaluate(()=>NET.on&&NET.host&&!document.getElementById('lcd')),'„Abbrechen“ lässt die Lobby bestehen');
 // Lobby schließen: bestätigen
 await H.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/Lobby schließen/.test(b.textContent)).click());await sleep(200);
 await H.evaluate(()=>[...document.querySelectorAll('#lcd button')].find(b=>!b.classList.contains('sec')).click());await sleep(1200);
 ok(await H.evaluate(()=>!NET.on&&!NET.host&&NET.m.length===0&&S.names.join()==='Eigen1,Eigen2'),'Host: Lobby ist weg, eigene Spielerliste wiederhergestellt');
 ok(await H.evaluate(()=>document.body.innerText.includes('Party Box')&&!!document.querySelector('.gt')),'Host ist wieder auf der Startseite');
 for(const [n,p] of [['Anna',A],['Ben',B]]){const x=await p.evaluate(()=>document.body.innerText);ok(x.includes('Der Host hat die Lobby geschlossen'),n+' sieht „Der Host hat die Lobby geschlossen“');}
 ok(await A.evaluate(()=>!NET.on&&!localStorage.getItem('pb_sess')),'Anna: Sitzung vergessen (kein automatisches Wiederverbinden)');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
