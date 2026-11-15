/* ---------- Tastatur (iPad mit Magic Keyboard, Mac, PC) ----------
   Alles läuft über dieselben Klick-/Zeiger-Ereignisse wie die Bedienung per Finger – dadurch funktioniert es
   auch auf Mitspieler-Geräten (die Ereignisse gehen wie gewohnt an den Host). */
const kbVis=el=>!!el&&el.offsetParent!==null&&getComputedStyle(el).visibility!=='hidden';
function kbPrep(){   // Klickbare Nicht-Knöpfe (Chips, Schalter, Karten) per Tab erreichbar machen
  document.querySelectorAll('#app [onclick]:not(button):not(a):not(input):not([tabindex]),#app [data-h-click]:not(button):not(a):not(input):not([tabindex])').forEach(e=>{e.tabIndex=0;e.setAttribute('role','button')});
}
const kbRoot=()=>(hwEl.style.display==='block'?hwEl:app);
function kbPtr(el,type,x,y){el.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,pointerId:1,isPrimary:true,pointerType:'mouse'}))}
let KBC=3;
function kbC4Pos(c){const b=$('c4b');if(!b)return null;const r=b.getBoundingClientRect(),w=(r.width-20-36)/7;return {b,x:r.left+10+c*(w+6)+w/2,y:r.top+r.height/2}}
function kbC4Hov(c){document.querySelectorAll('#c4b .c4col').forEach((el,i)=>el.classList.toggle('hv',i===c))}
function kbC4Drop(c){const p=kbC4Pos(c);if(!p)return false;kbPtr(p.b,'pointerdown',p.x,p.y);kbPtr(p.b,'pointerup',p.x,p.y);kbC4Hov(-1);return true}
function kbSlider(d){
  const sp=$('sp');if(!sp||!sp.hasAttribute('data-ptr'))return false;
  const gm=$('gm'),cur=gm?parseFloat(gm.style.left):50,pct=Math.max(0,Math.min(100,(isFinite(cur)?cur:50)+d));
  const r=sp.getBoundingClientRect(),x=r.left+pct/100*r.width,y=r.top+r.height/2;
  kbPtr(sp,'pointerdown',x,y);kbPtr(sp,'pointerup',x,y);return true;
}
function kbRx(){
  const r=$('rx');if(!r)return false;
  if(r.classList.contains('w')||r.classList.contains('g')){const b=r.getBoundingClientRect();kbPtr(r,'pointerdown',b.left+b.width/2,b.top+b.height/2);return true}
  const btn=r.querySelector('button');if(btn){btn.click();return true}return false;
}
function kbPrimary(root){
  const bs=[...root.querySelectorAll('button')].filter(b=>kbVis(b)&&!b.disabled&&!/\b(sec|ib|qm|opt|back|gt|sg|lo|kx)\b/.test(b.className));
  return bs.find(b=>b.classList.contains('ok'))||bs[bs.length-1]||null;
}
document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey||e.isComposing)return;
  const t=e.target,tag=t&&t.tagName,k=e.key,typing=/^(INPUT|TEXTAREA|SELECT)$/.test(tag)||(t&&t.isContentEditable);
  if(k==='Escape'){
    if(typing){t.blur();return}
    if($('lcd')){lobNo();e.preventDefault();return}
    if($('dnote')){dnoteNo();e.preventDefault();return}
    if($('hmc')){hmNo();e.preventDefault();return}
    if(document.body.classList.contains('live')){hmAsk();e.preventDefault()}
    return;
  }
  if(typing){
    if(k!=='Enter')return;
    if(t.hasAttribute&&t.hasAttribute('data-nx')){e.preventDefault();const ins=[...t.closest('.card,[data-p]').querySelectorAll('input.txt')],i=ins.indexOf(t);if(ins[i+1])ins[i+1].focus();return}
    if(t.closest&&t.closest('#pl')){e.preventDefault();const ins=[...document.querySelectorAll('#pl input')],i=ins.indexOf(t);if(i<ins.length-1)ins[i+1].focus();else savePlayers();return}
    if(t.id==='slfn'){e.preventDefault();slfAddCat();return}
    if(t.id==='slfe'){e.preventDefault();slfFix();return}
    if(t.id==='jc'){e.preventDefault();netJoinStart();return}
    if(t.id==='myn'){const b=t.closest('.card')&&t.closest('.card').querySelector('button:not(.sec)');if(b){e.preventDefault();b.click()}else if($('jc')){e.preventDefault();$('jc').focus()}}
    return;
  }
  if($('hmc')||$('dnote')||$('lcd'))return;                       // Rückfrage offen: nur Tab/Enter/Leertaste auf den Knöpfen
  if(tag==='BUTTON'||tag==='A')return;                  // fokussierte Knöpfe lösen Enter/Leertaste selbst aus
  if(t&&t.getAttribute&&t.getAttribute('role')==='button'&&(k==='Enter'||k===' ')){e.preventDefault();t.click();return}
  const root=kbRoot(),lc=k.length===1?k.toLowerCase():k;
  if((k===' '||k==='Enter')&&kbRx()){e.preventDefault();return}
  const c4play=$('c4b')&&!($('c4r')&&$('c4r').children.length);
  if(c4play){
    if(/^[1-7]$/.test(k)){e.preventDefault();kbC4Drop(+k-1);return}
    if(k==='ArrowLeft'||k==='ArrowRight'){e.preventDefault();KBC=Math.max(0,Math.min(6,KBC+(k==='ArrowRight'?1:-1)));kbC4Hov(KBC);return}
    if(k==='ArrowDown'||k==='Enter'||k===' '){e.preventDefault();kbC4Drop(KBC);return}
  }
  if((k==='ArrowLeft'||k==='ArrowRight')&&kbSlider((k==='ArrowRight'?1:-1)*(e.shiftKey?5:1))){e.preventDefault();return}
  if($('hg')&&/^[a-z]$/.test(lc)){const b=root.querySelector('#hg [data-l="'+lc.toUpperCase()+'"]');if(b&&!b.disabled){e.preventDefault();b.click()}return}
  if(k==='Backspace'&&$('ckdel')){e.preventDefault();$('ckdel').click();return}
  if(/^[0-9]$/.test(k)){
    const modal=document.querySelector('.pk:not(#hmc)'),box=modal||root;
    const opts=[...box.querySelectorAll('.opt,.locs .lo,[data-kn]')].filter(kbVis),n=k==='0'?10:+k;
    if(opts.length){if(opts[n-1]){e.preventDefault();opts[n-1].click()}return}
    const tiles=[...app.querySelectorAll('.gt')].filter(kbVis);
    if(tiles[n-1]){e.preventDefault();tiles[n-1].click()}
    return;
  }
  let el=null;
  if(lc==='i')el=root.querySelector('.qm');
  else if(lc==='s')el=$('sk');
  else if(lc==='f')el=$('bk');
  else if(lc==='t')el=[...root.querySelectorAll('button')].find(b=>/Tabu!/.test(b.textContent));
  if(el&&kbVis(el)){e.preventDefault();el.click();return}
  if(k==='Enter'||k===' '){const b=kbPrimary(root);if(b){e.preventDefault();b.click()}}
});

