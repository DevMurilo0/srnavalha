/* Perfect Cut V4: independent progress/cutting scissors. Two continuous
   surfaces share a single timeline with the blade and incision; no frame-time
   geometry reads. Every exit restores the real hero and cancels all effects. */
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
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (completed) return;
        try { callback(); }
        catch (error) {
          console.error('The Perfect Cut: falha na transição; liberando o hero.', error);
          finish('interrupted');
        }
      }, ms);
      timers.add(timer);
    }
    function run(node, frames, options = {}) {
      if (!node || typeof node.animate !== 'function') return null;
      const a = node.animate(frames, {
        fill: 'both', easing: 'cubic-bezier(.22,1,.36,1)', ...options
      });
      animations.add(a);
      // Keep filled effects owned until teardown, including finished animations.
      a.finished.catch(() => {});
      return a;
    }
    function finish(reason = 'interrupted') {
      if (completed) return;
      const hadFocus = !!stage?.contains(document.activeElement);
      completed = true;
      cancelAnimationFrame(raf);
      signal.abort();
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      for (const a of animations) { try { a.cancel(); } catch {} }
      animations.clear();
      for (const restore of restorers.reverse()) {
        try { restore(); } catch (error) {
          console.warn('The Perfect Cut: limpeza da marca', error);
        }
      }
      for (const node of temporary) node.remove();
      if (stage) {
        try { cancelWithin(stage); } catch (error) {
          console.warn('The Perfect Cut: limpeza das animações', error);
        }
      }
      root.classList.remove('sr-loader-boot', 'sr-cut-reveal');
      stage?.remove();
      if (hadFocus) $('.hero .button')?.focus({ preventScroll:true });
      if (window.__finishRitual === finish) delete window.__finishRitual;
      document.dispatchEvent(new CustomEvent('openingend', { detail: { completed: reason === 'complete' } }));
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

    // Segurar a camada até terminar o gesto: remover o stage em pointerdown
    // deixa o pointerup/click seguinte atingir o CTA escondido no mesmo ponto.
    // O gesto inteiro pertence ao loader e nunca dispara uma navegação.
    stage.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
    },{capture:true,signal:signal.signal});
    stage.addEventListener('pointerdown',event=>{
      if(event.cancelable)event.preventDefault();
      const release=()=>requestAnimationFrame(()=>finish('interrupted'));
      stage.addEventListener('pointerup',release,{once:true,signal:signal.signal});
      stage.addEventListener('pointercancel',release,{once:true,signal:signal.signal});
    },{once:true,signal:signal.signal});
    // Touch is already represented by pointerdown/up on supported browsers.
    // Never finish on touchstart: that releases the click-through barrier.
    for (const type of ['wheel','keydown','pagehide']) {
      addEventListener(type,finish,{once:true,passive:true,signal:signal.signal});
    }
    addEventListener('scroll',finish,{once:true,passive:true,signal:signal.signal});
    // A resize invalidates the measured FLIP destination. Settle both timelines
    // rather than flying toward stale geometry, including short desktop windows.
    const initialWidth=innerWidth,initialHeight=innerHeight;
    addEventListener('resize',()=>{
      if (Math.abs(innerWidth-initialWidth)>2||Math.abs(innerHeight-initialHeight)>2) finish();
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
      const carrier = $('.snv2-cut-flight',stage);
      const source = $('.snv2-cutout-logo',stage);
      const target = $('.hero-wordmark .hero-logo-transparent');
      const W = innerWidth, H = stage.clientHeight;
      if (!trackScissors || !panels || !carrier || !W || !H || !canMove() ||
          !carrier.animate) {
        finish(); return;
      }
      // All geometry is captured before writes. The wordmark stays stationary.
      const sourceBox = source?.getBoundingClientRect();
      const targetBox = target?.getBoundingClientRect();
      const targetInk = target ? getComputedStyle(target).filter : 'none';
      const mobile = W <= 700;
      const FADE = 160, CUT = mobile ? 1220 : 1320, OPEN = 520;
      const tCut = FADE, tEnd = tCut + CUT;
      const tMark = tCut + CUT * .16, logoTime = mobile ? 1040 : 1120;
      const scale = mobile ? 1.65 : 1.9;
      const startY = -80, endY = H + 80;
      const cutEase = 'cubic-bezier(.38,.18,.36,1)';
      const epoch = document.timeline.currentTime ?? performance.now();
      // Explicit shared startTime prevents sub-frame drift between the three
      // independently rendered parts, including on a busy main thread.
      const play = (node, frames, options) => {
        const a = run(node, frames, options);
        if (a) a.startTime = epoch;
        return a;
      };
      const fade = (selector, when, duration) => {
        $$(selector,stage).forEach(node => play(node,[{opacity:1},{opacity:0}],
          {duration,delay:when,easing:'linear'}));
      };
      // The original scissors remain in the track with their final transform.
      // Fading opacity alone preserves translateX(-50%) on the track: no jump.
      stage.classList.add('snv2-cut-ready');
      fade('.snv2-track',0,FADE);
      fade('.snv2-name, .snv2-tag',80,360);
      fade('.snv2-rail',0,440);
      fade('.snv2-ring',tCut,420);

      // A second, pre-existing SVG enters from ABOVE, never from the bar.
      // Its x=33 tip coordinates stay fixed longitudinally while the blades
      // shear sideways, so the seam endpoint is exactly the cutting front.
      play(carrier,[
        {transform:`translate3d(${W/2}px,${startY}px,0) rotate(90deg) scale(${scale})`},
        {transform:`translate3d(${W/2}px,${endY}px,0) rotate(90deg) scale(${scale})`}
      ],{duration:CUT,delay:tCut,easing:cutEase});
      play(carrier,[{opacity:0},{opacity:1}],{duration:120,delay:tCut,easing:'linear'});
      play(carrier,[{opacity:1},{opacity:0}],{duration:160,delay:tEnd,easing:'linear',fill:'forwards'});

      const seam = $('.snv2-seam',stage);
      // Clipped by the viewport: negative/start and overshoot/end coordinates
      // remain exactly equal to the scissors, without a JS animation loop.
      play(seam,[{transform:`scaleY(${startY/H})`},{transform:`scaleY(${endY/H})`}],
        {duration:CUT,delay:tCut,easing:cutEase});
      play(seam,[{opacity:1},{opacity:0}],{duration:240,delay:tEnd,easing:'linear',fill:'forwards'});

      // Two continuous, overlapping sheets, composed with transforms only.
      // Their inner edges obey x = W/2 ± slope * (y - tipY). Thus the gap
      // exists ONLY above the blade; below it the sheets still overlap.
      // A constant shear supplies the slope; translation follows tipY using
      // precisely the same easing. No animated masks or viewport repaints.
      for (const side of ['left','right']) {
        const pane = document.createElement('div');
        pane.className = 'snv2-panel snv2-panel--'+side;
        panels.append(pane);
        const direction = side === 'left' ? -1 : 1;
        const slope = -direction * W * .22 / H;
        const sheet = (y,exit=0) => `matrix(1,0,${slope},1,${-slope*y+exit},0)`;
        play(pane,[
          {transform:sheet(startY),offset:0,easing:cutEase},
          {transform:sheet(endY),offset:CUT/(CUT+OPEN),easing:'cubic-bezier(.32,0,.2,1)'},
          {transform:sheet(endY,direction*W/2),offset:1}
        ],{duration:CUT+OPEN,delay:tCut,easing:'linear'});
      }
      root.classList.add('sr-cut-reveal');

      // The scissors reach half of the viewport at 36.7226% of the CUT
      // timeline (the easing is cubic-bezier(.38,.18,.36,1), not linear).
      // Release the hero's independent fall at that VISUAL midpoint while
      // the two cutting sheets are still on-screen. The hero owns the drops:
      // finish() only cleans this loader, never cancels their effects.
      delay(() => {
        document.dispatchEvent(new CustomEvent('openingcutmidpoint', {
          detail: { progress: .5 }
        }));
      }, tCut + CUT * .367226);

      if (source && target && sourceBox?.width && targetBox?.width &&
          logoPlate?.classList.contains('snv2-logo-ready') &&
          target.querySelector('filter') && target.querySelector('image')) {
        const previous = target.style.visibility;
        target.style.visibility = 'hidden';
        restorers.push(()=>{target.style.visibility=previous});
        const flight = document.createElement('div');
        flight.className = 'snv2-logo-flight';
        // Map the actual artwork, not the square SVG element's letterboxing.
        // Both ends use the HERO viewBox: the final handoff has identical crop.
        const sourceUnit = Math.min(sourceBox.width/640,sourceBox.height/412);
        const targetUnit = Math.min(targetBox.width/640,targetBox.height/330);
        const left = sourceBox.left+(sourceBox.width-640*sourceUnit)/2;
        const top = sourceBox.top+(sourceBox.height-412*sourceUnit)/2+34*sourceUnit;
        const destLeft = targetBox.left+(targetBox.width-640*targetUnit)/2;
        const destTop = targetBox.top+(targetBox.height-330*targetUnit)/2;
        Object.assign(flight.style,{left:left+'px',top:top+'px',
          width:640*sourceUnit+'px',height:330*sourceUnit+'px'});
        const copy = target.cloneNode(true);
        copy.removeAttribute('role'); copy.removeAttribute('aria-label');
        copy.setAttribute('aria-hidden','true');
        copy.style.visibility = 'visible';
        // The destination artwork is the first child. Both copies have the
        // exact same viewBox and pixel bounds; only a *temporary* matte crossfades.
        // This avoids animating CSS filter (which repaints the logo every frame).
        copy.style.filter=targetInk;
        copy.querySelector('filter').id='snv2-logo-flight-ink';
        copy.querySelector('image').setAttribute('filter','url(#snv2-logo-flight-ink)');
        const matte=target.cloneNode(true);
        matte.removeAttribute('role');matte.removeAttribute('aria-label');
        matte.setAttribute('aria-hidden','true');
        matte.style.visibility='visible';
        Object.assign(matte.style,{position:'absolute',inset:'0',filter:'brightness(1) invert(0)'});
        matte.querySelector('filter').id='snv2-logo-matte-ink';
        matte.querySelector('image').setAttribute('filter','url(#snv2-logo-matte-ink)');
        flight.append(copy,matte);stage.append(flight);temporary.push(flight);
        // The paper ink dissolves into the lit sign using compositor opacity.
        // The flight object owns position and scale; neither child moves.
        play(matte,[{opacity:1},{opacity:0}],
          {duration:Math.round(logoTime*.65),delay:tMark+90,easing:'cubic-bezier(.42,0,.58,1)',fill:'both'});
        const move = `translate3d(${destLeft-left}px,${destTop-top}px,0) scale(${targetUnit/sourceUnit})`;
        // One visible mark at a time. Atomic compositor handoffs avoid the
        // opacity dip produced by crossfading two copies of the same white ink.
        play(flight,[{transform:'translate3d(0,0,0) scale(1)'},{transform:move}],
          {duration:logoTime,delay:tMark,easing:'cubic-bezier(.55,.04,.14,1)'});
        play(flight,[{opacity:0},{opacity:1}],{duration:1,delay:tMark,easing:'steps(1,end)'});
        play(logoPlate,[{opacity:1},{opacity:0}],{duration:1,delay:tMark,easing:'steps(1,end)'});
        const landing = tMark+logoTime;
        play(flight,[{opacity:1},{opacity:0}],{duration:1,delay:landing,easing:'steps(1,end)',fill:'forwards'});
        play(target,[{opacity:0},{opacity:1}],{duration:1,delay:landing,easing:'steps(1,end)'});
        // Backwards fill already holds opacity at zero until landing. Restore
        // visibility now so a delayed JS timer cannot leave a handoff gap.
        target.style.visibility = previous;
      } else {
        play(logoPlate,[{opacity:1},{opacity:0}],{duration:240,delay:tMark});
      }
      delay(() => finish('complete'),Math.max(tEnd+OPEN,tMark+logoTime+100));
    }

    // The CSS bar/scissors and JS percentage MUST share the same epoch
    // and easing. Previously CSS began during parsing but JS much later.
    // This created the progress drift visible in slower mobile browsers.
    const DURATION=1000;
    const epoch=performance.now()+80;
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
      else delay(beginCut,80);
    }
    raf=requestAnimationFrame(tick);
  });
}
