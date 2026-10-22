/* One entrance timeline. Native scrolling never writes to animated elements. */
(() => {
  'use strict';
  const hero = document.querySelector('.nv11-hero');
  const header = document.querySelector('.nv11-header');
  if (!hero || !header) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const animations = new Set();
  let curtain, safety, finishTimer, raf = 0, active = false;
  const finish = () => {
    clearTimeout(safety);
    clearTimeout(finishTimer);
    animations.forEach(animation => animation.cancel());
    animations.clear();
    curtain?.remove();
    curtain = null;
    active = false;
  };
  const updateHeader = () => {
    if (active && scrollY > 60) finish();
    if (!raf && !document.hidden) raf = requestAnimationFrame(() => {
      raf = 0;
      header.classList.toggle('nv11-scrolled', scrollY > 40);
    });
  };
  addEventListener('scroll', updateHeader, {passive: true, signal: events.signal});
  reduced.addEventListener('change', finish, {signal: events.signal});
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); }, {signal: events.signal});
  // Keyboard/pointer intent reveals every control immediately, even during the introduction.
  document.addEventListener('keydown', finish, {signal: events.signal});
  document.addEventListener('pointerdown', finish, {signal: events.signal});
  document.addEventListener('focusin', finish, {signal: events.signal});
  addEventListener('pagehide', event => {
    finish();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (!event.persisted) events.abort();
  }, {signal: events.signal});
  addEventListener('pageshow', event => {
    if (event.persisted) { finish(); header.classList.toggle('nv11-scrolled', scrollY > 40); }
  }, {signal: events.signal});
  updateHeader();
  if (reduced.matches || !Element.prototype.animate || scrollY > 100 || document.hidden || location.hash && location.hash !== '#inicio' && location.hash !== '#topo') return;
  try {
    active = true;
    curtain = document.createElement('div');
    curtain.className = 'nv11-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    curtain.innerHTML = '<div class="nv11-curtain-surface"></div><div class="nv11-curtain-mark"><img src="assets/images/v9/logo.webp" width="791" height="269" alt=""><span></span></div>';
    document.body.append(curtain);
    safety = setTimeout(finish, 1700);
    const ease = 'cubic-bezier(.23,1,.32,1)';
    const start = document.timeline.currentTime;
    const run = (element, frames, duration, delay = 0, easing = ease) => {
      if (!element) return;
      const animation = element.animate(frames, {duration, delay, easing, fill:'backwards'});
      animation.startTime = start;
      animations.add(animation);
    };
    // The dark surface lifts as a single mask; its motion reveals the photograph.
    run(curtain.querySelector('.nv11-curtain-surface'), [
      {clipPath:'inset(0 0 0 0)'}, {clipPath:'inset(0 0 100% 0)'}
    ], 760, 250, 'cubic-bezier(.76,0,.24,1)');
    // Keep the surface at its revealed state until the curtain is removed.
    const surfaceAnimation = [...animations][0];
    surfaceAnimation.effect.updateTiming({fill:'both'});
    run(curtain.querySelector('.nv11-curtain-mark'), [
      {opacity:1, transform:'translateY(0)'}, {opacity:0, transform:'translateY(-14px)'}
    ], 220, 330);
    [...animations].at(-1).effect.updateTiming({fill:'both'});
    run(curtain.querySelector('.nv11-curtain-mark span'), [{transform:'scaleX(.05)'},{transform:'scaleX(1)'}], 320);
    run(hero.querySelector('.nv2-picture picture'), [{transform:'scale(1.018)'},{transform:'scale(1)'}], 1000, 250);
    run(hero.querySelector('.nv2-eyebrow'), [{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0)'}], 550, 390);
    hero.querySelectorAll('.nv2-title-line>span').forEach((line, index) => {
      run(line, [{transform:'translateY(115%)'},{transform:'translateY(0)'}], 720, 420 + index * 85);
    });
    run(hero.querySelector('.nv2-subtitle'), [{clipPath:'inset(0 0 100% 0)',transform:'translateY(10px)'},{clipPath:'inset(0)',transform:'translateY(0)'}], 560, 630);
    run(hero.querySelector('.nv2-actions'), [{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}], 480, 700);
    run(hero.querySelector('.nv2-values'), [{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0)'}], 620, 700);
    finishTimer = setTimeout(finish, 1400);
  } catch { finish(); }
})();
