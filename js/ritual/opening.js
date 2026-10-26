/* Sr. Navalha · Loader v2, adaptado do HTML enviado pelo proprietário.
   Timeline CSS para marca/trilhos/tesoura e iris; o JS só sincroniza o número,
   a transição com o hero e os mecanismos de interrupção/recuperação. */
import { $, canMove, cancelWithin } from './core.js';

export function openRitual() {
  return new Promise(resolve => {
    const root = document.documentElement;
    const stage = $('#sr-loader-stage');
    const shock = $('#sr-loader-shock');
    const signal = new AbortController();
    const percent = $('#sr-loader-percent');
    let raf = 0;
    let complete = false;
    let exiting = false;
    let lastCounterUpdate = 0;
    const timers = new Set();

    function delay(fn, ms) {
      const timer = setTimeout(() => {
        timers.delete(timer);
        fn();
      }, ms);
      timers.add(timer);
    }

    function finish() {
      if (complete) return;
      const focusInside = !!stage?.contains(document.activeElement);
      complete = true;
      signal.abort();
      cancelAnimationFrame(raf);
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      if (stage) cancelWithin(stage);
      root.classList.remove('sr-loader-boot', 'sr-iris-reveal');
      stage?.remove();
      shock?.remove();
      if (focusInside) $('.hero .button')?.focus({ preventScroll: true });
      if (window.__finishRitual === finish) delete window.__finishRitual;
      document.dispatchEvent(new CustomEvent('openingend'));
      resolve();
    }
    window.__finishRitual = finish;

    if (!stage || !shock || !root.classList.contains('sr-loader-boot') ||
        !canMove() || scrollY > 20 ||
        (location.hash && location.hash !== '#inicio')) {
      finish();
      return;
    }

    // Primeira visita e TODO refresh iniciam a mesma animação. Nenhuma chave
    // de sessão, armazenamento ou cookie decide se o loader será exibido.
    const plate = $('#sr-loader-plate', stage);
    const image = $('img', plate);
    const showLogo = () => {
      if (image?.naturalWidth > 0) plate?.classList.add('snv2-logo-ready');
    };
    if (image) {
      if (image.complete) showLogo();
      else image.addEventListener('load', showLogo, {
        once: true, signal: signal.signal
      });
      // SVG do protótipo continua como fallback offline ou em falha de rede.
      image.addEventListener('error', () => {
        image.style.display = 'none';
      }, { once: true, signal: signal.signal });
    }

    const abortOptions = { once: true, passive: true, signal: signal.signal };
    for (const event of ['wheel', 'touchstart', 'pointerdown', 'keydown', 'pagehide']) {
      window.addEventListener(event, finish, abortOptions);
    }
    window.addEventListener('scroll', finish, abortOptions);
    window.addEventListener('resize', finish, abortOptions);
    $('#sr-opening-skip', stage)?.addEventListener('click', finish, {
      once: true, signal: signal.signal
    });
    document.addEventListener('motionchange', () => {
      if (!canMove()) finish();
    }, { signal: signal.signal });

    function exit() {
      if (complete || exiting) return;
      exiting = true;
      cancelAnimationFrame(raf);
      if (percent) percent.textContent = '100%';
      stage.classList.add('snv2-out');
      shock.classList.add('snv2-go');

      // O hero REAL aparece através da expansão radial, com seus próprios
      // textos e fotografias. Seu DOM, conteúdo e estilos originais ficam intactos.
      delay(() => {
        if (!complete) root.classList.add('sr-iris-reveal');
      }, 340);
      // Também cobre navegadores sem animação tipada de @property: a remoção
      // é determinística mesmo se a máscara for ignorada.
      delay(finish, 1460);
    }

    const DURATION = 2250;
    const start = performance.now() + 180;
    const ease = x => x < .5
      ? 2 * x * x
      : 1 - Math.pow(-2 * x + 2, 2) / 2;

    function tick(now) {
      if (complete || exiting) return;
      const fraction = Math.max(0, Math.min(1, (now - start) / DURATION));
      if (now - lastCounterUpdate > 38 || fraction >= 1) {
        // Apenas o texto, a ~25 atualizações/s. Barra e tesoura são
        // animadas por CSS, sem medições/escritas de largura por frame.
        if (percent) percent.textContent = Math.round(ease(fraction) * 100) + '%';
        lastCounterUpdate = now;
      }
      if (fraction < 1) raf = requestAnimationFrame(tick);
      else delay(exit, 160);
    }
    raf = requestAnimationFrame(tick);
  });
}
