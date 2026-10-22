import {$,$$,animate,canMove,preference,isPaused,ease} from './core.js';
export function initMotion(){
 const film=$('.detail-film');let filmVisible=false;function syncFilm(){if(!film)return;if(filmVisible&&canMove()){if(!film.src)film.src=film.dataset.src;film.play().catch(()=>{})}else film.pause()}if(film){new IntersectionObserver(([entry])=>{filmVisible=entry.isIntersecting;syncFilm()}).observe(film);document.addEventListener('motionchange',syncFilm)}

 // Three-frame editorial loop: native images, no GIF download and no continuous JS animation.
 const reviewVisual=$('.review-visual-frame');
 if(reviewVisual){
   let onScreen=false;
   const sync=()=>reviewVisual.classList.toggle('is-playing',onScreen&&canMove());
   new IntersectionObserver(([entry])=>{onScreen=entry.isIntersecting;sync()},{rootMargin:'60px',threshold:.08}).observe(reviewVisual);
   document.addEventListener('motionchange',sync);
 }
 const seen=new WeakSet();
 const variants={
 type:[{clipPath:'inset(0 0 100% 0)',transform:'translateY(32px)'},{clipPath:'inset(0)',transform:'none'}],
 copy:[{opacity:.2,transform:'translateY(18px)'},{opacity:1,transform:'none'}],
 frame:[{clipPath:'inset(12% 9% 12% 9%)',transform:'translateY(30px) scale(.96)'},{clipPath:'inset(0)',transform:'none'}],
 side:[{clipPath:'inset(0 100% 0 0)',transform:'translateX(-24px)'},{clipPath:'inset(0)',transform:'none'}],
 shutter:[{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0)'}],
 signature:[{clipPath:'inset(0 100% 0 0)',transform:'translateY(24px)'},{clipPath:'inset(0)',transform:'none'}]
 };
 const observer=new IntersectionObserver(entries=>{let order=0;for(const entry of entries){if(!entry.isIntersecting||seen.has(entry.target))continue;seen.add(entry.target);observer.unobserve(entry.target);const el=entry.target,kind=el.dataset.reveal;const duration=kind==='type'?850:kind==='copy'?500:950;const delay=(order++%3)*65;animate(el,variants[kind]||variants.copy,{duration,delay});if(!['type','copy','signature'].includes(kind)){animate($('img',el),[{transform:kind==='side'?'translateX(4%) scale(1.08)':'translateY(4%) scale(1.08)'},{transform:'none'}],{duration:duration+120,delay:delay+45})}}},{threshold:.1,rootMargin:'0px 0px -28px'});
 $$('[data-reveal]').forEach(e=>observer.observe(e));
 // One event-scheduled frame, no perpetual scroll or cursor loops.
 let frame=0;const house=$('.house'),hero=$('.hero'),inside=$('.portal-inside'),blade=$('.cut-blade');
 const candidates=$$('.hero-room,.hero-facade,.house-word,.work-print');const visible=new Set();
 const sceneObserver=new IntersectionObserver(entries=>{for(const e of entries)e.isIntersecting?visible.add(e.target):visible.delete(e.target);schedule()},{rootMargin:'100px'});candidates.forEach(e=>sceneObserver.observe(e));sceneObserver.observe(house);
 function update(){frame=0;const moving=canMove();if(!moving){inside.style.clipPath='';blade.style.opacity='0';for(const e of candidates)e.style.translate='';return}
 const h=house.getBoundingClientRect();if(visible.has(house)){const progress=Math.max(0,Math.min(1,(innerHeight*.8-h.top)/(innerHeight*.95)));const cut=Math.max(0,Math.min(1,(progress-.1)/.7));inside.style.clipPath=`inset(0 ${((1-cut)*100).toFixed(2)}% 0 0)`;blade.style.left=`${cut*100}%`;blade.style.opacity=cut>0&&cut<1?'1':'0';house.dataset.progress=progress.toFixed(3)}
 for(const e of visible){if(e===house)continue;const r=e.getBoundingClientRect();const k=e.classList.contains('house-word')?-.05:e.classList.contains('hero-facade')?.035:e.classList.contains('hero-room')?-.025:0;if(k)e.style.translate=`0 ${Math.max(-24,Math.min(24,(innerHeight*.5-r.top-r.height*.5)*k))}px`}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});document.addEventListener('motionchange',schedule);schedule();
 // CSS marquee, cloned without focusable or duplicate accessible content.
 const group=$('.review-group'),track=$('.review-track'),clone=group.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.inert=true;$$('a',clone).forEach(a=>a.tabIndex=-1);track.append(clone);
 let reviewPaused=false,offscreen=true;
 function syncReviews(){track.classList.toggle('is-moving',!preference.matches);track.classList.toggle('is-paused',reviewPaused||!canMove()||offscreen);clone.hidden=preference.matches}
 new IntersectionObserver(([entry])=>{offscreen=!entry.isIntersecting;syncReviews()}).observe($('.review-viewport'));
 $('#review-pause').addEventListener('click',()=>{reviewPaused=!reviewPaused;$('#review-pause').setAttribute('aria-pressed',String(reviewPaused));$('#review-pause span').textContent=reviewPaused?'Retomar depoimentos':'Pausar depoimentos';syncReviews()});document.addEventListener('motionchange',syncReviews);syncReviews();
 // Set semantic location on the primary links, without moving focus.
 const navObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){$$('.desktop-nav a').forEach(a=>{if(a.hash===`#${e.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}},{rootMargin:'-10% 0px -65%'});$$('main section[id]').forEach(e=>navObserver.observe(e));
}
export async function openRitual(){
 // Opening in two synchronized shutters. The hero remains naturally visible without JS.
 if(!canMove())return;
 const hero=$('.hero'),brand=$('.site-header .brand img');
 const overlay=document.createElement('div');
 overlay.className='opening-mark opening-mark--shutters';
 overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML=`<div class="opening-shutter opening-shutter--top"></div><div class="opening-shutter opening-shutter--bottom"></div><div class="opening-center"><span class="opening-eyebrow">SR. NAVALHA</span><div class="opening-logo"><img src="assets/images/v8/logo-320.webp" width="320" height="206" alt=""></div><span class="opening-subline">BARBEARIA · GRAVATÁ</span><span class="opening-line"></span></div>`;
 document.body.append(overlay);
 let removed=false;
 const remove=()=>{if(removed)return;removed=true;clearTimeout(failsafe);overlay.remove();hero.classList.remove('is-arriving')};
 const failsafe=setTimeout(remove,2150);
 const onMotion=()=>{if(!canMove())remove()};
 document.addEventListener('motionchange',onMotion,{once:true});
 hero.classList.add('is-arriving');
 const top=$('.opening-shutter--top',overlay),bottom=$('.opening-shutter--bottom',overlay),center=$('.opening-center',overlay),line=$('.opening-line',overlay);
 animate(center,[{opacity:0,transform:'translateY(16px) scale(.96)'},{opacity:1,transform:'none'}],{duration:450,delay:50,easing:ease});
 animate(line,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:630,delay:90,easing:ease,fill:'forwards'});
 animate(center,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-18px) scale(.98)'}],{duration:320,delay:610,easing:ease,fill:'forwards'});
 const shutters=[top,bottom].map((panel,i)=>animate(panel,[{transform:'translateY(0)'},{transform:`translateY(${i===0?'-101%':'101%'})`}],{duration:850,delay:620,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}));
 animate($('.hero-wordmark'),[{opacity:.3,transform:'translateY(28px) scale(.92)'},{opacity:1,transform:'none'}],{duration:1000,delay:620,easing:ease});
 animate($('.title-mask>span'),[{opacity:.45,transform:'translateY(80%)'},{opacity:1,transform:'none'}],{duration:930,delay:740,easing:ease});
 $$('.hero-facade .photo-window,.hero-room .photo-window,.hero-detail .photo-window').forEach((el,i)=>{
   animate(el,[{clipPath:i%2===0?'inset(0 100% 0 0)':'inset(100% 0 0 0)'},{clipPath:'inset(0)'}],{duration:950,delay:750+i*105,easing:ease});
   animate($('img',el),[{transform:'scale(1.07) translateY(2%)'},{transform:'none'}],{duration:1090,delay:780+i*105,easing:ease});
 });
 $$('.hero-intro,.hero-invitation>p,.hero-invitation>.button,.hero-bottom').forEach((el,i)=>{
   animate(el,[{opacity:.2,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:620,delay:790+i*90,easing:ease});
 });
 await Promise.all(shutters.map(a=>a?.finished.catch(()=>{})));
 remove();
}
