/* V20 / chapter motion + Skiper-inspired original hover-member preview.
   Based on the free parallax / image reveal interaction principles; no React,
   npm, paid Skiper source or third-party code is copied. */
import {$$,animate,canMove,flow} from './core.js';
const ease='cubic-bezier(.16,1,.3,1)';
export function initSceneCuts(){
 const chapters=$$('.sr-interlude');
 if(!chapters.length)return;
 const able=canMove()&&'IntersectionObserver' in window;
 if(able)chapters.forEach(el=>el.querySelector('.sr-in-anim')?.classList.add('sr-art-queued'));
 if(able){
  const active=new Set();let ticking=0;
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(!entry.isIntersecting)continue;
    const chapter=entry.target;
    observer.unobserve(chapter);active.add(chapter);
    if(!canMove()){chapter.querySelector('.sr-in-anim')?.classList.remove('sr-art-queued');continue;}
    const art=chapter.querySelector('.sr-in-anim'),index=chapters.indexOf(chapter);
    if(!art)continue;
    const type=chapter.className.match(/sr-interlude--([a-z]+)/)?.[1];
    const entryFrames={
     threshold:[{opacity:0,transform:'perspective(900px) translateY(64px) rotateX(-15deg) scale(.88)'},{opacity:1,transform:'none'}],
     blade:[{opacity:0,transform:'skew(-13deg) translateX(-150px) scaleX(.72)'},{opacity:1,transform:'skew(-7deg)'}],
     film:[{opacity:0,transform:'rotate(-7deg) translateX(145px) scale(.88)'},{opacity:1,transform:'rotate(-2deg)'}],
     stitch:[{opacity:0,transform:'rotate(-9deg) translateY(65px) scale(.85)'},{opacity:1,transform:'rotate(2deg)'}],
     shelf:[{opacity:0,transform:'translateY(55px) scale(.9)'},{opacity:1,transform:'none'}],
     stars:[{opacity:0,clipPath:'inset(0% 50% 0% 50%)',transform:'scale(.91)'},{opacity:1,clipPath:'inset(0% 0% 0% 0%)',transform:'none'}],
     route:[{opacity:0,clipPath:'inset(0% 100% 0% 0%)'},{opacity:1,clipPath:'inset(0% 0% 0% 0%)'}],
     signature:[{opacity:0,transform:'translateY(66px) rotate(5deg) scale(.93)'},{opacity:1,transform:'rotate(-1deg)'}]
    };
    animate(art,entryFrames[type]||entryFrames.threshold,{duration:1050+Math.min(index*30,210),delay:120,easing:ease});
    art.classList.remove('sr-art-queued');
    const pictures=$$('.sr-in-photo',art);
    pictures.forEach((p,i)=>{
     animate(p,[{opacity:0,clipPath:'inset(0% 100% 0% 0%)',transform:'translateY(21px)'},{opacity:1,clipPath:'inset(0% 0% 0% 0%)',transform:'none'}],{duration:820,delay:230+i*100,easing:flow});
     const img=p.querySelector('img');
     if(img)animate(img,[{transform:'scale(1.12) translateY(4%)'},{transform:'none'}],{duration:1030,delay:230+i*100,easing:flow});
    });
    if(type==='route'){
     const route=art.querySelector('.sr-in-route__path');
     if(route)animate(route,[{strokeDasharray:'900 900',strokeDashoffset:900},{strokeDasharray:'9 11',strokeDashoffset:0}],{duration:1350,delay:210,easing:flow});
    }
    if(type==='stars'){
     const s=art.querySelector('.sr-in-review__stars');
     if(s)animate(s,[{opacity:.1,letterSpacing:'.95em',transform:'translateY(13px)'},{opacity:1,letterSpacing:'.38em',transform:'none'}],{duration:890,delay:250,easing:flow});
    }
   }
  },{threshold:.13,rootMargin:'0px 0px -11% 0px'});
  chapters.forEach(el=>observer.observe(el));
  // At most one animation frame per scroll event, only for currently visible scenes.
  const visible=new Set();const visibility=new IntersectionObserver(entries=>{for(const e of entries)e.isIntersecting?visible.add(e.target):visible.delete(e.target)},{rootMargin:'70px'});
  chapters.forEach(el=>visibility.observe(el));
  const update=()=>{ticking=0;if(!canMove())return;for(const chapter of visible){
   const art=chapter.querySelector('.sr-in-anim');if(!art)continue;
   const bounds=chapter.getBoundingClientRect();
   const progress=Math.max(-1,Math.min(1,(innerHeight/2-(bounds.top+bounds.height/2))/innerHeight));
   art.style.translate=`0 ${(progress*12).toFixed(1)}px`;
  }};
  addEventListener('scroll',()=>{if(!ticking)ticking=requestAnimationFrame(update)},{passive:true});
  addEventListener('resize',()=>{if(!ticking)ticking=requestAnimationFrame(update)},{passive:true});
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
 addEventListener('blur',close);
 document.addEventListener('motionchange',()=>{if(!canMove())close()});
}
