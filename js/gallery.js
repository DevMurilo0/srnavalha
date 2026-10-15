(() => {
  const root = document.querySelector('[data-gallery]');
  if (!root) return;
  const viewport = root.querySelector('.sr-gallery__viewport');
  const slides = [...root.querySelectorAll('.sr-gallery__image')];
  const previous = root.querySelector('[data-gallery-prev]');
  const next = root.querySelector('[data-gallery-next]');
  const count = root.querySelector('[data-gallery-count]');
  const progress = root.querySelector('[data-gallery-progress]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, settled = 0, drag = null;
  const step = () => slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : viewport.clientWidth;
  const max = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  function update() {
    frame = 0;
    const left = viewport.scrollLeft, size = step();
    previous.disabled = left <= 2;
    next.disabled = left >= max() - 2;
    const index = Math.max(0, Math.min(slides.length - 1, Math.round(left / size)));
    slides.forEach((slide, number) => slide.classList.toggle('is-active', number === index));
    progress.style.setProperty('--gallery-progress', String(.2 + .8 * (max() ? left / max() : 1)));
    clearTimeout(settled);
    settled = setTimeout(() => {
      const last = Math.min(slides.length, Math.round((left + viewport.clientWidth + 12) / size));
      count.textContent = `${String(index + 1).padStart(2,'0')}–${String(Math.max(index+1,last)).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    }, 130);
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  function go(left) { viewport.scrollTo({ left:Math.max(0,Math.min(max(),left)), behavior:motion.matches ? 'auto' : 'smooth' }); }
  previous.addEventListener('click', () => go(viewport.scrollLeft - step()));
  next.addEventListener('click', () => go(viewport.scrollLeft + step()));
  viewport.addEventListener('scroll', schedule, { passive:true });
  viewport.addEventListener('keydown', (event) => {
    const moves = { ArrowLeft:() => go(viewport.scrollLeft-step()), ArrowRight:() => go(viewport.scrollLeft+step()), Home:() => go(0), End:() => go(max()) };
    if (moves[event.key]) { event.preventDefault(); moves[event.key](); }
  });
  // Touch uses the browser's native scrolling and momentum. Mouse drag adds the same affordance.
  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || max() < 2) return;
    drag = { x:event.clientX, left:viewport.scrollLeft, moved:false, id:event.pointerId };
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const distance = event.clientX - drag.x;
    if (Math.abs(distance) > 6) drag.moved = true;
    if (!drag.moved) return;
    viewport.classList.add('is-dragging');
    event.preventDefault();
    viewport.scrollLeft = drag.left - distance;
  });
  function release() {
    if (!drag) return;
    const moved = drag.moved, id = drag.id;
    drag = null;
    if (viewport.hasPointerCapture(id)) viewport.releasePointerCapture(id);
    viewport.classList.remove('is-dragging');
    if (moved) go(Math.round(viewport.scrollLeft / step()) * step());
  }
  viewport.addEventListener('pointerup', release);
  viewport.addEventListener('pointercancel', release);
  viewport.addEventListener('lostpointercapture', release);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(viewport);
  else addEventListener('resize', schedule, { passive:true });
  motion.addEventListener('change', () => { if (motion.matches) viewport.scrollTo({left:viewport.scrollLeft,behavior:'instant'}); });
  update();
})();
