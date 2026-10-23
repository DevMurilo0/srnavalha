import {$,$$,animate,canMove,preference,cancelWithin,flow} from './core.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function splitTitle(title){
 if(title.querySelector('.motion-word'))return;
 const label=title.innerText.replace(/\s+/g,' ').trim();title.setAttribute('aria-label',label);
 const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(!word)return;if(/^\s+$/.test(word)){fragment.append(document.createTextNode(' '));return}const mask=document.createElement('span');mask.className='word-mask';mask.setAttribute('aria-hidden','true');const inner=document.createElement('span');inner.className='motion-word';inner.textContent=word;mask.append(inner);fragment.append(mask)});node.replaceWith(fragment)}
}
export function initMotion(){
 $$('h1,main h2,footer h2').forEach(splitTitle);
 const entered=new WeakSet(),visible=new Set(),entrances=new Map();
 const root=document.documentElement;const motionOn=canMove()&&'IntersectionObserver' in window;
 const variants={
  copy:[{opacity:.12,transform:'translateY(19px)'},{opacity:1,transform:'none'}],
  side:[{clipPath:'inset(0 100% 0 0)',translate:'-20px 0'},{clipPath:'inset(0)',translate:'0 0'}],
  frame:[{clipPath:'inset(6% 4% 6% 4%)',transform:'perspective(1000px) rotateY(-4deg) scale(.97)'},{clipPath:'inset(0)',transform:'none'}],
  shutter:[{clipPath:'inset(100% 0 0 0)',translate:'0 18px'},{clipPath:'inset(0)',translate:'0 0'}],
  inline:[{opacity:.12,translate:'-12px 0'},{opacity:1,translate:'0 0'}],
  leaf:[{opacity:.12,translate:'0 28px'},{opacity:1,translate:'0 0'}]
 };
 const register=(selector,kind,delay=0,step=0)=>{
  const siblings=new Map();
  $$(selector).forEach(el=>{const group=el.parentElement,index=siblings.get(group)||0;siblings.set(group,index+1);if(!entrances.has(el))entrances.set(el,{kind:kind||el.dataset.reveal||'copy',delay:Math.min(450,delay+100+index*step)})});
 };
 register('main h2,footer h2','type');
 register('[data-reveal]:not(h1)',null,185);
 register('.engraving','engraving',190);
 register('.section-heading>p,.section-heading>div>p,.house-copy>p','copy',180,85);
 register('.section-heading>div>.text-link,.house-copy>.text-link','inline',190);
 register('.mirror-frame,.team-portrait,.atelier-detail,.footer-visual','frame',240);
 register('#mirror-info,.product-info','copy',200);
 register('.mirror-choice','inline',80,40);
 register('.catalog-heading,.product-catalog-head','copy',100);
 register('.team-name','inline',95,38);
 register('.team-invite>p,.team-invite>.text-link','copy',150,40);
 register('.album-toolbar,.album-navigation,.album-dock','copy',90,45);
 register('.album-sheets .work-print','leaf',190,90);
 register('.rating,.review-visual','copy',170);
 register('.visit-info>address,.visit-phone,.visit-info>p,.visit-info>.text-link','copy',110,35);
 register('.map-frame','copy',140);
 register('.practical>*','copy',80,55);
 register('.footer-story-copy,.footer-feature-cta,.footer-small-note','copy',130,55);
 register('.footer-brand-col,.footer-link-col','copy',80,60);
 if(motionOn){entrances.forEach((_,el)=>el.classList.add('sr-enter-queued'));root.classList.add('sr-motion-active');}
 root.classList.remove('sr-motion-boot');
 function enter(el){
  if(entered.has(el))return;entered.add(el);el.dataset.motionState='entered';
  if(!canMove()){el.classList.remove('sr-enter-queued');return}
  const reveal=()=>el.classList.remove('sr-enter-queued');
  const {kind,delay}=entrances.get(el);
  if(kind==='type'){
   const id=el.closest('section,footer')?.id;
   const frames=id==='equipe'?[{transform:'perspective(650px) rotateX(-24deg) translateY(95%)',opacity:.2},{transform:'none',opacity:1}]:id==='trabalhos'?[{transform:'translate(-14px,100%) rotate(-3deg)'},{transform:'none'}]:id==='localizacao'?[{transform:'translate(-28px,70%)',opacity:.2},{transform:'none',opacity:1}]:[{transform:'translateY(105%) rotate(1.5deg)'},{transform:'none'}];
   animate(el,[{opacity:0},{opacity:1}],{duration:490,delay,easing:flow});
   $('.motion-word',el).forEach((word,i)=>animate(word,frames,{duration:1100,delay:delay+Math.min(i*80,430),easing:flow}));
   reveal();return;
  }
  if(kind==='engraving'){
   // Trace the drawing in small groups instead of bringing every line in at once.
   animate(el,[{opacity:0},{opacity:1}],{duration:780,delay,easing:flow});
   $('[pathLength]',el).slice(0,12).forEach((path,i)=>animate(path,[{strokeDasharray:1,strokeDashoffset:1,opacity:.15},{strokeDasharray:1,strokeDashoffset:0,opacity:1}],{duration:820,delay:delay+Math.min(i*30,200),easing:flow}));
   reveal();return;
  }
  const duration=kind==='leaf'?1040:['frame','side','shutter'].includes(kind)?1140:800;
  const frames=(variants[kind]||variants.copy).map((f,i)=>i===0?{...f,opacity:0}:i===1?{...f,opacity:1}:f);
  animate(el,frames,{duration,delay,easing:flow});reveal();
  // Shared photo stages and the map keep their own internal state; only frame the container.
  const img=!el.matches('.team-portrait,.mirror-frame,.map-frame')?$('img',el):null;
  if(img&&['frame','side','shutter'].includes(kind))animate(img,[{transform:kind==='side'?'translateX(3%) scale(1.065)':'translateY(3%) scale(1.065)'},{transform:'none'}],{duration:1270,delay:delay+120,easing:flow});
 }
 // One observer, bounded sibling stagger, and naturally visible fallback states.
 if(motionOn){const entrance=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){enter(e.target);entrance.unobserve(e.target)}},{threshold:.1,rootMargin:'0px 0px -9% 0px'});entrances.forEach((_,el)=>entrance.observe(el));}
 const house=$('.house'),inside=$('.portal-inside'),blade=$('.cut-blade'),footer=$('.footer'),film=$('.detail-film'),reviewFrame=$('.review-visual-frame');
 const scenes=[house,footer,$('.hero'),reviewFrame,film].filter(Boolean);
 const progress=document.createElement('div');progress.className='scroll-thread';progress.setAttribute('aria-hidden','true');document.body.append(progress);
 let frame=0,pointer=null;const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const fieldObserver=new IntersectionObserver(entries=>{for(const e of entries)e.isIntersecting?visible.add(e.target):visible.delete(e.target);syncAmbient();schedule()},{rootMargin:'40px'});scenes.forEach(e=>fieldObserver.observe(e));
 function syncAmbient(){
  const play=canMove();reviewFrame?.classList.toggle('is-playing',play&&visible.has(reviewFrame));footer?.classList.toggle('is-in-view',play&&visible.has(footer));
  if(film){if(play&&visible.has(film)){if(!film.src)film.src=film.dataset.src;film.play().catch(()=>{})}else film.pause()}
 }
 function update(){
  frame=0;const moving=canMove();progress.style.transform=`scaleX(${moving?clamp(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)):0})`;
  if(visible.has(house)||!moving){const r=house.getBoundingClientRect(),p=clamp((innerHeight*.75-r.top)/(innerHeight*.9)),cut=clamp((p-.08)/.8);house.dataset.progress=p.toFixed(3);inside.style.clipPath=moving?`polygon(0 0,${cut*112}% 0,${cut*112-12}% 100%,0 100%)`:'';blade.style.transform=`translateX(${cut*inside.getBoundingClientRect().width}px)`;blade.style.opacity=moving&&cut>0&&cut<1?'1':'0';const decor=$('.house-atmosphere-photo');if(decor)decor.style.translate=moving?`0 ${(p-.5)*32}px`:'';const heading=$('.house-word');if(heading)heading.style.translate=moving?`${(p-.5)*-42}px 0`:''}
  if(visible.has(footer)||!moving){const r=$('.footer-oversize').getBoundingClientRect(),p=clamp((innerHeight-r.top)/Math.max(160,innerHeight*.65));$$('.footer-oversize>span').forEach((el,i)=>{el.style.translate=moving?`0 ${(1-p)*(i===1?-35:-20)}px`:'';el.style.clipPath=''});$('.footer-visual').style.translate=moving?`0 ${clamp((innerHeight-footer.getBoundingClientRect().top)*-.025,-24,0)}px`:''}
  if(pointer){const{element,x,y}=pointer;element.style.setProperty('--mx',moving?`${x}px`:'0px');element.style.setProperty('--my',moving?`${y}px`:'0px')}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});document.addEventListener('motionchange',()=>{syncAmbient();schedule()});schedule();
 // Pointer responses share the scroll scheduler. No independent perpetual loops.
 $$('.button,.footer-feature-cta,.team-portrait').forEach(element=>{element.addEventListener('pointermove',e=>{if(!fine.matches||!canMove())return;const r=element.getBoundingClientRect();pointer={element,x:clamp((e.clientX-r.left-r.width/2)*.06,-7,7),y:clamp((e.clientY-r.top-r.height/2)*.06,-5,5)};schedule()});element.addEventListener('pointerleave',()=>{element.style.setProperty('--mx','0px');element.style.setProperty('--my','0px');if(pointer?.element===element)pointer=null})});
 document.addEventListener('photochange',e=>{const section=e.target.closest('section'),art=$('.mirror-engraving,.product-engraving',section);if(art){cancelWithin(art);animate(art,[{rotate:'-5deg',translate:'-8px 0'},{rotate:'0deg',translate:'0 0'}],{duration:650})}});
 // Real testimonials: continuous right-to-left, pauseable and static with reduced motion.
 const group=$('.review-group'),track=$('.review-track'),clone=group.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.inert=true;$$('a',clone).forEach(a=>a.tabIndex=-1);track.append(clone);let reviewPaused=false,offscreen=true;
 function syncReviews(){track.classList.toggle('is-moving',!preference.matches);track.classList.toggle('is-paused',reviewPaused||!canMove()||offscreen);clone.hidden=preference.matches}
 new IntersectionObserver(([e])=>{offscreen=!e.isIntersecting;syncReviews()}).observe($('.review-viewport'));
 $('#review-pause').addEventListener('click',()=>{reviewPaused=!reviewPaused;$('#review-pause').setAttribute('aria-pressed',String(reviewPaused));$('#review-pause span').textContent=reviewPaused?'Retomar depoimentos':'Pausar depoimentos';syncReviews()});document.addEventListener('motionchange',syncReviews);syncReviews();
 const menu=$('.menu'),menuNav=$('nav',menu);
 menu.addEventListener('toggle',()=>{cancelWithin(menuNav);if(menu.open)$$('a',menuNav).forEach((link,i)=>animate(link,[{opacity:.2,translate:'0 10px'},{opacity:1,translate:'0 0'}],{duration:360,delay:25+i*34,easing:flow}))});
 const navObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)$('.desktop-nav a').forEach(a=>a.hash===`#${e.target.id}`?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'))},{rootMargin:'-10% 0px -65%'});$('main section[id]').forEach(e=>navObserver.observe(e));
 root.classList.add('sr-motion-initialized');
}
