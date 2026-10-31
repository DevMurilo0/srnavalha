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
  const tracks=hero.classList.contains('hero--cinema')?[
   ['.hero-wordmark>span',0,'text','micro'],
   ['.hero-topline',130,'text','micro'],
   ['h1',300,'text','hero'],
   ['.hero-intro',620,'text','focus'],
   ['.hero-invitation>.button',840,'text','micro'],
   ['.hero-invitation>.text-link',940,'text','micro']
  ]:[
   ['.hero-pole__object',0,'image','lateral'],
   ['.hero-wordmark>span',85,'text','micro'],
   ['h1',210,'text','hero'],
   ['.hero-intro',485,'text','focus'],
   ['.hero-facade',570,'image','lateral'],
   ['.hero-room',690,'image','aperture'],
   ['.hero-detail',810,'image','diagonal'],
   ['figure figcaption',1000,'text','micro'],
   ['.hero-invitation>p',970,'text','lines'],
   ['.hero-invitation>.button',1190,'text','micro'],
   ['.hero-invitation>.text-link',1240,'text','micro']
  ];
  try{
   if(hero.classList.contains('hero--cinema')){
    const curtain=$('.hero-cinema__curtain',hero);
    if(curtain){
     const a=curtain.animate([
      {transform:'translate3d(0,0,0)'},
      {transform:'translate3d(104%,0,0)'}
     ],{duration:1220,delay:40,easing:'cubic-bezier(.76,0,.22,1)',fill:'both'});
     a.id='sr-hero-curtain';
     effects.push(a);
    }
    const decorated=[
     ['.hero-bottom',1090],['.hero-cinema__masthead-tag',185]
    ];
    const slit=$('.hero-cinema__light-slit',hero);
    if(slit){
     const effect=slit.animate([
      {opacity:0,transform:'translate3d(-3%,0,0)'},
      {offset:.16,opacity:.88},
      {offset:.76,opacity:.48},
      {opacity:0,transform:'translate3d(100vw,0,0)'}
     ],{duration:1180,delay:140,easing:'cubic-bezier(.62,.08,.22,1)',fill:'both'});
     effect.id='sr-hero-light-slit';
     effects.push(effect);
    }
    for(const [selector,delay] of decorated){
     const node=$(selector,hero);
     if(!node)continue;
     styles.push({node,opacity:node.style.opacity,clipPath:node.style.clipPath});
     const a=node.animate([
      {opacity:0,transform:'translate3d(0,22px,0)'},
      {opacity:1,transform:'translate3d(0,0,0)'}
     ],{duration:690,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
     a.id='sr-hero-detail';
     effects.push(a);
    }
   }
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
 if('IntersectionObserver' in window){
  // Observe the hero rather than a 25px ornament: responsive clipping of a
  // tiny pole must never make both striped cylinders stop unexpectedly.
  const observer=new IntersectionObserver(entries=>{
   hero.classList.toggle('is-poles-visible',entries.some(e=>e.isIntersecting));
  },{threshold:0});
  observer.observe(hero);
 }else hero.classList.add('is-poles-visible');
}
