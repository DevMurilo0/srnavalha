/* Sr. Navalha V11 — apenas abertura, hero e menu; todas as demais seções mantêm o JS original. */
(() => {
  'use strict';
  const hero = document.querySelector('.nv11-hero');
  if (!hero) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.nv11-header');
  const img = hero.querySelector('.nv2-picture img');
  const waapi = typeof Element.prototype.animate === 'function';
  let lastScroll=0, raf=0;
  function onScroll(){
    if (raf) return;
    raf=requestAnimationFrame(()=>{
      raf=0;
      const y=window.scrollY;
      if(header)header.classList.toggle('nv11-scrolled',y>40);
      if(!reduce.matches && img && Math.abs(y-lastScroll)>0.2){
        const p=Math.max(0,Math.min(1,-hero.getBoundingClientRect().top/Math.max(1,hero.offsetHeight)));
        hero.style.setProperty('--nv11-shift',(-p*16).toFixed(2)+'px');
        hero.style.setProperty('--nv11-zoom',(1.015+p*.027).toFixed(3));
      }
      lastScroll=y;
    });
  }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll,{passive:true});
  reduce.addEventListener('change',()=>{if(reduce.matches){hero.style.removeProperty('--nv11-shift');hero.style.removeProperty('--nv11-zoom');}});
  onScroll();
  if (reduce.matches || !waapi || window.scrollY>150 || document.visibilityState==='hidden')return;

  const EASE='cubic-bezier(.23,1,.32,1)';
  const play=(el,frames,options)=>el?.animate(frames,{easing:EASE,fill:'backwards',...options});
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  let curtain=null;
  function removeCurtain(){curtain?.remove();curtain=null;}
  function reveal(){
    const eyebrow=hero.querySelector('.nv2-eyebrow');
    const title=hero.querySelectorAll('.nv2-title-line>span');
    const subtitle=hero.querySelector('.nv2-subtitle');
    const actions=hero.querySelector('.nv2-actions');
    const values=hero.querySelectorAll('.nv2-value');
    play(img,[{transform:'scale(1.055)',opacity:.87},{transform:'scale(1.015)',opacity:1}],{duration:1150,delay:120});
    play(eyebrow,[{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:680,delay:160});
    title.forEach((el,i)=>play(el,[{transform:'translateY(108%)'},{transform:'translateY(0)'}],{duration:900,delay:280+i*125,easing:'cubic-bezier(.22,1,.36,1)'}));
    play(subtitle,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:700,delay:550});
    play(actions,[{opacity:0,transform:'translateY(17px)'},{opacity:1,transform:'translateY(0)'}],{duration:720,delay:690});
    values.forEach((el,i)=>play(el,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:580,delay:680+i*90}));
  }
  function openCurtain(){
    if(!curtain)return;
    const panels=curtain.querySelectorAll('.nv11-panel');
    const mark=curtain.querySelector('.nv11-curtain-logo');
    const line=curtain.querySelector('.nv11-thread');
    play(line,[{transform:'translateX(-50%) scaleX(.05)'},{transform:'translateX(-50%) scaleX(1)'}],{duration:400});
    play(mark,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-7px)'}],{duration:780,delay:0});
    panels.forEach((p,i)=>play(p,[{transform:'translateX(0)'},{transform:`translateX(${i===0?'-101%':'101%'})`}],{duration:760,delay:270,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'}));
    reveal();
    setTimeout(removeCurtain,1110);
  }
  try{
    curtain=document.createElement('div');
    curtain.className='nv11-curtain';curtain.setAttribute('aria-hidden','true');
    curtain.innerHTML='<div class="nv11-panel"></div><div class="nv11-panel"></div><div class="nv11-curtain-logo"><img src="assets/images/v9/logo.webp" alt="" width="791" height="269"></div><span class="nv11-thread"></span>';
    document.body.appendChild(curtain);
    const safety=setTimeout(removeCurtain,1750);
    const priority=Promise.race([img?.decode?.().catch(()=>{}),sleep(230)]);
    priority.finally(()=>{clearTimeout(safety);openCurtain();setTimeout(removeCurtain,1450)});
  }catch(err){removeCurtain();reveal();}
})();
