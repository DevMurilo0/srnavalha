import { $, $$, startMotion, animate } from './core.js';
import { initAlbum } from './album.js';
import { initMotion } from './motion.js';
import { initAtmosphere } from './atmosphere.js';
import { initSceneCuts } from './scene-cuts.js';
import { openRitual } from './opening.js';
import { initHeroExperience } from './hero-sign.js';
import { initServices } from './services.js';
import { initTeam } from './team.js';
import { initProducts } from './products.js';
import { initGallery } from './gallery.js';
import { initMap } from './map.js';

const root=document.documentElement;
// Guard against an accidental second entry point; listeners have one owner.
if(!root.classList.contains('enhanced')){
 root.classList.add('enhanced');startMotion();
 initHeroExperience();
 // A linha do tempo da abertura começa antes de inicializar catálogos e mapa.
 // Isso mantém a porcentagem sincronizada com anel/trilhos mesmo no mobile.
 openRitual().catch(error=>{
  console.error('Abertura:',error);
  if(typeof window.__finishRitual==='function') window.__finishRitual('interrupted');
  else {
   root.classList.remove('sr-loader-boot','sr-cut-reveal');
   $('#sr-loader-stage')?.remove();
   document.dispatchEvent(new CustomEvent('openingend',{detail:{completed:false,reason:'module-error'}}));
  }
  $('#sr-loader-shock')?.remove();
 });
 const initialize=init=>{try{init()}catch(error){console.error('Componente Sr. Navalha:',error)}};
 // Preserve native <details> semantics while letting the menu animate
 // BOTH open and close. The panel stays mounted during the closing transition.
 const menu=$('.menu');
 if(menu){
  const trigger=$('summary',menu),panel=$('nav',menu);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let closeTimer=0,openFrame=0;
  trigger.setAttribute('aria-controls','site-mobile-nav');
  trigger.setAttribute('aria-expanded','false');
  panel.id='site-mobile-nav';
  panel.inert=true;
  const finalizeClose=()=>{
   menu.open=false;menu.classList.remove('is-closing','is-active');
   closeTimer=0;
  };
  const closeMenu=(immediate=false)=>{
   clearTimeout(closeTimer);cancelAnimationFrame(openFrame);
   if(!menu.open)return;
   menu.classList.remove('is-active');
   menu.classList.add('is-closing');
   trigger.setAttribute('aria-expanded','false');
   panel.inert=true;
   if(immediate||reduced.matches){finalizeClose();return}
   closeTimer=setTimeout(finalizeClose,310);
  };
  const openMenu=()=>{
   clearTimeout(closeTimer);cancelAnimationFrame(openFrame);
   menu.open=true;
   menu.classList.remove('is-closing');
   trigger.setAttribute('aria-expanded','true');
   panel.inert=false;
   openFrame=requestAnimationFrame(()=>{
    openFrame=0;
    if(menu.open)menu.classList.add('is-active');
   });
  };
  trigger.addEventListener('click',event=>{
   event.preventDefault();
   if(menu.classList.contains('is-active'))closeMenu();
   else openMenu();
  });
  $$('.menu nav a').forEach(link=>link.addEventListener('click',()=>closeMenu()));
  document.addEventListener('click',event=>{
   if(menu.open&&!menu.contains(event.target))closeMenu();
  });
  document.addEventListener('keydown',event=>{
   if(event.key==='Escape'&&menu.open){
    closeMenu();
    trigger.focus({preventScroll:true});
   }
  });
  matchMedia('(min-width:1001px)').addEventListener('change',()=>closeMenu(true));
  reduced.addEventListener('change',()=>{if(reduced.matches&&!menu.classList.contains('is-active'))closeMenu(true)});
 }
 // Capture also covers images inserted by the interactive stages.
 document.addEventListener('error',e=>{if(e.target instanceof HTMLImageElement&&!e.target.classList.contains('image-unavailable')){
  e.target.classList.add('image-unavailable');if(e.target.alt)e.target.alt='Fotografia indisponível: '+e.target.alt;
 }},true);
 // Controls work before the first gesture. Heavy album layout is initialized
 // on approach, never in an arbitrary burst after the visitor starts scrolling.
 for(const init of [initServices,initTeam,initProducts,initGallery,initMotion,initAtmosphere,initSceneCuts])initialize(init);
 let albumReady=false;
 const album=()=>{if(albumReady)return;albumReady=true;initialize(initAlbum)};
 const albumRoot=$('#trabalhos');
 // Deep links and keyboard/focus/pointer entry initialize synchronously.
 for(const type of ['focusin','pointerdown'])albumRoot.addEventListener(type,album,{capture:true,once:true});
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){album();observer.disconnect()}},{rootMargin:'700px 0px'});
  observer.observe(albumRoot);
 }else album();
 initialize(initMap);
 // The fixed action appears only beyond the hero, on every viewport.
 // Visibility also removes the link from keyboard navigation while concealed.
 const bookingLink=$('.sr-booking-fixed'),footer=$('footer'),hero=$('.hero');
 if(bookingLink&&hero&&'IntersectionObserver' in window){
  bookingLink.hidden=true;
  const visible=new Set([hero]);
  let arrival;
  const headerInset=Math.round($('.site-header')?.getBoundingClientRect().height||0);
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>entry.isIntersecting&&entry.intersectionRect.height>2?visible.add(entry.target):visible.delete(entry.target));
   const hidden=visible.has(hero)||visible.has(footer);
   if(bookingLink.hidden===hidden)return;
   arrival?.cancel();bookingLink.hidden=hidden;
   if(!hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    arrival=animate(bookingLink,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:200,easing:'cubic-bezier(.16,1,.3,1)'});
   }
  },{threshold:[0,.01],rootMargin:`-${headerInset}px 0px 0px 0px`});
  observer.observe(hero);if(footer)observer.observe(footer);
  addEventListener('pagehide',()=>{arrival?.cancel();observer.disconnect()},{once:true});
  addEventListener('pageshow',event=>{if(event.persisted){observer.observe(hero);if(footer)observer.observe(footer)}});
 }



}
