/* ================= Client ================= */
function joinScreen(code){
  setLive(false);stopAll();TH=['var(--red2)','var(--red)'];
  scr(`${logo('Beitreten')}<div class="card"><div class="sm">Lobby</div><div class="big" style="letter-spacing:5px">${esc(code)}</div>
  <h2 style="margin-top:14px">Dein Name</h2><input id="myn" maxlength="16" value="${esc(myName())}" placeholder="Name" autocomplete="off">${profMini('join:'+esc(code))}
  <button onclick="netJoinStart('${esc(code)}')">Beitreten</button></div><button class="sec" onclick="history.replaceState(null,'',location.pathname);home()">Abbrechen</button>`);
}
function netJoinStart(code){
  const nm=cleanName(($('myn')||{}).value,'');
  if(!code)code=(($('jc')||{}).value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(!nm){toast('Bitte einen Namen eingeben');return}
  if(code.length!==APP_CODE_LEN){toast('Bitte den '+APP_CODE_LEN+'-stelligen Code eingeben');return}
  if(!window.Peer){toast('Online ist hier nicht verfügbar');return}
  setMyName(nm);netJoin(code,nm);
}
/* Client-Sitzung merken: nach Neuladen/App-Neustart wieder in die Lobby (gleiche Geräte-ID übernimmt den Platz) */
const SESS_KEY='pb_sess',SESS_MAX=3*36e5;
function sessSave(){try{localStorage.setItem(SESS_KEY,JSON.stringify({code:NET.code,name:NET.name,t:Date.now()}))}catch(e){}}
function sessClear(){try{localStorage.removeItem(SESS_KEY)}catch(e){}}
function sessGet(){try{const x=JSON.parse(localStorage.getItem(SESS_KEY)||'null');if(x&&x.code&&x.name&&Date.now()-x.t<SESS_MAX)return x}catch(e){}return null}
function myCid(){
  if(NET.cid)return NET.cid;
  try{let c=localStorage.getItem('pb_cid');if(!c){c=Math.random().toString(36).slice(2)+Date.now().toString(36);localStorage.setItem('pb_cid',c)}return NET.cid=c}
  catch(e){return NET.cid=Math.random().toString(36).slice(2)+Date.now().toString(36)}
}
function netJoin(code,name,quiet){
  lostInfo=null;
  // Ein früherer Versuch/eine frühere Verbindung desselben Geräts wird beendet, sonst steht man doppelt in der Lobby
  const oc=NET.conn,op=NET.peer;NET.conn=null;NET.peer=null;hbStop();
  try{oc&&oc.close()}catch(e){}try{op&&op.destroy()}catch(e){}
  const jid=NET.jid=(NET.jid||0)+1;
  if(!quiet)netStatus('Verbinde mit Lobby '+esc(code)+' …','netLeave()');
  NET.on=true;NET.client=true;NET.host=false;NET.code=code;NET.name=name;NET.perm=true;NET.lastHost=Date.now();if(!quiet)NET.got=false;
  document.body.classList.add('cl','live');
  let p;try{p=new Peer(undefined,peerOpts())}catch(e){netClientFail('Verbindung nicht möglich.');return}
  NET.peer=p;
  const iceFail=()=>{if(jid===NET.jid&&!NET.got){clearTimeout(to);netClientFail(NET_BLOCK_MSG)}};
  const to=setTimeout(iceFail,25000);
  p.on('error',e=>{if(jid===NET.jid&&!NET.got){clearTimeout(to);netClientFail('Verbindung fehlgeschlagen ('+((e&&e.type)||'Fehler')+').<br><span class="sm">Stimmt der Code? Läuft die Lobby noch?</span>')}});
  p.on('open',()=>{
    if(jid!==NET.jid)return;
    const c=p.connect(PRE+code,{reliable:true,serialization:'json'});NET.conn=c;
    c.on('open',()=>{clearTimeout(to);NET.lastHost=Date.now();c.send({t:'hi',n:name,id:myCid(),av:charLocal(name)});hbStart();wake()});
    c.on('data',d=>{if(NET.conn===c)netClientData(d)});
    c.on('close',()=>{if(NET.client&&NET.conn===c)netWaitStart()});
    c.on('error',()=>{});
    c.on('iceStateChanged',st=>{if(st==='failed')iceFail()});
  });
  $('lv').style.display='block';$('lv').textContent='🌐 '+code+' · '+name;
}
function netClientFail(msg){
  sessClear();netCleanup();
  scr(`${logo('Online')}<div class="card" style="text-align:center"><div style="font-size:42px">😕</div><p style="margin:8px 0 0">${msg}</p></div><button onclick="history.replaceState(null,'',location.pathname);home()">← Zurück</button>`);
}
let lostInfo=null;
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&NET.client&&NET.got&&!NET.wait){
    const t=Date.now();NET.vis=t;
    setTimeout(()=>{if(NET.client&&NET.vis===t&&NET.lastHost<t)netWaitStart()},6000);   // der Host meldet sich normalerweise alle 4 s
  }
});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&lostInfo&&!NET.on){const l=lostInfo;lostInfo=null;netJoin(l.code,l.name)}});
function netClientLost(){
  const code=NET.code,name=NET.name;
  netCleanup();lostInfo={code,name};
  scr(`${logo('Online')}<div class="card" style="text-align:center"><div style="font-size:42px">📡</div><p style="margin:8px 0 0">Verbindung zur Lobby getrennt.</p></div><button onclick="netJoin('${esc(code)}','${esc(name)}')">Erneut verbinden</button><button class="sec" onclick="history.replaceState(null,'',location.pathname);home()">Beenden</button>`);
}
function netLeave(){
  if(!NET.client)return;lostInfo=null;sessClear();
  netCleanup();history.replaceState(null,'',location.pathname);home();
}
function netCleanup(){
  hbStop();netWaitStop();tmrHide();
  try{NET.conn&&NET.conn.close()}catch(e){}
  try{NET.peer&&NET.peer.destroy()}catch(e){}
  NET.on=false;NET.client=false;NET.conn=null;NET.peer=null;NET.got=false;
  document.body.classList.remove('cl','noperm','live');$('lv').style.display='none';
}
/* HTML vom Host einsetzen: Handler entschärfen (Klicks gehen an den Host) */
function strip(root){
  root.querySelectorAll('*').forEach(e=>{
    for(const a of Array.from(e.attributes)){
      if(a.name.length>2&&a.name.slice(0,2)==='on'){e.setAttribute('data-h-'+a.name.slice(2),'1');e.removeAttribute(a.name)}
    }
  });
}
function parseInto(el,html){
  const t=document.createElement('template');t.innerHTML=html;
  strip(t.content);
  el.replaceChildren(t.content);
}
function netClientData(d){netClientData0(d);rxWatch();kbPrep()}
function netClientData0(d){
  if(!d||typeof d!=='object')return;
  NET.lastHost=Date.now();NET.got=true;if(NET.wait)netWaitStop();
  if(d.t==='welcome'){NET.idx=d.idx;if(d.name&&d.name!==NET.name){NET.name=d.name;$('lv').textContent='🌐 '+NET.code+' · '+d.name}sessSave()}
  else if(d.t==='full'||d.t==='wait'){
    parseInto(app,String(d.html||''));window.scrollTo(0,0);app.scrollTop=0;
    if(d.t==='full'&&NET.perm){const i=app.querySelector('input.num,input.txt');if(i)setTimeout(()=>{try{i.focus()}catch(e){}},120)}
  }
  else if(d.t==='mut'&&Array.isArray(d.ops)){
    for(const o of d.ops){
      const el=app.querySelector('[data-n="'+(+o.n)+'"]');if(!el)continue;
      if(o.o==='h')parseInto(el,String(o.h||''));
      else if(o.o==='a'&&typeof o.k==='string'){
        if(o.k.slice(0,2)==='on'){if(o.v!=null)el.setAttribute('data-h-'+o.k.slice(2),'1');continue}
        if(o.v==null)el.removeAttribute(o.k);else el.setAttribute(o.k,String(o.v));
      }
    }
  }
  else if(d.t==='own'){
    parseInto(app,String(d.html||''));window.scrollTo(0,0);app.scrollTop=0;
    setTimeout(()=>{const i=app.querySelector('input[data-f]');if(i)try{i.focus()}catch(e){}},120);
  }
  else if(d.t==='err'){toast(String(d.m||'Ungültig'));vib(60)}
  else if(d.t==='tm'){if(d.off)tmrHide();else tmrShow(+d.ms||0,()=>autoSub('#app'))}
  else if(d.t==='stat'&&d.r&&typeof d.r==='object'){statRecord(NET.name,String(d.g||''),{w:d.r.w?1:0,p:d.r.p,x:d.r.x&&typeof d.r.x==='object'?d.r.x:null})}
  else if(d.t==='perm'){NET.perm=!!d.ok;document.body.classList.toggle('noperm',!NET.perm)}
  else if(d.t==='fx'){
    try{
      if(d.k==='s'&&sfx[d.a[0]])sfx[d.a[0]]();
      else if(d.k==='confetti')confetti.apply(null,d.a);
      else if(d.k==='flash')flash.apply(null,d.a);
      else if(d.k==='vib')vib.apply(null,d.a);
    }catch(e){}
  }
  else if(d.t==='bye'){const w=d.why||'Die Lobby wurde beendet.';sessClear();netCleanup();scr(`${logo('Online')}<div class="card" style="text-align:center"><div style="font-size:42px">👋</div><p style="margin:8px 0 0">${esc(w)}</p></div><button onclick="history.replaceState(null,'',location.pathname);home()">← Zurück</button>`)}
}
/* Reflex: Zeit auf dem Client messen (ab Grün auf diesem Gerät) */
let RXT=0;
function rxWatch(){const r=app.querySelector('#rx');if(r&&r.classList.contains('g')){if(!RXT)RXT=performance.now()}else RXT=0}
document.addEventListener('pointerdown',e=>{
  if(!NET.client||!NET.perm||!e.target.closest||e.target.closest('button'))return;
  const r=e.target.closest('#rx');if(!r||!app.contains(r))return;
  e.stopImmediatePropagation();e.preventDefault();
  if(r.classList.contains('g')&&RXT){const ms=Math.round(performance.now()-RXT);RXT=0;sendC({ty:'rx',k:'ms',v:ms})}
  else if(r.classList.contains('w'))sendC({ty:'rx',k:'early'});
},true);
/* Eingaben des Clients → Host */
function sendC(o){try{if(NET.conn&&NET.conn.open)NET.conn.send(Object.assign({t:'ev'},o))}catch(e){}}
function inVals(){const v={};app.querySelectorAll('input[data-n],textarea[data-n]').forEach(e=>{v[e.getAttribute('data-n')]=e.value});return v}
let lastMv=0,pendMv=null,mvT=0;
document.addEventListener('click',e=>{
  if(!NET.client||!e.target.closest)return;
  const t=e.target.closest('[data-h-click]');if(!t||!app.contains(t))return;
  e.preventDefault();
  if(!NET.perm){toast('Das macht gerade jemand anderes');return}
  sendC({ty:'click',n:+t.getAttribute('data-n'),vals:inVals()});
});
['pointerdown','pointermove','pointerup','pointercancel'].forEach(ty=>document.addEventListener(ty,e=>{
  if(!NET.client||!e.target.closest)return;
  let t=e.target.closest('[data-ptr]');
  if(!t&&ty==='pointerdown')t=e.target.closest('[data-h-pointerdown]');
  if(!t||!app.contains(t))return;
  if(!NET.perm)return;
  if(ty==='pointerdown'&&t.hasAttribute('data-ptr')){try{t.setPointerCapture(e.pointerId)}catch(_){}}
  const r=t.getBoundingClientRect();
  const pkt={ty,n:+t.getAttribute('data-n'),rx:r.width?(e.clientX-r.left)/r.width:0,ry:r.height?(e.clientY-r.top)/r.height:0};
  if(ty==='pointermove'){
    const n=Date.now();
    if(n-lastMv<30){pendMv=pkt;if(!mvT)mvT=setTimeout(()=>{mvT=0;if(pendMv){lastMv=Date.now();sendC(pendMv);pendMv=null}},35);return}
    lastMv=n;pendMv=null;
  }else if(pendMv){sendC(pendMv);pendMv=null}
  sendC(pkt);
  if(ty==='pointerdown'&&t.hasAttribute('data-ptr'))e.preventDefault();
}));
document.addEventListener('input',e=>{
  if(!NET.client||!NET.perm)return;const t=e.target;
  if(!t||!t.getAttribute||!t.getAttribute('data-n')||!app.contains(t))return;
  sendC({ty:'in',n:+t.getAttribute('data-n'),v:t.value});
});
document.addEventListener('keydown',e=>{
  if(!NET.client||!NET.perm||e.key!=='Enter')return;const t=e.target;
  if(!t||!t.getAttribute||!/^(INPUT|TEXTAREA)$/.test(t.tagName)||!t.getAttribute('data-n')||!app.contains(t))return;
  sendC({ty:'key',n:+t.getAttribute('data-n'),v:t.value});
});


