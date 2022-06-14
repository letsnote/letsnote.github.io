import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor() { }
  
  private renameSubject = new Subject<{groupId: string, oldValue: string, newValue?: string}>();
  renameObservable = this.renameSubject.asObservable();

  requestToRenameGroup(groupId: string, oldValue: string, newValue?: string){
    this.renameSubject.next({groupId, oldValue, newValue});
  }

}
