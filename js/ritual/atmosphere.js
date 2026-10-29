/* Ambient media keep their phase when paused. No geometry reads or scroll loop. */
import {$,$$,canMove,preference} from './core.js';
export function initAtmosphere(){
 const film=$('.detail-film'),reviewFrame=$('.review-visual-frame'),footer=$('.footer');
 const track=$('.review-track'),group=$('.review-group'),viewport=$('.review-viewport');
 const clone=group.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.inert=true;
 $$('a',clone).forEach(a=>a.tabIndex=-1);track.append(clone);
 const visible=new Set(),compact=matchMedia('(max-width:700px)');let paused=false;
 const lowPower=(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4)||
   navigator.connection?.saveData===true;
 // Motion text and photos have priority over ambient loops on older laptops.
 if(lowPower)document.documentElement.classList.add('sr-lite-motion');
 const pause=$('#review-pause');
 function sync(){
  const move=canMove();
  track.classList.toggle('is-moving',!preference.matches&&!lowPower);
  track.classList.toggle('is-paused',lowPower||paused||!move||!visible.has(viewport));
  clone.hidden=preference.matches;
  reviewFrame?.classList.toggle('is-playing',move&&visible.has(reviewFrame));
  footer?.classList.toggle('is-in-view',move&&visible.has(footer));
  // Keep the real still photograph on phones; avoid a second video decoder
  // competing with scroll. Desktop retains the original film when visible.
  if(film){if(move&&!compact.matches&&!lowPower&&visible.has(film)){
   if(!film.src)film.src=film.dataset.src;
   if(film.paused)film.play().catch(()=>{});
  }else film.pause()}
 }
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   for(const e of entries)e.isIntersecting?visible.add(e.target):visible.delete(e.target);
   sync();
  });[film,reviewFrame,footer,viewport].filter(Boolean).forEach(el=>observer.observe(el));
 }
 pause.addEventListener('click',()=>{
  paused=!paused;pause.setAttribute('aria-pressed',String(paused));
  $('span',pause).textContent=paused?'Retomar depoimentos':'Pausar depoimentos';sync();
 });
 document.addEventListener('motionchange',sync);compact.addEventListener('change',sync);
 addEventListener('pageshow',sync);sync();
}
