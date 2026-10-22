import json,re,pathlib,unicodedata,urllib.request,concurrent.futures,subprocess
root=pathlib.Path('.')
x=json.load(open('docs/fontes-v8/appbarber.json'))
def slug(s): return re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
def js(name,data): pathlib.Path('js/data/'+name+'.js').write_text('export default '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
text=x['Serviços']['text'].split('Valor\n\n',1)[1].split('Detalhes do estabelecimento')[0]
services=[]
for chunk in text.split('\n\nAgendar'):
 lines=[i.strip() for i in chunk.strip().split('\n\n') if i.strip()]
 if not lines: continue
 name=lines[0];price=next((i for i in lines if i.startswith('R$')),None);duration=next((i for i in lines if re.match(r'\d+ min',i)),None)
 if not price: continue
 category='Tratamentos'
 if any(i in name for i in ['CORTE','CORTEE','CORT+','PRIMEIRO']): category='Corte'
 if any(i in name for i in ['BARBA','BARBOTERAPIA']): category='Barba'
 if any(i in name for i in ['SOBRANCELHA','sobran','sobran','DEPILACAO','ACABAMENTO']): category='Acabamentos'
 if any(i in name for i in ['MASSAGEM','VENTOSA','PELE','Cravos','Black']): category='Cuidados'
 if 'COMB' in name: category='Combos'
 if 'ASSINATURA' in name: category='Assinantes'
 desc=' '.join(i for i in lines[1:] if i!=price and i!=duration and i!='A partir de:')
 pretty={'CORTEE':'Corte','COMB.CORT+BARB.SIMPLES':'Corte + barba simples','COMB. CORTE+BARBOTERAPIA':'Corte + barboterapia'}.get(name,name.capitalize())
 services.append(dict(id=slug(name),name=pretty,sourceName=name,category=category,price=price.replace('R$ Consultar','Sob consulta'),fromPrice='A partir de:' in lines,duration=duration,description=desc))
js('services',services)
imgs={i['alt'].strip():i['src'] for i in x['Assinaturas']['images']}
pros=[dict(name=n.title(),id=slug(n),image='assets/images/v8/'+slug(n)+'-640.webp',source=imgs[n]) for n in ['DAMIÃO','EDUARDO','KAUÃ','RAFAEL','YAN']];js('professionals',pros)
names=['BALM PARA BARBA','BODY SPLASH','CONDICIONADOR ICEFRESH','LEAVE-IN','LOÇÃO POS BARBA','ÓLEO PARA BARBA','POMADA FOX PREMIUM','POMADA ORANGE','POMADA PÓ','POMADA QUERATINA','POMADA TEIA','POMADA TOQ SECO','POMADA UV','POMDA COFFEE','SERUM POS BARBA','SHAMPOO 4EM1','SHAMPOO ANTICASPA','SHAMPOO ESCURECEDOR DOM PELO','SHAMPOO ICE','SHAMPOO MATIZADOR','SHAMPOO PARA BARBA','TÔNICO DE CRESCIMENTO']
prices=[40,50,50,50,50,40,35,35,40,35,35,35,35,35,50,50,50,55,50,50,40,90];products=[]
for n,p in zip(names,prices):
 photo=imgs.get(n);valid=photo and 'default.' not in photo
 products.append(dict(id=slug(n),name=n.replace('POMDA','POMADA').capitalize(),price=f'R$ {p},00',category='Finalização' if 'POM' in n or 'LEAVE' in n else 'Barba' if 'BARBA' in n else 'Fragrância' if 'SPLASH' in n else 'Cabelo',image='assets/images/v8/'+slug(n)+'-640.webp' if valid else None,source=photo if valid else None))
js('products',products)
manifest=[]; jobs=[]
for d in pros+products:
 if d.get('source'): jobs.append((d['id'],d['source']))
jobs.append(('logo','https://s3-sa-east-1.amazonaws.com/img-appbarber-appbeleza/srnavala-pqjj/srnavala-pqjj_68de7f84e7dd4.png'))
# Only documentary service photos; inspect before inclusion in the site.
for n in ['BARBA SIMPLES','BARBOTERAPIA','COMB.CORT+BARB.SIMPLES','CORTE INFANTIL','LUZES','PLATINADO']:
 jobs.append(('servico-'+slug(n),imgs[n]))
pathlib.Path('assets/images/v8').mkdir(exist_ok=True)
def fetch(job):
 name,url=job;f=pathlib.Path('assets/originals/v8/'+name+'.png')
 try:
  if not f.exists() or f.stat().st_size<100: urllib.request.urlretrieve(url,f)
  info=subprocess.check_output(['identify','-format','%w %h',str(f)]).decode().split();w,h=map(int,info)
  for size in [320,640,960]: subprocess.run(['magick',str(f),'-auto-orient','-resize',str(size)+'x'+str(size)+'>','-quality','85','assets/images/v8/'+name+'-'+str(size)+'.webp'],check=True)
  return dict(name=name,source=url,width=w,height=h,bytes=f.stat().st_size,treatment='auto-orient, réduction Lanczos sans agrandissement, WebP q85')
 except Exception as e:return dict(name=name,source=url,error=str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
 for r in pool.map(fetch,jobs): manifest.append(r);print(r['name'],r.get('width',r.get('error')),flush=True)
pathlib.Path('docs/fontes-v8/assets.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
print('services',len(services),'products',len(products))
