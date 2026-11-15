/* ================= 4 Gewinnt ================= */
OPT.c4={vs:'mensch',lvl:'mittel',best:3,a:0,b:1};
const nmSel=(k)=>`<div class="row" style="flex-wrap:wrap">${S.names.map((n,i)=>`<button class="${OPT.c4[k]===i?'':'sec'} sg" style="flex:0 0 auto;padding:10px 14px" onclick="c4Sel('${k}',${i})">${esc(n.trim()||'?')}</button>`).join('')}</div>`;
function c4Sel(k,i){OPT.c4[k]=i;if(OPT.c4.a===OPT.c4.b)OPT.c4[k==='a'?'b':'a']=(i+1)%S.names.length;gameSetup('c4')}
GAMES.c4={name:'4 Gewinnt',e:'🔴',tag:'Der Duell-Klassiker',c:['#3b82f6','#1d4ed8'],min:1,teams:true,nt2:true,
  desc:'Wirf abwechselnd Steine ein und bring vier in eine Reihe – waagerecht, senkrecht oder diagonal.',
  rules:'Tippe auf eine Spalte, der Stein fällt ganz nach unten. Wer zuerst vier eigene Steine in einer Reihe hat, gewinnt die Runde. Gespielt wird auf mehrere Gewinnrunden („Best of“). Der Startspieler wechselt jede Runde. Im Teammodus spielen zwei Teams gegeneinander, die Mitglieder wechseln sich ab. Gegen den Computer gibt es drei Stufen.',
  opts:()=>{
    const team=teamOn(),o=OPT.c4;
    let h=`<p class="sm" style="margin:0 0 8px">Gewinnrunden (Best of)</p>${seg('c4','best',[1,3,5])}`;
    if(team)return h+`<p class="sm" style="margin-top:14px">Zwei Teams treten gegeneinander an.</p>`;
    const solo=S.names.length<2;if(solo)o.vs='cpu';   // allein spielt man gegen den Computer
    h+=solo?`<p class="sm" style="margin:14px 0 8px">Gegner: 🤖 Computer (du spielst allein)</p>`:`<p class="sm" style="margin:14px 0 8px">Gegner</p>${seg('c4','vs',['mensch','cpu'],v=>v==='cpu'?'🤖 Computer':'🧑 Mensch')}`;
    if(o.vs==='cpu')h+=`<p class="sm" style="margin:14px 0 8px">Schwierigkeit</p>${seg('c4','lvl',['leicht','mittel','schwer'],v=>({leicht:'Leicht',mittel:'Mittel',schwer:'Schwer'})[v])}<p class="sm" style="margin:14px 0 8px">Wer spielt?</p>${nmSel('a')}`;
    else if(S.names.length>2)h+=`<p class="sm" style="margin:14px 0 8px">Spieler 🔴</p>${nmSel('a')}<p class="sm" style="margin:14px 0 8px">Spieler 🟡</p>${nmSel('b')}`;
    return h;
  },
  start:c4Start};
