OPT.bluff.cats={};
function bCat(i,el){const k=BCATS[i];OPT.bluff.cats[k]=!OPT.bluff.cats[k];el.classList.toggle('on')}
GAMES.bluff={name:'Bluff',e:'🤥',tag:'Lügen erwünscht',c:['#ec4899','#8b5cf6'],min:3,teams:false,
  desc:'Eine knifflige Frage – alle erfinden eine falsche Antwort, die echte wird untergemischt. Wer fällt auf wen herein?',
  rules:'Es gibt drei Fragenarten: Wissensfragen, <b>Zitate vervollständigen</b> und <b>Wörter erklären</b> (seltene Duden-Wörter, kurz erklärt). Jeder schreibt heimlich eine möglichst glaubwürdige falsche Antwort. Danach werden alle Antworten gemischt und jeder wählt die, die er für echt hält (eigene Antworten sind ausgeblendet). <b>Echte Antwort gewählt: +2.</b> <b>Jede Stimme für deine Fälschung: +1.</b> Mit Timer: Wer beim Schreiben zu langsam ist, hat keine Fälschung im Spiel (eine schon getippte Antwort zählt). Wer beim Abstimmen zu langsam ist, gibt keine Stimme ab.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Fragenarten (nichts gewählt = alle gemischt)</p><div class="chips">${BCATS.map((k,i)=>`<span class="chip ${OPT.bluff.cats[k]?'on':''}" onclick="bCat(${i},this)">${esc(k)}</span>`).join('')}</div><p class="sm" style="margin:16px 0 8px">Runden</p>${seg('bluff','rounds',[3,5,8,12])}<p class="sm" style="margin:14px 0 8px">Zeit zum Schreiben</p>${seg('bluff','timer',[0,30,45,60,90],v=>v?v+' s':'Aus')}<p class="sm" style="margin:8px 0 0">Zum Abstimmen bleiben dann 20 Sekunden.</p>`,
  start:bStart};
