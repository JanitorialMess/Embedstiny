export const sections = [
  {
    type: "options",
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
    type: "options",
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
    type: "options",
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
        info: "Autoplays videos",
        warning:
          "Increases bandwidth usage and may not work on all browsers (check browser autoplay policies)",
      },
    ],
  },
  {
    type: "options",
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
    type: "options",
    title: "General Options",
    id: "generalOptions",
    options: [
      // Remove links from chat
      {
        label: "Hide links",
        id: "hideLinks",
        info: "Hides links from chat messages after embedding them",
      },
      {
        label: "Autoscroll chat",
        id: "alwaysScroll",
        info: "Automatically scrolls chat to bottom when new messages are received",
        warning: "Breaks chat pause on manual scroll",
      },
      {
        label: "Embed bot messages",
        id: "embedBots",
      },
    ],
  },
  {
    type: "hosts",
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
        warning: "May not resize properly",
      },
      { label: "Reddit", id: "reddit", info: "Embeds Reddit posts" },
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
        label: "Twitch Clips",
        id: "twitchClips",
        info: "Embeds Twitch clips",
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
        label: "Strawpoll",
        id: "strawpoll",
        info: "Embeds Strawpoll polls",
      },
      {
        label: "Vocaroo",
        id: "vocaroo",
        info: "Embeds Vocaroo audio",
      },
      {
        label: "RedGIFs",
        id: "redgifs",
        info: "Embeds RedGIFs videos",
        nsfw: true,
      },
      {
        label: "Bunkrr",
        id: "bunkrr",
        info: "Embeds Bunkrr media",
        nsfw: true,
      },
    ],
  },
];