// A/B startup measurement against the committed V3, no production instrumentation.
import {createServer} from 'node:http';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {extname,resolve} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||'/tmp/srnavalha-validation/package.json');
const {chromium}=require('playwright-core');
const baseline=process.env.BASELINE_REF||'702b8fdd6bf3452edacc7930808bdf065d337a94';
const overrides=new Map(['js/ritual/opening.js','css/ritual/loader-v2.css','css/ritual/perfect-cut-v3.css','index.html'].map(p=>[p,execFileSync('git',['show',`${baseline}:${p}`])]));
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=createServer((req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';res.setHeader('Content-Type',types[extname(p)]||'application/octet-stream');res.end(overrides.get(p)||readFileSync(resolve(p)))}catch{res.writeHead(404);res.end()}}).listen(8048,'127.0.0.1');
const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'});
const results=[];
try{for(const width of [390,1440])for(const version of ['before','after']){
 const context=await b.newContext({viewport:{width,height:844}});const p=await context.newPage();await p.route('https://**/*',r=>r.abort());
 const c=await context.newCDPSession(p);await c.send('Performance.enable');
 await p.addInitScript(()=>{
  window.cutProfile={frames:[],tasks:[],geometryReads:0};let cutting=false,last=0;
  const original=Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect=function(...args){if(cutting)window.cutProfile.geometryReads++;return original.apply(this,args)};
  new PerformanceObserver(list=>{for(const e of list.getEntries())if(cutting)window.cutProfile.tasks.push(e.duration)}).observe({type:'longtask',buffered:true});
  document.addEventListener('DOMContentLoaded',()=>{
   const stage=document.querySelector('#sr-loader-stage');if(!stage)return;
   const observer=new MutationObserver(()=>{if(stage.classList.contains('snv2-cut-ready')){cutting=true;window.cutProfile.start=performance.now();observer.disconnect();requestAnimationFrame(frame)}});
   observer.observe(stage,{attributes:true,attributeFilter:['class']});
   function frame(t){if(last)window.cutProfile.frames.push(t-last);last=t;if(cutting)requestAnimationFrame(frame)}
  });
  document.addEventListener('openingend',()=>{window.cutProfile.end=performance.now();cutting=false});
 });
 await p.goto(`http://127.0.0.1:${version==='before'?8048:8047}/`,{waitUntil:'domcontentloaded'});
 await p.waitForSelector('.snv2-run');await p.waitForTimeout(1000);
 await c.send('Emulation.setCPUThrottlingRate',{rate:4});
 await p.waitForFunction(()=>!document.documentElement.classList.contains('sr-loader-boot'));
 const data=await p.evaluate(()=>window.cutProfile);const sorted=data.frames.sort((a,b)=>a-b);
 results.push({version,width,cpu:4,cutDurationMs:data.end-data.start,frames:sorted.length,p95FrameMs:sorted[Math.floor(sorted.length*.95)],framesOver34ms:sorted.filter(n=>n>34).length,longTasks:data.tasks.length,maxLongTaskMs:Math.max(0,...data.tasks),geometryReadsDuringCut:data.geometryReads});
 await context.close();console.log(results.at(-1));
}}finally{await b.close();server.close()}
writeFileSync('docs/perfect-cut-v4/performance.json',JSON.stringify({baseline,results},null,2));
