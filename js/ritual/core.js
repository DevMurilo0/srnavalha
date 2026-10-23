export const $=(selector,root=document)=>root.querySelector(selector);
export const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
export const preference=matchMedia('(prefers-reduced-motion: reduce)');
export const ease='cubic-bezier(.22,1,.36,1)';
export const flow='cubic-bezier(.22,.68,.2,1)';
export const spatial='cubic-bezier(.76,0,.24,1)';
const active=new Set();let paused=false;
export const canMove=()=>!preference.matches&&!paused&&!document.hidden;
export function animate(element,frames,options={}){
 if(!element||!canMove()||!element.animate)return null;
 const animation=element.animate(frames,{duration:720,easing:ease,fill:'backwards',...options});
 active.add(animation);animation.finished.then(()=>{active.delete(animation);if(!options.persist)animation.cancel()}).catch(()=>active.delete(animation));return animation;
}
export function cancelWithin(root){for(const a of active)if(root.contains(a.effect?.target)){a.cancel();active.delete(a)}}
export function setPaused(value){paused=value;refresh()}
export const isPaused=()=>paused;
function refresh(){if(!canMove())for(const a of active)a.cancel();document.documentElement.classList.toggle('motion-on',canMove());document.documentElement.classList.toggle('motion-paused',paused);document.dispatchEvent(new CustomEvent('motionchange',{detail:{paused,reduced:preference.matches,hidden:document.hidden}}))}
preference.addEventListener('change',refresh);document.addEventListener('visibilitychange',refresh);
export function startMotion(){refresh()}
// Only the latest decoded request may change a photographic stage.
const sequence=new WeakMap();
export function invalidatePhoto(stage){sequence.set(stage,(sequence.get(stage)||0)+1);cancelWithin(stage)}
export async function changePhoto(stage,src,alt,{mode='reflection',keyboard=false,srcset='',sizes=''}={}){
 const token=(sequence.get(stage)||0)+1;sequence.set(stage,token);
 const next=new Image();next.alt=alt;next.width=800;next.height=800;next.decoding='async';next.src=src;
 if(srcset){next.srcset=srcset;next.sizes=sizes}
 try{await next.decode()}catch{if(sequence.get(stage)===token){stage.replaceChildren(Object.assign(document.createElement('div'),{className:'no-image',textContent:'Fotografia indisponível. Consulte o catálogo oficial.'}));stage.dispatchEvent(new CustomEvent('photofailure',{bubbles:true}))};return false}
 if(sequence.get(stage)!==token)return false;
 cancelWithin(stage);
 // Retain the last photograph beneath the incoming mask: rapid selections never flash.
 const old=stage.querySelector('img.is-current')||stage.querySelector('img');
 stage.replaceChildren(...(old?[old]:[]),next);next.className='is-current swap-image';if(old)old.className='previous-image';
 const motion=!keyboard?animate(next,mode==='product'?[{opacity:0,transform:'translateX(32px) rotate(3deg) scale(.95)'},{opacity:1,transform:'none'}]:[{clipPath:'polygon(0 0,0 0,-12% 100%,0 100%)',transform:'translateX(5%) scale(1.05)'},{clipPath:'polygon(0 0,112% 0,100% 100%,0 100%)',transform:'none'}],{duration:mode==='product'?440:620,easing:flow}):null;
 const clean=()=>{if(sequence.get(stage)===token){stage.replaceChildren(next);next.className='is-current'}};
 if(motion)motion.finished.then(clean).catch(clean);else clean();
 stage.dispatchEvent(new CustomEvent('photochange',{bubbles:true,detail:{mode}}));
 return true;
}
export function activateButtonLink(element,handler){element.setAttribute('role','button');element.addEventListener('click',event=>{event.preventDefault();handler(event)});element.addEventListener('keydown',event=>{if(event.key===' '){event.preventDefault();handler(event)}})}
