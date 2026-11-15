/* ---------- Startseite mit Kategorien ---------- */
Object.keys(GCAT).forEach(k=>{if(GAMES[k])GAMES[k].cat=GCAT[k]});
function home(){
  setLive(false);stopAll();TH=['var(--red2)','var(--red)'];CUR=null;S.P=null;
  const n=S.names.length,dr=drinkOn(),cats=CATS.filter(c=>dr||c.id!=='drink');
  if(HCAT!=='all'&&!cats.some(c=>c.id===HCAT))HCAT='all';
  const ids=Object.keys(GAMES).filter(id=>dr||GAMES[id].cat!=='drink');
  const tile=(id,k)=>{const d=GAMES[id];return `<button class="gt${n<d.min?' dim':''}" style="--k:${k};--g1:${d.c[0]};--g2:${d.c[1]}" onclick="pickGame('${id}')"><span class="te">${d.e}</span><b>${d.name}</b><small>${d.tag}</small><span class="bd">👥 ab ${d.min}${d.teams?' · Teams':''}${d.cat==='drink'?' · 18+':''}</span></button>`};
  const head=(c,l,link)=>`<div class="sech"${link?` onclick="setHCat('${c.id}')"`:' style="cursor:default"'}><span class="ci" style="--c1:${c.c[0]};--c2:${c.c[1]}">${c.e}</span><div class="ct"><b>${c.n}</b><small>${l.length} ${l.length==1?'Spiel':'Spiele'}</small></div>${link?'<em>Alle ›</em>':''}</div>`;
  let body='';
  if(HCAT==='all'){let k=0;cats.forEach(c=>{const l=ids.filter(id=>GAMES[id].cat===c.id);if(l.length){body+=head(c,l,true)+`<div class="rowh">${l.map((id,q)=>tile(id,k+q)).join('')}</div>`;k+=l.length}})}
  else{const c=cats.find(x=>x.id===HCAT),l=ids.filter(id=>GAMES[id].cat===HCAT);body=`<button class="sec back" style="margin-top:14px" onclick="setHCat('all')">← Alle Kategorien</button>${head(c,l,false)}<div class="grid">${l.map((id,k)=>tile(id,k)).join('')}</div>`}
  const stack=S.names.slice(0,5).map((nm,i)=>av(i,'',34)).join('')+(n>5?`<div class="av" style="width:34px;height:34px;font-size:13px;background:#2a2f45">+${n-5}</div>`:'');
  scr(`<div class="row" style="justify-content:space-between;align-items:center"><div class="logo" style="margin:6px 0"><div class="rc"></div><h1 style="font-size:34px">Party Box</h1></div><div class="row" style="gap:8px;width:auto">${NET.on?'':'<button class="sec ib" onclick="statsScreen()" aria-label="Statistik">📊</button>'}<button class="sec ib" onclick="settings()" aria-label="Einstellungen">⚙️</button></div></div>
  <p class="subt">Such dir ein Spiel aus. Danach wählst du den Modus.</p>
  <div class="mode2"><button class="${NET.on?'sec':''} sg" onclick="goLocal()">📱 Ein Gerät</button><button class="${NET.on?'':'sec'} sg" onclick="goOnline()">🌐 Online${NET.on?' · '+NET.code:''}</button></div>
  <div class="pbar" onclick="${NET.on?'lobbyScreen()':'playersScreen()'}"><div class="stack">${stack}</div><div class="pt"><b>${S.names.map(nm=>esc(nm.trim()||'?')).join(', ')}</b><small>${n} ${n==1?'Spieler':'Spieler'}${NET.on?' · Lobby &amp; QR':''}</small></div><em>${NET.on?'Lobby ›':'ändern ›'}</em></div>
  ${HCAT==='all'?`<div class="rnd" onclick="randomGame()"><span>🎲</span><div><b>Zufallsspiel</b><small>Wir suchen eins, das zu euch passt</small></div><em>›</em></div>`:''}
  ${body}`);
}
function pickGame(id){
  const d=GAMES[id];
  if(S.names.length<d.min){toast(`${d.name} braucht mindestens ${d.min} Spieler`);vib(60);return}
  const go=()=>{sfx.pop();CUR=id;if(!d.teams)S.mode='solo';gameSetup(id)};
  if(d.cat==='drink'){drinkGate(go);return}
  go();
}

