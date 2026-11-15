/* ================= Klassiker (Memory, Galgenmännchen, Codeknacker, Drei gewinnt, Käsekästchen, Stadt-Land-Fluss) ================= */
const hueC=i=>`hsl(${hue(i)} 85% 58%)`;
const clsHead=(extra)=>`<div class="dsp">${G.ents.map((e,i)=>`<div class="c4p ${G.cur===i&&!G.over&&!G.res?'on':''}">${e.av(30)}<div><div class="nm">${esc(e.name.replace(/^Team /,''))}</div><div class="sm">${G.pts[i]}${extra||''}</div></div></div>`).join('')}</div>`;

/* ---------- Memory ---------- */
const MEMO=['🍎','🚀','🐙','🎸','🌵','🍕','🦊','⚽','🎲','🌈','🦄','🍩','🐢','🎈','🔔','🍒'];
OPT.memo={pairs:8};
GAMES.memo={name:'Memory',e:'🃏',tag:'Paare finden',c:['#10b981','#0ea5e9'],min:1,teams:false,
  desc:'Zwei Karten aufdecken, Paare finden. Allein auf Zügen, zu mehreren auf die meisten Paare.',
  rules:'Wer dran ist, deckt zwei Karten auf. Sind sie gleich, bleiben sie liegen, es gibt ein Paar und du darfst nochmal. Sind sie verschieden, werden sie wieder umgedreht und der Nächste ist dran. Merkt euch, wo was lag! Gewonnen hat, wer die meisten Paare hat. <b>Allein</b> zählt, wie wenige Züge du brauchst.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Anzahl Kartenpaare</p>${seg('memo','pairs',[6,8,12])}`,
  start:mmStart};
function mmStart(){
  const n=G.o.pairs;
  G.cards=shuffle(shuffle(MEMO).slice(0,n).flatMap(e=>[e,e]));
  G.st=G.cards.map(()=>0);G.own=G.cards.map(()=>-1);G.open=[];G.busy=false;G.cur=0;G.moves=0;G.left=n;
  mmScreen();
}
function mmScreen(){
  const solo=S.P.length<2,cols=G.cards.length>16?6:4;
  scr(`${logo('Memory',1)}${solo?`<div class="sm" style="margin:6px 0">Züge: <b>${G.moves}</b> · Paare: <b>${G.pts[0]}</b> / ${G.pts[0]+G.left}</div>`:clsHead(' Paare')}
  <div class="sm" style="margin:4px 0;text-align:center">${solo?'Finde alle Paare mit möglichst wenigen Zügen':`${esc(S.P[G.cur])} ist dran`}</div>
  <div class="mmb" style="--cols:${cols}">${G.cards.map((e,i)=>{const s=G.st[i];return `<button class="mc kx ${s?'up':''} ${s===2?'done':''}" ${s===2&&!solo?`style="--oc:${hueC(G.own[i])}"`:''} onclick="mmFlip(${i})" aria-label="Karte ${i+1}">${s?e:'?'}</button>`}).join('')}</div>`);
}
function mmFlip(i){
  if(G.busy||G.st[i]!==0)return;
  const g=G;G.st[i]=1;G.open.push(i);sfx.pop();vib(15);
  if(G.open.length<2){mmScreen();return}
  G.moves++;
  const [a,b]=G.open;
  if(G.cards[a]===G.cards[b]){
    G.st[a]=G.st[b]=2;G.own[a]=G.own[b]=G.cur;G.pts[G.cur]++;G.open=[];G.left--;sfx.ok();vib([20,20,20]);
    mmScreen();
    if(!G.left){G.busy=true;setTimeout(()=>{if(G===g)mmEnd()},900)}
    return;
  }
  G.busy=true;mmScreen();sfx.bad();
  setTimeout(()=>{if(G!==g)return;G.st[a]=G.st[b]=0;G.open=[];G.busy=false;G.cur=(G.cur+1)%S.P.length;mmScreen()},1100);
}
function mmEnd(){S.P.length<2?finish({asc:true,vals:[G.moves],unit:' Züge'}):finish({unit:' Paare'})}

