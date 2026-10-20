import {Browser,sleep} from '../plugins/taste-frontend-design/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {serve} from './hero-test-server.mjs';
import {writeFileSync,readFileSync,mkdirSync} from 'node:fs';
const round=process.argv[2]||'round-1',dir='capturas/hero-reference';mkdirSync(dir,{recursive:true});
const server=await serve(), browser=await Browser.launch(),page=await browser.newPage(),checks=[];
const check=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});console.log(name,!!pass)};
try {
 for (const width of (process.env.HERO_WIDTHS?.split(',').map(Number)||[1672,390,320,768,1440])) {
  await page.setViewport({width,height:width===1672?941:width<=640?844:900,mobile:width<=640});
  await page.goto(server.base,{settleMs:1800});
  await page.eval(()=>document.fonts.ready);
  await page.screenshot({path:`${dir}/${round}-${width}.png`,format:'png'});
  const state=await page.eval(()=>{
   const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();
   return{overflow:document.documentElement.scrollWidth-innerWidth,title:rect('h1'),subtitle:rect('.nv2-subtitle'),cta:rect('.nv2-cta'),hero:rect('#inicio'),logo:rect('.nv2-logo'),values:rect('.nv2-values'),font:getComputedStyle(document.querySelector('h1')).fontFamily,curtain:!!document.querySelector('.nv11-curtain'),image:document.querySelector('.nv2-picture img').naturalWidth,animations:document.querySelector('#inicio').getAnimations({subtree:true}).length};
  });
  check(`${width}: composição legível`,state.overflow===0&&state.cta.bottom<=(width===1672?941:width<=640?844:900)&&state.title.right<=width&&state.title.x>=0&&!state.curtain&&state.image>0,state);
 }
 check('Nenhuma exceção JavaScript',page.consoleErrors.length===0,page.consoleErrors);
 const before=readFileSync('backup/hero-reference-preflight/index.html','utf8'),now=readFileSync('index.html','utf8'),marker='<section class="services';
 check('Demais seções idênticas',before.slice(before.indexOf(marker))===now.slice(now.indexOf(marker)));
} catch(error){check('Execução',false,String(error))}
finally{writeFileSync(`docs/HERO_REFERENCE_${round}.json`,JSON.stringify(checks,null,2));await browser.close();server.close();process.exit(checks.some(x=>!x.pass)?1:0)}
