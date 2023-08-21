<script>
  export let subOption;
</script>

<div class="sub-option">
  {#if subOption.type === "checkbox"}
    <label class="checkbox-label">
      {subOption.label}
      <input type="checkbox" id={subOption.id} />
      <span class="checkmark" />
    </label>
  {:else if subOption.type === "number"}
    <label class={subOption.type}>
      {subOption.label}
      <input type="number" id={subOption.id} placeholder="300" />
    </label>
  {/if}
</div>

<style>
  .sub-option {
    margin-bottom: 2px;
  }

  .sub-option label {
    font-size: 16px;
    color: #e7e7e7;
  }

  .sub-option label.number {
    display: flex;
    justify-content: space-between;
  }
  .sub-option input[type="checkbox"] {
    margin-left: 5px;
  }

  input[type="number"] {
    appearance: textfield;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]:hover::-webkit-inner-spin-button,
  input[type="number"]:hover::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .sub-option input[type="number"] {
    margin-left: 5px;
    width: 80px; /* Fixed width */
    background-color: #1a1a1a;
    border: 1px solid #555;
    color: #fff;
    font-family: Arial, sans-serif;
    padding: 2px 4px;
    border-radius: 8px;
  }
</style>
