const {chromium}=require('playwright');const fs=require('fs');
const URL='http://127.0.0.1:8765/index.html',MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
let fails=0;const errs=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});await ctx.addInitScript(MOCK);
 const mk=async(label,hash)=>{const p=await ctx.newPage();
  await p.addInitScript(pre=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem,r=Storage.prototype.removeItem;Storage.prototype.getItem=function(k){return g.call(this,pre+k)};Storage.prototype.setItem=function(k,v){return s.call(this,pre+k,v)};Storage.prototype.removeItem=function(k){return r.call(this,pre+k)}},label+':');
  p.on('pageerror',e=>errs.push(label+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(label+': '+m.text())});
  await p.goto(URL+(hash||''));await p.waitForSelector('#app .screen');return p};
 const txt=p=>p.evaluate(()=>document.body.innerText);

 console.log('== 1) Arschkarte-Wertung ==');
 const L=await mk('Lokal');
 const w=await L.evaluate(()=>{const q=['x',1000,''],y=['In welchem Jahr?',1989,'Jahr'],n=['x',-273.15,'°C'];
  return {low:arErr(1,q),high:arErr(10000,q),eq:arErr(500,q)-arErr(2000,q),t1:arDiffTxt(1100,q),t2:arDiffTxt(300,q),t3:arDiffTxt(5000,q),t4:arDiffTxt(1000,q),t5:arDiffTxt(0,q),
   y1:arDiffTxt(1950,y),y2:arDiffTxt(1988,y),y3:arDiffTxt(1989,y),yE:arErr(1950,y),n1:arDiffTxt(-200,n)}});
 ok(w.low>w.high,'Zu niedrig (1 statt 1000, Faktor 1000) ist schlimmer als zu hoch (10000, Faktor 10)');
 ok(Math.abs(w.eq)<1e-9,'Halb so viel und doppelt so viel zählen gleich');
 ok(w.t1==='10 % zu hoch'&&w.t2.startsWith('Faktor 3,3 zu niedrig')&&w.t3.startsWith('Faktor 5')&&w.t3.endsWith('zu hoch')&&w.t4==='exakt'&&w.t5.includes('unsinnig'),'Anzeige: '+[w.t1,w.t2,w.t3,w.t4,w.t5].join(' | '));
 ok(w.y1==='39 Jahre daneben'&&w.y2==='1 Jahr daneben'&&w.y3==='exakt'&&w.yE===39,'Jahreszahlen absolut: '+[w.y1,w.y2,w.y3].join(' | '));
 ok(w.n1.includes('°C daneben'),'Negative Antwort (Nullpunkt) absolut: '+w.n1);
 await L.evaluate(()=>{S.names=['Anna','Ben','Cem'];OPT.arsch.timer=0;OPT.arsch.rounds=5;pickGame('arsch');startSession('arsch');G.q=['Test',1000,''];G.g=[1,10000,1200];G.t=[0,0,0];arResult()});await sleep(900);
 ok(await L.evaluate(()=>G.cards[0]===1&&G.near[2]===1&&G.pts[2]>=2),'Auswertung: Anna (1) bekommt die Arschkarte, Cem (1200) ist am nächsten');
 const t=await txt(L);ok(t.includes('zu niedrig')&&t.includes('zu hoch'),'Ergebnisseite zeigt "zu hoch/zu niedrig"');

 console.log('== 5/10) Namen als Platzhalter, Statistik ==');
 await L.evaluate(()=>{S.names=['Spieler 1','Spieler 2','Spieler 3'];home();playersScreen()});await sleep(200);
 ok(await L.evaluate(()=>[...document.querySelectorAll('#pl input')].every((e,i)=>e.value===''&&e.placeholder==='Spieler '+(i+1))),'Eingabefelder leer, "Spieler 1/2/3" nur als Platzhalter');
 await L.fill('#pl input[data-i="0"]','Sascha');await L.evaluate(()=>savePlayers());await sleep(100);
 ok(await L.evaluate(()=>S.names[0]==='Sascha'&&S.names[1]==='Spieler 2'),'Leeres Feld wird beim Speichern zu "Spieler 2"');
 await L.evaluate(()=>playersScreen());await sleep(150);
 ok(await L.evaluate(()=>{const i=[...document.querySelectorAll('#pl input')];return i[0].value==='Sascha'&&i[1].value===''}),'Beim nächsten Öffnen: dein Name steht da, die anderen Felder bleiben leer');
 await L.evaluate(()=>{statRecord('Spieler 2','arsch',{w:1,p:3});statRecord('Sascha','arsch',{w:1,p:3})});
 ok(await L.evaluate(()=>{const s=stGet();return !s['n:spieler 2']&&!!s['n:sascha']}),'Standardnamen kommen nicht in die Statistik');
 await L.evaluate(()=>{S.names=['Spieler 1','Spieler 2'];onlineMenu()});await sleep(150);
 ok(await L.evaluate(()=>document.getElementById('myn').value===''),'Online-Name ist nicht mit "Spieler 1" vorbelegt');

 console.log('== 9) Anzeige oben rechts nur Info ==');
 const H=await mk('Host');await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk('Ben','#'+code);await B.fill('#myn','Ben');await B.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(300);
 ok(await A.evaluate(()=>{const e=document.getElementById('lv');return getComputedStyle(e).pointerEvents==='none'&&!e.textContent.includes('✕')&&e.textContent.includes(NET.code)}),'Code/Name-Anzeige ist nicht mehr klickbar und ohne ✕');
 ok(await A.evaluate(()=>getComputedStyle(document.getElementById('hm')).display!=='none'),'Verlassen läuft über den Hauptmenü-Knopf');

 console.log('== 2) Wellenlänge online: alle müssen zustimmen ==');
 await H.evaluate(()=>{OPT.wave.rounds=1;home();pickGame('wave');startSession('wave')});await sleep(500);
 await H.evaluate(()=>{waGuess()});await sleep(500);
 ok(await H.evaluate(()=>G.a===0&&G.gu.join()==='1,2'),'Hinweisgeber ist Hosti, Rater sind Anna und Ben');
 ok(await A.evaluate(()=>!!document.getElementById('wab')),'Annas Bildschirm hat "Ich stimme zu"');
 await A.click('#wab');await sleep(400);
 ok(await H.evaluate(()=>G.ag.has(1)&&!G.ag.has(2))&&await H.evaluate(()=>!!document.getElementById('wab')),'Anna stimmt zu, es wird noch nicht eingeloggt');
 // Anna verschiebt den Marker → Zustimmung weg
 const r=await A.evaluate(()=>{const e=document.getElementById('sp').getBoundingClientRect();return [e.left,e.top+e.height/2,e.width]});
 await A.mouse.move(r[0]+r[2]*.8,r[1]);await A.mouse.down();await A.mouse.up();await sleep(500);
 ok(await H.evaluate(()=>G.guess>70&&G.ag.size===0),'Marker verschoben → alle Zustimmungen zurückgesetzt (Marker '+await H.evaluate(()=>G.guess)+')');
 await H.evaluate(()=>waAgree());await sleep(200);   // Hinweisgeber darf nicht zustimmen
 ok(await H.evaluate(()=>G.ag.size===0),'Der Hinweisgeber kann nicht zustimmen');
 await A.click('#wab');await sleep(300);
 await B.click('#wab');await sleep(1000);
 ok(await H.evaluate(()=>!document.getElementById('wab')&&document.body.innerText.length>0)&&(await txt(A)).toLowerCase().includes('für'),'Beide stimmen zu → Marker wird eingeloggt, Auflösung erscheint');
 ok(await H.evaluate(()=>G.pts.reduce((a,x)=>a+x,0)>=0),'Punkte vergeben');
 // getrennter Rater zählt nicht
 await H.evaluate(()=>{G.t++;waHand()});await sleep(400);
 await H.evaluate(()=>{G.a=0;waGuess()});await sleep(300);
 await B.evaluate(()=>NET.conn.close());await sleep(500);
 await A.click('#wab');await sleep(900);
 ok(await H.evaluate(()=>!document.getElementById('wab')),'Getrennter Rater (Ben) wird nicht abgewartet');

 console.log('== 3) Spion online: geheime Abstimmung ==');
 await B.evaluate(([c,n])=>netJoin(c,n),[code,'Ben']);await sleep(700);
 const run=async(votes)=>{
   await H.evaluate(()=>{OPT.spy.rounds=3;home();pickGame('spy');startSession('spy')});await sleep(500);
   const pages=[H,A,B];
   for(const p of pages)await p.evaluate(()=>{const b=document.querySelector('[data-p] [data-sub="ok"]')||document.querySelector('[data-sub="ok"]');b&&b.click()});await sleep(700);
   await H.evaluate(()=>spyVote());await sleep(600);
   const own=await Promise.all(pages.map(p=>p.evaluate(()=>[...document.querySelectorAll('[data-sub="v"]')].map(x=>x.dataset.v))));
   return {pages,own};
 };
 let sp=await H.evaluate(()=>0);
 {
  const {pages,own}=await run();
  ok(own.every((o,i)=>o.length===2&&!o.includes(String(i))),'Jedes Gerät sieht nur die anderen zur Wahl, nicht sich selbst');
  const spy=await H.evaluate(()=>G.spy);
  for(let i=0;i<3;i++){const t=i===spy?(spy+1)%3:spy;await pages[i].evaluate(t=>document.querySelector('[data-sub="v"][data-v="'+t+'"]').click(),t);await sleep(250)}
  await sleep(700);
  ok(await H.evaluate(()=>G.cnt&&G.cnt[G.spy]===2),'Zwei Stimmen auf den Spion → enttarnt');
  ok(await pages[spy].evaluate(()=>!!document.querySelector('.locs')),'Der Spion bekommt "Letzte Chance: Ort raten"');
  await H.evaluate(()=>{const w=LOCS.findIndex(l=>l!==G.loc);spyEnd('caught',w)});await sleep(500);
  const t2=await txt(A);ok(t2.includes('Abstimmung:')&&t2.toLowerCase().includes('gruppe gewinnt'),'Ergebnis zeigt die Stimmenverteilung, Gruppe gewinnt');
 }
 {
  const {pages}=await run();
  for(let i=0;i<3;i++){await pages[i].evaluate(t=>document.querySelector('[data-sub="v"][data-v="'+t+'"]').click(),(i+1)%3);await sleep(250)}
  await sleep(700);
  const t3=(await txt(A)).toLowerCase();
  ok(t3.includes('gleichstand')&&t3.includes('spion gewinnt'),'Gleichstand (jeder 1 Stimme) → Spion kommt davon');
 }

 console.log('== 12) Update-Prüfung ==');
 let ver=null;
 const U=await ctx.newPage();U.on('pageerror',e=>errs.push('U: '+e.message));
 await U.route(/index\.html/,async route=>{const r=await route.fetch();let body=await r.text();if(ver)body=body.replace(/const APP_VERSION='[^']+'/,"const APP_VERSION='"+ver+"'");await route.fulfill({response:r,body})});
 await U.goto(URL);await U.waitForSelector('.gt');await U.evaluate(()=>settings());await sleep(200);
 const st=await txt(U);ok(/Version \d{4}-\d{2}-\d{2}\.\d+/.test(st)&&st.includes('feste Fragen')&&st.includes('Bluff-Fragen'),'Einstellungen zeigen Version und Anzahl der Fragen');
 await U.evaluate(()=>checkUpdate());await sleep(600);
 ok((await txt(U)).includes('neuesten Stand'),'Gleiche Version → "neuesten Stand"');
 ver='9999-01-01.1';await U.evaluate(()=>checkUpdate());await sleep(600);
 ok((await txt(U)).includes('9999-01-01.1')&&(await txt(U)).includes('Jetzt aktualisieren'),'Neue Version → Hinweis und Knopf');
 await Promise.all([U.waitForNavigation(),U.evaluate(()=>applyUpdate())]);await U.waitForSelector('.gt');
 ok(U.url().includes('u=')&&await U.evaluate(()=>APP_VERSION==='9999-01-01.1'),'Aktualisieren lädt die neue Version neu');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
