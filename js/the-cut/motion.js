/* THE CUT / Motion 02 — editorial movement, no animation library.
   Every entrance is progressive enhancement; the real page remains usable. */
const one=(q,root=document)=>root.querySelector(q);
const all=(q,root=document)=>[...root.querySelectorAll(q)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const eased='cubic-bezier(.22,1,.36,1)';
const canAnimate=()=>!reduced.matches&&typeof Element.prototype.animate==='function';

function opening(){
 const intro=one('#cut-intro');
 return new Promise(resolve=>{
  if(!intro||!canAnimate()){intro?.remove();resolve();return;}
  let done=false;
  const finish=()=>{if(done)return;done=true;intro.remove();resolve();};
  intro.addEventListener('animationend',event=>{
   if(event.target===intro&&event.animationName==='cut-intro-clear')finish();
  });
  // The animation plays on every refresh, but can never trap the page.
  const watchdog=setTimeout(finish,3300);
  const original=finish;
  reduced.addEventListener?.('change',()=>{if(reduced.matches){clearTimeout(watchdog);original();}},{once:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();},{once:true});
 });
}

function headings(ready){
 const nodes=all('h1[data-type],h2[data-type],.instrument-copy [data-type]');
 if(!canAnimate()||!('IntersectionObserver'in window))return;
 const seen=new WeakSet();
 // Adapted from the original Sr. Navalha title gestures: monolith,
 // pendulum, inktrail, ghostprint, shards, accordion and mirrorfold.
 const styles={
  inicio:'monolith',casa:'pendulum',servicos:'inktrail',equipe:'inktrail',
  trabalhos:'shards',produtos:'ghostprint',
  agendamento:'accordion',localizacao:'mirrorfold'
 };
 const segmenter=typeof Intl.Segmenter==='function'
  ?new Intl.Segmenter('pt-BR',{granularity:'grapheme'}):null;
 const chars=text=>segmenter?[...segmenter.segment(text)].map(s=>s.segment):Array.from(text);
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
 for(const node of nodes)node.classList.add('motion-armed');
 const play=node=>{
  if(seen.has(node))return;seen.add(node);
  const parts=all(':scope > span,:scope > em',node);
  if(!parts.length){
   node.classList.remove('motion-armed');node.classList.add('motion-finished');return;
  }
  const originals=parts.map(part=>part.innerHTML);
  const glyphs=[];
  try{
   for(const part of parts){
    const walker=document.createTreeWalker(part,NodeFilter.SHOW_TEXT);
    const nodes=[];
    while(walker.nextNode())nodes.push(walker.currentNode);
    for(const textNode of nodes){
     const frag=document.createDocumentFragment();
     for(const token of textNode.textContent.split(/(\s+)/u)){
      if(!token)continue;
      if(/^\s+$/u.test(token)){frag.append(document.createTextNode(token));continue;}
      const word=document.createElement('span');word.className='motion-word';
      for(const char of chars(token)){
       const glyph=document.createElement('span');glyph.className='motion-glyph';
       glyph.textContent=char;word.append(glyph);glyphs.push(glyph);
      }
      frag.append(word);
     }
     textNode.replaceWith(frag);
    }
   }
   const hero=Boolean(node.closest('.hero'));
   const kind=hero?'monolith':styles[node.closest('section[id]')?.id]||'crosscurrent';
   const total=glyphs.length,base=hero?0:280; // Scroll only: later appearance.
   const effects=glyphs.map((glyph,index)=>{
    const order=kind==='monolith'?Math.abs(index-(total-1)/2)*1.25
     :kind==='ghostprint'?Math.abs(index-(total-1)/2)*1.6
     :kind==='accordion'||kind==='mirrorfold'?total-1-index:index;
    return glyph.animate(frames(kind,index,total),{
     delay:base+Math.min(order*24,520),duration:hero?790:760,
     easing:'cubic-bezier(.16,1,.3,1)',fill:'both'
    });
   });
   node.classList.remove('motion-armed');
   Promise.allSettled(effects.map(a=>a.finished)).then(()=>{
    effects.forEach(a=>a.cancel());
    parts.forEach((part,i)=>part.innerHTML=originals[i]);
    node.classList.add('motion-finished');
   });
  }catch{
   parts.forEach((part,i)=>part.innerHTML=originals[i]);
   node.classList.remove('motion-armed');node.classList.add('motion-finished');
  }
 };
 const io=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(entry.isIntersecting){io.unobserve(entry.target);play(entry.target);}
  }
 },{threshold:.12,rootMargin:'0px 0px -12% 0px'});
 nodes.forEach(node=>{if(node.closest('.hero'))ready.then(()=>play(node));else io.observe(node)});
 reduced.addEventListener?.('change',()=>{
  if(reduced.matches){io.disconnect();nodes.forEach(node=>node.classList.remove('motion-armed'));}
 },{once:true});
}

