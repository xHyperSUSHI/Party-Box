const {chromium}=require('playwright');const fs=require('fs');
const URL='http://127.0.0.1:8765/index.html',MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
let fails=0;const errs=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 // getrennte Kontexte = getrennte Geräte (eigener localStorage)
 const ctx0=await b.newContext({viewport:{width:390,height:800}});await ctx0.addInitScript(MOCK);
 const mkctx=async()=>ctx0;
 const mk=async(ctx,label,hash)=>{const p=await ctx.newPage();
  await p.addInitScript(pre=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem,r=Storage.prototype.removeItem;Storage.prototype.getItem=function(k){return g.call(this,pre+k)};Storage.prototype.setItem=function(k,v){return s.call(this,pre+k,v)};Storage.prototype.removeItem=function(k){return r.call(this,pre+k)}},label+':');p.on('pageerror',e=>errs.push(label+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(label+': '+m.text())});await p.goto(URL+(hash||''));await p.waitForSelector('#app .screen');return p};
 const cH=ctx0,cA=ctx0,cB=ctx0;
 const H=await mk(cH,'Host');await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk(cA,'Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk(cB,'Ben');await B.evaluate(()=>onlineMenu());await B.fill('#myn','Ben');await B.fill('#jc',code);await B.evaluate(()=>netJoinStart());
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(300);
 const names=()=>H.evaluate(()=>NET.m.map(m=>m.name));
 ok(await A.evaluate(()=>!!localStorage.getItem('pb_sess')),'Sitzung wird auf Annas Gerät gemerkt');

 console.log('1) Neuladen im Spiel (Arschkarte, parallele Eingabe)');
 await H.evaluate(()=>{OPT.arsch.rounds=5;home();pickGame('arsch');startSession('arsch')});await sleep(500);
 await A.reload();await A.waitForFunction(()=>NET.client&&NET.got,{timeout:8000});await sleep(500);
 ok(JSON.stringify(await names())==='["Hosti","Anna","Ben"]','Kein Doppeleintrag nach dem Neuladen: '+JSON.stringify(await names()));
 ok(await A.evaluate(()=>!!document.querySelector('[data-p="1"] input[data-f="g"]')),'Anna bekommt ihr Formular zurück');
 ok(await H.evaluate(()=>NET.m[1].conn&&NET.m[1].conn.open),'Host sieht Anna wieder verbunden');

 console.log('2) Neuladen mit #CODE im Link');
 await A.goto(URL+'#'+code);await A.waitForFunction(()=>NET.client&&NET.got,{timeout:8000});await sleep(400);
 ok(JSON.stringify(await names())==='["Hosti","Anna","Ben"]','Auch mit Link-Code kein Doppeleintrag');
 ok(await A.evaluate(()=>!!document.querySelector('[data-p="1"] input[data-f="g"]')),'Anna hat wieder ihr Formular');

 console.log('3) Weiterspielen nach dem Neuladen');
 await A.evaluate(()=>{const b=document.querySelector('[data-p]');b.querySelector('[data-f="g"]').value='123';b.querySelector('[data-sub="g"]').click()});await sleep(300);
 ok(await H.evaluate(()=>G.g[1]===123),'Annas Schätzung kommt nach dem Neuladen an');

 console.log('4) Bewusst verlassen: kein automatisches Wiederverbinden');
 await B.evaluate(()=>netLeave());await sleep(300);
 ok(await B.evaluate(()=>!localStorage.getItem('pb_sess')),'Sitzung ist vergessen');
 await B.reload();await B.waitForSelector('#app .screen');await sleep(300);
 ok(await B.evaluate(()=>!NET.on&&document.getElementById('app').innerText.includes('Party Box')),'Nach Neuladen: Startseite statt Beitritt');

 console.log('5) Host schließt die Lobby: kein Wiederverbinden');
 await H.evaluate(()=>netStop());await sleep(600);
 ok(await A.evaluate(()=>!localStorage.getItem('pb_sess')),'Anna: Sitzung nach "Lobby geschlossen" vergessen');
 await A.reload();await A.waitForSelector('#app .screen');await sleep(300);
 ok(await A.evaluate(()=>!NET.on),'Anna landet auf der Startseite');

 console.log('6) Lobby existiert nicht mehr (veraltete Sitzung)');
 await B.evaluate(()=>{localStorage.setItem('pb_sess',JSON.stringify({code:'ZZZZZ',name:'Ben',t:Date.now()}))});
 await B.reload();await B.waitForFunction(()=>document.getElementById('app').innerText.includes('Keine Verbindung')||document.getElementById('app').innerText.includes('fehlgeschlagen'),{timeout:20000});
 ok(await B.evaluate(()=>!localStorage.getItem('pb_sess')),'Fehlversuch vergisst die Sitzung');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
