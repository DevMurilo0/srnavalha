import {revealText,cancelText} from './text-motion.js';
import team from '../data/professionals.js';
import {$,$$,activateButtonLink,changePhoto,animate,cancelWithin} from './core.js';
export function initTeam(){
 let token=0,selected=-1;const links=$$('[data-person]'),stage=$('.team-portrait .image-stage'),names=$('.team-names'),marker=$('.team-marker');
 function alignMarker(link,move=true){const before=marker.getBoundingClientRect();const y=link.offsetTop,h=link.offsetHeight;cancelWithin(marker);marker.style.top=`${y}px`;marker.style.height=`${h}px`;if(move){cancelWithin(marker);const end=marker.getBoundingClientRect();animate(marker,[{transform:`translateY(${before.top-end.top}px) scaleY(${before.height/end.height||1})`},{transform:'none'}],{duration:430})}}
 async function select(link,keyboard=false){
  const i=Number(link.dataset.person);if(i===selected)return;selected=i;const seq=++token,p=team[i];
  links.forEach(l=>l.setAttribute('aria-pressed',String(l===link)));alignMarker(link,!keyboard);
  const name=$('.portrait-name');cancelText(name);cancelWithin(name);name.textContent=p.name;if(!keyboard)revealText(name,'roll',{duration:580});
  $('.portrait-index').textContent=`${String(i+1).padStart(2,'0')} / 05`;
  
  const ok=await changePhoto(stage,p.image,`${p.name}, profissional da Sr. Navalha`,{keyboard});if(seq!==token)return;
  $('#person-name').textContent=ok?p.name:`${p.name} · foto indisponível`;$('#team-booking').href='agendar.html?profissional='+encodeURIComponent(p.id);$('#team-booking').setAttribute('aria-label',`Escolher ${p.name} na página de agendamento`);
 }
 // Hover reveals the row's own CSS thumbnail at once, but only swaps
 // the large portrait once the pointer rests on the row. This prevents
 // triggering five image loads and animations while sweeping the list.
 let hoverTimer=0;
 const cancelHover=()=>{clearTimeout(hoverTimer);hoverTimer=0};
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 links.forEach((link,i)=>{
  link.setAttribute('aria-pressed',String(i===0));
  activateButtonLink(link,e=>{cancelHover();select(link,e.detail===0)});
  link.addEventListener('pointerenter',()=>{
   if(!fine.matches)return;
   cancelHover();
   hoverTimer=setTimeout(()=>{hoverTimer=0;select(link)},115);
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
 addEventListener('pagehide',cancelHover,{once:true});
 selected=0;alignMarker(links[0],false);new ResizeObserver(()=>alignMarker(links[selected],false)).observe(names);
}
