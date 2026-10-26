import { $, $$, startMotion } from './core.js';
import { initAlbum } from './album.js';
import { initMotion } from './motion.js';
import { initAtmosphere } from './atmosphere.js';
import { initSceneCuts } from './scene-cuts.js';
import { openRitual } from './opening.js';
import { initServices } from './services.js';
import { initTeam } from './team.js';
import { initProducts } from './products.js';
import { initGallery } from './gallery.js';
import { initMap } from './map.js';

const root=document.documentElement;
// Guard against an accidental second entry point; listeners have one owner.
if(!root.classList.contains('enhanced')){
 root.classList.add('enhanced');startMotion();
 const initialize=init=>{try{init()}catch(error){console.error('Componente Sr. Navalha:',error)}};
 const menu=$('.menu');
 const closeMenu=()=>{menu.open=false};
 $$('.menu nav a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('click',e=>{if(menu.open&&!menu.contains(e.target))closeMenu()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){closeMenu();$('summary',menu).focus()}});
 matchMedia('(min-width:1001px)').addEventListener('change',closeMenu);
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
 openRitual().catch(error=>{console.error('Abertura:',error);window.__finishRitual?.();root.classList.remove('sr-loader-boot');$('#sr-loader-stage')?.remove()});
}