const botAv=(sz,cls)=>`<div class="av ${cls||''}" style="${sz?`width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.5)}px;`:''}background:linear-gradient(135deg,#64748b,#334155)">🤖</div>`;
const C4D=[[0,1],[1,0],[1,1],[1,-1]];
const c4Rows=6,c4Cols=7;
function c4Line(b,r,c){
  const p=b[r][c];if(!p)return null;
  for(const [dr,dc] of C4D){
    const cells=[[r,c]];
    for(const s of [1,-1]){let rr=r+dr*s,cc=c+dc*s;while(rr>=0&&rr<c4Rows&&cc>=0&&cc<c4Cols&&b[rr][cc]===p){cells.push([rr,cc]);rr+=dr*s;cc+=dc*s}}
    if(cells.length>=4)return cells;
  }
  return null;
}
function c4Win(b,r,c){
  const p=b[r][c];
  for(const [dr,dc] of C4D){
    let n=1;
    for(const s of [1,-1]){let rr=r+dr*s,cc=c+dc*s;while(rr>=0&&rr<c4Rows&&cc>=0&&cc<c4Cols&&b[rr][cc]===p){n++;rr+=dr*s;cc+=dc*s}}
    if(n>=4)return true;
  }
  return false;
}
const c4Moves=b=>[3,2,4,1,5,0,6].filter(c=>b[0][c]===0);
function c4Put(b,c,p){for(let r=c4Rows-1;r>=0;r--)if(b[r][c]===0){b[r][c]=p;return r}return -1}
function c4Eval(b,p){
  let s=0;const o=3-p;
  for(let r=0;r<c4Rows;r++)if(b[r][3]===p)s+=3;else if(b[r][3]===o)s-=3;
  for(let r=0;r<c4Rows;r++)for(let c=0;c<c4Cols;c++)for(const [dr,dc] of C4D){
    const er=r+dr*3,ec=c+dc*3;if(er<0||er>=c4Rows||ec<0||ec>=c4Cols)continue;
    let mine=0,theirs=0;
    for(let k=0;k<4;k++){const v=b[r+dr*k][c+dc*k];if(v===p)mine++;else if(v===o)theirs++}
    if(mine&&theirs)continue;
    if(mine===3)s+=5;else if(mine===2)s+=2;
    if(theirs===3)s-=6;else if(theirs===2)s-=2;
  }
  return s;
}
function c4Nega(b,d,al,be,p){
  const mv=c4Moves(b);if(!mv.length)return 0;
  if(d===0)return c4Eval(b,p);
  let best=-Infinity;
  for(const c of mv){
    const r=c4Put(b,c,p);
    const v=c4Win(b,r,c)?1e6+d:-c4Nega(b,d-1,-be,-al,3-p);
    b[r][c]=0;
    if(v>best)best=v;if(best>al)al=best;if(al>=be)break;
  }
  return best;
}
function c4Cpu(b,level){
  const mv=c4Moves(b);
  if(level==='leicht'&&Math.random()<.35)return pick(mv);
  const depth={leicht:2,mittel:4,schwer:6}[level]||4;
  let best=-Infinity,bc=mv[0];
  for(const c of mv){
    const r=c4Put(b,c,2);
    let v=c4Win(b,r,c)?1e6+99:-c4Nega(b,depth-1,-Infinity,Infinity,1);
    b[r][c]=0;v+=Math.random()*.4;
    if(v>best){best=v;bc=c}
  }
  return bc;
}

