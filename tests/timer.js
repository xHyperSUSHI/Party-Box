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

 console.log('== Lokal: Timer bei Arschkarte ==');
 const L=await mk('Lokal');
 await L.evaluate(()=>{OPT.arsch.rounds=5;OPT.arsch.timer=2;pickGame('arsch');startSession('arsch')});await sleep(200);
 // Spieler 1: nichts tippen
 await L.evaluate(()=>HF());await sleep(300);
 ok(await L.evaluate(()=>getComputedStyle(document.getElementById('tmr')).display==='block'&&document.getElementById('tmr').textContent.includes('⏱')),'Timer-Anzeige läuft');
 await sleep(2400);
 ok(await L.evaluate(()=>G.g[0]===null),'Spieler 1: keine Eingabe → keine Antwort (null)');
 ok(await L.evaluate(()=>document.querySelector('.opt')!==null),'Danach Tipp-Bildschirm');
 ok(await L.evaluate(()=>getComputedStyle(document.getElementById('tmr')).display==='none'),'Timer ist auf dem Tipp-Bildschirm weg');
 await L.evaluate(()=>document.querySelector('.opt').click());await sleep(600);
 // Spieler 2: Zahl tippen, Zeit ablaufen lassen
 await L.evaluate(()=>HF());await sleep(200);await L.fill('#g','500');await sleep(2400);
 ok(await L.evaluate(()=>G.g[1]===500),'Spieler 2: eingetippte Zahl zählt bei Zeitablauf');
 await L.evaluate(()=>document.querySelector('.opt').click());await sleep(600);
 // Spieler 3: normal abschicken, Timer muss danach weg sein
 await L.evaluate(()=>HF());await sleep(200);await L.fill('#g','900');await L.evaluate(()=>arSubmit());await sleep(2600);
 ok(await L.evaluate(()=>G.g[2]===900&&!!document.querySelector('.opt')),'Spieler 3: normales Abschicken, kein späterer Doppel-Auslöser');
 await L.evaluate(()=>document.querySelector('.opt').click());await sleep(900);
 const t=await txt(L);
 ok(t.toLowerCase().includes('keine antwort')&&!t.includes('NaN')&&!t.includes('undefined'),'Auswertung zeigt "Keine Antwort", kein NaN');
 ok(await L.evaluate(()=>G.pts[0]<2&&G.pts[1]+G.pts[2]>=2),'Wer nicht antwortet, bekommt keine Schätzpunkte (nur ggf. +1 fürs Tippen)');

 console.log('== Lokal: ohne Timer ==');
 await L.evaluate(()=>{home();OPT.arsch.timer=0;pickGame('arsch');startSession('arsch')});await sleep(200);
 await L.evaluate(()=>HF());await sleep(300);
 ok(await L.evaluate(()=>getComputedStyle(document.getElementById('tmr')).display==='none'),'Ohne Timer keine Anzeige');

 console.log('== Statistik ==');
 await L.evaluate(()=>{S.names=['Anna','Ben','Cem'];home();OPT.arsch.timer=30;OPT.arsch.rounds=5;pickGame('arsch');startSession('arsch');G.pts=[5,2,0];G.cards=[0,1,3];G.near=[2,0,0];arFinish()});await sleep(600);
 const st=await L.evaluate(()=>stGet());
 ok(st['n:anna']&&st['n:anna'].g.arsch.n===1&&st['n:anna'].g.arsch.w===1,'Sieger bekommt Sieg gespeichert');
 ok(st['n:cem'].g.arsch.w===0&&st['n:cem'].g.arsch.s.cards===3,'Verlierer: kein Sieg, Arschkarten gezählt');
 await L.evaluate(()=>{home();statsScreen()});await sleep(300);
 const stx=await txt(L);ok(stx.includes('Anna')&&stx.includes('Arschkarte')&&stx.includes('Siegquote'),'Statistik-Screen zeigt Spieler und Spiel');
 await L.screenshot({path:'stats.png'});
 await L.evaluate(()=>{window.confirm=()=>true;statsScreen()});
 await L.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/zurücksetzen/.test(x.textContent));b.click()});await sleep(200);
 ok(await L.evaluate(()=>Object.keys(stGet()).length===0),'Zurücksetzen löscht die Statistik');
 ok(await L.evaluate(()=>{home();return document.querySelector('[aria-label="Statistik"]')!==null}),'📊-Knopf auf der Startseite');

 console.log('== Online: Timer parallel + Statistik auf den Clients ==');
 const H=await mk('Host');await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk('Ben','#'+code);await B.fill('#myn','Ben');await B.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(300);
 await H.evaluate(()=>{OPT.arsch.rounds=5;OPT.arsch.timer=3;ARTIP_MS=2500;home();pickGame('arsch');startSession('arsch')});await sleep(700);
 const pill=p=>p.evaluate(()=>{const e=document.getElementById('tmr');return getComputedStyle(e).display==='block'?e.textContent:null});
 ok(!!(await pill(H))&&!!(await pill(A))&&!!(await pill(B)),'Timer läuft bei Host, Anna und Ben: '+[await pill(H),await pill(A),await pill(B)].join(' / '));
 await A.fill('[data-f="g"]','77');           // eingetippt, nicht abgeschickt
 await sleep(4600);                           // Schätzzeit + Kulanz
 ok(await H.evaluate(()=>G.g[1]===77),'Annas eingetippte Zahl wurde bei Zeitablauf automatisch abgeschickt');
 ok(await H.evaluate(()=>G.g[0]===null&&G.g[2]===null),'Host und Ben: keine Antwort');
 ok(await A.evaluate(()=>!!document.querySelector('[data-sub="t"]')),'Phase 2: Tippen');
 await A.evaluate(()=>document.querySelector('[data-sub="t"][data-v="2"]').click());
 await sleep(4600);
 ok(await H.evaluate(()=>PAR===null),'Nach der Tippzeit ist die Runde ausgewertet');
 for(const [n,p] of [['Host',H],['Anna',A],['Ben',B]]){const t=await txt(p);ok(t.toLowerCase().includes('richtige antwort'),n+' sieht die Auswertung')}
 ok(!(await pill(H))&&!(await pill(A))&&!(await pill(B)),'Timer-Anzeigen sind überall weg');
 ok(await H.evaluate(()=>G.pts[1]>=2&&G.pts[0]===0),'Anna (einzige Antwort) gewinnt die Runde');
 await H.evaluate(()=>arFinish());await sleep(600);
 ok(await A.evaluate(()=>{const s=stGet()['n:anna'];return s&&s.g.arsch&&s.g.arsch.n===1}),'Annas Gerät hat ihr Spiel selbst gespeichert');
 ok(await B.evaluate(()=>{const s=stGet()['n:ben'];return s&&s.g.arsch&&s.g.arsch.n===1&&s.g.arsch.w===0}),'Bens Gerät: gespielt, nicht gewonnen');
 ok(await H.evaluate(()=>Object.keys(stGet()).length===3),'Host-Gerät hat alle drei gespeichert');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
