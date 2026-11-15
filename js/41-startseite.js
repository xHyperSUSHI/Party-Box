/* ---------- Startseite mit Kategorien ---------- */
Object.keys(GCAT).forEach(k=>{if(GAMES[k])GAMES[k].cat=GCAT[k]});
function home(){
  setLive(false);stopAll();TH=['var(--red2)','var(--red)'];CUR=null;S.P=null;profSync();
  const n=S.names.length,dr=drinkOn(),cats=CATS.filter(c=>dr||c.id!=='drink');
  if(HCAT!=='all'&&!cats.some(c=>c.id===HCAT))HCAT='all';
  const ids=Object.keys(GAMES).filter(id=>dr||GAMES[id].cat!=='drink');
  const tile=(id,k)=>{const d=GAMES[id];return `<button class="gt${n<d.min?' dim':''}" style="--k:${k};--g1:${d.c[0]};--g2:${d.c[1]}" onclick="pickGame('${id}')"><span class="te">${d.e}</span><b>${d.name}</b><small>${d.tag}</small><span class="bd">👥 ab ${d.min}${d.teams?' · Teams':''}${d.cat==='drink'?' · 18+':''}</span></button>`};
  const head=(c,l,link)=>`<div class="sech"${link?` onclick="setHCat('${c.id}')"`:' style="cursor:default"'}><span class="ci" style="--c1:${c.c[0]};--c2:${c.c[1]}">${c.e}</span><div class="ct"><b>${c.n}</b><small>${l.length} ${l.length==1?'Spiel':'Spiele'}</small></div>${link?'<em>Alle ›</em>':''}</div>`;
  let body='';
  if(HCAT==='all'){let k=0;cats.forEach(c=>{const l=ids.filter(id=>GAMES[id].cat===c.id);if(l.length){body+=head(c,l,true)+`<div class="rowh">${l.map((id,q)=>tile(id,k+q)).join('')}</div>`;k+=l.length}})}
  else{const c=cats.find(x=>x.id===HCAT),l=ids.filter(id=>GAMES[id].cat===HCAT);body=`${head(c,l,false)}<div class="grid">${l.map((id,k)=>tile(id,k)).join('')}</div>`}
  const stack=S.names.slice(0,5).map((nm,i)=>av(i,'',34)).join('')+(n>5?`<div class="av" style="width:34px;height:34px;font-size:13px;background:#2a2f45">+${n-5}</div>`:'');
  const p=profGet(),me=p.av,nm=p.n;
  // Neu hier? – nur ohne Profil und ohne gespielte Spiele, bis „Verstanden“
  let intro=false;try{intro=!nm&&!localStorage.getItem('pb_intro')&&!Object.keys(stGet()).length}catch(e){}
  const chips=`<div class="hcats">${[{id:'all',e:'✨',n:'Alle'}].concat(cats).map(c=>`<span class="chip${HCAT===c.id?' on':''}" onclick="setHCat('${c.id}')">${c.e} ${c.n}</span>`).join('')}</div>`;
  scr(`<div class="hgrid"><div class="hside">
  <div class="htop"><div class="logo"><div class="rc"></div><h1>Party Box</h1></div><div class="row" style="gap:8px;width:auto">${NET.on?'':'<button class="sec ib" onclick="statsScreen()" aria-label="Statistik">📊</button>'}<button class="sec ib" onclick="settings()" aria-label="Einstellungen">⚙️</button></div></div>
  <div class="card hcard">
   <div class="hme" onclick="profOpen('home')">${me?charAv(me,'',54):`<div class="av" style="width:54px;height:54px;font-size:26px;background:linear-gradient(135deg,#3a4160,#2a2f45)">🙂</div>`}<div class="hmt"><small>${nm?'Hallo 👋':'Willkommen!'}</small><b>${nm?esc(nm):'Profil anlegen'}</b></div><em>${me?'Profil ›':'Charakter ›'}</em></div>
   <div class="mode2"><button class="${NET.on?'sec':''} sg" onclick="goLocal()">📱 Ein Gerät</button><button class="${NET.on?'':'sec'} sg" onclick="goOnline()">🌐 Online${NET.on?' · '+NET.code:''}</button></div>
   <div class="pbar" onclick="${NET.on?'lobbyScreen()':'playersScreen()'}"><div class="stack">${stack}</div><div class="pt"><b>${S.names.map(x=>esc(x.trim()||'?')).join(', ')}</b><small>${n} Spieler${NET.on?' · Lobby &amp; QR':''}</small></div><em>${NET.on?'Lobby ›':'ändern ›'}</em></div>
  </div>
  ${intro?`<div class="card hnew"><b>Neu hier? So geht's</b><ol><li>Leg dein <a onclick="profOpen('home')">Profil &amp; deinen Charakter</a> an.</li><li>Trag eure <a onclick="playersScreen()">Mitspieler</a> ein – oder spielt <a onclick="goOnline()">online</a> mit mehreren Handys.</li><li>Tipp ein Spiel an. Ein Gerät wandert reihum.</li></ol><button class="sec" onclick="introOk()">Verstanden</button></div>`:''}
  <div class="rnd" onclick="randomGame()"><span>🎲</span><div><b>Zufallsspiel</b><small>Wir suchen eins, das zu euch passt</small></div><em>›</em></div>
  <div class="hstage" onclick="${NET.on?'lobbyScreen()':'playersScreen()'}">${S.names.slice(0,6).map((x,i)=>`<div class="hsf">${figOf(i,i===0?'wave':'stand')}<span>${esc(x.trim()||'?')}</span></div>`).join('')}</div>
  </div><div class="hmain">${chips}${body}</div></div>`);
}
function introOk(){try{localStorage.setItem('pb_intro','1')}catch(e){}keepScroll(home)}
function pickGame(id){
  const d=GAMES[id];
  if(S.names.length<d.min){toast(`${d.name} braucht mindestens ${d.min} Spieler`);vib(60);return}
  const go=()=>{sfx.pop();CUR=id;if(!d.teams)S.mode='solo';gameSetup(id)};
  if(d.cat==='drink'){drinkGate(go);return}
  go();
}

