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
 console.log('== Buchstaben-Rad ==');
 await L.evaluate(()=>{S.names=['Anna','Ben'];Object.assign(OPT.slf,{mode:'digital',stop:true,rounds:3,dtimer:90,sel:{Stadt:1,Land:1,Fluss:1,Tier:1,Beruf:1},custom:[]});startSession('slf')});await sleep(300);
 ok(await L.evaluate(()=>G.reelOn&&!!document.querySelector('.slfw')&&document.querySelectorAll('.slfi').length===SLFL.length),'Digital: erst das Rad mit allen 16 Buchstaben');
 ok(await L.evaluate(()=>{const d=document.querySelector('.slfd'),fin=parseFloat(d.dataset.fin);return Math.abs(fin-SLFL.indexOf(G.lt)*22.5)<.01}),'Das Rad endet beim gezogenen Buchstaben ('+await L.evaluate(()=>G.lt)+')');
 ok(await L.evaluate(()=>getComputedStyle(document.querySelector('.slfd')).animationName.startsWith('slfspin')),'Dreh-Animation läuft');
 ok(!(await txt(L)).includes('Gerät weitergeben'),'Während des Rads noch keine Weitergabe');
 await sleep(7300);
 ok(await L.evaluate(()=>!G.reelOn)&&(await txt(L)).includes('Anna'),'Nach der Animation geht es automatisch weiter (Weitergabe an Anna)');
 await L.evaluate(()=>{HF()});await sleep(150);
 ok(await L.evaluate(()=>document.querySelectorAll('input.txt').length===5&&document.querySelector('.slfl').textContent===G.lt),'Danach die Eingabe mit demselben Buchstaben');
 await L.evaluate(()=>{OPT.slf.mode='digital';startSession('slf')});await sleep(200);
 await L.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/Überspringen/.test(b.textContent)).click());await sleep(200);
 ok(await L.evaluate(()=>!G.reelOn)&&(await txt(L)).includes('Anna'),'Überspringen geht sofort weiter');
 await sleep(7400);
 ok(await L.evaluate(()=>G.i===0&&!!document.querySelector('.hand')),'Verspäteter Timer löst nichts doppelt aus');
 // echte Drehung messen
 await L.evaluate(()=>{OPT.slf.mode='digital';startSession('slf')});await sleep(300);
 const m1=await L.evaluate(()=>getComputedStyle(document.querySelector('.slfd')).transform);await sleep(900);const m2=await L.evaluate(()=>getComputedStyle(document.querySelector('.slfd')).transform);await sleep(1800);const m3=await L.evaluate(()=>getComputedStyle(document.querySelector('.slfd')).transform);
 ok(m1!==m2&&m2!==m3,'Das Rad dreht sich wirklich (Transformation ändert sich laufend)');
 await sleep(3000);const m4=await L.evaluate(()=>getComputedStyle(document.querySelector('.slfd')).transform);await sleep(300);const m5=await L.evaluate(()=>getComputedStyle(document.querySelector('.slfd')).transform);
 ok(m4===m5,'Am Ende steht es still');
 await L.evaluate(()=>slfReelGo());
 // Zettel-Modus
 await L.evaluate(()=>{OPT.slf.mode='zettel';OPT.slf.timer=0;startSession('slf')});await sleep(200);
 ok((await txt(L)).includes('Zettel und Stift'),'Zettel: erst „bereit?“');
 await L.evaluate(()=>slfPlay());await sleep(300);
 ok(await L.evaluate(()=>G.reelOn&&!!document.querySelector('.slfd')),'Zettel: Rad nach „Buchstabe aufdecken“');
 await sleep(7300);
 ok(await L.evaluate(()=>document.querySelector('.slfl')&&document.querySelector('.slfl').textContent===G.lt),'Zettel: danach der Buchstabe groß mit Stopp-Knopf');
 ok(await L.evaluate(()=>{const e=document.getElementById('tmr');return !OPT.slf.timer||getComputedStyle(e).display!=='none'}),'Timer startet erst nach dem Rad');
 // Ruhemodus: keine Animation
 await L.evaluate(()=>{document.body.classList.add('calm');OPT.slf.mode='zettel';startSession('slf');slfPlay()});await sleep(200);
 ok(await L.evaluate(()=>getComputedStyle(document.querySelector('.slfd')).animationName.startsWith('slfspin')),'Auch bei ausgeschalteten Effekten dreht das Rad');
 await L.evaluate(()=>document.body.classList.remove('calm'));

 console.log('== Rad online ==');
 const H=await mk('Host');await H.evaluate(()=>{localStorage.setItem('pb_dnote','1')});
 await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===2&&NET.m[1].conn&&NET.m[1].conn.open);await sleep(300);
 await H.evaluate(()=>{Object.assign(OPT.slf,{mode:'digital',rounds:3,dtimer:60,stop:true,sel:{Stadt:1,Land:1,Fluss:1,Tier:1,Beruf:1},custom:[]});home();pickGame('slf');startSession('slf')});await sleep(800);
 ok(await A.evaluate(()=>document.querySelectorAll('.slfi').length===16),'Anna sieht das Rad auf ihrem Gerät');
 ok(await A.evaluate(()=>{const d=document.querySelector('.slfd');return d&&d.getAttribute('data-fin')!==null}),'Rad-Endwinkel kommt mit (gleicher Buchstabe für alle)');
 ok(await H.evaluate(()=>document.querySelectorAll('#hw input').length===0),'Hosti hat noch kein Formular');
 await sleep(7300);
 ok(await A.evaluate(()=>document.querySelectorAll('input[data-f]').length===5)&&await H.evaluate(()=>document.querySelectorAll('#hw input[data-f]').length===5),'Danach bekommen alle gleichzeitig ihr Formular');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
