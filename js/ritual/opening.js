/* NEGATIVO 349 · Sr. Navalha.
   A logo e uma fotografia irradiam linhas de cobre e encontram seus elementos no hero.
   Sem DOM teleport, sem máscaras pesadas, sem scroll lock nem bloqueio por sessão. */
import { $, $$, animate, canMove, cancelWithin } from './core.js';

const smooth = 'cubic-bezier(.22,1,.36,1)';
const arc = 'cubic-bezier(.55,0,.17,1)';

export async function openRitual() {
  const root = document.documentElement;
  const stage = $('#sr-loader-stage');
  const events = new AbortController();
  let completed = false;
  let failsafe;
  let revealTimer;
  const finish = () => {
    if (completed) return;
    completed = true;
    clearTimeout(failsafe);
    clearTimeout(revealTimer);
    events.abort();
    if (stage) cancelWithin(stage);
    root.classList.remove('sr-loader-boot', 'sr-burst-reveal');
    stage?.remove();
    document.dispatchEvent(new CustomEvent('openingend'));
  };

  if (!stage || !root.classList.contains('sr-loader-boot') || !canMove() ||
      scrollY > 20 || (location.hash && location.hash !== '#inicio')) {
    finish();
    return;
  }

  const photo = $('.sr-burst__photo', stage);
  const seal = $('.sr-burst__seal', stage);
  const destinationPhoto = $('.hero-room .photo-window');
  const destinationSeal = $('.hero-wordmark');
  const ground = $('.sr-burst__ground', stage);
  if (!photo || !seal || !destinationPhoto || !destinationSeal || !ground) {
    finish();
    return;
  }
  failsafe = setTimeout(finish, 2300);
  $('#sr-opening-skip', stage)?.addEventListener('click', finish, {
    once: true, signal: events.signal
  });
  for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown', 'pagehide']) {
    window.addEventListener(type, finish, {
      once: true, passive: true, signal: events.signal
    });
  }
  window.addEventListener('scroll', finish, {
    once: true, passive: true, signal: events.signal
  });
  window.addEventListener('resize', finish, {
    once: true, passive: true, signal: events.signal
  });
  document.addEventListener('motionchange', () => {
    if (!canMove()) finish();
  }, { signal: events.signal });

  try {
    // Capture geometry once before any animated writes.
    await new Promise(resolve => requestAnimationFrame(resolve));
    if (completed) return;
    const origins = [seal, photo].map(node => node.getBoundingClientRect());
    const targets = [destinationSeal, destinationPhoto].map(node => node.getBoundingClientRect());
    if ([...origins, ...targets].some(rect => !rect.width || !rect.height)) {
      finish();
      return;
    }
    const flight = (from, to) => ({
      x: to.left + to.width / 2 - from.left - from.width / 2,
      y: to.top + to.height / 2 - from.top - from.height / 2,
      scale: Math.max(.22, Math.min(2.8, to.width / from.width))
    });
    const transfer = [
      { node: seal, route: flight(origins[0], targets[0]), delay: 35, rise: -12 },
      { node: photo, route: flight(origins[1], targets[1]), delay: 95, rise: 22 }
    ];
    const animations = [];
    const run = (node, frames, options) => {
      if (!node) return null;
      const entry = animate(node, frames, {
        fill: 'both', persist: true, easing: smooth, ...options
      });
      if (entry) animations.push(entry);
      return entry;
    };

    for (const item of transfer) {
      const at = (x, y, scale) =>
        'translate(-50%,-50%) translate3d(' + x + 'px,' + y + 'px,0) scale(' + scale + ')';
      const route = item.route;
      run(item.node, [
        { transform: at(0, item.rise, .90), opacity: 0, offset: 0 },
        { transform: at(0, 0, 1), opacity: 1, offset: .29 },
        { transform: at(0, 0, 1.025), opacity: 1, offset: .46 },
        { transform: at(route.x, route.y, route.scale), opacity: 1, offset: .85 },
        { transform: at(route.x, route.y, route.scale), opacity: 0, offset: 1 }
      ], { duration: 1540, delay: item.delay, easing: arc });
    }
    $$('.sr-burst__beam', stage).forEach((beam, i) => {
      const angle = [-90, 0, 90, 180][i];
      const pos = scale => 'rotate(' + angle + 'deg) scaleX(' + scale + ')';
      run(beam, [
        { transform: pos(.03), opacity: 0, offset: 0 },
        { transform: pos(.65), opacity: .95, offset: .35 },
        { transform: pos(1.25), opacity: 0, offset: 1 }
      ], { duration: 850, delay: 330 + i * 32, easing: smooth });
    });
    for (const selector of ['.sr-burst__oversize', '.sr-burst__blueprint', '.sr-burst__signature']) {
      run($(selector, stage), [{ opacity: 1 }, { opacity: 0 }],
        { duration: 520, delay: 650 });
    }
    run(ground, [{ opacity: 1 }, { opacity: 0 }],
      { duration: 690, delay: 660, easing: smooth });
    revealTimer = setTimeout(() => {
      if (!completed) root.classList.add('sr-burst-reveal');
    }, 570);
    await Promise.allSettled(animations.map(item => item.finished));
  } catch (error) {
    console.warn('Negativo 349: recuperação visual aplicada', error);
  } finally {
    finish();
  }
}
