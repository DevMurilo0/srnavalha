import {Browser,sleep} from '../plugins/taste-frontend-design/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {writeFileSync} from 'node:fs';
const b=await Browser.launch(),p=await b.newPage();
try {
 await p.goto('http://127.0.0.1:8019/');
 const audit=[];
 for(const width of [1440,390]){
  await p.setViewport({width,height:900});await p.goto('http://127.0.0.1:8019/');
  await p.screenshot({path:`capturas/v9/antes/v8-${width}.jpg`,fullPage:true});
  for(const y of [0,200,450,700,1000]){await p.eval(y=>scrollTo({top:y,behavior:'instant'}),y);await sleep(100);audit.push(await p.eval(()=>({width:innerWidth,y:scrollY,hero:getComputedStyle(document.querySelector('.hero-main')).transform,image:getComputedStyle(document.querySelector('.hero-main img')).transform,animations:document.getAnimations().map(a=>({target:a.effect?.target?.className,state:a.playState}))})));}
 }
 writeFileSync('docs/fontes-v9/auditoria-v8.json',JSON.stringify({audit,errors:p.consoleErrors},null,2));
 await p.setViewport({width:1440,height:900});
 await p.goto('https://salome-bistro-a5cj-theta.vercel.app/',{settleMs:0});
 await p.screenshot({path:'capturas/v9/referencia/salome-abertura.jpg'});await sleep(1800);
 const base=await p.eval(()=>({text:document.body.innerText,scripts:[...document.scripts].map(s=>s.src),styles:[...document.querySelectorAll('link[rel=stylesheet]')].map(s=>s.href),sections:[...document.querySelectorAll('section')].map(s=>({id:s.id,class:s.className,height:s.offsetHeight})),buttons:[...document.querySelectorAll('button')].map(s=>({text:s.innerText,class:s.className})),height:document.documentElement.scrollHeight}));
 const samples=[];
 for(const width of [1440,390]){
  await p.setViewport({width,height:900});await p.goto('https://salome-bistro-a5cj-theta.vercel.app/',{settleMs:1600});
  await p.screenshot({path:`capturas/v9/referencia/salome-${width}-hero.jpg`});
  const height=await p.eval(()=>document.documentElement.scrollHeight);
  for(let y=0;y<height;y+=650){await p.wheel(650,{step:130,pauseMs:22});await sleep(160);samples.push(await p.eval(()=>({width:innerWidth,y:scrollY,visible:[...document.querySelectorAll('section')].filter(s=>{const r=s.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}).map(s=>s.id||s.className),transforms:[...document.querySelectorAll('.hero-journey img,.hero-journey h1,[data-motion]')].slice(0,12).map(e=>({class:e.className,transform:getComputedStyle(e).transform,clip:getComputedStyle(e).clipPath}))})));if(y%1950===0)await p.screenshot({path:`capturas/v9/referencia/salome-${width}-${y}.jpg`});}
 }
 writeFileSync('docs/fontes-v9/salome-browser.json',JSON.stringify({base,samples,errors:p.consoleErrors},null,2));
 console.log(JSON.stringify(base,null,2));
 await p.goto('https://sites.appbarber.com.br/srnavala-pqjj',{settleMs:2500});
 const official={};for(const tab of ['Serviços','Profissionais','Produtos','Assinaturas']){await p.eval(t=>[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===t)?.click(),tab);await sleep(700);official[tab]=await p.eval(()=>({text:document.body.innerText,images:[...document.images].map(i=>({alt:i.alt,src:i.src}))}));}writeFileSync('docs/fontes-v9/appbarber.json',JSON.stringify(official,null,2));console.log('AppBarber registrado');
}finally{await b.close()}
