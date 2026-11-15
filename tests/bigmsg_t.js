// Große Bildschirme (Charakter-SVGs) kommen bei Mitspielern an, auch wenn eine einzelne WebRTC-Nachricht begrenzt ist (Safari ~64 KB)
const {chromium}=require('playwright');const fs=require('fs');
const URL='http://127.0.0.1:8765/index.html',MOCK=fs.readFileSync(__dirname+'/mock.js','utf8');
let fails=0;const errs=[];const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)fails++};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--no-sandbox']});const ctx=await b.newContext({viewport:{width:390,height:844}});await ctx.addInitScript(MOCK);
 await ctx.addInitScript(()=>{window.__MAXMSG=16000});   // strenger als Safari: jede Nachricht über 16 000 Zeichen scheitert
 const mk=async(label,hash)=>{const p=await ctx.newPage();
  await p.addInitScript(pre=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem,r=Storage.prototype.removeItem;Storage.prototype.getItem=function(k){return g.call(this,pre+k)};Storage.prototype.setItem=function(k,v){return s.call(this,pre+k,v)};Storage.prototype.removeItem=function(k){return r.call(this,pre+k)}},label+':');
  p.on('pageerror',e=>errs.push(label+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(label+': '+m.text())});
  await p.goto(URL+(hash||''));await p.waitForSelector('#app .screen');return p};
 const H=await mk('Host');await H.evaluate(()=>profSet({n:'Hosti',av:charRand()}));
 await H.evaluate(()=>onlineMenu());await H.fill('#myn','Hosti');await H.evaluate(()=>netHostStart());
 await H.waitForFunction(()=>NET.on&&NET.host&&NET.code);const code=await H.evaluate(()=>NET.code);
 const C=[];for(const n of ['Anna','Ben','Cem']){const p=await mk(n,'#'+code);await p.evaluate(n=>profSet({n,av:charRand()}),n);await p.evaluate(c=>joinScreen(c),code);await p.fill('#myn',n);await p.evaluate(c=>netJoinStart(c),code);C.push(p)}
 await H.waitForFunction(()=>NET.m.length===4&&NET.m.every((m,i)=>i===0||m.conn&&m.conn.open));await sleep(600);
 ok(await C[0].evaluate(()=>!!document.querySelector('.lroom')),'Warteraum mit Wohnzimmer kommt an');
 await H.evaluate(()=>{window.__mx=0;NET.m.slice(1).forEach(m=>{const c=m.conn,o=c.send.bind(c);c.send=d=>{window.__mx=Math.max(window.__mx,JSON.stringify(d).length);if(d.t==='part')window.__parts=(window.__parts||0)+1;return o(d)}});
   OPT.arsch.rounds=3;OPT.arsch.timer=0;home();pickGame('arsch');startSession('arsch')});await sleep(800);
 // alle schätzen und tippen
 const answer=async(p,host)=>{const sel=host?'#hw ':'';for(let k=0;k<4;k++){const f=await p.$(sel+'[data-f="g"]');if(f){await f.fill(String(100+k));}
   const d=await p.evaluate(s=>{const b=document.querySelector(s+'[data-sub]');if(b){b.click();return true}return false},sel);if(!d)break;await sleep(250)}};
 for(let r=0;r<3;r++){await answer(H,true);for(const p of C)await answer(p,false);await sleep(300)}
 await H.waitForFunction(()=>PAR===null,null,{timeout:8000});await sleep(800);
 const ht=await H.evaluate(()=>document.getElementById('app').innerText);
 ok(/Richtige Antwort/.test(ht),'Host zeigt die Zwischenwertung');
 const big=await H.evaluate(()=>app.innerHTML.length);
 for(const [i,p] of C.entries()){const t=await p.evaluate(()=>document.getElementById('app').innerText);ok(/Richtige Antwort/.test(t)&&/AM NÄCHSTEN/i.test(t),['Anna','Ben','Cem'][i]+' sieht die Zwischenwertung')}
 ok(big>16000&&await H.evaluate(()=>window.__parts>0&&window.__mx<=16000),'Bildschirm ('+big+' Zeichen) wurde in Teilen geschickt, keine Einzelnachricht zu groß');
 console.log('Fehler im Browser:',errs.length?errs:'keine');if(errs.length)fails++;
 console.log(fails?fails+' FEHLGESCHLAGEN':'alles ok');await b.close();process.exit(fails?1:0);
})().catch(e=>{console.error('Abbruch',e.message);process.exit(2)});
