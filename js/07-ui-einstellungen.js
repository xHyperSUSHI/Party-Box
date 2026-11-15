/* ---------- Einstellungen ---------- */
const tg=(k,l,sub)=>`<div class="trow" onclick="setC('${k}',${!C[k]})"><span>${l}${sub?`<br><span class="sm">${sub}</span>`:''}</span><i class="sw ${C[k]?'on':''}"></i></div>`;
function setC(k,v){C[k]=v;if(k==='sips'&&!v&&typeof DRKV!=='undefined')DRKV.forEach(g=>{OPT[g].drink=false});saveCfg();applyTheme();if(k==='sound'&&v)sfx.ok();settings()}
async function checkUpdate(){
  const e=$('upd');if(!e)return;e.textContent='Prüfe …';
  try{
    const r=await fetch(location.pathname+'?c='+Date.now(),{cache:'no-store'});
    const m=(await r.text()).match(/const APP_VERSION='([^']+)'/);if(!m)throw 0;
    if(m[1]===APP_VERSION)e.innerHTML='✅ Du hast den neuesten Stand.';
    else{e.innerHTML='🆕 Neue Version <b style="color:var(--tx)">'+esc(m[1])+'</b> verfügbar.';e.insertAdjacentHTML('beforeend','<button onclick="applyUpdate()" style="margin-top:8px">Jetzt aktualisieren</button>')}
  }catch(x){e.textContent='Keine Verbindung (oder offline) – versuche es später nochmal.'}
}
function applyUpdate(){
  if(NET.on&&!confirm('Das beendet die Online-Lobby. Trotzdem aktualisieren?'))return;
  location.replace(location.pathname+'?u='+Date.now()+location.hash);
}
function settings(){
  setLive(false);stopAll();TH=['var(--red2)','var(--red)'];
  scr(`<button class="sec back" onclick="home()">← Zurück</button>${logo('Einstellungen')}
  <div class="card"><h2>Wiederholungssperre</h2><p class="sm" style="margin-top:-4px">Fragen, Wörter und Orte kommen erst nach so vielen Tagen wieder. Ist nicht genug Auswahl da, kommt das am längsten Zurückliegende zuerst.</p>
  <div class="row">${[0,3,7,15,30].map(d=>`<button class="${C.days===d?'':'sec'} sg" onclick="setC('days',${d})">${d?d+' Tage':'Aus'}</button>`).join('')}</div>
  <p class="sm" style="margin:12px 0 0">Gerade gesperrt: <b style="color:var(--tx)">${blocked()}</b> Einträge</p>
  <button class="sec" onclick="clearHist();toast('Verlauf zurückgesetzt');settings()">Verlauf zurücksetzen</button></div>
  <div class="card"><h2>Trinkspiele (ab 18)</h2>${tg('drink','Kategorie „Trinkspiele“ anzeigen','Aus = Ich hab noch nie und Königsrunde verschwinden von der Startseite')}${tg('sips','Funktion „Schlucke verteilen“','Aus = keine Trink-Variante bei Arschkarte, Bluff, Wer würde am ehesten, Bombe, Reflex')}</div>
  <div class="card"><h2>Tastatur</h2><p class="sm" style="margin-top:-4px">Mit Magic Keyboard am iPad, am Mac und am PC:</p>
  <div class="sm" style="line-height:2.1">
  <span class="kbd">Tab</span> springt durch Knöpfe, <span class="kbd">Enter</span> / <span class="kbd">Leertaste</span> löst aus<br>
  <span class="kbd">Enter</span> Haupt-Knopf (Weiter, Los geht's, Nächste Frage …)<br>
  <span class="kbd">1</span>–<span class="kbd">9</span> Auswahl: Spiele, Spieler, Antworten, Orte<br>
  <span class="kbd">Leertaste</span> Reflex tippen, Bombe weitergeben<br>
  4 Gewinnt: <span class="kbd">1</span>–<span class="kbd">7</span> Spalte, oder <span class="kbd">←</span> <span class="kbd">→</span> und <span class="kbd">↓</span><br>
  Galgenmännchen: Buchstaben tippen · Codeknacker: <span class="kbd">1</span>–<span class="kbd">6</span> Farbe, <span class="kbd">⌫</span> löschen · Drei gewinnt: <span class="kbd">1</span>–<span class="kbd">9</span> Feld<br>
  Wellenlänge: <span class="kbd">←</span> <span class="kbd">→</span> Marker (mit <span class="kbd">Shift</span> in 5er-Schritten)<br>
  <span class="kbd">I</span> Info (?), <span class="kbd">S</span> Überspringen, <span class="kbd">T</span> Tabu, <span class="kbd">F</span> Falsch (Bombe)<br>
  <span class="kbd">Esc</span> Hauptmenü / Fenster schließen</div></div>
  <div class="card"><h2>Effekte</h2>${tg('fx','Animationen &amp; Konfetti','Aus = ruhiger und akkuschonender')}${tg('vib','Vibration')}${tg('sound','Ton','Ticken, Knall &amp; Jingles')}</div>
  <div class="card"><h2>App &amp; Fragen</h2><p class="sm" style="margin-top:-4px">Version <b style="color:var(--tx)">${APP_VERSION}</b> · ${[].concat(Q,...Object.values(QX)).length} feste Fragen plus automatisch erzeugte · ${BQ.length} Bluff-Fragen · ${Object.values(PW).reduce((a,l)=>a+l.length,0)} Pantomime-Begriffe</p>
  <div id="upd" class="sm" style="margin:8px 0"></div><button class="sec" onclick="checkUpdate()">🔄 Auf Update prüfen</button></div>
  <div class="card"><h2>Farbwelt</h2><div class="chips">${[['feuer','🔥 Feuer'],['neon','🪩 Neon'],['ozean','🌊 Ozean']].map(t=>`<span class="chip ${C.theme===t[0]?'on':''}" onclick="setC('theme','${t[0]}')">${t[1]}</span>`).join('')}</div></div>`);
}

