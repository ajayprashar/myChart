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

<footer class="bg-white border-t border-gray-200 mt-auto">
  <div class="max-w-7xl mx-auto py-4 px-6">
    <div class="flex flex-col md:flex-row justify-center items-center text-sm text-gray-500 space-y-2 md:space-y-0">
      <span class="text-center">Not copyrighted 2024. All rights are yours.</span>
      <span class="mx-2 hidden md:inline">|</span>
      <a 
        href="/about" 
        class="hover:text-primary transition-colors font-bold {isPulsing ? 'animate-attention' : ''}"
        on:click={navigateToAbout}
      >
        About
      </a>
    </div>
  </div>
</footer>

<style>
  @keyframes attention {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
      color: theme(colors.primary.DEFAULT);
    }
  }

  .animate-attention {
    animation: attention 2s ease-in-out infinite;
  }
</style> 