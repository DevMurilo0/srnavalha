/* Chapters are static type with one bounded rule at selected thresholds. */
import { $$, canMove } from './core.js';
export function initSceneCuts(){
 const chapters=$$('.sr-chapter');
 if('IntersectionObserver' in window&&canMove()){
  let remaining=chapters.length;
  const observer=new IntersectionObserver(entries=>{
   for(const e of entries)if(e.isIntersecting){
    e.target.classList.add('sr-chapter--played');observer.unobserve(e.target);
    if(!--remaining)observer.disconnect();
   }
  },{rootMargin:'60px'});
  chapters.forEach(el=>observer.observe(el));
  document.addEventListener('motionchange',()=>{if(!canMove())observer.disconnect()});
 }
 initMemberHover();
}

function initMemberHover(){
 // Original vanilla adaptation of hover-member imagery for this barber team.
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 if(!fine.matches||!canMove())return;
 const links=$$('.team-name[data-person]');
 if(!links.length)return;
 const preview=document.createElement('div');
 preview.className='sr-member-preview';
 preview.setAttribute('aria-hidden','true');
 preview.innerHTML='<div class="sr-member-preview__photo"><img alt="" loading="lazy"></div><div class="sr-member-preview__text"><b></b><span>PROFISSIONAL SR. NAVALHA</span></div>';
 document.body.append(preview);
 const img=preview.querySelector('img'),name=preview.querySelector('b');
 let frame=0,active=false,pos={x:0,y:0},target={x:0,y:0};
 const step=()=>{
  frame=0;if(!active)return;
  pos.x+=(target.x-pos.x)*.22;pos.y+=(target.y-pos.y)*.22;
  preview.style.transform=`translate3d(${pos.x.toFixed(1)}px,${pos.y.toFixed(1)}px,0) rotate(3deg)`;
  if(Math.abs(target.x-pos.x)+Math.abs(target.y-pos.y)>.3)frame=requestAnimationFrame(step);
 };
 const point=e=>{
  target.x=Math.max(15,Math.min(innerWidth-191,e.clientX+24));
  target.y=Math.max(12,Math.min(innerHeight-236,e.clientY-92));
  if(!frame)frame=requestAnimationFrame(step);
 };
 const close=()=>{active=false;preview.classList.remove('sr-member-preview--active');if(frame)cancelAnimationFrame(frame);frame=0;};
 links.forEach(link=>{
  link.addEventListener('pointerenter',e=>{
   if(!canMove())return;
   const src=link.getAttribute('href');if(!src?.startsWith('assets/images/'))return;
   img.src=src;name.textContent=link.querySelector('span')?.textContent||'Sr. Navalha';
   active=true;target.x=Math.max(15,Math.min(innerWidth-191,e.clientX+24));target.y=Math.max(12,Math.min(innerHeight-236,e.clientY-92));
   pos.x=target.x;pos.y=target.y;point(e);preview.classList.add('sr-member-preview--active');
  });
  link.addEventListener('pointermove',point);
  link.addEventListener('pointerleave',close);
 });
 addEventListener('scroll',close,{passive:true});
 addEventListener('blur',close);addEventListener('resize',close,{passive:true});fine.addEventListener('change',close);
 document.addEventListener('motionchange',()=>{if(!canMove())close()});
}
