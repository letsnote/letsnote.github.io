import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class GroupComponent implements OnInit {
  @Input()
  model: GroupModel | undefined;

  @ViewChild("outer")
  box: ElementRef | undefined;

  @Output("groupClick")
  clickEmitter = new EventEmitter();
  @Output("groupDeleteClick")
  groupDeleteEmitter = new EventEmitter();
  constructor(private hostElementRef: ElementRef, private confirmationService: ConfirmationService) { }

  ngOnInit(): void {
  }

  @HostListener('click', ['$event'])
  onClick() {
    if (this.model) {
      this.clickEmitter.emit(this.model);
    }
  }

  contextMenuItems: MenuItem[] = [
    {
      label: '그룹삭제',
      command: (event) => {this.onGroupDeleteClick(event)}
    }];
    
  onGroupDeleteClick(event: any) {
    const hostElement = this.hostElementRef?.nativeElement;
    if (!hostElement)
      return;
    (event.originalEvent as Event).stopPropagation();
    this.confirmationService.confirm({
      target: hostElement,
      message: '정말로 삭제하시겠습니까?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.groupDeleteEmitter.emit(this.model);
      },
      reject: () => {
        //reject action
      }
    });
  }
}

export interface GroupModel extends _Types.GroupsResponse.RootObject {
  itemCount?: number;
};