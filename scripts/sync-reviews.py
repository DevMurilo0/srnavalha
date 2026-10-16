#!/usr/bin/env python3
"""Synchronize accessible no-JS review articles with the verified browser data. No runtime dependency."""
import json,re,html
from pathlib import Path
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'js/reviews-data.js').read_text().split('window.SrReviews = ',1)[1].rstrip().removesuffix(';'))
esc=html.escape
articles=[]
for i,r in enumerate(data['items']):
 articles.append(f'''<article class="sr-review" data-review-id="{esc(r['id'])}" role="group" aria-roledescription="avaliação" aria-label="{i+1} de {len(data['items'])}">
  <div class="sr-review__source"><span>Google</span><span class="sr-review__stars" role="img" aria-label="{r['rating']} de 5 estrelas">{'★'*r['rating']}</span></div>
  <blockquote><p>{esc(r['text'])}</p></blockquote>
  <div class="sr-review__footer"><div><strong>{esc(r['author'])}</strong><small>{esc(r['period'])} · {'Trecho da avaliação' if r['excerpt'] else 'Avaliação no Google'}</small></div><a href="{esc(r['profileUrl'])}" target="_blank" rel="noopener noreferrer" aria-label="Ver perfil e avaliações de {esc(r['author'])} no Google">Ver no Google <span aria-hidden="true">↗</span></a></div>
</article>''')
p=root/'index.html';s=p.read_text();s=re.sub(r'<!-- REVIEWS:START -->[\s\S]*?<!-- REVIEWS:END -->','<!-- REVIEWS:START -->\n'+ '\n'.join(articles)+'\n<!-- REVIEWS:END -->',s);p.write_text(s)
