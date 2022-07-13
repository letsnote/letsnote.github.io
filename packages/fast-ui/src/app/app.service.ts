import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() {
    this.disableComponentRendering();
  }

  getAndRemoveInitialRoutes(tabId: number) {
    const item = localStorage.getItem(`${tabId}`);
    if (item) {
      try {
        const object: { routes: string[], date: Date, fragment: string, listLength: number } = JSON.parse(item);
        if ((Math.abs(new Date(object.date).getTime() - Date.now()) / 1000) <= 30) // less than 30 seconds
          return object;
      } finally {
        localStorage.removeItem(`${tabId}`);
      }
    }
    return undefined;
  }

  setInitialRoutesAfterNavigation(tabId: number, routes: string[], fragment: string, listLength: number) {
    localStorage.setItem(`${tabId}`, JSON.stringify({ routes, date: new Date(), fragment, listLength }));
  }

  renderingEnabled = false

  disableComponentRendering() {
    this.renderingEnabled = false;
    this._onChangeComponentRendering.next(false);
  }

  enableComponentRendering() {
    this.renderingEnabled = true;
    this._onChangeComponentRendering.next(true);
  }

  private _onChangeComponentRendering = new ReplaySubject<boolean>();
  onChangeComponentRendering = this._onChangeComponentRendering.asObservable();

  async currentTab() {
    if(!this.isChrome())
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
    if(!this.isChrome())
      return Promise.reject("It's not hosted by the extension");
    const tab = await this.currentTab();
    let pageInfo: { title: string, href: string, favicon: string }
      = await new Promise((resolve, reject) => {
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 10 }, (res) => {
            resolve(res);
          });
        } else {
          reject();
        }
      });
    return pageInfo;
  }

  isChrome(){
    return location.href.includes("chrome-extension");
  }

  

  // updateVisible(visible: boolean){
  //   this.onVisible.next(visible);
  // }

  // private onVisible = new ReplaySubject<boolean>(1);
  // onVisibleObservable = this.onVisible.asObservable();
}
