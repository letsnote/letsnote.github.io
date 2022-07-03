import { Injectable } from '@angular/core';
import { createAnnotations, getProfile } from 'hypothesis-data';
import { Subject } from 'rxjs';
import { TextFragment } from 'text-fragments-polyfill/dist/fragment-generation-utils';
import { composeUrl } from '../fragment/fragment';
import { GroupModel } from '../group/group.component';
import { ConfigService } from '../setting/config.service';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {

  constructor(private config: ConfigService) { }
  
  async createNewAnnotation(
    groupModel?: GroupModel
    , groupId?: string
    , urlParameter?: string) {
    const profile = await getProfile(this.config.key);
    const group = groupId ?? groupModel?.id as string;
    chrome?.tabs?.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (tab && tab.id && tab.title && tab.url) {
        const tabId = tab.id;
        const title = tab.title;
        const url = urlParameter ?? tab.url;
        const favicon = tab.favIconUrl;
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
          group,
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
      }
    });
  }
  
  private newNoteSubject = new Subject<_Types.AnnotationsResponse.Row>();
  readonly newNoteObserverble = this.newNoteSubject.asObservable();
  
  private pushNewNote(row: _Types.AnnotationsResponse.Row){
    this.newNoteSubject.next(row);
  }

}
