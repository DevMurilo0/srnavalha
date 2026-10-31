import {revealText,cancelTextWithin} from './text-motion.js';
import {revealList} from './list-motion.js';
import products from '../data/products.js';
import {$,$$,changePhoto,cancelWithin,invalidatePhoto,canMove} from './core.js';

// Progressive enhancement. Without JS the original product records,
// prices, names and direct WhatsApp links remain navigable and visible.
export function initProducts(){
 const catalog=$('.product-catalog');
 const stage=$('.product-hero .image-stage');
 const info=$('.product-info');
 if(!catalog||!stage||!info)return;
 const options=$$('[data-product]',catalog);
 const search=$('#product-search',catalog);
 const categorySelect=$('#product-category',catalog);
 const sortSelect=$('#product-sort',catalog);
 const count=$('#product-count',catalog);
 const clear=$('#product-clear',catalog);
 const reset=$('#product-reset',catalog);
 const empty=$('#product-empty',catalog);
 const list=$('#product-list',catalog);
 const filters=$$('[data-catalog-filter]',catalog);
 const byId=new Map(products.map(p=>[p.id,p]));
 const original=options.map(node=>node.dataset.product);
 let selected='pomada-orange',latest=0,query='',category='Todos',sort='original';
 let searchFrame=0,hoverTimer=0;
 const motionOK=()=>canMove()&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
 const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
 const numeric=price=>Number(String(price).replace(/[^\d,]/g,'').replace(',','.'))||0;
 const cancelHover=()=>{clearTimeout(hoverTimer);hoverTimer=0};
 const allFound=()=>options.filter(o=>!o.hidden);
 function updateFeatured(person){
  $('h3',info).textContent=person.name;
  $('.product-category',info).textContent=person.category;
  $('.product-price',info).textContent=person.price;
  const cta=$('a',info);
  cta.href='https://wa.me/5581995722396?text='+
    encodeURIComponent('Olá! Gostaria de consultar a disponibilidade de '+person.name+'.');
  cta.setAttribute('aria-label','Consultar disponibilidade de '+person.name+' no WhatsApp');
 }
 async function select(card,{keyboard=false}={}){
  const person=byId.get(card?.dataset.product);
  if(!person)return;
  cancelHover();
  const token=++latest;
  selected=person.id;
  options.forEach(option=>{
   const active=option.dataset.product===person.id;
   option.classList.toggle('is-selected',active);
   option.querySelector('.product-option__preview')?.setAttribute('aria-pressed',String(active));
  });
  let ok=true;
  if(person.image){
   ok=await changePhoto(stage,person.image,person.name,{mode:'product',keyboard});
  }else{
   invalidatePhoto(stage);
   const fallback=document.createElement('div');
   fallback.className='no-image product-hero__placeholder';
   const monogram=document.createElement('span');
   monogram.className='product-hero__placeholder-mark';
   monogram.textContent='SN.';
   const title=document.createElement('strong');title.textContent=person.name;
   const note=document.createElement('small');
   note.textContent='Fotografia oficial ainda não disponível';
   fallback.append(monogram,title,note);
   stage.replaceChildren(fallback);
  }
  if(token!==latest||!ok)return;
  cancelTextWithin(info);
  updateFeatured(person);
  cancelWithin(info);
  if(!keyboard&&motionOK()){
   revealText($('h3',info),'focus',{duration:570});
   revealText($('.product-price',info),'micro',{delay:95});
  }
 }
 function matchesSearch(card){
  const product=byId.get(card.dataset.product);
  if(!product)return false;
  const combined=normalize([product.name,product.category].join(' '));
  return (!query||combined.includes(query))&&(category==='Todos'||product.category===category);
 }
 function updateFilterCounters(){
  for(const node of $$('[data-category-count]',catalog)){
   const filter=node.dataset.categoryCount;
   node.textContent=products.filter(p=>
     (filter==='Todos'||p.category===filter)&&
     (!query||normalize(p.name+' '+p.category).includes(query))
   ).length;
  }
 }
 function applyFilter(animate=false){
  options.forEach(option=>option.hidden=!matchesSearch(option));
  const shown=allFound();
  const noun=shown.length===1?'produto':'produtos';
  count.textContent=category==='Todos'&&!query
    ?`${shown.length} ${noun} · catálogo completo`
    :category==='Todos'
      ?`${shown.length} ${noun} · resultado da busca`
      :`${shown.length} ${noun} · ${category}${query?' · busca ativa':''}`;
  const filtered=category!=='Todos'||!!query;
  clear.hidden=!filtered;
  empty.hidden=shown.length!==0;
  filters.forEach(button=>{
   const active=button.dataset.catalogFilter===category;
   button.classList.toggle('is-active',active);
   button.setAttribute('aria-pressed',String(active));
  });
  categorySelect.value=category;
  updateFilterCounters();
  if(animate&&motionOK())revealList(shown,false);
 }
 function applySort(){
  const cards=[...options];
  cards.sort((a,b)=>{
   const x=byId.get(a.dataset.product),y=byId.get(b.dataset.product);
   switch(sort){
    case 'price-asc':return numeric(x.price)-numeric(y.price)||original.indexOf(x.id)-original.indexOf(y.id);
    case 'price-desc':return numeric(y.price)-numeric(x.price)||original.indexOf(x.id)-original.indexOf(y.id);
    case 'name':return x.name.localeCompare(y.name,'pt-BR');
    default:return original.indexOf(x.id)-original.indexOf(y.id);
   }
  });
  // A DocumentFragment avoids repeated layout while reordering 22 items.
  const fragment=document.createDocumentFragment();
  cards.forEach(card=>fragment.append(card));
  list.append(fragment);
 }
 function resetAll(){
  query='';category='Todos';sort='original';
  if(search)search.value='';
  if(sortSelect)sortSelect.value=sort;
  applySort();applyFilter(false);
  search?.focus({preventScroll:true});
 }
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 for(const card of options){
  const view=card.querySelector('.product-option__preview');
  view?.addEventListener('click',event=>select(card,{keyboard:event.detail===0}));
  if(fine.matches){
   card.addEventListener('pointerenter',()=>{
    cancelHover();
    hoverTimer=setTimeout(()=>{hoverTimer=0;select(card)},160);
   });
   card.addEventListener('pointerleave',cancelHover);
  }
 }
 search?.addEventListener('input',()=>{
  cancelAnimationFrame(searchFrame);
  searchFrame=requestAnimationFrame(()=>{
   searchFrame=0;query=normalize(search.value);applyFilter(false);
  });
 });
 search?.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&search.value){event.preventDefault();search.value='';query='';applyFilter(false)}
 });
 categorySelect?.addEventListener('change',event=>{
  category=event.target.value;applyFilter(true);
 });
 filters.forEach(button=>button.addEventListener('click',()=>{
  category=button.dataset.catalogFilter;applyFilter(true);
 }));
 sortSelect?.addEventListener('change',event=>{
  sort=event.target.value;applySort();applyFilter(false);
 });
 clear?.addEventListener('click',resetAll);
 reset?.addEventListener('click',resetAll);
 addEventListener('pagehide',()=>{cancelHover();cancelAnimationFrame(searchFrame)},{once:true});
 applySort();applyFilter(false);
 const active=options.find(x=>x.dataset.product===selected);
 if(active){
  active.classList.add('is-selected');
  active.querySelector('.product-option__preview')?.setAttribute('aria-pressed','true');
 }
}
