/* ---------- Sichtbarkeit & Rechte im Spiel (Hüllen um die Spiel-Funktionen) ---------- */
const _hand=window.hand;
window.hand=function(pi,msg,go,pr,tag){
  if(!NET.host)return _hand.apply(this,arguments);
  ACT=pi;PERM=null;WAIT=waitHTML(pi,pr,tag);HF=go;
  go();syncViews();
};
const PUBW=['neResult','kiTurn','kiShow','kiEnd','moResult','tEnd','hiResult','home','settings','gameSetup','wheel','startSession','finish','arResult','spyTalk','spyVote','spyEnd','bResult','pEnd','waLock','waReveal','rxResult','boRound','boBoom','c4Round','mmScreen','hgScreen','ckResult','ttScreen','dsScreen','slfRound','slfPlay','slfScore','slfReview','slfReelScreen','slfShow','bsTurn'];
const PERMS={
  spyTalk:()=>'all',
  waGuess:()=>'all',
  spyGuess:()=>()=>G.spy,
  boLight:()=>()=>G.hold,
  c4Round:()=>()=>((G.over||(G.cpu&&G.turn===1))?'host':G.mi),
  bsTurn:()=>()=>((G.over||(G.cpu&&G.t===1))?'host':G.pi[G.t]),
  mmScreen:()=>()=>(G.busy?'host':G.cur),
  hgScreen:()=>()=>(G.res?'host':G.cur),
  ttScreen:()=>()=>((G.over||(G.cpu&&G.turn===1))?'host':G.pi[G.turn]),
  dsScreen:()=>()=>(G.fin?'host':G.cur),
  waLock:()=>'all',
  kiTurn:()=>()=>G.cur,
  kiShow:()=>()=>G.cur
};
const MENU=['home','settings','gameSetup'];
function wrapPub(n,permFn){
  const f=window[n];if(typeof f!=='function')return;
  window[n]=function(){
    ACT=null;parEnd();PERM=permFn?permFn():null;
    if(n==='startSession')NET.inGame=true;
    if(MENU.indexOf(n)>=0){NET.inGame=false;NET.scr=(n==='home')?'home':null;netPrune()}
    else NET.scr=null;
    const r=f.apply(this,arguments);
    if(NET.host)syncViews();
    return r;
  };
}
PUBW.forEach(n=>wrapPub(n,PERMS[n]));
['waGuess','spyGuess','boLight'].forEach(n=>wrapPub(n,PERMS[n]));
// Effekte auch auf die Handys der Mitspieler
['confetti','flash','vib'].forEach(n=>{const f=window[n];window[n]=function(){fxSend({k:n,a:Array.from(arguments)});return f.apply(this,arguments)}});
Object.keys(sfx).forEach(k=>{const f=sfx[k];sfx[k]=function(){fxSend({k:'s',a:[k]});return f.apply(this,arguments)}});
// Host: eigene Eingaben nur, wenn man gerade dran sein darf
['click','pointerdown'].forEach(ty=>document.addEventListener(ty,e=>{
  if(!NET.host||NET.syn||!app.contains(e.target))return;
  if(!canAct(0)){e.stopPropagation();e.preventDefault();if(ty==='click')toast('Gerade ist jemand anderes dran')}
},true));

