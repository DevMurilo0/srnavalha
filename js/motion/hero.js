import {$,$$,reduced,clamp,range,on,scene,visible,cleanup,wake,stats} from './core.js';

// One progress drives the entire arrival. Opening animates only children of these wrappers.
export function initHero() {
  const journey=$('.hero-journey'), stage=$('.hero-scene'), photo=$('.hero-photo-travel');
  const corners=$('.mirror-corners');
  const portal=$('.hero-portal'), interior=$('.hero-interior-layer'), title=$('.hero-title-travel');
  const story=$('.hero-story'), progress=$('.scene-progress span'), caption=$('.hero-mirror figcaption');
  const exteriorCaption=$('.caption-exterior'), interiorCaption=$('.caption-interior');
  const initial=[$('.hero-invitation'),$('.hero-meta'),$('.hero-bottom')];
  let inView=true,p=0,width=innerWidth,photoHeight=0;
  journey.classList.add('is-directed');

  function reset() {
    [photo,portal,corners,title,story,caption,interior,...initial].forEach(el=>{
      el.style.transform='';el.style.opacity='';el.style.clipPath='';el.inert=false;
    });
    interior.setAttribute('aria-hidden','true');
    exteriorCaption.style.opacity='';interiorCaption.style.opacity='';
    story.classList.add('is-readable');
    $$('a',story).forEach(a=>a.tabIndex=0);
    progress.style.transform='scaleX(0)';stats.heroProgress=0;
  }
  function read() {
    if(!inView||reduced.matches)return;
    const rect=journey.getBoundingClientRect();
    width=innerWidth;
    const header=$('.header').offsetHeight;
    photoHeight=photo.offsetHeight;
    p=clamp((header-rect.top)/Math.max(1,journey.offsetHeight-stage.offsetHeight));
  }
  function render() {
    if(reduced.matches){reset();return}
    if(!inView)return;
    const mobile=width<=600;
    const approach=range(.03,.66,p), change=range(.32,.87,p), enter=range(.43,.84,p);
    // Limited enlargement: source is 720px wide; the rendered frame stays below that size.
    photo.style.transform=`translate3d(${mobile?0:-16*approach}px,${(mobile?-135:-12)*approach}px,0) scale(${1+(mobile?.025:.065)*approach})`;
    portal.style.clipPath=`inset(0 0 ${mobile?42*approach:0}% 0)`;
    corners.style.clipPath=`inset(0 0 ${mobile?42*approach:0}% 0)`;
    interior.style.clipPath=`inset(0 ${100*(1-change)}% 0 0)`;
    interior.setAttribute('aria-hidden',String(change<.98));
    caption.style.transform=mobile?`translateY(${-photoHeight*.42*approach}px)`:'none';
    exteriorCaption.style.opacity=1-range(.3,.65,p);
    interiorCaption.style.opacity=range(.5,.88,p);
    title.style.transform=`translate3d(${mobile?0:-24*approach}px,${-25*approach}px,0)`;
    title.style.opacity=1-range(.06,.3,p);
    initial.forEach(el=>{const opacity=1-range(.12,.37,p);el.style.opacity=opacity;el.inert=opacity<.05});
    story.style.opacity=enter;
    story.style.transform=`translate3d(${mobile?0:25*(1-enter)}px,${24*(1-enter)}px,0)`;
    $$('a',story).forEach(a=>a.tabIndex=enter<.9?-1:0);
    story.classList.toggle('is-readable',enter>=.9);
    progress.style.transform=`scaleX(${p})`;
    stats.heroProgress=p;
  }
  cleanup(visible(journey,v=>inView=v));
  cleanup(scene(read,render));
  on(reduced,'change',()=>{if(reduced.matches)reset();wake()});

  function showHouse(behavior='instant') {
    const header=$('.header').offsetHeight;
    scrollTo({top:journey.offsetTop+journey.offsetHeight-stage.offsetHeight-header,behavior});
  }
  $$('a[href="#espaco"]').forEach(a=>on(a,'click',e=>{
    if(reduced.matches)return;
    e.preventDefault();showHouse('smooth');history.replaceState(null,'','#espaco');
  }));
  on(window,'hashchange',()=>{if(location.hash==='#espaco'&&!reduced.matches)showHouse()});
  if(location.hash==='#espaco'&&!reduced.matches)requestAnimationFrame(()=>showHouse());
}
