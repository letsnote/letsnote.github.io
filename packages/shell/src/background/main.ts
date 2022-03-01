import { Action } from "../common/action";
import { Message } from "../common/message";

export function entrypoint() {
  chrome.runtime.onInstalled.addListener(() => {});

  chrome.action.onClicked.addListener((tab) => {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: Action.TOGGLE_CLICKED });
    }
  });
}
entrypoint();
