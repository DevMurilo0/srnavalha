/* V10 motion: isolated new hero scene + viewport word stagger. All words remain
   accessible as actual DOM text, with static content as the no-JS fallback. */
(() => {
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const hero=document.querySelector('.nv2-hero');
const header=document.querySelector('.nv2-header');
if(!hero)return;
let scrollQueued=false;
function updateScroll(){scrollQueued=false;if(reduced.matches)return;const r=hero.getBoundingClientRect();const p=Math.max(0,Math.min(1,-r.top/Math.max(1,r.height)));hero.style.setProperty('--nv10-scroll-scale',(1.025+p*.055).toFixed(4));hero.style.setProperty('--nv10-scroll-y',(-p*22).toFixed(1)+'px');}
function scheduleScroll(){if(!scrollQueued){scrollQueued=true;requestAnimationFrame(updateScroll);}}
addEventListener('scroll',scheduleScroll,{passive:true});addEventListener('resize',scheduleScroll,{passive:true});updateScroll();
// Lightweight entrance sequence: no fake loading wait and no blocking overlay.
const heroEntrance=[...document.querySelectorAll('.nv2-eyebrow,.nv2-title-line>span,.nv2-subtitle,.nv2-actions,.nv2-value')];
if(!reduced.matches){
 heroEntrance.forEach((el,i)=>{
  const delay=i<3?i*110:Math.min(630,240+(i-2)*70);
  const a=el.animate([{opacity:0,transform:'translate3d(0,20px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:i<3?880:570,delay,easing:'cubic-bezier(.23,1,.32,1)'});
  a.finished.catch(()=>{});
 });
}
// Word by word across content, but only when each text block enters the viewport.
// Does NOT replace links, images, headings, buttons, or section markup.
if(!('IntersectionObserver'in window)||reduced.matches)return;
const eligible='main h2,main h3,main h4,main p,main figcaption,main blockquote,main summary,main a,main button,main .service-price,main .duration,main .product-price,footer h2,footer h3,footer p,footer a,header nav a';
const ignore='.nv2-hero,.nv2-header,.sr-only,[aria-live],pre,code,.lightbox,script,style,noscript,textarea,svg';
const blocks=[...document.querySelectorAll(eligible)].filter(el=>!el.closest(ignore)&&el.textContent.trim()&&el.textContent.trim().length<650);
const observer=new IntersectionObserver(entries=>{
 entries.forEach(entry=>{
  if(!entry.isIntersecting)return;observer.unobserve(entry.target);
  const el=entry.target;
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement?.closest('script,style,svg,.nv10-word,[aria-hidden="true"],.sr-only')||!n.textContent.trim()?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const nodes=[];let node;while(node=walker.nextNode())nodes.push(node);
  const words=[];
  nodes.forEach(n=>{
   const parts=n.textContent.split(/(\s+)/u);const frag=document.createDocumentFragment();
   parts.forEach(part=>{
    if(!part)return;
    if(/^\s+$/u.test(part)){frag.append(document.createTextNode(part));return}
    const span=document.createElement('span');span.className='nv10-word';span.textContent=part;frag.append(span);words.push(span);
   });n.replaceWith(frag);
  });
  words.forEach((span,i)=>{
   const delay=Math.min(410,i*31);span.animate([{opacity:.35,transform:'translate3d(0,9px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{duration:540,delay,easing:'cubic-bezier(.23,1,.32,1)'}).finished.catch(()=>{});
  });
 });
},{rootMargin:'0px 0px -3% 0px',threshold:0.05});
blocks.forEach(el=>observer.observe(el));
reduced.addEventListener('change',()=>{if(reduced.matches){observer.disconnect();hero.style.setProperty('--nv10-scroll-scale','1');hero.style.setProperty('--nv10-scroll-y','0px')}});
})();
