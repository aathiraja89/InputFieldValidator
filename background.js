var isActive1 = true;
chrome.runtime.onInstalled.addListener(function(details) {
    chrome.browserAction.onClicked.addListener(function(tab) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
            chrome.tabs.sendMessage(tab.id, {
                message: "toggle-tab",
                isActive: isActive1
            }, function(isActive) {
                isActive1 = !isActive1;
                setIcon(tab.id, isActive1);
            });
        });
    });
});

function setIcon(tabId, isActive) {
    const path = isActive ? "print_16x16.png" : "get_started128.png";
    chrome.browserAction.setIcon({
        path,
        tabId
    });
}