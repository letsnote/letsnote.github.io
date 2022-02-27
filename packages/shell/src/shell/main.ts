import { Action } from "../common/action";
import { Message } from "../common/message";
import { ShellElement } from "./shell";

function entrypoint() {
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
entrypoint();