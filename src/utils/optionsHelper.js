export function storeManagerAction(action, params) {
  console.log(`optionsHelper.js: ${action}`, params);
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

export function updateBlurCheckboxes(sections) {
  sections.forEach((section) => {
    section.options.forEach((option) => {
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
    });
  });
}

export function createOptions(sections) {
  sections.forEach((section) => {
    const container = document.getElementById(section.containerId);

    const sectionElement = document.createElement("div");
    sectionElement.id = section.id;

    if (section.title) {
      const title = document.createElement("h2");
      title.textContent = section.title;
      sectionElement.appendChild(title);
    }

    section.options.forEach((option) => {
      const optionElement = document.createElement("div");
      optionElement.classList.add("option");

      const label = document.createElement("label");
      label.classList.add("checkbox-label");
      label.textContent = option.label;

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = option.id;
      if (option.disabled) {
        input.disabled = true;
      }
      label.appendChild(input);

      const checkmark = document.createElement("span");
      checkmark.classList.add("checkmark");
      label.appendChild(checkmark);

      optionElement.appendChild(label);

      if (option.nsfw) {
        const indicator = document.createElement("span");
        indicator.classList.add("indicator-18plus");
        indicator.textContent = "18+";
        label.appendChild(indicator);
      }

      if (option.info || option.warning) {
        const infoWrapper = document.createElement("div");
        infoWrapper.classList.add("info-wrapper");

        if (option.info) {
          const info = document.createElement("span");
          info.classList.add("info");
          info.textContent = option.info;
          infoWrapper.appendChild(info);
        }

        if (option.warning) {
          const warning = document.createElement("div");
          warning.classList.add("warning");

          const warningIcon = document.createElement("i");
          warningIcon.classList.add(
            "material-symbols-outlined",
            "warning-icon",
          );
          warningIcon.textContent = "priority_high";
          warning.appendChild(warningIcon);

          const warningText = document.createElement("span");
          warningText.classList.add("warning-text");
          warningText.textContent = option.warning;
          warning.appendChild(warningText);

          infoWrapper.appendChild(warning);
        }
        optionElement.appendChild(infoWrapper);
      }
      sectionElement.appendChild(optionElement);
    });
    container.appendChild(sectionElement);
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

export function getCurrentSettings(sections) {
  const settings = {};

  sections.forEach((section) => {
    settings[section.id] = {};
    section.options.forEach((option) => {
      const checkbox = document.getElementById(option.id);
      if (checkbox) {
        settings[section.id][option.id] = checkbox.checked;
      }
    });
  });

  return settings;
}

export async function applySettings(sections, settings) {
  sections.forEach((section) => {
    section.options.forEach((option) => {
      const checkbox = document.getElementById(option.id);
      if (
        checkbox &&
        Object.prototype.hasOwnProperty.call(settings, section.id) &&
        Object.prototype.hasOwnProperty.call(settings[section.id], option.id)
      ) {
        checkbox.checked = settings[section.id][option.id];
      }
    });
  });

  updateBlurCheckboxes(sections);
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