function c4Start(){
  const o=G.o;G.cpu=false;
  if(!G.team){
    const a=Math.min(o.a,S.P.length-1);
    if(o.vs==='cpu'||S.P.length<2){
      G.cpu=true;
      G.pi=[a,-1];
      G.ents=[{name:S.P[a],sub:'',emoji:'👑',av:(sz,cls)=>av(a,cls,sz)},{name:'Computer',sub:'Stufe: '+o.lvl,emoji:'🤖',av:(sz,cls)=>botAv(sz,cls)}];
    }else{
      const b=(o.b===a?(a+1)%S.P.length:Math.min(o.b,S.P.length-1));
      G.pi=[a,b];
      G.ents=[a,b].map(i=>({name:S.P[i],sub:'',emoji:'👑',av:(sz,cls)=>av(i,cls,sz)}));
    }
    G.pts=[0,0];
  }
  G.need=Math.ceil(o.best/2);G.r=0;G.ix=[0,0];c4Round();
}
function c4Mover(e){
  if(G.team){const tm=G.tm[e],i=tm[G.ix[e]++%tm.length];G.mi=i;return S.P[i]}
  G.mi=(G.pi&&G.pi[e]>=0)?G.pi[e]:0;return G.ents[e].name;
}
function c4Round(){
  G.bd=Array.from({length:c4Rows},()=>Array(c4Cols).fill(0));
  G.turn=G.r%2;G.over=false;G.busy=false;G.last=null;G.winCells=null;
  G.mover=c4Mover(G.turn);
  c4Screen();
  if(G.cpu&&G.turn===1)c4CpuMove();
}
function c4Board(){
  let h='';
  for(let c=0;c<c4Cols;c++){
    h+=`<div class="c4col">`;
    for(let r=0;r<c4Rows;r++){
      const v=G.bd[r][c],isLast=G.last&&G.last[0]===r&&G.last[1]===c,isWin=G.winCells&&G.winCells.some(x=>x[0]===r&&x[1]===c);
      h+=`<div class="c4c">${v?`<i class="d p${v}${isLast?' drop':''}${isWin?' win':''}" style="--f:${r+1}"></i>`:''}</div>`;
    }
    h+='</div>';
  }
  return h;
}
function c4Banner(){
  const e=G.turn,who=G.team?`${TN[e][0]} Team ${TN[e][1]} · ${esc(G.mover)}`:esc(G.ents[e].name);
  return `<i class="dot p${e+1}"></i><span>${who} ${G.cpu&&e===1?'denkt …':'ist dran'}</span>`;
}
function c4Head(){
  return `<div class="c4s">${[0,1].map(e=>`<div class="c4p ${G.turn===e&&!G.over?'on':''}" id="c4p${e}">${G.ents[e].av(34)}<div><div class="nm">${esc(G.ents[e].name.replace(/^Team /,''))}</div><div class="sm"><i class="dot p${e+1}"></i> ${G.pts[e]} / ${G.need}</div></div></div>`).join('')}</div>`;
}
function c4Screen(){
  scr(`<div class="sm" style="margin:6px 0">Runde ${G.r+1} · Best of ${G.o.best}</div>${c4Head()}<div class="c4turn" id="c4t">${c4Banner()}</div><div class="c4b" id="c4b" data-ptr="1" data-t="${G.turn}">${c4Board()}</div><div id="c4r"></div>`);
  c4Bind();
}
/* Wischen: Finger aufsetzen, Spalte per Wischen wechseln, loslassen = Stein fällt */
function c4Col(x){
  const b=$('c4b'),r=b.getBoundingClientRect(),pad=10,gap=6,w=(r.width-2*pad-6*gap)/c4Cols;
  return Math.max(0,Math.min(c4Cols-1,Math.floor((x-r.left-pad+gap/2)/(w+gap))));
}
function c4Hov(c){document.querySelectorAll('#c4b .c4col').forEach((el,i)=>el.classList.toggle('hv',i===c))}
function c4Bind(){
  const b=$('c4b');if(!b)return;
  b.addEventListener('pointerdown',e=>{
    if(G.busy||G.over)return;
    G.dn=true;try{b.setPointerCapture(e.pointerId)}catch(_){}
    c4Hov(c4Col(e.clientX));e.preventDefault();
  });
  b.addEventListener('pointermove',e=>{if(G.dn)c4Hov(c4Col(e.clientX))});
  b.addEventListener('pointerup',e=>{if(!G.dn)return;G.dn=false;const c=c4Col(e.clientX);c4Hov(-1);c4Drop(c)});
  b.addEventListener('pointercancel',()=>{G.dn=false;c4Hov(-1)});
}
function c4Drop(c){
  if(G.busy||G.over)return;
  const r=c4Put(G.bd,c,G.turn+1);
  if(r<0){vib(40);sfx.bad();return}
  G.last=[r,c];sfx.pop();vib(15);
  const line=c4Line(G.bd,r,c);
  $('c4b').innerHTML=c4Board();
  if(line){G.over=true;G.winCells=line;G.busy=true;setTimeout(()=>{$('c4b')&&($('c4b').innerHTML=c4Board());c4Won(G.turn)},650);return}
  if(!c4Moves(G.bd).length){G.over=true;setTimeout(c4Draw,500);return}
  G.turn=1-G.turn;G.mover=c4Mover(G.turn);
  const bd=$('c4b');if(bd)bd.setAttribute('data-t',G.turn);
  const t=$('c4t');if(t)t.innerHTML=c4Banner();
  [0,1].forEach(e=>{const el=$('c4p'+e);if(el)el.classList.toggle('on',G.turn===e)});
  if(G.cpu&&G.turn===1)c4CpuMove();
}
function c4CpuMove(){
  G.busy=true;
  setTimeout(()=>{
    if(!$('c4b'))return;
    const c=c4Cpu(G.bd.map(r=>r.slice()),G.o.lvl);
    G.busy=false;c4Drop(c);
  },G.o.lvl==='schwer'?700:520);
}
function c4Won(e){
  G.pts[e]++;G.busy=false;
  const series=G.pts[e]>=G.need;
  const botWin=G.cpu&&e===1;
  if(botWin)sfx.bad();else{confetti(series?160:80,GOLD);sfx.win()}
  const name=G.team?`Team ${TN[e][1]}`:G.ents[e].name;
  const r=$('c4r');if(!r)return;
  r.innerHTML=`<div class="card ans" style="margin-top:14px"><div style="font-size:50px;animation:pop .6s both">${botWin?'🤖':'🎉'}</div><div class="big">${esc(name)} gewinnt${series?' die Serie!':' die Runde!'}</div><div class="sm">Stand ${G.pts[0]} : ${G.pts[1]}</div><button onclick="${series?'finish({unit:\' Siege\'})':'G.r++;c4Round()'}">${series?'Endergebnis 🏆':'Nächste Runde'}</button></div>`;
  [0,1].forEach(i=>{const el=$('c4p'+i);if(el)el.classList.remove('on')});
  r.scrollIntoView&&r.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function c4Draw(){
  sfx.ok();
  const r=$('c4r');if(!r)return;
  r.innerHTML=`<div class="card ans" style="margin-top:14px"><div style="font-size:50px">🤝</div><div class="big">Unentschieden!</div><p>Das Brett ist voll. Diese Runde wird wiederholt.</p><button onclick="c4Round()">Nochmal</button></div>`;
}

