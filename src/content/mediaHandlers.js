import {
  loadImageWithFallback,
  createMediaOverlay,
  parseYouTubeUrl,
  observeIframeInjection,
  fetchBunkrrMedia,
} from "../utils/utils.js";
import { executeFunctionInPage } from "./widgetScriptHandlers.js";

export function createImage(
  mediaInfo,
  mediaContainer,
  settings,
  onEmbedCallback,
) {
  const img = document.createElement("img");

  if (settings.imageOptions.openInNewTab) {
    img.style.cursor = "pointer";
    img.addEventListener("click", function () {
      window.open(mediaInfo.url, "_blank");
    });
  }

  loadImageWithFallback(
    img,
    mediaInfo.url,
    () => {
      console.log(`Loaded image: ${mediaInfo.url}`);
      onEmbedCallback();
    },
    () => {
      console.error(`Failed to embed image: ${mediaInfo.url}`);
      mediaContainer.remove();
    },
  );

  if (mediaInfo.blur) {
    const mediaOverlay = createMediaOverlay(img);
    return mediaContainer.appendChild(mediaOverlay);
  }

  return mediaContainer.appendChild(img);
}

function observeVideoLoad(video) {
  return new Promise((resolve, reject) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          video.addEventListener("canplaythrough", () => {
            resolve();
          });

          video.addEventListener("error", () => {
            reject(new Error(`Failed to embed video: ${video.src}`));
          });

          video.src = video.getAttribute("data-src");
          observer.unobserve(video);
        }
      });
    });

    observer.observe(video);
  });
}

export function createVideo(
  mediaInfo,
  mediaContainer,
  settings,
  onEmbedCallback,
) {
  const video = document.createElement("video");
  video.setAttribute("data-src", mediaInfo.url); // Use data-src attribute to store the video URL
  video.setAttribute("controls", "");

  if (settings.videoOptions.preload) {
    video.setAttribute("preload", "auto");
  } else {
    video.setAttribute("preload", "none");
  }

  if (settings.videoOptions.autoplay) {
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
  } else {
    video.removeAttribute("autoplay");
  }

  observeVideoLoad(video)
    .then(() => {
      console.log(`Loaded video: ${mediaInfo.url}`);
      onEmbedCallback();
    })
    .catch((error) => {
      console.error(error.message);
      mediaContainer.remove();
    });

  if (mediaInfo.blur) {
    const mediaOverlay = createMediaOverlay(video);
    return mediaContainer.appendChild(mediaOverlay);
  }

  return mediaContainer.appendChild(video);
}

export function createVideoIframe(mediaInfo, mediaContainer, onEmbedCallback) {
  const videoIframe = document.createElement("iframe");
  videoIframe.setAttribute("src", mediaInfo.url);
  videoIframe.setAttribute("frameborder", "0");
  videoIframe.setAttribute("allowfullscreen", "");
  videoIframe.setAttribute("allow", "autoplay 'none'");

  videoIframe.addEventListener("load", function () {
    onEmbedCallback();
  });

  videoIframe.addEventListener("error", function () {
    mediaContainer.remove();
    new Error(`Failed to load video: ${mediaInfo.url}`);
  });

  if (mediaInfo.blur) {
    const mediaOverlay = createMediaOverlay(videoIframe);
    return mediaContainer.appendChild(mediaOverlay);
  }

  return mediaContainer.append(videoIframe);
}

export function createGenericIframe(
  mediaInfo,
  mediaContainer,
  onEmbedCallback,
) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("src", mediaInfo.url);
  iframe.classList.add(mediaInfo.id);
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("loading", "lazy");

  iframe.addEventListener("load", function () {
    onEmbedCallback();
  });

  iframe.addEventListener("error", () => {
    mediaContainer.remove();
    new Error(`Failed to load media: ${mediaInfo.url}`);
  });

  mediaContainer.appendChild(iframe);
}

export function createSpotifyMedia(mediaInfo, mediaContainer, onEmbedCallback) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("style", "border-radius: 12px");
  iframe.setAttribute("src", mediaInfo.url);
  iframe.setAttribute("width", "100%");
  iframe.setAttribute("height", "152");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("loading", "lazy");

  iframe.addEventListener("load", () => {
    console.log(`Loaded Spotify media: ${mediaInfo.url}`);
    onEmbedCallback();
  });

  iframe.addEventListener("error", () => {
    mediaContainer.remove();
    new Error(`Failed to embed Spotify media: ${mediaInfo.url}`);
  });

  mediaContainer.appendChild(iframe);
}

export function createTweet(mediaInfo, mediaContainer, onEmbedCallback) {
  const tweetId = mediaInfo.url.split("/").pop();
  const uniqueId = `tweet-${Math.random().toString(36).substr(2, 9)}`;

  const container = document.createElement("div");
  container.id = uniqueId;
  mediaContainer.appendChild(container);

  const fn = (args, requestId) => {
    const { tweetId, uniqueId } = args;
    const container = document.getElementById(uniqueId);

    // eslint-disable-next-line no-undef
    twttr.ready(() => {
      // eslint-disable-next-line no-undef
      twttr.widgets
        .createTweet(tweetId, container)
        .then(() => {
          window.postMessage({ type: "functionResponse", requestId }, "*");
        })
        .catch((error) => {
          console.error("Failed to embed tweet:", error);
        });
    });
  };

  executeFunctionInPage(fn, { tweetId, uniqueId }, onEmbedCallback);
}

