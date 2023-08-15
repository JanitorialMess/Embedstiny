const hosts = {
  generalImages: true,
  generalVideos: true,
  formatQueryImages: true,
  formatQueryVideos: true,
  redditPreviewVideos: true,
  imgurCollections: true,
  imgur: true,
  streamable: true,
  youtube: true,
  twitter: true,
  spotify: true,
  steam: true,
  redgifs: false,
};

export default class StoreManager {
  constructor() {
    this.cache = {};
    this.initializeSettings();
  }

  static createProxy() {
    return new Proxy(new StoreManager(), {
      get: (target, prop) => {
        if (typeof target[prop] === "function") {
          return target[prop].bind(target);
        }
        return new Promise((resolve) => {
          target.get("settings").then((settings) => {
            resolve(settings[prop]);
          });
        });
      },
    });
  }

  async initializeSettings() {
    const settings = {
      initialized: true,
      generalOptions: {
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
      latestVersion: chrome.runtime.getManifest().version,
      hosts,
    };

    const storedSettings = await this.get("settings");
    if (!storedSettings || !storedSettings.initialized) {
      console.log("Initializing settings...");
      await this.updateSettings(settings);
    } else {
      console.log("Settings already initialized.");
      this.updateStoredHosts();
    }
  }

  async get(key, nestedKey = null) {
    if (Object.prototype.hasOwnProperty.call(this.cache, key)) {
      return nestedKey ? this.cache[key][nestedKey] : this.cache[key];
    }

    return new Promise((resolve) => {
      chrome.storage.local.get({ [key]: undefined }, (result) => {
        this.cache[key] = result[key];
        resolve(nestedKey ? result[key][nestedKey] : result[key]);
      });
    });
  }

  async set(data) {
    Object.assign(this.cache, data);
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  }

  async updateSettings(newSettings) {
    const settings = await this.get("settings");
    const updatedSettings = { ...settings, ...newSettings };
    console.log("Settings:", settings);
    console.log("Updating settings:", updatedSettings);
    await this.set({ settings: updatedSettings });
  }

  async updateStoredHosts() {
    console.log("Updating stored hosts...");
    const storedSettings = await this.get("settings");
    if (!storedSettings || !storedSettings.hosts) return;
    const updatedHosts = { ...hosts };
    for (const hostName in storedSettings.hosts) {
      if (Object.prototype.hasOwnProperty.call(updatedHosts, hostName)) {
        updatedHosts[hostName] = storedSettings.hosts[hostName];
      }
    }

    await this.updateSettings({ hosts: updatedHosts });
  }

  async enableHost(name) {
    const settings = await this.get("settings");
    const updatedHosts = { ...settings.hosts, [name]: { enabled: true } };
    await this.updateSettings({ hosts: updatedHosts });
  }

  async disableHost(name) {
    const settings = await this.get("settings");
    const updatedHosts = { ...settings.hosts, [name]: { enabled: false } };
    await this.updateSettings({ hosts: updatedHosts });
  }

  async getEnabledHosts() {
    const settings = await this.get("settings");
    const enabledHosts = Object.entries(settings.hosts)
      // eslint-disable-next-line no-unused-vars
      .filter(([_, host]) => host.enabled)
      // eslint-disable-next-line no-unused-vars
      .map(([name, _]) => name);
    return enabledHosts;
  }

  async isHostEnabled(hostId) {
    const settings = await this.get("settings");
    const status = settings.hosts[hostId];
    return status;
  }
}
