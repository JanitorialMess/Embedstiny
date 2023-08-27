import {
  request,
  loadImageWithFetchFallback,
  parseYouTubeUrl,
  executeFunctionInPage,
} from "../utils/utils.js";
import Hls from "hls.js";

class Media {
  constructor(mediaInfo, container, settings) {
    this.mediaInfo = mediaInfo;
    this.container = container;
    this.settings = settings;
  }

  async createMediaElement() {
    throw new Error("createMediaElement() must be implemented in subclasses");
  }

  createBlurOverlay() {
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

  createMediaOverlay(mediaElement) {
    const mediaOverlay = document.createElement("div");
    mediaOverlay.classList.add("media-overlay");

    const { blurOverlay, overlayButton, setOrToggleOverlay } =
      this.createBlurOverlay();
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

  createContainer(prefix) {
    const uniqueId = `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    const container = document.createElement("div");
    container.id = uniqueId;
    return container;
  }

  createBlockquote(attributes, href) {
    const blockquote = document.createElement("blockquote");
    Object.entries(attributes).forEach(([key, value]) => {
      blockquote.setAttribute(key, value);
    });
    if (href) {
      const link = document.createElement("a");
      link.setAttribute("href", href);
      blockquote.appendChild(link);
    }
    return blockquote;
  }

  addScriptToBody(src) {
    const script = document.createElement("script");
    script.setAttribute("async", "");
    script.setAttribute("src", src);
    script.setAttribute("charset", "utf-8");
    document.body.appendChild(script);
  }

  observeIframeInjection(element, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            const iframe = Array.from(mutation.addedNodes).find(
              (node) => node.tagName === "IFRAME",
            );
            if (iframe) {
              resolve(iframe);
              observer.disconnect();
            }
          }
        });
      });

      observer.observe(element, { childList: true });

      setTimeout(() => {
        observer.disconnect();
        reject(
          new Error(
            "Timeout reached while waiting for Imgur collection to load",
          ),
        );
      }, timeout);
    });
  }

  async embed() {
    const mediaElement = await this.createMediaElement();
    this.container.appendChild(mediaElement);
  }

  undoEmbed() {
    this.container.remove();
  }
}

class ImageMedia extends Media {
  async createMediaElement() {
    const img = document.createElement("img");

    if (this.settings.imageOptions.openInNewTab) {
      img.style.cursor = "pointer";
      img.addEventListener("click", function () {
        window.open(this.mediaInfo.url, "_blank");
      });
    }

    try {
      await loadImageWithFetchFallback(img, this.mediaInfo.url);
      console.log(`Loaded image: ${this.mediaInfo.url}`);
    } catch (error) {
      console.error(`Failed to embed image: ${this.mediaInfo.url}`);
      this.container.remove();
      throw error;
    }

    if (this.mediaInfo.blur) {
      const mediaOverlay = this.createMediaOverlay(img);
      return mediaOverlay;
    }

    return img;
  }

  async embed() {
    const mediaElement = await this.createMediaElement();
    this.container.appendChild(mediaElement);
  }
}

class VideoMedia extends Media {
  createMediaElement() {
    let mediaElement;
    const video = document.createElement("video");
    video.setAttribute("controls", "");

    if (this.settings.videoOptions.preload) {
      video.setAttribute("preload", "auto");
    } else {
      video.setAttribute("preload", "metadata");
    }

    if (this.settings.videoOptions.autoplay) {
      video.setAttribute("autoplay", "");
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
    } else {
      video.removeAttribute("autoplay");
    }

    video.src = this.mediaInfo.url;

    if (this.mediaInfo.blur) {
      mediaElement = this.createMediaOverlay(video);
    } else {
      mediaElement = video;
    }

    return new Promise((resolve, reject) => {
      video.addEventListener("loadedmetadata", () => {
        console.log(`Loaded video: ${this.mediaInfo.url}`);
        resolve(mediaElement);
      });

      video.addEventListener("error", () => {
        reject(new Error(`Failed to embed video: ${this.mediaInfo.url}`));
      });
    });
  }

  async embed() {
    const mediaElement = await this.createMediaElement();
    this.container.appendChild(mediaElement);
  }
}
class TweetMedia extends Media {
  async createMediaElement() {
    const tweetId = this.mediaInfo.url.split("/").pop();
    const mediaElement = this.createContainer("tweet");

    this.addScriptToBody("https://platform.twitter.com/widgets.js");

    const embedTweet = async () => {
      await executeFunctionInPage(this.createTweetInPage, {
        tweetId,
        uniqueId: mediaElement.id,
      });
    };

    return { mediaElement, embedTweet };
  }

  createTweetInPage(args, requestId) {
    const { tweetId, uniqueId } = args;
    const container = document.getElementById(uniqueId);

    // eslint-disable-next-line no-undef
    if (!twttr) return;
    // eslint-disable-next-line no-undef
    twttr.ready(() => {
      // eslint-disable-next-line no-undef
      twttr.widgets
        .createTweet(tweetId, container)
        .then(() => {
          window.postMessage(
            { type: "functionResponse", requestId },
            window.location.href,
          );
        })
        .catch(() => {
          console.log("Twitter embed error", tweetId);
          window.postMessage(
            { type: "functionError", requestId },
            window.location.href,
          );
        });
    });
  }

  async embed() {
    const { mediaElement, embedTweet } = await this.createMediaElement();
    this.container.appendChild(mediaElement);
    await embedTweet();
  }
}

class YouTubeMedia extends Media {
  async createMediaElement() {
    const parsedUrlData = parseYouTubeUrl(this.mediaInfo.url);
    const mediaElement = this.createContainer("youtube");

    const embedYouTube = async () => {
      await executeFunctionInPage(this.createYouTubeVideoInPage, {
        ...parsedUrlData,
        uniqueId: mediaElement.id,
      });
    };

    return { mediaElement, embedYouTube };
  }

  createYouTubeVideoInPage(data, requestId) {
    const playerConfig = {
      height: "360",
      width: "640",
      events: handleEvents(),
    };

    function handleEvents() {
      return {
        onReady: () => {
          window.postMessage({ type: "functionResponse", requestId }, "*");
        },
        onError: (event) => {
          window.postMessage(
            { type: "functionError", requestId, error: event.data },
            window.location.href,
          );
        },
      };
    }

    if (!data.videoId && !data.channelId && !data.playerVars.list) {
      window.postMessage(
        { type: "functionError", requestId },
        window.location.href,
      );
    }

    if (!data.channelId) {
      playerConfig.videoId = data.videoId;
      playerConfig.playerVars = data.playerVars;
    }

    const onYouTubeIframeAPIReady = () => {
      // eslint-disable-next-line no-undef
      new YT.Player(data.uniqueId, playerConfig);
    };

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
  }

  async embed() {
    const { mediaElement, embedYouTube } = await this.createMediaElement();
    this.container.appendChild(mediaElement);
    await embedYouTube();
  }
}

class ImgurMedia extends Media {
  async createMediaElement() {
    const collectionId = this.mediaInfo.url.split("/").pop();
    const blockquote = this.createBlockquote(
      {
        class: "imgur-embed-pub",
        lang: "en",
        "data-id": `a/${collectionId}`,
      },
      `//imgur.com/a/${collectionId}`,
    );

    this.addScriptToBody("//s.imgur.com/min/embed.js");
    this.container.appendChild(blockquote);

    const iframe = await this.observeIframeInjection(this.container);
    return iframe;
  }

  async embed() {
    const mediaElement = await this.createMediaElement();
    this.container.appendChild(mediaElement);
  }
}

class RedditMedia extends Media {
  async createMediaElement(options = {}) {
    let attributes = {
      class: "reddit-embed-bq",
      "data-embed-height": options.height || "500",
      "data-embed-showmedia": options.showMedia || "true",
      "data-embed-showusername": options.showUsername || "true",
    };

    if (options.theme) {
      attributes["data-embed-theme"] = options.theme;
    }

    const blockquote = this.createBlockquote(attributes, this.mediaInfo.url);

    this.addScriptToBody("https://embed.reddit.com/widgets.js");
    this.container.appendChild(blockquote);

    const iframe = await this.observeIframeInjection(this.container);
    return iframe;
  }

