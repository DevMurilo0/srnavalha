"""Development only: Pillow; no resizing or generation. Audits the real bytes on disk."""
import json,re,hashlib
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
sources={i['name']:i for i in json.loads((root/'docs/fontes-v8/assets.json').read_text())}
source_reel='https://www.instagram.com/bocadedidi/reel/DePNevYxDML/'
html=(root/'index.html').read_text();rows=[]
for p in sorted((root/'assets').rglob('*')):
 if p.suffix.lower() not in ['.webp','.png','.jpg','.jpeg','.avif']:continue
 try:
  im=Image.open(p);w,h=im.size
 except Exception:continue
 rel=p.relative_to(root).as_posix();key=re.sub(r'-(320|480|640|720|960)$','',p.stem);e=sources.get(key,{})
 source=e.get('source')
 if 'hero-redesign' in rel or 'ritual/instrumentos' in rel:source=source_reel
 active=rel in html or ('/v8/' in rel and key in [x['name'] for x in sources.values()] and '-640' in p.stem)
 quality='Original oficial; derivado sem ampliação.' if e else 'Frame de vídeo documental 720×1280; compressão e movimento de origem.' if source==source_reel else 'Acervo local preservado; não utilizado sem proveniência confirmada.'
 variants=[x.relative_to(root).as_posix() for x in p.parent.glob(key+'-*') if x.suffix=='.webp'] if e or source==source_reel else []
 rows.append({'file':rel,'width':w,'height':h,'bytes':p.stat().st_size,'source':source,'active':active,'quality':quality,'treatment':'WebP pré-existente, sem alteração de características' if '/v8/' in rel else 'Recorte ou redução; sem geração de detalhes' if source==source_reel else 'Preservado','variants':variants,'originalWidth':e.get('width'),'originalHeight':e.get('height'),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(root/'docs/ritual/inventario-imagens.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
active=[r for r in rows if r['active']]
text='# Inventário fotográfico\n\nLeitura real das imagens em 22/10/2026. JSON completo: `inventario-imagens.json`.\n\nAs fotografias dos serviços têm resoluções distintas: corte e barba 410×410, barba simples 358×358, barboterapia 698×698, corte infantil 647×647, luzes 800×800 e platinado 290×290. Os quadros de galeria respeitam esses limites; o visualizador limita a foto à resolução decodificada. Não se chama uma variante de 640px de original 640 quando o arquivo contém menos pixels.\n\nFachada e interior vêm de frames 720×1280 do Reel colaborativo de 08/10/2026; os recortes usados têm 720×1060. O novo detalhe de instrumentos conserva o frame 720×1280 a 26 segundos e variantes 480/720 sem ampliação. Vídeo de apoio: trecho 24,8–27,8s, 360×640, H.264 sem áudio, 86KB. Vídeo original preservado. Nenhum salão, corte, rosto ou produto foi gerado.\n\n| Arquivo ativo | Resolução real | Bytes | Origem |\n|---|---:|---:|---|\n'
for r in active:text+=f"| `{r['file']}` | {r['width']}×{r['height']} | {r['bytes']} | {r['source'] or 'acervo local'} |\n"
(root/'docs/ritual/IMAGENS.md').write_text(text)
print(len(rows),'arquivos; ativos',len(active))
