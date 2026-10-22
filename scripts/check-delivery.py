from pathlib import Path
from html.parser import HTMLParser
import re,json,subprocess,hashlib
root=Path(__file__).resolve().parent.parent;missing=[];refs=[];ids=[];anchors=[]
class Audit(HTMLParser):
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id'in d:ids.append(d['id'])
  for a in ['src','href']:
   if a in d:
    v=d[a]
    if v.startswith('#'):anchors.append(v[1:])
    elif v and not re.match(r'^[a-z]+:|^//',v):refs.append((root,v))
  if 'srcset'in d:
   refs.extend((root,v.strip().split()[0])for v in d['srcset'].split(','))
Audit().feed((root/'index.html').read_text())
for p in (root/'css/ritual').glob('*.css'):
 refs.extend((p.parent,v)for v in re.findall(r'url\([\'\"]?([^\)\'\"]+)',p.read_text())if not v.startswith('data:'))
for p in list((root/'js/ritual').glob('*.js'))+list((root/'js/data').glob('*.js')):
 refs.extend((p.parent,v)for v in re.findall(r'from\s*[\'\"]([^\'\"]+)',p.read_text())if v.startswith('.'))
for base,name in refs:
 if not(base/name.split('?')[0]).exists():missing.append(str(base/name))
html=root/'index.html';before=hashlib.sha256(html.read_bytes()).hexdigest();subprocess.run(['node','scripts/render-site.mjs'],cwd=root,check=True,capture_output=True);after=hashlib.sha256(html.read_bytes()).hexdigest()
result={'missingLocalReferences':sorted(set(missing)),'missingAnchors':sorted(set(anchors)-set(ids)),'duplicateIds':sorted({i for i in ids if ids.count(i)>1}),'generatorDeterministic':before==after,'referencesChecked':len(refs),'activeLegacyReferences':bool(re.search(r'(?:hero-v11|hero-pontual|css/site.css|js/site.js)',html.read_text()))}
(root/'docs/ritual/entrega-validacao.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
