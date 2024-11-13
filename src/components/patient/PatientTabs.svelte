<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { PATIENT_TABS, type TabId } from '../../constants/tabs';
  import type { LoadingState } from '../../types/fhir';
  import { loadingStore, errorStore } from '../../stores/patient.store';

  export let activeTab: TabId;
  const dispatch = createEventDispatcher<{ tabChange: TabId }>();

  function handleTabClick(tabId: TabId) {
    errorStore.update(errors => ({ ...errors, [tabId]: null }));
    activeTab = tabId;
    dispatch('tabChange', tabId);
  }
</script>

<div class="border-b-2 border-primary mb-4">
  <div role="tablist" class="flex gap-4">
    {#each PATIENT_TABS as { id, label, icon, description }}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === id}
        aria-controls={`${id}-panel`}
        id={`tab-${id}`}
        class="px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors
          {activeTab === id ? 
            'bg-primary text-white shadow-accent' : 
            'bg-gray-100 hover:bg-gray-200 text-gray-700'}"
        on:click={() => handleTabClick(id)}
      >
        <span class="sr-only">{description}</span>
        <span>{label}</span>
        {#if $loadingStore[id]}
          <slot name="loading-spinner" />
        {/if}
      </button>
    {/each}
  </div>
</div>
