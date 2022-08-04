import { Injectable } from '@angular/core';
import { TextFragment } from 'text-fragments-polyfill/dist/fragment-generation-utils';
import { ExtensionService } from './extension.service';

@Injectable({
  providedIn: 'root'
})
export class ShellControllerService {

  constructor(private extensionService: ExtensionService) { }

  async currentTab() {
    if (!this.extensionService.isExtension())
      return Promise.reject("It's not hosted by the extension");
    return new Promise<chrome.tabs.Tab>((resolve, reject) => {
      chrome?.tabs?.query({ active: true, lastFocusedWindow: true },
        async (tabs) => {
          const tab = tabs[0];
          resolve(tab);
        });
    });
  }

  async pageInfo() {
    if (!this.extensionService.isExtension())
      return Promise.reject("It's not hosted by the extension");
    try {
      const tab = await this.currentTab();
      let pageInfo: { title: string, href: string, favicon: string }
        = await new Promise((resolve, reject) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: 10 }, (res) => {
              resolve(res);
            });
          }
        });
      return pageInfo;
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getFragment() {
    if (!this.extensionService.isExtension())
      return Promise.reject("It's not hosted by the extension");
    try {
      const tab = await this.currentTab();
      const fragment = await new Promise<{
          fullUrl: string;
          fragment: TextFragment;
          textDirectiveParameters: string;
          selectedText: string;
        } | undefined
      >((resolve, reject) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { type: 1 }, (res) => {
            resolve(res);
          });
        }
      });
      return fragment;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
