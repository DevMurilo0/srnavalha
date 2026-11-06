/* The Cut — functional interaction layer. Native links and content remain
 * operable without this enhancement; data is supplied by the existing modules. */
import professionals from '../data/professionals.js';
import services from '../data/services.js';
import products from '../data/products.js';
import {initEditorialMotion,settleEditorialMotion} from './motion.js';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const motion=()=>!reduce.matches;
const on=(node,type,handler,opts)=>node?.addEventListener(type,handler,opts);

function initMobileMenu(){
 const menu=$('.mobile-menu');
 if(!menu)return;
 $$('a',menu).forEach(link=>on(link,'click',()=>{menu.open=false}));
 on(document,'pointerdown',event=>{
  if(menu.open&&!menu.contains(event.target))menu.open=false;
 });
 on(document,'keydown',event=>{
  if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary')?.focus();}
 });
}

function initNav(){
 const links=$$('.site-header nav a[href^="#"]');
 const sections=$$('main section[id]');
 if(!('IntersectionObserver'in window))return;
 let active='';
 const observer=new IntersectionObserver(entries=>{
  const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
  if(!visible.length)return;
  const id=visible[0].target.id;
  if(id===active)return;active=id;
  links.forEach(link=>{
   if(link.getAttribute('href')==='#'+id)link.setAttribute('aria-current','location');
   else link.removeAttribute('aria-current');
  });
 },{rootMargin:'-17% 0px -48% 0px',threshold:[0,.15,.4,.75]});
 sections.forEach(section=>observer.observe(section));
}

function initTeam(){
 const buttons=$$('.team-list button[data-person]');
 const stage=$('.portrait-stage'),name=$('#person-name'),book=$('#team-booking'),status=$('#team-status');
 if(!stage||!buttons.length)return;
 let chosen=buttons.find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.person||'eduardo';
 let serial=0;
 const cache=new Map;
 const source=person=>'assets/images/the-cut/team/'+person.id+'.webp';
 const preload=person=>{
  if(cache.has(person.id))return cache.get(person.id);
  const img=new Image();
  img.src=source(person);
  cache.set(person.id,img);
  return img;
 };
 professionals.forEach(preload);
 reduce.addEventListener('change',()=>{
  if(!reduce.matches)return;
  $$('img',stage).forEach(img=>{
   img.getAnimations().forEach(animation=>animation.cancel());
   if(img.classList.contains('is-departing'))img.remove();
  });
 });
 async function select(id){
  const person=professionals.find(p=>p.id===id);
  if(!person||id===chosen)return;
  settleEditorialMotion(stage);
  const currentToken=++serial;
  const prepared=preload(person);
  try{await prepared.decode();}catch{
   if(!prepared.complete||prepared.naturalWidth===0){
    if(status)status.textContent='Não foi possível carregar a fotografia.';
    return;
   }
  }
  if(serial!==currentToken)return;
  // Keep the image's current computed pose when another barber is chosen mid-flight.
  // Both portraits cross the full section in one continuous, slower glide.
  const departing=$$('img.is-departing',stage); // query all exiting portraits
  if(departing.length>2)departing.slice(0,-2).forEach(img=>{img.getAnimations().forEach(a=>a.cancel());img.remove()});
  const existing=$('img.is-current',stage);
  const startTransform=existing?getComputedStyle(existing).transform:'none';
  const startOpacity=existing?getComputedStyle(existing).opacity:'1';
  existing?.getAnimations().forEach(a=>a.cancel());
  const next=document.createElement('img');
  next.src=source(person);next.alt=person.name+', profissional da Sr. Navalha';
  next.width=person.id==='damiao'?725:800;next.height=next.width;
  next.className='is-current';stage.append(next);
  if(existing)existing.classList.replace('is-current','is-departing');
  if(motion()&&typeof next.animate==='function'){
   const r=stage.getBoundingClientRect(),extra=Math.max(70,r.width*.2);
   const right=Math.ceil(innerWidth-r.left+extra),left=-Math.ceil(r.right+extra);
   const config={duration:1650,easing:'cubic-bezier(.4,.03,.19,1)',fill:'both'};
   if(existing){
    const exit=existing.animate([
     {offset:0,opacity:Number(startOpacity),transform:startTransform},
     {offset:.76,opacity:1,transform:'translate3d('+(right*.82)+'px,0,0)'},
     {offset:1,opacity:0,transform:'translate3d('+right+'px,0,0)'}
    ],config);
    exit.finished.catch(()=>{}).finally(()=>{exit.cancel();existing.remove()});
   }
   const enter=next.animate([
    {offset:0,opacity:0,transform:'translate3d('+left+'px,0,0)'},
    {offset:.24,opacity:1,transform:'translate3d('+(left*.72)+'px,0,0)'},
    {offset:.88,opacity:1,transform:'translate3d(5px,0,0)'},
    {offset:1,opacity:1,transform:'translate3d(0,0,0)'}
   ],{...config,duration:1760});
   enter.finished.catch(()=>{}).finally(()=>enter.cancel());
  }else existing?.remove();
  if(motion())$('#person-name')?.animate([
   {opacity:.3,transform:'translate3d(-12px,0,0)'},
   {opacity:1,transform:'translate3d(0,0,0)'}
  ],{duration:600,easing:'cubic-bezier(.22,1,.36,1)'});
  chosen=id;
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.person===id)));
  if(name)name.textContent=person.name;
  if(book){
   book.href='agendar.html?profissional='+encodeURIComponent(person.id);
   book.setAttribute('aria-label','Agendar com '+person.name);
  }
  if(status)status.textContent=person.name+' selecionado';
 }
 buttons.forEach(button=>{
  on(button,'click',()=>select(button.dataset.person));
  on(button,'keydown',event=>{
   if(!['ArrowDown','ArrowUp'].includes(event.key))return;
   event.preventDefault();
   const i=buttons.indexOf(button),step=event.key==='ArrowDown'?1:-1;
   const next=buttons[(i+step+buttons.length)%buttons.length];
   next.focus();select(next.dataset.person);
  });
 });
}

