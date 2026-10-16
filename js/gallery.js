/* The real scrollLeft is the only position. GSAP never moves a parallel track. */
(() => {
  const root=document.querySelector('[data-gallery]');if(!root)return;
  const viewport=root.querySelector('.sr-gallery__viewport'),slides=[...root.querySelectorAll('.sr-gallery__image')];
  const previous=root.querySelector('[data-gallery-prev]'),next=root.querySelector('[data-gallery-next]');
  const count=root.querySelector('[data-gallery-count]'),progress=root.querySelector('[data-gallery-progress]');
  const reduced=()=>window.SrMotion?.preferences().reduced??matchMedia('(prefers-reduced-motion: reduce)').matches;
  const enhanced=!!window.gsap;
  const events=new AbortController(),signal=events.signal;
  let frame=0,settled=0,drag=null,positionTween=null,detailTween=null,destination=null,lastLeft=viewport.scrollLeft,pointerActive=false,touchActive=false;
  const wrappers=slides.map(slide=>{
    const image=slide.querySelector('img'),wrapper=document.createElement('div');wrapper.className='motion-gallery-media';image.before(wrapper);wrapper.append(image);return wrapper;
  });
  const step=()=>slides.length>1?slides[1].offsetLeft-slides[0].offsetLeft:viewport.clientWidth;
  const maximum=()=>Math.max(0,viewport.scrollWidth-viewport.clientWidth);
  if(enhanced)viewport.classList.add('motion-gallery');
  function cancel(){
    positionTween?.kill();positionTween=null;destination=null;
    const left=viewport.scrollLeft;viewport.classList.add('is-user-scrolling');viewport.classList.remove('is-programmatic');
    viewport.scrollTo({left,behavior:'instant'});schedule();
  }
  function update(){
    frame=0;
    const left=viewport.scrollLeft,size=step(),index=Math.max(0,Math.min(slides.length-1,Math.round(left/size)));
    previous.disabled=left<=2;next.disabled=left>=maximum()-2;
    root.closest('.sr-gallery__layout').style.setProperty('--editorial-progress',String(maximum()?left/maximum():0));
    slides.forEach((slide,number)=>slide.classList.toggle('is-active',number===index));
    const amount=.2+.8*(maximum()?left/maximum():1);
    progress.style.transform=`scaleX(${amount})`;
    if(enhanced&&!reduced()){
      detailTween?.kill();
      const limit=innerWidth<=760?3:6;
      const drift=Math.max(-limit,Math.min(limit,(left-lastLeft)*-.2));
      if(Math.abs(left-lastLeft)>.1){viewport.style.setProperty('--gallery-drift',`${drift}px`);viewport.style.setProperty('--gallery-zoom','1.08');}
    }
    lastLeft=left;clearTimeout(settled);
    settled=setTimeout(()=>{
      const last=Math.min(slides.length,Math.round((left+viewport.clientWidth+12)/size));
      const label=`${String(index+1).padStart(2,'0')}–${String(Math.max(index+1,last)).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
      if(count.textContent!==label){count.textContent=label;if(enhanced&&!reduced())gsap.fromTo(count,{yPercent:22,opacity:.45},{yPercent:0,opacity:1,duration:.3,ease:'power3.out',clearProps:'transform,opacity',overwrite:true});}
      if(!pointerActive&&!touchActive&&!positionTween)viewport.classList.remove('is-user-scrolling');
      if(enhanced&&!reduced())detailTween=gsap.to(viewport,{'--gallery-drift':'0px','--gallery-zoom':1,duration:.42,ease:'power3.out'});
      else{viewport.style.removeProperty('--gallery-drift');viewport.style.removeProperty('--gallery-zoom');}
    },140);
  }
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  function go(left){
    positionTween?.kill();positionTween=null;
    destination=Math.max(0,Math.min(maximum(),left));
    if(reduced()){viewport.scrollTo({left:destination,behavior:'instant'});destination=null;return;}
    if(!enhanced){viewport.scrollTo({left:destination,behavior:'smooth'});return;}
    viewport.classList.add('is-programmatic');
    positionTween=gsap.to(viewport,{scrollLeft:destination,duration:.68,ease:'power3.out',overwrite:true,
      onComplete:()=>{positionTween=null;destination=null;viewport.classList.remove('is-programmatic','is-user-scrolling');schedule();}});
  }
  previous.addEventListener('click',()=>go((destination??viewport.scrollLeft)-step()),{signal});
  next.addEventListener('click',()=>go((destination??viewport.scrollLeft)+step()),{signal});
  viewport.addEventListener('scroll',schedule,{passive:true,signal});
  viewport.addEventListener('wheel',cancel,{passive:true,signal});
  viewport.addEventListener('keydown',event=>{
    const position=destination??viewport.scrollLeft;
    const moves={ArrowLeft:()=>go(position-step()),ArrowRight:()=>go(position+step()),Home:()=>go(0),End:()=>go(maximum())};
    if(moves[event.key]){event.preventDefault();moves[event.key]();}
    else if(['Tab','PageUp','PageDown',' '].includes(event.key))cancel();
  },{signal});
  viewport.addEventListener('pointerdown',event=>{
    pointerActive=true;if(event.pointerType==='touch')touchActive=true;cancel();detailTween?.kill();
    if(event.pointerType!=='mouse'||event.button!==0||maximum()<2)return;
    drag={x:event.clientX,left:viewport.scrollLeft,moved:false,id:event.pointerId};viewport.setPointerCapture(event.pointerId);
  },{signal});
  viewport.addEventListener('pointermove',event=>{
    if(!drag)return;const distance=event.clientX-drag.x;if(Math.abs(distance)>6)drag.moved=true;
    if(!drag.moved)return;viewport.classList.add('is-dragging');event.preventDefault();viewport.scrollLeft=drag.left-distance;
  },{signal});
  function release(){
    pointerActive=false;
    if(!drag){schedule();return;}const {moved,id}=drag;drag=null;
    if(viewport.hasPointerCapture(id))viewport.releasePointerCapture(id);viewport.classList.remove('is-dragging');
    if(moved)go(Math.round(viewport.scrollLeft/step())*step());else schedule();
  }
  ['pointerup','pointercancel','lostpointercapture'].forEach(type=>viewport.addEventListener(type,release,{signal}));
  ['touchend','touchcancel'].forEach(type=>viewport.addEventListener(type,()=>{touchActive=false;schedule();},{passive:true,signal}));
  const resize='ResizeObserver'in window?new ResizeObserver(()=>{cancel();schedule();}):null;resize?.observe(viewport);
  addEventListener('sr:motionchange',()=>{cancel();detailTween?.kill();viewport.style.removeProperty('--gallery-drift');viewport.style.removeProperty('--gallery-zoom');gsapAvailableClear();schedule();},{signal});
  function gsapAvailableClear(){if(enhanced)gsap.set(count,{clearProps:'transform,opacity'});}
  addEventListener('sr:motiondispose',()=>{cancel();detailTween?.kill();clearTimeout(settled);if(frame)cancelAnimationFrame(frame);resize?.disconnect();events.abort();wrappers.forEach(wrapper=>wrapper.replaceWith(...wrapper.childNodes));},{once:true});
  update();
})();
