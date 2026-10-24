import { $, $$, startMotion } from './core.js';
import { initAlbum } from './album.js';
import { initMotion } from './motion.js';
import { initAtmosphere } from './atmosphere.js';
import { initSceneCuts } from './scene-cuts.js';
import { openRitual } from './opening.js';
import { initServices } from './services.js';
import { initTeam } from './team.js';
import { initProducts } from './products.js';
import { initGallery } from './gallery.js';
import { initMap } from './map.js';

const root = document.documentElement;
root.classList.add('enhanced');
startMotion();

function initialize(init) {
  try { init(); } catch (error) { console.error('Componente Sr. Navalha:', error); }
}

// As entradas e os componentes visuais visíveis precisam ser registrados antes
// da primeira pintura; os controles abaixo da dobra podem esperar a cortina.
for (const init of [initMotion, initAtmosphere, initSceneCuts]) initialize(init);

let extrasReady = false;
let lateFallback;
function initializeExtras() {
  if (extrasReady) return;
  extrasReady = true;
  clearTimeout(lateFallback);
  for (const init of [initServices, initTeam, initProducts, initAlbum, initGallery, initMap]) {
    initialize(init);
  }

  const menu = $('.menu');
  if (menu) {
    $$('.menu nav a').forEach(a => a.addEventListener('click', () => { menu.open = false; }));
    document.addEventListener('click', e => {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.open) {
        menu.open = false;
        $('summary', menu)?.focus();
      }
    });
    matchMedia('(min-width:1001px)').addEventListener('change', () => { menu.open = false; });
  }
  $$('img').forEach(img => {
    img.addEventListener('error', () => {
      img.classList.add('image-unavailable');
      img.alt = 'Fotografia indisponível: ' + img.alt;
    });
  });
}

// Evita executar componentes não críticos no mesmo quadro em que a marca e o
// hero estão entrando. Interromper a abertura libera o restante imediatamente.
document.addEventListener('openingend', () => { setTimeout(initializeExtras, 48); }, { once: true });
lateFallback = setTimeout(initializeExtras, 3400);

openRitual().catch(error => {
  console.error('Abertura:', error);
  root.classList.remove('sr-loader-boot', 'sr-opening-reveal');
  $('#sr-loader-stage')?.remove();
  initializeExtras();
});
