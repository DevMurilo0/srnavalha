(() => {
  document.documentElement.classList.replace('no-js','js');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.sr-cta .sr-btn').forEach(item => { item.dataset.reveal = ''; });
  const targets = [...document.querySelectorAll('[data-reveal]')];
  let revealObserver;
  function reveal() {
    revealObserver?.disconnect();
    if (motion.matches || !('IntersectionObserver' in window)) {
      targets.forEach(item => { item.classList.remove('reveal-ready'); item.classList.add('is-visible'); });
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold:.06, rootMargin:'0px 0px -24px 0px' });
    targets.forEach(item => {
      if (item.getBoundingClientRect().top < innerHeight * .94) item.classList.add('is-visible');
      else if (!item.classList.contains('is-visible')) item.classList.add('reveal-ready');
      revealObserver.observe(item);
    });
  }
  reveal();
  const images = [...document.querySelectorAll('[data-parallax]')];
  const visible = new Set();
  let frame = 0;
  function update() {
    frame = 0;
    if (motion.matches || document.hidden) return;
    visible.forEach(image => {
      const box = image.parentElement.getBoundingClientRect();
      const distance = Number(image.dataset.parallax || 12);
      const position = (innerHeight/2 - box.top - box.height/2)/(innerHeight + box.height);
      image.style.setProperty('--parallax-y', `${Math.max(-distance,Math.min(distance,position*distance*2)).toFixed(2)}px`);
    });
  }
  const schedule = () => { if (!frame && !motion.matches && visible.size) frame = requestAnimationFrame(update); };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
      schedule();
    }, { rootMargin:'60px' });
    images.forEach(image => observer.observe(image));
  }
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',schedule);
  motion.addEventListener('change', () => {
    reveal();
    if (motion.matches) images.forEach(image => image.style.removeProperty('--parallax-y'));
    else schedule();
  });
})();
