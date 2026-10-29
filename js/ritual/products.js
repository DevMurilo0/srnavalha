import {revealText,cancelTextWithin} from './text-motion.js';
import { revealList } from './list-motion.js';
import products from '../data/products.js';import {$,$$,activateButtonLink,changePhoto,animate,cancelWithin,invalidatePhoto} from './core.js';
export function initProducts(){let latest=0;const stage=$('.product-hero .image-stage'),info=$('.product-info'),options=$$('[data-product]');
 async function select(link,keyboard=false){const token=++latest,p=products.find(p=>p.id===link.dataset.product);let ok=true;
 if(p.image)ok=await changePhoto(stage,p.image,p.name,{mode:'product',keyboard});else{invalidatePhoto(stage);const box=document.createElement('div');box.className='no-image';const title=document.createElement('strong');title.textContent=p.name;const note=document.createElement('small');note.textContent='Fotografia oficial não disponível';box.append(title,note);stage.replaceChildren(box)}
 if(token!==latest||!ok)return;
 cancelTextWithin(info);options.forEach(o=>o.setAttribute('aria-pressed',String(o===link)));$('.product-category',info).textContent=p.category;$('h3',info).textContent=p.name;$('.product-price',info).textContent=p.price;$('a',info).href=`https://wa.me/5581995722396?text=${encodeURIComponent('Olá! Gostaria de consultar a disponibilidade de '+p.name+'.')}`;
 cancelWithin(info);if(!keyboard){revealText($('h3',info),'focus',{duration:600});revealText($('.product-price',info),'micro',{delay:120});}}
 options.forEach((o,i)=>{o.setAttribute('aria-pressed',String(i===0));activateButtonLink(o,e=>select(o,e.detail===0))});
 $('#product-category').addEventListener('change',e=>{const category=e.target.value;options.forEach(o=>o.hidden=category!=='Todos'&&o.dataset.category!==category);$('#product-count').textContent=`${options.filter(o=>!o.hidden).length} produtos · ${category==='Todos'?'catálogo completo':category}`;revealList(options,true)});
}
