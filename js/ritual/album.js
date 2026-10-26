import {$,$$,animate,cancelWithin,canMove,spatial} from './core.js';
const arrow=direction=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M${direction===1?'5 12h14m-6-6 6 6-6 6':'19 12H5m6-6-6 6 6 6'}"/></svg>`;
export function initAlbum(){
 const root=$('#trabalhos'),stage=$('.album-sheets',root),prints=$$('.work-print',stage),dock=$('.album-dock',root);let current=0,mode='folio',suppressClickUntil=0;
 const widths=[410,358,800,698,647,290];
 prints.forEach((p,i)=>{p.style.setProperty('--original-width',`${widths[i]}px`);const button=document.createElement('button');button.type='button';button.dataset.albumPhoto=i;button.setAttribute('aria-label',`Selecionar fotografia ${i+1}: ${$('figcaption>span',p).textContent}`);const thumb=$('img',p).cloneNode();thumb.alt='';thumb.removeAttribute('srcset');thumb.loading='lazy';button.append(thumb);dock.append(button);button.addEventListener('click',e=>select(i,e.detail===0));
 // A first tap selects a leaf; the selected photograph opens the real lightbox.
 $('.gallery-shot',p).addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();return}if(mode==='folio'&&i!==current){e.preventDefault();e.stopImmediatePropagation();select(i,e.detail===0)}},true);
 });
 $('.album-prev',root).innerHTML=arrow(-1);$('.album-next',root).innerHTML=arrow(1);
 function layout(){stage.classList.toggle('is-folio',mode==='folio');stage.classList.toggle('is-wall',mode==='wall');let slot=0;prints.forEach((p,i)=>{p.classList.toggle('is-selected',i===current);p.style.setProperty('--slot',i===current?0:slot++)});$$('[data-album-photo]',dock).forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));$$('[data-album-mode]',root).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.albumMode===mode)));$('.album-caption>span',root).textContent=`${String(current+1).padStart(2,'0')} / 06`;$('.album-caption>strong',root).textContent=$('figcaption>span',prints[current]).textContent;$('.album-enlarge',root).setAttribute('aria-label',`Ampliar fotografia: ${$('figcaption>span',prints[current]).textContent}`)}
 function transition(update,keyboard=false){
  // Capture the interrupted visual position before cancelling. Layout changes once.
  const before=canMove()&&!keyboard?prints.map(p=>p.getBoundingClientRect()):null;cancelWithin(stage);update();layout();
  if(!before)return;
  const snapshots=prints.map(p=>({after:p.getBoundingClientRect(),end:getComputedStyle(p).transform}));
  prints.forEach((p,i)=>{const {after,end}=snapshots[i];const dx=before[i].x-after.x,dy=before[i].y-after.y,sx=before[i].width/after.width,sy=before[i].height/after.height;
   animate(p,[{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy}) ${end==='none'?'':end}`},{transform:end}],{duration:520,delay:mode==='wall'?i*25:0,easing:spatial});
  });
 }
 function select(i,keyboard=false){i=(i+prints.length)%prints.length;if(i===current)return;transition(()=>current=i,keyboard);const caption=$('.album-caption',root);cancelWithin(caption);if(!keyboard)animate(caption,[{opacity:.4,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:240})}
 $$('[data-album-mode]',root).forEach(b=>b.addEventListener('click',e=>{if(mode!==b.dataset.albumMode)transition(()=>mode=b.dataset.albumMode,e.detail===0)}));
 $('.album-prev',root).addEventListener('click',e=>select(current-1,e.detail===0));$('.album-next',root).addEventListener('click',e=>select(current+1,e.detail===0));$('.album-enlarge',root).addEventListener('click',e=>$('.gallery-shot',prints[current]).dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,detail:e.detail})));
 dock.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();select(e.key==='Home'?0:e.key==='End'?prints.length-1:current+(e.key==='ArrowRight'?1:-1),true);$$('button',dock)[current].focus({preventScroll:true})});
 let start=null;stage.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;start={x:e.clientX,y:e.clientY}});stage.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)){suppressClickUntil=performance.now()+400;select(current+(dx<0?1:-1))}});stage.addEventListener('pointercancel',()=>start=null);
 addEventListener('resize',()=>cancelWithin(stage),{passive:true});
 layout();
}
