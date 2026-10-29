/* The finished cut releases the hero; the hero owns its own finite effects.
   No loader timing constants, clones, CSS hiding queues or per-frame reads. */
import { $, $$, animate, canMove } from './core.js';

export function initHeroExperience() {
  const hero = $('.hero');
  if (!hero) {
    document.documentElement.classList.remove('sr-hero-queued');
    return;
  }
  const root = document.documentElement;
  const motion = new Set();
  // Finished animations need to stay filled until the very last element
  // lands. Track every effect separately so none is leaked on cleanup.
  const allEffects = new Set();
  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    // Release author opacity and WAAPI fill in one task (one paint).
    // This prevents an early-settled image from flashing back to invisible.
    root.classList.remove('sr-hero-queued');
    for (const animation of allEffects) animation.cancel();
    allEffects.clear();
    motion.clear();
    hero.classList.remove('is-arriving');
  };
  const controller = new AbortController();
  function settle() {
    stop();
    controller.abort();
  }
  document.addEventListener('openingend', event => {
    if (!event.detail?.completed || !canMove() || scrollY > 20) {
      settle();return;
    }
    hero.classList.add('is-arriving');
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!canMove() || scrollY > 20 || $('#sr-loader-stage')) return settle();
      const mobile = matchMedia('(max-width:700px)').matches;
      // A small logo settle follows the completed FLIP, using the real node.
      // Two impacts with diminishing energy; paper keeps its resting angle.
      const tracks = [
        ['.hero-pole__object',                 0,  880, 62, 12, 0],
        ['.hero-wordmark > span',             65,  740, 20,  3, 0],
        ['h1',                              130,  870, 54,  7, 0],
        ['.hero-intro',                      210,  790, 38,  5, 0],
        ['.hero-facade',                     290, 1020, 76, 11, -1.2],
        ['.hero-room',                       360, 1060, 82, 12, .8],
        ['.hero-detail',                     420,  950, 60,  9, 1.1],
        ['.hero-invitation > p',             480,  750, 32,  4, 0],
        ['.hero-invitation > .button',       540,  670, 24,  3, 0],
        ['.hero-invitation > .text-link',    580,  670, 22,  3, 0],
        ['.hero-bottom',                    620,  700, 24,  3, 0]
      ];
      // Batch all geometry/computed-style reads before any animation writes.
      const snapshots = tracks.flatMap(([selector,delay,duration,distance,rebound,angle]) =>
        $$(selector,hero).filter(node => node.getClientRects().length).map(node => ({
          node,delay,duration,distance,rebound,angle,base:getComputedStyle(node).transform
        })));
      const epoch = document.timeline.currentTime;
      try {
        for (const {node,delay,duration,distance,rebound,angle,base} of snapshots) {
          const drop = distance * (mobile ? .65 : 1), bounce = rebound * (mobile ? .7 : 1);
          const suffix = base === 'none' ? '' : ` ${base}`;
          const at = (y,rotation=0) => `translate3d(0,${y}px,0) rotate(${rotation}deg)${suffix}`;
          const animation = animate(node,[
            {offset:0, opacity:0, transform:at(-drop,angle), easing:'cubic-bezier(.42,0,1,1)'},
            {offset:.46, opacity:1, transform:at(0), easing:'cubic-bezier(0,0,.35,1)'},
            {offset:.64, opacity:1, transform:at(-bounce,-angle*.25), easing:'cubic-bezier(.42,0,1,1)'},
            {offset:.79, opacity:1, transform:at(0), easing:'cubic-bezier(0,0,.35,1)'},
            {offset:.89, opacity:1, transform:at(-bounce*.24,angle*.08), easing:'cubic-bezier(.42,0,1,1)'},
            {offset:1, opacity:1, transform:base}
          ], {duration:duration*(mobile?.86:1), delay:delay*(mobile?.8:1),
               easing:'linear',fill:'both',persist:true});
          if (!animation) continue;
          animation.id='sr-hero-drop';
          animation.startTime=epoch;
          motion.add(animation);
          allEffects.add(animation);
          animation.finished.catch(()=>{}).finally(()=>{
            motion.delete(animation);
            if (!motion.size) settle();
          });
        }
        if (!motion.size) settle();
      } catch { settle(); }
    });
  }, {once:true,signal:controller.signal});
  // Any interaction wins immediately. These listeners exist only for the intro.
  for(const type of ['wheel','touchstart','pointerdown','keydown','pagehide'])
    addEventListener(type,settle,{passive:true,signal:controller.signal});
  addEventListener('resize',()=>{if(motion.size||frame)settle()},{passive:true,signal:controller.signal});
  hero.addEventListener('focusin',settle,{signal:controller.signal});
  document.addEventListener('motionchange',()=>{if(!canMove())settle()},{signal:controller.signal});

  // Pause, never remove, the two independent rotor animations: preserve phase.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.some(entry=>entry.isIntersecting);
      hero.classList.toggle('is-poles-visible',visible);
    });
    observer.observe($('.hero-pole',hero));
  }
}
