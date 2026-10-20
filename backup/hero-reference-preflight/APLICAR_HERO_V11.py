#!/usr/bin/env python3
"""Atualização conservadora da Sr. Navalha. Altera apenas header e hero.

Compatível com base V9 ou V10; dá backup e opcionalmente gera ZIP completo
com as seções originais preservadas. Python 3.10+, sem npm/pip.
"""
from __future__ import annotations
import argparse, hashlib, json, re, shutil, sys, zipfile
from datetime import datetime
from pathlib import Path

HERE=Path(__file__).resolve().parent
FILES=[
 'css/hero-v11.css','js/hero-v11.js',
 'assets/images/hero-ambiente-1920.webp','assets/images/hero-ambiente-3840.webp',
 'assets/images/hero-ambiente-mobile-960.webp',
 'scripts/hero-v11-patch.mjs','scripts/v11-templates/header.html','scripts/v11-templates/hero.html',
]
IGNORE={'.git','node_modules','.next','dist','test-results','capturas','.taste-skill','.agents','plugins','backup','backups','artifacts','.venv','__pycache__','preview'}

def require(cond,msg):
 if not cond: raise RuntimeError(msg)
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def remove_old_includes(s):
 s=re.sub(r'<link[^>]+href="assets/images/(?:hero-redesign/fachada-[^\"]+|hero-ref-v10\.webp|hero-ambiente-1920\.webp|hero-ambiente-mobile-960\.webp)"[^>]*>', '', s)
 s=re.sub(r'<link[^>]+href="css/(?:hero-pontual-v10|hero-v11)\.css"[^>]*>', '', s)
 s=re.sub(r'<script[^>]+src="js/(?:hero-pontual-v10|hero-v11)\.js"[^>]*></script>', '', s)
 return s

def transform_html(s):
 s=remove_old_includes(s)
 a=s.find('<header class="header')
 b=s.find('</header>',a)
 d=s.find('<section class="services paper section"',b)
 c=min([v for v in [s.find('<div class="hero-journey',b),s.find('<section class="nv2-hero',b)] if v>=0],default=-1)
 require(min(a,b,c,d)>=0 and a<b<c<d,'Estrutura V9/V10 não reconhecida; nenhuma alteração aplicada.')
 header=(HERE/'templates/header.html').read_text().strip()
 hero=(HERE/'templates/hero.html').read_text().strip()
 s=s[:c]+hero+'\n'+s[d:]
 s=s[:a]+header+'\n'+s[b+len('</header>'):].lstrip('\n')
 require('</head>' in s,'Cabeçalho <head> não encontrado.')
 tags='<link rel="preload" as="image" media="(min-width:641px)" href="assets/images/hero-ambiente-1920.webp" imagesrcset="assets/images/hero-ambiente-1920.webp 1920w, assets/images/hero-ambiente-3840.webp 3840w" imagesizes="100vw" fetchpriority="high"><link rel="preload" as="image" media="(max-width:640px)" href="assets/images/hero-ambiente-mobile-960.webp" fetchpriority="high"><link rel="stylesheet" href="css/hero-v11.css"><script defer src="js/hero-v11.js"></script>'
 return s.replace('</head>',tags+'</head>',1)

def transform_sitejs(s):
 original='initHero();initPassages();initReviews();initServices();initOpening();'
 replaced='initPassages();initReviews();initServices();'
 if original in s:return s.replace(original,replaced)
 # Already patched by V10: do not alter rest of site.js
 require(replaced in s,'Inicialização original de hero não reconhecida em js/site.js.')
 return s

def transform_builder(s):
 old="writeFileSync('index.html',html);"
 if 'transformHeroV11' in s:return s
 if 'transformHeroV10' in s:
  s=s.replace("import {transformHeroV10} from './hero-v10-patch.mjs';", "import {transformHeroV11} from './hero-v11-patch.mjs';")
  s=s.replace('transformHeroV10(html)','transformHeroV11(html)')
  require('transformHeroV10' not in s,'Encontrada referência antiga não substituída no gerador.')
  return s
 require(old in s,'Gerador HTML V9 mudou; interrompido para preservar o projeto.')
 return "import {transformHeroV11} from './hero-v11-patch.mjs';\n"+s.replace(old,"writeFileSync('index.html',transformHeroV11(html));",1)

def main():
 ap=argparse.ArgumentParser(description='Instala só o hero V11 na Sr. Navalha V9/V10')
 ap.add_argument('projeto',type=Path,help='Caminho da pasta srnavalha existente')
 ap.add_argument('--dry-run',action='store_true',help='Conferir sem escrever')
 ap.add_argument('--no-zip',action='store_true',help='Não gerar ZIP completo do projeto atualizado')
 args=ap.parse_args()
 root=args.projeto.expanduser().resolve()
 require(root.is_dir(),f'Pasta não encontrada: {root}')
 paths=[root/'index.html',root/'js/site.js',root/'scripts/build-v9.mjs']
 for p in paths: require(p.is_file(),f'Arquivo original ausente: {p}. Restaure apenas esse arquivo a partir do Git antes de continuar.')
 for name in FILES: require((HERE/name).is_file(),f'Pacote incompleto: {name}')
 # templates stored in scripts/ for the installed builder
 contents={paths[0]:transform_html(paths[0].read_text()),paths[1]:transform_sitejs(paths[1].read_text()),paths[2]:transform_builder(paths[2].read_text())}
 # Confirm no downstream section differs from the existing HTML after hero replacement
 old=paths[0].read_text()
 marker='<section class="services paper section"'
 assert contents[paths[0]].split(marker,1)[1]==old.split(marker,1)[1], 'Conteúdo após serviços não foi preservado!'
 if args.dry_run:
  print('OK: compatível com a estrutura existente. Seções a partir de Serviços idênticas. Nenhum arquivo alterado.')
  return
 stamp=datetime.now().strftime('%Y%m%d-%H%M%S')
 backup=root.parent/f'{root.name}-backup-hero-v11-{stamp}'
 backup.mkdir(parents=True,exist_ok=False)
 changed=[]
 for p in paths:
  dest=backup/p.relative_to(root);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
  if p.read_text()!=contents[p]:p.write_text(contents[p]);changed.append(str(p.relative_to(root)))
 for name in FILES:
  source=HERE/name;target=root/name;target.parent.mkdir(parents=True,exist_ok=True)
  if target.exists():
   if digest(target)==digest(source):continue
   bd=backup/name;bd.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(target,bd)
  shutil.copy2(source,target);changed.append(name)
 (backup/'modificacoes.json').write_text(json.dumps({'alterados':changed},indent=2,ensure_ascii=False))
 print('Hero V11 instalado. Backup:',backup)
 print('Arquivos alterados:\n - '+'\n - '.join(changed))
 if not args.no_zip:
  out=root.parent/f'{root.name}-Hero-V11-completo.zip'
  with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
   for f in root.rglob('*'):
    if not f.is_file():continue
    rel=f.relative_to(root)
    if any(part in IGNORE for part in rel.parts) or f.suffix in {'.log','.pyc'}:continue
    z.write(f,arcname=str(Path(root.name)/rel))
  print('ZIP completo do projeto preservado:',out)

if __name__=='__main__':
 try:main()
 except Exception as e:print('ERRO:',e,file=sys.stderr);sys.exit(1)
