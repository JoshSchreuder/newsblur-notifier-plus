import { defaultOptions, restoreDefault } from "./defaults";
import { initaliseAlarm } from "./alarms";

const save_options = () => {
    const pollInterval = document.getElementById("pollInterval")
        .selectedOptions[0].value;
    const ignoreNegative = document.getElementById("ignoreNegative").checked;
    const highlightPositive = document.getElementById("highlightPositive")
        .checked;
    const useSsl = document.getElementById("useSsl").checked;

    browser.storage.sync
        .set({
            pollInterval: pollInterval,
            ignoreNegative: ignoreNegative,
            highlightPositive: highlightPositive,
            useSsl: useSsl
        })
        .then(() => {
            location.reload();
        });

    initaliseAlarm(Number(pollInterval));
};

const init = () => {
    browser.storage.sync.get(defaultOptions).then(items => {
        document.getElementById("pollInterval").value = items.pollInterval;
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
