// Persistência do hero V11 no gerador V9. Nenhuma seção além do hero é alterada.
import {readFileSync} from 'node:fs';
const header=readFileSync(new URL('./v11-templates/header.html',import.meta.url),'utf8').trim();
const hero=readFileSync(new URL('./v11-templates/hero.html',import.meta.url),'utf8').trim();
const insert=readFileSync(new URL('./v11-templates/head.html',import.meta.url),'utf8').trim();
export function transformHeroV11(source){
  let s=source;
  s=s.replace(/<link[^>]+href="assets\/images\/(?:hero-redesign\/fachada-[^\"]+|hero-ref-(?:mobile-)?v10\.webp|hero-ambiente-1920\.webp|hero-ambiente-mobile-960\.webp)"[^>]*>/g,'');
  s=s.replace(/<link[^>]+href="assets\/fonts\/bodoni-moda[^"]+"[^>]*>/g,'');
  s=s.replace(/<link[^>]+href="css\/(?:hero-pontual-v10|hero-v11)\.css"[^>]*>/g,'');
  s=s.replace(/<script[^>]+src="js\/(?:hero-pontual-v10|hero-v11)\.js"[^>]*><\/script>/g,'');
  const a=s.indexOf('<header class="header'),b=s.indexOf('</header>',a),d=s.indexOf('<section class="services paper section"',b);
  const c0=s.indexOf('<div class="hero-journey',b),c1=s.indexOf('<section class="nv2-hero',b);
  const candidates=[c0,c1].filter(n=>n>=0);const c=Math.min(...candidates);
  if([a,b,c,d].some(n=>n<0)||!(a<b&&b<c&&c<d)) throw new Error('Estrutura original da V9/V10 não reconhecida, gerador interrompido.');
  s=s.slice(0,c)+hero+'\n'+s.slice(d);
  s=s.slice(0,a)+header+'\n'+s.slice(b+'</header>'.length).replace(/^\n+/, '');
  return s.replace('</head>',insert+'</head>');
}