  async embed(options) {
    const mediaElement = await this.createMediaElement(options);
    this.container.appendChild(mediaElement);
  }
}

class KickMedia extends VideoMedia {
  async createMediaElement() {
    const clipId = this.extractClipId(this.mediaInfo.url);
    const clipData = await this.fetchClipData(clipId);
    const videoUrl = clipData.video_url;
    const thumbnailUrl = clipData.thumbnail_url;

    this.mediaInfo = {
      ...this.mediaInfo,
      url: videoUrl,
    };

    let mediaElement = document.createElement("video");
    mediaElement.setAttribute("poster", thumbnailUrl);
    mediaElement.setAttribute("controls", "");

    if (Hls.isSupported()) {
      // FIXME: Setting any config breaks the player for some reason
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(mediaElement);

      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (this.settings.videoOptions.autoplay) {
          mediaElement.muted = true;
          mediaElement.play();
        }
      });
    } else if (mediaElement.canPlayType("application/vnd.apple.mpegurl")) {
      mediaElement = await super.createMediaElement();
      mediaElement.setAttribute("poster", thumbnailUrl);
    } else {
      throw new Error("HLS is not supported in this browser");
    }

    return mediaElement;
  }

  extractClipId(url) {
    return url.match(/clip=([^&]+)/)[1];
  }

  async fetchClipData(clipId) {
    const response = await request(
      `https://kick.com/api/v2/clips/${clipId}`,
      "json",
    );
    return response.clip;
  }
}

