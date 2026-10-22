"""Packages the ready-to-serve site and its canonical sources. No build dependency."""
from pathlib import Path
import zipfile,json,hashlib
root=Path(__file__).resolve().parent.parent
out=root/'entrega/sr-navalha-arte-do-ritual.zip';out.parent.mkdir(exist_ok=True)
files=[]
for rel in ['index.html','README.md','PRODUCT.md','DESIGN.md','LEIA-ME-INSTALACAO.txt','css/ritual.css','.impeccable/design.json']:
 p=root/rel
 if p.exists():files.append(p)
for rel in ['css/ritual','js/ritual','js/data','templates/ritual','assets/fonts','assets/images/v8','assets/images/hero-redesign','assets/images/ritual','assets/originals/v8','assets/originals/hero-redesign','assets/originals/ritual','assets/video','docs/ritual','capturas/ritual','scripts']:
 files.extend(p for p in (root/rel).rglob('*') if p.is_file() and '__pycache__' not in str(p))
files.append(root/'assets/decor/favicon-v8.png')
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6)as z:
 for p in sorted(set(files)):z.write(p,'sr-navalha/'+p.relative_to(root).as_posix())
result={'zip':str(out.relative_to(root)),'bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'files':len(set(files)),'excluded':'Git, plugins, históricos e imagens locais não usadas continuam preservados no repositório.'}
(root/'entrega/arte-do-ritual-manifesto.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
