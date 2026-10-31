/* Cinematic orchestrator: an entrance has one owner, one completion and a
   natural readable fallback. Split trees exist only while their ink moves. */
import {$,$$,canMove} from './core.js';
import {revealText} from './text-motion.js';
import {revealImage} from './image-motion.js';
import {createScrollMotion,initDepthMotion} from './scroll-motion.js';
export function initMotion(){
 const root=document.documentElement;
 if(!('IntersectionObserver' in window))return;
 const grouped='.service-entry,.product-option';
 const copy='h2,h3,h4,p,blockquote,figcaption,address,small,li,span,strong,em,label,time,dt,dd,a,button,summary,.footer-small-note,'+grouped;
 const photos='.depth-frame,.photo-window,.image-stage,.portal-images,.review-visual-frame,.footer-visual,img';
 const excluded='.hero,.sr-chapter,.sr-scene-join,dialog,[hidden],[inert],svg,.cm-run,.cm-kinetic-ghost,.depth-plane,.sr-surface,.engraving,.sr-member-preview';
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
  for(const node of [...entering].sort((a,b)=>Number(b.matches('h2'))-Number(a.matches('h2')))){
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
  if(node.matches('.house-quote'))return'scroll';
  if(node.matches('.team-name,.portrait-name'))return'roll';
  if(node.matches('h2,.footer-oversize-lead,.footer-oversize-main')){
   return node.closest('#casa')?'fold':node.closest('#servicos')?'stroke':node.closest('#equipe')?'roll':node.closest('#produtos')?'focus':node.closest('#avaliacoes')?'lines':node.closest('#localizacao,#trabalhos')?'fold':'echo';
  }
  if(node.matches('.footer-feature-cta'))return'echo';
  // Uncommon editorial "physical type": a stamped invitation, sheared
  // testimony, condensed negative-space intro, and closing shutter imprint.
  // Each is ONE animation on the entire phrase, not one per glyph.
  if(node.matches('.team-invite p'))return'inkpress';
  if(node.matches('.review blockquote'))return'blade';
  if(node.matches('.section-heading > p'))return'negative';
  if(node.matches('.footer-small-note'))return'shutter';
  // Copy also carries different rhythms, but NEVER a split tree. These are
  // single-element compositor gestures, timed for reading rather than spectacle.
  if(node.matches('.house-copy>p:not(.house-quote)'))return'slipstream';
  if(node.matches('.product-info>p,.visit-info>p'))return'looseink';
  if(node.matches('.footer-story-copy>p'))return'breath';
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
  // A modest initial pause lets each section settle into view before
  // its title begins. Preserve scroll-driven headline timing (manual seek).
  const entranceDelay=mode==='scroll'?0:
    node.matches('h2')?80:
    node.matches('.section-heading>p')?115:0;
  const effect=photo?revealImage(node,mode):
    revealText(node,mode,{delay:entranceDelay,manual:mode==='scroll'});
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
   // Product/service catalogs have one motion per ROW, not 3-5 competing
   // animations for name, category, price and the link inside that row.
   if(node.closest(grouped)&&!node.matches(grouped))continue;
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
   // An authored gesture per section, not an identical scroll fade. Keep
   // the work-title's existing position-driven animation independent.
   if(!photo&&node.matches('h2,.footer-oversize-lead,.footer-oversize-main')){
     const area=node.closest('section,footer');
     const sign={
       casa:'inktrail',servicos:'crosscurrent',equipe:'pendulum',
       trabalhos:'shards',produtos:'accordion',avaliacoes:'ghostprint',
       localizacao:'mirrorfold',contato:'inktrail'
     };
     node.dataset.cmSignature=sign[area?.id]||'ghostprint';
   }
   node.dataset.cmMode=photo?(node.closest('#casa,#localizacao')?'lateral':node.closest('#equipe,#produtos')?'aperture':node.closest('#trabalhos')?'diagonal':'shutter'):modeFor(node);
   const rect=node.getBoundingClientRect();
   // Do not hide a scene the reader has already reached (late JS / deep link).
   if(!canMove()||(rect.top<innerHeight*.94&&!node.matches('h2'))){clear(node);continue;}
   node.dataset.cmState='pending';node.classList.add('cm-pending');pending.add(node);observer.observe(node);
  }
 };
 // Prepare only the next screen or two, not every phrase in the entire
 // document during the cinematic intro. Deep-link landings remain visible.
 const prepareSections=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){
   prepareSections.unobserve(entry.target);
   enroll(entry.target);
  }
 },{rootMargin:'850px 0px 850px 0px',threshold:0});
 // Font metrics are stable before the rare hero/special heading measurements.
 const primeSections=()=>{
  // Important display headings cost ~8 observers, not 300. They must be
  // parked before an anchor jump so a title never flashes into existence
  // without its own authored entrance (notably #servicos / #trabalhos).
  for(const section of sections){
   const heading=section.querySelector('h2');
   if(heading)enroll(heading);
   prepareSections.observe(section);
  }
  root.classList.add('sr-motion-initialized');
 };
 document.fonts.ready.then(primeSections).catch(primeSections);
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
 addEventListener('pagehide',()=>{release();mutations.disconnect();prepareSections.disconnect();cancelAnimationFrame(frame);cancelAnimationFrame(entryFrame);},{once:true});
 // Back/forward restoration shows the settled page and does not rebuild layers.
 addEventListener('pageshow',event=>{if(event.persisted)release();});
 initDepthMotion(scroll);
 const nav=$$('.desktop-nav a'),compass=$('.chapter-compass');
 const chapters=$$('main section[id],footer[id]');
 const names={inicio:'APRESENTAÇÃO',casa:'A CASA',servicos:'SERVIÇOS',equipe:'NOSSA EQUIPE',trabalhos:'O TRABALHO',produtos:'PRODUTOS',avaliacoes:'AVALIAÇÕES',localizacao:'NO PRADO',contato:'ATÉ LOGO'};
 const orient=section=>{
  const index=chapters.indexOf(section),id=section.id;
  nav.forEach(a=>a.hash===`#${id}`?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
  if(!compass)return;
  compass.hidden=index===0||id==='contato';
  const current=$('.chapter-compass__current',compass),prev=$('.chapter-compass__prev',compass),next=$('.chapter-compass__next',compass);
  current.href=`#${id}`;$('span',current).textContent=names[id];
  for(const [link,destination] of [[prev,chapters[Math.max(0,index-1)]],[next,chapters[Math.min(chapters.length-1,index+1)]]]){
   link.href=`#${destination.id}`;link.setAttribute('aria-label',`Ir para ${names[destination.id].toLowerCase()}`);
  }
 };
 const navObserver=new IntersectionObserver(entries=>{
  const entry=entries.filter(e=>e.isIntersecting).at(-1);if(entry)orient(entry.target);
 },{rootMargin:'-10% 0px -65%'});
 chapters.forEach(el=>navObserver.observe(el));
}
