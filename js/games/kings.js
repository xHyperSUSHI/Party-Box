/* ---------- Königsrunde ---------- */
const KR=[['A','Alle','Alle trinken 1 Schluck.'],['2','Du','Verteile 2 Schlucke an eine Person deiner Wahl.'],['3','Ich','Du trinkst 2 Schlucke.'],['4','Boden','Alle tippen auf den Boden. Wer zuletzt tippt, trinkt 1 Schluck.'],['5','Himmel','Alle strecken die Hand nach oben. Wer zuletzt oben ist, trinkt 1 Schluck.'],['6','Kategorie','Nenne eine Kategorie (zum Beispiel Automarken). Reihum nennt jeder einen Begriff. Wer nichts weiß oder wiederholt, trinkt 2 Schlucke.'],['7','Reim','Nenne ein Wort. Reihum reimt sich jeder darauf. Wer scheitert, trinkt 1 Schluck.'],['8','Partner','Such dir eine Partnerin oder einen Partner. Ihr trinkt gemeinsam 1 Schluck.'],['9','Wahrheit','Beantworte eine Frage deiner Wahl ehrlich – oder trink 2 Schlucke.'],['10','Regel','Erfinde eine neue Regel (zum Beispiel nur mit der linken Hand trinken). Wer sie bricht, trinkt 1 Schluck.'],['B','Frage','Stelle eine Frage. Wer sie beantwortet, statt zurückzufragen, trinkt 1 Schluck.'],['D','Nie habe ich','Sage etwas, das du noch nie getan hast. Wer es schon getan hat, trinkt 1 Schluck.'],['K','König','Du bestimmst: Alle trinken 1 Schluck, oder du erfindest eine Mini-Aufgabe für die Runde.']];
const KS=[['♠','#111827'],['♥','#e11d48'],['♦','#e11d48'],['♣','#111827']];
OPT.kings={cards:26};
GAMES.kings={name:'Königsrunde',e:'👑',tag:'Karten ziehen, Regeln befolgen',c:['#d97706','#b45309'],min:2,teams:false,
  desc:'Reihum eine Karte ziehen. Jede Karte hat eine Regel – von „Alle trinken“ bis „Du bist König“.',
  rules:'Jeder zieht reihum eine Karte. Die Karte nennt eine Regel (zum Beispiel „Verteile 2 Schlucke“ oder „Reim“). Alle befolgen sie. Das Spiel endet, wenn die gewählte Kartenzahl gezogen ist. Schlucke sind nur Vorschläge – <b>alkoholfrei geht genauso</b>, niemand muss trinken. Nur für Erwachsene (ab 18).',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Anzahl Karten</p>${seg('kings','cards',[13,26,52])}`,
  start:kiStart};
function kiStart(){
  const deck=[];for(let r=0;r<13;r++)for(let s=0;s<4;s++)deck.push([r,s]);
  G.deck=shuffle(deck).slice(0,G.o.cards);G.k=0;G.cur=0;kiTurn();
}
function kiTurn(){
  const p=G.cur;
  scr(`${prg(G.k,G.deck.length,`Karte ${G.k+1} von ${G.deck.length}`)}<div class="card hand">${av(p,'l')}<p style="margin:0">Am Zug</p><div class="big">${esc(S.P[p])}</div><p>Zieh eine Karte und befolge die Regel.</p><button onclick="kiDraw()">🂠 Karte ziehen</button></div>`);
}
function kiDraw(){G.show=G.deck[G.k];kiShow()}
function kiShow(){
  const [r,s]=G.show,R=KR[r],K=KS[s],p=G.cur,last=G.k+1>=G.deck.length;
  scr(`${prg(G.k+1,G.deck.length,`Karte ${G.k+1} von ${G.deck.length}`)}<div class="pcard flipin" style="color:${K[1]}"><b>${R[0]}</b><span>${K[0]}</span><b class="b2">${R[0]}</b></div>
  <div class="card ans"><div class="sm">${esc(S.P[p])} hat gezogen</div><div class="big" style="margin:6px 0">${R[1]}</div><p style="margin:0;color:var(--tx)">${R[2]}</p></div>
  <button onclick="${last?'kiEnd()':'G.k++;G.cur=(G.cur+1)%S.P.length;kiTurn()'}">${last?'Fertig':'Weiter'}</button>`);
  sfx.pop();
}
function kiEnd(){
  stopAll();setLive(false);
  scr(`${logo('Königsrunde',1)}<div class="card ans"><div style="font-size:56px">👑</div><div class="big">Das war's!</div><p>Alle Karten sind gezogen. Trinkt zwischendurch auch Wasser. 💧</p></div>
  <button onclick="startSession('kings')">Nochmal</button><button class="sec" onclick="gameSetup('kings')">Einstellungen ändern</button><button class="sec" onclick="home()">← Alle Spiele</button>`);
  confetti(80,GOLD);sfx.win();
}

