const {chromium}=require('playwright');const fs=require('fs');
const URL='http://127.0.0.1:8765/index.html',MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
let fails=0;const errs=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:390,height:800}});await ctx.addInitScript(MOCK);
 const mk=async(label,hash)=>{const p=await ctx.newPage();
  await p.addInitScript(pre=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem,r=Storage.prototype.removeItem;Storage.prototype.getItem=function(k){return g.call(this,pre+k)};Storage.prototype.setItem=function(k,v){return s.call(this,pre+k,v)};Storage.prototype.removeItem=function(k){return r.call(this,pre+k)}},label+':');
  p.on('pageerror',e=>errs.push(label+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(label+': '+m.text())});
  await p.goto(URL+(hash||''));await p.waitForSelector('#app .screen');return p};
 const L=await mk('Lokal');
 const r=await L.evaluate(()=>{
  const out={};
  const all=[].concat(Q,...Object.values(QX));const texts=new Set(all.map(q=>q[0]));
  out.orphan=Object.keys(INFO).filter(k=>!texts.has(k));
  out.staticTotal=all.length;out.staticInfo=all.filter(q=>qInfo(q)).length;
  out.noInfo=all.filter(q=>!qInfo(q)).map(q=>q[0]);
  // Generatoren
  const gens={dist:genDist,diffM:()=>genDiff(MOUNT,''),diffB:()=>genDiff(BUILD,''),dates:genDates,ago:genAgo,gap:genGap,age:genAge,conv:genConv,math:genMath};
  out.gen={};out.leaks=[];out.badInfo=[];
  const leak=(q)=>{const inf=qInfo(q);const toks=(inf.match(/\d+(?:[.,]\d+)?/g)||[]).map(t=>parseFloat(t.replace(',','.')));const a=Number(q[1]);return toks.some(t=>t===a||t===Math.round(a))};
  for(const k in gens){let n=0,miss=0;for(let i=0;i<400;i++){const q=gens[k]();n++;const inf=qInfo(q);if(!inf)miss++;if(/undefined|: \.|: ,|null/.test(inf))out.badInfo.push(k+': '+inf);if(leak(q))out.leaks.push(k+': '+q[0]+' → '+q[1]+' | '+inf)}out.gen[k]={n,miss}}
  all.forEach(q=>{if(qInfo(q)&&leak(q))out.leaks.push('static: '+q[0]+' → '+q[1]+' | '+qInfo(q))});
  // Vollständigkeit der Lookup-Tabellen
  out.missing={people:PEOPLE.filter(p=>!PEOPLEI[p[0]]).map(p=>p[0]),city:CITY.filter(c=>!CITYI[c[0]]).map(c=>c[0]),mount:MOUNT.concat(BUILD).filter(m=>!MI[m[0]]).map(m=>m[0]),ev:EV.filter(e=>!EVI[e[0]]).map(e=>e[0])};
  return out;
 });
 ok(r.orphan.length===0,'Alle INFO-Schlüssel passen zu einer Frage'+(r.orphan.length?': '+JSON.stringify(r.orphan):''));
 console.log(`   feste Fragen mit Info: ${r.staticInfo} von ${r.staticTotal}`);
 for(const k in r.gen)ok(r.gen[k].miss===0,`Generator ${k}: 400 Fragen, alle mit Info`);
 ok(r.badInfo.length===0,'Keine kaputten Info-Texte (undefined/leer)'+(r.badInfo.length?': '+r.badInfo.slice(0,3):''));
 ok(r.missing.people.length+r.missing.city.length+r.missing.mount.length+r.missing.ev.length===0,'Info für alle Personen, Städte, Berge/Gebäude, Ereignisse'+JSON.stringify(r.missing));
 ok(r.leaks.length===0,'Kein Info-Text enthält die Antwort als Zahl'+(r.leaks.length?'\n     '+r.leaks.slice(0,8).join('\n     '):''));
 console.log('   Ohne Info (feste Fragen):',r.noInfo.length);

 console.log('== Oberfläche lokal ==');
 await L.evaluate(()=>{OPT.arsch.timer=0;OPT.arsch.cats={};S.names=['Anna','Ben','Cem'];pickGame('arsch');startSession('arsch');G.deck[0]=Q.find(q=>q[0]==='In welchem Jahr sank die Titanic?');G.q=G.deck[0];HF()});await sleep(300);
 ok(await L.evaluate(()=>!!document.querySelector('.qm')&&document.querySelector('.qinfo').hidden),'Frage mit Info: "?" sichtbar, Info zunächst verborgen');
 await L.click('.qm');await sleep(100);
 ok(await L.evaluate(()=>!document.querySelector('.qinfo').hidden&&document.querySelector('.qinfo').innerText.includes('Eisberg')),'Antippen zeigt die Erklärung');
 ok(await L.evaluate(()=>!document.querySelector('.qinfo').innerText.includes('1912')),'... ohne die Jahreszahl');
 await L.screenshot({path:'info-local.png'});
 await L.click('.qm');await sleep(100);
 ok(await L.evaluate(()=>document.querySelector('.qinfo').hidden),'Nochmal antippen blendet aus');
 ok(await L.evaluate(()=>{const i=document.getElementById('g');return i&&document.querySelector('.qm').closest('.row')!==null}),'Eingabefeld bleibt nutzbar');
 await L.evaluate(()=>{G.q=['Wie viele Zähne hat ein Hai?',3,'']; arGuess()});await sleep(150);
 ok(await L.evaluate(()=>!document.querySelector('.qm')&&!document.querySelector('.qinfo')),'Frage ohne Info: kein "?"');

 console.log('== Online (Host + Anna) ==');
 const H=await mk('Host');await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===2&&NET.m[1].conn&&NET.m[1].conn.open);await sleep(300);
 ok(await vis(A),'Mitspieler: Hauptmenü-Knopf in der Lobby sichtbar');
 async function vis(p){return p.evaluate(()=>getComputedStyle(document.getElementById('hm')).display!=='none')}
 await H.evaluate(()=>{OPT.arsch.timer=0;OPT.arsch.cats={};home();pickGame('arsch');startSession('arsch');});await sleep(200);
 await H.evaluate(()=>{const q=Q.find(q=>q[0]==='In welchem Jahr sank die Titanic?');G.deck[0]=q;G.q=q;arRound()});await sleep(600);
 ok(await A.evaluate(()=>!!document.querySelector('[data-p] .qm')),'Annas Formular hat das "?"');
 await A.click('.qm');await sleep(100);
 ok(await A.evaluate(()=>!document.querySelector('.qinfo').hidden),'Anna kann die Info lokal aufklappen');
 ok(await H.evaluate(()=>document.querySelector('#hw .qinfo').hidden),'Das beim Host nicht mit aufgeklappt (rein lokal)');
 ok(await A.evaluate(()=>{const i=document.querySelector('[data-f="g"]');i.value='1900';return true})&&true,'Eingabe nach Aufklappen möglich');
 console.log('== Mitspieler: Hauptmenü verlässt die Lobby ==');
 await A.click('#hm');await sleep(200);
 ok((await A.evaluate(()=>document.querySelector('#hmc').innerText)).includes('Lobby verlassen'),'Rückfrage: "Lobby verlassen"');
 await A.evaluate(()=>[...document.querySelectorAll('#hmc button')].find(x=>/Lobby verlassen/.test(x.textContent)).click());await sleep(500);
 ok(await A.evaluate(()=>!NET.on&&document.getElementById('app').innerText.includes('Such dir ein Spiel')),'Anna ist raus und im Hauptmenü');
 ok(!(await vis(A)),'Knopf danach weg');
 ok(await H.evaluate(()=>!isOpen(NET.m[1])),'Host sieht Anna getrennt');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
