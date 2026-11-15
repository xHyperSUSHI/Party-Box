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
 console.log('== Zeitablauf: Getipptes zählt auch ohne Abschicken (online) ==');
 const H=await mk('Host');await H.evaluate(()=>{localStorage.setItem('pb_dnote','1')});
 await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk('Ben','#'+code);await B.fill('#myn','Ben');await B.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(300);
 // autoSub überall abschalten: nur die Entwürfe dürfen helfen
 for(const p of [H,A,B])await p.evaluate(()=>{window.autoSub=()=>{}});
 // --- Bluff
 await H.evaluate(()=>{Object.assign(OPT.bluff,{timer:60,rounds:3,cats:{}});home();pickGame('bluff');startSession('bluff')});await sleep(800);
 const real=await H.evaluate(()=>G.q[1]);
 await A.fill('input[data-f="w"]','Zorbax');await B.fill('input[data-f="w"]',real);
 await H.evaluate(()=>{document.querySelector('#hw input[data-f="w"]').value='Quatsch'});await sleep(700);
 ok(await H.evaluate(()=>!!PAR.dr&&PAR.dr[1]&&PAR.dr[1].f.w==='Zorbax'),'Host kennt Annas Entwurf, ohne dass sie abgeschickt hat');
 await H.evaluate(()=>{PAR.end=Date.now()-2000});await sleep(1500);
 ok(await H.evaluate(()=>G.fk.some(f=>f.text==='Zorbax')&&G.fk.some(f=>f.text==='Quatsch')),'Bluff: getippte Antworten (Anna + Host) zählen nach Zeitablauf');
 ok(await H.evaluate(r=>!G.fk.some(f=>f.text===r),real),'Echte Antwort als Fälschung wird weiterhin abgelehnt');
 // --- Arschkarte
 await H.evaluate(()=>{Object.assign(OPT.arsch,{timer:30,rounds:3,cats:{}});home();pickGame('arsch');startSession('arsch')});await sleep(800);
 await A.fill('input[data-f="g"]','1.234');await B.fill('input[data-f="g"]','abc');
 await H.evaluate(()=>{document.querySelector('#hw input[data-f="g"]').value='77'});await sleep(700);
 await H.evaluate(()=>{PAR.end=Date.now()-2000});await sleep(1500);
 ok(await H.evaluate(()=>G.g[1]===1234&&G.g[0]===77),'Arschkarte: Zahlen von Anna und Host zählen ohne Abschicken');
 ok(await H.evaluate(()=>G.g[2]==null),'Ungültiger Entwurf (keine Zahl) zählt als keine Antwort');
 // --- Stadt, Land, Fluss digital
 await H.evaluate(()=>{Object.assign(OPT.slf,{mode:'digital',rounds:3,dtimer:60,stop:true,sel:{Stadt:1,Land:1,Fluss:1,Tier:1,Beruf:1},custom:[]});home();pickGame('slf');startSession('slf');if(G.reelOn)slfReelGo()});await sleep(800);
 await A.fill('input[data-f="c0"]','Anna-Stadt');await A.fill('input[data-f="c1"]','Annaland');
 await B.fill('input[data-f="c2"]','Benfluss');
 await H.evaluate(()=>{document.querySelector('#hw input[data-f="c3"]').value='Hosttier'});await sleep(700);
 await H.evaluate(()=>{PAR.end=Date.now()-2000});await sleep(1500);
 ok(await H.evaluate(()=>G.ans[1]&&G.ans[1][0]==='Anna-Stadt'&&G.ans[1][1]==='Annaland'&&G.ans[2][2]==='Benfluss'&&G.ans[0][3]==='Hosttier'),'Stadt, Land, Fluss: Teilantworten aller drei zählen ohne Abschicken');
 ok(await H.evaluate(()=>G.stopBy==null),'Zeitablauf ruft keinen „Stopp“ aus');
 // --- Entwurf von fremdem Spieler wird ignoriert
 await H.evaluate(()=>{Object.assign(OPT.bluff,{timer:60,rounds:3});home();pickGame('bluff');startSession('bluff')});await sleep(800);
 await B.evaluate(()=>{NET.conn.send({t:'ev',ty:'draft',p:1,k:'w',f:{w:'Fremd'}})});await sleep(300);
 ok(await H.evaluate(()=>!PAR.dr||!PAR.dr[1]||PAR.dr[1].f.w!=='Fremd'),'Entwurf für den Platz eines anderen Spielers wird verworfen');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
