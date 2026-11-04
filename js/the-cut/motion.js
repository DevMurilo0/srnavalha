/* Native editorial motion. HTML owns pending; each entrance owns one lifetime. */
const one=(q,root=document)=>root.querySelector(q);
const all=(q,root=document)=>[...root.querySelectorAll(q)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const eased='cubic-bezier(.22,1,.36,1)';
const canAnimate=()=>!reduced.matches&&!window.__motionReleased&&typeof Element.prototype.animate==='function';
const active=new Map();
const cleanups=new Set();
const bounded=(promise,ms=1200)=>new Promise(resolve=>{
 const timer=setTimeout(()=>resolve(false),ms);
 Promise.resolve(promise).then(()=>{clearTimeout(timer);resolve(true)},()=>{clearTimeout(timer);resolve(false)});
});
// Share one font deadline across the page; a late section must not wait again.
const typographyReady=bounded(document.fonts.ready);
const assetsReady=node=>bounded(Promise.all(all('img',node).concat(node.matches('img')?[node]:[]).map(img=>img.decode())));
function done(node){
 node.dataset.reveal='done';node.dataset.motionDone='1';node.classList.add('motion-finished');
 active.get(node)?.();active.delete(node);
}
function release(){
 cleanups.forEach(fn=>fn());cleanups.clear();
 all('[data-reveal]').forEach(done);
}
function animate(node,frames,options={}){
 if(!canAnimate()||node.dataset.reveal==='done'){done(node);return Promise.resolve()}
 const effect=node.animate(frames,{duration:700,delay:100,easing:eased,fill:'both',...options});
 node.dataset.reveal='playing';
 const cancel=()=>effect.cancel();active.set(node,cancel);
 return bounded(effect.finished,(options.duration||700)+(options.delay||100)+500).then(()=>done(node));
}
function observe(nodes,play){
 const waiting=new Set(nodes.filter(n=>n.dataset.reveal==='pending'));
 const start=node=>{if(!waiting.delete(node))return;io.unobserve(node);Promise.resolve(play(node)).catch(()=>done(node));};
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)start(e.target)}),{threshold:0,rootMargin:'0px 0px -5% 0px'});
 waiting.forEach(n=>io.observe(n));
 // Independent recovery for a missed observation, including anchor/fast scroll.
 const check=()=>{for(const n of waiting){const r=n.getBoundingClientRect();if(r.width&&r.height&&r.top<innerHeight*.95&&r.bottom>0)start(n)}};
 const timer=setInterval(()=>{if(!waiting.size){clearInterval(timer);io.disconnect();return}check()},900);
 const cleanup=()=>{clearInterval(timer);io.disconnect()};cleanups.add(cleanup);
 check();
}
async function opening(){
 const root=document.documentElement,intro=one('#cut-intro'),target=one('.razor-stage .razor');
 if(!intro||!target||!root.classList.contains('opening-active')||!canAnimate()){
  intro?.remove();root.classList.remove('opening-active');return;
 }
 let ended=false,resolveEnd;
 const endedPromise=new Promise(resolve=>resolveEnd=resolve);
 const parent=target.parentNode,next=target.nextSibling;
 const effects=[],timers=[];
 let placeholder=null;
 const finish=()=>{
  if(ended)return;ended=true;
  // Restore THE SAME element to its actual hero slot. No duplicate image or
  // replacement frame means the last flight pose and first hero pose agree.
  parent.insertBefore(target,next);
  placeholder?.remove();
  target.classList.remove('razor-flight');target.removeAttribute('style');
  root.classList.remove('opening-active');intro.remove();
  effects.forEach(effect=>effect.cancel());
  timers.forEach(clearTimeout);
  removeEventListener('resize',finish);removeEventListener('scroll',finish);
  document.removeEventListener('visibilitychange',visibility);
  document.removeEventListener('motionrelease',finish);
  clearTimeout(watchdog);
  resolveEnd();
 };
 const visibility=()=>{if(document.hidden)finish()};
 const watchdog=setTimeout(finish,5700);
 addEventListener('resize',finish,{once:true});
 addEventListener('scroll',finish,{once:true,passive:true});
 document.addEventListener('visibilitychange',visibility);
 document.addEventListener('motionrelease',finish);
 const later=(fn,ms)=>timers.push(setTimeout(()=>{if(!ended)fn()},ms));
 const run=(node,frames,options)=>{
  if(!node)return null;
  const effect=node.animate(frames,{fill:'both',easing:eased,...options});
  effects.push(effect);return effect;
 };
 const identity=one('.cut-intro__identity',intro);
 const status=one('.cut-intro__status',intro);
 const edition=one('.cut-intro__edition',intro);
 run(identity,[{opacity:0,translate:'0 13px'},{opacity:1,translate:'0 0'}],
  {duration:460,easing:'cubic-bezier(.22,1,.36,1)'});
 run(status,[{opacity:0},{opacity:1}],{duration:340,delay:170});
 run(edition,[{opacity:0},{opacity:.9}],{duration:340,delay:210});
 const progress=one('.cut-intro__progress-fill',intro);
 run(progress,[{width:'0%'},{width:'66%'}],{duration:640,easing:'cubic-bezier(.25,.1,.25,1)'});
 await bounded(Promise.all([document.fonts.ready,target.decode(),one('.hero-background img')?.decode?.()]),1100);
 if(ended)return endedPromise;
 if(!target.naturalWidth){finish();return endedPromise}
 // The progress bar never claims an invented percentage. Its final phase
 // starts only after the assets are ready (or their bounded deadline).
 run(progress,[{width:'66%'},{width:'100%'}],{duration:330,easing:'cubic-bezier(.22,1,.36,1)'});
 await new Promise(resolve=>setTimeout(resolve,160));
 if(ended)return endedPromise;
 const rect=target.getBoundingClientRect();
 if(rect.width<=0||rect.height<=0){finish();return endedPromise}
 placeholder=document.createElement('span');
 placeholder.style.cssText=`display:block;width:100%;aspect-ratio:${rect.width}/${rect.height}`;
 parent.insertBefore(placeholder,target);
 const filter=getComputedStyle(target).filter;
 document.body.append(target);target.classList.add('razor-flight');
 target.style.cssText=`left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;filter:${filter}`;
 const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
 const w=innerWidth,h=innerHeight;
 const mobile=w<701;
 const maxSize=mobile?Math.min(w*.76,340):Math.min(w*.51,660);
 const scale=Math.max(.8,maxSize/rect.width);
 // Constant transform-function ordering prevents the familiar last-frame jump.
 // Perspective + Y/X tilt sells depth using the actual barbershop razor artwork;
 // animation stays on the compositor with no WebGL dependency.
 const pose=(x,y,angle,yaw,tilt,size)=>
  `translate3d(${(x-cx).toFixed(2)}px,${(y-cy).toFixed(2)}px,0px) perspective(960px) rotateZ(${angle}deg) rotateY(${yaw}deg) rotateX(${tilt}deg) scale(${size.toFixed(4)})`;
 const frames=[
  {offset:0,transform:pose(-.13*w,.66*h,-64,-58,-12,scale*.84),opacity:0},
  {offset:.12,transform:pose(.12*w,.63*h,-29,-32,-11,scale),opacity:1},
  {offset:.37,transform:pose(.41*w,.57*h,-13,-9,-4,scale*1.08),opacity:1},
  {offset:.58,transform:pose(.74*w,.52*h,-8,18,0,scale*1.03),opacity:1},
  {offset:.71,transform:pose(1.05*w,.48*h,5,43,7,scale*.91),opacity:1},
  {offset:.85,transform:pose(Math.min(.90*w,cx+w*.15),Math.min(.64*h,cy+h*.02),18,-27,-5,scale*.94),opacity:1},
  {offset:1,transform:pose(cx,cy,0,0,0,1),opacity:1}
 ];
 const flight=run(target,frames,{duration:2520,easing:'cubic-bezier(.37,.06,.16,1)'});
 // The blade scores the panel. Its light passes once, then the two cut
 // surfaces pull apart as the SAME razor curves down into the hero.
 const seam=one('.cut-intro__seam',intro);
 run(one('.cut-intro__glint',intro),[
  {opacity:0,transform:'translate3d(-25%,0,0)'},
  {offset:.18,opacity:1},
  {offset:.78,opacity:1},
  {opacity:0,transform:'translate3d(570%,0,0)'}
 ],{duration:880,delay:320,easing:'cubic-bezier(.25,.04,.49,.97)'});
 run(one('.cut-intro__spark',intro),[
  {opacity:0,transform:'translate3d(-60px,-45px,0) scale(.35)'},
  {offset:.23,opacity:.86,transform:'translate3d(18vw,-49px,0) scale(.87)'},
  {offset:.70,opacity:.66},
  {opacity:0,transform:'translate3d(97vw,-55px,0) scale(.3)'}
 ],{duration:930,delay:370,easing:'cubic-bezier(.31,.08,.31,1)'});
 const peel={duration:1270,delay:940,easing:'cubic-bezier(.66,.04,.18,1)'};
 run(one('.cut-intro__upper',intro),[
  {transform:'translate3d(0,0,0)'},
  {offset:.4,transform:'translate3d(0,-38%,0)'},
  {transform:'translate3d(0,-110%,0)'}
 ],peel);
 run(one('.cut-intro__lower',intro),[
  {transform:'translate3d(0,0,0)'},
  {offset:.4,transform:'translate3d(0,38%,0)'},
  {transform:'translate3d(0,110%,0)'}
 ],peel);
 run(seam,[{opacity:1},{opacity:0}],{duration:370,delay:1050,easing:eased});
 [identity,status,edition].forEach((node,i)=>run(node,[{opacity:1},{opacity:0}],
  {duration:400,delay:780+i*60,easing:'cubic-bezier(.48,0,.6,1)'}));
 // Reveal the hero wordmark while the cut opens, not after the page is clear.
 later(()=>document.dispatchEvent(new Event('cutintroreveal')),1180);
 await flight.finished.catch(()=>{});
 finish();return endedPromise;
}

