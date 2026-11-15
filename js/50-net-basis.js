/* ================= Online-Modus (PeerJS, Host-Spiel + Spiegelung) =================
   Das Spiel läuft nur auf dem Host. Alle anderen Handys zeigen eine Spiegelung des Bildschirms
   (nur wenn sie dran sein dürfen) und schicken ihre Eingaben an den Host.            */
let ACT=null,PERM=null,WAIT='',PAR=null;
const PRE='pbox-',APP_CODE_LEN=5;
let UID=0;
const hwEl=$('hw');

const cleanName=(n,fb)=>{n=String(n==null?'':n).replace(/[\u0000-\u001f\u007f<>&"'`]/g,'').trim().slice(0,16);return n||fb};
const myName=()=>{try{return localStorage.getItem('pb_my')||''}catch(e){return ''}};
const setMyName=n=>{try{localStorage.setItem('pb_my',n)}catch(e){}};
const netCode=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<APP_CODE_LEN;i++)s+=a[Math.floor(Math.random()*a.length)];return s};
const isOpen=m=>!!(m&&m.conn&&m.conn.open);
const sendTo=(m,o)=>{try{if(isOpen(m))m.conn.send(o)}catch(e){}};
let wakeL=null;
function wake(){try{if(navigator.wakeLock)navigator.wakeLock.request('screen').then(l=>{wakeL=l}).catch(()=>{})}catch(e){}}
document.addEventListener('visibilitychange',()=>{
  if(NET.on&&document.visibilityState==='visible'){
    wake();
    if(NET.host){const gap=hbPrev?Date.now()-hbPrev:0;netGrace(gap>9000?gap:0);hbPrev=Date.now();if(NET.peer&&NET.peer.disconnected){try{NET.peer.reconnect()}catch(e){}}}
  }
});

/* ---------- Wer darf was? ---------- */
function devIdx(i){return(i===0||isOpen(NET.m[i]))?i:0}                 // Gerät des Spielers i (getrennt → Host)
function eligible(mi){return ACT==null||devIdx(ACT)===mi}               // sieht Gerät mi den echten Bildschirm?
function permOf(){
  if(ACT!=null)return devIdx(ACT);
  let p=PERM;if(typeof p==='function'){try{p=p()}catch(e){p=null}}
  if(p==null||p==='host')return 'host';
  if(p==='all')return 'all';
  return devIdx(p);
}
function canAct(mi){if(PAR&&parOwn(mi)!=null)return true;const p=permOf();return p==='all'||(p==='host'?mi===0:p===mi)}

/* ---------- Spiegelung: Host → Clients ---------- */
function tagAll(){app.querySelectorAll('*').forEach(e=>{if(!e.hasAttribute('data-n'))e.setAttribute('data-n',++UID)})}
function idOf(e){if(!e.hasAttribute('data-n'))e.setAttribute('data-n',++UID);return +e.getAttribute('data-n')}
let obs=null,recs=[],ft=0,lastF=0;
function startMirror(){
  tagAll();recs=[];
  obs=new MutationObserver(rs=>{for(const r of rs)recs.push(r);schedFlush()});
  obs.observe(app,{childList:true,subtree:true,attributes:true,characterData:true});
}
function stopMirror(){if(obs){obs.disconnect();obs=null}recs=[];clearTimeout(ft);ft=0}
function schedFlush(){if(ft)return;ft=setTimeout(flush,Math.max(0,60-(Date.now()-lastF)))}
function flush(){
  clearTimeout(ft);ft=0;lastF=Date.now();
  if(!recs.length||!NET.host)return;
  const rs=recs;recs=[];
  const targets=NET.m.filter((m,i)=>i>0&&m.view==='mirror'&&isOpen(m)&&eligible(i));
  if(!targets.length)return;
  let full=false;const dirty=new Set(),attrs=new Map();
  for(const r of rs){
    if(r.type==='childList'){if(r.target===app)full=true;else dirty.add(r.target)}
    else if(r.type==='characterData'){const p=r.target.parentElement;if(p&&p!==app)dirty.add(p);else if(p===app)full=true}
    else if(r.type==='attributes'){
      if(r.attributeName==='data-n'||r.target===app)continue;
      if(!attrs.has(r.target))attrs.set(r.target,new Set());attrs.get(r.target).add(r.attributeName);
    }
  }
  let pkt;
  if(full){tagAll();pkt={t:'full',html:app.innerHTML}}
  else{
    let d=[...dirty].filter(e=>app.contains(e));
    d=d.filter(e=>!d.some(o=>o!==e&&o.contains(e)));
    const ops=[];
    d.forEach(e=>{const n=idOf(e);e.querySelectorAll('*').forEach(x=>{if(!x.hasAttribute('data-n'))x.setAttribute('data-n',++UID)});ops.push({o:'h',n,h:e.innerHTML})});
    attrs.forEach((names,el)=>{
      if(!app.contains(el)||d.some(x=>x!==el&&x.contains(el)))return;
      const n=idOf(el);names.forEach(k=>ops.push({o:'a',n,k,v:el.getAttribute(k)}));
    });
    if(!ops.length)return;
    pkt={t:'mut',ops};
  }
  targets.forEach(m=>sendTo(m,pkt));
  sendPerms();
}
let hwO=null;
function hostOwn(h){
  app.style.visibility='hidden';hwEl.style.display='block';
  if(hwO!==h){hwO=h;hwEl.innerHTML=h;setTimeout(()=>{const i=hwEl.querySelector('input[data-f]');if(i)try{i.focus()}catch(e){}},80)}
}
function hostView(el){
  hwO=null;app.style.visibility=el?'':'hidden';
  hwEl.style.display=el?'none':'block';
  if(!el)hwEl.innerHTML=WAIT;
}
function syncViews(){
  if(!NET.host)return;
  flush();
  NET.m.forEach((m,i)=>{
    const own=PAR?parOwn(i):null;
    const el=eligible(i),room=!NET.inGame&&i>0&&!NET.setup,want=own!=null?'own':(room?'room':(el?'mirror':'wait'));
    if(i===0){if(own!=null)hostOwn(own);else hostView(el);m.view=want;return}
    if(!isOpen(m)){m.view='none';return}
    if(want==='own'){if(m.view!=='own'||m.oh!==own){sendTo(m,{t:'own',html:own});m.view='own';m.oh=own}}
    else if(want==='room'){const h=roomHTML(i);if(m.view!=='room'||m.rh!==h){sendTo(m,{t:'wait',html:h});m.view='room';m.rh=h}}
    else if(want==='mirror'&&m.view!=='mirror'){tagAll();sendTo(m,{t:'full',html:app.innerHTML});m.view='mirror'}
    else if(want==='wait'&&(m.view!=='wait'||m.wh!==WAIT)){sendTo(m,{t:'wait',html:WAIT});m.view='wait';m.wh=WAIT}
    if(PAR&&PAR.dur&&m.tmId!==PAR.id+':'+PAR.k){sendTo(m,{t:'tm',ms:Math.max(0,PAR.end-Date.now())});m.tmId=PAR.id+':'+PAR.k}
  });
  sendPerms();
}
function sendPerms(){
  NET.m.forEach((m,i)=>{if(i===0||!isOpen(m))return;const p=canAct(i);if(m.perm!==p){m.perm=p;sendTo(m,{t:'perm',ok:p})}});
}
/* ---------- Parallele Eingaben (nur Online-Host) ----------
   Jeder Spieler bekommt auf seinem Gerät einen eigenen Screen (Packet 'own'); der gemeinsame Screen zeigt nur den Stand.
   Clients schicken keine DOM-Klicks, sondern Daten {ty:'sub',p,k,v,f}. Der Host prüft sie in step.sub(). */
function parOwn(mi){
  if(!PAR)return null;
  for(let p=0;p<PAR.st.length;p++){
    if(PAR.st[p]<PAR.steps.length&&devIdx(p)===mi)
      return `<div class="screen own" data-p="${p}" style="--g1:${TH[0]};--g2:${TH[1]}">${PAR.steps[PAR.st[p]].html(p)}</div>`;
  }
  return null;
}
function parScreen(){
  return PAR.head()+`<div class="card"><div class="sm" style="margin-bottom:6px">${esc(PAR.msg)}</div>${S.P.map((n,i)=>`<div class="row" style="align-items:center;margin-top:8px">${av(i,'',34)}<b style="flex:1">${esc(n)}</b><span>${PAR.st[i]>=PAR.steps.length?'✅':'⏳'}</span></div>`).join('')}</div>`;
}
let PARID=0;
function parEnd(){
  const c=PAR;PAR=null;
  if(c&&c.iv)clearInterval(c.iv);
  if(c&&c.dur){tmrHide();NET.m.forEach((m,i)=>{if(i>0)sendTo(m,{t:'tm',off:1})})}
  return c;
}
function autoSub(sel){   // Zeit abgelaufen: eingetippten Wert (auch aus mehreren Feldern) noch abschicken
  const box=document.querySelector(sel+' [data-p]');if(!box)return;
  const fs=[...box.querySelectorAll('input[data-f]')];
  if(!fs.some(f=>String(f.value).trim()))return;
  const b=box.querySelector('[data-sub="'+(fs[fs.length-1].getAttribute('data-enter')||fs[0].getAttribute('data-enter')||'')+'"]');
  if(b){if(!b.hasAttribute('data-v'))b.setAttribute('data-v','auto');subGo(b)}
}
function parTick(){
  if(!PAR||!PAR.dur||Date.now()<PAR.end+1500)return;   // 1,5 s Kulanz für automatisch abgeschickte Eingaben
  const k=PAR.k;
  for(let p=0;p<PAR.st.length;p++){
    let dr=PAR.dr&&PAR.dr[p];if(devIdx(p)===0){const h=parDomDraft(p);if(h)dr=h}   // zuletzt getippter Stand zählt, auch ohne „Abschicken“
    for(let q=PAR.st[p];q<=k&&q<PAR.steps.length;q++){
      const st=PAR.steps[q];let got=false;
      if(dr&&dr.k===st.k&&st.sub){try{got=st.sub(p,{v:'auto',f:dr.f})===true}catch(e){}}
      if(!got&&st.timeout)try{st.timeout(p)}catch(e){}
    }
    if(PAR.st[p]<=k)PAR.st[p]=k+1;
  }
  PAR.k++;
  if(PAR.k>=PAR.dur.length||PAR.st.every(x=>x>=PAR.steps.length)){const c=parEnd();c.done();return}
  PAR.end=Date.now()+PAR.dur[PAR.k];
  scr(parScreen());syncViews();tmrShow(PAR.end-Date.now(),()=>autoSub('#hw'));
}
function parBegin(cfg){
  stopAll();parEnd();ACT=null;PERM=null;NET.scr=null;
  PAR={steps:cfg.steps,st:S.P.map(()=>0),head:cfg.head,msg:cfg.msg,done:cfg.done};
  if(cfg.dur&&cfg.dur.length){PAR.dur=cfg.dur;PAR.k=0;PAR.end=Date.now()+cfg.dur[0];PAR.id=++PARID;PAR.iv=setInterval(parTick,250)}
  scr(parScreen());syncViews();
  if(PAR&&PAR.dur)tmrShow(PAR.end-Date.now(),()=>autoSub('#hw'));
}
function parDomDraft(p){   // Host: eigener Entwurf aus dem Overlay
  const box=hwEl.querySelector('[data-p="'+p+'"]');if(!box)return null;
  const fs=[...box.querySelectorAll('input[data-f]')];if(!fs.length)return null;
  const f={};fs.forEach(e=>{f[e.getAttribute('data-f')]=String(e.value).slice(0,200)});
  const b=box.querySelector('[data-sub]');
  return {k:fs[fs.length-1].getAttribute('data-enter')||(b?b.getAttribute('data-sub'):null),f};
}
function parDraft(mi,d){   // Client: laufender Entwurf, der zählt, wenn die Zeit abläuft
  if(!PAR||!d||typeof d!=='object'||d.p==null||!d.f||typeof d.f!=='object')return;
  const p=+d.p;if(!Number.isInteger(p)||p<0||p>=PAR.st.length||devIdx(p)!==mi)return;
  const step=PAR.steps[PAR.st[p]];if(!step||d.k!==step.k)return;
  const f={};Object.keys(d.f).slice(0,12).forEach(k=>{f[String(k).slice(0,12)]=String(d.f[k]).slice(0,200)});
  (PAR.dr=PAR.dr||{})[p]={k:d.k,f};
}
function parErr(mi,msg){if(mi===0){toast(msg);vib(60)}else sendTo(NET.m[mi],{t:'err',m:msg})}
function parSub(mi,d){
  if(!PAR||!d||typeof d!=='object'||d.p==null)return;
  const p=+d.p;
  if(!Number.isInteger(p)||p<0||p>=PAR.st.length||devIdx(p)!==mi)return;
  const step=PAR.steps[PAR.st[p]];
  if(!step||d.k!==step.k)return;
  let r;try{r=step.sub(p,{v:d.v,f:(d.f&&typeof d.f==='object')?d.f:{}})}catch(e){r='Das hat nicht geklappt.'}
  if(r!==true){if(typeof r==='string')parErr(mi,r);return}
  PAR.st[p]++;
  if(PAR.st.every(x=>x>=PAR.steps.length)){const c=parEnd();c.done();return}
  scr(parScreen());syncViews();
}
function fxSend(o){if(!NET.host)return;NET.m.forEach((m,i)=>{if(i>0&&m.view==='mirror'&&isOpen(m))sendTo(m,{t:'fx',k:o.k,a:o.a})})}
/* Warteraum für Mitspieler: solange kein Spiel läuft, sehen sie nicht das Menü des Hosts, sondern wer da ist und worauf gewartet wird */
function roomHTML(i){
  const me=NET.m[i];if(!me)return '';
  const st=NET.scr==='lobby'?'Alle versammeln sich – der Host startet gleich ein Spiel.':NET.scr==='settings'?'Der Host ist gerade in den Einstellungen …':(CUR&&GAMES[CUR]?`Der Host richtet <b>${esc(GAMES[CUR].name)}</b> ein …`:(NET.scr==='home'?'Der Host sucht ein Spiel aus …':'Der Host ist gerade im Menü …'));
  return `<div class="screen" style="--g1:${TH[0]};--g2:${TH[1]}">${logo('Lobby',1)}
  <div class="card room"><div class="sm">Lobby-Code</div><div class="big" style="letter-spacing:6px;font-size:38px">${esc(NET.code)}</div>
  <div class="roomme">${av(i,'l')}<div><div class="sm">Du bist dabei als</div><b style="font-size:22px">${esc(me.name)}</b></div></div>
  <div class="roomst"><span class="rdots"><i></i><i></i><i></i></span><span>${st}</span></div></div>
  <div class="card"><div class="sm" style="margin-bottom:4px">In der Lobby (${NET.m.length})</div>${NET.m.map((m,k)=>`<div class="row" style="align-items:center;margin-top:8px">${av(k,'',32)}<b style="flex:1">${esc(m.name)}${k===0?' <span class="sm">· Host</span>':''}${k===i?' <span class="sm">· du</span>':''}</b><i class="dot2${k===0||isOpen(m)?'':' off'}"></i></div>`).join('')}</div>
  <p class="sm" style="text-align:center;margin:10px 0">Lass die App offen – es geht gleich los. 🎉</p></div>`;
}
function waitHTML(pi,pr,tag){
  return `<div class="screen" style="--g1:${TH[0]};--g2:${TH[1]}">${pr||''}<div class="card hand">${av(pi,'l')}<p style="margin:0">${tag?tag+' – ':''}Gerade dran</p><div class="big">${esc(S.P?S.P[pi]:nameOf(pi))}</div><p>Warte kurz … ${NET.on?'🔒':''}</p></div></div>`;
}

