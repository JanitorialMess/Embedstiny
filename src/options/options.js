import {
  storeManagerAction,
  createOptions,
  displayVersionInfo,
  getCurrentSettings,
  applySettings,
  registerBetaAudio,
} from "../utils/optionsHelper.js";

const sections = [
  {
    containerId: "optionsContainer",
    title: "NSFW Options",
    id: "nsfwOptions",
    options: [
      {
        label: "Embed NSFW media",
        id: "embedNsfw",
      },
      {
        label: "Blur NSFW media (experimental)",
        id: "blurNsfw",
        disabled: true,
      },
    ],
  },
  {
    containerId: "optionsContainer",
    title: "NSFL Options",
    id: "nsflOptions",
    options: [
      {
        label: "Embed NSFL media",
        id: "embedNsfl",
      },
      {
        label: "Blur NSFL media (experimental)",
        id: "blurNsfl",
        disabled: true,
      },
    ],
  },
  {
    containerId: "optionsContainer",
    title: "Video Options",
    id: "videoOptions",
    options: [
      {
        label: "Preload videos",
        id: "preload",
        info: "Enables preview of videos",
        warning: "Increases bandwidth usage",
      },
      {
        label: "Autoplay videos",
        id: "autoplay",
        info: "Autoplays videos on mute",
        warning:
          "Increases bandwidth usage and may not work on all browsers (check browser autoplay policies)",
      },
    ],
  },
  {
    containerId: "optionsContainer",
    title: "Image Options",
    id: "imageOptions",
    options: [
      {
        label: "Click to open",
        id: "openInNewTab",
        info: "Opens image in new tab when clicked",
      },
    ],
  },
  {
    containerId: "optionsContainer",
    title: "Bot Options",
    id: "generalOptions",
    options: [
      {
        label: "Embed bot messages",
        id: "embedBots",
      },
    ],
  },
  {
    containerId: "hostsContainer",
    id: "hosts",
    options: [
      {
        label: "General Images",
        id: "generalImages",
        info: "Embeds general assets from URLs that end with .jpg, .jpeg, .png, .pnj, .gif, or .webp",
      },
      {
        label: "General Videos",
        id: "generalVideos",
        info: "Embeds general videos from URLs that end with .mp4, .webm, or .ogg",
      },
      {
        label: "Format Query Images",
        id: "formatQueryImages",
        info: "Embeds images with a specific query format",
      },
      {
        label: "Format Query Videos",
        id: "formatQueryVideos",
        info: "Embeds videos with a specific query format",
      },
      {
        label: "Reddit Preview Videos",
        id: "redditPreviewVideos",
        info: "Embeds videos from Reddit's preview.redd.it domain",
      },
      {
        label: "Imgur Collections",
        id: "imgurCollections",
        info: "Embeds Imgur galleries and albums",
        warning: "May occupy a lot of space",
      },
      {
        label: "Imgur",
        id: "imgur",
        info: "Embeds Imgur media",
      },
      {
        label: "Streamable",
        id: "streamable",
        info: "Embeds Streamable videos",
      },
      {
        label: "YouTube",
        id: "youtube",
        info: "Embeds YouTube videos",
      },
      {
        label: "Twitter",
        id: "twitter",
        info: "Embeds tweets",
      },
      {
        label: "Spotify",
        id: "spotify",
        info: "Embeds Spotify tracks, albums, and playlists",
      },
      {
        label: "Steam",
        id: "steam",
        info: "Embeds Steam store pages",
      },
      {
        label: "RedGIFs",
        id: "redgifs",
        info: "Embeds RedGIFs videos",
        nsfw: true,
      },
    ],
  },
];

document.addEventListener("DOMContentLoaded", async () => {
  let settings = await storeManagerAction("get", ["settings"]);
  createOptions(sections);

  await displayVersionInfo();
  await applySettings(sections, settings);

  document
    .getElementById("optionsForm")
    .addEventListener("change", async () => {
      const newSettings = getCurrentSettings(sections);
      await storeManagerAction("updateSettings", [newSettings]);
    });

  registerBetaAudio();

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings) {
      settings = changes.settings.newValue;
      applySettings(sections, settings);
    }
  });
});
