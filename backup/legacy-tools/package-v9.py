"""Optional delivery packager; no production dependency."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parent.parent
output=root/'entrega/srnavalha-v9-completo.zip'
files=[]
for name in ['index.html','agendar.html','README.md','LEIA-ME-INSTALACAO.txt','PRODUCT.md','DESIGN.md','.impeccable/design.json','scripts/build-v8.mjs','scripts/build-v9.mjs','docs/fontes-v8/assets.json']:
 files.append(root/name)
for directory in ['css','js','assets/fonts','assets/images','backup/v9-preflight','capturas/v9']:
 files.extend(p for p in (root/directory).rglob('*') if p.is_file())
files.append(root/'assets/decor/favicon-v8.png')
for pattern in ['*V9.md','V9_*.json','V9_*.txt']:
 files.extend((root/'docs').glob(pattern))
with ZipFile(output,'w',ZIP_DEFLATED,compresslevel=7) as z:
 for file in sorted(set(files)):
  z.write(file,file.relative_to(root))
with ZipFile(output) as z:
 assert z.testzip() is None
 print(f'{output.name}: {len(z.namelist())} arquivos, {output.stat().st_size:,} bytes; integridade OK')
