/* ================= Profil & Charakter (Stufe 1: nur auf dem Gerät, kein Server) =================
   Charakter = kleines Objekt aus ganzzahligen Indizes in feste Listen (CH_PARTS), z. B. {f:1,h:2,c:0,…}.
   Eigenes Profil: localStorage pb_prof = {v:1,n:Name,av:{…}} · weitere Namen: pb_chars = {"name klein":{…}}.
   Fremde Daten (Online-Paket, localStorage) laufen IMMER durch charOk(): nur bekannte Schlüssel, ganze Zahlen im
   erlaubten Bereich, JSON < 200 Bytes – sonst verworfen. Im SVG landen nur Farben/Pfade aus den festen Listen. */
const CH_SKIN=['#fbe0cc','#f3c79b','#e2aa72','#c68642','#93592c','#5e3b22'];
const CH_HAIR=['#2a2228','#4a2c17','#7a4a26','#c99a55','#f0d27a','#b0482a','#a7aeb8','#ff5fa2','#7a6bff','#2ec4b6'];
const CH_EYE=['#5a3a22','#3f7bff','#2f9a5b','#6b7280'];
const CH_TOP=['#2fbf5b','#ffffff','#1f1f26','#7a4a2a','#3f7bff','#ff2e4d','#ffc145','#8f6cff','#ff7a45','#9aa3ad','#ff9ec8','#14b8a6'];
const CH_PANT=['#4a6fa5','#2b3a55','#1f1f26','#c9b48a','#6b7280','#e8e8ee','#3d6b45','#8b3a3a'];
const CH_BG=[['#ff7a45','#ff2e4d'],['#8f6cff','#3f7bff'],['#2ec4b6','#167a8a'],['#ffc145','#ff7a45'],['#ff5fa2','#b13cff'],['#34d399','#0e8f68'],['#6b7590','#2a2f45'],['#5ad1ff','#2f6bff']];
/* [Schlüssel, Bezeichnung, Varianten, Bereich im Editor] – die Länge der Variantenliste ist der erlaubte Wertebereich.
   Erweitern: nur hinten anhängen (alte Profile behalten ihre Indizes). */
const CH_PARTS=[
  ['f','Hautton',['Hell','Hell-warm','Mittel','Oliv','Braun','Dunkel'],'kopf'],
  ['h','Frisur',['Wuschelig','Zurückgegelt','Dutt','Lang','Locken','Bob','Pferdeschwanz','Glatze','Afro','Seitenscheitel','Kurz','Zöpfe'],'kopf'],
  ['c','Haarfarbe',['Schwarz','Dunkelbraun','Braun','Dunkelblond','Blond','Rot','Grau','Pink','Lila','Türkis'],'kopf'],
  ['g','Bart',['Kein Bart','Stoppeln','Kinnbart','Vollbart','Schnurrbart'],'kopf'],
  ['e','Augen',['Offen','Fröhlich','Zwinkern','Müde','Wimpern'],'kopf'],
  ['y','Augenfarbe',['Braun','Blau','Grün','Grau'],'kopf'],
  ['m','Mund',['Lächeln','Lachen','Neutral','Oh','Zunge','Schief'],'kopf'],
  ['t','Oberteil',['T-Shirt','Polo','Tanktop','Hoodie','Kurzes Top','Karohemd','Pulli'],'outfit'],
  ['o','Farbe Oberteil',['Grün','Weiß','Schwarz','Braun','Blau','Rot','Gelb','Lila','Orange','Grau','Rosa','Türkis'],'outfit'],
  ['p','Hose',['Jeans','Shorts','Bermuda','Karohose','Rock','Jogginghose'],'outfit'],
  ['q','Farbe Hose',['Jeansblau','Dunkelblau','Schwarz','Beige','Grau','Weiß','Oliv','Weinrot'],'outfit'],
  ['s','Schuhe',['Sneaker','Sandalen','Flip-Flops','Stiefel','Badelatschen','Hausschuhe','Barfuß'],'outfit'],
  ['k','Socken',['Keine','Kurz','Mittel','Lang'],'outfit'],
  ['a','Extra',['Nichts','Brille','Sonnenbrille','Partyhut','Kopfhörer','Krone','Schleife','Mütze','Cap'],'extra'],
  ['b','Hintergrund',['Feuer','Violett','Ozean','Sonne','Pink','Grün','Nacht','Himmel'],'extra']
];
const CH_MAX=200;
/* Prüft einen (fremden) Wert. Unbekannte Schlüssel werden ignoriert (spätere Versionen), fehlende = 0. */
function charOk(o){
  if(!o||typeof o!=='object'||Array.isArray(o))return null;
  let s;try{s=JSON.stringify(o)}catch(e){return null}
  if(!s||s.length>CH_MAX)return null;
  const r={};
  for(const [k,,l] of CH_PARTS){
    const v=Object.prototype.hasOwnProperty.call(o,k)?o[k]:0;
    if(typeof v!=='number'||!Number.isInteger(v)||v<0||v>=l.length)return null;
    r[k]=v;
  }
  return r;
}
function charRand(){
  const r={},R=n=>Math.floor(Math.random()*n);
  CH_PARTS.forEach(([k,,l])=>r[k]=R(l.length));
  if(Math.random()<.6)r.a=0;if(Math.random()<.55)r.g=0;if(Math.random()<.5)r.c=R(6);if(r.s===6&&Math.random()<.7)r.s=0;
  return r;
}
const chKey=n=>String(n==null?'':n).trim().toLowerCase().slice(0,16);
const chDefault=n=>!String(n||'').trim()||/^spieler \d+$/i.test(String(n).trim());
/* ---------- Speicher (alles in try/catch) ---------- */
function profGet(){try{const p=JSON.parse(localStorage.getItem('pb_prof')||'null');if(p&&typeof p==='object'){const n=cleanName(p.n,'');return {v:1,n:chDefault(n)?'':n,av:charOk(p.av)}}}catch(e){}return {v:1,n:'',av:null}}
function profSet(p){try{localStorage.setItem('pb_prof',JSON.stringify({v:1,n:p.n||'',av:charOk(p.av)}))}catch(e){}}
let CHM=null;
function charsGet(){
  if(CHM)return CHM;CHM={};
  try{const m=JSON.parse(localStorage.getItem('pb_chars')||'null');if(m&&typeof m==='object'&&!Array.isArray(m))Object.keys(m).slice(0,60).forEach(k=>{const c=charOk(m[k]);if(c&&!chDefault(k))CHM[chKey(k)]=c})}catch(e){}
  return CHM;
}
function charsSet(name,c){
  if(chDefault(name))return;const m=charsGet(),k=chKey(name);
  if(c)m[k]=c;else delete m[k];
  const ks=Object.keys(m);if(ks.length>60)delete m[ks[0]];
  try{localStorage.setItem('pb_chars',JSON.stringify(m))}catch(e){}
}
/* Lokaler Charakter zu einem Namen: eigenes Profil zuerst, dann Name→Charakter */
function charLocal(n){
  if(chDefault(n))return null;
  const p=profGet();if(p.av&&p.n&&chKey(p.n)===chKey(n))return p.av;
  return charsGet()[chKey(n)]||null;
}
/* Charakter zu einem Spielernamen: online (Host) aus NET.m, sonst lokal */
function charByName(n){
  if(n==null)return null;
  if(NET.on&&NET.host&&NET.m){const m=NET.m.find(x=>x.name===n);if(m)return m.av||null}
  return charLocal(n);
}
function charOf(i){return charByName(nameOf(i))}
const charBg=c=>`linear-gradient(135deg,${CH_BG[c.b][0]},${CH_BG[c.b][1]})`;

