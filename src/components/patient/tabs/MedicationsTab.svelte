<script lang="ts">
  import type { MedicationRequest, LoadingState } from '../../../types/fhir';
  import DebugPanel from '../debug/DebugPanel.svelte';
  import { FHIR_BASE_URL } from '../../../config';

  export let medications: MedicationRequest[];
  export let loading: LoadingState;
  export let patientId: string;

  function getMedicationName(medication: MedicationRequest): string {
    if (medication.medicationReference?.display) {
      return medication.medicationReference.display;
    }
    return medication.medicationCodeableConcept?.coding?.[0]?.display || 
           medication.medicationCodeableConcept?.text || 
           'Unknown';
  }
</script>

{#if loading.medications}
  <p>Loading medications...</p>
{:else}
  <div class="space-y-4">
    {#if medications.length > 0}
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Medication
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instructions
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Prescribed
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each medications as med}
              {#if med.resourceType === 'MedicationRequest'}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getMedicationName(med)}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {med.status || 'Unknown'}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {med.dosageInstruction?.[0]?.text || 'No instructions provided'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {med.authoredOn ? new Date(med.authoredOn).toLocaleDateString() : 'Unknown'}
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <p>No medications found</p>
    {/if}

    <DebugPanel
      title="Medications"
      query={`${FHIR_BASE_URL}MedicationRequest?patient=${patientId}`}
      data={medications}
      loading={loading.medications}
      {patientId}
    />
  </div>
{/if} 