class BunkrrMedia extends Media {
  async createMediaElement() {
    try {
      const mediaUrl = await this.fetchBunkrrMedia(this.mediaInfo.url);
      const mediaType = mediaUrl.match(/\.(mp4|webm|ogg)$/i)
        ? "video"
        : "image";

      this.mediaInfo = {
        ...this.mediaInfo,
        url: mediaUrl,
        type: mediaType,
      };

      let mediaElement;
      if (mediaType === "image") {
        mediaElement = this.createImageElement();
      } else if (mediaType === "video") {
        mediaElement = this.createVideoElement();
      } else {
        throw new Error(`Unsupported media type: ${mediaType}`);
      }

      if (this.mediaInfo.blur) {
        mediaElement = this.createMediaOverlay(mediaElement);
      }

      return mediaElement;
    } catch (error) {
      console.error(
        `Error fetching media URL from ${this.mediaInfo.url}: ${error.message}`,
      );
      throw error;
    }
  }

  async fetchBunkrrMedia(url) {
    try {
      const responseText = await request(url);
      const mediaUrlRegex =
        /(?:https?:\/\/(?:cdn|media-files)\d+\.(?:bunkr\.[a-z]+|bunkr\.[a-z]+\.[a-z]+)\/[a-zA-Z0-9-_]+\.(?:jpg|jpeg|png|pnj|gif|webp|mp4|webm|ogg))/i;
      const match = responseText.match(mediaUrlRegex);

      if (match) {
        return match[0];
      } else {
        throw new Error("Failed to extract media URL");
      }
    } catch (error) {
      console.error(`Error fetching media URL from ${url}: ${error.message}`);
      throw error;
    }
  }

  createImageElement() {
    const img = document.createElement("img");
    img.src = this.mediaInfo.url;
    img.alt = this.mediaInfo.title || "";
    return img;
  }

  createVideoElement() {
    const video = document.createElement("video");
    video.src = this.mediaInfo.url;
    video.controls = true;
    return video;
  }

  async embed() {
    const mediaElement = await this.createMediaElement();
    this.container.appendChild(mediaElement);
  }
}
class IframeMedia extends Media {
  constructor(mediaInfo, container, settings, attributes) {
    super(mediaInfo, container, settings);
    this.attributes = attributes;
  }

