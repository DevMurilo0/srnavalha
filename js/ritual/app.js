import {$,$,startMotion,isPaused,setPaused} from './core.js';
import {initAtelier} from './atelier.js';
import {initMotion,openRitual} from './motion.js';import {initServices} from './services.js';import {initTeam} from './team.js';import {initProducts} from './products.js';import {initGallery} from './gallery.js';import {initMap} from './map.js';
// Enhance independently: one unavailable component must not block the booking links.
document.documentElement.classList.add('enhanced');
startMotion();
for(const init of [initServices,initTeam,initProducts,initGallery,initMotion,initMap,initAtelier]){try{init()}catch(error){console.error('Componente Sr. Navalha:',error)}}
const menu=$('.menu');$$('.menu nav a').forEach(a=>a.addEventListener('click',()=>menu.open=false));document.addEventListener('click',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;$('summary',menu).focus()}});matchMedia('(min-width:1001px)').addEventListener('change',()=>menu.open=false);
$('.motion-toggle').addEventListener('click',()=>{setPaused(!isPaused());$('.motion-toggle').setAttribute('aria-pressed',String(isPaused()));$('.motion-toggle span').textContent=isPaused()?'Retomar movimento':'Pausar movimento'});
$$('img').forEach(img=>{img.addEventListener('error',()=>{img.classList.add('image-unavailable');img.alt='Fotografia indisponível: '+img.alt})});
openRitual().catch(()=>$('.opening-mark')?.remove());
