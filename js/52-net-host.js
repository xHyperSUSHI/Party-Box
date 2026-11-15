/* ---------- Host: Lobby ---------- */
function goLocal(){if(NET.on)netStop();home()}
function goOnline(){if(NET.on)lobbyScreen();else onlineMenu()}
function onlineMenu(){
  setLive(false);stopAll();ACT=null;PERM=null;NET.scr=null;TH=['var(--red2)','var(--red)'];
  const nm=myName()||(/^Spieler \d+$/.test((S.names[0]||'').trim())?'':(S.names[0]||''));
  scr(`<button class="sec back" onclick="home()">← Zurück</button>${logo('Online')}
  <div class="card"><h2>Dein Name</h2><input id="myn" maxlength="16" value="${esc(nm)}" placeholder="Name" autocomplete="off"></div>
  <div class="card"><h2>Lobby erstellen</h2><p class="sm" style="margin-top:-4px">Dein Gerät ist der Host: Es steuert das Spiel und muss geöffnet bleiben. Die anderen scannen den QR-Code.</p><button onclick="netHostStart()">🎉 Lobby erstellen</button></div>
  <div class="card"><h2>Beitreten</h2><input id="jc" maxlength="${APP_CODE_LEN}" placeholder="Code" autocomplete="off" autocapitalize="characters" style="text-transform:uppercase;text-align:center;letter-spacing:4px;font-size:22px"><button class="sec" onclick="netJoinStart()">Beitreten</button></div>`);
}
function netStatus(txt,back){
  scr(`${logo('Online')}<div class="card" style="text-align:center"><div style="font-size:42px">🌐</div><p style="margin:8px 0 0">${txt}</p></div>${back?`<button class="sec" onclick="${back}">← Zurück</button>`:''}`);
}
function netHostStart(){
  const n=cleanName($('myn').value,'Host');setMyName(n);
  if(!window.Peer){toast('Online ist hier nicht verfügbar');return}
  netStatus('Lobby wird erstellt …');
  netTryHost(0,n);
}
function netTryHost(tries,name){
  const code=netCode();let opened=false;
  let p;try{p=new Peer(PRE+code,{debug:0})}catch(e){netStatus('Verbindung nicht möglich.','onlineMenu()');return}
  p.on('error',e=>{
    if(e&&e.type==='unavailable-id'&&tries<6){try{p.destroy()}catch(_){}netTryHost(tries+1,name);return}
    if(!opened)netStatus('Keine Verbindung zum Vermittlungsserver ('+((e&&e.type)||'Fehler')+').<br><span class="sm">Prüfe dein Internet und versuche es nochmal.</span>','onlineMenu()');
    else toast('Netzwerk: '+((e&&e.type)||'Fehler'));
  });
  p.on('disconnected',()=>{if(opened&&NET.peer===p){try{p.reconnect()}catch(e){}}});
  p.on('open',()=>{
    opened=true;NET.peer=p;NET.on=true;NET.host=true;NET.client=false;NET.code=code;NET.inGame=false;
    NET.localNames=S.names.slice();
    NET.m=[{name,conn:null,last:Date.now(),view:'mirror',perm:true}];S.names=[name];
    startMirror();wake();hbStart();
    p.on('connection',netOnConn);
    lobbyScreen();
  });
}
function netOnConn(c){
  let mem=null;
  c.on('data',d=>{
    if(!d||typeof d!=='object'||!NET.host)return;
    if(d.t==='hi'){
      if(mem)return;
      const nm0=cleanName(d.n,'Gast'),cid=(typeof d.id==='string'&&d.id)?d.id.slice(0,40):'';
      // 1) dasselbe Gerät (gleiche ID) übernimmt seinen Platz, auch wenn die alte Verbindung noch offen wirkt
      // 2) sonst darf ein getrennter Spieler mit gleichem Namen zurück (alte Clients ohne ID)
      let m=(cid&&NET.m.find((x,i)=>i>0&&x.cid===cid))||NET.m.find((x,i)=>i>0&&x.name===nm0&&!isOpen(x));
      if(m){const oc=m.conn;m.conn=null;try{oc&&oc.close()}catch(e){}if(cid)m.cid=cid}
      else{
        if(NET.m.length>=10){try{c.send({t:'bye',why:'Die Lobby ist voll (max. 10).'})}catch(e){}setTimeout(()=>{try{c.close()}catch(e){}},400);return}
        let nm=nm0,k=2;while(NET.m.some(x=>x.name===nm))nm=nm0.slice(0,13)+' '+(k++);
        m={name:nm,cid};NET.m.push(m);
      }
      m.conn=c;m.last=Date.now();m.view='none';m.perm=null;m.wh=null;m.oh=null;m.tmId=null;mem=m;
      sendTo(m,{t:'welcome',idx:NET.m.indexOf(m),name:m.name,code:NET.code});
      netMembersChanged();
      return;
    }
    if(!mem||mem.conn!==c)return;
    mem.last=Date.now();
    if(d.t==='ev')netEvent(mem,d);
  });
  c.on('close',()=>{if(mem&&mem.conn===c){mem.view='none';netMembersChanged()}});
  c.on('error',()=>{});
}
function netMembersChanged(){
  if(!NET.host)return;
  netPrune();
  S.names=NET.m.map(x=>x.name);
  if(NET.scr==='lobby')lobbyScreen();else if(NET.scr==='home')home();
  syncViews();
}
function netPrune(){
  if(!NET.host||NET.inGame)return;
  NET.m=NET.m.filter((x,i)=>i===0||isOpen(x));
  S.names=NET.m.map(x=>x.name);
}
function lobbyScreen(){
  setLive(false);ACT=null;parEnd();PERM=null;NET.scr='lobby';TH=['var(--red2)','var(--red)'];stopAll();S.P=null;
  const link=location.href.split('#')[0]+'#'+NET.code;
  let qr='';try{const q=qrcode(0,'M');q.addData(link);q.make();qr=q.createSvgTag({cellSize:6,margin:0,scalable:true})}catch(e){}
  scr(`<button class="sec back" onclick="home()">← Spiele</button>${logo('Lobby')}
  <div class="card" style="text-align:center"><div class="sm">Lobby-Code</div><div class="big" style="letter-spacing:6px;font-size:42px">${NET.code}</div>
  <div class="qrbox">${qr}</div><p class="sm" style="margin:0">QR-Code scannen oder Link öffnen und den Code eingeben.</p>
  <button class="sec" onclick="netShare()">🔗 Link teilen</button></div>
  <div class="card"><h2>Spieler (${NET.m.length})</h2>${NET.m.map((m,i)=>`<div class="row" style="align-items:center;margin-top:8px">${av(i,'',34)}<b style="flex:1">${esc(m.name)}${i===0?' <span class="sm">· Host</span>':''}</b><i class="dot2${i===0||isOpen(m)?'':' off'}"></i></div>`).join('')}
  ${NET.m.length<2?'<p class="sm" style="margin-bottom:0">Warte auf Mitspieler …</p>':''}</div>
  <button onclick="home()">Spiel auswählen ➜</button>`);
}
function netShare(){
  const link=location.href.split('#')[0]+'#'+NET.code;
  try{if(navigator.share){navigator.share({title:'Party Box',text:'Komm in meine Lobby ('+NET.code+')',url:link}).catch(()=>{});return}}catch(e){}
  try{navigator.clipboard.writeText(link).then(()=>toast('Link kopiert'),()=>toast(link))}catch(e){toast(link)}
}
function netStop(){
  if(NET.host){
    NET.m.forEach((m,i)=>{if(i>0&&isOpen(m)){sendTo(m,{t:'bye',why:'Der Host hat die Lobby geschlossen.'});setTimeout(()=>{try{m.conn.close()}catch(e){}},300)}});
    stopMirror();hbStop();
    try{NET.peer&&NET.peer.destroy()}catch(e){}
    if(NET.localNames)S.names=NET.localNames;
  }
  NET.on=false;NET.host=false;NET.m=[];NET.peer=null;NET.localNames=null;NET.inGame=false;NET.scr=null;NET.code='';
  ACT=null;parEnd();PERM=null;hostView(true);
}

