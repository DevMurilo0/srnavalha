import {$,$$,animate,canMove,preference,cancelWithin} from './core.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
function splitTitle(title){
 if(title.querySelector('.motion-word'))return;
 const label=title.innerText.replace(/\s+/g,' ').trim();title.setAttribute('aria-label',label);
 const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(!word)return;if(/^\s+$/.test(word)){fragment.append(document.createTextNode(' '));return}const mask=document.createElement('span');mask.className='word-mask';mask.setAttribute('aria-hidden','true');const inner=document.createElement('span');inner.className='motion-word';inner.textContent=word;mask.append(inner);fragment.append(mask)});node.replaceWith(fragment)}
}
export function initMotion(){
 $$('h1,main h2,footer h2').forEach(splitTitle);
 const entered=new WeakSet(),visible=new Set();
 const variants={
 copy:[{opacity:.15,translate:'0 22px'},{opacity:1,translate:'0 0'}],
 side:[{clipPath:'polygon(0 0,0 0,-10% 100%,0 100%)',translate:'-25px 0'},{clipPath:'polygon(0 0,110% 0,100% 100%,0 100%)',translate:'0 0'}],
 frame:[{clipPath:'inset(12% 7% 12% 7%)',transform:'perspective(1000px) rotateY(-9deg) scale(.92)'},{clipPath:'inset(0)',transform:'none'}],
 shutter:[{clipPath:'inset(100% 0 0 0)',translate:'0 24px'},{clipPath:'inset(0)',translate:'0 0'}]
 };
 function enter(el){
  if(entered.has(el))return;entered.add(el);el.dataset.motionState='entered';
  const title=el.matches('h2');
  if(title){const id=el.closest('section,footer')?.id;const words=$$('.motion-word',el),frames=id==='equipe'?[{transform:'perspective(600px) rotateX(-65deg) translateY(100%)',opacity:.2},{transform:'none',opacity:1}]:id==='trabalhos'?[{transform:'translate(-30px,105%) rotate(-7deg)'},{transform:'none'}]:id==='localizacao'?[{transform:'translateX(-110%)'},{transform:'none'}]:[{transform:'translateY(110%) rotate(3deg)'},{transform:'none'}];words.forEach((word,i)=>animate(word,frames,{duration:id==='trabalhos'?900:780,delay:i*65}));return}
  if(el.classList.contains('engraving')){const isSeal=el.classList.contains('hero-engraving');if(isSeal)animate(el,[{rotate:'-15deg',scale:'.8',opacity:.1},{rotate:'8deg',scale:'1',opacity:.8}],{duration:900});$$('[pathLength]',el).slice(0,12).forEach((path,i)=>animate(path,[{strokeDasharray:1,strokeDashoffset:1},{strokeDasharray:1,strokeDashoffset:0}],{duration:900,delay:i*35}));return}
  const kind=el.dataset.reveal||'copy';animate(el,variants[kind]||variants.copy,{duration:kind==='copy'?600:1050});
  if(kind!=='copy')animate($('img',el),[{transform:kind==='side'?'translateX(6%) scale(1.12)':'translateY(6%) scale(1.12)'},{transform:'none'}],{duration:1250,delay:80});
 }
 // One observer owns entrance choreography; visible state remains the unanimated default.
 const entrance=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){enter(e.target);entrance.unobserve(e.target)}},{threshold:.08,rootMargin:'0px 0px -35px'});
 const targets=new Set([...$$('[data-reveal]:not(h1)'),...$$('main h2,footer h2'),...$$('.engraving')]);targets.forEach(el=>entrance.observe(el));
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
  if(visible.has(house)||!moving){const r=house.getBoundingClientRect(),p=clamp((innerHeight*.75-r.top)/(innerHeight*.9)),cut=clamp((p-.08)/.8);house.dataset.progress=p.toFixed(3);inside.style.clipPath=moving?`polygon(0 0,${cut*112}% 0,${cut*112-12}% 100%,0 100%)`:'';blade.style.translate=`${cut*100}% 0`;blade.style.left=`${cut*100}%`;blade.style.opacity=moving&&cut>0&&cut<1?'1':'0';$('.portal-architecture').style.translate=moving?`0 ${(p-.5)*32}px`:'';$('.house-word').style.translate=moving?`${(p-.5)*-42}px 0`:''}
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
 const navObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)$$('.desktop-nav a').forEach(a=>a.hash===`#${e.target.id}`?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'))},{rootMargin:'-10% 0px -65%'});$$('main section[id]').forEach(e=>navObserver.observe(e));
}
