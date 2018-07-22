import { defaultOptions, restoreDefault } from "./defaults";
import { openNewsblur, requestUpdate } from "./newsblur";
import { initaliseAlarm } from "./alarms";

browser.browserAction.onClicked.addListener(openNewsblur);

browser.runtime.onInstalled.addListener(function() {
    restoreDefault().then(() => {
        requestUpdate();
        initaliseAlarm(defaultOptions.pollInterval);
    });
});

browser.runtime.onStartup.addListener(function() {
    requestUpdate();
    browser.storage.sync.get(["pollInterval"]).then(({ pollInterval }) => {
        initaliseAlarm(pollInterval);
    });
});

browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (
        changeInfo.status == "complete" &&
        tab.url &&
        tab.url.includes("newsblur.com")
    ) {
        requestUpdate();
    }
});
