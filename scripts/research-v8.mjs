import {Browser,sleep} from '../plugins/taste-frontend-design/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import {writeFileSync} from 'node:fs';
const b=await Browser.launch();const p=await b.newPage();
try{
await p.goto('http://127.0.0.1:8018/');await p.screenshot({path:'capturas/v8/antes-desktop.jpg',fullPage:true});await p.setViewport({width:390,height:844});await p.screenshot({path:'capturas/v8/antes-mobile.jpg',fullPage:true});
await p.goto('https://sites.appbarber.com.br/srnavala-pqjj',{settleMs:2500});
const result={};
for(const tab of ['Serviços','Profissionais','Produtos','Pacotes','Assinaturas']){
await p.eval(t=>[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===t)?.click(),tab);await sleep(1300);
result[tab]=await p.eval(()=>({text:document.body.innerText,images:[...document.images].map(i=>({alt:i.alt,src:i.src})),links:[...document.querySelectorAll('a')].map(a=>({text:a.textContent,url:a.href}))}));
}
writeFileSync('docs/fontes-v8/appbarber.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2).slice(0,2000));
}finally{await b.close()}
