import { send } from "process";
import { Action } from "../common/action";
import { Message } from "../common/message";
export function entrypoint() {
  chrome.runtime.onInstalled.addListener(() => {
  });

  chrome.action.onClicked.addListener((tab) => {
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: Action.TOGGLE_CLICKED });
    }
  });

  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (msg.type === Action.SHOWN)
      chrome.action.setIcon(
        {
          path:
          {
            '16': 'resource/16.png',
            '32': 'resource/32.png',
            '24': 'resource/24.png',
            '64': 'resource/64.png',
            '128': 'resource/128.png',
          },
          tabId: sender.tab?.id
        }
      )
    else if (msg.type === Action.HIDDEN) {
      chrome.action.setIcon(
        {
          path:
          {
            '16': 'resource/w16.png',
            '32': 'resource/w32.png',
            '24': 'resource/w24.png',
            '64': 'resource/w64.png',
            '128': 'resource/w128.png',
          },
          tabId: sender.tab?.id
        });
    }
  })
}

entrypoint();
