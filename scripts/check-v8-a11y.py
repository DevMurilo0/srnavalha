import asyncio,json
from playwright.async_api import async_playwright
async def run():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(executable_path='/home/murilo/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome');p=await b.new_page();out=[]
  for width in [390,1440]:
   await p.set_viewport_size({'width':width,'height':900});await p.goto('http://127.0.0.1:8018/');await p.add_script_tag(path='/tmp/sr-v8-axe.js');r=await p.evaluate('axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})');out.append({'width':width,'violations':r['violations'],'passes':len(r['passes'])})
  await b.close();open('docs/V8_AXE.json','w').write(json.dumps(out,indent=2));print([(x['width'],[(v['id'],len(v['nodes'])) for v in x['violations']]) for x in out])
asyncio.run(run())
