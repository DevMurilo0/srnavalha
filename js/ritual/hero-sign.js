/* Barber pole noir: one subtle object settle + a single photographic
   light sweep after the Perfect Cut. No hero geometry or headline is altered.
   Rotor movement is independent and respects motion/visibility preferences. */
import { $, animate, canMove } from './core.js';

export function initHeroSign() {
  const object = $('.hero-pole__object');
  const hero = $('.hero');
  if (!object || !hero) return;

  let revealed = false;
  const reveal = () => {
    if (revealed || !canMove() || window.scrollY > 20) return;
    revealed = true;
    animate(object, [
      { opacity: 0, transform: 'translate3d(0,-11px,0) rotate(-10deg)' },
      { opacity: 1, transform: 'translate3d(0,0,0) rotate(-5deg)' }
    ], { duration: 990, easing: 'cubic-bezier(.16,1,.3,1)' });

    // Let the loader finish removing its composited surfaces before passing
    // a narrow editorial highlight across the three real hero photos.
    requestAnimationFrame(() => {
      if (!canMove() || window.scrollY > 20) return;
      hero.classList.add('sr-hero-sheen');
    });
  };

  if (document.documentElement.classList.contains('sr-loader-boot')) {
    document.addEventListener('openingend', reveal, { once: true });
  } else {
    // Deep links, back/forward restores and reduced motion keep a static hero.
    // On a normal non-loader visit the pole remains visible immediately.
  }
}
