(function(){
 const bc=new BroadcastChannel('pbmock'),peers={};
 const rid=()=>Math.random().toString(36).slice(2,10);
 class Conn{
  constructor(peer,remote,id){this.peer=remote;this._p=peer;this.id=id;this.open=false;this._h={}}
  on(e,f){(this._h[e]=this._h[e]||[]).push(f);return this}
  _e(e,a){(this._h[e]||[]).forEach(f=>f(a))}
  send(d){if(!this.open)return;if(window.__MAXMSG&&JSON.stringify(d).length>window.__MAXMSG)throw new TypeError('Message too large');const m={k:'data',to:this.peer,from:this._p.id,cid:this.id,d:JSON.parse(JSON.stringify(d))};const L=window.__LAT||0;if(L)setTimeout(()=>bc.postMessage(m),L);else bc.postMessage(m)}
  close(){if(!this.open)return;this.open=false;bc.postMessage({k:'close',to:this.peer,from:this._p.id,cid:this.id});this._e('close')}
 }
 class Peer{
  constructor(id){this.id=id||('c-'+rid());this._h={};this.conns={};peers[this.id]=this;setTimeout(()=>this._e('open',this.id),20)}
  on(e,f){(this._h[e]=this._h[e]||[]).push(f);return this}
  _e(e,a){(this._h[e]||[]).forEach(f=>f(a))}
  connect(id){const c=new Conn(this,id,rid());this.conns[c.id]=c;bc.postMessage({k:'req',to:id,from:this.id,cid:c.id});return c}
  destroy(){Object.values(this.conns).forEach(c=>c.close());delete peers[this.id]}
  reconnect(){}
 }
 bc.onmessage=ev=>{
  const m=ev.data,p=peers[m.to];if(!p)return;
  if(m.k==='req'){const c=new Conn(p,m.from,m.cid);p.conns[m.cid]=c;c.open=true;bc.postMessage({k:'ack',to:m.from,from:p.id,cid:m.cid});p._e('connection',c);setTimeout(()=>c._e('open'),0)}
  else if(m.k==='ack'){const c=p.conns[m.cid];if(c){c.open=true;c._e('open')}}
  else if(m.k==='data'){const c=p.conns[m.cid];c&&c._e('data',m.d)}
  else if(m.k==='close'){const c=p.conns[m.cid];if(c&&c.open){c.open=false;c._e('close')}}
 };
 window.__MockPeer=Peer;
 // TURN-Worker (Cloudflare) ohne Internet: feste Testantwort
 const f0=window.fetch;window.fetch=function(u,o){if(String(u&&u.url||u).includes('workers.dev'))return Promise.resolve(new Response(JSON.stringify(window.__TURN_RESP||{iceServers:[{urls:['stun:stun.cloudflare.com:3478']},{urls:['turn:turn.cloudflare.com:3478?transport=udp','turns:turn.cloudflare.com:443?transport=tcp'],username:'u',credential:'c'}],ttl:86400}),{headers:{'Content-Type':'application/json'}}));return f0.apply(this,arguments)};
 Object.defineProperty(window,'Peer',{configurable:true,get(){return Peer},set(){}});
})();
