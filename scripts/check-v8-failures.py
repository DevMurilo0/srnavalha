import asyncio,json
from playwright.async_api import async_playwright
async def run():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path='/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'); p=await b.new_page(viewport={'width':390,'height':844});out=[]
  await p.route('**/assets/images/**',lambda r:r.abort())
  await p.goto('http://127.0.0.1:8018/');await p.get_by_role('button',name='Yan',exact=True).click();await p.wait_for_timeout(400);out.append({'name':'Image failures retain content and CTA','pass':await p.locator('.header-book').is_visible() and await p.locator('[data-professional="4"]').get_attribute('aria-pressed')=='true'})
  await p.screenshot(path='capturas/v8/falha-imagens.png',full_page=True)
  await p.unroute('**/assets/images/**');await p.goto('http://127.0.0.1:8018/');await p.route('**/www.google.com/maps**',lambda r:r.abort());await p.get_by_role('button',name='Carregar mapa',exact=True).click();await p.wait_for_timeout(500);out.append({'name':'Blocked map retains route link and address','pass':await p.locator('address').is_visible() and await p.get_by_role('link',name='Traçar rota').is_visible()})
  await p.goto('http://127.0.0.1:8018/');await p.keyboard.press('Tab');out.append({'name':'Keyboard skip link','pass':await p.evaluate('document.activeElement.classList.contains("skip-link")')});await p.keyboard.press('Enter');out.append({'name':'Skip target','pass':'#conteudo' in p.url})
  await p.locator('[data-work="0"]').click();await p.locator('dialog').wait_for(state='visible');await p.keyboard.press('ArrowRight');await p.wait_for_timeout(400);out.append({'name':'Real keyboard lightbox','pass':'2 / 5' in await p.locator('#lightbox-caption').inner_text()});await p.keyboard.press('Escape');await p.locator('dialog').wait_for(state='hidden');out.append({'name':'Native focus return','pass':await p.evaluate('document.activeElement.matches("[data-work=\\"0\\"]")')})
  await p.goto('http://127.0.0.1:8018/agendar.html');out.append({'name':'Official booking from legacy URL','pass':await p.get_by_role('link',name='Agendar horário',exact=True).get_attribute('href')=='https://sites.appbarber.com.br/srnavala-pqjj'})
  await b.close();open('docs/V8_TESTES_FALHAS_TECLADO.json','w').write(json.dumps(out,indent=2));print(out)
asyncio.run(run())
