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
          class="px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors
            {activeTab === tab ? 
              'bg-primary text-white shadow-lg' : 
              'bg-gray-100 hover:bg-gray-200 text-gray-700'}"
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
    <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
      {#if activeTab === 'demographics'}
        {#if loading.patient}
          <p>Loading patient data...</p>
        {:else if error}
          <p class="text-red-500">{error}</p>
        {:else if patient}
          <h2 class="text-xl font-semibold mb-4 text-primary">Patient Demographics</h2>
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

          <!-- Demographics Debug Info -->
          <details class="mt-4">
            <summary class="text-sm text-gray-500 cursor-pointer">Debug Information</summary>
            <pre class="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
              {JSON.stringify(patient, null, 2)}
            </pre>
          </details>
        {/if}
      {:else if activeTab === 'labs'}
        <h2 class="text-xl font-semibold mb-4 text-primary">Laboratory Results</h2>
        {#if loading.labs}
          <p>Loading lab results...</p>
        {:else}
          <div class="space-y-4">
            {#if labResults.length > 0}
              {#each labResults as result}
                <div class="border-b border-gray-200 pb-4 mb-4 hover:bg-gray-50 rounded p-2">
                  <p class="font-medium text-secondary">{result?.code?.coding?.[0]?.display || 'Unknown Test'}</p>
                  {#if result?.valueQuantity?.value !== undefined && result?.valueQuantity?.unit}
                    <p>
                      Value: {result?.valueQuantity?.value} {result?.valueQuantity?.unit}
                      {#if result?.effectiveDateTime}
                        <span class="text-gray-500 text-sm">
                          ({new Date(result?.effectiveDateTime).toLocaleDateString()})
                        </span>
                      {/if}
                    </p>
                  {:else}
                    <p class="text-gray-500">No value recorded</p>
                  {/if}
                </div>
              {/each}
            {:else}
              <p>No laboratory results found.</p>
            {/if}

            <!-- Labs Debug Info -->
            <details class="mt-4">
              <summary class="text-sm text-gray-500 cursor-pointer">Debug Information</summary>
              <pre class="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
                Patient ID: {patientId}
                Loading state: {loading.labs}
                Results count: {labResults.length}
                Raw data:
                {JSON.stringify(labResults, null, 2)}
              </pre>
            </details>
          </div>
        {/if}
      {:else if activeTab === 'vitals'}
        <h2 class="text-xl font-semibold mb-4 text-primary">Vital Signs</h2>
        {#if loading.vitals}
          <p>Loading vital signs...</p>
        {:else}
          <div class="space-y-4">
            {#if vitalSigns.length > 0}
              {#each vitalSigns as vital}
                <div class="border-b border-gray-200 pb-4 mb-4 hover:bg-gray-50 rounded p-2">
                  <p class="font-medium text-accent">{vital?.code?.coding?.[0]?.display || 'Unknown Vital'}</p>
                  {#if vital?.valueQuantity?.value !== undefined && vital?.valueQuantity?.unit}
                    <p>
                      Value: {vital?.valueQuantity?.value} {vital?.valueQuantity?.unit}
                      {#if vital?.effectiveDateTime}
                        <span class="text-gray-500 text-sm">
                          ({new Date(vital?.effectiveDateTime).toLocaleDateString()})
                        </span>
                      {/if}
                    </p>
                  {:else}
                    <p class="text-gray-500">No value recorded</p>
                  {/if}
                </div>
              {/each}
            {:else}
              <p>No vital signs available</p>
            {/if}

            <!-- Vitals Debug Info -->
            <details class="mt-4">
              <summary class="text-sm text-gray-500 cursor-pointer">Debug Information</summary>
              <pre class="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
                Patient ID: {patientId}
                Loading state: {loading.vitals}
                Results count: {vitalSigns.length}
                Raw data:
                {JSON.stringify(vitalSigns, null, 2)}
              </pre>
            </details>
          </div>
        {/if}
      {/if}
    </div>
  {/key}
</div> 