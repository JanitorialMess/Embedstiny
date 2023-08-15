const hosts = [
  // Need to be in order of priority
  {
    id: "redditPreviewVideos",
    regex:
      /https?:\/\/preview\.redd\.it\/.*\?(?:.*&)?format=(mp4|webm|ogg)(?:&.*)?$/i,
    mediaType: "video",
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
  {
    id: "imgurCollections",
    regex: /https:\/\/imgur\.com\/(a|gallery)\/([a-zA-Z0-9-_]+)/i,
    mediaType: "imgurCollection",
    transform: (match) => match[0],
    widgetScript: "//s.imgur.com/min/embed.js",
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
    mediaType: "videoIframe",
    transform: (match) => {
      const url = match[0];
      try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;
        const pathname = parsedUrl.pathname;
        const searchParams = parsedUrl.searchParams;

        let videoId = null;
        let timestamp = null;

        if (pathname === "/watch" || pathname.startsWith("/shorts/watch")) {
          videoId = searchParams.get("v");
          timestamp = searchParams.get("t") || searchParams.get("start");
        } else if (pathname.startsWith("/shorts/")) {
          videoId = pathname.slice("/shorts/".length);
          timestamp = searchParams.get("t");
        } else if (pathname.startsWith("/embed/")) {
          videoId = pathname.slice("/embed/".length);
          timestamp = searchParams.get("start");
        } else if (pathname.startsWith("/playlist")) {
          const playlistId = searchParams.get("list");
          return playlistId
            ? `https://www.youtube.com/embed/videoseries?list=${playlistId}`
            : null;
        }

        if (timestamp && timestamp.includes("s")) {
          timestamp = timestamp.replace("s", "");
        }

        if (hostname === "youtu.be" && pathname.startsWith("/")) {
          videoId = pathname.slice(1);
        }

        if (!videoId) return null;
        return `https://www.youtube.com/embed/${videoId}${
          timestamp ? `?start=${timestamp}` : ""
        }`;
      } catch (error) {
        console.error("Error parsing YouTube URL:", error);
      }

      return null;
    },
  },
  // {
  //     id: "Twitch Clip",
  //     regex: /https:\/\/clips\.twitch\.tv\/([a-zA-Z0-9-_]+)/i,
  //     mediaType: "twitchClip",
  //     transform: (match) => match[0],
  // },
  {
    id: "twitter",
    regex: /https?:\/\/twitter\.com\/\w+\/status\/\d+/i,
    transform: (match) => match[0],
    mediaType: "tweet",
    widgetScript: "https://platform.twitter.com/widgets.js",
  },
  // {
  //     id: "Reddit",
  //     regex: /https?:\/\/(?:www\.)?reddit\.com\/r\/\w+\/comments\/\w+/i,
  //     mediaType: "reddit",
  //     transform: (match) => match[0],
  //     widgetScript: "https://embed.reddit.com/widgets.js",
  // },
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
    regex: /https:\/\/store\.steampowered\.com\/app\/(\d+)/i,
    mediaType: "steam",
    transform: (match) => match[0],
  },
];

function loadImage(img, url) {
  return new Promise((resolve, reject) => {
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

export function loadImageWithFallback(img, url) {
  loadImage(img, url).catch(() => {
    console.warn("Direct loading failed, trying fetch fallback:", url);

    fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const objectURL = URL.createObjectURL(blob);
        img.setAttribute("src", objectURL);
      })
      .catch((fetchError) => {
        console.error(`Failed to fetch image: ${url}`, fetchError);
      });
  });
}

export function createEmbed(url, uniqueId, mediaContainer, embedCallback) {
  // Create the div with the unique ID and append it to the DOM
  const div = document.createElement("div");
  div.id = uniqueId;
  mediaContainer.appendChild(div);

  const scriptContent = `(${embedCallback.toString()})("${url}", "${uniqueId}");`;
  const injectScript = document.createElement("script");
  injectScript.textContent = scriptContent;
  (document.head || document.documentElement).appendChild(injectScript);
  injectScript.remove();

  return div;
}

export function createBlurOverlay() {
  const overlay = document.createElement("div");
  overlay.classList.add("media-overlay");

  const overlayButton = document.createElement("button");
  overlayButton.textContent = "Click to show";
  overlayButton.classList.add("blur-btn");

  overlay.appendChild(overlayButton);

  return { overlay, overlayButton };
}

export function createMediaWrapper(mediaElement, blur) {
  const mediaWrapper = document.createElement("div");
  mediaWrapper.style.position = "relative";
  mediaWrapper.appendChild(mediaElement);

  if (blur) {
    const { overlay, overlayButton } = createBlurOverlay();
    mediaWrapper.appendChild(overlay);

    // Set the dimensions of the overlay to match the media element
    setInterval(() => {
      overlay.style.width = `${mediaElement.clientWidth}px`;
      overlay.style.height = `${mediaElement.clientHeight}px`;
    }, 100);

    if (mediaElement.tagName == "VIDEO") {
      mediaElement.addEventListener("play", () => {
        overlay.style.display = "none";
      });

      mediaElement.addEventListener("pause", () => {
        overlay.style.display = "block";
      });

      overlayButton.addEventListener("click", () => {
        if (mediaElement.paused) mediaElement.play();
        else mediaElement.pause();
      });
    } else {
      mediaElement.addEventListener("load", () => {
        overlay.style.display = "block";
      });

      mediaElement.addEventListener("error", () => {
        overlay.style.display = "none";
      });

      overlayButton.addEventListener("click", () => {
        overlay.style.display =
          overlay.style.display === "none" ? "block" : "none";
      });
    }
  }

  return mediaWrapper;
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
