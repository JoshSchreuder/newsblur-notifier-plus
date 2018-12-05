import { defaultOptions } from "./defaults";
import { nextRunTime } from "./alarms";

let baseUrl = "";
let ignoreNegativeOpt = defaultOptions.ignoreNegative;
let highlightPositiveOpt = defaultOptions.highlightPositive;

const COLOURS = {
    GREEN: [0, 153, 51, 255],
    RED: [205, 0, 0, 255]
};

const requestUpdate = () => {
    getSettings().then(() => {
        fetch(`${baseUrl}/reader/refresh_feeds`, {
            credentials: "include"
        })
            .then(response => {
                response.json().then(data => {
                    if (data.result === "ok") {
                        if (data.authenticated !== true) {
                            notLoggedIn();
                        } else {
                            fetchFeeds(processResponse);
                        }
                    } else {
                        updateFailed(data.result);
                    }
                });
            })
            .catch(err => {
                err.json().then(data => {
                    updateFailed(data.result);
                });
            });
    });
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
    fetch(`${baseUrl}/reader/feeds`, { credentials: "include" })
        .then(response => {
            response.json().then(callback);
        })
        .catch(() => {
            callback({ feeds: {} });
        });
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

const processResponse = ({ feeds }) => {
    let unread = Object.values(feeds)
        .filter(e => e.active)
        .reduce(
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

    nextRunTime().then(nextDate => {
        browser.browserAction.setTitle({
            title: `Last updated: ${new Date().toLocaleTimeString()}\nNext update: ${nextDate}`
        });
    });
};

const openNewsblur = () => {
    getSettings().then(() => {
        browser.tabs.create({ url: baseUrl });
    });
};

export { openNewsblur, requestUpdate };
