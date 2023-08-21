export function storeManagerAction(action, params) {
  console.log(`StorageManagerAction: ${action}`, params);
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type: "storeManagerAction", action, params },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error in storeManagerAction:",
            chrome.runtime.lastError,
          );
          reject(chrome.runtime.lastError);
        } else {
          resolve(response.result);
        }
      },
    );
  });
}

export function compareVersions(version1, version2) {
  const v1Parts = version1.split(".").map(Number);
  const v2Parts = version2.split(".").map(Number);
  const maxLength = Math.max(v1Parts.length, v2Parts.length);

  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) {
      return 1;
    } else if (v1Part < v2Part) {
      return -1;
    }
  }

  return 0;
}

export async function displayVersionInfo() {
  const installedVersionElement = document.getElementById("installedVersion");
  const updateLinkElement = document.getElementById("update-link");
  const installedVersion = chrome.runtime.getManifest().version;
  installedVersionElement.textContent = `v${installedVersion}`;

  const latestVersion = await storeManagerAction("get", [
    "settings",
    "latestVersion",
  ]);
  if (compareVersions(installedVersion, latestVersion) === -1) {
    updateLinkElement.href =
      "https://github.com/JanitorialMess/Embedstiny/releases/latest";
    updateLinkElement.hidden = false;
  }
}

export function updateBlurCheckboxes(sections) {
  sections.forEach((section) => {
    section.options.forEach((option) => {
      if (option.options) {
        option.options.forEach((subOption) => {
          updateBlurCheckbox(subOption);
        });
      } else {
        updateBlurCheckbox(option);
      }
    });
  });
}

function updateBlurCheckbox(option) {
  const checkbox = document.getElementById(option.id);

  if (checkbox) {
    if (option.id.startsWith("embed")) {
      const blurCheckboxId = option.id.replace("embed", "blur");
      const blurCheckbox = document.getElementById(blurCheckboxId);

      if (blurCheckbox) {
        const blurLabel = blurCheckbox.parentElement;

        blurCheckbox.disabled = !checkbox.checked;
        blurLabel.style.color = checkbox.checked ? "" : "#aaa";
      }
    }
  }
}

export function getCurrentSettings(sections) {
  const settings = {};

  sections.forEach((section) => {
    if (section.id) settings[section.id] = {};
    section.options.forEach((option) => {
      if (option.options) {
        settings[option.id] = {};
        option.options.forEach((subOption) => {
          const checkbox = document.getElementById(subOption.id);
          if (checkbox) {
            settings[option.id][subOption.id] = checkbox.checked;
          }
        });
      } else {
        const checkbox = document.getElementById(option.id);
        if (checkbox) {
          settings[section.id][option.id] = checkbox.checked;
        }
      }
    });
  });

  return settings;
}

export function applySettings(sections, settings) {
  sections.forEach((section) => {
    section.options.forEach((option) => {
      if (option.options) {
        option.options.forEach((subOption) => {
          applySetting(subOption, settings[option.id], subOption.id);
        });
      } else {
        applySetting(option, settings[section.id], option.id);
      }
    });
  });

  updateBlurCheckboxes(sections);
}

function applySetting(option, settingsSection, optionId) {
  const checkbox = document.getElementById(optionId);
  if (
    checkbox &&
    Object.prototype.hasOwnProperty.call(settingsSection, optionId)
  ) {
    checkbox.checked = settingsSection[optionId];
  }
}

export function registerBetaAudio() {
  const betaTag = document.querySelector(".beta-tag");
  const audio = new Audio(chrome.runtime.getURL("assets/audio/beta.wav"));
  betaTag.addEventListener("mouseenter", function () {
    audio.currentTime = 0;
    audio.play();
  });

  betaTag.addEventListener("mouseleave", function () {
    audio.pause();
    audio.currentTime = 0;
  });
}
