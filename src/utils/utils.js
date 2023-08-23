const hosts = [
  // Need to be in order of priority
  {
    id: "bunkrr",
    regex:
      /https?:\/\/bunkrr\.su\/v\/([a-zA-Z0-9-_]+)\.(mp4|webm|ogg)(\?.*)?$/i,
    mediaType: "bunkrr",
    transform: (match) => match[0],
  },
  {
    id: "redditPreviewVideos",
    regex:
      /https?:\/\/preview\.redd\.it\/.*\?(?:.*&)?format=(mp4|webm|ogg)(?:&.*)?$/i,
    mediaType: "video",
    transform: (match) => match[0],
  },
  {
    id: "imgurCollections",
    regex: /https:\/\/imgur\.com\/(a|gallery)\/([a-zA-Z0-9-_]+)/i,
    mediaType: "imgurCollection",
    transform: (match) => match[0],
  },
  {
    id: "imgur",
    regex: /https?:\/\/imgur\.com\/([a-zA-Z0-9]+)/,
    mediaType: "image",
    transform: (match) => `https://i.imgur.com/${match[1]}.jpg`,
  },
  {
    id: "streamable",
    regex: /https?:\/\/(?:www\.)?streamable\.com\/([a-z0-9]+)/i,
    mediaType: "videoIframe",
    transform: (match) => `https://streamable.com/e/${match[1]}`,
  },
  {
    id: "strawpoll",
    regex:
      /^(https?:\/\/(?:www\.)?strawpoll\.com\/)([a-zA-Z0-9]+)(?:\/embed)?$/i,
    mediaType: "genericIframe",
    transform: (match) => `https://strawpoll.com/embed/${match[2]}`,
  },
  {
    id: "vocaroo",
    regex:
      /^(https?:\/\/(?:www\.)?(?:vocaroo\.com\/|voca\.ro\/))(?:embed\/)?([a-zA-Z0-9]+)$/i,
    mediaType: "genericIframe",
    transform: (match) => `https://vocaroo.com/embed/${match[2]}`,
  },
  {
    id: "redgifs",
    regex: /https:\/\/(?:[a-zA-Z0-9-]+\.)?redgifs\.com\/watch\/(.+)/i,
    mediaType: "videoIframe",
    nsfw: true,
    transform: (match) => `https://www.redgifs.com/ifr/${match[1]}`,
  },
  {
    id: "youtube",
    regex:
      /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:music\.)?youtube\.com\/.*|(?:https?:\/\/)?youtu\.be\/.*/i,
    mediaType: "youtube",
    transform: (match) => match[0],
  },
  {
    id: "twitchClips",
    regex:
      /https:\/\/(?:www\.)?twitch\.tv\/(?:\w+\/)?clip\/([a-zA-Z0-9-_]+)|https:\/\/clips\.twitch\.tv\/([a-zA-Z0-9-_]+)/i,
    mediaType: "videoIframe",
    transform: (match) => {
      const iframeHostname = new URL(location.href).hostname;
      const refererHostname = document.referrer
        ? new URL(document.referrer).hostname
        : "";
      const matchValue = match[1] || match[2];

      const embedUrl = new URL(`https://clips.twitch.tv/embed`);
      embedUrl.searchParams.set("clip", matchValue);
      embedUrl.searchParams.set("parent", iframeHostname);

      if (refererHostname) {
        embedUrl.searchParams.set("parent", refererHostname);
      }

      return embedUrl.toString();
    },
  },
  {
    id: "twitter",
    regex: /https?:\/\/(?:twitter|x)\.com\/\w+\/status\/\d+/i,
    mediaType: "tweet",
    transform: (match) => match[0],
  },
  {
    id: "reddit",
    regex:
      /https?:\/\/(?:www\.|old\.)?reddit\.com\/r\/[\w]+\/comments\/[\w]+(?:\/[^/]+)?(?:\/[^/]+)?/i,
    mediaType: "reddit",
    transform: (match) => match[0],
  },
  {
    id: "reddit",
    regex:
      /https?:\/\/(?:www\.|old\.)?reddit\.com\/r\/[\w]+(?:\/[^/]+)?(?:\/[^/]+)?/i,
    mediaType: "reddit",
    transform: async (match) => {
      const url = await resolveShortRedditUrl(match[0], {
        method: "HEAD",
      });
      return url;
    },
  },
  {
    id: "reddit",
    regex: /https?:\/\/redd\.it\/([\w]+)/i,
    mediaType: "reddit",
    transform: async (match) => {
      const url = await resolveShortRedditUrl(match[0], {
        method: "HEAD",
      });
      const jsonResponse = await request(
        `${url}.json`,
        {
          method: "GET",
        },
        "json",
      );
      const permalink = jsonResponse[0].data.children[0].data.permalink;
      return permalink;
    },
  },
  {
    id: "reddit",
    regex: /https?:\/\/(?:www\.|old\.)?reddit\.com\/media(?:\?(.+))?/i,
    mediaType: "image",
    transform: (match) => {
      const paramString = match[1];
      if (paramString) {
        const params = new URLSearchParams(paramString);
        if (params.has("url")) {
          const decodedUrl = decodeURIComponent(params.get("url"));
          return decodedUrl;
        }
      }
      return null;
    },
  },
  {
    id: "spotify",
    regex:
      /https?:\/\/open\.spotify\.com\/(track|album|playlist|episode)\/([^?]+)/,
    mediaType: "spotify",
    transform: (match) =>
      `https://open.spotify.com/embed/${match[1]}/${match[2]}`,
  },
  {
    id: "steam",
    regex: /https?:\/\/store\.steampowered\.com\/app\/(\d+)/i,
    mediaType: "steam",
    transform: (match) => match[0],
  },
  {
    id: "generalImages",
    regex: /https?:\/\/.*\.(?:jpg|jpeg|png|pnj|gif|webp)((?:\?|&).*)?$/i,
    mediaType: "image",
    transform: (match) => match[0],
  },
  {
    id: "formatQueryImages",
    regex: /https?:\/\/.*\?format=(jpg|jpeg|png|pnj|gif|webp)((\?|&).*)?$/i,
    mediaType: "image",
    transform: (match) => match[0],
  },
  {
    id: "generalVideos",
    regex: /https?:\/\/.*\.(mp4|webm|ogg)(\?.*)?$/i,
    mediaType: "video",
    transform: (match) => match[0],
  },
  {
    id: "formatQueryVideos",
    regex: /https?:\/\/.*\?(?:.*&)?format=(mp4|webm|ogg)(?:&.*)?$/i,
    mediaType: "video",
    transform: (match) => match[0],
  },
];

