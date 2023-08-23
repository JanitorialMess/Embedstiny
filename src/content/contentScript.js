import MediaFactory from "./mediaHandlers.js";
import { loadWidgets } from "./widgetScriptHandlers.js";
import { findHost } from "../utils/utils.js";

(async () => {
  function storeManagerAction(action, params) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "storeManagerAction", action, params },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error in storeManagerAction:",
              chrome.runtime.lastError,
            );
            reject(chrome.runtime.lastError);
          } else {
            resolve(response.result);
          }
        },
      );
    });
  }

  async function embedMedia(mediaContainer, mediaInfo) {
    mediaContainer.classList.add(`${mediaInfo.type}-container`);

    const mediaFactory = new MediaFactory();
    const media = mediaFactory.createMedia(mediaInfo, mediaContainer, settings);

    try {
      await media.embed();
      return true;
    } catch (error) {
      console.error(error);
      media.undoEmbed();
      return false;
    }
  }

  async function filterAndTransformLinks(links, messageText) {
    const transformedUrlsMap = new Map();
    const messageContent = Array.from(messageText.childNodes)
      .filter((e) => e.nodeType === Node.TEXT_NODE)
      .map((e) => e.textContent)
      .join("");

    for (const link of links) {
      const url = link.getAttribute("href");
      const hostInfo = findHost(url);

      if (!hostInfo) continue;

      const { host, match } = hostInfo;

      const isHostEnabled = await storeManagerAction("isHostEnabled", [
        host.id,
      ]);
      if (!isHostEnabled) continue;

      const nsfw =
        host.nsfw ||
        link.classList.contains("nsfw-link") ||
        /nsfw/i.test(messageContent);

      const nsfl =
        host.nsfl ||
        link.classList.contains("nsfl-link") ||
        /nsfl/i.test(messageContent);

      if (
        (nsfw && !settings.nsfwOptions.embedNsfw) ||
        (nsfl && !settings.nsflOptions.embedNsfl)
      ) {
        continue;
      }

      const transformedURL = await host.transform(match);
      if (!transformedURL) continue;

      // Hide link while it's being processed
      if (settings.generalOptions.hideLinks) link.style.display = "none";

      if (!transformedUrlsMap.has(transformedURL)) {
        transformedUrlsMap.set(transformedURL, {
          originalLinks: [link],
          host: host,
          nsfw: nsfw,
          nsfl: nsfl,
        });
      } else {
        transformedUrlsMap.get(transformedURL).originalLinks.push(link);
      }
    }

    return transformedUrlsMap;
  }

  function createMediaInfo(embedData, transformedURL) {
    const { host, nsfw, nsfl } = embedData;

    return {
      id: host.id,
      url: transformedURL,
      blur:
        (nsfl && settings.nsflOptions.blurNsfl) ||
        (nsfw && settings.nsfwOptions.blurNsfw),
      type: host.mediaType,
    };
  }

  async function embedTransformedUrls(transformedUrlsMap, messageText) {
    for (const [transformedURL, embedData] of transformedUrlsMap.entries()) {
      console.log(`Embedding ${transformedURL}`, embedData);
      const mediaContainer = document.createElement("div");
      mediaContainer.classList.add("embed-container");

      messageText.appendChild(mediaContainer);

      const mediaInfo = createMediaInfo(embedData, transformedURL);

      const success = await embedMedia(mediaContainer, mediaInfo);
      if (success) {
        embedData.originalLinks.forEach((originalLink) => {
          if (settings.generalOptions.hideLinks) originalLink.remove();
        });
        if (!chatPaused) scrollToBottom();
      } else {
        if (settings.generalOptions.hideLinks)
          embedData.originalLinks.forEach((originalLink) => {
            originalLink.style.display = "unset";
          });
      }
    }
  }

  async function processChatMessage(chatMessage) {
    const user = chatMessage.querySelector(".user");
    if (
      (user && user.classList.contains("bot")) ||
      "bot" === chatMessage.dataset.username
    ) {
      if (!settings.generalOptions.embedBots) {
        return;
      }
    }

    const text = chatMessage.querySelector(".text");
    if (!text) {
      return;
    }

    const externalLinks = text.querySelectorAll("a.externallink");
    const transformedUrlsMap = await filterAndTransformLinks(
      externalLinks,
      text,
    );
    await embedTransformedUrls(transformedUrlsMap, text);
    if (!chatPaused) {
      scrollToBottom();
    }
  }

  function scrollToBottom() {
    chatLines.scrollTop = chatLines.scrollHeight;
  }

  const mutationCallback = async function (mutationsList) {
    chatLines = document.querySelector(".chat-lines");
    chatScrollNotify = document.querySelector(".chat-scroll-notify");
    const chatOutput = document.querySelector(".chat-output");

    if (!chatOutput || !chatLines || !chatScrollNotify) return;

    chatScrollNotify.addEventListener("click", () => {
      chatPaused = false;
    });

    setInterval(() => {
      const chatScrollNotifyOpacity = window
        .getComputedStyle(chatScrollNotify)
        .getPropertyValue("opacity");
      chatPaused = chatScrollNotifyOpacity === "1";
    }, 1000);

    for (const mutation of mutationsList) {
      if (mutation.addedNodes.length > 0) {
        for (const addedNode of mutation.addedNodes) {
          if (!addedNode.className || !addedNode.className.includes("msg-chat"))
            continue;
          await processChatMessage(addedNode, chatLines);
        }
      }
    }

    if (settings.generalOptions.alwaysScroll) {
      scrollToBottom();
    }
  };

  let chatPaused = false;
  let chatLines, chatScrollNotify;
  let settings = await storeManagerAction("get", ["settings"]);
  loadWidgets();

  // Find which window our extension is running in
  window.addEventListener("message", (event) => {
    if (event.data.type === "WIDGET_SCRIPT_LOADED") {
      console.log(
        `Loaded ${event.data.scriptUrl} in ${document.location.href}`,
        window.twttr,
      );
    }
  });

  const observer = new MutationObserver(mutationCallback);
  observer.observe(document.body, { childList: true, subtree: true });

  chrome.storage.onChanged.addListener((changes) => {
    console.log("Settings changed:", changes.settings.newValue);
    if (changes.settings) settings = changes.settings.newValue;
  });
})();
