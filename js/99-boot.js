if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){window.addEventListener('load',()=>{try{navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}})}
applyTheme();
(function(){
  const hh=(location.hash||'').replace('#','').toUpperCase().replace(/[^A-Z0-9]/g,''),ss=sessGet();
  // Gemerkte Lobby (gleicher Code oder kein Code im Link): automatisch wieder verbinden
  if(window.Peer&&ss&&(hh.length!==APP_CODE_LEN||hh===ss.code)){netJoin(ss.code,ss.name);return}
  if(hh.length===APP_CODE_LEN&&window.Peer)joinScreen(hh);else home();
})();

