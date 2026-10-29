/* One bounded scroll reader. Read all geometry before seeking any effect.
   Progress only moves forward: a finished sentence never rewinds on return. */
export function createScrollMotion(){
  const scenes=new Map();let frame=0;
  const update=()=>{
    frame=0;
    const samples=[...scenes].map(([node,scene])=>({node,scene,rect:node.getBoundingClientRect()}));
    for(const {node,scene,rect} of samples){
      const progress=Math.max(scene.progress,Math.min(1,Math.max(0,(innerHeight*.86-rect.top)/(innerHeight*.36))));
      scene.progress=progress;scene.effect.seek(progress);node.dataset.cmProgress=progress.toFixed(3);
      if(progress>=1||rect.bottom<0){scene.effect.cancel();scenes.delete(node);scene.finish();}
    }
  };
  const request=()=>{if(!frame&&scenes.size)frame=requestAnimationFrame(update);};
  addEventListener('scroll',request,{passive:true});
  const clear=()=>{cancelAnimationFrame(frame);frame=0;for(const scene of scenes.values()){scene.effect.cancel();scene.finish();}scenes.clear();};
  addEventListener('resize',clear,{passive:true});addEventListener('pagehide',clear);
  document.addEventListener('motionchange',clear);
  return{add(node,effect,finish){scenes.set(node,{effect,finish,progress:0});request();},clear};
}
