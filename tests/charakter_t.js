// Profil & Charakter: Prüfung fremder Daten, Speichern, Avatar überall, Podest, Online (Charakter bei allen Geräten, ungültige Daten abgelehnt)
const {chromium}=require('playwright');const fs=require('fs');
const URL='http://127.0.0.1:8765/index.html',MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
const SHOT=process.env.PB_SHOT||'';
let fails=0;const errs=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:390,height:800}});await ctx.addInitScript(MOCK);
 const mk=async(label,hash)=>{const p=await ctx.newPage();
  await p.addInitScript(pre=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem,r=Storage.prototype.removeItem;Storage.prototype.getItem=function(k){return g.call(this,pre+k)};Storage.prototype.setItem=function(k,v){return s.call(this,pre+k,v)};Storage.prototype.removeItem=function(k){return r.call(this,pre+k)}},label+':');
  p.on('pageerror',e=>errs.push(label+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(label+': '+m.text())});
  await p.goto(URL+(hash||''));await p.waitForSelector('#app .screen');return p};

 console.log('== Prüfung (charOk) ==');
 const L=await mk('Lokal');
 const v=await L.evaluate(()=>{
  const good={f:1,h:2,c:0,g:1,e:0,y:1,m:0,t:1,o:0,p:0,q:0,s:0,k:0,a:0,b:0};
  return {
   good:JSON.stringify(charOk(good))===JSON.stringify(good),
   missing:JSON.stringify(charOk({h:3}))===JSON.stringify(Object.assign({},...CH_PARTS.map(p=>({[p[0]]:p[0]==='h'?3:0})))),
   extra:(()=>{const r=charOk(Object.assign({x:'<img src=x onerror=alert(1)>'},good));return !!r&&!('x' in r)})(),
   bad:[null,'abc',42,[1,2],{f:'1'},{f:1.5},{f:-1},{f:99},{h:12},{a:9},{b:NaN},{f:true},{f:{}},
        Object.assign({pad:'x'.repeat(300)},good)].map(x=>charOk(x)).every(r=>r===null),
   svgSafe:!/onerror|<script/i.test(figSVG(Object.assign({x:'<img onerror=1>'},good)))
  }});
 ok(v.good,'Gültiger Charakter wird unverändert übernommen');
 ok(v.missing,'Fehlende Schlüssel = 0');
 ok(v.extra,'Unbekannte Schlüssel werden verworfen');
 ok(v.bad,'Kaputte Daten (Text, Kommazahl, negativ, außerhalb der Liste, Arrays, > 200 Bytes) werden abgelehnt');
 ok(v.svgSafe,'Im SVG landet kein fremder Text');

 console.log('== Lokal: Profil, Spielerliste, Avatar ==');
 await L.evaluate(()=>{localStorage.setItem('pb_chars','{kaputt');CHM=null;S.names=['Spieler 1','Leni','Max'];home()});
 ok(await L.evaluate(()=>Object.keys(charsGet()).length===0&&!document.querySelector('.av.ch')),'Kaputter Speicher wird ignoriert, ohne Charakter bleibt der Initialen-Kreis');
 await L.evaluate(()=>profOpen());await L.fill('#pfn','Sascha');
 await L.evaluate(()=>{chSet('h',2);chSet('g',3);chTab('outfit');chSet('s',1)});
 ok(await L.evaluate(()=>document.querySelectorAll('.cho').length>20&&!!document.querySelector('.chstage svg.fig')),'Editor mit Vorschau und Auswahl');
 await L.evaluate(()=>profSave());
 let r=await L.evaluate(()=>({p:JSON.parse(localStorage.getItem('pb_prof')),my:localStorage.getItem('pb_my'),n0:S.names[0],home:!!document.querySelector('.av.ch')}));
 ok(r.p&&r.p.v===1&&r.p.n==='Sascha'&&r.p.av.h===2&&r.p.av.g===3&&r.p.av.s===1,'Profil gespeichert (pb_prof: v, n, av)');
 ok(r.my==='Sascha'&&r.n0==='Sascha','Profilname = Online-Name und ersetzt "Spieler 1"');
 ok(r.home,'Charakter erscheint auf der Startseite');
 await L.evaluate(()=>{playersScreen();charOpen(1)});
 ok(await L.evaluate(()=>PED&&PED.n==='Leni'&&PED.who==='name'),'Spielerliste: Tipp aufs Bild öffnet den Editor für Leni');
 await L.evaluate(()=>{chSet('h',3);profSave()});
 r=await L.evaluate(()=>({m:JSON.parse(localStorage.getItem('pb_chars')),n:document.querySelectorAll('#pl .av.ch').length}));
 ok(r.m&&r.m.leni&&r.m.leni.h===3,'pb_chars speichert Leni (Schlüssel = Name klein)');
 ok(r.n===2,'Spielerliste zeigt 2 Charaktere (Sascha, Leni), Max hat den Initialen-Kreis');
 ok(await L.evaluate(()=>{charsSet('Spieler 7',charRand());return !('spieler 7' in charsGet())}),'Standardnamen werden nicht gespeichert');
 ok(await L.evaluate(()=>{document.querySelector('#pl input[data-i="2"]').value='';charOpen(2);return !PED&&!!document.getElementById('pl')}),'Ohne Namen kein Editor');
 await L.evaluate(()=>{S.names=['Sascha','Leni','Max'];startSession('arsch');finish({vals:[3,9,5]})});
 r=await L.evaluate(()=>({pd:document.querySelectorAll('.podi .pd').length,first:document.querySelector('.pd1 .pn').textContent,fig:document.querySelectorAll('.podi svg.fig').length,cheer:!!document.querySelector('.pd1 .p-cheer'),t:document.body.innerText}));
 ok(r.pd===3&&r.first==='Leni'&&r.fig===3&&r.cheer,'Siegerehrung: Podest mit 3 Figuren, Siegerin jubelt');
 ok(/Gewinner/.test(r.t),'... Gewinner-Zeile bleibt');
 if(SHOT)await L.screenshot({path:SHOT+'/podest.png'});

 console.log('== Online ==');
 const H=await mk('Host');
 await H.evaluate(()=>{profSet({n:'Hosti',av:{f:2,h:0,c:1,g:0,e:0,y:0,m:1,t:0,o:4,p:0,q:0,s:0,k:0,a:0,b:1}})});
 await H.evaluate(()=>onlineMenu());
 ok(await H.evaluate(()=>!!document.querySelector('.pmini .av.ch')),'Online-Menü zeigt den eigenen Charakter');
 await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);
 await A.evaluate(()=>profSet({n:'Anna',av:{f:0,h:3,c:5,g:0,e:1,y:2,m:0,t:2,o:6,p:4,q:0,s:1,k:0,a:6,b:4}}));
 await A.evaluate(c=>joinScreen(c),code);
 ok(await A.evaluate(()=>!!document.querySelector('.pmini .av.ch')),'Beitreten-Bildschirm zeigt den eigenen Charakter');
 await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk('Ben','#'+code);await B.fill('#myn','Ben');await B.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(800);
 r=await H.evaluate(()=>NET.m.map(m=>m.av?m.av.h:null));
 ok(JSON.stringify(r)==='[0,3,null]','Host kennt die Charaktere: Host, Anna (lang), Ben ohne');
 r=await H.evaluate(()=>({room:document.querySelectorAll('#app .lroom .lrf').length,sit:document.querySelectorAll('#app .lroom .lrs').length,ch:document.querySelectorAll('#app .av.ch').length}));
 ok(r.room===3&&r.sit===3&&r.ch===2,'Host-Lobby: Wohnzimmer mit 3 Figuren auf dem Sofa, 2 Charakter-Avatare in der Liste');
 r=await A.evaluate(()=>({room:document.querySelectorAll('#app .lroom .lrf').length,me:!!document.querySelector('#app .rmfig svg.fig'),ch:document.querySelectorAll('#app .av.ch').length,on:[...document.querySelectorAll('#app [onclick],#app [onerror]')].length}));
 ok(r.room===3&&r.me&&r.ch===2,'Annas Warteraum: Wohnzimmer, eigene Figur, Charaktere der anderen');
 ok(r.on===0,'... ohne ausführbare Attribute (strip)');
 if(SHOT){await A.screenshot({path:SHOT+'/warteraum.png',fullPage:true});await H.screenshot({path:SHOT+'/lobby.png',fullPage:true})}
 // Spiel starten: Avatare kommen über die Spiegelung zu den Mitspielern
 await H.evaluate(()=>{localStorage.setItem('pb_dnote','1');CUR='most';gameSetup('most');startSession('most')});await sleep(900);
 r=await B.evaluate(()=>document.querySelectorAll('#app .av.ch,#hw .av.ch').length);
 ok(r>=1,'Im Spiel sieht Ben Charakter-Avatare der anderen (Spiegelung): '+r);

 console.log('== Online: ungültige Daten ==');
 await H.evaluate(()=>lobbyScreen());await sleep(300);
 const X=await mk('Böse');
 const send=async(nm,av)=>{await X.evaluate(([code,nm,av])=>new Promise(res=>{const p=new window.__MockPeer();p.on('open',()=>{const c=p.connect('pbox-'+code);c.on('open',()=>{c.send({t:'hi',n:nm,id:'cid-'+nm,av});setTimeout(res,300)})})}),[code,nm,av]);await sleep(300)};
 await send('Xa',{f:'<img src=x onerror=alert(1)>'});
 await send('Xb',{f:1,pad:'y'.repeat(500)});
 await send('Xc',[1,2,3]);
 await send('Xd',{f:1,h:2,evil:'<script>alert(1)</script>'});
 await send('Xe',{h:999});
 r=await H.evaluate(()=>NET.m.filter(m=>/^X/.test(m.name)).map(m=>[m.name,m.av]));
 ok(r.length===5&&r.filter(x=>x[1]===null).length===4,'Ungültige/zu große Charaktere abgelehnt (null): '+JSON.stringify(r.map(x=>x[0]+':'+(x[1]?'ok':'null'))));
 const xd=r.find(x=>x[0]==='Xd');ok(xd&&xd[1]&&xd[1].h===2&&!('evil' in xd[1]),'Gültiger Rest wird übernommen, fremder Schlüssel verworfen');
 r=await H.evaluate(()=>document.getElementById('app').innerHTML);
 ok(!/onerror|<script|evil/i.test(r),'Nichts davon landet im HTML');

 console.log('Fehler im Browser:',errs.length?errs:'keine');
 if(errs.length)fails++;
 console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e.message);process.exit(2)});
