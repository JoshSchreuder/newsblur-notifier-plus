import { requestUpdate } from "./newsblur";

const ALARM_NAME = "newsblur.notifier.plus";

const initaliseAlarm = interval => {
    browser.alarms.clear(ALARM_NAME).then(exists => {
        console.log(`Alarm exists: ${exists}`);
        browser.alarms.create(ALARM_NAME, { periodInMinutes: interval });

        nextRunTime().then(next => {
            browser.browserAction.setTitle({
                title: `Next update: ${next}`
            });
        });

        console.log(`Alarm created, running every ${interval} minutes`);
        browser.alarms.onAlarm.addListener(alarm => {
            console.log(`Alarm fired, running update.`);
            console.log(alarm);
            requestUpdate(alarm);
        });
    });
};

const nextRunTime = () => {
    return browser.alarms.get(ALARM_NAME).then(alarm => {
        return alarm
            ? new Date(alarm.scheduledTime).toLocaleTimeString()
            : null;
    });
};

export { initaliseAlarm, nextRunTime };
