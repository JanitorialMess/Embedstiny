<script>
  import { onMount } from "svelte";
  import {
    storeManagerAction,
    displayVersionInfo,
    getCurrentSettings,
    applySettings,
    registerBetaAudio,
  } from "../utils/optionsHelper.js";
  import { optionSections, hostSections } from "./sections.js";
  import Section from "../shared/Section.svelte";
  import * as styles from "./options.css";

  let settings;
  let activeTab = "general";
  let optionsForm;

  onMount(async () => {
    settings = await storeManagerAction("get", ["settings"]);

    await displayVersionInfo();
    if (activeTab === "general") {
      applySettings(optionSections, settings);
    } else {
      applySettings(hostSections, settings);
    }

    optionsForm.addEventListener("change", async () => {
      const newSettings =
        activeTab === "general"
          ? getCurrentSettings(optionSections)
          : getCurrentSettings(hostSections);
      await storeManagerAction("updateSettings", [newSettings]);
    });

    registerBetaAudio();

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.settings) {
        settings = changes.settings.newValue;
        if (activeTab === "general") {
          applySettings(optionSections, settings);
        } else {
          applySettings(hostSections, settings);
        }
      }
    });
  });

  const changeActiveTab = async (tab) => {
    activeTab = tab;
    settings = await storeManagerAction("get", ["settings"]);
    console.log("activeTab", activeTab);
    if (activeTab === "general") {
      applySettings(optionSections, settings);
    } else {
      applySettings(hostSections, settings);
    }
  };
</script>

<div class="container">
  <div class="header">
    <h1>
      <div class="logo-container">
        <img src="../assets/embedstiny-128.png" width="128" alt="DGG Icon" />
        <div class="title-container">
          <span>Embedstiny</span>
          <span class="supsub">
            <sup class="beta-tag">beta</sup>
            <sub id="installedVersion" class="version-tag" />
          </span>
        </div>
      </div>
    </h1>
    <a id="update-link" target="_blank" hidden>
      <span class="update-indicator">Update available</span>
    </a>
  </div>
  <div class="tabs">
    <button
      type="button"
      class="tab-button {activeTab === 'general' ? 'active' : ''}"
      on:click={() => changeActiveTab("general")}
    >
      General Options
    </button>
    <button
      type="button"
      class="tab-button {activeTab === 'hosts' ? 'active' : ''}"
      on:click={() => changeActiveTab("hosts")}
    >
      Host Options
    </button>
  </div>
  <div class="tab-content">
    <form id="optionsForm" bind:this={optionsForm}>
      {#if activeTab === "general"}
        {#each optionSections as section}
          {#if section.type === "optionsGroup"}
            <div class="options-container">
              {#each section.options as option}
                <Section section={option} {styles} />
              {/each}
            </div>
          {:else}
            <Section {section} {styles} />
          {/if}
        {/each}
      {:else if activeTab === "hosts"}
        <h2>Hosts</h2>
        {#each hostSections as section}
          <Section {section} {styles} />
        {/each}
      {/if}
    </form>
  </div>
</div>

<style>
  .header {
    padding: 26px;
  }
  .tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
    border-bottom: 2px solid #f1c40f;
  }

  .tab-button {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #e7e7e7;
    cursor: pointer;
    font-size: 18px;
    padding: 10px;
    margin-right: 5px;
    transition: border-color 0.3s, color 0.3s;
  }

  .tab-button:hover,
  .tab-button:focus {
    color: #f1c40f;
  }

  .tab-button.active {
    border-bottom-color: #f1c40f;
    color: #f1c40f;
  }

  .options-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 92px;
  }
</style>
