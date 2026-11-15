/* ---------- Galgenmännchen ---------- */
const HGW={
'Tiere 🐾':['ELEFANT','GIRAFFE','KROKODIL','PINGUIN','FLAMINGO','NASHORN','DELFIN','PAPAGEI','SCHLANGE','KAMEL','ZEBRA','GORILLA','PANTHER','KOALA','WALROSS','HAMSTER','LIBELLE','FLEDERMAUS','SPINNE','ADLER','FALKE','KATZE','PFERD','SCHMETTERLING'],
'Essen 🍕':['SPAGHETTI','SCHOKOLADE','PFANNKUCHEN','ERDBEERE','KARTOFFEL','BANANE','WASSERMELONE','BREZEL','SALAT','HAMBURGER','MARMELADE','LAKRITZ','KAKAO','ZITRONE','PAPRIKA','BROKKOLI','GURKE','TOMATE','SEMMEL','NUDELN','ERDNUSS','KIRSCHE','MANDARINE'],
'Orte 📍':['BAHNHOF','SCHWIMMBAD','FLUGHAFEN','BIBLIOTHEK','SUPERMARKT','KRANKENHAUS','SPIELPLATZ','BAUERNHOF','LEUCHTTURM','VULKAN','WASSERFALL','STRAND','DSCHUNGEL','INSEL','GEBIRGE','KINO','THEATER','MUSEUM','ZIRKUS','TUNNEL'],
'Alltag 🎒':['REGENSCHIRM','FAHRRAD','TASCHENLAMPE','KUGELSCHREIBER','STAUBSAUGER','WECKER','SONNENBRILLE','RUCKSACK','TELEFON','FERNSEHER','KALENDER','LINEAL','SCHERE','TASCHENRECHNER','LAPTOP','BADEWANNE','TRAMPOLIN','FUSSBALL','GITARRE','KLAVIER','TROMMEL','GEIGE']
};
OPT.hang={rounds:5};
GAMES.hang={name:'Galgenmännchen',e:'🔤',tag:'Buchstabe für Buchstabe',c:['#a855f7','#6366f1'],min:1,teams:false,
  desc:'Rate das Wort Buchstabe für Buchstabe, bevor das Männchen fertig ist. Allein oder reihum.',
  rules:'Ein Wort ist gesucht (die Kategorie steht dabei). Wer dran ist, tippt einen Buchstaben. Kommt er vor, bekommst du <b>1 Punkt pro Treffer</b> und darfst nochmal; wer das Wort vollendet, bekommt <b>3 Bonuspunkte</b>. Kommt er nicht vor, wächst das Männchen und der Nächste ist dran. Nach 8 Fehlern ist die Runde verloren. Am Ende gewinnt, wer die meisten Punkte hat.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Wörter</p>${seg('hang','rounds',[3,5,8])}`,
  start:hgStart};
function hgStart(){
  const all=[];Object.keys(HGW).forEach(c=>HGW[c].forEach(w=>all.push([c,w])));
  G.pool=ordered(all,x=>x[1],'g');G.rounds=Math.max(1,Math.min(G.o.rounds,G.pool.length));G.r=0;G.cur=0;hgRound();
}
function hgRound(){const [c,w]=G.pool[G.r];mark('g',w);G.cat=c;G.word=w;G.gs=[];G.wr=0;G.res=null;hgScreen()}
const HGP=['M10 132H80M30 132V14','M30 14H85M85 14V32','M85 32m-10 10a10 10 0 1 0 20 0a10 10 0 1 0 -20 0','M85 52V88','M85 60L68 76','M85 60L102 76','M85 88L70 112','M85 88L100 112'];
function hgScreen(){
  const n=S.P.length,w=G.word,rows=['QWERTZUIOP','ASDFGHJKL','YXCVBNM'];
  const gal=`<svg viewBox="0 0 120 140" class="hgs" aria-label="${G.wr} von 8 Fehlern" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${HGP.slice(0,G.wr).map(d=>`<path d="${d}"/>`).join('')}</svg>`;
  const word=w.split('').map(ch=>{const up=G.gs.includes(ch);return `<span class="hl ${!up&&G.res==='lost'?'miss':''}">${up||G.res?ch:'&nbsp;'}</span>`}).join('');
  const keys=rows.map(r=>`<div class="hgr">${r.split('').map(L=>{const used=G.gs.includes(L),hit=used&&w.includes(L);return `<button class="hgk kx ${used?(hit?'hit':'bad'):''}" data-l="${L}" ${used||G.res?'disabled':''} onclick="hgGuess('${L}')">${L}</button>`}).join('')}</div>`).join('');
  const last=G.r+1>=G.rounds;
  const res=G.res?`<div class="card ans"><div style="font-size:46px">${G.res==='won'?'🎉':'💀'}</div><div class="big" style="font-size:26px">${G.res==='won'?`${esc(S.P[G.cur])} löst das Wort!`:'Das Männchen ist fertig'}</div><div class="sm">Gesucht war: <b>${w}</b></div><button onclick="hgNext()">${last?'Endergebnis 🏆':'Nächstes Wort'}</button></div>`:'';
  scr(`${prg(G.r+(G.res?1:0),G.rounds,`Wort ${G.r+1} von ${G.rounds} · ${esc(G.cat)}`)}${n>1?clsHead(' P'):`<div class="sm" style="margin:6px 0">Punkte: <b>${G.pts[0]}</b></div>`}
  <div id="hg"><div class="row" style="align-items:center;justify-content:center;gap:14px"><div class="hgw">${gal}</div><div class="sm">Fehler<br><b style="font-size:26px;color:var(--tx)">${G.wr}</b> / 8</div></div>
  <div class="hword">${word}</div>
  ${G.res?'':`<div class="sm" style="text-align:center;margin:2px 0 10px">${n>1?`${esc(S.P[G.cur])} ist dran`:'Tippe einen Buchstaben'}</div>`}
  ${keys}</div>${res}`);
}
function hgGuess(L){
  if(G.res||!/^[A-Z]$/.test(L)||G.gs.includes(L))return;
  G.gs.push(L);const k=G.word.split(L).length-1;
  if(k){
    G.pts[G.cur]+=k;sfx.ok();vib(20);
    if(G.word.split('').every(ch=>G.gs.includes(ch))){G.pts[G.cur]+=3;G.res='won';confetti(60,GOLD);sfx.win()}
  }else{
    G.wr++;sfx.bad();vib([40,30,40]);
    if(G.wr>=8)G.res='lost';else if(S.P.length>1)G.cur=(G.cur+1)%S.P.length;
  }
  hgScreen();
}
function hgNext(){
  if(G.r+1>=G.rounds){finish({unit:' P'});return}
  G.r++;G.cur=G.r%S.P.length;hgRound();
}

