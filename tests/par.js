const {chromium}=require('playwright');const fs=require('fs');
const URL='http://127.0.0.1:8765/index.html';
const MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
let fails=0;const errs=[];
const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:390,height:800}});
 await ctx.addInitScript(MOCK);
 async function mk(label,hash){
  const p=await ctx.newPage();p.label=label;await p.addInitScript(pre=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem,r=Storage.prototype.removeItem;Storage.prototype.getItem=function(k){return g.call(this,pre+k)};Storage.prototype.setItem=function(k,v){return s.call(this,pre+k,v)};Storage.prototype.removeItem=function(k){return r.call(this,pre+k)}},label+':');
  p.on('pageerror',e=>errs.push(label+' pageerror: '+e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push(label+' console: '+m.text())});
  await p.goto(URL+(hash||''));await p.waitForSelector('#app .screen');
  await p.evaluate(l=>{window.Peer=window.__MockPeer;NET.cid='cid-'+l},label);return p;
 }
 const H=await mk('Host');
 await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);
 const code=await H.evaluate(()=>NET.code);console.log('Lobby',code);
 const cl={};
 for(const n of ['Anna','Ben','Cem']){
  const p=await mk(n,'#'+code);await p.fill('#myn',n);await p.evaluate(c=>netJoinStart(c),code);cl[n]=p;
 }
 await H.waitForFunction(()=>NET.m.length===4&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));
 await sleep(400);
 const pages=[H,cl.Anna,cl.Ben,cl.Cem],names=['Hosti','Anna','Ben','Cem'];
 const txt=p=>p.evaluate(()=>document.body.innerText);
 const html=async p=>(await p.evaluate(()=>document.getElementById('app').innerHTML+'|'+document.getElementById('hw').innerHTML));
 const ownP=p=>p.evaluate(()=>{const e=[...document.querySelectorAll('[data-p]')].filter(x=>x.offsetParent!==null||x.closest('#hw')&&getComputedStyle(document.getElementById('hw')).display!=='none');return e.map(x=>+x.getAttribute('data-p'))});
 const sub=async(p,key,fields,v)=>{
   await p.waitForSelector('[data-sub="'+key+'"]',{state:'attached',timeout:4000});
   await p.evaluate(([key,fields,v])=>{
     const box=document.querySelector('[data-p]');
     for(const k in (fields||{})){const i=box.querySelector('[data-f="'+k+'"]');i.value=fields[k]}
     const b=box.querySelector(v!=null?'[data-sub="'+key+'"][data-v="'+v+'"]':'[data-sub="'+key+'"]');b.click();
   },[key,fields,v]);
 };

 console.log('\n== Arschkarte online ==');
 await H.evaluate(()=>{OPT.arsch.rounds=5;home();pickGame('arsch');startSession('arsch')});
 await sleep(500);
 for(let i=0;i<4;i++)ok(JSON.stringify(await ownP(pages[i]))===`[${i}]`,`${names[i]} sieht nur sein eigenes Formular (data-p=${i})`);
 ok(await H.evaluate(()=>getComputedStyle(document.getElementById('hw')).display==='block'&&document.getElementById('app').style.visibility==='hidden'),'Host sieht Formular im Overlay');
 if(process.env.SHOT){await H.screenshot({path:'par-host.png'});await cl.Anna.screenshot({path:'par-anna.png'});await sub(cl.Ben,'g',{g:'5'});await sub(cl.Ben,'t',null,0);await sleep(300);await cl.Ben.screenshot({path:'par-ben-status.png'})}
 // Fehlerfall
 await sub(cl.Cem,'g',{g:'abc'});await sleep(250);
 ok((await txt(cl.Cem)).includes('Bitte eine Zahl'),'Cem: Eingabe "abc" wird mit Hinweis abgelehnt');
 ok(await H.evaluate(()=>G.g[3]===undefined),'Host hat nichts gespeichert');
 // Fälschung: Ben gibt sich als Cem aus (p=3)
 await cl.Ben.evaluate(()=>sendC({ty:'sub',p:3,k:'g',v:null,f:{g:'999'}}));await sleep(250);
 ok(await H.evaluate(()=>G.g[3]===undefined),'Gefälschte Abgabe (Ben als Cem) wird ignoriert');
 // Eingaben
 const guess={Hosti:'1111',Anna:'2222',Ben:'3333',Cem:'4444'};
 await sub(cl.Anna,'g',{g:'2222'});await sleep(200);
 ok(await H.evaluate(()=>G.g[1]===2222),'Annas Schätzung kommt an');
 ok((await ownP(cl.Anna)).length===1&&(await html(cl.Anna)).includes('data-sub="t"'),'Anna sieht jetzt ihr Tipp-Formular');
 ok(!(await html(cl.Anna)).includes('data-v="1"'),'Anna kann nicht auf sich selbst tippen');
 // Selbst-Tipp fälschen
 await cl.Anna.evaluate(()=>sendC({ty:'sub',p:1,k:'t',v:'1'}));await sleep(200);
 ok(await H.evaluate(()=>G.t[1]===undefined),'Selbst-Tipp wird abgelehnt');
 await sub(cl.Anna,'t',null,3);await sleep(200);
 ok(await H.evaluate(()=>G.t[1]===3),'Annas Tipp (Cem) kommt an');
 ok(!(await html(cl.Anna)).includes('data-sub='),'Anna sieht danach nur den Status');
 // Privatsphäre: Annas Zahl bei niemand anderem
 for(const n of ['Ben','Cem']){const h=await html(cl[n]);ok(!h.includes('2222'),`${n} sieht Annas Schätzung nicht`)}
 await sub(cl.Ben,'g',{g:'3333'});await sub(cl.Ben,'t',null,1);
 await sub(cl.Cem,'g',{g:'4444'});await sub(cl.Cem,'t',null,1);
 await sub(H,'g',{g:'1111'});await sleep(150);
 ok(await H.evaluate(()=>PAR&&PAR.st[0]===1),'Host: Schätzung angenommen, Tipp fehlt noch');
 const hh=await html(H);
 await sub(H,'t',null,2);await sleep(500);
 ok(await H.evaluate(()=>PAR===null),'Alle fertig, parallele Phase beendet');
 for(let i=0;i<4;i++){const t=(await txt(pages[i])).toLowerCase();ok(t.includes('richtige antwort')&&t.includes('arschkarte'),`${names[i]} sieht die Auswertung`)}
 ok(await H.evaluate(()=>document.getElementById('app').style.visibility!=='hidden'),'Host-Overlay ist weg');

 console.log('\n== Verbindungsabbruch & Wiederbeitritt (Arschkarte Runde 2) ==');
 await H.evaluate(()=>{G.r++;arRound()});await sleep(500);
 await cl.Ben.evaluate(()=>NET.conn.close());await sleep(500);
 ok(await H.evaluate(()=>!isOpen(NET.m[2])),'Host bemerkt Bens Abbruch');
 await sub(H,'g',{g:'10'});await sub(H,'t',null,1);await sleep(300);
 ok(JSON.stringify(await ownP(H))==='[2]','Host übernimmt Bens Formular (data-p=2)');
 await cl.Ben.evaluate(([c,n])=>netJoin(c,n),[code,'Ben']);await sleep(700);
 ok(JSON.stringify(await ownP(cl.Ben))==='[2]','Ben kommt zurück und bekommt sein Formular wieder');
 ok(await H.evaluate(()=>getComputedStyle(document.getElementById('hw')).display!=='block'||!document.getElementById('hw').innerHTML.includes('data-p="2"')),'Host-Overlay zeigt Bens Formular nicht mehr');
 for(const n of ['Anna','Ben','Cem']){await sub(cl[n],'g',{g:'7'});await sub(cl[n],'t',null,0)}
 await sleep(500);
 ok(await H.evaluate(()=>PAR===null),'Runde 2 komplett');

 console.log('\n== Bluff online ==');
 await H.evaluate(()=>{OPT.bluff.rounds=3;home();pickGame('bluff');startSession('bluff')});await sleep(500);
 for(let i=0;i<4;i++)ok(JSON.stringify(await ownP(pages[i]))===`[${i}]`,`${names[i]}: Schreibformular`);
 await sub(cl.Anna,'w',{w:''});await sleep(150);
 ok((await txt(cl.Anna)).includes('Schreib etwas'),'Leere Antwort wird abgelehnt');
 const real=await H.evaluate(()=>G.q[1]);
 await sub(cl.Anna,'w',{w:real});await sleep(150);
 ok((await txt(cl.Anna)).includes('Zu nah'),'Echte Antwort als Fälschung wird abgelehnt');
 const fake={Hosti:'Falsch-H',Anna:'Falsch-A',Ben:'Falsch-B',Cem:'Falsch-C'};
 await sub(cl.Anna,'w',{w:fake.Anna});await sleep(150);
 for(const n of ['Ben','Cem']) ok(!(await html(cl[n])).includes('Falsch-A'),`${n} sieht Annas Fälschung in der Schreibphase nicht`);
 await sub(cl.Ben,'w',{w:fake.Ben});await sub(cl.Cem,'w',{w:fake.Cem});await sub(H,'w',{w:fake.Hosti});await sleep(500);
 for(let i=0;i<4;i++){
  const h=await html(pages[i]);
  ok(h.includes('data-sub="v"')&&!h.includes('>'+fake[names[i]]+'<'),`${names[i]}: Abstimmung ohne die eigene Fälschung`);
  ok(h.includes(real),`${names[i]}: echte Antwort ist wählbar`)}
 await cl.Ben.evaluate(()=>{const o=G=>0;});
 // Ben versucht für die eigene Fälschung zu stimmen (gefälscht)
 const ownIdx=await H.evaluate(()=>G.opts.findIndex(o=>o.authors.includes(2)));
 await cl.Ben.evaluate(k=>sendC({ty:'sub',p:2,k:'v',v:String(k)}),ownIdx);await sleep(200);
 ok(await H.evaluate(()=>G.votes[2]===undefined),'Stimme für die eigene Fälschung wird abgelehnt');
 const realIdx=await H.evaluate(()=>G.opts.findIndex(o=>o.real));
 for(let i=0;i<4;i++)await sub(pages[i],'v',null,realIdx);await sleep(600);
 for(let i=0;i<4;i++){const t=await txt(pages[i]);ok(t.includes('ECHT'),`${names[i]} sieht die Auswertung`)}
 ok(await H.evaluate(()=>G.pts.every(x=>x===2)),'Alle haben die echte Antwort gewählt: je +2');

 console.log('\n== Spion online ==');
 await H.evaluate(()=>{OPT.spy.rounds=3;home();pickGame('spy');startSession('spy')});await sleep(500);
 const info=await H.evaluate(()=>({spy:G.spy,loc:G.loc[0]}));
 let spies=0;
 for(let i=0;i<4;i++){
  const h=await html(pages[i]);const isSpy=h.includes('Du bist der Spion');
  if(isSpy)spies++;
  ok(isSpy===(i===info.spy),`${names[i]}: Rolle stimmt (${isSpy?'Spion':'Ort'})`);
  if(!isSpy)ok(h.includes(info.loc),`${names[i]} sieht den Ort`);else ok(!h.includes(info.loc),`Spion sieht den Ort nicht`);
 }
 ok(spies===1,'Genau ein Spion');
 for(let i=0;i<4;i++)await sub(pages[i],'ok');await sleep(600);
 for(let i=0;i<4;i++){const t=await txt(pages[i]);ok(t.includes('Fragerunde'),`${names[i]} sieht die Fragerunde`);ok(!t.includes('Du bist der Spion')&&!t.includes(info.loc),`${names[i]}: Karte ist verdeckt`)}

 console.log('\n== Regression: Reihum-Spiel (Reflex) online ==');
 await H.evaluate(()=>{home();pickGame('react');startSession('react')});await sleep(500);
 ok((await txt(cl.Anna)).includes('Gerade dran'),'Anna sieht "Gerade dran"');
 ok(await H.evaluate(()=>document.getElementById('app').innerText.includes('Warte')),'Host (Spieler 0) ist dran');
 await H.evaluate(()=>stopAll());

 console.log('\n== Regression: lokaler Modus ==');
 const L=await mk('Lokal');
 await L.evaluate(()=>{OPT.arsch.rounds=5;pickGame('arsch');startSession('arsch')});await sleep(300);
 for(let i=0;i<3;i++){await L.evaluate(()=>HF());await sleep(80);await L.fill('#g',String(100*(i+1)));await L.evaluate(()=>arSubmit());await sleep(80);await L.evaluate(()=>document.querySelector('.opt').click());await sleep(600)}
 ok((await txt(L)).includes('Richtige Antwort'),'Lokal: Arschkarte läuft Reihum bis zur Auswertung');

 console.log('\nFehler im Browser:',errs.length?errs:'keine');
 console.log(fails?`\n${fails} FEHLGESCHLAGEN`:'\nalles ok');
 await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch:',e);process.exit(2)});
