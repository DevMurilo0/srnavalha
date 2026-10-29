/* After the scissors and real-logo FLIP finish, typography and photographic
   apertures take the stage. The official logo is never a motion target. */
import {$,$$,canMove} from './core.js';
import {revealText} from './text-motion.js';
import {revealImage} from './image-motion.js';
export function initHeroExperience(){
 const hero=$('.hero'),root=document.documentElement;
 if(!hero){root.classList.remove('sr-hero-queued');return;}
 const controller=new AbortController(),effects=[],styles=[];
 let started=false;
 const settle=()=>{
  if(controller.signal.aborted)return;
  root.classList.remove('sr-hero-queued');hero.classList.remove('is-arriving');
  effects.forEach(effect=>effect.cancel());
  for(const {node,opacity,clipPath} of styles){node.style.opacity=opacity;node.style.clipPath=clipPath;}
  controller.abort();
 };
 const begin=()=>{
  if(started||controller.signal.aborted)return;
  if(!canMove()||scrollY>20||!root.classList.contains('sr-hero-queued'))return settle();
  started=true;hero.classList.add('is-arriving');
  // Everything is installed synchronously in openingend, before another paint.
  const tracks=[
   ['.hero-pole__object',0,'image','lateral'],
   ['.hero-wordmark>span',50,'text','micro'],
   ['h1',80,'text','hero'],
   ['.hero-intro',350,'text','focus'],
   ['.hero-facade',420,'image','lateral'],
   ['.hero-room',570,'image','aperture'],
   ['.hero-detail',680,'image','diagonal'],
   ['figure figcaption',900,'text','micro'],
   ['.hero-invitation>p',850,'text','lines'],
   ['.hero-invitation>.button',1050,'text','micro'],
   ['.hero-invitation>.text-link',1130,'text','micro'],
   ['.hero-bottom',1180,'text','micro']
  ];
  try{
   for(const [selector,delay,type,mode] of tracks)for(const node of $$(selector,hero)){
    if(!node.getClientRects().length)continue;
    styles.push({node,opacity:node.style.opacity,clipPath:node.style.clipPath});
    const effect=type==='image'?revealImage(node,mode,{delay}):revealText(node,mode,{delay});
    effects.push(effect);node.style.opacity='1';node.style.clipPath='none';
   }
   Promise.allSettled(effects.map(effect=>effect.finished)).then(settle);
  }catch{settle();}
 };
 document.addEventListener('openingend',event=>event.detail?.completed?begin():settle(),{once:true,signal:controller.signal});
 for(const type of ['wheel','touchstart','pointerdown','keydown','pagehide'])addEventListener(type,settle,{passive:true,signal:controller.signal});
 const width=innerWidth;
 addEventListener('resize',()=>{if(Math.abs(width-innerWidth)>2)settle();},{passive:true,signal:controller.signal});
 hero.addEventListener('focusin',settle,{signal:controller.signal});
 document.addEventListener('motionchange',()=>{if(!canMove())settle();},{signal:controller.signal});
 if('IntersectionObserver' in window){const pole=$('.hero-pole');if(pole)new IntersectionObserver(entries=>hero.classList.toggle('is-poles-visible',entries.some(e=>e.isIntersecting))).observe(pole);}
}
