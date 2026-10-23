"""Package the static site; Node/build dependencies are not required to open it."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib, json
root=Path(__file__).resolve().parent.parent
paths=['index.html','README.md','DESIGN.md','PRODUCT.md','css/ritual.css','css/ritual','js/ritual','js/data','assets','templates/v17','scripts/render-site.mjs','scripts/package-v17.py','scripts/serve.mjs','scripts/test-v17.mjs','scripts/test-v17-firefox.mjs','scripts/capture-motion-v17.mjs','scripts/lib/firefox-bidi.mjs','docs/DIRECAO_MOTION_V17.md','docs/v17','docs/ritual','capturas/v17']
target=root/'entrega/sr-navalha-v17-live-server.zip'
target.parent.mkdir(exist_ok=True)
files=[]
for rel in paths:
 path=root/rel
 files.extend([path] if path.is_file() else sorted(p for p in path.rglob('*') if p.is_file()))
with ZipFile(target,'w',compression=ZIP_DEFLATED,compresslevel=6) as archive:
 for path in files: archive.write(path,Path('srnavalha-v17')/path.relative_to(root))
manifest={'artifact':target.name,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'files':len(files),'entry':'srnavalha-v17/index.html','runtime':'HTML + CSS + local ES modules; Live Server; no build','source':'templates/v17 + scripts/render-site.mjs','fonts':['Sora OFL','Manrope OFL']}
(root/'entrega/v17-manifesto.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(manifest,ensure_ascii=False,indent=2))
