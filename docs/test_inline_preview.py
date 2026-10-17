from pathlib import Path
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import base64,json,re
root=Path('/mnt/data/srnavalha-v5');out=root/'capturas';out.mkdir(exist_ok=True)
def build(name):
 soup=BeautifulSoup((root/name).read_text(),'html.parser')
 for tag in soup.select('link[rel="stylesheet"]'):
  link=tag.get('href','');path=root/link
  if path.exists():
   css=path.read_text().replace("url('../assets/decor/grain.svg')","none")
   new=soup.new_tag('style');new.string=css;tag.replace_with(new)
 for tag in soup.select('link[rel="preconnect"],link[href*="fonts.googleapis.com"],link[rel="preload"]'):
  tag.decompose()
 for img in soup.select('img[src]'):
  path=root/img['src']
  if path.exists():img['src']='data:image/webp;base64,'+base64.b64encode(path.read_bytes()).decode()
 # we test a self-contained rendering: do not load the remote Google frame
 for el in soup.select('iframe'):el['srcdoc']='<p style="padding:20px;font-family:sans-serif">O mapa interativo depende de conexão ao Google.</p>';el.attrs.pop('src',None)
 for el in soup.select('script[src]'):el.decompose()
 return str(soup)
report=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width in [320,375,390,768,1024,1366,1440]:
  page=b.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
  errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(build('index.html'),wait_until='domcontentloaded',timeout=30000)
  page.add_script_tag(content=(root/'js/site.js').read_text())
  page.wait_for_timeout(700)
  height=page.evaluate('document.body.scrollHeight')
  for y in range(0,height,780):page.evaluate('(y)=>window.scrollTo(0,y)',y);page.wait_for_timeout(35)
  page.wait_for_timeout(850);page.evaluate("document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,0)");page.wait_for_timeout(350)
  page.screenshot(path=str(out/f'home-{width}.png'),full_page=True,animations='disabled',timeout=30000)
  d=page.evaluate('''()=>({vw:innerWidth,sw:document.documentElement.scrollWidth,height:document.body.scrollHeight,broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length,tiles:document.querySelectorAll('[data-lightbox]').length,reviews:document.querySelectorAll('.review').length})''')
  d.update(width=width,errors=errs);report.append(d)
  if width==390:
   page.locator('[data-service="1"]').click();page.wait_for_timeout(200);report.append({'serviceClick':page.locator('#service-image').get_attribute('alt')})
   page.locator('#more-work summary').click();report.append({'galleryExpanded':page.locator('#more-work').evaluate('(el)=>el.open')})
   page.locator('[data-lightbox="4"]').click();report.append({'lightboxOpen':page.locator('#lightbox').evaluate('(el)=>el.open')})
   page.keyboard.press('Escape');report.append({'lightboxClosed':not page.locator('#lightbox').evaluate('(el)=>el.open')})
   page.locator('#marquee-control').click();report.append({'reviewsPaused':page.locator('#marquee-control').get_attribute('aria-pressed')})
  page.close()
 for width in [390,1366]:
  page=b.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
  errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(build('agendar.html'),wait_until='domcontentloaded');page.add_script_tag(content=(root/'js/booking.js').read_text());page.wait_for_timeout(250)
  page.screenshot(path=str(out/f'agendar-{width}.png'),full_page=True,timeout=30000)
  d=page.evaluate('''()=>({vw:innerWidth,sw:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length})''')
  page.locator('.booking-submit').click();d.update(width=width,errors=errs,emptyFormError=page.locator('#form-error').inner_text());report.append(d);page.close()
 b.close()
(root/'docs/test-output.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False,indent=2))
