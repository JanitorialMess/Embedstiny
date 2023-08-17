<h1 align="center">
  <sub>
    <img src="./store_assets/embedstiny.svg" height="38" width="38" alt="Embedstiny Icon">
  </sub>
  Embedstiny
</h1>

<p>
Embedstiny is a browser extension that allows you to embed links in DGG chat. It works with both Firefox and Chrome browsers.
</p>

<p align="center">
  <a href="https://addons.mozilla.org/en-US/firefox/addon/embedstiny/">
  <img src="https://img.shields.io/amo/v/embedstiny?label=Download%20Firefox&logo=Firefox-Browser&style=for-the-badge" alt="Get Embedstiny for Firefox"></a>
  <br>
  <a href="https://github.com/JanitorialMess/Embedstiny/releases/latest"><img src="https://img.shields.io/github/downloads/JanitorialMess/Embedstiny/latest/embedstiny-0.3.0.chromium.zip?style=for-the-badge&logo=GoogleChrome&label=DOWNLOAD%20CHROMIUM&color=blue" alt="Get Embedstiny for Chrome"></a>
 <p align="center"><b>⚠️ Fair warning </b> for Chromium users, the extension will not auto-update. Please check the repo for updates regularly while I am working on a solution
</p>
</p>

## Features

- Embeds links in DGG chat on the `destiny.gg/embed/chat` and `destiny.gg/bigscreen` pages.
- Allows you to disable embeds for specific domains and types of content.
- Allows you to blur sensitive content.
- Supports YouTube, Twitter, Spotify, Imgur, Streamable, and more.
- Partially compatible with [DGG Chat Everywhere](https://github.com/DannyAlas/DGG-Everywhere)

## Previews

### Options

<p align="center">
  <img src="./store_assets/options.png" alt="Preview of Options page">
</p>

### Chat Embeds

<p align="center">
  <img src="./store_assets/chat.png" alt="Preview of Chat">
</p>

## Installation

### Firefox

Embedstiny is available on the Firefox Add-ons store. Simply click the link below to install it.

<p>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/embedstiny/" target="_blank">
  <img src="https://img.shields.io/amo/v/embedstiny?label=Download%20Firefox&logo=Firefox-Browser&style=for-the-badge" alt="Get Embedstiny for Firefox"></a>
</p>

### Chrome

Due to manifest v3 restrictions, Embedstiny is not available on the Chrome Web Store. I am working on a solution, but in the meantime, you can sideload the extension by following the instructions below.

<p>
  <a href="https://github.com/JanitorialMess/Embedstiny/releases/latest" target="_blank"><img src="https://img.shields.io/github/downloads/JanitorialMess/Embedstiny/latest/embedstiny-0.3.0.chromium.zip?style=for-the-badge&logo=GoogleChrome&label=DOWNLOAD%20CHROMIUM&color=blue" alt="Get Embedstiny for Chrome"></a>
</p>

1. [Download latest release](https://github.com/JanitorialMess/Embedstiny/releases/latest) and unzip the archive.
2. Open Chrome and go to the Extensions page by clicking the menu button (three vertical dots) in the top-right corner, then selecting "More tools" > "Extensions". Alternatively, you can type `chrome://extensions` in the address bar and press Enter.
3. Enable the "Developer mode" toggle in the top-right corner of the Extensions page.
4. Click the "Load unpacked" button and select the unzipped extension folder to install the extension.

## Permissions required

- `storage` - Required to store user preferences.
- `https://*.destiny.gg/*` - Required to access the DGG chat page.
- `https://*.reddit.com/*` - Required to resolve short and embed Reddit links.
- `https://redd.it/*` - Required to resolve short and embed Reddit links.
- `https://bunkrr.su/*` - Required to resolve and embed Bunkrr links.
- `webRequest` | `webRequestBlocking` - Required to slightly relax the Content Security Policy (CSP) of [destiny.gg](destiny.gg) to allow embedding of certain links (e.g. Twitter).

## Support

If you have any questions or need assistance, please open a new issue [here](https://github.com/JanitorialMess/Embedstiny/issues/new).

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z8Z2NV2H6)
