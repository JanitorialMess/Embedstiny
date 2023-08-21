<script>
  import SubOption from "./SubOption.svelte";
  export let section;
</script>

<div id={section.id}>
  {#if section.title}
    <h2>{section.title}</h2>
  {/if}
  {#each section.options as option}
    <div class="option">
      <label class="checkbox-label">
        {option.label}
        <input type="checkbox" id={option.id} disabled={option.disabled} />
        <span class="checkmark" />
        {#if option.nsfw}
          <span class="indicator-18plus">18+</span>
        {/if}
        {#if option.subOptions}
          <button
            type="button"
            class="arrow-button material-icons"
            on:click={() => (option.showSubOptions = !option.showSubOptions)}
          >
            {option.showSubOptions ? "expand_less" : "expand_more"}
          </button>
        {/if}
      </label>
      {#if option.info || option.warning}
        <div class="info-wrapper">
          {#if option.info}
            <span class="info">{option.info}</span>
          {/if}
          {#if option.warning}
            <div class="warning">
              <i class="material-symbols-outlined warning-icon">priority_high</i
              >
              <span class="warning-text">{option.warning}</span>
            </div>
          {/if}
        </div>
      {/if}
      {#if option.subOptions && option.showSubOptions}
        <div class="sub-options">
          {#each option.subOptions as subOption}
            <SubOption {subOption} />
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .arrow-button {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
    margin-left: 5px;
    vertical-align: middle;
  }
  .warning {
    display: flex;
    align-items: flex-start;
    font-size: 15px;
    color: #f1a20f;
    margin-top: 4px;
  }

  .warning-icon {
    font-size: 18px;
    margin-left: -7px;
  }

  .warning-text {
    font-weight: bold;
  }

  .option {
    /* margin-top: 10px; */
    margin-bottom: 10px;
  }

  .info {
    color: #ffff97;
    font-size: 15px;
  }

  .info-wrapper {
    margin-left: 30px;
  }

  .indicator-18plus {
    display: inline-block;
    font-size: 0.8em;
    color: red;
    font-weight: bold;
    text-shadow: 0px 0px 4px red, 0px 0px 4px red;
    margin-left: 3px;
    transform: translateY(-8px);
  }

  .sub-options {
    padding: 12px 12px 0 30px;
  }
</style>
