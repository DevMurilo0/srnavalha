/* Two special section transitions: environment expansion and the editorial team entrance. */
(() => {
  const M=window.SrMotion;if(!M)return;
  M.use('scenes',scope=>{
    const desktop=scope.conditions.desktop;
    const title=(selector,options)=>M.text.title(scope,document.querySelector(selector),options);
    const paragraph=(selector,options)=>M.text.paragraph(scope,document.querySelector(selector),options);
    const once=(trigger,extra={})=>({trigger,start:'top 88%',once:true,fastScrollEnd:1800,...extra});
    function enter(node,{duration=.85,delay=0,trigger=node,from={opacity:.3,y:6}}={}){
      if(!node)return;scope.save(node);
      return gsap.fromTo(node,from,{opacity:1,y:0,duration,delay,ease:'power3.out',clearProps:'opacity,transform',scrollTrigger:once(trigger)});
    }
    function photo(frame,{direction='bottom',duration=1.05,delay=0,trigger=frame}={}){
      if(!frame)return;
      const image=frame.querySelector('img');if(!image)return;
      const camera=scope.wrap(image,'motion-image-camera');scope.save(frame,camera);
      const masks={
        left:'polygon(0% 0%,0% 0%,0% 100%,0% 100%)',
        right:'polygon(100% 0%,100% 0%,100% 100%,100% 100%)',
        bottom:'polygon(0% 100%,100% 100%,100% 100%,0% 100%)',
        top:'polygon(0% 0%,100% 0%,100% 0%,0% 0%)'
      };
      return gsap.timeline({scrollTrigger:once(trigger)})
        .fromTo(frame,{clipPath:masks[direction]},{clipPath:'polygon(0% 0%,100% 0%,100% 100%,0% 100%)',duration,ease:'power3.inOut',clearProps:'clipPath'},delay)
        .fromTo(camera,{scale:1.08},{scale:1,duration:duration+.18,ease:'power3.out',clearProps:'transform'},delay);
    }
    M.text.hero(scope);
    if(!document.querySelector('.sr-hero')&&!M.session.headerDone){
      const header=document.querySelector('.sr-header__inner');scope.save(header);gsap.fromTo(header,{opacity:.6,y:-5},{opacity:1,y:0,duration:.5,clearProps:'opacity,transform'});M.session.headerDone=true;
    }
    title('#sr-services-title',{duration:.96,stagger:.085});
    const rule=document.querySelector('.sr-services__titlewrap');
    if(rule){scope.save(rule);gsap.fromTo(rule,{'--motion-rule':0},{'--motion-rule':1,duration:.9,ease:'power3.inOut',scrollTrigger:once(rule)});}
    paragraph('.sr-services__intro',{delay:.15});
    const serviceGrid=document.querySelector('.sr-services__grid'),serviceCards=[...document.querySelectorAll('.sr-service')];
    if(serviceGrid&&serviceCards.length){
      const masks=['polygon(0% 0%,0% 0%,0% 100%,0% 100%)','polygon(0% 100%,100% 100%,100% 100%,0% 100%)','polygon(100% 0%,100% 0%,100% 100%,100% 100%)'];
      const buildCard=(timeline,card,index,position)=>{
        const frame=card.querySelector('.sr-service__image'),image=frame?.querySelector('img'),text=card.querySelector('.sr-service__bottom');
        if(!frame||!image||!text)return;
        const camera=scope.wrap(image,'motion-image-camera');scope.save(frame,camera,text);
        timeline.fromTo(frame,{clipPath:masks[index%3]},{clipPath:'polygon(0% 0%,100% 0%,100% 100%,0% 100%)',duration:1,ease:'power3.inOut',clearProps:'clipPath'},position)
          .fromTo(camera,{scale:1.075},{scale:1,duration:1.12,ease:'power3.out',clearProps:'transform'},position)
          .fromTo(text,{opacity:.25,clipPath:'inset(0% 0% 100% 0%)'},{opacity:1,clipPath:'inset(0% 0% 0% 0%)',duration:.64,ease:'power3.out',clearProps:'opacity,clipPath'},position+.34);
      };
      if(desktop){
        const sequence=gsap.timeline({scrollTrigger:once(serviceGrid,{start:'top 76%'})});
        serviceCards.forEach((card,index)=>buildCard(sequence,card,index,index*.22));
      }else{
        serviceCards.forEach((card,index)=>buildCard(gsap.timeline({scrollTrigger:once(card.querySelector('.sr-service__image'),{start:'top 76%'})}),card,index,0));
      }
    }
    const about=document.querySelector('.sr-about'),aboutFrame=about?.querySelector('.sr-about__photo');
    if(aboutFrame){
      const camera=scope.wrap(aboutFrame.querySelector('img'),'motion-image-camera');scope.save(aboutFrame,camera);
      gsap.fromTo(aboutFrame,{'--cut-progress':0},{'--cut-progress':1,duration:1,ease:'power3.inOut',scrollTrigger:once(aboutFrame)});
      gsap.timeline({scrollTrigger:desktop?{trigger:about,start:'top 91%',end:'top 43%',scrub:.45,fastScrollEnd:true}:once(aboutFrame)})
        .fromTo(aboutFrame,{clipPath:'inset(9% 7% 9% 7%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1,ease:desktop?'none':'power3.inOut'},0)
        .fromTo(camera,{scale:1.065},{scale:1,duration:1,ease:desktop?'none':'power3.out'},0);
      title('#sr-about-title',desktop?{trigger:about,start:'top 83%',end:'top 43%',scrub:.4,duration:.9,stagger:.12}:{duration:.94,stagger:.11});
      paragraph('.sr-about__copy p:not(.sr-kicker)',{blur:true,delay:.16});
      const seal=about.querySelector('.sr-seal');scope.save(seal);
      gsap.fromTo(seal,{opacity:0,clipPath:'circle(0% at 50% 50%)'},{opacity:.22,clipPath:'circle(72% at 50% 50%)',duration:1,ease:'power2.out',delay:.4,clearProps:'opacity,clipPath',scrollTrigger:once(about.querySelector('.sr-about__copy'))});
      if(desktop){scope.save(seal);gsap.fromTo(seal,{y:7},{y:-7,ease:'none',scrollTrigger:{trigger:about,start:'top bottom',end:'bottom top',scrub:.8}});}
    }
    title('#sr-gallery-title',{duration:.87,stagger:.12,trigger:document.querySelector('.sr-gallery__layout')});
    paragraph('.sr-gallery__heading>p:not(.sr-kicker)',{delay:.1});
    enter(document.querySelector('.sr-gallery__controls'),{from:{opacity:.4,y:0},delay:.2});
    title('#sr-team-title',{duration:1.02,stagger:.1,trigger:document.querySelector('.sr-team__inner')});
    paragraph('.sr-team__copy>p:not(.sr-kicker)',{delay:.2});
    const team=document.querySelector('.sr-team'),teamImage=team?.querySelector('.sr-team__image');
    photo(teamImage,{direction:'left',duration:1.12,delay:.08,trigger:team?.querySelector('.sr-team__inner')});
    if(team){
      scope.save(team);gsap.fromTo(team,{'--team-rule':0},{'--team-rule':1,duration:1.2,ease:'power3.inOut',scrollTrigger:once(team)});
      const signature=team.querySelector('.sr-team__signature');scope.save(signature);
      gsap.fromTo(signature,{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)',duration:.85,delay:.7,ease:'power3.out',clearProps:'opacity,clipPath',scrollTrigger:once(teamImage)});
      if(desktop)gsap.fromTo(signature,{y:6},{y:-6,ease:'none',scrollTrigger:{trigger:team,start:'top bottom',end:'bottom top',scrub:.8}});
    }
    // Internal depth uses existing media wrappers, separate from camera/hover transforms.
    if(desktop){
      document.querySelectorAll('.sr-about .sr-parallax-media,.sr-team .sr-parallax-media').forEach(media=>{
        scope.save(media);gsap.fromTo(media,{y:9},{y:-9,ease:'none',scrollTrigger:{trigger:media.parentElement,start:'top bottom',end:'bottom top',scrub:.65}});
      });
      const media=document.querySelector('.sr-hero__media');
      if(media){scope.save(media);gsap.fromTo(media,{'--hero-scroll-y':'0px'},{'--hero-scroll-y':'-10px',ease:'none',scrollTrigger:{trigger:'.sr-hero',start:'top top',end:'bottom top',scrub:.7}});}
    }
    title('#sr-reviews-title',{duration:.92,stagger:.105});
    paragraph('.sr-reviews__intro>p:not(.sr-kicker)',{blur:true,delay:.15});
    const review=document.querySelector('.sr-reviews__carousel');
    if(review){scope.save(review);gsap.fromTo(review,{opacity:.55,clipPath:'inset(0 0 0 100%)'},{opacity:1,clipPath:'inset(0 0 0 0%)',duration:1,delay:.12,ease:'power3.inOut',clearProps:'opacity,clipPath',scrollTrigger:once(review)});}
    title('.sr-location__details h2',{duration:.88,stagger:.095});
    title('.sr-location__faq h2',{duration:.82,stagger:.08});
    const map=document.querySelector('.sr-location__map');
    if(map){scope.save(map);gsap.fromTo(map,{'--map-rule':0},{'--map-rule':1,duration:1.1,ease:'power3.inOut',scrollTrigger:once(map)});}
    const contacts=[...document.querySelectorAll('.sr-location__details li')];if(contacts.length){scope.save(contacts);gsap.fromTo(contacts,{opacity:.4,x:-7},{opacity:1,x:0,stagger:.08,duration:.65,ease:'power3.out',clearProps:'opacity,transform',scrollTrigger:once(contacts[0])});}
    title('#sr-cta-title',{duration:1.03,stagger:.09});
    paragraph('.sr-cta p:not(.sr-kicker)',{delay:.15});
    title('.booking-flow-header h1',{duration:.82,stagger:.07});
    const booking=document.querySelector('[data-booking-content]');
    if(booking){
      let stepContext=null;
      const layout=document.querySelector('[data-booking-layout]'),success=document.querySelector('[data-booking-success]');
      const animateStep=()=>{
        stepContext?.revert();
        const container=layout.hidden?success:booking;
        if(!container||container.hidden||!container.firstElementChild)return;
        stepContext=gsap.context(()=>{
          const heading=container.querySelector('h1,h2');
          if(heading){const accessible=M.text.label(heading);SplitText.create(heading,{type:'lines',mask:'lines',linesClass:'motion-line',aria:'auto',autoSplit:true,onSplit(self){heading.setAttribute('aria-label',accessible);return gsap.fromTo(self.lines,{yPercent:95,opacity:.5},{yPercent:0,opacity:1,duration:.62,stagger:.06,ease:'power3.out'});}});}
        },container);
      };
      animateStep();const observer=new MutationObserver(animateStep);observer.observe(booking,{childList:true});observer.observe(layout,{attributes:true,attributeFilter:['hidden']});observer.observe(success,{childList:true});
      scope.add(()=>{observer.disconnect();stepContext?.revert();});
    }
  });
})();
