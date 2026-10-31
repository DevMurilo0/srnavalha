/* Original native typography engine. Layout text keeps kerning and line breaks;
   only absolute ink layers move. Each original text node remains the sole
   accessible source; links, emphasis and event listeners are never cloned. */
import { animate, canMove } from './core.js';
const owners = new WeakMap();
const graphemes = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('pt-BR',{granularity:'grapheme'}) : null;
const chars = text => graphemes ? [...graphemes.segment(text)].map(x=>x.segment) : Array.from(text);
const ease = 'cubic-bezier(.16,1,.3,1)';

// Character-led editorial gestures. Each heading is briefly segmented, then
// reverted to its ORIGINAL text nodes once the letters settle. No WebGL,
// perpetual ticker, blur, clip-path, or force-created image layers.
const letterSignature=(kind,index,total)=>{
  const alternate=index%2===0?1:-1;
  const distance=index-(total-1)/2;
  const edge=Math.abs(distance)/Math.max(1,(total-1)/2);
  switch(kind){
    // The new hero typesets from an invisible center seam outward. Ink units
    // travel in opposing diagonals with a short 3D counter-rotation.
    case 'monolith':return [
      {opacity:0,transform:`perspective(720px) translate3d(${alternate*(13+edge*19)}px,${23+edge*11}px,0) rotateY(${alternate*56}deg) rotateZ(${alternate*8}deg) scale(.85)`},
      {offset:.69,opacity:1,transform:`perspective(720px) translate3d(${-alternate*2}px,-3px,0) rotateY(${-alternate*3}deg) rotateZ(0deg) scale(1.025)`},
      {opacity:1,transform:'perspective(720px) translate3d(0,0,0) rotateY(0deg) rotateZ(0deg) scale(1)'}
    ];
    case 'inktrail': return [
      {opacity:0,transform:`translate3d(${-22-12*edge}px,35px,0) rotateZ(${-15+index%5*3}deg)`},
      {offset:.76,opacity:1,transform:'translate3d(2px,-3px,0) rotateZ(1deg)'},
      {opacity:1,transform:'translate3d(0,0,0) rotateZ(0deg)'}
    ];
    case 'crosscurrent':return [
      {opacity:0,transform:`translate3d(${alternate*34}px,${alternate*-15}px,0) rotateZ(${alternate*12}deg)`},
      {offset:.7,opacity:1,transform:`translate3d(${-alternate*3}px,2px,0) rotateZ(${-alternate*1.2}deg)`},
      {opacity:1,transform:'translate3d(0,0,0) rotateZ(0deg)'}
    ];
    case 'pendulum':return [
      {opacity:0,transform:`perspective(620px) translate3d(${alternate*-8}px,26px,0) rotateX(-68deg) rotateZ(${alternate*7}deg)`},
      {offset:.7,opacity:1,transform:'perspective(620px) translate3d(0,-2px,0) rotateX(4deg) rotateZ(0deg)'},
      {opacity:1,transform:'perspective(620px) translate3d(0,0,0) rotateX(0deg) rotateZ(0deg)'}
    ];
    case 'accordion':return [
      {opacity:0,transform:`translate3d(${alternate*13}px,6px,0) scaleX(.33) scaleY(1.08)`},
      {offset:.72,opacity:1,transform:'translate3d(0,-2px,0) scaleX(1.07) scaleY(.99)'},
      {opacity:1,transform:'translate3d(0,0,0) scale(1)'}
    ];
    case 'ghostprint':return [
      {opacity:0,transform:`translate3d(${alternate*19}px,${-26*edge}px,0) rotateZ(${alternate*9}deg) scale(.88)`},
      {offset:.7,opacity:1,transform:'translate3d(0,2px,0) rotateZ(0deg) scale(1.03)'},
      {opacity:1,transform:'translate3d(0,0,0) rotateZ(0deg) scale(1)'}
    ];
    case 'mirrorfold':return [
      {opacity:0,transform:`perspective(700px) translate3d(${alternate*14}px,15px,0) rotateY(${alternate*73}deg)`},
      {offset:.72,opacity:1,transform:`perspective(700px) translate3d(0,-2px,0) rotateY(${alternate*-5}deg)`},
      {opacity:1,transform:'perspective(700px) translate3d(0,0,0) rotateY(0deg)'}
    ];
    case 'shards':return [
      {opacity:0,transform:`translate3d(${alternate*29}px,${alternate*23}px,0) skewX(${alternate*13}deg) rotateZ(${alternate*-6}deg)`},
      {offset:.72,opacity:1,transform:'translate3d(0,-2px,0) skewX(0deg) rotateZ(0deg)'},
      {opacity:1,transform:'translate3d(0,0,0) skewX(0deg) rotateZ(0deg)'}
    ];
    default:return [
      {opacity:0,transform:`translate3d(${alternate*8}px,34px,0) rotateX(-55deg)`},
      {offset:.76,opacity:1,transform:'translate3d(0,-2px,0) rotateX(4deg)'},
      {opacity:1,transform:'translate3d(0,0,0) rotateX(0deg)'}
    ];
  }
};
const letterStagger=(kind,index,total)=>{
  const midpoint=(total-1)/2;
  const order=kind==='monolith'?Math.abs(index-midpoint)*1.25
    :kind==='crosscurrent'||kind==='ghostprint'
    ?Math.abs(index-midpoint)*2
    :kind==='mirrorfold'||kind==='accordion'
      ?total-1-index :index;
  // Noticeable, unhurried spacing without a long blocking animation.
  // Limits keep short words lively and longer titles below ~1.5 seconds.
  return Math.min(order*25,580);
};