function editorialPhotographs(){
 if(!canAnimate()||!('IntersectionObserver'in window))return;
 const areas=[
  ['.house-main','rise'],['.house-detail','tilt'],
  ['.portrait-stage > img.is-current','portrait'],
  ['.work-print a','wipe'],
  ['.instrument-photo img','fade'],['.facade','rise']
 ];
 const target=areas.flatMap(([selector,kind])=>all(selector).map(node=>({node,kind})));
 const registry=new Map(target.map(p=>[p.node,p.kind]));
 const seen=new WeakSet();
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting||seen.has(entry.target))continue;
   const node=entry.target;seen.add(node);observer.unobserve(node);
   const kind=registry.get(node),distance=innerWidth<700?12:25;
   let frames;
   if(kind==='wipe')frames=[{opacity:.3,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0 0 0)'}];
   else if(kind==='tilt')frames=[{opacity:0,transform:'translate3d(0,'+distance+'px,0) rotate(7deg)'},{opacity:1,transform:'rotate(5deg)'}];
   else if(kind==='portrait')frames=[{opacity:.35,transform:'translate3d(0,'+distance+'px,0) scale(.98)'},{opacity:1,transform:'translate3d(0,0,0) scale(1)'}];
   else if(kind==='fade')frames=[{opacity:.25},{opacity:1}];
   else frames=[{opacity:.2,transform:'translate3d(0,'+distance+'px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}];
   const animation=node.animate(frames,{duration:kind==='wipe'?1000:850,delay:300,easing:eased,fill:'backwards'});
   animation.finished.catch(()=>{});
  }
 },{threshold:.18,rootMargin:'0px 0px -11% 0px'});
 target.forEach(({node})=>observer.observe(node));
 reduced.addEventListener?.('change',()=>{if(reduced.matches)observer.disconnect();},{once:true});
}

function chapterDepth(){
 if(!canAnimate()||!('IntersectionObserver'in window))return;
 const nodes=all('[data-depth]');
 const visible=new Set();
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);
 }),{rootMargin:'120px 0px'});
 nodes.forEach(node=>observer.observe(node));
 let frame=0;
 const sample=()=>{
  frame=0;
  if(reduced.matches)return;
  const center=innerHeight*.5,small=innerWidth<700;
  for(const el of visible){
   const rect=el.getBoundingClientRect();
   const delta=Math.max(-1,Math.min(1,(rect.top+rect.height/2-center)/(innerHeight*.9)));
   const intensity=Math.min(1,Number(el.dataset.depth||8)/18);
   const move=(-delta*(small?8:17)*intensity).toFixed(2);
   el.style.transform='translate3d(0,'+move+'px,0)';
  }
 };
 const request=()=>{if(!frame)frame=requestAnimationFrame(sample)};
 window.addEventListener('scroll',request,{passive:true});
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
   ],{duration:300,delay:Math.min(index*35,120),easing:eased}));
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