const NET_BLOCK_MSG='Keine direkte Verbindung zum Host.<br><span class="sm">Die Lobby wurde gefunden, aber das Netzwerk lässt die Verbindung nicht durch – das passiert vor allem, wenn ihr in <b>verschiedenen WLANs</b> seid (strenger Router, Schul-/Firmen-/Hotel-WLAN). Tipp: alle ins selbe WLAN oder ein Handy als Hotspot nutzen. Mehr zeigt der <a onclick="netDiag()" style="text-decoration:underline;cursor:pointer">Verbindungstest</a>.</span>';
/* ---------- Verbindungstest (Einstellungen): prüft auf DIESEM Gerät im aktuellen Netz Vermittlungsserver, STUN und TURN ---------- */
let DIAG=0;
function netDiag(){
  setLive(false);stopAll();TH=['var(--red2)','var(--red)'];const run=++DIAG;
  const row=(id,t)=>`<div class="srow" id="${id}"><span style="font-size:22px;width:28px">⏳</span><div style="flex:1"><b>${t}</b><div class="sm">wird geprüft …</div></div></div>`;
  scr(`<button class="sec back" onclick="DIAG++;settings()">← Zurück</button>${logo('Verbindungstest',1)}
  <div class="card">${row('dg1','Vermittlungsserver')}${row('dg2','Direkte Verbindung (STUN)')}${row('dg3','Umleitung (TURN)')}</div>
  <div class="card" id="dgr"><p class="sm" style="margin:0">Der Test dauert bis zu 15 Sekunden. Er prüft nur dieses Gerät im aktuellen Netz – am besten auf beiden Geräten machen.</p></div>`);
  const set=(id,ok,txt)=>{if(run!==DIAG)return;const e=$(id);if(!e)return;e.querySelector('span').textContent=ok?'✅':'❌';e.querySelector('.sm').textContent=txt};
  const res={};
  const done=()=>{if(run!==DIAG||!('sig' in res)||!('ice' in res))return;const e=$('dgr');if(!e)return;
    let t;
    if(!res.sig)t='Der Vermittlungsserver ist nicht erreichbar – ohne Internet oder bei gesperrtem Netz geht Online gar nicht.';
    else if(res.relay)t='Alles erreichbar. Verbindungen sollten auch zwischen verschiedenen WLANs klappen. Hakt es trotzdem, liegt es meist am Netz des anderen Geräts – dort ebenfalls testen.';
    else if(res.srflx)t='Direkte Verbindungen gehen, die Umleitung (TURN) aber nicht. Zwischen verschiedenen WLANs klappt es dann oft, aber nicht immer (strenge Router). Sicherer: alle ins selbe WLAN oder Hotspot.';
    else t='Weder direkte Verbindung noch Umleitung möglich – dieses Netz sperrt solche Verbindungen. Online geht hier nur, wenn alle im selben WLAN sind, oder über einen Handy-Hotspot.';
    e.innerHTML=`<p style="margin:0">${t}</p>`};
  // 1) Vermittlungsserver (PeerJS-Cloud)
  try{let fin=false;const p=new Peer(undefined,peerOpts());
    const end=(ok,txt)=>{if(fin)return;fin=true;try{p.destroy()}catch(e){}res.sig=ok;set('dg1',ok,txt);done()};
    p.on('open',()=>end(true,'erreichbar'));p.on('error',e=>end(false,'nicht erreichbar ('+((e&&e.type)||'Fehler')+')'));
    setTimeout(()=>end(false,'keine Antwort'),10000);
  }catch(e){res.sig=false;set('dg1',false,'nicht verfügbar');done()}
  // 2+3) Kandidaten sammeln: srflx = STUN klappt, relay = TURN klappt
  try{const pc=new RTCPeerConnection(NET_ICE);let fin=false;const ty={};
    const end=()=>{if(fin)return;fin=true;try{pc.close()}catch(e){}
      res.srflx=!!ty.srflx;res.relay=!!ty.relay;res.ice=true;
      set('dg2',res.srflx,res.srflx?'öffentliche Adresse gefunden':'keine Antwort – Netz sperrt STUN');
      set('dg3',res.relay,res.relay?'Umleitung erreichbar'+(ty.tcp?' (auch über TCP)':''):'nicht erreichbar');done()};
    pc.onicecandidate=e=>{if(!e.candidate){end();return}const c=e.candidate,t=c.type||((/ typ (\w+)/.exec(c.candidate||'')||[])[1]);if(t)ty[t]=1;if(t==='relay'&&/tcp/i.test(c.candidate||''))ty.tcp=1};
    pc.createDataChannel('t');pc.createOffer().then(o=>pc.setLocalDescription(o)).catch(end);
    setTimeout(end,14000);
  }catch(e){res.ice=true;set('dg2',false,'nicht verfügbar');set('dg3',false,'nicht verfügbar');done()}
}
