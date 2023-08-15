const widgetScripts = [
  "https://platform.twitter.com/widgets.js",
  "https://embed.reddit.com/widgets.js",
  "https://s.imgur.com/min/embed.js",
];

export function loadWidgets() {
  widgetScripts.forEach((scriptUrl) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.onload = () => {
      console.log(`Loaded ${scriptUrl}`);
    };
    script.onerror = () => {
      console.log(`Failed to load ${scriptUrl}`);
    };
    (document.head || document.documentElement).appendChild(script);
  });
}
