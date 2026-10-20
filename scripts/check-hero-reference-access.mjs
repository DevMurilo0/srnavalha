import{Browser,sleep}from'../plugins/taste-frontend-design/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import{serve}from'./hero-test-server.mjs';import{readFileSync,writeFileSync}from'node:fs';
const s=await serve(),b=await Browser.launch(),p=await b.newPage(),results=[];
try{
 for(const width of[1672,390,320]){
  await p.setViewport({width,height:width===1672?941:844,mobile:width<640});await p.goto(s.base,{settleMs:1600});
  await p.screenshot({path:`capturas/hero-reference/final-${width}.png`,format:'png'});
  await p.eval(readFileSync(process.env.AXE_PATH||'/tmp/sr-v9-axe.js','utf8'));
  const result=await p.eval(()=>axe.run({include:[['.nv11-hero'],['.nv11-header']]},{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
  results.push({width,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.html)}))});
 }
 await p.goto(s.base,{settleMs:0});await p.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await sleep(80);
 const pass=await p.eval(()=>!document.querySelector('.nv11-curtain')&&document.querySelector('.nv11-hero').getAnimations({subtree:true}).length===0);
 results.push({name:'Preferência dinâmica após evento matchMedia',pass});
 results.push({name:'Console',errors:p.consoleErrors});
 console.log(JSON.stringify(results,null,2));
}finally{writeFileSync('docs/HERO_REFERENCE_ACCESS.json',JSON.stringify(results,null,2));await b.close();s.close();process.exit(results.some(r=>r.violations?.length||r.pass===false||r.errors?.length)?1:0)}
