import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExtensionService {

  constructor() { 
    // if(this.isExtension())
    //   this.blocking();
  }

  isExtension() {
    return location.href.includes("chrome-extension");
  }

  removeInitialRoutes(tabId: number) {
    const item = localStorage.getItem(`${tabId}`);
    if (item) {
      try {
        const object: { routes: string[], date: Date, fragment: string, listLength: number } = JSON.parse(item);
        if ((Math.abs(new Date(object.date).getTime() - Date.now()) / 1000) <= 30) // less than 30 seconds
          return object;
      } finally {
        localStorage.removeItem(`${tabId}`);
      }
    }
    return undefined;
  }

  setInitialRoutesAfterNavigation(tabId: number, routes: string[], fragment: string, listLength: number) {
    localStorage.setItem(`${tabId}`, JSON.stringify({ routes, date: new Date(), fragment, listLength }));
  }

  // blocking() {
  //   chrome.webRequest.onBeforeRequest.addListener(details => {
  //     const prefixUri = "chrome-extension://" + chrome.runtime.id + "/";
  //     if (details.url.startsWith(prefixUri) && !details.url.endsWith("index.html")) {
  //       let newUrl = `${prefixUri}/index.html/${details.url.substr(prefixUri.length)}`;
  //       // prefixUri + "index.html" + details.url.substr(prefixUri.length);
  //       return { redirectUrl: newUrl };
  //     }
  //     return {};
  //   },
  //     { urls: ["chrome-extension://" + chrome.runtime.id + "/*"] },
  //     ["blocking"]
  //   );
  // }
}
