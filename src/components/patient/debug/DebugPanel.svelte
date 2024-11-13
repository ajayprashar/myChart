<script lang="ts">
  import type { Patient, Observation } from '../../../types/fhir';

  export let title: string;
  export let query: string;
  export let data: Patient | Observation[] | null;
  export let loading: boolean;
  export let patientId: string;

  let copySuccess = false;
  let copyTimeout: number;

  function getDebugInfo() {
    return `FHIR Query: ${query}

Patient ID: ${patientId}
Loading state: ${loading}
${Array.isArray(data) ? `Results count: ${data.length}` : ''}
Raw data:
${JSON.stringify(data, null, 2)}`;
  }

  async function copyDebugInfo() {
    try {
      await navigator.clipboard.writeText(getDebugInfo());
      copySuccess = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => copySuccess = false, 2000);
    } catch (err) {
      console.error('Failed to copy debug info:', err);
    }
  }
</script>

<details class="mt-4">
  <summary class="text-sm text-gray-500 cursor-pointer flex items-center justify-between">
    <span>{title} Debug Information</span>
    <button
      on:click|stopPropagation={copyDebugInfo}
      class="ml-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
    >
      {#if copySuccess}
        Copied!
      {:else}
        Copy Debug Info
      {/if}
    </button>
  </summary>
  <pre class="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
    FHIR Query: {query}

    Patient ID: {patientId}
    Loading state: {loading}
    {#if Array.isArray(data)}Results count: {data.length}{/if}
    Raw data:
    {JSON.stringify(data, null, 2)}
  </pre>
</details>

<style>
  /* Prevent the button click from toggling the details element */
  button {
    pointer-events: auto;
  }
  
  summary {
    list-style: none;
  }
  
  summary::-webkit-details-marker {
    display: none;
  }
</style>
