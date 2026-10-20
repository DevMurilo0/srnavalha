// Persistência do hero V11 no gerador V9. Nenhuma seção além do hero é alterada.
import {readFileSync} from 'node:fs';
const header=readFileSync(new URL('./v11-templates/header.html',import.meta.url),'utf8').trim();
const hero=readFileSync(new URL('./v11-templates/hero.html',import.meta.url),'utf8').trim();
const insert='<link rel="preload" as="image" media="(min-width:641px)" href="assets/images/hero-ambiente-1920.webp" imagesrcset="assets/images/hero-ambiente-1920.webp 1920w, assets/images/hero-ambiente-3840.webp 3840w" imagesizes="100vw" fetchpriority="high"><link rel="preload" as="image" media="(max-width:640px)" href="assets/images/hero-ambiente-mobile-960.webp" fetchpriority="high"><link rel="stylesheet" href="css/hero-v11.css"><script defer src="js/hero-v11.js"></script>';
export function transformHeroV11(source){
  let s=source;
  s=s.replace(/<link[^>]+href="assets\/images\/(?:hero-redesign\/fachada-[^\"]+|hero-ref-v10\.webp|hero-ambiente-1920\.webp|hero-ambiente-mobile-960\.webp)"[^>]*>/g,'');
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
