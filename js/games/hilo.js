/* ================= Mehr oder weniger ================= */
const HLC=['Berge & Bauwerke 🏔️','Geschichte 📅','Länder 🌍','Entfernung 📍','Lebensalter 🎂'];
const HEV=[['Fall der Berliner Mauer',1989],['Untergang der Titanic',1912],['Erste Mondlandung',1969],['Entdeckung Amerikas durch Kolumbus',1492],['Gründung von Google',1998],['Erstes iPhone',2007],['Einführung des Euro-Bargelds',2002],['Erstbesteigung des Mount Everest',1953],['Bau der Berliner Mauer',1961],['Beginn der Französischen Revolution',1789],['Gründung von YouTube',2005],['Gründung von Facebook',2004],['Gründung von Apple',1976],['Gründung von Microsoft',1975],['Eröffnung des Eiffelturms',1889],['Beginn des Ersten Weltkriegs',1914],['Beginn des Zweiten Weltkriegs',1939],['Erster Mensch im All (Gagarin)',1961],['Erste Fußball-Weltmeisterschaft',1930],['Erste Bundesliga-Saison',1963],['Entdeckung des Penicillins',1928],['Klonschaf Dolly geboren',1996],['Erstes Oktoberfest',1810],['Fall von Konstantinopel',1453],['Gründung der Bundesrepublik Deutschland',1949],['Deutsche Wiedervereinigung',1990],['Patent für das Auto von Carl Benz',1886],['Gründung von Lego',1932],['Entdeckung der Röntgenstrahlung',1895],['Gründung von Amazon',1994]];
// ungefähre Werte
const HPOP=[['Deutschland',84],['Frankreich',68],['Italien',59],['Spanien',48],['Polen',37],['Niederlande',18],['Österreich',9],['Schweiz',9],['Schweden',10.5],['Norwegen',5.5],['Dänemark',5.9],['Portugal',10.4],['Griechenland',10.4],['Tschechien',10.9],['Belgien',11.7],['Irland',5.2],['Finnland',5.6],['Türkei',85],['Vereinigtes Königreich',68],['Russland',144],['Japan',124],['Brasilien',216],['USA',335],['China',1410],['Indien',1430],['Australien',26],['Kanada',40],['Mexiko',128],['Ägypten',112],['Nigeria',224],['Argentinien',46],['Südkorea',51],['Indonesien',277]];
const HARE=[['Deutschland',358],['Frankreich',551],['Italien',301],['Spanien',506],['Polen',313],['Schweden',450],['Norwegen',385],['Finnland',338],['Österreich',84],['Schweiz',41],['Niederlande',42],['Dänemark',43],['Griechenland',132],['Portugal',92],['Irland',70],['Ungarn',93],['Tschechien',79],['Belgien',31],['Island',103],['Vereinigtes Königreich',244],['Türkei',784],['Ukraine',604],['Russland',17098],['Kanada',9985],['China',9597],['USA',9834],['Brasilien',8516],['Australien',7692],['Indien',3287],['Argentinien',2780],['Japan',378],['Ägypten',1002],['Nigeria',924],['Mexiko',1964]];
OPT.hilo={rounds:12,timer:12,cats:{}};
function hiCat(i,el){const k=HLC[i];OPT.hilo.cats[k]=!OPT.hilo.cats[k];el.classList.toggle('on')}
GAMES.hilo={name:'Mehr oder weniger',e:'⚖️',tag:'Was ist höher, älter, größer?',c:['#84cc16','#16a34a'],min:2,teams:false,
  desc:'Zwei Dinge, eine Frage: Welches ist höher, älter, größer oder weiter weg? Schnell entscheiden!',
  rules:'Jede Runde zeigt zwei Möglichkeiten und eine Frage („Was ist höher?“, „Was geschah früher?“ …). Jeder wählt heimlich. Wer richtig liegt, bekommt <b>+1</b>. Danach werden die echten Werte gezeigt. Bei Länderwerten und Entfernungen sind die Zahlen ungefähr. Mit Timer zählt eine nicht abgegebene Wahl als falsch.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Kategorien (nichts gewählt = alle)</p><div class="chips">${HLC.map((k,i)=>`<span class="chip ${OPT.hilo.cats[k]?'on':''}" onclick="hiCat(${i},this)">${esc(k)}</span>`).join('')}</div>
  <p class="sm" style="margin:16px 0 8px">Runden</p>${seg('hilo','rounds',[8,12,20])}<p class="sm" style="margin:14px 0 8px">Zeit zum Entscheiden</p>${seg('hilo','timer',[0,8,12,20],v=>v?v+' s':'Aus')}`,
  start:hiStart};
function hiPair(list,ratio,diff){
  for(let t=0;t<80;t++){
    const a=pick(list),b=pick(list);if(a===b)continue;
    const hi=Math.max(a[1],b[1]),lo=Math.min(a[1],b[1]);
    if(ratio?(lo>0&&hi/lo>=ratio):(hi-lo>=diff))return Math.random()<.5?[a,b]:[b,a];
  }
  const a=list[0],b=list[list.length-1];return [a,b];
}
function hiDuel(c){
  if(c===HLC[0]){const [a,b]=hiPair(MOUNT.concat(BUILD),1.1);return {q:'Was ist höher?',a:[cap(a[0]),a[1]],b:[cap(b[0]),b[1]],pick:'max',unit:'m'}}
  if(c===HLC[1]){const [a,b]=hiPair(HEV,0,8);return {q:'Was geschah früher?',a:a,b:b,pick:'min',unit:'Jahr'}}
  if(c===HLC[2]){
    if(Math.random()<.5){const [a,b]=hiPair(HPOP,1.15);return {q:'Welches Land hat mehr Einwohner?',a,b,pick:'max',unit:'Mio. Einwohner',approx:true}}
    const [a,b]=hiPair(HARE,1.15);return {q:'Welches Land ist flächenmäßig größer?',a,b,pick:'max',unit:'Tsd. km²',approx:true};
  }
  if(c===HLC[3]){
    const r=x=>x*Math.PI/180,m=CITY[0];
    const dist=ct=>{const dl=r(ct[2]-m[2]),dp=r(ct[1]-m[1]),h=Math.sin(dp/2)**2+Math.cos(r(m[1]))*Math.cos(r(ct[1]))*Math.sin(dl/2)**2;return Math.round(2*6371*Math.asin(Math.sqrt(h))/10)*10};
    const list=CITY.slice(1).map(ct=>[ct[0],dist(ct)]).filter(x=>x[1]>=50),[a,b]=hiPair(list,1.15);
    return {q:'Welche Stadt ist von München weiter entfernt?',a,b,pick:'max',unit:'km',approx:true};
  }
  const [a,b]=hiPair(PEOPLE,0,6);return {q:'Wer wurde älter?',a,b,pick:'max',unit:'Jahre'};
}
const hiVal=(d,v)=>d.unit==='Jahr'?String(v):`${d.approx?'ca. ':''}${fmt(v)} ${d.unit}`;
const hiOk=d=>d.pick==='max'?(d.a[1]>d.b[1]?0:1):(d.a[1]<d.b[1]?0:1);
function hiMake(){
  const sel=HLC.filter(k=>G.o.cats[k]),cats=sel.length?sel:HLC;let d=null;
  for(let t=0;t<40;t++){
    d=hiDuel(pick(cats));const k=d.a[0]+'|'+d.b[0],k2=d.b[0]+'|'+d.a[0];
    if(G.seen.has(k)||G.seen.has(k2)||recent('h',k)||recent('h',k2))continue;
    G.seen.add(k);mark('h',k);return d;
  }
  return d;
}
function hiStart(){G.r=0;G.rounds=G.o.rounds;G.hit=S.P.map(()=>0);G.seen=new Set();hiRound()}
function hiProg(){return prg(G.r+G.i/S.P.length,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}
function hiRound(){
  G.d=hiMake();G.i=0;G.pk=[];
  if(NET.host){hiPar();return}
  hand(G.i,'Entscheide schnell – niemand schaut mit!',hiVote,hiProg());
}
function hiCard(pi,online){
  const d=G.d;
  return `<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:10px">${av(pi)}<span class="sm">${esc(S.P[pi])} wählt</span></div>
  <div class="q" style="margin:4px 0 14px">${esc(d.q)}</div>
  ${[d.a,d.b].map((o,k)=>`<button class="opt" style="--k:${k}" ${online?`data-sub="v" data-v="${k}"`:`onclick="hiPick(${k},this)"`}><span>${esc(o[0])}</span></button>`).join('')}</div>`;
}
function hiVote(){scr(`${hiProg()}${hiCard(G.i,false)}`);if(G.o.timer)tmrShow(G.o.timer*1000,hiTimeUp)}
function hiNext(){G.i++;if(G.i<S.P.length)hand(G.i,'Entscheide schnell – niemand schaut mit!',hiVote,hiProg());else hiResult()}
function hiPick(k,btn){
  tmrHide();btn.classList.add('sel');vib(30);sfx.pop();document.querySelectorAll('.opt').forEach(b=>b.style.pointerEvents='none');
  setTimeout(()=>{G.pk[G.i]=k;hiNext()},350);
}
function hiTimeUp(){tmrHide();sfx.bad();vib([60,40,60]);G.pk[G.i]=null;toast('⏰ Zeit um – keine Wahl');hiNext()}
function hiPar(){
  parBegin({head:hiProg,dur:G.o.timer?[G.o.timer*1000]:null,msg:'Alle entscheiden gleichzeitig …',steps:[
    {k:'v',timeout:pi=>{G.pk[pi]=null},html:pi=>hiCard(pi,true),
     sub:(pi,d)=>{const k=Number(d.v);if(d.v==null||(k!==0&&k!==1))return 'Ungültige Wahl.';G.pk[pi]=k;return true}}
  ],done:hiResult});
}
function hiResult(){
  const d=G.d,ok=hiOk(d),last=G.r+1>=G.rounds;
  const gain=S.P.map((_,i)=>G.pk[i]===ok?1:0);gain.forEach((g,i)=>{G.pts[i]+=g;G.hit[i]+=g});
  scr(`${prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}<div class="card ans"><div class="q" style="font-size:19px">${esc(d.q)}</div></div>
  ${[d.a,d.b].map((o,k)=>`<div class="res ${k===ok?'best':''}" style="--d:${(.3+k*.4).toFixed(2)}s"><div class="rh"><div class="nm" style="font-size:18px">${esc(o[0])}${k===ok?'<span class="tag b">✓ richtig</span>':''}</div><div style="font-weight:850">${esc(hiVal(d,o[1]))}</div></div></div>`).join('')}
  <div class="late" style="--d:1.1s">${S.P.map((p,i)=>`<div class="sb"><span class="nm" style="width:auto;flex:1">${av(i,'',26)} ${esc(p)}</span><span class="pt" style="width:auto">${G.pk[i]==null?'⏰ keine Wahl':G.pk[i]===ok?'✅ +1':'❌'}</span></div>`).join('')}${boardHTML(G.pts)}<button onclick="${last?'finish()':'G.r++;hiRound()'}">${last?'Endergebnis 🏆':'Nächste Runde'}</button></div>`);
  if(gain.some(g=>g)){setTimeout(()=>{confetti(40,GOLD);sfx.ok()},400)}else sfx.bad();
}

