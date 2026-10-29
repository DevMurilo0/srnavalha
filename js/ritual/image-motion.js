/* Photographic motion stays inside the original frame. Album FLIP, portrait
   swaps and hero placement remain separate owners of their own surfaces. */
import { animate, canMove } from './core.js';
export function revealImage(node, mode='shutter', {delay=0}={}){
  const effects=[];let done=false,resolve;
  const lowPower=matchMedia('(max-width:700px)').matches||
    (navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4)||
    navigator.connection?.saveData===true;
  const finished=new Promise(r=>resolve=r);
  const cancel=()=>{if(done)return;done=true;effects.forEach(a=>a.cancel());resolve();};
  if(!canMove()){cancel();return{finished,cancel};}
  const mask=mode==='aperture'?'inset(42% 15% 42% 15%)':mode==='lateral'?'inset(0 100% 0 0)':mode==='diagonal'?'polygon(0 0,0 0,0 100%,0 100%)':'inset(0 0 100% 0)';
  const final=mode==='diagonal'?'polygon(0 0,100% 0,100% 100%,0 100%)':'inset(0 0 0 0)';
  try{
    const effect=animate(node,[{clipPath:mask,opacity:.6},{clipPath:final,opacity:1}],{duration:mode==='aperture'?1100:950,delay,easing:'cubic-bezier(.76,0,.24,1)',fill:'both',persist:true});
    if(effect){effect.id=`sr-photo-${mode}`;effects.push(effect);}
    // Existing review scene loops and interactive swaps retain their transforms.
    const image=node.matches('img')?null:node.querySelector('img:not(.review-scene)');
    // Scaling every image while its parent is clipped is costly on integrated
    // GPUs. Retain the detailed crop only on desktop feature photographs.
    const featured=node.closest('.hero,.product-hero,.team-portrait,.house-portal');
    if(image&&!lowPower&&featured){
      const zoom=animate(image,[{scale:1.08},{scale:1}],{
        duration:1050,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'both',persist:true
      });
      if(zoom){zoom.id='sr-photo-crop';effects.push(zoom);}
    }
    Promise.allSettled(effects.map(e=>e.finished)).then(cancel);
  }catch{cancel();}
  return{finished,cancel};
}

export function initPhotoParallax(){
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  // On older hardware this continuous pointer effect competes with scroll.
  if((navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4)||
      navigator.connection?.saveData)return;
  let current=null,frame=0,x=0,y=0;
  const clear=()=>{cancelAnimationFrame(frame);frame=0;if(current){current.style.removeProperty('translate');current=null;}};
  document.querySelectorAll('.gallery-shot').forEach(link=>{
    link.addEventListener('pointermove',event=>{
      if(!fine.matches||!canMove()||link.closest('.cm-pending'))return;
      const image=link.querySelector('img');if(!image||image.getAnimations().length)return;
      const box=link.getBoundingClientRect();current=image;
      x=(event.clientX-box.left)/box.width*6-3;y=(event.clientY-box.top)/box.height*6-3;
      if(!frame)frame=requestAnimationFrame(()=>{frame=0;if(current)current.style.translate=`${x.toFixed(2)}px ${y.toFixed(2)}px`;});
    });
    link.addEventListener('pointerleave',clear);link.addEventListener('pointerdown',clear);
  });
  addEventListener('scroll',clear,{passive:true});addEventListener('pagehide',clear);
  document.addEventListener('motionchange',clear);fine.addEventListener('change',clear);
}
