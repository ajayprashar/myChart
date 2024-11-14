<script lang="ts">
  import { onMount } from 'svelte';
  import { currentRoute } from '../stores/route.store';
  import mermaid from 'mermaid';

  let isModalOpen = false;

  const diagramDefinition = `
    flowchart TB
      subgraph Core["Core Application"]
        A[App.svelte]
        B[PatientChart.svelte]
      end

      subgraph Data["Data Layer"]
        C[config.ts]
        D[patient.store.ts]
        E[FHIR.service.ts]
        L[route.store.ts]
      end

      subgraph Components["UI Components"]
        subgraph Navigation
          F[PatientHeader]
          G[PatientTabs]
        end
        
        subgraph Views["Patient Views"]
          H[DemographicsTab]
          I[LabsTab]
          J[VitalsTab]
          K[MedicationsTab]
        end
        
        subgraph Common["Common UI"]
          M[ErrorBoundary]
          N[LoadingSpinner]
          O[Footer]
        end
      end

      %% Core relationships
      A --> B
      L --> A

      %% Data layer relationships
      C -- "Auth" --> A
      D -- "State" --> B
      E -- "API" --> B

      %% Component relationships
      B --> F
      B --> G
      G --> H
      G --> I
      G --> J
      G --> K
      B --> M
      B -.-> N
      A --> O

      %% Styling
      classDef default fill:#f9f9f9,stroke:#333,stroke-width:1px;
      classDef core fill:#2B57AD,stroke:#234a91,color:#fff;
      classDef data fill:#B91F3B,stroke:#9d1a32,color:#fff;
      classDef components fill:#F57B17,stroke:#d66b14,color:#fff;
      
      class A,B core;
      class C,D,E,L data;
      class F,G,H,I,J,K,M,N,O components;
      
      style Core fill:#2B57AD20,stroke:#2B57AD
      style Data fill:#B91F3B20,stroke:#B91F3B
      style Components fill:#F57B1720,stroke:#F57B17
      style Navigation fill:#F57B1710,stroke:#F57B17
      style Views fill:#F57B1710,stroke:#F57B17
      style Common fill:#F57B1710,stroke:#F57B17
  `;

  // Initialize mermaid
  mermaid.initialize({ 
    startOnLoad: true,
    theme: 'neutral',
    securityLevel: 'loose',
    flowchart: {
      curve: 'basis',
      padding: 20,
      useMaxWidth: true
    }
  });

  function renderDiagrams() {
    mermaid.run();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isModalOpen) {
      isModalOpen = false;
    }
  }

  function navigateHome() {
    window.history.pushState({}, '', '/');
    currentRoute.set('main');
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    renderDiagrams();
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });

  $: if (isModalOpen) {
    setTimeout(renderDiagrams, 0);
  }

  const projectStructure = [
    {
      category: "Core Framework (Svelte)",
      description: "Core application framework and initialization",
      files: [
        { 
          name: "src/App.svelte", 
          description: "Main application component handling authentication flow and routing",
          details: [
            "Core Features:",
            "- SMART on FHIR authentication flow",
            "- Application routing",
            "- Global error boundaries",
            "- Component initialization"
          ]
        },
        {
          name: "src/main.ts",
          description: "Application entry point and initialization",
          details: [
            "Initialization:",
            "- Svelte app mounting",
            "- Environment configuration",
            "- Global style imports",
            "- Type definitions"
          ]
        }
      ]
    },
    {
      category: "Authentication & FHIR (SMART on FHIR)",
      description: "Implementation of SMART on FHIR authentication protocol with PKCE",
      files: [
        { 
          name: "src/config.ts", 
          description: "FHIR endpoint configurations and client credentials",
          details: [
            "Configuration Variables:",
            "- SMART_AUTH_URL: Epic's authorization endpoint",
            "- SMART_TOKEN_URL: Token exchange endpoint",
            "- CLIENT_ID: Registered application identifier",
            "- FHIR_BASE_URL: Base URL for FHIR API requests",
            "- REDIRECT_URI: Application callback URL",
            "",
            "Required Scopes:",
            "- launch/patient: Access current patient context",
            "- patient/*.read: Read access to patient resources",
            "- openid: OpenID Connect authentication",
            "- fhirUser: Access to practitioner context"
          ]
        },
        { 
          name: "src/App.svelte", 
          description: "Main authentication flow implementation",
          details: [
            "Authentication Process:",
            "1. Initial Launch:",
            "   - Check for existing session",
            "   - Generate PKCE values (code_verifier & code_challenge)",
            "   - Store code_verifier in sessionStorage",
            "   - Construct authorization URL with parameters",
            "",
            "2. Authorization Request Parameters:",
            "   - response_type: 'code'",
            "   - client_id: From configuration",
            "   - scope: Required access scopes",
            "   - redirect_uri: Application callback URL",
            "   - state: Random UUID for security",
            "   - code_challenge: PKCE challenge value",
            "   - code_challenge_method: 'S256'",
            "",
            "3. Token Exchange:",
            "   - Receive authorization code from redirect",
            "   - Retrieve stored code_verifier",
            "   - POST to token endpoint with:",
            "     * grant_type: 'authorization_code'",
            "     * code: Received auth code",
            "     * redirect_uri: Must match request",
            "     * client_id: From configuration",
            "     * code_verifier: From storage",
            "",
            "4. Token Processing:",
            "   - Store access_token securely",
            "   - Extract patient ID from token response",
            "   - Initialize FHIR service with token",
            "   - Clear URL parameters and verifier",
            "",
            "5. Error Handling:",
            "   - Validate state parameter",
            "   - Handle missing verifier",
            "   - Process token exchange errors",
            "   - Implement token refresh flow"
          ]
        },
        {
          name: "Authentication Variables Reference",
          description: "Reference table for authentication flow variables and values",
          details: [
            "1. PKCE Generation Variables:",
            "   - code_verifier: dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
            "   - code_challenge: E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            "",
            "2. Authorization Request Variables:",
            "   - SMART_AUTH_URL: https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize",
            "   - CLIENT_ID: your_client_id",
            "   - redirect_uri: http://localhost:5173",
            "",
            "3. Token Exchange Variables:",
            "   - SMART_TOKEN_URL: https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token",
            "   - received_auth_code: auth_code_from_epic",
            "",
            "4. FHIR Service Variables:",
            "   - FHIR_BASE_URL: https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
            "   - access_token: eyJhbGciOiJIUzI1..."
          ]
        }
      ]
    },
    {
      category: "UI Components",
      description: "Modular components for displaying FHIR data",
      files: [
        {
          name: "src/components/PatientChart.svelte",
          description: "Main patient dashboard component",
          details: [
            "Component Architecture:",
            "- Manages tab navigation and content display",
            "- Coordinates data fetching for all resources",
            "- Handles error boundaries and loading states",
            "",
            "Data Flow:",
            "1. Initial mount → Fetch patient demographics",
            "2. Tab selection → Load relevant FHIR resources",
            "3. Update stores → Trigger reactive UI updates",
            "4. Error handling → Display user feedback",
            "",
            "Features:",
            "- Lazy loading of tab content",
            "- Reactive data updates",
            "- Error boundary protection",
            "- Loading state management"
          ]
        },
        {
          name: "src/components/patient/tabs/*",
          description: "Individual resource display components",
          details: [
            "Tab Components:",
            "- DemographicsTab: Patient information display",
            "- LabsTab: Laboratory results with filtering",
            "- VitalsTab: Vital signs with trending",
            "- MedicationsTab: Current medication list",
            "",
            "Common Features:",
            "- Resource-specific data formatting",
            "- Sortable/filterable tables",
            "- Date formatting and timezone handling",
            "- Unit conversion and display"
          ]
        }
      ]
    },
    {
      category: "State Management (Svelte Stores)",
      description: "Application state management using Svelte's reactive stores",
      files: [
        {
          name: "src/stores/*",
          description: "Centralized state management",
          details: [
            "Store Implementations:",
            "1. patientStore:",
            "   - Holds current patient demographics",
            "   - Used in PatientHeader for patient banner",
            "   - Used in DemographicsTab for detailed display",
            "   - Updated by FHIR service after authentication",
            "",
            "2. labResultsStore:",
            "   - Manages laboratory test results",
            "   - Used in LabsTab for results display",
            "   - Supports sorting and filtering operations",
            "   - Updated when lab tab is activated",
            "",
            "3. vitalSignsStore:",
            "   - Contains patient vital measurements",
            "   - Used in VitalsTab for trending displays",
            "   - Groups related measurements (e.g., BP)",
            "   - Updates on vital tab selection",
            "",
            "4. medicationsStore:",
            "   - Tracks current medications",
            "   - Used in MedicationsTab for med list",
            "   - Handles active vs discontinued meds",
            "   - Updates when medication tab selected",
            "",
            "5. loadingStore:",
            "   - Tracks async operations per resource",
            "   - Used by LoadingSpinner component",
            "   - Controls loading states in tabs",
            "   - Manages UI feedback during fetches",
            "",
            "6. errorStore:",
            "   - Centralizes error handling",
            "   - Used by ErrorBoundary component",
            "   - Displays user-friendly error messages",
            "   - Helps debug failed FHIR requests"
          ]
        }
      ]
    },
    {
      category: "FHIR Service Layer",
      description: "FHIR API interaction and data processing",
      files: [
        {
          name: "src/services/fhir.service.ts",
          description: "FHIR API client implementation",
          details: [
            "Service Features:",
            "- FHIR resource fetching",
            "- Response parsing and typing",
            "- Error handling and retries",
            "- Authentication header management",
            "",
            "Supported Resources:",
            "- Patient demographics",
            "- Laboratory results",
            "- Vital signs",
            "- Medications",
            "",
            "Implementation Details:",
            "- Type-safe FHIR responses",
            "- Resource validation",
            "- Error classification",
            "- Retry strategies"
          ]
        }
      ]
    },
    {
      category: "Error Handling & Debug Tools",
      description: "Error management and debugging utilities",
      files: [
        {
          name: "src/components/ErrorBoundary.svelte",
          description: "Global error boundary component",
          details: [
            "Error Handling:",
            "- Catches runtime errors",
            "- Displays user-friendly messages",
            "- Logs errors for debugging",
            "- Prevents app crashes",
            "",
            "Features:",
            "- Error recovery options",
            "- Detailed error information",
            "- Stack trace preservation",
            "- Error boundary nesting"
          ]
        },
        {
          name: "src/components/debug/DebugPanel.svelte",
          description: "Developer debugging interface",
          details: [
            "Debug Features:",
            "- Raw FHIR response inspection",
            "- Query URL examination",
            "- Loading state visualization",
            "- Error state inspection",
            "",
            "Developer Tools:",
            "- Copy response to clipboard",
            "- Format JSON data",
            "- Track request timing",
            "- Monitor state changes"
          ]
        }
      ]
    }
  ];
