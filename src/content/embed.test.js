function addChatMessage(username, timestamp, urls, nsfw, nsfl) {
  const chatMessage = document.createElement("div");
  chatMessage.classList.add("msg-chat");
  chatMessage.classList.add("msg-user");
  chatMessage.setAttribute("data-username", username);

  const timeElement = document.createElement("time");
  timeElement.classList.add("time");
  timeElement.setAttribute("title", timestamp);
  timeElement.textContent = timestamp;

  const userElement = document.createElement("a");
  userElement.classList.add("user");
  userElement.classList.add("undefined");
  userElement.textContent = username;

  const colonElement = document.createElement("span");
  colonElement.classList.add("ctrl");
  colonElement.textContent = ": ";

  const textElement = document.createElement("span");
  textElement.classList.add("text");

  if (!Array.isArray(urls)) {
    urls = [urls];
  }

  urls.forEach((url) => {
    const linkElement = document.createElement("a");
    linkElement.classList.add("externallink");

    if (nsfw) linkElement.classList.add("nsfw-link");
    if (nsfl) linkElement.classList.add("nsfl-link");

    linkElement.setAttribute("target", "_blank");
    linkElement.setAttribute("href", url);
    linkElement.setAttribute("rel", "nofollow");
    linkElement.textContent = url;

    textElement.appendChild(document.createTextNode(" OMEGALUL "));
    textElement.appendChild(linkElement);
  });

  chatMessage.appendChild(timeElement);
  chatMessage.appendChild(userElement);
  chatMessage.appendChild(colonElement);
  chatMessage.appendChild(textElement);

  const chatLinesElement = document.querySelector(".chat-lines");
  chatLinesElement.appendChild(chatMessage);
}

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

async function sendMessages() {
  const messages = [
    {
      username: "SpotifyManiac",
      urls: "https://open.spotify.com/episode/4NyA9SLlckU7A3A4u6HCQ6",
    },
    {
      username: "TwitchManiac",
      urls: [
        "https://www.twitch.tv/sodapoppin/clip/TrappedAmericanBoarAMPTropPunch",
        "https://clips.twitch.tv/PlainAdventurousGaurKlappa-pblagZIizB1dpHDW",
      ],
    },
    {
      username: "ImgurManiac",
      urls: [
        "https://i.imgur.com/vZY0k6O.jpeg",
        "https://imgur.com/gallery/xK77p",
      ],
    },
    {
      username: "TwitterManiac",
      urls: [
        "https://twitter.com/RealKhalilU/status/1678823464956989440",
        "https://twitter.com/StreamerBans/status/1426641460259082242",
        "https://x.com/StreamerBans/status/1426641460259082242",
        "https://pbs.twimg.com/media/F1Qux-cagAACAV0?format=jpg&name=large",
      ],
      nsfw: true,
    },
    {
      username: "YouTubeManiac",
      urls: [
        "https://www.youtube.com/watch?v=QH2-TGUlwu4",
        "https://youtu.be/QH2-TGUlwu4?t=30",
        "https://www.youtube.com/shorts/Oh8rn0lBVPg?t=6&feature=share",
        "https://www.youtube.com/watch?v=moFB-j5iY2E",
        "https://www.youtube.com/watch?app=desktop&v=Ep3jK1bZrB8&t=180s",
        "https://www.youtube.com/watch?v=rh7oegwCyRk&list=PL8mG-RkN2uTxlfi-dJgSmQsyxh_GU-q11&index=1",
        "https://www.youtube.com/embed/QH2-TGUlwu4?start=30",
        "https://music.youtube.com/watch?v=UkxRaKZPC4k&si=kHBag1jjA-SgtZIk&t=7",
        "https://www.youtube.com/playlist?list=PLFs19LVskfNzQLZkGG_zf6yfYTp_3v_e6",
        "https://www.youtube.com/live/4Vr0yXDodI8?feature=share&t=23939",
      ],
    },
    {
      username: "SteamManiac",
      urls: "https://store.steampowered.com/app/1326470/Sons_Of_The_Forest/",
    },
    {
      username: "StreamableManiac",
      urls: "https://streamable.com/1pasbs",
    },
    {
      username: "RedditManiac",
      urls: [
        "https://www.reddit.com/r/aww/comments/15s70jy/meet_barney_hes_been_at_his_shelter_since_he_was/",
        "https://www.reddit.com/r/nsfw/comments/pbp3oe/bedroom_selfie/",
        "https://reddit.com/r/truerateme/s/8boHywuOv7",
        "https://redd.it/123abc",
        "https://www.reddit.com/media?url=https%3A%2F%2Fi.redd.it%2Fl8lrfj8k6rib1.jpg",
      ],
    },
    {
      username: "RedGIFManiac",
      urls: "https://www.redgifs.com/watch/elaborateloudzebra",
    },
    {
      username: "4chanManiac",
      urls: "https://is2.4chan.org/gif/1691098162315442.webm",
      nsfw: true,
    },
    {
      username: "StrawpollManiac",
      urls: "https://strawpoll.com/PbZqRQrxNyN",
    },
    {
      username: "VocarooManiac",
      urls: "https://vocaroo.com/12TIadaF99nm",
    },
    {
      username: "BunkrrManiac",
      urls: "https://bunkrr.su/v/aaaa-hoH12wnz.mp4",
      nsfw: true,
    },
    {
      username: "BunkrrManiac",
      urls: "https://lol.su/v/aaaa-h.mp4",
    },
    {
      username: "KickManiac",
      urls: [
        "https://kick.com/iceposeidon",
        "https://kick.com/iceposeidon?clip=clip_01H8E0YAZSF5X8XEBZ6CT6GEA2",
      ],
    },
  ];

  for (let message of messages) {
    addChatMessage(
      message.username,
      new Date().toISOString(),
      message.urls,
      message.nsfw,
    );
    await timer(1000);
  }
}
(async () => {
  await timer(1000);
  await sendMessages();
})();
