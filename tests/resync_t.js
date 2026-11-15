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
 await H.evaluate(()=>onlineMenu());await H.fill('#myn','Sushi');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);
 const code=await H.evaluate(()=>NET.code);
 const L=await mk('Leni','#'+code);await L.fill('#myn','Leni');await L.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===2&&NET.m[1].conn&&NET.m[1].conn.open);await sleep(400);
 const RES=/richtige antwort/i;
 console.log('== Normalfall ==');
 await H.evaluate(()=>{OPT.arsch.rounds=5;OPT.arsch.timer=0;home();pickGame('arsch');startSession('arsch')});await sleep(600);
 const play=async()=>{
  await L.waitForSelector('[data-sub="g"]',{state:'attached',timeout:5000});
  await L.evaluate(()=>{const b=document.querySelector('[data-p]');b.querySelector('[data-f="g"]').value='3500';b.querySelector('[data-sub="g"]').click()});await sleep(500);
  await H.waitForSelector('#hw [data-sub="g"]',{state:'attached',timeout:5000});
 };
 await play();
 console.log('== Ergebnis-Paket geht auf dem Handy verloren ==');
 await L.evaluate(()=>{window.__nc=netClientData;window.netClientData=function(d){if(d&&(d.t==='full'||d.t==='mut'||d.t==='own'||d.t==='wait'))return;return window.__nc(d)}});
 await H.evaluate(()=>{const b=document.querySelector('#hw [data-p]');b.querySelector('[data-f="g"]').value='3700';b.querySelector('[data-sub="g"]').click()});await sleep(1500);
 ok(RES.test(await H.evaluate(()=>document.body.innerText)),'Host zeigt Ergebnis');
 ok(!RES.test(await L.evaluate(()=>document.body.innerText)),'Handy hängt (Paket verloren)');
 await L.evaluate(()=>{window.netClientData=window.__nc});   // Verbindung wieder „gut“
 await L.waitForFunction(()=>/richtige antwort/i.test(document.body.innerText),null,{timeout:14000}).then(()=>ok(true,'Handy holt sich das Bild selbst nach (Resync)')).catch(()=>ok(false,'Handy holt sich das Bild selbst nach (Resync)'));
 console.log('== Danach läuft die Runde normal weiter ==');
 await H.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/weiter|nächste/i.test(x.textContent));if(b)b.click()});await sleep(800);
 await L.waitForSelector('[data-sub="g"]',{state:'attached',timeout:5000}).then(()=>ok(true,'Nächste Runde kommt an')).catch(()=>ok(false,'Nächste Runde kommt an'));
 console.log(errs.join('\n'));console.log(fails?'FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})();
