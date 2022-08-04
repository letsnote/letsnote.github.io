import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { GroupModel } from '../../group-model';
import { AnnotationCreationService } from '../annotation-creation.service';

//TODO: refactor
@Injectable({
  providedIn: 'root',
})
export class ContextMenuService {
  constructor(private annotationService: AnnotationCreationService) {
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

  // public readonly requestFromContextMenu =
  //   this._requestFromContextMenu.asObservable();

  private async addExtensionListener() {
    const queryOptions = { active: true, currentWindow: true };
    // const currentTab = (await chrome.tabs.getCurrent());
    // if (!currentTab.id) {
    //   console.warn('There is no active tab on top of the iframe.');
    //   return;
    // }
    // const tabIdSnapshot = currentTab.id;
    const lastUniqueWindowId = (window.document as any).uniqueId;
    //TODO remove duplicate listeners
    const listener = async (
      data: chrome.contextMenus.OnClickData,
      tab: chrome.tabs.Tab | undefined
    ) => {

      const currentTab = (await chrome.tabs.getCurrent());
      const currentUniqueWindowId = (window?.document as any).uniqueId;
      if (lastUniqueWindowId != currentUniqueWindowId) {
        //TODO is it safe?
        console.debug("deregister: " + lastUniqueWindowId, currentUniqueWindowId);
        chrome.contextMenus.onClicked.removeListener(listener);
      } else {
        console.debug("check tab ids: " + tab?.id, currentTab.id);

        if (tab?.id === currentTab.id) { //TODO check whether they equal?
          const groupId = `${data.menuItemId}`;
          this.annotationService.createNewAnnotation(groupId);
          // this._requestFromContextMenu.next({ groupId });
        }
      }
    };
    console.debug('add contextmenu listener');
    chrome.contextMenus?.onClicked.addListener(listener);
  }

  async updateContextMenu(model: GroupModel[]) {
    console.debug('update context menu');
    chrome.contextMenus?.removeAll(() => {
      console.debug('upate context menu after removeall');

      chrome.contextMenus.create({
        title: '그룹에 추가',
        contexts: ['all'],
        id: 'add_to_group',
      });
      model.forEach((g) => {
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
