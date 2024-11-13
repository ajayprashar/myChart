<script lang="ts">
  import type { Patient, LoadingState } from '../../../types/fhir';
  import DebugPanel from '../debug/DebugPanel.svelte';
  import { FHIR_BASE_URL } from '../../../config';

  export let patient: Patient | null;
  export let loading: LoadingState;
  export let patientId: string;
</script>

{#if loading.patient}
  <p>Loading patient data...</p>
{:else if patient}
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <!-- Name -->
      <div>
        <h3 class="text-sm font-medium text-gray-500">Full Name</h3>
        <p class="mt-1">
          {patient.name?.[0]?.given?.join(' ')} {patient.name?.[0]?.family}
        </p>
      </div>

      <!-- Gender -->
      <div>
        <h3 class="text-sm font-medium text-gray-500">Gender</h3>
        <p class="mt-1 capitalize">{patient.gender || 'Unknown'}</p>
      </div>

      <!-- Birth Date -->
      <div>
        <h3 class="text-sm font-medium text-gray-500">Date of Birth</h3>
        <p class="mt-1">
          {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Unknown'}
        </p>
      </div>

      <!-- Address -->
      <div>
        <h3 class="text-sm font-medium text-gray-500">Address</h3>
        <p class="mt-1">
          {#if patient.address?.[0]}
            {patient.address[0].line?.join(', ')}<br>
            {patient.address[0].city}, {patient.address[0].state} {patient.address[0].postalCode}
          {:else}
            No address on file
          {/if}
        </p>
      </div>
    </div>

    <DebugPanel
      title="Demographics"
      query={`${FHIR_BASE_URL}Patient/${patientId}`}
      data={patient}
      loading={loading.patient}
      {patientId}
    />
  </div>
{/if}
