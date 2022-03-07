///<reference types="chrome"/>

import { AfterViewInit, Component, ElementRef, NgZone, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { createGroup } from 'hypothesis-data';
import { AppService } from './app.service';
import { RealtimeService } from './external/realtime.service';
import { ExtensionService } from './fragment/extension.service';
import { GroupListModel } from './group-list/group-list.component';
import { ConfigService } from './setting/config.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'fast-ui';
  got = 'aaa';
  // tabId?: string;
  @ViewChild("outer")
  outerElementRef: ElementRef | undefined;

  constructor(private config: ConfigService, private extension: ExtensionService, private router: Router, private appService: AppService, private route: ActivatedRoute
    , private ngZone: NgZone) {
    // this.route.queryParams.subscribe((param) => {
    //   console.debug(param);
    //   this.tabId = param['tab_id'];
    // })

  }

  async ngAfterViewInit() {
    const currentTab = await chrome.tabs.getCurrent();
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

    if (currentTab.id) {
      chrome.runtime.onMessage.addListener((msg, sender) => {
        this.ngZone.run(async() => { // allows you to reenter Angular zone from a task that was executed outside of the Angular zone
          const activeTab = (await chrome.tabs.query({ active: true }))[0];
          if (activeTab?.id === currentTab.id) {
            if (msg.type === 5) // SHOWN
              this.appService.enableComponentRendering();
            else if (msg.type === 4)
              this.appService.disableComponentRendering();
          }
        })
      });
    }
    this.initializeRoutes();
    currentTab.id && chrome.tabs.sendMessage(currentTab.id, { type: 9 });
  }

  async initializeRoutes() {
    const tab = await chrome.tabs.getCurrent();
    if (tab.id) {
      const routesAndFragment = this.appService.getAndRemoveInitialRoutes(tab.id)
      if (routesAndFragment) {
        await this.router.navigate(routesAndFragment.routes, routesAndFragment.fragment ? { fragment: routesAndFragment.fragment } : undefined);
        chrome.tabs.sendMessage(tab.id, { type: 8 });
      }
    }
  }

  onClose() {
    const msg = { type: 3 };
    this.extension.sendMessageToParent(msg);
  }
}
