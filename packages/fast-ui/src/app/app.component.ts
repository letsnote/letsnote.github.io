///<reference types="chrome"/>

import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AppService } from './app.service';
import { ContextMenuService } from './service/context-menu.service';
import { ConfigService } from './setting/config.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'Gungo Note';
  @ViewChild("outer")
  outerElementRef: ElementRef | undefined;

  constructor(private hostElement: ElementRef, private config: ConfigService, private extension: ContextMenuService, private router: Router, private appService: AppService, private route: ActivatedRoute
    , private ngZone: NgZone) {
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
      this.extension.sendMessageToParent(msg);
    });
    if(chrome?.tabs)
      this.initializeHandlerForExtension();
    else{
      this.appService.enableComponentRendering();
      if(window.location.pathname.length < 2)
        this.router.navigate(['groups'], {replaceUrl: true});
    }
  }

  firstShow = false;

  private async initializeHandlerForExtension(){
    const currentTab = await chrome.tabs.getCurrent();

    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      this.ngZone.run(async () => { // allows you to reenter Angular zone from a task that was executed outside of the Angular zone
        if (sender.tab?.id === currentTab.id) {
          if (msg.type === 5){ // SHOWN
            this.appService.enableComponentRendering();
            if(!this.firstShow){
              this.router.navigate(['groups'], {replaceUrl: true});
              this.firstShow = true;
            }
            // this.appService.updateVisible(true);
            sendResponse();
          }else if (msg.type === 4){
            this.appService.disableComponentRendering();
            // this.appService.updateVisible(false);
            sendResponse();
          }
        }
      });
    });
    
    currentTab.id && chrome.tabs.sendMessage(currentTab.id, { type: 9 });
    this.initializeRoutes();
  }

  private async initializeRoutes() {
    const tab = await chrome.tabs.getCurrent();
    if (tab.id) {
      const routesAndFragment = this.appService.getAndRemoveInitialRoutes(tab.id)
      if (routesAndFragment) {
        await this.router.navigate(routesAndFragment.routes, {queryParams: {listLength: routesAndFragment.listLength, fragment: routesAndFragment.fragment}});
        chrome.tabs.sendMessage(tab.id, { type: 8 });
      }
    }
  }

  onClose() {
    const msg = { type: 3 };
    this.extension.sendMessageToParent(msg);
  }
}
