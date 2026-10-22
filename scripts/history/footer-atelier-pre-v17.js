// The footer is a closing scene, not a static list of links.
import {canMove} from './core.js';
export function initFooterAtelier(){
 const footer=document.querySelector('.footer');
 if(!footer)return;
 const figure=footer.querySelector('.footer-visual');
 const observer=new IntersectionObserver(([entry])=>{
   footer.classList.toggle('is-in-view',entry.isIntersecting&&canMove());
 },{threshold:.12});
 observer.observe(footer);
 const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
 if(!figure||!finePointer.matches)return;
 let queued=0,x=0,y=0;
 const flush=()=>{queued=0;figure.style.setProperty('--fx',x+'px');figure.style.setProperty('--fy',y+'px');};
 figure.addEventListener('pointermove',event=>{
   if(!canMove())return;
   const r=figure.getBoundingClientRect();
   x=Math.round(((event.clientX-r.left)/r.width-.5)*-12);
   y=Math.round(((event.clientY-r.top)/r.height-.5)*-12);
   if(!queued)queued=requestAnimationFrame(flush);
 },{passive:true});
 figure.addEventListener('pointerleave',()=>{
   x=0;y=0;if(!queued)queued=requestAnimationFrame(flush);
 });
 document.addEventListener('motionchange',()=>{
   footer.classList.toggle('is-in-view',canMove()&&footer.getBoundingClientRect().top<innerHeight);
   if(!canMove()){x=0;y=0;if(!queued)queued=requestAnimationFrame(flush);}
 });
}