function loadImage(img, url) {
  return new Promise((resolve, reject) => {
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () =>
      reject(new Error(`Failed to load image: ${url}`)),
    );
    img.src = url;
  });
}

export async function loadImageWithFetchFallback(img, url) {
  try {
    await loadImage(img, url);
  } catch (error) {
    console.warn("Direct loading failed, trying fetch fallback:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    });
    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    const tempImg = new Image();

    await new Promise((resolve, reject) => {
      tempImg.addEventListener("load", () => {
        img.setAttribute("src", objectURL);
        resolve();
      });
      tempImg.addEventListener("error", () => {
        reject(new Error(`Failed to load image: ${url}`));
      });
      tempImg.src = objectURL;
    });
  }
}

function createBlurOverlay() {
  const blurOverlay = document.createElement("div");
  blurOverlay.classList.add("blur-overlay");

  const overlayButton = document.createElement("button");
  overlayButton.textContent = "Show";
  overlayButton.classList.add("blur-btn");

  const setOrToggleOverlay = (displayValue) => {
    if (displayValue === undefined) {
      displayValue = blurOverlay.style.display === "none" ? "block" : "none";
    }

    blurOverlay.style.display = displayValue;
    overlayButton.style.display = displayValue;
  };

  overlayButton.addEventListener("click", setOrToggleOverlay);

  return { blurOverlay, overlayButton, setOrToggleOverlay };
}

export function createMediaOverlay(mediaElement) {
  const mediaOverlay = document.createElement("div");
  mediaOverlay.classList.add("media-overlay");

  const { blurOverlay, overlayButton, setOrToggleOverlay } =
    createBlurOverlay();
  mediaOverlay.appendChild(blurOverlay);
  mediaOverlay.appendChild(overlayButton);

  if (mediaElement.tagName == "VIDEO") {
    mediaElement.addEventListener("play", () => setOrToggleOverlay("none"));
    mediaElement.addEventListener("pause", () => setOrToggleOverlay("block"));

    mediaOverlay.addEventListener("click", () => {
      if (mediaElement.paused) mediaElement.play();
      else mediaElement.pause();
    });
  } else {
    mediaOverlay.addEventListener("click", () => setOrToggleOverlay("none"));
    mediaElement.addEventListener("error", () => {
      mediaOverlay.remove();
    });
  }

  mediaOverlay.appendChild(mediaElement);
  return mediaOverlay;
}

export function findHost(url) {
  for (const host of hosts) {
    const match = url.match(host.regex);
    if (match) {
      return { host, match };
    }
  }
  return null;
}

function parseTimestamp(timestamp) {
  let seconds = 0;
  let minutesPattern = /(\d+)m/;
  let secondsPattern = /(\d+)s/;
  let numberPattern = /^\d+$/;

  let minutesMatch = timestamp.match(minutesPattern);
  let secondsMatch = timestamp.match(secondsPattern);
  let numberMatch = timestamp.match(numberPattern);

  if (minutesMatch) {
    seconds += parseInt(minutesMatch[1]) * 60;
  }

  if (secondsMatch) {
    seconds += parseInt(secondsMatch[1]);
  }

  if (numberMatch) {
    seconds = parseInt(numberMatch[0]);
  }

  return seconds;
}

export function parseYouTubeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const pathname = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;

    let videoId = null;
    let timestamp = null;
    let playlistId = null;

    if (pathname.startsWith("/playlist")) {
      playlistId = searchParams.get("list");
    }

    if (pathname === "/watch" || pathname.startsWith("/shorts/watch")) {
      videoId = searchParams.get("v");
      timestamp = searchParams.get("t") || searchParams.get("start");
    } else if (pathname.startsWith("/shorts/")) {
      videoId = pathname.slice("/shorts/".length);
      timestamp = searchParams.get("t");
    } else if (pathname.startsWith("/embed/")) {
      videoId = pathname.slice("/embed/".length);
      timestamp = searchParams.get("start");
    } else if (pathname.startsWith("/live")) {
      videoId = pathname.slice("/live/".length);
      timestamp = searchParams.get("t") || searchParams.get("start");
    } else if (pathname.startsWith("/playlist")) {
      playlistId = searchParams.get("list");
    }

    if (
      timestamp &&
      (timestamp.includes("s") ||
        timestamp.includes("m") ||
        /^\d+$/.test(timestamp))
    ) {
      timestamp = parseTimestamp(timestamp);
    }

    if (hostname === "youtu.be" && pathname.startsWith("/")) {
      videoId = pathname.slice(1);
    }

    return { videoId, timestamp, playlistId };
  } catch (error) {
    console.error("Error parsing YouTube URL:", error);
  }

  return null;
}

