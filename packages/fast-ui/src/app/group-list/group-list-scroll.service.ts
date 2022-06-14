import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupListScrollService {

  private scrollSubject = new Subject<number>();
  scrollObservable = this.scrollSubject.asObservable();

  constructor() { }

  updateScroll(top: number){
    this.scrollSubject.next(top);
  }
}
