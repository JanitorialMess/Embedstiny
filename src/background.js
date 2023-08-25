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
      if (
        this.directives[directive] &&
        (this.directives[directive].has("none") ||
          this.directives[directive].has("self")) &&
        value !== "none" &&
        value !== "self"
      ) {
        throw new Error(
          `Unable to add the value '${value}' to the directive '${directive}'. The current directive is already restricted to either 'none' or 'self'.`,
        );
      }
      if (!this.directives[directive]) {
        this.directives[directive] = new Set();
      }

      if (this.directives[directive].has(value)) {
        return;
      }

      this.directives[directive].add(value);
    }

    addDirectiveValues(directive, values) {
      values.forEach((value) => {
        this.addDirectiveValue(directive, value);
      });
    }

    removeDirectiveValue(directive, value) {
      if (this.directives[directive]) {
        this.directives[directive].delete(value);
      }
    }

    updateDirectiveValues(directive, values) {
      if (
        this.directives[directive] &&
        (this.directives[directive].has("none") ||
          this.directives[directive].has("self")) &&
        !values.includes("none") &&
        !values.includes("self")
      ) {
        throw new Error(
          `Unable to update the directive '${directive}' with the values '${values.join(
            ", ",
          )}'. The current directive is already restricted to either 'none' or 'self'.`,
        );
      }
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

          cspParser.addDirectiveValues("script-src", [
            "'self'",
            "'unsafe-inline'",
            "*.youtube.com",
            "*.twimg.com",
            "*.twitter.com",
            "*.imgur.com",
            "embed-cdn.spotifycdn.com",
          ]);
          cspParser.addDirectiveValues("frame-src", [
            "*.kick.com",
            "*.twitter.com",
            "*.imgur.com",
            "*.spotify.com",
            "*.youtube.com",
            "*.twitch.tv",
            "*.streamable.com",
            "*.strawpoll.com",
            "*.vocaroo.com",
            "*.reddit.com",
            "https://imgur.com",
            "https://vocaroo.com/",
            "https://strawpoll.com/",
          ]);

          cspParser.updateDirectiveValues("img-src", ["*", "data:", "blob:"]);
          cspParser.updateDirectiveValues("media-src", ["*", "data:", "blob:"]);

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
