import { Injectable } from '@angular/core';
import { createAnnotations, getProfile } from 'hypothesis-data';
import { Subject } from 'rxjs';
import { TextFragment } from 'text-fragments-polyfill/dist/fragment-generation-utils';
import { AppService } from '../app.service';
import { composeUrl } from '../fragment/fragment';
import { ItemModel } from '../body/item/item.component';
import { ConfigService } from '../setting/config.service';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(private config: ConfigService, private appService: AppService) { }

  async copyNewAnnotaion(model: ItemModel) {
    let row = await createAnnotations(this.config.key,
      {
        ...model
        , created: new Date().toISOString()
        , updated: new Date().toISOString()
      });
    this.pushNewNote(row);
  }

  async createNewAnnotation(groupId: string, customUrl?: string) {
    try {
      const profile = await getProfile(this.config.key);
      const tab = await this.appService.currentTab();
      const pageInfo = await this.appService.pageInfo();
      if (tab.id && pageInfo && this.appService.isChrome()) {
        const tabId = tab.id;
        const title = tab.title ?? pageInfo?.title;
        const url = customUrl ?? tab.url ?? pageInfo.href;
        const favicon = tab.favIconUrl ?? pageInfo.favicon;
        const fragment = await new Promise<
          | {
            fullUrl: string;
            fragment: TextFragment;
            textDirectiveParameters: string;
            selectedText: string;
          }
          | undefined
        >((resolve) => {
          chrome.tabs.sendMessage(tabId, { type: 1 }, (res) => {
            resolve(res);
          });
        });
        let meta = {};
        if (favicon) meta = { ...meta, favicon };
        if (fragment?.selectedText) meta = { ...meta, selectedText: fragment.selectedText };
        const newUrl = composeUrl(url, {
          metaDirectiveParameter: JSON.stringify(meta),
          textDirectiveParameter: fragment?.textDirectiveParameters,
        });
        const row = await createAnnotations(this.config.key, {
          group: groupId,
          tags: [],
          text: '',
          user: profile.userid,
          document: { title: [title] },
          uri: newUrl?.url.toString() ?? url,
          target: [],
          references: [],
          permissions: {
            read: [],
            update: [profile.userid],
            delete: [profile.userid],
          },
        });
        this.pushNewNote(row);
        return Promise.resolve(row);
      } else {
        return Promise.reject(`tabId: ${tab.id}, isChrome: ${this.appService.isChrome()}`);
      }
    } catch (e) {
      console.error(e);
      return Promise.reject(e);
    }
  }

  // async createNewAnnotation(
  //   groupModel?: GroupModel
  //   , groupId?: string
  //   , urlParameter?: string) {
  //   const profile = await getProfile(this.config.key);
  //   const group = groupId ?? groupModel?.id as string;
  //   chrome?.tabs?.query({ active: true, lastFocusedWindow: true }, async (tabs) => {
  //     const tab = tabs[0];
  //     let pageInfo: { title: string, href: string, favicon: string } | undefined = await new Promise(resolve => {
  //       if (tab?.id) {
  //         chrome.tabs.sendMessage(tab.id, { type: 10 }, (res) => {
  //           resolve(res);
  //         });
  //       } else {
  //         resolve(undefined);
  //       }
  //     });
  //     if (tab && tab.id) {
  //       const tabId = tab.id;
  //       const title = tab.title ?? pageInfo?.title ?? '';
  //       const url = urlParameter ?? tab.url ?? pageInfo?.href ?? '';
  //       const favicon = tab.favIconUrl ?? pageInfo?.favicon ?? '';
  //       const fragment = await new Promise<
  //         | {
  //           fullUrl: string;
  //           fragment: TextFragment;
  //           textDirectiveParameters: string;
  //           selectedText: string;
  //         }
  //         | undefined
  //       >((resolve) => {
  //         chrome.tabs.sendMessage(tabId, { type: 1 }, (res) => {
  //           resolve(res);
  //         });
  //       });
  //       let meta = {};
  //       if (favicon) meta = { ...meta, favicon };
  //       if (fragment?.selectedText) meta = { ...meta, selectedText: fragment.selectedText };
  //       const newUrl = composeUrl(url, {
  //         metaDirectiveParameter: JSON.stringify(meta),
  //         textDirectiveParameter: fragment?.textDirectiveParameters,
  //       });
  //       const row = await createAnnotations(this.config.key, {
  //         group,
  //         tags: [],
  //         text: '',
  //         user: profile.userid,
  //         document: { title: [title] },
  //         uri: newUrl?.url.toString() ?? url,
  //         target: [],
  //         references: [],
  //         permissions: {
  //           read: [],
  //           update: [profile.userid],
  //           delete: [profile.userid],
  //         },
  //       });
  //       this.pushNewNote(row);
  //     }
  //   });
  // }

  private newNoteSubject = new Subject<_Types.AnnotationsResponse.Row>();
  readonly newNoteObserverble = this.newNoteSubject.asObservable();

  private pushNewNote(row: _Types.AnnotationsResponse.Row) {
    this.newNoteSubject.next(row);
  }

}
