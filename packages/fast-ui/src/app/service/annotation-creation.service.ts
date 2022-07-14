import { Injectable } from '@angular/core';
import { createAnnotations, getProfile } from 'hypothesis-data';
import { Subject } from 'rxjs';
import { TextFragment } from 'text-fragments-polyfill/dist/fragment-generation-utils';
import { AppService } from '../app.service';
import { composeUrl } from '../fragment/fragment';
import { ItemModel } from '../body/item/item.component';
import { ConfigService } from '../setting/config.service';
import { ShellControllerService } from './shell-controller.service';
import { ExtensionService } from './extension.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AnnotationCreationService {
  constructor(private authService: AuthService,
    private appService: AppService,
    private shellService: ShellControllerService,
    private extensionService: ExtensionService) { }

  async copyAnnotaion(model: ItemModel) {
    let row = await createAnnotations(this.authService.key,
      {
        ...model
        , created: new Date().toISOString()
        , updated: new Date().toISOString()
      });
    this.pushNewNote(row);
  }

  async createNewAnnotation(groupId: string) {
    if (this.extensionService.isExtension()) {
      this.createNewAnnotationOnExtension(groupId);
    } else
      this.createNewAnnotationOnPage(groupId, "EMPTY_SORCE");
  }

  private async createNewAnnotationOnPage(groupId: string, customUrl: string) {
    if (!this.authService.isSignin)
      return Promise.reject("API키가 유효하지 않습니다.");
    try {
      const profile = this.authService.profile!;
      const url = customUrl;
      const row = await createAnnotations(this.authService.key, {
        group: groupId,
        tags: [],
        text: '',
        user: profile.userid,
        document: { title: [''] },
        uri: url,
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
    } catch (e) {
      return Promise.reject(e);
    }
  }


  private async createNewAnnotationOnExtension(groupId: string, customUrl?: string) {
    if (!this.authService.isSignin)
      return Promise.reject("API키가 유효하지 않습니다.");
    try {
      const profile = this.authService.profile!;
      const tab = await this.shellService.currentTab();
      if (this.extensionService.isExtension()) {
        const pageInfo = await this.shellService.pageInfo();
        const fragment = await this.shellService.getFragment();
        const title = tab.title ?? pageInfo?.title;
        const url = customUrl ?? tab.url ?? pageInfo.href;
        const favicon = tab.favIconUrl ?? pageInfo.favicon;
        let meta = {};
        if (favicon) meta = { ...meta, favicon };
        if (fragment?.selectedText) meta = { ...meta, selectedText: fragment.selectedText };
        const newUrl = composeUrl(url, {
          metaDirectiveParameter: JSON.stringify(meta),
          textDirectiveParameter: fragment?.textDirectiveParameters,
        });
        const row = await createAnnotations(this.authService.key, {
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
        return Promise.reject(`tabId: ${tab.id}, isChrome: ${this.appService.isExtension()}`);
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }

  private noteCreatedSubject = new Subject<_Types.AnnotationsResponse.Row>();
  readonly noteCreatedObserverble = this.noteCreatedSubject.asObservable();

  private pushNewNote(row: _Types.AnnotationsResponse.Row) {
    this.noteCreatedSubject.next(row);
  }

}
