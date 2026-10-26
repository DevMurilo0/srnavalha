/* SR. NAVALHA — THE PERFECT CUT (inspirado no protótipo enviado).
   O loader até 100% é mantido. A tesoura sai da régua, corta verticalmente
   e libera tiras opacas da esquerda/direita. Logo oficial faz handoff FLIP
   para o SVG real do hero, com leitura de geometria única e cancelamento seguro.
   Nenhum lock de scroll; transições limitadas a transform e opacity. */
import { $, $$, canMove, cancelWithin } from './core.js';

export function openRitual() {
  return new Promise(resolve => {
    const root = document.documentElement;
    const stage = $('#sr-loader-stage');
    const signal = new AbortController();
    const timers = new Set();
    const animations = new Set();
    const temporary = [];
    const restorers = [];
    const percent = $('#sr-loader-percent');
    let raf = 0, completed = false, phase = 'loading', lastCounter = 0;

    function delay(callback, ms) {
      const timer = setTimeout(() => { timers.delete(timer); callback(); }, ms);
      timers.add(timer);
    }
    function run(node, frames, options = {}) {
      if (!node || typeof node.animate !== 'function') return null;
      const a = node.animate(frames, {
        fill: 'both', easing: 'cubic-bezier(.22,1,.36,1)', ...options
      });
      animations.add(a);
      a.finished.catch(() => {}).finally(() => animations.delete(a));
      return a;
    }
    function finish() {
      if (completed) return;
      const hadFocus = !!stage?.contains(document.activeElement);
      completed = true;
      cancelAnimationFrame(raf);
      signal.abort();
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      for (const a of animations) { try { a.cancel(); } catch {} }
      animations.clear();
      for (const restore of restorers.reverse()) restore();
      for (const node of temporary) node.remove();
      if (stage) cancelWithin(stage);
      root.classList.remove('sr-loader-boot', 'sr-cut-reveal', 'sr-iris-reveal');
      stage?.remove();
      $('#sr-loader-shock')?.remove();
      if (hadFocus) $('.hero .button')?.focus({ preventScroll:true });
      if (window.__finishRitual === finish) delete window.__finishRitual;
      document.dispatchEvent(new CustomEvent('openingend'));
      resolve();
    }
    window.__finishRitual = finish;

    if (!stage || !root.classList.contains('sr-loader-boot') ||
        !canMove() || window.scrollY > 20 ||
        (location.hash && location.hash !== '#inicio')) {
      finish();
      return;
    }

    const logoPlate = $('#sr-loader-plate',stage);
    const logoProbe = $('.snv2-logo-probe',logoPlate);
    const markLoaded = () => {
      if (logoProbe?.naturalWidth > 0) logoPlate?.classList.add('snv2-logo-ready');
    };
    if (logoProbe) {
      if (logoProbe.complete) markLoaded();
      else logoProbe.addEventListener('load',markLoaded,{ once:true,signal:signal.signal });
      logoProbe.addEventListener('error',() => {logoProbe.style.display='none'},{
        once:true,signal:signal.signal
      });
    }

    $('#sr-opening-skip',stage)?.addEventListener('click',finish,{
      once:true, signal:signal.signal
    });
    for (const type of ['wheel','touchstart','pointerdown','keydown','pagehide']) {
      addEventListener(type,finish,{once:true,passive:true,signal:signal.signal});
    }
    addEventListener('scroll',finish,{once:true,passive:true,signal:signal.signal});
    // Browser address bars change viewport HEIGHT on phones, which should
    // not abort the choreography midway. Only width changes/rotation do.
    const initialWidth=innerWidth;
    addEventListener('resize',()=>{
      if (Math.abs(innerWidth-initialWidth)>2) finish();
    },{passive:true,signal:signal.signal});
    document.addEventListener('motionchange',()=>{
      if (!canMove()) finish();
    },{signal:signal.signal});

    // Watchdog independente. O head também tem fallback para falha do módulo.
    delay(finish,7700);

    function beginCut() {
      if (completed || phase !== 'loading') return;
      phase = 'cutting';
      const trackScissors = $('.snv2-track .snv2-scissors',stage);
      const panels = $('#snv2-panels',stage);
      const source = $('.snv2-cutout-logo',stage);
      const target = $('.hero-wordmark .hero-logo-transparent');
      const hero = $('.hero');
      const heroMark = $('.hero-wordmark');
      const W = innerWidth, H = innerHeight;
      if (!trackScissors || !panels || !W || !H) { finish(); return; }
      if (!canMove() || !trackScissors.animate) { finish(); return; }

      const mobile = W <= 700;
      // Every device uses TWO continuous panels, never horizontal strips.
      const ANT = 210, FLY = mobile ? 540 : 620;
      const CUT = mobile ? 810 : 940;
      const OPEN = mobile ? 800 : 880;
      const tCut = ANT + FLY, tEnd = tCut + CUT;
      const tOpen = tEnd + 90;
      const tMark = tOpen + 100;
      const logoTime = mobile ? 760 : 850;

      // Snapshot FINAL: remove temporariamente transforms dos ancestrais.
      // São leituras concentradas em um único ponto, nunca durante o scroll.
      const cached = [];
      if (target && hero && heroMark && source?.getBoundingClientRect().width) {
        for (const node of [hero,heroMark]) {
          cached.push([node,node.style.transition,node.style.transform]);
          node.style.transition='none';
          node.style.transform='none';
        }
      }
      const targetBox = target?.getBoundingClientRect();
      const sourceBox = source?.getBoundingClientRect();
      const scissorBox = trackScissors.getBoundingClientRect();
      for (const [node,transition,transform] of cached) {
        node.style.transition=transition; node.style.transform=transform;
      }

      // The user's video showed rectangular holes: old code released 14/24
      // separate strips at different times. Prepare only two full-height,
      // perfectly flat panels. The blade draws the seam FIRST; afterwards
      // the two panels open as a single continuous, compositor-led movement.
      const halves=[];
      for (const side of ['left','right']) {
        const pane=document.createElement('div');
        pane.className='snv2-panel-slice snv2-panel-slice--'+side;
        panels.append(pane);
        halves.push(pane);
      }
      for (let i=0;i<halves.length;i++) {
        const direction=i===0?-1:1;
        run(halves[i],[
          {transform:'translate3d(0,0,0)'},
          {transform:'translate3d('+(direction*(W*.55+24))+'px,0,0)'}
        ],{duration:OPEN,delay:tOpen,easing:'cubic-bezier(.7,0,.18,1)'});
      }
      // The opaque container disappears only after both panels are present.
      stage.classList.add('snv2-cut-ready');

      // A ponta da tesoura é o pivot real (x=33, y=14 no SVG).
      const x0=scissorBox.left+scissorBox.width*33/34;
      const y0=scissorBox.top+scissorBox.height*.5;
      const cx=W/2;
      const carrier=document.createElement('div');
      carrier.className='snv2-cut-flight snv2-wind';
      const scissors=trackScissors.cloneNode(true);
      carrier.append(scissors);
      carrier.style.transform='translate3d('+x0+'px,'+y0+'px,0)';
      stage.append(carrier);
      temporary.push(carrier);
      const originalVisibility=trackScissors.style.visibility;
      trackScissors.style.visibility='hidden';
      restorers.push(()=>{ trackScissors.style.visibility=originalVisibility });
      const position=(x,y,deg,s)=>
        'translate3d('+x+'px,'+y+'px,0) rotate('+deg+'deg) scale('+s+')';
      const total=tEnd+180;
      run(carrier,[
        {transform:position(x0,y0,0,1),offset:0,easing:'linear'},
        {transform:position(x0,y0,0,1),offset:ANT/total,
          easing:'cubic-bezier(.45,0,.3,1)'},
        {transform:position(cx+Math.min(W*.2,125),H*.46,46,1.4),
          offset:(ANT+FLY*.56)/total,easing:'cubic-bezier(.25,0,.15,1)'},
        {transform:position(cx,0,90,mobile?1.65:1.9),
          offset:tCut/total,easing:'cubic-bezier(.42,0,.58,1)'},
        {transform:position(cx,H,90,mobile?1.65:1.9),
          offset:tEnd/total,easing:'cubic-bezier(.4,0,1,1)'},
        {transform:position(cx,H+100,90,1.7),offset:1}
      ],{duration:total,easing:'linear'});
      delay(()=>carrier.classList.remove('snv2-wind'),ANT);
      delay(()=>carrier.classList.add('snv2-is-cutting'),tCut);

      // One continuous incision follows the exact same LINEAR cut interval
      // as the scissor tip: y=0 at tCut, y=H at tEnd. No row-by-row flicker.
      const seam=document.createElement('div');
      seam.className='snv2-seam';
      stage.append(seam);
      temporary.push(seam);
      run(seam,[
        {transform:'scaleY(0)',opacity:0},
        {transform:'scaleY(1)',opacity:1}
      ],{duration:CUT,delay:tCut,easing:'cubic-bezier(.42,0,.58,1)'});
      run(seam,[
        {opacity:1},{opacity:0}
      ],{duration:260,delay:tOpen+220,easing:'ease-out'});

      const fade=(selector,when,duration,dy=0)=>{
        $$(selector,stage).forEach(node=>run(node,[
          {opacity:1,transform:'translate3d(0,0,0)'},
          {opacity:0,transform:'translate3d(0,'+dy+'px,0)'}
        ],{duration,delay:when,easing:'cubic-bezier(.3,0,.7,1)'}));
      };
      fade('.snv2-track', ANT+70,320,8);
      fade('.snv2-name',ANT+FLY*.35,380,-7);
      fade('.snv2-tag', ANT+FLY*.35,380,-6);
      fade('.snv2-rail',ANT+60,530,0);
      fade('.snv2-skip',tCut+100,320,0);
      run($('.snv2-ring',stage),[
        {opacity:1,transform:'scale(1)'},
        {opacity:0,transform:'scale(1.17)'}
      ],{duration:580,delay:tCut+CUT*.5});

      // Transferência real, sem mover/recriar o hero.
      if (source && target && sourceBox?.width && targetBox?.width &&
          logoPlate?.classList.contains('snv2-logo-ready')) {
        const previous=target.style.visibility;
        target.style.visibility='hidden';
        restorers.push(()=>{target.style.visibility=previous});
        const flight=document.createElement('div');
        flight.className='snv2-logo-flight';
        flight.style.left=sourceBox.left+'px';
        flight.style.top=sourceBox.top+'px';
        flight.style.width=sourceBox.width+'px';
        flight.style.height=sourceBox.height+'px';
        const copy=source.cloneNode(true);
        const filter=copy.querySelector('filter');
        const image=copy.querySelector('image');
        if (filter) filter.id='snv2-logo-matte-flight';
        if (image) image.setAttribute('filter','url(#snv2-logo-matte-flight)');
        // A marca de voo é somente decorativa; o hero possui o rótulo acessível.
        flight.append(copy);
        stage.append(flight);
        temporary.push(flight);
        // Never stretch the lettering: both SVG viewBoxes crop the same
        // real artwork differently. Match width, preserve aspect ratio and
        // align centres; the final transparent crossfade hides the crop swap.
        const scale=targetBox.width/sourceBox.width;
        const dx=(targetBox.left+targetBox.width*.5)-
                 (sourceBox.left+sourceBox.width*.5);
        const dy=(targetBox.top+targetBox.height*.5)-
                 (sourceBox.top+sourceBox.height*.5);
        const move='translate3d('+dx+'px,'+dy+'px,0) scale('+scale+')';
        run(flight,[
          {transform:'translate3d(0,0,0) scale(1)',opacity:0,offset:0},
          {transform:'translate3d(0,0,0) scale(1)',opacity:1,offset:.10},
          {transform:move,opacity:1,offset:.84},
          {transform:move,opacity:0,offset:1}
        ],{duration:logoTime,delay:tMark,easing:'cubic-bezier(.65,0,.2,1)'});
        // The source fades INVERSELY to the flight's first 10%:
        // never show two opaque copies of the same logo.
        run(logoPlate,[{opacity:1},{opacity:0}],{
          duration:logoTime*.10,delay:tMark,easing:'linear'
        });
        // The destination crossfades INVERSELY to the flight's last 16%.
        // It becomes visible at opacity zero, not as a suddenly opaque SVG.
        const landingStart=tMark+logoTime*.84;
        run(target,[{opacity:0},{opacity:1}],{
          duration:logoTime*.16,delay:landingStart,easing:'linear'
        });
        delay(()=>{if (!completed) target.style.visibility=previous},
          landingStart);
      } else {
        // Offline/sem imagem: mantém o monograma SN até o corte avançar.
        run(logoPlate,[{opacity:1},{opacity:0}],{
          duration:480,delay:tMark
        });
      }

      // Mostra as fotografias e textos REAIS enquanto a tesoura abre o caminho.
      // O hero nunca é duplicado; só recebe transform/opacity por tempo finito.
      delay(()=>{if (!completed) root.classList.add('sr-cut-reveal')},tOpen+45);

      // Wait for the panel exit AND the complete hero stagger before changing
      // root classes. Otherwise the original video showed a final snap.
      delay(finish,Math.max(tOpen+OPEN+480,tOpen+1510,tMark+logoTime+250));
    }

    // The CSS bar/scissors and JS percentage MUST share the same epoch
    // and easing. Previously CSS began during parsing but JS much later.
    // This created the progress drift visible in slower mobile browsers.
    const DURATION=2250;
    const epoch=performance.now()+180;
    // Exact cubic-bezier(.65,0,.35,1), matching loader-v2.css.
    // Newton solve x(t)=progress, then derive y(t); ~25 calls/sec.
    const sample=(t,a,b)=>{
      const u=1-t;
      return 3*u*u*t*a+3*u*t*t*b+t*t*t;
    };
    const eased=p=>{
      let t=p;
      for(let i=0;i<5;i++){
        const u=1-t;
        const dx=3*u*u*.65+6*u*t*(.35-.65)+3*t*t*(1-.35);
        t=Math.max(0,Math.min(1,t-(sample(t,.65,.35)-p)/Math.max(.001,dx)));
      }
      return sample(t,0,1);
    };
    stage.classList.add('snv2-run');
    function tick(now){
      if (completed || phase!=='loading') return;
      const p=Math.max(0,Math.min(1,(now-epoch)/DURATION));
      if (now-lastCounter>38 || p===1) {
        if (percent) percent.textContent=Math.round(eased(p)*100)+'%';
        lastCounter=now;
      }
      if(p<1) raf=requestAnimationFrame(tick);
      else delay(beginCut,160);
    }
    raf=requestAnimationFrame(tick);
  });
}
