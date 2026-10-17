(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const playing = new Set();
  const byElement = new WeakMap();
  const animate = (element, frames, options = {}) => {
    if (!element || reduced.matches || !element.animate) return null;
    byElement.get(element)?.cancel();
    const animation = element.animate(frames, { duration: 240, easing: 'cubic-bezier(.22,1,.36,1)', ...options });
    byElement.set(element, animation);
    playing.add(animation);
    animation.finished.catch(() => {}).finally(() => {
      playing.delete(animation);
      if (byElement.get(element) === animation) byElement.delete(element);
    });
    return animation;
  };
  window.SrNavalha = { reduced, animate };
  reduced.addEventListener('change', () => {
    if (reduced.matches) [...playing].forEach(animation => animation.cancel());
  });

  const menu = document.querySelector('.mobile-menu');
  const closeMenu = (restore = false) => {
    if (!menu?.open) return;
    menu.open = false;
    if (restore) menu.querySelector('summary').focus({ preventScroll: true });
  };
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(true); });
  document.addEventListener('pointerdown', event => { if (menu && !menu.contains(event.target)) closeMenu(); });
  menu?.addEventListener('focusout', () => requestAnimationFrame(() => {
    if (!menu.contains(document.activeElement)) closeMenu();
  }));
  matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  if ('IntersectionObserver' in window) {
    const navigation = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => {
        navLinks.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -55% 0px' });
    navLinks.forEach(link => { const section = document.querySelector(link.hash); if (section) navigation.observe(section); });
  }

  document.querySelectorAll('.service-entry').forEach((entry, index) => {
    const summary = entry.querySelector('summary');
    let sizeAnimation;
    let closing = false;
    summary.addEventListener('click', event => {
      event.preventDefault();
      const start = entry.getBoundingClientRect().height;
      sizeAnimation?.cancel();
      const opening = !entry.open || closing;
      closing = !opening;
      if (opening) entry.open = true;
      const end = opening ? entry.scrollHeight : summary.getBoundingClientRect().height;
      if (reduced.matches || !entry.animate) {
        entry.open = opening;
        closing = false;
        return;
      }
      sizeAnimation = entry.animate([{ height: start + 'px' }, { height: end + 'px' }], { duration: opening ? 280 : 200, easing: 'cubic-bezier(.22,1,.36,1)' });
      const current = sizeAnimation;
      playing.add(current);
      current.finished.then(() => { if (sizeAnimation === current) { entry.open = opening; closing = false; } }).catch(() => {
        if (reduced.matches && sizeAnimation === current) { entry.open = opening; closing = false; }
      }).finally(() => playing.delete(current));
      if (opening) {
        const masks = ['inset(0 100% 0 0)', 'inset(100% 0 0 0)', 'inset(0 0 0 100%)'];
        animate(entry.querySelector('img'), [{ clipPath: masks[index], transform: 'scale(1.035)' }, { clipPath: 'inset(0 0 0 0)', transform: 'scale(1)' }], { duration: 650 });
        animate(entry.querySelector('.service-copy'), [{ opacity: .4, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }]);
      }
    });
  });

  const map = document.querySelector('.map-surface');
  const mapButton = document.querySelector('.map-toggle');
  if (map && mapButton) {
    const frame = map.querySelector('iframe');
    const setMap = active => {
      map.classList.toggle('is-guarded', !active);
      frame.tabIndex = active ? 0 : -1;
      mapButton.setAttribute('aria-pressed', String(active));
      mapButton.textContent = active ? 'Desativar interação com o mapa' : 'Ativar interação com o mapa';
    };
    setMap(false);
    mapButton.hidden = false;
    mapButton.addEventListener('click', () => setMap(mapButton.getAttribute('aria-pressed') !== 'true'));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && mapButton.getAttribute('aria-pressed') === 'true') { setMap(false); mapButton.focus({ preventScroll: true }); } });
  }

  // Entry animation only: no permanently hidden CSS or scroll-blocking timeline.
  const intro = () => {
    const hero = document.querySelector('.hero');
    if (!hero || scrollY > innerHeight * .5) return;
    animate(hero.querySelector('h1'), [{ clipPath: 'inset(0 0 70% 0)', transform: 'translateY(12px)' }, { clipPath: 'inset(0 0 0 0)', transform: 'translateY(0)' }], { duration: 680 });
    hero.querySelectorAll('.hero-frame img').forEach((img, index) => animate(img, [
      { clipPath: index % 2 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)', transform: 'translateY(12px)' },
      { clipPath: 'inset(0 0 0 0)', transform: 'translateY(0)' }
    ], { duration: 700, delay: index * 65, fill: 'backwards' }));
    animate(hero.querySelector('.mirror-mark'), [{ opacity: .4, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 550 });
  };
  if (document.fonts) document.fonts.ready.then(intro); else intro();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (entry.target.getBoundingClientRect().bottom < 0) return;
      animate(entry.target, [{ clipPath: 'inset(0 0 45% 0)', opacity: .5 }, { clipPath: 'inset(0 0 0 0)', opacity: 1 }], { duration: 650 });
    }), { threshold: .12 });
    document.querySelectorAll('.room-mat img,.team-record figure,.invitation-sheet').forEach(element => observer.observe(element));
  }
})();
