import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompService } from '../service/comp.service';
import { ExtensionService } from '../service/extension/extension.service';
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

  constructor(config: ConfigService, public compService: CompService) {
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
}
