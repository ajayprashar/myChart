<script lang="ts">
  import type { fhir4 } from '@types/fhir';
  import { onMount } from 'svelte';
  import { FHIR_BASE_URL } from '../config';
  import { FHIRService } from '../services/fhir.service';
  import { PATIENT_TABS, type TabId } from '../constants/tabs';
  import { 
    patientStore, 
    labResultsStore, 
    vitalSignsStore, 
    loadingStore, 
    errorStore 
  } from '../stores/patient.store';
  
  import PatientHeader from './patient/PatientHeader.svelte';
  import PatientTabs from './patient/PatientTabs.svelte';
  import DemographicsTab from './patient/tabs/DemographicsTab.svelte';
  import LabsTab from './patient/tabs/LabsTab.svelte';
  import VitalsTab from './patient/tabs/VitalsTab.svelte';
  import LoadingSpinner from './common/LoadingSpinner.svelte';
  import ErrorBoundary from './common/ErrorBoundary.svelte';

  export let accessToken: string;
  export let patientId: string;

  let activeTab: TabId = 'demographics';
  const fhirService = new FHIRService(FHIR_BASE_URL, accessToken);

  async function fetchPatientData() {
    loadingStore.update(state => ({ ...state, patient: true }));
    try {
      const data = await fhirService.getPatient(patientId);
      patientStore.set(data);
    } catch (error) {
      errorStore.update(state => ({ ...state, patient: error as Error }));
      console.error('Error fetching patient:', error);
    } finally {
      loadingStore.update(state => ({ ...state, patient: false }));
    }
  }

  async function fetchLabResults() {
    loadingStore.update(state => ({ ...state, labs: true }));
    try {
      const data = await fhirService.getLabResults(patientId);
      console.log('Raw lab data:', data); // Debug log
      
      if (!data.entry) {
        console.warn('No lab entries found in response');
        labResultsStore.set([]);
        return;
      }
      
      const results = data.entry
        .map(e => e.resource)
        .filter(resource => 
          resource && 
          resource.resourceType === 'Observation' && 
          (resource as fhir4.Observation).category?.some(cat => 
            cat.coding?.some(code => 
              code.code === 'laboratory' || 
              code.display?.toLowerCase().includes('laboratory')
            )
          )
        );
      
      console.log('Processed lab results:', results); // Debug log
      labResultsStore.set(results);
    } catch (error) {
      console.error('Error fetching lab results:', error);
      errorStore.update(state => ({ ...state, labs: error as Error }));
      labResultsStore.set([]);
    } finally {
      loadingStore.update(state => ({ ...state, labs: false }));
    }
  }

  async function fetchVitalSigns() {
    loadingStore.update(state => ({ ...state, vitals: true }));
    try {
      const data = await fhirService.getVitalSigns(patientId);
      vitalSignsStore.set(data.entry?.map(e => e.resource) ?? []);
    } catch (error) {
      errorStore.update(state => ({ ...state, vitals: error as Error }));
      console.error('Error fetching vitals:', error);
    } finally {
      loadingStore.update(state => ({ ...state, vitals: false }));
    }
  }

  // Function to handle tab changes
  function handleTabChange(newTab: TabId) {
    activeTab = newTab;
    switch (newTab) {
      case 'demographics':
        fetchPatientData();
        break;
      case 'labs':
        fetchLabResults();
        break;
      case 'vitals':
        fetchVitalSigns();
        break;
    }
  }

  // Initial data fetch
  onMount(() => {
    fetchPatientData();
  });

  // Watch for tab changes
  $: if (activeTab) {
    handleTabChange(activeTab);
  }
</script>

<ErrorBoundary>
  <div class="p-6">
    {#if $patientStore}
      <PatientHeader patient={$patientStore} {patientId} />
    {/if}
    
    <PatientTabs 
      bind:activeTab 
      on:tabChange={({ detail }) => handleTabChange(detail)}
    />

    <div class="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
      {#if activeTab === 'demographics'}
        <div 
          role="tabpanel" 
          id="demographics-panel"
          aria-labelledby="tab-demographics"
        >
          <DemographicsTab 
            patient={$patientStore} 
            loading={$loadingStore} 
            {patientId} 
          />
        </div>
      {:else if activeTab === 'labs'}
        <div 
          role="tabpanel" 
          id="labs-panel"
          aria-labelledby="tab-labs"
        >
          <LabsTab 
            labResults={$labResultsStore} 
            loading={$loadingStore} 
            {patientId} 
          />
        </div>
      {:else if activeTab === 'vitals'}
        <div 
          role="tabpanel" 
          id="vitals-panel"
          aria-labelledby="tab-vitals"
        >
          <VitalsTab 
            vitalSigns={$vitalSignsStore} 
            loading={$loadingStore} 
            {patientId} 
          />
        </div>
      {/if}
    </div>
  </div>
</ErrorBoundary> 