export function cancelText(node) { owners.get(node)?.cancel(); }
export function cancelTextWithin(node) { cancelText(node);node.querySelectorAll('.cm-split').forEach(cancelText); }
export function revealText(node, mode='focus', {delay=0, duration, manual=false}={}) {
  cancelText(node);
  const effects=[], replacements=[], ghosts=[], restorers=[];
  let done=false, resolve;
  const finished=new Promise(r=>resolve=r);
  const cleanup=()=>{
    if(done)return;done=true;
    for(const effect of effects)effect.cancel();
    for(const {wrapper,original} of replacements)if(wrapper.isConnected)wrapper.replaceWith(original);
    for(const ghost of ghosts)ghost.remove();
    restorers.forEach(restore=>restore());
    node.classList.remove('cm-split','cm-kinetic-host');
    if(owners.get(node)===handle)owners.delete(node);
    resolve();
  };
  const handle={finished,cancel:cleanup,seek(progress){
    for(const effect of effects){const t=effect.effect.getComputedTiming();effect.currentTime=progress*t.endTime;}
    if(progress>=1)cleanup();
  }};
  owners.set(node,handle);
  if(!canMove()||!node.animate||!node.textContent.trim()){cleanup();return handle;}
  // Six masked printing plates, measured once in the natural line boxes.
  // Original text retains kerning, emphasis and semantics. The two lines travel
  // in opposing directions; groups move together rather than a glyph stagger.
  if(mode==='lightcut'){
    try{
      const lines=[...node.querySelectorAll('.title-mask>span')];
      const measured=lines.map(line=>{
        const box=line.getBoundingClientRect();
        const text=document.createTreeWalker(line,NodeFilter.SHOW_TEXT);
        const nodes=[];while(text.nextNode())nodes.push(text.currentNode);
        const length=nodes.reduce((n,t)=>n+t.length,0),edges=[0];
        for(const fraction of [1/3,2/3]){
          let offset=Math.round(length*fraction);
          for(const t of nodes){
            if(offset<=t.length){const range=document.createRange();range.setStart(t,offset);range.collapse(true);edges.push(range.getBoundingClientRect().left-box.left);break;}
            offset-=t.length;
          }
        }
        edges.push(box.width);
        return {line,box,edges,ink:getComputedStyle(line).color};
      });
      for(const {line,box,edges,ink} of measured){
        const index=lines.indexOf(line),color=line.style.color;
        // A transparent source remains laid out and is the only accessible text.
        restorers.push(()=>{line.style.color=color;line.classList.remove('cm-cut-line')});
        const html=line.innerHTML;line.classList.add('cm-cut-line');line.style.color='transparent';
        line.querySelectorAll('em').forEach(em=>{const color=em.style.color;restorers.push(()=>em.style.color=color);em.style.color='inherit'});
        for(let group=0;group<3;group++){
          const window=document.createElement('span');window.className='cm-cut-window';window.setAttribute('aria-hidden','true');
          Object.assign(window.style,{left:edges[group]+'px',width:Math.max(0,edges[group+1]-edges[group])+'px'});
          const plate=document.createElement('span');plate.className='cm-cut-ink';plate.innerHTML=html;
          Object.assign(plate.style,{left:-edges[group]+'px',width:box.width+'px',color:ink});
          window.append(plate);line.append(window);ghosts.push(window);
          const direction=index===0?-1:1;
          const effect=animate(plate,[
            {opacity:0,transform:`perspective(850px) translate3d(${direction*(18+group*5)}px,${index?-7:9}px,0) rotateY(${direction*12}deg)`},
            {opacity:1,transform:'perspective(850px) translate3d(0,0,0) rotateY(0deg)'}
          ],{duration:duration||640,delay:delay+index*90+[45,0,65][group],easing:ease,fill:'both',persist:true});
          if(effect){effect.id='sr-text-lightcut';effects.push(effect);if(manual){effect.pause();effect.currentTime=0}}
        }
      }
      if(!effects.length)cleanup();
      else if(!manual)Promise.allSettled(effects.map(e=>e.finished)).then(cleanup);
    }catch{cleanup();}
    return handle;
  }
  // Cinematic typography, one compositor animation per editorial phrase.
  // Split DOM/Range measurements are reserved for the hero and explicit
  // manual semantic fixtures. This is the crucial low-memory performance path.
  // Each mode has its own physical grammar: letterpress, blade-shear, negative
  // space, rotational fold, and optical compression. No extra DOM layers.
  if(!node.closest('.hero')&&mode!=='micro'&&!node.dataset.cmSignature&&(!manual||mode==='scroll')){
    try{
      const ink=getComputedStyle(node).color;
      const framesByMode={
        fold:[
          {opacity:0,transform:'perspective(750px) translateY(26px) rotateX(-32deg)'},
          {offset:.72,opacity:1,transform:'perspective(750px) translateY(-2px) rotateX(3deg)'},
          {opacity:1,transform:'perspective(750px) translateY(0px) rotateX(0deg)'}
        ],
        roll:[
          {opacity:0,transform:'translate3d(0,30px,0) rotateZ(4deg)'},
          {offset:.72,opacity:1,transform:'translate3d(0,-2px,0) rotateZ(-.6deg)'},
          {opacity:1,transform:'translate3d(0,0,0) rotateZ(0deg)'}
        ],
        stroke:[
          {opacity:0,color:'transparent',webkitTextStroke:`1px ${ink}`,transform:'translate3d(0,13px,0)'},
          {offset:.55,opacity:.95,color:'transparent',webkitTextStroke:`1px ${ink}`,transform:'translate3d(0,0,0)'},
          {opacity:1,color:ink,webkitTextStroke:`0px ${ink}`,transform:'translate3d(0,0,0)'}
        ],
        echo:[
          {opacity:0,transform:'translate3d(-24px,18px,0) scale(1.045) rotateZ(-2deg)'},
          {offset:.65,opacity:1,transform:'translate3d(2px,-2px,0) scale(.99) rotateZ(.25deg)'},
          {opacity:1,transform:'translate3d(0,0,0) scale(1) rotateZ(0deg)'}
        ],
        focus:[
          {opacity:0,transform:'translate3d(0,14px,0) scale(1.05)'},
          {opacity:1,transform:'translate3d(0,0,0) scale(1)'}
        ],
        lines:[
          {opacity:0,transform:'translate3d(-20px,0,0) skewX(9deg)'},
          {offset:.8,opacity:1,transform:'translate3d(2px,0,0) skewX(-1deg)'},
          {opacity:1,transform:'translate3d(0,0,0) skewX(0deg)'}
        ],
        scroll:[
          {opacity:.16,transform:'perspective(680px) translate3d(0,18px,0) rotateX(-19deg)'},
          {opacity:1,transform:'perspective(680px) translate3d(0,0,0) rotateX(0deg)'}
        ],
        // Four bespoke modes not tied to a preset text-animation package.
        inkpress:[
          {opacity:0,transform:'translate3d(0,-18px,0) scale(1.085,.82)'},
          {offset:.48,opacity:1,transform:'translate3d(0,5px,0) scale(.97,1.045)'},
          {opacity:1,transform:'translate3d(0,0,0) scale(1,1)'}
        ],
        blade:[
          {opacity:0,transform:'translate3d(32px,0,0) skewX(-18deg) scaleX(.93)'},
          {offset:.72,opacity:1,transform:'translate3d(-3px,0,0) skewX(2deg) scaleX(1.015)'},
          {opacity:1,transform:'translate3d(0,0,0) skewX(0deg) scaleX(1)'}
        ],
        negative:[
          {opacity:0,transform:'translate3d(-19px,9px,0) scaleX(.84)'},
          {offset:.66,opacity:1,transform:'translate3d(3px,-1px,0) scaleX(1.02)'},
          {opacity:1,transform:'translate3d(0,0,0) scaleX(1)'}
        ],
        shutter:[
          {opacity:0,transform:'translate3d(0,19px,0) rotateZ(-2deg) scale(.98)'},
          {offset:.72,opacity:1,transform:'translate3d(0,-2px,0) rotateZ(.3deg) scale(1.01)'},
          {opacity:1,transform:'translate3d(0,0,0) rotateZ(0deg) scale(1)'}
        ],
        // Text that "floats" into print, settles and stays still.
        slipstream:[
          {opacity:0,transform:'translate3d(22px,12px,0) skewX(-6deg)'},
          {offset:.66,opacity:1,transform:'translate3d(-3px,-1px,0) skewX(1.5deg)'},
          {opacity:1,transform:'translate3d(0,0,0) skewX(0deg)'}
        ],
        looseink:[
          {opacity:0,transform:'translate3d(-14px,8px,0) scaleX(.96)'},
          {offset:.7,opacity:1,transform:'translate3d(2px,-1px,0) scaleX(1.008)'},
          {opacity:1,transform:'translate3d(0,0,0) scaleX(1)'}
        ],
        breath:[
          {opacity:0,transform:'translate3d(0,14px,0) rotateZ(-1.3deg)'},
          {offset:.72,opacity:1,transform:'translate3d(0,-2px,0) rotateZ(.25deg)'},
          {opacity:1,transform:'translate3d(0,0,0) rotateZ(0deg)'}
        ]
      };
      // The original sentence stays in the DOM, untouched and accessible.
      // Each named signature is a single kinetic poster gesture. One optional
      // outline ghost gives the impression of drifting type without a WebGL
      // scene, a canvas render loop, or 80 letter-level animations.
      const signatures={
        inktrail:[
          {opacity:0,transform:'translate3d(-34px,22px,0) rotateZ(-5deg) skewX(-8deg) scaleX(.9)'},
          {offset:.64,opacity:1,transform:'translate3d(6px,-3px,0) rotateZ(1deg) skewX(2deg) scaleX(1.035)'},
          {opacity:1,transform:'translate3d(0,0,0) rotateZ(0) skewX(0) scaleX(1)'}
        ],
        crosscurrent:[
          {opacity:0,transform:'translate3d(38px,-22px,0) rotateZ(4deg) skewX(12deg) scaleX(.89)'},
          {offset:.65,opacity:1,transform:'translate3d(-5px,3px,0) rotateZ(-.7deg) skewX(-2deg) scaleX(1.02)'},
          {opacity:1,transform:'translate3d(0,0,0) rotateZ(0) skewX(0) scaleX(1)'}
        ],
        pendulum:[
          {opacity:0,transform:'perspective(850px) translate3d(-18px,33px,0) rotateY(-23deg) rotateZ(-3deg)'},
          {offset:.7,opacity:1,transform:'perspective(850px) translate3d(4px,-3px,0) rotateY(3deg) rotateZ(.5deg)'},
          {opacity:1,transform:'perspective(850px) translate3d(0,0,0) rotateY(0) rotateZ(0)'}
        ],
        accordion:[
          {opacity:0,transform:'translate3d(0,24px,0) scaleX(.78) scaleY(1.11)'},
          {offset:.62,opacity:1,transform:'translate3d(0,-3px,0) scaleX(1.035) scaleY(.98)'},
          {opacity:1,transform:'translate3d(0,0,0) scale(1)'}
        ],
        ghostprint:[
          {opacity:0,transform:'translate3d(-23px,-17px,0) rotateZ(-3deg) scale(1.035)'},
          {offset:.63,opacity:1,transform:'translate3d(3px,2px,0) rotateZ(.6deg) scale(.993)'},
          {opacity:1,transform:'translate3d(0,0,0) rotateZ(0) scale(1)'}
        ],
        mirrorfold:[
          {opacity:0,transform:'perspective(800px) translate3d(24px,11px,0) rotateY(19deg) scaleX(.92)'},
          {offset:.68,opacity:1,transform:'perspective(800px) translate3d(-3px,-2px,0) rotateY(-2deg) scaleX(1.015)'},
          {opacity:1,transform:'perspective(800px) translate3d(0,0,0) rotateY(0) scaleX(1)'}
        ]
      };
      const signature=node.dataset.cmSignature;
      const frames=signatures[signature]||framesByMode[mode]||framesByMode.negative;
      const lowPower=matchMedia('(max-width:760px)').matches||
        (navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4)||
        navigator.connection?.saveData===true;
      const time=duration||({fold:690,roll:640,stroke:740,echo:750,focus:590,lines:680,
        scroll:920,inkpress:760,blade:710,negative:670,shutter:670,slipstream:690,looseink:650,breath:720}[mode]||650);
      const effect=animate(node,frames,{
        duration:signature?Math.min(time+120,840):time,delay,easing:ease,fill:'both',persist:true
      });
      if(effect){
        effect.id=`sr-text-${mode}`;effects.push(effect);
        // Only large, short editorial titles earn ONE translucent outline
        // afterimage. It disappears once the original lands in its own box.
        if(signature&&!lowPower&&node.matches('h2')&&node.textContent.length<115){
          const ghost=document.createElement('span');
          ghost.className='cm-kinetic-ghost';
          ghost.setAttribute('aria-hidden','true');
          ghost.style.setProperty('--cm-ghost-ink',ink);
          ghost.innerHTML=node.innerHTML;
          node.classList.add('cm-kinetic-host');
          node.append(ghost);ghosts.push(ghost);
          const reverse=signature==='crosscurrent'||signature==='mirrorfold';
          const drift=reverse?-26:26;
          const echo=animate(ghost,[
            {opacity:0,transform:`translate3d(${drift}px,-12px,0) rotateZ(${reverse?-4:4}deg) scale(1.025)`},
            {offset:.4,opacity:.34,transform:`translate3d(${-drift*.27}px,4px,0) rotateZ(0deg) scale(1.01)`},
            {opacity:0,transform:'translate3d(0,0,0) rotateZ(0deg) scale(1)'}
          ],{duration:Math.min(time+30,740),delay,easing:'cubic-bezier(.2,.78,.22,1)',fill:'both'});
          if(echo){echo.id=`sr-ghost-${signature}`;effects.push(echo);}
          else{ghost.remove();ghosts.pop();node.classList.remove('cm-kinetic-host');}
        }
        if(manual){effect.pause();effect.currentTime=0;}
        else effect.finished.catch(()=>{}).finally(cleanup);
      }else cleanup();
    }catch{cleanup();}
    return handle;
  }
  const live=node.closest('[aria-live]')||node.querySelector('[aria-live]');
  // Live regions retain an untouched text tree, avoiding repeated announcements.
  if(live||mode==='micro'){
    try{
      // A single compositor-friendly fade + translation: no clipping or
      // glyph measurements for every price, caption, paragraph or CTA.
      const frames=node.closest('.hero')
        ?[{opacity:0},{opacity:1}]
        :[{opacity:0,translate:'0 14px'},{opacity:1,translate:'0 0px'}];
      const effect=animate(node,frames,{duration:duration||460,delay,easing:ease,fill:'both'});
      if(effect){effect.id='sr-text-micro';effects.push(effect);effect.finished.catch(()=>{}).finally(cleanup);}else cleanup();
    }catch{cleanup();}
    return handle;
  }
  try{
    const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT,{
      acceptNode:text=>text.textContent.trim()&&!text.parentElement.closest('svg,script,.cm-source')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT
    });
    const texts=[];while(walker.nextNode())texts.push(walker.currentNode);
    const words=[];
    for(const original of texts){
      const wrapper=document.createElement('span');wrapper.className='cm-run';
      const source=document.createElement('span');source.className='cm-source';source.textContent=original.textContent;
      const visual=document.createElement('span');visual.setAttribute('aria-hidden','true');
      for(const token of original.textContent.split(/(\s+)/u)){
        if(!token)continue;
        if(/^\s+$/u.test(token)){visual.append(document.createTextNode(token));continue;}
        const word=document.createElement('span');word.className='cm-word';
        const layout=document.createElement('span');layout.className='cm-layout';layout.textContent=token;
        const ink=document.createElement('span');ink.className='cm-ink';ink.textContent=token;
        word.append(layout,ink);visual.append(word);words.push({word,layout,ink,token});
      }
      wrapper.append(source,visual);original.replaceWith(wrapper);replacements.push({wrapper,original});
    }
    node.classList.add('cm-split');
    // A 320px phone can render 100+ letter effects in one hero. Keep the
    // distinctive word-level motion there, reserve glyph splitting for desktop.
    const modestCPU=navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4;
    // Per-letter reveal is intentionally limited to the page's major
    // display headings; secondary copy remains ONE animation per paragraph.
    // Even on a four-thread notebook a 20-35 character heading is affordable
    // when it runs only once and all frames use compositor-safe transforms.
    const headingLetters=node.matches('h1,h2')&&
      (Boolean(node.dataset.cmSignature)||node.closest('.hero'))&&
      words.reduce((count,word)=>count+chars(word.token).length,0)<=100;
    const useChars=headingLetters||(!matchMedia('(max-width:700px)').matches&&!modestCPU&&
      ['hero','roll','stroke'].includes(mode)&&node.textContent.length<230);
    const units=[];
    // All measurements precede effect creation. Line groups follow real wrapping.
    const lineTops=[];
    for(const item of words){
      // Read the inherited ink color ONCE per word, not once per character.
      // This keeps the 4-thread/mid-range GPU path cheap.
      const color=getComputedStyle(item.ink).color;
      const rect=item.word.getBoundingClientRect();
      let line=lineTops.findIndex(top=>Math.abs(top-rect.top)<4);
      if(line<0){line=lineTops.length;lineTops.push(rect.top);}
      if(useChars){
        item.ink.textContent='';let offset=0;
        for(const letter of chars(item.token)){
          const range=document.createRange();range.setStart(item.layout.firstChild,offset);range.setEnd(item.layout.firstChild,offset+letter.length);
          const box=range.getBoundingClientRect();offset+=letter.length;
          const glyph=document.createElement('span');glyph.className='cm-letter';glyph.textContent=letter;
          glyph.style.left=`${box.left-rect.left}px`;glyph.style.width=`${box.width}px`;
          item.ink.append(glyph);units.push({ink:glyph,line,color});
        }
      }else units.push({ink:item.ink,line,color});
      if(mode==='hero'||mode==='echo'){
        const echo=document.createElement('span');echo.className='cm-echo';echo.textContent=item.token;item.word.append(echo);
        units.push({ink:echo,line,color,echo:true});
      }
    }
    const baseDuration=duration||({hero:1000,fold:850,roll:660,stroke:1100,echo:1050,focus:630,lines:750,scroll:1000}[mode]||700);
    const signature=node.dataset.cmSignature;
    const totalGlyphs=units.filter(unit=>!unit.echo).length;
    let letterIndex=0;
    units.forEach(({ink,line,echo,color},index)=>{
      const glyphIndex=echo?0:letterIndex++;
      let frames;
      if(!echo&&headingLetters)frames=letterSignature(signature||'hero',glyphIndex,totalGlyphs);
      else if(echo)frames=[{opacity:.32,transform:'translate3d(-.1em,.38em,-30px)'},{opacity:0,transform:'translate3d(0,0,0)'}];
      else if(mode==='stroke')frames=[
        {offset:0,opacity:0,color:'transparent',webkitTextStroke:`.7px ${color}`,clipPath:'inset(0 100% 0 0)'},
        {offset:.45,opacity:1,color:'transparent',webkitTextStroke:`.7px ${color}`,clipPath:'inset(0 0 0 0)'},
        {offset:1,opacity:1,color,webkitTextStroke:`0px ${color}`,clipPath:'inset(0 0 0 0)'}];
      else if(mode==='hero'||mode==='fold')frames=[{opacity:0,transform:'perspective(700px) translate3d(0,105%,40px) rotateX(-68deg)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'perspective(700px) translate3d(0,0,0) rotateX(0deg)',clipPath:'inset(0 0 0 0)'}];
      else if(mode==='roll')frames=[{transform:'translateY(115%)',clipPath:'inset(0 0 100% 0)'},{transform:'translateY(0)',clipPath:'inset(0 0 0 0)'}];
      else if(mode==='focus')frames=[{opacity:0,filter:'blur(3px)',transform:'translateX(.18em)'},{opacity:1,filter:'blur(0px)',transform:'translateX(0)'}];
      else if(mode==='echo')frames=[{opacity:0,transform:'perspective(700px) translate3d(.12em,.4em,70px)'},{opacity:1,transform:'perspective(700px) translate3d(0,0,0)'}];
      else if(mode==='scroll')frames=[{opacity:.2,transform:'perspective(600px) rotateX(-22deg) translateY(.2em)'},{opacity:1,transform:'perspective(600px) rotateX(0) translateY(0)'}];
      else frames=[{clipPath:`inset(0 ${line%2?0:100}% 0 ${line%2?100:0}%)`,transform:`translateX(${line%2?'-': ''}.15em)`},{clipPath:'inset(0 0 0 0)',transform:'translateX(0)'}];
      const stagger=headingLetters&&!echo
        ?letterStagger(signature||'hero',glyphIndex,totalGlyphs)
        :mode==='lines'||mode==='fold'?line*105:Math.min(index*(useChars?17:38),manual?700:380);
      const effect=animate(ink,frames,{duration:headingLetters&&!echo?760:baseDuration,
        delay:delay+stagger,easing:ease,fill:'both',persist:true});
      if(effect){effect.id=`sr-text-${echo?'echo':mode}`;effects.push(effect);if(manual){effect.pause();effect.currentTime=0;}}
    });
    if(!effects.length)cleanup();
    else if(!manual)Promise.allSettled(effects.map(e=>e.finished)).then(cleanup);
  }catch{cleanup();}
  return handle;
}
