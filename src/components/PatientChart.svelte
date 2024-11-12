<script lang="ts">
  import { FHIR_BASE_URL } from '../config';
  import { onMount } from 'svelte';

  export let accessToken: string;
  export let patientId: string;

  interface PatientData {
    resourceType: string;
    id: string;
    name?: Array<{
      given: string[];
      family: string;
    }>;
    birthDate?: string;
    gender?: string;
  }

  let patientData: PatientData | null = null;
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    try {
      console.log('PatientChart mounted with token:', accessToken);
      console.log('Fetching data for patient:', patientId);
      
      const response = await fetch(
        `${FHIR_BASE_URL}Patient/${patientId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch patient data: ${response.status} - ${errorText}`);
      }

      patientData = await response.json();
      console.log('Patient data:', patientData);
    } catch (e) {
      console.error('Error fetching patient data:', e);
      error = e instanceof Error ? e.message : 'An unknown error occurred';
    } finally {
      loading = false;
    }
  });
</script>

<div class="max-w-4xl mx-auto p-6">
  <h1 class="text-2xl font-bold mb-6">Patient Chart</h1>
  
  {#if loading}
    <div class="text-center">Loading patient data...</div>
  {:else if error}
    <div class="text-red-500">Error: {error}</div>
  {:else if patientData}
    <div class="bg-white shadow-md rounded-lg p-6">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h2 class="text-lg font-semibold mb-2">Patient Information</h2>
          <div class="space-y-2">
            <p>
              <span class="font-medium">Name: </span>
              {#if patientData.name?.[0]}
                {patientData.name[0].given.join(' ')} {patientData.name[0].family}
              {/if}
            </p>
            <p>
              <span class="font-medium">ID: </span>
              {patientData.id}
            </p>
            <p>
              <span class="font-medium">Gender: </span>
              {patientData.gender}
            </p>
            <p>
              <span class="font-medium">Birth Date: </span>
              {patientData.birthDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center">No patient data available</div>
  {/if}
</div> 