/* ---------- Schiffe versenken ---------- */
OPT.bs={best:1,size:'klassisch',vs:'mensch',lvl:'schwer',again:'wechsel',a:0,b:1};
function bsSel(k,i){const o=OPT.bs;o[k]=i;if(o.a===o.b)o[k==='a'?'b':'a']=(i+1)%S.names.length;keepScroll(()=>gameSetup('bs'))}
const bsNm=k=>`<div class="row" style="flex-wrap:wrap">${S.names.map((n,i)=>`<button class="${OPT.bs[k]===i?'':'sec'} sg" style="flex:0 0 auto;padding:10px 14px" onclick="bsSel('${k}',${i})">${esc(n.trim()||'?')}</button>`).join('')}</div>`;
GAMES.bs={name:'Schiffe versenken',e:'🚢',tag:'Der Klassiker auf dem Gitter',c:['#0ea5e9','#1d4ed8'],min:1,teams:false,
  desc:'Versteck deine Flotte, errate die Felder des Gegners und versenke alle seine Schiffe zuerst.',
  rules:'Beide Spieler verstecken ihre Schiffe <b>heimlich</b> auf dem Gitter (nacheinander am selben Gerät, niemand schaut zu). Danach schießt ihr abwechselnd auf ein Feld des Gegners: <b>Wasser</b>, <b>Treffer</b> oder <b>Schiff versenkt</b>. Wer zuerst alle gegnerischen Schiffe versenkt, gewinnt. Mit der Einstellung „Nach Treffer nochmal“ darf man bei einem Treffer weiterschießen. Allein spielst du gegen den Computer.',
  opts:()=>{
    const o=OPT.bs,solo=S.names.length<2;if(solo)o.vs='cpu';
    let h=`<p class="sm" style="margin:0 0 8px">Spielfeld</p>${seg('bs','size',['klein','klassisch'],v=>v==='klein'?'Klein 8×8':'Klassisch 10×10')}<p class="sm" style="margin:14px 0 8px">Gewinnrunden (Best of)</p>${seg('bs','best',[1,3])}<p class="sm" style="margin:14px 0 8px">Nach einem Treffer</p>${seg('bs','again',['wechsel','nochmal'],v=>v==='wechsel'?'Gegner ist dran':'Nochmal schießen')}`;
    h+=solo?`<p class="sm" style="margin:14px 0 8px">Gegner: 🤖 Computer (du spielst allein)</p>`:`<p class="sm" style="margin:14px 0 8px">Gegner</p>${seg('bs','vs',['mensch','cpu'],v=>v==='cpu'?'🤖 Computer':'🧑 Mensch')}`;
    if(o.vs==='cpu')h+=`<p class="sm" style="margin:14px 0 8px">Schwierigkeit</p>${seg('bs','lvl',['leicht','schwer'],v=>v==='leicht'?'Leicht (zufällig)':'Schwer (jagt Treffer)')}${S.names.length>1?`<p class="sm" style="margin:14px 0 8px">Wer spielt?</p>${bsNm('a')}`:''}`;
    else if(S.names.length>2)h+=`<p class="sm" style="margin:14px 0 8px">Spieler 1</p>${bsNm('a')}<p class="sm" style="margin:14px 0 8px">Spieler 2</p>${bsNm('b')}`;
    return h;
  },
  start:bsStart};
