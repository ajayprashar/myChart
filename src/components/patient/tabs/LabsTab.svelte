<script lang="ts">
  import type { Observation, LoadingState } from '../../../types/fhir';
  import DebugPanel from '../debug/DebugPanel.svelte';
  import { FHIR_BASE_URL } from '../../../config';

  export let labResults: Observation[];
  export let loading: LoadingState;
  export let patientId: string;

  // Sort lab results by date
  $: sortedResults = [...labResults].sort((a, b) => 
    new Date(b.effectiveDateTime).getTime() - new Date(a.effectiveDateTime).getTime()
  );

  // Add console log to debug
  $: console.log('Lab Results:', labResults);
</script>

{#if loading.labs}
  <p>Loading lab results...</p>
{:else}
  <div class="space-y-4">
    {#if labResults && labResults.length > 0}
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test
              </th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each sortedResults as lab}
              {@const testName = lab.code?.coding?.[0]?.display || 'Unknown Test'}
              {@const value = lab.valueQuantity?.value ?? 'N/A'}
              {@const unit = lab.valueQuantity?.unit ?? ''}
              {@const date = lab.effectiveDateTime ? 
                new Date(lab.effectiveDateTime).toLocaleDateString() : 'N/A'}
              
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-1.5 whitespace-nowrap">
                  <span class="text-sm font-medium text-gray-900">
                    {testName}
                  </span>
                </td>
                <td class="px-4 py-1.5 whitespace-nowrap">
                  <span class="text-sm text-gray-900">
                    {value}
                  </span>
                </td>
                <td class="px-4 py-1.5 whitespace-nowrap">
                  <span class="text-sm text-gray-500">
                    {unit}
                  </span>
                </td>
                <td class="px-4 py-1.5 whitespace-nowrap">
                  <span class="text-sm text-gray-500">
                    {date}
                  </span>
                </td>
                <td class="px-4 py-1.5 whitespace-nowrap">
                  <span class="text-sm text-gray-500 capitalize">
                    {lab.status || 'unknown'}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <p class="text-gray-500">No lab results available</p>
    {/if}

    <DebugPanel
      title="Laboratory Results"
      query={`${FHIR_BASE_URL}Observation?category=laboratory&patient=${patientId}`}
      data={labResults}
      loading={loading.labs}
      {patientId}
    />
  </div>
{/if}
