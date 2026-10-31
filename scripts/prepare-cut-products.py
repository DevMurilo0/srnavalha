#!/usr/bin/env python3
"""Extract three photographed packages with manually traced product silhouettes.
No packaging reconstruction: RGB values remain the originals. Development: Pillow.
"""
from pathlib import Path
import hashlib,json
from PIL import Image,ImageDraw,ImageFilter
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/images/the-cut/products'
# Curves measured against the 800px original photographs; not stock object shapes.
TRACES={
'pomada-fox-premium':[(407,20),('C',625,1,788,162,800,351),('L',800,486),('C',768,677,630,796,414,794),('C',198,804,24,644,7,449),('C',-17,251,144,59,328,27),('C',360,22,383,21,407,20)],
'oleo-para-barba':[(403,7),('C',376,8,367,20,365,46),('L',358,139),('C',356,161,352,171,345,179),('L',344,185),('C',322,190,322,194,322,200),('L',312,305),('C',304,314,305,318,305,326),('L',305,353),('C',305,369,310,371,332,374),('L',331,382),('C',298,391,279,416,276,444),('L',266,719),('L',264,748),('C',263,783,283,788,295,790),('C',344,806,410,806,455,788),('C',490,776,490,760,490,738),('L',501,498),('L',496,446),('C',489,405,469,391,455,383),('L',454,373),('C',478,369,480,369,480,357),('L',479,328),('C',479,316,477,314,471,312),('L',476,210),('C',476,193,463,188,450,185),('L',447,173),('C',438,153,442,135,445,121),('L',449,53),('C',450,20,423,6,403,7)],
'pomada-orange':[(468,198),('C',648,195,783,332,782,523),('C',782,675,677,792,491,799),('C',315,805,172,686,159,526),('C',147,356,282,217,436,200),('C',446,199,458,198,468,198)]}
def points(trace):
 p=trace[0];out=[p]
 for command in trace[1:]:
  if command[0]=='L':p=(command[1],command[2]);out.append(p)
  else:
   _,x1,y1,x2,y2,x3,y3=command
   for i in range(1,81):
    t=i/80;s=1-t;out.append((s*s*s*p[0]+3*s*s*t*x1+3*s*t*t*x2+t*t*t*x3,s*s*s*p[1]+3*s*s*t*y1+3*s*t*t*y2+t*t*t*y3))
   p=(x3,y3)
 return out
OUT.mkdir(parents=True,exist_ok=True)
records=[]
for name,trace in TRACES.items():
 src=ROOT/f'assets/images/v8/{name}-960.webp';im=Image.open(src).convert('RGBA');assert im.size==(800,800)
 mask=Image.new('L',(3200,3200));ImageDraw.Draw(mask).polygon([(round(x*4),round(y*4)) for x,y in points(trace)],fill=255)
 mask=mask.resize(im.size,Image.Resampling.LANCZOS)
 if name != 'oleo-para-barba':
  # The photographed coloured rim supplies its actual contour. Keep only
  # that connected rim and fill its enclosed label; reject plants/backdrop.
  rgb=np.asarray(im.convert('RGB'),dtype=np.float32);r,g,b=rgb[:,:,0],rgb[:,:,1],rgb[:,:,2]
  hue=((g-r>32)&(g>65)&(b-r>20)) if name=='pomada-fox-premium' else ((r>g*1.23)&(g>b*1.5)&(r>115))
  rim=Image.fromarray(np.uint8(hue)*255,'L').copy()
  seed=(400,55) if name=='pomada-fox-premium' else (470,235)
  ImageDraw.floodfill(rim,seed,128,thresh=0)
  component=Image.fromarray(np.uint8(np.asarray(rim)==128)*255,'L').copy()
  ImageDraw.floodfill(component,(0,0),128,thresh=0)
  mask=Image.fromarray(np.uint8(np.asarray(component)!=128)*255,'L').filter(ImageFilter.GaussianBlur(.4))
 im.putalpha(mask)
 bounds=mask.getbbox();im=im.crop(bounds);target=OUT/f'{name}.webp';im.save(target,'WEBP',lossless=True,exact=True,method=6)
 records.append({'id':name,'source':str(src.relative_to(ROOT)),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'output':str(target.relative_to(ROOT)),'output_sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'dimensions':list(im.size),'crop_bounds':list(bounds),'bytes':target.stat().st_size,'method':'Photograph-derived connected coloured rim with enclosed label for jars; manually traced photographic contour for oil; antialiased alpha, source RGB unchanged; lossless WebP'})
(OUT/'provenance.json').write_text(json.dumps({'assets':records,'limitations':'Premium and Orange container edges meet the original photograph bounds. No missing edges or changed packaging were generated.'},ensure_ascii=False,indent=2)+'\n')
canvas=Image.new('RGB',(1050,400),'#e9e3d8')
for i,name in enumerate(TRACES):
 im=Image.open(OUT/f'{name}.webp');im.thumbnail((330,370));canvas.paste(im,(i*350+(350-im.width)//2,400-im.height),im)
canvas.save('/tmp/the-cut/product-review.jpg',quality=94)