function heroEntrance(ready){
 if(!canAnimate())return;
 ready.then(()=>{
  const hero=one('#inicio');if(!hero)return;
  const stagger=[
   ['.hero-brand',0,760],['.hero-eyebrow',160,580],
   ['.hero-description',410,650],['.hero-actions',560,700],
   ['.razor-stage',40,1000]
  ];
  stagger.forEach(([selector,delay,duration])=>{
   const el=one(selector,hero);if(!el)return;
   el.animate([
    {opacity:0,transform:selector==='.razor-stage'?'translate3d(28px,12px,0) rotate(2deg)':'translate3d(0,16px,0)'},
    {opacity:1,transform:'translate3d(0,0,0) rotate(0deg)'}
   ],{duration,delay,easing:eased,fill:'backwards'});
  });
 });
}


/* Object choreography: rotation is on each pack, depth on the parent. */
function productRollIn(){
 const shelf=one('.product-still-life'),items=all('.product-object',shelf||document);
 if(!shelf||!items.length)return;
 if(!canAnimate()||!('IntersectionObserver'in window)){
  items.forEach(n=>n.dataset.motionDone='1');return;
 }
 let started=false;
 const io=new IntersectionObserver(entries=>{
  if(started||!entries.some(e=>e.isIntersecting))return;
  started=true;io.disconnect();
  const motions=[
   {x:-84,y:-17,angle:-31,bounce:3.5},
   {x:-31,y:-24,angle:-17,bounce:-2},
   {x:88,y:-12,angle:28,bounce:-3.5}
  ];
  items.forEach(async(item,index)=>{
   const img=one('img',item);
   if(img&&!img.complete){try{await img.decode()}catch{}}
   if(!item.isConnected)return;
   const p=motions[index]||motions[0];
   if(!canAnimate()){item.dataset.motionDone='1';return;}
   const scale=innerWidth<=700?.55:1;
   const animation=item.animate([
    {offset:0,opacity:.3,transform:'translate3d('+(p.x*scale)+'px,'+(p.y*scale)+'px,0) rotate('+p.angle+'deg)'},
    {offset:.77,opacity:1,transform:'translate3d(0,0,0) rotate('+p.bounce+'deg)'},
    {offset:1,opacity:1,transform:'translate3d(0,0,0) rotate(0deg)'}
   ],{duration:1050+index*90,delay:480+index*210,
      easing:'cubic-bezier(.2,.78,.18,1)',fill:'backwards'});
   animation.finished.then(()=>{
    item.dataset.motionDone='1';animation.cancel();
   }).catch(()=>{item.dataset.motionDone='1'});
  });
 },{threshold:.32,rootMargin:'0px 0px -13% 0px'});
 io.observe(shelf);
 reduced.addEventListener?.('change',()=>{
  if(!reduced.matches)return;
  io.disconnect();
  items.forEach(item=>{item.getAnimations().forEach(a=>a.cancel());item.dataset.motionDone='1'});
 },{once:true});
}
/* Distinct, short section entrances rather than repeating a universal fade. */
function tactileScroll(){
 if(!canAnimate()||!('IntersectionObserver'in window))return;
 const zones=[
  ['.service-panels','.service-panel'],
  ['.product-selection','.product-selection article'],
  ['.booking-controls','.booking-steps li'],
  ['.footer','.footer nav,.footer-signature']
 ];
 const io=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   io.unobserve(entry.target);
   const group=zones.find(([q])=>entry.target.matches(q));
   if(!group)continue;
   all(group[1],entry.target).forEach((el,i)=>el.animate([
    {opacity:.35,transform:'translate3d(0,20px,0)'},
    {opacity:1,transform:'translate3d(0,0,0)'}
   ],{duration:740,delay:300+Math.min(i*105,350),easing:eased,fill:'backwards'}));
  }
 },{threshold:.15});
 zones.forEach(([q])=>all(q).forEach(el=>io.observe(el)));
}

export function initEditorialMotion(){
 const ready=opening();
 headings(ready);
 editorialPhotographs();
 productRollIn();
 tactileScroll();
 chapterDepth();
 detailsTransitions();
 dialogTransitions();
 heroEntrance(ready);
}