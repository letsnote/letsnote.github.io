
let toggleSwitch = false;
export function entrypoint() {
    chrome.runtime.onInstalled.addListener(() => {
        chrome.action.onClicked.addListener((tab) => {
            if (tab?.id) {
                toggleSwitch = !toggleSwitch
                if (toggleSwitch) {
                    chrome.action.setBadgeBackgroundColor(
                        { color: '#9aa0a6' }
                    )
                } else {
                    chrome.action.setBadgeBackgroundColor(
                        { color: '#ffffff' }
                    )
                }
                chrome.tabs.sendMessage(tab.id, toggleSwitch ? 'switch_on' : 'switch_off');

            }
        });
    });
}
entrypoint();