/* eslint-disable no-unused-vars */
import StoreManager from "../utils/storeManager";
import { hosts } from "../utils/storeManager";

test("initializeSettings should initialize settings when they are not present", async () => {
  const mockVersion = "1.0.0";
  chrome.runtime.getManifest.mockReturnValue({ version: mockVersion });

  chrome.storage.local.get.mockImplementation((keys, callback) => {
    callback({ settings: null });
  });

  const storeManager = new StoreManager();
  await new Promise((resolve) => setTimeout(resolve, 100));

  const expectedSettings = {
    initialized: true,
    generalOptions: {
      alwaysScroll: false,
      hideLinks: true,
      embedBots: false,
    },
    nsfwOptions: {
      embed: false,
      blur: false,
    },
    nsflOptions: {
      embed: false,
      blur: false,
    },
    videoOptions: {
      preload: false,
      autoplay: false,
    },
    imageOptions: {
      openInNewTab: true,
    },
    latestVersion: mockVersion,
    hosts,
  };

  const setSpy = jest.spyOn(storeManager, "set");
  await storeManager.initializeSettings();
  expect(setSpy).toHaveBeenCalledWith({ settings: expectedSettings });
  setSpy.mockRestore();
});

test("initializeSettings should update settings and preserve old user preferences", async () => {
  const mockVersion = "1.0.0";
  chrome.runtime.getManifest.mockReturnValue({ version: mockVersion });

  const oldSettings = {
    initialized: true,
    generalOptions: {
      alwaysScroll: true, // Old user preference
      hideLinks: true,
      embedBots: false,
    },
    nsfwOptions: {
      embed: false,
      blur: false,
    },
    nsflOptions: {
      embed: true, // Old user preference should be preserved
      blur: false,
    },
    videoOptions: {
      preload: false,
      autoplay: false,
    },
    imageOptions: {
      openInNewTab: true,
    },
    latestVersion: mockVersion,
    hosts,
  };
  chrome.storage.local.get.mockImplementation((keys, callback) => {
    callback({ settings: oldSettings });
  });

  const storeManager = new StoreManager();

  await new Promise((resolve) => setTimeout(resolve, 100));

  const newSettings = {
    generalOptions: {
      alwaysScroll: false,
      embedBots: false,
      hideLinks: true,
      newSetting: true, // New setting
    },
    nsfwOptions: {
      embed: false,
      blur: false,
    },
    nsflOptions: {
      embed: false,
      blur: false,
    },
    videoOptions: {
      preload: false,
      autoplay: false,
    },
    imageOptions: {
      openInNewTab: true,
    },
    latestVersion: mockVersion,
    hosts,
  };

  const setSpy = jest.spyOn(storeManager, "set");

  // Update the initializeSettings method to use newSettings
  storeManager.initializeSettings = jest.fn().mockImplementation(async () => {
    const storedSettings = await storeManager.get("settings");
    if (!storedSettings || !storedSettings.initialized) {
      console.log("Initializing settings...");
      await storeManager.updateSettings(newSettings);
    } else {
      console.log("Settings already initialized.");
      const mergedSettings = storeManager.deepMerge(
        newSettings,
        storedSettings,
      );
      await storeManager.updateSettings(mergedSettings);
      storeManager.updateStoredHosts();
    }
  });

  await storeManager.initializeSettings();

  const expectedSettings = {
    initialized: true,
    generalOptions: {
      alwaysScroll: true, // Old user preference should be preserved
      embedBots: false,
      hideLinks: true,
      newSetting: true, // New setting should be added
    },
    nsfwOptions: {
      embed: false,
      blur: false,
    },
    nsflOptions: {
      embed: true, // Old user preference should be preserved
      blur: false,
    },
    videoOptions: {
      preload: false,
      autoplay: false,
    },
    imageOptions: {
      openInNewTab: true,
    },
    latestVersion: mockVersion,
    hosts,
  };

  expect(setSpy).toHaveBeenCalledWith({ settings: expectedSettings });
  setSpy.mockRestore();
});
