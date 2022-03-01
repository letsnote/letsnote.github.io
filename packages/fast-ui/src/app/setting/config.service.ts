import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly keyName = 'api_key';
  private readonly widthKeyName = 'width_key';
  private readonly fontSizeKeyName = 'font_size_key';
  private _key: string = '';
  private _width: number = 40; //em
  private _fontSize: number = 14; //px
  private widthSubject = new ReplaySubject<number>(1);
  private fontSizeSubject = new ReplaySubject<number>(1);

  set key(_key: string) {
    this._key = _key;
    localStorage.setItem(this.keyName, _key);
  }

  get key() {
    return this._key ?? '';
  }

  set width(_width: number) {
    this._width = _width;
    this.widthSubject.next(_width);
    localStorage.setItem(this.widthKeyName, `${_width}`);
  }

  get width() {
    return this._width ?? '';
  }

  widthObservable = this.widthSubject.asObservable();

  set fontSize(_fontSize: number) {
    this._fontSize = _fontSize;
    this.fontSizeSubject.next(_fontSize);
    localStorage.setItem(this.fontSizeKeyName, `${_fontSize}`);
  }

  get fontSize() {
    return this._fontSize ?? '';
  }

  fontSizeObservable = this.fontSizeSubject.asObservable();

  constructor() {
    this.key = localStorage.getItem(this.keyName) ?? '';
    this.fontSize = parseInt(
      `${localStorage.getItem(this.fontSizeKeyName) ?? this._fontSize}`
    );
    this.width = parseInt(
      `${localStorage.getItem(this.widthKeyName) ?? this._width}`
    );
  }
}
