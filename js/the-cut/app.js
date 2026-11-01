/* The Cut — functional interaction layer. Native links and content remain
 * operable without this enhancement; data is supplied by the existing modules. */
import professionals from '../data/professionals.js';
import services from '../data/services.js';
import products from '../data/products.js';
import {initEditorialMotion} from './motion.js';

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
 let chosen=buttons.find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.person||'damiao';
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
 async function select(id){
  const person=professionals.find(p=>p.id===id);
  if(!person||id===chosen)return;
  const currentToken=++serial;
  const prepared=preload(person);
  try{await prepared.decode();}catch{
   if(!prepared.complete||prepared.naturalWidth===0){
    if(status)status.textContent='Não foi possível carregar a fotografia.';
    return;
   }
  }
  if(serial!==currentToken)return;
  // The scene owns both sprites during a true left-to-right procession.
  // Superseded departures are removed before rapid successive selections.
  $$('img.is-departing',stage).forEach(img=>img.remove());
  const existing=$('img.is-current',stage);
  const next=document.createElement('img');
  next.src=source(person);next.alt=person.name+', profissional da Sr. Navalha';
  next.width=person.id==='damiao'?725:800;
  next.height=next.width;
  next.className='is-current';
  if(motion())next.classList.add('is-arriving');
  if(existing){existing.classList.remove('is-current');existing.classList.add('is-departing');}
  stage.append(next);
  if(motion()){
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if(next.isConnected)next.classList.remove('is-arriving');
   }));
   if(existing){
    const remove=()=>existing.remove();
    existing.addEventListener('transitionend',e=>{if(e.propertyName==='transform')remove()},{once:true});
    setTimeout(remove,920);
   }
  }else existing?.remove();
  const aside=$('.team-aside');
  if(aside&&motion()){
   aside.classList.remove('is-changing');
   void aside.offsetWidth;
   aside.classList.add('is-changing');
   setTimeout(()=>aside.classList.remove('is-changing'),210);
  }
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
 initCatalogue('product');
 initGallery();
 initReviews();
 initBooking();
 initFloatCTA();
 initEditorialMotion();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
