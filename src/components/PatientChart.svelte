<script lang="ts">
  import { FHIR_BASE_URL } from '../config';
  export let accessToken: string;
  export let patientId: string;

  type Patient = {
    name?: Array<{
      given?: string[];
      family?: string;
    }>;
    birthDate?: string;
    gender?: string;
    address?: Array<{
      line?: string[];
      city?: string;
      state?: string;
      postalCode?: string;
    }>;
  };

  type Observation = {
    code: {
      coding: Array<{
        display: string;
      }>;
    };
    valueQuantity?: {
      value: number;
      unit: string;
    };
    effectiveDateTime: string;
  };

  let patient: Patient | null = null;
  let labResults: Observation[] = [];
  let vitalSigns: Observation[] = [];
  let error: string | null = null;
  let loading = {
    patient: true,
    labs: true,
    vitals: true
  };

  let activeTab = 'demographics';

  async function fetchPatientData() {
    try {
      const response = await fetch(`${FHIR_BASE_URL}Patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch patient data: ${response.status}`);
      }

      patient = await response.json();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to fetch patient data';
      console.error('Error fetching patient data:', e);
    } finally {
      loading.patient = false;
    }
  }

  async function fetchLabResults() {
    try {
      const url = `${FHIR_BASE_URL}Observation?category=laboratory&patient=${patientId}`;
      console.log('Fetching lab results with URL:', url);
      console.log('Using access token:', accessToken);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Failed to fetch lab results: ${response.status}`);
      }

      const data = await response.json();
      console.log('Lab results response:', data);

      if (!data.entry || data.entry.length === 0) {
        console.log('No lab results found in response');
      }

      labResults = data.entry?.map(e => e.resource) || [];
      console.log('Processed lab results:', labResults);
    } catch (e) {
      console.error('Error fetching lab results:', e);
    } finally {
      loading.labs = false;
    }
  }

  async function fetchVitalSigns() {
    try {
      const response = await fetch(
        `${FHIR_BASE_URL}Observation?category=vital-signs&patient=${patientId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error(`Failed to fetch vital signs: ${response.status}`);
      const data = await response.json();
      vitalSigns = data.entry?.map((e: any) => e.resource) || [];
    } catch (e) {
      console.error('Error fetching vital signs:', e);
    } finally {
      loading.vitals = false;
    }
  }

  // Add reactive statement to handle data fetching based on active tab
  $: {
    if (activeTab === 'demographics' && loading.patient) {
      fetchPatientData();
    } else if (activeTab === 'labs' && loading.labs) {
      fetchLabResults();
    } else if (activeTab === 'vitals' && loading.vitals) {
      fetchVitalSigns();
    }
  }

  // Modify the switchTab function to handle state changes
  function switchTab(newTab: string) {
    console.log('Switching to tab:', newTab);
    activeTab = newTab;
  }
</script>

<div class="p-6">
  <!-- Tab Navigation -->
  <div class="border-b border-gray-200 mb-4">
    <nav class="flex gap-4">
      {#each ['demographics', 'labs', 'vitals'] as tab}
        <button
          type="button"
          class="px-4 py-2 rounded-t-lg flex items-center gap-2 {activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
          on:click={() => activeTab = tab}
        >
          <span>
            {tab === 'demographics' ? 'Demographics' : 
             tab === 'labs' ? 'Laboratory Results' : 
             'Vital Signs'}
          </span>
          {#if (tab === 'demographics' && loading.patient) || 
               (tab === 'labs' && loading.labs) || 
               (tab === 'vitals' && loading.vitals)}
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          {/if}
        </button>
      {/each}
    </nav>
  </div>

  <!-- Tab Content -->
  {#key activeTab}
    <div class="bg-white rounded-lg shadow p-6">
      {#if activeTab === 'demographics'}
        {#if loading.patient}
          <p>Loading patient data...</p>
        {:else if error}
          <p class="text-red-500">{error}</p>
        {:else if patient}
          <h2 class="text-xl font-semibold mb-4">Patient Demographics</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="font-medium">Name:</p>
              <p>
                {#if patient.name?.[0]}
                  {patient.name[0].given?.join(' ')} {patient.name[0].family}
                {:else}
                  Not available
                {/if}
              </p>
            </div>
            <div>
              <p class="font-medium">Birth Date:</p>
              <p>{patient.birthDate || 'Not available'}</p>
            </div>
            <div>
              <p class="font-medium">Gender:</p>
              <p>{patient.gender || 'Not available'}</p>
            </div>
            <div>
              <p class="font-medium">Address:</p>
              {#if patient.address?.[0]}
                <p>
                  {patient.address[0].line?.join(', ')}<br>
                  {patient.address[0].city}, {patient.address[0].state} {patient.address[0].postalCode}
                </p>
              {:else}
                <p>Not available</p>
              {/if}
            </div>
          </div>
        {/if}
      {:else if activeTab === 'labs'}
        <div class="bg-white rounded-lg shadow p-6">
          {#if loading.labs}
            <div class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <p>Loading laboratory results...</p>
            </div>
          {:else}
            <h2 class="text-xl font-semibold mb-4">Laboratory Results</h2>
            <div class="space-y-4">
              {#if labResults.length > 0}
                {#each labResults as result}
                  {@const display = result?.code?.coding?.[0]?.display || 'Unknown Test'}
                  {@const value = result?.valueQuantity?.value}
                  {@const unit = result?.valueQuantity?.unit}
                  {@const date = result?.effectiveDateTime}
                  
                  <div class="border-b pb-2">
                    <p class="font-medium">{display}</p>
                    {#if value !== undefined && unit}
                      <p>
                        Value: {value} {unit}
                        {#if date}
                          <span class="text-gray-500 text-sm">
                            ({new Date(date).toLocaleDateString()})
                          </span>
                        {/if}
                      </p>
                    {:else}
                      <p class="text-gray-500">No value recorded</p>
                    {/if}
                  </div>
                {/each}

                <!-- Debug output -->
                <details class="mt-4">
                  <summary class="text-sm text-gray-500 cursor-pointer">Debug Information</summary>
                  <pre class="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
                    {JSON.stringify(labResults, null, 2)}
                  </pre>
                </details>
              {:else}
                <div class="text-gray-600">
                  <p>No laboratory results found.</p>
                  <p class="text-sm mt-2">Debug info:</p>
                  <pre class="bg-gray-100 p-2 rounded text-xs mt-1">
                    Patient ID: {patientId}
                    Loading state: {loading.labs}
                    Results count: {labResults.length}
                  </pre>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {:else if activeTab === 'vitals'}
        <div class="bg-white rounded-lg shadow p-6">
          {#if loading.vitals}
            <div class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <p>Loading vital signs...</p>
            </div>
          {:else}
            <h2 class="text-xl font-semibold mb-4">Vital Signs</h2>
            <div class="space-y-4">
              {#if vitalSigns.length > 0}
                {#each vitalSigns as vital}
                  {@const display = vital?.code?.coding?.[0]?.display || 'Unknown Vital Sign'}
                  {@const value = vital?.valueQuantity?.value}
                  {@const unit = vital?.valueQuantity?.unit}
                  {@const date = vital?.effectiveDateTime}

                  <div class="border-b pb-2">
                    <p class="font-medium">{display}</p>
                    {#if value !== undefined && unit}
                      <p>
                        Value: {value} {unit}
                        {#if date}
                          <span class="text-gray-500 text-sm">
                            ({new Date(date).toLocaleDateString()})
                          </span>
                        {/if}
                      </p>
                    {:else}
                      <p class="text-gray-500">No value recorded</p>
                    {/if}
                  </div>
                {/each}

                <!-- Debug output -->
                <details class="mt-4">
                  <summary class="text-sm text-gray-500 cursor-pointer">Debug Information</summary>
                  <pre class="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
                    {JSON.stringify(vitalSigns, null, 2)}
                  </pre>
                </details>
              {:else}
                <div class="text-gray-600">
                  <p>No vital signs available</p>
                  <p class="text-sm mt-2">Debug info:</p>
                  <pre class="bg-gray-100 p-2 rounded text-xs mt-1">
                    Patient ID: {patientId}
                    Loading state: {loading.vitals}
                    Results count: {vitalSigns.length}
                  </pre>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/key}
</div> 