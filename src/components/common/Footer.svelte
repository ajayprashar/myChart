<script lang="ts">
  import { onMount } from 'svelte';
  import { currentRoute } from '../../stores/route.store';

  let isPulsing = true;

  function navigateToAbout(event: MouseEvent) {
    event.preventDefault();
    window.history.pushState({}, '', '/about');
    currentRoute.set('about');
  }

  onMount(() => {
    setTimeout(() => {
      isPulsing = false;
    }, 10000);
  });
</script>

<footer class="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50">
  <div class="max-w-7xl mx-auto py-4 px-6">
    <div class="flex flex-col md:flex-row justify-center items-center text-sm text-gray-500 space-y-2 md:space-y-0">
      <span class="text-center">Not copyrighted 2024. All rights are yours.</span>
      <span class="mx-2 hidden md:inline">|</span>
      <a 
        href="/about" 
        class="hover:text-primary transition-colors font-bold {isPulsing ? 'animate-pulse' : ''}"
        on:click={navigateToAbout}
      >
        About
      </a>
    </div>
  </div>
</footer> 