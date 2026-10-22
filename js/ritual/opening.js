import {$,$$,animate,canMove,cancelWithin,spatial} from './core.js';
// One engraved plate. A real window opens onto the hero; no curtains, fake progress or resource wait.
export async function openRitual(){
 if(!canMove()||(location.hash&&location.hash!=='#inicio'))return;
 try{if(sessionStorage.getItem('sr-intro-v17')&&!new URLSearchParams(location.search).has('intro'))return;sessionStorage.setItem('sr-intro-v17','seen')}catch{}
 const w=innerWidth,h=innerHeight,room=$('.hero-room .photo-window').getBoundingClientRect(),cx=room.x+room.width/2,cy=Math.min(h*.76,room.y+room.height/2);
 const overlay=document.createElement('div');overlay.className='opening-mark opening-engraved';overlay.setAttribute('aria-hidden','true');
 const crest=$('.hero-engraving svg').outerHTML;
 const logo=$('.hero-logo-transparent').outerHTML.replaceAll('sr-logo-ink','sr-opening-ink').replace('0.105','0.945').replace('0.09','0.918').replace('0.082','0.878');
 overlay.innerHTML=`<svg class="opening-plate" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><mask id="opening-aperture" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="white"/><rect class="opening-window" width="${w}" height="${h}" fill="black"/></mask></defs><rect width="${w}" height="${h}" fill="#171615" mask="url(#opening-aperture)"/></svg><div class="opening-inscription"><div class="opening-crest">${crest}</div><div class="opening-logo">${logo}</div><span>BARBEARIA · GRAVATÁ</span><i></i></div>`;
 document.body.append(overlay);
 let removed=false;const abort=new AbortController();
 const remove=()=>{if(removed)return;removed=true;clearTimeout(timeout);abort.abort();cancelWithin(overlay);overlay.remove();document.dispatchEvent(new CustomEvent('openingend'))};
 const timeout=setTimeout(remove,1950);document.addEventListener('motionchange',()=>{if(!canMove())remove()},{signal:abort.signal});
 for(const event of ['wheel','pointerdown','keydown'])addEventListener(event,remove,{once:true,passive:true,signal:abort.signal});
 const matrix=(sx,sy,x,y)=>`matrix(${sx},0,0,${sy},${x},${y})`;
 const aperture=$('.opening-window',overlay);aperture.style.transformOrigin='0 0';
 const cut=animate(aperture,[{transform:matrix(.001,.001,cx,cy),offset:0},{transform:matrix(.32,.002,cx-w*.16,cy),offset:.29},{transform:matrix(room.width/w,room.height/h,room.x,room.y),offset:.57},{transform:matrix(1,1,0,0),offset:1}],{duration:1330,easing:spatial});
 const inscription=$('.opening-inscription',overlay);inscription.style.opacity='0';animate(inscription,[{opacity:1,transform:'none',offset:0},{opacity:1,transform:'none',offset:.5},{opacity:0,transform:'translateY(-30px) scale(.95)',offset:1}],{duration:850});
 $$('.opening-crest path',overlay).forEach((p,i)=>animate(p,[{strokeDasharray:1,strokeDashoffset:1},{strokeDasharray:1,strokeDashoffset:0}],{duration:500,delay:i*15}));
 animate($('.opening-inscription i',overlay),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:580});
 animate($('.hero-wordmark'),[{opacity:.3,transform:'translateY(25px) scale(.92)'},{opacity:1,transform:'none'}],{duration:900,delay:500});
 $$('.hero h1 .motion-word').forEach((word,i)=>animate(word,[{transform:'translateY(105%) rotateX(-35deg)',opacity:.2},{transform:'none',opacity:1}],{duration:850,delay:570+i*65}));
 $$('.hero-facade .photo-window,.hero-room .photo-window,.hero-detail .photo-window').forEach((el,i)=>{animate(el,[{clipPath:i===1?'inset(0 0 100% 0)':'inset(0 100% 0 0)'},{clipPath:'inset(0)'}],{duration:1000,delay:430+i*90});animate($('img',el),[{transform:'scale(1.12) translateY(4%)'},{transform:'none'}],{duration:1150,delay:450+i*90})});
 $$('.hero-intro,.hero-invitation>p,.hero-invitation>.button,.hero-bottom').forEach((el,i)=>animate(el,[{opacity:.1,translate:'0 20px'},{opacity:1,translate:'0 0'}],{duration:650,delay:650+i*65}));
 await cut?.finished.catch(()=>{});remove();
}
