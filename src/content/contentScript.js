import {
  createImage,
  createImgurCollection,
  createSpotifyMedia,
  createSteamEmbed,
  createTweet,
  createVideo,
  createVideoIframe,
  createGenericIframe,
  createYouTubeVideo,
  createBunkrrMedia,
  createRedditPost,
} from "./mediaHandlers.js";
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

  function embedMedia(mediaContainer, mediaInfo, onEmbedCallback) {
    mediaContainer.classList.add(`${mediaInfo.type}-container`);

    const mediaHandlers = {
      image: () =>
        createImage(mediaInfo, mediaContainer, settings, onEmbedCallback),
      video: () =>
        createVideo(mediaInfo, mediaContainer, settings, onEmbedCallback),
      videoIframe: () =>
        createVideoIframe(mediaInfo, mediaContainer, onEmbedCallback),
      genericIframe: () =>
        createGenericIframe(mediaInfo, mediaContainer, onEmbedCallback),
      tweet: () => createTweet(mediaInfo, mediaContainer, onEmbedCallback),
      imgurCollection: () =>
        createImgurCollection(mediaInfo, mediaContainer, onEmbedCallback),
      spotify: () =>
        createSpotifyMedia(mediaInfo, mediaContainer, onEmbedCallback),
      youtube: () =>
        createYouTubeVideo(mediaInfo, mediaContainer, onEmbedCallback),
      reddit: () =>
        createRedditPost(mediaInfo, mediaContainer, onEmbedCallback),
      steam: () => createSteamEmbed(mediaInfo, mediaContainer, onEmbedCallback),
      bunkrr: () =>
        createBunkrrMedia(mediaInfo, mediaContainer, settings, onEmbedCallback),
    };

    if (mediaHandlers[mediaInfo.type]) {
      mediaHandlers[mediaInfo.type]();
    }
  }

  async function filterAndTransformLinks(links, messageText) {
    const transformedUrlsMap = new Map();

    const messageContent = Array.prototype.filter
      .call(messageText.childNodes, (e) => e.nodeType === Node.TEXT_NODE)
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

  function embedTransformedUrls(transformedUrlsMap, messageText) {
    for (const [transformedURL, embedData] of transformedUrlsMap.entries()) {
      console.log(`Embedding ${transformedURL}`, embedData);
      const mediaContainer = document.createElement("div");
      mediaContainer.classList.add("embed-container");

      messageText.appendChild(mediaContainer);

      const mediaInfo = createMediaInfo(embedData, transformedURL);

      const onEmbedCallback = () => {
        embedData.originalLinks.forEach((originalLink) => {
          if (settings.generalOptions.hideLinks) originalLink.remove();
        });
        if (!chatPaused) scrollToBottom();
      };

      try {
        embedMedia(mediaContainer, mediaInfo, onEmbedCallback);
      } catch (e) {
        console.error("Error embedding media:", e);
      }
    }
  }

  async function processChatMessage(chatMessage) {
    const user = chatMessage.querySelector(".user");

    if (
      ((user && user.classList.contains("bot")) ||
        chatMessage.dataset.username === "bot") &&
      !settings.generalOptions.embedBots
    ) {
      return;
    }

    const messageText = chatMessage.querySelector(".text");
    if (!messageText) return;

    const links = messageText.querySelectorAll("a.externallink");
    const transformedUrlsMap = await filterAndTransformLinks(
      links,
      messageText,
    );
    embedTransformedUrls(transformedUrlsMap, messageText);
    if (!chatPaused) scrollToBottom();
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
    }, 500);

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
