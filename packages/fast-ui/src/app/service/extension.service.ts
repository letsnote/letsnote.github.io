import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExtensionService {

  constructor() { }
  
  isExtension(){
    return location.href.includes("chrome-extension");
  }
}