</script>

<div class="max-w-7xl mx-auto p-8">
  <button
    class="mb-4 text-primary hover:text-primary-hover transition-colors flex items-center gap-2"
    on:click={navigateHome}
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
    </svg>
    Back to Home
  </button>

  <h1 class="text-3xl font-bold text-gray-900 mb-8">Project Architecture</h1>

  <!-- Add this after the "Project Architecture" heading and before the architecture diagram -->
  <div class="mb-8 bg-white p-6 rounded-lg shadow-lg">
    <h2 class="text-lg font-semibold mb-4">Table of Contents</h2>
    <nav class="space-y-2">
      {#each projectStructure as section}
        <a 
          href="#{section.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" 
          class="block text-primary hover:text-primary-hover transition-colors"
        >
          {section.category}
        </a>
      {/each}
    </nav>
  </div>

  <!-- Architecture Diagram -->
  <div class="mb-12 bg-white p-6 rounded-lg shadow-lg">
    <h2 class="text-xl font-semibold mb-4">Architecture Diagram</h2>
    <button 
      class="relative w-full cursor-pointer hover:opacity-95 transition-opacity text-left"
      on:click={() => isModalOpen = true}
      on:keydown={e => e.key === 'Enter' && (isModalOpen = true)}
      aria-label="Open architecture diagram in full screen"
    >
      <div class="mermaid w-full">
        {diagramDefinition}
      </div>
    </button>
  </div>

  <!-- Project Structure -->
  <div class="space-y-8">
    {#each projectStructure as section}
      <div 
        id={section.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')} 
        class="bg-white p-6 rounded-lg shadow-lg"
      >
        <h2 class="text-xl font-semibold text-primary mb-2">{section.category}</h2>
        <p class="text-gray-600 mb-4">{section.description}</p>
        
        {#if section.category === "Authentication & FHIR (SMART on FHIR)"}
          <div class="mb-6 bg-gray-50 rounded-md p-4">
            <h3 class="text-lg font-medium text-gray-700 mb-4">Authentication Flow Diagram</h3>
            <div class="mermaid">
              sequenceDiagram
                participant App
                participant Storage
                participant Epic
                participant FHIR

                App->>Storage: Generate & Store PKCE verifier
                App->>Epic: Authorization Request + code_challenge
                Epic->>App: Redirect with auth code
                App->>Storage: Retrieve code_verifier
                App->>Epic: Token Request (code + verifier)
                Epic->>App: Access Token + patient ID
                App->>Storage: Store access_token
                App->>FHIR: Initialize with token
                FHIR->>App: Ready for requests
            </div>
          </div>
        {/if}

        <div class="space-y-6">
          {#each section.files as file}
            <div class="border-l-4 border-gray-200 pl-4">
              <h3 class="font-medium text-gray-900">{file.name}</h3>
              <p class="text-sm text-gray-600 mb-2">{file.description}</p>
              {#if file.details}
                <div class="mt-2 bg-gray-50 rounded-md p-3">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">Implementation Details:</h4>
                  <ul class="space-y-1">
                    {#each file.details as detail}
                      {#if detail === ""}
                        <div class="my-2"></div>
                      {:else}
                        <li class="text-sm text-gray-600 {detail.startsWith('-') ? 'ml-4' : ''}">{detail}</li>
                      {/if}
                    {/each}
                  </ul>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>

<!-- Full-screen Modal -->
{#if isModalOpen}
  <dialog
    class="fixed inset-0 bg-black bg-opacity-50 z-50 w-full h-full p-4"
    aria-modal="true"
    aria-label="Full screen diagram view"
    open
  >
    <!-- Clickable overlay -->
    <button
      class="absolute inset-0 w-full h-full bg-transparent"
      on:click={() => isModalOpen = false}
      aria-label="Close diagram"
    />
    
    <div class="relative bg-white rounded-lg shadow-xl w-[95vw] h-[95vh] p-8 mx-auto my-auto">
      <button
        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        on:click={() => isModalOpen = false}
        aria-label="Close full screen view"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="mermaid w-full h-full overflow-auto">
        {diagramDefinition}
      </div>
    </div>
  </dialog>
{/if}

<style>
  :global(.mermaid) {
    background-color: white;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  :global(.mermaid svg) {
    max-width: 100%;
    height: auto;
  }

  dialog {
    background: transparent;
    border: none;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
</style> 