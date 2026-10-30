import team from '../data/professionals.js';
import {$,$$,activateButtonLink,animate,cancelWithin,canMove} from './core.js';

// Portrait rail: photograph 1 leaves to the left; only then does
// photograph 2 rise. Geometry never changes during either phase.
// The sequence is cancellable, so fast switching cannot leave stacked
// images, stale labels or a frozen frame in the portrait window.
export function initTeam(){
 const links=$$('[data-person]'),stage=$('.team-portrait .image-stage');
 const names=$('.team-names'),marker=$('.team-marker');
 const label=$('.portrait-name'),index=$('.portrait-index');
 const live=$('#person-name'),booking=$('#team-booking');
 if(!links.length||!stage||!names||!marker||!label||!live||!booking)return;
 let selected=0,turn=0,hoverTimer=0;
 let activeAnimations=[];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const canAnimate=keyboard=>!keyboard&&!reduce.matches&&canMove();
 const cancelHover=()=>{clearTimeout(hoverTimer);hoverTimer=0};
 const stopAnimations=()=>{
  for(const a of activeAnimations){try{a.cancel()}catch{}}
  activeAnimations=[];
  // Keep exactly one stable image if a selection interrupts either phase.
  const chosen=stage.querySelector('img.is-current')||stage.querySelector('img');
  if(chosen){chosen.className='is-current';stage.replaceChildren(chosen)}
  stage.classList.remove('team-photo-changing');
  stage.removeAttribute('aria-busy');
 };
 function alignMarker(link,animated=false){
  if(!link)return;
  const before=marker.getBoundingClientRect();
  const y=link.offsetTop,h=link.offsetHeight;
  cancelWithin(marker);
  marker.style.top=y+'px';marker.style.height=h+'px';
  // FLIP only the indicator, never the rows themselves.
  if(animated&&canMove()&&before.height>0){
   const after=marker.getBoundingClientRect();
   const delta=before.top-after.top;
   if(Math.abs(delta)>1)animate(marker,[
     {transform:'translate3d(0,'+delta+'px,0)'},
     {transform:'translate3d(0,0,0)'}
   ],{duration:330,easing:'cubic-bezier(.2,.8,.2,1)'});
  }
 }
 function updateCaption(person,i){
  // The caption changes on the exact hand-off, never while the old
  // portrait is still travelling out of the frame.
  label.textContent=person.name;
  index.textContent=String(i+1).padStart(2,'0')+' / 05';
  live.textContent=person.name;
  booking.href='agendar.html?profissional='+encodeURIComponent(person.id);
  booking.setAttribute('aria-label','Escolher '+person.name+' na página de agendamento');
 }
 function animateFrame(node,keyframes,options){
  const effect=node.animate(keyframes,{fill:'both',...options});
  activeAnimations.push(effect);
  return effect.finished.then(()=>true).catch(()=>false);
 }
 const getFrame=()=>stage.querySelector('img.is-current')||stage.querySelector('img');
 async function select(link,keyboard=false){
  const i=Number(link.dataset.person);
  if(!Number.isInteger(i)||!team[i]||i===selected)return;
  selected=i;
  const seq=++turn,person=team[i];
  cancelHover();
  stopAnimations();
  links.forEach(l=>l.setAttribute('aria-pressed',String(l===link)));
  alignMarker(link,!keyboard);
  // Decode first. Do not move the existing portrait while data is loading.
  const incoming=new Image();
  incoming.src=person.image;incoming.alt=person.name+', profissional da Sr. Navalha';
  incoming.width=800;incoming.height=800;incoming.decoding='async';
  try{await incoming.decode()}catch{
   if(seq!==turn)return;
   live.textContent=person.name+' · fotografia indisponível';
   // Keep current portrait instead of snapping to a broken image.
   return;
  }
  if(seq!==turn)return;
  if(!canAnimate(keyboard)){
   incoming.className='is-current';
   stage.replaceChildren(incoming);
   updateCaption(person,i);
   return;
  }
  const outgoing=getFrame();
  stage.classList.add('team-photo-changing');
  stage.setAttribute('aria-busy','true');
  incoming.className='team-photo-incoming';
  stage.append(incoming);
  // Phase 1: exit to the left, with depth but no scale/clip-path raster work.
  let ok=true;
  if(outgoing){
   ok=await animateFrame(outgoing,[
     {opacity:1,transform:'translate3d(0,0,0)'},
     {offset:.8,opacity:.9,transform:'translate3d(-79%,0,0)'},
     {opacity:0,transform:'translate3d(-103%,0,0)'}
   ],{duration:350,easing:'cubic-bezier(.53,.05,.79,.33)'});
  }
  if(!ok||seq!==turn)return;
  if(outgoing)outgoing.remove();
  incoming.className='is-current team-photo-incoming';
  updateCaption(person,i);
  // Phase 2: the replacement rises into the unchanged photographic frame.
  const photo=animateFrame(incoming,[
    {opacity:.82,transform:'translate3d(0,105%,0)'},
    {offset:.78,opacity:1,transform:'translate3d(0,-1.8%,0)'},
    {opacity:1,transform:'translate3d(0,0,0)'}
  ],{duration:560,easing:'cubic-bezier(.16,1,.3,1)'});
  const name=animateFrame(label,[
    {opacity:.35,transform:'translate3d(0,13px,0)'},
    {opacity:1,transform:'translate3d(0,0,0)'}
  ],{duration:390,easing:'cubic-bezier(.16,1,.3,1)'});
  await Promise.all([photo,name]);
  if(seq!==turn)return;
  stopAnimations();
  stage.replaceChildren(incoming);
  incoming.className='is-current';
 }
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 links.forEach((link,i)=>{
  link.setAttribute('aria-pressed',String(i===0));
  activateButtonLink(link,e=>select(link,e.detail===0));
  link.addEventListener('pointerenter',()=>{
   if(!fine.matches)return;
   cancelHover();
   // Inline thumb is immediate. Only the larger rail waits for hover intent.
   hoverTimer=setTimeout(()=>{hoverTimer=0;select(link)},125);
  });
  link.addEventListener('pointerleave',cancelHover);
  link.addEventListener('focus',()=>{cancelHover();select(link,true)});
  link.addEventListener('keydown',e=>{
   if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
   e.preventDefault();
   const next=e.key==='Home'?0:e.key==='End'?links.length-1:
     (i+(e.key==='ArrowDown'?1:-1)+links.length)%links.length;
   links[next].focus();
  });
 });
 alignMarker(links[0]);
 const observer=new ResizeObserver(()=>alignMarker(links[selected]));
 observer.observe(names);
 addEventListener('pagehide',()=>{
  ++turn;cancelHover();stopAnimations();observer.disconnect();
 },{once:true});
}
