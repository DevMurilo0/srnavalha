import {readFileSync,writeFileSync} from'node:fs';import services from'../js/data/services.js';import products from'../js/data/products.js';import team from'../js/data/professionals.js';
const source=JSON.parse(readFileSync('docs/ritual/appbarber-confirmacao.json'));
const parts=source['Serviços'].text.split('Agendar');const checks=[];
for(const s of services){const start=source['Serviços'].text.indexOf('\n'+s.sourceName+'\n');const chunk=start<0?'':source['Serviços'].text.slice(start).split('Agendar')[0];checks.push({kind:'service',id:s.id,pass:!!chunk&&chunk.includes(s.price==='Sob consulta'?'R$ Consultar':s.price)&&chunk.includes(s.duration)&&(!s.fromPrice||chunk.includes('A partir de:'))})}
const pt=source['Produtos'].text;for(const p of products){const name=p.name==='Pomada coffee'?'POMDA COFFEE':p.name.toUpperCase();const pos=pt.indexOf(name);checks.push({kind:'product',id:p.id,pass:pos>=0&&pt.slice(pos,pos+name.length+50).includes(p.price)})}
for(const p of team)checks.push({kind:'professional',id:p.id,pass:source['Profissionais'].images.some(i=>i.alt===p.name.toUpperCase()&&i.src===p.source)});
writeFileSync('docs/ritual/conteudo-verificado.json',JSON.stringify({date:'2026-10-22',checks},null,2));console.log(JSON.stringify({total:checks.length,failures:checks.filter(c=>!c.pass)},null,2));
