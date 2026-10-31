/* Corte de Luz: the only entrance owner. The official logo belongs to the
   scissors FLIP; this timeline animates its neighbours, never its geometry. */
import {$,$$,canMove} from './core.js';
import {revealText} from './text-motion.js';
export function initHeroExperience(){
 const hero=$('.hero'),root=document.documentElement;
 if(!hero){root.classList.remove('sr-hero-queued');return;}
 const controller=new AbortController(),effects=[],styles=[];
 let started=false;
 const settle=()=>{
  if(controller.signal.aborted)return;
  root.classList.remove('sr-hero-queued');hero.classList.remove('is-arriving');
  effects.forEach(effect=>effect.cancel());
  styles.forEach(({node,opacity})=>{node.style.opacity=opacity});
  controller.abort();
 };
 const begin=()=>{
  if(started||controller.signal.aborted)return;
  if(!canMove()||scrollY>20||!root.classList.contains('sr-hero-queued'))return settle();
  started=true;hero.classList.add('is-arriving');
  const play=(node,frames,delay=0,duration=850,id='sr-hero-detail')=>{
   if(!node)return;
   const effect=node.animate(frames,{delay,duration,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
   effect.id=id;effects.push(effect);
  };
  const enter=(node,delay,x=0,y=0,duration=760)=>{
   if(!node)return;
   styles.push({node,opacity:node.style.opacity});node.style.opacity='1';
   play(node,[{opacity:0,transform:`translate3d(${x}px,${y}px,0)`},{offset:.28,opacity:1},{opacity:1,transform:'translate3d(0,0,0)'}],delay,duration);
  };
  try{
   $$('.hero-cinema__shutter',hero).forEach((node,index)=>play(node,
    [{transform:'translateX(0)'},{transform:`translateX(${index?101:-101}%)`}],0,1380,'sr-hero-curtain'));
   $$('.hero-pole__object',hero).forEach((node,index)=>enter(node,55,index?14:-14,5,1220));
   enter($('.hero-wordmark>span',hero),80,0,4,1060);
   const tag=$('.hero-cinema__masthead-tag',hero);
   styles.push({node:tag,opacity:tag.style.opacity});tag.style.opacity='1';
   $$('span',tag).forEach((node,i)=>enter(node,95+i*70,(i-1)*9,0,1040));
   $$('i',tag).forEach(node=>play(node,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],110,670));
   const topline=$('.hero-topline',hero);
   styles.push({node:topline,opacity:topline.style.opacity});topline.style.opacity='1';
   $$('span',topline).forEach((node,i)=>enter(node,165+i*80,i?10:-10,0,1050));
   const picture=$('.hero-room picture',hero);
   play(picture,[{transform:'scale(1.045)'},{transform:'scale(1)'}],0,2150,'sr-hero-camera');
   const heading=$('h1',hero);
   styles.push({node:heading,opacity:heading.style.opacity});heading.style.opacity='1';
   effects.push(revealText(heading,'lightcut',{delay:300,duration:1760}));
   enter($('.hero-intro',hero),620,0,9,1050);
   const booking=$('.hero-cta',hero);
   styles.push({node:booking,opacity:booking.style.opacity});booking.style.opacity='1';
   play(booking,[{opacity:0,transform:'translate3d(0,12px,0) scale(.99)'},{offset:.24,opacity:1},{opacity:1,transform:'translate3d(0,0,0) scale(1)'}],700,1200,'sr-hero-booking-arrival');
   enter($('.hero-explore',hero),880,0,3,930);
   Promise.allSettled(effects.map(effect=>effect.finished)).then(settle);
  }catch{settle();}
 };
 document.addEventListener('openingcutmidpoint',begin,{once:true,signal:controller.signal});
 document.addEventListener('openingend',event=>{if(!event.detail?.completed)settle();else if(!started)begin()},{once:true,signal:controller.signal});
 for(const type of ['wheel','touchstart','pointerdown','keydown','scroll','pagehide','resize'])addEventListener(type,settle,{passive:true,signal:controller.signal});
 addEventListener('pageshow',event=>{if(event.persisted)settle()},{signal:controller.signal});
 hero.addEventListener('focusin',settle,{signal:controller.signal});
 document.addEventListener('motionchange',()=>{if(!canMove())settle()},{signal:controller.signal});
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>hero.classList.toggle('is-poles-visible',entries.some(e=>e.isIntersecting)),{threshold:0});
  observer.observe(hero);
  addEventListener('pagehide',()=>observer.disconnect(),{once:true});
  addEventListener('pageshow',event=>{if(event.persisted)observer.observe(hero)});
 }else hero.classList.add('is-poles-visible');
 if(!root.classList.contains('sr-hero-queued'))settle();
}
