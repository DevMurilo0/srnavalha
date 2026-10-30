// Reproducible browser smoke profile, 4x CPU throttling and a 4-thread laptop.
import {createRequire} from 'node:module';
import {writeFileSync,mkdirSync} from 'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');
const {chromium}=require('playwright-core');
const browser=await chromium.launch({headless:true,
 executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{
  Object.defineProperty(navigator,'hardwareConcurrency',{configurable:true,get:()=>4});
});
const base=process.env.SITE_URL||'http://127.0.0.1:8047/';
try{
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!document.querySelector('#sr-loader-stage')&&
   !document.querySelector('.hero.is-arriving'),undefined,{timeout:60000});
 const poleState=await page.evaluate(()=>{
   const rotor=document.querySelector('.hero-pole__rotor');
   return {visible:document.querySelector('.hero').classList.contains('is-poles-visible'),
     name:getComputedStyle(rotor).animationName,
     playState:getComputedStyle(rotor).animationPlayState};
 });
 const session=await context.newCDPSession(page);
 await session.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.evaluate(()=>{
  window.__motionProfile={frames:[],longTasks:[],active:true};
  if('PerformanceObserver' in window){
   try{
    new PerformanceObserver(list=>{
     if(window.__motionProfile?.active)
      for(const item of list.getEntries())window.__motionProfile.longTasks.push(item.duration);
    }).observe({type:'longtask',buffered:false});
   }catch{}
  }
  let previous=0;
  const sample=now=>{
   const profile=window.__motionProfile;
   if(!profile?.active)return;
   if(previous)profile.frames.push(now-previous);
   previous=now;
   requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
 });
 let reviewState=null;
 for(const id of ['casa','servicos','equipe','trabalhos','produtos','avaliacoes','localizacao','contato']){
  await page.locator('#'+id).evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));
  await page.waitForTimeout(420);
  if(id==='avaliacoes'){
   await page.locator('.review-viewport').evaluate(el=>
     el.scrollIntoView({behavior:'instant',block:'center'}));
   await page.waitForTimeout(320);
   reviewState=await page.evaluate(()=>{
     const track=document.querySelector('.review-track');
     const style=getComputedStyle(track);
     return {lite:document.documentElement.classList.contains('sr-lite-motion'),
       moving:track.classList.contains('is-moving'),
       paused:track.classList.contains('is-paused'),
       playState:style.animationPlayState,animationName:style.animationName,
       clone:!!document.querySelector('.review-group[aria-hidden="true"]')};
   });
  }
 }
 const metrics=await page.evaluate(()=>{
  const p=window.__motionProfile;p.active=false;
  const frames=p.frames.filter(x=>Number.isFinite(x)).sort((a,b)=>a-b);
  const pct=(list,q)=>list.length?Math.round(list[Math.floor((list.length-1)*q)]*10)/10:null;
  const pending=[...document.querySelectorAll('.cm-pending')].filter(el=>{
   const r=el.getBoundingClientRect();
   return r.height>0&&r.width>0&&r.top<innerHeight*.85&&r.bottom>0;
  });
  return {
   viewport:innerWidth,throttling:'4x',threads:navigator.hardwareConcurrency,
   samples:frames.length,medianFrameMs:pct(frames,.5),p95FrameMs:pct(frames,.95),
   maxFrameMs:pct(frames,1),longTasks:p.longTasks.length,
   longestTaskMs:pct(p.longTasks.sort((a,b)=>a-b),1),
   overflowPx:Math.max(0,document.documentElement.scrollWidth-innerWidth),
   visiblePending:pending.length,pendingLabels:pending.slice(0,6).map(x=>x.className),
   splitNodes:document.querySelectorAll('.cm-run').length,
   liteMode:document.documentElement.classList.contains('sr-lite-motion')
  };
 });
 metrics.errors=errors;
 metrics.reviewState=reviewState;
 metrics.poleState=poleState;
 mkdirSync('docs/cinematic-motion',{recursive:true});
 writeFileSync('docs/cinematic-motion/performance-4x.json',JSON.stringify(metrics,null,2));
 console.log('4x CPU / 4 threads — cinematic scroll:',JSON.stringify(metrics));
 if(metrics.overflowPx||metrics.visiblePending||errors.length||!metrics.liteMode||
    !reviewState?.moving||reviewState?.paused||reviewState?.playState!=='running'||
    poleState?.playState!=='running')process.exitCode=1;
}finally{await browser.close();}
