import {
  loadImageWithFallback,
  createEmbed,
  createMediaWrapper,
} from "../utils/utils.js";

export function createImage(mediaInfo, settings) {
  const img = document.createElement("img");

  img.addEventListener("error", function () {
    console.error(`Failed to load image: ${mediaInfo.url}`);
    this.remove();
  });

  if (settings.imageOptions.openInNewTab) {
    img.style.cursor = "pointer";
    img.addEventListener("click", function () {
      window.open(mediaInfo.url, "_blank");
    });
  }

  loadImageWithFallback(img, mediaInfo.url);
  return createMediaWrapper(img, mediaInfo.blur);
}

export function createVideo(mediaInfo, settings) {
  const video = document.createElement("video");
  video.setAttribute("src", mediaInfo.url);
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

  video.addEventListener("error", function () {
    console.error(`Failed to load video: ${mediaInfo.url}`);
    this.remove();
  });

  return createMediaWrapper(video, mediaInfo.blur);
}

export function createVideoIframe(mediaInfo) {
  const video = document.createElement("iframe");
  video.setAttribute("src", mediaInfo.url);
  video.setAttribute("frameborder", "0");
  video.setAttribute("allowfullscreen", "");
  video.setAttribute("allow", "autoplay 'none'");

  video.addEventListener("error", function () {
    console.error(`Failed to load video: ${mediaInfo.url}`);
    this.remove();
  });

  return createMediaWrapper(video, mediaInfo.blur);
}

export function createSpotifyMedia(mediaInfo) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("style", "border-radius: 12px");
  iframe.setAttribute("src", mediaInfo.url);
  iframe.setAttribute("width", "100%");
  iframe.setAttribute("height", "152");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute(
    "allow",
    "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
  );
  iframe.setAttribute("loading", "lazy");

  return iframe;
}

export function createTwitchClip(mediaInfo) {
  const clipId = mediaInfo.split("/").pop();
  const iframe = document.createElement("iframe");
  iframe.src = `https://clips.twitch.tv/embed?clip=${clipId}&parent=destiny.gg`;
  iframe.frameBorder = "0";
  iframe.allowFullscreen = true;
  iframe.scrolling = "no";
  iframe.height = "378";
  iframe.width = "620";
  return iframe;
}

export function createTweet(mediaInfo, mediaContainer) {
  const uniqueId = `tweet-${Math.random().toString(36).substr(2, 9)}`;

  const embedCallback = function (url, mediaContainerId) {
    // eslint-disable-next-line no-undef
    twttr.ready(function (twttr) {
      twttr.widgets.createTweet(
        url.split("/").pop(),
        document.getElementById(mediaContainerId),
      );
    });
  };

  return createEmbed(mediaInfo.url, uniqueId, mediaContainer, embedCallback);
}

export function createRedditPost(mediaInfo) {
  const uniqueId = `reddit-${Math.random().toString(36).substr(2, 9)}`;
  const redditPostUrl = `${mediaInfo.url.replace(/\/$/, "")}/embed`; // Add '/embed' to the Reddit post URL

  const iframe = document.createElement("iframe");
  iframe.setAttribute("src", redditPostUrl);
  iframe.setAttribute("width", "100%");
  iframe.setAttribute("height", "500");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("scrolling", "no");
  iframe.setAttribute("title", "Reddit Post Embed");

  const div = document.createElement("div");
  div.id = uniqueId;
  div.appendChild(iframe);

  return div;
}

export function createSteamEmbed(mediaInfo) {
  const appId = mediaInfo.url.split("/app/")[1].split("/")[0];
  const iframe = document.createElement("iframe");
  iframe.src = `https://store.steampowered.com/widget/${appId}/`;
  iframe.frameBorder = "0";
  iframe.allowFullscreen = true;
  iframe.scrolling = "no";
  iframe.height = "190";
  iframe.width = "646";
  return iframe;
}

export function createImgurCollection(mediaInfo, mediaContainer) {
  const uniqueId = `mediaContainer_${Date.now()}`;

  const embedCallback = function (url, mediaContainerId) {
    const collectionId = url.split("/").pop();
    const mediaContainer = document.getElementById(mediaContainerId);
    if (!mediaContainer) return;

    const blockquote = document.createElement("blockquote");
    blockquote.classList.add("imgur-embed-pub");
    blockquote.setAttribute("lang", "en");
    blockquote.setAttribute("data-id", `a/${collectionId}`);

    const link = document.createElement("a");
    link.setAttribute("href", `//imgur.com/${collectionId}`);
    blockquote.appendChild(link);

    const script = document.createElement("script");
    script.setAttribute("async", "");
    script.setAttribute("src", "//s.imgur.com/min/embed.js");
    script.setAttribute("charset", "utf-8");
    blockquote.appendChild(script);

    mediaContainer.appendChild(blockquote);
  };

  return createEmbed(mediaInfo.url, uniqueId, mediaContainer, embedCallback);
}
