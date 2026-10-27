/* Entrance settle for the physical barber pole. The rotating striped rotor
   lives on a child layer, so it never restarts while the object enters.
   The shared motion lifecycle pauses its spin in hidden tabs. */
import { $, animate, canMove } from './core.js';

export function initHeroSign() {
  const object = $('.hero-pole__object');
  if (!object) return;
  const reveal = () => {
    if (!canMove() || window.scrollY > 20) return;
    animate(object, [
      { opacity: 0, transform: 'translate3d(0,-11px,0) rotate(-10deg)' },
      { opacity: 1, transform: 'translate3d(0,0,0) rotate(-5deg)' }
    ], { duration: 990, easing: 'cubic-bezier(.16,1,.3,1)' });
  };
  if (document.documentElement.classList.contains('sr-loader-boot')) {
    document.addEventListener('openingend', reveal, { once: true });
  }
}
