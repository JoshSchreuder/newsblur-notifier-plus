import { defaultOptions, restoreDefault } from "./defaults";

const save_options = () => {
    const pollInterval = document.getElementById("pollInterval")
        .selectedOptions[0].value;
    const ignoreNegative = document.getElementById("ignoreNegative").checked;
    const highlightPositive = document.getElementById("highlightPositive")
        .checked;
    const useSsl = document.getElementById("useSsl").checked;

    browser.storage.sync
        .set({
            pollinterval: pollInterval,
            ignoreNegative: ignoreNegative,
            highlightPositive: highlightPositive,
            useSsl: useSsl
        })
        .then(() => {
            location.reload();
        });

    browser.alarms.get("newsblur.notifier").then(alarm => {
        alarm.periodInMinutes = Number(pollInterval);
    });
};

const init = () => {
    browser.storage.sync.get(defaultOptions).then(items => {
        document.getElementById("pollInterval").value = items.pollinterval;
        document.getElementById("ignoreNegative").checked =
            items.ignoreNegative;
        document.getElementById("highlightPositive").checked =
            items.highlightPositive;
        document.getElementById("useSsl").checked = items.useSsl;
    });

    document.getElementById("save").addEventListener("click", save_options);
    document.getElementById("default").addEventListener("click", () => {
        restoreDefault().then(() => location.reload());
    });
};

document.addEventListener("DOMContentLoaded", init);
