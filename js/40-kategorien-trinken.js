/* ================= Kategorien & Trinkspiele (ab 18) ================= */
const CATS=[{id:'quiz',n:'Quiz & Schätzen',s:'Quiz',e:'🧠',c:['#ff7a45','#ff2e4d']},{id:'party',n:'Party & Raten',s:'Party',e:'🎭',c:['#8f6cff','#3f7bff']},{id:'group',n:'Gruppe & Abstimmen',s:'Gruppe',e:'🗳️',c:['#c026d3','#ec4899']},{id:'brain',n:'Knobeln & Duell',s:'Knobeln',e:'🧩',c:['#14b8a6','#0ea5e9']},{id:'action',n:'Action & Reflex',s:'Action',e:'⚡',c:['#22c55e','#06b6d4']},{id:'drink',n:'Trinkspiele (ab 18)',s:'Trinken',e:'🍻',c:['#f59e0b','#ef4444']}];
const GCAT={arsch:'quiz',bluff:'quiz',hilo:'quiz',pant:'party',taboo:'party',wave:'party',slf:'party',spy:'group',most:'group',memo:'brain',bs:'brain',hang:'brain',code:'brain',c4:'brain',ttt:'brain',dots:'brain',react:'action',bomb:'action',never:'drink',kings:'drink'};
const DRKV=['arsch','bluff','most','bomb','react'];   // Spiele mit optionaler Trink-Variante
OPT.arsch.drink=OPT.bluff.drink=OPT.most.drink=OPT.bomb.drink=OPT.react.drink=false;
let HCAT='all',DNEXT=null;try{HCAT=localStorage.getItem('pb_cat')||'all'}catch(e){}
const drinkOn=()=>C.drink!==false,sipsOn=()=>C.sips!==false;
function setHCat(id){HCAT=id;try{localStorage.setItem('pb_cat',id)}catch(e){}home()}
function randomGame(){
  const n=S.names.length,ids=Object.keys(GAMES).filter(id=>GAMES[id].min<=n&&(HCAT==='all'?GAMES[id].cat!=='drink':GAMES[id].cat===HCAT));
  if(!ids.length){toast('Kein passendes Spiel für diese Spielerzahl');return}
  pickGame(pick(ids));
}
// Hinweis ab 18 (einmal bestätigen); alkoholfrei ist ausdrücklich in Ordnung
function drinkGate(go){
  let seen=false;try{seen=localStorage.getItem('pb_dnote')==='1'}catch(e){}
  if(seen){go();return}
  if(document.getElementById('dnote'))return;
  const d=document.createElement('div');d.className='pk';d.id='dnote';d.style.zIndex=70;
  d.innerHTML=`<div><h2>🍻 Nur für Erwachsene</h2><p style="margin-top:-4px">Trinkspiele sind ab 18 gedacht. Trinke nur, wenn du magst – <b>alkoholfrei geht genauso</b>, Schlucke sind nur Vorschläge. Niemand muss trinken, kein Alkohol am Steuer, achtet aufeinander.</p><button class="sec" onclick="dnoteNo()">Zurück</button><button onclick="dnoteYes()">Verstanden, ich bin 18 oder älter</button></div>`;
  document.body.appendChild(d);DNEXT=go;setTimeout(()=>{const b=d.querySelector('button.sec');if(b)b.focus()},30);
}
function dnoteNo(){const d=document.getElementById('dnote');if(d)d.remove();DNEXT=null}
function dnoteYes(){const d=document.getElementById('dnote');if(d)d.remove();try{localStorage.setItem('pb_dnote','1')}catch(e){}const f=DNEXT;DNEXT=null;if(f)f()}
function drinkTog(g,el){drinkGate(()=>{OPT[g].drink=!OPT[g].drink;el.classList.toggle('on',OPT[g].drink)})}
const drinkChip=g=>sipsOn()?`<p class="sm" style="margin:16px 0 8px">Trink-Variante (ab 18)</p><div class="chips"><span class="chip ${OPT[g].drink?'on':''}" onclick="drinkTog('${g}',this)">🍻 Schlucke verteilen</span></div><p class="sm" style="margin:8px 0 0">Nach jeder Runde stehen Vorschläge, wer wie viele Schlucke trinkt. Alkoholfrei geht genauso.</p>`:'';
const drinkBox=l=>l.length?`<div class="card" style="border-color:rgba(255,200,61,.55);background:rgba(255,200,61,.08)"><div class="sm">🍻 Schlucke (Vorschläge – alkoholfrei geht auch)</div>${l.map(x=>`<div style="margin-top:6px;font-weight:700">${x}</div>`).join('')}</div>`:'';
function rxDrink(idx){const bad=idx.filter(pi=>G.times[pi]===Infinity),l=bad.length?bad:[idx[idx.length-1]];return l.map(pi=>`${esc(S.P[pi])} trinkt 1 Schluck ${G.times[pi]===Infinity?'🙈':'🐢'}`)}
function bDrink(){return S.P.map((p,vi)=>{const k=G.votes[vi],o=k==null?null:G.opts[k];return o&&!o.real?`${esc(p)} trinkt 1 Schluck (auf „${esc(o.text)}“ hereingefallen)`:''}).filter(Boolean)}

