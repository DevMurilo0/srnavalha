// Optional development helper: Firefox WebDriver BiDi + Node 22, no npm packages.
// Start Firefox with --headless --no-remote --profile <existing-folder> --remote-debugging-port 9223.
import { writeFileSync } from 'node:fs';
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
export class Firefox {
  async connect(port = 9223) {
    this.ws = new WebSocket(`ws://127.0.0.1:${port}/session`);
    this.id = 0; this.pending = new Map(); this.events = [];
    this.ws.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject, timer } = this.pending.get(message.id);
        clearTimeout(timer); this.pending.delete(message.id);
        if (message.type === 'error') reject(new Error(`${message.error}: ${message.message}\n${message.stacktrace || ''}`));
        else resolve(message.result);
      } else this.events.push(message);
    };
    await new Promise((resolve, reject) => { this.ws.onopen = resolve; this.ws.onerror = reject; });
    await this.send('session.new', { capabilities: { alwaysMatch: {} } });
    await this.send('session.subscribe', { events: ['log.entryAdded'] });
    const { contexts } = await this.send('browsingContext.getTree');
    this.context = contexts[0].context;
    // V5 and V6 share filenames. Test current HTTP files, never a cached V5 document.
    await this.send('network.setCacheBehavior', { cacheBehavior: 'bypass', contexts: [this.context] });
    return this;
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`BiDi timeout: ${method}`)); }, 25000);
      this.pending.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async viewport(width, height = 900, dpr = 1) { this.width = width; this.height = height; return this.send('browsingContext.setViewport', { context: this.context, viewport: { width, height }, devicePixelRatio: dpr }); }
  async goto(url) {
    // A fragment-only navigation reuses the old document, even with HTTP cache bypassed.
    const target = new URL(url);
    target.searchParams.set('__v6test', String(Date.now()));
    await this.send('browsingContext.navigate', { context: this.context, url: target.href, wait: 'interactive' });
    await sleep(450);
  }
  async evaluate(expression) {
    const result = await this.send('script.evaluate', { expression: typeof expression === 'function' ? `(${expression})()` : expression, target: { context: this.context }, awaitPromise: true, resultOwnership: 'none' });
    if (result.type === 'exception') throw new Error(`Page evaluation: ${result.exceptionDetails.text}\n${JSON.stringify(result.exceptionDetails.stackTrace)}`);
    const decode = value => {
      if (!value) return undefined;
      if (value.type === 'object') return Array.isArray(value.value) ? Object.fromEntries(value.value.map(([key, v]) => [typeof key === 'string' ? key : decode(key), decode(v)])) : null;
      if (value.type === 'array') return (value.value || []).map(decode);
      if (value.type === 'null') return null;
      return value.value;
    };
    return decode(result.result);
  }
  async screenshot(path, full = false) { const r = await this.send('browsingContext.captureScreenshot', { context: this.context, origin: full ? 'document' : 'viewport', format: { type: 'image/png' } }); writeFileSync(path, Buffer.from(r.data, 'base64')); }
  async click(selector) {
    const position = await this.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center',behavior:'instant'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await this.send('input.performActions', { context: this.context, actions: [{ type: 'pointer', id: 'mouse', parameters: { pointerType: 'mouse' }, actions: [{ type: 'pointerMove', x: Math.round(position.x), y: Math.round(position.y) }, { type: 'pointerDown', button: 0 }, { type: 'pointerUp', button: 0 }] }] });
  }
  async key(value) { return this.send('input.performActions', { context: this.context, actions: [{ type: 'key', id: 'keyboard', actions: [{ type: 'keyDown', value }, { type: 'keyUp', value }] }] }); }
  async close() { await this.send('session.end').catch(() => {}); this.ws.close(); }
}
