import { Action } from "../common/action";
import { Message } from "../common/message";
import { ShellElement } from "./shell";

function entrypoint() {
  // await loadFontOnDocument(document);
  const shell = new ShellElement();
  document.body.appendChild(shell);
  shell.hide();
  chrome.runtime.sendMessage({type: Action.HIDDEN});

  window.onmessage = (e) => {
    try {
      const msg: { type: Action; size: number } = JSON.parse(e.data);
      if (msg.type == Action.WIDTH) {
        shell.setWidth(msg.size);
      }
      if (msg.type == Action.CLOSE) {
        shell.hide();
        chrome.runtime.sendMessage({type: Action.HIDDEN});
      }
    } catch (e) { }
  };

  chrome.runtime.onMessage.addListener((message: Message) => {
    if (message.type == Action.TOGGLE_CLICKED) {
      if (shell.isShown()) {
        shell.hide();
        chrome.runtime.sendMessage({type: Action.HIDDEN});
      }
      else {
        shell.show();
        chrome.runtime.sendMessage({type: Action.SHOWN});
      }
    }
  });
}

entrypoint();

export const extensionId = chrome.i18n.getMessage("@@extension_id");