const norm=t=>t.toLowerCase().replace(/[^a-z0-9äöüß]/g,'');
function bStart(){
  G.r=0;G.rounds=G.o.rounds;
  const sel=BCATS.filter(k=>G.o.cats&&G.o.cats[k]),cats=sel.length?sel:BCATS;
  const pools=cats.map(k=>ordered(BPOOL[k],q=>q[0],'b')),qs=[];   // reihum aus den gewählten Arten, damit alle vorkommen
  let guard=0;while(qs.length<G.rounds&&guard++<2000){const pl=pools[(qs.length+guard)%pools.length];if(pl.length)qs.push(pl.shift())}
  G.qs=shuffle(qs);bRound();
}
function bProg(){return prg(G.r+G.i/S.P.length,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}
function bRound(){G.q=G.qs[G.r%G.qs.length];mark('b',G.q[0]);G.fk=[];G.i=0;if(NET.host){bPar();return}hand(G.i,'Schreibe eine falsche Antwort – niemand schaut mit!',bInput,bProg())}
let BVOTE_MS=20000;   // Zeit zum Abstimmen, wenn der Timer an ist
function bInput(){
  scr(`${bProg()}<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:12px">${av(G.i)}<span class="sm">${esc(S.P[G.i])} schreibt</span>${qBtn(G.q)}</div>
  <div class="q">${esc(G.q[0])}</div>${qBox(G.q)}<input id="bt" class="txt" type="text" autocomplete="off" maxlength="60" placeholder="Deine falsche Antwort"><div class="err" id="e"></div><button onclick="bSubmit()">Abschicken</button></div>`);
  const t=$('bt');t.addEventListener('keydown',e=>{if(e.key==='Enter')bSubmit()});setTimeout(()=>t.focus(),80);
  if(G.o.timer)tmrShow(G.o.timer*1000,bTimeUp);
}
function bNextW(){G.i++;if(G.i<S.P.length)hand(G.i,'Schreibe eine falsche Antwort – niemand schaut mit!',bInput,bProg());else bPrepare()}
function bTimeUp(){
  const t=$('bt');if(!t)return;const v=t.value.trim();tmrHide();sfx.bad();vib([60,40,60]);
  if(v&&norm(v)&&norm(v)!==norm(G.q[1])){G.fk.push({pi:G.i,text:v,n:norm(v)});toast('⏰ Zeit um – deine Antwort zählt')}
  else toast('⏰ Zeit um – keine Antwort');
  bNextW();
}
function bSubmit(){
  const t=$('bt'),v=t.value.trim();
  if(!v||norm(v)===norm(G.q[1])||!norm(v)){$('e').textContent=!v?'Schreib etwas hin.':'Zu nah an der echten Antwort – lass dir was anderes einfallen!';t.classList.remove('shake');void t.offsetWidth;t.classList.add('shake');vib(80);return}
  G.fk.push({pi:G.i,text:v,n:norm(v)});tmrHide();bNextW();
}
function bBuild(){
  const map={};
  G.fk.forEach(f=>{(map[f.n]=map[f.n]||{text:f.text,real:false,authors:[]}).authors.push(f.pi)});
  G.opts=shuffle(Object.values(map).concat([{text:G.q[1],real:true,authors:[]}]));
  G.votes=[];G.i=0;
}
function bPrepare(){bBuild();hand(G.i,'Welche Antwort ist die echte?',bVote,bProg())}
// Online: alle schreiben gleichzeitig, danach stimmen alle gleichzeitig ab
function bPar(){
  parBegin({head:bProg,dur:G.o.timer?[G.o.timer*1000]:null,msg:'Alle schreiben gleichzeitig ihre falsche Antwort …',steps:[
    {k:'w',html:pi=>`<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:12px">${av(pi)}<span class="sm">${esc(S.P[pi])} schreibt</span>${qBtn(G.q)}</div>
      <div class="q">${esc(G.q[0])}</div>${qBox(G.q)}<input data-f="w" data-enter="w" class="txt" type="text" autocomplete="off" maxlength="60" placeholder="Deine falsche Antwort"><button data-sub="w">Abschicken</button></div>`,
     sub:(pi,d)=>{
       const v=String(d.f.w==null?'':d.f.w).trim().slice(0,60);
       if(!v)return 'Schreib etwas hin.';
       if(!norm(v)||norm(v)===norm(G.q[1]))return 'Zu nah an der echten Antwort – lass dir was anderes einfallen!';
       G.fk.push({pi,text:v,n:norm(v)});return true}}
  ],done:()=>{bBuild();bVotePar()}});
}
function bVotePar(){
  parBegin({head:bProg,dur:G.o.timer?[BVOTE_MS]:null,msg:'Alle wählen gleichzeitig die echte Antwort …',steps:[
    {k:'v',timeout:pi=>{G.votes[pi]=null},html:pi=>`<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:10px">${av(pi)}<span class="sm">${esc(S.P[pi])} wählt</span>${qBtn(G.q)}</div><div class="q" style="font-size:20px">${esc(G.q[0])}</div>${qBox(G.q)}
      ${G.opts.map((o,k)=>o.authors.includes(pi)?'':`<button class="opt" style="--k:${k}" data-sub="v" data-v="${k}"><span>${esc(o.text)}</span></button>`).join('')}</div>`,
     sub:(pi,d)=>{const k=Number(d.v);if(d.v==null||!Number.isInteger(k)||!G.opts[k]||G.opts[k].authors.includes(pi))return 'Ungültige Wahl.';G.votes[pi]=k;return true}}
  ],done:bResult});
}
function bVote(){
  scr(`${bProg()}<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:10px">${av(G.i)}<span class="sm">${esc(S.P[G.i])} wählt</span>${qBtn(G.q)}</div><div class="q" style="font-size:20px">${esc(G.q[0])}</div>${qBox(G.q)}
  ${G.opts.map((o,k)=>o.authors.includes(G.i)?'':`<button class="opt" style="--k:${k}" onclick="bPick(${k},this)"><span>${esc(o.text)}</span></button>`).join('')}</div>`);
  if(G.o.timer)tmrShow(BVOTE_MS,bVoteUp);
}
function bNextV(){G.i++;if(G.i<S.P.length)hand(G.i,'Welche Antwort ist die echte?',bVote,bProg());else bResult()}
function bVoteUp(){tmrHide();sfx.bad();vib([60,40,60]);G.votes[G.i]=null;toast('⏰ Zeit um – keine Stimme');bNextV()}
function bPick(k,btn){
  tmrHide();btn.classList.add('sel');vib(30);sfx.pop();document.querySelectorAll('.opt').forEach(b=>b.style.pointerEvents='none');
  setTimeout(()=>{G.votes[G.i]=k;bNextV()},400);
}
function bResult(){
  const gain=S.P.map(()=>0);
  G.votes.forEach((k,vi)=>{const o=k==null?null:G.opts[k];if(!o)return;if(o.real)gain[vi]+=2;else o.authors.forEach(a=>gain[a]++)});
  const nv=S.P.map((_,i)=>i).filter(i=>G.votes[i]==null),nw=S.P.map((_,i)=>i).filter(i=>!G.fk.some(f=>f.pi===i));
  gain.forEach((g,i)=>G.pts[i]+=g);
  const last=G.r+1>=G.rounds;
  const order=G.opts.map((o,k)=>k).sort((a,b)=>(G.opts[b].real?1:0)-(G.opts[a].real?1:0));
  scr(`${prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}<div class="card"><div class="q" style="font-size:19px">${esc(G.q[0])}</div></div>
  ${order.map((k,j)=>{const o=G.opts[k],vs=G.votes.map((v,i)=>v===k?i:-1).filter(i=>i>=0);
    return `<div class="res ${o.real?'best':''}" style="--d:${(.3+j*.5).toFixed(2)}s"><div class="rh"><div class="nm" style="font-size:18px">${esc(o.text)}${o.real?'<span class="tag b">✓ ECHT</span>':''}</div></div>
    <div class="sm" style="margin-top:6px">${o.real?'':`Erfunden von <b style="color:var(--tx)">${o.authors.map(a=>esc(S.P[a])).join(', ')}</b><br>`}Gewählt von: ${vs.length?vs.map(i=>esc(S.P[i])).join(', '):'niemandem'}</div></div>`}).join('')}
  <div class="late" style="--d:${.3+order.length*.5+.3}s">${G.o.drink?drinkBox(bDrink()):''}${nw.length?`<p class="sm" style="margin:0 0 6px">⏰ Keine Antwort geschrieben: ${nw.map(i=>esc(S.P[i])).join(', ')}</p>`:''}${nv.length?`<p class="sm" style="margin:0 0 6px">⏰ Keine Stimme abgegeben: ${nv.map(i=>esc(S.P[i])).join(', ')}</p>`:''}${S.P.map((p,i)=>gain[i]?`<span class="tag t" style="margin:2px 4px 2px 0">${esc(p)} +${gain[i]}</span>`:'').join('')}${boardHTML(G.pts)}<button onclick="${last?'finish()':'G.r++;bRound()'}">${last?'Endergebnis 🏆':'Nächste Frage'}</button></div>`);
  setTimeout(()=>{confetti(60,GOLD);sfx.ok()},400);
}

