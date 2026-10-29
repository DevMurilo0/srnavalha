/* Cinematic orchestrator: an entrance has one owner, one completion and a
   natural readable fallback. Split trees exist only while their ink moves. */
import {$,$$,canMove} from './core.js';
import {revealText} from './text-motion.js';
import {revealImage,initPhotoParallax} from './image-motion.js';
import {createScrollMotion} from './scroll-motion.js';
export function initMotion(){
 const root=document.documentElement;
 if(!('IntersectionObserver' in window))return;
 const copy='h2,h3,h4,p,blockquote,figcaption,address,small,li,span,strong,em,label,time,dt,dd,a,button,summary';
 const photos='.photo-window,.image-stage,.portal-images,.review-visual-frame,.footer-visual,img';
 const excluded='.hero,.sr-chapter,.sr-scene-join,dialog,[hidden],[inert],svg,.cm-run,.sr-surface,.engraving,.sr-member-preview';
 const registered=new WeakSet(),pending=new Set(),running=new Map();
 // Track a scene owner once. Scanning 300 bounding boxes on EVERY scroll
 // frame is the largest layout-read hotspot on slower notebooks.
 const sectionOwner=new WeakMap();
 const sections=$$('main section:not(.hero),footer');
 const scroll=createScrollMotion();let frame=0,entryFrame=0,observer;
 // Don't mount dozens of DOM-splitting animations inside one scroll event.
 // A bounded RAF queue spreads creation across frames, preserving input.
 const entering=new Set();
 const perFrame=matchMedia('(max-width:700px)').matches?5:9;
 const flushEntrances=()=>{
  entryFrame=0;
  if(!canMove()){entering.clear();return;}
  let budget=perFrame;
  for(const node of entering){
   entering.delete(node);
   if(!pending.has(node)||!node.isConnected)continue;
   const rect=node.getBoundingClientRect();
   if(rect.bottom<=0){clear(node);continue;}
   if(rect.top>=innerHeight){continue;}
   performEntrance(node);
   if(!--budget)break;
  }
  if(entering.size)entryFrame=requestAnimationFrame(flushEntrances);
 };
 const scheduleEntrances=()=>{
  if(!entryFrame&&entering.size)entryFrame=requestAnimationFrame(flushEntrances);
 };
 const clear=node=>{pending.delete(node);entering.delete(node);node.classList.remove('cm-pending');node.dataset.cmState='done';observer?.unobserve(node);};
 const finish=node=>{running.get(node)?.cancel();running.delete(node);clear(node);};
 const release=()=>{cancelAnimationFrame(entryFrame);entryFrame=0;entering.clear();scroll.clear();for(const node of [...pending,...running.keys()])finish(node);};
 const modeFor=node=>{
  if(node.matches('.house-quote,#work-title'))return'scroll';
  if(node.matches('.team-name,.portrait-name'))return'roll';
  if(node.matches('h2,.footer-oversize-lead,.footer-oversize-main')){
   return node.closest('#casa')?'fold':node.closest('#servicos')?'stroke':node.closest('#equipe')?'roll':node.closest('#produtos')?'focus':node.closest('#avaliacoes')?'lines':node.closest('#localizacao')?'fold':'echo';
  }
  if(node.matches('.footer-feature-cta'))return'echo';
  // Uncommon editorial "physical type": a stamped invitation, sheared
  // testimony, condensed negative-space intro, and closing shutter imprint.
  // Each is ONE animation on the entire phrase, not one per glyph.
  if(node.matches('.team-invite p'))return'inkpress';
  if(node.matches('.review blockquote'))return'blade';
  if(node.matches('.section-heading > p'))return'negative';
  if(node.matches('.footer-small-note'))return'shutter';
  if(node.matches('blockquote'))return'lines';
  // Ordinary copy is still animated, but as a SINGLE composited layer,
  // not by rebuilding every word and running blur/clip-path on each glyph.
  // Reserve the costly editorial splits for major titles and selected quotes.
  if(node.matches('.product-info h3,.catalog-heading h3'))return'focus';
  return'micro';
 };
 const performEntrance=node=>{
  if(!pending.has(node))return;
  observer.unobserve(node);pending.delete(node);
  if(!canMove()){clear(node);return;}
  node.classList.remove('cm-pending');node.dataset.cmState='running';
  const photo=node.dataset.cmKind==='image',mode=node.dataset.cmMode;
  const effect=photo?revealImage(node,mode):revealText(node,mode,{manual:mode==='scroll'});
  running.set(node,effect);
  if(mode==='scroll')scroll.add(node,effect,()=>{running.delete(node);clear(node);});
  effect.finished.then(()=>{if(running.get(node)===effect){running.delete(node);clear(node);}});
 };
 const appear=node=>{
  if(!pending.has(node))return;
  // Scroll-linked headlines must start in their own intersection callback:
  // waiting behind 40 catalog labels misses the first scroll position.
  if(node.dataset.cmMode==='scroll'){
    entering.delete(node);
    performEntrance(node);
    return;
  }
  entering.add(node);scheduleEntrances();
 };
 observer=new IntersectionObserver(entries=>{
  for(const e of entries){
   if(e.isIntersecting)appear(e.target);
   else if(running.has(e.target))finish(e.target);
  }
 },{rootMargin:'0px 0px -5% 0px',threshold:0});
 const enroll=scope=>{
  const nodes=[...(scope.matches?.(`${copy},${photos}`)?[scope]:[]),...scope.querySelectorAll(`${copy},${photos}`)];
  for(const node of nodes){
   if(registered.has(node)||node.closest(excluded)||!node.closest('main section:not(.hero),footer'))continue;
   if(!node.getClientRects().length)continue;
   const photo=node.matches(photos);
   if(photo){
    if(node.parentElement.closest(photos)||node.matches('img')&&(node.width<24||node.src.endsWith('.svg')))continue;
   }else{
    if(!node.textContent.trim()||node.closest('[aria-hidden="true"]'))continue;
    const textParent=node.parentElement.closest(copy);
    if(textParent&&!textParent.querySelector(photos))continue;
    if(node.matches('a,button')&&node.querySelector(photos))continue;
   }
   registered.add(node);
   sectionOwner.set(node,node.closest('main section:not(.hero)')||node.closest('footer'));
   node.dataset.cmKind=photo?'image':'text';
   node.dataset.cmMode=photo?(node.closest('#casa,#localizacao')?'lateral':node.closest('#equipe,#produtos')?'aperture':node.closest('#trabalhos')?'diagonal':'shutter'):modeFor(node);
   const rect=node.getBoundingClientRect();
   // Do not hide a scene the reader has already reached (late JS / deep link).
   if(!canMove()||rect.top<innerHeight*.94){clear(node);continue;}
   node.dataset.cmState='pending';node.classList.add('cm-pending');pending.add(node);observer.observe(node);
  }
 };
 const scan=()=>{$$('main section:not(.hero),footer').forEach(enroll);};
 // Font metrics are final before line and grapheme measurements.
 document.fonts.ready.then(()=>{scan();root.classList.add('sr-motion-initialized');});
 const mutations=new MutationObserver(records=>{
  for(const record of records){
   if(record.target.closest?.('.cm-split,.cm-run'))continue;
   if(record.type==='attributes')enroll(record.target);
   else for(const node of record.addedNodes)if(node.nodeType===1)enroll(node);
  }
 });
 for(const scope of [$('main'),$('footer')])if(scope)mutations.observe(scope,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','open']});
 const recover=()=>{
  frame=0;if(!canMove())return release();
  // Read the ~8 section boxes first, then ONLY geometry belonging to a
  // section near the viewport. Observer still handles every entry normally.
  const live=new Set(),passed=new Set();
  for(const section of sections){
   const box=section.getBoundingClientRect();
   if(box.bottom<=0)passed.add(section);
   else if(box.top<innerHeight&&box.bottom>0)live.add(section);
  }
  for(const node of pending){
   if(!node.isConnected){clear(node);continue;}
   const owner=sectionOwner.get(node);
   if(passed.has(owner)){clear(node);continue;}
   if(!live.has(owner))continue;
   const rect=node.getBoundingClientRect();
   if(rect.bottom<=0)clear(node);
   else if(rect.top<innerHeight*.95)appear(node);
  }
  for(const node of running.keys()){
   const owner=sectionOwner.get(node);
   if(passed.has(owner))finish(node);
   else if(live.has(owner)){
    const r=node.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight)finish(node);
   }
  }
 };
 addEventListener('scroll',()=>{if(!frame&&(pending.size||running.size))frame=requestAnimationFrame(recover);},{passive:true});
 addEventListener('resize',()=>{for(const node of running.keys())finish(node);if(!frame)frame=requestAnimationFrame(recover);},{passive:true});
 const interactive=event=>{
  const section=event.target.closest?.('section,footer');if(!section)return;
  // Focus / selection always wins over decoration, including nested controls.
  for(const node of [...pending,...running.keys()])if(node.contains(event.target)||event.type==='pointerdown'&&node.closest('.living-mirror,.professional-panel,.product-editorial')===event.target.closest('.living-mirror,.professional-panel,.product-editorial')&&event.target.closest('.living-mirror,.professional-panel,.product-editorial'))finish(node);
 };
 document.addEventListener('photowillchange',event=>{for(const node of [...pending,...running.keys()])if(node.contains(event.target))finish(node);});
 document.addEventListener('focusin',interactive);
 document.addEventListener('pointerdown',interactive,{passive:true});
 document.addEventListener('motionchange',()=>{if(!canMove())release();});
 addEventListener('pagehide',()=>{release();mutations.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(entryFrame);},{once:true});
 // Back/forward restoration shows the settled page and does not rebuild layers.
 addEventListener('pageshow',event=>{if(event.persisted)release();});
 initPhotoParallax();
 const nav=$$('.desktop-nav a');
 const navObserver=new IntersectionObserver(entries=>{
  const entry=entries.find(e=>e.isIntersecting);if(!entry)return;
  nav.forEach(a=>a.hash===`#${entry.target.id}`?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
 },{rootMargin:'-10% 0px -65%'});
 $$('main section[id]').forEach(el=>navObserver.observe(el));
}
