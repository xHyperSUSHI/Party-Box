/* ================= Pantomime ================= */
const PGR=339.29;
GAMES.pant={name:'Pantomime',e:'🎭',tag:'Vorspielen, raten, lachen',c:['#8f6cff','#3f7bff'],min:2,teams:true,
  desc:'Einer spielt vor – ohne Worte und Geräusche. Die anderen raten. Vorher wartet ein zufälliger Twist.',
  rules:'Wer dran ist, zieht einen Twist (manche geben Bonuspunkte) und sieht Begriffe auf dem Display. Er spielt sie ohne Sprechen vor. Wer richtig rät, wird auf „Erraten“ getippt. Im Einzelmodus bekommen Rater und Vorspieler je 1 Punkt (Vorspieler mit Twist-Faktor). Im Teammodus rät das ganze Team, die Punkte gehen ans Team. Überspringen: dreimal pro Auftritt.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Kategorien (nichts gewählt = alle)</p><div class="chips">${Object.keys(PW).map(k=>`<span class="chip ${OPT.pant.cats[k]?'on':''}" onclick="OPT.pant.cats['${k}']=!OPT.pant.cats['${k}'];this.classList.toggle('on')">${k}</span>`).join('')}</div>
  <p class="sm" style="margin:16px 0 8px">Zeit pro Auftritt (Sekunden)</p>${seg('pant','secs',[30,60,90])}
  <p class="sm" style="margin:14px 0 8px">Durchgänge (so oft spielt jeder vor)</p>${seg('pant','rounds',[1,2,3])}`,
  start:pStart};
function pBuildPool(){
  const all=[];
  G.ks.forEach(k=>{if(k===MIX){const s=new Set();while(s.size<40)s.add(mixWord());s.forEach(w=>all.push([w,k]))}else PW[k].forEach(w=>all.push([w,k]))});
  G.pool=ordered(all,x=>x[0],'w');G.wi=0;
}
function nextWord(){if(G.wi>=G.pool.length)pBuildPool();const w=G.pool[G.wi++];mark('w',w[0]);return w}
function pStart(){
  G.ks=Object.keys(PW).filter(k=>G.o.cats[k]);if(!G.ks.length)G.ks=Object.keys(PW);
  G.plan=plan(G.o.rounds);G.t=0;pBuildPool();pHand();
}
function pHand(){
  const p=G.plan[G.t];G.a=p.a;G.e=p.e;
  const tag=G.team?`Team ${TN[G.e][0]} ${TN[G.e][1]}`:'';
  hand(G.a,`Nur ${esc(S.P[G.a])} schaut aufs Display. ${G.team?'Das Team rät, alle anderen schweigen!':'Alle anderen: Augen weg!'}`,pTwist,prg(G.t,G.plan.length,`Auftritt ${G.t+1} von ${G.plan.length}`),tag);
}
function pTwist(){
  const tw=pick(TW);G.tw=tw;
  scr(`<div class="card hand"><p style="margin:0">Dein Twist</p><div class="reel" id="rl">🎰</div><div class="big" id="rn">…</div><p id="rd">&nbsp;</p><div id="rb" style="min-height:70px"></div></div>`);
  const rl=$('rl'),rn=$('rn'),rd=$('rd'),rb=$('rb');let n=0;
  (function tick(){
    if(!$('rl'))return;
    const r=pick(TW);
    if(++n<17){rl.textContent=r[0];rn.textContent=r[1];sfx.tick();vib(8);setTimeout(tick,50+n*n*1.6)}
    else{
      rl.textContent=tw[0];rn.textContent=tw[1];rl.classList.add('hit');
      rd.textContent=tw[2]+(tw[3]>1?` Punkte ×${tw[3]}!`:'');
      rb.innerHTML=`<button onclick="pPlay()">Start – die Zeit läuft!</button>`;
      if(tw[3]>1){confetti(50,['#8f6cff','#3f7bff','#fff']);sfx.ok()}
      vib(40);
    }
  })();
}
function pPlay(){
  G.cor=[];G.skips=0;G.w=nextWord();G.total=Math.round(G.o.secs*G.tw[4]);G.end=Date.now()+G.total*1000;G.lastS=-1;
  scr(`<div class="row" style="justify-content:space-between;align-items:center;margin-top:6px"><span class="twc">${G.tw[0]} ${esc(G.tw[1])}${G.tw[3]>1?' ×'+G.tw[3]:''}</span><span class="twc" style="background:rgba(53,224,161,.15);border-color:rgba(53,224,161,.5)">✓ <b id="cnt">0</b></span></div>
  <div class="ringw" id="rw"><svg viewBox="0 0 120 120"><defs><linearGradient id="grd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8f6cff"/><stop offset="1" stop-color="#3f7bff"/></linearGradient></defs><circle class="rbg" cx="60" cy="60" r="54"/><circle id="rg" class="rfg" cx="60" cy="60" r="54" stroke-dasharray="${PGR}" stroke-dashoffset="0" transform="rotate(-90 60 60)"/></svg><div class="rt" id="tt">${G.total}</div></div>
  <div class="word" id="w"></div>
  <div class="row"><button class="ok" style="flex:2" onclick="pOk()">✓ Erraten</button><button class="sec" id="sk" style="flex:1" onclick="pSkip()">↷ Skip</button></div>
  <p class="sm" style="text-align:center">Nicht sprechen, nichts zeigen, was auf dem Display steht!</p>`);
  drawWord();clearInterval(G.iv);G.iv=setInterval(pTick,100);
}
function drawWord(){
  const w=$('w');if(!w)return;
  w.innerHTML=`<small>${esc(G.w[1])}</small><span>${esc(G.w[0])}</span>`;
  w.classList.remove('flipin');void w.offsetWidth;w.classList.add('flipin');
  $('cnt').textContent=G.cor.length;
  const sk=$('sk');sk.textContent=`↷ Skip (${3-G.skips})`;sk.style.opacity=G.skips>=3?.4:1;
}
function pTick(){
  const left=Math.max(0,(G.end-Date.now())/1000),rg=$('rg');
  if(!rg){clearInterval(G.iv);return}
  rg.setAttribute('stroke-dashoffset',PGR*(1-left/G.total));
  const c=Math.ceil(left);$('tt').textContent=c;
  if(left<=10)$('rw').classList.add('hot');
  if(left<=5&&c!==G.lastS){G.lastS=c;vib(25);sfx.tick()}
  if(left<=0)pEnd();
}
function pOk(){
  if($('pk'))return;
  G.cor.push(G.w[0]);vib(30);sfx.ok();
  if(G.team){confetti(26,['#35e0a1','#8f6cff','#fff']);G.w=nextWord();drawWord();return}
  document.querySelector('.screen').insertAdjacentHTML('beforeend',`<div class="pk" id="pk"><div><h2>Wer hat's erraten?</h2>
  ${S.P.map((p,i)=>i===G.a?'':`<button class="opt" style="--k:${i}" onclick="pPick(${i})">${av(i)}<span>${esc(p)}</span></button>`).join('')}
  <button class="sec" onclick="pPick(-1)">Alle gemeinsam / egal</button></div></div>`);
}
function pPick(i){
  if(i>=0)G.pts[i]++;
  const pk=$('pk');if(pk)pk.remove();
  confetti(26,['#35e0a1','#8f6cff','#fff']);G.w=nextWord();drawWord();
}
function pSkip(){if(G.skips>=3||$('pk'))return;G.skips++;vib(10);G.w=nextWord();drawWord()}
function pEnd(){
  clearInterval(G.iv);flash();sfx.bad();
  const g=G.cor.length*G.tw[3];G.pts[G.e]+=g;G.t++;
  const last=G.t>=G.plan.length;
  scr(`<div class="card ans"><div style="font-size:56px;animation:pop .6s both">⏰</div><div class="big">Zeit ist um!</div>
  <p style="margin:4px 0 10px">${G.team?'Team '+TN[G.e][1]+' ('+esc(S.P[G.a])+')':esc(S.P[G.a])} hat <b style="color:var(--ok)">${G.cor.length}</b> Begriff${G.cor.length==1?'':'e'} erspielt${G.tw[3]>1&&G.cor.length?` · ×${G.tw[3]} Twist`:''}</p>
  <div class="num" style="font-size:54px;font-weight:900;color:var(--ok)">+${g}</div>
  ${G.cor.length?`<div class="chips" style="justify-content:center;margin-top:12px">${G.cor.map(w=>`<span class="chip on">${esc(w)}</span>`).join('')}</div>`:'<p>Diesmal nichts – beim nächsten Mal!</p>'}</div>
  ${boardHTML(G.pts)}
  <button onclick="${last?'finish()':'pHand()'}">${last?'Endergebnis 🏆':'Nächster Auftritt'}</button>`);
  if(g>=3){confetti(100,['#8f6cff','#3f7bff','#fff','#35e0a1']);sfx.win()}
}

