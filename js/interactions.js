(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const hero=document.querySelector('.sr-hero');
  let heroFrame=0,position=null;
  function drawHero(){
    heroFrame=0;
    if(!position||motion.matches||!fine.matches)return;
    const {x,y}=position;
    hero.style.setProperty('--look-x',`${((x-.5)*-8).toFixed(2)}px`);
    hero.style.setProperty('--look-y',`${((y-.5)*-6).toFixed(2)}px`);
    hero.style.setProperty('--hero-pointer-x',`${(x*100).toFixed(1)}%`);
    hero.style.setProperty('--hero-pointer-y',`${(y*100).toFixed(1)}%`);
  }
  function resetHero(){
    position=null;
    if(heroFrame)cancelAnimationFrame(heroFrame);heroFrame=0;
    hero?.style.setProperty('--look-x','0px');hero?.style.setProperty('--look-y','0px');
  }
  hero?.addEventListener('pointermove',event=>{
    if(motion.matches||!fine.matches||event.pointerType==='touch')return;
    const box=hero.getBoundingClientRect();
    position={x:Math.max(0,Math.min(1,(event.clientX-box.left)/box.width)),y:Math.max(0,Math.min(1,(event.clientY-box.top)/box.height))};
    if(!heroFrame)heroFrame=requestAnimationFrame(drawHero);
  },{passive:true});
  hero?.addEventListener('pointerleave',resetHero);
  document.querySelectorAll('.sr-btn, .sr-service').forEach(item=>{
    let frame=0,point=null;
    const card=item.classList.contains('sr-service');
    function clear(){
      point=null;if(frame)cancelAnimationFrame(frame);frame=0;
      ['--magnet-x','--magnet-y','--tilt-x','--tilt-y','--pointer-x','--pointer-y'].forEach(property=>item.style.removeProperty(property));
    }
    item.addEventListener('pointermove',event=>{
      if(motion.matches||!fine.matches||event.pointerType==='touch')return;
      point={x:event.clientX,y:event.clientY};
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;if(!point)return;
        const box=item.getBoundingClientRect(),x=(point.x-box.left)/box.width,y=(point.y-box.top)/box.height;
        if(card){
          item.style.setProperty('--pointer-x',`${x*100}%`);item.style.setProperty('--pointer-y',`${y*100}%`);
          item.style.setProperty('--tilt-x',`${((.5-y)*.7).toFixed(2)}deg`);item.style.setProperty('--tilt-y',`${((x-.5)*.7).toFixed(2)}deg`);
        }else{
          item.style.setProperty('--magnet-x',`${((x-.5)*5).toFixed(2)}px`);item.style.setProperty('--magnet-y',`${((y-.5)*4).toFixed(2)}px`);
        }
      });
    },{passive:true});
    item.addEventListener('pointerleave',clear);item.addEventListener('blur',clear);
    motion.addEventListener('change',clear);fine.addEventListener('change',clear);
  });
  motion.addEventListener('change',resetHero);fine.addEventListener('change',resetHero);
  // Native details are preserved as the keyboard/no-JS/reduced-motion fallback.
  document.querySelectorAll('.sr-faq-item').forEach(details=>{
    const summary=details.querySelector('summary');let animation=null,expanded=details.open;
    summary.addEventListener('click',event=>{
      if(motion.matches||!details.animate)return;
      event.preventDefault();
      const start=details.getBoundingClientRect().height;
      animation?.cancel();expanded=!expanded;
      details.open=true;
      const end=expanded?details.scrollHeight:summary.getBoundingClientRect().height;
      details.style.overflow='hidden';
      summary.setAttribute('aria-expanded',String(expanded));
      animation=details.animate([{height:`${start}px`},{height:`${end}px`}],{duration:300,easing:'cubic-bezier(.22,1,.36,1)'});
      animation.onfinish=()=>{details.open=expanded;details.style.overflow='';animation=null;summary.removeAttribute('aria-expanded');};
    });
    details.addEventListener('toggle',()=>{if(!animation)expanded=details.open;});
    motion.addEventListener('change',()=>{if(animation){animation.cancel();details.open=expanded;details.style.overflow='';summary.removeAttribute('aria-expanded');animation=null;}});
  });
})();
