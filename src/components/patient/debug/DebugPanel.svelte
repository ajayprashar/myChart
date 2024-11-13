<script lang="ts">
  import type { Patient, Observation } from '../../../types/fhir';

  export let title: string;
  export let query: string;
  export let data: Patient | Observation[] | null;
  export let loading: boolean;
  export let patientId: string;
</script>

<details class="mt-4">
  <summary class="text-sm text-gray-500 cursor-pointer">
    {title} Debug Information
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
