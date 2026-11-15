/* ---------- Vollbild-Knopf & installierbare Web-App ---------- */
const fsOn=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
function toggleFs(){
  try{
    const d=document,e=d.documentElement;
    const r=fsOn()?(d.exitFullscreen||d.webkitExitFullscreen).call(d):(e.requestFullscreen||e.webkitRequestFullscreen).call(e);
    if(r&&r.catch)r.catch(()=>{});
  }catch(e){}
}
function fsSync(){
  const b=$('fs'),sa=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone;
  b.classList.toggle('show',!sa&&!!(document.fullscreenEnabled||document.webkitFullscreenEnabled));
  $('fsp').setAttribute('d',fsOn()?'M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5':'M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5');
}
['fullscreenchange','webkitfullscreenchange'].forEach(t=>document.addEventListener(t,fsSync));
fsSync();
// Manifest und Icon werden zur Laufzeit erzeugt, damit alles in einer Datei bleibt.
(function(){try{
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');
  x.fillStyle='#0b0d14';x.fillRect(0,0,512,512);
  x.translate(256,256);x.rotate(-12*Math.PI/180);
  const g=x.createLinearGradient(-90,-130,90,130);g.addColorStop(0,'#ff7a45');g.addColorStop(1,'#ff2e4d');
  x.shadowColor='rgba(255,46,77,.7)';x.shadowBlur=60;x.fillStyle=g;
  x.beginPath();if(x.roundRect)x.roundRect(-90,-130,180,260,34);else x.rect(-90,-130,180,260);x.fill();
  const url=c.toDataURL('image/png'),base=location.href.split('#')[0].split('?')[0];
  const man={name:'Party Box',short_name:'Party Box',lang:'de',start_url:base,scope:base.replace(/[^/]*$/,''),display:'standalone',background_color:'#0b0d14',theme_color:'#0b0d14',icons:[{src:url,sizes:'512x512',type:'image/png'}]};
  const m=document.createElement('link');m.rel='manifest';m.href='data:application/manifest+json,'+encodeURIComponent(JSON.stringify(man));document.head.appendChild(m);
  const a=document.createElement('link');a.rel='apple-touch-icon';a.href=url;document.head.appendChild(a);
}catch(e){}})();

