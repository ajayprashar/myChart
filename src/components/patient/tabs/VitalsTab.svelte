<script lang="ts">
  import type { Observation, LoadingState } from '../../../types/fhir';
  import DebugPanel from '../debug/DebugPanel.svelte';
  import { FHIR_BASE_URL } from '../../../config';

  export let vitalSigns: Observation[];
  export let loading: LoadingState;
  export let patientId: string;

  $: groupedVitals = vitalSigns.reduce((groups, vital) => {
    const type = vital?.code?.coding?.[0]?.display || 'Unknown';
    if (!groups[type]) groups[type] = [];
    groups[type].push(vital);
    return groups;
  }, {} as Record<string, Observation[]>);
</script>

{#if loading.vitals}
  <p>Loading vital signs...</p>
{:else}
  <div class="space-y-4">
    {#if vitalSigns.length > 0}
      <div class="grid grid-cols-2 gap-4">
        {#each Object.entries(groupedVitals) as [vitalType, measurements]}
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <div class="bg-primary text-white px-4 py-2 text-sm font-medium">
              {vitalType}
            </div>
            <div class="max-h-[250px] overflow-y-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Value
                    </th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Unit
                    </th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {#each measurements as vital}
                    <tr class="hover:bg-gray-50">
                      <td class="px-4 py-1.5 whitespace-nowrap">
                        <span class="text-sm text-gray-900">
                          {vital.valueQuantity?.value ?? 'N/A'}
                        </span>
                      </td>
                      <td class="px-4 py-1.5 whitespace-nowrap">
                        <span class="text-sm text-gray-500">
                          {vital.valueQuantity?.unit ?? 'N/A'}
                        </span>
                      </td>
                      <td class="px-4 py-1.5 whitespace-nowrap">
                        <span class="text-sm text-gray-500">
                          {vital.effectiveDateTime ? new Date(vital.effectiveDateTime).toLocaleDateString() : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p>No vital signs available</p>
    {/if}

    <DebugPanel
      title="Vital Signs"
      query={`${FHIR_BASE_URL}Observation?category=vital-signs&patient=${patientId}&_sort=code,-date`}
      data={vitalSigns}
      loading={loading.vitals}
      {patientId}
    />
  </div>
{/if}
