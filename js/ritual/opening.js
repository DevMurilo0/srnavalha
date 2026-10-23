/* Sr. Navalha · Abertura harmoniosa.
   Uma única superfície desliza enquanto o hero entra em sequência por CSS.
   As animações usam apenas transform e opacity para evitar repinturas caras. */
import { $, animate, canMove, cancelWithin, flow } from './core.js';

export async function openRitual() {
  const root = document.documentElement;
  const overlay = document.getElementById('sr-loader-stage');
  let finished = false;
  let watchdog;
  const controller = new AbortController();

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(watchdog);
    controller.abort();
    if (overlay) cancelWithin(overlay);
    root.classList.remove('sr-loader-boot', 'sr-loader-revealing');
    overlay?.remove();
    document.dispatchEvent(new CustomEvent('openingend'));
  }

  if (!overlay || !root.classList.contains('sr-loader-boot') || !canMove()) {
    finish();
    return;
  }

  // Abertura sempre existe em F5, Ctrl+Shift+R e novas visitas. Não bloqueia
  // âncoras internas ou quem prefere movimento reduzido.
  const atTop = (!location.hash || location.hash === '#inicio') && scrollY < 20;
  if (!atTop) {
    finish();
    return;
  }

  const background = $('.sr-prelude__backdrop', overlay);
  const brand = $('.sr-prelude__brand', overlay);
  const baseline = $('.sr-prelude__baseline', overlay);
  if (!background || !brand || !baseline || !('animate' in background)) {
    finish();
    return;
  }

  // Um clique ou rolagem interrompe sem deixar o site congelado.
  for (const type of ['wheel', 'pointerdown', 'keydown', 'touchstart']) {
    window.addEventListener(type, finish, {
      once: true, passive: true, signal: controller.signal
    });
  }
  document.addEventListener('motionchange', () => {
    if (!canMove()) finish();
  }, { signal: controller.signal });
  watchdog = window.setTimeout(finish, 2200);

  try {
    // Permite ao navegador compor pelo menos um quadro estável da marca antes
    // de iniciar a saída; nenhum swap de innerHTML, SVG ou fotografia aqui.
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (finished) return;

    // O hero permanece coberto até entrar nessa fase; os grupos recebem
    // pequenos atrasos via CSS. O fundo sai como uma folha de papel.
    root.classList.add('sr-loader-revealing');

    animate(brand, [
      { opacity: 1, transform: 'translate3d(-50%, -50%, 0) scale(1)' },
      { opacity: 0, transform: 'translate3d(-50%, -54%, 0) scale(.96)' }
    ], { duration: 430, delay: 120, easing: flow, fill: 'both', persist: true });

    animate(baseline, [
      { opacity: 1, transform: 'translate3d(-50%, 0, 0)' },
      { opacity: 0, transform: 'translate3d(-50%, 13px, 0)' }
    ], { duration: 320, delay: 140, easing: flow, fill: 'both', persist: true });

    // Uma única animação grande, em vez de vários clip-paths, filtros e
    // fotografias animados ao mesmo tempo.
    const reveal = animate(background, [
      { transform: 'translate3d(0, 0, 0)' },
      { transform: 'translate3d(0, -102%, 0)' }
    ], {
      duration: 1050,
      delay: 200,
      easing: 'cubic-bezier(.27, 1, .39, 1)',
      fill: 'both',
      persist: true
    });
    if (reveal) await reveal.finished.catch(() => {});
    // O final do hero é ligeiramente posterior à saída da cortina.
    if (!finished) await new Promise(resolve => setTimeout(resolve, 130));
  } catch (error) {
    console.warn('Abertura: usando visualização direta', error);
  } finally {
    finish();
  }
}
