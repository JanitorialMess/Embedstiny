<script>
  import { writable } from "svelte/store";
  import showdown from "showdown";

  const releaseNotes = writable("");

  const repoOwner = "JanitorialMess";
  const repoName = "Embedstiny";
  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/releases`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((releases) => {
      displayChangelog(releases);
    })
    .catch((error) => {
      console.error("Error fetching releases:", error);
    });

  function displayChangelog(releases) {
    const converter = new showdown.Converter({
      simplifiedAutoLink: true,
      literalMidWordUnderscores: true,
    });
    let html = "";

    // Filter all releases that don't have much information
    releases = releases.filter((release) => {
      return release.body && release.body.length > 100;
    });

    releases.forEach((release) => {
      const releaseHtml = converter
        .makeHtml(release.body)
        .replace("\u2026", "...");

      console.log("RELEASE", releaseHtml);
      html += `<h2 class="version">${release.name || release.tag_name}</h2>`;
      html += `<div>${releaseHtml}</div>`;
    });

    html = html.replaceAll(
      /<p>For chromium browsers, please use the chromium zip.+?<\/p>/g,
      ""
    );
    releaseNotes.set(html);
  }
</script>

<div class="container">
  <h1>Changelog</h1>
  <div id="changelog-content">
    {@html $releaseNotes}
  </div>
</div>
