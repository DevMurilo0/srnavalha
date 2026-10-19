import {$,$$,reduced,motion,cut,on,cleanup} from './core.js';
export function initOpening(){let curtain=null,safety=0,openingTimer=0,playing=false;const entrance=[];
function finish(){clearTimeout(safety);clearTimeout(openingTimer);curtain?.remove();curtain=null;playing=false;entrance.splice(0).forEach(a=>a?.cancel())}
function play(){if(playing||reduced.matches||document.hidden||scrollY>100)return;playing=true;
 try{
 curtain=document.createElement('div');curtain.className='opening-curtain';curtain.setAttribute('aria-hidden','true');
 curtain.innerHTML='<div class="opening-panel"></div><div class="opening-panel"></div><div class="opening-identity"><img src="assets/images/v9/logo.webp" width="791" height="269" alt=""><span class="opening-line"></span><span>GRAVATÁ · PERNAMBUCO</span></div>';document.body.append(curtain);
 safety=setTimeout(finish,2200);
 const run=(el,frames,opt)=>{const a=motion(el,frames,opt);entrance.push(a);return a};
 run($('.opening-identity img',curtain),[{clipPath:'inset(100% 0 0)',transform:'translateY(12px)'},{clipPath:'inset(0)',transform:'none'}],{duration:420});
 run($('.opening-line',curtain),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:450,delay:100});
 run($('.opening-identity',curtain),[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-18px)'}],{duration:240,delay:460,fill:'both'});
 $$('.opening-panel',curtain).forEach((el,i)=>run(el,[{transform:'translateX(0)'},{transform:`translateX(${i?102:-102}%)`}],{duration:930,delay:430,easing:cut,fill:'both'}));
 run($('.hero-photo-reveal'),[{clipPath:'inset(15% 12% 15% 12%)'},{clipPath:'inset(0)'}],{duration:1050,delay:430,easing:cut});
 run($('.hero-photo-reveal img'),[{transform:'scale(1.13)'},{transform:'scale(1)'}],{duration:1250,delay:400});
 $$('.type-mask>*').forEach((el,i)=>run(el,[{transform:'translateY(110%) rotate(2deg)'},{transform:'translateY(0) rotate(0)'}],{duration:900,delay:560+i*95,fill:'backwards'}));
 [$('.hero-meta'),$('.hero-invitation'),$('.hero-detail'),$('.hero-bottom')].filter(Boolean).forEach((el,i)=>run(el,[{opacity:0,translate:'0 20px'},{opacity:1,translate:'0 0'}],{duration:550,delay:720+i*60,fill:'backwards'}));
 openingTimer=setTimeout(()=>{curtain?.remove();curtain=null;playing=false},1400);
 }catch{finish()}}
on($('[data-replay]'),'click',()=>{finish();play()});on(reduced,'change',finish);on(window,'scroll',()=>{if(scrollY>120)finish()},{passive:true});cleanup(finish);
// Only essential assets are given a short decode budget; the rest never gate the curtain.
Promise.race([Promise.all([$('.hero-photo-reveal img')?.decode().catch(()=>{}),document.fonts.ready]),new Promise(r=>setTimeout(r,180))]).then(play);
}
