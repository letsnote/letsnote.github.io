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
    chrome.runtime.onMessage.addListener((message) => {
        if (message == 'switch_off') {
            shell.hide();
        } else if (message == 'switch_on') {
            shell.show();
        }
    });

}
entrypoint();