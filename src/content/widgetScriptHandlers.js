const widgetScripts = [
  "https://platform.twitter.com/widgets.js",
  "https://www.youtube.com/iframe_api",
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

export function executeFunctionInPage(fn, args, callback) {
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
    callback(event.data.result);
  });

  (document.head || document.documentElement).appendChild(script);
}
