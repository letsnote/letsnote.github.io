import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  menuItems: MenuItem[] = [];
  constructor() {}
  close() {
    console.debug('close');
    this.onClose.emit();
  }
  @Output('close')
  onClose: EventEmitter<void> = new EventEmitter();
  @Output('openKey')
  onOpenKey: EventEmitter<void> = new EventEmitter();
  ngOnInit(): void {
    this.menuItems = [
      {
        label: '설정',
        items: [
          {
            label: 'API키 입력',
            icon: 'pi pi-key',
            command: () => {
              this.onOpenKey.emit();
              console.debug('key');
            },
          },
        ],
      },
    ];
  }
}
