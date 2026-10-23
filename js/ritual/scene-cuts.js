// V19 / Scene-cuts that connect sections. Safe fallback: the seam is always visible.
import {$$,animate,canMove} from './core.js';
export function initSceneCuts(){
 const seams=$$('.sr-scene-join');
 if(!seams.length || !('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{
  for(const {target,isIntersecting} of entries){
   if(!isIntersecting)continue;observer.unobserve(target);
   if(!canMove())continue;
   const rail=target.querySelector('.sr-scene-join__rail');
   const medallion=target.querySelector('.sr-scene-join__medallion');
   const lines=[...target.querySelectorAll('.sr-scene-join__rail::before')]; // pseudo-elements retain CSS fallback
   if(rail)animate(rail,[{opacity:.25,transform:'scaleX(.28)'},{opacity:1,transform:'none'}],{duration:970,delay:100,easing:'cubic-bezier(.16,1,.3,1)'});
   if(medallion)animate(medallion,[{opacity:.18,transform:'translateY(32px) rotate(-45deg) scale(.72)'},{opacity:1,transform:'none'}],{duration:1150,delay:210,easing:'cubic-bezier(.16,1,.3,1)'});
  }
 },{threshold:.24,rootMargin:'0px 0px -12% 0px'});
 seams.forEach(s=>observer.observe(s));
}
