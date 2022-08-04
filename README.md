# LetsNote

LetsNote is a progressive web app for the user to make notes from text, url and web.
The project began to solve the synchronization issue in Edge Collection among the device (it has irritated me many times).
[Hypothesis](https://web.hypothes.is/) seemed to have the very useful extension and stable server which provides [Hypothesis API](https://h.readthedocs.io/en/latest/api/).

> The Hypothesis API enables you to create applications and services which read or write data from the Hypothesis service.

## Developement Plan

### First development plan has following funtionalities.
(Done)

- Integration with Hypothesis API.
- Better UX design than its parent extension of Hypothesis. It also refers to the design of Edge Collection.
- Chromium extension support
  - Fast creation of new note on the context menu.
  - Easy access to LetsNote on side panel in the browser.

### Second development plan has following funtionalities and minor works.
(In progress)

- Progressive Web App to support Mobile and Desktop.
    - Share Target to share something from other apps.
    - Easy deployment during development stage.
- Cleaning up dirty codes (Refactoring).
- Correct use of Hypothesis API.

## Setup

#### Install packages

```sh
npm i
```

#### Run on localhost (http://localhost:4200)
```sh
cd packages\fast-ui
npm run start
```

#### Run on localhost (http://localhost:4200)
(as Progressive Web App)
```sh
cd packages\fast-ui
npm run pwa
```

#### Build the chromium extension
```sh
cd packages\fast-ui
npm run build
cd packages\shell
npm run webpack
```

1\. Go to `edge://extensions/` <br>
2\. Click the button `"install the unpacked extension"`



