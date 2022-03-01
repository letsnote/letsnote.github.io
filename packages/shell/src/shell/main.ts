import { Action } from "../common/action";
import { Message } from "../common/message";
import { ShellElement } from "./shell";

function entrypoint() {
  // await loadFontOnDocument(document);
  const shell = new ShellElement();
  document.body.appendChild(shell);
  shell.hide();

  window.onmessage = (e) => {
    try {
      const msg: { type: Action; size: number } = JSON.parse(e.data);
      if (msg.type == Action.WIDTH) {
        shell.setWidth(msg.size);
      }
      if (msg.type == Action.CLOSE) {
        shell.hide();
      }
    } catch (e) { }
  };

  chrome.runtime.onMessage.addListener((message: Message) => {
    if (message.type == Action.TOGGLE_CLICKED) {
      if (shell.isShown()) shell.hide();
      else shell.show();
    }
  });
}

entrypoint();

export const extensionId = chrome.i18n.getMessage("@@extension_id");
