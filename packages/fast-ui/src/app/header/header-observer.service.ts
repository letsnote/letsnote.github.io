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
  
  readonly searchInputControl = new FormControl();

  pushNewNote(row: _Types.AnnotationsResponse.Row){
    this.newNoteSubject.next(row);
  }
}
