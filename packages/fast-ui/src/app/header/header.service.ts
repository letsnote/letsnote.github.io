import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  constructor() { }
  
  readonly searchInputControl = new FormControl();
  lastGroupSearchKeyword = '';

  private renameGroupRequestedSubject = new Subject<{groupId: string, oldValue: string, newValue?: string}>();
  renameGroupRequestedObservable = this.renameGroupRequestedSubject.asObservable();

  requestToRenameGroup(groupId: string, oldValue: string, newValue?: string){
    this.renameGroupRequestedSubject.next({groupId, oldValue, newValue});
  }

  private groupNameUpdatedSubject = new Subject<{groupId: string, newName: string}>();
  readonly groupNameUpdatedObservable = this.groupNameUpdatedSubject.asObservable();

  pushGroupNameUpdate(groupId: string, newName: string){
    this.groupNameUpdatedSubject.next({groupId, newName});
  }
}
