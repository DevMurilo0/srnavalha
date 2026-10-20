"""Package the static site, hero evidence and reproducible helpers; no caches."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root = Path(__file__).resolve().parents[1]
target = root / 'entrega/srnavalha-hero-redesign-completo.zip'
target.parent.mkdir(exist_ok=True)
folders = ['css', 'js', 'assets/fonts', 'assets/images', 'assets/decor',
           'assets/originals/hero-redesign', 'capturas/hero-redesign',
           'docs/fontes-hero', 'docs/fontes-v8', 'backup/hero-redesign-preflight']
files = {p for folder in folders for p in (root / folder).rglob('*') if p.is_file()}
files.update(root / name for name in ['index.html', 'agendar.html', 'README.md', 'DESIGN.md', 'PRODUCT.md'])
files.update((root / 'docs').glob('HERO*'))
files.update((root / 'docs').glob('*V9*'))
for name in ['build-v8.mjs', 'build-v9.mjs', 'hero-test-server.mjs', 'test-hero-redesign.mjs', 'test-hero-firefox.mjs', 'check-hero-access.mjs', 'inspect-hero-taste.mjs', 'v8-browser.mjs', 'package-hero-redesign.py']:
    files.add(root / 'scripts' / name)
helper = root / 'plugins/taste-frontend-design/skills/design-taste-frontend/scripts/lib'
files.update(helper.glob('*.mjs'))
with ZipFile(target, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(files):
        if path.is_file(): archive.write(path, path.relative_to(root))
print(target)
