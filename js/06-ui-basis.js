/* ================= UI ================= */
const GAMES={};
const OPT={arsch:{rounds:10,timer:30,cats:{}},pant:{secs:60,rounds:2,cats:{}},spy:{rounds:3,mins:6},wave:{rounds:2},bluff:{rounds:5,timer:60},react:{rounds:5},bomb:{rounds:5,fuse:'mittel'}};
const hue=i=>(i*47+350)%360;
const nameOf=i=>(S.P&&S.P[i]!=null?S.P[i]:S.names[i]);
const scr=h=>{app.innerHTML=`<div class="screen" style="--g1:${TH[0]};--g2:${TH[1]}">${h}</div>`;window.scrollTo(0,0);app.scrollTop=0;kbPrep()};
const av=(i,cls,sz)=>`<div class="av ${cls||''}" style="${sz?`width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.45)}px;`:''}background:linear-gradient(135deg,hsl(${hue(i)} 85% 58%),hsl(${hue(i)+40} 80% 42%))">${esc((nameOf(i)||'?').trim().charAt(0).toUpperCase()||'?')}</div>`;
const TN=[['🔥','Feuer',12],['🧊','Eis',200],['⚡','Blitz',48],['🌿','Natur',140]];
const tcol=t=>`hsl(${TN[t][2]} 85% 55%)`;
const tb=(t,sz,cls)=>`<div class="av ${cls||''}" style="${sz?`width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.55)}px;`:''}background:linear-gradient(135deg,hsl(${TN[t][2]} 85% 58%),hsl(${TN[t][2]+30} 80% 42%))">${TN[t][0]}</div>`;
const logo=(txt,sm)=>`<div class="logo"><div class="rc"></div><h1${sm?' style="font-size:30px"':''}>${txt}</h1></div>`;
const prg=(d,t,lab)=>`<div class="sm">${lab}</div><div class="prog"><i style="width:${Math.min(100,d/t*100)}%"></i></div>`;
const seg=(g,k,vals,lab)=>`<div class="row">${vals.map(v=>`<button class="${OPT[g][k]===v?'':'sec'} sg" onclick="setOpt('${g}','${k}',${typeof v==='string'?`'${v}'`:v})">${lab?lab(v):v}</button>`).join('')}</div>`;
/* Einstellungen ändern lädt den Bildschirm neu – die Scrollposition bleibt dabei erhalten */
function keepScroll(f){const sc=app.scrollTop;f();app.scrollTop=sc}
function setOpt(g,k,v){OPT[g][k]=v;keepScroll(()=>gameSetup(g))}

/* ---------- Home ---------- */
/* ---------- Spieler ---------- */
function playersScreen(){
  setLive(false);S.P=null;TH=['var(--red2)','var(--red)'];
  scr(`<button class="sec back" onclick="savePlayers()">← Fertig</button>${logo('Mitspieler')}
  <div class="card"><div id="pl"></div><div class="row"><button class="sec" onclick="addP()">+ Spieler</button><button class="sec" onclick="delP()">− Spieler</button></div></div>
  <p class="sm">Bis zu 10 Spieler. Allein geht nur 4 Gewinnt gegen den Computer, alle anderen Spiele brauchen mindestens 2 oder 3. Namen und Einstellungen merkt sich die Party Box auf diesem Gerät.</p>`);
  const pl=$('pl');
  S.names.forEach((n,i)=>pl.insertAdjacentHTML('beforeend',`<div class="row" style="align-items:center;margin-top:10px">${av(i)}<input style="margin:0" data-i="${i}" value="${esc(/^Spieler \d+$/.test(n.trim())?'':n)}" maxlength="16" placeholder="Spieler ${i+1}"></div>`));
}
function saveNames(){document.querySelectorAll('#pl input').forEach(e=>S.names[+e.dataset.i]=e.value)}
function addP(){saveNames();if(S.names.length<10)S.names.push('Spieler '+(S.names.length+1));playersScreen()}
function delP(){saveNames();if(S.names.length>1)S.names.pop();playersScreen()}
function savePlayers(){saveNames();S.names=S.names.map((n,i)=>n.trim()||'Spieler '+(i+1));saveCfg();home()}

