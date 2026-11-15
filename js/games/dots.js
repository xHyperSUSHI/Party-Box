/* ---------- Käsekästchen ---------- */
OPT.dots={size:4};
GAMES.dots={name:'Käsekästchen',e:'🔲',tag:'Linien ziehen, Kästchen sichern',c:['#eab308','#f97316'],min:2,teams:false,
  desc:'Der Papier-Klassiker: Linien zwischen Punkten ziehen und möglichst viele Kästchen schließen.',
  rules:'Wer dran ist, zieht <b>eine Linie</b> zwischen zwei benachbarten Punkten. Wer damit ein Kästchen schließt, bekommt es (mit seiner Farbe) und <b>darf nochmal</b>. Schließt man keins, ist der Nächste dran. Wenn alle Linien gezogen sind, gewinnt, wer die meisten Kästchen hat. Tipp: Verschenke keine dritte Linie an ein Kästchen!',
  opts:()=>`<p class="sm" style="margin:0 0 8px">Spielfeld (Kästchen pro Seite)</p>${seg('dots','size',[3,4,5],v=>v+'×'+v)}`,
  start:dsStart};
function dsStart(){
  const N=G.o.size;G.n=N;
  G.h=Array.from({length:N+1},()=>Array(N).fill(0));G.v=Array.from({length:N},()=>Array(N+1).fill(0));G.bx=Array.from({length:N},()=>Array(N).fill(-1));
  G.cur=0;G.left=N*N;G.fin=false;dsScreen();
}
function dsScreen(){
  const N=G.n;let h='';
  for(let gr=0;gr<=2*N;gr++)for(let gc=0;gc<=2*N;gc++){
    if(gr%2===0&&gc%2===0)h+='<i class="dd"></i>';
    else if(gr%2===0){const r=gr/2,c=(gc-1)/2,o=G.h[r][c];h+=`<b class="de h${o?' on':''}" ${o?`style="--c:${hueC(o-1)}"`:`onclick="dsEdge('h',${r},${c})" aria-label="Linie"`}></b>`}
    else if(gc%2===0){const r=(gr-1)/2,c=gc/2,o=G.v[r][c];h+=`<b class="de v${o?' on':''}" ${o?`style="--c:${hueC(o-1)}"`:`onclick="dsEdge('v',${r},${c})" aria-label="Linie"`}></b>`}
    else{const r=(gr-1)/2,c=(gc-1)/2,o=G.bx[r][c];h+=`<div class="db${o>=0?' own':''}" ${o>=0?`style="--c:${hueC(o)}"`:''}>${o>=0?esc((S.P[o]||'?').trim().charAt(0).toUpperCase()):''}</div>`}
  }
  scr(`${logo('Käsekästchen',1)}${clsHead(' ▣')}<div class="sm" style="text-align:center;margin:8px 0">${G.fin?'Alle Kästchen sind vergeben':`${esc(S.P[G.cur])} ist dran`}</div><div class="dsb" style="--n:${N}">${h}</div>`);
}
function dsEdge(t,r,c){
  if(G.fin)return;const a=t==='h'?G.h:G.v;if(!a||!a[r]||a[r][c])return;
  const g=G,N=G.n;a[r][c]=G.cur+1;let got=0;
  const chk=(br,bc)=>{if(br<0||bc<0||br>=N||bc>=N||G.bx[br][bc]>=0)return;if(G.h[br][bc]&&G.h[br+1][bc]&&G.v[br][bc]&&G.v[br][bc+1]){G.bx[br][bc]=G.cur;got++}};
  if(t==='h'){chk(r-1,c);chk(r,c)}else{chk(r,c-1);chk(r,c)}
  if(got){G.pts[G.cur]+=got;G.left-=got;sfx.ok();vib(25)}else{G.cur=(G.cur+1)%S.P.length;sfx.pop()}
  if(!G.left){G.fin=true;dsScreen();setTimeout(()=>{if(G===g)finish({unit:' Kästchen'})},1300);return}
  dsScreen();
}

