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
 const summary=$('.product-catalog__trigger',details);
 // Scroll-directed editorial reveal: the hero, specimen stack and shopping-bag
 // action arrive in a deliberate sequence without blocking native disclosure.
 if(summary&&motion()&&'IntersectionObserver' in window){
  const parts=['.product-catalog__serial','.product-catalog__title','.product-catalog__lead','.product-catalog__preview','.product-catalog__trigger-icon']
   .map(selector=>$(selector,summary)).filter(Boolean);
  const revealObserver=new IntersectionObserver(entries=>{
   if(!entries.some(entry=>entry.isIntersecting))return;
   revealObserver.disconnect();
   parts.forEach((part,i)=>part.animate([
    {opacity:0,transform:'translate3d(0,32px,0)'},
    {opacity:1,transform:'translate3d(0,0,0)'}
   ],{duration:900,delay:210+i*155,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
  },{threshold:.15});
  revealObserver.observe(summary);
 }
 if(summary&&motion()&&matchMedia('(hover:hover) and (pointer:fine)').matches){
  let raf=0;
  on(summary,'pointermove',event=>{
   if(raf)return;
   const bounds=summary.getBoundingClientRect();
   const x=((event.clientX-bounds.left)/bounds.width-.5)*20;
   const y=((event.clientY-bounds.top)/bounds.height-.5)*16;
   raf=requestAnimationFrame(()=>{
    raf=0;
    summary.style.setProperty('--gallery-x',x.toFixed(1)+'px');
    summary.style.setProperty('--gallery-y',y.toFixed(1)+'px');
   });
  });
  on(summary,'pointerleave',()=>{
   summary.style.setProperty('--gallery-x','0px');
   summary.style.setProperty('--gallery-y','0px');
  });
 }

 const input=$('#product-search',details);
 const category=$('#product-category',details);
 const sort=$('#product-sort',details);
 const count=$('#product-count',details);
 const empty=$('.catalog-empty',details);
 const chips=Array.from(details.querySelectorAll('.product-filter'));
 const chipTray=$('.product-catalog__filters',details);
 let lens=null;
 const moveLens=(withMotion=true)=>{
  if(!chipTray||!details.open||innerWidth<=700)return;
  const selected=chips.find(chip=>chip.getAttribute('aria-pressed')==='true');
  if(!selected)return;
  if(!lens){
   lens=document.createElement('span');
   lens.className='product-filter__lens';
   lens.setAttribute('aria-hidden','true');
   chipTray.prepend(lens);
  }
  // offsetLeft/Top stay relative to the tray even when the chips wrap.
  const initial=!chipTray.classList.contains('is-motion-ready');
  if(initial||!withMotion||!motion())lens.style.transition='none';
  else lens.style.removeProperty('transition');
  lens.style.width=selected.offsetWidth+'px';
  lens.style.height=selected.offsetHeight+'px';
  lens.style.transform=`translate3d(${selected.offsetLeft}px,${selected.offsetTop}px,0)`;
  chipTray.classList.add('is-motion-ready');
  if(initial||!withMotion)requestAnimationFrame(()=>lens?.style.removeProperty('transition'));
 };
 let categoriesRevealed=false;
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
 function update(animateChange=false,kind='filter'){
  const flip=animateChange&&kind==='sort'&&animationAllowed()&&details.open;
  const oldRects=new Map();
  if(flip)for(const card of cards)if(!card.hidden)oldRects.set(card,card.getBoundingClientRect());
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
     else if(animateChange&&kind!=='sort'&&visible<=9)animateCard(card,visible-1);
    }
   }else{
    observer?.unobserve(card);
    card.getAnimations().forEach(effect=>effect.cancel());
   }
  }
  chips.forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.category===chosen)));
  moveLens(animateChange);
  if(flip){
   // Reorder existing cards with FLIP so their former positions remain legible.
   for(const card of reordered){
    if(card.hidden||!oldRects.has(card))continue;
    const before=oldRects.get(card),after=card.getBoundingClientRect();
    const dx=before.left-after.left,dy=before.top-after.top;
    if(Math.abs(dx)+Math.abs(dy)<3)continue;
    card.getAnimations().forEach(effect=>effect.cancel());
    card.animate([
     {transform:`translate3d(${dx}px,${dy}px,0)`},
     {transform:'translate3d(0,0,0)'}
    ],{duration:560,easing:'cubic-bezier(.18,.75,.18,1)'});
   }
  }
  if(count){
   const nextCount=visible+' de '+cards.length+' produtos';
   if(count.textContent!==nextCount&&animateChange&&animationAllowed()&&details.open){
    count.getAnimations().forEach(effect=>effect.cancel());
    count.animate([
     {opacity:.28,transform:'translate3d(0,7px,0)'},
     {opacity:1,transform:'translate3d(0,0,0)'}
    ],{duration:340,easing:'cubic-bezier(.16,1,.3,1)'});
   }
   count.textContent=nextCount;
  }
  if(empty)empty.hidden=visible!==0;
 }
 on(input,'input',()=>update(false));
 on(category,'change',()=>update(true));
 on(sort,'change',()=>update(true,'sort'));
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
 const viewing=$$('.product-catalog__view',details);
 const switchView=view=>{
  if(!['grid','list'].includes(view)||grid.dataset.view===view)return;
  const old=new Map();
  if(animationAllowed())for(const card of cards)if(!card.hidden){
   const r=card.getBoundingClientRect();
   if(r.bottom>0&&r.top<innerHeight)old.set(card,r);
  }
  grid.dataset.view=view;
  viewing.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.productView===view)));
  if(!animationAllowed())return;
  for(const [card,rect] of old){
   const next=card.getBoundingClientRect();
   const dx=rect.left-next.left,dy=rect.top-next.top;
   if(Math.abs(dx)+Math.abs(dy)<2)continue;
   card.getAnimations().forEach(effect=>effect.cancel());
   card.animate([{transform:`translate3d(${dx}px,${dy}px,0)`,opacity:.8},
    {transform:'translate3d(0,0,0)',opacity:1}],
    {duration:640,easing:'cubic-bezier(.2,.8,.15,1)'});
  }
 };
 viewing.forEach(button=>on(button,'click',()=>switchView(button.dataset.productView)));
 on(details,'toggle',()=>{
  if(!details.open)return;
  const inside=$('.product-catalog__inside',details);
  if(animationAllowed()&&inside){
   inside.animate([{opacity:0,transform:'translate3d(0,-26px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],
    {duration:790,delay:130,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
   ['.product-catalog__section-head','.product-catalog__tools','.product-catalog__filters','.product-catalog__result-line']
    .map(selector=>$(selector,inside)).filter(Boolean)
    .forEach((node,index)=>node.animate([
     {opacity:0,transform:'translate3d(0,20px,0)'},
     {opacity:1,transform:'translate3d(0,0,0)'}],
     {duration:680,delay:260+index*100,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
  }
  update(false);
  requestAnimationFrame(()=>moveLens(false));
  if(!categoriesRevealed&&animationAllowed()&&innerWidth>700){
   categoriesRevealed=true;
   chips.forEach((chip,index)=>chip.animate([
    {opacity:0,transform:'translate3d(0,12px,0)'},
    {opacity:1,transform:'translate3d(0,0,0)'}
   ],{duration:480,delay:95+index*65,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
  }
 });
 window.addEventListener('resize',()=>{
  if(!details.open)return;
  requestAnimationFrame(()=>moveLens(false));
 },{passive:true});
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
   if(animationAllowed()){
    image?.animate([
     {opacity:.15,transform:'translate3d(0,26px,0) scale(.89)'},
     {opacity:1,transform:'translate3d(0,0,0) scale(1)'}],
     {duration:760,delay:85,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
    $$('.product-inspect__info > *',dialog).forEach((el,index)=>el.animate([
     {opacity:0,transform:'translate3d(0,18px,0)'},
     {opacity:1,transform:'translate3d(0,0,0)'}],
     {duration:570,delay:125+index*65,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));
   }
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


function initWorkShowcase(){
 const root=$('[data-work-showcase]');
 if(!root)return;
 const stage=$('.workroom-feature__stage',root);
 const layers=$$('.workroom-feature__photo',stage);
 const choices=$$('.workroom-choice',root);
 const title=$('[data-work-title]',root);
 const subtitle=$('[data-work-subtitle]',root);
 const number=$('.workroom-feature__number',root);
 const progress=$('.workroom-feature__progress>span',root);
 const expand=$('.workroom-feature__zoom',root);
 const section=root.closest('section');
 const photos=[
  {id:'servico-comb-cort-barb-simples',title:'Corte e barba',description:'O clássico da casa · acabamento completo'},
  {id:'servico-barba-simples',title:'Desenho de barba',description:'Linhas limpas e contornos precisos'},
  {id:'servico-luzes',title:'Corte e textura',description:'Movimento, luz e personalidade'},
  {id:'servico-barboterapia',title:'Barboterapia',description:'O ritual de cuidado da barba'},
  {id:'servico-corte-infantil',title:'Corte infantil',description:'Atenção a cada detalhe'},
  {id:'servico-platinado',title:'Platinado',description:'Transformação e identidade'}
 ];
 let selected=0,active=0,serial=0,flight=null;
 const imageUrl=index=>'assets/images/v8/'+photos[index].id+'-960.webp';
 const cache=new Map();
 const warm=index=>{
  if(cache.has(index))return cache.get(index);
  const image=new Image();image.decoding='async';image.src=imageUrl(index);
  cache.set(index,image);return image;
 };
 const details=index=>{
  const item=photos[index];
  if(title)title.textContent=item.title;
  if(subtitle)subtitle.textContent=item.description;
  if(number)number.innerHTML=String(index+1).padStart(2,'0')+' <span>/ 06</span>';
  if(progress)progress.style.transform='scaleX('+((index+1)/photos.length)+')';
  if(expand){expand.dataset.openGallery=String(index);expand.setAttribute('aria-label','Ampliar fotografia de '+item.title);}
  const viewAll=$('.workroom-view-all',section);
  if(viewAll)viewAll.dataset.openGallery=String(index);
  choices.forEach((button,i)=>{
   button.classList.toggle('is-selected',i===index);
   button.setAttribute('aria-pressed',String(i===index));
  });
 };
 const settle=()=>{
  if(!flight)return;
  const was=flight;
  flight=null;
  layers.forEach(img=>img.getAnimations().forEach(a=>a.cancel()));
  active=was.to;
  layers.forEach((img,i)=>{
   img.classList.toggle('is-active',i===active);
   img.classList.remove('is-incoming');
   if(i===active)img.removeAttribute('aria-hidden');
   else img.setAttribute('aria-hidden','true');
  });
 };
 async function select(index){
  if(index===selected||index<0||index>=photos.length)return;
  const token=++serial;
  const prepared=warm(index);
  try{await prepared.decode()}catch{
   if(!prepared.complete||prepared.naturalWidth===0)return;
  }
  if(token!==serial)return;
  settle();
  const previous=selected;
  selected=index;
  const next=1-active,incoming=layers[next],current=layers[active];
  incoming.src=imageUrl(index);incoming.alt=photos[index].title;
  incoming.classList.add('is-incoming');incoming.removeAttribute('aria-hidden');
  details(index);
  if(!motion()||!incoming.animate){
   current.classList.remove('is-active');current.setAttribute('aria-hidden','true');
   incoming.classList.remove('is-incoming');incoming.classList.add('is-active');active=next;
  }else{
   const forward=index>previous?1:-1;
   const effects=[
    current.animate([
     {opacity:1,transform:'translate3d(0,0,0) scale(1)'},
     {opacity:0,transform:`translate3d(${-forward*17}px,0,0) scale(.985)`}
    ],{duration:330,easing:'cubic-bezier(.4,.1,.4,1)',fill:'both'}),
    incoming.animate([
     {opacity:0,transform:`translate3d(${forward*22}px,0,0) scale(1.012)`},
     {opacity:1,transform:'translate3d(0,0,0) scale(1)'}
    ],{duration:420,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'})
   ];
   flight={to:next};
   await Promise.allSettled(effects.map(a=>a.finished));
   if(token===serial)settle();
  }
  const neighbor=(index+1)%photos.length;
  if(!cache.has(neighbor)&&!navigator.connection?.saveData)warm(neighbor);
 }
 choices.forEach((button,i)=>{
  on(button,'click',()=>select(i));
  on(button,'keydown',event=>{
   if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key))return;
   event.preventDefault();
   const diff=['ArrowDown','ArrowRight'].includes(event.key)?1:-1;
   const next=(i+diff+choices.length)%choices.length;
   choices[next]?.focus();select(next);
  });
 });
 const visibility='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  for(const entry of entries)document.documentElement.classList.toggle('folio-in-view',entry.isIntersecting);
 },{threshold:0}):null;
 visibility?.observe(section);
 // A short editorial rise, activated only in view and never hiding real HTML
 // for users with JS disabled, slow images or reduced-motion preferences.
 if(motion()&&'IntersectionObserver' in window){
  const targets=[...$$('.workroom-intro',section),stage,...choices];
  const show=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(!entry.isIntersecting)continue;
    show.unobserve(entry.target);
    if(!motion())continue;
    const stagger=targets.indexOf(entry.target);
    entry.target.animate([
     {opacity:.45,transform:'translate3d(0,19px,0)'},
     {opacity:1,transform:'translate3d(0,0,0)'}
    ],{duration:570,delay:Math.min(stagger*55,370),easing:'cubic-bezier(.16,1,.3,1)'});
   }
  },{threshold:.08,rootMargin:'60px 0px'});
  targets.forEach(el=>show.observe(el));
 }
 details(0);
}

function initGallery(){
 const dialog=$('.gallery-dialog');
 if(!dialog||typeof dialog.showModal!=='function')return;
 const photo=$('.gallery-room__photo',dialog);
 const layers=$$('.gallery-room__layer',photo);
 const caption=$('.gallery-room__caption',dialog);
 const featureTitle=$('.gallery-room__feature-title',dialog);
 const featureSubtitle=$('.gallery-room__feature-subtitle',dialog);
 const selectionCount=$('.gallery-room__selection-head span:last-child',dialog);
 const status=$('.gallery-controls [role="status"]',dialog);
 const thumbRoot=$('.gallery-room__thumbs',dialog);
 const pictures=[
  {id:'servico-comb-cort-barb-simples',title:'Corte e barba',subtitle:'Acabamento e equilíbrio'},
  {id:'servico-barba-simples',title:'Precisão no desenho da barba',subtitle:'Desenho, contorno e cuidado'},
  {id:'servico-luzes',title:'Corte e textura',subtitle:'Tonalidade e personalidade'},
  {id:'servico-barboterapia',title:'Barboterapia',subtitle:'Detalhes de um ritual completo'},
  {id:'servico-corte-infantil',title:'Corte infantil',subtitle:'Os primeiros estilos'},
  {id:'servico-platinado',title:'Platinado',subtitle:'Nova cor, nova presença'}
 ];
 const source=(entry,size=960)=>'assets/images/v8/'+entry.id+'-'+size+'.webp';
 let selected=0,requested=0,active=0,serial=0,lastFocus=null,transition=null;
 const reduceGallery=matchMedia('(prefers-reduced-motion: reduce)');
 const thumbs=pictures.map((item,index)=>{
  const button=document.createElement('button');
  button.type='button';button.className='gallery-room__thumb';
  button.setAttribute('aria-label',`Ver fotografia ${String(index+1).padStart(2,'0')} de 06: ${item.title}`);
  button.setAttribute('aria-pressed',String(index===0));
  const img=document.createElement('img');
  img.src=source(item,320);img.alt='';img.width=160;img.height=160;
  img.loading='lazy';img.decoding='async';
  const num=document.createElement('span');num.className='gallery-room__thumb-index';
  num.textContent=String(index+1).padStart(2,'0');num.setAttribute('aria-hidden','true');
  button.append(img,num);thumbRoot.append(button);
  on(button,'click',()=>draw(index));
  return button;
 });
 const updateDetails=()=>{
  const item=pictures[selected];
  caption.replaceChildren(document.createTextNode(item.title));
  const info=document.createElement('span');info.textContent=item.subtitle;caption.append(info);
  if(featureTitle)featureTitle.textContent=item.title;
  if(featureSubtitle)featureSubtitle.textContent=item.subtitle;
  if(status)status.textContent=String(selected+1).padStart(2,'0')+' / '+String(pictures.length).padStart(2,'0');
  if(selectionCount)selectionCount.textContent=String(selected+1).padStart(2,'0')+' · '+String(pictures.length).padStart(2,'0');
  dialog.style.setProperty('--gallery-progress',String((selected+1)/pictures.length));
  thumbs.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===selected)));
 };
 const settle=()=>{
  if(!transition)return;
  transition.effects.forEach(effect=>{try{effect.cancel()}catch{}});
  active=transition.next;
  transition=null;
  layers.forEach((img,index)=>{
   img.classList.toggle('is-active',index===active);
   img.classList.remove('is-incoming');
   if(index!==active)img.setAttribute('aria-hidden','true');
   else img.removeAttribute('aria-hidden');
  });
 };
 const preloadNeighbors=()=>{
  const indexes=[(selected+1)%pictures.length,(selected-1+pictures.length)%pictures.length];
  for(const i of indexes){const im=new Image();im.decoding='async';im.src=source(pictures[i]);}
 };
 async function draw(index,initial=false){
  index=(index+pictures.length)%pictures.length;
  if(index===requested&&!initial)return;
  requested=index;
  const token=++serial;
  settle();
  const previous=selected,item=pictures[index];
  photo.setAttribute('aria-busy','true');
  const prepared=new Image();prepared.decoding='async';prepared.src=source(item);
  try{await prepared.decode()}catch{
   if(!prepared.naturalWidth){
    if(token===serial){requested=-1;photo.setAttribute('aria-busy','false');status.textContent='Foto indisponível. Selecione para tentar novamente.';}
    return;
   }
  }
  if(token!==serial||!dialog.open)return;
  const next=1-active,current=layers[active],incoming=layers[next];
  incoming.src=prepared.src;incoming.alt=item.title;
  incoming.removeAttribute('aria-hidden');current.setAttribute('aria-hidden','true');
  incoming.classList.add('is-incoming');
  selected=index;updateDetails();photo.setAttribute('aria-busy','false');
  if(initial||reduceGallery.matches||!motion()||typeof incoming.animate!=='function'){
   current.classList.remove('is-active');incoming.classList.remove('is-incoming');incoming.classList.add('is-active');
   active=next;preloadNeighbors();return;
  }
  const delta=(index-previous+pictures.length)%pictures.length;
  const shift=(delta<=pictures.length/2?1:-1)*32;
  // Keep the previous photo opaque under the decoded incoming layer: no dark flash.
  const effects=[
   current.animate([{transform:'translateX(0)'},{transform:`translateX(${-shift}px)`}],
    {duration:300,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}),
   incoming.animate([{opacity:0,transform:`translateX(${shift}px)`},{opacity:1,transform:'translateX(0)'}],
    {duration:300,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'})
  ];
  transition={effects,next};
  await Promise.allSettled(effects.map(effect=>effect.finished));
  if(token!==serial)return;
  settle();preloadNeighbors();
 }
 on(reduceGallery,'change',()=>{if(reduceGallery.matches)settle()});
 function open(index,opener){
  lastFocus=opener;
  // Opening state is instant; the first photograph gets its source immediately.
  dialog.showModal();
  document.documentElement.classList.add('gallery-is-open');
  layers.forEach(img=>img.classList.remove('is-active','is-incoming'));
  status.textContent='Carregando…';draw(index,true);
  $('.dialog-close',dialog)?.focus({preventScroll:true});
 }
 $$('[data-open-gallery]').forEach(trigger=>on(trigger,'click',event=>{
  event.preventDefault();open(Number(trigger.dataset.openGallery)||0,trigger);
 }));
 on($('[data-gallery-prev]',dialog),'click',()=>draw(requested-1));
 on($('[data-gallery-next]',dialog),'click',()=>draw(requested+1));
 on($('.dialog-close',dialog),'click',()=>dialog.close());
 on(dialog,'click',event=>{if(event.target===dialog)dialog.close()});
 on(dialog,'keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
   event.preventDefault();draw(requested+(event.key==='ArrowRight'?1:-1));
  }
  if(event.key==='Home'){event.preventDefault();draw(0)}
  if(event.key==='End'){event.preventDefault();draw(pictures.length-1)}
 });
 let touchStart=null;
 on(photo,'pointerdown',event=>{
  if(event.pointerType==='touch'&&!touchStart){
   touchStart={x:event.clientX,y:event.clientY,id:event.pointerId};
   if(photo.hasPointerCapture?.(event.pointerId)===false&&event.isTrusted)photo.setPointerCapture(event.pointerId);
  }
 });
 on(photo,'pointerup',event=>{
  if(!touchStart||event.pointerType!=='touch'||touchStart.id!==event.pointerId)return;
  const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;
  touchStart=null;
  if(Math.abs(dx)>54&&Math.abs(dx)>Math.abs(dy)*1.35)draw(requested+(dx<0?1:-1));
 });
 on(photo,'pointercancel',()=>{touchStart=null});
 on(dialog,'close',()=>{
  ++serial;settle();touchStart=null;
  document.documentElement.classList.remove('gallery-is-open');
  if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});
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
 initWorkShowcase();
 initGallery();
 initReviews();
 initBooking();
 initFloatCTA();
 initEditorialMotion();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
