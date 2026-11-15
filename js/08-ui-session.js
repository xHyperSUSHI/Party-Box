/* ---------- Glücksrad ---------- */
let W={};
function wheel(after,label){
  S.after=after;S.alabel=label||"Los geht's";
  W={rem:S.names.map((_,i)=>i),tm:Array.from({length:S.nt},()=>[]),k:0,busy:false};
  scr(`${logo('Glücksrad')}<p style="margin-top:0">Wer spielt zusammen? Das Rad entscheidet.</p>
  <div class="wheelw"><div class="ptr"></div><canvas id="wh" width="600" height="600"></canvas></div>
  <div class="row" id="wb"><button onclick="spin(4200)">🎡 Drehen</button><button class="sec" onclick="spinAll()">Alle auslosen</button></div>
  <div id="tms"></div><div id="wd"></div>`);
  drawWheel();renderTms();
}
function drawWheel(){
  const c=$('wh');if(!c)return;
  const x=c.getContext('2d'),R=300;x.clearRect(0,0,600,600);
  const n=W.rem.length;if(!n)return;const a=Math.PI*2/n;
  W.rem.forEach((pi,j)=>{
    x.beginPath();x.moveTo(R,R);x.arc(R,R,R-8,-Math.PI/2+j*a,-Math.PI/2+(j+1)*a);x.closePath();
    x.fillStyle=`hsl(${hue(pi)} 80% 52%)`;x.fill();x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=4;x.stroke();
    x.save();x.translate(R,R);x.rotate(-Math.PI/2+(j+.5)*a);x.fillStyle='#fff';x.font='bold 36px system-ui,sans-serif';x.textAlign='right';x.textBaseline='middle';x.shadowColor='rgba(0,0,0,.45)';x.shadowBlur=6;
    x.fillText((S.names[pi].trim()||'?').slice(0,10),R-40,0);x.restore();
  });
  x.beginPath();x.arc(R,R,38,0,7);x.fillStyle='#14161c';x.fill();x.strokeStyle='#fff';x.lineWidth=5;x.stroke();
}
function renderTms(lastT,lastP){const e=$('tms');if(e)e.innerHTML=tmList(W.tm,lastP)}
function spin(ms,cb){
  if(W.busy||!W.rem.length)return;W.busy=true;
  const n=W.rem.length,k=Math.floor(Math.random()*n),a=360/n;
  const R=360*(4+Math.floor(Math.random()*3))-(k+.5)*a+(Math.random()-.5)*a*.7;
  const c=$('wh');
  c.style.transition=`transform ${ms}ms cubic-bezier(.12,.7,.1,1)`;c.style.transform=`rotate(${R}deg)`;
  for(let i=0;i<10;i++)setTimeout(()=>sfx.tick(),ms*(1-Math.pow(1-i/10,2))*.9);
  setTimeout(()=>{
    if(!$('wh'))return;
    const pi=W.rem.splice(k,1)[0],t=W.k%W.tm.length;W.k++;W.tm[t].push(pi);
    vib([40,30,60]);sfx.ok();confetti(35,[tcol(t),'#fff']);
    c.style.transition='none';c.style.transform='rotate(0deg)';
    drawWheel();renderTms(t,pi);W.busy=false;
    if(!W.rem.length)wheelDone();else if(cb)setTimeout(cb,550);
  },ms+80);
}
function spinAll(){const go=()=>spin(2400,go);go()}
function wheelDone(){
  S.tm=W.tm.map(a=>a.slice());S.tmKey=tmKey();
  const wb=$('wb');if(wb)wb.style.display='none';
  $('wd').innerHTML=`<button onclick="S.after()">${S.alabel}</button><button class="sec" onclick="wheel(S.after,S.alabel)">Nochmal auslosen</button>`;
  confetti(140,GOLD);sfx.win();vib([50,50,50,50,200]);
}