  createMediaElement() {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("src", this.mediaInfo.url);

    for (const key in this.attributes) {
      iframe.setAttribute(key, this.attributes[key]);
    }

    const iframeLoadPromise = new Promise((resolve, reject) => {
      iframe.addEventListener("load", () => {
        console.log(`Loaded iframe: ${this.mediaInfo.url}`);
        resolve();
      });

      iframe.addEventListener("error", () => {
        reject(new Error(`Failed to load media: ${this.mediaInfo.url}`));
      });
    });

    return { iframe, iframeLoadPromise };
  }

  async embed() {
    const { iframe, iframeLoadPromise } = this.createMediaElement();
    this.container.appendChild(iframe);
    await iframeLoadPromise;
  }
}
class GenericIframeMedia extends IframeMedia {
  constructor(mediaInfo, container, settings) {
    super(mediaInfo, container, settings, {
      frameborder: "0",
      allowfullscreen: "",
      loading: "lazy",
    });
  }

  async embed() {
    const { iframe, iframeLoadPromise } = this.createMediaElement();
    iframe.classList.add(this.mediaInfo.id);
    this.container.appendChild(iframe);
    await iframeLoadPromise;
  }
}

class VideoIframeMedia extends IframeMedia {
  constructor(mediaInfo, container, settings) {
    super(mediaInfo, container, settings, {
      frameborder: "0",
      allowfullscreen: "",
      allow: "autoplay 'none'",
    });
  }

  async embed() {
    const { iframe, iframeLoadPromise } = this.createMediaElement();

    if (this.mediaInfo.blur) {
      const mediaOverlay = this.createMediaOverlay(iframe);
      this.container.appendChild(mediaOverlay);
    } else {
      this.container.appendChild(iframe);
    }
    await iframeLoadPromise;
  }
}

class SpotifyMedia extends IframeMedia {
  constructor(mediaInfo, container, settings) {
    super(mediaInfo, container, settings, {
      style: "border-radius: 12px",
      width: "100%",
      height: "152",
      frameborder: "0",
      allowfullscreen: "",
      loading: "lazy",
    });
  }

  async embed() {
    const { iframe, iframeLoadPromise } = this.createMediaElement();
    this.container.appendChild(iframe);
    await iframeLoadPromise;
  }
}

class SteamMedia extends IframeMedia {
  constructor(mediaInfo, container, settings) {
    const appId = mediaInfo.url.split("/app/")[1].split("/")[0];
    const src = `https://store.steampowered.com/widget/${appId}/`;

    super(mediaInfo, container, settings, {
      src: src,
      frameBorder: "0",
      allowFullscreen: "true",
      scrolling: "no",
      height: "190",
      width: "646",
    });
  }
}

export default class MediaFactory {
  createMedia(mediaInfo, container, settings) {
    switch (mediaInfo.type) {
      case "image":
        return new ImageMedia(mediaInfo, container, settings);
      case "video":
        return new VideoMedia(mediaInfo, container, settings);
      case "genericIframe":
        return new GenericIframeMedia(mediaInfo, container, settings);
      case "videoIframe":
        return new VideoIframeMedia(mediaInfo, container, settings);
      case "tweet":
        return new TweetMedia(mediaInfo, container, settings);
      case "youtube":
        return new YouTubeMedia(mediaInfo, container, settings);
      case "kick":
        return new KickMedia(mediaInfo, container, settings);
      case "steam":
        return new SteamMedia(mediaInfo, container, settings);
      case "imgurCollection":
        return new ImgurMedia(mediaInfo, container, settings);
      case "spotify":
        return new SpotifyMedia(mediaInfo, container, settings);
      case "reddit":
        return new RedditMedia(mediaInfo, container, settings);
      case "bunkrr":
        return new BunkrrMedia(mediaInfo, container, settings);
      default:
        throw new Error(`Unsupported media type: ${mediaInfo.type}`);
    }
  }
}
