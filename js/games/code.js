/* ---------- Codeknacker ---------- */
const CKC=['🔴','🟠','🟡','🟢','🔵','🟣'];
OPT.code={rounds:1};
GAMES.code={name:'Codeknacker',e:'🔐',tag:'Knack den Farbcode',c:['#14b8a6','#2563eb'],min:1,teams:false,
  desc:'Ein geheimer Code aus vier Farben – knacke ihn mit möglichst wenigen Versuchen.',
  rules:'Der Computer wählt einen geheimen Code aus <b>4 Farben</b> (Farben dürfen doppelt vorkommen). Du hast <b>10 Versuche</b>. Nach jedem Versuch zeigen Stifte: <b>schwarz</b> = richtige Farbe an der richtigen Stelle, <b>weiß</b> = richtige Farbe an falscher Stelle. Jeder Spieler knackt reihum seinen eigenen Code; es zählt die Zahl der Versuche (nicht geknackt = 11). Wer in der Summe am wenigsten braucht, gewinnt.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Codes pro Spieler</p>${seg('code','rounds',[1,2,3])}`,
  start:ckStart};
function ckStart(){G.n=S.P.length;G.rounds=G.o.rounds;G.k=0;ckNext()}
function ckProg(){return prg(G.k,G.rounds*G.n,`Code ${G.k+1} von ${G.rounds*G.n}`)}
function ckNext(){
  if(G.k>=G.rounds*G.n){finish({asc:true,unit:' Versuche'});return}
  G.who=G.k%G.n;G.sec=Array.from({length:4},()=>Math.floor(Math.random()*6));G.hist=[];G.gu=[];
  if(G.n>1)hand(G.who,'Knacke den geheimen Farbcode – du hast 10 Versuche.',ckScreen,ckProg());
  else ckScreen();
}
function ckEval(g,s){
  let b=0;const gl=[],sl=[];
  g.forEach((c,i)=>{if(c===s[i])b++;else{gl.push(c);sl.push(s[i])}});
  let w=0;gl.forEach(c=>{const j=sl.indexOf(c);if(j>=0){w++;sl.splice(j,1)}});
  return {b,w};
}
const ckPegs=h=>`<span class="ckpg">${'<b class="pg b"></b>'.repeat(h.b)}${'<b class="pg w"></b>'.repeat(h.w)}${'<b class="pg"></b>'.repeat(4-h.b-h.w)}</span>`;
function ckScreen(){
  const rows=G.hist.map((h,i)=>`<div class="ckr"><span class="sm" style="width:18px">${i+1}</span>${h.g.map(c=>`<i class="ckd">${CKC[c]}</i>`).join('')}${ckPegs(h)}</div>`).join('');
  const cur=`<div class="ckr cur"><span class="sm" style="width:18px">${G.hist.length+1}</span>${[0,1,2,3].map(i=>`<i class="ckd">${G.gu[i]!=null?CKC[G.gu[i]]:'<u></u>'}</i>`).join('')}</div>`;
  scr(`${ckProg()}<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:8px">${av(G.who)}<span class="sm">${esc(S.P[G.who])} · Versuch ${G.hist.length+1} von 10</span></div>
  ${rows}${cur}
  <div class="ckpal">${CKC.map((e,c)=>`<button class="ckp kx" data-kn="${c+1}" onclick="ckPick(${c})" aria-label="Farbe ${c+1}">${e}</button>`).join('')}</div>
  <div class="row"><button class="sec" id="ckdel" onclick="ckDel()">⌫ Löschen</button><button class="ok" onclick="ckCheck()">Prüfen</button></div>
  <p class="sm" style="margin:10px 0 0"><b class="pg b"></b> richtige Farbe, richtiger Platz · <b class="pg w"></b> richtige Farbe, falscher Platz</p></div>`);
}
function ckPick(c){if(G.gu.length<4){G.gu.push(c);sfx.pop();ckScreen()}}
function ckDel(){if(G.gu.length){G.gu.pop();ckScreen()}}
function ckCheck(){
  if(G.gu.length<4){toast('Wähle erst vier Farben');vib(40);return}
  const r=ckEval(G.gu,G.sec);G.hist.push({g:G.gu.slice(),b:r.b,w:r.w});G.gu=[];
  if(r.b===4)ckDone(true);else if(G.hist.length>=10)ckDone(false);else{sfx.ok();ckScreen()}
}
function ckDone(ok){
  G.okk=ok;G.tries=G.hist.length;G.pts[G.who]+=ok?G.tries:11;
  ckResult();
}
function ckResult(){
  const last=G.k+1>=G.rounds*G.n;
  scr(`${ckProg()}<div class="card ans"><div style="font-size:46px">${G.okk?'🔓':'🔒'}</div><div class="big" style="font-size:26px">${G.okk?`${esc(S.P[G.who])} knackt den Code in ${G.tries} ${G.tries==1?'Versuch':'Versuchen'}!`:`${esc(S.P[G.who])} schafft es nicht`}</div>
  <div class="ckr" style="justify-content:center">${G.sec.map(c=>`<i class="ckd">${CKC[c]}</i>`).join('')}</div><div class="sm">So lautete der Code</div></div>
  ${boardHTML(G.pts,{label:'Versuche gesamt (weniger ist besser, nicht geknackt = 11)',unit:''})}
  <button onclick="G.k++;ckNext()">${last?'Endergebnis 🏆':'Weiter'}</button>`);
  if(G.okk){sfx.win();confetti(60,GOLD)}else sfx.bad();
}

