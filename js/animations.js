/* Bootstrap only. The previous generic IntersectionObservers and CSS entrances were removed. */
(() => {
  const boot=()=>window.SrMotion?.boot();
  if(document.readyState==='complete')boot();
  else document.addEventListener('DOMContentLoaded',boot,{once:true});
})();
