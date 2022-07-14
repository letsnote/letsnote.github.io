import { Injectable } from '@angular/core';
import { getProfile } from 'hypothesis-data';
import { ConfigService } from '../setting/config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private config: ConfigService) {
    this.config.keyObservable.subscribe((key) => {
      this._updateProfile();
    });
  }

  private _profile: _Types.ProfileResponse.RootObject | undefined;

  get profile() {
    if(this._profile)
      return {...this._profile};
    else
      return undefined;
  }

  get isSignin(){
    return this._profile?.userid !== undefined;
  }

  get key(){
    return this.config.key;
  }

  update(){
    this._updateProfile();
  }

  private async _updateProfile() {
    const profile = await getProfile(this.config.key);
    this._profile = profile;
    return profile;
  }
}
