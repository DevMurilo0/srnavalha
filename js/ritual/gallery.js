import {$,$$,animate,cancelWithin,canMove,spatial,changePhoto} from './core.js';
export function initGallery(){
 const shots=$$('.gallery-shot'),dialog=$('.lightbox'),image=$('.lightbox-image');let index=0,opener=null,sequence=0,closing=false;
 const bodyOverflow=()=>document.documentElement.classList.toggle('viewing-photo',dialog.open);
 const data=i=>({source:$('img',shots[i]),title:shots[i].closest('figure').querySelector('figcaption span').textContent});
 async function show(next,{opening=false,keyboard=false}={}){const token=++sequence;index=(next+shots.length)%shots.length;const d=data(index),loader=new Image();loader.src=d.source.currentSrc||d.source.src;try{await loader.decode()}catch{return}if(token!==sequence)return;
 cancelWithin(dialog);image.width=loader.naturalWidth;image.height=loader.naturalHeight;image.src=loader.src;image.alt=d.source.alt;$('#lightbox-title').textContent=d.title;$('#photo-position').textContent=`Fotografia ${index+1} / ${shots.length}`;
 if(!dialog.open){dialog.showModal();bodyOverflow()}
 if(opening){const from=d.source.getBoundingClientRect(),to=image.getBoundingClientRect();animate(image,[{transform:`translate(${from.x-to.x}px,${from.y-to.y}px) scale(${from.width/to.width},${from.height/to.height})`,clipPath:'inset(0)'},{transform:'none',clipPath:'inset(0)'}],{duration:650,easing:spatial})}
 else if(!keyboard)animate(image,[{opacity:.2,transform:'translateX(24px)'},{opacity:1,transform:'none'}],{duration:260});}
 async function close(keyboard=false){if(!dialog.open||closing)return;closing=true;++sequence;cancelWithin(dialog);const target=$('img',opener),from=image.getBoundingClientRect(),to=target.getBoundingClientRect();const visible=to.bottom>0&&to.top<innerHeight;
 const motion=!keyboard&&visible?animate(image,[{transform:'none',opacity:1},{transform:`translate(${to.x-from.x}px,${to.y-from.y}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:.5}],{duration:280,easing:spatial}):null;
 if(motion)await motion.finished.catch(()=>{});dialog.close();closing=false;bodyOverflow();opener?.focus({preventScroll:true});}
 shots.forEach((shot,i)=>shot.addEventListener('click',e=>{e.preventDefault();opener=shot;closing=false;show(i,{opening:e.detail!==0,keyboard:e.detail===0})}));
 $('.lightbox-close').addEventListener('click',e=>close(e.detail===0));$('.lightbox-next').addEventListener('click',e=>show(index+1,{keyboard:e.detail===0}));$('.lightbox-prev').addEventListener('click',e=>show(index-1,{keyboard:e.detail===0}));
 dialog.addEventListener('cancel',e=>{e.preventDefault();close(true)});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1),{keyboard:true})}});
 dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.classList.contains('lightbox-image-wrap'))close()});
 let drag=null;image.style.touchAction='pan-y';image.addEventListener('pointerdown',e=>{if(drag||!e.isPrimary)return;drag={x:e.clientX,y:e.clientY,time:performance.now(),id:e.pointerId};image.setPointerCapture(e.pointerId)});image.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y,velocity=Math.abs(dx)/Math.max(1,performance.now()-drag.time);if(Math.abs(dx)>Math.abs(dy)&&(Math.abs(dx)>55||(Math.abs(dx)>25&&velocity>.3)))show(index+(dx<0?1:-1));drag=null});image.addEventListener('pointercancel',()=>drag=null);
}
