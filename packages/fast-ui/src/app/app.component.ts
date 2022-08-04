///<reference types="chrome"/>

import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ContextMenuService } from './service/extension/context-menu.service';
import { ExtensionService } from './service/extension/extension.service';
import { ConfigService } from './setting/config.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  @ViewChild("outer")
  outerElementRef?: ElementRef;

  constructor(private config: ConfigService, 
    private contextMenuService: ContextMenuService, 
    private router: Router, 
    private ngZone: NgZone,
    private extensionService: ExtensionService) {
  }

  deferredPrompt?: Event;

  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e: Event) {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    (window as any)?.showInstallPromotion?.();
    // Optionally, send analytics event that PWA install promo was shown.
    console.log(`'beforeinstallprompt' event was fired.`);
  }

  async ngAfterViewInit() {
    this.config.fontSizeObservable.subscribe((pxSize) => {
      if (this.outerElementRef) {
        if (document.body.parentElement)
          document.body.parentElement.style.fontSize = `${pxSize}px`;
      }
    });
    this.config.widthObservable.subscribe((emSize) => {
      const msg = { type: 2, size: emSize };
      this.contextMenuService.sendMessageToParent(msg);
    });
    if (this.extensionService.isExtension()){
      this.initializeExtension();
    }else {
      if (window.location.pathname.length < 2)
        this.router.navigate(['groups'], { replaceUrl: true });
    }
  }

  private firstShow = false;

  private async initializeExtension() {
    const tab = await chrome.tabs.getCurrent();
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      this.ngZone.run(async () => {
        if (sender.tab?.id === tab.id) {
          if (msg.type === 5) { // Shown
            if (!this.firstShow) {
              this.router.navigate(['groups'], { replaceUrl: true });
              this.firstShow = true;
            }
            sendResponse();
          } else if (msg.type === 4) {
            sendResponse();
          }
        }
      });
    });
    this.restoreRoute();
    tab.id && chrome.tabs.sendMessage(tab.id, { type: 9 });
  }

  private async restoreRoute() {
    const tab = await chrome.tabs.getCurrent();
    if (tab.id) {
      const routesAndFragment = this.extensionService.removeInitialRoutes(tab.id)
      if (routesAndFragment) {
        await this.router.navigate(routesAndFragment.routes, { queryParams: { listLength: routesAndFragment.listLength, fragment: routesAndFragment.fragment } });
        chrome.tabs.sendMessage(tab.id, { type: 8 });
      }
    }
  }

  onClose() {
    const msg = { type: 3 };
    this.contextMenuService.sendMessageToParent(msg);
  }
}
