/* Sr. Navalha — opens chat using WhatsApp Web's visible New Chat interface.
 * This script never navigates the page, sends a message, chooses an ambiguous
 * contact, or overwrites a different draft. DOM changes can break the flow.
 */
(() => {
  if (globalThis.__srnWhatsappInAppV4) return;
  globalThis.__srnWhatsappInAppV4 = true;
  const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  let busy = Promise.resolve();

  const selectors = {
    newChat: [
      '[data-testid="new-chat-button"]',
      '#side [data-icon="new-chat-outline"]',
      '#side [data-icon="new-chat-filled"]',
      '#side [data-icon="new-chat"]',
      '#side button[aria-label="Nova conversa"]',
      '#side button[aria-label="New chat"]',
      '#side [title="Nova conversa"]',
      '#side [title="New chat"]',
      '#app button[aria-label="Nova conversa"]',
      '#app button[aria-label="New chat"]',
      '[data-testid="new-chat"]'
    ],
    newChatSearch: [
      '[data-testid="new-chat-search"] [contenteditable="true"]',
      '[data-testid="contact-search"] [contenteditable="true"]',
      '[aria-label="Pesquisar nome ou número"][contenteditable="true"]',
      '[aria-label="Search name or number"][contenteditable="true"]',
      '[placeholder="Pesquisar nome ou número"]',
      '[placeholder="Search name or number"]',
      '[role="dialog"] [contenteditable="true"]',
      '[data-testid="contact-list"] [contenteditable="true"]'
    ],
    resultRows: [
      '[data-testid="contact-list"] [data-testid="cell-frame-container"]',
      '[data-testid="contact-list"] [role="row"]',
      '#pane-side [data-testid="cell-frame-container"]',
      '#pane-side [role="row"]',
      '#pane-side [role="listitem"]',
      '[data-testid="contact-item"]',
      '[data-testid="contact-row"]',
      '[role="dialog"] [role="button"]',
      '[data-testid="chat-with-phone"]'
    ],
    composer: [
      '#main footer [contenteditable="true"][role="textbox"]',
      '#main footer [contenteditable="true"]',
      '#main [data-testid="conversation-compose-box-input"]'
    ]
  };

  const visible = el => !!(el && el.isConnected && el.getClientRects?.().length &&
    !el.closest?.('[aria-hidden="true"]'));
  const find = list => {
    for (const selector of list) {
      const node = document.querySelector(selector);
      if (visible(node)) return node;
    }
    return null;
  };
  async function until(fn, timeout = 4600) {
    const ends = Date.now() + timeout;
    do {
      const found = fn();
      if (found) return found;
      await sleep(130);
    } while (Date.now() < ends);
    return null;
  }
  function edit(el, text) {
    if (!visible(el)) return false;
    el.focus();
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const klass = el.tagName === 'INPUT' ? HTMLInputElement : HTMLTextAreaElement;
      const setter = Object.getOwnPropertyDescriptor(klass.prototype, 'value')?.set;
      if (setter) setter.call(el, text); else el.value = text;
      el.dispatchEvent(new Event('input', {bubbles: true}));
      return el.value === text;
    }
    const selection = window.getSelection();
    if (!selection) return false;
    const range = document.createRange();
    range.selectNodeContents(el);selection.removeAllRanges();selection.addRange(range);
    let result = false;
    try { result = document.execCommand('insertText', false, text); }
    catch { /* Fallback for unsupported editing commands. */ }
    if (!result) {
      el.textContent = text;
      el.dispatchEvent(new InputEvent('input', {bubbles: true, inputType: 'insertText', data: text}));
    }
    const actual = String(el.innerText ?? el.textContent ?? '').replace(/\r/g, '').trim();
    return actual === text.trim() || actual.replace(/\s+/g, '') === text.trim().replace(/\s+/g, '');
  }
  const digits = s => String(s || '').replace(/\D/g, '');
  function exactPhoneIn(node, phone) {
    // Check individual visible labels, not the whole side panel (which can
    // contain several unrelated phone numbers and messages).
    const values = [node.getAttribute?.('title'),node.getAttribute?.('aria-label'),
      node.getAttribute?.('data-id'),node.getAttribute?.('data-jid'),node.textContent];
    for (const child of [...(node.querySelectorAll?.('[title],[aria-label]') || [])].slice(0, 12)) {
      values.push(child.getAttribute('title'),child.getAttribute('aria-label'));
    }
    return values.some(v => {
      if (!v) return false;
      const matches = String(v).match(/\+?\d[\d\s().-]{8,}\d/g) || [];
      return matches.some(part => {
        const value = digits(part);
        return value === phone || value === phone.slice(2);
      });
    });
  }
  function findResult(phone) {
    const items = new Set();
    for (const selector of selectors.resultRows) {
      for (const node of document.querySelectorAll(selector)) {
        if (visible(node) && !node.closest('#main') && exactPhoneIn(node, phone)) items.add(node);
      }
    }
    const matches = [...items];
    return matches.filter(node => !matches.some(other => other !== node && node.contains?.(other)));
  }
  const chatHeader = () => {
    const header = document.querySelector('#main header');
    return header ? (header.getAttribute('data-id') || header.textContent || '').trim() : '';
  };
  function useSearch(input, phone) {
    if (!edit(input, phone)) return false;
    return true;
  }
  function choose(row) {
    const button = row.querySelector?.('button[aria-label="Conversar"],button[aria-label="Chat"],button[aria-label="Message"]');
    const target = visible(button) ? button : row;
    if (!visible(target)) return false;
    target.click();
    return true;
  }
  async function prepare({phone, text}) {
    if (!/^55\d{10,11}$/.test(phone) || !text?.trim() || text.length > 6000)
      return {ok: false, error: 'Número ou texto inválido'};
    const oldHeader = chatHeader();
    const button = await until(() => find(selectors.newChat), 2600);
    if (!button) return {ok: false, mode: 'unsupported-ui',
      error: 'O botão Nova conversa do WhatsApp não foi encontrado nesta versão.'};
    const trigger = button.closest?.('button,[role="button"]') || button;
    trigger.click();

    let input = await until(() => find(selectors.newChatSearch), 3200);
    if (!input) {
      // The new-chat screen may autofocus a search input with variable labels.
      const active = document.activeElement;
      if (visible(active) && active !== button &&
          (active.matches?.('input,[contenteditable="true"]')) && !active.closest('#main')) input = active;
    }
    if (!input || !useSearch(input, phone)) return {ok: false, mode: 'unsupported-ui',
      error: 'Não foi possível iniciar uma nova conversa pelo número. Nenhuma página foi recarregada.'};

    let results = await until(() => {
      const matches = findResult(phone);
      return matches.length ? matches : null;
    }, 5600);
    if (!results && phone.startsWith('55')) {
      // Some WhatsApp versions index the local number without +55.
      useSearch(input, phone.slice(2));
      results = await until(() => {
        const matches = findResult(phone);
        return matches.length ? matches : null;
      }, 3400);
    }
    if (!results || results.length !== 1) return {ok: false, mode: 'needs-selection',
      error: results?.length > 1
        ? 'Mais de um resultado corresponde ao telefone. Selecione manualmente o correto.'
        : 'O WhatsApp não apresentou uma correspondência exata. Selecione a conversa manualmente.'};

    if (!choose(results[0])) return {ok:false, mode:'needs-selection',
      error:'O resultado apareceu, mas não foi possível abrir a conversa.'};
    const composer = await until(() => {
      const field = find(selectors.composer);
      const newHeader = chatHeader();
      // Guard against filling the composer of the PREVIOUS customer.
      return field && (!oldHeader || (newHeader && newHeader !== oldHeader) ||
        exactPhoneIn(document.querySelector('#main header') || field, phone)) ? field : null;
    }, 4500);
    if (!composer) return {ok: false, mode:'needs-selection',
      error:'Não foi possível comprovar que a conversa correta abriu. A mensagem não foi inserida.'};
    const draft = String(composer.innerText ?? composer.textContent ?? '').trim();
    if (draft && draft !== text.trim()) return {ok:false, mode:'draft-conflict',
      error:'Há um rascunho diferente nesta conversa; ele foi preservado.'};
    if (!draft && !edit(composer, text)) return {ok:false, mode:'needs-selection',
      error:'A conversa abriu, mas o WhatsApp não aceitou o texto. Copie-o pelo painel.'};
    composer.focus();
    return {ok:true,mode:'draft-ready',reloaded:false,
      message:'Conversa aberta e mensagem preenchida. Confira o destinatário e pressione Enviar.'};
  }

  runtime.onMessage.addListener((message, sender, reply) => {
    if (message?.type === 'SRN_WHATSAPP_READY') {reply({ok:true});return false;}
    if (message?.type !== 'SRN_WHATSAPP_OPEN_CHAT_IN_APP') return false;
    busy = busy.catch(() => {}).then(() => prepare(message));
    busy.then(reply).catch(err => reply({ok:false,reloaded:false,error:String(err?.message || err)}));
    return true;
  });
})();
