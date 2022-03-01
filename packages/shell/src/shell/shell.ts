import { getBiggestZIndex } from "./zindex";

export class ShellElement extends HTMLElement {
  private outer: HTMLDivElement;
  private iframe: HTMLIFrameElement;
  constructor() {
    super();
    let shadowRoot = this.attachShadow({ mode: 'open' });
    const html = require('resource/shell.html').default;
    shadowRoot.innerHTML = html;
    this.outer = this.shadowRoot?.querySelector('.outer') as HTMLDivElement;
    this.iframe = this.shadowRoot?.querySelector('#angular') as HTMLIFrameElement;
    const uri = chrome.runtime.getURL('fast-ui/index.html');
    console.debug(`Angular URI: ${uri}`);
    this.iframe.src = uri;
  }
  show() {
    this.outer.style.display = '';
    const zindex = getBiggestZIndex(this.ownerDocument, window);
    this.outer.style.zIndex = `${zindex}`;
  }

  setWidth(width: number){
    this.outer.style.width = `${width}em`;
  }

  hide() {
    this.outer.style.display = 'none';
  }

  isShown(){
    return this.outer.style.display !== 'none';
  }

  /**
   * @param message 
   */
  sendMessage(message: string){
    this.iframe.contentWindow?.postMessage(message, "*");
  }
}

window.customElements.define('thesis-note-shell', ShellElement);