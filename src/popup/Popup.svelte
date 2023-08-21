<script>
  import Section from "../shared/Section.svelte";
  import { onMount } from "svelte";
  import {
    storeManagerAction,
    displayVersionInfo,
    getCurrentSettings,
    applySettings,
    registerBetaAudio,
  } from "../utils/optionsHelper.js";
  import { sections } from "./sections.js";
  import * as styles from "./popup.css";

  let popupForm;
  let optionsButton;
  let popupContainer;

  onMount(async () => {
    let settings = await storeManagerAction("get", ["settings"]);

    await displayVersionInfo();
    applySettings(sections, settings);

    popupForm.addEventListener("change", async () => {
      const newSettings = getCurrentSettings(sections);
      await storeManagerAction("updateSettings", [newSettings]);
    });

    optionsButton.addEventListener("click", () => {
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
</script>

<h1>
  <img src="../assets/embedstiny-64.png" width="64" alt="DGG Icon" />
  Embedstiny
  <span class="supsub">
    <sup class="beta-tag">beta</sup>
    <sub id="installedVersion" class="version-tag" />
  </span>
</h1>
<a id="update-link" target="_blank" hidden>
  <span class="update-indicator">Update available</span>
</a>
<form id="popupForm" bind:this={popupForm}>
  <div class="popup-container" id="popupContainer" bind:this={popupContainer}>
    {#each sections as section}
      <Section {section} {styles} />
    {/each}
  </div>
  <p class="explanation">
    Use these options to enable or disable embedding and blurring of NSFW and
    NSFL content in DGG chat.
  </p>
</form>
<div class="button-group">
  <button id="optionsButton" bind:this={optionsButton}>Options</button>
  <a href="https://ko-fi.com/Z8Z2NV2H6" target="_blank" class="kofi-button">
    <img
      src="https://storage.ko-fi.com/cdn/cup-border.png"
      alt="Buy Me a Coffee at ko-fi.com"
    />
    Support Me
  </a>
</div>

<style>
  @import "./popup.css";
</style>
