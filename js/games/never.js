/* ---------- Ich hab noch nie ---------- */
const NV={
'Harmlos 😇':["einen ganzen Tag im Schlafanzug verbracht","ein Buch an einem Tag ausgelesen","beim Zähneputzen getanzt","mit einem Haustier gesprochen, als wäre es ein Mensch","einen Regenschirm im Bus vergessen","eine Pflanze eingehen lassen","Pizza zum Frühstück gegessen","ein Konzert besucht, bei dem ich kein einziges Lied kannte","heimlich Reste aus dem Kühlschrank gegessen und es abgestritten","den Wecker öfter als dreimal auf „noch 5 Minuten“ gestellt","fünf Folgen derselben Serie hintereinander geschaut","einen Fisch gefangen","ein Geschenk bekommen und so getan, als würde ich es lieben","zehn Minuten nach meinem Handy gesucht, während ich es in der Hand hielt","in einem Fotoautomaten Bilder gemacht","ein Lied so oft gehört, bis ich es nicht mehr hören konnte","ein Rezept ohne eine einzige Änderung nachgekocht","einen Kuchen gebacken, der danach nicht zu retten war","ein ganzes Wochenende ohne Handy verbracht","bei einer Wanderung „nur noch zehn Minuten“ versprochen und doch länger gebraucht","bei einem Spiel absichtlich verloren","einen Brief mit der Hand geschrieben, im letzten Jahr","meinen Namen auf einem Kaffeebecher falsch geschrieben bekommen","ein Zelt aufgebaut, das danach wieder zusammengefallen ist","einen Wunsch beim Ausblasen von Kerzen vergessen"],
'Peinlich 🙈':["beim Karaoke gesungen","bei einer Vorstellung den Namen der Person vergessen","auf eine Nachricht geantwortet, die gar nicht für mich war","jemandem zugewunken, der gar nicht mich meinte","in der Öffentlichkeit gestolpert und so getan, als wäre nichts","ein Wort lange falsch ausgesprochen, ohne es zu merken","bei einem Film geweint","bei einer Hochzeit geweint","beim Kellner „Gleichfalls“ gesagt, als er guten Appetit wünschte","an einer Tür gedrückt, an der man ziehen muss, während jemand zusah","im Aufzug laut mitgesungen, weil ich dachte, ich sei allein","mein Handy fallen lassen und das Display zerbrochen","im Restaurant das falsche Essen bekommen und es trotzdem gegessen","einen Witz erzählt, bei dem keiner gelacht hat","ein Lied laut mitgesungen und den Text komplett falsch gehabt","vor Publikum den Faden verloren","den ganzen Tag Zahnpasta auf der Kleidung gehabt","einen Termin vergessen, den ich selbst ausgemacht hatte","bei einem Telefonat „Tschüss“ gesagt und dann doch weitergeredet","einem Fremden hinterhergelaufen, weil ich ihn für jemand Bekannten hielt","einen peinlichen Spitznamen aus der Kindheit gehabt","bei Kälte so getan, als würde ich nicht frieren","in einer Besprechung einen Lachanfall bekommen","ein Foto gelöscht, nachdem ich es schon hochgeladen hatte","beim Tanzen auf der Tanzfläche allein gestanden"],
'Wild 🔥':["bis zum Sonnenaufgang gefeiert","eine Party als Letzter verlassen","auf einem Tisch getanzt","mitten in der Nacht Pizza bestellt","spontan in ein anderes Land gereist","einen Abend mit Fremden verbracht und sie nie wiedergesehen","einen Flug verpasst","in einem Zug in die falsche Richtung gefahren","gelogen, um nicht zu einer Veranstaltung zu müssen","so getan, als wäre ich krank, um etwas zu verpassen","bei einer Prüfung einen Spickzettel gehabt","im Urlaub viel mehr Geld ausgegeben als geplant","einen Fallschirmsprung gemacht","mir etwas Dauerhaftes (Tattoo oder Piercing) stechen lassen","stundenlang das Profil einer Person in sozialen Medien durchgesehen","ein Geheimnis weitererzählt, das ich nicht weitererzählen sollte","ein Date gehabt, das ein Reinfall war","einen Spitznamen für meine Chefin oder meinen Chef gehabt","in einer Bar etwas bestellt, nur weil der Name gut klang","auf einer Reise einen Tag lang so getan, als wäre ich jemand anderes","bei einem Wettbewerb gewonnen, ohne dafür geübt zu haben","spontan einen Haarschnitt gemacht, den ich sofort bereut habe","einen Sonnenaufgang auf einem Berg erlebt","mitten in der Nacht jemanden angerufen, nur um zu reden","ein Konzert verlassen, weil es mir zu laut war"]
};
const NCATS=Object.keys(NV);
OPT.never={rounds:15,timer:0,cats:{}};
function neCat(i,el){const k=NCATS[i];OPT.never.cats[k]=!OPT.never.cats[k];el.classList.toggle('on')}
GAMES.never={name:'Ich hab noch nie',e:'🙋',tag:'Wer es getan hat, trinkt',c:['#f59e0b','#ef4444'],min:2,teams:false,
  desc:'Eine Aussage nach der anderen. Wer es schon einmal gemacht hat, trinkt einen Schluck. Wer ist am unschuldigsten?',
  rules:'Eine Aussage erscheint („Ich hab noch nie …“). Jeder antwortet <b>ehrlich und geheim</b>: „Hab ich schon gemacht“ oder „Noch nie“. Danach wird aufgedeckt: Wer es schon getan hat, <b>trinkt einen Schluck</b> (Vorschlag – alkoholfrei, mit Wasser oder Saft, geht genauso). Gewonnen hat, wer am wenigsten Schlucke sammelt. Nur für Erwachsene (ab 18). Niemand muss trinken oder etwas erzählen.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Kategorien (nichts gewählt = alle)</p><div class="chips">${NCATS.map((k,i)=>`<span class="chip ${OPT.never.cats[k]?'on':''}" onclick="neCat(${i},this)">${esc(k)}</span>`).join('')}</div>
  <p class="sm" style="margin:16px 0 8px">Runden</p>${seg('never','rounds',[10,15,25])}<p class="sm" style="margin:14px 0 8px">Zeit zum Antworten</p>${seg('never','timer',[0,15,30],v=>v?v+' s':'Aus')}`,
  start:neStart};
function neStart(){
  const sel=NCATS.filter(k=>G.o.cats[k]),cats=sel.length?sel:NCATS,all=[];
  cats.forEach(c=>NV[c].forEach(x=>all.push(x)));
  G.pool=ordered(all,x=>x,'n');G.rounds=Math.max(1,Math.min(G.o.rounds,G.pool.length));G.r=0;neRound();
}
function neProg(){return prg(G.r+G.i/S.P.length,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}
function neRound(){
  G.st=G.pool[G.r];mark('n',G.st);G.an=[];G.i=0;
  if(NET.host){nePar();return}
  hand(G.i,'Antworte ehrlich – niemand schaut mit!',neVote,neProg());
}
function neCard(pi,online){
  const b=(v,k,t)=>`<button class="opt" style="--k:${k}" ${online?`data-sub="v" data-v="${v}"`:`onclick="nePick(${v},this)"`}><span>${t}</span></button>`;
  return `<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:10px">${av(pi)}<span class="sm">${esc(S.P[pi])} antwortet</span></div>
  <div class="sm">Ich hab noch nie …</div><div class="q" style="margin:6px 0 14px">${esc(G.st)}</div>${b(1,0,'🍻 Hab ich schon gemacht')}${b(0,1,'✅ Noch nie')}</div>`;
}
function neVote(){scr(`${neProg()}${neCard(G.i,false)}`);if(G.o.timer)tmrShow(G.o.timer*1000,neTimeUp)}
function neNext(){G.i++;if(G.i<S.P.length)hand(G.i,'Antworte ehrlich – niemand schaut mit!',neVote,neProg());else neResult()}
function nePick(v,btn){
  tmrHide();btn.classList.add('sel');vib(30);sfx.pop();document.querySelectorAll('.opt').forEach(b=>b.style.pointerEvents='none');
  setTimeout(()=>{G.an[G.i]=v;neNext()},350);
}
function neTimeUp(){tmrHide();sfx.bad();vib([60,40,60]);G.an[G.i]=0;toast('⏰ Zeit um – zählt als „Noch nie“');neNext()}
function nePar(){
  parBegin({head:neProg,dur:G.o.timer?[G.o.timer*1000]:null,msg:'Alle antworten ehrlich und geheim …',steps:[
    {k:'v',timeout:pi=>{G.an[pi]=0},html:pi=>neCard(pi,true),
     sub:(pi,d)=>{const v=Number(d.v);if(d.v==null||(v!==0&&v!==1))return 'Ungültige Wahl.';G.an[pi]=v;return true}}
  ],done:neResult});
}
function neResult(){
  const who=S.P.map((_,i)=>i).filter(i=>G.an[i]===1),last=G.r+1>=G.rounds;
  who.forEach(i=>G.pts[i]++);
  scr(`${prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}<div class="card ans"><div class="sm">Ich hab noch nie …</div><div class="q" style="margin-top:6px">${esc(G.st)}</div></div>
  ${who.length?`<div class="card" style="border-color:rgba(255,200,61,.55)"><div class="sm">🍻 Hab ich schon gemacht – ein Schluck (alkoholfrei geht auch)</div><div class="chips" style="margin-top:10px">${who.map(i=>`<span class="chip on">${esc(S.P[i])}</span>`).join('')}</div></div>`:'<div class="card ans"><div style="font-size:48px">😇</div><p style="margin:6px 0 0">Alle unschuldig – keiner trinkt!</p></div>'}
  ${boardHTML(G.pts,{label:'Schlucke (weniger ist unschuldiger)',unit:' 🍻'})}
  <button onclick="${last?'neFinish()':'G.r++;neRound()'}">${last?'Endergebnis 🏆':'Nächste Aussage'}</button>`);
  if(who.length)sfx.ok();else{sfx.win();confetti(40,GOLD)}
}
function neFinish(){
  const mx=Math.max(0,...G.pts),top=S.P.filter((_,i)=>G.pts[i]===mx&&mx>0);
  finish({asc:true,unit:' 🍻',extra:top.length?`<div class="card late" style="--d:1.2s;text-align:center"><div class="sm">Am meisten erlebt</div><div style="font-size:46px;margin:6px 0">🔥</div><div class="big">${esc(top.join(', '))}</div><div class="sm">${mx} Schlucke</div></div>`:''});
}

