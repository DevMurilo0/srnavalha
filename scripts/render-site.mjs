// The Cut: approved editorial composition. Data stays in the existing modules.
import {readFile,writeFile} from 'node:fs/promises';
import services from '../js/data/services.js';
import professionals from '../js/data/professionals.js';
import products from '../js/data/products.js';
import reviews from '../js/data/reviews.js';
const read=name=>readFile(new URL(`../templates/the-cut/${name}.html`,import.meta.url),'utf8');
const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const arrow='<svg class="arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const nav=[['casa','A casa'],['servicos','Serviços'],['equipe','Nossa equipe'],['trabalhos','O trabalho'],['produtos','Produtos'],['localizacao','Localização']].map(([id,text])=>`<a href="#${id}">${text}</a>`).join('');
const logo=id=>`<svg class="official-logo" viewBox="0 34 640 330" role="img" aria-label="Sr. Navalha Barbearia"><defs><filter id="logo-${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .078 0 0 0 0 .078 0 0 0 0 .07 .466 .466 .466 0 -.34"/></filter></defs><image href="assets/images/v8/logo-640.webp" width="640" height="412" filter="url(#logo-${id})"/></svg>`;
const pole='<div class="barber-pole" aria-hidden="true"><span class="pole-cap"></span><span class="pole-ring"></span><span class="pole-glass"><span class="pole-cylinder"></span></span><span class="pole-ring"></span><span class="pole-cap pole-bottom"></span></div>';
const booking=id=>'agendar.html?servico='+encodeURIComponent(id);
const consultation=p=>'https://wa.me/5581995722396?text='+encodeURIComponent('Olá! Gostaria de consultar a disponibilidade de '+p.name+'.');
const selected=['cortee','barba-simples','comb-cort-barb-simples'];
const featured=selected.map((id,i)=>{const s=services.find(s=>s.id===id);const price=s.price.match(/R\$ (\d+),(\d+)/);return `<article class="service-panel ${i===2?'service-wood':''}"><div class="service-top"><h3>${i===1?'Barba<br>simples':i===2?'Corte +<br>barba simples':'Corte'}</h3><div class="service-numbers"><span>${esc(s.duration)}</span><p><small>R$</small> <strong>${price[1]}</strong><small>,${price[2]}</small></p></div></div><p class="service-description">${['Seu corte. Sua marca.','Precisão nos detalhes.','O clássico da casa.'][i]}</p><a href="${booking(id)}">${['Agendar corte','Agendar barba','Agendar combo'][i]} ${arrow}</a></article>`}).join('');
const allServices=services.map(s=>`<article data-service="${esc(s.id)}" data-search="${esc(s.name+' '+s.category)}"><div><h3>${esc(s.name)}</h3><p>${esc(s.category)} · ${esc(s.duration)}</p>${s.description?`<p>${esc(s.description)}</p>`:''}</div><strong>${s.fromPrice?'A partir de ':''}${esc(s.price)}</strong><a href="${booking(s.id)}" aria-label="Agendar ${esc(s.name)}">Agendar ${arrow}</a></article>`).join('');
const productIds=['pomada-fox-premium','oleo-para-barba','pomada-orange'];
const featuredProducts=productIds.map(id=>products.find(p=>p.id===id));
const productNames=['Pomada Fox<br>Premium','Óleo para barba<br>Fox','Pomada<br>Orange'];
const gallery=[['servico-comb-cort-barb-simples','Corte e barba'],['servico-barba-simples','Precisão no desenho da barba'],['servico-luzes','Corte e textura'],['servico-barboterapia','Barboterapia'],['servico-corte-infantil','Corte infantil'],['servico-platinado','Platinado']];
const tokens={
 ARROW:arrow,NAV:nav,LOGO_HEADER:logo('header'),LOGO_HERO:logo('hero'),LOGO_FOOTER:logo('footer'),POLE:pole,
 FEATURED_SERVICES:featured,
 EXTRA_SERVICES:['barboterapia','comb-corte-barboterapia','barba-premium'].map(id=>{const s=services.find(s=>s.id===id);return `<a href="${booking(id)}"><span>${esc(s.name)}</span><strong>${esc(s.price)}</strong></a>`}).join(''),
 ALL_SERVICES:allServices,
 TEAM_CONTROLS:professionals.map((p,i)=>`<button type="button" data-person="${p.id}" aria-pressed="${i===0}" aria-controls="person-name"><span>${p.name}</span>${arrow}</button>`).join(''),
 GALLERY_FEATURED:gallery.slice(0,3).map(([id,name],i)=>`<figure class="work-print print-${i}"><div data-depth="${8+i*3}"><a href="assets/images/v8/${id}-960.webp" data-open-gallery="${i}" aria-label="Ampliar: ${name}"><img src="assets/images/v8/${id}-640.webp" width="640" height="640" alt="${name}" loading="lazy"></a></div></figure>`).join(''),
 PRODUCT_OBJECTS:featuredProducts.map((p,i)=>`<a href="${consultation(p)}" class="product-object product-object-${i}" aria-label="Consultar disponibilidade de ${esc(p.name)}" target="_blank" rel="noopener noreferrer"><img src="assets/images/the-cut/products/${p.id}.webp" alt="${esc(p.name)} — embalagem original" width="640" height="640" loading="lazy"></a>`).join(''),
 FEATURED_PRODUCTS:featuredProducts.map((p,i)=>`<article><img src="assets/images/the-cut/products/${p.id}.webp" width="100" height="100" alt="" loading="lazy"><div><h3>${productNames[i]}</h3><a href="${consultation(p)}" target="_blank" rel="noopener noreferrer" aria-label="Consultar disponibilidade de ${esc(p.name)}">Consultar disponibilidade ${arrow}</a></div></article>`).join(''),
 PRODUCT_CATEGORIES:['Todos',...new Set(products.map(p=>p.category))].map(c=>`<option>${esc(c)}</option>`).join(''),
 ALL_PRODUCTS:products.map(p=>`<article data-product="${p.id}" data-category="${esc(p.category)}" data-search="${esc(p.name)}">${p.image?`<img src="${p.image}" width="120" height="120" alt="${esc(p.name)}" loading="lazy">`:`<span class="product-placeholder">Fotografia indisponível</span>`}<div><h3>${esc(p.name)}</h3><p>${esc(p.category)} · ${esc(p.price)}</p><a href="${consultation(p)}" target="_blank" rel="noopener noreferrer">Consultar disponibilidade ${arrow}</a></div></article>`).join(''),
 SERVICE_OPTIONS:services.map(s=>`<option value="${s.id}">${esc(s.name)} — ${s.fromPrice?'a partir de ':''}${esc(s.price)}</option>`).join(''),
 TEAM_OPTIONS:professionals.map(p=>`<option value="${p.id}">${p.name}</option>`).join(''),
 REVIEWS:reviews.items.map(r=>`<blockquote><p>“${esc(r.text)}”</p><cite><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.author)}</a></cite></blockquote>`).join('')
};
const sections=['inicio','casa','servicos','equipe','trabalhos','produtos','agendamento','localizacao'];
let html=`<!doctype html>\n<html lang="pt-BR">\n<head>${await read('head')}</head>\n<body>\n${await read('header')}\n<main id="conteudo">${(await Promise.all(sections.map(read))).join('\n')}</main>\n${await read('footer')}\n</body>\n</html>\n`;
html=html.replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=>{if(!(key in tokens))throw new Error('Unknown template token: '+key);return tokens[key]});
await writeFile(new URL('../index.html',import.meta.url),html);
console.log('The Cut: index.html assembled from templates/the-cut and original commercial data.');
