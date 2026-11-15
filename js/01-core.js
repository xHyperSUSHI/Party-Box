/* ================= Core ================= */
const $=id=>document.getElementById(id);
const app=$('app');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=(n,d)=>n.toLocaleString('de-DE',{minimumFractionDigits:d||0,maximumFractionDigits:d==null?3:d});
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const pad=n=>String(n).padStart(2,'0');
const dec=n=>{const s=String(n);return s.includes('.')?s.split('.')[1].length:0};

let C={days:15,fx:true,vib:true,sound:true,theme:'feuer',drink:true,sips:true};
let S={names:['Spieler 1','Spieler 2','Spieler 3'],mode:'solo',nt:2,P:null,tm:null,tmKey:''};
let G={},CUR=null,HF=null,TH=['var(--red2)','var(--red)'];
const NET={on:false,host:false,client:false,code:'',m:[],inGame:false,scr:null,peer:null,conn:null,perm:true,idx:-1,localNames:null,syn:false};
try{const c=JSON.parse(localStorage.getItem('pb_cfg')||'null');if(c){Object.assign(C,c.C||{});if(c.names&&c.names.length>=1)S.names=c.names}}catch(e){}
function saveCfg(){try{localStorage.setItem('pb_cfg',JSON.stringify({C,names:(NET.on&&NET.localNames)?NET.localNames:S.names}))}catch(e){}}
function applyTheme(){document.body.dataset.theme=C.theme;document.body.classList.toggle('calm',!C.fx)}

/* ---------- Verlauf: Wiederholungssperre ---------- */
const HC={};
const HNS=['q','w','l','s','b','c','m','t','h','n','g'];
const hGet=ns=>{if(!HC[ns]){try{HC[ns]=JSON.parse(localStorage.getItem('pb_h_'+ns)||'{}')}catch(e){HC[ns]={}}}return HC[ns]};
const lim=()=>C.days*864e5;
function recent(ns,key){const t=hGet(ns)[key];return t!=null&&lim()>0&&Date.now()-t<lim()}
function mark(ns,key){
  const h=hGet(ns);h[key]=Date.now();const ks=Object.keys(h);
  if(ks.length>4000)ks.sort((a,b)=>h[a]-h[b]).slice(0,800).forEach(k=>delete h[k]);
  try{localStorage.setItem('pb_h_'+ns,JSON.stringify(h))}catch(e){}
}
// Erst alles, was länger als "Sperre" nicht dran war (gemischt), danach das am längsten Zurückliegende.
function ordered(list,key,ns){
  const h=hGet(ns),fresh=[],old=[];
  list.forEach(x=>{const k=key(x);if(!recent(ns,k))fresh.push(x);else old.push([h[k],x])});
  old.sort((a,b)=>a[0]-b[0]);
  return shuffle(fresh).concat(old.map(o=>o[1]));
}
function clearHist(){HNS.forEach(ns=>{HC[ns]={};try{localStorage.removeItem('pb_h_'+ns)}catch(e){}})}
function blocked(){return HNS.reduce((n,ns)=>n+Object.keys(hGet(ns)).filter(k=>recent(ns,k)).length,0)}

/* ---------- Haptik, Ton ---------- */
function vib(p){if(!C.vib)return;try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}}
let AC=null;
function ac(){try{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC}catch(e){return null}}
function tone(f,d,type,vol,when){const a=ac();if(!a||!C.sound)return;try{const t=a.currentTime+(when||0),o=a.createOscillator(),g=a.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(vol||.12,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d)}catch(e){}}
function noise(d,vol){const a=ac();if(!a||!C.sound)return;try{const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=(Math.random()*2-1)*(1-i/n);const s=a.createBufferSource(),g=a.createGain();s.buffer=b;g.gain.value=vol||.4;s.connect(g);g.connect(a.destination);s.start()}catch(e){}}
const sfx={
  tick:()=>tone(900,.05,'square',.05),
  ok:()=>{tone(660,.1,'triangle',.15);tone(990,.15,'triangle',.15,.09)},
  bad:()=>tone(150,.3,'sawtooth',.14),
  go:()=>tone(1200,.2,'sine',.2),
  win:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.28,'triangle',.15,i*.11)),
  boom:()=>{noise(.9,.5);tone(70,.7,'sawtooth',.25)},
  pop:()=>tone(520,.08,'triangle',.12)
};

