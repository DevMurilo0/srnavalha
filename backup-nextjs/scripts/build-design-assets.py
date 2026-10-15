from PIL import Image, ImageOps, ImageFilter, ImageEnhance, ImageDraw
from pathlib import Path
root = Path(__file__).resolve().parents[1] / 'public' / 'images'
def tone(img, bright=0.78, sat=0.75, contrast=1.07):
    return ImageEnhance.Contrast(ImageEnhance.Color(ImageEnhance.Brightness(img).enhance(bright)).enhance(sat)).enhance(contrast)
# Compose a widescreen atmospheric photograph exclusively from the barbershop's supplied real photo.
source = Image.open(root/'team/atendimento.webp').convert('RGB')
w,h=1720,880
blurred = ImageOps.fit(source, (w,h), method=Image.Resampling.LANCZOS, centering=(.54,.25)).filter(ImageFilter.GaussianBlur(45))
blurred=tone(blurred, .48, .55)
# Authentic image placed on the right, subject not artificially replaced.
sharp = ImageOps.fit(source, (850,900), method=Image.Resampling.LANCZOS, centering=(.5,.42))
sharp = tone(sharp, .92, .81, 1.06)
# Feather on all edges except slight on right.
mask = Image.new('L', sharp.size)
md=ImageDraw.Draw(mask)
md.rectangle((50,55,sharp.width-55,sharp.height-55),fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(65))
blurred.paste(sharp,(720,-25),mask)
# photographic dark gradient for light text, not text baked into background
shade=Image.new('RGBA',(w,h),(0,0,0,0)); d=ImageDraw.Draw(shade)
for x in range(w):
    alpha=round(235 * (max(0, 1-x/950))**1.65)+10
    if x > 1350: alpha = 25
    d.line((x,0,x,h),fill=(7,9,10,min(alpha,255)))
blurred=Image.alpha_composite(blurred.convert('RGBA'),shade).convert('RGB')
blurred.save(root/'hero/atendimento-cinematico.webp','WEBP',quality=91,method=6)
interior=Image.open(root/'barbershop/ambiente.webp').convert('RGB')
interior=ImageOps.fit(interior,(1400,780),method=Image.Resampling.LANCZOS,centering=(.45,.55))
interior=tone(interior, .79, .67, 1.13)
interior.save(root/'barbershop/ambiente-cinematico.webp','WEBP',quality=91,method=6)
print('Generated images:',(root/'hero/atendimento-cinematico.webp').stat().st_size,(root/'barbershop/ambiente-cinematico.webp').stat().st_size)