/* ---------- Zeichnen ----------
   figSVG(c,{bust,pose,vb,ini}) – c = geprüfter Charakter oder null (neutrale Figur mit Anfangsbuchstabe ini).
   bust = nur Kopf/Schultern (Avatar-Kreis), pose = 'stand'|'wave'|'cheer'|'sit'|'walk' (Animation per CSS, Klassen .fa1/.fa2/.fl1/.fl2). */
function figSVG(c,o){
  o=o||{};const pose=o.pose||'stand',bust=!!o.bust,sit=pose==='sit'&&!bust;
  c=c?charOk(c):null;const neutral=!c;
  const N={f:0,h:7,c:0,g:0,e:0,y:0,m:0,t:0,o:0,p:0,q:0,s:0,k:0,a:0,b:6};
  if(neutral)c=N;
  const sk=neutral?'#8a93ad':CH_SKIN[c.f],hc=CH_HAIR[c.c],tc=neutral?'#4b5370':CH_TOP[c.o],pc=neutral?'#3a4160':CH_PANT[c.q];
  const ink='#2b2233',shade='rgba(0,0,0,.16)',hl='rgba(255,255,255,.2)';
  const sy=sit?44:0; // Oberkörper sitzt tiefer
  let back='',legs='',body='',head='';
  // ----- Haare hinten
  back={3:`<path d="M35 46C31 14 89 14 85 46C88 70 92 92 82 98C78 84 80 72 78 64H42C40 72 42 84 38 98C28 92 32 70 35 46Z" fill="${hc}"/>`,
    5:`<path d="M34 48C30 16 90 16 86 48V72C80 74 76 70 76 62H44C44 70 40 74 34 72Z" fill="${hc}"/>`,
    6:`<path d="M80 32C102 40 100 76 88 88C90 72 86 56 77 46Z" fill="${hc}"/><path d="M84 40C94 50 94 66 89 78" stroke="${hl}" stroke-width="2" fill="none"/>`,
    8:`<circle cx="60" cy="40" r="34" fill="${hc}"/>`,
    11:`<path d="M34 42C22 50 22 74 28 86C30 72 32 60 38 50ZM86 42C98 50 98 74 92 86C90 72 88 60 82 50Z" fill="${hc}"/><circle cx="35" cy="44" r="4" fill="#ff5fa2"/><circle cx="85" cy="44" r="4" fill="#ff5fa2"/>`}[neutral?-1:c.h]||'';
  // ----- Beine, Socken, Schuhe
  if(!bust){
    const shoe=(x,y)=>[
      `<path d="M${x-3} ${y}H${x+17}Q${x+24} ${y+2} ${x+24} ${y+10}V${y+14}H${x-3}Z" fill="#fff"/><rect x="${x-3}" y="${y+11}" width="27" height="4" rx="2" fill="#c8c8d4"/><path d="M${x+2} ${y+4}H${x+12}M${x+3} ${y+7}H${x+11}" stroke="#b8b8c6" stroke-width="1.4"/>`,
      `<ellipse cx="${x+9}" cy="${y+8}" rx="12" ry="5" fill="${sk}"/><rect x="${x-3}" y="${y+11}" width="26" height="4" rx="2" fill="#5a3a22"/><rect x="${x-2}" y="${y+2}" width="22" height="4" rx="2" fill="#3a2414"/><rect x="${x}" y="${y+7}" width="20" height="4" rx="2" fill="#3a2414"/>`,
      `<ellipse cx="${x+9}" cy="${y+8}" rx="12" ry="5" fill="${sk}"/><rect x="${x-3}" y="${y+11}" width="26" height="4" rx="2" fill="#1f1f26"/><path d="M${x+2} ${y+11}L${x+9} ${y+3}L${x+16} ${y+11}" stroke="#1f1f26" stroke-width="2.4" fill="none"/>`,
      `<path d="M${x-2} ${y-28}H${x+19}V${y+2}Q${x+25} ${y+4} ${x+25} ${y+10}V${y+15}H${x-3}Z" fill="#2f4a2f"/><path d="M${x+14} ${y-28}V${y+2}" stroke="${shade}" stroke-width="4"/><rect x="${x-3}" y="${y+12}" width="28" height="3" fill="#1d2e1d"/>`,
      `<ellipse cx="${x+9}" cy="${y+8}" rx="12" ry="5" fill="${sk}"/><rect x="${x-3}" y="${y+11}" width="26" height="4" rx="2" fill="#1f1f26"/><rect x="${x-2}" y="${y+2}" width="22" height="8" rx="3" fill="#1f1f26"/><path d="M${x+2} ${y+6}H${x+16}" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>`,
      `<path d="M${x-4} ${y}Q${x+10} ${y-6} ${x+25} ${y+4}Q${x+27} ${y+15} ${x+10} ${y+15}H${x-4}Z" fill="#f2f2f6"/><path d="M${x} ${y+4}Q${x+10} ${y} ${x+20} ${y+6}" stroke="#d6d6e2" stroke-width="2" fill="none"/>`,
      `<ellipse cx="${x+9}" cy="${y+9}" rx="12" ry="6" fill="${sk}"/><path d="M${x+14} ${y+5}V${y+8}M${x+17} ${y+6}V${y+9}" stroke="${shade}" stroke-width="1.5"/>`
    ][neutral?0:c.s];
    const sock=(x,yb)=>{const l=neutral?0:[0,6,16,32][c.k];if(!l||c.s===3||c.s===6)return '';return `<rect x="${x}" y="${yb-l}" width="17" height="${l+4}" rx="5" fill="#f4f4f8"/><rect x="${x}" y="${yb-l}" width="17" height="3" fill="#dcdce6"/>`};
    const P=neutral?0:c.p,shorts=P===1||P===2||P===4;
    if(!sit){
      // Beine stehend, je Bein eine Gruppe (Drehpunkt Hüfte) für Laufen
      const leg=(x,cl)=>{
        let s=`<rect x="${x}" y="150" width="17" height="90" rx="8" fill="${sk}"/>`+sock(x,238);
        const lo=P===1?186:P===2?198:P===4?178:236;
        if(P!==4)s+=`<path d="M${x-1} 148H${x+18}V${lo}H${x-1}Z" fill="${pc}"/>`;
        if(P===3)s+=`<path d="M${x+5} 148V${lo}M${x+12} 148V${lo}M${x-1} 166H${x+18}M${x-1} 184H${x+18}M${x-1} 202H${x+18}M${x-1} 220H${x+18}" stroke="${ink}" stroke-opacity=".22" stroke-width="2"/>`;
        if(P===5)s+=`<rect x="${x-1}" y="${lo-8}" width="19" height="6" rx="2" fill="${shade}"/>`;
        if(P===2)s+=`<path d="M${x-1} ${lo-4}H${x+18}" stroke="${hl}" stroke-width="3"/>`;
        s+=`<path d="M${x+12} 150V${lo}" stroke="${shade}" stroke-width="5"/>`;
        return `<g class="${cl}">${s}${shoe(x,236)}</g>`;
      };
      legs=leg(42,'fl1')+leg(61,'fl2');
      legs+=P===4?`<path d="M40 144H80L91 196H29Z" fill="${pc}"/><path d="M70 144L80 144L91 196H76Z" fill="${shade}"/>`:`<path d="M38 144H82V160Q71 158 60 172Q49 158 38 160Z" fill="${pc}"/>`;
    }else{
      // Sitzend (von vorn): Oberschenkel verkürzt, Unterschenkel senkrecht
      const leg=x=>{
        let s=`<rect x="${x}" y="196" width="17" height="44" rx="8" fill="${shorts?sk:pc}"/>`+sock(x,238);
        if(P===3)s+=`<path d="M${x+5} 196V238M${x+12} 196V238M${x} 214H${x+17}" stroke="${ink}" stroke-opacity=".22" stroke-width="2"/>`;
        s+=`<rect x="${x-2}" y="184" width="21" height="22" rx="9" fill="${pc}"/>`;
        return s+shoe(x,236);
      };
      legs=leg(41)+leg(62)+`<path d="M38 ${144+sy}H82V${170+sy}H38Z" fill="${pc}"/>`;
    }
  }
  // ----- Arme (Gruppen mit Drehpunkt Schulter für Winken/Jubeln)
  const T=neutral?0:c.t,sleeve=[1,1,0,2,0,2,2][T];
  const armTo={stand:[[30,150],[90,150]],wave:[[30,150],[96,58]],cheer:[[16,52],[104,52]],walk:[[30,150],[90,150]],sit:[[34,150],[86,150]]}[pose]||[[30,150],[90,150]];
  const arm=(x1,[x2,y2],cl)=>{
    const y1=92,lx=x1+(x2-x1)*.36,ly=y1+(y2-y1)*.36,ex=x2-(x2-x1)*.1,ey=y2-(y2-y1)*.1;
    let s=`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${sk}" stroke-width="12" stroke-linecap="round"/><circle cx="${x2}" cy="${y2+(y2>y1?2:-2)}" r="7" fill="${sk}"/>`;
    if(sleeve===1)s+=`<path d="M${x1} ${y1}L${lx} ${ly}" stroke="${tc}" stroke-width="15" stroke-linecap="round"/>`;
    if(sleeve===2)s+=`<path d="M${x1} ${y1}L${ex} ${ey}" stroke="${tc}" stroke-width="14" stroke-linecap="round"/>`+(T===5?`<path d="M${x1} ${y1}L${ex} ${ey}" stroke="${ink}" stroke-opacity=".16" stroke-width="14" stroke-dasharray="3 6"/>`:'');
    return `<g class="${cl}">${s}</g>`;
  };
  body+=arm(38,armTo[0],'fa1')+arm(82,armTo[1],'fa2');
  // ----- Hals + Oberteil
  body+=`<rect x="52" y="66" width="16" height="20" rx="6" fill="${sk}"/><rect x="52" y="72" width="16" height="6" fill="${shade}"/>`;
  const torso='M36 92Q36 82 50 81H70Q84 82 84 92L83 150H37Z';
  body+=[
    `<path d="${torso}" fill="${tc}"/><path d="M52 81Q60 90 68 81" stroke="${shade}" stroke-width="3" fill="none"/>`,
    `<path d="${torso}" fill="${tc}"/><path d="M50 81L58 92L54 98ZM70 81L62 92L66 98Z" fill="${tc}" stroke="${shade}" stroke-width="1.5"/><path d="M60 92V110" stroke="${shade}" stroke-width="2"/><circle cx="60" cy="100" r="1.5" fill="${shade}"/><circle cx="60" cy="107" r="1.5" fill="${shade}"/>`,
    `<path d="M42 92Q42 84 50 82Q60 92 70 82Q78 84 78 92L83 150H37Z" fill="${tc}"/>`,
    `<path d="${torso}" fill="${tc}"/><path d="M46 82Q60 100 74 82" stroke="${shade}" stroke-width="5" fill="none"/><path d="M56 92V104M64 92V104" stroke="#fff" stroke-opacity=".7" stroke-width="1.6"/><rect x="46" y="126" width="28" height="14" rx="4" fill="${shade}"/>`,
    `<path d="M40 92Q40 84 50 82Q60 90 70 82Q80 84 80 92L80 128H40Z" fill="${tc}"/><rect x="40" y="128" width="40" height="20" fill="${sk}"/><ellipse cx="60" cy="140" rx="1.6" ry="2.2" fill="${shade}"/>`,
    `<path d="${torso}" fill="${tc}"/><path d="M60 82V150" stroke="${shade}" stroke-width="2"/><path d="M36 100H84M36 118H84M36 136H84M48 82V150M72 82V150" stroke="${ink}" stroke-opacity=".18" stroke-width="2.5"/><path d="M52 81L60 90L68 81" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none"/>`,
    `<path d="${torso}" fill="${tc}"/><path d="M52 81Q60 88 68 81" stroke="${shade}" stroke-width="4" fill="none"/><rect x="37" y="143" width="46" height="7" rx="3" fill="${shade}"/>`
  ][T]+`<path d="M78 84Q84 86 84 92L83 ${T===4?128:150}H74Z" fill="${shade}"/>`;
  if(neutral&&o.ini)body+=`<text x="60" y="126" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" fill-opacity=".85" font-family="system-ui,sans-serif">${esc(String(o.ini).charAt(0).toUpperCase())}</text>`;
  // ----- Kopf
  head+=`<circle cx="37" cy="52" r="6" fill="${sk}"/><circle cx="83" cy="52" r="6" fill="${sk}"/>`;
  head+=`<ellipse cx="60" cy="48" rx="23" ry="26" fill="${sk}"/><path d="M74 30Q87 48 74 70Q80 50 74 30Z" fill="${shade}"/>`;
  if(neutral){
    head+=`<circle cx="51" cy="50" r="3" fill="#2a2f45" opacity=".7"/><circle cx="69" cy="50" r="3" fill="#2a2f45" opacity=".7"/><path d="M53 62Q60 66 67 62" stroke="#2a2f45" stroke-opacity=".7" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  }else{
    head+=['',`<path d="M42 58Q44 76 60 77Q76 76 78 58Q72 70 60 70Q48 70 42 58Z" fill="${hc}" opacity=".35"/>`,
      `<path d="M50 66Q60 81 70 66Q66 72 60 72Q54 72 50 66Z" fill="${hc}"/>`,
      `<path d="M38 50Q40 79 60 80Q80 79 82 50Q78 66 72 66Q66 62 60 64Q54 62 48 66Q42 66 38 50Z" fill="${hc}"/>`,
      `<path d="M50 60Q55 56 60 59Q65 56 70 60Q65 62 60 61Q55 62 50 60Z" fill="${hc}"/>`][c.g];
    head+=[
      `<path d="M36 46C34 22 46 14 60 14C76 14 86 24 84 46C82 34 78 30 72 30C70 24 62 30 56 26C52 32 44 28 42 34C38 36 37 40 36 46Z" fill="${hc}"/><path d="M48 18L52 9L56 18M60 16L66 7L66 18M70 18L78 11L74 22M42 22L44 13L50 20" fill="${hc}"/>`,
      `<path d="M36 46C34 20 48 14 62 14C78 15 86 26 84 46C82 34 74 26 60 26C48 26 40 34 36 46Z" fill="${hc}"/><path d="M44 22Q60 16 78 24M46 28Q62 20 80 30" stroke="${hl}" stroke-width="2" fill="none"/>`,
      `<path d="M36 46C34 22 46 16 60 16C74 16 86 22 84 46C82 34 74 26 60 26C46 26 38 34 36 46Z" fill="${hc}"/><circle cx="62" cy="10" r="8.5" fill="${hc}"/><path d="M56 6Q53 -3 60 1M66 4Q73 -4 70 4M60 2Q62 -5 65 1" stroke="${hc}" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="55" y="15" width="13" height="3" rx="1.5" fill="${ink}"/><path d="M44 24Q60 18 76 26" stroke="${hl}" stroke-width="2" fill="none"/>`,
      `<path d="M36 50C34 22 46 14 60 14C74 14 86 22 84 50C80 36 72 28 64 28C56 34 42 38 36 50Z" fill="${hc}"/><path d="M48 20Q60 15 74 22" stroke="${hl}" stroke-width="2" fill="none"/>`,
      [[38,38,8],[42,27,8],[50,20,9],[61,17,9],[72,21,9],[80,30,8],[82,41,7],[36,48,6]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${hc}"/>`).join(''),
      `<path d="M35 48C34 24 47 16 60 16C73 16 86 24 85 48C79 42 72 34 69 30C61 38 46 42 35 48Z" fill="${hc}"/>`,
      `<path d="M36 46C34 22 46 16 60 16C74 16 86 22 84 46C82 34 74 28 60 28C46 28 38 34 36 46Z" fill="${hc}"/><circle cx="81" cy="34" r="4" fill="#ff5fa2"/>`,
      `<path d="M44 30C48 24 54 22 60 22" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>`,
      `<path d="M38 44C40 32 49 28 60 28C71 28 80 32 82 44C76 38 68 36 60 36C52 36 44 38 38 44Z" fill="${hc}"/>`,
      `<path d="M36 47C31 22 50 13 65 16C79 18 88 29 84 47C82 37 76 31 69 28C61 35 47 35 36 47Z" fill="${hc}"/><path d="M52 18Q66 15 80 26" stroke="${hl}" stroke-width="2" fill="none"/>`,
      `<path d="M37 42C37 26 47 21 60 21C73 21 83 26 83 42C79 33 71 29 60 29C49 29 41 33 37 42Z" fill="${hc}"/><path d="M37 42C37 26 47 21 60 21C73 21 83 26 83 42" stroke="${hc}" stroke-width="2" stroke-dasharray="1 3" fill="none" opacity=".6"/>`,
      `<path d="M35 48C34 24 47 16 60 16C73 16 86 24 85 48C80 38 70 30 60 30C50 30 40 38 35 48Z" fill="${hc}"/><path d="M60 16V30" stroke="${shade}" stroke-width="2"/>`
    ][c.h];
    const ey=50,ec=CH_EYE[c.y];
    const eye=x=>`<ellipse cx="${x}" cy="${ey}" rx="4.6" ry="5.2" fill="#fff"/><circle cx="${x+.5}" cy="${ey+.5}" r="3.4" fill="${ec}"/><circle cx="${x+.5}" cy="${ey+.5}" r="1.8" fill="${ink}"/><circle cx="${x+1.8}" cy="${ey-1.2}" r="1.1" fill="#fff"/>`;
    const happy=x=>`<path d="M${x-4.5} ${ey+1}Q${x} ${ey-4.5} ${x+4.5} ${ey+1}" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    const sleepy=x=>`<path d="M${x-4.6} ${ey}H${x+4.6}" stroke="${sk}" stroke-width="0"/><ellipse cx="${x}" cy="${ey+1.5}" rx="4.4" ry="3" fill="#fff"/><circle cx="${x+.3}" cy="${ey+2}" r="2.6" fill="${ec}"/><path d="M${x-5} ${ey}H${x+5}" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`;
    const lash=(x,d)=>eye(x)+`<path d="M${x+d*3} ${ey-4.4}L${x+d*6.5} ${ey-7}M${x+d*.5} ${ey-5.2}L${x+d*2} ${ey-8.5}" stroke="${ink}" stroke-width="1.6" stroke-linecap="round"/>`;
    head+=[eye(51)+eye(69),happy(51)+happy(69),eye(51)+happy(69),sleepy(51)+sleepy(69),lash(51,-1)+lash(69,1)][c.e];
    head+=`<path d="M45 41Q51 38 56 41M64 41Q69 38 75 41" stroke="${c.h===7?'rgba(0,0,0,.4)':hc}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    head+=`<path d="M57 52Q56 58 60 59" stroke="${shade}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    const my=64,lip='#a0464f';
    head+=[`<path d="M53 ${my}Q60 ${my+5} 67 ${my}" stroke="${lip}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`,
      `<path d="M51 ${my-1}Q60 ${my+11} 69 ${my-1}Z" fill="${ink}"/><path d="M55 ${my+4}Q60 ${my+2} 65 ${my+4}Q60 ${my+7} 55 ${my+4}Z" fill="#ff6b81"/><path d="M53 ${my}H67" stroke="#fff" stroke-width="1.6"/>`,
      `<path d="M54 ${my+1}H66" stroke="${lip}" stroke-width="2.6" stroke-linecap="round"/>`,
      `<ellipse cx="60" cy="${my+2}" rx="3.6" ry="4.4" fill="${ink}"/>`,
      `<path d="M53 ${my}Q60 ${my+4} 67 ${my}" stroke="${lip}" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M57 ${my+2}H64V${my+6}A3.5 3.5 0 0 1 57 ${my+6}Z" fill="#ff6b81"/>`,
      `<path d="M53 ${my+1}Q62 ${my+5} 68 ${my-3}" stroke="${lip}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`][c.m];
    head+=`<circle cx="45" cy="60" r="4" fill="#ff6b81" opacity=".22"/><circle cx="75" cy="60" r="4" fill="#ff6b81" opacity=".22"/>`;
    const ay=50;
    head+=['',
      `<g fill="none" stroke="${ink}" stroke-width="2.2"><circle cx="51" cy="${ay}" r="7.5"/><circle cx="69" cy="${ay}" r="7.5"/><path d="M58.5 ${ay}H61.5M43.5 ${ay-1}L37 ${ay-3}M76.5 ${ay-1}L83 ${ay-3}"/></g>`,
      `<g fill="${ink}"><rect x="42" y="${ay-6}" width="17" height="11" rx="5"/><rect x="61" y="${ay-6}" width="17" height="11" rx="5"/></g><path d="M59 ${ay-2}H61M42 ${ay-3}L37 ${ay-4}M78 ${ay-3}L83 ${ay-4}" stroke="${ink}" stroke-width="2.2"/><path d="M45 ${ay-3}H49M64 ${ay-3}H68" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"/>`,
      `<path d="M48 20L62 -6L72 22Z" fill="#ffc145"/><path d="M52 13L66 9M56 5L65 3" stroke="#ff2e4d" stroke-width="2.6"/><circle cx="62" cy="-6" r="4" fill="#ff5fa2"/>`,
      `<path d="M34 50C34 14 86 14 86 50" stroke="#2a2f45" stroke-width="5" fill="none"/><rect x="28" y="42" width="11" height="18" rx="5" fill="#ff2e4d"/><rect x="81" y="42" width="11" height="18" rx="5" fill="#ff2e4d"/>`,
      `<path d="M41 24L43 7L52 16L60 4L68 16L77 7L79 24Z" fill="#ffc145" stroke="#e09a1a" stroke-width="1.5" stroke-linejoin="round"/><circle cx="60" cy="17" r="2.4" fill="#ff2e4d"/>`,
      `<path d="M78 22L68 15V29ZM78 22L88 15V29Z" fill="#ff5fa2"/><circle cx="78" cy="22" r="3" fill="#d43f86"/>`,
      `<path d="M35 38C33 10 87 10 85 38Z" fill="#3f7bff"/><rect x="33" y="33" width="54" height="9" rx="4.5" fill="#2a56c9"/><circle cx="60" cy="8" r="5" fill="#fff"/>`,
      `<path d="M36 36C36 14 84 14 84 36Z" fill="#ff2e4d"/><path d="M36 36H96Q94 42 84 41H36Z" fill="#c81e3a"/><circle cx="60" cy="16" r="2.5" fill="#c81e3a"/>`
    ][c.a];
  }
  const up=sy?`<g transform="translate(0 ${sy})">${back}${body}${head}</g>`:back+body+head;
  const vb=o.vb||(bust?'10 2 100 100':'0 -12 120 268');
  return `<svg class="fig p-${pose}" viewBox="${vb}" aria-hidden="true">${legs}${up}</svg>`;
}
/* Kreis-Avatar mit Charakter (Hintergrund = gewählte Farbe) */
const charAv=(c,cls,sz)=>`<div class="av ch ${cls||''}" style="${sz?`width:${sz}px;height:${sz}px;`:''}background:${charBg(c)}">${figSVG(c,{bust:1})}</div>`;
/* Ganzkörper für Spieler i (ohne Charakter: neutrale Figur mit Anfangsbuchstabe) */
const figOf=(i,pose)=>{const c=charOf(i);return figSVG(c,{pose,ini:(nameOf(i)||'?').trim()})};

