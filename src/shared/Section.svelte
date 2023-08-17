<script>
  export let section;
</script>

<div id="{section.id}">
  {#if section.title}
    <h2>{section.title}</h2>
  {/if}

  {#each section.options as option}
    <div class="option">
      <label class="checkbox-label">
        {option.label}
        <input
          type="checkbox"
          id="{option.id}"
          disabled="{option.disabled}"
        />
        <span class="checkmark"></span>
        {#if option.nsfw}
          <span class="indicator-18plus">18+</span>
        {/if}
      </label>
      {#if option.info || option.warning}
        <div class="info-wrapper">
          {#if option.info}
            <span class="info">{option.info}</span>
          {/if}

          {#if option.warning}
            <div class="warning">
              <i class="material-symbols-outlined warning-icon">
                priority_high
              </i>
              <span class="warning-text">{option.warning}</span>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>
