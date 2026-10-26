// Optional development tooling. Run before/after against the same local server.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');
const {chromium}=require('playwright-core');
const label=process.argv[2]||'after',dir=`docs/reflexo/${label}`;
mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
const output=[];
try{for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:900},isMobile:width===390,hasTouch:width===390,deviceScaleFactor:1});
 const page=await context.newPage(),cdp=await context.newCDPSession(page);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await cdp.send('Performance.enable');
 await page.addInitScript(()=>{
  window.profile={longTasks:[],shifts:[],frames:[],geometryReads:0,peakAnimations:0,observers:0};
  const native=Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect=function(){if(window.measuring)profile.geometryReads++;return native.call(this)};
  new PerformanceObserver(l=>l.getEntries().forEach(e=>profile.longTasks.push({start:e.startTime,duration:e.duration}))).observe({type:'longtask',buffered:true});
  new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)profile.shifts.push(e.value)})).observe({type:'layout-shift',buffered:true});
 });
 await context.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await page.goto(process.env.SITE_URL||'http://127.0.0.1:8047/',{waitUntil:'load'});
 await page.waitForTimeout(3600);
 await page.evaluate(()=>document.querySelector('#trabalhos').dispatchEvent(new Event('focusin',{bubbles:true})));
 await page.waitForTimeout(200);
 await page.screenshot({path:`${dir}/hero-${width}.png`});
 const initial=await cdp.send('Memory.getDOMCounters');
 let layers=0;cdp.on('LayerTree.layerTreeDidChange',e=>layers=Math.max(layers,e.layers?.length||0));await cdp.send('LayerTree.enable');
 await cdp.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing,disabled-by-default-devtools.timeline',transferMode:'ReturnAsStream'});
 const before=await cdp.send('Performance.getMetrics');
 await page.evaluate(async()=>{
  window.measuring=true;performance.mark('scroll-start');let last=performance.now();
  const max=document.documentElement.scrollHeight-innerHeight;
  await new Promise(resolve=>{const start=performance.now();function step(now){profile.frames.push(now-last);last=now;profile.peakAnimations=Math.max(profile.peakAnimations,document.getAnimations().filter(a=>a.playState==='running').length);const p=Math.min(1,(now-start)/14000);scrollTo({top:max*(p<.7?p/.7:(1-p)/.3),behavior:'instant'});if(p<1)requestAnimationFrame(step);else resolve()}requestAnimationFrame(step)});
  performance.mark('scroll-end');window.measuring=false;
 });
 const after=await cdp.send('Performance.getMetrics');
 const completion=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const {stream}=await completion;let trace='';for(;;){const chunk=await cdp.send('IO.read',{handle:stream});trace+=chunk.data;if(chunk.eof)break}await cdp.send('IO.close',{handle:stream});
 // Compact raw events retain timestamps, durations and stacks for DevTools import.
 const data=JSON.parse(trace);writeFileSync(`${dir}/trace-${width}.json.gz`,gzipSync(trace));
 const sample=await page.evaluate(()=>({profile,marks:performance.getEntriesByType('mark').map(e=>({name:e.name,start:e.startTime})),animations:document.getAnimations().length}));
 const values=Object.fromEntries(after.metrics.map(m=>[m.name,m.value]));const delta=Object.fromEntries(before.metrics.filter(m=>/Duration|Count/.test(m.name)).map(m=>[m.name,values[m.name]-m.value]));
 const frames=sample.profile.frames.slice(1).sort((a,b)=>a-b),start=sample.marks.find(m=>m.name==='scroll-start').start,end=sample.marks.find(m=>m.name==='scroll-end').start;
 const costs={};for(const e of data.traceEvents)if(['Layout','UpdateLayoutTree','Paint','CompositeLayers','PrePaint'].includes(e.name)&&e.dur){const c=costs[e.name]??={count:0,totalMs:0,maxMs:0};c.count++;c.totalMs+=e.dur/1000;c.maxMs=Math.max(c.maxMs,e.dur/1000)}
 const row={width,cpuRate:4,viewportHeight:900,scrollDurationMs:end-start,geometryReads:sample.profile.geometryReads,peakAnimations:sample.profile.peakAnimations,frameIntervals:{samples:frames.length,p50:frames[Math.floor(frames.length*.5)],p95:frames[Math.floor(frames.length*.95)],over33ms:frames.filter(n=>n>33.4).length,max:frames.at(-1)},scrollLongTasks:sample.profile.longTasks.filter(t=>t.start>=start&&t.start<=end),startupLongTasks:sample.profile.longTasks.filter(t=>t.start<start),cls:sample.profile.shifts.reduce((a,b)=>a+b,0),costs,delta,initial,final:await cdp.send('Memory.getDOMCounters'),peakLayers:layers,animationsAfter:sample.animations};output.push(row);console.log(JSON.stringify(row));await context.close();
}}finally{writeFileSync(`${dir}/metrics.json`,JSON.stringify({date:new Date().toISOString(),browser:browser.version(),results:output},null,2));await browser.close()}
