import {$}from'./core.js';
export function initMap(){initAddressCopy();const shell=$('.map-frame'),frame=$('iframe',shell),retry=$('#retry-map'),message=$('.map-message',shell);let timer=0,loaded=false;
function unavailable(){if(loaded)return;shell.classList.add('is-unavailable');message.textContent='O mapa não carregou. Abra a rota no Google Maps ou tente novamente.';retry.hidden=false;}
function start(){clearTimeout(timer);timer=setTimeout(unavailable,12000)}
frame.addEventListener('load',()=>{loaded=true;clearTimeout(timer);shell.classList.remove('is-unavailable');shell.classList.add('is-ready');retry.hidden=true;message.textContent='Mapa do Google Maps carregado.'});frame.addEventListener('error',unavailable);
const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){if(!loaded)start();observer.disconnect()}},{rootMargin:'150px'});observer.observe(shell);
retry.addEventListener('click',()=>{loaded=false;shell.classList.remove('is-ready','is-unavailable');retry.hidden=true;message.textContent='Carregando o Google Maps. Você também pode abrir a rota diretamente.';const url=new URL(frame.src);url.searchParams.set('reload',Date.now());frame.src=url.href;start()});
}

function initAddressCopy(){
 const button=$('.visit-address-copy'),address=$('.visit-info address'),status=$('.visit-copy-status');
 if(!button||!address)return;
 button.hidden=false;
 button.addEventListener('click',async()=>{
  const text=address.innerText.replace(/\n/g,', ');
  try{
   await navigator.clipboard.writeText(text);
   status.textContent='Endereço copiado.';
  }catch{
   const range=document.createRange();range.selectNodeContents(address);
   const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
   status.textContent='Endereço selecionado. Use a opção Copiar do seu dispositivo.';
  }
 });
}
