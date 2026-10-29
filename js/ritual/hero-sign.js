/* Sr. Navalha — cinematic hero entrance after The Perfect Cut.
 * All entrance targets are hidden BEFORE the first paint by hero-sign.css.
 * Wait for the sheets to leave the viewport: otherwise the animation runs
 * behind them and looks like nothing happened. Keep the real logo owned by
 * the loader handoff, and never change figure geometry or authored angles.
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
    // Remove the CSS parking and filled animation in the same rendering turn.
    // Nothing snaps back or becomes visible at its initial state.
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
    if (!canMove() || scrollY > 20 || !root.classList.contains('sr-hero-queued')) {
      settle();
      return;
    }
    started = true;
    hero.classList.add('is-arriving');

    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!canMove() || scrollY > 20) return settle();
      const mobile = matchMedia('(max-width:700px)').matches;

      // Deliberately visible stagger: bold typography, an unmistakable photo
      // uncover, then copy/CTA. The official logo does not move twice.
      // Node coordinates and figure rotations never change.
      const tracks = [
        ['.hero-pole__object',                 0, 830, 'pole'],
        ['.hero-wordmark > span',            100, 700, 'rise'],
        ['h1',                              115, 960, 'headline'],
        ['.hero-intro',                     275, 820, 'rise'],
        ['.hero-facade',                    355,1080, 'photo'],
        ['.hero-room',                      460,1130, 'photo'],
        ['.hero-detail',                    570,1050, 'photo'],
        ['.hero-invitation > p',            640, 850, 'rise'],
        ['.hero-invitation > .button',      770, 870, 'cta'],
        ['.hero-invitation > .text-link',   865, 750, 'rise'],
        ['.hero-bottom',                    950, 750, 'rise']
      ];
      const targets = tracks.flatMap(([selector,delay,duration,type]) =>
        $$(selector,hero)
          .filter(node => node.getClientRects().length > 0)
          .map(node => ({node,delay,duration,type})));

      const epoch = document.timeline.currentTime;
      const play = (node,frames,delay,duration,id) => {
        const effect = animate(node,frames,{
          delay:Math.round(delay*(mobile?.85:1)),
          duration:Math.round(duration*(mobile?.88:1)),
          easing:'cubic-bezier(.2,.75,.2,1)',
          fill:'both',persist:true
        });
        if (!effect) return;
        effect.id=id;
        if (epoch != null) effect.startTime=epoch;
        effects.add(effect);
        active.add(effect);
        effect.finished.catch(()=>{}).finally(()=>{
          active.delete(effect);
          if (!active.size) settle();
        });
      };

      try {
        for (const {node,delay,duration,type} of targets) {
          const frames = type === 'photo'
            ? [
                {offset:0, opacity:0, clipPath:'inset(0 0 100% 0)'},
                {offset:.62, opacity:1, clipPath:'inset(0 0 24% 0)'},
                {offset:1, opacity:1, clipPath:'inset(0 0 0% 0)'}
              ]
            : [
                {offset:0, opacity:0, translate:type==='pole'?'0 -64px':type==='headline'?'0 72px':'0 48px',
                  ...(type==='cta'?{scale:.90}:{})},
                {offset:1, opacity:1, translate:'0 0px',
                  ...(type==='cta'?{scale:1}:{})}
              ];
          play(node,frames,delay,duration,'sr-hero-reveal');
          if (type === 'photo') {
            // The frame never leaves its paper position; only the photograph
            // inside slowly resolves from a close crop into the final crop.
            const image = $('.photo-window img',node);
            if (image) play(image,[
              {scale:1.14},{scale:1}
            ],delay,duration+180,'sr-hero-photo-depth');
          }
        }
        if (!active.size) settle();
      } catch (error) {
        console.error('Sr. Navalha: falha na revelação do hero',error);
        settle();
      }
    });
  };

  // Keep tracking the scissors' midpoint for the ritual's shared timeline,
  // but do not play while opaque panels still conceal the hero.
  let cutReached=false;
  document.addEventListener('openingcutmidpoint',()=>{
    cutReached=true;
  },{once:true,signal:controller.signal});
  document.addEventListener('openingend',event=>{
    if (!event.detail?.completed) return settle();
    // Normal completion is sufficient even if the midpoint timer was missed.
    // Starting in the same task that removes the stage avoids a visible flash.
    if (!cutReached) console.info('Sr. Navalha: corte concluído sem marcador intermediário');
    beginReveal();
  },{once:true,signal:controller.signal});

  for(const type of ['wheel','touchstart','pointerdown','keydown','pagehide'])
    addEventListener(type,settle,{passive:true,signal:controller.signal});
  const initialWidth=innerWidth;
  addEventListener('resize',()=>{
    if (Math.abs(innerWidth-initialWidth)>2 && (active.size||frame)) settle();
  },{passive:true,signal:controller.signal});
  hero.addEventListener('focusin',settle,{signal:controller.signal});
  document.addEventListener('motionchange',()=>{if(!canMove())settle()},
    {signal:controller.signal});

  // Decorative poles spin only while visible; entrance does not restart them.
  if ('IntersectionObserver' in window) {
    const pole=$('.hero-pole',hero);
    if (pole) {
      const observer=new IntersectionObserver(entries=>{
        hero.classList.toggle('is-poles-visible',
          entries.some(entry=>entry.isIntersecting));
      });
      observer.observe(pole);
    }
  }
}
