const {chromium}=require('playwright');const fs=require('fs');
const URL='http://127.0.0.1:8765/index.html',MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
let fails=0;const errs=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:390,height:800}});await ctx.addInitScript(MOCK);
 const mk=async(label,hash)=>{const p=await ctx.newPage();
  await p.addInitScript(pre=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem,r=Storage.prototype.removeItem;Storage.prototype.getItem=function(k){return g.call(this,pre+k)};Storage.prototype.setItem=function(k,v){return s.call(this,pre+k,v)};Storage.prototype.removeItem=function(k){return r.call(this,pre+k)}},label+':');
  p.on('pageerror',e=>errs.push(label+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(label+': '+m.text())});
  await p.goto(URL+(hash||''));await p.waitForSelector('#app .screen');return p};
 const H=await mk('Host');await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk('Ben','#'+code);await B.fill('#myn','Ben');await B.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(300);
 await A.evaluate(()=>{window.__LAT=400});     // Annas Antworten brauchen 400 ms zum Host
 await B.evaluate(()=>{window.__LAT=400});
 await H.evaluate(()=>{OPT.react.rounds=3;home();pickGame('react');startSession('react')});await sleep(400);
 const waitGo=()=>H.waitForFunction(()=>G.rs==='go',null,{timeout:9000});
 const tapEl=async p=>{const r=await p.evaluate(()=>{const e=document.getElementById('rx').getBoundingClientRect();return [e.left+e.width/2,e.top+40]});await p.mouse.move(r[0],r[1]);await p.mouse.down();await p.mouse.up()};

 console.log('== Runde 1: Host, Anna (400 ms Verzögerung), Ben (früh) ==');
 await waitGo();await sleep(150);await H.evaluate(()=>rxTap());await sleep(200);
 ok(await H.evaluate(()=>G.times[0]>=100&&G.times[0]<400),'Host (Spieler 1): lokal gemessen: '+await H.evaluate(()=>G.times[0])+' ms');
 await H.evaluate(()=>rxNext());await sleep(300);
 // Anna: Grün abwarten, dann ~300 ms später tippen
 await A.evaluate(()=>{window.__sent=[];const o=sendC;window.sendC=function(x){window.__sent.push(x);return o(x)}});
 await A.waitForSelector('#rx.g',{timeout:9000});await sleep(300);await tapEl(A);await sleep(1200);
 const annaMs=await H.evaluate(()=>G.times[1]);
 const sent=await A.evaluate(()=>window.__sent.filter(x=>x.ty==='rx'));
 ok(sent.length===1&&sent[0].k==='ms'&&!isNaN(sent[0].v),'Annas Gerät schickt genau ein Ergebnis (selbst gemessen): '+JSON.stringify(sent));
 ok(sent.length===1&&annaMs===Math.max(80,sent[0].v),`Host übernimmt exakt Annas gemessene Zeit (${annaMs} ms), ohne die 400 ms Leitung dazuzurechnen`);
 ok(await A.evaluate(()=>document.getElementById('rx').innerText.includes('ms')),'Anna sieht ihr Ergebnis');
 await H.evaluate(()=>rxNext());await sleep(300);
 // Ben: zu früh tippen
 await B.waitForSelector('#rx.w',{timeout:5000});await tapEl(B);await sleep(1000);
 ok(await H.evaluate(()=>G.times[2]===Infinity),'Ben tippt zu früh → Fehlstart');
 await H.evaluate(()=>rxNext());await sleep(300);
 ok((await H.evaluate(()=>document.getElementById('app').innerText)).includes('Ergebnis'),'Rundenergebnis erscheint');
 await H.evaluate(()=>{G.r++;rxRound()});await sleep(400);

 console.log('== Runde 2: Prüfungen gegen Schummeln ==');
 ok(await H.evaluate(()=>G.r===1&&G.i===0),'Runde 2 läuft');
 await waitGo();await H.evaluate(()=>rxTap());await H.evaluate(()=>rxNext());await sleep(300);        // Host fertig, Anna dran
 await B.evaluate(()=>sendC({ty:'rx',k:'ms',v:150}));await sleep(500);                         // Ben ist nicht dran
 ok(await H.evaluate(()=>G.times[1]===undefined),'Ben (nicht dran) kann nichts eintragen');
 await H.waitForFunction(()=>G.rs==='go',null,{timeout:9000});await sleep(500);
 await A.evaluate(()=>sendC({ty:'rx',k:'ms',v:1}));await sleep(900);
 ok(await H.evaluate(()=>G.times[1]===80),'Anna meldet 1 ms → auf 80 ms begrenzt: '+await H.evaluate(()=>G.times[1]));
 await H.evaluate(()=>rxNext());await sleep(300);
 await H.waitForFunction(()=>G.rs==='go',null,{timeout:9000});await sleep(400);
 await B.evaluate(()=>sendC({ty:'rx',k:'ms',v:99999}));await sleep(900);
 const bm=await H.evaluate(()=>G.times[2]);
 ok(bm>=300&&bm<=2000,'Ben meldet 99999 ms → auf die vergangene Zeit begrenzt: '+bm+' ms');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
