/* ================= Wellenlänge ================= */
const SP=[['Heiß','Kalt'],['Schlechter Film','Guter Film'],['Unnützes Hobby','Nützliches Hobby'],['Ekelhaft','Lecker'],['Langweilig','Spannend'],['Billig','Teuer'],['Harmlos','Gefährlich'],['Altmodisch','Modern'],['Leise','Laut'],['Wenig Arbeit','Viel Arbeit'],['Überschätzt','Unterschätzt'],['Nerdig','Cool'],['Gesund','Ungesund'],['Entspannend','Stressig'],['Kitsch','Kunst'],['Peinlich','Stolz machend'],['Winzig','Riesig'],['Natürlich','Künstlich'],['Selten','Häufig'],['Schlecht für Partys','Gut für Partys'],['Süß','Salzig'],['Mutig','Feige'],['Schnell','Langsam'],['Hässlich','Schön'],['Sinnvoll','Sinnlos'],['Traurig','Fröhlich'],['Brutal','Zärtlich'],['Anfänger','Profi'],['Verzichtbar','Unverzichtbar'],['Alltäglich','Außergewöhnlich'],['Unromantisch','Romantisch'],['Normal','Verrückt'],['Weich','Hart'],['Hell','Dunkel'],['Gut gealtert','Schlecht gealtert'],['Zu Hause','Unterwegs'],['Bayerisch','Preußisch'],['Frühstück','Abendessen'],['Sommer','Winter'],['Hund','Katze']];
GAMES.wave={name:'Wellenlänge',e:'📡',tag:'Auf einer Wellenlänge sein',c:['#f59e0b','#ef4444'],min:3,teams:true,
  desc:'Eine Skala zwischen zwei Gegensätzen, ein geheimer Punkt. Gib einen Hinweis – und hoffe, dass die anderen auf deiner Wellenlänge liegen.',
  rules:'Der Hinweisgeber sieht, wo auf der Skala der geheime Punkt liegt, und nennt <b>einen</b> Begriff oder Satz, der dazu passt (zum Beispiel „Pizza“ bei Ekelhaft ↔ Lecker). Die anderen schieben den Regler dorthin, wo sie den Punkt vermuten. <b>Volltreffer 4, nah dran 3, in der Gegend 2 Punkte.</b> Einzeln: der Hinweisgeber punktet. Im Teammodus punktet sein Team, und ein anderes Team kann mit „links oder rechts?“ einen Bonuspunkt klauen.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Durchgänge (so oft gibt jeder einen Hinweis)</p>${seg('wave','rounds',[1,2,3])}`,
  start:waStart};