/* ---------- Spiel-Session ---------- */
function startSession(id){
  const d=GAMES[id];setLive(true);
  S.P=S.names.map((n,i)=>n.trim()||'Spieler '+(i+1));
  CUR=id;TH=d.c;
  if(!sipsOn()&&OPT[id]&&OPT[id].drink)OPT[id].drink=false;
  G={id,def:d,o:OPT[id],team:false};
  if(d.teams&&teamOn()){
    if(!validTm()){wheel(()=>startSession(id),"Los geht's");return}
    G.team=true;G.tm=S.tm.map(a=>a.slice());G.tof=[];G.tm.forEach((a,t)=>a.forEach(i=>G.tof[i]=t));
  }
  G.ents=G.team?G.tm.map((a,t)=>({name:'Team '+TN[t][1],sub:a.map(i=>S.P[i]).join(' & '),emoji:TN[t][0],av:(sz,cls)=>tb(t,sz,cls)}))
              :S.P.map((p,i)=>({name:p,sub:'',emoji:'👑',av:(sz,cls)=>av(i,cls,sz)}));
  G.pts=G.ents.map(()=>0);
  d.start();
}
const eOf=i=>G.team?G.tof[i]:i;
function plan(rounds){
  const out=[],n=S.P.length;
  if(!G.team){for(let r=0;r<rounds;r++)for(let p=0;p<n;p++)out.push({a:p,e:p})}
  else{const nt=G.tm.length,mx=Math.max(...G.tm.map(a=>a.length)),ix=G.tm.map(()=>0);
    for(let k=0;k<rounds*mx*nt;k++){const t=k%nt,tm=G.tm[t];out.push({a:tm[ix[t]++%tm.length],e:t})}}
  return out;
}
function hand(pi,msg,go,pr,tag){
  HF=go;
  scr(`${pr||''}<div class="card hand">${av(pi,'l')}<p style="margin:0">${tag?tag+' – ':''}Gerät weitergeben an</p><div class="big">${esc(S.P[pi])}</div><p>${msg}</p><button onclick="HF()">Ich bin's</button></div>`);
}
function boardHTML(vals,o){
  o=o||{};const m=Math.max(1,...vals);
  return `<div class="card"><div class="sm" style="margin-bottom:6px">${o.label||(G.team?'Teamwertung':'Punktestand')}</div>${G.ents.map((e,i)=>`<div class="sb">${e.av(26)}<span class="nm">${esc(e.name.replace(/^Team /,''))}</span><div class="bar"><i style="width:${vals[i]/m*100}%"></i></div><span class="pt">${vals[i]}${o.unit||' P'}</span></div>`).join('')}</div>`;
}
const STU={bomb:'💥',c4:'Siege',never:'🍻'};
function statExtra(pi){
  if(G.id==='arsch')return {s:{cards:(G.cards&&G.cards[pi])||0,near:(G.near&&G.near[pi])||0}};
  if(G.id==='react'&&G.best&&isFinite(G.best[pi]))return {m:{ms:G.best[pi]}};
  if(G.id==='never')return {s:{schlucke:G.pts[pi]||0}};
  if(G.id==='most')return {s:{gewaehlt:(G.chosen&&G.chosen[pi])||0,stimmen:(G.tot&&G.tot[pi])||0}};
  if(G.id==='taboo')return {s:{erklaert:(G.tc&&G.tc[pi])||0}};
  if(G.id==='hilo')return {s:{richtig:(G.hit&&G.hit[pi])||0,fragen:G.rounds||0}};
  return null;
}
function recordStats(vals,top){
  if(G.rec)return;G.rec=true;
  try{
    G.ents.forEach((e,i)=>{
      const mem=G.team?G.tm[i]:(G.pi?[G.pi[i]]:[i]);   // 4 Gewinnt solo: Entität ≠ Spielerindex, CPU = -1
      mem.forEach(pi=>{
        if(pi==null||pi<0||!S.P[pi])return;
        const r={w:vals[i]===vals[top]?1:0,p:vals[i],x:statExtra(pi)};
        statRecord(S.P[pi],G.id,r);
        if(NET.host&&pi>0)sendTo(NET.m[pi],{t:'stat',g:G.id,r});   // das Gerät des Spielers speichert seinen Anteil selbst
      });
    });
  }catch(e){}
}
function finish(o){
  o=o||{};setLive(false);stopAll();
  const vals=o.vals||G.pts;
  const idx=G.ents.map((_,i)=>i).sort((a,b)=>o.asc?vals[a]-vals[b]:vals[b]-vals[a]);
  const top=idx[0],tie=G.ents.length>1&&vals[idx[1]]===vals[top];
  recordStats(vals,top);
  const m=Math.max(1,...vals),unit=o.unit||' P';
  const pod=!G.team&&G.ents.length>=2; // Siegerehrung mit Charakteren auf dem Podest
  scr(`${logo(G.def.name,1)}
  <div class="card win">${pod?podiumHTML(idx,vals,unit):`<div class="crown">${G.team?G.ents[top].emoji:'👑'}</div>${G.ents[top].av(0,'l')}`}${pod?`<div class="sm">${tie?'Gleichstand an der Spitze':'🏆 Gewinner: '+esc(G.ents[top].name)}</div>`:`<div class="sm">${tie?'Gleichstand an der Spitze':(G.team?'Siegerteam':'Gewinner')}</div><div class="big">${esc(G.ents[top].name)}</div><div class="sm">${esc(G.ents[top].sub)}${G.ents[top].sub?' · ':''}${vals[top]}${unit}</div>`}</div>
  <div class="card">${idx.map((i,k)=>`<div class="sb late" style="--d:${.6+k*.15}s"><span style="width:20px;color:var(--mu)">${k+1}.</span>${G.ents[i].av(30)}<span class="nm">${esc(G.ents[i].name.replace(/^Team /,''))}</span><div class="bar"><i style="width:0" data-w="${vals[i]/m*100}"></i></div><span class="pt">${vals[i]}${unit}</span></div>`).join('')}</div>
  ${o.extra||''}
  <button onclick="startSession('${G.id}')">Nochmal</button><button class="sec" onclick="gameSetup('${G.id}')">Einstellungen ändern</button><button class="sec" onclick="home()">← Alle Spiele</button>`);
  setTimeout(()=>document.querySelectorAll('.bar i[data-w]').forEach(e=>e.style.width=e.dataset.w+'%'),700);
  confetti(160,GOLD);setTimeout(()=>confetti(120,GOLD),700);sfx.win();vib([50,50,50,50,200]);
}

