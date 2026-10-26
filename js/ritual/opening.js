/* O Reflexo do Ritual. Two layout snapshots; the real photo and official mark
   travel as single DOM nodes. No duplicate photograph, scroll lock or frame loop. */
import { $, animate, canMove, cancelWithin } from './core.js';

export async function openRitual() {
 const root=document.documentElement,stage=$('#sr-loader-stage');
 const abort=new AbortController(),flights=[];
 let settled=false,deadline;
 const hero=$('.hero');
 function finish(){
  if(settled)return;
  settled=true;clearTimeout(deadline);abort.abort();
  const focused=stage?.contains(document.activeElement);
  if(stage)cancelWithin(stage);
  if(hero)cancelWithin(hero);
  for(const {node,slot} of flights)slot.replaceWith(node);
  root.classList.remove('sr-loader-boot');
  stage?.remove();delete window.__finishRitual;
  if(focused)$('.hero .button')?.focus({preventScroll:true});
  document.dispatchEvent(new CustomEvent('openingend'));
 }
 window.__finishRitual=finish;
 if(!stage||!root.classList.contains('sr-loader-boot')||!canMove()||scrollY>20||
    (location.hash&&location.hash!=='#inicio')){finish();return}
 deadline=setTimeout(finish,1600);
 for(const type of ['wheel','touchstart','pointerdown','keydown','scroll','resize','pagehide'])
  addEventListener(type,finish,{once:true,passive:true,signal:abort.signal});
 document.addEventListener('motionchange',()=>{if(!canMove())finish()},{signal:abort.signal});
 $('#sr-opening-skip',stage)?.addEventListener('click',finish,{signal:abort.signal});
 try{
  const photo=$('.hero-room .photo-window'),mark=$('.hero-wordmark'),img=$('img',photo);
  if(!photo||!mark||!img||!photo.animate){finish();return}
  // An essential asset may take at most 450ms here. Slow/offline visits get content.
  let readyTimer;
  const ready=await Promise.race([
   Promise.all([img.decode(),document.fonts.ready]).then(()=>true,()=>false),
   new Promise(resolve=>{readyTimer=setTimeout(()=>resolve(false),450)})
  ]);clearTimeout(readyTimer);
  if(settled||!ready){finish();return}
  // Read final geometry together, before any DOM writes. No per-frame geometry.
  const nodes=[photo,mark],rects=nodes.map(node=>node.getBoundingClientRect());
  if(rects.some(r=>!r.width||!r.height)){finish();return}
  const view=visualViewport,viewWidth=view?.width||innerWidth,viewHeight=view?.height||innerHeight;
  const photoWidth=Math.min(viewWidth*.36,184),markWidth=Math.min(viewWidth*.57,238);
  const starts=[{width:photoWidth,top:viewHeight*.36},{width:markWidth,top:viewHeight*.12}];
  const journeys=nodes.map((node,i)=>{
   const rect=rects[i],start=starts[i],scale=start.width/rect.width;
   const slot=node.cloneNode(false);slot.removeAttribute('id');slot.setAttribute('aria-hidden','true');
   slot.style.height=`${rect.height}px`;
   node.replaceWith(slot);
   const flight=document.createElement('div');flight.className=`sr-reflection-flight sr-reflection-flight--${i?'mark':'photo'}`;
   Object.assign(flight.style,{left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`});
   flight.append(node);stage.append(flight);flights.push({node,slot});
   return animate(flight,[{transform:`translate(${(viewWidth-start.width)/2-rect.left}px,${start.top-rect.top}px) scale(${scale})`},{transform:'none'}],
    {duration:940,delay:60,easing:'cubic-bezier(.65,0,.2,1)',fill:'both',persist:true});
  });
  animate($('.sr-opening__ground',stage),[{opacity:1},{opacity:0}],{duration:670,delay:260,fill:'both',persist:true});
  animate($('.sr-opening__caption',stage),[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-8px)'}],{duration:250,delay:170,fill:'both',persist:true});
  for(const [i,el] of [...hero.querySelectorAll('h1,.hero-intro,.hero-facade,.hero-invitation,.hero-bottom')].entries())
   animate(el,[{opacity:0,translate:'0 14px'},{opacity:1,translate:'0 0'}],{duration:520,delay:300+Math.min(i*45,150)});
  await Promise.allSettled(journeys.map(a=>a?.finished));
 }catch(error){console.warn('Reflexo: conteúdo liberado.',error)}finally{finish()}
}
