OPT.taboo={secs:60,rounds:2,cats:{}};
function tbCat(i,el){const k=TBCATS[i];OPT.taboo.cats[k]=!OPT.taboo.cats[k];el.classList.toggle('on')}
GAMES.taboo={name:'Tabu',e:'🚫',tag:'Erklären, ohne die Wörter zu sagen',c:['#f43f5e','#be123c'],min:2,teams:true,
  desc:'Erkläre einen Begriff, ohne ihn oder die fünf verbotenen Wörter zu sagen. Die anderen raten.',
  rules:'Wer dran ist, sieht einen Begriff und fünf <b>verbotene Wörter</b> (der Begriff selbst und Teile davon sind auch verboten). Er erklärt den Begriff mit anderen Worten, ohne Gesten-Pantomime. Wer richtig rät, wird auf „Erraten“ getippt. Sagt der Erklärer ein verbotenes Wort, ruft die Gruppe „Tabu!“ und er tippt auf 🚫. Pro Auftritt zählt <b>Treffer minus Tabus</b> (mindestens 0), dreimal darf übersprungen werden. Im Einzelmodus bekommt der Rater +1, im Teammodus punktet das Team.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Kategorien (nichts gewählt = alle)</p><div class="chips">${TBCATS.map((k,i)=>`<span class="chip ${OPT.taboo.cats[k]?'on':''}" onclick="tbCat(${i},this)">${esc(k)}</span>`).join('')}</div>
  <p class="sm" style="margin:16px 0 8px">Zeit pro Auftritt (Sekunden)</p>${seg('taboo','secs',[45,60,90])}<p class="sm" style="margin:14px 0 8px">Durchgänge (so oft erklärt jeder)</p>${seg('taboo','rounds',[1,2,3])}`,
  start:tStart};
function tPool(){
  const all=[];G.ks.forEach(k=>TBS[k].forEach(s=>all.push([k,s.split('|')])));
  G.pool=ordered(all,x=>x[1][0],'t');G.wi=0;
}
function tNext(){if(G.wi>=G.pool.length)tPool();const c=G.pool[G.wi++];mark('t',c[1][0]);return c}
function tStart(){
  G.ks=TBCATS.filter(k=>G.o.cats[k]);if(!G.ks.length)G.ks=TBCATS.slice();
  G.plan=plan(G.o.rounds);G.t=0;G.tc=S.P.map(()=>0);tPool();tHand();
}
function tHand(){
  const p=G.plan[G.t];G.a=p.a;G.e=p.e;
  const tag=G.team?`Team ${TN[G.e][0]} ${TN[G.e][1]}`:'';
  hand(G.a,`Nur ${esc(S.P[G.a])} schaut aufs Display. ${G.team?'Das Team rät, alle anderen passen auf die verbotenen Wörter auf!':'Alle anderen: raten – und „Tabu!“ rufen, wenn ein verbotenes Wort fällt.'}`,tPlay,prg(G.t,G.plan.length,`Auftritt ${G.t+1} von ${G.plan.length}`),tag);
}
function tPlay(){
  G.cor=[];G.tabu=0;G.skips=0;G.card=tNext();G.total=G.o.secs;G.end=Date.now()+G.total*1000;G.lastS=-1;
  scr(`<div class="row" style="justify-content:space-between;align-items:center;margin-top:6px"><span class="twc" style="background:rgba(53,224,161,.15);border-color:rgba(53,224,161,.5)">✓ <b id="cnt">0</b></span><span class="twc" style="background:rgba(255,46,77,.18);border-color:rgba(255,46,77,.5)">🚫 <b id="tbc">0</b></span></div>
  <div class="ringw" id="rw"><svg viewBox="0 0 120 120"><defs><linearGradient id="grd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f43f5e"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs><circle class="rbg" cx="60" cy="60" r="54"/><circle id="rg" class="rfg" cx="60" cy="60" r="54" stroke-dasharray="${PGR}" stroke-dashoffset="0" transform="rotate(-90 60 60)"/></svg><div class="rt" id="tt">${G.total}</div></div>
  <div class="word" id="w"></div>
  <div class="row"><button class="ok" style="flex:2" onclick="tOk()">✓ Erraten</button><button class="sec" style="flex:1" onclick="tTabu()">🚫 Tabu!</button></div>
  <button class="sec" id="sk" onclick="tSkip()">↷ Überspringen</button>
  <p class="sm" style="text-align:center">Sag weder den Begriff noch eines der verbotenen Wörter!</p>`);
  tDraw();clearInterval(G.iv);G.iv=setInterval(tTick,100);
}
function tDraw(){
  const w=$('w');if(!w)return;const c=G.card;
  w.innerHTML=`<small>${esc(c[0])}</small><span>${esc(c[1][0])}</span><div class="tbw">${c[1].slice(1).map(f=>`<i>${esc(f)}</i>`).join('')}</div>`;
  w.classList.remove('flipin');void w.offsetWidth;w.classList.add('flipin');
  $('cnt').textContent=G.cor.length;$('tbc').textContent=G.tabu;
  const sk=$('sk');sk.textContent=`↷ Überspringen (${3-G.skips})`;sk.style.opacity=G.skips>=3?.4:1;
}
function tTick(){
  const left=Math.max(0,(G.end-Date.now())/1000),rg=$('rg');
  if(!rg){clearInterval(G.iv);return}
  rg.setAttribute('stroke-dashoffset',PGR*(1-left/G.total));
  const c=Math.ceil(left);$('tt').textContent=c;
  if(left<=10)$('rw').classList.add('hot');
  if(left<=5&&c!==G.lastS){G.lastS=c;vib(25);sfx.tick()}
  if(left<=0)tEnd();
}
function tOk(){
  if($('pk'))return;
  G.cor.push(G.card[1][0]);vib(30);sfx.ok();
  if(G.team){confetti(26,['#35e0a1','#f43f5e','#fff']);G.card=tNext();tDraw();return}
  document.querySelector('.screen').insertAdjacentHTML('beforeend',`<div class="pk" id="pk"><div><h2>Wer hat's erraten?</h2>
  ${S.P.map((p,i)=>i===G.a?'':`<button class="opt" style="--k:${i}" onclick="tPick(${i})">${av(i)}<span>${esc(p)}</span></button>`).join('')}
  <button class="sec" onclick="tPick(-1)">Alle gemeinsam / egal</button></div></div>`);
}
function tPick(i){
  if(i>=0)G.pts[i]++;
  const pk=$('pk');if(pk)pk.remove();
  confetti(26,['#35e0a1','#f43f5e','#fff']);G.card=tNext();tDraw();
}
function tTabu(){if($('pk'))return;G.tabu++;vib([80,40,80]);sfx.bad();G.card=tNext();tDraw()}
function tSkip(){if(G.skips>=3||$('pk'))return;G.skips++;vib(10);G.card=tNext();tDraw()}
function tEnd(){
  clearInterval(G.iv);flash();sfx.bad();
  const net=Math.max(0,G.cor.length-G.tabu);G.pts[G.e]+=net;G.tc[G.a]+=G.cor.length;G.t++;
  const last=G.t>=G.plan.length;
  scr(`<div class="card ans"><div style="font-size:56px;animation:pop .6s both">⏰</div><div class="big">Zeit ist um!</div>
  <p style="margin:4px 0 10px">${G.team?'Team '+TN[G.e][1]+' ('+esc(S.P[G.a])+')':esc(S.P[G.a])}: <b style="color:var(--ok)">${G.cor.length}</b> erraten, <b style="color:var(--red2)">${G.tabu}</b> Tabu${G.tabu==1?'':'s'}</p>
  <div class="num" style="font-size:54px;font-weight:900;color:var(--ok)">+${net}</div>
  ${G.cor.length?`<div class="chips" style="justify-content:center;margin-top:12px">${G.cor.map(w=>`<span class="chip on">${esc(w)}</span>`).join('')}</div>`:'<p>Diesmal nichts – beim nächsten Mal!</p>'}</div>
  ${boardHTML(G.pts)}
  <button onclick="${last?'finish()':'tHand()'}">${last?'Endergebnis 🏆':'Nächster Auftritt'}</button>`);
  if(net>=3){confetti(100,['#f43f5e','#f97316','#fff','#35e0a1']);sfx.win()}
}