function waStart(){G.plan=plan(G.o.rounds);G.t=0;G.sp=ordered(SP,s=>s[0]+'|'+s[1],'s');waHand()}
function waHand(){
  const p=G.plan[G.t];G.a=p.a;G.e=p.e;
  const s=G.sp[G.t%G.sp.length];mark('s',s[0]+'|'+s[1]);G.pair=s;G.target=rnd(8,92);G.guess=50;
  hand(G.a,'Du gibst den Hinweis. Nur du schaust auf das Display!',waSecret,prg(G.t,G.plan.length,`Hinweis ${G.t+1} von ${G.plan.length}`),G.team?`Team ${TN[G.e][0]} ${TN[G.e][1]}`:'');
}
function specBar(o){
  const b=(w,cls)=>o.target!=null?`<div class="band ${cls}" style="left:${Math.max(0,o.target-w)}%;width:${Math.min(100,o.target+w)-Math.max(0,o.target-w)}%"></div>`:'';
  return `<div class="wl"><span>${esc(G.pair[0])}</span><span>${esc(G.pair[1])}</span></div>
  <div class="spec${o.live?' live':''}" id="sp"${o.live?' data-ptr="1"':''}><div class="sp-in">${b(15,'b2')}${b(9,'b3')}${b(4,'b4')}</div>${o.target!=null?`<div class="mk tg" style="left:${o.target}%"></div>`:''}${o.guess!=null?`<div class="mk gs" id="gm" style="left:${o.guess}%"><span class="knob"></span></div>`:''}</div>`;
}
function waBind(){
  const sp=$('sp');if(!sp)return;
  const set=x=>{const r=sp.getBoundingClientRect();if(!r.width)return;G.guess=Math.round(Math.max(0,Math.min(100,(x-r.left)/r.width*100))*10)/10;waMark()};
  sp.addEventListener('pointerdown',e=>{try{sp.setPointerCapture(e.pointerId)}catch(_){}G.drag=true;set(e.clientX);e.preventDefault()});
  sp.addEventListener('pointermove',e=>{if(G.drag)set(e.clientX)});
  ['pointerup','pointercancel','lostpointercapture'].forEach(t=>sp.addEventListener(t,()=>{G.drag=false}));
}
function waMark(){const m=$('gm');if(m)m.style.left=G.guess+'%';if(G.ag&&G.ag.size&&G.guess!==G.lastg){G.ag.clear();waAgreeUI()}G.lastg=G.guess}
function waNudge(d){G.guess=Math.max(0,Math.min(100,Math.round((G.guess+d)*10)/10));waMark();sfx.tick()}
function waSecret(){
  scr(`${prg(G.t,G.plan.length,`Hinweis ${G.t+1} von ${G.plan.length}`)}<div class="card"><div class="sm">Geheim – nur für ${esc(S.P[G.a])}</div>
  ${specBar({target:G.target})}
  <p style="margin:10px 0 0">Der goldene Bereich ist der Volltreffer. Denk dir <b>einen Hinweis</b> aus, der genau dorthin passt, und sag ihn laut – ohne die Position zu verraten.</p></div>
  <button onclick="waGuess()">Verstecken &amp; raten lassen</button>`);
}
function waGuess(){
  G.guess=50;G.drag=false;G.ag=new Set();G.lastg=50;
  G.gu=G.team?G.tm[G.e].filter(p=>p!==G.a):S.P.map((_,i)=>i).filter(p=>p!==G.a);
  if(!G.gu.length)G.gu=S.P.map((_,i)=>i).filter(p=>p!==G.a);
  scr(`${prg(G.t,G.plan.length,`Hinweis ${G.t+1} von ${G.plan.length}`)}<div class="card"><div class="sm">${esc(S.P[G.a])} hat den Hinweis gegeben. ${G.team?'Das Team rät:':'Rät gemeinsam:'}</div>
  ${specBar({live:true,guess:50})}
  <div class="row" style="align-items:center;margin-top:12px"><button class="sec ib" style="margin:0" onclick="waNudge(-1)">◀</button><p class="sm" style="flex:1;text-align:center;margin:0">Ziehe den Marker auf dem Balken dorthin, wo der Hinweis liegt – oder feinjustiere mit den Pfeilen.</p><button class="sec ib" style="margin:0" onclick="waNudge(1)">▶</button></div></div>
  ${NET.host?`<div id="wag" style="margin-top:12px"></div><button id="wab" onclick="waAgree()">✅ Ich stimme zu</button>`:`<button onclick="waLock()">Einloggen</button>`}`);
  waBind();if(NET.host)waAgreeUI();
}
// Online: Jeder Rater muss dem aktuellen Marker zustimmen; wer ihn verschiebt, setzt alle Zustimmungen zurück
const waReq=()=>G.gu.filter(p=>p===0||isOpen(NET.m[p]));
function waAgree(){
  const who=NET.who==null?0:NET.who;
  if(!G.gu.includes(who)){if(who===0)toast('Du hast den Hinweis gegeben – die anderen raten');return}
  if(G.ag.has(who))G.ag.delete(who);else G.ag.add(who);
  sfx.pop();waAgreeUI();
  const need=waReq();
  if(!need.length||need.every(p=>G.ag.has(p)))waLock();
}
function waAgreeUI(){
  const e=$('wag');if(!e)return;
  e.innerHTML=waReq().map(p=>`<span class="chip ${G.ag.has(p)?'on':''}" style="margin:2px 4px 2px 0;cursor:default">${G.ag.has(p)?'✅':'⏳'} ${esc(S.P[p])}</span>`).join('')+'<div class="sm" style="margin-top:6px">Alle Rater müssen dem Marker zustimmen. Wer ihn verschiebt, setzt alle Zustimmungen zurück.</div>';
}
function waLock(){
  sfx.pop();
  if(G.team&&G.tm.length>1){
    const ot=(G.e+1)%G.tm.length;G.ot=ot;
    scr(`<div class="card ans"><div class="sm">Bonuspunkt</div><div class="q">Team ${TN[ot][0]} ${TN[ot][1]} entscheidet:</div><p>Liegt der geheime Punkt weiter links oder rechts vom Tipp?</p></div>
    <div class="row"><button class="sec" onclick="waSide('L')">◀ Weiter links</button><button class="sec" onclick="waSide('R')">Weiter rechts ▶</button></div><div id="wlr" style="margin-top:12px"></div>`);
    if(NET.host){G.lr={};waSideUI()}
  }else waReveal(null);
}
// Online: Alle (verbundenen) Mitglieder des entscheidenden Teams tippen selbst; es geht weiter, sobald alle dasselbe gewählt haben
const waSideReq=()=>(G.tm[G.ot]||[]).filter(p=>p===0||isOpen(NET.m[p]));
function waSide(dir){
  if(!NET.host){waReveal(dir);return}                         // ein Gerät: wie bisher sofort
  const who=NET.who==null?0:NET.who,req=waSideReq();
  if(req.length&&!req.includes(who)){if(who===0)toast(`Das entscheidet Team ${TN[G.ot][1]}`);return}
  if(!req.length){waReveal(dir);return}
  G.lr[who]=dir;sfx.pop();waSideUI();
  const vs=req.map(p=>G.lr[p]);
  if(vs.every(v=>v)&&vs.every(v=>v===vs[0]))waReveal(vs[0]);
}
function waSideUI(){
  const e=$('wlr');if(!e)return;const req=waSideReq(),vs=req.map(p=>G.lr[p]);
  const split=vs.every(v=>v)&&req.length>1&&!vs.every(v=>v===vs[0]);
  e.innerHTML=req.map(p=>`<span class="chip ${G.lr[p]?'on':''}" style="margin:2px 4px 2px 0;cursor:default">${G.lr[p]?(G.lr[p]==='L'?'◀':'▶'):'⏳'} ${esc(S.P[p])}</span>`).join('')+`<div class="sm" style="margin-top:6px">${split?'⚠️ Noch nicht einig – wer umentscheidet, tippt die andere Seite.':'Alle im Team müssen dieselbe Seite wählen.'}</div>`;
}
function waReveal(dir){
  const diff=Math.abs(G.guess-G.target),pts=diff<=4?4:diff<=9?3:diff<=15?2:0;
  G.pts[G.e]+=pts;
  let bonus='';
  if(dir){const right=dir==='L'?G.target<G.guess:G.target>G.guess;if(right&&diff>0){G.pts[G.ot]++;bonus=`<p style="margin:8px 0 0">Team ${TN[G.ot][0]} ${TN[G.ot][1]} lag richtig: <b style="color:var(--ok)">+1 Bonus</b></p>`}else bonus=`<p style="margin:8px 0 0" class="sm">Bonus-Tipp daneben.</p>`}
  const last=G.t+1>=G.plan.length;
  const msg=pts===4?'🎯 Volltreffer!':pts===3?'🔥 Richtig nah!':pts===2?'👍 In der Gegend':'😅 Daneben';
  scr(`${prg(G.t+1,G.plan.length,`Hinweis ${G.t+1} von ${G.plan.length}`)}<div class="card">${specBar({target:G.target,guess:G.guess})}
  <div class="legend"><span><i style="background:#ffc83d"></i>4</span><span><i style="background:rgba(255,255,255,.7)"></i>3</span><span><i style="background:rgba(255,255,255,.35)"></i>2</span><span><i class="gl"></i>Tipp</span></div></div>
  <div class="card ans"><div class="big">${msg}</div><div class="num" style="font-size:54px;font-weight:900;color:${pts?'var(--ok)':'var(--mu)'}">+${pts}</div><p style="margin:0">für ${G.team?'Team '+TN[G.e][1]:esc(S.P[G.a])}</p>${bonus}</div>
  ${boardHTML(G.pts)}<button onclick="${last?'finish()':'G.t++;waHand()'}">${last?'Endergebnis 🏆':'Nächster Hinweis'}</button>`);
  if(pts>=3){confetti(pts===4?150:70,GOLD);sfx.win()}else if(pts===0){flash('radial-gradient(circle,rgba(120,120,160,.4),transparent 70%)');sfx.bad()}else sfx.ok();
}

