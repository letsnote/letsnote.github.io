import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ConfigService } from './config.service';

@Component({
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss', '../style/list.scss']
})
export class SettingComponent implements OnInit, OnDestroy {
  keyControl = new FormControl();
  subscriptions: Subscription[] = [];
  constructor(private config: ConfigService) {
    this.keyControl.setValue(config.key);
    let s = this.keyControl.valueChanges.subscribe((value) => {
      config.key = value;
    });
    this.subscriptions.push(s);
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
