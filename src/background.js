import StoreManager from "./utils/storeManager.js";

(async () => {
  const repoOwner = "JanitorialMess";
  const repoName = "Embedstiny";
  const storeManager = StoreManager.createProxy();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(
      `Received message from ${
        sender.tab ? "a content script" : "the extension"
      }`,
    );
    if (request.type === "storeManagerAction") {
      const { action, params } = request;
      console.log("storeManagerAction", action, params);
      storeManager[action](...params).then((result) => {
        sendResponse({ success: true, result });
      });
      return true;
    }
    if (request.type === "requestAction") {
      fetch(request.url, request.options)
        .then((response) => {
          const responseProperty = request.responseProperty || "text";
          switch (responseProperty) {
            case "url":
              return response.url;
            case "json":
              return response.json();
            default:
              return response.text();
          }
        })
        .then((result) => sendResponse({ result }))
        .catch((error) => sendResponse({ error: error.message }));
      return true; // Required for async sendResponse
    }
  });

  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "update" || details.reason === "install") {
      chrome.tabs.create({
        url: chrome.runtime.getURL("shared/changelog/changelog.html"),
      });
    }
  });

  function updateVersionInfo() {
    fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`,
    )
      .then((response) => response.json())
      .then(async (data) => {
        let latestVersion = data.tag_name;
        if (latestVersion.startsWith("v")) {
          latestVersion = latestVersion.slice(1);
        }
        await storeManager.updateSettings({ latestVersion });
      })
      .catch((error) => {
        console.error("Error fetching latest version:", error);
      });
  }

  function isCSPHeader(headerName) {
    return (
      headerName === "CONTENT-SECURITY-POLICY" ||
      headerName === "X-WEBKIT-CSP" ||
      headerName === "X-CONTENT-SECURITY-POLICY"
    );
  }

  class CspParser {
    constructor(cspString) {
      this.directives = this.parseCspString(cspString);
    }

    parseCspString(cspString) {
      const directives = {};
      const parts = cspString.split(";").map((part) => part.trim());

      parts.forEach((part) => {
        const [directive, ...values] = part.split(/\s+/);
        directives[directive] = new Set(values);
      });

      return directives;
    }

    addDirectiveValue(directive, value) {
      if (!this.directives[directive]) {
        this.directives[directive] = new Set();
      }

      const wildcardMatch = value.match(/(https?:\/\/\*)/);
      if (wildcardMatch) {
        const baseDomain = value.replace(wildcardMatch[1], "");
        const regex = new RegExp(
          // eslint-disable-next-line no-useless-escape
          `^https?:\/\/[^/]*${baseDomain.replace(".", "\\.")}`,
        );
        for (const existingValue of this.directives[directive]) {
          if (regex.test(existingValue)) {
            return;
          }
        }
      }

      this.directives[directive].add(value);
    }

    removeDirectiveValue(directive, value) {
      if (this.directives[directive]) {
        this.directives[directive].delete(value);
      }
    }

    updateDirectiveValues(directive, values) {
      this.directives[directive] = new Set(values);
    }

    toString() {
      const cspString = Object.entries(this.directives)
        .map(
          ([directive, values]) =>
            `${directive} ${Array.from(values).join(" ")}`,
        )
        .join("; ");

      return cspString;
    }
  }

  chrome.webRequest.onHeadersReceived.addListener(
    (details) => {
      for (let i = 0; i < details.responseHeaders.length; i += 1) {
        if (isCSPHeader(details.responseHeaders[i].name.toUpperCase())) {
          const originalCsp = details.responseHeaders[i].value;
          const cspParser = new CspParser(originalCsp);

          cspParser.addDirectiveValue("default-src", "*");
          cspParser.addDirectiveValue("default-src", "data:");
          cspParser.addDirectiveValue("default-src", "blob:");
          cspParser.addDirectiveValue("script-src", "'self'");
          cspParser.addDirectiveValue("script-src", "'unsafe-inline'");
          cspParser.addDirectiveValue("script-src", "*.youtube.com");
          cspParser.addDirectiveValue("script-src", "*.twimg.com");
          cspParser.addDirectiveValue("script-src", "*.twitter.com");
          cspParser.addDirectiveValue("script-src", "*.imgur.com");
          cspParser.addDirectiveValue("script-src", "embed-cdn.spotifycdn.com");
          cspParser.addDirectiveValue("frame-src", "*.kick.com");
          cspParser.addDirectiveValue("frame-src", "*.twitter.com");

          cspParser.addDirectiveValue("frame-src", "https://imgur.com/");
          cspParser.addDirectiveValue("frame-src", "*.imgur.com");

          cspParser.addDirectiveValue("frame-src", "*.spotify.com");
          // FIXME:  https://www.youtube.com/s/player/4eae42b1/www-widgetapi.vflset/www-widgetapi.js (“script-src”).
          cspParser.addDirectiveValue("frame-src", "*.youtube.com");
          cspParser.addDirectiveValue("frame-src", "*.twitch.tv");

          cspParser.addDirectiveValue("frame-src", "https://streamable.com/");
          cspParser.addDirectiveValue("frame-src", "*.streamable.com");

          cspParser.addDirectiveValue("frame-src", "https://strawpoll.com/");
          cspParser.addDirectiveValue("frame-src", "*.strawpoll.com");

          cspParser.addDirectiveValue("frame-src", "https://vocaroo.com");
          cspParser.addDirectiveValue("frame-src", "*.vocaroo.com");
          cspParser.addDirectiveValue("frame-src", "*.reddit.com");

          cspParser.updateDirectiveValues("img-src", ["*", "data:"]);
          cspParser.updateDirectiveValues("media-src", ["*", "data:"]);

          const modifiedCsp = cspParser.toString();
          details.responseHeaders[i].value = modifiedCsp;
        }
      }
      return {
        responseHeaders: details.responseHeaders,
      };
    },
    {
      urls: [
        "https://*.destiny.gg/embed/chat*",
        "https://www.destiny.gg/embed/chat",
      ],
      types: ["main_frame", "sub_frame"],
    },
    ["blocking", "responseHeaders"],
  );

  updateVersionInfo();

  const updateInterval = 4 * 60 * 60 * 1000;
  setInterval(updateVersionInfo, updateInterval);
})();
