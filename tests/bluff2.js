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
 console.log('== Info-Texte Bluff ==');
 const r=await L.evaluate(()=>{const miss=BQ.filter(q=>!qInfo(q)).map(q=>q[1]);
  const leak=BQ.filter(q=>{const i=qInfo(q).toLowerCase(),a=String(q[1]).toLowerCase();return i.includes(a)||a.split(/[\s()]+/).some(w=>w.length>=5&&i.includes(w))}).map(q=>q[1]);
  return {n:BQ.length,miss,leak}});
 ok(r.miss.length===0,`Alle ${r.n} Bluff-Fragen haben eine Info`+(r.miss.length?': '+r.miss:''));
 ok(r.leak.length===0,'Keine Info enthält die Antwort (oder Wörter daraus)'+(r.leak.length?': '+r.leak:''));

 console.log('== Lokal: Timer + Fragezeichen ==');
 await L.evaluate(()=>{S.names=['Anna','Ben','Cem'];OPT.bluff.rounds=3;OPT.bluff.timer=2;BVOTE_MS=1500;pickGame('bluff');startSession('bluff');G.q=BQ.find(q=>q[1]==='Canberra');HF()});await sleep(250);
 ok(await L.evaluate(()=>!!document.querySelector('.qm')&&document.querySelector('.qinfo').hidden&&getComputedStyle(document.getElementById('tmr')).display==='block'),'Schreib-Bildschirm: "?" und Timer');
 await L.click('.qm');await sleep(80);
 ok(await L.evaluate(()=>!document.querySelector('.qinfo').hidden&&!document.querySelector('.qinfo').innerText.includes('Canberra')),'Info aufgeklappt, ohne die Antwort');
 await L.fill('#bt','Sydney');await sleep(2500);
 ok(await L.evaluate(()=>G.fk.length===1&&G.fk[0].text==='Sydney'),'Anna: getippte Antwort zählt bei Zeitablauf');
 await L.evaluate(()=>HF());await sleep(2500);
 ok(await L.evaluate(()=>G.fk.length===1),'Ben: nichts getippt → keine Fälschung');
 await L.evaluate(()=>HF());await L.fill('#bt','Canberra');await sleep(2500);
 ok(await L.evaluate(()=>G.fk.length===1),'Cem: echte Antwort als Fälschung wird auch bei Zeitablauf nicht gezählt');
 await L.evaluate(()=>HF());await sleep(250);
 ok(await L.evaluate(()=>!!document.querySelector('.opt')&&!!document.querySelector('.qm')&&getComputedStyle(document.getElementById('tmr')).display==='block'),'Abstimmung: Optionen, "?" und Timer (20 s, hier 1,5 s)');
 await sleep(1800);await L.evaluate(()=>HF());await sleep(1800);await L.evaluate(()=>HF());await sleep(1900);
 const t=await txt(L);
 ok(t.toLowerCase().includes('keine stimme abgegeben')&&t.toLowerCase().includes('keine antwort geschrieben')&&!t.includes('NaN')&&!t.includes('undefined'),'Auswertung nennt Spieler ohne Antwort/Stimme, kein NaN');
 ok(await L.evaluate(()=>G.pts.every(x=>x===0)),'Ohne Stimmen keine Punkte');

 console.log('== Online (Host, Anna, Ben): parallel mit Timer ==');
 const H=await mk('Host');await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk('Ben','#'+code);await B.fill('#myn','Ben');await B.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(300);
 await H.evaluate(()=>{OPT.bluff.rounds=3;OPT.bluff.timer=2;BVOTE_MS=2000;home();pickGame('bluff');startSession('bluff')});await sleep(300);
 await H.evaluate(()=>{const q=BQ.find(q=>q[1]==='Canberra');G.qs[0]=q;G.q=q;G.fk=[];bRound()});await sleep(600);
 const pill=p=>p.evaluate(()=>getComputedStyle(document.getElementById('tmr')).display==='block'?document.getElementById('tmr').textContent:null);
 ok(!!(await pill(H))&&!!(await pill(A))&&!!(await pill(B)),'Timer läuft bei allen');
 ok(await A.evaluate(()=>!!document.querySelector('[data-p] .qm')),'Annas Formular hat das "?"');
 await A.fill('[data-f="w"]','Sydney');                       // nicht abgeschickt
 await sleep(4200);
 ok(await H.evaluate(()=>G.fk.length===1&&G.fk[0].pi===1),'Annas getippte Antwort wurde automatisch abgeschickt, Host und Ben ohne Antwort');
 ok(await H.evaluate(()=>!!PAR&&PAR.steps[0].k==='v'),'Danach läuft die Abstimmung');
 ok(await B.evaluate(()=>document.querySelectorAll('[data-sub="v"]').length===2&&!!document.querySelector('.qm')),'Ben sieht 2 Optionen (Sydney + echte) und "?"');
 await sleep(4000);
 ok(await H.evaluate(()=>PAR===null),'Nach Ablauf der Abstimmzeit ist ausgewertet');
 for(const [n,p] of [['Host',H],['Anna',A],['Ben',B]]){const x=(await txt(p)).toLowerCase();ok(x.includes('echt')&&x.includes('keine stimme abgegeben')&&x.includes('keine antwort geschrieben'),n+' sieht die Auswertung mit Hinweisen')}
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
