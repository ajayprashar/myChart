<script lang="ts">
  import { CLIENT_ID, SMART_AUTH_URL, SMART_TOKEN_URL } from './config';
  import PatientChart from './components/PatientChart.svelte';
  import { onMount } from 'svelte';

  let accessToken: string | null = null;
  let patientId: string | null = null;
  let isLoading = true;
  let authError = '';

  const REDIRECT_URI = 'http://localhost:5173'; // Update this to match Vite's dev server

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

  async function initiateLogin() {
    const { codeVerifier, codeChallenge } = await generatePKCE();
    sessionStorage.setItem('code_verifier', codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: 'openid fhirUser',
      redirect_uri: REDIRECT_URI,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    window.location.href = `${SMART_AUTH_URL}?${params.toString()}`;
  }

  onMount(async () => {
    console.log('App mounted, checking for auth code...');
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const storedCodeVerifier = sessionStorage.getItem('code_verifier');

    console.log('Auth code:', code);
    console.log('Stored verifier:', storedCodeVerifier);

    if (code) {
      try {
        if (!storedCodeVerifier) {
          throw new Error('No code verifier found in session storage');
        }

        console.log('Exchanging code for token...');
        const tokenResponse = await fetch(SMART_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            code_verifier: storedCodeVerifier
          })
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Token request failed: ${tokenResponse.status} - ${errorText}`);
        }

        const data = await tokenResponse.json();
        console.log('Token response:', data);
        accessToken = data.access_token;
        patientId = data.patient;
        
        // Clear the code verifier and URL parameters
        sessionStorage.removeItem('code_verifier');
        window.history.replaceState({}, '', REDIRECT_URI);
      } catch (error) {
        console.error('Error getting access token:', error);
        authError = error.message;
        
        // Clear all storage on error
        sessionStorage.clear();
        localStorage.clear();
        
        // Delay redirect to show error message
        setTimeout(() => {
          window.location.href = REDIRECT_URI;
        }, 3000);
      }
    }
    
    isLoading = false;
  });
</script>

<div class="min-h-screen bg-gray-100">
  {#if isLoading}
    <div class="flex justify-center items-center h-screen">
      <p>Loading...</p>
    </div>
  {:else if accessToken && patientId}
    <PatientChart {accessToken} {patientId} />
  {:else}
    <div class="flex justify-center items-center h-screen">
      <div class="flex flex-col items-center gap-4">
        {#if authError}
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <p class="font-bold">Authentication Error</p>
            <p>{authError}</p>
            <p class="text-sm">Redirecting to login...</p>
          </div>
        {:else}
          <button
            class="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded shadow-lg transition-colors"
            on:click={initiateLogin}
          >
            Connect to EPIC
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>
