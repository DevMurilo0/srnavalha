/* One compositor animation, one original data group; clones are decorative only. */
(() => {
  const root=document.querySelector('[data-reviews]'),data=window.SrReviews;
  if(!root||!data?.items?.length)return;
  const viewport=root.querySelector('[data-review-window]'),track=root.querySelector('[data-review-track]');
  const group=root.querySelector('[data-review-original]'),cards=[...group.children];
  if(cards.length!==data.items.length||cards.some((card,i)=>card.dataset.reviewId!==data.items[i].id)||!track.animate)return;
  const toggle=root.querySelector('[data-review-toggle]'),label=root.querySelector('[data-review-toggle-label]'),icon=root.querySelector('[data-review-toggle-icon]');
  const instructions=root.querySelector('[data-review-instructions]'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const events=new AbortController(),signal=events.signal;
  let animation=null,cycle=0,duration=0,speed=30,ramp=0,resizeFrame=0,disposed=false;
  let userPaused=false,hovered=false,focused=false,visible=false,manual=false,width=0;
  const modulo=(n,d)=>((n%d)+d)%d;
  const phase=()=>cycle?(manual?modulo(viewport.scrollLeft,cycle):modulo(Number(animation?.currentTime||0)/duration*cycle,cycle)):0;
  const clones=()=>track.querySelectorAll('[data-review-clone]');
  function controls(){
    toggle.hidden=motion.matches;toggle.setAttribute('aria-pressed',String(userPaused));
    label.textContent=userPaused?'Reproduzir':'Pausar';icon.textContent=userPaused?'▷':'Ⅱ';
    instructions.textContent=motion.matches?'Deslize para ler as quatro avaliações.':userPaused?'Movimento pausado. Deslize para ler com calma.':'Toque nos cards ou use Pausar para ler com calma.';
  }
  function enterManual(){
    if(manual||!animation)return;
    const left=phase();animation.pause();animation.currentTime=0;manual=true;
    root.classList.add('is-manual');viewport.scrollLeft=left;
  }
  function leaveManual(){
    if(!manual||!animation)return;
    const left=phase();manual=false;animation.currentTime=left/cycle*duration;
    viewport.scrollLeft=0;root.classList.remove('is-manual');
  }
  function changeRate(target,immediate=false){
    cancelAnimationFrame(ramp);ramp=0;if(!animation||motion.matches)return;
    if(target){leaveManual();animation.play();}
    const initial=animation.playbackRate,start=performance.now();
    if(immediate){animation.playbackRate=target;if(!target)enterManual();return;}
    const step=now=>{
      if(disposed||!animation)return;const t=Math.min(1,(now-start)/650),ease=t*t*(3-2*t);
      animation.playbackRate=initial+(target-initial)*ease;
      if(t<1)ramp=requestAnimationFrame(step);
      else{ramp=0;if(!target)enterManual();}
    };
    ramp=requestAnimationFrame(step);
  }
  function update(immediate=false){
    controls();changeRate(!userPaused&&!hovered&&!focused&&visible&&!document.hidden?1:0,immediate);
  }
  function rebuild(){
    if(disposed)return;
    const fraction=cycle?phase()/cycle:0;cancelAnimationFrame(ramp);ramp=0;animation?.cancel();animation=null;
    clones().forEach(clone=>clone.remove());root.classList.remove('is-marquee','is-manual');manual=false;
    track.style.removeProperty('transform');viewport.scrollLeft=0;
    if(motion.matches){cycle=0;controls();return;}
    cycle=group.getBoundingClientRect().width;speed=parseFloat(getComputedStyle(root).getPropertyValue('--reviews-speed'))||30;
    if(!cycle||speed<=0)return;
    // Include the trailing gutter in the period. The next group's first card meets it exactly.
    const copies=Math.max(1,Math.ceil(viewport.clientWidth/cycle));
    for(let i=0;i<copies;i++){
      const clone=group.cloneNode(true);clone.removeAttribute('data-review-original');clone.setAttribute('data-review-clone','');clone.setAttribute('aria-hidden','true');clone.inert=true;
      clone.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
      clone.querySelectorAll('[data-review-id]').forEach(e=>e.removeAttribute('data-review-id'));
      clone.querySelectorAll('a,button,input,[tabindex]').forEach(e=>e.setAttribute('tabindex','-1'));track.append(clone);
    }
    duration=cycle/speed*1000;
    animation=track.animate([{transform:'translate3d(0,0,0)'},{transform:`translate3d(${-cycle}px,0,0)`}],{duration,iterations:Infinity,easing:'linear'});
    animation.playbackRate=0;animation.currentTime=fraction*duration;root.classList.add('is-marquee');update(true);
  }
  toggle.addEventListener('click',()=>{userPaused=!userPaused;update();},{signal});
  viewport.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&matchMedia('(hover:hover)').matches){hovered=true;update();}},{signal});
  viewport.addEventListener('pointerleave',()=>{hovered=false;update();},{signal});
  viewport.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'&&!motion.matches){userPaused=true;update(true);}},{passive:true,signal});
  viewport.addEventListener('focusin',event=>{
    focused=true;update(true);
    // Native scrolling can expose any original link, including one that just passed offscreen.
    event.target.closest('.sr-review')?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  },{signal});
  viewport.addEventListener('focusout',()=>queueMicrotask(()=>{focused=viewport.contains(document.activeElement);update();}),{signal});
  document.addEventListener('visibilitychange',()=>update(true),{signal});
  motion.addEventListener('change',rebuild,{signal});
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update(!visible);},{threshold:0});observer.observe(root);
  const resize=()=>{if(viewport.clientWidth===width)return;width=viewport.clientWidth;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(rebuild);};
  const sizing='ResizeObserver'in window?new ResizeObserver(resize):null;sizing?.observe(viewport);
  if(!sizing)addEventListener('resize',resize,{passive:true,signal});
  document.fonts?.ready.then(()=>{if(!disposed)rebuild();});width=viewport.clientWidth;rebuild();
  addEventListener('sr:motiondispose',()=>{disposed=true;events.abort();observer.disconnect();sizing?.disconnect();cancelAnimationFrame(ramp);cancelAnimationFrame(resizeFrame);animation?.cancel();clones().forEach(clone=>clone.remove());root.classList.remove('is-marquee','is-manual');toggle.hidden=true;},{once:true});
})();
