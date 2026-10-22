import services from '../data/services.js';import {$,$$,animate,changePhoto} from './core.js';
export function initServices(){
 const choices=$$('[data-ritual]'),info=$('#mirror-info');let selected=0;
 async function select(button,keyboard){const token=++selected;const service=services.find(s=>s.id===button.dataset.ritual);if(!service)return;
 const changed=await changePhoto($('#mirror-photo'),`assets/images/v8/servico-${service.id}-640.webp`,service.name+' — catálogo oficial da Sr. Navalha',{keyboard});if(token!==selected)return;
 choices.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 $('.mirror-category',info).textContent=service.category;$('h3',info).textContent=service.name;$('.mirror-facts',info).replaceChildren(...[`${service.fromPrice?'A partir de ':''}${service.price}`,service.duration].map(t=>{const s=document.createElement('span');s.textContent=t;return s}));$('.mirror-description',info).textContent=service.description||'Escolha o profissional e encontre seu horário na agenda oficial.';
 $('small',info).innerHTML=changed?'Fotografia do catálogo oficial.<br>O resultado respeita o seu estilo.':'A fotografia não pôde ser carregada. Consulte o serviço na agenda oficial.';
 if(!keyboard)animate(info,[{opacity:.35,transform:'translateX(10px)'},{opacity:1,transform:'none'}],{duration:260});}
 choices.forEach(b=>b.addEventListener('click',e=>select(b,e.detail===0)));
 const rows=$$('.service-entry'),rest=$('.catalog-rest');
 $$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{const category=b.dataset.filter;$$('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));let count=0;rows.forEach(row=>{row.hidden=category!=='Todos'&&row.dataset.category!==category;if(!row.hidden)count++});rest.open=category!=='Todos';$('.filter-status').textContent=`${count} serviços${category==='Todos'?'':' · '+category}`;$('.catalog-preview').hidden=!rows.slice(0,5).some(r=>!r.hidden);rest.hidden=!rows.slice(5).some(r=>!r.hidden)}));
}
