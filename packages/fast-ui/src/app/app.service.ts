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
        const object: { routes: string[], date: Date, fragment?: string } = JSON.parse(item);
        if ((Math.abs(new Date(object.date).getTime() - Date.now()) / 1000) <= 30) // less than 30 seconds
          return object;
      } finally {
        localStorage.removeItem(`${tabId}`);
      }
    }
    return undefined;
  }

  setInitialRoutesAfterNavigation(tabId: number, routes: string[], fragment?: string) {
    localStorage.setItem(`${tabId}`, JSON.stringify({ routes, date: new Date(), fragment }));
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
}
