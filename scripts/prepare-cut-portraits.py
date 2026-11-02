#!/usr/bin/env python3
"""Non-generative portrait segmentation for The Cut.

Development only: python -m pip install pillow numpy onnxruntime
Download the official U²-Net small model to $CUT_MODEL_PATH, then run this file.
Only alpha is computed. RGB bytes come from the project's original photograph.
No face synthesis, recolouring, geometric deformation or content-aware fill.
"""
from pathlib import Path
import hashlib
import json
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import onnxruntime as ort

ROOT = Path(__file__).resolve().parents[1]
MODEL = Path(os.environ.get('CUT_MODEL_PATH', '/tmp/the-cut-models/u2netp.onnx'))
OUTPUT = ROOT / 'assets/images/the-cut/team'
NAMES = ['damiao', 'eduardo', 'kaua', 'rafael', 'yan']
MODEL_URL = 'https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def segment(image, session):
    rgb = image.convert('RGB')
    data = np.asarray(rgb.resize((320, 320), Image.Resampling.LANCZOS), dtype=np.float32)
    data /= max(float(np.max(data)), 1.0)
    data = (data - np.array([.485, .456, .406], dtype=np.float32)) / np.array([.229, .224, .225], dtype=np.float32)
    output = session.run(None, {session.get_inputs()[0].name: data.transpose(2,0,1)[None]})[0][0,0]
    output = (output-output.min()) / max(float(output.max()-output.min()), 1e-6)
    mask = Image.fromarray(np.uint8(output*255), 'L').resize(rgb.size, Image.Resampling.LANCZOS)
    # Clear model's background haze, retain a soft subpixel silhouette.
    alpha = np.asarray(mask, dtype=np.float32) / 255
    alpha = np.clip((alpha-.08)/.84, 0, 1)
    rgba = rgb.convert('RGBA')
    edge = Image.fromarray(np.uint8(alpha*255), 'L').filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.25))
    rgba.putalpha(edge)
    return rgba

def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    session = ort.InferenceSession(str(MODEL), sess_options=options, providers=['CPUExecutionProvider'])
    records=[]
    previews=[]
    for name in NAMES:
        source=ROOT/f'assets/images/v8/{name}-960.webp'
        original=Image.open(source).convert('RGB')
        result=segment(original,session)
        target=OUTPUT/f'{name}.webp'
        result.save(target, 'WEBP', lossless=True, method=6, exact=True)
        alpha=np.asarray(result.getchannel('A'))
        decoded=Image.open(target).convert('RGBA')
        rgb_equal=bool(np.array_equal(np.asarray(decoded)[:,:,:3][alpha>0],np.asarray(original)[alpha>0]))
        records.append({'name':name,'source':str(source.relative_to(ROOT)),'source_sha256':digest(source),'output':str(target.relative_to(ROOT)),'output_sha256':digest(target),'dimensions':list(result.size),'bytes':target.stat().st_size,'alpha_min':int(alpha.min()),'alpha_max':int(alpha.max()),'transparent_pixels':int((alpha==0).sum()),'soft_edge_pixels':int(((alpha>0)&(alpha<255)).sum()),'visible_rgb_matches_source':rgb_equal})
        print(name,records[-1],flush=True)
        previews.append((name,result))
    (OUTPUT/'provenance.json').write_text(json.dumps({'method':'U2-Net small ONNX foreground segmentation; lossless WebP; source RGB preserved; alpha-only processing','model_url':MODEL_URL,'model_sha256':digest(MODEL),'parameters':{'input':[320,320],'alpha_background_threshold':.08,'alpha_foreground_threshold':.92,'edge_inset_px':1,'edge_antialias_radius_px':.25},'limitations':'Source resolution is725×725 for Damião and800×800 for the other portraits; original photographs already crop the lower body. No missing anatomy was generated.','assets':records},ensure_ascii=False,indent=2)+'\n')
    canvas=Image.new('RGB',(1500,660),'white')
    draw=ImageDraw.Draw(canvas)
    for i,(name,picture) in enumerate(previews):
        preview=picture.copy();preview.thumbnail((285,300))
        for row,bg in enumerate(['#e9e3d8','#141412']):
            panel=Image.new('RGBA',(300,330),bg)
            panel.alpha_composite(preview,((300-preview.width)//2,330-preview.height))
            canvas.paste(panel.convert('RGB'),(i*300,row*330))
            draw.text((i*300+10,row*330+8),name,fill='#141412' if row==0 else '#e9e3d8')
    Path('/tmp/the-cut').mkdir(exist_ok=True)
    canvas.save('/tmp/the-cut/portrait-review.jpg',quality=94)

if __name__=='__main__':main()
