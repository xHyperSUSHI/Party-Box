const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});const p=await b.newPage({viewport:{width:390,height:700}});const errs=[];p.on('pageerror',e=>errs.push(e.message));let f=0;const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)f++};
await p.goto('http://127.0.0.1:8765/index.html');await p.waitForSelector('#app .screen');
await p.evaluate(()=>{localStorage.removeItem('pb_slfc');S.names=['Anna','Ben','Cem'];OPT.slf.mode='digital';OPT.slf.check='streng';pickGame('slf')});await p.waitForTimeout(400);
const max=await p.evaluate(()=>app.scrollHeight-app.clientHeight);
ok(max>300,'Setup ist länger als der Bildschirm ('+max+' px scrollbar)');
await p.evaluate(()=>{app.scrollTop=app.scrollHeight});await p.waitForTimeout(150);
const y0=await p.evaluate(()=>app.scrollTop);
await p.evaluate(()=>{[...document.querySelectorAll('button.sg')].find(b=>b.textContent.trim()==='Hinweis').click()});await p.waitForTimeout(300);
const y1=await p.evaluate(()=>({y:app.scrollTop,chk:OPT.slf.check}));
ok(y1.chk==='hinweis'&&Math.abs(y1.y-y0)<=2&&y1.y>200,'„Streng“ → „Hinweis“: Seite bleibt an derselben Stelle ('+y0+' → '+y1.y+')');
await p.evaluate(()=>{[...document.querySelectorAll('button.sg')].find(b=>b.textContent.trim()==='Streng').click()});await p.waitForTimeout(300);
ok(await p.evaluate(y=>Math.abs(app.scrollTop-y)<=2&&OPT.slf.check==='streng',y0),'Und wieder zurück: gleiche Stelle');
// anderes Spiel
await p.evaluate(()=>{home();OPT.arsch.rounds=10;pickGame('arsch')});await p.waitForTimeout(300);
ok(await p.evaluate(()=>app.scrollTop===0),'Ein neu geöffnetes Setup beginnt oben');
// Einstellungen
await p.evaluate(()=>settings());await p.waitForTimeout(300);
await p.evaluate(()=>{app.scrollTop=app.scrollHeight});await p.waitForTimeout(150);const s0=await p.evaluate(()=>app.scrollTop);
await p.evaluate(()=>{document.querySelector('.trow').click()});await p.waitForTimeout(300);
ok(await p.evaluate(s=>Math.abs(app.scrollTop-s)<=2,s0)&&s0>50,'Einstellungen: Schalter ändern springt nicht nach oben ('+s0+')');
console.log('Fehler:',errs.length?errs:'keine');await b.close();process.exit(f?1:0)})();
