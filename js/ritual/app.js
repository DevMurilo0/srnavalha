import {$,$$,startMotion} from './core.js';
import {initAlbum} from './album.js';
import {initMotion} from './motion.js';
import {initAtmosphere} from './atmosphere.js';
import {initSceneCuts} from './scene-cuts.js';import {openRitual} from './opening.js';import {initServices} from './services.js';import {initTeam} from './team.js';import {initProducts} from './products.js';import {initGallery} from './gallery.js';import {initMap} from './map.js';
// Enhance independently: one unavailable component must not block the booking links.
document.documentElement.classList.add('enhanced');
startMotion();
for(const init of [initServices,initTeam,initProducts,initAlbum,initGallery,initMotion,initMap,initAtmosphere,initSceneCuts]){try{init()}catch(error){console.error('Componente Sr. Navalha:',error)}}
const menu=$('.menu');$$('.menu nav a').forEach(a=>a.addEventListener('click',()=>menu.open=false));document.addEventListener('click',e=>{if(menu.open&&!menu.contains(e.target))menu.open=false});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.open){menu.open=false;$('summary',menu).focus()}});matchMedia('(min-width:1001px)').addEventListener('change',()=>menu.open=false);
$$('img').forEach(img=>{img.addEventListener('error',()=>{img.classList.add('image-unavailable');img.alt='Fotografia indisponível: '+img.alt})});
openRitual().catch(()=>$('.opening-mark')?.remove());
