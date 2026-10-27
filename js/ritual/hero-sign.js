/* Sr. Navalha / Perfect Cut — queda com quique no hero.
   A tesoura, as cortinas e cada elemento compartilham o mesmo início WAAPI.
   Sem loops: cada objeto cai do alto, tem impacto, dois rebotes decrescentes
   e repousa em sua posição REAL, sem mover o layout ou achatar a fotografia. */
import { $ } from './core.js';

export function scheduleHeroEntrance(play, { tCut, CUT, mobile }) {
  const hero = $('.hero');
  if (!hero) return;

  // Ordem editorial de cima para baixo. A logo oficial é transferida pela
  // animação FLIP do loader; animamos apenas a assinatura ao lado dela.
  // O início de cada queda acompanha a abertura vertical produzida pela tesoura.
  const tracks = [
    // selector                        avanço corte duração queda rebote
    ['.hero-pole__object',                .12,       840,   82,  11],
    ['.hero-wordmark > span',             .19,       800,   88,  11],
    ['.hero .title-mask > span',          .26,       930,  132,  18],
    ['.hero-intro',                       .34,       810,   98,  12],
    ['.hero-facade',                      .39,       940,  124,  14],
    ['.hero-room',                        .47,       960,  130,  14],
    ['.hero-detail',                      .54,       885,  112,  12],
    ['.hero-invitation > p',              .61,       780,   91,  10],
    ['.hero-invitation > .button',        .68,       790,   96,  10],
    ['.hero-invitation > .text-link',     .72,       760,   77,   8],
    ['.hero-bottom',                      .77,       795,   82,   9]
  ];

  for (const [selector, progress, duration, distance, rebound] of tracks) {
    const node = $(selector, hero);
    if (!node || getComputedStyle(node).display === 'none') continue;

    // Preserva as rotações dos cartões fotográficos e a escala do cilindro.
    // A transformação original é concatenada ao deslocamento em TODAS as
    // etapas, evitando a mudança brusca de inclinação ao final da animação.
    const base = getComputedStyle(node).transform;
    const suffix = base === 'none' ? '' : ' ' + base;
    const drop = mobile ? Math.round(distance * .69) : distance;
    const bounce = mobile ? Math.round(rebound * .7) : rebound;
    const durationMs = mobile ? Math.round(duration * .86) : duration;
    const at = (y, xScale = 1, yScale = 1) =>
      `translate3d(0,${y}px,0) scale(${xScale},${yScale})${suffix}`;

    // Mesma física relativa, com impacto em 52%, rebote em 69%, segundo
    // toque em 82% e micro-rebote em 91%. Todos os keyframes se resolvem
    // antes da remoção da tela de carregamento; nenhuma animação começa depois.
    play(node, [
      { offset: 0,    opacity: 0, transform: at(-drop, .995, 1.005),
        easing: 'cubic-bezier(.25,.65,.45,1)' },
      { offset: .15,  opacity: 1, transform: at(-drop * .66),
        easing: 'cubic-bezier(.35,0,.65,1)' },
      { offset: .52,  opacity: 1, transform: at(0, 1.014, .978),
        easing: 'cubic-bezier(.18,.65,.35,1)' },
      { offset: .69,  opacity: 1, transform: at(-bounce),
        easing: 'cubic-bezier(.38,0,.7,1)' },
      { offset: .82,  opacity: 1, transform: at(0, 1.006, .99),
        easing: 'cubic-bezier(.18,.65,.35,1)' },
      { offset: .91,  opacity: 1, transform: at(-bounce * .27),
        easing: 'cubic-bezier(.35,0,.7,1)' },
      { offset: 1,    opacity: 1, transform: base === 'none' ? 'none' : base }
    ], {
      duration: durationMs,
      delay: Math.round(tCut + CUT * progress),
      easing: 'linear'
    });
  }
}