export function observeIframeInjection(
  element,
  callback,
  onError,
  timeout = 10000,
) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        const iframe = Array.from(mutation.addedNodes).find(
          (node) => node.tagName === "IFRAME",
        );
        if (iframe) {
          callback(iframe);
          observer.disconnect();
        }
      }
    });
  });

  observer.observe(element, { childList: true });

  // Disconnect the observer after the timeout period if no iframe is found
  setTimeout(() => {
    observer.disconnect();
    onError();
  }, timeout);

  return observer;
}

export async function request(url, options = {}, responseProperty = "text") {
  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: "requestAction", url, options, responseProperty },
        (result) => {
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result.result);
          }
        },
      );
    });
    return response;
  } catch (error) {
    console.error(`Error fetching content from ${url}: ${error.message}`);
    throw error;
  }
}

export async function resolveShortRedditUrl(shortUrl, options = {}) {
  try {
    const fullUrl = await request(shortUrl, options, "url");
    return fullUrl;
  } catch (error) {
    console.error(`Error resolving short URL ${shortUrl}: ${error.message}`);
    throw error;
  }
}

export async function executeFunctionInPage(fn, args) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const requestId = `request-${Math.random().toString(36).substr(2, 9)}`;

    script.textContent = `
      (${fn.toString()})(${JSON.stringify(args)}, ${JSON.stringify(requestId)});
    `;

    window.addEventListener("message", function listener(event) {
      if (
        event.source !== window ||
        event.data.type !== "functionResponse" ||
        event.data.requestId !== requestId
      )
        return;

      window.removeEventListener("message", listener);
      script.remove();
      resolve();
    });

    (document.head || document.documentElement).appendChild(script);
  });
}
