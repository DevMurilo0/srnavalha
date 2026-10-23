// Canonical static source: static, reviewable section templates. No build needed to serve.
// Commercial records remain in js/data; templates preserve their verified snapshots.
import {readFile,writeFile} from 'node:fs/promises';
const read=name=>readFile(new URL(`../templates/v17/${name}.html`,import.meta.url),'utf8');
const sections=['inicio','casa','servicos','equipe','trabalhos','produtos','avaliacoes','localizacao'];
const html=`<!doctype html>\n<html lang="pt-BR">\n<head>${await read('head')}</head>\n<body>\n${await read('loader')}
${await read('skip')}\n${await read('header')}\n<main id="conteudo">${(await Promise.all(sections.map(read))).join('\n')}</main>\n${await read('footer')}\n${await read('dialog')}\n${await read('noscript')}\n</body>\n</html>\n`;
await writeFile(new URL('../index.html',import.meta.url),html);
console.log('index.html assembled from templates/v17 (current chapters, loader and interludes).');
