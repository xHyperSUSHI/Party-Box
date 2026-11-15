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
 console.log('== Gemerkte Wörter ==');
 await L.evaluate(()=>{localStorage.removeItem('pb_slfm');SLFM={ban:{},ok:{}}});
 const play=async(mode,vals)=>{await L.evaluate(([mode])=>{S.names=['Anna','Ben','Cem'];Object.assign(OPT.slf,{mode:'digital',stop:false,rounds:3,check:mode,sel:{Stadt:1,Land:1,Fluss:1,Tier:1,Beruf:1},custom:[]});startSession('slf');if(G.reelOn)slfReelGo()},[mode]);await sleep(200);
   await L.evaluate(vals=>{G.lt='H';vals.forEach(v=>{HF();v.forEach((x,k)=>$('sf'+k).value=x);slfDSubmit()})},vals);await sleep(300)};
 await play('hinweis',[['Hamburg','Haiti','Havel','Hase','Hausmeister'],['Hannover','Honduras','Hase','Hund','Hebamme'],['Hagen','Hawaii','Hunte','Hirsch','Heizer']]);
 ok(await L.evaluate(()=>slfCalc().det[1][2]===10),'Runde 1: „Hawaii“ zählt (Hinweis-Modus)');
 await L.evaluate(()=>[...document.querySelectorAll('.card')[1].querySelectorAll('.rv')[2].querySelectorAll('.rb')][0].click());await sleep(200);
 ok(await L.evaluate(()=>G.bad[1][2]===true&&slfMemHas('ban','Land','hawaii')&&JSON.parse(localStorage.getItem('pb_slfm')).ban.Land.hawaii==='Hawaii'),'✕ streicht und merkt sich „Hawaii“ für „Land“ (auch gespeichert)');
 ok(await L.evaluate(()=>!!document.querySelector('.toast')&&document.querySelector('.toast').textContent.includes('Gemerkt')),'Hinweis „Gemerkt: … künftig nicht“');
 ok(await L.evaluate(()=>!slfMemHas('ban','Stadt','hawaii')&&!slfMemHas('ban','Land','Haiti')),'Andere Kategorie und andere Wörter bleiben unberührt');
 // Runde 2: automatisch gestrichen
 await play('hinweis',[['Hamburg','HAWAII','Havel','Hase','Hausmeister'],['Hannover','Honduras','Hase','Hund','Hebamme'],['Hagen','Haiti','Hunte','Hirsch','Hawaii']]);
 ok(await L.evaluate(()=>G.bad[1][0]===true&&G.memAuto[1][0]===true&&slfCalc().det[1][0]===null),'Neue Partie: „HAWAII“ (Land) ist automatisch gestrichen (Groß-/Kleinschreibung egal)');
 t=await txt(L);ok(t.includes('gemerkt: zählt in „Land“ nicht'),'Hinweis „gemerkt: zählt in Land nicht“');
 ok(await L.evaluate(()=>G.bad[4][2]===false&&G.bad[1][2]===false&&slfCalc().det[1][2]===10),'Dasselbe Wort in einer anderen Kategorie (Beruf: „Hawaii“) wird nicht gestrichen; Haiti zählt');
 // aufheben
 await L.evaluate(()=>[...document.querySelectorAll('.card')[1].querySelectorAll('.rv')[0].querySelectorAll('.rb')][0].click());await sleep(200);
 ok(await L.evaluate(()=>G.bad[1][0]===false&&!slfMemHas('ban','Land','hawaii')),'↺ hebt die Entscheidung auch im Speicher auf');
 await play('hinweis',[['Hamburg','Hawaii','Havel','Hase','Hausmeister'],['Hannover','Honduras','Hase','Hund','Hebamme'],['Hagen','Haiti','Hunte','Hirsch','Heizer']]);
 ok(await L.evaluate(()=>G.bad[1][0]===false),'Nächste Partie: „Hawaii“ zählt wieder');
 // Setup-Anzeige
 await L.evaluate(()=>{slfMemSet('ban','Land','Hawaii',true);slfMemSet('ban','Tier','Hase',true);OPT.slf.mode='digital';pickGame('slf')});await sleep(250);
 ok((await txt(L)).includes('Gemerkte Wörter (2)'),'Setup: „Gemerkte Wörter (2)“');
 await L.evaluate(()=>{const d=[...document.querySelectorAll('details')].find(d=>/Gemerkte/.test(d.textContent));d.open=true;d.dispatchEvent(new Event('toggle'))});
 await L.evaluate(()=>[...document.querySelectorAll('.chip')].find(c=>/Land: Hawaii/.test(c.textContent)).click());await sleep(250);
 ok(await L.evaluate(()=>!slfMemHas('ban','Land','Hawaii')&&slfMemHas('ban','Tier','Hase')&&[...document.querySelectorAll('details')].find(d=>/Gemerkte/.test(d.textContent)).open),'Tippen auf einen Eintrag vergisst ihn, Bereich bleibt offen');
 await L.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/Alles vergessen/.test(b.textContent)).click());await sleep(250);
 ok(await L.evaluate(()=>JSON.stringify(SLFM)==='{"ban":{},"ok":{}}')&&!(await txt(L)).includes('Gemerkte Wörter'),'„Alles vergessen“ leert den Speicher, Bereich verschwindet');
 // Streng: Trotzdem werten merken
 await play('streng',[['Hamburg','Haiti','Havel','Hase','Hausmeister'],['Hannover','Honduras','Hase','Hund','Hebamme'],['Hagen','Hawaii','Hunte','Hirsch','Heizer']]);
 ok(await L.evaluate(()=>slfCalc().det[1][2]===null),'Streng: unbekanntes „Hawaii“ zählt nicht');
 await L.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/Trotzdem werten/.test(b.textContent)).click());await sleep(200);
 ok(await L.evaluate(()=>slfMemHas('ok','Land','Hawaii')&&slfCalc().det[1][2]===10),'„Trotzdem werten“ wird gemerkt');
 await play('streng',[['Hamburg','Haiti','Havel','Hase','Hausmeister'],['Hannover','Honduras','Hase','Hund','Hebamme'],['Hagen','Hawaii','Hunte','Hirsch','Heizer']]);
 ok(await L.evaluate(()=>G.allow[1][2]===true&&slfCalc().det[1][2]===10),'Nächste Streng-Partie: „Hawaii“ ist schon zugelassen');
 // Streichen ersetzt Zulassen
 await L.evaluate(()=>[...document.querySelectorAll('.card')[1].querySelectorAll('.rv')[2].querySelectorAll('.rb')][0].click());await sleep(200);
 ok(await L.evaluate(()=>slfMemHas('ban','Land','Hawaii')&&!slfMemHas('ok','Land','Hawaii')),'Streichen ersetzt ein gemerktes „Zulassen“');
 // Korrektur hebelt Merken nicht aus
 await play('hinweis',[['Hamburg','Haiti','Havel','Hase','Hausmeister'],['Hannover','Honduras','Hase','Hund','Hebamme'],['Hagen','Hawai','Hunte','Hirsch','Heizer']]);
 ok(await L.evaluate(()=>G.bad[1][2]===false),'Tippfehler „Hawai“ ist ein anderes Wort und nicht automatisch gestrichen');
 await L.evaluate(()=>slfTake(1,2,'Hawaii'));await sleep(150);
 ok(await L.evaluate(()=>slfMemHas('ban','Land',slfEff(1,2))),'(Nur zur Kontrolle: korrigiertes Wort ist gemerkt, aber diese Runde nicht rückwirkend gestrichen)');
 // Neuladen behält Speicher
 await L.evaluate(()=>{slfMemSet('ban','Fluss','Hunte',true)});
 await L.reload();await L.waitForSelector('#app .screen');
 ok(await L.evaluate(()=>slfMemHas('ban','Fluss','Hunte')&&slfMemHas('ban','Land','Hawaii')),'Nach Neuladen ist alles noch da');
 // Obergrenze
 await L.evaluate(()=>{SLFM={ban:{},ok:{}};for(let i=0;i<305;i++)slfMemSet('ban','Land','w'+String.fromCharCode(97+Math.floor(i/26)%26,97+i%26,97+Math.floor(i/676)),true)});
 ok(await L.evaluate(()=>Object.keys(SLFM.ban.Land).length===300),'Höchstens 300 gemerkte Wörter je Kategorie (Älteste fliegen raus)');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