function headings(ready){
 const nodes=all('[data-type][data-reveal]');
 const styles={inicio:'monolith',casa:'pendulum',servicos:'inktrail',equipe:'inktrail',trabalhos:'shards',produtos:'ghostprint',agendamento:'accordion',localizacao:'mirrorfold'};
 const frames=(kind,index,total)=>{
  const dir=index%2===0?1:-1;
  const edge=Math.abs(index-(total-1)/2)/Math.max(1,(total-1)/2);
  const last={opacity:1,transform:'translate3d(0,0,0) rotate(0deg) scale(1)'};
  switch(kind){
   case 'monolith':return [
    {opacity:0,transform:'perspective(680px) translate3d('+(dir*(13+edge*19))+'px,'+(23+edge*11)+'px,0) rotateY('+(dir*55)+'deg) rotateZ('+(dir*8)+'deg) scale(.85)'},
    {offset:.72,opacity:1,transform:'perspective(680px) translate3d(0,-3px,0) rotateY(3deg) scale(1.02)'},last];
   case 'pendulum':return [
    {opacity:0,transform:'perspective(620px) translate3d('+(dir*-8)+'px,26px,0) rotateX(-67deg) rotateZ('+(dir*7)+'deg)'},
    {offset:.74,opacity:1,transform:'perspective(620px) translate3d(0,-2px,0) rotateX(4deg)'},last];
   case 'mirrorfold':return [
    {opacity:0,transform:'perspective(700px) translate3d('+(dir*14)+'px,15px,0) rotateY('+(dir*73)+'deg)'},
    {offset:.74,opacity:1,transform:'perspective(700px) translate3d(0,-2px,0) rotateY('+(dir*-5)+'deg)'},last];
   case 'ghostprint':return [
    {opacity:0,transform:'translate3d('+(dir*19)+'px,'+(-26*edge)+'px,0) rotate('+(dir*9)+'deg) scale(.88)'},
    {offset:.74,opacity:1,transform:'translate3d(0,2px,0) rotate(0deg) scale(1.025)'},last];
   case 'shards':return [
    {opacity:0,transform:'translate3d('+(dir*29)+'px,'+(dir*23)+'px,0) skewX('+(dir*13)+'deg) rotate('+(dir*-6)+'deg)'},
    {offset:.75,opacity:1,transform:'translate3d(0,-2px,0) skewX(0deg) rotate(0deg)'},last];
   case 'accordion':return [
    {opacity:0,transform:'translate3d('+(dir*13)+'px,6px,0) scaleX(.33) scaleY(1.08)'},
    {offset:.73,opacity:1,transform:'translate3d(0,-2px,0) scaleX(1.06) scaleY(.99)'},last];
   case 'crosscurrent':return [
    {opacity:0,transform:'translate3d('+(dir*34)+'px,'+(dir*-15)+'px,0) rotate('+(dir*12)+'deg)'},
    {offset:.72,opacity:1,transform:'translate3d(0,2px,0) rotate('+(dir*-1.2)+'deg)'},last];
   default:return [
    {opacity:0,transform:'translate3d(-22px,34px,0) rotate(-12deg)'},
    {offset:.75,opacity:1,transform:'translate3d(2px,-3px,0) rotate(1deg)'},last];
  }
 };
 const play=async node=>{
  await typographyReady;
  if(!canAnimate()||node.dataset.reveal==='done'){done(node);return}
  // Range reads preserve the original kerning, line breaks and italic positions.
  // The original DOM stays in flow and remains the only accessible text.
  const box=node.getBoundingClientRect(), walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);
  const samples=[];const segmenter=new Intl.Segmenter('pt-BR',{granularity:'grapheme'});
  while(walker.nextNode()){
   const text=walker.currentNode,style=getComputedStyle(text.parentElement);
   for(const {segment,index} of segmenter.segment(text.textContent)){
    if(!segment.trim())continue;
    const range=document.createRange();range.setStart(text,index);range.setEnd(text,index+segment.length);
    const r=range.getBoundingClientRect();
    samples.push({char:segment,x:r.left-box.left,y:r.top-box.top,height:r.height,font:style.font,color:style.color,spacing:style.letterSpacing});
   }
  }
  const overlay=document.createElement('span');overlay.className='motion-overlay';overlay.setAttribute('aria-hidden','true');
  const originals=[...node.children];
  const glyphs=samples.map(sample=>{
   const glyph=document.createElement('span');glyph.className='motion-glyph';glyph.textContent=sample.char;
   glyph.style.cssText=`left:${sample.x}px;top:${sample.y}px;font:${sample.font};color:${sample.color};letter-spacing:${sample.spacing};line-height:${sample.height}px`;
   overlay.append(glyph);return glyph;
  });
  node.append(overlay);
  const offsets=glyphs.map((glyph,i)=>{
   const range=document.createRange();range.selectNodeContents(glyph);
   const r=range.getBoundingClientRect();
   return {x:samples[i].x+box.left-r.left,y:samples[i].y+box.top-r.top};
  });
  glyphs.forEach((glyph,i)=>{glyph.style.left=(samples[i].x+offsets[i].x)+'px';glyph.style.top=(samples[i].y+offsets[i].y)+'px'});
  originals.forEach(n=>n.classList.add('motion-original'));
  const hero=!!node.closest('.hero'),kind=styles[node.closest('section[id]')?.id]||'crosscurrent',total=glyphs.length;
  const effects=glyphs.map((glyph,index)=>{
   const order=kind==='monolith'||kind==='ghostprint'?Math.abs(index-(total-1)/2):kind==='accordion'||kind==='mirrorfold'?total-1-index:index;
   return glyph.animate(frames(kind,index,total),{delay:(hero?0:100)+Math.min(order*17,280),duration:720,easing:eased,fill:'both'});
  });
  node.dataset.reveal='playing';
  const cleanup=()=>{overlay.remove();originals.forEach(n=>n.classList.remove('motion-original'));effects.forEach(a=>a.cancel())};
  active.set(node,cleanup);
  await bounded(Promise.allSettled(effects.map(a=>a.finished)),1600);done(node);
 };
 observe(nodes.filter(n=>!n.closest('.hero')),play);
 ready.then(()=>nodes.filter(n=>n.closest('.hero')).forEach(n=>play(n).catch(()=>done(n))));
}
function editorialPhotographs(){
 const nodes=all('.house-main,.house-detail,.portrait-stage,.work-print a,.instrument-photo img,.facade');
 observe(nodes,async node=>{
  const loaded=await assetsReady(node);
  if(!loaded){done(node);return}
  const final=getComputedStyle(node).transform;
  const wipe=node.matches('.work-print a');
  const frames=wipe?[{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}]
   :[{opacity:0,transform:`translateY(18px) ${final==='none'?'':final}`},{opacity:1,transform:final}];
  await animate(node,frames,{duration:800,delay:120});
 });
}
function productRollIn(){
 const nodes=all('.product-object');
 // Preload the visible product images before the scroll reveal begins.
 nodes.forEach(item=>{const img=one('img',item);if(img)img.loading='eager'});
 observe(nodes,async item=>{
  // Image decode timeouts must not cancel the entrance entirely.
  await assetsReady(item);
  const i=nodes.indexOf(item),x=[-70,-24,70][i],angle=[-28,-15,25][i],scale=innerWidth<700?.55:1;
  await animate(item,[{opacity:0,transform:`translate(${x*scale}px,-12px) rotate(${angle}deg)`},{offset:.8,opacity:1,transform:`translate(0,0) rotate(${i===1?-1:2}deg)`},{opacity:1,transform:'translate(0,0) rotate(0deg)'}],{duration:1900,delay:260+i*180,easing:'cubic-bezier(.35,.04,.18,1)'});
 });
}
function tactileScroll(){
 observe(all('.service-panel,.product-selection article,.booking-steps li,.footer nav,.footer-signature'),async node=>{
  if(node.querySelector('img')&&!await assetsReady(node)){done(node);return}
  const index=[...node.parentElement.children].indexOf(node);
  const isProductCard=!!node.closest('.product-selection');
  return animate(node,[{opacity:0,transform:isProductCard?'translateY(24px)':'translateY(14px)'},{opacity:1,transform:'none'}],
   {duration:isProductCard?840:500,delay:isProductCard?180+index*110:80+Math.min(index*50,150)});
 });
}
function heroEntrance(ready){
 const nodes=all('.hero-brand,.hero-eyebrow,.hero-description,.hero-actions');
 let started=false;
 const reveal=()=>{
  if(started)return;started=true;
  document.removeEventListener('cutintroreveal',reveal);
  nodes.forEach((node,i)=>animate(node,[
   {opacity:0,transform:'translate3d(0,16px,0)'},
   {opacity:1,transform:'translate3d(0,0,0)'}
  ],{duration:650,delay:i*100,easing:'cubic-bezier(.22,1,.36,1)'}));
 };
 document.addEventListener('cutintroreveal',reveal,{once:true});
 // The reveal event may not fire after early cancellation or unsupported media.
 ready.then(reveal);
}
export const settleEditorialMotion=done;
export function initEditorialMotion(){
 if(!canAnimate()||!document.documentElement.classList.contains('motion-enabled')){window.__releaseMotion?.();one('#cut-intro')?.remove();release();return}
 document.addEventListener('motionrelease',release,{once:true});
 try{
  chapterDepth();const ready=opening();headings(ready);editorialPhotographs();productRollIn();tactileScroll();
  detailsTransitions();dialogTransitions();heroEntrance(ready);
  document.addEventListener('focusin',event=>{const node=event.target.closest('[data-reveal]');if(node)done(node)});
  // Resizing invalidates glyph coordinates. Settle them before the next paint.
  addEventListener('resize',()=>all('[data-type][data-reveal="playing"]').forEach(done));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)all('[data-reveal="playing"]').forEach(done)});
  clearTimeout(window.__motionWatchdog);
 }catch{window.__releaseMotion?.();release()}
}
function chapterDepth(){
 if(!canAnimate()||!('IntersectionObserver'in window))return;
 const nodes=all('[data-depth]');
 const visible=new Set();
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(entry.isIntersecting)visible.add(entry.target);else{
    visible.delete(entry.target);
    entry.target.style.removeProperty('transform');
   }
  }
  // Intersection callbacks can arrive AFTER the scroll event/frame.
  // Schedule a sample when photographic layers enter; otherwise a freshly
  // revealed parallax layer can remain inert until the next user scroll.
  request();
 },{rootMargin:'120px 0px'});
 nodes.forEach(node=>observer.observe(node));
 let frame=0,razorDepthUnlocked=false;
 const sample=()=>{
  frame=0;
  if(reduced.matches)return;
  const center=innerHeight*.5,small=innerWidth<700;
  for(const el of visible){
   // The landing parent stays fixed during the flight; its scroll motion resumes
   // on the next scroll sample, without rebasing the destination mid-flight.
   if(el.matches('.razor-depth')&&(!razorDepthUnlocked||document.documentElement.classList.contains('opening-active')))continue;
   const rect=el.getBoundingClientRect();
   const delta=Math.max(-1,Math.min(1,(rect.top+rect.height/2-center)/(innerHeight*.9)));
   const intensity=Math.min(1.22,Number(el.dataset.depth||8)/14);
   const photo=el.closest('.hero-background,.house-photos,.instrument-photo,.facade');
   const amplitude=photo?(small?12:31):(small?7:16);
   const move=(-delta*amplitude*intensity).toFixed(2);
   el.style.transform='translate3d(0,'+move+'px,0)';
   if(el.closest('.house-photos')){
    const house=el.closest('.house');
    house?.style.setProperty('--house-parallax',(-delta*(small?5:13)).toFixed(2)+'px');
   }
  }
 };
 const request=()=>{if(!frame)frame=requestAnimationFrame(sample)};
 window.addEventListener('scroll',()=>{razorDepthUnlocked=true;request()},{passive:true});
 window.addEventListener('resize',request,{passive:true});request();
 reduced.addEventListener?.('change',()=>{
  if(reduced.matches){if(frame)cancelAnimationFrame(frame);frame=0;nodes.forEach(n=>n.style.removeProperty('transform'));}
  else request();
 });
 const hero=one('.hero');
 const pole=one('.barber-pole');
 if(hero&&pole){
  const io=new IntersectionObserver(([entry])=>{
   hero.classList.toggle('poles-visible',entry.isIntersecting&&!reduced.matches);
  });
  io.observe(pole);
 }
}