/* ---------- Spiel-Setup ---------- */
function gameSetup(id){
  setLive(false);stopAll();CUR=id;const d=GAMES[id];TH=d.c;
  scr(`<button class="sec back" onclick="home()">← Spiele</button>
  <div class="hero"><div class="he">${d.e}</div><h1 style="margin:4px 0;font-size:34px;letter-spacing:-1px">${d.name}</h1><p style="margin:0">${d.desc}</p></div>
  ${modeCard()}
  <div class="card"><h2>Einstellungen</h2>${d.opts()}${DRKV.includes(id)?drinkChip(id):''}</div>
  <div class="card" style="padding:14px 18px"><details><summary>Regeln</summary>${d.rules}</details></div>
  <button onclick="startSession('${id}')">Los geht's</button>`);
}
const teamOn=()=>S.mode==='team'&&S.names.length>=4&&CUR&&GAMES[CUR].teams;
function setMode(m){S.mode=m;gameSetup(CUR)}
function setNt(k){S.nt=k;gameSetup(CUR)}
const tmKey=()=>S.names.map(n=>n.trim()).join('\u0001')+'|'+S.nt;
const validTm=()=>!!S.tm&&S.tmKey===tmKey();
function tmList(tm,lastP){
  return `<div style="margin-top:12px">${tm.map((a,t)=>`<div class="tmc" style="border-color:${tcol(t)}">${tb(t,38)}<div style="flex:1"><b>Team ${TN[t][1]}</b><div class="chips" style="margin-top:6px">${a.map(i=>`<span class="chip on" style="${i===lastP?'animation:pop .5s cubic-bezier(.3,1.6,.5,1);':''}background:${tcol(t)};box-shadow:none">${esc(S.names[i])}</span>`).join('')||'<span class="sm">…</span>'}</div></div></div>`).join('')}</div>`;
}
function modeCard(){
  const d=GAMES[CUR],n=S.names.length;
  if(!d.teams)return `<div class="card"><h2>Spielmodus</h2><p style="margin:0">Jeder gegen jeden – hier ergeben Teams keinen Sinn.</p></div>`;
  const mx=Math.max(2,Math.min(4,Math.floor(n/2)));if(S.nt>mx)S.nt=mx;if(d.nt2)S.nt=2;
  let h=`<div class="card"><h2>Spielmodus</h2><div class="row"><button class="${S.mode!='team'?'':'sec'} sg" onclick="setMode('solo')">Jeder gegen jeden</button><button class="${S.mode=='team'?'':'sec'} sg" onclick="setMode('team')">Teams 🎡</button></div>`;
  if(S.mode=='team'){
    if(n<4)h+=`<p>Für Teams braucht ihr mindestens 4 Spieler (aktuell ${n}).</p>`;
    else{
      if(!d.nt2)h+=`<p class="sm" style="margin:14px 0 0">Anzahl Teams</p><div class="row">${[2,3,4].filter(k=>k<=mx).map(k=>`<button class="${S.nt==k?'':'sec'} sg" onclick="setNt(${k})">${k}</button>`).join('')}</div>`;
      h+=`<button class="sec" onclick="wheel(()=>gameSetup(CUR),'Weiter')">🎡 Teams auslosen</button>`;
      h+=validTm()?tmList(S.tm):`<p class="sm" style="margin-bottom:0">Noch nicht ausgelost. Das Glücksrad startet beim Spielstart automatisch.</p>`;
    }
  }
  return h+'</div>';
}

