import { Action } from "../common/action";
import { Message } from "../common/message";
import { getUrlWithTextFragment } from "./fragment";
import { ShellElement } from "./shell";

function entrypoint() {
  const shell = new ShellElement();
  document.body.appendChild(shell);
  shell.hide();
  chrome.runtime.sendMessage({ type: Action.HIDDEN });

  window.onmessage = (e) => {
    try {
      const msg: { type: Action; size: number } = JSON.parse(e.data);
      if (msg.type == Action.WIDTH) {
        shell.setWidth(msg.size);
      }
      if (msg.type == Action.CLOSE) {
        shell.hide();
        chrome.runtime.sendMessage({ type: Action.HIDDEN });
      }
      if (msg.type == Action.REQUEST_FRAGMENT) {
        (async () => {
          const urlWithTextFragment = getUrlWithTextFragment();
          if (urlWithTextFragment)
            shell.sendMessage(
              JSON.stringify({
                type: Action.RESPONSE_FRAGMENT,
                id: (msg as any).id,
                data: urlWithTextFragment,
              })
            );
        })();
      }
    } catch (e) { }
  };

  chrome.runtime.onMessage.addListener(
    (message: Message, sender, sendResponse) => {
      if (message.type == Action.TOGGLE_CLICKED) {
        if (shell.isShown()) {
          shell.hide();
          chrome.runtime.sendMessage({ type: Action.HIDDEN });
        } else {
          shell.show();
          chrome.runtime.sendMessage({ type: Action.SHOWN });
        }
      } else if (message.type == Action.REQUEST_FRAGMENT) {
        const urlWithTextFragment = getUrlWithTextFragment();
        sendResponse(urlWithTextFragment);
      } else if (message.type == Action.NAVIGATE) {
        // Chrome Navagation API doesn't work with TextFragment.
        // But the anchor element works well.
        const url = (message as any).data;
        const a = document.createElement('a');
        a.href = `${url}`;
        a.click();
        a.remove();
      }
    }
  );

}

window.addEventListener("load", delayedEntryPoint, false);
function delayedEntryPoint() {
  setTimeout(() => entrypoint());
}

export const extensionId = chrome.i18n.getMessage("@@extension_id");
