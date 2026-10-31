// Real samples, two scenarios. rAF intervals in headless Chromium are evidence
// for this run, not a claim about physical GPU FPS or user devices.
import{createRequire}from'node:module';import{mkdirSync,writeFileSync}from'node:fs';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json'),{chromium}=require('playwright-core');
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'}),context=await browser.newContext({viewport:{width:1366,height:768}}),page=await context.newPage(),errors=[];
const dir=process.env.V31_EVIDENCE||'/tmp/srnavalha-v31/final';mkdirSync(dir,{recursive:true});page.on('pageerror',e=>errors.push(e.message));await context.route('https://**/*',r=>r.abort());
await page.addInitScript(()=>{
 Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4,configurable:true});
 window.__profile={phase:'load',longTasks:[],shifts:[]};
 new PerformanceObserver(list=>{for(const entry of list.getEntries())__profile.longTasks.push({phase:__profile.phase,duration:entry.duration})}).observe({type:'longtask',buffered:true});
 new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)__profile.shifts.push({phase:__profile.phase,value:entry.value})}).observe({type:'layout-shift',buffered:true});
});
const results=[];
try{
 await page.goto((process.env.SITE_URL||'http://127.0.0.1:8047/'),{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.querySelector('#sr-loader-stage')&&!document.querySelector('.hero.is-arriving'));
 const cdp=await context.newCDPSession(page);await cdp.send('Performance.enable');
 for(const [name,rate] of [['first-pass',1],['steady-4x',4]]){
  await cdp.send('Emulation.setCPUThrottlingRate',{rate});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(250);
  const before=(await cdp.send('Performance.getMetrics')).metrics;
  const sample=await page.evaluate(async phase=>{
   __profile.phase=phase;const frames=[];let previous=0,epoch=0;
   const distance=document.documentElement.scrollHeight-innerHeight;
   await new Promise(resolve=>{
    const frame=now=>{
     if(!epoch)epoch=now;
     if(previous)frames.push(now-previous);previous=now;
     const progress=Math.min(1,(now-epoch)/6000);scrollTo({top:distance*progress,behavior:'instant'});
     if(progress<1)requestAnimationFrame(frame);else resolve();
    };requestAnimationFrame(frame);
   });
   await new Promise(r=>setTimeout(r,1700));
   const sorted=frames.sort((a,b)=>a-b),percentile=p=>Math.round(sorted[Math.floor((sorted.length-1)*p)]*10)/10;
   const tasks=__profile.longTasks.filter(t=>t.phase===phase);
   return {phase,samples:frames.length,medianFrameMs:percentile(.5),p95FrameMs:percentile(.95),maxFrameMs:percentile(1),longTasks:tasks.length,longestTaskMs:Math.round(Math.max(0,...tasks.map(t=>t.duration))),layoutShift:__profile.shifts.filter(s=>s.phase===phase).reduce((n,s)=>n+s.value,0),overflow:document.documentElement.scrollWidth-innerWidth,activePlanes:document.querySelectorAll('[data-depth-state=active]').length,visiblePending:[...document.querySelectorAll('.cm-pending')].filter(n=>{const r=n.getBoundingClientRect();return r.height&&r.bottom>0&&r.top<innerHeight}).length};
  },name);
  const after=(await cdp.send('Performance.getMetrics')).metrics;
  const delta=name=>(after.find(m=>m.name===name)?.value||0)-(before.find(m=>m.name===name)?.value||0);
  results.push({...sample,cpuThrottling:rate,layoutCount:delta('LayoutCount'),styleRecalculations:delta('RecalcStyleCount'),scriptDurationSeconds:delta('ScriptDuration')});
 }
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
 const typeBefore=(await cdp.send('Performance.getMetrics')).metrics;
 const typography=await page.evaluate(async()=>{
  const {revealText}=await import('/js/ritual/text-motion.js'),heading=document.querySelector('#visit-title');
  const original=heading.textContent;window.__glyphProbe=revealText(heading,'fold',{manual:true});
  return {letters:heading.querySelectorAll('.cm-letter').length,original};
 });
 const typeAfter=(await cdp.send('Performance.getMetrics')).metrics;
 typography.layoutCount=(typeAfter.find(m=>m.name==='LayoutCount')?.value||0)-(typeBefore.find(m=>m.name==='LayoutCount')?.value||0);
 typography.styleRecalculations=(typeAfter.find(m=>m.name==='RecalcStyleCount')?.value||0)-(typeBefore.find(m=>m.name==='RecalcStyleCount')?.value||0);
 typography.restored=await page.evaluate(original=>{__glyphProbe.cancel();delete window.__glyphProbe;return document.querySelector('#visit-title').textContent===original&&!document.querySelector('#visit-title .cm-run')},typography.original);
 const output={environment:'Linux headless Chromium; 1366×768; hardwareConcurrency=4; scripted native-scroll tour',results,typography,errors,limitations:'rAF timings are local headless samples, not physical GPU FPS guarantees; first-pass includes section entrances; steady-4x runs after entrances settle'};
 writeFileSync(`${dir}/performance.json`,JSON.stringify(output,null,2));console.log(JSON.stringify(output));
 if(errors.length||results.some(r=>r.overflow||r.visiblePending||r.activePlanes>3))process.exitCode=1;
}finally{await browser.close()}
