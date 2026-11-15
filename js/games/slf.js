/* ---------- Stadt, Land, Fluss ---------- */
const SLFA=['Stadt','Land','Fluss','Tier','Beruf','Vorname','Pflanze','Essen','Getränk','Gegenstand','Farbe','Sportart','Film / Serie','Marke','Körperteil','Berg','Musik'],SLFL='ABDEFGHKLMNPRSTW'.split('');
function slfSave(){try{localStorage.setItem('pb_slfc',JSON.stringify({sel:OPT.slf.sel,custom:OPT.slf.custom}))}catch(e){}}
OPT.slf={rounds:5,timer:0,mode:'zettel',dtimer:90,stop:true,sel:{Stadt:1,Land:1,Fluss:1,Tier:1,Beruf:1},custom:[]};
try{const x=JSON.parse(localStorage.getItem('pb_slfc')||'null');if(x&&x.sel&&Array.isArray(x.custom)){OPT.slf.sel=x.sel;OPT.slf.custom=x.custom.filter(c=>typeof c==='string').slice(0,4)}}catch(e){}
const slfAll=()=>SLFA.filter(c=>OPT.slf.sel[c]).concat(OPT.slf.custom);
function slfTog(i,el){
  const c=SLFA[i],o=OPT.slf;
  if(!o.sel[c]&&slfAll().length>=10){toast('Höchstens 10 Kategorien');return}
  o.sel[c]=o.sel[c]?0:1;slfSave();el.classList.toggle('on',!!o.sel[c]);const n=$('slfcnt');if(n)n.textContent=slfAll().length;
}
function slfAddCat(){
  const e=$('slfn');if(!e)return;const v=e.value.trim().slice(0,20),o=OPT.slf;
  if(!v){toast('Gib eine Kategorie ein');return}
  if(o.custom.length>=4){toast('Höchstens 4 eigene Kategorien');return}
  if(slfAll().length>=10){toast('Höchstens 10 Kategorien');return}
  if(SLFA.concat(o.custom).some(c=>c.toLowerCase()===v.toLowerCase())){toast('Gibt es schon');return}
  o.custom.push(v);slfSave();gameSetup('slf');
}
function slfDelCat(i){OPT.slf.custom.splice(i,1);slfSave();gameSetup('slf')}
GAMES.slf={name:'Stadt, Land, Fluss',e:'✏️',tag:'Mit Zettel oder digital',c:['#22c55e','#16a34a'],min:2,teams:false,
  desc:'Ein Buchstabe, eure Kategorien: wer findet die meisten Wörter? Kategorien frei wählbar, mit Zettel und Stift oder direkt im Handy eingetippt.',
  rules:'<b>Digital:</b> Der Buchstabe steht oben, jeder tippt zu jeder Kategorie je ein Wort ein (Zeitlimit). Danach zeigt die App alle Antworten und berechnet die Punkte (10 / 5 / 20, siehe unten). Wer als Erster alle Felder ausgefüllt hat, ruft „Stopp“: Dann ist die Runde für alle bald zu Ende (abschaltbar). Wörter, die nicht stimmen, tippt ihr an und streicht sie. <b>Mit Zettel:</b> Jeder braucht <b>Zettel und Stift</b>. Die App nennt einen Buchstaben. Schreibt zu jeder gewählten Kategorie (Standard: Stadt, Land, Fluss, Tier, Beruf; ihr könnt auch eigene erfinden) je ein Wort, das damit anfängt. Wer fertig ist, ruft „Stopp!“ (oder die Zeit läuft ab). Danach werden die Wörter verglichen und Punkte eingetragen: <b>10</b> für ein eigenes Wort, <b>5</b> wenn ein anderer das gleiche hat, <b>20</b> wenn nur du eins hast, 0 für nichts. Wer am Ende die meisten Punkte hat, gewinnt.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Kategorien (<span id="slfcnt">${slfAll().length}</span> gewählt, 3 bis 10)</p><div class="chips">${SLFA.map((c,i)=>`<span class="chip ${OPT.slf.sel[c]?'on':''}" onclick="slfTog(${i},this)">${esc(c)}</span>`).join('')}${OPT.slf.custom.map((c,i)=>`<span class="chip on" onclick="slfDelCat(${i})">${esc(c)} ✕</span>`).join('')}</div><div class="row" style="margin-top:10px"><input id="slfn" class="txt" type="text" maxlength="20" autocomplete="off" placeholder="Eigene Kategorie …" style="margin:0;flex:1"><button class="sec ib" onclick="slfAddCat()" aria-label="Kategorie hinzufügen" style="margin:0">＋</button></div><p class="sm" style="margin:14px 0 8px">Spielweise</p>${seg('slf','mode',['zettel','digital'],v=>v==='zettel'?'✏️ Zettel & Stift':'⌨️ Digital tippen')}<p class="sm" style="margin:14px 0 8px">Runden</p>${seg('slf','rounds',[3,5,8])}${OPT.slf.mode==='digital'?`<p class="sm" style="margin:14px 0 8px">Zeit zum Tippen</p>${seg('slf','dtimer',[60,90,120],v=>v+' s')}<p class="sm" style="margin:14px 0 8px">Stopp-Regel</p>${seg('slf','stop',[true,false],v=>v?'✋ Erster fertig beendet':'Aus')}<p class="sm" style="margin:8px 0 0">Mit Stopp-Regel kann man erst „Fertig“ sagen, wenn alle Felder ausgefüllt sind – dann beendet das die Runde für alle (online: noch 4 Sekunden, an einem Gerät: die Folgenden haben nur so lange Zeit wie der Erste gebraucht hat, mindestens 20 s).</p><p class="sm" style="margin:8px 0 0">Online tippen alle gleichzeitig auf dem eigenen Gerät. An einem Gerät kommt jeder nacheinander dran (die anderen schauen weg). Die Punkte werden automatisch berechnet, falsche Wörter streicht ihr danach mit einem Tipp.</p>`:`<p class="sm" style="margin:14px 0 8px">Zeitlimit</p>${seg('slf','timer',[0,60,90],v=>v?v+' s':'Aus')}`}`,
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
  if(G.o.timer)tmrShow(G.o.timer*1000,slfStop);
}
function slfStop(){tmrHide();sfx.bad();slfScore()}
function slfScore(){
  const last=G.r+1>=G.rounds;
  scr(`${prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds} · Buchstabe ${G.lt}`)}<div class="card"><div class="sm" style="margin-bottom:8px">Vergleicht eure Zettel und tragt die Punkte ein (10 · 5 · 20 pro Wort)</div>
  ${S.P.map((p,i)=>`<div class="sb">${av(i,'',30)}<span class="nm">${esc(p)}</span><div class="bar" style="background:none"></div><div class="stp"><button class="sec ib" onclick="slfAdj(${i},-5)" aria-label="Minus 5">−</button><b id="sc${i}">${G.sc[i]}</b><button class="sec ib" onclick="slfAdj(${i},5)" aria-label="Plus 5">+</button></div></div>`).join('')}</div>
  ${boardHTML(G.pts,{label:'Gesamt vor dieser Runde',unit:' P'})}
  <button onclick="slfCommit()">${last?'Endergebnis 🏆':'Runde werten'}</button>`);
}
/* --- Digital tippen --- */
const slfDProg=()=>prg(G.r+G.i/S.P.length,G.rounds,`Runde ${G.r+1} von ${G.rounds}`);
function slfDRound(){
  G.lt=G.pool[G.r];mark('g',G.lt);G.ans=[];G.bad=G.cats.map(()=>S.P.map(()=>false));G.i=0;G.stopT=null;G.stopBy=null;G.fix=G.cats.map(()=>S.P.map(()=>null));G.edit=null;
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
const slfEff=(k,i)=>G.fix[k][i]||((G.ans[i]||[])[k]||'');
function slfNear(a,b){   // höchstens ein Tippfehler (Buchstabe falsch/fehlt/zu viel/vertauscht)
  if(a===b)return false;const la=a.length,lb=b.length;if(Math.abs(la-lb)>1)return false;
  if(la===lb){const d=[];for(let i=0;i<la;i++)if(a[i]!==b[i])d.push(i);
    return d.length===1||(d.length===2&&d[1]===d[0]+1&&a[d[0]]===b[d[1]]&&a[d[1]]===b[d[0]])}
  const [s,l]=la<lb?[a,b]:[b,a];let i=0;while(i<s.length&&s[i]===l[i])i++;return s.slice(i)===l.slice(i+1);
}
function slfCalc(){
  const pts=S.P.map(()=>0),det=G.cats.map(()=>S.P.map(()=>null));
  G.cats.forEach((_,k)=>{
    const e=S.P.map((_,i)=>{const w=slfEff(k,i);return slfValid(w)&&!G.bad[k][i]?norm(w):null});
    e.forEach((x,i)=>{if(x==null)return;const same=e.filter((y,j)=>j!==i&&y===x).length,others=e.filter((y,j)=>j!==i&&y!=null).length;const p=same?5:others?10:20;pts[i]+=p;det[k][i]=p});
  });
  return {pts,det};
}
function slfSuggest(k){   // fast gleiche Wörter (vermutlich Tippfehler): [i,j] mit i<j
  const out=[],e=S.P.map((_,i)=>{const w=slfEff(k,i);return slfValid(w)&&!G.bad[k][i]?norm(w):null});
  for(let i=0;i<e.length;i++)for(let j=i+1;j<e.length;j++)if(e[i]&&e[j]&&e[i].length>=5&&e[j].length>=5&&slfNear(e[i],e[j]))out.push([i,j]);
  return out;
}
function slfReview(){
  const c=slfCalc(),last=G.r+1>=G.rounds;
  const rows=G.cats.map((cat,k)=>{
    const chips=S.P.map((p,i)=>{
      const raw=(G.ans[i]||[])[k]||'',w=slfEff(k,i);if(!String(raw).trim())return `<span class="chip" style="opacity:.45">${esc(p)}: –</span>`;
      const v=slfValid(w),bad=G.bad[k][i]||!v,ed=G.edit&&G.edit.k===k&&G.edit.i===i;
      return `<span class="chip ${bad?'':'on'}" style="${bad?'text-decoration:line-through;opacity:.6':''}${ed?';outline:2px solid var(--gold)':''}" onclick="slfEdit(${k},${i})">${esc(p)}: ${esc(w)}${G.fix[k][i]?' ✎':''}${c.det[k][i]?` <b>+${c.det[k][i]}</b>`:''}</span>`}).join('');
    const sg=slfSuggest(k).map(([i,j])=>`<div class="sm" style="margin-top:10px">💡 „${esc(slfEff(k,i))}“ (${esc(S.P[i])}) und „${esc(slfEff(k,j))}“ (${esc(S.P[j])}) sehen fast gleich aus – Tippfehler?<button class="sec" style="margin-top:6px;padding:10px" onclick="slfSame(${k},${i},${j})">Als gleiches Wort werten</button></div>`).join('');
    let ed='';
    if(G.edit&&G.edit.k===k){
      const i=G.edit.i,bad=G.bad[k][i];
      ed=`<div style="margin-top:12px"><div class="sm" style="margin-bottom:6px">${esc(S.P[i])}: Schreibweise korrigieren</div><div class="row"><input id="slfe" class="txt" type="text" maxlength="30" autocomplete="off" value="${esc(slfEff(k,i))}" style="margin:0;flex:1"><button class="sec ib" onclick="slfFix()" aria-label="Übernehmen">✓</button></div>
      <div class="row" style="margin-top:8px"><button class="sec" style="margin:0;padding:10px" onclick="slfBad(${k},${i})">${bad?'Wieder zählen':'Wort streichen'}</button>${G.fix[k][i]?`<button class="sec" style="margin:0;padding:10px" onclick="slfUnfix(${k},${i})">Original</button>`:''}<button class="sec" style="margin:0;padding:10px" onclick="slfEdit(-1,-1)">Schließen</button></div></div>`;
    }
    return `<div class="card" style="padding:12px 14px"><div class="sm" style="margin-bottom:8px"><b style="color:var(--tx)">${esc(cat)}</b></div><div class="chips">${chips}</div>${sg}${ed}</div>`}).join('');
  scr(`${prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds} · Buchstabe ${G.lt}`)}${G.stopBy!=null?`<p class="sm" style="margin:4px 0 0">✋ Stopp gerufen von <b style="color:var(--tx)">${esc(S.P[G.stopBy])}</b></p>`:''}<p class="sm" style="margin:4px 0 0">Tippe ein Wort an, um die Schreibweise zu korrigieren (Tippfehler) oder es zu streichen (z. B. keine echte Stadt). Farbig = zählt, durchgestrichen = zählt nicht (auch wenn nur der Anfangsbuchstabe dasteht), ✎ = korrigiert.</p>${rows}
  ${boardHTML(c.pts,{label:'Punkte in dieser Runde',unit:' P'})}
  <button onclick="slfDCommit()">${last?'Endergebnis 🏆':'Runde werten'}</button>`);
  if(G.edit){const e=$('slfe');if(e)setTimeout(()=>{try{e.focus()}catch(x){}},60)}
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
function slfBad(k,i){slfKeep(()=>{G.bad[k][i]=!G.bad[k][i]})}
function slfDCommit(){G.sc=slfCalc().pts;slfCommit()}
function slfAdj(i,d){G.sc[i]=Math.max(0,Math.min(100,G.sc[i]+d));const e=$('sc'+i);if(e)e.textContent=G.sc[i]}
function slfCommit(){
  S.P.forEach((_,i)=>G.pts[i]+=G.sc[i]);
  if(G.r+1>=G.rounds){finish({unit:' P'});return}
  G.r++;slfRound();
}

