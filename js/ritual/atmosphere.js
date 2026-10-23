/* SR. NAVALHA / V18
   Decor enters with delayed cinematic WAAPI from the original composed state.
   Nothing is permanently hidden; interruption/reduced-motion is safe. */
import {$$,animate,canMove,flow} from './core.js';
export function initAtmosphere(){
 const items=$$('[data-material-reveal]');
 if(!items.length||!('IntersectionObserver' in window))return;
 const seen=new WeakSet();
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   const element=entry.target;
   observer.unobserve(element);
   if(seen.has(element))continue;
   seen.add(element);
   if(!canMove())continue;
   const section=element.closest('section,footer');
   const sections=$$('main section');
   const index=Math.max(0,sections.indexOf(section));
   const delay=Math.min(435,170+index%5*65);
   const horizontal=element.matches('.team-mood-photo,.album-editorial-print')?'-50px':element.matches('.hero-atelier-emblem,.product-photo-detail')?'48px':'0px';
   const frames=[
     {opacity:.15,transform:`translate(${horizontal},34px) scale(.94) rotate(-3deg)`,clipPath:'inset(16% 3% 16% 3%)'},
     {opacity:1,transform:'none',clipPath:'inset(0% 0% 0% 0%)'}
   ];
   animate(element,frames,{duration:1150,delay,easing:'cubic-bezier(.16,1,.3,1)'});
   const photo=element.querySelector('img');
   if(photo && element.matches('.team-mood-photo,.house-atmosphere-photo,.album-editorial-print,.visit-storefront')){
     animate(photo,[{transform:'translateY(11px) scale(1.08)'},{transform:'none'}],{duration:1360,delay:delay+110,easing:flow});
   }
  }
 },{threshold:.13,rootMargin:'0px 0px -9% 0px'});
 items.forEach(item=>observer.observe(item));
}
