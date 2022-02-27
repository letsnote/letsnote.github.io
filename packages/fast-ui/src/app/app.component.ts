///<reference types="chrome"/>

import { Component } from '@angular/core';
import { GroupListModel } from './group-list/group-list.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'fast-ui';
  got = 'aaa';
  constructor() {
    if (window) {
      window.onmessage = (e) => {
        this.got = 'got got'
      };
    }
  }

  close() {
    window?.top?.postMessage('hello', '*');
  }

  groupListModel: GroupListModel = {
    groups: [
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
      {title:'title', itemCount: 4},
  ]
  }
}
