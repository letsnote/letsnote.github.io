import { Injectable } from '@angular/core';
import { createAnnotations, getProfile } from 'hypothesis-data';
import { Subject } from 'rxjs';
import { composeUrl } from '../fragment/fragment';
import { ItemModel } from '../body/item/item.component';
import { ShellControllerService } from './shell-controller.service';
import { ExtensionService } from './extension.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AnnotationCreationService {
  constructor(private authService: AuthService,
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
      await this.createNewAnnotationOnExtension(groupId);
    } else
      await this.createNewAnnotationOnPage(groupId, "EMPTY_SOURCE");
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
