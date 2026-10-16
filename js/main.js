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
    updateActive();
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
  addEventListener('resize',()=>{ if(innerWidth>1040&&toggle?.getAttribute('aria-expanded')==='true'){setMenu(false,false);header.querySelector('.sr-header__logo')?.focus({preventScroll:true});}schedule(); },{passive:true});
  const links=[...document.querySelectorAll('[data-section-link]')];
  const nav=document.querySelector('.sr-header__nav');
  const indicator=document.createElement('span');indicator.className='motion-nav-indicator';indicator.setAttribute('aria-hidden','true');
  if(links.length){nav.append(indicator);nav.classList.add('motion-nav');}
  let active=links.find(link=>link.classList.contains('is-active'))||links[0];
  function moveIndicator(animate=true){
    if(!active||!nav||!nav.getClientRects().length)return;
    const box=active.getBoundingClientRect(),parent=nav.getBoundingClientRect();
    const target={x:box.left-parent.left,width:box.width,opacity:1};
    if(window.gsap){gsap.to(indicator,{...target,duration:animate&&!window.SrMotion?.preferences().reduced ? .45 : 0,ease:'power3.out',overwrite:true});}
    else{indicator.style.transform=`translateX(${target.x}px)`;indicator.style.width=`${target.width}px`;indicator.style.opacity='1';}
  }
  function select(link){
    active=link;
    links.forEach(item=>{const selected=item===link;item.classList.toggle('is-active',selected);if(selected)item.setAttribute('aria-current','location');else item.removeAttribute('aria-current');});
    moveIndicator();
  }
  // Semantic section state shares the header's existing rAF; no extra observer or scroll writer.
  const sections=links.map(link=>({link,node:document.getElementById(link.dataset.sectionLink)})).filter(item=>item.node).sort((a,b)=>a.node.compareDocumentPosition(b.node)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1);
  function updateActive(){
    let current=sections[0];const boundary=header.offsetHeight+40;
    sections.forEach(item=>{if(item.node.getBoundingClientRect().top<=boundary)current=item;});
    if(current&&current.link!==active)select(current.link);
  }
  const navResize=nav&&'ResizeObserver'in window?new ResizeObserver(()=>moveIndicator(false)):null;if(navResize)navResize.observe(nav);
  addEventListener('sr:motionchange',()=>moveIndicator(false));
  addEventListener('sr:motiondispose',()=>{navResize?.disconnect();window.gsap?.killTweensOf(indicator);},{once:true});
  active?.setAttribute('aria-current','location');
  document.fonts?.ready.then(()=>moveIndicator(false));
  document.querySelectorAll('[data-current-year]').forEach(item=>item.textContent=new Date().getFullYear());
  update();
})();
