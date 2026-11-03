/* Sr. Navalha · WhatsApp Web in-page contact lookup.
 * Uses the ordinary sidebar search without navigating/reloading the tab.
 * Never reads messages, selects a chat, edits a draft, or presses Send.
 */
(() => {
  if (globalThis.__srnWhatsappSearchInstalled) return;
  globalThis.__srnWhatsappSearchInstalled = true;

  const extensionAPI = typeof browser !== 'undefined' ? browser : chrome;
  const searchSelectors = [
    '#side [contenteditable="true"][role="textbox"]',
    '#side [contenteditable="true"][data-tab]',
    '#side input[type="text"]',
    '[data-testid="chat-list-search"] [contenteditable="true"]',
    '[data-testid="chat-list-search"] input',
    '[aria-label="Search or start new chat"][contenteditable]',
    '[aria-label="Pesquisar ou começar uma nova conversa"][contenteditable]'
  ];

  function findSidebarSearch() {
    // Never use a composer in #main or a search box inside a chat.
    for (const selector of searchSelectors) {
      const input = document.querySelector(selector);
      if (input && !input.closest('#main') && input.getClientRects().length)
        return input;
    }
    return null;
  }

  async function waitForSearch() {
    const expiry = Date.now() + 5400;
    do {
      const field = findSidebarSearch();
      if (field) return field;
      await new Promise(resolve => setTimeout(resolve, 180));
    } while (Date.now() < expiry);
    return null;
  }

  function replaceSearch(field, phone) {
    field.focus();
    if (field.tagName === 'INPUT') {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype, 'value'
      )?.set;
      if (setter) setter.call(field, phone);
      else field.value = phone;
      field.dispatchEvent(new Event('input', {bubbles: true}));
      return field.value === phone;
    }

    const selection = window.getSelection();
    if (!selection) return false;
    const range = document.createRange();
    range.selectNodeContents(field);
    selection.removeAllRanges();
    selection.addRange(range);

    // insertText triggers real editing events used by WhatsApp's UI framework.
    let inserted = false;
    try { inserted = document.execCommand('insertText', false, phone); }
    catch { /* fallback below */ }
    if (!inserted) {
      field.textContent = phone;
      field.dispatchEvent(new InputEvent('input', {
        bubbles: true, inputType: 'insertText', data: phone
      }));
    }
    return String(field.textContent || '').replace(/\D/g, '') === phone;
  }

  async function findContact(message) {
    const phone = String(message.phone || '').replace(/\D/g, '');
    if (!/^55\d{10,11}$/.test(phone)) {
      return {ok: false, error: 'Telefone inválido para pesquisa'};
    }
    const input = await waitForSearch();
    if (!input) return {
      ok: false,
      error: 'Campo de pesquisa do WhatsApp não encontrado. Abra a lista de conversas e tente novamente. Nenhuma página foi recarregada.'
    };
    if (!replaceSearch(input, phone)) return {
      ok: false, error: 'Não foi possível preencher a pesquisa do WhatsApp'
    };
    return {
      ok: true,
      mode: 'searched',
      message: 'Número pesquisado na conversa aberta; escolha o resultado no WhatsApp e envie a mensagem por lá'
    };
  }

  extensionAPI.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'SRN_WHATSAPP_SEARCH_PING') {
      sendResponse({ok: true});
      return false;
    }
    if (message?.type !== 'SRN_WHATSAPP_FIND_CONTACT') return false;
    findContact(message).then(sendResponse).catch(error => sendResponse({
      ok: false, error: String(error?.message || error)
    }));
    return true;
  });
})();
