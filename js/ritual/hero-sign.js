/* One settling gesture, owned by the existing reduced-motion/visibility lifecycle. */
import { $, animate, canMove } from './core.js';

export function initHeroSign() {
  const face = $('.hero-sign__face');
  if (!face) return;
  const reveal = () => {
    if (!canMove() || window.scrollY > 20) return;
    const rest = getComputedStyle(face).transform;
    animate(face, [
      { opacity: 0, transform: 'perspective(700px) translateY(-7px) rotateX(-9deg) rotateY(-8deg) rotateZ(-4deg)' },
      { opacity: 1, transform: rest }
    ], { duration: 1050, easing: 'cubic-bezier(.16,1,.3,1)' });
  };
  // Registered before openRitual: also handles its synchronous early exits.
  // Without JS, or if the opening module fails, the CSS default is fully visible.
  if (document.documentElement.classList.contains('sr-loader-boot')) {
    document.addEventListener('openingend', reveal, { once: true });
  }
}
