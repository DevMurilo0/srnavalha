import products from './data/products.js';
import professionals from './data/professionals.js';
import {$,$$,reduced,ease,motion,on} from './motion/core.js';
import {initOpening} from './motion/opening.js';
import {initHero} from './motion/hero.js';
import {initPassages} from './motion/passages.js';
import {initReviews} from './motion/reviews.js';
import {initServices} from './motion/services.js';
const hover=matchMedia('(hover:hover) and (pointer:fine)');
document.documentElement.classList.add('enhanced');
// Native menu remains functional without scripting; Escape and selection return to a predictable state.
const menu=$('.mobile-menu');$$('.mobile-menu nav a').forEach((a,i)=>{a.style.setProperty('--i',i);a.addEventListener('click',()=>menu.open=false)});
addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.open){menu.open=false;$('summary',menu).focus()}});
document.addEventListener('click',e=>{if(menu?.open&&!menu.contains(e.target))menu.open=false});
matchMedia('(min-width:851px)').addEventListener('change',()=>{if(menu)menu.open=false});
const nav=$('.desktop-nav'),indicator=$('.nav-indicator');
function indicate(a){if(!indicator)return;indicator.style.width=a?a.offsetWidth+'px':'0';indicator.style.transform=`translateX(${a?.offsetLeft||0}px)`;}
const navObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const a=$(`a[href="#${entry.target.id}"]`,nav);$$('a',nav).forEach(x=>{if(x===a)x.setAttribute('aria-current','location');else x.removeAttribute('aria-current')});indicate(a)}},{rootMargin:'-15% 0px -65% 0px'});$$('main section[id]').forEach(s=>navObserver.observe(s));addEventListener('resize',()=>indicate($('[aria-current]',nav)));
// Service filtering keeps native details and prices in the document, including with JS disabled.
const serviceRows=$$('.service-row');$$('[data-service-filter]').forEach(button=>button.addEventListener('click',()=>{
 const category=button.dataset.serviceFilter;$$('[data-service-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;
 serviceRows.forEach(row=>{row.hidden=category!=='Todos'&&row.dataset.category!==category;if(!row.hidden)count++});
 $('#full-services').open=category!=='Todos';$('.filter-status').textContent=`${count} serviços em ${category.toLowerCase()}`;

}));
// Photograph navigation: persistent layers, decoded before activation, last request wins.
let portraitSequence=0,currentProfessional=0;const portraitFigures=$$('[data-portrait]');
async function selectProfessional(index,keyboard=false){
 if(index===currentProfessional&&portraitSequence===0)return;$$('[data-professional]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));const seq=++portraitSequence,next=portraitFigures[index],img=$('img',next);
 img.loading='eager';try{await img.decode()}catch{}if(seq!==portraitSequence)return;
 portraitFigures.forEach((f,i)=>{f.classList.toggle('is-outgoing',i===currentProfessional);f.classList.toggle('is-active',i===index);f.setAttribute('aria-hidden',String(i!==index))});
 $$('[data-professional]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
 currentProfessional=index;$('#professional-caption').textContent=professionals[index].name+' · Profissional da Sr. Navalha';
 if(keyboard||reduced.matches){next.style.transition='none';requestAnimationFrame(()=>next.style.transition='')}
}
$$('[data-professional]').forEach((b,i)=>{b.addEventListener('click',e=>selectProfessional(i,e.detail===0));b.addEventListener('focus',()=>selectProfessional(i,true));if(hover.matches)b.addEventListener('pointerenter',()=>selectProfessional(i));});
// Products: image and copy respond together; the contact link always names the visible item.
let productIndex=7,requestedProductIndex=7,productSequence=0;const productPhoto=$('#product-photo');
async function selectProduct(index){const nextIndex=(index+products.length)%products.length,p=products[nextIndex],seq=++productSequence;requestedProductIndex=nextIndex;let img;
 if(p.image){img=new Image();img.src=p.image;img.alt='Fotografia oficial: '+p.name;img.width=800;img.height=800;try{await img.decode()}catch{img=null}}if(seq!==productSequence)return;
 productIndex=nextIndex;
 const previous=productPhoto.firstElementChild?.cloneNode(true);productPhoto.querySelectorAll('.product-previous').forEach(n=>n.remove());
 if(img)productPhoto.replaceChildren(img);else{const fallback=document.createElement('div');fallback.className='typographic-product';const title=document.createElement('span');title.textContent=p.name;const note=document.createElement('small');note.textContent='Fotografia não disponibilizada';fallback.append(title,note);productPhoto.replaceChildren(fallback)}
 $('#product-name').textContent=p.name;$('#product-price').textContent=p.price;$('#product-category').textContent=p.category;$('#product-position').textContent=`${nextIndex+1} / ${products.length}`;
 $('#product-detail').textContent='Valor do catálogo da Sr. Navalha. Fale com a equipe para conhecer o produto e consultar a disponibilidade.';
 $('#product-contact').href='https://wa.me/5581995722396?text='+encodeURIComponent(`Olá! Gostaria de consultar a disponibilidade de ${p.name} (${p.price}).`);
 const active=productPhoto.firstElementChild;if(previous&&!reduced.matches){previous.classList.add('product-previous');previous.setAttribute('aria-hidden','true');productPhoto.append(previous);active.style.position='relative';active.style.zIndex='2';setTimeout(()=>previous.remove(),600)}
 motion(active,[{clipPath:'inset(0 0 0 100%)',transform:'translateX(16px)'},{clipPath:'inset(0)',transform:'none'}],{duration:520,easing:'cubic-bezier(.76,0,.24,1)'});
 motion($('.product-copy'),[{transform:'translateY(8px)',opacity:.7},{transform:'none',opacity:1}],{duration:220});
}
$('#product-prev').addEventListener('click',()=>selectProduct(requestedProductIndex-1));$('#product-next').addEventListener('click',()=>selectProduct(requestedProductIndex+1));$$('[data-product]').forEach(b=>b.addEventListener('click',()=>{selectProduct(Number(b.dataset.product));$('#product-stage').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});}));
$$('[data-product-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-product-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$$('[data-product-category]').forEach(a=>a.hidden=b.dataset.productFilter!=='Todos'&&a.dataset.productCategory!==b.dataset.productFilter)}));
// Spatial lightbox entry/return, native modal focus trap, swipe and keyboard controls.
const dialog=$('.lightbox'),lightImage=$('#lightbox-image'),shots=$$('[data-work]');let shotIndex=0,returnFocus=null,photoSequence=0,closeSequence=0;
async function displayPhoto(index,opening=false){closeSequence++;shotIndex=(index+shots.length)%shots.length;const seq=++photoSequence,s=shots[shotIndex],source=$('img',s),next=new Image();next.src=s.href;try{await next.decode()}catch{}if(seq!==photoSequence)return;lightImage.src=next.src;lightImage.alt=source.alt;$('#lightbox-caption').textContent=$('figcaption span',s).textContent+` · ${shotIndex+1} / ${shots.length}`;const from=source.getBoundingClientRect();if(!dialog.open)dialog.showModal();
 if(opening){const to=lightImage.getBoundingClientRect();motion(lightImage,[{transform:`translate(${from.x-to.x}px,${from.y-to.y}px) scale(${from.width/Math.max(1,to.width)},${from.height/Math.max(1,to.height)})`,transformOrigin:'top left',opacity:.6},{transform:'none',transformOrigin:'top left',opacity:1}],{duration:520})}else motion(lightImage,[{opacity:.3,transform:'translateX(14px)'},{opacity:1,transform:'none'}]);}
shots.forEach((s,i)=>s.addEventListener('click',e=>{e.preventDefault();returnFocus=s;displayPhoto(i,true)}));
function closePhoto(){if(!dialog.open)return;photoSequence++;const closing=++closeSequence;const target=$('img',returnFocus),from=lightImage.getBoundingClientRect(),to=target.getBoundingClientRect();const a=motion(lightImage,[{transform:'none',opacity:1},{transform:`translate(${to.x-from.x}px,${to.y-from.y}px) scale(${to.width/Math.max(1,from.width)})`,transformOrigin:'top left',opacity:.25}],{duration:180});if(a)a.finished.catch(()=>{}).then(()=>{if(closing===closeSequence)dialog.close()});else dialog.close();}
$('.lightbox-close').addEventListener('click',closePhoto);$('.lightbox-next').addEventListener('click',()=>displayPhoto(shotIndex+1));$('.lightbox-prev').addEventListener('click',()=>displayPhoto(shotIndex-1));dialog.addEventListener('cancel',e=>{e.preventDefault();closePhoto()});dialog.addEventListener('close',()=>{photoSequence++;returnFocus?.focus({preventScroll:true})});
dialog.addEventListener('click',e=>{if(e.target===dialog)closePhoto()});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();displayPhoto(shotIndex+1)}if(e.key==='ArrowLeft'){e.preventDefault();displayPhoto(shotIndex-1)}});
let startX=null;dialog.addEventListener('pointerdown',e=>{startX=e.clientX});dialog.addEventListener('pointerup',e=>{if(startX!==null&&Math.abs(e.clientX-startX)>50)displayPhoto(shotIndex+(e.clientX<startX?1:-1));startX=null});dialog.addEventListener('pointercancel',()=>startX=null);
// On-demand map leaves direct address and route accessible during provider failures.
$('#load-map').addEventListener('click',()=>{const frame=$('#map'),button=$('#load-map');button.textContent='Carregando mapa…';button.disabled=true;frame.src=frame.dataset.src;const timer=setTimeout(()=>{button.textContent='Tentar carregar novamente';button.disabled=false},9000);frame.addEventListener('load',()=>{clearTimeout(timer);frame.hidden=false;button.textContent='Recarregar mapa';button.disabled=false},{once:true});});
// Image failures become explicit labels, with identity and navigation intact.
function imageFailed(img){if(img.closest('.identity')||img.classList.contains('brand')){img.alt='Sr. Navalha Barbearia';return}img.classList.add('image-unavailable');img.alt='Fotografia indisponível: '+img.alt;}
$$('img').forEach(img=>{img.addEventListener('error',()=>imageFailed(img));if(img.complete&&!img.naturalWidth)imageFailed(img)});
initPassages();initReviews();initServices();
