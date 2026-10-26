import team from '../data/professionals.js';
import {$,$$,activateButtonLink,changePhoto,animate,cancelWithin} from './core.js';
export function initTeam(){
 let token=0,selected=-1;const links=$$('[data-person]'),stage=$('.team-portrait .image-stage'),names=$('.team-names'),marker=$('.team-marker');
 function alignMarker(link,move=true){const before=marker.getBoundingClientRect();const y=link.offsetTop,h=link.offsetHeight;cancelWithin(marker);marker.style.top=`${y}px`;marker.style.height=`${h}px`;if(move){cancelWithin(marker);const end=marker.getBoundingClientRect();animate(marker,[{transform:`translateY(${before.top-end.top}px) scaleY(${before.height/end.height||1})`},{transform:'none'}],{duration:430})}}
 async function select(link,keyboard=false){
  const i=Number(link.dataset.person);if(i===selected)return;selected=i;const seq=++token,p=team[i];
  links.forEach(l=>l.setAttribute('aria-pressed',String(l===link)));alignMarker(link,!keyboard);
  const name=$('.portrait-name');cancelWithin(name);name.textContent=p.name;if(!keyboard)animate(name,[{opacity:.4,transform:'translateX(-12px)'},{opacity:1,transform:'none'}],{duration:280});
  $('.portrait-index').textContent=`${String(i+1).padStart(2,'0')} / 05`;
  const frame=$('.portrait-engraving');cancelWithin(frame);if(!keyboard)animate(frame,[{transform:'translateX(-8px) rotate(-2deg)'},{transform:'none'}],{duration:300});
  const ok=await changePhoto(stage,p.image,`${p.name}, profissional da Sr. Navalha`,{keyboard});if(seq!==token)return;
  $('#person-name').textContent=ok?p.name:`${p.name} · foto indisponível`;$('#team-booking').href='agendar.html?profissional='+encodeURIComponent(p.id);$('#team-booking').setAttribute('aria-label',`Escolher ${p.name} na página de agendamento`);
 }
 links.forEach((link,i)=>{link.setAttribute('aria-pressed',String(i===0));activateButtonLink(link,e=>select(link,e.detail===0));link.addEventListener('pointerenter',()=>{if(matchMedia('(hover:hover) and (pointer:fine)').matches)select(link)});link.addEventListener('focus',()=>select(link,true));link.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?links.length-1:(i+(e.key==='ArrowDown'?1:-1)+links.length)%links.length;links[next].focus()})});
 selected=0;alignMarker(links[0],false);new ResizeObserver(()=>alignMarker(links[selected],false)).observe(names);
}
