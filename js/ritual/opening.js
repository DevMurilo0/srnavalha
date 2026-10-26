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
    addEventListener('resize',finish,{once:true,passive:true,signal:signal.signal});
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
      const N = mobile ? 7 : 12;
      const ANT = 210, FLY = mobile ? 560 : 650;
      const CUT = mobile ? 920 : 1090;
      const OPEN = mobile ? 720 : 840;
      const tCut = ANT + FLY, tEnd = tCut + CUT;
      const tMark = tCut + CUT * .48;
      const logoTime = mobile ? 820 : 950;

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

      // Criar painéis ANTES de remover o fundo sólido: não existe um
      // frame intermediário transparente que exponha o hero prematuramente.
      const fragment = document.createDocumentFragment();
      const pendingStrips = [];
      const stripHeight = H / N;
      for (let i=0; i<N; i++) {
        for (const side of ['left','right']) {
          const pane=document.createElement('div');
          pane.className='snv2-panel-slice snv2-panel-slice--'+side;
          pane.style.top=(i * stripHeight)+'px';
          pane.style.height=(stripHeight + 1.5)+'px';
          fragment.append(pane);
          const direction=side==='left'?-1:1;
          const start=tCut+((i+.56)/N)*CUT;
          pendingStrips.push({pane,direction,start});
        }
      }
      panels.append(fragment);
      // Elementos conectados antes do início da timeline; evita diferenças
      // entre browsers no início de WAAPI sobre nós ainda desconectados.
      for (const {pane,direction,start} of pendingStrips) {
        run(pane,[
          {transform:'translate3d(0,0,0)'},
          {transform:'translate3d('+(direction*(W*.55+12))+'px,0,0)'}
        ],{duration:OPEN,delay:start,easing:'cubic-bezier(.62,0,.2,1)'});
      }
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
      const total=tEnd+200;
      run(carrier,[
        {transform:position(x0,y0,0,1),offset:0,easing:'linear'},
        {transform:position(x0,y0,0,1),offset:ANT/total,
          easing:'cubic-bezier(.45,0,.3,1)'},
        {transform:position(cx+Math.min(W*.2,125),H*.46,46,1.4),
          offset:(ANT+FLY*.56)/total,easing:'cubic-bezier(.25,0,.15,1)'},
        {transform:position(cx,-24,90,mobile?1.7:2),
          offset:tCut/total,easing:'linear'},
        {transform:position(cx,H+34,90,mobile?1.7:2),
          offset:tEnd/total,easing:'cubic-bezier(.4,0,1,1)'},
        {transform:position(cx,H+110,90,1.9),offset:1}
      ],{duration:total,easing:'linear'});
      delay(()=>carrier.classList.remove('snv2-wind'),ANT);
      delay(()=>carrier.classList.add('snv2-is-cutting'),tCut);

      // A trilha fica ATRÁS da ponta da lâmina e acompanha o mesmo percurso.
      const tail=document.createElement('div');
      tail.className='snv2-cut-tail';
      const tailHeight=H*.21;
      tail.style.height=tailHeight+'px';
      stage.append(tail);
      temporary.push(tail);
      run(tail,[
        {transform:'translate3d(0,'+(-24-tailHeight)+'px,0)',opacity:0,offset:0},
        {transform:'translate3d(0,'+(-24-tailHeight)+'px,0)',opacity:1,offset:.08},
        {transform:'translate3d(0,'+(H+34-tailHeight)+'px,0)',opacity:1,offset:.9},
        {transform:'translate3d(0,'+(H+34-tailHeight)+'px,0)',opacity:0,offset:1}
      ],{duration:CUT,delay:tCut,easing:'linear'});

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
      ],{duration:460,delay:tMark-120});

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
        copy.removeAttribute('aria-hidden');
        flight.append(copy);
        stage.append(flight);
        temporary.push(flight);
        const dx=targetBox.left-sourceBox.left;
        const dy=targetBox.top-sourceBox.top;
        const sx=targetBox.width/sourceBox.width;
        const sy=targetBox.height/sourceBox.height;
        const move='translate3d('+dx+'px,'+dy+'px,0) scale('+sx+','+sy+')';
        run(flight,[
          {transform:'translate3d(0,0,0) scale(1)',opacity:0,offset:0},
          {transform:'translate3d(0,0,0) scale(1)',opacity:1,offset:.10},
          {transform:move,opacity:1,offset:.84},
          {transform:move,opacity:0,offset:1}
        ],{duration:logoTime,delay:tMark,easing:'cubic-bezier(.65,0,.2,1)'});
        // Na metade do corte a marca sai da abertura. Pouso já alinhado
        // exatamente à caixa final do SVG do hero (FLIP).
        run(logoPlate,[{opacity:1},{opacity:0}],{
          duration:150,delay:tMark,easing:'ease-out'
        });
        delay(()=>{if (!completed) target.style.visibility=previous},
          tMark+logoTime*.88);
      } else {
        // Offline/sem imagem: mantém o monograma SN até o corte avançar.
        run(logoPlate,[{opacity:1},{opacity:0}],{
          duration:480,delay:tMark
        });
      }

      // Mostra as fotografias e textos REAIS enquanto a tesoura abre o caminho.
      // O hero nunca é duplicado; só recebe transform/opacity por tempo finito.
      delay(()=>{if (!completed) root.classList.add('sr-cut-reveal')},tCut+85);

      // Espera a última faixa sair e a marca alcançar o destino.
      delay(finish,Math.max(tEnd+OPEN+160,tMark+logoTime+220));
    }

    // Mantém o início do protótipo: 0–100%, anel, letras e tesoura na régua.
    const DURATION=2250, epoch=performance.now()+180;
    const eased=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
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
