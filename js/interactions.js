/* Scoped microinteractions. FAQ falls back to native details when motion is unavailable/reduced. */
(() => {
  const M=window.SrMotion;if(!M)return;
  M.use('interactions',scope=>{
    const events=new AbortController(),signal=events.signal;
    scope.add(()=>events.abort());
    if(scope.conditions.desktop&&scope.conditions.fine){
      const hero=document.querySelector('.sr-hero'),media=hero?.querySelector('.sr-hero__media');
      if(hero&&media){
        scope.save(media,hero);
        const x=gsap.quickTo(media,'--hero-look-x',{duration:.85,ease:'power3.out'}),y=gsap.quickTo(media,'--hero-look-y',{duration:.85,ease:'power3.out'});
        hero.addEventListener('pointermove',event=>{
          if(event.pointerType==='touch')return;
          const rect=hero.getBoundingClientRect(),px=(event.clientX-rect.left)/rect.width,py=(event.clientY-rect.top)/rect.height;
          x((px-.5)*-5);y((py-.5)*-4);
          hero.style.setProperty('--hero-pointer-x',`${px*100}%`);hero.style.setProperty('--hero-pointer-y',`${py*100}%`);
        },{passive:true,signal});
        hero.addEventListener('pointerleave',()=>{x(0);y(0);},{signal});
      }
      // Magnetism is reserved for the primary filled CTAs.
      document.querySelectorAll('.sr-btn--filled').forEach(button=>{
        scope.save(button);
        const x=gsap.quickTo(button,'--magnet-x',{duration:.38,ease:'power3.out'}),y=gsap.quickTo(button,'--magnet-y',{duration:.38,ease:'power3.out'});
        button.addEventListener('pointermove',event=>{const rect=button.getBoundingClientRect();x(((event.clientX-rect.left)/rect.width-.5)*5);y(((event.clientY-rect.top)/rect.height-.5)*4);},{passive:true,signal});
        const reset=()=>{x(0);y(0);};button.addEventListener('pointerleave',reset,{signal});button.addEventListener('blur',reset,{signal});
      });
      // Reflection belongs to each print; scroll drift remains owned by the gallery viewport.
      document.querySelectorAll('.sr-gallery__image,.sr-team__image').forEach(photo=>{
        scope.save(photo);const look=gsap.quickTo(photo,'--photo-look',{duration:.6,ease:'power3.out'});
        photo.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;const rect=photo.getBoundingClientRect(),ratio=(event.clientX-rect.left)/rect.width;look((ratio-.5)*5);photo.style.setProperty('--reflection-x',`${(ratio-.5)*24}%`);},{passive:true,signal});
        photo.addEventListener('pointerleave',()=>{look(0);photo.style.removeProperty('--reflection-x');},{signal});
      });
      document.querySelectorAll('.sr-service').forEach(card=>{
        scope.save(card);let frame=0,point=null;
        card.addEventListener('pointermove',event=>{
          point={x:event.clientX,y:event.clientY};if(frame)return;
          frame=requestAnimationFrame(()=>{frame=0;if(!point)return;const rect=card.getBoundingClientRect();card.style.setProperty('--pointer-x',`${(point.x-rect.left)/rect.width*100}%`);card.style.setProperty('--pointer-y',`${(point.y-rect.top)/rect.height*100}%`);});
        },{passive:true,signal});
        card.addEventListener('pointerleave',()=>{point=null;card.style.removeProperty('--pointer-x');card.style.removeProperty('--pointer-y');},{signal});
        scope.add(()=>{if(frame)cancelAnimationFrame(frame);});
      });
    }
    document.querySelectorAll('.sr-faq-item').forEach(details=>{
      const summary=details.querySelector('summary'),body=details.querySelector('p'),icon=summary.querySelector('span');
      let expanded=details.open,timeline=null;scope.save(details,body,icon);details.classList.add('motion-faq');
      function settle(){
        timeline?.kill();timeline=null;details.open=expanded;
        gsap.set([details,body,icon],{clearProps:'height,overflow,opacity,transform'});
        details.removeAttribute('data-motion-open');summary.removeAttribute('aria-expanded');
      }
      summary.addEventListener('click',event=>{
        event.preventDefault();const start=details.getBoundingClientRect().height;
        timeline?.kill();expanded=!expanded;details.open=true;
        details.style.height='auto';
        const border=parseFloat(getComputedStyle(details).borderTopWidth)+parseFloat(getComputedStyle(details).borderBottomWidth);
        const end=expanded?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+border;
        gsap.set(details,{height:start,overflow:'hidden'});
        details.dataset.motionOpen=String(expanded);summary.setAttribute('aria-expanded',String(expanded));
        timeline=gsap.timeline({onComplete:settle})
          .to(details,{height:end,duration:.34,ease:'power2.inOut'},0)
          .to(icon,{rotation:expanded?45:0,duration:.32,ease:'power3.out'},0);
        if(expanded)timeline.fromTo(body,{opacity:.35,y:5},{opacity:1,y:0,duration:.26,ease:'power2.out'},.07);
        else timeline.to(body,{opacity:0,y:-3,duration:.18,ease:'power2.out'},0);
      },{signal});
      details.addEventListener('toggle',()=>{if(!timeline)expanded=details.open;},{signal});
      scope.add(()=>{settle();details.classList.remove('motion-faq');});
    });
  });
})();
