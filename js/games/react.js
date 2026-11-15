/* ================= Reaktionsduell ================= */
GAMES.react={name:'Reflex',e:'⚡',tag:'Wer ist am schnellsten?',c:['#22c55e','#06b6d4'],min:2,teams:true,
  desc:'Rot heißt warten, Grün heißt tippen. Wer zuckt zu früh? Wer hat die schnellsten Finger?',
  rules:'Jeder ist reihum dran. Der Bildschirm ist erst rot – sobald er <b>grün</b> wird, so schnell wie möglich tippen. Zu früh getippt = Fehlstart (zählt als letzter Platz). Pro Runde bekommt der Schnellste 3 Punkte, der Zweite 2, der Dritte 1. Im Teammodus sammelt jeder Punkte für sein Team.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Runden</p>${seg('react','rounds',[3,5,8])}`,
  start:rxStart};
function rxStart(){G.r=0;G.rounds=G.o.rounds;G.best=S.P.map(()=>Infinity);rxRound()}
function rxProg(){return prg(G.r+G.i/S.P.length,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}
function rxRound(){G.times=[];G.i=0;rxHand()}
function rxHand(){hand(G.i,'Finger bereit! Rot = warten, Grün = tippen.',rxGo,rxProg(),G.team?`Team ${TN[eOf(G.i)][0]} ${TN[eOf(G.i)][1]}`:'')}
function rxGo(){
  G.rs='wait';
  scr(`${rxProg()}<div class="rx w" id="rx" onpointerdown="rxTap()"><div><div style="font-size:60px">✋</div>Warte …<div class="sm" style="margin-top:6px">${esc(S.P[G.i])}</div></div></div>`);
  clearTimeout(G.iv2);
  G.iv2=setTimeout(()=>{
    const el=$('rx');if(!el||G.rs!=='wait')return;
    G.rs='go';el.className='rx g';el.innerHTML='<div><div style="font-size:70px">⚡</div>JETZT!</div>';sfx.go();vib(30);G.t0=performance.now();
  },rnd(1500,5000));
}
// Online: Das Gerät des Spielers misst selbst (ab dem Moment, in dem es Grün zeigt) und schickt nur das Ergebnis.
// Prüfung hier: nur das Gerät des aktuellen Spielers, nie weniger als 80 ms, nie mehr als seit dem Start vergangen ist.
function rxRemote(idx,d){
  if(!G||G.id!=='react'||!$('rx')||devIdx(G.i)!==idx)return;
  if(d.k==='early'&&G.rs==='wait')rxTap();
  else if(d.k==='ms'&&G.rs==='go'){
    const spent=Math.round(performance.now()-G.t0);let ms=Math.round(Number(d.v));
    if(!isFinite(ms))return;
    rxTap(Math.max(80,Math.min(ms,spent)));
  }
}
function rxTap(ext){   // ext = vom Gerät des Spielers gemessene Zeit (Online); sonst hier messen
  const el=$('rx');if(!el)return;
  if(G.rs==='wait'){
    clearTimeout(G.iv2);G.rs='done';G.times[G.i]=Infinity;sfx.bad();vib([80,40,80]);
    el.className='rx d';el.innerHTML='<div><div style="font-size:60px">🙈</div>Zu früh!<div class="sm" style="margin-top:6px">Fehlstart</div><button onclick="rxNext()" style="margin-top:18px">Weiter</button></div>';
  }else if(G.rs==='go'){
    const ms=ext!=null?ext:Math.round(performance.now()-G.t0);G.rs='done';G.times[G.i]=ms;if(ms<G.best[G.i])G.best[G.i]=ms;
    const r=ms<180?'🚀 Unfair schnell':ms<240?'⚡ Blitzschnell':ms<320?'👍 Solide':ms<450?'🐢 Gemütlich':'🦥 Eingeschlafen?';
    el.className='rx d';el.innerHTML=`<div style="width:100%"><div style="font-size:64px;font-weight:900;letter-spacing:-2px"><span id="rms">0</span> ms</div><div>${r}</div><button onclick="rxNext()" style="margin-top:18px">Weiter</button></div>`;
    countUp($('rms'),ms,0,500);sfx.ok();vib(30);
  }
}
function rxNext(){
  G.i++;
  if(G.i<S.P.length)rxHand();else rxResult();
}
function rxResult(){
  const idx=S.P.map((_,i)=>i).sort((a,b)=>G.times[a]-G.times[b]);
  const gain=S.P.map(()=>0);
  idx.forEach((pi,rank)=>{const g=G.times[pi]===Infinity?0:Math.max(0,3-rank);gain[pi]=g;G.pts[eOf(pi)]+=g});
  const last=G.r+1>=G.rounds;
  scr(`${prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}<div class="card"><h2>Ergebnis</h2>${idx.map((pi,k)=>`<div class="res ${k===0&&G.times[pi]!==Infinity?'best':''}" style="--d:${(k*.35).toFixed(2)}s"><div class="rh">${av(pi,'',38)}<div class="nm">${esc(S.P[pi])}${G.team?` <span class="sm">${TN[eOf(pi)][0]}</span>`:''}</div><div style="font-weight:850;font-size:20px">${G.times[pi]===Infinity?'🙈 Fehlstart':G.times[pi]+' ms'}</div><div class="gain ${gain[pi]?'':'z'}" style="--d:${(k*.35).toFixed(2)}s">+${gain[pi]}</div></div></div>`).join('')}</div>
  <div class="late" style="--d:${idx.length*.35+.2}s">${G.o.drink?drinkBox(rxDrink(idx)):''}${boardHTML(G.pts)}<button onclick="${last?'rxFinish()':'G.r++;rxRound()'}">${last?'Endergebnis 🏆':'Nächste Runde'}</button></div>`);
  setTimeout(()=>{confetti(50,GOLD);sfx.ok()},300);
}
function rxFinish(){
  const bi=G.best.indexOf(Math.min(...G.best));
  finish({extra:isFinite(G.best[bi])?`<div class="card late" style="--d:1.2s;text-align:center"><div class="sm">Schnellste Reaktion des Abends</div><div class="big" style="color:var(--ok)">${G.best[bi]} ms</div><div class="sm">${esc(S.P[bi])}</div></div>`:''});
}

