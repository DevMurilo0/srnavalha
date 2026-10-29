/* Sr. Navalha — single owner for scroll entrances across the entire page.
 * All meaningful copy and photographic surfaces reveal WHEN they enter view.
 * No synchronous hide-after-paint, no per-scroll handlers, no transforms on
 * FLIP album cards, and no hidden content if JS/motion fails.
 */
import { $, $$, canMove } from './core.js';

export function initMotion() {
  const root = document.documentElement;
  const main = $('main');
  const footer = $('footer');
  if (!main || !('IntersectionObserver' in window)) return;

  const compact = matchMedia('(max-width:700px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const text = 'h2,h3,h4,p,blockquote,figcaption,address,small,li,span,strong,em,label,time,dt,dd,a,button,summary,.text-link,.mirror-choice,.team-name,.service-name,.service-price,.option-price,.rating>strong,.footer-oversize-lead,.footer-oversize-main,.footer-feature-cta,.footer-small-note,.catalog-tally';
  const images = 'img,.photo-window,.image-stage,.house-portal,.mirror-frame,.team-portrait,.product-hero,.footer-visual,.review-visual-frame,.map-frame,.team-mood-photo,.album-editorial-print,.product-photo-detail,.visit-storefront';
  const selector = text+','+images;
  const excludes = '.hero,.sr-chapter,.sr-scene-join,dialog,[hidden],[inert],[aria-hidden="true"],#sr-loader-stage,.sr-prelude';
  const decorated = new WeakSet();
  const active = new Set();
  const pending = new Set();
  let observer, mutations, scrollFrame = 0;

  const clear = element => {
    pending.delete(element);
    element.classList.remove('sr-scroll-pending','sr-scroll-image','sr-scroll-text');
    element.classList.add('sr-scroll-done');
  };
  const releaseAll = () => {
    observer?.disconnect();
    mutations?.disconnect();
    cancelAnimationFrame(scrollFrame);
    scrollFrame=0;
    for (const animation of active) {
      const node = animation.effect?.target;
      if (node) clear(node);
      try { animation.cancel(); } catch {}
    }
    active.clear();
    $$('.sr-scroll-pending').forEach(clear);
  };
  if (reduced.matches || !canMove()) {
    root.classList.add('sr-motion-initialized');
    return;
  }

  const appear = element => {
    observer.unobserve(element);
    pending.delete(element);
    if (!element.classList.contains('sr-scroll-pending')) return;
    if (!canMove()) { clear(element); return; }
    const photo = element.classList.contains('sr-scroll-image');
    const row = element.matches('.service-name,.service-price,.option-price,li,small');
    const siblings = [...element.parentElement.children];
    const index = Math.max(0,siblings.indexOf(element));
    const delay = Math.min(index,3)*(compact.matches?28:43);
    const duration = photo?(compact.matches?760:960):row?550:(compact.matches?640:790);
    const frames = photo ? [
      {opacity:0,translate:'0 27px',scale:.96,clipPath:'inset(9% 0 0 0)'},
      {opacity:1,translate:'0 0px',scale:1,clipPath:'inset(0 0 0 0)'}
    ] : [
      {opacity:0,translate:'0 38px'},
      {opacity:1,translate:'0 0px'}
    ];
    try {
      const animation=element.animate(frames,{
        duration,delay,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'
      });
      animation.id=photo?'sr-scroll-photo':'sr-scroll-text';
      active.add(animation);
      // Clear the parking class before canceling fill: no end-of-animation flash.
      animation.finished.catch(()=>{}).finally(()=>{
        clear(element);
        active.delete(animation);
        try { animation.cancel(); } catch {}
      });
    } catch {
      clear(element);
    }
  };

  observer = new IntersectionObserver(entries=>{
    // Never abandon an element due to an arbitrary animation-budget limit.
    // Offscreen nodes stay parked, visible nodes always get their entrance.
    for (const entry of entries) if (entry.isIntersecting) appear(entry.target);
  },{threshold:0,rootMargin:'36px 0px 36px 0px'});

  const enroll = scope => {
    // A root may itself be a selected element (dynamically inserted media).
    const nodes = [
      ...(scope.matches?.(selector)?[scope]:[]),
      ...scope.querySelectorAll(selector)
    ];
    for (const node of nodes) {
      if (decorated.has(node) || node.closest(excludes)) continue;
      if (!node.closest('main section:not(.hero),footer')) continue;
      if (!node.getClientRects().length) continue;
      // Do not animate nested photographic layers twice, nor interactive
      // images managed by changePhoto() or the album's FLIP transform.
      const photo = node.matches(images);
      if (photo && node.closest('.image-stage') !== node &&
          node.closest('.image-stage')) continue;
      if (photo && node.closest('.photo-window') !== node &&
          node.closest('.photo-window')) continue;
      if (photo && node.parentElement?.closest(images)) continue;
      if (node.matches('.service-entry,.album-sheets,.work-print')) continue;
      // Photographic links already have a dedicated image entrance.
      if (!photo && node.matches('a,button') && node.querySelector(images) &&
          !node.textContent.trim()) continue;
      // Animate complete lines/controls, never every word inside the same
      // paragraph or button. This covers stand-alone text without double motion.
      if (!photo && node.parentElement?.closest(text) &&
          node.parentElement.closest('main section:not(.hero),footer')) continue;
      if (!photo && node.parentElement?.closest(images)) continue;
      decorated.add(node);

      const rect=node.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top < innerHeight*.84) {
        clear(node);
        continue;
      }
      node.classList.add('sr-scroll-pending',photo?'sr-scroll-image':'sr-scroll-text');
      pending.add(node);
      observer.observe(node);
    }
  };
  // The hero keeps its independent opening; every following section and
  // footer text/image gets a one-time scroll entrance.
  $$('main section:not(.hero)').forEach(enroll);
  if (footer) enroll(footer);

  // Catalog/album content can be inserted after initialization. Newly
  // inserted content receives the same visibility guarantees.
  mutations = new MutationObserver(records=>{
    for (const record of records) {
      for (const item of record.addedNodes) if (item.nodeType===1) enroll(item);
    }
  });
  mutations.observe(main,{childList:true,subtree:true});
  if (footer) mutations.observe(footer,{childList:true,subtree:true});

  // A bounded compositor-frame fallback catches fast anchor jumps and
  // partially clipped content that IntersectionObserver may miss between
  // scroll positions. The set SHRINKS as elements reveal; no layout writes.
  const recoverVisible = () => {
    scrollFrame=0;
    if (!canMove()) return;
    const windowHeight=innerHeight;
    for (const node of pending) {
      if (!node.isConnected) { pending.delete(node);continue; }
      const rect=node.getBoundingClientRect();
      if (rect.top<windowHeight*.84 && rect.bottom>0) appear(node);
    }
  };
  const queueRecovery = () => {
    if (!scrollFrame && pending.size) scrollFrame=requestAnimationFrame(recoverVisible);
  };
  addEventListener('scroll',queueRecovery,{passive:true});
  addEventListener('resize',queueRecovery,{passive:true});

  // Keyboard focus and deliberate jumps should never land on invisible text.
  document.addEventListener('focusin',event=>{
    const node=event.target.closest?.('.sr-scroll-pending');
    if (node) { observer.unobserve(node);clear(node); }
  });
  document.addEventListener('motionchange',()=>{
    if (!canMove()) releaseAll();
  });
  addEventListener('pagehide',releaseAll,{once:true});

  // Keep navigation state for keyboard and landmark users without a
  // per-frame scroll listener.
  const nav=$$('.desktop-nav a');
  const navObserver=new IntersectionObserver(entries=>{
    const entry=entries.find(e=>e.isIntersecting);
    if (!entry) return;
    nav.forEach(a=>a.hash===`#${entry.target.id}`
      ?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));
  },{rootMargin:'-10% 0px -65%'});
  $$('main section[id]').forEach(el=>navObserver.observe(el));

  root.classList.add('sr-motion-initialized');
}