function initCatalogue(type){
 const details=$(type==='service'?'.services-catalog':'.product-catalog');
 if(!details)return;
 const isProduct=type==='product';
 const input=$(isProduct?'#product-search':'#service-search',details);
 const category=isProduct?$('#product-category',details):null;
 const count=$(isProduct?'#product-count':'#service-count',details);
 const empty=$('.catalog-empty',details);
 const items=$$(isProduct?'.all-products article':'.all-services article',details);
 const allData=isProduct?products:services;
 const normalize=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function update(){
  const query=normalize(input?.value.trim());
  const picked=category?.value||'Todos';
  let visible=0;
  for(const row of items){
   const data=allData.find(item=>item.id===(isProduct?row.dataset.product:row.dataset.service));
   const searchable=normalize([row.dataset.search,data?.name,data?.category].join(' '));
   const matches=(!query||searchable.includes(query))&&(!category||picked==='Todos'||data?.category===picked);
   row.hidden=!matches;
   if(matches)visible++;
  }
  if(count)count.textContent=visible+' de '+items.length+' '+(isProduct?'produtos':'serviços');
  if(empty)empty.hidden=visible>0;
 }
 on(input,'input',update);
 on(category,'change',update);
 on(details,'toggle',()=>{if(details.open)update()});
 update();
}


// The collection is a real exploratory surface, not a checkout.
function initProductExperience(){
 const details=$('.product-catalog');
 const grid=$('.product-catalog .all-products');
 if(!details||!grid)return;
 const input=$('#product-search',details);
 const category=$('#product-category',details);
 const sort=$('#product-sort',details);
 const count=$('#product-count',details);
 const empty=$('.catalog-empty',details);
 const chips=Array.from(details.querySelectorAll('.product-filter'));
 const cards=Array.from(grid.querySelectorAll('.product-card'));
 const originalOrder=new Map(cards.map((card,i)=>[card.dataset.product,i]));
 const productsById=new Map(products.map(p=>[p.id,p]));
 const simplify=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const animationAllowed=()=>motion()&&typeof Element.prototype.animate==='function';
 const appeared=new WeakSet();
 const animateCard=(card,index)=>{
  if(!animationAllowed()||!details.open)return;
  card.getAnimations().forEach(effect=>effect.cancel());
  const effect=card.animate([
   {opacity:.22,transform:'translate3d(0,24px,0) scale(.987)'},
   {opacity:1,transform:'translate3d(0,0,0) scale(1)'}
  ],{duration:680,delay:Math.min(index*52,330),fill:'backwards',easing:'cubic-bezier(.16,1,.3,1)'});
  effect.finished.catch(()=>{}).finally(()=>effect.cancel());
 };
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   observer.unobserve(entry.target);
   if(appeared.has(entry.target)||entry.target.hidden)continue;
   appeared.add(entry.target);
   animateCard(entry.target,[...grid.children].indexOf(entry.target)%6);
  }
 },{threshold:.05,rootMargin:'70px 0px'}):null;
 function update(animateChange=false){
  const query=simplify(input?.value.trim());
  const chosen=category?.value||'Todos';
  const order=sort?.value||'default';
  const reordered=[...cards].sort((a,b)=>{
   const pa=productsById.get(a.dataset.product),pb=productsById.get(b.dataset.product);
   if(order==='name')return pa.name.localeCompare(pb.name,'pt-BR');
   if(order==='price-asc'||order==='price-desc'){
    const da=Number(a.dataset.price)||0,db=Number(b.dataset.price)||0;
    return (order==='price-asc'?da-db:db-da)||originalOrder.get(a.dataset.product)-originalOrder.get(b.dataset.product);
   }
   return originalOrder.get(a.dataset.product)-originalOrder.get(b.dataset.product);
  });
  grid.append(...reordered);
  let visible=0;
  for(const card of reordered){
   const p=productsById.get(card.dataset.product);
   const matches=(!query||simplify(p.name+' '+p.category).includes(query))&&(chosen==='Todos'||p.category===chosen);
   card.hidden=!matches;
   if(matches){
    visible++;
    if(details.open){
     if(!appeared.has(card)&&observer)observer.observe(card);
     else if(animateChange&&visible<=9)animateCard(card,visible-1);
    }
   }else{
    observer?.unobserve(card);
    card.getAnimations().forEach(effect=>effect.cancel());
   }
  }
  chips.forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.category===chosen)));
  if(count)count.textContent=visible+' de '+cards.length+' produtos';
  if(empty)empty.hidden=visible!==0;
 }
 on(input,'input',()=>update(false));
 on(category,'change',()=>update(true));
 on(sort,'change',()=>update(true));
 chips.forEach(chip=>on(chip,'click',()=>{
  if(category)category.value=chip.dataset.category;
  update(true);
 }));
 on($('[data-clear-product-filters]',details),'click',()=>{
  if(input)input.value='';
  if(category)category.value='Todos';
  if(sort)sort.value='default';
  update(true);
  input?.focus();
 });
 on(details,'toggle',()=>{if(details.open)update(false)});
 const dialog=$('.product-inspect');
 if(dialog&&typeof dialog.showModal==='function'){
  let lastOpener=null;
  on(grid,'click',event=>{
   const trigger=event.target.closest('[data-inspect-product]');
   if(!trigger)return;
   const p=productsById.get(trigger.dataset.inspectProduct);
   if(!p)return;
   lastOpener=trigger;
   $('#product-inspect-title',dialog).textContent=p.name;
   $('#product-inspect-category',dialog).textContent=p.category;
   $('#product-inspect-price',dialog).textContent=p.price;
   const image=$('#product-inspect-image',dialog);
   if(image){image.src=p.image||'';image.alt=p.name;}
   dialog.showModal();
   $('.product-inspect__close',dialog)?.focus();
  });
  dialog.querySelectorAll('[data-close-product-dialog]').forEach(button=>on(button,'click',()=>dialog.close()));
  on(dialog,'click',event=>{
   if(event.target===dialog)dialog.close();
  });
  on(dialog,'close',()=>{
   if(lastOpener?.isConnected)lastOpener.focus({preventScroll:true});
  });
 }
 update(false);
}

