<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { PATIENT_TABS, type TabId } from '../../constants/tabs';
  import { loadingStore, errorStore } from '../../stores/patient.store';
  import { SMART_AUTH_URL, CLIENT_ID, FHIR_BASE_URL } from '../../config';
  import LoadingSpinner from '../common/LoadingSpinner.svelte';

  export let activeTab: TabId;
  const dispatch = createEventDispatcher<{ tabChange: TabId }>();

  async function generatePKCE() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .substring(0, 43);
    
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return { codeVerifier, codeChallenge };
  }

  async function handleLogout() {
    try {
      // Clear all storage except for the new code verifier we're about to generate
      sessionStorage.clear();
      localStorage.clear();
      
      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

      // Generate new PKCE values
      const { codeVerifier, codeChallenge } = await generatePKCE();
      
      // Store the new code verifier
      sessionStorage.setItem('code_verifier', codeVerifier);

      // Redirect to login with fresh parameters
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: 'openid fhirUser launch/patient',
        redirect_uri: window.location.origin,
        state: crypto.randomUUID(),
        aud: FHIR_BASE_URL,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });

      // Force reload to Epic login
      window.location.href = `${SMART_AUTH_URL}?${params}`;
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback to simple redirect if something goes wrong
      window.location.href = '/';
    }
  }

  function handleTabClick(tabId: TabId): void {
    errorStore.update(errors => ({ ...errors, [tabId]: null }));
    activeTab = tabId;
    dispatch('tabChange', tabId);
  }
</script>

<div class="border-b-2 border-primary mb-4">
  <div role="tablist" class="flex items-center justify-between">
    <div class="flex gap-4">
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
            <LoadingSpinner size="sm" />
          {/if}
        </button>
      {/each}
    </div>
    
    <!-- Action Buttons -->
    <div class="flex gap-2">
      <!-- Switch Health System Button -->
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors flex items-center gap-2"
        on:click={() => window.location.href = '/'}
      >
        <span>Switch System</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>

      <!-- Logout Button -->
      <button
        type="button"
        class="px-4 py-2 rounded-lg bg-secondary text-white hover:bg-secondary-hover transition-colors flex items-center gap-2"
        on:click={handleLogout}
      >
        <span>Logout</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </div>
</div>
