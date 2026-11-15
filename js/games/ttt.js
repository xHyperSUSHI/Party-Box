/* ---------- Drei gewinnt ---------- */
OPT.ttt={best:3,vs:'mensch',lvl:'schwer',a:0,b:1};
function ttSel(k,i){const o=OPT.ttt;o[k]=i;if(o.a===o.b)o[k==='a'?'b':'a']=(i+1)%S.names.length;gameSetup('ttt')}
const ttNm=k=>`<div class="row" style="flex-wrap:wrap">${S.names.map((n,i)=>`<button class="${OPT.ttt[k]===i?'':'sec'} sg" style="flex:0 0 auto;padding:10px 14px" onclick="ttSel('${k}',${i})">${esc(n.trim()||'?')}</button>`).join('')}</div>`;
GAMES.ttt={name:'Drei gewinnt',e:'❌',tag:'Der Schulhof-Klassiker',c:['#f43f5e','#f97316'],min:1,teams:false,
  desc:'Tic-Tac-Toe: Drei in einer Reihe gewinnt. Gegen einen Freund oder den Computer.',
  rules:'Abwechselnd setzt ihr ✕ und ◯ auf ein 3×3-Feld. Wer zuerst <b>drei</b> eigene Zeichen in einer Reihe hat (waagerecht, senkrecht oder diagonal), gewinnt die Runde. Gespielt wird auf mehrere Gewinnrunden („Best of“); bei Unentschieden wird die Runde wiederholt. Der Startspieler wechselt jede Runde. Allein spielst du gegen den Computer.',
  opts:()=>{
    const o=OPT.ttt,solo=S.names.length<2;if(solo)o.vs='cpu';
    let h=`<p class="sm" style="margin:0 0 8px">Gewinnrunden (Best of)</p>${seg('ttt','best',[1,3,5])}`;
    h+=solo?`<p class="sm" style="margin:14px 0 8px">Gegner: 🤖 Computer (du spielst allein)</p>`:`<p class="sm" style="margin:14px 0 8px">Gegner</p>${seg('ttt','vs',['mensch','cpu'],v=>v==='cpu'?'🤖 Computer':'🧑 Mensch')}`;
    if(o.vs==='cpu')h+=`<p class="sm" style="margin:14px 0 8px">Schwierigkeit</p>${seg('ttt','lvl',['leicht','schwer'],v=>v==='leicht'?'Leicht':'Schwer (unschlagbar)')}${S.names.length>1?`<p class="sm" style="margin:14px 0 8px">Wer spielt?</p>${ttNm('a')}`:''}`;
    else if(S.names.length>2)h+=`<p class="sm" style="margin:14px 0 8px">Spieler ✕</p>${ttNm('a')}<p class="sm" style="margin:14px 0 8px">Spieler ◯</p>${ttNm('b')}`;
    return h;
  },
  start:ttStart};
