/* ================= Arschkarte ================= */
function buildDeck(n){
  const sel=QCATS.filter(k=>OPT.arsch.cats&&OPT.arsch.cats[k]),cats=sel.length?sel:QCATS;   // nichts gewählt = alle
  const stat=[],gens=[];
  cats.forEach(c=>{(QPOOL[c]?QPOOL[c]():[]).forEach(q=>stat.push(q));(QGEN[c]||[]).forEach(g=>gens.push(g))});
  const nG=gens.length?(stat.length?Math.round(n*.5):n):0;
  const deck=ordered(stat,q=>q[0],'q').slice(0,n-nG),keys=new Set(deck.map(q=>q[0]));
  let guard=0,gen=0;
  const ok=q=>q&&isFinite(q[1])&&q[1]!==0&&!keys.has(q[0]);
  if(gens.length){
    while(gen<nG&&guard++<600){const q=pick(gens)();if(ok(q)&&!recent('q',q[0])){keys.add(q[0]);deck.push(q);gen++}}
    while(deck.length<n&&guard++<1200){const q=pick(gens)();if(ok(q)){keys.add(q[0]);deck.push(q)}}
  }
  return shuffle(deck);   // kann kürzer als n sein, wenn eine Kategorie zu wenige Fragen hat
}
GAMES.arsch={name:'Arschkarte',e:'🟥',tag:'Schätzen, tippen, Pech haben',c:['#ff7a45','#ff2e4d'],min:2,teams:false,
  desc:'Alle schätzen eine verrückte Zahl. Wer am nächsten liegt, punktet. Und alle tippen, wer am weitesten danebenliegt.',
  rules:'0. Vorher wählst du Kategorien (z. B. Lustig &amp; Alltag, Essen &amp; Trinken, Tiere &amp; Natur). Hat eine Kategorie weniger Fragen als Runden, wird das Spiel entsprechend kürzer.<br>1. Eine Frage mit Zahlenantwort erscheint.<br>2. Jeder schätzt heimlich und tippt sofort, wer am weitesten danebenliegt (nicht man selbst). Schätzungen der anderen sieht niemand.<br>3. <b>Nächster dran: +2 Punkte</b> (bei Gleichstand alle). <b>Richtiger Tipp: +1.</b> Wer am weitesten weg liegt, bekommt die Arschkarte.<br>4. Gemessen wird, um welchen Faktor du danebenliegst (zu hoch und zu niedrig zählen gleich viel), bei Jahreszahlen der Abstand in Jahren. Fragen kommen erst nach der eingestellten Sperrfrist wieder.<br>Zu zweit entfällt das Tippen – es zählt nur, wer näher dran ist.<br>5. Mit Timer: Läuft die Zeit ab, zählt eine bereits eingetippte Zahl. Ohne Eingabe gibt es keine Antwort und damit keine Punkte für die Schätzung.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Kategorien (nichts gewählt = alle)</p><div class="chips">${QCATS.map((k,i)=>`<span class="chip ${OPT.arsch.cats[k]?'on':''}" onclick="arCat(${i},this)">${esc(k)}</span>`).join('')}</div><p class="sm" style="margin:16px 0 8px">Runden</p>${seg('arsch','rounds',[5,10,15,20])}<p class="sm" style="margin:14px 0 8px">Zeit zum Schätzen</p>${seg('arsch','timer',[0,20,30,45,60],v=>v?v+' s':'Aus')}${S.names.length>2?`<p class="sm" style="margin:8px 0 0">Online bleiben danach noch 10 Sekunden zum Tippen.</p>`:''}`,
  start:arStart};