function detailsTransitions(){
 all('.catalog-disclosure').forEach(details=>{
  let closing=false;
  const content=()=>all(':scope > :not(summary)',details);
  details.addEventListener('toggle',()=>{
   if(!details.open||!canAnimate())return;
   content().forEach((item,index)=>item.animate([
    {opacity:0,transform:'translate3d(0,-9px,0)'},
    {opacity:1,transform:'translate3d(0,0,0)'}
   ],{duration:300,delay:Math.min(index*35,120),easing:eased,fill:'backwards'}));
  });
  const summary=one('summary',details);
  summary?.addEventListener('click',event=>{
   if(!details.open||!canAnimate())return;
   event.preventDefault();if(closing)return;closing=true;
   const contentEls=content();
   Promise.allSettled(contentEls.map(item=>item.animate([
    {opacity:1,transform:'translate3d(0,0,0)'},
    {opacity:0,transform:'translate3d(0,-8px,0)'}
   ],{duration:150,easing:'ease-in',fill:'forwards'}).finished)).then(()=>{
    details.open=false;closing=false;
    contentEls.forEach(item=>item.getAnimations().forEach(anim=>anim.cancel()));
   });
  });
 });
 const menu=one('.mobile-menu');
 menu?.addEventListener('toggle',()=>{
  if(menu.open&&canAnimate())one('nav',menu)?.animate([
   {opacity:0,transform:'translate3d(0,-8px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}
  ],{duration:230,easing:eased});
 });
}

function dialogTransitions(){
 all('.gallery-dialog,.reviews-dialog').forEach(dialog=>{
  dialog.addEventListener('click',event=>{
   const close=event.target.closest('.dialog-close');
   if(!close||!dialog.open||!canAnimate())return;
   event.stopImmediatePropagation();event.preventDefault();
   if(dialog.dataset.closing)return;
   dialog.dataset.closing='1';
   dialog.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(9px) scale(.99)'}],
    {duration:160,easing:'ease-in'}).finished.finally(()=>{
     delete dialog.dataset.closing;
     dialog.close();
    });
  },true);
 });
}
