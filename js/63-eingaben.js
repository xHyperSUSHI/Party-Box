/* Fragezeichen: Info ein-/ausblenden (rein lokal auf dem jeweiligen Gerät) */
document.addEventListener('click',e=>{
  const t=e.target.closest&&e.target.closest('[data-tg="qi"]');if(!t)return;
  const c=t.closest('.card'),i=c&&c.querySelector('.qinfo');if(!i)return;
  i.hidden=!i.hidden;t.classList.toggle('on',!i.hidden);
});

/* Eigene Screens (parallele Eingaben): Buttons mit data-sub, Felder mit data-f, Container mit data-p (Spielerindex) */
function subGo(t){
  const box=t.closest('[data-p]');if(!box)return;
  const f={};box.querySelectorAll('[data-f]').forEach(e=>{f[e.getAttribute('data-f')]=String(e.value).slice(0,200)});
  const d={p:+box.getAttribute('data-p'),k:t.getAttribute('data-sub'),v:t.getAttribute('data-v'),f};
  if(NET.host){if(hwEl.contains(t))parSub(0,d)}
  else if(NET.client&&app.contains(t))sendC(Object.assign({ty:'sub'},d));
}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-sub]');if(t)subGo(t)});
let DRT=null;
function draftSend(){   // Mitspieler-Gerät: aktuellen Stand der Eingabefelder an den Host melden
  if(!NET.client)return;
  const box=app.querySelector('[data-p]');if(!box)return;
  const fs=[...box.querySelectorAll('input[data-f]')];if(!fs.length)return;
  const f={};fs.forEach(e=>{f[e.getAttribute('data-f')]=String(e.value).slice(0,200)});
  const b=box.querySelector('[data-sub]'),k=fs[fs.length-1].getAttribute('data-enter')||(b?b.getAttribute('data-sub'):null);
  if(k==null)return;
  sendC({ty:'draft',p:+box.getAttribute('data-p'),k,f});
}
document.addEventListener('input',e=>{
  if(!NET.client||!e.target||!e.target.closest||!e.target.closest('[data-p]')||!e.target.hasAttribute('data-f'))return;
  clearTimeout(DRT);DRT=setTimeout(draftSend,350);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(DRT);draftSend()}});
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;const t=e.target;
  if(!t||!t.getAttribute||!t.getAttribute('data-enter'))return;
  const box=t.closest('[data-p]'),b=box&&box.querySelector('[data-sub="'+t.getAttribute('data-enter')+'"]');
  if(b)subGo(b);
});

