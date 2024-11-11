<script lang="ts">
  import { CLIENT_ID, SMART_AUTH_URL } from './config';

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

  async function handleLogin() {
    const { codeVerifier, codeChallenge } = await generatePKCE();
    sessionStorage.setItem('code_verifier', codeVerifier);

    const authUrl = new URL(SMART_AUTH_URL);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', 'http://localhost:5173');
    authUrl.searchParams.append('scope', 'openid fhirUser');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');

    window.location.href = authUrl.toString();
  }
</script>

<main class="h-screen w-screen flex items-center justify-center bg-gray-100">
  <div class="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-lg">
    <h1 class="text-2xl font-bold text-gray-800">SMART on FHIR Demo</h1>
    <button
      on:click={handleLogin}
      class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
    >
      Sign in with Epic
    </button>
  </div>
</main>

<div class="fixed bottom-4 right-4 text-sm text-gray-500">
  App Loaded
</div>
