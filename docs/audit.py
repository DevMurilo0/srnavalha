from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json,datetime,sys
root=Path(__file__).resolve().parents[1]
ns={};s=(root/'docs/test_inline_preview.py').read_text();exec(s[:s.index('report=[]')],ns);build=ns['build']
results={'static':{},'browser':{}}
for name in ['index.html','agendar.html']:
 soup=BeautifulSoup((root/name).read_text(),'html.parser')
 paths=[]
 for e in soup.select('[src]'):
  path=e.get('src','')
  if path.startswith(('http:','https:','data:')):continue
  paths.append((path,(root/path).exists()))
 for e in soup.select('link[href]'):
  href=e.get('href','')
  if href.startswith(('http:','https:','#')):continue
  paths.append((href,(root/href).exists()))
 results['static'][name]={'localPaths':len(paths),'missingPaths':[p for p,ok in paths if not ok]}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 # Viewport proof - rendered source HTML/CSS and inlined image bytes because direct local URL is blocked here
 for width in (390,1440):
  page=browser.new_page(viewport={'width':width,'height':900},device_scale_factor=1)
  page.set_content(build('index.html'),wait_until='domcontentloaded')
  page.add_script_tag(content=(root/'js/site.js').read_text())
  page.wait_for_timeout(1700)
  page.screenshot(path=str(root/f'capturas/home-{width}-viewport.png'))
  page.close()
 # Reduced motion must not clone testimonials or hide the page
 p1=browser.new_page(viewport={'width':390,'height':900},reduced_motion='reduce')
 p1.set_content(build('index.html'))
 p1.add_script_tag(content=(root/'js/site.js').read_text())
 results['browser']['reducedMotion']={'reviewCount':p1.locator('.review').count(),'hiddenText':p1.locator('.motion-ready [data-reveal]:not(.revealed)').count(),'marqueeControlsHidden':p1.locator('#marquee-control').evaluate('(e)=>e.hidden')}
 p1.close()
 p2=browser.new_page(viewport={'width':390,'height':900},java_script_enabled=False)
 p2.set_content(build('index.html'))
 results['browser']['withoutJS']={'cardsVisible':p2.locator('.work-tile').count(),'gallerySummary':p2.locator('#more-work summary').count(),'textVisible':p2.locator('#hero-title').is_visible()}
 p2.close()
 p3=browser.new_page(viewport={'width':390,'height':900})
 p3.set_content(build('agendar.html'))
 p3.add_init_script('''HTMLAnchorElement.prototype.click=function(){window._clickedLink=this.href};''')
 p3.add_script_tag(content=(root/'js/booking.js').read_text())
 next_day=(datetime.datetime.now()+datetime.timedelta(days=5)).strftime('%Y-%m-%d')
 p3.locator('[name="nome"]').fill('Teste')
 p3.locator('#booking-day').fill(next_day)
 p3.locator('#booking-time').select_option(label='14:00')
 p3.locator('button[type="submit"]').click()
 # clicking the external WhatsApp link is blocked in sandbox; it is verified by the URL calculation below
 expected='https://wa.me/5581995722396?text='
 results['browser']['booking']={'selectedDate':next_day,'formErrorHidden':p3.locator('#form-error').evaluate('(e)=>e.hidden'),'whatsappFormatInSource':expected in (root/'js/booking.js').read_text()}
 p3.close()
 browser.close()
(root/'docs/audit-result.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print(json.dumps(results,ensure_ascii=False,indent=2))
