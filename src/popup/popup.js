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
    containerId: "popupContainer",
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
    containerId: "popupContainer",
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
];

document.addEventListener("DOMContentLoaded", async () => {
  let settings = await storeManagerAction("get", ["settings"]);
  createOptions(sections);

  await displayVersionInfo();
  await applySettings(sections, settings);

  document.getElementById("popupForm").addEventListener("change", async () => {
    const newSettings = getCurrentSettings(sections);
    await storeManagerAction("updateSettings", [newSettings]);
  });

  document.getElementById("optionsButton").addEventListener("click", () => {
    const optionsUrl = chrome.runtime.getURL("options/options.html");
    chrome.tabs.create({ url: optionsUrl });
  });

  registerBetaAudio();

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings) {
      settings = changes.settings.newValue;
      applySettings(sections, settings);
    }
  });
});