/* ---------- Effekte ---------- */
const cv=$('fx'),cx=cv.getContext('2d');let parts=[],raf=0;
function sizeCv(){cv.width=innerWidth*devicePixelRatio;cv.height=innerHeight*devicePixelRatio}
sizeCv();addEventListener('resize',sizeCv);
const GOLD=['#ffc83d','#fff0b3','#ff7a45','#35e0a1','#9b6cff','#ffffff'];
function confetti(n,colors){
  if(!C.fx)return;
  const W=cv.width,H=cv.height;
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2,sp=(6+Math.random()*12)*devicePixelRatio;
    parts.push({x:W/2,y:H*.4,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-8*devicePixelRatio,w:(6+Math.random()*7)*devicePixelRatio,h:(8+Math.random()*10)*devicePixelRatio,r:Math.random()*6,vr:(Math.random()-.5)*.4,c:colors[i%colors.length],life:1});
  }
  if(!raf)loop();
}
function loop(){
  cx.clearRect(0,0,cv.width,cv.height);
  parts=parts.filter(p=>p.life>0);
  parts.forEach(p=>{p.vy+=.35*devicePixelRatio;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life-=.007;
    cx.save();cx.globalAlpha=Math.max(p.life,0);cx.translate(p.x,p.y);cx.rotate(p.r);cx.fillStyle=p.c;cx.fillRect(-p.w/2,-p.h/2,p.w,p.h);cx.restore()});
  raf=parts.length?requestAnimationFrame(loop):0;
  if(!raf)cx.clearRect(0,0,cv.width,cv.height);
}
function flash(color){
  vib([60,40,120]);if(!C.fx)return;
  const f=document.createElement('div');f.className='flash';if(color)f.style.background=color;document.body.appendChild(f);setTimeout(()=>f.remove(),900);
  document.body.classList.add('quake');setTimeout(()=>document.body.classList.remove('quake'),520);
}
function countUp(el,to,d,ms){
  if(!el)return;const t0=performance.now();
  (function f(t){const k=Math.min((t-t0)/ms,1),e=1-Math.pow(1-k,4);el.textContent=fmt(to*e,d);if(k<1&&document.body.contains(el))requestAnimationFrame(f);else el.textContent=fmt(to,d)})(t0);
}
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
function stopAll(){tmrHide();['iv','iv2'].forEach(k=>{if(G&&G[k]){clearInterval(G[k]);clearTimeout(G[k]);G[k]=0}})}

/* ---------- Hauptmenü-Knopf (nur während eines laufenden Spiels; Client-Geräte nutzen "Lobby verlassen") ---------- */
let LIVE=false;
function setLive(v){LIVE=!!v;document.body.classList.toggle('live',LIVE||NET.client)}
function hmAsk(){
  if(document.getElementById('hmc'))return;
  const d=document.createElement('div');d.className='pk';d.id='hmc';d.style.zIndex=70;
  d.innerHTML=`<div><h2>Zurück ins Hauptmenü?</h2><p style="margin-top:-4px">${NET.client?'Du verlässt die Lobby, die anderen spielen weiter.':'Das laufende Spiel wird beendet'+(NET.host?' – für alle Mitspieler':'')+'.'}</p><button class="sec" onclick="hmNo()">Weiter spielen</button><button onclick="hmGo()">${NET.client?'Ja, Lobby verlassen':'Ja, ins Hauptmenü'}</button></div>`;
  document.body.appendChild(d);
  setTimeout(()=>{const b=d.querySelector('button.sec');if(b)b.focus()},30);   // Standard: Weiter spielen (Enter beendet nichts aus Versehen)
}
function hmNo(){const d=document.getElementById('hmc');if(d)d.remove()}
function hmGo(){hmNo();if(NET.client)netLeave();else home()}

/* ---------- Timer-Anzeige (oben mittig, auch auf den Handys der Mitspieler) ---------- */
let TM=null;
function tmrHide(){if(TM){clearInterval(TM.iv);TM=null}const e=document.getElementById('tmr');if(e){e.style.display='none';e.classList.remove('hot')}}
function tmrShow(ms,onEnd){tmrHide();TM={end:Date.now()+Math.max(0,ms),onEnd:onEnd||null,fired:false,last:-1};TM.iv=setInterval(tmrTick,200);tmrTick()}
function tmrTick(){
  if(!TM)return;
  const left=Math.max(0,TM.end-Date.now()),sec=Math.ceil(left/1000),e=document.getElementById('tmr');
  e.style.display='block';e.textContent='⏱ '+sec;e.classList.toggle('hot',left<=5000);
  if(left>0&&left<=5000&&sec!==TM.last){TM.last=sec;if(C.vib)try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}tone(900,.05,'square',.05)}
  if(left<=0&&!TM.fired){TM.fired=true;const f=TM.onEnd;if(f)f()}
}

/* ---------- Statistik (pro Gerät, localStorage pb_stats; nach Spielername) ---------- */
function stGet(){try{return JSON.parse(localStorage.getItem('pb_stats')||'{}')||{}}catch(e){return {}}}
function stPut(o){try{localStorage.setItem('pb_stats',JSON.stringify(o))}catch(e){}}
function statRecord(name,gid,r){
  name=String(name||'').trim().slice(0,16);if(!name||!GAMES[gid]||/^Spieler \d+$/i.test(name))return;   // Standardnamen werden nicht gezählt
  const all=stGet(),k='n:'+name.toLowerCase(),P=(all[k]=all[k]||{n:name,g:{}});P.n=name;
  const g=(P.g[gid]=P.g[gid]||{n:0,w:0,p:0,s:{},m:{}});
  g.n++;g.w+=r.w?1:0;g.p+=Number(r.p)||0;g.t=Date.now();
  const x=r.x||{},ok=q=>/^[a-z]{1,10}$/.test(q);
  if(x.s&&typeof x.s==='object')for(const q in x.s)if(ok(q)&&isFinite(+x.s[q]))g.s[q]=(g.s[q]||0)+(+x.s[q]);
  if(x.m&&typeof x.m==='object')for(const q in x.m)if(ok(q)&&isFinite(+x.m[q]))g.m[q]=g.m[q]==null?+x.m[q]:Math.min(g.m[q],+x.m[q]);
  stPut(all);
}

