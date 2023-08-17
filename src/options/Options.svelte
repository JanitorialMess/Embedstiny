<script>
  import { onMount } from "svelte";
  import {
    storeManagerAction,
    displayVersionInfo,
    getCurrentSettings,
    applySettings,
    registerBetaAudio,
  } from "../utils/optionsHelper.js";
  import { sections } from "./sections.js";
  import Section from '../shared/Section.svelte';
  import * as styles from './options.css'

  let optionsForm;
  let optionsContainer;

  onMount(async () => {
    let settings = await storeManagerAction("get", ["settings"]);

    await displayVersionInfo();
    await applySettings(sections, settings);

    optionsForm.addEventListener("change", async () => {
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
</script>

<div class="container">
  <h1>
    <div class="logo-container">
      <img src="../assets/embedstiny-128.png" width="128" alt="DGG Icon" />
      <div class="title-container">
        <span>Embedstiny</span>
        <span class="supsub">
          <sup class="beta-tag">beta</sup>
          <sub id="installedVersion" class="version-tag"></sub>
        </span>
      </div>
    </div>
  </h1>
  <a id="update-link" target="_blank" hidden>
    <span class="update-indicator">Update available</span>
  </a>
  <form id="optionsForm" bind:this="{optionsForm}">
    <div class="options-container" id="optionsContainer" bind:this="{optionsContainer}">
      {#each sections as section}
        {#if section.type === 'options'}
          <Section {section} styles="{styles}" />
        {/if}
      {/each}
    </div>
    <h2 class="hosts-header">Supported Hosts</h2>
    <div class="hosts-container" id="hostsContainer">
      {#each sections as section}
        {#if section.type === 'hosts'}
          <Section {section} styles="{styles}" />
        {/if}
      {/each}
    </div>
  </form>  
</div>

<style>
  @import "./options.css";
</style>