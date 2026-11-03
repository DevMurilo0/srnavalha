import {createRequire} from 'node:module';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('playwright-core');
const base=process.env.SITE_URL||'http://127.0.0.1:8047';
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||chromium.executablePath()});
const results=[];
const check=(label,pass)=>{results.push({label,pass:!!pass});console.log((pass?'PASS ':'FAIL ')+label)};
const context=await browser.newContext({viewport:{width:1366,height:820}});
const page=await context.newPage();
await context.route('https://web.whatsapp.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:'WhatsApp Web navigation intercepted for this browser test'}));
page.on('dialog',dialog=>dialog.accept());
try{
 await page.goto(base+'/agendar.html',{waitUntil:'domcontentloaded'});
 const booking=await page.evaluate(async()=>{
  const m=await import('./js/booking-local.js');
  m.clearDemoBookings();
  const today=document.querySelector('#bk-date').min;
  const date=new Date(today+'T12:00:00Z');
  date.setUTCDate(date.getUTCDate()+1);
  if(date.getUTCDay()===0)date.setUTCDate(date.getUTCDate()+1);
  const day=date.toISOString().slice(0,10);
  const slots=m.availableSlots('cortee',day,'damiao');
  if(!slots.length)throw new Error('Sem horários para o teste local');
  return m.saveDemoBooking({serviceId:'cortee',professionalId:'damiao',slotAt:slots[0].slot_at,name:'Cliente de teste',phone:'5581999999999'});
 });
 await page.goto(base+'/admin.html',{waitUntil:'domcontentloaded'});
 check('Acesso por e-mail e senha presente',await page.locator('#admin-login').isVisible()&&await page.locator('#dashboard').isHidden());
 await page.locator('#fill-demo').click();
 await page.locator('#admin-login button[type="submit"]').click();
 check('Painel é exibido após acesso',await page.locator('#dashboard').isVisible());
 check('Agendamento aparece na agenda administrativa',await page.locator('.appointment').count()===1&&await page.locator('#stat-pending').textContent()==='1');
 check('Mensagem é a ação principal',await page.locator('.appointment button.message').textContent()==='Mensagem');
 check('Próximo atendimento em destaque',await page.locator('#upcoming-list .upcoming-item').count()===1);
 // Without the optional browser helper, the site must not spawn more tabs.
 await page.locator('.appointment button.message').click();
 const href=await page.locator('#message-open-link').getAttribute('href');
 check('WhatsApp direct link contains phone and message',
  new URL(href).hostname==='web.whatsapp.com'&&
  new URL(href).pathname==='/send'&&
  new URL(href).searchParams.get('phone')==='5581999999999'&&
  new URL(href).searchParams.get('text').includes('Cliente'));
 check('No unsolicited WhatsApp tabs without helper',context.pages().length===1);
 check('Opening message does not claim it was sent',
  (await page.locator('#message-info').textContent()).includes('não permite acessar')&&
  await page.locator('.appointment .message-indicator').textContent()==='WhatsApp aberto');
 await page.locator('#message-dismiss').click();
 await page.locator('.appointment button.message').click();
 check('Repeated message clicks do not create any tabs without helper',context.pages().length===1);
 await page.locator('#message-confirm-sent').click();
 check('Staff marks message sent without confirming attendance',
  await page.locator('.appointment .message-indicator').textContent()==='Envio registrado pela equipe'&&
  await page.locator('#stat-pending').textContent()==='1');
 check('Contact status counters reflect manual confirmation',
  await page.locator('#msg-unsent-count').textContent()==='0'&&
  await page.locator('#msg-sent-count').textContent()==='1');
 await page.locator('[data-message-filter="unsent"]').click();
 check('Pending-contact filter excludes sent messages',await page.locator('.appointment').count()===0);
 await page.locator('[data-message-filter="sent"]').click();
 check('Sent-message filter shows marked client',await page.locator('.appointment').count()===1);
 await page.locator('[data-message-filter="all"]').click();

 await page.locator('#admin-period').selectOption('today');
 check('Filtro de data aparece e pode ser alterado',await page.locator('#admin-period').inputValue()==='today');
 await page.locator('#admin-period').selectOption('all');
 await page.locator('.filters [data-status="confirmed"]').click();
 check('Filtro exclui os agendamentos pendentes',await page.locator('.appointment').count()===0);
 await page.locator('.filters [data-status="all"]').click();
 await page.locator('.appointment-manage summary').click();
 await page.locator('.appointment button').filter({hasText:'Confirmar presença'}).click();
 check('Confirmar presença usa diálogo próprio',await page.locator('#status-dialog').isVisible()&&
  (await page.locator('#status-title').textContent()).includes('Confirmar'));
 await page.locator('#status-apply').click();
 check('Status confirmado e contagem atualizados',await page.locator('#stat-confirmed').textContent()==='1'&&await page.locator('.appointment .status.confirmed').count()===1);
 await page.locator('.dash-sidebar a[href="#confirmados"]').click();
 check('Tela separada de confirmados mostra nome e telefone',await page.locator('#confirmed-view').isVisible()&&
  await page.locator('.confirmed-item').count()===1&&
  (await page.locator('.confirmed-client').textContent()).includes('Cliente de teste')&&
  (await page.locator('.confirmed-phone').textContent()).includes('81999999999'));
 await page.locator('#confirmed-search').fill('naoexiste');
 check('Busca por nome filtra os confirmados',await page.locator('.confirmed-item').count()===0);
 await page.locator('#confirmed-search').fill('81999999999');
 check('Busca por telefone encontra o cliente confirmado',await page.locator('.confirmed-item').count()===1);
 await page.setViewportSize({width:390,height:844});
 check('Navegação para confirmados acessível no celular',await page.locator('.mobile-admin-nav a[href="#confirmados"]').isVisible());
 await page.locator('.mobile-admin-nav a[href="#main"]').click();
 check('Volta à agenda no celular',await page.locator('#overview-view').isVisible());
 await page.setViewportSize({width:1366,height:820});
 await page.locator('.appointment-manage summary').click();
 await page.locator('.appointment button').filter({hasText:'Simular resposta'}).click();
 check('Links da resposta apontam para o protocolo',new URL(await page.locator('#reply-no').getAttribute('href')).searchParams.get('ref')===booking.id);
 await page.locator('#reply-no').click();
 await page.locator('#confirm-action').click();
 check('Resposta de cancelamento renderizada',await page.locator('#confirmation-title').textContent()==='Horário cancelado.');
 await page.goto(base+'/admin.html',{waitUntil:'domcontentloaded'});
 check('Status cancelado reflete no painel',await page.locator('#stat-cancelled').textContent()==='1');
 await page.locator('#admin-logout').click();
 check('Sair retorna ao acesso',await page.locator('#admin-login').isVisible());
 await page.evaluate(()=>localStorage.removeItem('srnavalha:agendamentos-demo:v1'));
}catch(error){check('Execução de ponta a ponta',false);console.error(error)}
finally{await browser.close()}
if(results.some(result=>!result.pass))process.exitCode=1;