/* ---------- Profil-/Charakter-Editor ----------
   PED = {who:'me'|'name', n:Name, c:Charakter, back, tab} */
let PED=null;
function profOpen(back){
  const p=profGet();let n=p.n||myName()||'';if(chDefault(n))n='';
  PED={who:'me',n,c:Object.assign({},p.av||charLocal(n)||charRand()),back:back||'home',tab:'kopf'};profEdit();
}
function charOpen(i){
  saveNames();const n=(S.names[i]||'').trim();
  if(chDefault(n)){toast('Erst einen Namen eintragen');const e=document.querySelector(`#pl input[data-i="${i}"]`);if(e)e.focus();return}
  const p=profGet();
  if(p.n&&chKey(p.n)===chKey(n)){profOpen('players');return}
  PED={who:'name',n,c:Object.assign({},charLocal(n)||charRand()),back:'players',tab:'kopf'};profEdit();
}
function chSet(k,v){if(!PED)return;PED.c[k]=v;if(charOk(PED.c))keepScroll(profEdit)}
function chTab(t){if(!PED)return;PED.tab=t;keepScroll(profEdit)}
function chRand(){if(!PED)return;sfx.pop();PED.c=charRand();keepScroll(profEdit)}
function chName(e){if(PED&&PED.who==='me')PED.n=e.value}
const CH_VB={kopf:'10 2 100 100',outfit:'14 64 92 196',extra:'10 -10 100 100'};
const CH_VBP={t:'22 66 76 92',o:'22 66 76 92',p:'22 128 76 128',q:'22 128 76 128',s:'26 194 68 66',k:'26 186 68 74'};
function profEdit(){
  setLive(false);stopAll();TH=['var(--red2)','var(--red)'];
  const c=PED.c,me=PED.who==='me',tab=PED.tab||'kopf';
  const sw=col=>`<i class="chsw" style="background:${col}"></i>`;
  const thumb=(k,v)=>{
    const x=Object.assign({},c,{[k]:v});
    if(k==='f')return sw(CH_SKIN[v]);if(k==='c')return sw(CH_HAIR[v]);if(k==='y')return sw(CH_EYE[v]);
    if(k==='o')return sw(CH_TOP[v]);if(k==='q')return sw(CH_PANT[v]);if(k==='b')return sw(`linear-gradient(135deg,${CH_BG[v][0]},${CH_BG[v][1]})`);
    const vb=CH_VBP[k]||'10 2 100 100';
    return `<div class="chm" style="background:${charBg(x)}">${figSVG(x,{vb,bust:!CH_VBP[k]})}</div>`;
  };
  const part=([k,lab,names])=>`<div class="chp"><div class="chl"><b>${lab}</b><small>${names[c[k]]}</small></div><div class="chr">${names.map((nm,v)=>`<div class="cho${c[k]===v?' on':''}" onclick="chSet('${k}',${v})" aria-label="${lab}: ${nm}" title="${nm}">${thumb(k,v)}</div>`).join('')}</div></div>`;
  const tabs=[['kopf','🙂 Kopf'],['outfit','👕 Outfit'],['extra','✨ Extras']];
  scr(`<button class="sec back" onclick="profCancel()">← Zurück</button>${logo(me?'Dein Profil':'Charakter',1)}
  <div class="chwrap"><div class="chstage" style="background:${charBg(c)}"><div class="chfig">${figSVG(c,{pose:'wave'})}</div></div>
  <div class="chside">
   <div class="card chname">${me?`<div class="sm">Dein Name</div><input id="pfn" maxlength="16" value="${esc(PED.n)}" placeholder="Name" autocomplete="off" oninput="chName(this)">`:`<div class="sm">Charakter für</div><b style="font-size:22px">${esc(PED.n)}</b>`}
    <button class="sec" onclick="chRand()">🎲 Zufällig</button></div>
   <div class="mode2 chtabs">${tabs.map(([t,l])=>`<button class="${t===tab?'':'sec'} sg" onclick="chTab('${t}')">${l}</button>`).join('')}</div>
   <div class="card">${CH_PARTS.filter(p=>p[3]===tab).map(part).join('')}</div>
   <p class="sm">${me?'Dein Profil bleibt auf diesem Gerät. Online sehen alle in der Lobby deinen Charakter.':'Der Charakter wird auf diesem Gerät unter dem Namen gemerkt.'}</p>
   <button onclick="profSave()">✓ Speichern</button></div></div>`);
}
function profCancel(){const b=PED&&PED.back;PED=null;profBack(b)}
function profBack(b){
  if(b==='players')playersScreen();else if(b==='online')onlineMenu();
  else if(typeof b==='string'&&b.indexOf('join:')===0)joinScreen(b.slice(5).replace(/[^A-Z0-9]/g,''));
  else home();
}
function profSave(){
  if(!PED)return;const c=charOk(PED.c);if(!c)return;
  if(PED.who==='me'){
    const n=cleanName(($('pfn')||{}).value,'');
    if(!n||chDefault(n)){toast('Bitte einen Namen eingeben');const e=$('pfn');if(e)e.focus();return}
    const old=profGet().n;profSet({n,av:c});setMyName(n);
    // Spieler 1 übernimmt den Profilnamen, wenn dort noch der Standardname oder der alte Profilname steht
    if(!NET.on&&S.names.length&&(chDefault(S.names[0])||(old&&chKey(S.names[0])===chKey(old)))){S.names[0]=n;saveCfg()}
  }else charsSet(PED.n,c);
  sfx.pop();toast('✓ Gespeichert');const b=PED.back;PED=null;profBack(b);
}
/* Kleiner Profil-Knopf (Online-Menü, Beitreten): eigener Charakter + „Charakter gestalten“ */
function profMini(back){
  const p=profGet(),c=p.av;
  return `<div class="pmini" onclick="saveMyn();profOpen('${back}')">${c?charAv(c,'',44):`<div class="av" style="width:44px;height:44px;background:#2a2f45;font-size:20px">🙂</div>`}<div><b>${c?'Charakter ändern':'Charakter gestalten'}</b><small>${c?'So sehen dich die anderen':'Damit dich alle in der Lobby erkennen'}</small></div><em>›</em></div>`;
}
/* Getippten Namen merken, bevor der Editor öffnet */
function saveMyn(){const e=$('myn');if(e){const n=cleanName(e.value,'');if(n&&!chDefault(n)){setMyName(n);const p=profGet();if(!p.n){p.n=n;profSet(p)}}}}
/* Siegerehrung: Podest mit den ersten drei (nur Einzelwertung) – idx = Reihenfolge der Plätze (Spielerindizes) */
function podiumHTML(idx,vals,unit){
  const pl=idx.slice(0,3),ord=pl.length>2?[pl[1],pl[0],pl[2]]:pl.length>1?[pl[1],pl[0]]:[pl[0]];
  const rank=i=>{let r=1;for(const j of idx){if(vals[j]===vals[i])return r;r++}return r};
  return `<div class="podi">${ord.map(i=>{const r=rank(i),pos=pl.indexOf(i);return `<div class="pd pd${pos+1}"><div class="pf">${pos===0?'<span class="pcr">👑</span>':''}${figOf(i,pos===0?'cheer':pos===1?'wave':'stand')}</div><div class="pb"><b>${r}</b></div><div class="pn">${esc(nameOf(i)||'')}</div><small>${vals[i]}${unit}</small></div>`}).join('')}</div>`;
}
/* Wohnzimmer (Online-Lobby beim Host und Warteraum der Mitspieler): die ersten drei sitzen auf dem Sofa, die anderen
   laufen herum oder winken. Reines HTML/SVG + CSS-Animation, läuft dadurch auch in der Spiegelung. */
