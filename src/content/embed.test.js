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

  // Ensure urls is an array
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

function addChangeMessages() {
  addChatMessage(
    "SpotifyManiac",
    "August 2nd 2023, 2:03:04 pm",
    "https://open.spotify.com/episode/4NyA9SLlckU7A3A4u6HCQ6",
  );
  addChatMessage(
    "ImgurManiac",
    "August 2nd 2023, 2:03:04 pm",
    "https://i.imgur.com/vZY0k6O.jpeg",
    true,
  );
  addChatMessage(
    "TwitterManiac",
    "August 2nd 2023, 2:03:04 pm",
    "https://twitter.com/RealKhalilU/status/1678823464956989440",
  );
  addChatMessage(
    "TwitterManiac",
    "August 2nd 2023, 2:03:04 pm",
    "https://twitter.com/StreamerBans/status/1426641460259082242",
  );
  addChatMessage(
    "SteamManiac",
    "August 2nd 2023, 2:03:04 pm",
    "https://store.steampowered.com/app/1326470/Sons_Of_The_Forest/",
  );
  addChatMessage(
    "ImgurManiac",
    "August 2nd 2023, 2:03:04 pm",
    "https://imgur.com/gallery/xK77p",
  );
  addChatMessage(
    "TwitterDirectManiac",
    "August 2nd 2023, 2:03:04 pm",
    "https://pbs.twimg.com/media/F1Qux-cagAACAV0?format=jpg&name=large",
  );
  addChatMessage(
    "StreamableManiac",
    "August 2nd 2023, 2:03:04 pm",
    "https://streamable.com/1pasbs",
  );
  addChatMessage("YoutubeManiac", "August 2nd 2023, 2:03:04 pm", [
    // "https://www.youtube.com/watch?v=QH2-TGUlwu4&t=30",
    // "https://youtu.be/QH2-TGUlwu4?t=30",
    // "https://www.youtube.com/shorts/Oh8rn0lBVPg?t=6&feature=share",
    // "https://www.youtube.com/watch?v=moFB-j5iY2E",
    // "https://www.youtube.com/watch?app=desktop&v=Ep3jK1bZrB8&t=180s",
    // "https://www.youtube.com/watch?v=rh7oegwCyRk&list=PL8mG-RkN2uTxlfi-dJgSmQsyxh_GU-q11&index=1",
    // "https://www.youtube.com/embed/QH2-TGUlwu4?start=30",
    // "https://music.youtube.com/watch?v=UkxRaKZPC4k&si=kHBag1jjA-SgtZIk&t=7",
    // "https://www.youtube.com/playlist?list=PLFs19LVskfNzQLZkGG_zf6yfYTp_3v_e6",
  ]);
  addChatMessage(
    "RedGIFSManiac",
    "August 2nd 2023, 2:03:04 pm",
    "https://www.redgifs.com/watch/elaborateloudzebra",
  );
  addChatMessage(
    "4chanManiac",
    "August 2nd 2023, 2:03:04 pm",
    [
      "https://is2.4chan.org/gif/1691098162315442.webm",
      "https://is2.4chan.org/gif/1691098162315442.webm",
      "https://is2.4chan.org/gif/1691098162315442.webm",
    ],
    true,
  );
  addChatMessage(
    "ImgurManiac",
    "August 2nd 2023, 2:03:04 pm",
    "https://imgur.com/gallery/xK77p",
  );
  addChatMessage(
    "RedditManiac",
    "August 2nd 2023, 2:03:04 pm",
    "https://preview.redd.it/fbbccd3xffeb1.gif?width=640&format=mp4&s=bc8e63acf218c30b9f2432286b57909302bcd326",
  );
}

setTimeout(addChangeMessages, 1000);
