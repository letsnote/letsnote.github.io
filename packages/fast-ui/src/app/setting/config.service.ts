import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly keyName = 'api_key';
  private _key: string = '';

  set key(_key: string) {
    this._key = _key;
    localStorage.setItem(this.keyName, _key);
  }

  get key() {
    return this._key ?? '';
  }

  constructor() {
    this._key = localStorage.getItem(this.keyName) ?? "";
  }



}
