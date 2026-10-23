/* SR. NAVALHA / V18
   Decor enters with delayed cinematic WAAPI from the original composed state.
   Nothing is permanently hidden; interruption/reduced-motion is safe. */
import {$$,animate,canMove,flow} from './core.js';
export function initAtmosphere(){
 const items=$$('[data-material-reveal]');
 if(!items.length||!('IntersectionObserver' in window)||!canMove())return;
 items.forEach(el=>el.classList.add('sr-art-queued'));
 const seen=new WeakSet();
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   const element=entry.target;
   observer.unobserve(element);
   if(seen.has(element))continue;
   seen.add(element);
   if(!canMove()||!element.classList.contains('sr-art-queued')){element.classList.remove('sr-art-queued');continue;}
   const section=element.closest('section,footer');
   const sections=$$('main section');
   const index=Math.max(0,sections.indexOf(section));
   const delay=40+index%3*35;
   element.classList.remove('sr-art-queued');
   const base=getComputedStyle(element),endOpacity=base.opacity,endTransform=base.transform;
   const horizontal=element.matches('.team-mood-photo,.album-editorial-print')?'-50px':element.matches('.hero-atelier-emblem,.product-photo-detail')?'48px':'0px';
   const frames=[
     {opacity:.15,transform:`translate(${horizontal},20px) scale(.97) ${endTransform==='none'?'':endTransform}`},
     {opacity:endOpacity,transform:endTransform}
   ];
   animate(element,[{...frames[0],opacity:0},frames[1]],{duration:780,delay,easing:'cubic-bezier(.16,1,.3,1)'});
   const photo=element.querySelector('img');
   if(photo && element.matches('.team-mood-photo,.house-atmosphere-photo,.album-editorial-print,.visit-storefront')){
     animate(photo,[{transform:'translateY(11px) scale(1.08)'},{transform:'none'}],{duration:880,delay:delay+50,easing:flow});
   }
  }
 },{threshold:0,rootMargin:'0px 0px 36px 0px'});
 items.forEach(item=>observer.observe(item));
 document.addEventListener('motionchange',()=>{if(!canMove()){observer.disconnect();items.forEach(el=>el.classList.remove('sr-art-queued'))}});
}
