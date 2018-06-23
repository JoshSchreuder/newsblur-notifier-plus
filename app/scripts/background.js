import { defaultOptions, restoreDefault } from "./defaults";

let baseUrl = "";
let ignoreNegativeOpt = defaultOptions.ignoreNegative;
let highlightPositiveOpt = defaultOptions.highlightPositive;

const COLOURS = {
    GREEN: [0, 153, 51, 255],
    RED: [205, 0, 0, 255]
};

const getSettings = () => {
    return browser.storage.sync
        .get(["useSsl", "ignoreNegative", "highlightPositive"])
        .then(({ useSsl, ignoreNegative, highlightPositive }) => {
            baseUrl = `http${
                useSsl || defaultOptions.useSsl ? "s" : ""
            }://www.newsblur.com`;
            ignoreNegativeOpt = ignoreNegative;
            highlightPositiveOpt = highlightPositive;
        });
};

const fetchFeeds = callback => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(data) {
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback(JSON.parse(xhr.responseText));
        } else {
            callback({ feeds: {} });
        }
    };
    xhr.open("GET", `${baseUrl}/reader/feeds`, true);
    xhr.send();
};

const error = () => {
    browser.browserAction.setBadgeText({ text: "Error" });
};

const notLoggedIn = () => {
    error();
    browser.browserAction.setTitle({ title: `Please login to Newsblur.` });
};

const updateFailed = result => {
    error();
    browser.browserAction.setTitle({
        title: `Update failed! ${result}`
    });
};

const requestUpdate = alarm => {
    getSettings().then(() => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function(data) {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let data = JSON.parse(xhr.responseText);
                    if (data.result === "ok") {
                        if (data.authenticated !== true) {
                            notLoggedIn();
                        } else {
                            fetchFeeds(processResponse);
                        }
                    } else {
                        updateFailed(data.result);
                    }
                } else {
                    updateFailed(xhr.responseText);
                }
            }
        };
        xhr.open("GET", `${baseUrl}/reader/refresh_feeds`, true);
        xhr.send();
    });
};

const processResponse = ({ feeds }) => {
    let unread = Object.values(feeds).reduce(
        (prev, curr) => {
            return {
                positive: prev.positive + curr.ps,
                neutral: prev.neutral + curr.nt,
                negative: prev.negative + curr.ng,
                total:
                    prev.total +
                    curr.ps +
                    curr.nt +
                    (ignoreNegativeOpt ? 0 : curr.ng)
            };
        },
        {
            positive: 0,
            neutral: 0,
            negative: 0,
            total: 0
        }
    );

    if (unread.total > 0) {
        if (highlightPositiveOpt && unread.positive > 0) {
            browser.browserAction.setBadgeBackgroundColor({
                color: COLOURS.GREEN
            });
        }

        browser.browserAction.setBadgeText({
            text: String(unread.total)
        });
    } else {
        browser.browserAction.setBadgeText({ text: "" });
    }

    browser.browserAction.setTitle({
        title: `Last updated: ${new Date().toLocaleTimeString()}`
    });
};

const openNewsblur = () => {
    getSettings().then(() => {
        browser.tabs.create({ url: baseUrl });
    });
};

browser.browserAction.onClicked.addListener(openNewsblur);

browser.runtime.onInstalled.addListener(function() {
    restoreDefault().then(() => {
        browser.alarms.create("newsblur.notifier", { periodInMinutes: 5 });
        browser.alarms.onAlarm.addListener(requestUpdate);
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
