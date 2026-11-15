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

 console.log('== Inhalt ==');
 const c=await L.evaluate(()=>{
  const out={};const ms=[].concat(...Object.values(MQ));out.mq={n:ms.length,dup:ms.filter((x,i)=>ms.indexOf(x)!==i).length};
  const cards=[].concat(...Object.values(TBS)).map(s=>s.split('|'));out.tb={n:cards.length,bad:cards.filter(c=>c.length!==6||c.some(x=>!x.trim())).map(c=>c[0]),selfword:cards.filter(c=>c.slice(1).some(f=>f.toLowerCase()===c[0].toLowerCase())).map(c=>c[0]),dupInner:cards.filter(c=>new Set(c.map(x=>x.toLowerCase())).size!==6).map(c=>c[0]),dupTerm:cards.map(c=>c[0]).filter((x,i,a)=>a.indexOf(x)!==i)};
  const bad=[];for(const cat of HLC)for(let i=0;i<500;i++){const d=hiDuel(cat);const va=d.a[1],vb=d.b[1];if(!d.a[0]||!d.b[0]||d.a[0]===d.b[0]||!isFinite(va)||!isFinite(vb)||va===vb||!d.q||![0,1].includes(hiOk(d)))bad.push(cat+': '+JSON.stringify(d));
    if(cat===HLC[1]&&Math.abs(va-vb)<8)bad.push('Jahre zu nah '+JSON.stringify(d));if((cat===HLC[0]||cat===HLC[3])&&Math.max(va,vb)/Math.min(va,vb)<1.09)bad.push('Werte zu nah '+JSON.stringify(d))}
  out.hi={bad:bad.slice(0,3),n:bad.length};
  out.ev=HEV.map(e=>e[1]);return out});
 ok(c.mq.n>=70&&c.mq.dup===0,`Wer würde am ehesten: ${c.mq.n} Aussagen, keine doppelt`);
 ok(c.tb.n===80&&!c.tb.bad.length&&!c.tb.selfword.length&&!c.tb.dupInner.length&&!c.tb.dupTerm.length,`Tabu: ${c.tb.n} Karten, jede mit Begriff + 5 verbotenen Wörtern, keine Doppelten/Selbstverbote`+JSON.stringify([c.tb.bad,c.tb.selfword,c.tb.dupInner,c.tb.dupTerm]));
 ok(c.hi.n===0,'Mehr oder weniger: 2500 zufällige Duelle gültig, Werte ausreichend verschieden'+(c.hi.n?JSON.stringify(c.hi.bad):''));
 ok(await L.evaluate(()=>Object.keys(GAMES).length===20&&['most','taboo','hilo','never','kings'].every(k=>GAMES[k])),'Neue Spiele vorhanden, insgesamt 20 Spiele');

 console.log('== Wer würde am ehesten (lokal) ==');
 await L.evaluate(()=>{S.names=['Anna','Ben','Cem'];OPT.most.timer=0;OPT.most.rounds=5;OPT.most.cats={};pickGame('most')});await sleep(250);
 ok(await L.evaluate(()=>document.querySelector('.chips').querySelectorAll('.chip').length===3),'Setup: 3 Kategorie-Chips');
 await L.evaluate(()=>startSession('most'));await sleep(150);
 await L.evaluate(()=>HF());await sleep(150);
 ok(await L.evaluate(()=>document.querySelectorAll('.opt').length===3),'Anna sieht 3 Optionen (auch sich selbst)');
 const optNames=await L.evaluate(()=>[...document.querySelectorAll('.opt')].map(e=>e.innerText.trim().split('\n').pop()));
 ok(JSON.stringify(optNames)==='["Anna (ich)","Ben","Cem"]','Optionen: '+JSON.stringify(optNames));
 // Anna→Ben, Ben→Cem, Cem→Ben
 const pickName=async(n)=>{await L.evaluate(n=>[...document.querySelectorAll('.opt')].find(e=>e.innerText.includes(n)).click(),n);await sleep(700)};
 await pickName('Ben');await L.evaluate(()=>HF());await sleep(150);await pickName('Cem');await L.evaluate(()=>HF());await sleep(150);await pickName('Ben');await sleep(500);
 ok(await L.evaluate(()=>G.pts.join()==='1,0,1'),'Ben hat 2 Stimmen (gewählt): Anna und Cem +1, Ben 0: '+await L.evaluate(()=>G.pts.join()));
 let t=await txt(L);ok(t.includes('Gewählt von: Anna, Cem')&&t.toLowerCase().includes('gewählt'),'Auswertung zeigt, wer wen gewählt hat');
 await L.evaluate(()=>{G.r=G.rounds-1;moResult()});await sleep(100);await L.evaluate(()=>moFinish());await sleep(500);
 ok((await txt(L)).includes('Meiste Stimmen des Abends'),'Endergebnis nennt "Meiste Stimmen des Abends"');
 ok(await L.evaluate(()=>{const s=stGet()['n:ben'];return s&&s.g.most&&s.g.most.s.stimmen>=2}),'Statistik: Stimmen gespeichert');
 await L.evaluate(()=>{OPT.most.rounds=5;startSession('most')});await sleep(150);await L.evaluate(()=>HF());await sleep(150);
 await L.evaluate(()=>[...document.querySelectorAll('.opt')].find(e=>e.innerText.includes('(ich)')).click());await sleep(700);
 ok(await L.evaluate(()=>G.v[0]===0),'Selbststimme wird gezählt');
 // Timer
 await L.evaluate(()=>{home();OPT.most.timer=2;pickGame('most');startSession('most');HF()});await sleep(2600);
 ok(await L.evaluate(()=>G.v[0]===null),'Timer: nicht gewählt → keine Stimme');

 console.log('== Tabu (lokal, Einzel) ==');
 await L.evaluate(()=>{home();OPT.taboo.secs=45;OPT.taboo.rounds=1;OPT.taboo.cats={};pickGame('taboo');startSession('taboo')});await sleep(200);
 await L.evaluate(()=>HF());await sleep(300);
 ok(await L.evaluate(()=>!!document.querySelector('#w .tbw')&&document.querySelectorAll('#w .tbw i').length===5),'Karte zeigt Begriff und 5 verbotene Wörter');
 const term=await L.evaluate(()=>G.card[1][0]);
 await L.evaluate(()=>tTabu());await L.evaluate(()=>tTabu());
 ok(await L.evaluate(()=>G.tabu===2&&document.getElementById('tbc').textContent==='2'),'Tabu-Zähler: 2');
 ok(await L.evaluate(()=>G.card[1][0])!==term,'Nach Tabu kommt eine neue Karte');
 for(let i=0;i<4;i++)await L.evaluate(()=>tSkip());
 ok(await L.evaluate(()=>G.skips===3),'Überspringen max. 3×');
 await L.evaluate(()=>tOk());await sleep(100);
 ok(await L.evaluate(()=>!!document.getElementById('pk')),'Einzelmodus: Auswahl "Wer hat\'s erraten?"');
 await L.evaluate(()=>tPick(1));await L.evaluate(()=>tOk());await L.evaluate(()=>tPick(2));await L.evaluate(()=>tOk());await L.evaluate(()=>tPick(-1));await L.evaluate(()=>tOk());await L.evaluate(()=>tPick(1));
 ok(await L.evaluate(()=>G.cor.length===4&&G.pts[1]===2&&G.pts[2]===1),'Rater bekommen +1 (Ben 2, Cem 1, "egal" niemand)');
 await L.evaluate(()=>tEnd());await sleep(300);
 ok(await L.evaluate(()=>G.pts[0]===2),'Erklärer: 4 Treffer − 2 Tabus = +2');
 await L.evaluate(()=>{startSession('taboo');HF();tOk();tPick(-1);tTabu();tTabu();tTabu();tEnd()});await sleep(300);
 ok(await L.evaluate(()=>G.pts[0]===0),'Mehr Tabus als Treffer → mindestens 0');
 console.log('== Tabu (Teams) ==');
 await L.evaluate(()=>{S.names=['Anna','Ben','Cem','Dora'];S.mode='team';S.nt=2;home();pickGame('taboo');S.tm=[[0,1],[2,3]];S.tmKey=tmKey();startSession('taboo')});await sleep(200);
 ok(await L.evaluate(()=>G.team===true),'Teammodus aktiv');
 await L.evaluate(()=>HF());await sleep(150);
 await L.evaluate(()=>{tOk();tOk();tTabu()});
 ok(await L.evaluate(()=>!document.getElementById('pk')&&G.cor.length===2),'Teammodus: Erraten ohne Auswahl-Fenster');
 await L.evaluate(()=>tEnd());await sleep(200);
 ok(await L.evaluate(()=>G.pts[G.e]===1),'Team bekommt Treffer − Tabus = 1');
 await L.evaluate(()=>{S.mode='solo';S.names=['Anna','Ben','Cem']});

 console.log('== Mehr oder weniger (lokal) ==');
 await L.evaluate(()=>{home();OPT.hilo.timer=0;OPT.hilo.rounds=8;OPT.hilo.cats={};pickGame('hilo');startSession('hilo')});await sleep(200);
 await L.evaluate(()=>HF());await sleep(150);
 ok(await L.evaluate(()=>document.querySelectorAll('.opt').length===2),'Zwei Möglichkeiten zur Wahl');
 const ans=await L.evaluate(()=>({ok:hiOk(G.d)}));
 await L.evaluate(k=>document.querySelectorAll('.opt')[k].click(),ans.ok);await sleep(600);   // Anna richtig
 await L.evaluate(()=>HF());await sleep(150);await L.evaluate(k=>document.querySelectorAll('.opt')[1-k].click(),ans.ok);await sleep(600); // Ben falsch
 await L.evaluate(()=>HF());await sleep(150);await L.evaluate(k=>document.querySelectorAll('.opt')[k].click(),ans.ok);await sleep(700); // Cem richtig
 ok(await L.evaluate(()=>G.pts.join()==='1,0,1'),'Richtig +1, falsch 0: '+await L.evaluate(()=>G.pts.join()));
 t=await txt(L);ok(t.toLowerCase().includes('richtig')&&(t.includes('✅')||t.includes('❌')),'Auswertung zeigt richtige Seite und Ergebnisse');
 await L.screenshot({path:require('os').tmpdir()+'/hilo-result.png'});
 await L.evaluate(()=>{home();OPT.hilo.timer=2;pickGame('hilo');startSession('hilo');HF()});await sleep(2600);
 ok(await L.evaluate(()=>G.pk[0]===null),'Timer: keine Wahl = falsch');
 await L.evaluate(()=>{home();statsScreen()});await sleep(200);
 t=await txt(L);ok(t.includes('Wer würde am ehesten?')||t.includes('Tabu')||t.includes('Mehr oder weniger'),'Statistik listet die neuen Spiele');

 console.log('== Online (Host + Anna + Ben) ==');
 const H=await mk('Host');await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk('Ben','#'+code);await B.fill('#myn','Ben');await B.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(300);
 const pages=[H,A,B];
 const vote=(p,k)=>p.evaluate(k=>document.querySelector('[data-sub="v"][data-v="'+k+'"]').click(),k);
 await H.evaluate(()=>{OPT.most.timer=0;OPT.most.rounds=5;home();pickGame('most');startSession('most')});await sleep(600);
 const own=await Promise.all(pages.map(p=>p.evaluate(()=>[...document.querySelectorAll('[data-sub="v"]')].map(x=>x.dataset.v))));
 ok(own.every((o,i)=>o.length===3&&o.includes(String(i))),'Wer würde am ehesten online: jedes Gerät sieht alle, auch sich selbst');
 await vote(A,0);await sleep(300);
 ok(!(await txt(B)).includes('Gewählt von'),'Bevor alle fertig sind, sieht keiner fremde Stimmen');
 await vote(B,0);await vote(H,1);await sleep(700);
 for(const [n,p] of [['Host',H],['Anna',A],['Ben',B]]){const x=await txt(p);ok(x.includes('Gewählt von: Anna, Ben')||x.includes('Gewählt von: Ben, Anna'),n+' sieht die Auflösung')}
 ok(await H.evaluate(()=>G.pts.join()==='0,1,1'||G.pts.join()==='0,1,1'),'Hosti (2 Stimmen) gewählt: Anna und Ben +1');
 await H.evaluate(()=>{OPT.most.timer=2;G.r++;moRound()});await sleep(400);
 const pill=p=>p.evaluate(()=>getComputedStyle(document.getElementById('tmr')).display==='block');
 ok(await pill(A)&&await pill(H),'Timer bei Host und Mitspielern');
 await sleep(3500);
 ok(await H.evaluate(()=>PAR===null)&&(await txt(A)).includes('Keine Stimme abgegeben'),'Nach Ablauf: Auflösung ohne Stimmen');

 await H.evaluate(()=>{OPT.hilo.timer=0;OPT.hilo.rounds=8;home();pickGame('hilo');startSession('hilo')});await sleep(600);
 const okk=await H.evaluate(()=>hiOk(G.d));
 await vote(A,okk);await vote(B,1-okk);await vote(H,okk);await sleep(700);
 ok(await H.evaluate(()=>G.pts.join()==='1,1,0'),'Mehr oder weniger online: Hosti und Anna richtig, Ben falsch: '+await H.evaluate(()=>G.pts.join()));
 ok((await txt(B)).includes('❌'),'Ben sieht die Auflösung');

 await H.evaluate(()=>{OPT.taboo.secs=45;OPT.taboo.rounds=1;home();pickGame('taboo');startSession('taboo')});await sleep(600);
 ok((await txt(A)).includes('Gerade dran')&&(await txt(B)).includes('Gerade dran'),'Tabu online: Hosti erklärt, die anderen sehen nur "Gerade dran"');
 await H.evaluate(()=>tEnd());await sleep(500);
 await H.evaluate(()=>tHand());await sleep(600);       // Anna erklärt
 const cardTerm=await H.evaluate(()=>G.card[1][0]);
 ok(await A.evaluate(t=>document.body.innerText.includes(t)&&document.querySelectorAll('#w .tbw i').length===5,cardTerm),'Anna sieht ihre Karte mit Begriff und verbotenen Wörtern');
 const bt=await txt(B);ok(!bt.includes(cardTerm)&&bt.includes('Gerade dran'),'Ben sieht den Begriff NICHT (Privatsphäre)');
 await A.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/Tabu!/.test(b.textContent)).click());await sleep(500);
 ok(await H.evaluate(()=>G.tabu===1),'Annas Tabu-Knopf wirkt auf dem Host (Zähler 1)');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
