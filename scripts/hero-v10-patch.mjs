// Called by the optional V9 HTML generator so V10 hero survives rebuilding.
// Does not alter any sections or business data outside header and hero.
import {readFileSync} from 'node:fs';
export function transformHeroV10(source){
  if(source.includes('class="nv2-hero"'))return source;
  const headerStart=source.indexOf('<header class="header"');
  const headerEnd=source.indexOf('</header>',headerStart);
  const heroStart=source.indexOf('<div class="hero-journey',headerEnd);
  const afterHero=source.indexOf('<section class="services paper section"',heroStart);
  if([headerStart,headerEnd,heroStart,afterHero].some(n=>n<0))throw Error('Formato V9 nao reconhecido; nao sobrescrever index.html.');
  const header=readFileSync('scripts/v10-templates/header.html','utf8').trim();
  const hero=readFileSync('scripts/v10-templates/hero.html','utf8').trim();
  source=source.slice(0,heroStart)+hero+'\n'+source.slice(afterHero);
  source=source.slice(0,headerStart)+header+'\n'+source.slice(headerEnd+9);
  source=source.replace('</head>','<link rel="preload" as="image" href="assets/images/hero-ref-v10.webp" fetchpriority="high"><link rel="stylesheet" href="css/hero-pontual-v10.css"><script defer src="js/hero-pontual-v10.js"></script></head>');
  return source;
}