function ttStart(){
  const o=G.o,a=Math.min(o.a,S.P.length-1);G.cpu=false;
  if(o.vs==='cpu'||S.P.length<2){
    G.cpu=true;G.pi=[a,-1];
    G.ents=[{name:S.P[a],sub:'',emoji:'👑',av:(sz,cls)=>av(a,cls,sz)},{name:'Computer',sub:'Stufe: '+o.lvl,emoji:'🤖',av:(sz,cls)=>botAv(sz,cls)}];
  }else{
    const b=(o.b===a?(a+1)%S.P.length:Math.min(o.b,S.P.length-1));
    G.pi=[a,b];G.ents=[a,b].map(i=>({name:S.P[i],sub:'',emoji:'👑',av:(sz,cls)=>av(i,cls,sz)}));
  }
  G.pts=[0,0];G.need=Math.ceil(o.best/2);G.r=0;ttNew();
}
const TTL=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const ttLine=b=>TTL.find(l=>b[l[0]]&&b[l[0]]===b[l[1]]&&b[l[0]]===b[l[2]])||null;
function ttMM(b,p,me,d){
  const l=ttLine(b);if(l)return b[l[0]]===me?10-d:d-10;
  if(b.every(Boolean))return 0;
  let best=p===me?-99:99;
  for(let i=0;i<9;i++)if(!b[i]){b[i]=p;const v=ttMM(b,3-p,me,d+1);b[i]=0;best=p===me?Math.max(best,v):Math.min(best,v)}
  return best;
}
function ttBest(b,me,lvl){
  const mv=[];for(let i=0;i<9;i++)if(!b[i])mv.push(i);
  if(lvl==='leicht'&&Math.random()<.45)return pick(mv);
  let best=-99,cand=[];
  mv.forEach(i=>{b[i]=me;const v=ttMM(b,3-me,me,1);b[i]=0;if(v>best){best=v;cand=[i]}else if(v===best)cand.push(i)});
  return pick(cand);
}
function ttNew(){
  G.bd=Array(9).fill(0);G.turn=G.r%2;G.over=false;G.win=null;G.draw=false;
  ttScreen();
  if(G.cpu&&G.turn===1)ttCpuSoon();
}
function ttCpuSoon(){const g=G;setTimeout(()=>{if(G!==g||G.over)return;ttMove(ttBest(G.bd,2,G.o.lvl))},650)}
function ttScreen(){
  const lock=G.over||(G.cpu&&G.turn===1),series=G.over&&!G.draw&&G.pts[G.turn]>=G.need;
  const head=`<div class="c4s">${[0,1].map(e=>`<div class="c4p ${G.turn===e&&!G.over?'on':''}">${G.ents[e].av(34)}<div><div class="nm">${esc(G.ents[e].name.replace(/^Team /,''))}</div><div class="sm"><b class="sy s${e+1}">${e?'◯':'✕'}</b> ${G.pts[e]} / ${G.need}</div></div></div>`).join('')}</div>`;
  const res=!G.over?'':G.draw
    ?`<div class="card ans" style="margin-top:14px"><div style="font-size:50px">🤝</div><div class="big">Unentschieden!</div><p>Diese Runde wird wiederholt.</p><button onclick="ttNew()">Nochmal</button></div>`
    :`<div class="card ans" style="margin-top:14px"><div style="font-size:50px;animation:pop .6s both">${G.cpu&&G.turn===1?'🤖':'🎉'}</div><div class="big">${esc(G.ents[G.turn].name)} gewinnt ${series?'die Serie!':'die Runde!'}</div><div class="sm">Stand ${G.pts[0]} : ${G.pts[1]}</div><button onclick="${series?"finish({unit:' Siege'})":'G.r++;ttNew()'}">${series?'Endergebnis 🏆':'Nächste Runde'}</button></div>`;
  scr(`<div class="sm" style="margin:6px 0">Runde ${G.r+1} · Best of ${G.o.best}</div>${head}
  <div class="sm" style="text-align:center;margin:8px 0">${G.over?'':`${esc(G.ents[G.turn].name)} ${G.cpu&&G.turn===1?'denkt …':'ist dran'}`}</div>
  <div class="ttb">${G.bd.map((v,i)=>`<button class="ttc kx ${v?'s'+v:''} ${G.win&&G.win.includes(i)?'win':''}" data-kn="${i+1}" ${v||lock?'disabled':''} onclick="ttPlay(${i})" aria-label="Feld ${i+1}">${v===1?'✕':v===2?'◯':''}</button>`).join('')}</div>${res}`);
}
function ttPlay(i){if(G.over||G.bd[i]||(G.cpu&&G.turn===1))return;ttMove(i)}
function ttMove(i){
  if(G.over||G.bd[i])return;
  G.bd[i]=G.turn+1;sfx.pop();vib(15);
  const l=ttLine(G.bd);
  if(l){G.over=true;G.win=l;G.pts[G.turn]++;sfx.win();confetti(60,GOLD)}
  else if(G.bd.every(Boolean)){G.over=true;G.draw=true;sfx.bad()}
  else G.turn=1-G.turn;
  ttScreen();
  if(!G.over&&G.cpu&&G.turn===1)ttCpuSoon();
}