export function createYouTubeVideo(mediaInfo, mediaContainer, onEmbedCallback) {
  const { videoId, timestamp, playlistId } = parseYouTubeUrl(mediaInfo.url);
  const uniqueId = `youtube-${Math.random().toString(36).substr(2, 9)}`;

  const container = document.createElement("div");
  container.id = uniqueId;
  mediaContainer.appendChild(container);

  const fn = (args, requestId) => {
    const { videoId, uniqueId, timestamp, playlistId } = args;

    let playerConfig = {
      height: "360",
      width: "640",
      playerVars: {
        start: timestamp,
        enablejsapi: 1,
        origin: "“https://www.destiny.gg",
      },
      events: {
        // Currently broken because of CORS
        onReady: () => {
          window.postMessage({ type: "functionResponse", requestId }, "*");
        },
      },
    };

    if (playlistId) {
      playerConfig["playerVars"]["list"] = playlistId;
    } else {
      playerConfig["videoId"] = videoId;
    }

    const onYouTubeIframeAPIReady = () => {
      // eslint-disable-next-line no-undef
      new YT.Player(uniqueId, playerConfig);
    };

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
  };

  executeFunctionInPage(
    fn,
    { videoId, uniqueId, timestamp, playlistId },
    onEmbedCallback,
  );
}

export function createImgurCollection(
  mediaInfo,
  mediaContainer,
  onEmbedCallback,
) {
  const collectionId = mediaInfo.url.split("/").pop();

  const blockquote = document.createElement("blockquote");
  blockquote.classList.add("imgur-embed-pub");
  blockquote.setAttribute("lang", "en");
  blockquote.setAttribute("data-id", `a/${collectionId}`);

  const link = document.createElement("a");
  link.setAttribute("href", `//imgur.com/a/${collectionId}`);
  blockquote.appendChild(link);

  mediaContainer.appendChild(blockquote);

  // Only way to reliable make imgur embeds works reliably, general widget script is not working for some reason
  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("src", "//s.imgur.com/min/embed.js");
  script.setAttribute("charset", "utf-8");
  document.body.appendChild(script);

  observeIframeInjection(
    mediaContainer,
    (iframe) => {
      iframe.addEventListener("load", () => {
        console.log(`Imgur collection loaded: ${mediaInfo.url}`);
        onEmbedCallback();
      });
      iframe.addEventListener("error", () => {
        new Error(`Failed to embed Imgur collection: ${mediaInfo.url}`);
      });
    },
    () => {
      new Error(
        `Timeout reached while waiting for Imgur collection to load: ${mediaInfo.url}`,
      );
    },
  );
}

export function createRedditPost(
  mediaInfo,
  mediaContainer,
  onEmbedCallback,
  options = {},
) {
  const blockquote = document.createElement("blockquote");
  blockquote.className = "reddit-embed-bq";
  blockquote.style.height = options.height || "500px";
  blockquote.setAttribute("data-embed-height", options.height || "500");
  blockquote.setAttribute("data-embed-showmedia", options.showMedia || "true");
  blockquote.setAttribute("data-embed-theme", options.theme || "light");
  blockquote.setAttribute("data-embed-showedits", options.showEdits || "true");
  blockquote.setAttribute(
    "data-embed-showusername",
    options.showUsername || "true",
  );
  blockquote.innerHTML = `<a href="${mediaInfo.url}"></a>`;
  mediaContainer.appendChild(blockquote);

  const script = document.createElement("script");
  script.setAttribute("async", "");
  script.setAttribute("src", "https://embed.reddit.com/widgets.js");
  script.setAttribute("charset", "utf-8");
  document.body.appendChild(script);

  observeIframeInjection(
    mediaContainer,
    (iframe) => {
      iframe.addEventListener("load", () => {
        console.log(`Loaded Reddit post: ${mediaInfo.url}`);
        onEmbedCallback();
      });

      iframe.addEventListener("error", () => {
        new Error(`Failed to embed Reddit post: ${mediaInfo.url}`);
      });
    },
    () => {
      new Error(
        `Timeout reached while waiting for Reddit post to load: ${mediaInfo.url}`,
      );
    },
  );
}

export function createSteamEmbed(mediaInfo, mediaContainer, onEmbedCallback) {
  const appId = mediaInfo.url.split("/app/")[1].split("/")[0];
  const iframe = document.createElement("iframe");
  iframe.src = `https://store.steampowered.com/widget/${appId}/`;
  iframe.frameBorder = "0";
  iframe.allowFullscreen = true;
  iframe.scrolling = "no";
  iframe.height = "190";
  iframe.width = "646";

  iframe.addEventListener("load", function () {
    onEmbedCallback();
  });
  iframe.addEventListener("error", () => {
    mediaContainer.remove();
    new Error(`Failed to embed Spotify media: ${mediaInfo.url}`);
  });

  mediaContainer.appendChild(iframe);
}

export function createBunkrrMedia(
  mediaInfo,
  mediaContainer,
  settings,
  onEmbedCallback,
) {
  fetchBunkrrMedia(mediaInfo.url)
    .then((mediaUrl) => {
      const mediaType = mediaUrl.match(/\.(mp4|webm|ogg)$/i)
        ? "video"
        : "image";

      mediaInfo = {
        ...mediaInfo,
        url: mediaUrl,
        type: mediaType,
      };
      if (mediaType === "image") {
        createImage(mediaInfo, mediaContainer, settings, onEmbedCallback);
      } else if (mediaType === "video") {
        createVideo(mediaInfo, mediaContainer, settings, onEmbedCallback);
      } else {
        console.error(`Unsupported media type: ${mediaType}`);
      }
    })
    .catch(() => {
      new Error(`Failed to embed bunkrr media ${mediaInfo.url}`);
    });
}
