/* O PRIMEIRO TRAÇO · Sr. Navalha V23
   Complete rework: two atelier leaves part around a copper hairline.
   Only compositor-friendly transforms / opacity; no clip-path paints,
   DOM cloning, fake progress timers or hero asset swaps. */
import { $, animate, canMove, cancelWithin } from './core.js';

const revealEase = 'cubic-bezier(.76,0,.22,1)';
const arriveEase = 'cubic-bezier(.22,1,.36,1)';

export async function openRitual() {
  const root = document.documentElement;
  const stage = document.getElementById('sr-loader-stage');
  const abort = new AbortController();
  let settled = false;
  let failsafe = 0;
  let revealTimer = 0;

  function finish() {
    if (settled) return;
    settled = true;
    clearTimeout(failsafe);
    clearTimeout(revealTimer);
    abort.abort();
    if (stage) cancelWithin(stage);
    root.classList.remove('sr-loader-boot', 'sr-opening-reveal', 'sr-loader-revealing');
    stage?.remove();
    document.dispatchEvent(new CustomEvent('openingend'));
  }

  if (!stage || !root.classList.contains('sr-loader-boot') || !canMove()) {
    finish();
    return;
  }
  // Do not drag a branded intro across an anchor/deep link.
  const topOfPage = (!location.hash || location.hash === '#inicio') &&
    window.scrollY < 20;
  if (!topOfPage) {
    finish();
    return;
  }

  const left = $('.sr-opening__door--left', stage);
  const right = $('.sr-opening__door--right', stage);
  const cut = $('.sr-opening__cut', stage);
  const mark = $('.sr-opening__identity', stage);
  const folio = $('.sr-opening__folio', stage);
  if (!left || !right || !cut || !mark) {
    finish();
    return;
  }

  // Always release content; even a blocked image or interrupted animation
  // must not trap the viewer behind a loading screen.
  failsafe = window.setTimeout(finish, 2600);
  $('#sr-opening-skip', stage)?.addEventListener('click', finish,
    { once: true, signal: abort.signal });
  for (const type of ['wheel', 'pointerdown', 'touchstart', 'keydown']) {
    window.addEventListener(type, finish,
      { once: true, passive: true, signal: abort.signal });
  }
  document.addEventListener('motionchange', () => {
    if (!canMove()) finish();
  }, { signal: abort.signal });

  try {
    // Give the compositor one real rendered frame to place the logo.
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (settled) return;
    const common = { easing: arriveEase, persist: true, fill: 'both' };
    animate(cut, [
      { transform: 'scaleY(.025)', opacity: 0, offset: 0 },
      { transform: 'scaleY(1)', opacity: 1, offset: .52 },
      { transform: 'scaleY(1)', opacity: 0, offset: 1 }
    ], { ...common, duration: 1120, delay: 110 });

    animate(mark, [
      { transform: 'translate3d(-50%,-50%,0) scale(1)', opacity: 1 },
      { transform: 'translate3d(-50%,-53%,0) scale(.97)', opacity: 0 }
    ], { ...common, duration: 530, delay: 460 });

    if (folio) animate(folio,
      [{ opacity: 1, transform: 'translate3d(0,0,0)' },
       { opacity: 0, transform: 'translate3d(0,10px,0)' }],
      { ...common, duration: 400, delay: 510 });

    // Animate hero while doors move, so text and photography are already
    // settled as the newly opened gap crosses them.
    revealTimer = window.setTimeout(() => {
      if (!settled) root.classList.add('sr-opening-reveal');
    }, 490);

    const options = {
      easing: revealEase, duration: 980, delay: 590,
      fill: 'both', persist: true
    };
    const doorL = animate(left, [
      { transform: 'translate3d(0,0,0)' },
      { transform: 'translate3d(-103%,0,0)' }
    ], options);
    const doorR = animate(right, [
      { transform: 'translate3d(0,0,0)' },
      { transform: 'translate3d(103%,0,0)' }
    ], options);

    // A completion signal, not a manufactured loading-percentage delay.
    await Promise.allSettled(
      [doorL?.finished, doorR?.finished].filter(Boolean)
    );
  } catch (error) {
    console.warn('Prólogo Sr. Navalha: recuperação visual aplicada', error);
  } finally {
    finish();
  }
}