/* ---------- Host: Eingaben der Clients ---------- */
function netEvent(m,d){
  const idx=NET.m.indexOf(m);
  if(idx<0)return;
  if(d.ty==='sub'){parSub(idx,d);return}
  if(d.ty==='draft'){parDraft(idx,d);return}
  if(d.ty==='rx'){rxRemote(idx,d);return}
  if(!canAct(idx))return;
  if(d.vals&&typeof d.vals==='object'){
    for(const k in d.vals){
      const el=app.querySelector('[data-n="'+(+k)+'"]');
      if(el&&/^(INPUT|TEXTAREA)$/.test(el.tagName))el.value=String(d.vals[k]).slice(0,200);
    }
  }
  const el=app.querySelector('[data-n="'+(+d.n)+'"]');
  if(!el)return;
  const ty=d.ty;NET.syn=true;NET.who=idx;
  try{
    if(ty==='click')el.click();
    else if(ty==='in'){if(/^(INPUT|TEXTAREA)$/.test(el.tagName))el.value=String(d.v==null?'':d.v).slice(0,200)}
    else if(ty==='key'){
      if(/^(INPUT|TEXTAREA)$/.test(el.tagName)&&d.v!=null)el.value=String(d.v).slice(0,200);
      el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
    }
    else if(/^pointer(down|move|up|cancel)$/.test(ty)){
      const r=el.getBoundingClientRect();
      const x=r.left+Math.max(0,Math.min(1,+d.rx||0))*r.width,y=r.top+Math.max(0,Math.min(1,+d.ry||0))*r.height;
      el.dispatchEvent(new PointerEvent(ty,{bubbles:true,cancelable:true,clientX:x,clientY:y,pointerId:1,isPrimary:true,pointerType:'touch'}));
    }
  }catch(e){}
  NET.syn=false;NET.who=null;
}

/* ---------- Herzschlag ---------- */
let hbT=0;
function hbStart(){
  hbStop();
  hbT=setInterval(()=>{
    if(NET.host){
      NET.m.forEach((m,i)=>{
        if(i===0||!m.conn)return;
        sendTo(m,{t:'hb'});
        if(isOpen(m)&&Date.now()-m.last>16000){try{m.conn.close()}catch(e){}m.view='none';netMembersChanged()}
      });
    }else if(NET.client){
      try{NET.conn&&NET.conn.open&&NET.conn.send({t:'ev',ty:'hb'})}catch(e){}
      if(NET.lastHost&&Date.now()-NET.lastHost>16000)netClientLost();
    }
  },4000);
}
function hbStop(){clearInterval(hbT);hbT=0}