function arCat(i,el){const k=QCATS[i];OPT.arsch.cats[k]=!OPT.arsch.cats[k];el.classList.toggle('on')}
function arStart(){
  G.rounds=G.o.rounds;G.cards=G.ents.map(()=>0);G.near=S.P.map(()=>0);G.tip=S.P.length>2;G.deck=buildDeck(G.rounds);G.rounds=Math.max(1,Math.min(G.rounds,G.deck.length));G.r=0;arRound();
}
function arProg(){return prg(G.r+G.i/S.P.length,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}
function arParse(s){
  const raw=String(s==null?'':s).trim().replace(/\s/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',','.');
  const v=parseFloat(raw);return isFinite(v)?v:null;
}
// Online: alle schätzen und tippen gleichzeitig auf dem eigenen Gerät
let ARTIP_MS=10000;   // Online: Zeit zum Tippen nach Ablauf der Schätzzeit
function arPar(){
  const q=G.q;
  parBegin({head:arProg,dur:G.o.timer?[G.o.timer*1000,ARTIP_MS].slice(0,G.tip?2:1):null,msg:G.tip?'Alle schätzen und tippen gleichzeitig auf ihrem Gerät …':'Beide schätzen gleichzeitig auf ihrem Gerät …',steps:[
    {k:'g',timeout:pi=>{G.g[pi]=null},html:pi=>`<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:12px">${av(pi)}<span class="sm">${esc(S.P[pi])} schätzt</span>${qBtn(q)}</div>
      <div class="q">${esc(q[0])}</div>${q[2]?`<div style="margin-top:8px" class="sm">Einheit: <span class="unit">${esc(q[2])}</span></div>`:''}${qBox(q)}
      <input data-f="g" data-enter="g" class="num" type="text" inputmode="decimal" autocomplete="off" placeholder="?"><button data-sub="g">${G.tip?'Weiter zum Tippen':'Abschicken'}</button></div>`,
     sub:(pi,d)=>{const v=arParse(d.f.g);if(v==null)return 'Bitte eine Zahl eingeben.';G.g[pi]=v;return true}},
    {k:'t',timeout:pi=>{G.t[pi]=null},html:pi=>`<div class="card"><div class="sm">Deine Schätzung ist gespeichert. Jetzt tippen:</div><div class="q" style="margin:8px 0 6px">Wer liegt am weitesten daneben?</div><p style="margin:0 0 6px;font-size:14px">${esc(q[0])}</p>
      ${S.P.map((p,i)=>i===pi?'':`<button class="opt" style="--k:${i}" data-sub="t" data-v="${i}">${av(i)}<span>${esc(p)}</span></button>`).join('')}</div>`,
     sub:(pi,d)=>{const t=Number(d.v);if(d.v==null||!Number.isInteger(t)||t<0||t>=S.P.length||t===pi)return 'Ungültige Wahl.';G.t[pi]=t;return true}}
  ].slice(0,G.tip?2:1),done:arResult});
}
function arRound(){
  G.q=G.deck[G.r];mark('q',G.q[0]);G.g=[];G.t=[];G.i=0;
  if(NET.host){arPar();return}
  hand(G.i,arMsg(),arGuess,arProg());
}
function arGuess(){
  scr(`${arProg()}<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:12px">${av(G.i)}<span class="sm">${esc(S.P[G.i])} schätzt</span>${qBtn(G.q)}</div>
  <div class="q">${esc(G.q[0])}</div>${G.q[2]?`<div style="margin-top:8px" class="sm">Einheit: <span class="unit">${esc(G.q[2])}</span></div>`:''}${qBox(G.q)}
  <input id="g" class="num" type="text" inputmode="decimal" autocomplete="off" placeholder="?">
  <div class="err" id="e"></div><button onclick="arSubmit()">${G.tip?'Weiter zum Tippen':'Abschicken'}</button></div>`);
  const g=$('g');g.addEventListener('keydown',e=>{if(e.key==='Enter')arSubmit()});setTimeout(()=>g.focus(),80);
  if(G.o.timer)tmrShow(G.o.timer*1000,arTimeUp);
}
function arSubmit(){
  const g=$('g');
  const v=arParse(g.value);
  if(v==null){$('e').textContent='Bitte eine Zahl eingeben.';g.classList.remove('shake');void g.offsetWidth;g.classList.add('shake');vib(80);return}
  G.g[G.i]=v;tmrHide();arAfter();
}
const arMsg=()=>G.tip?'Schätzen und tippen – niemand schaut mit!':'Schätzen – niemand schaut mit!';
// Ab 3 Spielern folgt das Tippen; zu zweit gäbe es nur eine mögliche Wahl, deshalb entfällt es
function arAfter(){if(G.tip)arTip();else{G.i++;if(G.i<S.P.length)hand(G.i,arMsg(),arGuess,arProg());else arResult()}}
function arTimeUp(){
  const g=$('g');if(!g)return;
  const v=arParse(g.value);G.g[G.i]=v;tmrHide();sfx.bad();vib([60,40,60]);
  toast(v==null?'⏰ Zeit um – keine Antwort':'⏰ Zeit um – deine Eingabe zählt');
  arAfter();
}
function arTip(){
  const me=G.i;
  scr(`${arProg()}<div class="card"><div class="sm">Deine Schätzung ist gespeichert. Jetzt tippen:</div><div class="q" style="margin:8px 0 6px">Wer liegt am weitesten daneben?</div><p style="margin:0 0 6px;font-size:14px">${esc(G.q[0])}</p>
  ${S.P.map((p,i)=>i===me?'':`<button class="opt" style="--k:${i}" onclick="arPick(${i},this)">${av(i)}<span>${esc(p)}</span></button>`).join('')}</div>`);
}
function arPick(t,btn){
  btn.classList.add('sel');vib(30);sfx.pop();
  document.querySelectorAll('.opt').forEach(b=>b.style.pointerEvents='none');
  setTimeout(()=>{G.t[G.i]=t;G.i++;if(G.i<S.P.length)hand(G.i,'Schätzen und tippen – niemand schaut mit!',arGuess,arProg());else arResult()},420);
}
// Abstand zwischen Schätzung und Antwort: Jahreszahlen absolut (in Jahren), sonst im Verhältnis (zu hoch und zu niedrig zählen gleich)
const arAbs=q=>q[2]==='Jahr'||q[1]<=0;
function arErr(g,q){const a=q[1];if(arAbs(q))return Math.abs(g-a);if(!(g>0))return 1e12;return Math.abs(Math.log(g/a))}
function arDiffTxt(g,q){
  const a=q[1];
  if(arAbs(q)){const d=Math.abs(g-a);if(d<1e-9)return 'exakt';if(q[2]==='Jahr')return fmt(d)+(d===1?' Jahr':' Jahre')+' daneben';return fmt(d,1)+(q[2]?' '+q[2]:'')+' daneben'}
  if(!(g>0))return 'unsinnig (null oder negativ)';
  const f=g/a;if(Math.abs(f-1)<0.0005)return 'exakt';
  if(Math.abs(f-1)<0.2)return fmt(Math.round(Math.abs(f-1)*1000)/10)+' % '+(f>1?'zu hoch':'zu niedrig');
  return 'Faktor '+fmt(f>1?f:1/f,1)+(f>1?' zu hoch':' zu niedrig');
}
function arResult(){
  const a=G.q[1],n=S.P.length,d=dec(a);
  const gs=S.P.map((_,i)=>G.g[i]==null?null:G.g[i]),ts=S.P.map((_,i)=>(G.tip&&G.t[i]!=null)?G.t[i]:null);
  const err=gs.map(g=>g==null?null:arErr(g,G.q));          // null = keine Antwort (Zeit abgelaufen)
  const valid=err.filter(e=>e!=null),mxBar=Math.max(0,...valid.filter(e=>e<1e11));
  const mn=valid.length?Math.min(...valid):0,mx=valid.length?Math.max(...valid):0,eps=1e-12;
  const best=err.map(e=>e!=null&&e-mn<eps);
  const worst=mx-mn<eps?err.map(()=>false):err.map(e=>e!=null&&mx-e<eps);
  const tipOK=ts.map(t=>t!=null&&worst[t]);
  const gain=S.P.map((_,i)=>(best[i]?2:0)+(tipOK[i]?1:0));
  gain.forEach((g,i)=>{G.pts[i]+=g;if(worst[i])G.cards[i]++;if(best[i]&&G.near)G.near[i]++});
  const order=S.P.map((_,i)=>i).sort((x,y)=>(err[y]==null?-1:err[y])-(err[x]==null?-1:err[x]));
  const step=.55,end=n*step+.4,last=G.r+1>=G.rounds;
  const u=G.q[2]&&G.q[2]!=='Jahr'?' '+esc(G.q[2]):'';
  scr(`${prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}
  <div class="card ans"><div class="q" style="font-size:19px">${esc(G.q[0])}</div><div class="sm" style="margin-top:12px">Richtige Antwort</div><div class="num"><span id="cu">0</span><span class="unit" style="font-size:22px">${u}</span></div></div>
  <div>${order.map((i,k)=>{
    const w=err[i]==null?0:mxBar>0?Math.max(3,Math.min(100,err[i]/mxBar*100)):3;
    return `<div class="res ${best[i]?'best':''} ${worst[i]?'worst':''}" style="--d:${(k*step+.5).toFixed(2)}s;--w:${w}%">
      <div class="rh">${av(i)}<div class="nm">${esc(S.P[i])}${best[i]?'<span class="tag b">am nächsten</span>':''}${worst[i]?'<span class="tag w">Arschkarte</span>':''}</div><div class="gain ${gain[i]?'':'z'}">+${gain[i]}</div></div>
      <div class="dev"><i></i></div>
      <div class="sm">${gs[i]==null?'⏰ <b style="color:var(--tx)">Keine Antwort</b> (Zeit abgelaufen)':`Schätzung <b style="color:var(--tx)">${fmt(gs[i])}</b> · ${arDiffTxt(gs[i],G.q)}`}${G.tip?`<br>Tipp: ${ts[i]==null?'–':esc(S.P[ts[i]])} ${tipOK[i]?'<span class="tag t">richtig +1</span>':'<span class="tag x">falsch</span>'}`:''}</div></div>`}).join('')}</div>
  <div class="late" style="--d:${end}s">${G.o.drink?drinkBox(S.P.map((p,i)=>worst[i]?`${esc(p)} trinkt 1 Schluck 🟥`:'').concat(S.P.map((p,i)=>best[i]?`${esc(p)} verteilt 2 Schlucke 🎯`:'')).filter(Boolean)):''}${boardHTML(G.pts)}<button onclick="${last?'arFinish()':'G.r++;arRound()'}">${last?'Endergebnis 🏆':'Nächste Frage'}</button></div>`);
  countUp($('cu'),a,d,1100);
  order.forEach((i,k)=>{
    const at=(k*step+.5)*1000;
    if(worst[i])setTimeout(()=>{flash();sfx.bad()},at+250);
    if(best[i])setTimeout(()=>{confetti(110,GOLD);sfx.ok();vib(40)},at+500);
  });
}
function arFinish(){
  const mxc=Math.max(...G.cards),loser=S.P.filter((_,i)=>G.cards[i]===mxc&&mxc>0);
  finish({extra:loser.length?`<div class="card late" style="--d:1.2s;text-align:center;border-color:var(--red)"><div class="sm">Arschkarte des Abends</div><div style="font-size:46px;margin:6px 0">🟥</div><div class="big" style="color:var(--red2)">${esc(loser.join(', '))}</div><div class="sm">${mxc}× am weitesten danebengelegen</div></div>`:''});
}

