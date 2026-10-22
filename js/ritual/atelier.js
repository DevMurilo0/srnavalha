// Sr. Navalha V12 — compositional interactions, progressive enhancement without permanent hidden states.
import {$,$$,canMove} from './core.js';
export function initAtelier(){
 const progress=document.createElement('div');progress.className='scroll-thread';progress.setAttribute('aria-hidden','true');document.body.append(progress);
 let raf=0;const update=()=>{raf=0;const max=document.documentElement.scrollHeight-innerHeight;progress.style.setProperty('--scene-progress',String(max>0?Math.max(0,Math.min(1,scrollY/max)):0))};const onScroll=()=>{if(!raf)raf=requestAnimationFrame(update)};
 addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});update();
 const title=$('.hero-centerpiece h1 .title-mask>span');
 // Word animation follows the hero entrance; DOM text and semantics remain intact.
 if(title&&canMove()){
   const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
   let i=0;for(const node of nodes){const fragment=document.createDocumentFragment();const parts=node.textContent.match(/\S+|\s+/g)||[];for(const part of parts){if(!part.trim()){fragment.append(document.createTextNode(part));continue}const span=document.createElement('span');span.className='motion-word';span.textContent=part;fragment.append(span);const order=i++;setTimeout(()=>{if(!canMove())return;span.animate([{opacity:.12,transform:'translateY(65%) rotate(7deg)',filter:'blur(7px)'},{opacity:1,transform:'none',filter:'blur(0px)'}],{duration:880,delay:order*65,easing:'cubic-bezier(.16,1,.3,1)'})},300)}node.replaceWith(fragment)}
   
 }
 const targets=$$('main section h2,main section h3,.section-heading p,.hero-intro,.hero figcaption,.house-copy>p,.catalog-heading p');
 const observed=new WeakSet();const io=new IntersectionObserver(entries=>{let index=0;for(const entry of entries){if(!entry.isIntersecting||observed.has(entry.target))continue;observed.add(entry.target);io.unobserve(entry.target);if(!canMove())continue;const el=entry.target;const isTitle=/^H[23]$/.test(el.tagName);el.animate(isTitle?[{opacity:.45,transform:'translateY(38px) skewY(2deg)',clipPath:'inset(0 0 85% 0)'},{opacity:1,transform:'none',clipPath:'inset(0)'}]:[{opacity:.4,transform:'translateY(20px)'},{opacity:1,transform:'none'}],{duration:isTitle?1000:680,delay:(index++%4)*80,easing:'cubic-bezier(.16,1,.3,1)'})}},{threshold:.12,rootMargin:'0px 0px -4%'});targets.forEach(el=>io.observe(el));
 // Highlight active photographs on pointer/touch, with scroll-safe transforms.
 const frames=$$('.photo-window,.work-print,.mirror-frame,.team-photo,.product-photo');
 frames.forEach(frame=>{frame.addEventListener('pointerenter',()=>{if(!canMove())return;frame.style.setProperty('--hovered','1')});frame.addEventListener('pointerleave',()=>frame.style.setProperty('--hovered','0'))});
}
