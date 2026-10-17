(() => {
  'use strict';
  const viewport = document.querySelector('.reviews-viewport');
  const group = viewport?.querySelector('.reviews-group');
  const control = document.querySelector('.marquee-control');
  if (!group || !control) return;
  const { reduced } = window.SrNavalha;
  let paused = false, hover = false, focused = false, visible = true;
  let raf = 0, last = 0, velocity = 30, cycle = 0, position = 0, lastWritten = 0;
  const updateControl = () => {
    control.textContent = paused ? 'Reproduzir movimento' : 'Pausar movimento';
    control.setAttribute('aria-pressed', String(paused));
  };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; last = 0; };
  const tick = time => {
    raf = 0;
    const dt = last ? Math.min((time - last) / 1000, .05) : 0;
    last = time;
    const target = paused || hover || focused ? 0 : 30;
    velocity += (target - velocity) * (1 - Math.exp(-dt * 9));
    if (Math.abs(velocity) < .02) velocity = 0;
    if (cycle && velocity) {
      // Keep fractional pixels between frames: scrollLeft may be rounded by the browser.
      if (Math.abs(viewport.scrollLeft - lastWritten) > 1.5) position = viewport.scrollLeft;
      position = (position + velocity * dt) % cycle;
      viewport.scrollLeft = position;
      lastWritten = viewport.scrollLeft;
    }
    if (!reduced.matches && visible && !document.hidden && (target || velocity)) raf = requestAnimationFrame(tick);
    else last = 0;
  };
  const start = () => { if (!raf && !reduced.matches && visible && !document.hidden) raf = requestAnimationFrame(tick); };
  const measure = () => { cycle = group.getBoundingClientRect().width; if (cycle) { position = viewport.scrollLeft % cycle; viewport.scrollLeft = position; lastWritten = viewport.scrollLeft; } };
  const setup = () => {
    stop();
    viewport.querySelectorAll('[data-review-clone]').forEach(clone => clone.remove());
    viewport.classList.toggle('is-running', !reduced.matches);
    control.hidden = reduced.matches;
    viewport.scrollLeft = 0;
    position = lastWritten = 0;
    if (reduced.matches) return;
    const clone = group.cloneNode(true);
    clone.dataset.reviewClone = '';
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    clone.querySelectorAll('a').forEach(link => link.tabIndex = -1);
    viewport.querySelector('.reviews-track').append(clone);
    measure();
    velocity = paused ? 0 : 30;
    start();
  };
  control.addEventListener('click', () => { paused = !paused; updateControl(); start(); });
  viewport.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hover = true; start(); } });
  viewport.addEventListener('pointerleave', () => { hover = false; start(); });
  viewport.addEventListener('focusin', () => { focused = true; start(); });
  viewport.addEventListener('focusout', () => requestAnimationFrame(() => { focused = viewport.contains(document.activeElement); start(); }));
  const manualPause = () => { paused = true; velocity = 0; updateControl(); stop(); };
  viewport.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') manualPause(); }, { passive: true });
  viewport.addEventListener('wheel', event => { if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) manualPause(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
  reduced.addEventListener('change', setup);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(group);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) start(); else stop();
  }, { rootMargin: '150px' }).observe(viewport);
  updateControl();
  setup();
})();
