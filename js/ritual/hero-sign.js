/* Sr. Navalha — editorial entrance during The Perfect Cut.
 * The photographs are uncovered in their resting positions (opacity + clip-path).
 * Text and controls receive a small, independent translate + opacity entrance.
 * Never animate transform on figures, their layout, or the official FLIP logo.
 * The final position and paper angles remain exactly as authored.
 */
import { $, $$, animate, canMove } from './core.js';

export function initHeroExperience() {
  const hero = $('.hero');
  const root = document.documentElement;
  if (!hero) {
    root.classList.remove('sr-hero-queued');
    return;
  }

  const controller = new AbortController();
  const effects = new Set();
  const active = new Set();
  let frame = 0;
  let started = false;

  const settle = () => {
    if (controller.signal.aborted) return;
    cancelAnimationFrame(frame);
    frame = 0;
    // Author CSS opacity and WAAPI fill swap in the same rendering turn.
    root.classList.remove('sr-hero-queued');
    hero.classList.remove('is-arriving');
    for (const effect of effects) {
      try { effect.cancel(); } catch {}
    }
    effects.clear();
    active.clear();
    controller.abort();
  };

  const beginReveal = () => {
    if (started || controller.signal.aborted) return;
    if (!canMove() || scrollY > 20) return settle();
    started = true;
    hero.classList.add('is-arriving');

    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!canMove() || scrollY > 20) return settle();
      const mobile = matchMedia('(max-width:700px)').matches;

      // As the scissors descend, their panels uncover the scene from the top.
      // The previous short fades finished BEHIND those panels and seemed absent.
      // Stagger the editorial entrance into the uncovered area; it intentionally
      // continues after the panels open, but never starts as a second animation.
      const tracks = [
        ['.hero-pole__object',                35, 640, 'fade'],
        ['.hero-wordmark > span',             80, 670, 'fade'],
        ['h1',                              135, 770, 'fade'],
        ['.hero-intro',                      225, 720, 'fade'],
        ['.hero-facade',                     380, 860, 'photo'],
        ['.hero-room',                       440, 920, 'photo'],
        ['.hero-detail',                     535, 840, 'photo'],
        ['.hero-invitation > p',             565, 730, 'fade'],
        ['.hero-invitation > .button',       680, 750, 'fade'],
        ['.hero-invitation > .text-link',    765, 690, 'fade'],
        ['.hero-bottom',                     825, 680, 'fade']
      ];

      // Keep the existing geometry intact: no reads or writes to transform.
      const targets = tracks.flatMap(([selector,delay,duration,type]) =>
        $$(selector,hero)
          .filter(node => node.getClientRects().length > 0)
          .map(node => ({node,delay,duration,type})));
      const epoch = document.timeline.currentTime;
      try {
        for (const {node,delay,duration,type} of targets) {
          const frames = type === 'photo'
            ? [
                {offset:0, opacity:0, clipPath:'inset(0 0 100% 0)'},
                {offset:1, opacity:1, clipPath:'inset(0 0 0% 0)'}
              ]
            : [
                {offset:0, opacity:0, translate:'0 14px'},
                {offset:1, opacity:1, translate:'0 0px'}
              ];
          const effect = animate(node,frames,{
            delay:Math.round(delay*(mobile?.90:1)),
            duration:Math.round(duration*(mobile?.92:1)),
            easing:'cubic-bezier(.22,1,.36,1)',
            fill:'both',
            persist:true
          });
          if (!effect) continue;
          effect.id='sr-hero-reveal';
          if (epoch != null) effect.startTime=epoch;
          effects.add(effect);
          active.add(effect);
          effect.finished.catch(()=>{}).finally(()=>{
            active.delete(effect);
            if (!active.size) settle();
          });
        }
        if (!active.size) settle();
      } catch (error) {
        console.error('Sr. Navalha: falha na revelação do hero',error);
        settle();
      }
    });
  };

  // Reuse the existing reliable milestone of the scissors in the centre.
  // A missed midpoint does not leave the hero invisible: completion recovers.
  document.addEventListener('openingcutmidpoint',beginReveal,
    {once:true,signal:controller.signal});
  document.addEventListener('openingend',event=>{
    // Interrupted loader must release every node immediately. A missed
    // midpoint on normal completion is static, never a late second entrance.
    if (!event.detail?.completed || !started) settle();
  },{once:true,signal:controller.signal});

  for(const type of ['wheel','touchstart','pointerdown','keydown','pagehide'])
    addEventListener(type,settle,{passive:true,signal:controller.signal});
  const initialWidth = innerWidth;
  addEventListener('resize',()=>{
    // The mobile address bar changes viewport HEIGHT, not its composition.
    if (Math.abs(innerWidth-initialWidth)>2 && (active.size||frame)) settle();
  },{passive:true,signal:controller.signal});
  hero.addEventListener('focusin',settle,{signal:controller.signal});
  document.addEventListener('motionchange',()=>{if(!canMove())settle()},
    {signal:controller.signal});

  // The decorative rotors still spin in their own layers, independently.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      hero.classList.toggle('is-poles-visible',
        entries.some(entry=>entry.isIntersecting));
    });
    observer.observe($('.hero-pole',hero));
  }
}
