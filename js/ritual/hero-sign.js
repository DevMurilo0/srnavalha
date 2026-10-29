/* Sr. Navalha V7 — editorial reveal during The Perfect Cut.
 * Photos are uncovered in place (opacity + clip-path); typography and controls
 * fade in. NEVER animate transform on the hero's layout, photographs or logo:
 * the paper angles and geometry remain identical before and after the reveal.
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

      // An editorial reading order, from signature to photographs and CTA.
      // Times are relative to the scissors crossing the viewport midpoint.
      // 'photo' reveals its actual figure from top down, without moving it.
      const tracks = [
        ['.hero-pole__object',                 0, 490, 'fade'],
        ['.hero-wordmark > span',             45, 460, 'fade'],
        ['h1',                               80, 570, 'fade'],
        ['.hero-intro',                      140, 530, 'fade'],
        ['.hero-facade',                     185, 690, 'photo'],
        ['.hero-room',                       240, 720, 'photo'],
        ['.hero-detail',                     290, 660, 'photo'],
        ['.hero-invitation > p',             330, 520, 'fade'],
        ['.hero-invitation > .button',       395, 500, 'fade'],
        ['.hero-invitation > .text-link',    430, 450, 'fade'],
        ['.hero-bottom',                     475, 460, 'fade']
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
                {offset:.28, opacity:.84, clipPath:'inset(0 0 65% 0)'},
                {offset:1, opacity:1, clipPath:'inset(0 0 0% 0)'}
              ]
            : [
                {offset:0, opacity:0},
                {offset:1, opacity:1}
              ];
          const effect = animate(node,frames,{
            delay:Math.round(delay*(mobile?.82:1)),
            duration:Math.round(duration*(mobile?.85:1)),
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
    if (!event.detail?.completed) settle();
    else if (!started) beginReveal();
  },{once:true,signal:controller.signal});

  for(const type of ['wheel','touchstart','pointerdown','keydown','pagehide'])
    addEventListener(type,settle,{passive:true,signal:controller.signal});
  addEventListener('resize',()=>{if(active.size||frame)settle()},
    {passive:true,signal:controller.signal});
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
