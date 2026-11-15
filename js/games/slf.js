/* ---------- Stadt, Land, Fluss ---------- */
const SLFA=['Stadt','Land','Fluss','Tier','Beruf','Vorname','Pflanze','Essen','Getränk','Gegenstand','Farbe','Sportart','Film / Serie','Marke','Körperteil','Berg','Musik','Kleidung','Fahrzeug','Instrument','Gemüse','Obst','Süßigkeit','Hobby','Märchenfigur','Superheld','Spielzeug','Schulfach','Insekt','Vogel','Fisch','Gewürz','Weihnachtslied','Geschenk','Gebäck','Weihnachtsfilm','Festessen','Winterort','Ausrede','Peinlicher Moment','Date-Ort','Cocktail','Laster','Partyhit','Insel','Sehenswürdigkeit','Souvenir','Verkehrsmittel','Brettspiel','Verein','Schauspieler','Sänger / Band','Song'],SLFL='ABDEFGHKLMNPRSTW'.split('');
const SLFP=[{n:'Klassisch',e:'📜',c:['Stadt','Land','Fluss','Tier','Beruf']},
{n:'Weihnachten',e:'🎄',c:['Weihnachtslied','Geschenk','Gebäck','Weihnachtsfilm','Festessen','Winterort']},
{n:'Spicy',e:'🌶️',adult:true,c:['Ausrede','Peinlicher Moment','Date-Ort','Cocktail','Laster','Partyhit']},
{n:'Schule & Kids',e:'🎒',c:['Schulfach','Tier','Spielzeug','Märchenfigur','Superheld','Süßigkeit']},
{n:'Urlaub',e:'🏖️',c:['Land','Stadt','Insel','Sehenswürdigkeit','Verkehrsmittel','Souvenir']},
{n:'Essen & Trinken',e:'🍕',c:['Essen','Gemüse','Obst','Getränk','Süßigkeit','Gewürz']},
{n:'Natur',e:'🌿',c:['Tier','Pflanze','Fluss','Berg','Vogel','Insekt']},
{n:'Film & Musik',e:'🎬',c:['Film / Serie','Schauspieler','Sänger / Band','Song','Instrument','Superheld']},
{n:'Sport & Spiel',e:'⚽',c:['Sportart','Verein','Brettspiel','Hobby','Spielzeug','Fahrzeug']}];
function slfSave(){try{localStorage.setItem('pb_slfc',JSON.stringify({sel:OPT.slf.sel,custom:OPT.slf.custom}))}catch(e){}}
OPT.slf={rounds:5,timer:0,mode:'zettel',dtimer:90,stop:true,check:'hinweis',more:false,memOpen:false,sel:{Stadt:1,Land:1,Fluss:1,Tier:1,Beruf:1},custom:[]};
try{const x=JSON.parse(localStorage.getItem('pb_slfc')||'null');if(x&&x.sel&&Array.isArray(x.custom)){OPT.slf.sel=x.sel;OPT.slf.custom=x.custom.filter(c=>typeof c==='string').slice(0,4)}}catch(e){}
const slfAll=()=>SLFA.filter(c=>OPT.slf.sel[c]).concat(OPT.slf.custom);
/* Gemerkte Entscheidungen des Hosts, pro Kategorie und Wort (ohne Groß-/Kleinschreibung/Umlaut-Unterschiede): ban = zählt nicht, ok = trotzdem werten */
let SLFM={ban:{},ok:{}};
try{const x=JSON.parse(localStorage.getItem('pb_slfm')||'null');if(x&&x.ban&&x.ok)SLFM=x}catch(e){}
function slfMemSave(){try{localStorage.setItem('pb_slfm',JSON.stringify(SLFM))}catch(e){}}
function slfMemHas(kind,cat,w){const f=slfFold(w);return !!f&&!!SLFM[kind][cat]&&Object.prototype.hasOwnProperty.call(SLFM[kind][cat],f)}
function slfMemSet(kind,cat,w,on){
  const f=slfFold(w);if(!f)return;const m=SLFM[kind][cat]=SLFM[kind][cat]||{};
  if(on){m[f]=String(w).trim().slice(0,30);const ks=Object.keys(m);if(ks.length>300)delete m[ks[0]]}else delete m[f];
  if(!Object.keys(m).length)delete SLFM[kind][cat];
  slfMemSave();
}
function slfMemForget(kind,cat,f){if(SLFM[kind][cat]){delete SLFM[kind][cat][f];if(!Object.keys(SLFM[kind][cat]).length)delete SLFM[kind][cat];slfMemSave();slfKeepScroll(()=>gameSetup('slf'))}}
function slfMemClear(){SLFM={ban:{},ok:{}};slfMemSave();slfKeepScroll(()=>gameSetup('slf'))}
function slfMemUI(){
  const items=[];['ban','ok'].forEach(kind=>Object.keys(SLFM[kind]).forEach(cat=>Object.keys(SLFM[kind][cat]).forEach(f=>items.push([kind,cat,f,SLFM[kind][cat][f]]))));
  if(!items.length)return '';
  return `<details style="margin-top:10px" ${OPT.slf.memOpen?'open':''} ontoggle="OPT.slf.memOpen=this.open"><summary class="sm" style="cursor:pointer;padding:6px 0">🧠 Gemerkte Wörter (${items.length})</summary><p class="sm" style="margin:4px 0 8px">Diese Entscheidungen übernimmt die App künftig automatisch. Tippen vergisst ein Wort wieder.</p><div class="chips">${items.map(x=>`<span class="chip ${x[0]==='ok'?'on':''}" onclick="slfMemForget('${x[0]}',${JSON.stringify(x[1]).replace(/"/g,'&quot;')},${JSON.stringify(x[2]).replace(/"/g,'&quot;')})">${x[0]==='ban'?'🚫':'✅'} ${esc(x[1])}: ${esc(x[3])} ✕</span>`).join('')}</div><button class="sec" style="margin-top:8px;padding:10px" onclick="slfMemClear()">Alles vergessen</button></details>`;
}
const slfKeepScroll=keepScroll;
function slfTog(i){   // Kategorie aus dem Pool hinzufügen/entfernen
  const c=SLFA[i],o=OPT.slf;
  if(!o.sel[c]&&slfAll().length>=10){toast('Höchstens 10 Kategorien');return}
  o.sel[c]=o.sel[c]?0:1;slfSave();slfKeepScroll(()=>gameSetup('slf'));
}
function slfPreset(i){
  const p=SLFP[i],go=()=>{OPT.slf.sel={};p.c.forEach(c=>OPT.slf.sel[c]=1);slfSave();slfKeepScroll(()=>gameSetup('slf'))};
  if(p.adult)drinkGate(go);else go();
}
function slfAddCat(){
  const e=$('slfn');if(!e)return;const v=e.value.trim().slice(0,20),o=OPT.slf;
  if(!v){toast('Gib eine Kategorie ein');return}
  if(o.custom.length>=4){toast('Höchstens 4 eigene Kategorien');return}
  if(slfAll().length>=10){toast('Höchstens 10 Kategorien');return}
  if(SLFA.concat(o.custom).some(c=>c.toLowerCase()===v.toLowerCase())){toast('Gibt es schon');return}
  o.custom.push(v);slfSave();slfKeepScroll(()=>gameSetup('slf'));
}
function slfDelCat(i){OPT.slf.custom.splice(i,1);slfSave();slfKeepScroll(()=>gameSetup('slf'))}
const slfPresetOn=p=>{const a=SLFA.filter(c=>OPT.slf.sel[c]);return !OPT.slf.custom.length&&a.length===p.c.length&&p.c.every(x=>OPT.slf.sel[x])};
function slfCatUI(){
  const o=OPT.slf,sel=SLFA.map((c,i)=>[c,i]).filter(x=>o.sel[x[0]]),rest=SLFA.map((c,i)=>[c,i]).filter(x=>!o.sel[x[0]]),dr=drinkOn();
  return `<p class="sm" style="margin:0 0 8px">Vorlagen</p><div class="chips">${SLFP.map((p,i)=>p.adult&&!dr?'':`<span class="chip ${slfPresetOn(p)?'on':''}" onclick="slfPreset(${i})">${p.e} ${esc(p.n)}${p.adult?' (ab 18)':''}</span>`).join('')}</div>
  <p class="sm" style="margin:16px 0 8px">Deine Kategorien (<span id="slfcnt">${slfAll().length}</span> von 10, mindestens 3) – Tippen entfernt</p><div class="chips">${sel.map(x=>`<span class="chip on" onclick="slfTog(${x[1]})">${esc(x[0])} ✕</span>`).join('')}${o.custom.map((c,i)=>`<span class="chip on" onclick="slfDelCat(${i})">${esc(c)} ✕</span>`).join('')}</div>
  <details style="margin-top:10px" ${o.more?'open':''} ontoggle="OPT.slf.more=this.open"><summary class="sm" style="cursor:pointer;padding:6px 0">Mehr Kategorien (${rest.length})</summary><div class="chips" style="margin-top:6px">${rest.map(x=>`<span class="chip" onclick="slfTog(${x[1]})">＋ ${esc(x[0])}</span>`).join('')}</div></details>
  <div class="row" style="margin-top:10px"><input id="slfn" class="txt" type="text" maxlength="20" autocomplete="off" placeholder="Eigene Kategorie …" style="margin:0;flex:1"><button class="sec ib" onclick="slfAddCat()" aria-label="Kategorie hinzufügen" style="margin:0">＋</button></div>${slfMemUI()}`;
}
GAMES.slf={name:'Stadt, Land, Fluss',e:'✏️',tag:'Mit Zettel oder digital',c:['#22c55e','#16a34a'],min:2,teams:false,
  desc:'Ein Buchstabe, eure Kategorien: wer findet die meisten Wörter? Kategorien frei wählbar, mit Zettel und Stift oder direkt im Handy eingetippt.',
  rules:'<b>Digital:</b> Der Buchstabe steht oben, jeder tippt zu jeder Kategorie je ein Wort ein (Zeitlimit). Danach zeigt die App alle Antworten und berechnet die Punkte (10 / 5 / 20, siehe unten). Wer als Erster alle Felder ausgefüllt hat, ruft „Stopp“: Dann ist die Runde für alle bald zu Ende (abschaltbar). Wörter, die nicht stimmen, tippt ihr an und streicht sie. <b>Mit Zettel:</b> Jeder braucht <b>Zettel und Stift</b>. Die App nennt einen Buchstaben. Schreibt zu jeder gewählten Kategorie (Standard: Stadt, Land, Fluss, Tier, Beruf; ihr könnt auch eigene erfinden) je ein Wort, das damit anfängt. Wer fertig ist, ruft „Stopp!“ (oder die Zeit läuft ab). Danach werden die Wörter verglichen und Punkte eingetragen: <b>10</b> für ein eigenes Wort, <b>5</b> wenn ein anderer das gleiche hat, <b>20</b> wenn nur du eins hast, 0 für nichts. Wer am Ende die meisten Punkte hat, gewinnt.',
  opts:()=>`${slfCatUI()}<p class="sm" style="margin:14px 0 8px">Spielweise</p>${seg('slf','mode',['zettel','digital'],v=>v==='zettel'?'✏️ Zettel & Stift':'⌨️ Digital tippen')}<p class="sm" style="margin:14px 0 8px">Runden</p>${seg('slf','rounds',[3,5,8])}${OPT.slf.mode==='digital'?`<p class="sm" style="margin:14px 0 8px">Zeit zum Tippen</p>${seg('slf','dtimer',[60,90,120],v=>v+' s')}<p class="sm" style="margin:14px 0 8px">Stopp-Regel</p>${seg('slf','stop',[true,false],v=>v?'✋ Erster fertig beendet':'Aus')}<p class="sm" style="margin:8px 0 0">Mit Stopp-Regel kann man erst „Fertig“ sagen, wenn alle Felder ausgefüllt sind – dann beendet das die Runde für alle (online: noch 4 Sekunden, an einem Gerät: die Folgenden haben nur so lange Zeit wie der Erste gebraucht hat, mindestens 20 s).</p><p class="sm" style="margin:14px 0 8px">Wörter prüfen (Listen für Land, Stadt, Fluss, Tier, Beruf, Vorname, Farbe, Körperteil, Sportart, Getränk)</p>${seg('slf','check',['aus','hinweis','streng'],v=>({aus:'Aus',hinweis:'Hinweis',streng:'Streng'})[v])}<p class="sm" style="margin:8px 0 0">Hinweis: Unbekannte Wörter werden markiert, zählen aber. Streng: Unbekannte zählen nicht, außer der Host lässt sie zu. Die Listen sind nicht vollständig – im Zweifel entscheidet der Host.</p><p class="sm" style="margin:8px 0 0">Online tippen alle gleichzeitig auf dem eigenen Gerät. An einem Gerät kommt jeder nacheinander dran (die anderen schauen weg). Die Punkte werden automatisch berechnet, falsche Wörter streicht ihr danach mit einem Tipp.</p>`:`<p class="sm" style="margin:14px 0 8px">Zeitlimit</p>${seg('slf','timer',[0,60,90],v=>v?v+' s':'Aus')}`}`,
  start:slfStart};
function slfStart(){
  let cats=slfAll();if(cats.length<3){cats=SLFA.slice(0,5);toast('Zu wenige Kategorien – es gelten Stadt, Land, Fluss, Tier, Beruf')}
  G.cats=cats.slice(0,10);G.pool=ordered(SLFL,x=>x,'g');G.rounds=Math.max(1,Math.min(G.o.rounds,G.pool.length));G.r=0;slfRound()}
function slfRound(){
  if(G.o.mode==='digital'){slfDRound();return}
  G.lt=G.pool[G.r];mark('g',G.lt);G.sc=S.P.map(()=>0);
  scr(`${prg(G.r,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}<div class="card hand"><div class="big" style="font-size:26px">Zettel und Stift bereit?</div><p>Gleich kommt der Buchstabe. Alle fangen gleichzeitig an.</p><button onclick="slfPlay()">Buchstabe aufdecken</button></div>`);
}
/* Buchstaben-Rad: 3D-Walze, nur die vordere Hälfte ist sichtbar; dreht, bremst ab und rastet beim Buchstaben ein */
function slfReelHTML(letter){
  const n=SLFL.length,th=360/n,h=74,r=Math.round(h/2/Math.tan(Math.PI/n)),idx=Math.max(0,SLFL.indexOf(letter)),fin=idx*th;
  const nm='slfspin'+G.r+'x'+(Date.now()%100000);   // eigener Name + feste Zahlen (kein var() in @keyframes: Safari-sicher)
  return `<div class="slfw" style="--h:${h}px"><style>@keyframes ${nm}{0%{transform:rotateX(${fin+1080}deg);animation-timing-function:cubic-bezier(.22,.6,.2,1);-webkit-animation-timing-function:cubic-bezier(.22,.6,.2,1)}88%{transform:rotateX(${fin-5}deg);animation-timing-function:ease-in-out;-webkit-animation-timing-function:ease-in-out}100%{transform:rotateX(${fin}deg)}}</style><div class="slfd" style="transform:rotateX(${fin}deg);-webkit-animation-name:${nm};animation-name:${nm}" data-fin="${fin}">${SLFL.map((c,i)=>`<div class="slfi" style="transform:rotateX(${(-i*th).toFixed(2)}deg) translateZ(${r}px)">${c}</div>`).join('')}</div><div class="slfm"></div></div>`;
}
function slfReelScreen(){
  scr(`${prg(G.r,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}<div class="card" style="text-align:center"><div class="sm">Der Buchstabe wird gezogen …</div>${slfReelHTML(G.lt)}<button class="sec" onclick="slfReelGo()">Überspringen</button></div>`);
}
function slfReel(next){
  G.reelNext=next;G.reelOn=true;const g=G,T=4800,n=14;
  slfReelScreen();
  for(let i=1;i<=n;i++)setTimeout(()=>{if(G===g&&g.reelOn)sfx.pop()},T*Math.pow(i/n,1.8));
  setTimeout(()=>{if(G===g&&g.reelOn){sfx.win();vib([40,30,40]);confetti(60,GOLD)}},T+100);
  setTimeout(()=>{if(G===g&&g.reelOn)slfReelGo()},T+1900);
}
function slfReelGo(){if(!G.reelOn)return;G.reelOn=false;const f=G.reelNext;G.reelNext=null;if(f)f()}
function slfPlay(){slfReel(slfShow)}
function slfShow(){
  scr(`${prg(G.r,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}<div class="card ans" style="text-align:center"><div class="sm">Der Buchstabe ist</div><div class="slfl">${G.lt}</div>
  <div class="chips" style="justify-content:center">${G.cats.map(c=>`<span class="chip on">${esc(c)}</span>`).join('')}</div>
  <p class="sm">Schreibt zu jeder Kategorie ein Wort mit ${G.lt}. Wer fertig ist, ruft „Stopp!“.</p><button onclick="slfStop()">✋ Stopp! Wir werten</button></div>`);
  sfx.pop();vib(40);
  if(G.o.timer)tmrShow(G.o.timer*1000,slfStopT);
}
function slfStop(timeUp){   // Zettel-Modus: online darf jeder „Stopp“ drücken, danach trägt jeder seine Punkte selbst ein
  tmrHide();sfx.bad();
  if(NET.host&&NET.m.length>1){
    const who=timeUp===true?null:(NET.who==null?0:NET.who);
    slfScoreOnline(who==null?'⏰ Zeit abgelaufen!':'✋ Stopp von '+S.P[who]+'!');
    return;
  }
  G.scOnline=false;slfScore();
}
const slfStopT=()=>slfStop(true);
function slfScoreOnline(msg){
  G.sc=S.P.map(()=>0);G.scOnline=true;
  parBegin({head:()=>prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds} · Buchstabe ${G.lt}`),dur:[180000],msg:msg+' Zählt eure Punkte vom Zettel zusammen (10 · 5 · 20 pro Wort) und tragt sie auf eurem Handy ein.',steps:[
    {k:'s',timeout:pi=>{G.sc[pi]=0},html:pi=>`<div class="card"><p style="margin:0 0 10px;font-weight:800;font-size:17px">${esc(msg)}</p><div class="row" style="align-items:center;gap:10px;margin-bottom:8px">${av(pi)}<span class="sm">${esc(S.P[pi])}: Punkte in dieser Runde</span></div><div class="sm">Buchstabe ${esc(G.lt)} · Zettel zusammenzählen: 10 Punkte für ein eigenes Wort, 5 bei gleichem Wort, 20 wenn nur du eins hast.</div><input data-f="s" data-enter="s" class="num" type="text" inputmode="numeric" autocomplete="off" placeholder="0" style="margin-top:10px"><button data-sub="s">Abschicken</button></div>`,
     sub:(pi,d)=>{const v=parseInt(String((d.f||{}).s==null?'':d.f.s).trim(),10);if(!Number.isInteger(v)||v<0||v>300)return 'Bitte eine Zahl von 0 bis 300 eingeben.';G.sc[pi]=v;return true}}
  ],done:slfScore});
}
function slfScore(){
  const last=G.r+1>=G.rounds;
  scr(`${prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds} · Buchstabe ${G.lt}`)}<div class="card"><div class="sm" style="margin-bottom:8px">${G.scOnline?'Das haben die Spieler eingetragen – du kannst es hier noch korrigieren (±5)':'Vergleicht eure Zettel und tragt die Punkte ein (10 · 5 · 20 pro Wort)'}</div>
  ${S.P.map((p,i)=>`<div class="sb">${av(i,'',30)}<span class="nm">${esc(p)}</span><div class="bar" style="background:none"></div><div class="stp"><button class="sec ib" onclick="slfAdj(${i},-5)" aria-label="Minus 5">−</button><b id="sc${i}">${G.sc[i]}</b><button class="sec ib" onclick="slfAdj(${i},5)" aria-label="Plus 5">+</button></div></div>`).join('')}</div>
  ${boardHTML(G.pts,{label:'Gesamt vor dieser Runde',unit:' P'})}
  <button onclick="slfCommit()">${last?'Endergebnis 🏆':'Runde werten'}</button>`);
}
/* --- Digital tippen --- */
const slfDProg=()=>prg(G.r+G.i/S.P.length,G.rounds,`Runde ${G.r+1} von ${G.rounds}`);
function slfDRound(){
  G.lt=G.pool[G.r];mark('g',G.lt);G.ans=[];G.bad=G.cats.map(()=>S.P.map(()=>false));G.i=0;G.stopT=null;G.stopBy=null;G.fix=G.cats.map(()=>S.P.map(()=>null));G.allow=G.cats.map(()=>S.P.map(()=>false));G.memDone=false;G.edit=null;
  slfReel(()=>{
    if(NET.host){slfDPar();return}
    hand(G.i,'Der Buchstabe steht fest – tippe deine Wörter!',slfDType,slfDProg());
  });
}
function slfForm(pi,online){
  const n=G.cats.length,f=G.cats.map((c,k)=>`<label class="sm" style="display:block;margin:10px 0 4px">${esc(c)}</label><input class="txt" type="text" maxlength="30" autocomplete="off" autocapitalize="words" ${online?`data-f="c${k}"`:`id="sf${k}"`} ${k<n-1?'data-nx="1"':(online?'data-enter="w"':'')} placeholder="${esc(c)} mit ${G.lt} …">`).join('');
  return `<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:4px">${av(pi)}<span class="sm">${esc(S.P[pi])} tippt</span></div>
  <div style="text-align:center"><div class="sm">Der Buchstabe ist</div><div class="slfl" style="font-size:84px;margin:0 0 4px">${G.lt}</div></div>${G.o.stop?`<p class="sm" style="margin:0;text-align:center">${!online&&G.stopT!=null?`⏱ ${esc(S.P[G.stopBy])} hat „Stopp“ gerufen – du hast ${G.stopT} s.`:'✋ Alle Felder ausgefüllt? Dann „Fertig“ – das beendet die Runde für alle.'}</p>`:''}${f}<div class="err" id="e"></div>
  <button ${online?'data-sub="w"':'onclick="slfDSubmit()"'}>Fertig ✓</button></div>`;
}
function slfDType(){
  scr(`${slfDProg()}${slfForm(G.i,false)}`);
  const l=$('sf'+(G.cats.length-1));if(l)l.addEventListener('keydown',e=>{if(e.key==='Enter')slfDSubmit()});
  setTimeout(()=>{const f=$('sf0');if(f)f.focus()},80);
  G.t0=Date.now();
  const lim=(G.o.stop&&G.stopT!=null)?Math.min(G.stopT,G.o.dtimer):G.o.dtimer;
  if(lim)tmrShow(lim*1000,slfDUp);
}
function slfDRead(){return G.cats.map((_,k)=>{const e=$('sf'+k);return e?String(e.value).trim().slice(0,30):''})}
function slfDSubmit(){
  const v=slfDRead();
  if(G.o.stop&&G.stopT==null){
    if(v.some(x=>!slfFilled(x))){const e=$('e');if(e)e.textContent='Stopp-Regel: Erst wenn alle Felder mit einem Wort ausgefüllt sind (nicht nur der Buchstabe), kannst du „Fertig“ sagen.';vib(60);return}
    G.stopT=Math.max(20,Math.round((Date.now()-G.t0)/1000));G.stopBy=G.i;
  }
  tmrHide();G.ans[G.i]=v;slfDNext();
}
function slfDUp(){tmrHide();sfx.bad();vib([60,40,60]);G.ans[G.i]=slfDRead();toast('⏰ Zeit um');slfDNext()}
function slfDNext(){G.i++;if(G.i<S.P.length)hand(G.i,'Gleich siehst du den Buchstaben – tippe deine Wörter!',slfDType,slfDProg());else slfReview()}
function slfDPar(){
  parBegin({head:slfDProg,dur:[G.o.dtimer*1000],msg:'Alle tippen gleichzeitig …',steps:[
    {k:'w',timeout:pi=>{G.ans[pi]=G.ans[pi]||G.cats.map(()=>'')},html:pi=>slfForm(pi,true),
     sub:(pi,d)=>{
       const v=G.cats.map((_,k)=>String((d.f||{})['c'+k]||'').trim().slice(0,30)),auto=d.v==='auto',first=G.o.stop&&!auto&&G.stopBy==null;
       if(first&&v.some(x=>!slfFilled(x)))return 'Stopp-Regel: Erst wenn alle Felder mit einem Wort ausgefüllt sind (nicht nur der Buchstabe), kannst du „Fertig“ sagen.';
       G.ans[pi]=v;
       if(first){G.stopBy=pi;slfStopNow(pi)}
       return true;
     }}
  ],done:slfReview});
}
const SLF_STOP_MS=4000;
function slfStopNow(pi){   // erster fertig: allen anderen bleiben nur noch ein paar Sekunden
  if(!PAR||!PAR.dur)return;
  if(PAR.st.filter(x=>x<PAR.steps.length).length<=1)return;   // sonst war es der Letzte
  PAR.end=Math.min(PAR.end,Date.now()+SLF_STOP_MS);
  const ms=Math.max(0,PAR.end-Date.now()),msg='✋ Stopp! '+S.P[pi]+' ist fertig';
  tmrShow(ms,()=>autoSub('#hw'));toast(msg);
  NET.m.forEach((m,i)=>{if(i>0&&isOpen(m)){sendTo(m,{t:'tm',ms});sendTo(m,{t:'err',m:msg})}});
}
function slfFilled(w){   // ein echtes Wort: mindestens 2 Buchstaben und nicht nur der Anfangsbuchstabe
  const t=String(w||'').trim();return t.replace(/[^A-Za-zÄÖÜäöüß]/g,'').length>=2&&norm(t)!==String(G.lt).toLowerCase();
}
function slfValid(w){const t=String(w||'').trim();if(!t)return false;const m=t.match(/[A-Za-zÄÖÜäöüß]/);return !!m&&m[0].toUpperCase()===G.lt&&slfFilled(t)}
const SLFW={"Land": "Afghanistan;Albanien;Algerien;Andorra;Angola;Antigua und Barbuda;Argentinien;Armenien;Aserbaidschan;Australien;Baden-Württemberg;Bahamas;Bahrain;Bangladesch;Barbados;Bayern;Belarus;Belgien;Belize;Benin;Berlin;Bhutan;Birma;Bolivien;Bosnien und Herzegowina;Botswana;Brandenburg;Brasilien;Bremen;Bretagne;Brunei;Bulgarien;Burgenland;Burkina Faso;Burundi;Deutschland;Dominica;Dominikanische Republik;Dschibuti;Dänemark;Ecuador;El Salvador;Elfenbeinküste;England;Eritrea;Estland;Eswatini;Fidschi;Finnland;Frankreich;Gabun;Gambia;Georgien;Ghana;Grenada;Griechenland;Großbritannien;Guatemala;Guinea;Guinea-Bissau;Guyana;Haiti;Hamburg;Hessen;Honduras;Kambodscha;Kamerun;Kanada;Kap Verde;Kasachstan;Katalonien;Katar;Kenia;Kirgisistan;Kiribati;Kolumbien;Komoren;Kongo;Korsika;Kosovo;Kroatien;Kuba;Kuwait;Kärnten;Laos;Lesotho;Lettland;Libanon;Liberia;Libyen;Liechtenstein;Litauen;Luxemburg;Madagaskar;Malawi;Malaysia;Malediven;Mali;Malta;Marokko;Marshallinseln;Mauretanien;Mauritius;Mecklenburg-Vorpommern;Mexiko;Mikronesien;Moldawien;Monaco;Mongolei;Montenegro;Mosambik;Myanmar;Namibia;Nauru;Nepal;Neuseeland;Nicaragua;Niederlande;Niedersachsen;Niger;Nigeria;Nordirland;Nordkorea;Nordmazedonien;Nordrhein-Westfalen;Norwegen;Pakistan;Palau;Panama;Papua-Neuguinea;Paraguay;Peru;Philippinen;Polen;Portugal;Rheinland-Pfalz;Ruanda;Rumänien;Russland;Saarland;Sachsen;Sachsen-Anhalt;Salomonen;Salzburg;Sambia;Samoa;San Marino;Sardinien;Saudi-Arabien;Schleswig-Holstein;Schottland;Schweden;Schweiz;Senegal;Serbien;Seychellen;Sierra Leone;Simbabwe;Singapur;Sizilien;Slowakei;Slowenien;Somalia;Spanien;Sri Lanka;Steiermark;Sudan;Suriname;Syrien;Südafrika;Südkorea;Südsudan;Tadschikistan;Taiwan;Tansania;Tessin;Thailand;Thüringen;Tirol;Togo;Tonga;Toskana;Trinidad und Tobago;Tschad;Tschechien;Tunesien;Turkmenistan;Tuvalu;Türkei;Wales;Wallis;Weißrussland", "Stadt": "Aachen;Aalen;Abu Dhabi;Accra;Addis Abeba;Algier;Amman;Amsterdam;Ankara;Antwerpen;Athen;Auckland;Augsburg;Backnang;Bad Tölz;Baden-Baden;Bagdad;Baku;Bamberg;Bangkok;Barcelona;Basel;Bath;Bayreuth;Beirut;Belfast;Belgrad;Bergen;Berlin;Bern;Biberach;Biel;Bielefeld;Bilbao;Bochum;Bogotá;Bologna;Bonn;Bordeaux;Boston;Brandenburg;Brasília;Bratislava;Braunschweig;Bregenz;Bremen;Bremerhaven;Brisbane;Bruchsal;Brügge;Brüssel;Budapest;Buenos Aires;Bukarest;Böblingen;Dachau;Dakar;Damaskus;Darmstadt;Davos;Delhi;Den Haag;Denver;Dessau;Detmold;Doha;Dornbirn;Dortmund;Dover;Dresden;Dubai;Dublin;Dubrovnik;Duisburg;Durban;Düsseldorf;Edinburgh;Eisenstadt;Erding;Erfurt;Erlangen;Essen;Esslingen;Flensburg;Florenz;Frankfurt;Freiburg;Freising;Friedrichshafen;Fulda;Fürstenfeldbruck;Fürth;Garmisch-Partenkirchen;Gelsenkirchen;Genf;Genua;Gera;Gießen;Glasgow;Granada;Graz;Greifswald;Göppingen;Göteborg;Göttingen;Hagen;Halle;Hamburg;Hameln;Hamm;Hanau;Hannover;Hanoi;Havanna;Heidelberg;Heidenheim;Heilbronn;Helsinki;Herne;Hildesheim;Holzkirchen;Hongkong;Honolulu;Houston;Kabul;Kairo;Kaiserslautern;Kapstadt;Karachi;Karlsruhe;Kassel;Kaufbeuren;Kempten;Kiel;Kiew;Klagenfurt;Koblenz;Konstanz;Kopenhagen;Krakau;Krefeld;Kuala Lumpur;Köln;Lagos;Landsberg;Landshut;Las Vegas;Lausanne;Leeds;Leipzig;Leverkusen;Lille;Lima;Lindau;Linz;Lissabon;Liverpool;Ljubljana;London;Los Angeles;Ludwigsburg;Ludwigshafen;Lugano;Luxemburg;Luzern;Lyon;Lübeck;Lüneburg;Madrid;Magdeburg;Mailand;Mainz;Manchester;Manila;Mannheim;Marburg;Marseille;Melbourne;Memmingen;Mexiko-Stadt;Miami;Miesbach;Minsk;Moers;Monaco;Montreal;Moskau;Mumbai;Murnau;Málaga;Mönchengladbach;Mülheim;München;Münster;Nairobi;Nantes;Neapel;Neuss;New York;Nizza;Nürnberg;Paderborn;Padua;Palermo;Paris;Passau;Peking;Perth;Pforzheim;Pisa;Potsdam;Prag;Pretoria;Rastatt;Ratingen;Ravensburg;Recklinghausen;Regensburg;Remscheid;Reutlingen;Reykjavik;Riga;Rimini;Rio de Janeiro;Rom;Rosenheim;Rostock;Rotterdam;Saarbrücken;Salamanca;Salzburg;Salzgitter;San Francisco;Santiago;Sarajevo;Schwerin;Schwäbisch Gmünd;Schwäbisch Hall;Seattle;Seoul;Sevilla;Shanghai;Siegen;Siena;Sindelfingen;Singapur;Sofia;Solingen;Speyer;Starnberg;Steyr;Stockholm;Stralsund;Straßburg;Stuttgart;Sydney;São Paulo;Tallinn;Taormina;Teheran;Tel Aviv;Thun;Tiflis;Tokio;Toledo;Toronto;Toulouse;Trier;Triest;Tunis;Turin;Tuttlingen;Tübingen;Waiblingen;Warschau;Washington;Weilheim;Weimar;Wellington;Wels;Wien;Wiesbaden;Wilhelmshaven;Winterthur;Wismar;Witten;Wittenberg;Wolfratshausen;Wolfsburg;Worms;Wuppertal;Würzburg", "Fluss": "Aare;Aller;Alster;Altmühl;Amazonas;Amur;Arno;Bode;Brahmaputra;Dnepr;Don;Donau;Dordogne;Drau;Dreisam;Duero;Ebro;Eder;Eider;Elbe;Elster;Ems;Enns;Enz;Etsch;Euphrat;Fils;Fulda;Ganges;Garonne;Gelber Fluss;Guadalquivir;Havel;Hudson;Kinzig;Kocher;Kongo;Lahn;Lech;Leine;Lena;Limpopo;Lippe;Loire;Maas;Main;Marne;Mekong;Mississippi;Missouri;Moldau;Mosel;Mulde;Mur;Murg;Naab;Nagold;Nahe;Neckar;Neiße;Netze;Niger;Nil;Paraná;Peene;Pegnitz;Po;Regen;Regnitz;Rems;Rhein;Rhône;Rio Grande;Ruhr;Saale;Saar;Salzach;Sambesi;Save;Schelde;Seine;Severn;Shannon;Sieg;Spree;Tagus;Tajo;Tauber;Theiß;Themse;Tiber;Tigris;Traun;Trave;Warthe;Weichsel;Werra;Weser;Wolga;Wupper;Wutach;Wümme", "Tier": "Aal;Aasgeier;Adler;Affe;Albatros;Alligator;Alpaka;Ameise;Ameisenbär;Amsel;Anakonda;Antilope;Auerhahn;Axolotl;Bachforelle;Bachstelze;Barsch;Bartgeier;Basilisk;Bernhardiner;Beutelratte;Biber;Biene;Bison;Blindschleiche;Boa;Borkenkäfer;Brachse;Braunbär;Bulle;Buntspecht;Bussard;Bär;Büffel;Dachs;Dackel;Delfin;Dingo;Dohle;Dompfaff;Dorsch;Dromedar;Drossel;Eber;Echse;Eichhörnchen;Eidechse;Eisbär;Eisvogel;Elch;Elefant;Elster;Emu;Ente;Erdmännchen;Esel;Eule;Falke;Fasan;Faultier;Feldhase;Feuersalamander;Fink;Fisch;Fischotter;Flamingo;Fledermaus;Fliege;Floh;Flusspferd;Forelle;Frosch;Fuchs;Gans;Gazelle;Gecko;Geier;Gepard;Gimpel;Giraffe;Glühwürmchen;Gnu;Goldfisch;Gorilla;Grashüpfer;Grizzly;Guppy;Gämse;Gürteltier;Habicht;Hahn;Hai;Hamster;Hase;Hauskatze;Hausmaus;Hecht;Hering;Hermelin;Heuschrecke;Hirsch;Hirschkäfer;Hornisse;Huhn;Hummel;Hummer;Hund;Husky;Hyäne;Kabeljau;Kakadu;Kalb;Kamel;Kaninchen;Karpfen;Kater;Katze;Kauz;Kegelrobbe;Kiebitz;Koala;Kobra;Kojote;Kolibri;Kolkrabe;Komodowaran;Kondor;Krabbe;Krake;Kranich;Krokodil;Kröte;Kuckuck;Kuh;Käfer;Känguru;Lachs;Lama;Languste;Laubfrosch;Leguan;Lemming;Lemur;Leopard;Lerche;Libelle;Luchs;Löwe;Makrele;Mandrill;Marabu;Marder;Marienkäfer;Maulwurf;Maus;Meerschweinchen;Mistkäfer;Molch;Mufflon;Mungo;Murmeltier;Muräne;Mäusebussard;Möwe;Mücke;Nachtigall;Nacktmull;Nandu;Narwal;Nasenbär;Nashorn;Natter;Nerz;Nilpferd;Nutria;Panda;Panther;Papagei;Pavian;Pelikan;Pfau;Pferd;Pinguin;Pirol;Pottwal;Pudel;Puma;Pute;Python;Rabe;Ratte;Raupe;Regenwurm;Reh;Rentier;Rhinozeros;Rind;Robbe;Rochen;Rotfuchs;Rothirsch;Rotkehlchen;Salamander;Sardine;Schaf;Schakal;Schildkröte;Schimpanse;Schlange;Schmetterling;Schnabeltier;Schnecke;Schwalbe;Schwan;Schwein;Schäferhund;Seeadler;Seehund;Seelöwe;Seepferdchen;Seestern;Siebenschläfer;Skorpion;Skunk;Spatz;Specht;Sperling;Spinne;Springbock;Star;Steinadler;Steinbock;Stichling;Stier;Stinktier;Stockente;Storch;Strauß;Tapir;Tarantel;Taube;Tausendfüßler;Teichfrosch;Termite;Thunfisch;Tiger;Tintenfisch;Trampeltier;Truthahn;Tukan;Turmfalke;Wachtel;Wal;Waldkauz;Walross;Wanderfalke;Waran;Waschbär;Wasserbüffel;Weinbergschnecke;Wellensittich;Wespe;Wiedehopf;Wiesel;Wildschwein;Wisent;Wolf;Wombat;Wurm;Wüstenfuchs", "Beruf": "Altenpfleger;Animateur;Anwalt;Anästhesist;Apotheker;Architekt;Archivar;Archäologe;Arzt;Assistent;Astronaut;Astronom;Augenoptiker;Ausbilder;Automechaniker;Autor;Bademeister;Bankkaufmann;Barista;Barkeeper;Bauarbeiter;Bauer;Bauleiter;Beamter;Berater;Bergmann;Bestatter;Betriebswirt;Bibliothekar;Bildhauer;Biologe;Bootsbauer;Brauer;Briefträger;Buchhalter;Buchhändler;Busfahrer;Bäcker;Bühnenbildner;Bürgermeister;Bürokaufmann;Dachdecker;Dekorateur;Dentist;Designer;Detektiv;Diplomat;Dirigent;Disponent;Doktor;Dolmetscher;Dozent;Drogist;Drucker;Eisenbahner;Elektriker;Entwickler;Erfinder;Ergotherapeut;Ernährungsberater;Erzieher;Fachinformatiker;Fahrer;Fahrlehrer;Feuerwehrmann;Filmemacher;Finanzberater;Fischer;Fitnesstrainer;Fleischer;Fliesenleger;Florist;Flugbegleiter;Forscher;Fotograf;Fremdenführer;Friseur;Fußballer;Förster;Gastwirt;Gebäudereiniger;Geologe;Gerichtsvollzieher;Geschäftsführer;Gitarrist;Glaser;Goldschmied;Grafiker;Grundschullehrer;Gutachter;Gymnasiallehrer;Gärtner;Handwerker;Hausfrau;Hausmann;Hausmeister;Hebamme;Heilpraktiker;Historiker;Hotelfachmann;Hotelier;Hufschmied;Hundetrainer;Händler;Hörgeräteakustiker;Kameramann;Kapitän;Kassierer;Kauffrau;Kaufmann;Kellner;Kinderarzt;Kindergärtner;Klempner;Koch;Kommissar;Komponist;Konditor;Kosmetiker;Kranführer;Krankenpfleger;Kundenberater;Kurier;Küchenchef;Künstler;Laborant;Lagerarbeiter;Lagerist;Landwirt;Lehrer;Lektor;Lieferant;Logopäde;Lokführer;Lotse;Maler;Manager;Maskenbildner;Masseur;Mathematiker;Matrose;Maurer;Mechaniker;Mechatroniker;Mediengestalter;Mediziner;Meteorologe;Metzger;Model;Moderator;Musiker;Mönch;Müllmann;Nachrichtensprecher;Nachtwächter;Neurologe;Nonne;Notar;Notarzt;Näher;Paketbote;Pastor;Pfarrer;Pfleger;Pförtner;Physiker;Physiotherapeut;Pianist;Pilot;Pizzabäcker;Politiker;Polizist;Portier;Postbote;Professor;Programmierer;Projektleiter;Psychologe;Pädagoge;Rauchfangkehrer;Raumausstatter;Rechtsanwalt;Redakteur;Regisseur;Reinigungskraft;Reiseleiter;Rennfahrer;Reporter;Rettungssanitäter;Rezeptionist;Richter;Sachbearbeiter;Sanitäter;Schaffner;Schauspieler;Schiedsrichter;Schlagzeuger;Schlosser;Schmied;Schneider;Schornsteinfeger;Schreiner;Schriftsteller;Schuhmacher;Schweißer;Schäfer;Seemann;Sekretär;Skilehrer;Softwareentwickler;Soldat;Sozialarbeiter;Spediteur;Sportlehrer;Staatsanwalt;Statiker;Steuerberater;Student;Stylist;Synchronsprecher;Sänger;Tankwart;Taxifahrer;Techniker;Texter;Therapeut;Tiefbauer;Tierarzt;Tierpfleger;Tischler;Tontechniker;Trainer;Trockenbauer;Turnlehrer;Tänzer;Tätowierer;Töpfer;Wachmann;Waldarbeiter;Wanderführer;Webdesigner;Weinhändler;Werbetexter;Werkzeugmacher;Winzer;Wirt;Wirtschaftsprüfer;Wissenschaftler;Wärter", "Vorname": "Adam;Albert;Alexander;Alice;Alina;Amelie;Andrea;Andreas;Angela;Anita;Anja;Anke;Anna;Annika;Antje;Anton;Arthur;August;Axel;Barbara;Bastian;Beate;Bella;Ben;Benedikt;Benjamin;Bernd;Bernhard;Bettina;Bianca;Birgit;Björn;Boris;Brigitte;Bruno;Dana;Daniel;David;Denise;Dennis;Diana;Dieter;Dirk;Dominik;Dora;Doris;Dorothea;Edgar;Eduard;Elena;Elias;Elisabeth;Elke;Ella;Emil;Emilia;Emma;Eric;Erik;Erika;Ernst;Esther;Eugen;Eva;Fabian;Felix;Finn;Fiona;Florian;Frank;Franz;Franziska;Frederik;Frieda;Friedrich;Fritz;Gabriele;Georg;Gerda;Gerhard;Gina;Gisela;Gregor;Greta;Gustav;Günter;Hanna;Hannah;Hannes;Hans;Harald;Heidi;Heike;Heinrich;Helena;Helga;Helmut;Hendrik;Henrik;Herbert;Hermann;Holger;Hugo;Kai;Karin;Karl;Katharina;Katja;Katrin;Kerstin;Kevin;Kilian;Kim;Klaus;Konrad;Kristin;Kurt;Lara;Larissa;Lars;Laura;Laurin;Lea;Lena;Leni;Leo;Leon;Liam;Lilly;Linda;Lisa;Lothar;Luca;Ludwig;Luisa;Lukas;Magdalena;Maja;Manuel;Marc;Marco;Maria;Marie;Mario;Markus;Marlene;Martin;Mathilda;Matthias;Max;Maximilian;Melanie;Mia;Michael;Mila;Mirko;Monika;Moritz;Nadine;Natalie;Nele;Nico;Nicole;Niklas;Nils;Nina;Noah;Nora;Norbert;Pascal;Patricia;Patrick;Paul;Paula;Paulina;Peter;Petra;Philipp;Pia;Rainer;Ralf;Rebecca;Reinhard;René;Ricarda;Richard;Rita;Robert;Roland;Ronja;Rosa;Rudolf;Ruth;Sabine;Samuel;Sandra;Sara;Sarah;Sebastian;Selina;Silke;Simon;Sina;Sonja;Sophie;Stefan;Stefanie;Steffen;Susanne;Sven;Tamara;Tanja;Teresa;Theo;Theresa;Thomas;Thorsten;Tim;Timo;Tina;Tobias;Tom;Torsten;Walter;Waltraud;Wanda;Wendy;Werner;Wiebke;Wilhelm;Willi;Wolf;Wolfgang", "Farbe": "Anthrazit;Aprikot;Azur;Beere;Beige;Blau;Bordeaux;Braun;Bronze;Dunkelblau;Dunkelgrau;Dunkelgrün;Dunkelrot;Elfenbein;Flieder;Fuchsia;Gelb;Gelbgrün;Gold;Grau;Grün;Hellblau;Hellgrau;Hellgrün;Hellrot;Himmelblau;Karmesin;Khaki;Kupfer;Lachs;Lavendel;Lila;Magenta;Marineblau;Mintgrün;Petrol;Pink;Purpur;Rosa;Rosé;Rot;Saphirblau;Schwarz;Silber;Smaragd;Tannengrün;Taupe;Türkis;Weinrot;Weiß", "Körperteil": "Achsel;Ader;Arm;Auge;Augenbraue;Augenlid;Bauch;Becken;Bein;Brust;Darm;Daumen;Ellbogen;Ferse;Finger;Fingernagel;Fuß;Fußsohle;Gaumen;Gehirn;Gelenk;Gesicht;Gesäß;Haar;Hals;Hand;Handfläche;Handgelenk;Haut;Herz;Hornhaut;Hüfte;Kehle;Kiefer;Kinn;Knie;Kniescheibe;Knochen;Knöchel;Kopf;Leber;Lippe;Luftröhre;Lunge;Magen;Milz;Mund;Muskel;Nabel;Nacken;Nase;Niere;Rippe;Rücken;Schienbein;Schläfe;Schulter;Schädel;Sehne;Stirn;Wade;Wange;Wimper;Wirbel", "Sportart": "Angeln;Badminton;Baseball;Basketball;Beachvolleyball;Biathlon;Bobfahren;Bogenschießen;Bouldern;Bowling;Boxen;Dart;Diskuswerfen;Eishockey;Eiskunstlauf;Eisschnelllauf;Eisstockschießen;Fechten;Football;Frisbee;Fußball;Gewichtheben;Golf;Hammerwerfen;Handball;Hochsprung;Hockey;Hürdenlauf;Kanu;Karate;Kegeln;Kitesurfen;Klettern;Kugelstoßen;Langlauf;Laufen;Leichtathletik;Marathon;Mountainbiken;Radfahren;Radsport;Reiten;Rodeln;Rudern;Rugby;Schach;Schwimmen;Segeln;Skeleton;Skifahren;Skispringen;Snowboard;Speerwerfen;Sprint;Squash;Stabhochsprung;Surfen;Taekwondo;Tanzen;Tauchen;Tennis;Tischtennis;Trampolin;Triathlon;Turnen;Wandern;Wasserball;Weitsprung;Windsurfen;Wrestling", "Getränk": "Aperol Spritz;Apfelsaft;Apfelschorle;Bellini;Bier;Bowle;Brause;Buttermilch;Eierlikör;Eiskaffee;Eistee;Energydrink;Espresso;Fanta;Früchtetee;Gin;Ginger Ale;Glühwein;Heiße Schokolade;Hugo;Kaffee;Kakao;Kamillentee;Kefir;Korn;Kräutertee;Latte Macchiato;Likör;Limonade;Martini;Milch;Milchshake;Mineralwasser;Mojito;Pfefferminztee;Prosecco;Radler;Rotwein;Rum;Saft;Schnaps;Schorle;Sekt;Smoothie;Spezi;Sprite;Sprudel;Tee;Tomatensaft;Tonic;Traubensaft;Wasser;Wein;Weinschorle;Weizenbier;Weißbier;Weißwein;Wermut;Whisky;Wodka"};
/* Wortlisten: nur Wörter mit Spielbuchstaben; nicht vollständig → „Hinweis“, nie automatisches Urteil (außer Modus „Streng“) */
const slfFold=s=>String(s||'').toLowerCase().replace(/ä|ae/g,'a').replace(/ö|oe/g,'o').replace(/ü|ue/g,'u').replace(/ß|ss/g,'s').replace(/[^a-z]/g,'');
const SLFK={};
function slfKnown(cat){
  if(!Object.prototype.hasOwnProperty.call(SLFW,cat))return null;
  if(!SLFK[cat]){const m=new Map(),arr=[];SLFW[cat].split(';').forEach(w=>{const f=slfFold(w);if(f&&!m.has(f)){m.set(f,w);arr.push([f,w])}});SLFK[cat]={m,arr}}
  return SLFK[cat];
}
const slfEff=(k,i)=>G.fix[k][i]||((G.ans[i]||[])[k]||'');
function slfNear(a,b){   // höchstens ein Tippfehler (Buchstabe falsch/fehlt/zu viel/vertauscht)
  if(a===b)return false;const la=a.length,lb=b.length;if(Math.abs(la-lb)>1)return false;
  if(la===lb){const d=[];for(let i=0;i<la;i++)if(a[i]!==b[i])d.push(i);
    return d.length===1||(d.length===2&&d[1]===d[0]+1&&a[d[0]]===b[d[1]]&&a[d[1]]===b[d[0]])}
  const [s,l]=la<lb?[a,b]:[b,a];let i=0;while(i<s.length&&s[i]===l[i])i++;return s.slice(i)===l.slice(i+1);
}
function slfChk(k,i){   // 'ok' | {near:'Wort'} | 'unk' | null (nicht prüfbar)
  if(G.o.check==='aus')return null;
  const w=slfEff(k,i);if(!slfValid(w))return null;
  const L=slfKnown(G.cats[k]);if(!L)return null;
  const f=slfFold(w);
  if(L.m.has(f))return 'ok';
  if(G.cats[k]==='Beruf'&&/in$/.test(f)&&L.m.has(f.slice(0,-2)))return 'ok';   // Ärztin, Bäckerin …
  if(f.length>=4)for(const [g,c] of L.arr)if(g.length>=4&&slfNear(g,f))return {near:c};
  return 'unk';
}
function slfWord(k,i){   // normiertes Wort, wenn es zählt (sonst null)
  const w=slfEff(k,i);if(!slfValid(w)||G.bad[k][i])return null;
  if(G.o.check==='streng'&&!G.allow[k][i]){const c=slfChk(k,i);if(c==='unk'||(c&&c.near))return null}
  return norm(w);
}
function slfCalc(){
  const pts=S.P.map(()=>0),det=G.cats.map(()=>S.P.map(()=>null));
  G.cats.forEach((_,k)=>{
    const e=S.P.map((_,i)=>slfWord(k,i));
    e.forEach((x,i)=>{if(x==null)return;const same=e.filter((y,j)=>j!==i&&y===x).length,others=e.filter((y,j)=>j!==i&&y!=null).length;const p=same?5:others?10:20;pts[i]+=p;det[k][i]=p});
  });
  return {pts,det};
}
function slfSuggest(k){   // fast gleiche Wörter (vermutlich Tippfehler): [i,j] mit i<j
  const out=[],e=S.P.map((_,i)=>slfWord(k,i));
  for(let i=0;i<e.length;i++)for(let j=i+1;j<e.length;j++)if(e[i]&&e[j]&&e[i].length>=5&&e[j].length>=5&&slfNear(e[i],e[j]))out.push([i,j]);
  return out;
}
function slfRow(k,i,c){
  const raw=String((G.ans[i]||[])[k]||'').trim();if(!raw)return '';
  const w=slfEff(k,i),v=slfValid(w),bad=G.bad[k][i],chk=slfChk(k,i),strict=G.o.check==='streng'&&!G.allow[k][i]&&(chk==='unk'||(chk&&chk.near)),
    no=bad||!v||strict,ed=G.edit&&G.edit.k===k&&G.edit.i===i,pt=c.det[k][i];
  let hint='';
  if(bad&&G.memAuto&&G.memAuto[k][i])hint=`<div class="rh">🧠 gemerkt: zählt in „${esc(G.cats[k])}“ nicht – ↺ hebt das auf</div>`;
  else if(!v)hint=`<div class="rh">zählt nicht: ${slfFilled(w)?'falscher Anfangsbuchstabe':'nur der Buchstabe'}</div>`;
  else if(chk&&chk.near&&!ed)hint=`<div class="rh">💡 Meintest du „${esc(chk.near)}“? <button class="sec rhb" onclick="slfTake(${k},${i},${JSON.stringify(chk.near).replace(/"/g,'&quot;')})">Übernehmen</button>${strict?' <button class="sec rhb" onclick="slfAllow('+k+','+i+')">Trotzdem werten</button>':''}</div>`;
  else if(chk==='unk'&&!ed)hint=`<div class="rh">❓ nicht in der Liste${strict?' – zählt nicht ':' – bitte prüfen '}${strict?'<button class="sec rhb" onclick="slfAllow('+k+','+i+')">Trotzdem werten</button>':''}</div>`;
  const word=ed
    ?`<input id="slfe" class="txt" type="text" maxlength="30" autocomplete="off" value="${esc(w)}" style="margin:0;flex:1;min-width:90px;padding:8px 10px;font-size:16px">`
    :`<span class="rw">${esc(w)}${G.fix[k][i]?' ✎':''}${chk==='ok'?' <i class="rok">✓</i>':''}</span>`;
  const btns=ed
    ?`<button class="sec rb" onclick="slfFix()" aria-label="Übernehmen">✓</button>${G.fix[k][i]?`<button class="sec rb" onclick="slfUnfix(${k},${i})" aria-label="Original">↺</button>`:''}<button class="sec rb" onclick="slfEdit(-1,-1)" aria-label="Abbrechen">✕</button>`
    :`${v?`<button class="sec rb" onclick="slfBad(${k},${i})" aria-label="${bad?'Wieder zählen':'Streichen'}">${bad?'↺':'✕'}</button>`:''}<button class="sec rb" onclick="slfEdit(${k},${i})" aria-label="Korrigieren">✎</button>`;
  return `<div class="rv ${no?'no':''}"><span class="rn">${esc(S.P[i])}</span>${word}<span class="rp">${pt?'+'+pt:'0'}</span>${btns}${hint}</div>`;
}
function slfMemApply(){   // gemerkte Entscheidungen einmal pro Runde anwenden
  G.memAuto=G.cats.map(()=>S.P.map(()=>false));
  G.cats.forEach((cat,k)=>S.P.forEach((_,i)=>{
    const w=slfEff(k,i);if(!String(w).trim())return;
    if(slfMemHas('ban',cat,w)){G.bad[k][i]=true;G.memAuto[k][i]=true}
    else if(slfMemHas('ok',cat,w))G.allow[k][i]=true;
  }));
}
function slfReview(){
  if(!G.memDone){G.memDone=true;slfMemApply()}
  const c=slfCalc(),last=G.r+1>=G.rounds;
  const rows=G.cats.map((cat,k)=>{
    const empty=S.P.filter((_,i)=>!String((G.ans[i]||[])[k]||'').trim()).map(esc).join(', ');
    const sg=slfSuggest(k).filter(([i,j])=>{const a=slfChk(k,i),b=slfChk(k,j);return !((a==='ok'&&b&&b.near)||(b==='ok'&&a&&a.near))}).map(([i,j])=>`<div class="rh" style="margin-top:6px">💡 „${esc(slfEff(k,i))}“ (${esc(S.P[i])}) und „${esc(slfEff(k,j))}“ (${esc(S.P[j])}) sehen fast gleich aus <button class="sec rhb" onclick="slfSame(${k},${i},${j})">Als gleich werten</button></div>`).join('');
    return `<div class="card" style="padding:12px 14px"><div class="sm" style="margin-bottom:4px"><b style="color:var(--tx)">${esc(cat)}</b></div>${S.P.map((_,i)=>slfRow(k,i,c)).join('')}${empty?`<div class="sm" style="margin-top:6px;opacity:.6">Nichts: ${empty}</div>`:''}${sg}</div>`}).join('');
  let ok=0,unk=0;if(G.o.check!=='aus')G.cats.forEach((_,k)=>S.P.forEach((_,i)=>{const x=slfChk(k,i);if(x==='ok')ok++;else if(x)unk++}));
  scr(`${prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds} · Buchstabe ${G.lt}`)}<div class="rvbar">${S.P.map((p,i)=>`<span><b>${esc(p)}</b> ${c.pts[i]}</span>`).join('')}</div>
  <p class="sm" style="margin:4px 0 0">${G.stopBy!=null?`✋ Stopp: <b style="color:var(--tx)">${esc(S.P[G.stopBy])}</b> · `:''}✕ streicht ein Wort, ✎ korrigiert die Schreibweise.${G.o.check!=='aus'&&(ok||unk)?` ✓ ${ok} in der Liste${unk?`, ❓ ${unk} prüfen`:''}.`:''}</p>${rows}
  <button onclick="slfDCommit()">${last?'Endergebnis 🏆':'Runde werten'}</button>`);
  if(G.edit){const e=$('slfe');if(e)setTimeout(()=>{try{e.focus();e.select()}catch(x){}},60)}
}
function slfKeep(f){const sc=app.scrollTop;f();slfReview();app.scrollTop=sc}
function slfEdit(k,i){slfKeep(()=>{G.edit=(G.edit&&G.edit.k===k&&G.edit.i===i)||k<0?null:{k,i}})}
function slfFix(){
  const e=$('slfe');if(!e||!G.edit)return;const {k,i}=G.edit,v=e.value.trim().slice(0,30),raw=(G.ans[i]||[])[k]||'';
  if(!v){toast('Das Wort darf nicht leer sein');return}
  slfKeep(()=>{G.fix[k][i]=(v===raw)?null:v;G.edit=null});
}
function slfUnfix(k,i){slfKeep(()=>{G.fix[k][i]=null;G.edit=null})}
function slfSame(k,i,j){slfKeep(()=>{G.fix[k][j]=slfEff(k,i)})}
function slfTake(k,i,w){slfKeep(()=>{G.fix[k][i]=w})}
function slfAllow(k,i){slfKeep(()=>{G.allow[k][i]=true;slfMemSet('ok',G.cats[k],slfEff(k,i),true);slfMemSet('ban',G.cats[k],slfEff(k,i),false)})}
function slfBad(k,i){
  const cat=G.cats[k],w=slfEff(k,i),on=!G.bad[k][i];
  slfKeep(()=>{G.bad[k][i]=on;if(G.memAuto&&G.memAuto[k])G.memAuto[k][i]=false;slfMemSet('ban',cat,w,on);if(on)slfMemSet('ok',cat,w,false)});
  if(on)toast('🧠 Gemerkt: „'+w+'“ zählt in '+cat+' künftig nicht');
}
function slfDCommit(){G.sc=slfCalc().pts;slfCommit()}
function slfAdj(i,d){G.sc[i]=Math.max(0,Math.min(300,G.sc[i]+d));const e=$('sc'+i);if(e)e.textContent=G.sc[i]}
function slfCommit(){
  S.P.forEach((_,i)=>G.pts[i]+=G.sc[i]);
  if(G.r+1>=G.rounds){finish({unit:' P'});return}
  G.r++;slfRound();
}

