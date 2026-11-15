// Hauptmenü (Startseite 3.0): Profilkarte, Kategorie-Chips, Neu-hier-Karte, Zwei-Spalten-Layout auf breiten Bildschirmen
const {chromium}=require('playwright');
const URL='http://127.0.0.1:8765/index.html';
let fails=0;const errs=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});
 const mk=async(w,h)=>{const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(w+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(w+': '+m.text())});
  await p.goto(URL);await p.waitForSelector('#app .screen');return p};

 console.log('== Handy 390 ==');
 const P=await mk(390,844);
 let r=await P.evaluate(()=>({intro:!!document.querySelector('.hnew'),me:document.querySelector('.hme').innerText,chips:document.querySelectorAll('.hcats .chip').length,cats:CATS.filter(c=>drinkOn()||c.id!=='drink').length,
   sech:document.querySelectorAll('.sech').length,gt:document.querySelectorAll('.gt').length,rnd:!!document.querySelector('.rnd'),mode:!!document.querySelector('.hcard .mode2'),pbar:!!document.querySelector('.hcard .pbar'),
   stage:getComputedStyle(document.querySelector('.hstage')).display,over:app.scrollWidth-app.clientWidth}));
 ok(r.intro,'Neuer Nutzer: "Neu hier?"-Karte');
 ok(/Profil anlegen/.test(r.me),'Profilkarte lädt zum Anlegen ein');
 ok(r.chips===r.cats+1,'Kategorie-Chips: Alle + '+r.cats);
 ok(r.sech===r.cats&&r.gt===20,'Ansicht "Alle": alle Kategorien und 20 Spiele');
 ok(r.rnd&&r.mode&&r.pbar,'Zufallsspiel, Ein Gerät/Online und Spielerleiste vorhanden');
 ok(r.stage==='none','Figuren-Bühne auf dem Handy ausgeblendet');
 ok(r.over<=0,'Keine waagrechte Verschiebung der Seite');
 await P.evaluate(()=>introOk());
 ok(await P.evaluate(()=>!document.querySelector('.hnew')&&localStorage.getItem('pb_intro')==='1'),'"Verstanden" blendet die Karte dauerhaft aus');
 await P.evaluate(()=>[...document.querySelectorAll('.hcats .chip')].find(c=>c.getAttribute('onclick').includes("'quiz'")).click());
 r=await P.evaluate(()=>({gt:[...document.querySelectorAll('.gt b')].map(e=>e.textContent).join(),on:document.querySelector('.hcats .chip.on').textContent}));
 ok(r.gt==='Arschkarte,Bluff,Mehr oder weniger'&&/Quiz/.test(r.on),'Chip "Quiz" zeigt nur Quiz-Spiele und ist markiert');
 await P.evaluate(()=>setHCat('all'));
 await P.evaluate(()=>document.querySelector('.hme').click());
 ok(await P.evaluate(()=>!!document.getElementById('pfn')),'Tipp auf die Profilkarte öffnet das Profil');
 await P.fill('#pfn','Sascha');await P.evaluate(()=>profSave());
 r=await P.evaluate(()=>({me:document.querySelector('.hme').innerText,av:!!document.querySelector('.hme .av.ch'),stack:!!document.querySelector('.pbar .av.ch')}));
 ok(/Sascha/.test(r.me)&&r.av&&r.stack,'Danach: "Hallo Sascha" mit Charakter, auch in der Spielerleiste');
 await P.keyboard.press('1');await sleep(300);
 ok(await P.evaluate(()=>CUR==='arsch'),'Taste 1 öffnet weiterhin das erste Spiel');

 console.log('== iPad quer 1180 ==');
 const Q=await mk(1180,820);
 await Q.evaluate(()=>{profSet({n:'Sascha',av:charRand()});S.names=['Sascha','Leni','Max'];home()});
 r=await Q.evaluate(()=>{const g=getComputedStyle(document.querySelector('.hgrid'));return {cols:g.gridTemplateColumns.split(' ').length,stage:document.querySelectorAll('.hstage .hsf svg.fig').length,intro:!!document.querySelector('.hnew'),over:app.scrollWidth-app.clientWidth,
   gtTop:document.querySelector('.gt').getBoundingClientRect().top}});
 ok(r.cols===2,'Zwei Spalten');
 ok(r.stage===3,'Bühne mit 3 Figuren');
 ok(!r.intro,'Mit Profil keine "Neu hier?"-Karte');
 ok(r.over<=0&&r.gtTop<400,'Erste Spiele sofort sichtbar, keine waagrechte Verschiebung');

 console.log('Fehler im Browser:',errs.length?errs:'keine');
 if(errs.length)fails++;
 console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e.message);process.exit(2)});
