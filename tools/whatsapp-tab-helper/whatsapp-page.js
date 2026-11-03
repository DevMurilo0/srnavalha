/* Sr. Navalha · WhatsApp Web conversation opener (Firefox / Floorp / Chrome).
 * Uses the visible interface only. It never presses Send, never reloads the page,
 * and refuses to pick an ambiguous contact or overwrite a different draft.
 * WhatsApp controls are third-party UI and can change without notice.
 */
(() => {
  if (globalThis.__srnWhatsappSearchInstalled) return;
  globalThis.__srnWhatsappSearchInstalled = true;

  const runtime = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  let queue = Promise.resolve();

  const selectors = {
    sidebarSearch: [
      '#side [contenteditable="true"][role="textbox"]',
      '#side [contenteditable="true"][data-tab]',
      '#side input[type="text"]',
      '[data-testid="chat-list-search"] [contenteditable="true"]',
      '[data-testid="chat-list-search"] input'
    ],
    newChatButton: [
      '#side [data-icon="new-chat-outline"]',
      '#side [data-icon="new-chat-filled"]',
      '#side button[aria-label="New chat"]',
      '#side button[aria-label="Nova conversa"]',
      '#side [aria-label="New chat"]',
      '#side [aria-label="Nova conversa"]'
    ],
    newChatSearch: [
      '[aria-label="Search name or number"][contenteditable="true"]',
      '[aria-label="Pesquisar nome ou número"][contenteditable="true"]',
      '[aria-label="Buscar nome ou número"][contenteditable="true"]',
      '[placeholder="Search name or number"]',
      '[placeholder="Pesquisar nome ou número"]'
    ],
    conversationRows: [
      '#pane-side [data-testid="cell-frame-container"]',
      '#pane-side [role="row"]',
      '#pane-side [role="listitem"]',
      '#side [data-testid="cell-frame-container"]',
      '[data-testid="contact-list"] [role="row"]',
      '[data-testid="contact-item"]'
    ],
    composer: [
      '#main footer [contenteditable="true"][role="textbox"]',
      '#main footer div[contenteditable="true"]',
      '#main [data-testid="conversation-compose-box-input"]',
      'footer [data-testid="conversation-compose-box-input"]'
    ]
  };

  function visible(node) {
    return Boolean(node && node.isConnected !== false && node.getClientRects?.().length
      && !node.closest?.('[aria-hidden="true"]'));
  }
  function find(selectorsList, options = {}) {
    for (const selector of selectorsList) {
      const node = document.querySelector(selector);
      if (visible(node) && (!options.outsideMain || !node.closest('#main'))) return node;
    }
    return null;
  }
  async function waitFor(action, ms = 2600) {
    const limit = Date.now() + ms;
    do {
      const value = action();
      if (value) return value;
      await pause(120);
    } while (Date.now() < limit);
    return null;
  }
  function fill(field, value) {
    if (!visible(field)) return false;
    field.focus();
    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
      const proto = field.tagName === 'INPUT' ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(field, value);
      else field.value = value;
      field.dispatchEvent(new Event('input', {bubbles: true}));
      return field.value === value;
    }
    const selection = window.getSelection();
    if (!selection) return false;
    const range = document.createRange();
    range.selectNodeContents(field);
    selection.removeAllRanges();
    selection.addRange(range);
    // Input through an editing command instead of changing innerHTML:
    // WhatsApp needs a real input event to update its draft state.
    let inserted = false;
    try { inserted = document.execCommand('insertText', false, value); }
    catch { /* Browser may disable the legacy editing command. */ }
    if (!inserted) {
      field.textContent = value;
      field.dispatchEvent(new InputEvent('input', {
        bubbles: true, inputType: 'insertText', data: value
      }));
    }
    const observed = String(field.innerText || field.textContent || '').trim().replace(/\r/g,'');
    return observed === value.trim() ||
      (value.includes('\n') && observed.replace(/\s+/g,'') === value.trim().replace(/\s+/g,''));
  }

  function matchesPhone(node, phone) {
    const pieces = [
      node.textContent,
      node.getAttribute?.('aria-label'),
      node.getAttribute?.('title'),
      node.getAttribute?.('data-id'),
      node.getAttribute?.('data-jid'),
      ...Array.from(node.querySelectorAll?.('[title],[aria-label]') || [])
        .slice(0, 12).map(item => (item.getAttribute('title') || '') +
          ' ' + (item.getAttribute('aria-label') || ''))
    ].join(' ');
    const clean = pieces.replace(/\D/g, '');
    // Full number or local number with matching area code; never match
    // unrelated 4-digit fragments or message search snippets.
    return clean.includes(phone) || clean.includes(phone.slice(-11));
  }

  function candidateRows(phone) {
    const unique = new Set();
    for (const selector of selectors.conversationRows) {
      for (const node of document.querySelectorAll(selector)) {
        if (!visible(node) || node.closest('#main')) continue;
        if (matchesPhone(node, phone)) unique.add(node);
      }
    }
    return [...unique].filter(row => ![...unique].some(other =>
      row !== other && row.contains?.(other)));
  }

  function tap(node) {
    const target = node?.closest?.('[role="button"],button') || node;
    if (!visible(target)) return false;
    target.click();
    return true;
  }

  async function findContact(phone) {
    let search = await waitFor(() => find(selectors.sidebarSearch, {outsideMain: true}), 2200);
    if (!search) return {ok:false, error:'A pesquisa lateral do WhatsApp não foi encontrada.'};
    if (!fill(search, phone)) return {ok:false, error:'Não foi possível pesquisar o telefone.'};

    let rows = await waitFor(() => {
      const found = candidateRows(phone);
      return found.length ? found : null;
    }, 3200);
    if (!rows?.length) {
      // Attempt WhatsApp's native New chat flow for numbers not yet in the chat
      // list. If we cannot resolve an exact phone, leave it for manual choice.
      const icon = find(selectors.newChatButton, {outsideMain:true});
      if (icon && tap(icon)) {
        search = await waitFor(() => find(selectors.newChatSearch, {outsideMain:true}), 2200);
        if (search && fill(search, phone)) {
          rows = await waitFor(() => {
            const found = candidateRows(phone);
            return found.length ? found : null;
          }, 3000);
        }
      }
    }

    if (!rows?.length) return {
      ok: false, mode:'needs-selection',
      error:'Número pesquisado, mas o WhatsApp não mostrou um contato identificável. Selecione o cliente manualmente; nenhuma conversa foi alterada.'
    };
    if (rows.length !== 1) return {
      ok:false, mode:'needs-selection',
      error:'Há mais de um resultado para este número. Selecione o contato correto no WhatsApp.'
    };

    if (!tap(rows[0])) return {ok:false, error:'Não foi possível abrir o contato encontrado.'};
    const composer = await waitFor(() => find(selectors.composer), 3700);
    if (!composer) return {
      ok:false, mode:'needs-selection',
      error:'O WhatsApp não abriu o campo de mensagem. Confira a conversa e selecione o cliente manualmente.'
    };
    return {ok:true, composer};
  }

  async function prepareDraft({phone, text}) {
    const digits = String(phone || '').replace(/\D/g, '');
    const draft = String(text || '');
    if (!/^55\d{10,11}$/.test(digits) || !draft.trim() || draft.length > 6000) {
      return {ok:false, error:'Telefone ou texto da mensagem inválido.'};
    }
    const contact = await findContact(digits);
    if (!contact.ok) return contact;
    const composer = contact.composer;
    const existing = (composer.value ?? composer.textContent ?? '').trim();
    if (existing && existing !== draft.trim()) return {
      ok:false, mode:'draft-conflict',
      error:'O cliente já possui um rascunho diferente. Para não apagar sua mensagem, o texto novo ficou disponível no painel.'
    };
    if (!existing && !fill(composer, draft)) return {
      ok:false, mode:'needs-selection',
      error:'A conversa abriu, mas o WhatsApp não aceitou o rascunho. Copie a mensagem no painel.'
    };
    composer.focus();
    return {
      ok:true, mode:'draft-ready',
      message:'Conversa aberta e mensagem preparada no campo do WhatsApp. Revise e clique em Enviar.'
    };
  }

  runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'SRN_WHATSAPP_SEARCH_PING') {
      sendResponse({ok:true});
      return false;
    }
    if (message?.type !== 'SRN_WHATSAPP_FIND_CONTACT') return false;
    // Serialize clicks so repeated admin requests cannot interleave drafts.
    queue = queue.catch(() => {}).then(() => prepareDraft(message));
    queue.then(sendResponse).catch(error => sendResponse({
      ok:false, error:String(error?.message || error)
    }));
    return true;
  });
})();
