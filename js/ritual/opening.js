/* Sr. Navalha V19 — brand prelude morphs into the real hero.
   There is no fake progress timer and no overlay in the non-JS document. */
import {$,$$,animate,canMove,cancelWithin,flow} from './core.js';
function revealHero(short=false){
 if(!canMove())return;
 const lead=short?25:375, base=short?590:900;
 const mark=$('.hero-wordmark');
 animate(mark,[{opacity:.25,transform:'translateY(20px) scale(.965)'},{opacity:1,transform:'none'}],{duration:base,delay:lead,easing:flow});
 const words=$$('.hero h1 .motion-word');
 if(words.length){
  words.forEach((word,i)=>animate(word,[{opacity:.15,transform:'translateY(102%) rotateX(-18deg)'},{opacity:1,transform:'none'}],{duration:short?570:1050,delay:lead+60+Math.min(75*i,460),easing:flow}));
 }else animate($('.hero h1'),[{opacity:.2,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:base,delay:lead,easing:flow});
 $$('.hero-facade .photo-window,.hero-room .photo-window,.hero-detail .photo-window').forEach((frame,i)=>{
  const start=i===1?'inset(100% 0 0 0)':'inset(0 100% 0 0)';
  animate(frame,[{clipPath:start},{clipPath:'inset(0% 0% 0% 0%)'}],{duration:short?700:1090,delay:lead+110+i*95,easing:'cubic-bezier(.16,1,.3,1)'});
  animate($('img',frame),[{transform:'translateY(3%) scale(1.07)'},{transform:'none'}],{duration:short?800:1250,delay:lead+135+i*95,easing:flow});
 });
 $$('.hero-intro,.hero-invitation>p,.hero-invitation>.button,.hero-invitation>.text-link,.hero-bottom').forEach((el,i)=>animate(el,[{opacity:.1,transform:'translateY(28px)'},{opacity:1,transform:'none'}],{duration:short?570:890,delay:lead+160+i*100,easing:flow}));
}
export async function openRitual(){
 // Every document load runs this transition, including refreshes and repeat visits.
 // Deep links keep their scroll position and receive a shorter non-hero fade.
 const root=document.documentElement;
 if(!canMove()){root.classList.remove('sr-loader-boot');document.getElementById('sr-loader-stage')?.remove();return;}
 const toHero=(!location.hash||location.hash==='#inicio')&&scrollY<20;
 const heroMark=$('.hero-wordmark .hero-logo-transparent');
 if(!heroMark){root.classList.remove('sr-loader-boot');document.getElementById('sr-loader-stage')?.remove();return;}
 // The logo is the real mark from the page, not a generated substitute.
 const logo=heroMark.outerHTML.replaceAll('sr-logo-ink','sr-v19-prelude-ink');
 const overlay=document.getElementById('sr-loader-stage')||document.createElement('div');
 overlay.className='sr-prelude';overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML=`<div class="sr-prelude__backdrop"></div><div class="sr-prelude__grid"></div><i class="sr-prelude__slash"></i><i class="sr-prelude__slash"></i><div class="sr-prelude__brand">${logo}</div><div class="sr-prelude__baseline"><i></i><span>BARBEARIA · GRAVATÁ</span><i></i></div><i class="sr-prelude__cut"></i><span class="sr-prelude__bottom">SEU ESTILO, NOSSA ASSINATURA</span>`;
 if(!overlay.isConnected){document.body.append(overlay);root.classList.add('sr-loader-boot');}
 let removed=false;
 const events=new AbortController();
 const clear=()=>{
  if(removed)return;removed=true;clearTimeout(failsafe);events.abort();cancelWithin(overlay);root.classList.remove('sr-loader-boot');overlay.remove();
  document.dispatchEvent(new CustomEvent('openingend'));
 };
 const skip=()=>clear();
 const failsafe=setTimeout(clear,1800);
 document.addEventListener('motionchange',()=>{if(!canMove())clear()},{signal:events.signal});
 ['wheel','pointerdown','keydown'].forEach(type=>window.addEventListener(type,skip,{once:true,passive:true,signal:events.signal}));
 try{
  const brand=$('.sr-prelude__brand',overlay),mark=$('.hero-wordmark',document);
  if(!toHero){
   animate(brand,[{opacity:1,transform:'translate(-50%,-50%) scale(1)'},{opacity:0,transform:'translate(-50%,-50%) scale(.89)'}],{duration:560,delay:160,easing:flow,persist:true});
   animate($('.sr-prelude__backdrop',overlay),[{clipPath:'inset(0% 0% 0% 0%)'},{clipPath:'inset(0% 0% 100% 0%)'}],{duration:700,delay:170,easing:flow,persist:true});
   await new Promise(resolve=>setTimeout(resolve,910));
   return;
  }
  const from=brand.getBoundingClientRect(),to=mark.getBoundingClientRect();
  const dx=to.left+to.width/2-from.left-from.width/2;
  const dy=to.top+to.height/2-from.top-from.height/2;
  const size=Math.min(1.2,Math.max(.25,to.width/Math.max(1,from.width)));
  animate(brand,[{transform:'translate(-50%,-50%) scale(1)',opacity:1,offset:0},{transform:'translate(-50%,-50%) scale(1)',opacity:1,offset:.25},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(${size})`,opacity:0,offset:1}],{duration:1060,delay:120,easing:'cubic-bezier(.65,0,.2,1)',persist:true});
  animate($('.sr-prelude__baseline',overlay),[{opacity:1,transform:'translateX(-50%) translateY(0)'},{opacity:0,transform:'translateX(-50%) translateY(16px)'}],{duration:440,delay:400,easing:flow,persist:true});
  animate($('.sr-prelude__cut',overlay),[{transform:'rotate(-20deg) scaleX(.3)'},{transform:'rotate(-20deg) scaleX(8)',opacity:0}],{duration:750,delay:160,easing:flow,persist:true});
  $$('.sr-prelude__slash',overlay).forEach((e,i)=>animate(e,[{transform:'rotate(15deg) translateY(0)',opacity:1},{transform:`rotate(15deg) translateY(${i===0?'-120vh':'120vh'})`,opacity:0}],{duration:1040,delay:140+i*80,easing:flow,persist:true}));
  // Diagonal aperture: the underlying hero is physically revealed beneath the moving brand.
  const backdrop=$('.sr-prelude__backdrop',overlay);
  const cut=animate(backdrop,[
   {clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)',offset:0},
   {clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)',offset:.22},
   {clipPath:'polygon(0 0,100% 0,100% 48%,0 74%)',offset:.67},
   {clipPath:'polygon(0 0,100% 0,100% 0,0 0)',offset:1}
  ],{duration:1150,delay:120,easing:'cubic-bezier(.65,0,.2,1)',persist:true});
  animate($('.sr-prelude__grid',overlay),[{opacity:.6},{opacity:0}],{duration:480,delay:530,easing:flow,persist:true});
  animate($('.sr-prelude__bottom',overlay),[{opacity:.7},{opacity:0}],{duration:320,delay:420,easing:flow,persist:true});
  revealHero(false);
  await cut?.finished.catch(()=>{});
 }catch(error){console.warn('Abertura Sr. Navalha: recuperação aplicada',error);revealHero(true);}
 finally{clear();}
}
