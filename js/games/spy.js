/* ================= Der Spion ================= */
const LOCS=[['Flughafen','✈️'],['Bahnhof','🚉'],['Krankenhaus','🏥'],['Schule','🏫'],['Zirkus','🎪'],['Bank','🏦'],['Strand','🏖️'],['Kino','🎬'],['Supermarkt','🛒'],['Raumstation','🛰️'],['Piratenschiff','🏴‍☠️'],['Skihütte','⛷️'],['Zoo','🦁'],['Freizeitpark','🎢'],['Bäckerei','🥐'],['Weihnachtsmarkt','🎄'],['Bierzelt','🍺'],['Casino','🎰'],['Friseursalon','💇'],['Fitnessstudio','🏋️'],['Museum','🖼️'],['Bibliothek','📚'],['Campingplatz','⛺'],['Kreuzfahrtschiff','🚢'],['Bauernhof','🚜'],['Gefängnis','🔒'],['Polizeiwache','🚓'],['Feuerwache','🚒'],['Hochzeit','💒'],['Almhütte','🏔️'],['Bergbahn','🚠'],['Therme','♨️'],['Tankstelle','⛽'],['Waschsalon','🧺'],['Disco','🪩'],['Schloss','🏰'],['Hotel','🏨'],['Konzert','🎤'],['Fußballstadion','⚽'],['Zahnarztpraxis','🦷'],['Restaurant','🍽️'],['Autowerkstatt','🔧'],['Universität','🎓'],['Eisdiele','🍦'],['Wald','🌲'],['Mondbasis','🌕']];
GAMES.spy={name:'Der Spion',e:'🕵️',tag:'Einer weiß den Ort nicht',c:['#14b8a6','#0e7490'],min:3,teams:false,
  desc:'Alle kennen den geheimen Ort – nur der Spion nicht. Fragt euch geschickt aus und findet ihn, bevor er den Ort errät.',
  rules:'Jeder sieht heimlich seine Karte: den Ort oder „Spion“. Danach stellt ihr euch reihum Fragen zum Ort (die Antwort darf den Ort nicht verraten!). Die Gruppe kann jederzeit abstimmen, wer der Spion ist. Der Spion kann jederzeit aufdecken und den Ort raten. <b>Trifft die Gruppe den Spion und er rät falsch: alle anderen +2.</b> Sonst gewinnt der Spion (+3).',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Runden</p>${seg('spy','rounds',[3,5,8])}<p class="sm" style="margin:14px 0 8px">Diskussionszeit (Minuten)</p>${seg('spy','mins',[4,6,8,10])}`,
  start:spyStart};
function spyStart(){G.r=0;G.rounds=G.o.rounds;G.locs=ordered(LOCS,l=>l[0],'l');spyRound()}
function spyProg(){return prg(G.r,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}
// Online: jeder sieht seine Karte gleichzeitig auf dem eigenen Gerät
function spyPar(){
  parBegin({head:spyProg,msg:'Alle schauen heimlich auf ihre Karte …',steps:[
    {k:'ok',html:pi=>{const sp=pi===G.spy;return `<div class="card word flipin" style="margin-top:14px">${sp
      ?`<small>Deine Rolle</small><div style="font-size:70px">🕵️</div><span>Du bist der Spion!</span><p>Finde heraus, wo ihr seid – ohne aufzufallen.</p>`
      :`<small>Der geheime Ort</small><div style="font-size:70px">${G.loc[1]}</div><span>${G.loc[0]}</span><p>Du bist kein Spion. Stelle clevere Fragen, ohne den Ort zu verraten.</p>`}</div>
      <button data-sub="ok">Verdecken &amp; fertig</button>`},
     sub:()=>true}
  ],done:spyTalk});
}
function spyRound(){
  G.loc=G.locs[G.r%G.locs.length];mark('l',G.loc[0]);
  G.spy=rnd(0,S.P.length-1);G.i=0;G.sv=null;G.cnt=null;
  if(NET.host){spyPar();return}
  hand(G.i,'Schau dir deine Karte an – niemand sonst!',spyShow,spyProg());
}
function spyShow(){
  const sp=G.i===G.spy;
  scr(`${spyProg()}<div class="card word flipin" style="margin-top:14px">${sp
    ?`<small>Deine Rolle</small><div style="font-size:70px">🕵️</div><span>Du bist der Spion!</span><p>Finde heraus, wo ihr seid – ohne aufzufallen.</p>`
    :`<small>Der geheime Ort</small><div style="font-size:70px">${G.loc[1]}</div><span>${G.loc[0]}</span><p>Du bist kein Spion. Stelle clevere Fragen, ohne den Ort zu verraten.</p>`}</div>
  <button onclick="spyNext()">Verdecken &amp; weitergeben</button>`);
}
function spyNext(){G.i++;if(G.i<S.P.length)hand(G.i,'Schau dir deine Karte an – niemand sonst!',spyShow,spyProg());else spyTalk()}
function spyTalk(){
  const starter=rnd(0,S.P.length-1);G.total=G.o.mins*60;G.end=Date.now()+G.total*1000;
  scr(`${spyProg()}<div class="card ans"><div style="font-size:48px">🗣️</div><div class="big">Fragerunde</div><p style="margin:0">${esc(S.P[starter])} beginnt: Stellt reihum Fragen an eine andere Person. Die Antwort darf den Ort nicht verraten – aber der Spion darf nicht auffliegen.</p></div>
  <div class="ringw" id="rw"><svg viewBox="0 0 120 120"><defs><linearGradient id="grd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14b8a6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><circle class="rbg" cx="60" cy="60" r="54"/><circle id="rg" class="rfg" cx="60" cy="60" r="54" stroke-dasharray="${PGR}" stroke-dashoffset="0" transform="rotate(-90 60 60)"/></svg><div class="rt" id="tt" style="font-size:34px"></div></div>
  <button onclick="spyVote()">🗳️ Abstimmen: Wer ist der Spion?</button>
  <button class="sec" onclick="spyGuess('self')">🕵️ Ich bin der Spion – Ort raten</button>`);
  clearInterval(G.iv);G.iv=setInterval(()=>{
    const left=Math.max(0,(G.end-Date.now())/1000),rg=$('rg');
    if(!rg){clearInterval(G.iv);return}
    rg.setAttribute('stroke-dashoffset',PGR*(1-left/G.total));
    const m=Math.floor(left/60),s=Math.ceil(left%60);$('tt').textContent=`${m}:${pad(s===60?59:s)}`;
    if(left<=30)$('rw').classList.add('hot');
    if(left<=0){clearInterval(G.iv);sfx.bad();vib([100,50,100]);spyVote(true)}
  },250);
}
// Online: Alle stimmen geheim und gleichzeitig ab; die meisten Stimmen entscheiden, bei Gleichstand kommt der Spion davon
function spyVotePar(timeUp){
  parBegin({head:spyProg,dur:[30000],msg:(timeUp===true?'⏰ Zeit um! ':'')+'Alle stimmen geheim ab, wer der Spion ist …',steps:[
    {k:'v',html:pi=>`<div class="card"><div class="q">Wer ist der Spion?</div><p>Stimme geheim ab – erst danach wird ausgezählt.</p>
      ${S.P.map((p,i)=>i===pi?'':`<button class="opt" style="--k:${i}" data-sub="v" data-v="${i}">${av(i)}<span>${esc(p)}</span></button>`).join('')}</div>`,
     sub:(pi,d)=>{const t=Number(d.v);if(d.v==null||!Number.isInteger(t)||t<0||t>=S.P.length||t===pi)return 'Ungültige Wahl.';(G.sv=G.sv||[])[pi]=t;return true}}
  ],done:spyTally});
}
function spyTally(){
  const cnt=S.P.map(()=>0);(G.sv||[]).forEach(t=>{if(t!=null)cnt[t]++});G.cnt=cnt;
  const mx=Math.max(0,...cnt),tops=cnt.map((c,i)=>c===mx&&mx>0?i:-1).filter(i=>i>=0);
  if(tops.length===1){G.acc=tops[0];if(G.acc===G.spy){sfx.ok();spyGuess('caught')}else spyEnd('missed')}
  else spyEnd('tie');
}
function spyVote(timeUp){
  clearInterval(G.iv);
  if(NET.host){spyVotePar(timeUp);return}
  scr(`${spyProg()}<div class="card"><div class="q">${timeUp===true?'⏰ Zeit um! ':''}Wer ist der Spion?</div><p>Einigt euch gemeinsam und tippt die Person an.</p>
  ${S.P.map((p,i)=>`<button class="opt" style="--k:${i}" onclick="spyAccuse(${i})">${av(i)}<span>${esc(p)}</span></button>`).join('')}</div>`);
}
function spyAccuse(i){G.acc=i;if(i===G.spy){sfx.ok();spyGuess('caught')}else spyEnd('missed')}
function spyGuess(how){
  clearInterval(G.iv);G.how=how;
  const opts=shuffle([G.loc].concat(shuffle(LOCS.filter(l=>l!==G.loc)).slice(0,11)));
  scr(`${spyProg()}<div class="card"><div style="font-size:44px">${how==='caught'?'😬':'🕵️'}</div><div class="q" style="margin:6px 0">${esc(S.P[G.spy])} ${how==='caught'?'wurde enttarnt!':'deckt auf!'}</div><p>Letzte Chance: Wo seid ihr?</p>
  <div class="locs">${opts.map(l=>`<button class="sec lo" onclick="spyEnd('${how}',${LOCS.indexOf(l)})"><span style="font-size:26px">${l[1]}</span><br>${l[0]}</button>`).join('')}</div></div>`);
}
function spyEnd(how,gi){
  const right=gi!=null&&LOCS[gi]===G.loc;
  // Spion gewinnt: falsch beschuldigt (missed), oder richtig geraten (caught/self)
  const spyWins=how==='missed'||how==='tie'||right;
  const gain=S.P.map((_,i)=>i===G.spy?(spyWins?3:0):(spyWins?0:2));
  gain.forEach((g,i)=>G.pts[i]+=g);
  const last=G.r+1>=G.rounds;
  const why=how==='tie'?'Gleichstand bei der Abstimmung – die Gruppe konnte sich nicht einigen, der Spion kommt davon!':how==='missed'?`${esc(S.P[G.acc])} war unschuldig – der Spion kommt davon!`:how==='caught'?(right?'Enttarnt, aber der Spion hat den Ort erraten!':'Enttarnt und der Ort wurde nicht erraten!'):(right?'Mutig aufgedeckt und richtig geraten!':'Aufgedeckt und falsch geraten!');
  scr(`${prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}<div class="card ans"><div style="font-size:60px;animation:pop .6s both">${spyWins?'🕵️':'🎉'}</div><div class="big" style="color:${spyWins?'var(--red2)':'var(--ok)'}">${spyWins?'Der Spion gewinnt!':'Die Gruppe gewinnt!'}</div>
  <p style="margin:6px 0">${why}</p>${G.cnt?`<div class="sm" style="margin-bottom:8px">Abstimmung: ${S.P.map((p,i)=>esc(p)+' '+G.cnt[i]).join(' · ')}</div>`:''}<div class="sm">Der Spion war</div><div class="big">${esc(S.P[G.spy])}</div><div class="sm">Der Ort war</div><div style="font-size:44px">${G.loc[1]}</div><div class="big" style="font-size:26px">${G.loc[0]}</div></div>
  ${boardHTML(G.pts)}<button onclick="${last?'finish()':'G.r++;spyRound()'}">${last?'Endergebnis 🏆':'Nächste Runde'}</button>`);
  if(spyWins){flash();sfx.bad()}else{confetti(120,GOLD);sfx.win()}
}

