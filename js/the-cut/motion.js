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
  const watchdog=setTimeout(finish,3100);
  const original=finish;
  reduced.addEventListener?.('change',()=>{if(reduced.matches){clearTimeout(watchdog);original();}},{once:true});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();},{once:true});
 });
}

function headings(ready){
 const nodes=all('h1[data-type],h2[data-type],.instrument-copy [data-type]');
 if(!canAnimate()||!('IntersectionObserver'in window))return;
 const seen=new WeakSet();
 for(const node of nodes){
  node.classList.add('motion-armed');
  if(node.dataset.type==='shards'){
   all(':scope > span,:scope > em',node).forEach(part=>{
    const value=part.textContent||'';
    part.replaceChildren(...value.split(/(\s+)/).filter(Boolean).map(fragment=>{
     if(/^\s+$/.test(fragment))return document.createTextNode(fragment);
     const word=document.createElement('span');word.className='motion-word';word.textContent=fragment;return word;
    }));
   });
  }
 }
 function play(node){
  if(seen.has(node))return;seen.add(node);
  const type=node.dataset.type;
  const items=type==='shards'?all('.motion-word',node):all(':scope > span,:scope > em',node);
  if(!items.length){node.classList.remove('motion-armed');return;}
  const animations=items.map((item,index)=>{
   const emphasized=item.matches('em')||item.closest('em');
   const duration=type==='cut'?920:type==='mirror'?1000:type==='shards'?680:810;
   const delay=type==='shards'?index*105:index*(type==='cut'?220:150);
   let from={opacity:0,transform:'translate3d('+(type==='mirror'?(index===0?'-24px':'24px'):'0')+','+(type==='fold'?'33px':type==='shards'?'22px':'16px')+',0)'};
   let to={opacity:1,transform:'translate3d(0,0,0)'};
   if(type==='cut'){
    from={...from,clipPath:emphasized?'inset(0 0 100% 0)':'inset(0 100% 0 0)'};
    to={...to,clipPath:'inset(0 0 0 0)'};
   }
   if(type==='fold')from.transform='translate3d(0,28px,0) rotateX(-24deg) skewY(2deg)';
   if(type==='mirror')from.transform='translate3d('+(index===0?'-42px':'42px')+',14px,0) rotate('+(index===0?'-3deg':'3deg')+')';
   if(type==='shards')from.transform='translate3d('+(index%2===0?'-14px':'14px')+',30px,0) rotate('+(index%2===0?'-8deg':'7deg')+')';
   return item.animate([from,to],{duration,delay,easing:eased,fill:'both'});
  });
  Promise.allSettled(animations.map(a=>a.finished)).then(()=>{
   node.classList.remove('motion-armed');animations.forEach(a=>a.cancel());
   node.classList.add('motion-finished');
  });
 }
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){observer.unobserve(entry.target);play(entry.target);}});
 },{threshold:.14,rootMargin:'0px 0px -8% 0px'});
 nodes.forEach(node=>{if(node.closest('.hero'))ready.then(()=>play(node));else observer.observe(node)});
 reduced.addEventListener?.('change',()=>{
  if(reduced.matches){observer.disconnect();nodes.forEach(node=>node.classList.remove('motion-armed'));}
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
   const animation=node.animate(frames,{duration:kind==='wipe'?1000:800,easing:eased});
   animation.finished.catch(()=>{});
  }
 },{threshold:.16,rootMargin:'0px 0px -7% 0px'});
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
   ],{duration:1000+index*85,delay:100+index*155,
      easing:'cubic-bezier(.2,.78,.18,1)',fill:'backwards'});
   animation.finished.then(()=>{
    item.dataset.motionDone='1';animation.cancel();
   }).catch(()=>{item.dataset.motionDone='1'});
  });
 },{threshold:.2,rootMargin:'0px 0px -4% 0px'});
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
   ],{duration:720,delay:Math.min(i*95,300),easing:eased}));
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