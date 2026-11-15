/* ================= Wer würde am ehesten …? ================= */
const MQ={
'Alltag & Chaos 🤪':[
"verschlafen und den eigenen Wecker ausschalten, ohne es zu merken","sich aus der Wohnung aussperren","ein Möbelstück ohne Anleitung aufbauen","bei einem Spieleabend heimlich schummeln","das Handy auf 1 % herunterspielen lassen","im Supermarkt hungrig den ganzen Wagen vollpacken","dem Navi folgen und trotzdem falsch ankommen","mitten im Film einschlafen","drei Stunden lang einen Film aussuchen","zu einem Termin viel zu früh erscheinen","ein Geheimnis nicht für sich behalten können","vergessen, wo das Auto geparkt ist","ein ganzes Zimmer in einer einzigen Nacht aufräumen","laut mitsingen und es gar nicht merken","beim Kochen die Küche in ein Schlachtfeld verwandeln","ein Geschenk schon vor Weihnachten aufmachen","den Regenschirm immer dann vergessen, wenn es regnet","nach Mitternacht noch Pizza bestellen","auf eine Nachricht erst nach drei Tagen antworten","den Kühlschrank öffnen, ohne zu wissen, was er eigentlich will","am Flughafen den Reisepass vergessen","bei einer Wanderung als Erstes nach der Hütte fragen","eine Zimmerpflanze durch zu viel Liebe eingehen lassen","als Erster die Party verlassen und trotzdem am meisten erzählen"],
'Peinlich & Witzig 🙈':[
"beim Karaoke den ganzen Raum zum Lachen bringen","in einer Besprechung einen Lachanfall bekommen","versehentlich die falsche Person anschreiben","bei einer Videokonferenz etwas Peinliches im Hintergrund haben","auf der Tanzfläche als Erster anfangen","einen Witz erklären müssen, den keiner versteht","den Namen einer berühmten Person falsch aussprechen","beim Gähnen alle anderen anstecken","bei jeder Gelegenheit einen Wortwitz machen","mit voller Überzeugung die schlechtesten Tanzbewegungen zeigen","beim Vorstellen den eigenen Namen vergessen","die Hose verkehrt herum anziehen und es erst abends merken","sich im Aufzug unterhalten, als wäre er allein","ein peinliches Kinderfoto freiwillig herumzeigen","bei einem Heiratsantrag am meisten weinen","auf einem Kindergeburtstag den besten Clown abgeben","sich auf eine fremde Hochzeit schmuggeln, nur wegen des Buffets","im Urlaub plötzlich einen Dialekt annehmen","mit dem Haustier ein Selbstgespräch führen","den peinlichsten Klingelton haben","auf einem Gruppenfoto immer mit geschlossenen Augen erwischt werden","beim Verlieren schlechter reagieren als ein Kleinkind"],
'Karriere & Leben 🚀':[
"ein Start-up gründen und nach einem Jahr wieder aufgeben","Millionär werden","berühmt werden, ohne es zu wollen","eine Weltreise ohne Plan antreten","als Erster Kinder bekommen","einen Marathon laufen","ein Buch schreiben","auswandern und nie wieder zurückkommen","mit 80 noch Skateboard fahren","Bürgermeister werden","den Job kündigen, um Musiker zu werden","zehn Sprachen lernen und keine richtig sprechen","einen Lottogewinn sofort verschenken","auf einem Boot leben","ein Haus in den Bergen kaufen","bei einer Quizshow gewinnen","ein Restaurant eröffnen","mit 90 noch jede Party besuchen","sich ein exotisches Haustier zulegen","einen Berg besteigen, nur um ein Foto zu machen","zum Chef befördert werden","den Führerschein beim ersten Mal bestehen","ein Haus selbst bauen","Schauspieler werden"]
};
const MCATS=Object.keys(MQ);
OPT.most={rounds:10,timer:30,cats:{}};
function moCat(i,el){const k=MCATS[i];OPT.most.cats[k]=!OPT.most.cats[k];el.classList.toggle('on')}
GAMES.most={name:'Wer würde am ehesten?',e:'🗳️',tag:'Geheim abstimmen, Mehrheit erraten',c:['#a855f7','#ec4899'],min:3,teams:false,
  desc:'Eine Aussage, alle stimmen geheim ab, auf wen sie am besten passt. Wer liegt mit der Gruppe auf einer Linie?',
  rules:'Eine Aussage erscheint („Wer würde am ehesten …“). Jeder stimmt <b>geheim</b> für einen Mitspieler ab (auch für dich selbst darfst du stimmen). Danach wird aufgedeckt, wer wie viele Stimmen hat und wer wen gewählt hat. Der oder die <b>Meistgewählte</b> hat „gewonnen“ – und <b>jeder, der für ihn oder sie gestimmt hat, bekommt +1</b>. Bei Gleichstand gelten alle Erstplatzierten. Am Ende gibt es den Titel „Meiste Stimmen des Abends“. Mit Timer zählt eine nicht abgegebene Stimme nicht.',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Kategorien (nichts gewählt = alle)</p><div class="chips">${MCATS.map((k,i)=>`<span class="chip ${OPT.most.cats[k]?'on':''}" onclick="moCat(${i},this)">${esc(k)}</span>`).join('')}</div>
  <p class="sm" style="margin:16px 0 8px">Runden</p>${seg('most','rounds',[5,10,15,20])}<p class="sm" style="margin:14px 0 8px">Zeit zum Abstimmen</p>${seg('most','timer',[0,15,30,45],v=>v?v+' s':'Aus')}`,
  start:moStart};
function moStart(){
  const sel=MCATS.filter(k=>G.o.cats[k]),cats=sel.length?sel:MCATS,all=[];
  cats.forEach(c=>MQ[c].forEach(x=>all.push(x)));
  G.pool=ordered(all,x=>x,'m');G.rounds=Math.max(1,Math.min(G.o.rounds,G.pool.length));
  G.r=0;G.chosen=S.P.map(()=>0);G.tot=S.P.map(()=>0);moRound();
}
function moProg(){return prg(G.r+G.i/S.P.length,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}
function moRound(){
  G.st=G.pool[G.r];mark('m',G.st);G.v=[];G.i=0;
  if(NET.host){moPar();return}
  hand(G.i,'Stimme geheim ab – niemand schaut mit!',moVote,moProg());
}
function moCard(pi,online){
  return `<div class="card"><div class="row" style="align-items:center;gap:10px;margin-bottom:10px">${av(pi)}<span class="sm">${esc(S.P[pi])} stimmt ab</span></div>
  <div class="sm">Wer würde am ehesten …</div><div class="q" style="margin:6px 0 12px">${esc(G.st)}</div>
  ${S.P.map((p,i)=>`<button class="opt" style="--k:${i}" ${online?`data-sub="v" data-v="${i}"`:`onclick="moPick(${i},this)"`}>${av(i)}<span>${esc(p)}${i===pi?' (ich)':''}</span></button>`).join('')}</div>`;
}
function moVote(){scr(`${moProg()}${moCard(G.i,false)}`);if(G.o.timer)tmrShow(G.o.timer*1000,moTimeUp)}
function moNext(){G.i++;if(G.i<S.P.length)hand(G.i,'Stimme geheim ab – niemand schaut mit!',moVote,moProg());else moResult()}
function moPick(t,btn){
  tmrHide();btn.classList.add('sel');vib(30);sfx.pop();document.querySelectorAll('.opt').forEach(b=>b.style.pointerEvents='none');
  setTimeout(()=>{G.v[G.i]=t;moNext()},400);
}
function moTimeUp(){tmrHide();sfx.bad();vib([60,40,60]);G.v[G.i]=null;toast('⏰ Zeit um – keine Stimme');moNext()}
function moPar(){
  parBegin({head:moProg,dur:G.o.timer?[G.o.timer*1000]:null,msg:'Alle stimmen geheim und gleichzeitig ab …',steps:[
    {k:'v',timeout:pi=>{G.v[pi]=null},html:pi=>moCard(pi,true),
     sub:(pi,d)=>{const t=Number(d.v);if(d.v==null||!Number.isInteger(t)||t<0||t>=S.P.length)return 'Ungültige Wahl.';G.v[pi]=t;return true}}
  ],done:moResult});
}
function moResult(){
  const n=S.P.length,cnt=S.P.map(()=>0);S.P.forEach((_,i)=>{const t=G.v[i];if(t!=null)cnt[t]++});
  const mx=Math.max(0,...cnt),tops=cnt.map((c,i)=>c===mx&&mx>0?i:-1).filter(i=>i>=0);
  const gain=S.P.map((_,i)=>(G.v[i]!=null&&tops.includes(G.v[i]))?1:0);
  gain.forEach((g,i)=>G.pts[i]+=g);tops.forEach(i=>G.chosen[i]++);cnt.forEach((c,i)=>G.tot[i]+=c);
  const order=S.P.map((_,i)=>i).sort((a,b)=>cnt[b]-cnt[a]);
  const nv=S.P.map((_,i)=>i).filter(i=>G.v[i]==null),last=G.r+1>=G.rounds;
  scr(`${prg(G.r+1,G.rounds,`Runde ${G.r+1} von ${G.rounds}`)}<div class="card ans"><div class="sm">Wer würde am ehesten …</div><div class="q" style="margin-top:6px">${esc(G.st)}</div></div>
  ${tops.length?'':'<div class="card"><p style="margin:0">Niemand hat abgestimmt.</p></div>'}
  <div>${order.map((i,k)=>`<div class="res ${tops.includes(i)?'best':''}" style="--d:${(.3+k*.4).toFixed(2)}s"><div class="rh">${av(i)}<div class="nm">${esc(S.P[i])}${tops.includes(i)?'<span class="tag b">gewählt</span>':''}</div><div style="font-weight:850;font-size:22px">${cnt[i]}</div></div>
    <div class="sm" style="margin-top:6px">Gewählt von: ${S.P.filter((_,j)=>G.v[j]===i).map(esc).join(', ')||'niemandem'}</div></div>`).join('')}</div>
  <div class="late" style="--d:${(.3+n*.4+.3).toFixed(2)}s">${G.o.drink?drinkBox(tops.map(i=>`${esc(S.P[i])} trinkt ${Math.min(3,cnt[i])} Schlucke`)):''}${nv.length?`<p class="sm" style="margin:0 0 6px">⏰ Keine Stimme abgegeben: ${nv.map(i=>esc(S.P[i])).join(', ')}</p>`:''}${S.P.map((p,i)=>gain[i]?`<span class="tag t" style="margin:2px 4px 2px 0">${esc(p)} +1</span>`:'').join('')}${boardHTML(G.pts)}<button onclick="${last?'moFinish()':'G.r++;moRound()'}">${last?'Endergebnis 🏆':'Nächste Aussage'}</button></div>`);
  if(tops.length){setTimeout(()=>{confetti(50,GOLD);sfx.ok()},400)}
}
function moFinish(){
  const mx=Math.max(0,...G.tot),top=S.P.filter((_,i)=>G.tot[i]===mx&&mx>0);
  finish({extra:top.length?`<div class="card late" style="--d:1.2s;text-align:center"><div class="sm">Meiste Stimmen des Abends</div><div style="font-size:46px;margin:6px 0">🗳️</div><div class="big">${esc(top.join(', '))}</div><div class="sm">${mx} Stimmen insgesamt</div></div>`:''});
}

