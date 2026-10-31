/* One bounded scroll reader. Read all geometry before seeking any effect.
   Progress only moves forward: a finished sentence never rewinds on return. */
export function createScrollMotion(){
  const scenes=new Map(),depths=new Set();let frame=0;
  const update=()=>{
    frame=0;
    const samples=[...scenes].map(([node,scene])=>({node,scene,rect:node.getBoundingClientRect()}));
    const position=scrollY,viewport=innerHeight;
    for(const depth of depths){
      const progress=Math.max(0,Math.min(1,(viewport+position-depth.top)/(viewport+depth.height)));
      depth.layer.style.transform=`translate3d(0,${((progress*2-1)*depth.range).toFixed(3)}px,0)`;
    }
    for(const {node,scene,rect} of samples){
      const progress=Math.max(scene.progress,Math.min(1,Math.max(0,(innerHeight*.86-rect.top)/(innerHeight*.36))));
      scene.progress=progress;scene.effect.seek(progress);node.dataset.cmProgress=progress.toFixed(3);
      if(progress>=1||rect.bottom<0){scene.effect.cancel();scenes.delete(node);scene.finish();}
    }
  };
  const request=()=>{if(!frame&&(scenes.size||depths.size))frame=requestAnimationFrame(update);};
  addEventListener('scroll',request,{passive:true});
  const clear=()=>{cancelAnimationFrame(frame);frame=0;for(const scene of scenes.values()){scene.effect.cancel();scene.finish();}scenes.clear();};
  addEventListener('resize',clear,{passive:true});addEventListener('pagehide',clear);
  document.addEventListener('motionchange',clear);
  return{add(node,effect,finish){
    scenes.set(node,{effect,finish,progress:0});
    // Seek in this same task. Waiting for the next RAF made the first reading
    // look like autonomous playback even with no further scroll event.
    update();
  },addDepth(depth){
    depths.add(depth);
    const progress=Math.max(0,Math.min(1,(innerHeight+scrollY-depth.top)/(innerHeight+depth.height)));
    depth.layer.style.transform=`translate3d(0,${((progress*2-1)*depth.range).toFixed(3)}px,0)`;
    request();return()=>depths.delete(depth);
  },request,clear};
}


/* A shared root scroll timeline owns a dedicated inner plane. The fallback shares the
   text scroll reader above and uses cached layout offsets, never frame reads. */
import {canMove} from './core.js';
export function initDepthMotion(scroll){
 if(!('IntersectionObserver' in window))return;
 const compact=matchMedia('(max-width:700px)'),entries=[],visible=new Set();
 const native=typeof ScrollTimeline==='function'&&'rangeStart' in Animation.prototype;
 const timeline=native?new ScrollTimeline({source:document.scrollingElement,axis:'block'}):null;
 const modest=navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4;
 const limit=modest?2:6;
 let measureFrame=0,suspended=false;
 for(const frame of document.querySelectorAll('[data-depth]')){
  let layer=frame.querySelector(':scope>.depth-plane');
  if(!layer){
   const media=[...frame.children].filter(n=>n.matches('img,picture'));
   if(!media.length)continue;
   layer=document.createElement('div');layer.className='depth-plane';
   frame.insertBefore(layer,media[0]);layer.append(...media);
  }
  frame.classList.add('depth-frame');
  entries.push({frame,layer,range:0,top:0,height:0,effect:null,detach:null});
 }
 const stop=entry=>{
  if(!entry.effect&&!entry.detach&&entry.frame.dataset.depthState==='idle')return;
  entry.effect?.cancel();entry.effect=null;entry.detach?.();entry.detach=null;
  entry.layer.style.removeProperty('transform');entry.layer.style.removeProperty('will-change');entry.frame.dataset.depthState='idle';
 };
 const start=entry=>{
  if(entry.effect||entry.detach||!entry.range)return;
  // Promote only the visible, budgeted planes; release their backing on exit.
  entry.layer.style.willChange='transform';
  if(native){
   try{
    entry.effect=entry.layer.animate([
     {transform:`translate3d(0,${-entry.range}px,0)`},
     {transform:`translate3d(0,${entry.range}px,0)`}
    ],{duration:1,fill:'both',easing:'linear',timeline,rangeStart:`${entry.start}%`,rangeEnd:`${entry.end}%`});
    entry.effect.id='sr-depth-'+entry.frame.dataset.depth;
    entry.effect.finished.catch(()=>{});
   }catch{entry.detach=scroll.addDepth(entry);}
  }else entry.detach=scroll.addDepth(entry);
  entry.frame.dataset.depthState='active';
 };
 const reconcile=()=>{
  let budget=limit;
  for(const entry of entries){
   if(!suspended&&canMove()&&visible.has(entry.frame)&&budget-->0)start(entry);
   else stop(entry);
  }
 };
 const measure=()=>{
  measureFrame=0;
  const extent=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  const positions=entries.map(entry=>{
   let node=entry.frame,top=0;
   while(node){top+=node.offsetTop;node=node.offsetParent;}
   const height=entry.frame.offsetHeight;
   const intensity=entry.frame.dataset.depth==='hero'?24:entry.frame.dataset.depth==='print'?10:18;
   return {entry,top,height,start:(top-innerHeight)/extent*100,end:(top+height)/extent*100,range:Math.min(intensity,height*.045)*((compact.matches||modest)?0.6:1)};
  });
  for(const {entry,top,height,range,start,end} of positions){
   stop(entry);Object.assign(entry,{top,height,range,start,end});
   entry.frame.style.setProperty('--depth-bleed',`${Math.ceil(range)+2}px`);
  }
  reconcile();scroll.request();
 };
 const schedule=()=>{if(!measureFrame&&!suspended)measureFrame=requestAnimationFrame(measure)};
 const observer=new IntersectionObserver(records=>{
  for(const record of records)record.isIntersecting?visible.add(record.target):visible.delete(record.target);
  reconcile();
 },{rootMargin:'40px 0px',threshold:0});
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(schedule):null;
 const observe=()=>{entries.forEach(entry=>observer.observe(entry.frame));resize?.observe(document.body);schedule()};
 observe();document.fonts.ready.then(schedule);
 addEventListener('resize',schedule,{passive:true});
 document.addEventListener('motionchange',()=>{if(canMove())schedule();else entries.forEach(stop)});
 addEventListener('pagehide',()=>{suspended=true;cancelAnimationFrame(measureFrame);measureFrame=0;entries.forEach(stop);visible.clear();observer.disconnect();resize?.disconnect()});
 addEventListener('pageshow',event=>{if(event.persisted){suspended=false;observe()}});
}
