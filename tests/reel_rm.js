const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--no-sandbox']});let f=0;const ok=(c,m)=>{console.log((c?'  ✓ ':'  ✗ ')+m);if(!c)f++};
for(const rm of ['no-preference','reduce']){
 const ctx=await b.newContext({viewport:{width:390,height:844},reducedMotion:rm});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8765/index.html');await p.waitForSelector('#app .screen');
 await p.evaluate(()=>{S.names=['Anna','Ben'];Object.assign(OPT.slf,{mode:'digital',stop:true,rounds:3,dtimer:90,sel:{Stadt:1,Land:1,Fluss:1,Tier:1,Beruf:1},custom:[]});startSession('slf')});
 await p.waitForTimeout(300);
 const t=()=>p.evaluate(()=>getComputedStyle(document.querySelector('.slfd')).transform);
 const a=await t();await p.waitForTimeout(800);const c=await t();await p.waitForTimeout(1500);const d=await t();
 const dur=await p.evaluate(()=>getComputedStyle(document.querySelector('.slfd')).animationDuration);
 ok(a!==c&&c!==d,`Bewegung „${rm}“: Rad dreht sich (Dauer ${dur})`);
 await ctx.close();
}
// Ruhemodus der App (Effekte aus)
const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
await p.goto('http://127.0.0.1:8765/index.html');await p.waitForSelector('#app .screen');
await p.evaluate(()=>{C.fx=false;applyTheme();S.names=['Anna','Ben'];Object.assign(OPT.slf,{mode:'digital',stop:true,rounds:3,dtimer:90});startSession('slf')});await p.waitForTimeout(300);
const t=()=>p.evaluate(()=>getComputedStyle(document.querySelector('.slfd')).transform);
const a=await t();await p.waitForTimeout(800);const c=await t();
ok(a!==c,'Effekte in der App aus: Rad dreht sich trotzdem');
await b.close();process.exit(f?1:0)})();
