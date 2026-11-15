/* ================= Heiße Bombe ================= */
const BC=['Nenne eine Automarke','Nenne etwas, das man im Bad findet','Nenne ein Tier mit „S“ am Anfang','Nenne eine Käsesorte','Nenne etwas, das man bei einem Picknick dabeihat','Nenne einen Fußballverein','Nenne eine Eissorte','Nenne etwas, das rot ist','Nenne einen Beruf mit Uniform','Nenne ein Gewürz','Nenne eine Sportart mit Ball','Nenne etwas, das man im Rucksack beim Wandern dabeihat','Nenne einen Kontinent, ein Land oder eine Stadt mit „M“','Nenne etwas, das in einer Küchenschublade liegt','Nenne eine Pizzabelag-Sorte','Nenne ein Musikinstrument','Nenne etwas, das man auf einer Hochzeit sieht','Nenne ein Getränk ohne Alkohol','Nenne einen Film-Schurken','Nenne etwas, das man im Winter braucht','Nenne ein Obst, das man schälen muss','Nenne ein Brettspiel oder Kartenspiel','Nenne ein Wort mit „Berg“ drin','Nenne etwas, das man im Auto findet','Nenne eine Süßigkeit','Nenne einen Fluss oder See','Nenne ein Werkzeug','Nenne etwas, das beim Zelten wichtig ist','Nenne ein Land in Europa','Nenne etwas, das man in der Schule hat','Nenne etwas Gelbes','Nenne eine Gemüsesorte','Nenne etwas, das Lärm macht','Nenne ein Kleidungsstück mit Knöpfen','Nenne einen Vornamen mit „A“','Nenne etwas, das man im Supermarkt in der Kühlung findet','Nenne ein Haustier','Nenne ein Insekt','Nenne etwas, das man zum Geburtstag schenkt','Nenne etwas Rundes','Nenne einen Streamingdienst oder eine App','Nenne etwas, das klebt','Nenne ein Wort, das auf „-ung“ endet','Nenne ein Tier aus dem Wald','Nenne etwas, das man im Sommer braucht','Nenne einen Sänger oder eine Band','Nenne ein Frühstücksessen','Nenne einen Ort, an dem man leise sein muss'];
const FUSE={kurz:[10,22],mittel:[20,40],lang:[35,65]};
GAMES.bomb={name:'Heiße Bombe',e:'💣',tag:'Schnell antworten, sonst Bumm',c:['#f97316','#dc2626'],min:2,teams:true,
  desc:'Eine Kategorie, eine tickende Bombe. Sag etwas Passendes und gib das Handy weiter – wie lang die Zündschnur ist, weiß keiner.',
  rules:'Eine Kategorie erscheint, die Bombe tickt. Wer dran ist, nennt <b>laut</b> einen passenden Begriff (nichts doppelt, nichts wiederholen) und tippt „Weitergeben“. Wenn die Bombe explodiert, hat der aktuelle Spieler (oder sein Team) einen Knall kassiert. Am Ende gewinnt, wer die <b>wenigsten Explosionen</b> hat. Im Teammodus wechseln sich die Teams ab.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Bomben (Runden)</p>${seg('bomb','rounds',[3,5,8,12])}<p class="sm" style="margin:14px 0 8px">Zündschnur</p>${seg('bomb','fuse',['kurz','mittel','lang'],v=>({kurz:'Kurz',mittel:'Mittel',lang:'Lang'})[v])}`,
  start:boStart};
