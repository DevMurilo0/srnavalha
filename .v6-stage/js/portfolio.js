(() => {
  'use strict';
  const items = [...document.querySelectorAll('[data-work]')];
  const viewer = document.querySelector('.portfolio-viewer');
  const dialog = document.querySelector('.lightbox');
  if (!items.length || !viewer || !dialog || !dialog.showModal) return;
  const { animate, reduced } = window.SrNavalha;
  const works = items.map(item => ({ src: item.getAttribute('href'), title: item.dataset.title, description: item.dataset.description, alt: item.querySelector('img').alt, width: Number(item.querySelector('img').getAttribute('width')), height: Number(item.querySelector('img').getAttribute('height')) }));
  let selected = 0;
  let lightboxIndex = 0;
  let origin;
  let selectionVersion = 0;
  let lightboxVersion = 0;
  const normalize = index => (index + works.length) % works.length;
  const preload = work => { const img = new Image(); img.src = work.src; return img.decode().catch(() => {}); };
  works.forEach(preload);
  const swapImage = async (container, work, direction, valid) => {
    await preload(work);
    if (!valid()) return;
    const previous = container.querySelector('img');
    const next = new Image(work.width, work.height);
    next.src = work.src;
    next.alt = work.alt;
    next.draggable = false;
    previous.replaceWith(next);
    animate(next, [{ opacity: .45, clipPath: direction < 0 ? 'inset(0 0 0 65%)' : 'inset(0 65% 0 0)', transform: `translateX(${direction * 7}px)` }, { opacity: 1, clipPath: 'inset(0 0 0 0)', transform: 'translateX(0)' }], { duration: 260 });
  };
  const select = (index, direction = 1, keyboard = false) => {
    selected = normalize(index);
    const work = works[selected];
    const version = ++selectionVersion;
    viewer.querySelector('.viewer-title').textContent = work.title;
    viewer.querySelector('.viewer-description').textContent = work.description;
    viewer.querySelector('.viewer-counter').textContent = `${selected + 1} de ${works.length}`;
    const anchor = viewer.querySelector('.viewer-photo');
    anchor.href = work.src;
    anchor.setAttribute('aria-label', `Ampliar ${work.title}`);
    items.forEach((item, i) => { item.setAttribute('aria-current', i === selected ? 'true' : 'false'); });
    if (keyboard || reduced.matches) {
      const img = anchor.querySelector('img');
      img.getAnimations().forEach(animation => animation.cancel());
      Object.assign(img, { src: work.src, alt: work.alt, width: work.width, height: work.height });
    } else swapImage(anchor, work, direction, () => selectionVersion === version);
  };
  viewer.hidden = false;
  document.querySelector('.portfolio').classList.add('is-enhanced');
  items.forEach((item, index) => {
    item.setAttribute('aria-label', `Ver ${works[index].title}`);
    item.addEventListener('click', event => { event.preventDefault(); select(index, index < selected ? -1 : 1, event.detail === 0); });
  });
  viewer.querySelector('[data-work-prev]').addEventListener('click', event => select(selected - 1, -1, event.detail === 0));
  viewer.querySelector('[data-work-next]').addEventListener('click', event => select(selected + 1, 1, event.detail === 0));
  const workKeyboard = event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); select(selected + (event.key === 'ArrowLeft' ? -1 : 1), event.key === 'ArrowLeft' ? -1 : 1, true); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); select(event.key === 'Home' ? 0 : works.length - 1, 1, true); }
  };
  document.querySelector('.work-index').addEventListener('keydown', workKeyboard);
  viewer.addEventListener('keydown', workKeyboard);

  const renderLightbox = (index, direction = 1, keyboard = false) => {
    lightboxIndex = normalize(index);
    const work = works[lightboxIndex];
    const version = ++lightboxVersion;
    dialog.querySelector('figcaption').textContent = work.title + ' — ' + work.description;
    dialog.querySelector('.lightbox-counter').textContent = `${lightboxIndex + 1} de ${works.length}`;
    const container = dialog.querySelector('.lightbox-image-wrap');
    if (keyboard || reduced.matches) Object.assign(container.querySelector('img'), { src: work.src, alt: work.alt, width: work.width, height: work.height });
    else swapImage(container, work, direction, () => lightboxVersion === version);
  };
  const open = (index, trigger) => {
    origin = trigger;
    renderLightbox(index, 1, true);
    dialog.showModal();
    document.body.classList.add('modal-open');
    dialog.querySelector('.lightbox-close').focus({ preventScroll: true });
    animate(dialog.querySelector('figure'), [{ opacity: .35, transform: 'scale(.98)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 220 });
  };
  const close = () => dialog.close();
  viewer.querySelector('.viewer-photo').addEventListener('click', event => { event.preventDefault(); open(selected, event.currentTarget); });
  document.querySelectorAll('[data-open-work]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); open(Number(link.dataset.openWork), link); }));
  dialog.querySelector('.lightbox-close').addEventListener('click', close);
  dialog.querySelector('.prev').addEventListener('click', event => renderLightbox(lightboxIndex - 1, -1, event.detail === 0));
  dialog.querySelector('.photo-nav:not(.prev)').addEventListener('click', event => renderLightbox(lightboxIndex + 1, 1, event.detail === 0));
  dialog.addEventListener('close', () => {
    ++lightboxVersion;
    document.body.classList.remove('modal-open');
    origin?.focus({ preventScroll: true });
  });
  dialog.addEventListener('click', event => { if (event.target === dialog || event.target === dialog.querySelector('.lightbox-content')) close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); renderLightbox(lightboxIndex + (event.key === 'ArrowLeft' ? -1 : 1), event.key === 'ArrowLeft' ? -1 : 1, true); }
    if (event.key === 'Tab') {
      const controls = [...dialog.querySelectorAll('button')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  // Native vertical scrolling is left intact. Horizontal swipes select the next photograph.
  const gesture = (element, change) => {
    let start;
    let suppress = false;
    element.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || event.target.closest('button')) return;
      start = { x: event.clientX, y: event.clientY, time: performance.now(), id: event.pointerId };
      suppress = false;
    });
    element.addEventListener('pointermove', event => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        suppress = true;
        if (event.pointerType === 'mouse') element.setPointerCapture(event.pointerId);
      }
    });
    const finish = event => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (Math.abs(dx) > Math.abs(dy) * 1.3 && (Math.abs(dx) > 40 || (Math.abs(dx) > 18 && Math.abs(dx) / (performance.now() - start.time) > .4))) { suppress = true; change(dx < 0 ? 1 : -1); }
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      start = null;
    };
    element.addEventListener('pointerup', finish);
    element.addEventListener('pointercancel', () => { start = null; });
    element.addEventListener('click', event => { if (suppress) { event.preventDefault(); event.stopPropagation(); suppress = false; } }, true);
    element.addEventListener('dragstart', event => event.preventDefault());
  };
  gesture(viewer.querySelector('.viewer-photo-area'), direction => select(selected + direction, direction));
  gesture(dialog.querySelector('.lightbox-image-wrap'), direction => renderLightbox(lightboxIndex + direction, direction));
  select(0, 1, true);
})();
