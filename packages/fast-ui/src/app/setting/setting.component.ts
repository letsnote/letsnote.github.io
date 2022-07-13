import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { ConfigService } from './config.service';

@Component({
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss', '../style/list.scss']
})
export class SettingComponent implements OnInit, OnDestroy {
  keyControl = new FormControl();
  fontSizeControl = new FormControl();
  widthControl = new FormControl();
  formGroup = new FormGroup({
    key: this.keyControl,
    fontSize: this.fontSizeControl,
    width: this.widthControl,
  });
  subscriptions: Subscription[] = [];
  constructor(config: ConfigService, private appService: AppService,
    private route: ActivatedRoute) {
    this.keyControl.setValue(config.key);
    let s = this.keyControl.valueChanges.subscribe((value) => {
      config.key = value;
    });
    this.fontSizeControl.setValue(config.fontSize);
    let s2 = this.fontSizeControl.valueChanges.subscribe((value) => {
      config.fontSize = value;
    });
    this.widthControl.setValue(config.width);
    let s3 = this.widthControl.valueChanges.subscribe((value) => {
      config.width = value;
    });
    this.subscriptions.push(s);
    this.subscriptions.push(s2);
    this.subscriptions.push(s3);
  }

  ngOnInit(): void {

  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  async onKeyGetClick(event: MouseEvent) {
    event.preventDefault();
    const currentTab = await chrome.tabs.getCurrent();
    let tab: chrome.tabs.Tab;
    tab = await chrome.tabs.create({ index: currentTab.index + 1, url: 'https://hypothes.is/account/developer', active: true });
    // tab.id && this.appService.setInitialRoutesAfterNavigation(tab.id, this.route.snapshot.url.map(seg => seg.path), model.id, this.model?.length as number);
  }
}
