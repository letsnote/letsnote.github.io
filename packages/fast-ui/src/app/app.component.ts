///<reference types="chrome"/>

import { AfterViewInit, Component, ElementRef, OnChanges, ViewChild } from '@angular/core';
import { createGroup } from 'hypothesis-data';
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

  @ViewChild("outer")
  outerElementRef: ElementRef | undefined;

  constructor(private config: ConfigService) {
    if (window) {
      window.onmessage = (e) => {
        this.got = 'got got'
      };
    }
  }

  ngAfterViewInit(): void {
    this.config.fontSizeObservable.subscribe((pxSize) => {
      if(this.outerElementRef){
        let outer = (this.outerElementRef.nativeElement as HTMLDivElement);
        if(document.body.parentElement)
          document.body.parentElement.style.fontSize = `${pxSize}px`;
      }
    });

    this.config.widthObservable.subscribe((emSize) => {
        const msg = {type: 2, size: emSize};
        window?.top?.postMessage(JSON.stringify(msg), '*');
    });
  }

  onClose() {
    const msg = {type: 3};
    window?.top?.postMessage(JSON.stringify(msg), '*');
  }
}
