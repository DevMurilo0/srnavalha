import team from '../data/professionals.js';import {$,$$,activateButtonLink,changePhoto} from './core.js';
export function initTeam(){let token=0;const links=$$('[data-person]'),stage=$('.team-portrait .image-stage');
 async function select(link,keyboard=false){const seq=++token,p=team[Number(link.dataset.person)];const ok=await changePhoto(stage,p.image,`${p.name}, profissional da Sr. Navalha`,{keyboard});if(seq!==token||!ok)return;links.forEach(l=>l.setAttribute('aria-pressed',String(l===link)));$('#person-name').textContent=p.name}
 links.forEach(link=>{activateButtonLink(link,e=>select(link,e.detail===0));link.addEventListener('pointerenter',e=>{if(matchMedia('(hover:hover) and (pointer:fine)').matches)select(link)});link.addEventListener('focus',()=>select(link,true))});
}
