/* Diagnose für Anzeige-Probleme (iPad): 5× schnell auf das Logo tippen, dann Screenshot schicken. Nochmal tippen schließt. */
function diag(){
  const old=$('dg');if(old){old.remove();return}
  const pr=(css)=>{const d=document.createElement('div');d.style.cssText='position:fixed;left:0;top:0;width:0;visibility:hidden;pointer-events:none;'+css;document.body.appendChild(d);const r=d.getBoundingClientRect();d.remove();return Math.round(r.height*10)/10};
  const vv=window.visualViewport,cs=getComputedStyle(app);
  const L=[
   'innen '+innerWidth+'×'+innerHeight+'  außen '+outerWidth+'×'+outerHeight+'  screen '+screen.width+'×'+screen.height+'  dpr '+devicePixelRatio,
   'visualViewport '+(vv?Math.round(vv.width)+'×'+Math.round(vv.height)+' oben '+Math.round(vv.offsetTop)+' scale '+vv.scale:'–'),
   'html client '+document.documentElement.clientHeight+'  scrollH '+document.documentElement.scrollHeight+'  scrollY '+Math.round(scrollY),
   'body '+Math.round(document.body.getBoundingClientRect().height)+'  bg '+Math.round(document.querySelector('.bg').getBoundingClientRect().height),
   '100vh '+pr('height:100vh')+'  100lvh '+pr('height:100lvh')+'  100dvh '+pr('height:100dvh')+'  100svh '+pr('height:100svh'),
   'safe oben '+pr('height:env(safe-area-inset-top,0px)')+'  unten '+pr('height:env(safe-area-inset-bottom,0px)')+'  links '+pr('height:env(safe-area-inset-left,0px)'),
   'app scrollTop '+Math.round(app.scrollTop)+'  scrollH '+app.scrollHeight+'  clientH '+app.clientHeight,
   'standalone '+((window.matchMedia&&matchMedia('(display-mode: standalone)').matches)?'ja':'nein')+'  nav.standalone '+navigator.standalone,
   'Version: Diagnose v1'
  ];
  const d=document.createElement('div');d.id='dg';d.textContent=L.join('\n');d.onclick=()=>d.remove();document.body.appendChild(d);
}
let lgN=0,lgT=0;
document.addEventListener('click',e=>{
  if(!e.target.closest||!e.target.closest('.logo'))return;
  const n=Date.now();lgN=(n-lgT<1500)?lgN+1:1;lgT=n;
  if(lgN>=5){lgN=0;diag()}
});

