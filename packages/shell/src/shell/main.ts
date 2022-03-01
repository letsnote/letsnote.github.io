import { Action } from "../common/action";
import { Message } from "../common/message";
import { ShellElement } from "./shell";

async function entrypoint() {
    // await loadFontOnDocument(document);
    const shell = new ShellElement();
    document.body.appendChild(shell);
    shell.hide();
    
    window.onmessage = function (e) {
        if (e.data == 'hello') {
            console.debug('It works!');
            shell.sendMessage('from parent');
        }
    };

    chrome.runtime.onMessage.addListener((message: Message) => {
        if (message.type == Action.TOGGLE_CLICKED) {
            if(shell.isShown())
                shell.hide();
            else
                shell.show();
        }
    });
}

// async function loadFontOnDocument(document: Document) {
//     // if (!document.querySelector(`#${this.sysInfo.contentScriptTemporaryId}`)) {
//         let css = extractFontFace(cssTransformer(require('primeflex/primeflex.css')));
//         let style = document.createElement("style");
//         style.classList.add("primeflex/primeflex.css");
//         style.innerHTML = css as string;
//         // style.id = this.sysInfo.contentScriptTemporaryId;
//         document.body.appendChild(style);
//         let css1 = extractFontFace(cssTransformer(require('primeicons/primeicons.css')));
//         let style1 = document.createElement("style");
//         style1.classList.add("primeicons/primeicons.css");
//         style1.innerHTML = css1 as string;
//         // style1.id = this.sysInfo.contentScriptTemporaryId;
//         document.body.appendChild(style1);
//     // }
// }

entrypoint();

export const extensionId = chrome.i18n.getMessage("@@extension_id");

export function cssTransformer(styleString: string){
    return styleString
    .replace(/url\(("?)\.\.\/webfonts\//g, `url($1chrome-extension://${extensionId}/fonts/`)
    .replace(/url\(("?)fonts\//g, `url($1chrome-extension://${extensionId}/fonts/`)
    .replace(/:root/g, "div:first-of-type")
    .replace(/\r\n/g, '').replace(/\n/g,'');
}

export function extractFontFace(styleString: string){
    return styleString.match(/(@font-face(\s|\t)*\{[^}]*\})/g)?.join(" ");
    // .replace(/(@font-face\s*\{.*\})|./g, '$1');
}