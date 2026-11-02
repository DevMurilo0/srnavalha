import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=createRequire('/tmp/srnavalha-validation/package.json')('playwright-core');
const b=await chromium.launch({executablePath:'/home/murilo/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell'});
const dir='docs/motion-states';mkdirSync(dir,{recursive:true});const measurements=[];
for(const width of [390,1440]){
 const p=await b.newPage({viewport:{width,height:900}});await p.route('https://**/*',r=>r.abort());
 await p.addInitScript(()=>{const timeout=window.setTimeout;window.setTimeout=(fn,ms,...args)=>timeout(fn,ms>=1000?ms*20:ms,...args);window.captured=[];const animate=Element.prototype.animate;Element.prototype.animate=function(...args){const a=animate.apply(this,args);if(this.matches('.razor-flight')||this.closest('#cut-intro')||this.matches('.motion-glyph')||this.matches('[data-reveal]')){a.pause();window.captured.push(a)}return a}});
 await p.goto('http://127.0.0.1:8047',{waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>document.querySelector('.razor-flight'));
 for(const time of [0,300,750,1250,1549]){
  await p.evaluate(t=>captured.forEach(a=>a.currentTime=t),time);
  await p.screenshot({path:`${dir}/razor-${width}-${time}.png`});
 }
 const handoff=await p.evaluate(async()=>{
  const n=document.querySelector('.razor-flight'),a=captured.find(a=>a.effect.target===n);a.currentTime=1550;
  const before=n.getBoundingClientRect().toJSON();a.finish();await new Promise(r=>setTimeout(r,0));
  const after=n.getBoundingClientRect().toJSON();return {before,after,sameNode:n===document.querySelector('.razor-stage .razor')};
 });measurements.push({width,handoff});
 await p.screenshot({path:`${dir}/razor-${width}-landed.png`});
 await p.evaluate(()=>{captured.forEach(a=>{try{a.finish()}catch{}});captured=[]});
 await p.close();
 for(const selector of ['#hero-title','#house-title','.house-main','.house-detail','#team-title','.portrait-stage','#work-title','.work-print a','#products-title','.product-object','.instrument-copy [data-type]','.instrument-photo img','#booking-title','#location-title','.facade']){
  // A fresh document per target avoids photographing an entrance completed
  // incidentally while the preceding section was being sampled.
  const framePage=await b.newPage({viewport:{width,height:900}});
  await framePage.route('https://**/*',r=>r.abort());
  await framePage.addInitScript(()=>{
   const timeout=window.setTimeout;window.setTimeout=(fn,ms,...args)=>timeout(fn,ms>=1000?ms*20:ms,...args);
   window.captured=[];const animate=Element.prototype.animate;
   Element.prototype.animate=function(...args){const a=animate.apply(this,args);a.pause();captured.push(a);return a};
  });
  await framePage.goto('http://127.0.0.1:8047/#motion-capture',{waitUntil:'domcontentloaded'});
  if(!await framePage.locator(selector).count()){await framePage.close();continue}
  await framePage.locator(selector).first().evaluate(n=>n.scrollIntoView({behavior:'instant',block:'center'}));
  await framePage.waitForFunction(s=>document.querySelector(s)?.dataset.reveal==='playing',selector);
  const name=selector.replace(/[^a-z0-9]+/gi,'-');
  for(const time of [0,80,120,180,450,990,1100]){
   await framePage.evaluate(t=>captured.forEach(a=>{if(a.playState!=='idle')a.currentTime=t}),time);
   await framePage.screenshot({path:`${dir}/${name}-${width}-${time}.jpg`,quality:65});
  }
  await framePage.evaluate(()=>captured.forEach(a=>{try{a.finish()}catch{}}));
  await framePage.screenshot({path:`${dir}/${name}-${width}-done.jpg`,quality:65});
  await framePage.close();
 }
}
await b.close();writeFileSync(dir+'/geometry.json',JSON.stringify(measurements,null,2));
