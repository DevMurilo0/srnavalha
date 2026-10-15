(() => {
  const header = document.querySelector('.sr-header');
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('#sr-mobile-nav');
  const mobileBooking = document.querySelector('[data-mobile-booking]');
  const hero = document.querySelector('#hero');
  const footer = document.querySelector('.sr-footer');
  const background = [...document.querySelectorAll('main, footer, .skip-link, .sr-mobile-booking')];
  const savedInert = new Map();
  let frame = 0, oldOverflow = '';
  function update() {
    frame = 0;
    header?.classList.toggle('sr-header--scrolled', scrollY > 24);
    const length = document.documentElement.scrollHeight - innerHeight;
    header?.style.setProperty('--page-progress', String(length > 0 ? Math.min(1,scrollY/length) : 0));
    if (hero && mobileBooking) {
      const show = innerWidth <= 760 && hero.getBoundingClientRect().bottom <= 0 && footer.getBoundingClientRect().top > innerHeight + 30;
      mobileBooking.classList.toggle('is-visible', show);
      mobileBooking.setAttribute('aria-hidden', String(!show));
      mobileBooking.querySelector('a').tabIndex = show ? 0 : -1;
    }
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  function setMenu(open, focus = true) {
    if (!toggle || !menu || (toggle.getAttribute('aria-expanded') === 'true') === open) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.setAttribute('aria-hidden', String(!open));
    menu.inert = !open;
    menu.classList.toggle('is-open',open);
    document.querySelector('[data-menu-open-icon]').toggleAttribute('hidden', open);
    document.querySelector('[data-menu-close-icon]').toggleAttribute('hidden', !open);
    menu.querySelectorAll('a').forEach(link => { link.tabIndex = open ? 0 : -1; });
    if (open) {
      oldOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      background.forEach(item => { savedInert.set(item,item.inert); item.inert=true; });
      menu.querySelector('a')?.focus({preventScroll:true});
    } else {
      document.body.style.overflow = oldOverflow;
      background.forEach(item => { item.inert=savedInert.get(item) || false; });
      savedInert.clear();
      if (focus) toggle.focus({preventScroll:true});
    }
  }
  menu?.querySelectorAll('nav a').forEach((link,index) => link.style.setProperty('--menu-index',index));
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown', event => {
    if (toggle?.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') { event.preventDefault(); setMenu(false); }
    if (event.key === 'Tab') {
      const focusable = [toggle,...menu.querySelectorAll('a')];
      const first=focusable[0],last=focusable[focusable.length-1];
      if (event.shiftKey && document.activeElement===first) { event.preventDefault();last.focus(); }
      else if (!event.shiftKey && document.activeElement===last) { event.preventDefault();first.focus(); }
    }
  });
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',()=>{ if(innerWidth>1040) setMenu(false,false);schedule(); },{passive:true});
  const links=[...document.querySelectorAll('[data-section-link]')];
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>{
      entries.filter(entry=>entry.isIntersecting).forEach(entry=>{
        links.forEach(link=>{
          const active=link.dataset.sectionLink===entry.target.id;
          link.classList.toggle('is-active',active);
          if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
        });
      });
    },{rootMargin:'-12% 0px -65% 0px'});
    links.forEach(link=>{const section=document.getElementById(link.dataset.sectionLink);if(section)observer.observe(section);});
  }
  document.querySelectorAll('[data-current-year]').forEach(item=>item.textContent=new Date().getFullYear());
  update();
})();
