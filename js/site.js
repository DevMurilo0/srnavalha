import products from './data/products.js';
import professionals from './data/professionals.js';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),hover=matchMedia('(hover:hover) and (pointer:fine)');
document.documentElement.classList.add('enhanced');
const ease='cubic-bezier(.22,1,.36,1)';
function motion(el,frames,options={}){el.getAnimations().forEach(a=>a.cancel());if(reduced.matches)return;return el.animate(frames,{duration:220,easing:ease,...options});}
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
 motion($('.service-catalog'),[{transform:'translateY(7px)',opacity:.7},{transform:'none',opacity:1}]);
}));
// Photograph navigation: persistent layers, decoded before activation, last request wins.
let portraitSequence=0,currentProfessional=0;const portraitFigures=$$('[data-portrait]');
async function selectProfessional(index,keyboard=false){
 if(index===currentProfessional)return;const seq=++portraitSequence,next=portraitFigures[index],img=$('img',next);
 img.loading='eager';try{await img.decode()}catch{}if(seq!==portraitSequence)return;
 portraitFigures.forEach((f,i)=>{f.classList.toggle('is-outgoing',i===currentProfessional);f.classList.toggle('is-active',i===index);f.setAttribute('aria-hidden',String(i!==index))});
 $$('[data-professional]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
 currentProfessional=index;$('#professional-caption').textContent=professionals[index].name+' · Profissional da Sr. Navalha';
 if(keyboard)portraitFigures.forEach(f=>f.getAnimations().forEach(a=>a.finish()));
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
 const active=productPhoto.firstElementChild;if(previous&&!reduced.matches){previous.classList.add('product-previous');previous.setAttribute('aria-hidden','true');productPhoto.append(previous);active.style.position='relative';active.style.zIndex='2';setTimeout(()=>previous.remove(),320)}
 motion(active,[{clipPath:'inset(0 0 0 100%)',transform:'translateX(16px)'},{clipPath:'inset(0)',transform:'none'}],{duration:280});
 motion($('.product-copy'),[{transform:'translateY(8px)',opacity:.7},{transform:'none',opacity:1}],{duration:220});
}
$('#product-prev').addEventListener('click',()=>selectProduct(requestedProductIndex-1));$('#product-next').addEventListener('click',()=>selectProduct(requestedProductIndex+1));$$('[data-product]').forEach(b=>b.addEventListener('click',()=>{selectProduct(Number(b.dataset.product));$('#product-stage').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'center'});}));
$$('[data-product-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-product-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$$('[data-product-category]').forEach(a=>a.hidden=b.dataset.productFilter!=='Todos'&&a.dataset.productCategory!==b.dataset.productFilter)}));
// Spatial lightbox entry/return, native modal focus trap, swipe and keyboard controls.
const dialog=$('.lightbox'),lightImage=$('#lightbox-image'),shots=$$('[data-work]');let shotIndex=0,returnFocus=null,photoSequence=0;
async function displayPhoto(index,opening=false){shotIndex=(index+shots.length)%shots.length;const seq=++photoSequence,s=shots[shotIndex],source=$('img',s),next=new Image();next.src=s.href;try{await next.decode()}catch{}if(seq!==photoSequence)return;lightImage.src=next.src;lightImage.alt=source.alt;$('#lightbox-caption').textContent=$('figcaption span',s).textContent+` · ${shotIndex+1} / ${shots.length}`;if(!dialog.open)dialog.showModal();
 if(opening){const from=source.getBoundingClientRect(),to=lightImage.getBoundingClientRect();motion(lightImage,[{transform:`translate(${from.x-to.x}px,${from.y-to.y}px) scale(${from.width/Math.max(1,to.width)})`,transformOrigin:'top left',opacity:.6},{transform:'none',transformOrigin:'top left',opacity:1}],{duration:320})}else motion(lightImage,[{opacity:.3,transform:'translateX(14px)'},{opacity:1,transform:'none'}]);}
shots.forEach((s,i)=>s.addEventListener('click',e=>{e.preventDefault();returnFocus=s;displayPhoto(i,true)}));
function closePhoto(){if(!dialog.open)return;const target=$('img',returnFocus),from=lightImage.getBoundingClientRect(),to=target.getBoundingClientRect();const a=motion(lightImage,[{transform:'none',opacity:1},{transform:`translate(${to.x-from.x}px,${to.y-from.y}px) scale(${to.width/Math.max(1,from.width)})`,transformOrigin:'top left',opacity:.25}],{duration:180});if(a)a.finished.catch(()=>{}).then(()=>dialog.close());else dialog.close();}
$('.lightbox-close').addEventListener('click',closePhoto);$('.lightbox-next').addEventListener('click',()=>displayPhoto(shotIndex+1));$('.lightbox-prev').addEventListener('click',()=>displayPhoto(shotIndex-1));dialog.addEventListener('cancel',e=>{e.preventDefault();closePhoto()});dialog.addEventListener('close',()=>{photoSequence++;returnFocus?.focus({preventScroll:true})});
dialog.addEventListener('click',e=>{if(e.target===dialog)closePhoto()});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();displayPhoto(shotIndex+1)}if(e.key==='ArrowLeft'){e.preventDefault();displayPhoto(shotIndex-1)}});
let startX=null;dialog.addEventListener('pointerdown',e=>{startX=e.clientX});dialog.addEventListener('pointerup',e=>{if(startX!==null&&Math.abs(e.clientX-startX)>50)displayPhoto(shotIndex+(e.clientX<startX?1:-1));startX=null});dialog.addEventListener('pointercancel',()=>startX=null);
// Continuous review ribbon uses native horizontal scrolling: touch can take over without a snap.
const viewport=$('.review-viewport'),track=$('.review-track'),group=$('.review-group'),pause=$('#review-pause');let userPaused=false,pointerPaused=false,focusPaused=false,reviewVisible=false,last=0,raf=0,reviewPosition=0;
function setReviewMode(){track.querySelector('[data-review-clone]')?.remove();viewport.scrollLeft=0;reviewPosition=0;last=0;cancelAnimationFrame(raf);if(reduced.matches){pause.hidden=true;return}pause.hidden=false;const clone=group.cloneNode(true);clone.dataset.reviewClone='';clone.setAttribute('aria-hidden','true');clone.inert=true;$$('a',clone).forEach(a=>a.tabIndex=-1);track.append(clone);raf=requestAnimationFrame(tick);}
function tick(time){const dt=last?Math.min(time-last,50):0;last=time;if(reviewVisible&&!document.hidden&&!userPaused&&!pointerPaused&&!focusPaused&&!reduced.matches){if(Math.abs(viewport.scrollLeft-reviewPosition)>2)reviewPosition=viewport.scrollLeft;reviewPosition+=dt*.025;const cycle=group.getBoundingClientRect().width;if(reviewPosition>=cycle)reviewPosition-=cycle;viewport.scrollLeft=reviewPosition}raf=requestAnimationFrame(tick)}
pause.addEventListener('click',()=>{userPaused=!userPaused;pause.setAttribute('aria-pressed',String(userPaused));pause.textContent=userPaused?'Retomar movimento':'Pausar movimento'});
viewport.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')pointerPaused=true});viewport.addEventListener('pointerleave',()=>pointerPaused=false);viewport.addEventListener('pointerdown',()=>pointerPaused=true);viewport.addEventListener('pointerup',()=>{pointerPaused=false;userPaused=true;pause.setAttribute('aria-pressed','true');pause.textContent='Retomar movimento'});viewport.addEventListener('pointercancel',()=>pointerPaused=false);viewport.addEventListener('focusin',()=>focusPaused=true);viewport.addEventListener('focusout',()=>focusPaused=false);
new IntersectionObserver(entries=>{reviewVisible=entries[0].isIntersecting;last=0}).observe(viewport);document.addEventListener('visibilitychange',()=>last=0);setReviewMode();
// Signature editorial passage. The same photograph leaves the hero and docks beside the story.
const heroPhoto=$('[data-editorial-photo]'),intro=$('.intro'),dock=document.createElement('div');dock.className='editorial-dock';dock.setAttribute('aria-hidden','true');$('.intro-title').prepend(dock);let passage=null;
function measurePassage(){heroPhoto.style.transform='';$('figcaption',heroPhoto).style.transform='';passage=null;if(reduced.matches||innerWidth<=850){dock.hidden=true;return}dock.hidden=false;const a=heroPhoto.getBoundingClientRect(),d=dock.getBoundingClientRect();passage={x:d.x-a.x,y:d.y-a.y,scale:d.width/a.width,start:80,end:intro.offsetTop-210};updatePassage()}
function updatePassage(){if(!passage)return;const t=Math.max(0,Math.min(1,(scrollY-passage.start)/Math.max(1,passage.end-passage.start)));const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v)};const shrink=smooth(t/.3),across=smooth((t-.3)/.4),land=smooth((t-.7)/.3);const intermediate=Math.max(0,passage.y-260);const dy=intermediate*shrink+260*land;const scale=1+(passage.scale-1)*shrink;heroPhoto.style.transform=`translate(${passage.x*across}px,${dy}px) scale(${scale})`;$('figcaption',heroPhoto).style.transform=`scale(${1/scale})`;}
let scrollPending=false;addEventListener('scroll',()=>{if(scrollPending)return;scrollPending=true;requestAnimationFrame(()=>{updatePassage();scrollPending=false})},{passive:true});addEventListener('resize',measurePassage);document.fonts.ready.then(measurePassage);addEventListener('load',measurePassage);
// On-demand map leaves direct address and route accessible during provider failures.
$('#load-map').addEventListener('click',()=>{const frame=$('#map'),button=$('#load-map');button.textContent='Carregando mapa…';button.disabled=true;frame.src=frame.dataset.src;const timer=setTimeout(()=>{button.textContent='Tentar carregar novamente';button.disabled=false},9000);frame.addEventListener('load',()=>{clearTimeout(timer);frame.hidden=false;button.textContent='Recarregar mapa';button.disabled=false},{once:true});});
// Image failures become explicit labels, with identity and navigation intact.
function imageFailed(img){if(img.closest('.identity')||img.classList.contains('brand')){img.alt='Sr. Navalha Barbearia';return}img.classList.add('image-unavailable');img.alt='Fotografia indisponível: '+img.alt;}
$$('img').forEach(img=>{img.addEventListener('error',()=>imageFailed(img));if(img.complete&&!img.naturalWidth)imageFailed(img)});
reduced.addEventListener('change',()=>{document.getAnimations().forEach(a=>a.cancel());setReviewMode();measurePassage()});