function initGallery(){
 const dialog=$('.gallery-dialog');
 if(!dialog||typeof dialog.showModal!=='function')return;
 const image=$('figure img',dialog),caption=$('figcaption',dialog),status=$('.gallery-controls [role="status"]',dialog);
 const pictures=[
  ['servico-comb-cort-barb-simples','Corte e barba'],
  ['servico-barba-simples','Precisão no desenho da barba'],
  ['servico-luzes','Corte e textura'],
  ['servico-barboterapia','Barboterapia'],
  ['servico-corte-infantil','Corte infantil'],
  ['servico-platinado','Platinado']
 ];
 let selected=0,lastFocus=null;
 function draw(index){
  selected=(index+pictures.length)%pictures.length;
  const [id,title]=pictures[selected];
  image.src='assets/images/v8/'+id+'-960.webp';
  image.alt=title;caption.textContent=title;
  if(status)status.textContent=(selected+1)+' de '+pictures.length;
 }
 function open(index,opener){
  lastFocus=opener;draw(index);dialog.showModal();
  $('.dialog-close',dialog)?.focus();
 }
 $$('[data-open-gallery]').forEach(trigger=>on(trigger,'click',event=>{
  event.preventDefault();open(Number(trigger.dataset.openGallery)||0,trigger);
 }));
 on($('[data-gallery-prev]',dialog),'click',()=>draw(selected-1));
 on($('[data-gallery-next]',dialog),'click',()=>draw(selected+1));
 on($('.dialog-close',dialog),'click',()=>dialog.close());
 on(dialog,'click',event=>{if(event.target===dialog)dialog.close()});
 on(dialog,'keydown',event=>{
  if(event.key==='ArrowLeft')draw(selected-1);
  if(event.key==='ArrowRight')draw(selected+1);
 });
 on(dialog,'close',()=>{
  image.removeAttribute('src');
  if(lastFocus?.isConnected)lastFocus.focus();
 });
}

function initReviews(){
 const dialog=$('.reviews-dialog'),button=$('[data-open-reviews]');
 if(!dialog||!button||typeof dialog.showModal!=='function')return;
 on(button,'click',()=>dialog.showModal());
 on($('.dialog-close',dialog),'click',()=>dialog.close());
 on(dialog,'click',event=>{if(event.target===dialog)dialog.close()});
 on(dialog,'close',()=>button.focus());
}

function initBooking(){
 const input=$('.booking-form input[type="date"]');
 if(!input)return;
 const d=new Date();
 const pad=n=>String(n).padStart(2,'0');
 input.min=d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
}

function initFloatCTA(){
 const hero=$('#inicio'),button=$('.floating-booking');
 if(!hero||!button)return;
 if(!('IntersectionObserver'in window)){button.hidden=false;return;}
 const observer=new IntersectionObserver(([entry])=>{
  button.hidden=entry.isIntersecting;
 },{threshold:.04});
 observer.observe(hero);
}

function boot(){
 initMobileMenu();
 initNav();
 initTeam();
 initCatalogue('service');
 initProductExperience();
 initGallery();
 initReviews();
 initBooking();
 initFloatCTA();
 initEditorialMotion();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
