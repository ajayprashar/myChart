<script lang="ts">
  import type { Patient } from '../../types/fhir';
  import { onDestroy } from 'svelte';
  
  export let patient: Patient;
  export let patientId: string;
  
  let copySuccess = false;
  let copyTimeout: number;

  async function copyMRN() {
    try {
      await navigator.clipboard.writeText(patientId);
      copySuccess = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => copySuccess = false, 2000);
    } catch (err) {
      console.error('Failed to copy MRN:', err);
    }
  }

  function handleLogout() {
    // Clear all authentication-related storage
    sessionStorage.clear();
    localStorage.clear();  // In case any auth data was stored here
    
    // Clear URL parameters
    window.history.replaceState({}, '', window.location.pathname);
    
    // Force reload to return to initial state
    window.location.href = '/';
  }

  onDestroy(() => {
    if (copyTimeout) clearTimeout(copyTimeout);
  });
</script>

<div class="bg-white shadow-sm border-l-4 border-primary px-4 py-2 mb-4 flex items-center justify-between">
  <div class="flex items-center gap-6">
    <div class="flex items-center gap-2">
      <span class="text-gray-500">Patient:</span>
      <span class="font-medium">
        {patient.name?.[0]?.given?.join(' ')} {patient.name?.[0]?.family}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-gray-500">DOB:</span>
      <span class="font-medium">
        {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'Unknown'}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-gray-500">Gender:</span>
      <span class="font-medium capitalize">
        {patient.gender || 'Unknown'}
      </span>
    </div>
  </div>

  <!-- Right-aligned buttons with tighter spacing -->
  <div class="flex items-center space-x-2">
    <button 
      class="group flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
      on:click={copyMRN}
    >
      <span>MRN: {patientId}</span>
      {#if copySuccess}
        <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      {:else}
        <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
        </svg>
      {/if}
    </button>
    <button 
      class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      on:click={handleLogout}
    >
      Logout
    </button>
  </div>
</div>