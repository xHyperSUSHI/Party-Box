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
 console.log('== Host-Lobby nach Neuladen wiederherstellen ==');
 const H=await mk('Host');await H.evaluate(()=>{localStorage.setItem('pb_dnote','1');S.names=['Lokal1','Lokal2'];saveCfg()});
 await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const A=await mk('Anna','#'+code);await A.fill('#myn','Anna');await A.evaluate(c=>netJoinStart(c),code);
 const B=await mk('Ben','#'+code);await B.fill('#myn','Ben');await B.evaluate(c=>netJoinStart(c),code);
 await H.waitForFunction(()=>NET.m.length===3&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(500);
 ok(await H.evaluate(c=>{const x=JSON.parse(localStorage.getItem('pb_host')||'null');return x&&x.code===c&&x.name==='Hosti'&&Date.now()-x.t<10000},code),'Lobby (Code + Name) ist auf dem Host-Gerät gemerkt');
 // Host-Seite wird vom System neu geladen
 await H.reload();await H.waitForSelector('#app .screen');
 await H.waitForFunction(()=>NET.on&&NET.host,null,{timeout:8000}).catch(()=>{});
 ok(await H.evaluate(c=>NET.on&&NET.host&&NET.code===c&&NET.m.length===1&&NET.m[0].name==='Hosti',code),'Nach dem Neuladen ist der Host wieder in seiner Lobby (gleicher Code '+code+')');
 t=await H.evaluate(()=>document.body.innerText);
 ok(t.includes('Lobby')&&t.includes(code)&&t.includes('Hosti'),'Host sieht seinen Lobby-Bildschirm mit Code');
 ok(await H.evaluate(()=>!!document.querySelector('.toast')&&document.querySelector('.toast').textContent.includes('wiederhergestellt')),'Hinweis „Lobby wiederhergestellt“');
 // Mitspieler warten und verbinden sich still neu
 for(const p of [A,B])await p.evaluate(()=>{NET.lastHost=Date.now()-20000;hbTick();NET.wait.t0=Date.now()-11000});
 await sleep(6500);
 ok(await H.evaluate(()=>NET.m.length===3&&NET.m.some(m=>m.name==='Anna'&&isOpen(m))&&NET.m.some(m=>m.name==='Ben'&&isOpen(m))),'Anna und Ben sind automatisch wieder in der Lobby');
 ok(await A.evaluate(()=>!NET.wait&&!document.getElementById('hwait')&&!!document.querySelector('.room')),'Anna: Banner weg, Warteraum zurück');
 // und es geht weiter
 await H.evaluate(()=>{OPT.ttt.vs='mensch';home();pickGame('ttt');startSession('ttt')});await sleep(900);
 ok(await A.evaluate(()=>document.querySelectorAll('.ttc').length===9),'Danach läuft ein Spiel wieder ganz normal');
 // Spiel mitten drin: Neuladen -> Lobby, Spiel weg, Spieler warten
 await H.reload();await H.waitForSelector('#app .screen');await H.waitForFunction(()=>NET.on&&NET.host,null,{timeout:8000}).catch(()=>{});
 ok(await H.evaluate(()=>NET.on&&NET.host&&!NET.inGame&&document.body.innerText.includes('Lobby')),'Mitten im Spiel neu geladen: Host landet in der Lobby (Spiel ist weg)');
 // Lobby bewusst schließen vergisst alles
 await H.evaluate(()=>lobbyScreen());await sleep(200);
 await H.evaluate(()=>[...document.querySelectorAll('button')].find(b=>/Lobby schließen/.test(b.textContent)).click());await sleep(150);
 await H.evaluate(()=>[...document.querySelectorAll('#lcd button')].find(b=>!b.classList.contains('sec')).click());await sleep(500);
 ok(await H.evaluate(()=>localStorage.getItem('pb_host')===null),'„Lobby schließen“ löscht den Merker');
 await H.reload();await H.waitForSelector('#app .screen');await sleep(500);
 ok(await H.evaluate(()=>!NET.on&&!!document.querySelector('.gt')&&S.names.join()==='Lokal1,Lokal2'),'Nach dem Schließen: kein automatisches Wiederaufbauen, eigene Spielerliste zurück');
 // abgelaufen
 await H.evaluate(()=>{localStorage.setItem('pb_host',JSON.stringify({code:'ABCDE',name:'Alt',t:Date.now()-4*36e5}))});
 await H.reload();await H.waitForSelector('#app .screen');await sleep(500);
 ok(await H.evaluate(()=>!NET.on),'Ein Merker älter als 3 Stunden wird ignoriert');
 // Link-Beitritt hat Vorrang
 await H.evaluate(()=>{localStorage.setItem('pb_host',JSON.stringify({code:'ABCDE',name:'Alt',t:Date.now()}))});
 await H.goto('http://127.0.0.1:8765/index.html?x=1#ZZZZZ');await H.waitForSelector('#app .screen');await sleep(500);
 ok(await H.evaluate(()=>!NET.on&&document.body.innerText.includes('Beitreten')),'Mit Beitritts-Link wird nicht wiederhergestellt, sondern beigetreten');
 console.log('\nFehler im Browser:',errs.length?errs:'keine');console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e);process.exit(2)});