function boStart(){G.r=0;G.rounds=G.o.rounds;G.cats=ordered(BC,c=>c,'c');boRound()}
function boRound(){
  G.cat=G.cats[G.r%G.cats.length];mark('c',G.cat);
  const f=FUSE[G.o.fuse];G.total=rnd(f[0]*1000,f[1]*1000);
  if(G.team){G.ht=G.r%G.tm.length;G.hix=G.tm.map(()=>0);G.hold=G.tm[G.ht][G.hix[G.ht]++%G.tm[G.ht].length]}
  else G.hold=G.r%S.P.length;
  scr(`${prg(G.r,G.rounds,`Bombe ${G.r+1} von ${G.rounds}`)}<div class="card hand"><div style="font-size:70px">💣</div><p style="margin:0">Gleich geht's los. Fangen soll</p><div class="big">${esc(S.P[G.hold])}</div>${G.team?`<p style="margin:0">${TN[eOf(G.hold)][0]} Team ${TN[eOf(G.hold)][1]}</p>`:''}<p>Sag die Antwort laut, bevor du weitergibst!</p><button onclick="boLight()">Zündschnur anzünden 🔥</button></div>`);
}
function boLight(){
  G.bst=[];G.end=Date.now()+G.total;G.nextBeat=0;G.beats=0;sfx.go();
  boScreen();
  clearInterval(G.iv);G.iv=setInterval(boTick,60);
}
function boScreen(){
  scr(`${prg(G.r,G.rounds,`Bombe ${G.r+1} von ${G.rounds}`)}<div class="card ans"><div class="sm">Kategorie</div><div class="q" style="font-size:26px;margin:6px 0">${esc(G.cat)}</div></div>
  <div class="bomb" id="bb" style="--bd:1s">💣<span class="spark">✨</span></div>
  <div class="card hand" style="padding:16px;margin-top:0"><div class="sm">Dran ist</div><div class="big" id="hn">${esc(S.P[G.hold])}</div><div class="sm" id="ht">${G.team?TN[eOf(G.hold)][0]+' Team '+TN[eOf(G.hold)][1]:''}</div></div>
  <button onclick="boPass()" style="font-size:20px;padding:20px">Weitergeben ➜</button>
  <button class="sec" id="bk" onclick="boBack()" style="opacity:.45">↩ Falsch / schon genannt</button>`);
}
function boTick(){
  const left=G.end-Date.now();
  if(left<=0){boBoom();return}
  const now=Date.now();
  if(now>=G.nextBeat){
    sfx.tick();vib(10);
    const ratio=Math.max(0,left/G.total),iv=130+620*ratio;
    G.nextBeat=now+iv;const bb=$('bb');if(bb)bb.style.setProperty('--bd',(iv/1000).toFixed(2)+'s');
  }
}
function boShowHold(){
  const hn=$('hn');if(hn){hn.textContent=S.P[G.hold];hn.classList.remove('flipin');void hn.offsetWidth;hn.classList.add('flipin')}
  const ht=$('ht');if(ht&&G.team)ht.textContent=TN[eOf(G.hold)][0]+' Team '+TN[eOf(G.hold)][1];
  const bk=$('bk');if(bk)bk.style.opacity=(G.bst&&G.bst.length)?1:.45;
}
function boPass(){
  sfx.pop();
  (G.bst=G.bst||[]).push({hold:G.hold,ht:G.ht,hix:G.hix?G.hix.slice():null});   // merken, damit "Falsch" zurückgehen kann
  if(G.team){G.ht=(G.ht+1)%G.tm.length;const tm=G.tm[G.ht];G.hold=tm[G.hix[G.ht]++%tm.length]}
  else G.hold=(G.hold+1)%S.P.length;
  boShowHold();
}
// Das gerade genannte Wort war falsch oder schon dran: Die Bombe geht zurück, der Vorgänger muss ein neues Wort sagen (Zeit läuft weiter)
function boBack(){
  if(!G.bst||!G.bst.length)return;
  const s=G.bst.pop();G.hold=s.hold;if(G.team){G.ht=s.ht;G.hix=s.hix}
  sfx.bad();vib(40);boShowHold();toast(`↩ Zurück an ${S.P[G.hold]}: neues Wort!`);
}
function boBoom(){
  clearInterval(G.iv);flash('radial-gradient(circle,rgba(255,160,40,.8),rgba(255,46,77,.4) 50%,transparent 75%)');sfx.boom();
  const e=eOf(G.hold);G.pts[e]++;
  const last=G.r+1>=G.rounds;
  scr(`${prg(G.r+1,G.rounds,`Bombe ${G.r+1} von ${G.rounds}`)}<div class="card ans"><div style="font-size:90px;animation:pop .5s both">💥</div><div class="big" style="color:var(--red2)">BUMM!</div><p style="margin:6px 0 0"><b style="color:var(--tx)">${esc(S.P[G.hold])}</b>${G.team?` (Team ${TN[e][1]})`:''} hatte die Bombe in der Hand.</p></div>
  ${G.o.drink?drinkBox([esc(S.P[G.hold])+' trinkt 2 Schlucke 💥']):''}${boardHTML(G.pts,{label:'Explosionen (weniger ist besser)',unit:' 💥'})}
  <button onclick="${last?'boFinish()':'G.r++;boRound()'}">${last?'Endergebnis 🏆':'Nächste Bombe'}</button>`);
}
function boFinish(){finish({asc:true,unit:' 💥'})}

