import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderObserverService {

  constructor() { }

  private newNoteSubject = new Subject<_Types.AnnotationsResponse.Row>();
  readonly newNoteObserverble = this.newNoteSubject.asObservable();
  
  private groupRenameUpdatedSubject = new Subject<{groupId: string, newName: string}>();
  readonly groupRenameUpdatedObservable = this.groupRenameUpdatedSubject.asObservable();

  readonly searchInputControl = new FormControl();

  pushNewNote(row: _Types.AnnotationsResponse.Row){
    this.newNoteSubject.next(row);
  }

  pushGroupNameUpdate(groupId: string, newName: string){
    this.groupRenameUpdatedSubject.next({groupId, newName});
  }
}
