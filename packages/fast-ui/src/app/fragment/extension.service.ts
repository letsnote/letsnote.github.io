import { Injectable } from '@angular/core';
import { last, Subject } from 'rxjs';
import { TextFragment } from 'text-fragments-polyfill/dist/fragment-generation-utils';
import { GroupListModel } from '../group-list/group-list.component';

@Injectable({
  providedIn: 'root',
})
export class ExtensionService {
  constructor() {
    (window.document as any).uniqueId = parseInt(`${Math.random() * 1000000}`);
    this.addExtensionListener();
  }

  private _requestFromContextMenu = new Subject<{ groupId: string }>();
  // private contextMenuActionSeq = 1;
  private contextMenuActionMap = new Map<
    number,
    {
      messageId: number;
      groupId: string;
      data: chrome.contextMenus.OnClickData;
      tab: chrome.tabs.Tab | undefined;
    }
  >();

  public readonly requestFromContextMenu =
    this._requestFromContextMenu.asObservable();

  private async addExtensionListener() {
    const queryOptions = { active: true, currentWindow: true };
    const currentTab = (await chrome.tabs.query(queryOptions))[0];
    if (!currentTab.id) {
      console.warn('There is no active tab on top of the iframe.');
      return;
    }
    const tabIdSnapshot = currentTab.id;
    const lastUniqueWindowId = (window.document as any).uniqueId;
    //TODO remove duplicate listeners
    const listener = (
      data: chrome.contextMenus.OnClickData,
      tab: chrome.tabs.Tab | undefined
    ) => {
      const currentUniqueWindowId = (window?.document as any).uniqueId;
      console.debug("deregister: " + lastUniqueWindowId, currentUniqueWindowId);
      if (lastUniqueWindowId != currentUniqueWindowId) {
        //TODO is it safe?
        chrome.contextMenus.onClicked.removeListener(listener);
      } else {
        if (tab?.id === tabIdSnapshot) { // check whether they equal?
          const groupId = `${data.menuItemId}`;
          this._requestFromContextMenu.next({ groupId });
        }
      }
    };
    chrome.contextMenus.onClicked.addListener(listener);
  }

  async updateContextMenu(model: GroupListModel) {
    console.debug('upate context menu');
    chrome.contextMenus.removeAll(() => {
      console.debug('upate context menu after removeall');

      chrome.contextMenus.create({
        title: '그룹에 추가',
        contexts: ['all'],
        id: 'add_to_group',
      });
      model.groups.forEach((g) => {
        chrome.contextMenus.create({
          title: `${g.name}`,
          parentId: 'add_to_group',
          contexts: ['all'],
          id: `${g.id}`,
        });
      });
    });
  }
  sendMessageToParent(msg: { type: number; id?: number; data?: any }) {
    window?.top?.postMessage(JSON.stringify(msg), '*');
  }
}
