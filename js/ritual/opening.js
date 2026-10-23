import {$,$$,animate,canMove,cancelWithin,spatial,flow} from './core.js';

// A shorter engraved aperture. The hero keeps the same layout and original photographs.
function revealHero(compact=false){
 const lead=compact?35:310,duration=compact?540:760;
 animate($('.hero-wordmark'),[{opacity:.35,transform:'translateY(15px) scale(.97)'},{opacity:1,transform:'none'}],{duration,delay:lead,easing:flow});
 $$('.hero h1 .motion-word').forEach((word,i)=>animate(word,[{transform:`translateY(${compact?60:100}%) rotateX(-16deg)`,opacity:.2},{transform:'none',opacity:1}],{duration,delay:lead+45+Math.min(i*48,230),easing:flow}));
 $$('.hero-facade .photo-window,.hero-room .photo-window,.hero-detail .photo-window').forEach((el,i)=>{
  animate(el,[{clipPath:i===1?'inset(0 0 100% 0)':'inset(0 100% 0 0)'},{clipPath:'inset(0)'}],{duration:compact?620:800,delay:lead+i*60,easing:flow});
  animate($('img',el),[{transform:'scale(1.065) translateY(2%)'},{transform:'none'}],{duration:compact?720:900,delay:lead+35+i*60,easing:flow});
 });
 $$('.hero-intro,.hero-invitation>p,.hero-invitation>.button,.hero-invitation>.text-link,.hero-bottom').forEach((el,i)=>animate(el,[{opacity:.2,translate:'0 15px'},{opacity:1,translate:'0 0'}],{duration:compact?430:590,delay:lead+95+i*48,easing:flow}));
}
export async function openRitual(){
 if(!canMove()||(location.hash&&location.hash!=='#inicio'))return;
 try{
  if(sessionStorage.getItem('sr-intro-v17')&&!new URLSearchParams(location.search).has('intro')){revealHero(true);return}
  sessionStorage.setItem('sr-intro-v17','seen');
 }catch{}
 const w=innerWidth,h=innerHeight,room=$('.hero-room .photo-window').getBoundingClientRect(),cx=room.x+room.width/2,cy=Math.min(h*.76,room.y+room.height/2);
 const overlay=document.createElement('div');overlay.className='opening-mark opening-engraved';overlay.setAttribute('aria-hidden','true');
 const crest=$('.hero-engraving svg').outerHTML;
 const logo=$('.hero-logo-transparent').outerHTML.replaceAll('sr-logo-ink','sr-opening-ink').replace('0.105','0.945').replace('0.09','0.918').replace('0.082','0.878');
 overlay.innerHTML=`<svg class="opening-plate" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><mask id="opening-aperture" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="white"/><rect class="opening-window" width="${w}" height="${h}" fill="black"/></mask></defs><rect width="${w}" height="${h}" fill="#171615" mask="url(#opening-aperture)"/></svg><div class="opening-inscription"><div class="opening-crest">${crest}</div><div class="opening-logo">${logo}</div><span>BARBEARIA · GRAVATÁ</span><i></i></div>`;
 document.body.append(overlay);
 let removed=false;const abort=new AbortController();
 const remove=()=>{if(removed)return;removed=true;clearTimeout(timeout);abort.abort();cancelWithin(overlay);overlay.remove();document.dispatchEvent(new CustomEvent('openingend'))};
 const skip=()=>{cancelWithin($('.hero'));remove()};
 const timeout=setTimeout(skip,1650);
 document.addEventListener('motionchange',()=>{if(!canMove())skip()},{signal:abort.signal});
 for(const event of ['wheel','pointerdown','keydown'])addEventListener(event,skip,{once:true,passive:true,signal:abort.signal});
 const matrix=(sx,sy,x,y)=>`matrix(${sx},0,0,${sy},${x},${y})`;
 const aperture=$('.opening-window',overlay);aperture.style.transformOrigin='0 0';
 const cut=animate(aperture,[
  {transform:matrix(.001,.001,cx,cy),offset:0,easing:flow},
  {transform:matrix(.32,.002,cx-w*.16,cy),offset:.2,easing:flow},
  {transform:matrix(room.width/w,room.height/h,room.x,room.y),offset:.52,easing:spatial},
  {transform:matrix(1,1,0,0),offset:1}
 ],{duration:1080,easing:'linear'});
 const inscription=$('.opening-inscription',overlay);inscription.style.opacity='0';
 animate(inscription,[{opacity:1,transform:'none',offset:0},{opacity:1,transform:'none',offset:.37},{opacity:0,transform:'translateY(-18px) scale(.98)',offset:1}],{duration:580,easing:flow});
 $$('.opening-crest [pathLength]',overlay).forEach((p,i)=>animate(p,[{strokeDasharray:1,strokeDashoffset:1},{strokeDasharray:1,strokeDashoffset:0}],{duration:390,delay:i*12,easing:flow}));
 animate($('.opening-inscription i',overlay),[{transform:'scaleX(.15)'},{transform:'scaleX(1)'}],{duration:440,easing:flow});
 revealHero();
 await cut?.finished.catch(()=>{});remove();
}
