import asyncio,json
from playwright.async_api import async_playwright
async def run():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path='/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome');p=await b.new_page(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);out=[]
  await p.goto('http://127.0.0.1:8018/');await p.locator('[data-professional="3"]').tap();await p.wait_for_timeout(600);out.append({'name':'Touch professional Rafael','pass':await p.locator('[data-professional="3"]').get_attribute('aria-pressed')=='true'})
  await p.locator('#product-next').evaluate('(b)=>{b.click();b.click();b.click()}');await p.wait_for_function('document.querySelector("#product-position").textContent==="11 / 22"');out.append({'name':'Three rapid product requests preserved','pass':await p.locator('#product-name').inner_text()=='Pomada teia'})
  await p.emulate_media(reduced_motion='reduce');await p.wait_for_timeout(100);out.append({'name':'Reduced motion pause actually hidden','pass':not await p.locator('#review-pause').is_visible()});out.append({'name':'No ongoing motion','pass':await p.evaluate('document.getAnimations().filter(a=>a.playState==="running").length===0')})
  await p.emulate_media(reduced_motion='no-preference');await p.wait_for_timeout(100);out.append({'name':'Live preference restored','pass':await p.locator('[data-review-clone]').count()==1 and await p.locator('#review-pause').is_visible()})
  await p.locator('[data-work="0"]').tap();await p.locator('dialog').wait_for(state='visible');await p.locator('dialog').dispatch_event('pointerdown',{'clientX':280,'pointerType':'touch'});await p.locator('dialog').dispatch_event('pointerup',{'clientX':80,'pointerType':'touch'});await p.wait_for_timeout(400);out.append({'name':'Swipe handler advances lightbox (synthetic pointer)','pass':'2 / 5' in await p.locator('#lightbox-caption').inner_text()})
  await p.keyboard.press('Escape');await p.locator('dialog').wait_for(state='hidden')
  focus=await p.locator('[data-service-filter="Todos"]').evaluate('(b)=>{b.focus();return getComputedStyle(b).outlineColor}')
  def channel(c):
   c=c/255;return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
  a=sum(c*w for c,w in zip(map(channel,[117,97,83]),[.2126,.7152,.0722]));z=sum(c*w for c,w in zip(map(channel,[243,240,235]),[.2126,.7152,.0722]));ratio=(z+.05)/(a+.05);out.append({'name':'Ivory focus contrast >=3','pass':ratio>=3 and focus=='rgb(117, 97, 83)','ratio':ratio,'computed':focus})
  for width in [390,1440]:
   await p.set_viewport_size({'width':width,'height':900});await p.goto('http://127.0.0.1:8018/');await p.locator('img').evaluate_all('(imgs)=>imgs.forEach(i=>i.loading="eager")');await p.wait_for_timeout(400);await p.screenshot(path=f'capturas/v8/final-{width}.png',full_page=True)
  await b.close();open('docs/V8_TESTES_CORRECOES.json','w').write(json.dumps(out,indent=2));print(out)
asyncio.run(run())