/* ---------- Statistik ---------- */
let STK=[];
const stGames=P=>Object.values(P.g).reduce((a,g)=>a+g.n,0),stWins=P=>Object.values(P.g).reduce((a,g)=>a+g.w,0);
function statSel(i){statsScreen(STK[i])}
function statsScreen(sel){
  setLive(false);stopAll();TH=['var(--red2)','var(--red)'];S.P=null;
  const st=stGet();STK=Object.keys(st).filter(k=>st[k]&&st[k].g&&!/^Spieler \d+$/i.test(st[k].n||'')).sort((a,b)=>stGames(st[b])-stGames(st[a]));
  const head=`<button class="sec back" onclick="home()">← Zurück</button>${logo('Statistik')}`;
  const note='<p class="sm">Die Statistik gehört zu diesem Gerät (genauer: zu diesem Browser bzw. dieser App) und wird nicht ins Internet geschickt. Wer auf einem anderen Gerät oder in der Home-Bildschirm-App spielt, hat dort eine eigene.</p>';
  if(!STK.length){scr(`${head}<div class="card"><p style="margin:0">Noch nichts gespeichert. Sobald ein Spiel zu Ende gespielt ist, erscheinen hier Siege, Punkte und Rekorde – getrennt nach Spielername.</p></div>${note}`);return}
  const cur=(sel&&st[sel])?sel:(S.names.map(n=>'n:'+n.trim().toLowerCase()).find(k=>st[k])||STK[0]);
  const P=st[cur],tot=stGames(P),win=stWins(P);
  const ids=Object.keys(GAMES).filter(id=>P.g[id]);
  const ex=(id,g)=>{const a=[];
    if(id==='arsch'){a.push(`Arschkarten: <b style="color:var(--tx)">${g.s.cards||0}</b>`,`am nächsten: <b style="color:var(--tx)">${g.s.near||0}</b>`)}
    if(id==='react'&&g.m.ms!=null)a.push(`schnellste Zeit: <b style="color:var(--tx)">${Math.round(g.m.ms)} ms</b>`);
    if(id==='never')a.push(`Schlucke: <b style="color:var(--tx)">${g.s.schlucke||0}</b>`);
    if(id==='most')a.push(`am häufigsten gewählt: <b style="color:var(--tx)">${g.s.gewaehlt||0}×</b>`,`Stimmen erhalten: <b style="color:var(--tx)">${g.s.stimmen||0}</b>`);
    if(id==='taboo')a.push(`Begriffe erklärt: <b style="color:var(--tx)">${g.s.erklaert||0}</b>`);
    if(id==='hilo'&&g.s.fragen)a.push(`Trefferquote: <b style="color:var(--tx)">${Math.round((g.s.richtig||0)/g.s.fragen*100)} %</b>`);
    return a.join(' · ')};
  scr(`${head}
  <div class="chips" style="margin:8px 0">${STK.map((k,i)=>`<span class="chip ${k===cur?'on':''}" onclick="statSel(${i})">${esc(st[k].n)}</span>`).join('')}</div>
  <div class="card" style="text-align:center"><div class="sm">${esc(P.n)}</div>
    <div class="row" style="margin-top:10px"><div style="flex:1"><div class="stn">${tot}</div><div class="sm">Spiele</div></div><div style="flex:1"><div class="stn" style="color:var(--gold)">${win}</div><div class="sm">Siege</div></div><div style="flex:1"><div class="stn">${tot?Math.round(win/tot*100):0}%</div><div class="sm">Siegquote</div></div></div></div>
  <div class="card"><h2>Nach Spiel</h2>${ids.map(id=>{const d=GAMES[id],g=P.g[id],u=STU[id]||'P',e=ex(id,g);
    return `<div class="srow"><span style="font-size:30px">${d.e}</span><div style="flex:1"><b>${d.name}</b><div class="sm">${g.n} Spiel${g.n==1?'':'e'} · ${g.w} Sieg${g.w==1?'':'e'} · ${Math.round(g.p)} ${u}${e?'<br>'+e:''}</div></div></div>`}).join('')}</div>
  ${STK.length>1?`<div class="card"><h2>Rangliste (Siege)</h2>${STK.slice().sort((a,b)=>stWins(st[b])-stWins(st[a])).slice(0,8).map((k,i)=>`<div class="srow"><span style="width:22px;color:var(--mu)">${i+1}.</span><b style="flex:1">${esc(st[k].n)}</b><span class="sm">${stWins(st[k])} / ${stGames(st[k])}</span></div>`).join('')}</div>`:''}
  ${note}<button class="sec" onclick="if(confirm('Statistik auf diesem Gerät wirklich löschen?')){try{localStorage.removeItem('pb_stats')}catch(e){}statsScreen()}">Statistik zurücksetzen</button>`);
}

