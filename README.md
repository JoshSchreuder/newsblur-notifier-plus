# Newsblur Notifier Plus

Shows the unread count from your NewsBlur account.

Available from the [Chrome Web Store](https://chrome.google.com/webstore/detail/nbmlfepgaaalffdmmjhpkgpjjlnpjjlp).

Based on the [Newsblur Notifier](https://chrome.google.com/webstore/detail/newsblur-notifier/nnbhbdncokmmjheldobdfbmfpamelojh) extension by totaldeadbeat which is sadly no longer functioning in new versions of Chrome.

# Development stuff

## Install

    $ yarn install

## Development

    yarn dev chrome
    yarn dev firefox
    yarn dev opera
    yarn dev edge

## Build

    yarn build chrome
    yarn build firefox
    yarn build opera
    yarn build edge

## Environment

The build tool also defines a variable named `process.env.NODE_ENV` in your scripts.

## Docs

-   [webextension-toolbox](https://github.com/HaNdTriX/webextension-toolbox)
