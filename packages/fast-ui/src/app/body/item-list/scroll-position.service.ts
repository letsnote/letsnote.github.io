import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemListScrollPositionService {

  constructor() { }

  private lastPosition: number = 0;
  private subject = new ReplaySubject(1);

  positionObservable = this.subject.asObservable();

  savePosition(scrollTop: number){
    this.lastPosition = scrollTop;
  }

  restorePosition(){
    this.subject.next(this.lastPosition);
  }

}
