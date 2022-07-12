import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupListScrollService {
  key = 'group-list-scroll';

  private scrollSubject = new ReplaySubject<number>(1);
  scrollObservable = this.scrollSubject.asObservable();

  constructor() {
    let item = localStorage.getItem(this.key);
    if(item)
      this.updateScroll(parseInt(item));
  }

  updateScroll(top: number){
    this.scrollSubject.next(top);
    localStorage.setItem(this.key, `${top}`);
  }
}
