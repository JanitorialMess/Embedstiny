import {
  createImage,
  createImgurCollection,
  createRedditPost,
  createSpotifyMedia,
  createSteamEmbed,
  createTweet,
  createVideo,
  createVideoIframe,
  createTwitchClip,
} from "./mediaHandlers.js";
import { loadWidgets } from "./loadWidgets.js";
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

  function embedMedia(mediaContainer, mediaInfo) {
    mediaContainer.classList.add(`${mediaInfo.type}-container`);

    const mediaHandlers = {
      image: () => createImage(mediaInfo, settings),
      video: () => createVideo(mediaInfo, settings),
      videoIframe: () => createVideoIframe(mediaInfo),
      tweet: () => createTweet(mediaInfo, mediaContainer),
      imgurCollection: () => createImgurCollection(mediaInfo, mediaContainer),
      spotify: () => createSpotifyMedia(mediaInfo),
      reddit: () => createRedditPost(mediaInfo),
      twitchClip: () => createTwitchClip(mediaInfo),
      steam: () => createSteamEmbed(mediaInfo),
    };

    if (mediaHandlers[mediaInfo.type]) {
      const media = mediaHandlers[mediaInfo.type]();
      mediaContainer.appendChild(media);
    }
  }

  async function processAddedNode(addedNode) {
    if (addedNode.className && addedNode.className.includes("msg-chat")) {
      const user = addedNode.querySelector(".user");

      if (
        ((user && user.classList.contains("bot")) ||
          addedNode.dataset.username === "bot") &&
        !settings.generalOptions.embedBots
      ) {
        return;
      }

      const messageText = addedNode.querySelector(".text");
      if (!messageText) return;

      const links = messageText.querySelectorAll("a.externallink");
      const embeddedUrls = new Set();

      for (const link of links) {
        const url = link.getAttribute("href");
        const hostInfo = findHost(url);

        if (!hostInfo) return;

        console.log(hostInfo.host, hostInfo.match);
        const { host, match } = hostInfo;

        // Check if the host is enabled
        const isHostEnabled = await storeManagerAction("isHostEnabled", [
          host.id,
        ]);

        console.log(`Host ${host.id} is enabled: ${isHostEnabled}`);

        if (!isHostEnabled) return;

        const nsfw =
          host.nsfw ||
          link.classList.contains("nsfw-link") ||
          /nsfw/i.test(messageText.textContent);
        const nsfl =
          host.nsfl ||
          link.classList.contains("nsfl-link") ||
          /nsfl/i.test(messageText.textContent);

        if (
          (nsfw && !settings.nsfwOptions.embedNsfw) ||
          (nsfl && !settings.nsflOptions.embedNsfl)
        ) {
          return;
        }

        const transformedURL = host.transform(match);

        if (!transformedURL) return;

        // Check if the transformed URL has already been embedded
        if (!embeddedUrls.has(transformedURL)) {
          embeddedUrls.add(transformedURL);

          const mediaContainer = document.createElement("div");
          mediaContainer.classList.add("embed-container");
          messageText.appendChild(mediaContainer);

          console.log(
            `Embedding ${host.id} media:`,
            transformedURL,
            `with nsfw: ${nsfw} and nsfl: ${nsfl}`,
          );

          const mediaInfo = {
            url: transformedURL,
            blur:
              (nsfl && settings.nsflOptions.blurNsfl) ||
              (nsfw && settings.nsfwOptions.blurNsfw),
            type: host.mediaType,
          };

          embedMedia(mediaContainer, mediaInfo);
        }

        link.remove();
      }
    }
  }

  function scrollToBottom(chatLines) {
    chatLines.scrollTop = chatLines.scrollHeight;
  }

  const mutationCallback = async function (mutationsList) {
    const chatOutput = document.querySelector(".chat-output");
    const chatLines = document.querySelector(".chat-lines");

    if (!chatOutput || !chatLines) return;

    const isScrolledToBottom =
      chatLines.scrollTop + chatLines.clientHeight >= chatLines.scrollHeight;

    for (const mutation of mutationsList) {
      if (mutation.addedNodes.length > 0) {
        for (const addedNode of mutation.addedNodes) {
          await processAddedNode(addedNode);
        }
      }
    }

    if (isScrolledToBottom) {
      let animationFrameTriggered = false;
      // requestAnimationFrame does not run reliably when the window is not active or visible
      requestAnimationFrame(() => {
        scrollToBottom(chatLines);
        animationFrameTriggered = true;
      });

      setTimeout(() => {
        if (!animationFrameTriggered) {
          scrollToBottom(chatLines);
        }
      }, 100);
    }
  };

  let settings = await storeManagerAction("get", ["settings"]);
  loadWidgets();
  const observer = new MutationObserver(mutationCallback);
  observer.observe(document.body, { childList: true, subtree: true });

  chrome.storage.onChanged.addListener((changes) => {
    console.log("Settings changed:", changes.settings.newValue);
    if (changes.settings) settings = changes.settings.newValue;
  });
})();
