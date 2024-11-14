<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { PATIENT_TABS, type TabId } from '../../constants/tabs';
  import { loadingStore } from '../../stores/patient.store';
  
  export let activeTab: TabId;
  const dispatch = createEventDispatcher();
</script>

<div class="border-b border-gray-200 mb-6">
  <nav class="-mb-px flex space-x-8" aria-label="Tabs">
    {#each PATIENT_TABS as tab}
      {@const isActive = activeTab === tab.id}
      {@const isLoading = $loadingStore[tab.id]}
      
      <button
        class="
          group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
          {isActive ? 
            'border-primary text-primary' : 
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
        "
        aria-current={isActive ? 'page' : undefined}
        aria-controls="{tab.id}-panel"
        id="tab-{tab.id}"
        on:click={() => {
          activeTab = tab.id;
          dispatch('tabChange', tab.id);
        }}
      >
        <span>{tab.label}</span>
        {#if isLoading}
          <slot name="loading-spinner" />
        {/if}
      </button>
    {/each}
  </nav>
</div>
