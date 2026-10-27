/* One entrance owner. Natural content is never hidden in a waiting queue. */
import {$,$$,animate,canMove} from './core.js';

export function initMotion(){
 const compact=matchMedia('(max-width:700px)');
 if(!('IntersectionObserver' in window))return;
 const running=new Map(),seen=new WeakSet();
 // A heading is one composited object, not a layer per word. Controls and
 // nested image stages keep their own animation ownership.
 const targets=$$('main h2,footer h2,.section-heading>p,.house-copy>p,.house-portal,.mirror-frame,.team-portrait,.product-hero,.footer-visual,.service-entry,.visit-info>address,.map-frame,.practical>p,.footer-story-copy,.footer-feature-cta,.footer-directory>*,.album-toolbar,.work-print .photo-window,[data-material-reveal]');
 let remaining=targets.length;
 const observer=new IntersectionObserver(entries=>{
  // Read every composed state before starting any animations in this batch.
  const incoming=entries.filter(e=>e.isIntersecting&&!seen.has(e.target));
  const snapshots=incoming.map(({target})=>({target,transform:getComputedStyle(target).transform,opacity:getComputedStyle(target).opacity}));
  for(const entry of entries)if(!entry.isIntersecting&&running.has(entry.target)){
   running.get(entry.target).cancel();running.delete(entry.target);
  }
  for(const {target,transform,opacity} of snapshots){
   seen.add(target);remaining--;
   const budget=compact.matches?3:6;
   const decorative=target.hasAttribute('data-material-reveal');
   if(!canMove()||running.size>=budget||(compact.matches&&decorative)||target.getAnimations().some(a=>a.id==='sr-filter-result')){
    observer.unobserve(target);continue;
   }
   const paper=target.matches('.house-portal,.team-portrait,.product-hero,.footer-visual');
   const row=target.matches('.service-entry');
   const photograph=target.matches('.work-print .photo-window');
   const route=target.matches('.visit-info>address,.map-frame');
   const suffix=transform==='none'?'':` ${transform}`;
   const start=photograph?`scale(1.035)${suffix}`:paper?`translateY(18px) rotate(${target.matches('.house-portal')?1.2:-.65}deg)${suffix}`:
     route?`translateX(14px)${suffix}`:row?`translateX(9px)${suffix}`:`translateY(12px)${suffix}`;
   // Preserve reading order within a local group, with a bounded delay.
   const siblings=[...target.parentElement.children];
   const delay=row||target.matches('.house-copy>p,.practical>p,.footer-directory>*')
     ? Math.min(siblings.indexOf(target),3)*55:0;
   const animation=animate(target,[{opacity:paper?.72:.4,transform:start},{opacity,transform}],
     {duration:row?320:paper||photograph?780:480,delay,easing:'cubic-bezier(.22,1,.36,1)'});
   if(animation)animation.id='sr-section-reveal';
   if(!animation){observer.unobserve(target);continue}
   running.set(target,animation);
   animation.finished.catch(()=>{}).finally(()=>{
    if(running.get(target)===animation)running.delete(target);
    observer.unobserve(target);
    if(!remaining&&!running.size)observer.disconnect();
   });
  }
 },{threshold:0,rootMargin:'80px 0px'});
 targets.forEach(el=>observer.observe(el));
 document.addEventListener('motionchange',()=>{
  if(canMove())return;
  for(const animation of running.values())animation.cancel();running.clear();
 });
 // The photographic doorway now dissolves once, rather than repainting a
 // polygon on every scroll. CSS view timelines enhance supported desktops.
 const inside=$('.portal-inside');
 if(inside&&!CSS.supports('animation-timeline: view()')){
  const portal=new IntersectionObserver(entries=>{
   if(!entries.some(e=>e.isIntersecting))return;
   animate(inside,[{opacity:0},{opacity:1}],{duration:800});portal.disconnect();
  },{threshold:.2});portal.observe(inside);
 }
 const progress=document.createElement('div');progress.className='scroll-thread';progress.setAttribute('aria-hidden','true');document.body.append(progress);
 const nav=$$('.desktop-nav a');
 const navObserver=new IntersectionObserver(entries=>{
  const entry=entries.find(e=>e.isIntersecting);if(!entry)return;
  nav.forEach(a=>a.hash===`#${entry.target.id}`?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
 },{rootMargin:'-10% 0px -65%'});
 $$('main section[id]').forEach(el=>navObserver.observe(el));
 document.documentElement.classList.add('sr-motion-initialized');
}
