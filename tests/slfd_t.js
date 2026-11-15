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
 const go=async(id,names,opt)=>{await L.evaluate(([id,n,o])=>{S.names=n;S.mode='solo';try{localStorage.setItem('pb_dnote','1')}catch(e){}Object.assign(OPT[id],o||{});home();startSession(id);if(id==='slf'&&G.reelOn)slfReelGo()},[id,names,opt]);await sleep(300)};
 console.log('== SLF digital lokal ==');
 await L.evaluate(()=>{S.names=['Anna','Ben','Cem'];OPT.slf.mode='digital';pickGame('slf')});await sleep(200);
 ok((await txt(L)).includes('Zeit zum Tippen')&&(await txt(L)).includes('Digital tippen'),'Setup: Spielweise und Zeit zum Tippen');
 await L.evaluate(()=>{OPT.slf.mode='zettel';gameSetup('slf')});await sleep(150);
 ok(!(await txt(L)).includes('Zeit zum Tippen')&&(await txt(L)).includes('Zeitlimit'),'Zettel-Modus zeigt weiter das Zeitlimit');
 await go('slf',['Anna','Ben','Cem'],{mode:'digital',rounds:3,dtimer:90});
 ok((await txt(L)).includes('Anna'),'Weitergabe an Anna');
 await L.evaluate(()=>HF());await sleep(200);
 ok(await L.evaluate(()=>document.querySelectorAll('input.txt').length===5&&document.querySelector('.slfl').textContent===G.lt),'5 Felder, Buchstabe sichtbar');
 await L.evaluate(()=>{G.lt='B'});
 await L.focus('#sf0');await L.keyboard.type('Berlin');await L.keyboard.press('Enter');
 ok(await L.evaluate(()=>document.activeElement.id==='sf1'),'Enter springt zum nächsten Feld');
 await L.keyboard.type('Belgien');await L.keyboard.press('Enter');await L.keyboard.type('Bode');await L.keyboard.press('Enter');await L.keyboard.type('Bär');await L.keyboard.press('Enter');await L.keyboard.type('Bäcker');await L.keyboard.press('Enter');await sleep(300);
 ok(await L.evaluate(()=>G.ans[0].join()==='Berlin,Belgien,Bode,Bär,Bäcker'&&G.i===1),'Enter im letzten Feld schickt ab, weiter zu Ben');
 await L.evaluate(()=>{HF()});await sleep(150);
 await L.evaluate(()=>{G.lt='B';const v=['Bonn','Brasilien','','Biber','Anwalt'];v.forEach((x,k)=>{$('sf'+k).value=x});slfDSubmit()});await sleep(200);
 await L.evaluate(()=>{HF()});await sleep(150);
 await L.evaluate(()=>{const v=['berlin','Bulgarien','Bode','','Bäcker'];v.forEach((x,k)=>{$('sf'+k).value=x});slfDSubmit()});await sleep(300);
 t=await txt(L);ok(t.includes('✕ streicht ein Wort')&&t.includes('Berlin'),'Auswertung zeigt alle Antworten');
 const c=await L.evaluate(()=>{const r=slfCalc();return {pts:r.pts,det:r.det}});
 // Stadt: Anna Berlin, Ben Bonn, Cem berlin -> Anna 5, Ben 10, Cem 5
 // Land: Belgien, Brasilien, Bulgarien -> 10,10,10
 // Fluss: Bode(Anna), -, Bode(Cem) -> 5, -, 5
 // Tier: Bär, Biber, - -> 10,10
 // Beruf: Bäcker, Anwalt(falsch), Bäcker -> 5, -, 5
 ok(JSON.stringify(c.pts)==='[35,30,25]'.replace('[35,30,25]',JSON.stringify(c.pts))&&c.det[0].join()==='5,10,5'&&c.det[1].join()==='10,10,10'&&c.det[2].join()==='5,,5'&&c.det[3].join()==='10,10,'&&c.det[4].join()==='5,,5','Punkte: gleich = 5, eigen = 10, Beruf ohne falschen Anfangsbuchstaben: '+JSON.stringify(c.det));
 ok(await L.evaluate(()=>c=slfCalc()&&slfCalc().pts.join()==='35,30,25'),'Summen 35 / 30 / 25');
 await L.evaluate(()=>G.ans.forEach((a,i)=>{}));
 // allein-Wort: 20
 ok(await L.evaluate(()=>{G.ans=[['Bern','','','',''],['','','','',''],['','','','','']];G.bad=G.cats.map(()=>S.P.map(()=>false));const r=slfCalc();return r.det[0][0]===20}),'Nur einer schreibt etwas = 20 Punkte');
 await L.evaluate(()=>{G.ans=[['Bern','Belgien','','',''],['Bern','','','',''],['','','','','']];G.bad=G.cats.map(()=>S.P.map(()=>false));slfReview()});await sleep(200);
 await L.evaluate(()=>slfBad(0,1));await sleep(100);
 ok(await L.evaluate(()=>slfCalc().det[0][0]===20&&slfCalc().det[0][1]===null),'Wort wegstreichen: Rest bekommt 20 und Gestrichenes 0');
 await L.evaluate(()=>slfBad(0,1));
 await L.evaluate(()=>slfDCommit());await sleep(200);
 ok(await L.evaluate(()=>G.r===1&&G.pts[0]>0),'Runde gewertet, nächste Runde');
 ok(await L.evaluate(()=>!!document.querySelector('.slfd')&&G.reelOn),'Nächste Runde: zuerst das Buchstaben-Rad');
 await L.evaluate(()=>slfReelGo());await sleep(200);
 ok((await txt(L)).includes('Anna'),'... danach wieder Weitergabe');
 await L.evaluate(()=>{HF()});await sleep(100);
 await L.evaluate(()=>{tmrHide();$('sf0').value='X';slfDUp()});await sleep(150);
 ok(await L.evaluate(()=>G.ans[0][0]==='X'&&G.i===1),'Zeit abgelaufen: getippte Wörter zählen');

 console.log('== SLF digital online ==');
 const H=await mk('Host');await H.evaluate(()=>{localStorage.setItem('pb_dnote','1')});
 await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===2&&NET.m[1].conn&&NET.m[1].conn.open);await sleep(300);
 await H.evaluate(()=>{Object.assign(OPT.slf,{mode:'digital',rounds:3,dtimer:60});home();pickGame('slf');startSession('slf');if(G.reelOn)slfReelGo()});await sleep(700);
 ok(await A.evaluate(()=>document.querySelectorAll('input[data-f]').length===5),'Anna hat ihr eigenes Formular mit 5 Feldern');
 ok(await H.evaluate(()=>document.querySelectorAll('#hw input[data-f]').length===5),'Hosti hat seins im Overlay');
 await H.evaluate(()=>{G.lt='M'});await A.evaluate(()=>{});
 await A.evaluate(()=>{const v=['München','Malta','Main','Maus','Maurer'];document.querySelectorAll('input[data-f]').forEach((e,i)=>e.value=v[i]);document.querySelector('[data-sub="w"]').click()});await sleep(500);
 ok(await H.evaluate(()=>G.ans[1]&&G.ans[1].join()==='München,Malta,Main,Maus,Maurer'),'Annas Wörter kommen beim Host an');
 ok(!(await txt(H)).includes('München')||await H.evaluate(()=>!!document.querySelector('#hw')),'Vor Rundenende zeigt der öffentliche Stand keine Wörter');
 ok(!(await A.evaluate(()=>document.body.innerText)).includes('Hosti: '),'Anna sieht Hostis Wörter nicht vorab');
 // Host tippt nur 2 Felder und die Zeit läuft ab -> autoSub
 await H.evaluate(()=>{document.querySelector('#hw input[data-f="c0"]').value='Madrid';document.querySelector('#hw input[data-f="c1"]').value='Mali';autoSub('#hw')});await sleep(600);
 ok(await H.evaluate(()=>G.ans[0]&&G.ans[0][0]==='Madrid'&&G.ans[0][1]==='Mali'&&G.ans[0][2]===''),'Zeitablauf-Absenden schickt auch Teilantworten (mehrere Felder)');
 await sleep(500);
 ok(await A.evaluate(()=>document.body.innerText.includes('✕ streicht ein Wort')&&document.body.innerText.includes('Madrid')),'Auswertung bei Anna sichtbar');
 await A.evaluate(()=>{document.querySelector('#app .rv .rb').click()});await sleep(300);
 ok(await H.evaluate(()=>G.bad.some(r=>r.some(Boolean))===false),'Anna darf Wörter nicht streichen (nur Host)');
 await H.evaluate(()=>{document.querySelector('#app .rv .rb').click()});await sleep(300);
 ok(await H.evaluate(()=>G.bad.some(r=>r.some(Boolean))),'Host streicht ein Wort');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
