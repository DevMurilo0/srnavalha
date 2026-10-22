export const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
export const reduced=matchMedia('(prefers-reduced-motion: reduce)');
export const low=!!navigator.connection?.saveData||(navigator.deviceMemory||8)<=2;
export const ease='cubic-bezier(.16,1,.3,1)',cut='cubic-bezier(.76,0,.24,1)';
export const clamp=v=>Math.max(0,Math.min(1,v));
export const range=(a,b,v)=>{const p=clamp((v-a)/(b-a));return p*p*(3-2*p)};
const controller=new AbortController();
export const on=(el,type,fn,options={})=>el?.addEventListener(type,fn,{...options,signal:controller.signal});
const active=new Set();
export function motion(el,frames,options={}){if(!el)return;el.getAnimations().forEach(a=>a.cancel());if(reduced.matches||!el.animate)return;const a=el.animate(frames,{duration:260,easing:ease,...options});active.add(a);a.finished.catch(()=>{}).finally(()=>{active.delete(a);if(!['both','forwards'].includes(options.fill))a.cancel()});return a}
const readers=new Set(),writers=new Set(),continuous=new Set();let frame=0,last=0;
export const stats={frames:0,heroProgress:0,activeScenes:0,continuous:0};
function tick(time){frame=0;if(document.hidden)return;const dt=Math.min(40,time-last||16);last=time;stats.frames++;readers.forEach(fn=>fn());writers.forEach(fn=>fn());continuous.forEach(fn=>fn(time,dt));stats.continuous=continuous.size;if(continuous.size)wake();else last=0}
export function wake(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick)}
export function scene(read,write){readers.add(read);writers.add(write);wake();return()=>{readers.delete(read);writers.delete(write)}}
export function loop(fn,enabled){if(enabled)continuous.add(fn);else continuous.delete(fn);wake()}
on(window,'scroll',wake,{passive:true});on(window,'resize',wake,{passive:true});on(document,'visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;active.forEach(a=>a.pause())}else{active.forEach(a=>a.play());wake()}});
on(reduced,'change',()=>{active.forEach(a=>a.cancel());wake()});
export function visible(el,fn,margin='15% 0px'){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{fn(e.isIntersecting);wake()}),{rootMargin:margin});observer.observe(el);return()=>observer.disconnect()}
const cleanups=[];export const cleanup=fn=>cleanups.push(fn);
on(window,'pagehide',e=>{if(e.persisted)return;controller.abort();cancelAnimationFrame(frame);active.forEach(a=>a.cancel());readers.clear();writers.clear();continuous.clear();cleanups.forEach(fn=>fn())});
window.SrNavalhaMotion=stats;
