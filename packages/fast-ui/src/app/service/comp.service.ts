import { Injectable } from '@angular/core';
import { ExtensionService } from './extension/extension.service';

@Injectable({
  providedIn: 'root'
})
export class CompService {

  constructor(private extensionService: ExtensionService) { }
  
  async open(event: MouseEvent, url: string) {
    if(!this.extensionService.isExtension())
      return;
    event.preventDefault();
    const currentTab = await chrome.tabs.getCurrent();
    await chrome.tabs.create({ index: currentTab.index + 1, url, active: true });
  }
}
