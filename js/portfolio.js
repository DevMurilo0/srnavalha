(() => {
  const section = document.querySelector('[data-portfolio]');
  const toggle = document.querySelector('[data-portfolio-toggle]');
  const dialog = document.querySelector('[data-lightbox]');
  if (!section || !toggle) return;

  const label = toggle.querySelector('[data-portfolio-toggle-label]');
  const items = [...section.querySelectorAll('[data-lightbox-item]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let expanded = false;
  let activeIndex = 0;
  let origin = null;
  let touchStartX = 0;

  section.hidden = true;

  function setExpanded(next) {
    expanded = next;
    toggle.setAttribute('aria-expanded', String(next));
    label.textContent = next ? 'VER MENOS TRABALHOS' : 'VER MAIS TRABALHOS';
    toggle.classList.toggle('is-expanded', next);

    if (next) {
      section.hidden = false;
      if (reduced.matches || !window.gsap) {
        section.style.removeProperty('height');
        section.style.removeProperty('overflow');
        return;
      }
      window.gsap.killTweensOf(section);
      window.gsap.fromTo(section, { height: 0, overflow: 'hidden' }, { height: 'auto', duration: .65, ease: 'power3.inOut', clearProps: 'height,overflow' });
      window.gsap.fromTo(items, { clipPath: 'inset(0 0 100% 0)', y: 18 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: .72, stagger: .09, delay: .12, ease: 'power3.inOut', clearProps: 'clipPath,transform' });
      return;
    }

    if (reduced.matches || !window.gsap) {
      section.hidden = true;
      return;
    }
    window.gsap.killTweensOf(section);
    window.gsap.to(section, { height: 0, overflow: 'hidden', duration: .48, ease: 'power3.inOut', onComplete: () => {
      section.hidden = true;
      section.style.removeProperty('height');
      section.style.removeProperty('overflow');
    }});
  }

  toggle.addEventListener('click', () => setExpanded(!expanded));

  if (!dialog || !items.length || typeof dialog.showModal !== 'function') return;
  const image = dialog.querySelector('[data-lightbox-image]');
  const caption = dialog.querySelector('[data-lightbox-caption]');

  function show(index) {
    activeIndex = (index + items.length) % items.length;
    const item = items[activeIndex];
    image.src = item.dataset.full;
    image.alt = item.querySelector('img').alt;
    caption.textContent = `${item.dataset.caption} · ${activeIndex + 1} de ${items.length}`;
  }

  function open(index, opener) {
    origin = opener;
    show(index);
    dialog.showModal();
    document.body.classList.add('has-lightbox');
    dialog.querySelector('[data-lightbox-close]').focus();
  }

  function close() {
    dialog.close();
  }

  items.forEach((item, index) => item.addEventListener('click', () => open(index, item)));
  dialog.querySelector('[data-lightbox-close]').addEventListener('click', close);
  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => show(activeIndex - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => show(activeIndex + 1));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('has-lightbox');
    image.removeAttribute('src');
    origin?.focus();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(activeIndex - 1);
    if (event.key === 'ArrowRight') show(activeIndex + 1);
  });
  dialog.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) show(activeIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });
})();