const BSL='ABCDEFGHIJ',bsLab=(n,i)=>BSL[i%n]+(Math.floor(i/n)+1);
function bsStart(){
  const o=G.o,a=Math.min(o.a,S.P.length-1);G.cpu=false;
  if(o.vs==='cpu'||S.P.length<2){
    G.cpu=true;G.pi=[a,-1];
    G.ents=[{name:S.P[a],sub:'',emoji:'👑',av:(sz,cls)=>av(a,cls,sz)},{name:'Computer',sub:'Stufe: '+o.lvl,emoji:'🤖',av:(sz,cls)=>botAv(sz,cls)}];
  }else{
    const b=(o.b===a?(a+1)%S.P.length:Math.min(o.b,S.P.length-1));
    G.pi=[a,b];G.ents=[a,b].map(i=>({name:S.P[i],sub:'',emoji:'👑',av:(sz,cls)=>av(i,cls,sz)}));
  }
  G.n=o.size==='klein'?8:10;G.ships=o.size==='klein'?[4,3,3,2]:[5,4,3,3,2];
  G.pts=[0,0];G.need=Math.ceil(o.best/2);G.r=0;bsNew();
}
function bsNew(){
  const m=G.n*G.n;
  G.fl=[null,null];G.own=[null,null];G.sh=[Array(m).fill(0),Array(m).fill(0)];G.over=false;G.msg='';G.last=-1;G.cb=false;
  bsPlaceFor(0);
}
function bsRandPlace(){   // zufällige, überlappungsfreie Flotte: Liste {len,cells}
  const n=G.n;
  for(let tries=0;tries<200;tries++){
    const used=new Set(),out=[];let okk=true;
    for(const len of G.ships){
      let placed=false;
      for(let k=0;k<200&&!placed;k++){
        const v=Math.random()<.5,r=Math.floor(Math.random()*(v?n-len+1:n)),c=Math.floor(Math.random()*(v?n:n-len+1));
        const cells=Array.from({length:len},(_,i)=>(r+(v?i:0))*n+c+(v?0:i));
        if(cells.some(x=>used.has(x)))continue;
        cells.forEach(x=>used.add(x));out.push({len,cells});placed=true;
      }
      if(!placed){okk=false;break}
    }
    if(okk)return out;
  }
  return [];
}
function bsBuild(e,placed){
  G.fl[e]=placed.map(p=>({len:p.len,cells:p.cells.slice(),hit:0,sunk:false}));
  G.own[e]=Array(G.n*G.n).fill(-1);G.fl[e].forEach((s,i)=>s.cells.forEach(c=>G.own[e][c]=i));
}
function bsNb(map,i,n){   // Nachbarn desselben Schiffs -> Klassen für zusammenhängende Schiffsform
  const s=map[i],c=i%n;
  return (c>0&&map[i-1]===s?' nl':'')+(c<n-1&&map[i+1]===s?' nr':'')+(i>=n&&map[i-n]===s?' nu':'')+(i<n*n-n&&map[i+n]===s?' nd':'');
}
function bsProg(){return `<div class="sm" style="margin:6px 0">Runde ${G.r+1} · Best of ${G.o.best}</div>`}
function bsPlaceFor(e){
  if(e>1){bsBegin();return}
  if(e===1&&G.cpu){bsBuild(1,bsRandPlace());bsBegin();return}
  G.pl={e,placed:[],dir:'h'};
  if(S.P.length>1)hand(G.pi[e],'Platziere deine Flotte – niemand schaut mit!',bsPlace,bsProg());
  else bsPlace();
}
function bsPlace(){
  const P=G.pl,n=G.n,occ=new Set(),map=Array(n*n).fill(-1);P.placed.forEach((p,k)=>p.cells.forEach(c=>{occ.add(c);map[c]=k}));
  const left=G.ships.length-P.placed.length;
  let grid='<div></div>'+Array.from({length:n},(_,c)=>`<div class="bl">${BSL[c]}</div>`).join('');
  for(let r=0;r<n;r++){grid+=`<div class="bl">${r+1}</div>`;for(let c=0;c<n;c++){const i=r*n+c;grid+=`<button class="bc kx ${occ.has(i)?'sx sp'+bsNb(map,i,n):''}" onclick="bsPut(${r},${c})" aria-label="${bsLab(n,i)}"></button>`}}
  scr(`${bsProg()}<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:8px">${av(G.pi[P.e])}<span class="sm">${esc(S.P[G.pi[P.e]])} platziert die Flotte</span></div>
  <div class="bsf" style="margin-bottom:10px">${G.ships.map((l,i)=>`<span class="fl ${i<P.placed.length?'ok':''}">${'<i></i>'.repeat(l)}</span>`).join('')}</div>
  <p class="sm" style="margin:0 0 8px">${left?`Tippe auf das Startfeld für das Schiff mit ${G.ships[P.placed.length]} Feldern (es liegt ${P.dir==='h'?'nach rechts':'nach unten'}).`:'Alle Schiffe liegen. Prüfe die Flotte und tippe auf „Fertig“.'}</p>
  <div class="bsg" style="--n:${n}">${grid}</div>
  <div class="row"><button class="sec" onclick="bsDir()">${P.dir==='h'?'↔ Quer':'↕ Hoch'}</button><button class="sec" onclick="bsUndo()">↶ Zurück</button><button class="sec" onclick="bsRnd()">🎲 Zufällig</button></div>
  <button class="ok" onclick="bsDone()">Fertig ✓</button></div>`);
}
function bsDir(){G.pl.dir=G.pl.dir==='h'?'v':'h';bsPlace()}
function bsUndo(){G.pl.placed.pop();bsPlace()}
function bsRnd(){G.pl.placed=bsRandPlace();bsPlace()}
function bsPut(r,c){
  const P=G.pl,n=G.n;if(P.placed.length>=G.ships.length){toast('Alle Schiffe liegen schon');return}
  const len=G.ships[P.placed.length],v=P.dir==='v';
  if((v?r+len:c+len)>n){toast('Das Schiff passt dort nicht hin');vib(40);return}
  const cells=Array.from({length:len},(_,i)=>(r+(v?i:0))*n+c+(v?0:i)),occ=new Set();P.placed.forEach(p=>p.cells.forEach(x=>occ.add(x)));
  if(cells.some(x=>occ.has(x))){toast('Dort liegt schon ein Schiff');vib(40);return}
  P.placed.push({len,cells});sfx.pop();bsPlace();
}
function bsDone(){
  const P=G.pl;if(P.placed.length<G.ships.length){toast('Platziere erst alle Schiffe');vib(40);return}
  bsBuild(P.e,P.placed);bsPlaceFor(P.e+1);
}
function bsBegin(){G.t=G.r%2;bsTurn()}
function bsSunkAll(e){return G.fl[e].every(s=>s.sunk)}
function bsTurn(){
  const n=G.n,t=G.t,e=1-t,lock=G.over||(G.cpu&&t===1);
  let grid='<div></div>'+Array.from({length:n},(_,c)=>`<div class="bl">${BSL[c]}</div>`).join('');
  for(let r=0;r<n;r++){grid+=`<div class="bl">${r+1}</div>`;for(let c=0;c<n;c++){
    const i=r*n+c,v=G.sh[e][i],si=G.own[e][i],sunk=v===2&&si>=0&&G.fl[e][si].sunk,rev=G.over&&v!==2&&si>=0;
    grid+=`<button class="bc kx ${v===1?'m':v===2&&!sunk?'h':''} ${sunk?'sx sk'+bsNb(G.own[e],i,n):rev?'sx sp'+bsNb(G.own[e],i,n):''} ${G.last===i?'lst':''}" ${v||lock?'disabled':''} onclick="bsShoot(${i})" aria-label="${bsLab(n,i)}">${v===2?(sunk?'✕':'💥'):''}</button>`}}
  const head=`<div class="c4s">${[0,1].map(x=>`<div class="c4p ${G.t===x&&!G.over?'on':''}">${G.ents[x].av(34)}<div><div class="nm">${esc(G.ents[x].name.replace(/^Team /,''))}</div><div class="sm">${G.fl[x].filter(s=>!s.sunk).length} Schiffe · ${G.pts[x]} / ${G.need}</div></div></div>`).join('')}</div>`;
  const series=G.over&&G.pts[t]>=G.need;
  const res=!G.over?'':`<div class="card ans" style="margin-top:14px"><div style="font-size:50px;animation:pop .6s both">${G.cpu&&t===1?'🤖':'🎉'}</div><div class="big">${esc(G.ents[t].name)} gewinnt ${series?'die Serie!':'die Runde!'}</div><div class="sm">Alle Schiffe versenkt · Stand ${G.pts[0]} : ${G.pts[1]}</div><button onclick="${series?"finish({unit:' Siege'})":'G.r++;bsNew()'}">${series?'Endergebnis 🏆':'Nächste Runde'}</button></div>`;
  scr(`${bsProg()}${head}
  <div class="sm" style="text-align:center;margin:8px 0">${G.over?'':`${esc(G.ents[t].name)} ${G.cpu&&t===1?'zielt …':'schießt auf das Gitter von '+esc(G.ents[e].name)}`}</div>
  ${G.msg?`<div class="bsm ${G.mc||''}">${G.msg}</div>`:''}
  <div class="bsg" style="--n:${n}">${grid}</div>
  <div class="bsf" style="margin-top:10px"><span class="sm" style="margin-right:4px">Gegnerische Flotte</span>${G.fl[e].map(s=>`<span class="fl ${s.sunk?'sk':''}">${'<i></i>'.repeat(s.len)}</span>`).join('')}</div>${res}`);
  if(!G.over&&G.cpu&&t===1&&!G.cb){G.cb=true;const g=G;setTimeout(()=>{if(G!==g||G.over)return;G.cb=false;G.cpuGo=true;bsShoot(bsCpuPick())},800)}
}
function bsApply(t,i){   // Schuss von Spieler t auf Feld i beim Gegner
  const e=1-t,si=G.own[e][i];G.last=i;
  if(si<0){G.sh[e][i]=1;return 'miss'}
  G.sh[e][i]=2;const s=G.fl[e][si];s.hit++;
  if(s.hit>=s.len){s.sunk=true;return 'sunk'}
  return 'hit';
}
function bsShoot(i){
  if(G.over||(G.cpu&&G.t===1&&!G.cpuGo))return;
  G.cpuGo=false;const t=G.t,e=1-t;if(G.sh[e][i])return;
  const res=bsApply(t,i),who=G.ents[t].name,lab=bsLab(G.n,i);
  G.mc=res;
  G.msg=res==='miss'?`${esc(who)}: ${lab} – Wasser 💧`:res==='hit'?`${esc(who)}: ${lab} – Treffer! 💥`:`${esc(who)}: ${lab} – Schiff versenkt! 🔥`;
  if(res==='miss'){sfx.pop();vib(15)}else{sfx.ok();vib([30,20,30])}
  if(bsSunkAll(e)){G.over=true;G.pts[t]++;sfx.win();confetti(80,GOLD);bsTurn();return}
  if(!(res!=='miss'&&G.o.again==='nochmal'))G.t=1-t;
  G.cb=false;bsTurn();
}
function bsCpuPick(){
  const n=G.n,sh=G.sh[0],free=[];for(let i=0;i<n*n;i++)if(!sh[i])free.push(i);
  if(G.o.lvl==='schwer'){
    const hits=[];for(let i=0;i<n*n;i++)if(sh[i]===2&&!G.fl[0][G.own[0][i]].sunk)hits.push(i);
    if(hits.length){
      const nb=new Set(),add=(r,c)=>{if(r>=0&&c>=0&&r<n&&c<n&&!sh[r*n+c])nb.add(r*n+c)};
      const hs=new Set(hits);
      hits.forEach(i=>{const r=Math.floor(i/n),c=i%n;
        const line=hs.has(i-1)&&c>0||hs.has(i+1)&&c<n-1,col=hs.has(i-n)||hs.has(i+n);
        if(line||!col){add(r,c-1);add(r,c+1)}
        if(col||!line){add(r-1,c);add(r+1,c)}
      });
      if(nb.size)return pick([...nb]);
    }
    const par=free.filter(i=>(Math.floor(i/n)+i%n)%2===0);
    if(par.length)return pick(par);
  }
  return pick(free);
}

