/* Sr. Navalha: one synchronized hero entrance, owned by Perfect Cut's
   document.timeline. NO post-loader shine, secondary reveal or independent
   motion clock. Every element enters from slightly ABOVE its final position.
   The caller owns animation cancellation on skip/error/pagehide. */
import { $ } from './core.js';

export function scheduleHeroEntrance(play, { tCut, CUT, mobile }) {
  const hero = $('.hero');
  if (!hero) return;

  // First the high ornament/logo area, then lettering, photography, CTA.
  // The cut is already revealing the hero when these delays elapse.
  const tracks = [
    ['.hero-pole__object',            .10, 700, 12],
    ['.hero-wordmark > span',         .22, 600, 10],
    ['.hero .title-mask > span',      .33, 750, 22],
    ['.hero-intro',                   .43, 650, 16],
    ['.hero-facade',                  .53, 760, 24],
    ['.hero-room',                    .63, 780, 24],
    ['.hero-detail',                  .72, 700, 18],
    ['.hero-invitation > p',          .74, 620, 14],
    ['.hero-invitation > .button',    .82, 640, 16],
    ['.hero-invitation > .text-link', .87, 590, 12],
    ['.hero-bottom',                  .88, 630, 10]
  ];

  for (const [selector, progress, duration, distance] of tracks) {
    const node = $(selector,hero);
    if (!node || getComputedStyle(node).display === 'none') continue;
    // Retain the intentional 2–4 degree photo-paper rotations in both
    // frames; moving a figure to transform:none would create a final snap.
    const original = getComputedStyle(node).transform;
    const destination = original === 'none' ? 'none' : original;
    const start = `translate3d(0,-${mobile ? Math.round(distance*.7) : distance}px,0)${original === 'none' ? '' : ' '+original}`;
    play(node,[
      { opacity: 0, transform: start },
      { opacity: 1, transform: destination }
    ],{
      duration: mobile ? Math.round(duration*.83) : duration,
      delay: tCut + CUT*progress,
      easing:'cubic-bezier(.22,1,.36,1)'
    });
  }
}
