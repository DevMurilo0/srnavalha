/* SplitText owns only generated text lines; masks never change title semantics. */
(() => {
  const M=window.SrMotion;if(!M)return;
  function label(node){return node.getAttribute('aria-label')||node.innerText.replace(/\s+/g,' ').trim();}
  function title(scope,node,options={}) {
    if(!node)return null;
    const accessible=label(node);let completed=M.session.titles.has(node)||node.getBoundingClientRect().bottom<0;
    const split=()=>scope.split(node,{type:'lines',mask:'lines',linesClass:'motion-line',autoSplit:true,aria:'auto',deepSlice:true,
      onSplit(self){
        node.setAttribute('aria-label',accessible);M.refresh();
        if(completed||M.session.titles.has(node))return gsap.set(self.lines,{yPercent:0,opacity:1});
        const settings={duration:options.duration||.95,ease:'power3.out',stagger:options.stagger??.09,
          onComplete:()=>{M.session.titles.add(node);if(!options.scrub)completed=true;},
          scrollTrigger:{trigger:options.trigger||node,start:options.start||'top 88%',
            ...(options.scrub?{end:options.end||'top 43%',scrub:options.scrub}:{once:true,fastScrollEnd:1800,toggleActions:'play none none none'})}};
        return gsap.fromTo(self.lines,{yPercent:options.distance||104,opacity:.35},{yPercent:0,opacity:1,...settings});
      }});
    if(node.getBoundingClientRect().top>innerHeight*1.2){
      // Keep distant titles in their original visible HTML until the section approaches.
      // SplitText owns/reverts the returned animation even when created inside this callback.
      return ScrollTrigger.create({trigger:options.trigger||node,start:'top 120%',once:true,onEnter:split});
    }
    return split();
  }
  function paragraph(scope,node,options={}) {
    if(!node)return;
    scope.save(node);
    return gsap.fromTo(node,{opacity:.4,y:5,...(options.blur&&scope.conditions.desktop?{filter:'blur(3px)'}:{})},
      {opacity:1,y:0,filter:'blur(0px)',duration:options.duration||.78,ease:'power2.out',delay:options.delay||0,
       clearProps:'opacity,transform,filter',scrollTrigger:{trigger:options.trigger||node,start:'top 90%',once:true,fastScrollEnd:1600}});
  }
  function hero(scope) {
    const root=document.querySelector('.sr-hero'),heading=root?.querySelector('h1');if(!heading)return;
    const accessible=label(heading),image=root.querySelector('.sr-hero__media img');
    const camera=scope.wrap(image,'motion-hero-camera');
    const header=document.querySelector('.sr-header__inner'),kicker=root.querySelector('.sr-kicker');
    const lede=root.querySelector('.sr-hero__lede'),actions=root.querySelector('.sr-hero__actions');
    const features=[...root.querySelectorAll('.sr-hero__features>div')],manifesto=root.querySelector('.sr-hero__manifesto');
    const lateral=manifesto?.querySelector('p');
    const lateralLabel=lateral?label(lateral):'';
    const words=lateral?scope.split(lateral,{type:'words',mask:'words',wordsClass:'motion-word',aria:'auto'}):null;
    if(lateral)lateral.setAttribute('aria-label',lateralLabel);
    const heroMedia=root.querySelector('.sr-hero__media');
    scope.save(header,kicker,camera,lede,actions,features,manifesto,heroMedia);
    scope.split(heading,{type:'lines',mask:'lines',linesClass:'motion-line',aria:'auto',autoSplit:true,deepSlice:true,
      onSplit(self){
        heading.setAttribute('aria-label',accessible);M.refresh();
        if(M.session.heroDone||scrollY>root.offsetHeight*.65){M.session.heroDone=true;return gsap.set(self.lines,{yPercent:0,opacity:1});}
        const tl=gsap.timeline({defaults:{ease:'power3.out'},onComplete:()=>{M.session.heroDone=true;M.session.headerDone=true;}});
        scope.hero=tl;
        tl.fromTo(header,{opacity:.55,y:-6},{opacity:1,y:0,duration:.5,clearProps:'opacity,transform'},0)
          .fromTo(kicker,{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)',duration:.6,clearProps:'opacity,clipPath'},.1)
          .fromTo(self.lines,{yPercent:108,opacity:.35},{yPercent:0,opacity:1,duration:1.02,stagger:.11},.2)
          .fromTo(heroMedia,{clipPath:'polygon(0 0, 94% 0, 85% 100%, 0 100%)'},{clipPath:'polygon(0 0, 100% 0, 100% 100%, 0 100%)',duration:1.2,ease:'power3.inOut',clearProps:'clipPath'},.05)
          .fromTo(camera,{scale:1.04},{scale:1,duration:1.85,ease:'power2.out',clearProps:'transform'},.05)
          .fromTo(lede,{opacity:.35,y:5,...(scope.conditions.desktop?{filter:'blur(3px)'}:{})},{opacity:1,y:0,filter:'blur(0px)',duration:.72,clearProps:'opacity,transform,filter'},.59)
          // CTAs remain clickable and readable from the first frame.
          .fromTo(actions,{opacity:.68,y:5},{opacity:1,y:0,duration:.6,clearProps:'opacity,transform'},.68)
          .fromTo(features,{opacity:.25,clipPath:'inset(0 0 100% 0)'},{opacity:1,clipPath:'inset(0 0 0% 0)',duration:.65,stagger:.075,clearProps:'opacity,clipPath'},.79);
        if(words)tl.fromTo(words.words,{xPercent:-18,opacity:0},{xPercent:0,opacity:1,duration:.65,stagger:.045},.91);
        if(manifesto)tl.fromTo(manifesto.querySelector('small'),{opacity:0},{opacity:1,duration:.55,clearProps:'opacity'},1.12);
        return tl;
      }});
  }
  M.text={title,paragraph,hero,label};
})();
