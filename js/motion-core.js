/* Local motion runtime. All content is visible until a complete system can start. */
(() => {
  if (window.SrMotion) return;
  const queries = {
    reduced: matchMedia('(prefers-reduced-motion: reduce)'),
    desktop: matchMedia('(min-width: 761px)'),
    fine: matchMedia('(hover: hover) and (pointer: fine)'),
  };
  const builders = new Map();
  const session = { heroDone:false, headerDone:false, titles:new WeakSet() };
  const state = { status:'idle', generation:0, scope:null, media:null, error:null };
  const preferences = () => ({ reduced:queries.reduced.matches, desktop:queries.desktop.matches, fine:queries.fine.matches });
  let refreshFrame=0;
  const refresh=()=>{if(!refreshFrame)refreshFrame=requestAnimationFrame(()=>{refreshFrame=0;if(state.status==='ready')window.ScrollTrigger?.refresh();});};
  const notify = () => dispatchEvent(new CustomEvent('sr:motionchange', {detail:{...preferences(),status:state.status}}));

  class Scope {
    constructor(conditions) { this.conditions=conditions;this.splits=new Set();this.wrappers=[];this.cleanups=[];this.styles=new Map();this.hero=null; }
    save(...nodes) { nodes.flat().filter(Boolean).forEach(node=>{if(!this.styles.has(node))this.styles.set(node,node.getAttribute('style'));}); }
    split(node,options) { const split=SplitText.create(node,options);this.splits.add(split);return split; }
    wrap(node,className) {
      const wrapper=document.createElement('div');wrapper.className=className;
      node.before(wrapper);wrapper.append(node);this.wrappers.push(wrapper);return wrapper;
    }
    add(cleanup) { this.cleanups.push(cleanup); }
    dispose() {
      this.cleanups.splice(0).reverse().forEach(fn=>{try{fn();}catch{ /* Keep recovery independent of individual effects. */ }});
      this.splits.forEach(split=>split.revert());this.splits.clear();
      this.wrappers.splice(0).reverse().forEach(wrapper=>{if(wrapper.parentNode){wrapper.replaceWith(...wrapper.childNodes);}});
      this.styles.forEach((style,node)=>{if(style===null)node.removeAttribute('style');else node.setAttribute('style',style);});this.styles.clear();
    }
  }
  function recover(error) {
    state.error=String(error?.message||error||'Motion unavailable');
    state.media?.revert();state.media=null;state.scope?.dispose();state.scope=null;
    document.documentElement.classList.remove('motion-enabled');
    document.documentElement.classList.add('motion-fallback');state.status='fallback';notify();
  }
  async function boot() {
    if(state.status!=='idle')return;
    document.documentElement.classList.replace('no-js','js');
    if(!window.gsap||!window.ScrollTrigger||!window.SplitText) { recover('A local animation library is unavailable');return; }
    state.status='loading';
    try {
      gsap.registerPlugin(ScrollTrigger,SplitText);
      // No initial hiding, even while a font is delayed or unavailable.
      if(document.fonts)await document.fonts.ready;
      state.media=gsap.matchMedia();
      state.media.add({ desktop:'(min-width: 761px)', mobile:'(max-width: 760px)', reduced:'(prefers-reduced-motion: reduce)', fine:'(hover: hover) and (pointer: fine)' }, context=>{
        const scope=new Scope(context.conditions);state.scope=scope;state.generation++;
        if(context.conditions.reduced){state.status='reduced';document.documentElement.classList.remove('motion-enabled');notify();return()=>scope.dispose();}
        try {
          builders.forEach(build=>build(scope));
          document.documentElement.classList.add('motion-enabled');document.documentElement.classList.remove('motion-fallback');
          state.status='ready';notify();
          refresh();
        }catch(error){scope.dispose();queueMicrotask(()=>recover(error));}
        return()=>{scope.dispose();document.documentElement.classList.remove('motion-enabled');};
      });
    }catch(error){recover(error);}
  }
  window.SrMotion={use:(name,build)=>builders.set(name,build),preferences,session,state,recover,boot,refresh,
    debug:()=>({status:state.status,generation:state.generation,version:window.gsap?.version,splits:state.scope?.splits.size||0,scrollTriggers:window.ScrollTrigger?.getAll().length||0,heroProgress:state.scope?.hero?.progress()??1,error:state.error})};
  // Functional scripts can register ScrollTriggers before the font-dependent scenes start.
  if(window.gsap&&window.ScrollTrigger)gsap.registerPlugin(ScrollTrigger);
  if(!window.gsap||!window.ScrollTrigger||!window.SplitText)queries.reduced.addEventListener('change',notify);
  addEventListener('pagehide',event=>{if(!event.persisted){state.media?.revert();dispatchEvent(new Event('sr:motiondispose'));}},{once:true});
})();
