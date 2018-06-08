const defaultOptions = {
    pollinterval: 5,
    ignoreNegative: false,
    highlightPositive: true,
    useSsl: true
};

const restoreDefault = () => {
    return browser.storage.sync.set(defaultOptions);
};

export { defaultOptions, restoreDefault };
