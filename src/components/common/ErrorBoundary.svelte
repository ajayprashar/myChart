<script lang="ts">
  import { errorStore } from '../../stores/patient.store';
</script>

{#if $errorStore.patient || $errorStore.labs || $errorStore.vitals || $errorStore.medications}
  <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
    <p>An error occurred while loading data.</p>
    <p class="text-sm">
      {$errorStore.patient?.message || 
       $errorStore.labs?.message || 
       $errorStore.vitals?.message ||
       $errorStore.medications?.message}
    </p>
  </div>
{:else}
  <slot />
{/if}