function roomScene(meIdx){
  const ms=(NET.m||[]).slice(0,10),all=(NET.m||[]).length;
  const lanes=[[8,'walk',26],[16,'wave',0],[4,'walk',31],[12,'stand',0],[20,'walk',23],[6,'wave',0],[14,'walk',35]];
  const figs=ms.map((m,i)=>{
    const on=i===0||isOpen(m),nm=esc(m.name);
    const tag=`<span class="lrn${i===meIdx?' me':''}">${i===0?'👑 ':''}${nm}${i===meIdx?' (du)':''}</span>`;
    const svg=pose=>figSVG(m.av,{pose,ini:m.name});
    if(i<3){const x=[50,30,70][i];return `<div class="lrf lrs${on?'':' off'}" style="left:${x}%">${svg('sit')}${tag}</div>`}
    const [b,pose,dur]=lanes[(i-3)%lanes.length],x=8+((i-3)*29)%78;
    if(pose==='walk')return `<div class="lrf lrw${on?'':' off'}" style="left:${x}%;bottom:${b}%;animation-duration:${dur}s;animation-delay:-${(i*7)%dur}s"><div class="lrflip" style="animation-duration:${dur}s;animation-delay:-${(i*7)%dur}s">${svg('walk')}</div>${tag}</div>`;
    return `<div class="lrf${on?'':' off'}" style="left:${x}%;bottom:${b}%">${svg(pose)}${tag}</div>`;
  }).join('');
  const lab=`<div class="lrlab">In der Lobby (${all})${ms[0]?' · Host: '+esc(ms[0].name):''}${all<2?'<br><small>Warte auf Mitspieler …</small>':''}</div>`;
  return `<div class="lroom" aria-label="Wohnzimmer">${lab}<div class="lrwin"><i></i></div><div class="lrlamp"></div><div class="lrpic"></div><div class="lrplant"><i></i><i></i><i></i></div>
  <div class="lrrug"></div><div class="lrsofa"><i class="lb"></i><i class="ls"></i><i class="la1"></i><i class="la2"></i></div>${figs}</div>`;
}
